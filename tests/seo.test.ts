import { describe, expect, it } from "vitest";
import { absoluteUrl, siteConfig } from "@/config/site";
import { getSiteEnv, previewContentEnabled } from "@/lib/env";
import { robotsFor } from "@/lib/robots-rules";
import { articleJsonLd, breadcrumbJsonLd, jsonLdString, pageMetadata, productJsonLd } from "@/lib/seo";
import { sitemapEntries } from "@/lib/sitemap-entries";
import type { Post } from "@/lib/content/posts";
import type { Product } from "@/lib/content/schema";

const post = {
  title: "How to store ghee",
  slug: "how-to-store-ghee",
  description: "d".repeat(120),
  publishedAt: "2026-10-01",
  updatedAt: "2026-10-05",
  author: "desi-nature-editorial",
  category: "storage-and-kitchen",
  tags: ["ghee"],
  targetQuery: "how to store ghee",
  secondaryQueries: [],
  searchIntent: "informational",
  audience: "households",
  sources: [],
  claims: [],
  relatedPosts: [],
  relatedProducts: [],
  status: "published",
  healthSensitive: false,
  body: "",
  file: "",
  readingMinutes: 5,
} as Post;

describe("canonical URLs", () => {
  it("use the production domain without trailing slashes", () => {
    expect(siteConfig.url).toBe("https://desinature.in");
    expect(absoluteUrl("/")).toBe("https://desinature.in");
    expect(absoluteUrl("/blog")).toBe("https://desinature.in/blog");
    const meta = pageMetadata({ title: "t", description: "d", path: "/blog/x" });
    expect(meta.alternates?.canonical).toBe("https://desinature.in/blog/x");
    expect(meta.robots).toBeUndefined();
  });
  it("noindex is only set when asked", () => {
    expect(pageMetadata({ title: "t", description: "d", path: "/x", noindex: true }).robots).toEqual({ index: false, follow: true });
  });
});

describe("robots.txt", () => {
  it("allows crawling and lists the sitemap in production", () => {
    const r = robotsFor("production");
    expect(r.sitemap).toBe("https://desinature.in/sitemap.xml");
    expect(JSON.stringify(r.rules)).toContain('"allow":"/"');
  });
  it("blocks everything on preview and development deployments", () => {
    expect(robotsFor("preview").rules).toEqual([{ userAgent: "*", disallow: "/" }]);
    expect(robotsFor("development").sitemap).toBeUndefined();
  });
});

describe("environment", () => {
  it("never enables content preview in production", () => {
    expect(previewContentEnabled({ VERCEL_ENV: "production", CONTENT_PREVIEW: "true" })).toBe(false);
    expect(previewContentEnabled({ VERCEL_ENV: "preview", CONTENT_PREVIEW: "true" })).toBe(true);
    expect(previewContentEnabled({ VERCEL_ENV: "preview" })).toBe(false);
    expect(getSiteEnv({ NODE_ENV: "production" })).toBe("production");
  });
});

describe("sitemap", () => {
  it("lists static pages and live posts only, all on the canonical domain", () => {
    const urls = sitemapEntries([post]).map((e) => e.url);
    expect(urls).toContain("https://desinature.in");
    expect(urls).toContain("https://desinature.in/blog/how-to-store-ghee");
    expect(urls.every((u) => u.startsWith("https://desinature.in"))).toBe(true);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.some((u) => /vercel\.app|localhost/.test(u))).toBe(false);
  });
  it("leaves out unpublished articles from the real content", () => {
    const urls = sitemapEntries().map((e) => e.url);
    expect(urls).not.toContain("https://desinature.in/blog/how-to-store-ghee-at-home");
    expect(urls.some((u) => u.includes("/categories/"))).toBe(false);
  });
});

describe("structured data", () => {
  it("builds BlogPosting with an organization author when no person is supplied", () => {
    const ld = articleJsonLd(post, undefined);
    expect(ld["@type"]).toBe("BlogPosting");
    expect(ld.author).toMatchObject({ "@type": "Organization" });
    expect(ld.datePublished).toBe("2026-10-01");
    expect(ld.dateModified).toBe("2026-10-05");
  });
  it("builds breadcrumbs with absolute item URLs", () => {
    const ld = breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Journal", path: "/blog" }]);
    expect(ld.itemListElement[1]).toMatchObject({ position: 2, item: "https://desinature.in/blog" });
  });
  it("emits Product data only for verified products, and offers only with a price", () => {
    const base = { slug: "ghee-500", name: "Ghee", category: "ghee", summary: "s".repeat(20), description: "d".repeat(40), sizes: [], relatedPosts: [], availability: "on-enquiry" } as unknown as Product;
    expect(productJsonLd({ ...base, verified: false })).toBeNull();
    const ld = productJsonLd({ ...base, verified: true, verifiedBy: "Owner", verifiedAt: "2026-10-01" });
    expect(ld).not.toBeNull();
    expect(ld && "offers" in ld).toBe(false);
  });
  it("escapes < so JSON-LD cannot close its script tag", () => {
    expect(jsonLdString({ a: "</script><script>alert(1)</script>" })).not.toContain("</script>");
  });
});
