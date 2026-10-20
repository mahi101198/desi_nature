"use client";

/**
 * Conversion events. Sent to GA4 only when it is configured and the visitor
 * has accepted analytics cookies. Event parameters never include names, phone
 * numbers, emails or message text.
 */
export type TrackEvent =
  | { name: "enquiry_submit"; params: { product: string; channel: "form" | "whatsapp" | "email" } }
  | { name: "whatsapp_click"; params: { placement: string } }
  | { name: "article_cta_click"; params: { slug: string; target: string } };

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: TrackEvent): void {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", event.name, event.params);
  } catch {
    // Analytics must never break the page.
  }
}
