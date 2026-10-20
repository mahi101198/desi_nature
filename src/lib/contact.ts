import { siteConfig } from "@/config/site";

/** wa.me link with a prefilled message, or null when no number is configured. */
export function whatsappLink(message: string, phone: string = siteConfig.whatsappNumber): string | null {
  if (!/^\d{10,15}$/.test(phone)) return null;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function mailtoLink(subject: string, body: string, email: string = siteConfig.contactEmail): string | null {
  if (!email.includes("@")) return null;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
