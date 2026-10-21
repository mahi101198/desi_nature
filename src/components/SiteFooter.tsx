import { ArrowUpRight, Mail, MessageCircle } from "lucide-react";
import Link from "next/link";
import { siteConfig, socialProfiles } from "@/config/site";
import { whatsappLink } from "@/lib/contact";
import { Logo } from "./Logo";

const columns = [
  {
    title: "Farm foods",
    links: [
      { href: "/products#ghee", label: "Ghee" },
      { href: "/products#honey", label: "Honey" },
      { href: "/products#grains-and-flours", label: "Grains & flours" },
    ],
  },
  {
    title: "Journal",
    links: [
      { href: "/blog", label: "All guides" },
      { href: "/editorial-policy", label: "Editorial policy" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy-policy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  const wa = whatsappLink("Hello Desi Nature, I have a question.");
  return (
    <footer className="mt-auto bg-forest text-white/85">
      <div className="container-x pt-16 pb-10">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo light />
            <p className="mt-5 max-w-sm text-white/70">
              Farm foods from India, sold by enquiry — and practical, sourced guides on choosing and keeping them well.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/contact" className="btn btn-gold btn-sm">
                Send an enquiry
              </Link>
              {wa && (
                <a href={wa} target="_blank" rel="noopener" className="btn btn-sm border-white/20 bg-white/10 shadow-none hover:bg-white/15">
                  <MessageCircle className="size-4" aria-hidden="true" /> WhatsApp
                </a>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {columns.map((col) => (
              <div key={col.title}>
                <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-white">{col.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-white/70 transition-colors hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.name}. Product details are confirmed per enquiry.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {siteConfig.contactEmail && (
              <a href={`mailto:${siteConfig.contactEmail}`} className="inline-flex items-center gap-1.5 hover:text-white">
                <Mail className="size-4" aria-hidden="true" /> {siteConfig.contactEmail}
              </a>
            )}
            {socialProfiles().map((url) => (
              <a key={url} href={url} target="_blank" rel="noopener me" className="inline-flex items-center gap-1 capitalize hover:text-white">
                {new URL(url).hostname.replace(/^www\./, "").split(".")[0]}
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
