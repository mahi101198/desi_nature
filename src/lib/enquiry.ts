import { z } from "zod";

export const ENQUIRY_PRODUCTS = ["ghee", "honey", "grains-and-flours", "something-else"] as const;

export const enquirySchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your name").max(80),
    phone: z
      .string()
      .trim()
      .max(20)
      .regex(/^[+\d][\d\s-]{6,18}$/, "Please enter a valid phone number")
      .optional()
      .or(z.literal("")),
    email: z.email("Please enter a valid email").max(120).optional().or(z.literal("")),
    product: z.enum(ENQUIRY_PRODUCTS),
    pincode: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "Pin codes have six digits")
      .optional()
      .or(z.literal("")),
    message: z.string().trim().max(1500).optional().or(z.literal("")),
    consent: z.literal(true, { error: "Please agree so we can reply" }),
    /** Honeypot. Real visitors never see or fill it. */
    company: z.string().max(200).optional().or(z.literal("")),
    /** Milliseconds the form was open; bots submit instantly. */
    elapsedMs: z.number().int().nonnegative(),
  })
  .refine((d) => !!d.phone || !!d.email, { message: "Leave a phone number or an email", path: ["phone"] });

export type Enquiry = z.infer<typeof enquirySchema>;

export const MIN_FILL_MS = 2500;

export function isLikelyBot(e: Pick<Enquiry, "company" | "elapsedMs" | "message">): boolean {
  if (e.company) return true;
  if (e.elapsedMs < MIN_FILL_MS) return true;
  const links = (e.message ?? "").match(/https?:\/\//g)?.length ?? 0;
  return links > 2;
}

/** A plain-text summary used for WhatsApp, email and the webhook. */
export function enquiryText(e: Pick<Enquiry, "name" | "product" | "pincode" | "message">): string {
  const product = e.product.replace(/-/g, " ");
  return [
    `Enquiry from ${e.name}`,
    `Interested in: ${product}`,
    e.pincode ? `Delivery pin code: ${e.pincode}` : null,
    e.message ? `Message: ${e.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Fixed-window, per-key rate limiter held in memory. On serverless platforms
 * each instance keeps its own window, so this is a speed bump against bursts,
 * not a hard guarantee. Use the platform firewall for stronger limits.
 */
export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, { count: number; reset: number }>();
  return function allow(key: string, now = Date.now()): boolean {
    const entry = hits.get(key);
    if (!entry || entry.reset <= now) {
      hits.set(key, { count: 1, reset: now + windowMs });
      if (hits.size > 5000) {
        for (const [k, v] of hits) if (v.reset <= now) hits.delete(k);
      }
      return true;
    }
    entry.count++;
    return entry.count <= limit;
  };
}
