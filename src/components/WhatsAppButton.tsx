"use client";

import { siteConfig } from "@/config/site";
import { whatsappLink } from "@/lib/contact";
import { track } from "@/lib/track";

export function WhatsAppButton({
  placement,
  message = "Hello Desi Nature, I would like to ask about ",
  label = "Message us on WhatsApp",
}: {
  placement: string;
  message?: string;
  label?: string;
}) {
  const href = whatsappLink(message, siteConfig.whatsappNumber);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="btn btn-quiet"
      onClick={() => track({ name: "whatsapp_click", params: { placement } })}
    >
      {label}
    </a>
  );
}
