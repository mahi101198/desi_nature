import { Clock, FileText, Mail, MessageCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { EnquiryForm } from "@/components/EnquiryForm";
import { Faq, GENERAL_FAQ } from "@/components/Faq";
import { PageHero } from "@/components/PageHero";
import { siteConfig } from "@/config/site";
import { whatsappLink } from "@/lib/contact";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Send an enquiry for ghee, honey or grains",
  description:
    "Ask Desi Nature about ghee, honey, grains or flours. Tell us what you need and your pin code; we reply with the source, batch details and price.",
  path: "/contact",
});

const replyWith = [
  { icon: FileText, text: "Where the food comes from and its batch details" },
  { icon: Clock, text: "Packing, price and delivery cost for your pin code" },
  { icon: ShieldCheck, text: "No payment until you confirm in writing" },
];

export default function ContactPage() {
  const wa = whatsappLink("Hello Desi Nature, I would like to ask about ");
  return (
    <>
      <PageHero
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Enquire", path: "/contact" },
        ]}
        eyebrow="Enquiries"
        title="Ask what's in stock"
        intro="Tell us what you need. We reply with what we can supply, where it comes from and what it costs — usually in writing, always before you pay."
      />

      <section aria-label="Enquiry form" className="section-tight">
        <div className="container-x grid gap-8 lg:grid-cols-12">
          <div className="card p-6 shadow-[var(--shadow)] sm:p-10 lg:col-span-7">
            <h2 className="text-3xl">Send an enquiry</h2>
            <p className="muted mt-2">Takes about a minute. Fields marked optional can be left blank.</p>
            <div className="mt-8">
              <EnquiryForm whatsappNumber={siteConfig.whatsappNumber} contactEmail={siteConfig.contactEmail} />
            </div>
          </div>
          <aside className="flex flex-col gap-6 lg:col-span-5">
            <div className="bg-forest-glow rounded-[28px] p-8 text-white">
              <h2 className="text-2xl text-white">What you&apos;ll get back</h2>
              <ul className="mt-6 space-y-4">
                {replyWith.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-ghee">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="pt-1.5 text-white/85">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-8">
              <h2 className="text-2xl">Other ways to reach us</h2>
              <div className="mt-5 flex flex-col gap-3">
                {wa && (
                  <a href={wa} target="_blank" rel="noopener" className="btn btn-ghost justify-start">
                    <MessageCircle className="size-5" aria-hidden="true" /> WhatsApp us
                  </a>
                )}
                {siteConfig.contactEmail && (
                  <a href={`mailto:${siteConfig.contactEmail}`} className="btn btn-ghost justify-start">
                    <Mail className="size-5" aria-hidden="true" /> {siteConfig.contactEmail}
                  </a>
                )}
                {!wa && !siteConfig.contactEmail && <p className="muted">The form is the best way to reach us for now.</p>}
              </div>
              <p className="mt-5 text-sm text-ink-3">
                We use your details only to answer your enquiry. See the{" "}
                <Link className="link" href="/privacy-policy">
                  privacy policy
                </Link>
                .
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section aria-labelledby="contact-faq" className="section bg-bg-2">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">Questions</p>
            <h2 id="contact-faq" className="h-section mt-3">
              Before you ask
            </h2>
          </div>
          <div className="lg:col-span-8">
            <Faq items={GENERAL_FAQ} />
          </div>
        </div>
      </section>
    </>
  );
}
