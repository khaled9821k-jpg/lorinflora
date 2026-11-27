/**
 * Lorin — shared order notification email template for server-side handlers.
 * - renderOrderEmail(order) -> { subject, html, text }
 *
 * Email-safe: table layout, inline CSS, no JS, no web-font dependency
 * (Georgia/serif for the brand mark, system sans for body).
 *
 * Responsive padding: every section cell carries the `px` class, which the
 * mobile media query overrides (40px desktop -> 20px mobile). Inline padding
 * is split into padding-left/right so the !important override always wins.
 */

export interface OrderItem {
  name: string;
  imageUrl: string;
  quantity: number;
  lineTotal: number; // total for this line, in JOD
  /** e.g. [{label:'Flowers Size & Look', value:'Deluxe'}, {label:'Vase', value:'Glass'}] */
  customizations?: { label: string; value: string }[];
}

export interface OrderEmailData {
  orderNumber: string;
  createdAt: Date | string;
  locale?: "ar" | "en";
  currency?: string; // default 'JOD'
  items: OrderItem[];

  photoStickIn?: {
    selected: boolean;
    imageUrl?: string; // preview of uploaded photo
    downloadUrl?: string; // direct link for printing
  };
  card?: {
    selected?: boolean;
    designId?: string;
    designName?: string;
    designImageUrl?: string;
    recipientName?: string;
    senderName?: string;
    message?: string;
    signature?: { type: string; value: string } | null;
    linkUrl?: string;
    qrUrl?: string;
    mediaUrl?: string;
  };

  recipient: {
    collectAddressFromRecipient: boolean;
    name?: string;
    deliveryDate?: string;
    deliveryTime?: string;
    deliverySlotType?: string;
    phone?: string; // 07xxxxxxxx, 9627xxxxxxxx or +9627xxxxxxxx
    area?: string;
    address?: string;
    mapUrl?: string;
    lat?: number | null;
    lng?: number | null;
    deliveryType: string; // 'Express Delivery 120 Mins' | 'Same-Day Delivery' | 'Scheduled'
    scheduleLabel?: string; // e.g. 'Fri, 20 Nov 2026 · 14:00 – 16:00'
    keepIdentitySecret: boolean;
    deliveryNote?: string;
  };

  customer?: { email?: string; name?: string };
  email?: string;
  sender: { name: string; email?: string; phone?: string };
  paymentMethod: string; // 'Apple Pay' | 'Google Pay' | 'Credit Card' | 'Cash on Delivery'

  summary: {
    subtotal: number;
    discount?: number;
    promoCode?: string;
    photoStickInFee?: number; // 2.5 when selected
    giftCardFee?: number;
    deliveryCharges: number;
    total: number;
  };

  /** Optional branding / footer */
  siteUrl?: string;
  supportEmail?: string;
}

/* ------------------------------ helpers ------------------------------ */

const BRAND = "#00313C";
const INK = "#1F2A2E";
const MUTED = "#6B7A7F";
const LINE = "#E8E4DE";
const PAPER = "#F6F3EE";
const IVORY = "#FBF8F1"; // gift card paper
const IVORY_LINE = "#E3D9C6"; // gift card outer frame
const GOLD = "#9A8A63"; // gift card small caps / ornament
const SANS = "-apple-system,'Segoe UI',Helvetica,Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";

