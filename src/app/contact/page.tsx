import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EnquiryCoupon } from "@/components/EnquiryCoupon";
import { Faq, GENERAL_FAQ } from "@/components/Faq";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Send an enquiry for ghee, honey or grains",
  description:
    "Ask Desi Nature about ghee, honey, grains or flours. Tell us what you need and your pin code; we reply with the source, batch details and price.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="wrap pt-10">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Enquire", path: "/contact" }]} />
      <div className="mt-10 md:px-[8.33%]">
        <EnquiryCoupon heading="Send an enquiry" headingLevel="h1" />
      </div>

      <div className="mt-[var(--gap-section)] grid md:grid-cols-12 gap-x-8 gap-y-12">
        <section aria-labelledby="other-ways" className="md:col-span-4">
          <h2 id="other-ways" className="t-head">
            Other ways to reach us
          </h2>
          <div className="mt-6 space-y-4">
            {siteConfig.whatsappNumber && <WhatsAppButton placement="contact" />}
            {siteConfig.contactEmail && (
              <p>
                Email:{" "}
                <a className="link" href={`mailto:${siteConfig.contactEmail}`}>
                  {siteConfig.contactEmail}
                </a>
              </p>
            )}
            {!siteConfig.whatsappNumber && !siteConfig.contactEmail && (
              <p className="text-muted">The form above is the best way to reach us for now.</p>
            )}
            <p className="text-muted t-small">
              We use your details only to answer your enquiry. See the{" "}
              <Link className="link" href="/privacy-policy">
                privacy policy
              </Link>
              .
            </p>
          </div>
        </section>
        <section aria-labelledby="contact-faq" className="md:col-span-7 md:col-start-6">
          <h2 id="contact-faq" className="t-head">
            Before you ask
          </h2>
          <div className="mt-6">
            <Faq items={GENERAL_FAQ} />
          </div>
        </section>
      </div>
    </div>
  );
}
