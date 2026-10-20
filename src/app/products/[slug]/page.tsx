import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/config/site";
import { getProductCategories, getVerifiedProduct, getVerifiedProducts } from "@/lib/content/catalog";
import { getVisiblePosts } from "@/lib/content/posts";
import { pageMetadata, productJsonLd } from "@/lib/seo";

export const dynamicParams = false;

/** Product pages are generated only for products the owner has verified. */
export function generateStaticParams() {
  return getVerifiedProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getVerifiedProduct(slug);
  if (!product) return {};
  return pageMetadata({
    title: product.name,
    description: product.summary,
    path: `/products/${slug}`,
    image: product.image
      ? { url: absoluteUrl(product.image.src), alt: product.image.alt, width: product.image.width, height: product.image.height }
      : undefined,
  });
}

const AVAILABILITY = {
  "in-stock": "In stock",
  seasonal: "Seasonal",
  "on-enquiry": "Ask for current availability",
  unavailable: "Not available right now",
};

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = getVerifiedProduct(slug);
  if (!product) notFound();
  const category = getProductCategories().find((c) => c.slug === product.category);
  const related = getVisiblePosts().filter((p) => product.relatedPosts.includes(p.slug) || p.relatedProducts.includes(slug));

  return (
    <div className="wrap pt-10">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Farm foods", path: "/products" },
          { name: product.name, path: `/products/${slug}` },
        ]}
      />
      <div className="mt-10 grid md:grid-cols-2 gap-x-10 gap-y-8">
        <div className="bg-surface aspect-square">
          {product.image && (
            <Image
              src={product.image.src}
              alt={product.image.alt}
              width={product.image.width}
              height={product.image.height}
              className="w-full h-full object-cover"
              priority
            />
          )}
        </div>
        <div className="flex flex-col gap-6">
          <h1 className="t-head">{product.name}</h1>
          <p className="t-lead">{product.summary}</p>
          <p>{product.description}</p>
          <dl className="grid grid-cols-2 gap-4 t-small">
            {product.origin && (
              <div>
                <dt className="text-muted">Origin</dt>
                <dd>{product.origin}</dd>
              </div>
            )}
            {product.sizes.length > 0 && (
              <div>
                <dt className="text-muted">Sizes</dt>
                <dd>{product.sizes.join(", ")}</dd>
              </div>
            )}
            {product.priceInr && (
              <div>
                <dt className="text-muted">Price</dt>
                <dd className="tabular">₹{product.priceInr.toLocaleString("en-IN")}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted">Availability</dt>
              <dd>{AVAILABILITY[product.availability]}</dd>
            </div>
            {product.fssaiLicence && (
              <div>
                <dt className="text-muted">FSSAI</dt>
                <dd className="tabular">{product.fssaiLicence}</dd>
              </div>
            )}
          </dl>
          <div>
            <Link href={`/contact?product=${category?.slug ?? "something-else"}`} className="btn btn-ink">
              Enquire about this
            </Link>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section aria-labelledby="related-title" className="mt-[var(--gap-section)]">
          <h2 id="related-title" className="t-head">
            Read before you buy
          </h2>
          <div className="mt-8 grid md:grid-cols-3 gap-3">
            {related.map((p, i) => (
              <ArticleCard key={p.slug} post={p} index={i} />
            ))}
          </div>
        </section>
      )}
      <JsonLd data={productJsonLd(product)} />
    </div>
  );
}