const esc = (v: unknown): string =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export function normalizeOrderNumber(value: string): string {
  return value.replace(/\s+/g, "").replace(/^#+/, "").toUpperCase().slice(0, 100);
}

export function isSupportedOrderNumber(value: string): boolean {
  return /^[A-Z]{3}[0-9]{3}$/.test(value) || /^WEB-[A-Z0-9-]+$/.test(value);
}

/** Only allow http(s) URLs into href/src attributes. */
const validUrl = (u?: string): string => {
  if (!u) return "";
  try {
    const p = new URL(u);
    return p.protocol === "http:" || p.protocol === "https:" ? p.toString() : "";
  } catch {
    return "";
  }
};

const validHttpsUrl = (u?: string): string => {
  const url = validUrl(u);
  return url.startsWith("https://") ? url : "";
};

const safeUrl = (u?: string): string => {
  const url = validUrl(u);
  return url ? esc(url) : "";
};

const money = (n: number, cur: string) => `${Number(n || 0).toFixed(2)} ${cur}`;
const isArabic = (locale?: string) => locale === "ar";

function labels(locale?: string) {
  if (isArabic(locale)) {
    return {
      order: "طلبك",
      quantity: "الكمية",
      card: "بطاقة الإهداء",
      giftAddons: "إضافات الهدية",
      recipient: "إلى",
      message: "رسالة البطاقة",
      sender: "من",
      handwrittenSignature: "توقيع بخط اليد",
      linkAttached: "الرابط المرفق",
      openLink: "فتح الرابط",
      photoStick: "صورة إضافية",
      selected: "تم الاختيار",
      printPhoto: "لطباعة الصورة وإرفاقها بالهدية",
      collectAddress: "طلب العنوان من المستلم",
      enabled: "مفعّل",
      disabled: "غير مفعّل",
      contactRecipient: "يرجى التواصل مع المستلم لتأكيد عنوان التوصيل.",
      recipientPhone: "هاتف المستلم",
      deliveryArea: "منطقة التوصيل",
      address: "العنوان",
      location: "الموقع",
      openMaps: "فتح الموقع في خرائط Google",
      deliveryType: "نوع التوصيل",
      schedule: "موعد التوصيل",
      keepSecret: "إخفاء هوية المرسل",
      yesDoNotReveal: "نعم — لا تفصح عن اسم المرسل",
      no: "لا",
      deliveryNote: "ملاحظة لفريق التوصيل",
      recipientDelivery: "المستلم والتوصيل",
      senderSection: "بيانات المرسل",
      name: "الاسم",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      paymentMethod: "طريقة الدفع",
      summary: "ملخص الطلب",
      subtotal: "المجموع الفرعي",
      discount: "الخصم",
      promoCode: "رمز الخصم",
      cardFee: "رسوم بطاقة الإهداء",
      deliveryCharges: "رسوم التوصيل",
      total: "الإجمالي",
      items: "المنتجات",
      newOrder: "تم استلام طلب جديد",
      withLove: "مع الحب، لورين",
      questions: "للاستفسارات",
      noMessage: "لا توجد رسالة",
      cardDesign: "تصميم البطاقة",
      attachedPhoto: "الصورة المرفقة",
      free: "مجاناً",
    };
  }
  return {
    order: "Order",
    quantity: "Qty",
    card: "Gift card",
    giftAddons: "Gift add-ons",
    recipient: "To",
    message: "Message on card",
    sender: "From",
    handwrittenSignature: "Handwritten signature",
    linkAttached: "Link attached",
    openLink: "Open link",
    photoStick: "Photo Stick-In",
    selected: "Selected",
    printPhoto: "Print and attach to the gift",
    collectAddress: "Collect address from recipient",
    enabled: "Enabled",
    disabled: "Disabled",
    contactRecipient: "Contact the recipient to confirm the delivery address.",
    recipientPhone: "Recipient phone",
    deliveryArea: "Delivery area",
    address: "Address",
    location: "Location",
    openMaps: "Open in Google Maps",
    deliveryType: "Delivery type",
    schedule: "Schedule",
    keepSecret: "Keep identity secret",
    yesDoNotReveal: "Yes — do not reveal sender",
    no: "No",
    deliveryNote: "Note for delivery team",
    recipientDelivery: "Recipient & delivery",
    senderSection: "Sender",
    name: "Name",
    email: "Email",
    phone: "Phone",
    paymentMethod: "Payment method",
    summary: "Summary",
    subtotal: "Subtotal",
    discount: "Discount",
    promoCode: "Promo code",
    cardFee: "Gift card",
    deliveryCharges: "Delivery charges",
    total: "Total",
    items: "Your order",
    newOrder: "New order received",
    withLove: "With love, Lorin",
    questions: "Questions?",
    noMessage: "No message",
    cardDesign: "Card design",
    attachedPhoto: "Uploaded photo",
    free: "Free",
  };
}

export function normalizeJoPhone(raw?: string): string {
  if (!raw) return "";
  const d = raw.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) return d;
  if (d.startsWith("00")) return "+" + d.slice(2);
  if (d.startsWith("962")) return "+" + d;
  if (d.startsWith("0")) return "+962" + d.slice(1);
  return "+962" + d;
}

