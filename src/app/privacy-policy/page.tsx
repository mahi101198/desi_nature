import { PolicyPage } from "@/components/PolicyPage";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy policy",
  description: "What personal data Desi Nature collects through enquiries and analytics, why, how long we keep it, and how to ask us to delete it.",
  path: "/privacy-policy",
});

export default function PrivacyPage() {
  const contact = siteConfig.contactEmail ? `by email at ${siteConfig.contactEmail}` : "through the enquiry form on our contact page";
  return (
    <PolicyPage
      title="Privacy policy"
      path="/privacy-policy"
      intro="We collect as little as we can, use it only to answer you, and delete it when we no longer need it."
      lastReviewed="20 October 2026"
      ownerReviewNeeded
    >
      <h2>Who we are</h2>
      <p>
        This website is run by {siteConfig.name} (&ldquo;we&rdquo;). {/* OWNER: add legal business name and address. */}
        You can contact us {contact}.
      </p>

      <h2>What we collect when you enquire</h2>
      <p>When you send an enquiry, we receive the details you type into the form:</p>
      <ul>
        <li>your name;</li>
        <li>a phone number and/or email address, so we can reply;</li>
        <li>the food you are interested in, your delivery pin code and your message.</li>
      </ul>
      <p>
        We use these details only to reply to your enquiry and, if you go ahead, to arrange your order. We do not sell
        them, and we do not add you to a mailing list unless you ask us to.
      </p>
      <p>
        If you contact us on WhatsApp or by email instead, those services also process your message under their own
        privacy policies.
      </p>

      <h2>Analytics</h2>
      <p>
        We may use Vercel Web Analytics, which counts page views without cookies and without identifying you. If Google
        Analytics is enabled, it runs only after you accept it in the cookie notice, and we use it to count visits and
        enquiries, not for advertising. You can change your choice by clearing this site&apos;s data in your browser.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Enquiries that do not lead to an order are deleted within 12 months. Order records are kept as long as the law
        requires for tax and accounts.
      </p>

      <h2>Your rights</h2>
      <p>
        Under India&apos;s Digital Personal Data Protection Act, 2023, you may ask us what personal data we hold about you,
        ask us to correct or delete it, and withdraw consent. Contact us {contact} and we will respond within a
        reasonable time.
      </p>

      <h2>Security</h2>
      <p>
        The site is served over HTTPS. Enquiry details are passed to our inbox and are not stored on the website
        itself. Access to enquiries is limited to the people who answer them.
      </p>

      <h2>Changes</h2>
      <p>If we change how we use personal data, we will update this page and the date above.</p>
    </PolicyPage>
  );
}
