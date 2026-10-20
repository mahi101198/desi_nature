import { createHash, createHmac } from "node:crypto";
import { getServerEnv } from "@/lib/env";
import { createRateLimiter, enquirySchema, enquiryText, isLikelyBot } from "@/lib/enquiry";
import { log } from "@/lib/log";

const MAX_BODY_BYTES = 10_000;
const allow = createRateLimiter(5, 10 * 60 * 1000);

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function clientKey(request: Request): string {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  // Hash so raw IP addresses never sit in memory or logs.
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ ok: false, error: "Unsupported content type" }, 415);
  }
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return json({ ok: false, error: "Message too long" }, 413);

  if (!allow(clientKey(request))) {
    log("warn", "enquiry.rate_limited");
    return json({ ok: false, error: "Too many enquiries. Please try again in a few minutes." }, 429);
  }

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "Invalid request" }, 400);
  }

  const parsed = enquirySchema.safeParse(data);
  if (!parsed.success) {
    const fields = Object.fromEntries(parsed.error.issues.map((i) => [i.path.join("."), i.message]));
    return json({ ok: false, error: "Please check the form", fields }, 422);
  }
  const enquiry = parsed.data;

  if (isLikelyBot(enquiry)) {
    log("info", "enquiry.discarded_bot");
    // Look successful so bots learn nothing.
    return json({ ok: true, delivered: true });
  }

  let env;
  try {
    env = getServerEnv();
  } catch (error) {
    log("error", "enquiry.env_invalid", { detail: (error as Error).message });
    return json({ ok: false, delivered: false, fallback: true }, 503);
  }

  if (!env.ENQUIRY_WEBHOOK_URL) {
    // No delivery channel configured: the form offers WhatsApp or email instead.
    log("info", "enquiry.no_channel", { product: enquiry.product });
    return json({ ok: false, delivered: false, fallback: true }, 503);
  }

  const payload = JSON.stringify({
    receivedAt: new Date().toISOString(),
    product: enquiry.product,
    name: enquiry.name,
    phone: enquiry.phone || null,
    email: enquiry.email || null,
    pincode: enquiry.pincode || null,
    message: enquiry.message || null,
    text: enquiryText(enquiry),
  });
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (env.ENQUIRY_WEBHOOK_SECRET) {
    headers["x-desinature-signature"] = createHmac("sha256", env.ENQUIRY_WEBHOOK_SECRET).update(payload).digest("hex");
  }

  try {
    const res = await fetch(env.ENQUIRY_WEBHOOK_URL, {
      method: "POST",
      headers,
      body: payload,
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`webhook responded ${res.status}`);
    log("info", "enquiry.delivered", { product: enquiry.product });
    return json({ ok: true, delivered: true });
  } catch (error) {
    log("error", "enquiry.delivery_failed", { product: enquiry.product, detail: (error as Error).message });
    return json({ ok: false, delivered: false, fallback: true }, 502);
  }
}
