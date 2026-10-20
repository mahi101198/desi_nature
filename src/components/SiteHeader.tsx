import Link from "next/link";
import { mainNav, siteConfig } from "@/config/site";
import { NavLinks } from "./NavLinks";

export function SiteHeader() {
  return (
    <header className="relative z-20 bg-ground">
      <div className="wrap flex flex-wrap items-center justify-between gap-x-8 gap-y-2 py-5">
        <Link href="/" className="t-lead italic no-underline" aria-label={`${siteConfig.name}, home`}>
          {siteConfig.name}
        </Link>
        <nav aria-label="Main">
          <NavLinks items={mainNav.map((n) => ({ href: n.href, label: n.label }))} />
        </nav>
      </div>
    </header>
  );
}
