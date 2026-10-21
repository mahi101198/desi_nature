import { Plus } from "lucide-react";

export type FaqItem = { q: string; a: string };

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <details key={item.q} className="group card overflow-hidden transition-colors open:border-[#d6ccbc] open:bg-white">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[1.05rem] font-bold [&::-webkit-details-marker]:hidden">
            <span>{item.q}</span>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-bg-2 text-forest transition-transform duration-300 group-open:rotate-45">
              <Plus className="size-4" aria-hidden="true" />
            </span>
          </summary>
          <p className="muted px-5 pb-5 pr-14">{item.a}</p>
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

