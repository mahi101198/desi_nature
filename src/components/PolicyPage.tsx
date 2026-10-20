import { Breadcrumbs } from "./Breadcrumbs";

/**
 * Shell for long-form policy pages: a paper sheet on the ground, readable
 * measure, and an honest "last reviewed" line.
 */
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
    <div className="wrap pt-10">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: title, path }]} />
      <div className="mt-10 grid md:grid-cols-12 gap-x-8 gap-y-8">
        <div className="md:col-span-4">
          <h1 className="t-head">{title}</h1>
          <p className="mt-6 t-lead">{intro}</p>
          <p className="mt-6 text-muted t-small">Last reviewed: {lastReviewed}</p>
          {ownerReviewNeeded && (
            <p role="note" className="mt-4 bg-ghee px-4 py-3 t-small">
              Draft wording. This page must be reviewed by the owner, ideally with legal advice, before the site takes
              orders.
            </p>
          )}
        </div>
        <div className="md:col-span-7 md:col-start-6 sheet p-6 md:p-12">
          <div className="prose-article max-w-[66ch]">{children}</div>
        </div>
      </div>
    </div>
  );
}
