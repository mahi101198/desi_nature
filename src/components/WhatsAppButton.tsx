"use client";

import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";
import { whatsappLink } from "@/lib/contact";
import { track } from "@/lib/track";

export function WhatsAppButton({
  placement,
  message = "Hello Desi Nature, I would like to ask about ",
  label = "Message us on WhatsApp",
  className = "btn btn-ghost btn-lg",
}: {
  placement: string;
  message?: string;
  label?: string;
  className?: string;
}) {
  const href = whatsappLink(message, siteConfig.whatsappNumber);
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener" className={className} onClick={() => track({ name: "whatsapp_click", params: { placement } })}>
      <MessageCircle className="size-5" aria-hidden="true" />
      {label}
    </a>
  );
}