const formatDate = (d: Date | string, locale?: string) =>
  new Intl.DateTimeFormat(isArabic(locale) ? "ar-JO" : "en-GB", {
    timeZone: "Asia/Amman",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(d));

/** Escape, then keep the sender's line breaks (pre-wrap is unreliable in Outlook). */
const multiline = (s: string) => esc(s.trim()).replace(/\r?\n/g, "<br>");

const sectionTitle = (t: string, dir: "ltr" | "rtl") => `
  <tr><td class="px" dir="${dir}" style="padding:36px 40px 14px 40px;font-family:${SANS};font-size:11px;letter-spacing:2.2px;text-transform:uppercase;color:${BRAND};font-weight:600;">
    ${esc(t)}
  </td></tr>`;

const kv = (label: string, valueHtml: string, dir: "ltr" | "rtl") => `
  <tr>
    <td dir="${dir}" valign="top" width="38%" style="padding:9px 12px 9px 0;font-family:${SANS};font-size:13px;color:${MUTED};border-bottom:1px solid ${LINE};">${esc(label)}</td>
    <td dir="${dir}" valign="top" style="padding:9px 0;font-family:${SANS};font-size:14px;color:${INK};line-height:1.5;border-bottom:1px solid ${LINE};">${valueHtml}</td>
  </tr>`;

const pill = (text: string, on: boolean) =>
  `<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:600;background:${on ? BRAND : "#EDEAE4"};color:${on ? "#FFFFFF" : MUTED};">${esc(text)}</span>`;

const summaryRow = (label: string, value: string, dir: "ltr" | "rtl", strong = false) => `
  <tr>
    <td dir="${dir}" style="padding:${strong ? "16px 0 0 0" : "6px 0"};font-family:${SANS};font-size:${strong ? 15 : 14}px;color:${strong ? BRAND : MUTED};font-weight:${strong ? 700 : 400};${strong ? `border-top:1px solid ${BRAND};` : ""}">${esc(label)}</td>
    <td dir="${dir}" align="${dir === "rtl" ? "left" : "right"}" style="padding:${strong ? "16px 0 0 0" : "6px 0"};font-family:${SANS};font-size:${strong ? 18 : 14}px;color:${strong ? BRAND : INK};font-weight:${strong ? 700 : 400};${strong ? `border-top:1px solid ${BRAND};` : ""}">${esc(value)}</td>
  </tr>`;

/* ------------------------------ sections ------------------------------ */

function itemsHtml(o: OrderEmailData, cur: string, dir: "ltr" | "rtl", text: ReturnType<typeof labels>): string {
  const rows = o.items
    .map((it, i) => {
      const custom = (it.customizations ?? [])
        .map(
          (c) =>
            `<div style="font-family:${SANS};font-size:12px;color:${MUTED};line-height:1.6;">${esc(c.label)}: <span style="color:${INK};">${esc(c.value)}</span></div>`
        )
        .join("");
      const img = safeUrl(it.imageUrl);
      return `
      <tr>
        <td width="96" valign="top" style="padding:16px 16px 16px 0;${i ? `border-top:1px solid ${LINE};` : ""}">
          ${img ? `<img src="${img}" width="96" height="96" alt="${esc(it.name)}" style="display:block;width:96px;height:96px;object-fit:cover;border-radius:6px;border:0;background:${PAPER};">` : ""}
        </td>
        <td valign="top" style="padding:16px 0;${i ? `border-top:1px solid ${LINE};` : ""}">
          <div style="font-family:${SERIF};font-size:17px;color:${INK};line-height:1.35;padding-bottom:4px;">${esc(it.name)}</div>
          ${custom}
          <div style="font-family:${SANS};font-size:12px;color:${MUTED};padding-top:6px;">${esc(text.quantity)} ${esc(it.quantity)}</div>
        </td>
        <td valign="top" align="right" style="padding:16px 0 16px 12px;white-space:nowrap;font-family:${SANS};font-size:14px;font-weight:600;color:${BRAND};${i ? `border-top:1px solid ${LINE};` : ""}">
          ${esc(money(it.lineTotal, cur))}
        </td>
      </tr>`;
    })
    .join("");

  return `${sectionTitle(text.items, dir)}
  <tr><td class="px" dir="${dir}" style="padding:0 40px;">
    <table role="presentation" dir="${dir}" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
  </td></tr>`;
}

function giftCardHtml(c: NonNullable<OrderEmailData["card"]>, dir: "ltr" | "rtl", text: ReturnType<typeof labels>): string {
  const img = safeUrl(c.designImageUrl);
  const name = (c.designName ?? "").trim();
  const recipientName = (c.recipientName ?? "").trim();
  const message = (c.message ?? "").trim();
  const signature = c.signature;
  const signatureValue = String(signature?.value ?? "").trim();
  const signatureImage = signature?.type === "handwritten" ? safeUrl(validHttpsUrl(signatureValue)) : "";
  const signatureText = signature?.type !== "handwritten" ? signatureValue : "";
  const senderName = (c.senderName ?? "").trim();
  const signatureActive = !!(signatureImage || signatureText);
  const rawQrUrl = validUrl(c.qrUrl);
  let linkTarget = validUrl(c.linkUrl) || validUrl(c.mediaUrl);
  if (!linkTarget && rawQrUrl) {
    try {
      const parsedQr = new URL(rawQrUrl);
      linkTarget = validUrl(parsedQr.searchParams.get("data") ?? "") || rawQrUrl;
    } catch {
      linkTarget = rawQrUrl;
    }
  }
  const linkTargetUrl = safeUrl(linkTarget);
  const qrIsImage = rawQrUrl && (/api\.qrserver\.com$/i.test(new URL(rawQrUrl).hostname) || /\.(png|jpe?g|gif|webp|svg)$/i.test(new URL(rawQrUrl).pathname));
  const qrImageUrl = qrIsImage
    ? safeUrl(rawQrUrl)
    : linkTarget
      ? safeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(linkTarget)}`)
      : "";
  const imageHtml = img
    ? `<img src="${img}" width="88" alt="${esc(name || text.card)}" style="display:block;width:88px;max-width:100%;height:auto;border-radius:3px;border:1px solid ${IVORY_LINE};background:#FFFFFF;">`
    : "";
  const referenceHtml = imageHtml || (name
    ? `<div style="font-family:${SANS};font-size:11px;line-height:1.5;color:${MUTED};text-align:center;">${esc(name)}</div>`
    : "");
  const recipientHtml = recipientName
    ? `<div dir="auto" style="font-family:${SANS};font-size:12px;color:${MUTED};padding-bottom:18px;text-align:center;">${esc(recipientName)}</div>`
    : "";
  const messageHtml = message
    ? `<div dir="auto" style="font-family:${SERIF};font-size:18px;line-height:1.8;color:${INK};font-style:italic;text-align:center;">${multiline(message)}</div>`
    : `<div style="font-family:${SERIF};font-size:15px;line-height:1.8;color:${GOLD};font-style:italic;text-align:center;">${esc(text.noMessage)}</div>`;
  const signatureHtml = signatureImage
    ? `<img src="${signatureImage}" width="110" alt="${esc(text.handwrittenSignature)}" style="display:block;max-width:110px;max-height:34px;margin:0 auto;object-fit:contain;">`
    : signatureText
      ? `<span dir="auto" style="font-family:${SERIF};font-size:17px;font-style:italic;">${esc(signatureText)}</span>`
      : "";
  const senderHtml = signatureActive
    ? signatureHtml
    : senderName
      ? `<div dir="auto" style="font-family:${SANS};font-size:12px;color:${INK};">${esc(senderName)}</div>`
      : "";
  const qrHtml = linkTargetUrl && qrImageUrl
    ? `<img src="${qrImageUrl}" width="72" height="72" alt="QR code" style="display:block;width:72px;height:72px;border:0;">`
    : "";
  const footerHtml = qrHtml
    ? `<table role="presentation" dir="ltr" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td width="72" valign="bottom"></td>
        <td align="center" valign="bottom">${senderHtml}</td>
        <td width="72" align="right" valign="bottom">${qrHtml}</td>
      </tr></table>`
    : senderHtml
      ? `<div style="text-align:center;">${senderHtml}</div>`
      : "";

  return `
    <tr><td style="padding:0 0 4px 0;">
      <table role="presentation" dir="${dir}" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          ${referenceHtml ? `<td class="stack card-reference" width="112" valign="middle" align="center" style="padding:8px 14px 8px 0;">${referenceHtml}</td>` : ""}
          <td class="stack" valign="middle" style="padding:0;">
            <table role="presentation" dir="${dir}" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${IVORY}" style="background:${IVORY};border:1px solid ${IVORY_LINE};border-radius:8px;">
              <tr><td class="card-body" valign="middle" align="center" style="padding:24px 28px;">
                <table role="presentation" dir="${dir}" width="100%" height="240" cellpadding="0" cellspacing="0" border="0">
                  <tr><td valign="top" align="center">${recipientHtml}</td></tr>
                  <tr><td valign="middle" align="center">${messageHtml}</td></tr>
                  <tr><td valign="bottom" align="center">${footerHtml ? `<div style="width:100%;padding-top:16px;">${footerHtml}</div>` : ""}</td></tr>
                </table>
              </td></tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>`;
}

function addOnsHtml(o: OrderEmailData, cur: string, dir: "ltr" | "rtl", text: ReturnType<typeof labels>): string {
  const blocks: string[] = [];

  const ps = o.photoStickIn;
  const photoSource = validUrl(ps?.imageUrl) || validUrl(ps?.downloadUrl);
  const hasPhoto = !!(ps?.selected && photoSource);
  if (hasPhoto) {
    const img = safeUrl(photoSource);
    const link = safeUrl(ps?.downloadUrl) || img;
    blocks.push(`
    <tr><td style="padding:0 0 18px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${PAPER}" style="background:${PAPER};border-radius:8px;">
        <tr>
          <td width="132" valign="top" style="padding:16px;">
            <a href="${link}" target="_blank"><img src="${img}" width="100" alt="${esc(text.attachedPhoto)}" style="display:block;width:100px;height:auto;border-radius:4px;border:0;"></a>
          </td>
          <td valign="middle" style="padding:16px 16px 16px 0;">
            <div style="font-family:${SANS};font-size:14px;font-weight:600;color:${INK};padding-bottom:2px;">${esc(text.photoStick)} ${pill(text.selected, true)}</div>
            <div style="font-family:${SANS};font-size:12px;color:${MUTED};padding-bottom:12px;">+${esc(money(o.summary.photoStickInFee ?? 2.5, cur))} · ${esc(text.printPhoto)}</div>
            <a href="${link}" target="_blank" style="display:inline-block;padding:9px 18px;background:${BRAND};color:#FFFFFF;font-family:${SANS};font-size:12px;font-weight:600;letter-spacing:.6px;text-decoration:none;border-radius:4px;">${esc(text.openLink)}</a>
          </td>
        </tr>
      </table>
    </td></tr>`);
  }

  const c = o.card;
  if (c && (c.selected || c.designId || (c.message ?? "").trim() || (c.designName ?? "").trim() || safeUrl(c.designImageUrl) || (c.recipientName ?? "").trim() || (c.senderName ?? "").trim() || validUrl(c.linkUrl) || validUrl(c.qrUrl) || validUrl(c.mediaUrl))) {
    blocks.push(giftCardHtml(c, dir, text));
  }

  if (!blocks.length) return "";
  return `${sectionTitle(text.giftAddons, dir)}
  <tr><td class="px" dir="${dir}" style="padding:0 40px;">
    <table role="presentation" dir="${dir}" width="100%" cellpadding="0" cellspacing="0" border="0">${blocks.join("")}</table>
  </td></tr>`;
}

function googleMapsUrl(r: OrderEmailData["recipient"]): string {
  if (r.lat !== undefined && r.lng !== undefined && r.lat !== null && r.lng !== null && isValidEmailCoordinates(r.lat, r.lng)) {
    return `https://www.google.com/maps?q=${Number(r.lat).toFixed(6)},${Number(r.lng).toFixed(6)}`;
  }
  const supplied = validUrl(r.mapUrl);
  if (!supplied) return "";
  try {
    const url = new URL(supplied);
    return /(^|\.)google\./i.test(url.hostname)
      ? supplied
      : `https://www.google.com/maps?q=${encodeURIComponent(supplied)}`;
  } catch {
    return "";
  }
}

