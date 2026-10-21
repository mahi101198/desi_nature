import { ArrowRight, BookOpenCheck, FileSearch, Leaf, Scale } from "lucide-react";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Visual } from "@/components/Visual";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About Desi Nature: how we source and how we write",
  description:
    "Desi Nature takes enquiries for Indian farm foods and publishes practical guides. How we handle sourcing, what we will and will not claim, and how to reach us.",
  path: "/about",
});

const principles = [
  { icon: FileSearch, title: "Show, don't claim", text: "We name the source and batch for every enquiry. If we can't document something, we don't say it." },
  { icon: Leaf, title: "Follow the season", text: "Farm food follows the harvest. We tell you what's available now rather than promising everything." },
  { icon: Scale, title: "No pressure", text: "No cart and no advance payment. You decide after you've seen the details in writing." },
  { icon: BookOpenCheck, title: "Write what we can back up", text: "Every guide lists its sources. Health claims stay out unless strong evidence and a review support them." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        crumbs={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]}
        eyebrow="About us"
        title="A small business built on straight answers"
        intro="Desi Nature takes enquiries for Indian farm foods and writes down what's worth knowing about keeping them well."
        aside={
          <Visual
            photo="about-farm"
            art="field"
            alt="Crop rows in a field at sunrise"
            priority
            className="aspect-[4/3] rounded-[28px] shadow-[var(--shadow-lg)]"
          />
        }
      />

      <section aria-labelledby="name-title" className="section">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">Our name</p>
            <h2 id="name-title" className="h-section mt-3">
              What “desi” means to us
            </h2>
          </div>
          <div className="space-y-5 text-lg lg:col-span-7 lg:col-start-6">
            <p>
              <em>Desi</em> is what Indians call something of our own place: desi ghee, desi wheat, desi cows. We use it in
              that plain sense — food grown and made in India — not as a quality claim.
            </p>
            {/* OWNER: replace this paragraph with the real story — who started Desi Nature, where, and why. */}
            <p className="rounded-2xl border border-dashed border-[#d6ccbc] bg-white p-5 text-ink-2">
              The story of who runs Desi Nature and where our food comes from will be written here by the owner, in their
              own words.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="principles-title" className="section bg-bg-2">
        <div className="container-x">
          <div className="max-w-2xl">
            <p className="eyebrow">How we work</p>
            <h2 id="principles-title" className="h-section mt-3">
              Four things we hold to
            </h2>
          </div>
          <div className="reveal-stagger mt-12 grid gap-6 sm:grid-cols-2">
            {principles.map(({ icon: Icon, title, text }) => (
              <div key={title} className="card p-8">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-forest text-ghee">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="h-card mt-5">{title}</h3>
                <p className="muted mt-2">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="writing-title" className="section">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">The journal</p>
            <h2 id="writing-title" className="h-section mt-3">
              How we write
            </h2>
          </div>
          <div className="space-y-5 text-lg lg:col-span-7 lg:col-start-6">
            <p>
              The journal answers practical questions about storing, choosing and growing food in Indian homes. We never
              invent reviews, customer stories or credentials.
            </p>
            <p>
              Some drafts are prepared with the help of AI tools. Nothing is published until a person has checked it
              against its sources. The full process is in our{" "}
              <Link href="/editorial-policy" className="link font-semibold">
                editorial policy
              </Link>
              .
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/contact" className="btn">
                Send an enquiry <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href="/blog" className="btn btn-ghost">
                Read the journal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
