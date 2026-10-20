import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { FoodDrawing } from "@/components/Drawings";
import { EnquiryCoupon } from "@/components/EnquiryCoupon";
import { EnquirySlip } from "@/components/EnquirySlip";
import { Faq, GENERAL_FAQ } from "@/components/Faq";
import { FoodShowcase, type ShowcaseItem } from "@/components/home/FoodShowcase";
import { HeroFolders } from "@/components/home/HeroFolders";
import { SeasonCalendar } from "@/components/home/SeasonCalendar";
import { siteConfig } from "@/config/site";
import { getProductCategories } from "@/lib/content/catalog";
import { getVisiblePosts } from "@/lib/content/posts";
import { upcomingTopics } from "@/lib/pipeline/topics";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: `${siteConfig.name} — Ghee, honey and grains by enquiry`,
  description: siteConfig.description,
  path: "/",
});

export default function HomePage() {
  const posts = getVisiblePosts();
  const liveSlugs = posts.map((p) => p.slug);
  const shownSlugs = new Set(liveSlugs);
  const upcoming = upcomingTopics(6).filter((t) => !shownSlugs.has(t.slug)).slice(0, Math.max(0, 4 - posts.length));
  const foods: ShowcaseItem[] = getProductCategories().map((c) => {
    const read = c.relatedPosts.find((s) => shownSlugs.has(s));
    const post = posts.find((p) => p.slug === read);
    return {
      slug: c.slug as ShowcaseItem["slug"],
      name: c.name,
      summary: c.summary,
      askAbout: c.askAbout,
      readHref: post ? `/blog/${post.slug}` : `/products#${c.slug}`,
      readLabel: post ? post.title : `More about ${c.name.toLowerCase()}`,
    };
  });

  return (
    <>
      <HeroFolders />

      {/* Intro: title, note, facts row */}
      <section aria-labelledby="intro-title" className="wrap pt-[8.75rem] pb-[7.5rem]">
        <div className="reveal grid md:grid-cols-12 gap-x-8 gap-y-6 items-end">
          <h2 id="intro-title" className="md:col-span-6 t-head">
            Farm food, asked for by name
          </h2>
          <p className="md:col-span-4 md:col-start-9 max-w-[30ch]">
            Desi Nature works by enquiry. You tell us what you need; we tell you exactly what we have, where it comes
            from and what it costs.
          </p>
        </div>
        <dl className="reveal mt-[7.5rem] grid grid-cols-2 md:flex md:justify-between gap-x-8 gap-y-8">
          {[
            ["Ghee, honey, grains", "Three foods, sourced by season"],
            ["Enquiry first", "Details in writing before you pay"],
            ["Sources listed", "Every journal article shows its references"],
          ].map(([fact, note]) => (
            <div key={fact} className="max-w-[18rem]">
              <dt className="t-lead">{fact}</dt>
              <dd className="mt-2 text-muted">
                {note}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Journal */}
      <section aria-labelledby="journal-title" className="wrap">
        <div className="reveal">
          <h2 id="journal-title" className="t-head">
            From the journal
          </h2>
        </div>
        <div className="reveal mt-10 grid md:grid-cols-2 gap-3">
          {posts.slice(0, 4).map((post, i) => (
            <ArticleCard key={post.slug} post={post} index={i} />
          ))}
          {upcoming.map((topic, i) => (
            <article
              key={topic.id}
              className="flex flex-col justify-between gap-6 p-7 md:p-8 min-h-[18rem]"
              style={{ background: ["#e3dad6", "#d7cbc5", "#cfc1ba"][(i + posts.length) % 3] }}
            >
              <div>
                <h3 className="t-lead">{topic.workingTitle}</h3>
                <p className="mt-4 text-muted">For {topic.reader.charAt(0).toLowerCase() + topic.reader.slice(1)}.</p>
              </div>
              <p>Being researched</p>
            </article>
          ))}
        </div>
        <p className="mt-12 flex flex-wrap gap-x-6 gap-y-2">
          <span>
            {posts.length === 0
              ? "The first guides are being checked against their sources."
              : `${posts.length === 1 ? "1 article" : `${posts.length} articles`} published. New guides appear once their sources are checked.`}
          </span>
          <Link href="/blog" className="link">
            Open the journal
          </Link>
        </p>
      </section>

      {/* Foods */}
      <section aria-labelledby="foods-title" className="wrap mt-[var(--gap-section)]">
        <h2 id="foods-title" className="reveal t-head mb-10">
          <span>What you can ask for</span>
        </h2>
        <FoodShowcase items={foods} />
      </section>

      {/* How an enquiry works */}
      <section aria-labelledby="how-title" className="bg-wheat mt-[var(--gap-section)] py-[clamp(5rem,8vw,8rem)]">
        <div className="wrap grid md:grid-cols-12 gap-x-8 gap-y-10 items-start">
          <div className="reveal md:col-span-5">
            <h2 id="how-title" className="t-head">
              How an enquiry works
            </h2>
            <p className="mt-6 max-w-[30ch]">
              Three steps, all in writing, and you can stop at any of them. Nothing is charged until you confirm.
            </p>
            <Link href="/contact" className="btn btn-ink mt-10">
              Start an enquiry
            </Link>
          </div>
          <div className="md:col-span-5 md:col-start-7">
            <EnquirySlip />
          </div>
        </div>
      </section>

      {/* This month in Indian fields: the live thing */}
      <section aria-labelledby="season-title" className="bg-leaf text-[var(--leaf-ink)] py-[clamp(5rem,8vw,8rem)]">
        <div className="wrap">
          <h2 id="season-title" className="reveal t-head mb-12">
            This month in Indian fields
          </h2>
          <SeasonCalendar initialMonth={new Date().getMonth()} liveSlugs={liveSlugs} />
        </div>
      </section>

      {/* A note on how we work */}
      <section aria-labelledby="note-title" className="bg-surface py-[clamp(5rem,8vw,7.5rem)]">
        <div className="wrap">
          <article className="reveal mx-auto w-full max-w-[40rem]">
            <div className="sheet px-6 py-10 md:p-[3.75rem]">
            <h2 id="note-title" className="t-lead italic">
              A note on how we work
            </h2>
            <div className="mt-7 space-y-5 t-body">
              <p>
                Desi Nature is a small, new business. We take enquiries for Indian farm foods, and we write down what
                is worth knowing about keeping them well.
              </p>
              <p>
                You will not find prices or a cart here yet. Supply of farm food changes with the season, and we would
                rather tell you exactly what we have than show a shop that pretends to have everything.
              </p>
              <p>
                When you enquire, we reply with where the food comes from, the batch details and the price. If we
                cannot answer a question about a product, we will say so.
              </p>
              <p>
                The journal follows the same rule. Every article lists its sources, and anything we cannot back up
                stays out. If you find a mistake, tell us and we will correct it.
              </p>
            </div>
            <p className="mt-8 t-lead italic">Desi Nature</p>
            </div>
            <div aria-hidden="true" className="perforation-x bg-paper" style={{ backgroundColor: "var(--paper)" }} />
            <div className="sheet px-6 md:px-[3.75rem] py-5 flex flex-wrap items-center justify-between gap-4">
              <span>Questions about a food or an article?</span>
              <Link href="/contact" className="btn">
                Write to us
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* Questions */}
      <section aria-labelledby="faq-title" className="wrap mt-[var(--gap-section)] grid md:grid-cols-12 gap-x-8 gap-y-10">
        <div className="md:col-span-5 md:order-1 order-2">
          <h2 id="faq-title" className="t-head">
            Questions people ask
          </h2>
          <ul className="mt-6 space-y-1 t-body">
            <li>Enquiries by form{siteConfig.whatsappNumber ? ", WhatsApp" : ""}{siteConfig.contactEmail ? " or email" : ""}</li>
            <li>Replies in writing, with batch details</li>
            <li>No payment taken on this website</li>
          </ul>
          <div className="mt-10">
            <Faq items={GENERAL_FAQ} />
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link href="/contact" className="btn">
              Send an enquiry
            </Link>
            <Link href="/about" className="link">
              About Desi Nature
            </Link>
          </div>
        </div>
        <div className="md:col-span-6 md:col-start-7 md:order-2 order-1 relative">
          <FoodDrawing kind="field" title="Drawing of crop rows under the sun" className="w-full aspect-[3/4] block" />
          <div className="absolute -bottom-8 right-0 md:left-[-2.5rem] md:right-auto w-[38%] md:w-1/3 aspect-square drift">
            <FoodDrawing kind="grains" title="Drawing of a jute sack of grain" className="w-full h-full block" />
          </div>
        </div>
      </section>

      {/* Enquiry coupon */}
      <section aria-label="Send an enquiry" className="wrap mt-[var(--gap-section)]">
        <div className="md:px-[8.33%]">
          <EnquiryCoupon heading="Ask what is in stock" />
        </div>
      </section>
    </>
  );
}
