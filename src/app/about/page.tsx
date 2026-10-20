import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FoodDrawing } from "@/components/Drawings";
import { EnquirySlip } from "@/components/EnquirySlip";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About Desi Nature: how we source and how we write",
  description:
    "Desi Nature takes enquiries for Indian farm foods and publishes practical guides. How we handle sourcing, what we will and will not claim, and how to reach us.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="wrap pt-10">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "About", path: "/about" }]} />
      <div className="mt-10 grid md:grid-cols-12 gap-x-8 gap-y-10">
        <div className="md:col-span-6">
          <h1 className="t-head">About Desi Nature</h1>
          <p className="t-lead mt-8 max-w-[34ch]">
            A small business taking enquiries for Indian farm foods, and a journal about keeping them well.
          </p>
        </div>
        <div className="md:col-span-5 md:col-start-8">
          <FoodDrawing kind="field" title="Drawing of crop rows under the sun" className="w-full aspect-[4/3] block" />
        </div>
      </div>

      <section aria-labelledby="name-title" className="mt-[var(--gap-section)] grid md:grid-cols-12 gap-x-8 gap-y-6">
        <h2 id="name-title" className="md:col-span-4 t-head">
          The name
        </h2>
        <div className="md:col-span-7 md:col-start-6 space-y-5">
          <p>
            <em>Desi</em> is what Indians call something of our own place: desi ghee, desi wheat, desi cows. We use it
            in that plain sense, for food grown and made in India, not as a quality claim.
          </p>
          {/* OWNER: replace this paragraph with the real story — who started Desi Nature, where, and why. */}
          <p className="bg-surface p-4">
            The story of who runs Desi Nature and where our food comes from will be written here by the owner, in their
            own words.
          </p>
        </div>
      </section>

      <section aria-labelledby="sourcing-title" className="mt-[var(--gap-section)] grid md:grid-cols-12 gap-x-8 gap-y-10 items-start">
        <div className="md:col-span-5">
          <h2 id="sourcing-title" className="t-head">
            How we handle sourcing
          </h2>
          <div className="mt-6 space-y-5">
            <p>
              Farm food varies by season and by batch. Instead of fixed listings, we answer each enquiry with what we
              can actually supply: where it comes from, the batch details, packing and price.
            </p>
            <p>
              We do not call anything organic, A2, certified, pure or of a particular origin unless we can show the
              document for that batch. Every packed food must carry the FSSAI licence or registration of the business
              that packed it.
            </p>
            <p>
              <Link href="/contact" className="link">
                Send an enquiry
              </Link>{" "}
              and ask anything; if we do not know, we will say so.
            </p>
          </div>
        </div>
        <div className="md:col-span-5 md:col-start-8">
          <EnquirySlip />
        </div>
      </section>

      <section aria-labelledby="writing-title" className="mt-[var(--gap-section)] grid md:grid-cols-12 gap-x-8 gap-y-6">
        <h2 id="writing-title" className="md:col-span-4 t-head">
          How we write
        </h2>
        <div className="md:col-span-7 md:col-start-6 space-y-5">
          <p>
            The journal answers practical questions about storing, choosing and growing food in Indian homes. Each
            article lists its sources. We do not publish health claims unless strong evidence supports them and a
            person has reviewed them, and we never invent reviews, customer stories or credentials.
          </p>
          <p>
            Some drafts are prepared with the help of AI tools. Nothing is published until a person has checked it
            against its sources. The full process is in our{" "}
            <Link href="/editorial-policy" className="link">
              editorial policy
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
