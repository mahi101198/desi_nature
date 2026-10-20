import type { Metadata } from "next";
import { absoluteUrl, siteConfig, socialProfiles } from "@/config/site";
import type { Author, Product } from "./content/schema";
import type { Post } from "./content/posts";

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  /** Pages that must stay out of search results (thin, preview, utility). */
  noindex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  image?: { url: string; alt: string; width: number; height: number };
};

/** Metadata with a canonical URL on the production domain and matching social cards. */
export function pageMetadata(input: PageMetaInput): Metadata {
  const canonical = absoluteUrl(input.path);
  const images = input.image
    ? [{ url: input.image.url, alt: input.image.alt, width: input.image.width, height: input.image.height }]
    : undefined;
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical },
    robots: input.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: input.type ?? "website",
      url: canonical,
      title: input.title,
      description: input.description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      ...(images ? { images } : {}),
      ...(input.type === "article"
        ? { publishedTime: input.publishedTime, modifiedTime: input.modifiedTime ?? input.publishedTime }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
  };
}

const ORG_ID = `${siteConfig.url}/#organization`;
const SITE_ID = `${siteConfig.url}/#website`;

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl("/icon.svg"),
    description: siteConfig.description,
    ...(siteConfig.contactEmail ? { email: siteConfig.contactEmail } : {}),
    ...(socialProfiles().length ? { sameAs: socialProfiles() } : {}),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: siteConfig.language,
    publisher: { "@id": ORG_ID },
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function articleJsonLd(post: Post, author: Author | undefined) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  const authorNode =
    author?.type === "person" && author.ownerSupplied
      ? { "@type": "Person", name: author.name, url: absoluteUrl(`/author/${author.slug}`) }
      : { "@type": "Organization", name: author?.name ?? siteConfig.name, url: siteConfig.url };
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: url,
    headline: post.title,
    description: post.description,
    inLanguage: siteConfig.language,
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    dateModified: post.updatedAt ?? post.publishedAt,
    author: authorNode,
    publisher: { "@id": ORG_ID },
    articleSection: post.category,
    keywords: post.tags.join(", "),
    ...(post.featuredImage ? { image: absoluteUrl(post.featuredImage.src) } : {}),
    ...(post.sources.length
      ? { citation: post.sources.map((s) => ({ "@type": "CreativeWork", name: s.title, url: s.url })) }
      : {}),
  };
}

/** Product data only for owner-verified products, and offers only with a real price. */
export function productJsonLd(product: Product) {
  if (!product.verified) return null;
  // "on-enquiry" has no honest schema.org equivalent, so it is left out.
  const availability = {
    "in-stock": "https://schema.org/InStock",
    seasonal: "https://schema.org/LimitedAvailability",
    "on-enquiry": undefined,
    unavailable: "https://schema.org/OutOfStock",
  }[product.availability];
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    url: absoluteUrl(`/products/${product.slug}`),
    brand: { "@type": "Brand", name: siteConfig.name },
    ...(product.image ? { image: absoluteUrl(product.image.src) } : {}),
    ...(product.priceInr
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "INR",
            price: product.priceInr,
            ...(availability ? { availability } : {}),
            url: absoluteUrl(`/products/${product.slug}`),
          },
        }
      : {}),
  };
}

/** Serialises JSON-LD safely for a <script> tag (no "</script>" breakout). */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
