import { ArrowRight, BadgeCheck, CircleHelp, FileCheck2 } from "lucide-react";
import Link from "next/link";
import { Visual } from "@/components/Visual";
import { PageHero } from "@/components/PageHero";
import { getProductCategories, getVerifiedProducts } from "@/lib/content/catalog";
import { getVisiblePosts } from "@/lib/content/posts";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Farm foods: ghee, honey, grains and flours by enquiry",
  description:
    "Ask Desi Nature for ghee, honey, grains and stone-ground flours. We confirm the source, batch details and price for your pin code before you decide.",
  path: "/products",
});

const ART = { ghee: "ghee", honey: "honey", "grains-and-flours": "grains" } as const;

export default function ProductsPage() {
  const categories = getProductCategories();
  const products = getVerifiedProducts();
  const posts = getVisiblePosts();

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Farm foods", path: "/products" },
        ]}
        eyebrow="Farm foods"
        title="Farm foods, by enquiry"
        intro="Availability changes with the season and the batch, so there are no fixed listings yet. Ask, and we reply with exactly what we can supply."
      >
        <nav aria-label="Jump to a food" className="mt-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <a key={c.slug} href={`#${c.slug}`} className="btn btn-ghost btn-sm">
              {c.name}
            </a>
          ))}
        </nav>
      </PageHero>

      <div className="section-tight">
        <div className="container-x flex flex-col gap-8">
          {categories.map((c, i) => {
            const items = products.filter((p) => p.category === c.slug);
            const reading = posts.filter((p) => c.relatedPosts.includes(p.slug));
            return (
              <section
                key={c.slug}
                id={c.slug}
                aria-labelledby={`${c.slug}-title`}
                className="reveal card grid overflow-hidden lg:grid-cols-2"
              >
                <Visual
                  photo={`product-${c.slug}`}
                  art={ART[c.slug as keyof typeof ART] ?? "field"}
                  alt={c.name}
                  className={`aspect-[4/3] lg:aspect-auto lg:min-h-[480px] ${i % 2 ? "lg:order-2" : ""}`}
                />
                <div className="flex flex-col gap-6 p-7 sm:p-10">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 id={`${c.slug}-title`} className="text-4xl">
                      {c.name}
                    </h2>
                    <span className="pill pill-gold">By enquiry</span>
                  </div>
                  <p className="lead">{c.summary}</p>
                  <div className="rounded-2xl bg-bg p-5">
                    <h3 className="flex items-center gap-2 font-sans text-sm font-extrabold uppercase tracking-wider text-forest">
                      <CircleHelp className="size-4" aria-hidden="true" /> Worth asking about
                    </h3>
                    <ul className="mt-3 grid gap-2">
                      {c.askAbout.map((q) => (
                        <li key={q} className="flex items-start gap-2.5">
                          <BadgeCheck className="mt-0.5 size-5 shrink-0 text-leaf" aria-hidden="true" />
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {items.length > 0 && (
                    <ul className="flex flex-wrap gap-2">
                      {items.map((p) => (
                        <li key={p.slug}>
                          <Link href={`/products/${p.slug}`} className="btn btn-ghost btn-sm">
                            {p.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-auto flex flex-wrap items-center gap-4">
                    <Link href={`/contact?product=${c.slug}`} className="btn">
                      Enquire about {c.name.toLowerCase()} <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                    {reading.map((p) => (
                      <Link key={p.slug} href={`/blog/${p.slug}`} className="arrow-link">
                        Read: {p.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <section aria-labelledby="before-title" className="section pt-8">
        <div className="container-x">
          <div className="card grid gap-8 p-8 sm:p-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-leaf-soft text-forest">
                <FileCheck2 className="size-6" aria-hidden="true" />
              </span>
              <h2 id="before-title" className="mt-5 text-3xl sm:text-4xl">
                Before anything is sold
              </h2>
            </div>
            <div className="muted space-y-4 text-lg lg:col-span-7">
              <p>
                Every food we supply must carry the FSSAI licence or registration of the business that packs it, along with
                the labelling Indian law requires. Ask us for these details for any batch.
              </p>
              <p>
                We do not describe a product as organic, A2, certified or of a particular origin unless we can show the
                documents for that batch.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
