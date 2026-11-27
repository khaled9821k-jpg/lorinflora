import {
  isSupportedOrderNumber,
  normalizeOrderNumber,
  renderOrderEmail,
  type OrderEmailData,
} from "../supabase/functions/_shared/order-email";

interface ApiRequest {
  method?: string;
  body?: unknown;
}

interface ApiResponse {
  setHeader(name: string, value: string): void;
  status(code: number): ApiResponse;
  json(body: unknown): ApiResponse;
  end(): ApiResponse;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isOrderPayload(value: unknown): value is OrderEmailData {
  if (!isRecord(value)) return false;
  const recipient = isRecord(value.recipient) ? value.recipient : null;
  const sender = isRecord(value.sender) ? value.sender : null;
  const summary = isRecord(value.summary) ? value.summary : null;
  return typeof value.orderNumber === "string" &&
    typeof value.trackingToken === "string" &&
    /^[a-f0-9]{64}$/i.test(value.trackingToken) &&
    typeof value.createdAt === "string" &&
    Array.isArray(value.items) &&
    value.items.every((item: unknown) => isRecord(item) &&
      typeof item.name === "string" &&
      typeof item.quantity === "number" &&
      typeof item.lineTotal === "number") &&
    !!recipient &&
    typeof recipient.deliveryType === "string" &&
    typeof recipient.collectAddressFromRecipient === "boolean" &&
    typeof recipient.keepIdentitySecret === "boolean" &&
    !!sender &&
    typeof sender.name === "string" &&
    !!summary &&
    typeof summary.subtotal === "number" &&
    typeof summary.deliveryCharges === "number" &&
    typeof summary.total === "number" &&
    typeof value.paymentMethod === "string";
}

function parseOrderPayload(body: unknown): OrderEmailData | null {
  if (typeof body !== "string") return isOrderPayload(body) ? body : null;
  try {
    const parsed: unknown = JSON.parse(body);
    return isOrderPayload(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function respond(res: ApiResponse, status: number, body: unknown): void {
  res.status(status).json(body);
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getCustomerEmail(order: OrderEmailData): string | null {
  const candidates = [order.customer?.email, order.email, order.sender.email];
  return candidates.reduce<string | null>((validEmail, candidate) => {
    if (validEmail || typeof candidate !== "string") return validEmail;
    const email = candidate.trim();
    return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
  }, null);
}

function giftCardMessageSummary(order: OrderEmailData): string {
  if (!order.card?.selected || !order.card.message) return "";
  return order.card.message
    .replace(/\bhttps?:\/\/\S+/gi, "")
    .replace(/\bwww\.\S+/gi, "")
    .trim();
}

function renderCustomerConfirmation(order: OrderEmailData): { subject: string; html: string; text: string } {
  const isArabic = order.locale === "ar";
  const dir = isArabic ? "rtl" : "ltr";
  const orderNumber = order.orderNumber;
  const trackUrl = `https://www.lorinflora.com/track-order.html?token=${encodeURIComponent(order.trackingToken)}`;
  const orderConfirmedUrl = `https://www.lorinflora.com/order-confirmed.html?order=${encodeURIComponent(order.orderNumber)}&token=${encodeURIComponent(order.trackingToken)}`;
  const currency = order.currency || "JOD";
  const money = (amount: number) => `${Number(amount || 0).toFixed(2)} ${currency}`;
  const text = isArabic
    ? {
      subject: `تم تأكيد طلبك من Lorin — ${orderNumber}`,
      heading: "شكراً لاختيارك Lorin",
      intro: "تم تأكيد طلبك. إليك ملخص التفاصيل:",
      order: "رقم الطلب",
      items: "المنتجات",
      quantity: "الكمية",
      amount: "المبلغ",
      delivery: "تفاصيل التوصيل",
      area: "المنطقة والعنوان",
      schedule: "موعد التوصيل",
      giftMessage: "رسالة بطاقة الإهداء",
      total: "الإجمالي",
      viewOrder: "عرض / نسخ رقم الطلب",
      trackFallback: "إذا لم يعمل الزر، افتح رابط التتبع:",
      track: "تتبع طلبك",
      footer: "يسعدنا خدمتك. إذا كان لديك أي استفسار، يرجى الرد على هذا البريد."
    }
    : {
      subject: `Your Lorin order is confirmed — ${orderNumber}`,
      heading: "Thank you for choosing Lorin",
      intro: "Your order is confirmed. Here is a summary:",
      order: "Order number",
      items: "Your items",
      quantity: "Qty",
      amount: "Amount",
      delivery: "Delivery details",
      area: "Area and address",
      schedule: "Delivery date & time",
      giftMessage: "Gift card message",
      total: "Total",
      viewOrder: "Copy / View Order #",
      trackFallback: "If the button doesn’t open, use this tracking link:",
      track: "Track Your Order",
      footer: "We’re happy to help. Reply to this email if you have any questions."
    };

  const itemRows = order.items.map((item) =>
    `<tr>
      <td style="padding:12px 0;border-bottom:1px solid #EEEAE4;color:#263438;font-size:14px;-webkit-user-select:text;user-select:text;">${escapeHtml(item.name)}</td>
      <td align="center" style="padding:12px 8px;border-bottom:1px solid #EEEAE4;color:#68777B;font-size:13px;-webkit-user-select:text;user-select:text;">${Math.max(0, Math.floor(item.quantity))}</td>
      <td align="${isArabic ? "left" : "right"}" style="padding:12px 0;border-bottom:1px solid #EEEAE4;color:#263438;font-size:14px;white-space:nowrap;-webkit-user-select:text;user-select:text;">${escapeHtml(money(item.lineTotal))}</td>
    </tr>`
  ).join("");

  const recipient = order.recipient;
  const address = recipient.collectAddressFromRecipient
    ? (isArabic ? "سيتم تأكيد العنوان مع المستلم." : "We’ll confirm the address with the recipient.")
    : [recipient.area, recipient.address].filter(Boolean).join(" — ");
  const schedule = [recipient.deliveryDate, recipient.deliveryTime].filter(Boolean).join(" | ") ||
    recipient.scheduleLabel ||
    recipient.deliveryType;
  const giftMessage = giftCardMessageSummary(order);
  const giftMessageHtml = giftMessage
    ? `<tr><td style="padding-top:22px;-webkit-user-select:text;user-select:text;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="padding-bottom:8px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#8A806F;-webkit-user-select:text;user-select:text;">${escapeHtml(text.giftMessage)}</td></tr>
          <tr><td style="padding:16px 18px;background:#FBF8F1;border:1px solid #E8DFD0;border-radius:8px;color:#3E4545;font:15px/1.7 Georgia,'Times New Roman',serif;white-space:pre-wrap;-webkit-user-select:text;user-select:text;">${escapeHtml(giftMessage)}</td></tr>
        </table>
      </td></tr>`
    : "";
  const giftMessageText = giftMessage ? `\n${text.giftMessage}: ${giftMessage}\n` : "";
  const plainItems = order.items.map((item) =>
    `- ${item.name} × ${Math.max(0, Math.floor(item.quantity))}: ${money(item.lineTotal)}`
  ).join("\n");
  const plainText = [
    text.heading,
    text.intro,
    `${text.order}: ${orderNumber}`,
    `${text.viewOrder}: ${orderConfirmedUrl}`,
    "",
    text.items,
    plainItems,
    "",
    `${text.delivery}: ${address}`,
    `${text.schedule}: ${schedule}`,
    giftMessageText,
    `${text.total}: ${money(order.summary.total)}`,
    `${text.track}: ${trackUrl}`,
    `${text.trackFallback} ${trackUrl}`,
    "",
    text.footer
  ].filter(Boolean).join("\n");

  return {
    subject: text.subject,
    text: plainText,
    html: `<!doctype html>
<html lang="${isArabic ? "ar" : "en"}" dir="${dir}">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#FBF8F1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#263438;-webkit-user-select:text;user-select:text;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#FBF8F1" style="width:100%;background-color:#FBF8F1;">
    <tr><td align="center" style="padding:24px 12px;-webkit-user-select:text;user-select:text;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#FFFFFF;border:1px solid #EAE5DC;border-radius:12px;border-collapse:separate;">
        <tr><td align="center" bgcolor="#00313C" style="padding:24px;background-color:#00313C;color:#FFFFFF;font-family:Georgia,'Times New Roman',serif;font-size:24px;letter-spacing:2px;">LORIN</td></tr>
        <tr><td style="padding:28px 20px 32px;-webkit-user-select:text;user-select:text;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td align="center" style="padding-bottom:8px;color:#8E805C;font-size:12px;letter-spacing:2px;text-transform:uppercase;">${escapeHtml(text.order)}</td></tr>
            <tr><td align="center" style="padding:0 0 8px;color:#00313C;font-family:Georgia,'Times New Roman',serif;font-size:27px;font-weight:500;line-height:1.3;">${escapeHtml(text.heading)}</td></tr>
            <tr><td align="center" style="padding:0 0 22px;color:#6B777A;font-size:14px;line-height:1.7;">${escapeHtml(text.intro)}</td></tr>
            <tr><td align="center" bgcolor="#FBF8F1" style="padding:14px;background-color:#FBF8F1;border:1px solid #E8DFD0;border-radius:8px;color:#00313C;font-size:22px;font-weight:700;letter-spacing:1px;-webkit-user-select:text;user-select:text;">${escapeHtml(orderNumber)}</td></tr>
            <tr><td align="center" style="padding:10px 0 24px;font-size:13px;line-height:1.6;">
              <a href="${escapeHtml(orderConfirmedUrl)}" target="_blank" rel="noopener noreferrer" style="color:#00313C;text-decoration:underline;">${escapeHtml(text.viewOrder)}</a>
            </td></tr>
            <tr><td style="padding:0 0 10px;color:#00313C;font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:500;">${escapeHtml(text.items)}</td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="${dir}">
            <thead><tr>
              <th align="${isArabic ? "right" : "left"}" style="padding:8px 0;border-bottom:1px solid #DCD6CC;color:#758184;font-size:11px;font-weight:600;">${escapeHtml(text.items)}</th>
              <th align="center" style="padding:8px;border-bottom:1px solid #DCD6CC;color:#758184;font-size:11px;font-weight:600;">${escapeHtml(text.quantity)}</th>
              <th align="${isArabic ? "left" : "right"}" style="padding:8px 0;border-bottom:1px solid #DCD6CC;color:#758184;font-size:11px;font-weight:600;">${escapeHtml(text.amount)}</th>
            </tr></thead>
            <tbody>${itemRows}</tbody>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;background-color:#F7F5F0;border-radius:8px;">
            <tr><td style="padding:18px 20px;color:#5E6A6D;font-size:13px;line-height:1.8;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="padding-bottom:8px;color:#00313C;font-family:Georgia,'Times New Roman',serif;font-size:17px;">${escapeHtml(text.delivery)}</td></tr>
                <tr><td><strong>${escapeHtml(text.area)}:</strong> ${escapeHtml(address || "—")}</td></tr>
                <tr><td><strong>${escapeHtml(text.schedule)}:</strong> ${escapeHtml(schedule || "—")}</td></tr>
              </table>
            </td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${giftMessageHtml}</table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;border-top:1px solid #EAE5DC;">
            <tr><td align="${isArabic ? "left" : "right"}" style="padding-top:18px;color:#68777B;font-size:14px;">
              ${escapeHtml(text.total)}&nbsp;&nbsp;<strong style="color:#00313C;font-size:22px;">${escapeHtml(money(order.summary.total))}</strong>
            </td></tr>
          </table>
          <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:28px auto 10px;">
            <tr><td align="center" bgcolor="#00313C" style="background-color:#00313C;border-radius:8px;">
              <a href="${escapeHtml(trackUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 28px;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:600;line-height:1.4;border-radius:8px;">${escapeHtml(text.track)}</a>
            </td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td align="center" style="padding:0 0 18px;color:#6B777A;font-size:12px;line-height:1.6;">${escapeHtml(text.trackFallback)}<br>
              <a href="${escapeHtml(trackUrl)}" target="_blank" rel="noopener noreferrer" style="color:#00313C;text-decoration:underline;word-break:break-all;">${escapeHtml(trackUrl)}</a>
            </td></tr>
            <tr><td align="center" style="color:#8A9293;font-size:12px;line-height:1.7;">${escapeHtml(text.footer)}</td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
  };
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    respond(res, 405, { error: "Method not allowed." });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Order email is not configured; RESEND_API_KEY is required.");
    respond(res, 500, { error: "Order email service is not configured." });
    return;
  }

  const parsedOrder = parseOrderPayload(req.body);
  if (!parsedOrder) {
    respond(res, 400, { error: "Order email payload is incomplete or invalid." });
    return;
  }
  const orderNumber = normalizeOrderNumber(parsedOrder.orderNumber);
  if (!isSupportedOrderNumber(orderNumber)) {
    respond(res, 400, { error: "Order number must be a 6-character code or a legacy WEB-... code." });
    return;
  }
  const order: OrderEmailData = {
    ...parsedOrder,
    orderNumber,
    trackingToken: parsedOrder.trackingToken.toLowerCase(),
  };

  const recipients = (process.env.ORDER_NOTIFICATION_EMAIL || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
  if (!recipients.length) recipients.push("khaled9821k@gmail.com");

  const from = process.env.RESEND_FROM_EMAIL || "Lorin <orders@lorinflora.com>";
  const supportEmail = order.supportEmail || process.env.SUPPORT_EMAIL || undefined;
  const email = renderOrderEmail({ ...order, supportEmail });

  let resendResponse: Response;
  try {
    resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject: email.subject,
        html: email.html,
        text: email.text,
        reply_to: order.sender.email || supportEmail,
      }),
    });
  } catch (error) {
    console.error("Resend order email request failed:", error);
    respond(res, 502, { error: "Resend could not deliver the order email." });
    return;
  }

  if (!resendResponse.ok) {
    const responseText = await resendResponse.text();
    console.error("Resend order email failed:", resendResponse.status, responseText);
    respond(res, 502, { error: "Resend could not deliver the order email." });
    return;
  }

  let result: unknown;
  try {
    result = await resendResponse.json();
  } catch (error) {
    console.error("Resend returned an invalid success response:", error);
    respond(res, 502, { error: "Resend returned an invalid response." });
    return;
  }
  if (!isRecord(result) || typeof result.id !== "string") {
    console.error("Resend success response did not contain an email ID.");
    respond(res, 502, { error: "Resend returned an invalid response." });
    return;
  }

  let customerEmailSent = false;
  const customerEmail = getCustomerEmail(order);
  if (customerEmail) {
    try {
      const confirmation = renderCustomerConfirmation(order);
      const customerResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [customerEmail],
          subject: confirmation.subject,
          html: confirmation.html,
          text: confirmation.text,
          reply_to: supportEmail,
        }),
      });
      if (customerResponse.ok) {
        customerEmailSent = true;
      } else {
        console.warn("Customer order confirmation email failed:", customerResponse.status);
      }
    } catch (error) {
      console.warn(
        "Customer order confirmation email request failed:",
        error instanceof Error ? error.name : "Unknown error",
      );
    }
  } else {
    console.warn("Customer order confirmation email skipped because no valid customer email was provided.");
  }

  respond(res, 200, { id: result.id, customerEmailSent });
}
