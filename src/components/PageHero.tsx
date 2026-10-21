import type { Crumb } from "@/lib/seo";
import { Breadcrumbs } from "./Breadcrumbs";

/** Shared top section for inner pages. */
export function PageHero({
  crumbs,
  eyebrow,
  title,
  intro,
  children,
  aside,
}: {
  crumbs: Crumb[];
  eyebrow?: string;
  title: string;
  intro?: string;
  children?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="bg-hero relative overflow-hidden border-b border-line">
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="container-x relative pb-14 pt-8 sm:pb-20">
        <Breadcrumbs items={crumbs} />
        <div className={`mt-10 grid gap-10 ${aside ? "lg:grid-cols-12 lg:items-center" : ""}`}>
          <div className={`reveal-stagger ${aside ? "lg:col-span-7" : "max-w-3xl"}`}>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1 className="mt-3 text-[clamp(2.4rem,1.5rem+3.6vw,4.4rem)] leading-[1.04] tracking-[-0.03em]">{title}</h1>
            {intro && <p className="lead mt-5 max-w-2xl">{intro}</p>}
            {children}
          </div>
          {aside && <div className="reveal lg:col-span-5">{aside}</div>}
        </div>
      </div>
    </section>
  );
}
