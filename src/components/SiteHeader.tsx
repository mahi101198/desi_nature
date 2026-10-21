"use client";

import { Menu, MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { mainNav } from "@/config/site";
import { Logo } from "./Logo";

/** Sticky, translucent header with a full-screen menu on small screens. */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu on navigation and lock page scroll while it is open.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="site-header" data-scrolled={scrolled || open}>
      <div className="container-x flex h-[var(--header-h)] items-center justify-between gap-6">
        <Logo />
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1 rounded-full border border-line bg-white/60 p-1">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`block rounded-full px-4 py-2 text-[0.95rem] font-semibold transition-colors ${
                    isActive(item.href) ? "bg-forest text-white" : "text-ink-2 hover:bg-bg-2 hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/contact" className="btn btn-sm hidden sm:inline-flex">
            <MessageCircle className="size-4" aria-hidden="true" />
            Ask what&apos;s in stock
          </Link>
          <button
            type="button"
            className="md:hidden inline-flex size-11 items-center justify-center rounded-full border border-line bg-white"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        hidden={!open}
        className="md:hidden fixed inset-x-0 top-[var(--header-h)] bottom-0 bg-bg px-4 pb-8 pt-4 overflow-y-auto"
      >
        <nav aria-label="Mobile">
          <ul className="flex flex-col gap-1">
            {[{ href: "/", label: "Home" }, ...mainNav].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="flex items-center justify-between rounded-2xl px-4 py-4 font-display text-2xl text-ink hover:bg-bg-2"
                >
                  {item.label}
                  <span aria-hidden="true" className="text-ink-3">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link href="/contact" className="btn btn-lg mt-6 w-full">
          Send an enquiry
        </Link>
      </div>
    </header>
  );
}
