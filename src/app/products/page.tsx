import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FoodDrawing } from "@/components/Drawings";
import { getProductCategories, getVerifiedProducts } from "@/lib/content/catalog";
import { getVisiblePosts } from "@/lib/content/posts";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Farm foods: ghee, honey, grains and flours by enquiry",
  description:
    "Ask Desi Nature for ghee, honey, grains and stone-ground flours. We confirm the source, batch details and price for your pin code before you decide.",
  path: "/products",
});

const DRAWING = { ghee: "ghee", honey: "honey", "grains-and-flours": "grains" } as const;

export default function ProductsPage() {
  const categories = getProductCategories();
  const products = getVerifiedProducts();
  const posts = getVisiblePosts();

  return (
    <div className="wrap pt-10">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Farm foods", path: "/products" }]} />
      <div className="reveal grid md:grid-cols-12 gap-x-8 gap-y-6 mt-10 items-end">
        <h1 className="md:col-span-7 t-head">Farm foods, by enquiry</h1>
        <p className="md:col-span-4 md:col-start-9 max-w-[34ch]">
          Availability changes with the season and the batch, so there are no fixed listings yet. Ask, and we reply
          with what we can supply.
        </p>
      </div>

      <div className="mt-16 space-y-3">
        {categories.map((c, i) => {
          const items = products.filter((p) => p.category === c.slug);
          const reading = posts.filter((p) => c.relatedPosts.includes(p.slug));
          const drawing = DRAWING[c.slug as keyof typeof DRAWING];
          return (
            <section
              key={c.slug}
              id={c.slug}
              aria-labelledby={`${c.slug}-title`}
              className={`scroll-mt-6 grid md:grid-cols-12 gap-x-8 gap-y-6 p-6 md:p-10 ${i % 2 ? "bg-surface" : "bg-paper"}`}
            >
              {drawing && (
                <div className={`md:col-span-4 ${i % 2 ? "md:order-2 md:col-start-9" : ""}`}>
                  <FoodDrawing kind={drawing} title={`Drawing of ${c.name.toLowerCase()}`} className="w-full aspect-square block" />
                </div>
              )}
              <div className={`md:col-span-7 ${i % 2 ? "md:order-1" : "md:col-start-6"} flex flex-col gap-6`}>
                <h2 id={`${c.slug}-title`} className="t-head">
                  {c.name}
                </h2>
                <p className="max-w-[48ch]">{c.summary}</p>
                <div>
                  <h3 className="italic">Worth asking about</h3>
                  <ul className="mt-2 list-disc pl-5 space-y-1 marker:text-[var(--accent)]">
                    {c.askAbout.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                </div>
                {items.length > 0 && (
                  <div>
                    <h3 className="italic">Listed products</h3>
                    <ul className="mt-2 space-y-1">
                      {items.map((p) => (
                        <li key={p.slug}>
                          <Link href={`/products/${p.slug}`} className="link">
                            {p.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {reading.length > 0 && (
                  <p>
                    Read first:{" "}
                    {reading.map((p, j) => (
                      <span key={p.slug}>
                        {j > 0 && ", "}
                        <Link href={`/blog/${p.slug}`} className="link">
                          {p.title}
                        </Link>
                      </span>
                    ))}
                  </p>
                )}
                <div>
                  <Link href={`/contact?product=${c.slug}`} className="btn btn-ink">
                    Enquire about {c.name.toLowerCase()}
                  </Link>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <section aria-labelledby="before-title" className="mt-[var(--gap-section)] grid md:grid-cols-12 gap-x-8 gap-y-6">
        <h2 id="before-title" className="md:col-span-5 t-head">
          Before anything is sold
        </h2>
        <div className="md:col-span-6 md:col-start-7 space-y-4">
          <p>
            Every food we supply must carry the FSSAI licence or registration of the business that packs it, along with
            the labelling Indian law requires. Ask us for these details for any batch.
          </p>
          <p>
            We do not describe a product as organic, A2, certified or of a particular origin unless we can show the
            documents for that batch.
          </p>
        </div>
      </section>
    </div>
  );
}
