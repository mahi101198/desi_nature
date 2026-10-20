import Link from "next/link";

/**
 * The first screen as a stack of ledger folders, like the tabbed files a grain
 * merchant keeps for each commodity. Each folder is a real link to its section;
 * the front folder is open and holds the one action.
 */
const FOLDERS = [
  { label: "Journal", href: "/blog", bg: "var(--leaf)", fg: "var(--leaf-ink)", tabX: "6%" },
  { label: "Grains", href: "/products#grains-and-flours", bg: "var(--wheat)", fg: "var(--ink)", tabX: "28%" },
  { label: "Honey", href: "/products#honey", bg: "var(--honey)", fg: "var(--ink)", tabX: "50%" },
  { label: "Ghee", href: "/products#ghee", bg: "var(--ghee)", fg: "var(--ink)", tabX: "72%" },
];

export function HeroFolders() {
  return (
    <section aria-labelledby="hero-title" className="relative bg-soil text-[var(--soil-ink)] overflow-hidden">
      <div className="wrap pt-12 md:pt-16 text-center">
        <h1 id="hero-title" className="t-display italic">
          Desi Nature
        </h1>
        <p className="t-lead mx-auto mt-6 max-w-[40ch]">
          Ghee, honey and grains from Indian farms, sold by enquiry, with a journal on choosing and keeping them well.
        </p>
      </div>

      <div className="relative mx-auto mt-14 md:mt-16 w-full md:w-[86%] h-[28rem] md:h-[clamp(20rem,42svh,26rem)]">
        {FOLDERS.map((f, i) => (
          <Link
            key={f.label}
            href={f.href}
            className="group absolute inset-x-0 block no-underline transition-transform duration-300 ease-[var(--ease-out)] hover:-translate-y-3 focus-visible:-translate-y-3"
            style={{ top: `calc(${i} * clamp(2.75rem, 6svh, 3.5rem) + 2.5rem)`, bottom: 0, background: f.bg, color: f.fg }}
          >
            <span
              className="tab-shape absolute -top-10 h-10 w-[26%] min-w-[6.5rem] flex items-center justify-center t-body"
              style={{ left: f.tabX, background: f.bg }}
            >
              {f.label}
            </span>
          </Link>
        ))}

        {/* Front folder: open, holding the action. Runs off the bottom edge. */}
        <div
          className="absolute inset-x-0 -bottom-4 bg-paper text-ink"
          style={{ top: `calc(${FOLDERS.length} * clamp(2.75rem, 6svh, 3.5rem) + 2.5rem)` }}
        >
          <span className="tab-shape absolute -top-10 right-[6%] h-10 w-[26%] min-w-[6.5rem] flex items-center justify-center t-body bg-paper">
            Enquire
          </span>
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 p-5 md:p-8">
            <Link href="/contact" className="btn w-full md:w-auto">
              Ask what is in stock
            </Link>
            <p className="t-body max-w-[46ch]">
              No checkout, no guesswork: we reply with the source, batch and price before you pay anything.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
