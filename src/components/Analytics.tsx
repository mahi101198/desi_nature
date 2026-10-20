import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { siteConfig } from "@/config/site";
import { getSiteEnv } from "@/lib/env";
import { ConsentedGoogleAnalytics } from "./ConsentedGoogleAnalytics";

/**
 * Vercel Web Analytics is cookie-free and runs only when enabled in the Vercel
 * dashboard. GA4 runs only if a measurement ID is configured, only in
 * production, and only after the visitor accepts.
 */
export function Analytics() {
  const production = getSiteEnv() === "production";
  return (
    <>
      <VercelAnalytics />
      {production && siteConfig.gaMeasurementId ? (
        <ConsentedGoogleAnalytics measurementId={siteConfig.gaMeasurementId} />
      ) : null}
    </>
  );
}