function isValidEmailCoordinates(lat: number, lng: number): boolean {
  return Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) &&
    Number(lat) >= -90 && Number(lat) <= 90 && Number(lng) >= -180 && Number(lng) <= 180;
}

function deliveryHtml(o: OrderEmailData, dir: "ltr" | "rtl", text: ReturnType<typeof labels>): string {
  const r = o.recipient;
  const rows: string[] = [];

  rows.push(
    kv(
      text.collectAddress,
      r.collectAddressFromRecipient
        ? `${pill(text.enabled, true)}<div style="font-size:12px;color:${MUTED};padding-top:4px;">${esc(text.contactRecipient)}</div>`
        : pill(text.disabled, false),
      dir
    )
  );
  if (r.name) rows.push(kv(text.recipient, esc(r.name), dir));
  if (r.phone) {
    const p = normalizeJoPhone(r.phone);
    rows.push(kv(text.recipientPhone, `<a href="tel:${esc(p)}" style="color:${BRAND};text-decoration:none;">${esc(p)}</a>`, dir));
  }
  if (r.area) rows.push(kv(text.deliveryArea, esc(r.area), dir));
  if (r.address) rows.push(kv(text.address, esc(r.address), dir));
  const map = safeUrl(googleMapsUrl(r));
  if (map) rows.push(kv(text.location, `<a href="${map}" target="_blank" rel="noopener noreferrer" style="color:${BRAND};font-weight:600;">${esc(text.openMaps)} &rarr;</a>`, dir));
  rows.push(kv(text.deliveryType, esc(r.deliveryType), dir));
  if (r.scheduleLabel) rows.push(kv(text.schedule, esc(r.scheduleLabel), dir));
  rows.push(kv(text.keepSecret, r.keepIdentitySecret ? pill(text.yesDoNotReveal, true) : pill(text.no, false), dir));
  if (r.deliveryNote) rows.push(kv(text.deliveryNote, multiline(r.deliveryNote), dir));

  return `${sectionTitle(text.recipientDelivery, dir)}
  <tr><td class="px" dir="${dir}" style="padding:0 40px;">
    <table role="presentation" dir="${dir}" width="100%" cellpadding="0" cellspacing="0" border="0">${rows.join("")}</table>
  </td></tr>`;
}

