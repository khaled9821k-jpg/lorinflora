import { renderOrderEmail, type OrderEmailData } from "../_shared/order-email.ts";

const defaultOrigins = [
  "https://www.lorinflora.com",
  "https://lorinflora.com",
  "http://localhost:3000",
  "http://localhost:5173",
];

function allowedOrigins(): Set<string> {
  const configured = Deno.env.get("ALLOWED_ORIGINS");
  return new Set((configured ? configured.split(",") : defaultOrigins).map((origin) => origin.trim()).filter(Boolean));
}

function jsonResponse(body: unknown, status: number, origin: string | null): Response {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  });
  if (origin && allowedOrigins().has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }
  return new Response(status === 204 ? null : JSON.stringify(body), { status, headers });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isOrderPayload(value: unknown): value is OrderEmailData {
  if (!isRecord(value)) return false;
  const order = value;
  const recipient = isRecord(order.recipient) ? order.recipient : null;
  const sender = isRecord(order.sender) ? order.sender : null;
  const summary = isRecord(order.summary) ? order.summary : null;
  return typeof order.orderNumber === "string" &&
    typeof order.createdAt === "string" &&
    Array.isArray(order.items) &&
    order.items.every((item: unknown) => isRecord(item) &&
      typeof item.name === "string" && typeof item.quantity === "number" && typeof item.lineTotal === "number") &&
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
    typeof order.paymentMethod === "string";
}

Deno.serve(async (request) => {
  const origin = request.headers.get("Origin");
  const origins = allowedOrigins();
  if (origin && !origins.has(origin)) {
    return jsonResponse({ error: "Origin is not allowed." }, 403, null);
  }

  if (request.method === "OPTIONS") {
    return jsonResponse({}, 204, origin);
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405, origin);
  }

  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("RESEND_FROM_EMAIL") || "Lorin <orders@lorinflora.com>";
  const recipients = (Deno.env.get("ORDER_NOTIFICATION_EMAIL") || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
  if (!apiKey || !recipients.length) {
    console.error("Order email is not configured; RESEND_API_KEY and ORDER_NOTIFICATION_EMAIL are required.");
    return jsonResponse({ error: "Order email service is not configured." }, 500, origin);
  }

  const rawBody = await request.text();
  if (rawBody.length > 1_000_000) {
    return jsonResponse({ error: "Order email payload is too large." }, 413, origin);
  }

  let order: unknown;
  try {
    order = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: "Request body must be valid JSON." }, 400, origin);
  }
  if (!isOrderPayload(order)) {
    return jsonResponse({ error: "Order email payload is incomplete." }, 400, origin);
  }

  const email = renderOrderEmail({
    ...order,
    supportEmail: order.supportEmail || Deno.env.get("SUPPORT_EMAIL") || undefined,
  });
  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: recipients,
      subject: email.subject,
      html: email.html,
      text: email.text,
      reply_to: order.sender.email || Deno.env.get("SUPPORT_EMAIL") || undefined,
    }),
  });

  if (!resendResponse.ok) {
    const responseText = await resendResponse.text();
    console.error("Resend order email failed:", resendResponse.status, responseText);
    return jsonResponse({ error: "Resend could not deliver the order email." }, 502, origin);
  }

  const result = await resendResponse.json();
  return jsonResponse({ id: result.id }, 200, origin);
});
