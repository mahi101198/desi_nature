"use client";

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

const MONTHS: Month[] = [
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
    <div className="grid md:grid-cols-12 gap-x-8 gap-y-10">
      <div className="md:col-span-5">
        <div role="group" aria-label="Choose a month" className="grid grid-cols-4 gap-1">
          {MONTHS.map((x, i) => (
            <button
              key={x.short}
              type="button"
              aria-pressed={i === month}
              onClick={() => setMonth(i)}
              className={`min-h-12 t-body transition-colors duration-150 ${
                i === month ? "bg-paper text-ink" : "bg-[#28512f] text-[var(--leaf-ink)] hover:bg-[#3a6b44]"
              }`}
            >
              {x.short}
            </button>
          ))}
        </div>
        <p className="t-small mt-4">
          Seasons as used in Indian agriculture. Exact timing varies by state, crop and the year&apos;s monsoon.
        </p>
      </div>
      <div className="md:col-span-7" aria-live="polite">
        <h3 className="t-head">{m.name}</h3>
        <p className="t-lead mt-2 italic">{m.season}</p>
        <dl className="mt-8 grid sm:grid-cols-2 gap-8">
          <div>
            <dt className="t-body italic">In the fields</dt>
            <dd className="mt-2">{m.fields}</dd>
          </div>
          <div>
            <dt className="t-body italic">In the kitchen</dt>
            <dd className="mt-2">{m.kitchen}</dd>
            {link && (
              <dd className="mt-3">
                <Link href={link.href} className="link">
                  {link.label}
                </Link>
              </dd>
            )}
          </div>
        </dl>
      </div>
    </div>
  );
}
