import {
  ArrowRight,
  BadgeCheck,
  CalendarRange,
  FileSearch,
  HandCoins,
  MessageSquareText,
  PackageCheck,
  Search,
} from "lucide-react";
import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { Faq, GENERAL_FAQ } from "@/components/Faq";
import { Hero } from "@/components/home/Hero";
import { SeasonCalendar } from "@/components/home/SeasonCalendar";
import { SectionHeading } from "@/components/SectionHeading";
import { Visual } from "@/components/Visual";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { siteConfig } from "@/config/site";
import { getCategories, getProductCategories } from "@/lib/content/catalog";
import { getVisiblePosts } from "@/lib/content/posts";
import { upcomingTopics } from "@/lib/pipeline/topics";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: `${siteConfig.name} — Ghee, honey and grains by enquiry`,
  description: siteConfig.description,
  path: "/",
});

const ART = { ghee: "ghee", honey: "honey", "grains-and-flours": "grains" } as const;

const steps = [
  { icon: MessageSquareText, title: "Tell us what you need", text: "The food, the quantity and your pin code — by form or WhatsApp." },
  { icon: FileSearch, title: "Get the details in writing", text: "Where it comes from, batch and packing details, price and delivery cost." },
  { icon: PackageCheck, title: "Decide in your own time", text: "Ask anything else. Nothing is charged until you confirm the order." },
];

const values = [
  { icon: Search, title: "Transparent sourcing", text: "Every reply names the source and batch. If we don't know something, we say so." },
  { icon: CalendarRange, title: "Seasonal, not stockpiled", text: "Farm food follows the harvest. We tell you what's available now, not what a catalogue claims." },
  { icon: BadgeCheck, title: "No unproven claims", text: "No 'organic', 'A2' or health promises without documents for that batch." },
  { icon: HandCoins, title: "Pay only when sure", text: "No cart, no advance payment. You confirm in writing first." },
];

const marquee = ["Ghee", "Honey", "Grains & flours", "Batch details on request", "Sourced by season", "Guides with sources", "No payment until you confirm"];

