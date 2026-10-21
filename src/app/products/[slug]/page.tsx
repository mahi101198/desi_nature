import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FoodArt } from "@/components/art/FoodArt";
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
    <>
      <section className="bg-hero border-b border-line">
        <div className="container-x pb-16 pt-8">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Farm foods", path: "/products" },
              { name: product.name, path: `/products/${slug}` },
            ]}
          />
          <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="relative aspect-square overflow-hidden rounded-[28px] shadow-[var(--shadow-lg)]">
              {product.image ? (
                <Image src={product.image.src} alt={product.image.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" priority />
              ) : (
                <FoodArt
                  kind={product.category === "honey" ? "honey" : product.category === "ghee" ? "ghee" : "grains"}
                  title={product.name}
                  className="absolute inset-0 h-full w-full"
                />
              )}
            </div>
            <div className="flex flex-col gap-6">
              <span className="pill pill-gold w-fit">{AVAILABILITY[product.availability]}</span>
              <h1 className="text-[clamp(2.4rem,1.6rem+3vw,4rem)] leading-[1.05]">{product.name}</h1>
              <p className="lead">{product.summary}</p>
              <p>{product.description}</p>
              <dl className="grid grid-cols-2 gap-3">
                {product.origin && (
                  <div className="card p-4">
                    <dt className="text-sm font-bold text-ink-3">Origin</dt>
                    <dd className="mt-1 font-semibold">{product.origin}</dd>
                  </div>
                )}
                {product.sizes.length > 0 && (
                  <div className="card p-4">
                    <dt className="text-sm font-bold text-ink-3">Sizes</dt>
                    <dd className="mt-1 font-semibold">{product.sizes.join(", ")}</dd>
                  </div>
                )}
                {product.priceInr && (
                  <div className="card p-4">
                    <dt className="text-sm font-bold text-ink-3">Price</dt>
                    <dd className="mt-1 font-semibold">₹{product.priceInr.toLocaleString("en-IN")}</dd>
                  </div>
                )}
                {product.fssaiLicence && (
                  <div className="card p-4">
                    <dt className="text-sm font-bold text-ink-3">FSSAI</dt>
                    <dd className="mt-1 font-semibold">{product.fssaiLicence}</dd>
                  </div>
                )}
              </dl>
              <div>
                <Link href={`/contact?product=${category?.slug ?? "something-else"}`} className="btn btn-lg">
                  Enquire about this <ArrowRight className="size-5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      {related.length > 0 && (
        <section aria-labelledby="related-title" className="section">
          <div className="container-x">
            <h2 id="related-title" className="h-section">
              Read before you buy
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((p) => (
                <ArticleCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
      <JsonLd data={productJsonLd(product)} />
    </>
  );
}
