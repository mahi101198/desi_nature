import type { Metadata } from "next";
import { ArrowRight, BookOpen, Home, MessageSquareText, Wheat } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/blog", label: "The journal", icon: BookOpen },
  { href: "/products", label: "Farm foods", icon: Wheat },
  { href: "/contact", label: "Send an enquiry", icon: MessageSquareText },
];

export default function NotFound() {
  return (
    <section className="bg-hero">
      <div className="container-x grid min-h-[70svh] items-center gap-12 py-20 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="font-display text-[7rem] leading-none text-ghee">404</p>
          <h1 className="h-section mt-4">This page isn&apos;t in the pantry</h1>
          <p className="lead mt-4 max-w-md">The link may be old, or the article may not be published yet.</p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-6">
          {links.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link href={href} className="card card-hover group flex items-center gap-4 p-5 font-bold">
                <span className="flex size-11 items-center justify-center rounded-xl bg-leaf-soft text-forest">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                {label}
                <ArrowRight className="ml-auto size-4 text-ink-3 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
