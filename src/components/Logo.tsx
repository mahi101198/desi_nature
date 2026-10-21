import Link from "next/link";
import { siteConfig } from "@/config/site";

/** Mark: a leaf over a drop of ghee. Wordmark set in the display face. */
export function LogoMark({ className = "size-9", light = false }: { className?: string; light?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <rect width="40" height="40" rx="12" fill={light ? "#f4efe6" : "#123c2e"} />
      <path d="M20 9c5.5 6 8 10.2 8 13.8A8 8 0 0 1 12 22.8C12 19.2 14.5 15 20 9Z" fill="#e9a93b" />
      <path d="M20 31c0-6 1.8-10 6-13" stroke="#123c2e" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M21.6 23.4c2.2-.2 3.8-1.3 4.6-3.4-2.3-.2-4 .8-4.6 3.4Z" fill="#123c2e" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 no-underline" aria-label={`${siteConfig.name}, home`}>
      <LogoMark light={light} />
      <span className={`font-display text-[1.35rem] font-semibold tracking-tight ${light ? "text-white" : "text-ink"}`}>
        {siteConfig.name}
      </span>
    </Link>
  );
}
