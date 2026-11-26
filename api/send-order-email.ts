import { renderOrderEmail, type OrderEmailData } from "../supabase/functions/_shared/order-email";

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

  const order = parseOrderPayload(req.body);
  if (!order) {
    respond(res, 400, { error: "Order email payload is incomplete or invalid." });
    return;
  }

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

  respond(res, 200, { id: result.id });
}
