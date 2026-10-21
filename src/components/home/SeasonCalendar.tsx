"use client";

import { ArrowRight, CookingPot, Sprout } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * "This month in Indian fields": the farm year by month, following the three
 * cropping seasons used in Indian agriculture (kharif, rabi, zaid). Timing
 * varies by state and by the monsoon, so the text stays general.
 */
type Month = {
  name: string;
  short: string;
  season: string;
  fields: string;
  kitchen: string;
  link?: { href: string; label: string };
};

export const MONTHS: Month[] = [
  { name: "January", short: "Jan", season: "Rabi, growing", fields: "Wheat, mustard and gram are growing through the cool months. Mustard is in flower across much of the north.", kitchen: "Ghee sets solid in cold kitchens. That is a change of texture, not spoilage.", link: { href: "/blog/how-to-store-ghee-at-home", label: "Storing ghee in winter" } },
  { name: "February", short: "Feb", season: "Rabi, ripening", fields: "Rabi crops fill their grain. Early vegetables from winter sowing are at their best.", kitchen: "A good month to use up last year's stored grain before the new harvest." },
  { name: "March", short: "Mar", season: "Rabi harvest begins · zaid sowing", fields: "Harvest of rabi crops begins in many states. Short summer crops such as cucumber, melons and moong are sown.", kitchen: "Kitchens warm up. Move ghee away from the stove before summer arrives.", link: { href: "/blog/how-to-store-ghee-at-home", label: "Storing ghee in summer" } },
  { name: "April", short: "Apr", season: "Rabi harvest · zaid", fields: "Wheat harvest is under way and new grain reaches the markets.", kitchen: "Many families buy the year's wheat now. Dry, clean storage decides how well it lasts." },
  { name: "May", short: "May", season: "Zaid harvest · fields rest", fields: "Summer crops are harvested and fields are prepared for the monsoon.", kitchen: "The hottest weeks of the year. Keep oils, ghee and flour in the coolest dark cupboard.", link: { href: "/blog/how-to-store-ghee-at-home", label: "Keeping ghee cool" } },
  { name: "June", short: "Jun", season: "Kharif sowing begins", fields: "With the monsoon's arrival, kharif crops such as rice, maize, cotton, soybean and groundnut are sown.", kitchen: "Humidity rises. Dry spoons and tight lids matter more from now until October." },
  { name: "July", short: "Jul", season: "Kharif sowing", fields: "Paddy transplanting and kharif sowing continue as the rains spread inland.", kitchen: "Monsoon is when water finds its way into jars. Keep a small daily jar and a sealed stock jar.", link: { href: "/blog/how-to-store-ghee-at-home", label: "The two-jar habit" } },
  { name: "August", short: "Aug", season: "Kharif, growing", fields: "Kharif crops grow through the wettest weeks of the year.", kitchen: "Check stored grain and pulses for damp and insects every few weeks." },
  { name: "September", short: "Sep", season: "Kharif, early harvest", fields: "Early-sown kharif crops start to be harvested as the monsoon withdraws.", kitchen: "The end of the rains is a good time to air and dry storage bins before refilling them." },
  { name: "October", short: "Oct", season: "Kharif harvest · rabi sowing", fields: "Rice, cotton and soybean are harvested. Fields are prepared and rabi sowing begins.", kitchen: "Festive cooking uses more ghee. Refill the daily jar from the stock jar rather than opening the big one every day.", link: { href: "/blog/how-to-store-ghee-at-home", label: "How to store ghee" } },
  { name: "November", short: "Nov", season: "Rabi sowing", fields: "Wheat, mustard, gram and peas are sown across the plains.", kitchen: "Winter vegetables for kitchen gardens go in now in most regions." },
  { name: "December", short: "Dec", season: "Rabi, establishing", fields: "Rabi crops establish through the cold. Fog and frost are the risks in the north.", kitchen: "Cold weather is kind to stored ghee and grain. It is the easiest season for storage." },
];

export function SeasonCalendar({ initialMonth, liveSlugs }: { initialMonth: number; liveSlugs: string[] }) {
  const [month, setMonth] = useState(initialMonth);

  useEffect(() => {
    // Show the visitor's current month, not the month the page was built.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMonth(new Date().getMonth());
  }, []);

  const m = MONTHS[month];
  // Only link to articles that are live on this deployment.
  const link = m.link && liveSlugs.includes(m.link.href.replace("/blog/", "")) ? m.link : undefined;
  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-5">
        <div role="group" aria-label="Choose a month" className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-4">
          {MONTHS.map((x, i) => (
            <button
              key={x.short}
              type="button"
              aria-pressed={i === month}
              onClick={() => setMonth(i)}
              className={`min-h-12 rounded-full text-[0.95rem] font-bold transition-all duration-200 ${
                i === month
                  ? "bg-ghee text-ink shadow-[0_8px_20px_-8px_rgba(233,169,59,0.8)]"
                  : "border border-white/15 bg-white/5 text-white/80 hover:bg-white/15 hover:text-white"
              }`}
            >
              {x.short}
            </button>
          ))}
        </div>
        <p className="mt-5 text-sm text-white/60">
          Seasons as used in Indian agriculture. Exact timing varies by state, crop and the year&apos;s monsoon.
        </p>
      </div>
      <div className="lg:col-span-7" aria-live="polite">
        <div className="rounded-[28px] border border-white/15 bg-white/[0.07] p-6 backdrop-blur sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="text-4xl text-white sm:text-5xl">{m.name}</h3>
            <span className="pill pill-dark">{m.season}</span>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/[0.06] p-5">
              <p className="flex items-center gap-2 font-bold text-white">
                <Sprout className="size-5 text-ghee" aria-hidden="true" /> In the fields
              </p>
              <p className="mt-2 text-white/75">{m.fields}</p>
            </div>
            <div className="rounded-2xl bg-white/[0.06] p-5">
              <p className="flex items-center gap-2 font-bold text-white">
                <CookingPot className="size-5 text-ghee" aria-hidden="true" /> In the kitchen
              </p>
              <p className="mt-2 text-white/75">{m.kitchen}</p>
              {link && (
                <Link href={link.href} className="mt-3 inline-flex items-center gap-1.5 font-bold text-ghee hover:underline">
                  {link.label} <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Small "this month" chip for the hero, showing the visitor's current month. */
export function SeasonChip({ initialMonth }: { initialMonth: number }) {
  const [month, setMonth] = useState(initialMonth);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMonth(new Date().getMonth());
  }, []);
  const m = MONTHS[month];
  return (
    <a href="#seasons" className="block no-underline">
      <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-leaf">
        <Sprout className="size-4" aria-hidden="true" /> This month in the fields
      </span>
      <span className="mt-1 block font-display text-lg leading-snug text-ink">{m.season}</span>
    </a>
  );
}