function senderAndSummaryHtml(o: OrderEmailData, cur: string, dir: "ltr" | "rtl", text: ReturnType<typeof labels>): string {
  const s = o.sender;
  const sRows = [kv(text.name, esc(s.name), dir)];
  if (s.email) sRows.push(kv(text.email, `<a href="mailto:${esc(s.email)}" style="color:${BRAND};text-decoration:none;">${esc(s.email)}</a>`, dir));
  if (s.phone) sRows.push(kv(text.phone, esc(normalizeJoPhone(s.phone)), dir));
  sRows.push(kv(text.paymentMethod, esc(o.paymentMethod), dir));

  const fee = o.summary.photoStickInFee ?? 0;
  const giftCardFee = o.summary.giftCardFee ?? 0;
  const delivery = o.summary.deliveryCharges;
  const sum = [
    summaryRow(text.subtotal, money(o.summary.subtotal, cur), dir),
    o.summary.discount ? summaryRow(`${text.discount}${o.summary.promoCode ? ` (${text.promoCode}: ${o.summary.promoCode})` : ""}`, `−${money(o.summary.discount, cur)}`, dir) : "",
    o.photoStickIn?.selected && (validUrl(o.photoStickIn.imageUrl) || validUrl(o.photoStickIn.downloadUrl)) ? summaryRow(text.photoStick, money(fee || 2.5, cur), dir) : "",
    giftCardFee > 0 ? summaryRow(text.cardFee, money(giftCardFee, cur), dir) : "",
    summaryRow(text.deliveryCharges, delivery > 0 ? money(delivery, cur) : text.free, dir),
    summaryRow(text.total, money(o.summary.total, cur), dir, true),
  ].join("");

  return `${sectionTitle(text.senderSection, dir)}
  <tr><td class="px" dir="${dir}" style="padding:0 40px;">
    <table role="presentation" dir="${dir}" width="100%" cellpadding="0" cellspacing="0" border="0">${sRows.join("")}</table>
  </td></tr>
  ${sectionTitle(text.summary, dir)}
  <tr><td class="px" dir="${dir}" style="padding:0 40px 8px 40px;">
    <table role="presentation" dir="${dir}" width="100%" cellpadding="0" cellspacing="0" border="0">${sum}</table>
  </td></tr>`;
}

