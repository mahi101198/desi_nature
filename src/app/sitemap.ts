import type { MetadataRoute } from "next";
import { sitemapEntries } from "@/lib/sitemap-entries";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries().map((e) => ({ url: e.url, ...(e.lastModified ? { lastModified: e.lastModified } : {}) }));
}
