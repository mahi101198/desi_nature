import { CalendarCheck, TriangleAlert } from "lucide-react";
import { PageHero } from "./PageHero";

/** Shell for long-form policy pages. */
export function PolicyPage({
  title,
  path,
  intro,
  lastReviewed,
  ownerReviewNeeded,
  children,
}: {
  title: string;
  path: string;
  intro: string;
  lastReviewed: string;
  ownerReviewNeeded?: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHero crumbs={[{ name: "Home", path: "/" }, { name: title, path }]} eyebrow="Policies" title={title} intro={intro}>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="pill bg-white text-ink-2">
            <CalendarCheck className="size-4" aria-hidden="true" /> Last reviewed {lastReviewed}
          </span>
        </div>
      </PageHero>
      <section className="section-tight pb-24">
        <div className="container-x">
          <div className="card mx-auto max-w-3xl p-6 sm:p-12">
            {ownerReviewNeeded && (
              <p role="note" className="mb-8 flex items-start gap-3 rounded-2xl bg-ghee-soft px-5 py-4 text-sm font-semibold text-[#6b430b]">
                <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                Draft wording. This page must be reviewed by the owner, ideally with legal advice, before the site takes
                orders.
              </p>
            )}
            <div className="prose-article">{children}</div>
          </div>
        </div>
      </section>
    </>
  );
}