/* ------------------------------ main render ------------------------------ */

export function renderOrderEmail(o: OrderEmailData): { subject: string; html: string; text: string } {
  const orderNumber = normalizeOrderNumber(o.orderNumber);
  const locale = o.locale ?? "en";
  const dir = isArabic(locale) ? "rtl" : "ltr";
  const text = labels(locale);
  const cur = o.currency ?? "JOD";
  const site = safeUrl(o.siteUrl);
  const subject = isArabic(locale)
    ? `طلب جديد #${orderNumber} — لورين`
    : `New order #${orderNumber} — Lorin`;
  const photoUrl = validUrl(o.photoStickIn?.imageUrl) || validUrl(o.photoStickIn?.downloadUrl);
  const hasPhoto = !!(o.photoStickIn?.selected && photoUrl);
  const card = o.card;
  const hasCard = !!(card && (card.selected || card.designId || (card.message ?? "").trim() || (card.designName ?? "").trim() ||
    safeUrl(card.designImageUrl) || (card.recipientName ?? "").trim() || (card.senderName ?? "").trim() ||
    validUrl(card.linkUrl) || validUrl(card.qrUrl) || validUrl(card.mediaUrl)));
  const cardLink = card ? validUrl(card.linkUrl) || validUrl(card.mediaUrl) || validUrl(card.qrUrl) : "";
  const mapsLink = googleMapsUrl(o.recipient);
  const cardSenderText = card?.signature?.type === "handwritten"
    ? (validHttpsUrl(card.signature.value) ? text.handwrittenSignature : card?.senderName || "")
    : card?.signature?.value || card?.senderName || "";

  const html = `<!DOCTYPE html>
<html lang="${locale}" dir="${dir}" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <title>${esc(subject)}</title>
  <style>
    @media only screen and (max-width:620px){
      .container{width:100%!important;max-width:100%!important;border-radius:0!important}
      /* Consistent mobile gutter for every section (desktop is 40px) */
      .px{padding-left:20px!important;padding-right:20px!important}
      .outer{padding:0!important}
      .stack{display:block!important;width:100%!important;box-sizing:border-box!important}
      .card-reference{padding:12px 8px!important}
      .card-body{padding:22px 20px 26px 20px!important}
    }
  </style>
</head>
<body dir="${dir}" style="margin:0;padding:0;background:${PAPER};-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(text.newOrder)} #${esc(orderNumber)} · ${esc(money(o.summary.total, cur))}</div>
  <table role="presentation" dir="${dir}" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${PAPER}" style="background:${PAPER};">
    <tr><td class="outer" align="center" style="padding:28px 12px;">
      <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#FFFFFF" style="width:600px;max-width:600px;background:#FFFFFF;border-radius:10px;overflow:hidden;">

        <!-- Header -->
        <tr><td class="px" align="center" bgcolor="${BRAND}" style="background:${BRAND};padding:40px 40px 34px 40px;">
          ${site ? `<a href="${site}" target="_blank" style="text-decoration:none;">` : ""}
          <div style="font-family:${SERIF};font-size:30px;letter-spacing:9px;color:#FFFFFF;padding-left:9px;">LORIN</div>
          <div style="font-family:${SANS};font-size:10px;letter-spacing:4px;color:#9FC1C9;padding-top:6px;padding-left:4px;">FLORA &amp; GIFTS</div>
          ${site ? `</a>` : ""}
        </td></tr>
        <tr><td class="px" align="center" style="padding:30px 40px 6px 40px;">
          <div dir="${dir}" style="font-family:${SANS};font-size:11px;letter-spacing:2.2px;text-transform:uppercase;color:${MUTED};">${esc(text.newOrder)}</div>
          <div style="font-family:${SERIF};font-size:26px;color:${BRAND};padding-top:8px;">${esc(text.order)} #${esc(orderNumber)}</div>
          <div dir="${dir}" style="font-family:${SANS};font-size:13px;color:${MUTED};padding-top:6px;">${esc(formatDate(o.createdAt, locale))}</div>
        </td></tr>

        ${itemsHtml(o, cur, dir, text)}
        ${addOnsHtml(o, cur, dir, text)}
        ${deliveryHtml(o, dir, text)}
        ${senderAndSummaryHtml(o, cur, dir, text)}

        <!-- Footer -->
        <tr><td class="px" align="center" style="padding:34px 40px 38px 40px;">
          <div style="width:40px;height:1px;background:${BRAND};margin:0 auto 18px auto;line-height:1px;font-size:1px;">&nbsp;</div>
          <div dir="${dir}" style="font-family:${SERIF};font-size:15px;color:${BRAND};">${esc(text.withLove)}</div>
          ${o.supportEmail ? `<div dir="${dir}" style="font-family:${SANS};font-size:12px;color:${MUTED};padding-top:8px;">${esc(text.questions)} <a href="mailto:${esc(o.supportEmail)}" style="color:${BRAND};">${esc(o.supportEmail)}</a></div>` : ""}
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const r = o.recipient;
  const plainText = [
    `LORIN — Order #${orderNumber}`,
    formatDate(o.createdAt, locale),
    "",
    text.items,
    ...o.items.map(
      (i) =>
        `- ${i.name} x${i.quantity} — ${money(i.lineTotal, cur)}` +
        (i.customizations?.length ? ` (${i.customizations.map((c) => `${c.label}: ${c.value}`).join("; ")})` : "")
    ),
    "",
    hasPhoto ? `${text.photoStick}: ${validUrl(o.photoStickIn?.downloadUrl) || photoUrl}` : "",
    hasCard ? [
      `${text.card}${card?.designName ? ` (${card.designName})` : ""}${card?.selected ? ` — ${text.selected}` : ""}`,
      card?.recipientName || r.name || "",
      card?.message || text.noMessage,
      cardSenderText,
      cardLink ? `${text.linkAttached}: ${cardLink}` : "",
    ].filter(Boolean).join("\n") : "",
    "",
    text.recipientDelivery.toUpperCase(),
    `${text.collectAddress}: ${r.collectAddressFromRecipient ? text.enabled : text.disabled}`,
    r.name ? `${text.recipient}: ${r.name}` : "",
    r.phone ? `${text.recipientPhone}: ${normalizeJoPhone(r.phone)}` : "",
    r.area ? `${text.deliveryArea}: ${r.area}` : "",
    r.address ? `${text.address}: ${r.address}` : "",
    mapsLink ? `${text.location}: ${mapsLink}` : "",
    `${text.deliveryType}: ${r.deliveryType}${r.scheduleLabel ? " — " + r.scheduleLabel : ""}`,
    `${text.keepSecret}: ${r.keepIdentitySecret ? text.yesDoNotReveal : text.no}`,
    r.deliveryNote ? `${text.deliveryNote}: ${r.deliveryNote}` : "",
    "",
    `${text.senderSection.toUpperCase()}`,
    `${text.name}: ${o.sender.name}`,
    o.sender.email ? `${text.email}: ${o.sender.email}` : "",
    o.sender.phone ? `${text.phone}: ${normalizeJoPhone(o.sender.phone)}` : "",
    `${text.paymentMethod}: ${o.paymentMethod}`,
    "",
    `${text.summary.toUpperCase()}`,
    `${text.subtotal}: ${money(o.summary.subtotal, cur)}`,
    o.summary.discount ? `${text.discount}${o.summary.promoCode ? ` (${text.promoCode}: ${o.summary.promoCode})` : ""}: ${money(o.summary.discount, cur)}` : "",
    hasPhoto ? `${text.photoStick}: ${money(o.summary.photoStickInFee ?? 2.5, cur)}` : "",
    o.summary.giftCardFee ? `${text.cardFee}: ${money(o.summary.giftCardFee, cur)}` : "",
    `${text.deliveryCharges}: ${money(o.summary.deliveryCharges, cur)}`,
    `${text.total}: ${money(o.summary.total, cur)}`,
  ]
    .filter((l) => l !== "")
    .join("\n");

  return { subject, html, text: plainText };
}