export default function HomePage() {
  const posts = getVisiblePosts();
  const liveSlugs = posts.map((p) => p.slug);
  const categories = getCategories();
  const upcoming = upcomingTopics(8).filter((t) => !liveSlugs.includes(t.slug)).slice(0, 4);
  const foods = getProductCategories();
  const [featured, ...rest] = posts;

  return (
    <>
      <Hero />

      {/* Marquee */}
      <div className="border-y border-line bg-white py-5" aria-hidden="true">
        <div className="marquee">
          {[0, 1].map((k) => (
            <div key={k} className="marquee-track">
              {marquee.map((m) => (
                <span key={m} className="flex items-center gap-3 whitespace-nowrap font-display text-xl text-ink-2">
                  <span className="size-2 rounded-full bg-ghee" />
                  {m}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Farm foods */}
      <section aria-labelledby="foods-title" className="section">
        <div className="container-x">
          <SectionHeading
            id="foods-title"
            eyebrow="Farm foods"
            title="What you can ask us for"
            intro="Availability changes with the season and the batch, so we confirm everything when you enquire."
            action={
              <Link href="/products" className="arrow-link shrink-0">
                All farm foods <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            }
          />
          <div className="reveal-stagger mt-12 grid gap-6 md:grid-cols-3">
            {foods.map((c) => (
              <article key={c.slug} className="card card-hover group relative flex flex-col overflow-hidden">
                <Visual
                  photo={`product-${c.slug}`}
                  art={ART[c.slug as keyof typeof ART] ?? "field"}
                  alt={`${c.name}`}
                  className="aspect-[4/3]"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="h-card">{c.name}</h3>
                    <span className="pill pill-gold">By enquiry</span>
                  </div>
                  <p className="muted">{c.summary}</p>
                  <Link
                    href={`/contact?product=${c.slug}`}
                    className="arrow-link mt-auto pt-2 after:absolute after:inset-0"
                  >
                    Ask about {c.name.toLowerCase()} <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-title" className="section bg-bg-2">
        <div className="container-x">
          <SectionHeading
            id="how-title"
            eyebrow="How it works"
            title="Ordering, without the guesswork"
            intro="Three steps, all in writing. You can stop at any of them."
            align="center"
          />
          <div className="relative mt-14">
          <div aria-hidden="true" className="absolute left-[16%] right-[16%] top-[4.5rem] hidden border-t-2 border-dashed border-[#d9cdb9] md:block" />
          <ol className="reveal-stagger relative grid gap-6 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="card relative flex flex-col items-center p-8 text-center">
                <span className="relative flex size-20 items-center justify-center rounded-full bg-forest text-white shadow-[var(--shadow-lg)]">
                  <Icon className="size-8" aria-hidden="true" />
                  <span className="absolute -right-1 -top-1 flex size-8 items-center justify-center rounded-full bg-ghee text-sm font-extrabold text-ink">
                    {i + 1}
                  </span>
                </span>
                <h3 className="h-card mt-6">{title}</h3>
                <p className="muted mt-2">{text}</p>
              </li>
            ))}
          </ol>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="btn btn-lg">
              Start an enquiry <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
            <WhatsAppButton placement="home-how" label="Ask on WhatsApp" />
          </div>
        </div>
      </section>

      {/* Seasons: the live element */}
      <section id="seasons" aria-labelledby="season-title" className="section bg-forest-glow text-white">
        <div className="container-x">
          <SectionHeading
            id="season-title"
            eyebrow="Farm calendar"
            title="This month in Indian fields"
            intro="What's being sown and harvested across India, and what it means for your kitchen."
            light
          />
          <div className="mt-12">
            <SeasonCalendar initialMonth={new Date().getMonth()} liveSlugs={liveSlugs} />
          </div>
        </div>
      </section>

      {/* Journal */}
      <section aria-labelledby="journal-title" className="section">
        <div className="container-x">
          <SectionHeading
            id="journal-title"
            eyebrow="The journal"
            title="Practical guides, with sources"
            intro="How to store, choose and grow food in Indian homes. Every guide lists the sources it relies on."
            action={
              <Link href="/blog" className="arrow-link shrink-0">
                Open the journal <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            }
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-12">
            {featured ? (
              <div className="reveal lg:col-span-12">
                <ArticleCard post={featured} featured />
              </div>
            ) : null}
            {rest.slice(0, 3).map((p) => (
              <div key={p.slug} className="reveal lg:col-span-4">
                <ArticleCard post={p} />
              </div>
            ))}
            {upcoming.length > 0 && (
              <div className="reveal lg:col-span-12">
                <div className="card p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="h-card">{posts.length ? "Coming up next" : "First guides being researched"}</h3>
                    <span className="pill">Published once sources are checked</span>
                  </div>
                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {upcoming.map((t) => (
                      <li key={t.id} className="flex items-start gap-3 rounded-2xl bg-bg p-4">
                        <span className="mt-1 size-2.5 shrink-0 rounded-full bg-ghee" aria-hidden="true" />
                        <span>
                          <span className="block font-bold">{t.workingTitle}</span>
                          <span className="text-sm text-ink-3">{categories.find((c) => c.slug === t.category)?.name}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Values bento */}
      <section aria-labelledby="values-title" className="section pt-0">
        <div className="container-x">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="reveal relative overflow-hidden rounded-[28px] lg:col-span-5 min-h-[420px]">
              <Visual photo="about-farm" art="field" alt="Crop rows in a field at sunrise" className="!absolute inset-0" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-8 pt-24 text-white">
                <p className="eyebrow !text-ghee">Why Desi Nature</p>
                <h2 id="values-title" className="mt-2 text-3xl text-white sm:text-4xl">
                  Food you can ask questions about
                </h2>
              </div>
            </div>
            <div className="reveal-stagger grid gap-6 sm:grid-cols-2 lg:col-span-7">
              {values.map(({ icon: Icon, title, text }) => (
                <div key={title} className="card p-7">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-ghee-soft text-honey">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <h3 className="h-card mt-5">{title}</h3>
                  <p className="muted mt-2">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-title" className="section bg-bg-2">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="reveal lg:col-span-4">
            <p className="eyebrow">Questions</p>
            <h2 id="faq-title" className="h-section mt-3">
              Before you ask
            </h2>
            <p className="lead mt-4">Straight answers about how ordering works.</p>
            <Link href="/about" className="arrow-link mt-6">
              How we work <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="lg:col-span-8">
            <Faq items={GENERAL_FAQ} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section aria-labelledby="cta-title" className="section-tight">
        <div className="container-x">
          <div className="reveal bg-forest-glow relative overflow-hidden rounded-[32px] px-6 py-14 text-center text-white sm:px-12 sm:py-20">
            <h2 id="cta-title" className="h-section mx-auto max-w-3xl text-white">
              Tell us what your kitchen needs
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/75">
              We&apos;ll reply with what we can supply, where it comes from and what it costs. No obligation.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="btn btn-gold btn-lg">
                Send an enquiry <ArrowRight className="size-5" aria-hidden="true" />
              </Link>
              <Link href="/blog" className="btn btn-lg border-white/25 bg-white/10 shadow-none hover:bg-white/20">
                Read the guides
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
