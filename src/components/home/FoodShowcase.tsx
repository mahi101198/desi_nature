"use client";

import Link from "next/link";
import { useState } from "react";
import { FoodDrawing } from "../Drawings";

export type ShowcaseItem = {
  slug: "ghee" | "honey" | "grains-and-flours";
  name: string;
  summary: string;
  askAbout: string[];
  readHref?: string;
  readLabel?: string;
};

const DRAWING = { ghee: "ghee", honey: "honey", "grains-and-flours": "grains" } as const;

export function FoodShowcase({ items }: { items: ShowcaseItem[] }) {
  const [active, setActive] = useState(0);
  const item = items[active];
  return (
    <div className="grid md:grid-cols-2 bg-surface md:min-h-[88svh]">
      <div className="p-4 md:p-10 flex items-center">
        <FoodDrawing
          kind={DRAWING[item.slug]}
          title={`Drawing of ${item.name.toLowerCase()}`}
          className="w-full aspect-square block"
        />
      </div>
      <div className="flex flex-col justify-between gap-10 p-6 md:p-10 md:pl-4">
        <div role="tablist" aria-label="Farm foods" className="flex flex-wrap gap-x-6 gap-y-2">
          {items.map((it, i) => (
            <button
              key={it.slug}
              id={`food-tab-${it.slug}`}
              role="tab"
              type="button"
              aria-selected={i === active}
              aria-controls="food-panel"
              onClick={() => setActive(i)}
              className={`t-body min-h-11 transition-colors ${i === active ? "text-ink underline underline-offset-8 decoration-2 decoration-[var(--accent)]" : "text-muted hover:text-ink"}`}
            >
              {it.name}
            </button>
          ))}
        </div>
        <div id="food-panel" role="tabpanel" aria-labelledby={`food-tab-${item.slug}`}>
          <h3 className="t-head">{item.name}</h3>
          <p className="mt-6 max-w-[38ch]">{item.summary}</p>
          <p className="mt-6 italic">Ask us about</p>
          <ul className="mt-2 space-y-1 max-w-[40ch] list-disc pl-5 marker:text-[var(--accent)]">
            {item.askAbout.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
        <div className="grid sm:grid-cols-2 gap-1">
          <Link href={`/contact?product=${item.slug}`} className="btn btn-ink min-h-[4.5rem]">
            Enquire about {item.name.toLowerCase()}
          </Link>
          <Link href={item.readHref ?? `/products#${item.slug}`} className="btn btn-quiet min-h-[4.5rem] bg-ground">
            {item.readLabel ?? "Read more"}
          </Link>
        </div>
      </div>
    </div>
  );
}
