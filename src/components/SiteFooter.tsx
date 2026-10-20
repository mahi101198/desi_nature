import Link from "next/link";
import { siteConfig, socialProfiles } from "@/config/site";
import { whatsappLink } from "@/lib/contact";

/** Block wordmark: each letter knocked out of its own coloured block, bottoms aligned. */
const BLOCKS = [
  { ch: "D", h: 100, bg: "var(--leaf)", fg: "var(--leaf-ink)" },
  { ch: "e", h: 78, bg: "var(--ghee)", fg: "var(--ink)" },
  { ch: "s", h: 66, bg: "var(--wheat)", fg: "var(--ink)" },
  { ch: "i", h: 88, bg: "var(--honey)", fg: "var(--ink)" },
  { ch: "N", h: 100, bg: "var(--paper)", fg: "var(--ink)" },
  { ch: "a", h: 72, bg: "var(--leaf)", fg: "var(--leaf-ink)" },
  { ch: "t", h: 84, bg: "var(--ghee)", fg: "var(--ink)" },
  { ch: "u", h: 64, bg: "var(--wheat)", fg: "var(--ink)" },
  { ch: "r", h: 76, bg: "var(--honey)", fg: "var(--ink)" },
  { ch: "e", h: 92, bg: "var(--paper)", fg: "var(--ink)" },
];

const columns = [
  {
    title: "Read",
    links: [
      { href: "/blog", label: "Journal" },
      { href: "/editorial-policy", label: "Editorial policy" },
    ],
  },
  {
    title: "Farm foods",
    links: [
      { href: "/products#ghee", label: "Ghee" },
      { href: "/products#honey", label: "Honey" },
      { href: "/products#grains-and-flours", label: "Grains and flours" },
    ],
  },
  {
    title: "Desi Nature",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Enquire" },
    ],
  },
  {
    title: "Policies",
    links: [
      { href: "/privacy-policy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  const wa = whatsappLink("Hello Desi Nature, I have a question.");
  return (
    <footer className="bg-soil text-[var(--soil-ink)] mt-[var(--gap-section)]">
      <div className="wrap pt-20 pb-10">
        <p role="img" aria-label={siteConfig.name} className="flex items-end gap-1 h-[22svh] md:h-[34svh] min-h-40">
          {BLOCKS.map((b, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="flex-1 flex items-end justify-center pb-[0.12em] leading-none select-none"
              style={{ height: `${b.h}%`, background: b.bg, color: b.fg, fontSize: "clamp(2rem, 7.5vw, 9rem)" }}
            >
              {b.ch}
            </span>
          ))}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-12 gap-x-8 gap-y-10 mt-14">
          {columns.map((col) => (
            <div key={col.title} className="md:col-span-2">
              <h2 className="t-body italic mb-3">{col.title}</h2>
              <ul className="space-y-2 t-small">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="link no-underline hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="col-span-2 md:col-span-4 space-y-2">
            <h2 className="t-body italic mb-3">Write to us</h2>
            {siteConfig.contactEmail ? (
              <p>
                <a className="link" href={`mailto:${siteConfig.contactEmail}`}>
                  {siteConfig.contactEmail}
                </a>
              </p>
            ) : null}
            {wa ? (
              <p>
                <a className="link" href={wa} rel="noopener" target="_blank">
                  WhatsApp
                </a>
              </p>
            ) : null}
            <p>
              <Link className="link" href="/contact">
                Enquiry form
              </Link>
            </p>
            {socialProfiles().length > 0 ? (
              <ul className="flex flex-wrap gap-x-4">
                {socialProfiles().map((url) => (
                  <li key={url}>
                    <a className="link" href={url} rel="noopener me" target="_blank">
                      {new URL(url).hostname.replace(/^www\./, "").split(".")[0]}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mt-14">
          <p>
            © {year} {siteConfig.name}. Product details are confirmed per enquiry.
          </p>
          <Link href="/contact" className="btn" style={{ minHeight: "2.75rem", fontSize: "1rem" }}>
            Send an enquiry
          </Link>
        </div>
      </div>
    </footer>
  );
}
