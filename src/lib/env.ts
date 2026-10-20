import { z } from "zod";

/** Environment variables; process.env or a plain object in tests. */
export type Env = Record<string, string | undefined>;

/**
 * Deployment environment. Vercel sets VERCEL_ENV; locally we fall back to
 * NODE_ENV. Only "production" may be indexed by search engines.
 */
export type SiteEnv = "production" | "preview" | "development";

export function getSiteEnv(env: Env = process.env): SiteEnv {
  const vercel = env.VERCEL_ENV;
  if (vercel === "production" || vercel === "preview" || vercel === "development") return vercel;
  if (env.SITE_ENV === "production" || env.SITE_ENV === "preview") return env.SITE_ENV;
  return env.NODE_ENV === "production" ? "production" : "development";
}

/**
 * Drafts and articles in review are shown only on non-production deployments
 * that explicitly opt in. Production never shows them, whatever the flag says.
 */
export function previewContentEnabled(env: Env = process.env): boolean {
  return getSiteEnv(env) !== "production" && env.CONTENT_PREVIEW === "true";
}

/** Server-only settings. Validated lazily so a missing optional value never breaks the build. */
const serverSchema = z.object({
  ENQUIRY_WEBHOOK_URL: z.url().optional(),
  ENQUIRY_WEBHOOK_SECRET: z.string().min(16).optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;

export function getServerEnv(env: Env = process.env): ServerEnv {
  const parsed = serverSchema.safeParse({
    ENQUIRY_WEBHOOK_URL: env.ENQUIRY_WEBHOOK_URL || undefined,
    ENQUIRY_WEBHOOK_SECRET: env.ENQUIRY_WEBHOOK_SECRET || undefined,
  });
  if (!parsed.success) {
    // Report which keys are wrong without echoing their values.
    const keys = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Invalid server environment variables: ${keys}`);
  }
  return parsed.data;
}
