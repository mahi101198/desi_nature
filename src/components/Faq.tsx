export type FaqItem = { q: string; a: string };

/** Accordion without rules between rows; space does the separating. */
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-5">
      {items.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 t-body [&::-webkit-details-marker]:hidden">
            <span>{item.q}</span>
            <span aria-hidden="true" className="relative size-4 shrink-0 transition-transform duration-200 group-open:rotate-180">
              <span className="absolute left-0 top-1/2 h-[2px] w-[9px] origin-right rotate-45 bg-current" />
              <span className="absolute right-0 top-1/2 h-[2px] w-[9px] origin-left -rotate-45 bg-current" />
            </span>
          </summary>
          <p className="mt-2 max-w-[52ch]">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

export const GENERAL_FAQ: FaqItem[] = [
  {
    q: "Why are there no prices or a cart?",
    a: "Supply of farm food changes with the season and the batch. Rather than show stock we may not have, we confirm what is available, its source and its price when you enquire.",
  },
  {
    q: "Is your ghee organic, A2 or certified?",
    a: "We only state what we can show for a specific batch. Ask about the batch you are interested in and we will tell you what documentation exists, including the FSSAI licence or registration on the label.",
  },
  {
    q: "Where do you deliver?",
    a: "Tell us your pin code in the enquiry and we will confirm whether we can deliver there, and what it costs, before you decide.",
  },
  {
    q: "How do I pay?",
    a: "Payment details are shared only after you have confirmed the order in writing. Nothing is charged through this website.",
  },
  {
    q: "Can I trust the articles?",
    a: "Every article lists its sources, and we keep health claims out unless they are backed by strong evidence and reviewed. If you find a mistake, tell us and we will correct it.",
  },
];
