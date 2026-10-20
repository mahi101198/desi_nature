import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import type { SiteEnv } from "./env";

export function robotsFor(env: SiteEnv): MetadataRoute.Robots {
  if (env !== "production") {
    // Preview and development deployments are never crawled.
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
