import Link from "next/link";
import { PolicyPage } from "@/components/PolicyPage";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms of use",
  description: "Terms for using the Desi Nature website and journal, and how enquiries and orders work.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms of use"
      path="/terms"
      intro="Plain terms for reading this site and sending us an enquiry."
      lastReviewed="20 October 2026"
      ownerReviewNeeded
    >
      <h2>Using this website</h2>
      <p>
        You may read, share and link to the articles on this site. Please do not copy whole articles to other websites;
        quote a short passage and link back instead.
      </p>

      <h2>The journal is general information</h2>
      <p>
        Our articles are practical guidance on food storage, buying and gardening. They are not medical, nutritional or
        legal advice. If you have a health condition or allergy, ask a qualified professional.
      </p>

      <h2>Enquiries are not orders</h2>
      <p>
        Sending an enquiry does not create an order or any obligation. An order exists only when we have confirmed the
        product, quantity, price, delivery cost and payment method to you in writing and you have accepted.
      </p>
      <p>
        Product details on this site are descriptions of what you can ask for, not offers for sale. Availability, prices
        and delivery areas are confirmed per enquiry.
      </p>

      {/* OWNER: add returns, refunds, cancellation and delivery terms before taking orders. */}
      <h2>Returns, refunds and delivery</h2>
      <p>
        Terms for returns, refunds, cancellation and delivery will be confirmed in writing with each order and
        published here before online ordering begins.
      </p>

      <h2>Links to other sites</h2>
      <p>We link to sources and other websites for reference. We are not responsible for their content.</p>

      <h2>Contact</h2>
      <p>
        Questions about these terms can be sent through our <Link href="/contact">contact page</Link>
        {siteConfig.contactEmail ? ` or to ${siteConfig.contactEmail}` : ""}.
      </p>
    </PolicyPage>
  );
}
