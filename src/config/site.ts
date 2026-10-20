/**
 * Site-wide settings. Values that differ per deployment come from environment
 * variables (see .env.example). Nothing here is secret: every value may reach
 * the browser.
 */

const DEFAULT_SITE_URL = "https://desinature.in";

function normaliseUrl(value: string | undefined): string {
  const url = (value ?? DEFAULT_SITE_URL).trim().replace(/\/+$/, "");
  return url.length > 0 ? url : DEFAULT_SITE_URL;
}

/** Digits only, with country code, e.g. 919876543210. Empty disables WhatsApp links. */
function normalisePhone(value: string | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

export const siteConfig = {
  name: "Desi Nature",
  /** Canonical origin. Always the production domain, never a preview URL. */
  url: normaliseUrl(process.env.NEXT_PUBLIC_SITE_URL),
  locale: "en_IN",
  language: "en-IN",
  tagline: "Farm foods and field notes from India",
  description:
    "Desi Nature shares practical guides on storing and choosing Indian farm foods like ghee, honey and grains, and takes enquiries for farm-sourced products.",
  whatsappNumber: normalisePhone(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER),
  contactEmail: (process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "").trim(),
  social: {
    instagram: (process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "").trim(),
    facebook: (process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "").trim(),
    linkedin: (process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "").trim(),
    youtube: (process.env.NEXT_PUBLIC_YOUTUBE_URL ?? "").trim(),
  },
  verification: {
    google: (process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "").trim(),
    bing: (process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ?? "").trim(),
  },
  gaMeasurementId: (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "").trim(),
} as const;

export const mainNav = [
  { href: "/blog", label: "Journal" },
  { href: "/products", label: "Farm foods" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Enquire" },
] as const;

export function absoluteUrl(path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean === "/" ? siteConfig.url : `${siteConfig.url}${clean}`;
}

export function socialProfiles(): string[] {
  return Object.values(siteConfig.social).filter((v) => v.startsWith("https://"));
}
