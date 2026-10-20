import { siteConfig } from "@/config/site";
import type { ENQUIRY_PRODUCTS } from "@/lib/enquiry";
import { EnquiryForm } from "./EnquiryForm";

// Semicircular notches at the perforation line. A mask cuts the shape; nothing is painted.
const NOTCH_MASK = "radial-gradient(circle 14px at 46% 0, #0000 98%, #000) top / 100% 51% no-repeat, radial-gradient(circle 14px at 46% 100%, #0000 98%, #000) bottom / 100% 51% no-repeat"; // taste-skill-ignore

/**
 * The enquiry form as a clip-out coupon: one filled card with notches cut into
 * its edges and a row of round perforation dots between the two halves.
 */
export function EnquiryCoupon({
  heading = "Ask what is in stock",
  note = "Tell us what you need. We reply with the source, batch and price; nothing is charged until you agree.",
  defaultProduct,
  headingLevel = "h2",
}: {
  heading?: string;
  note?: string;
  defaultProduct?: (typeof ENQUIRY_PRODUCTS)[number];
  headingLevel?: "h1" | "h2";
}) {
  const Heading = headingLevel;
  return (
    <div
      className="relative bg-leaf text-[var(--leaf-ink)] grid md:grid-cols-[46%_6px_1fr]"
      style={{ WebkitMask: NOTCH_MASK, mask: NOTCH_MASK }}
    >
      <div className="flex flex-col gap-6 p-8 md:p-12">
        <Heading className="t-head max-w-[12ch]">{heading}</Heading>
        <p className="max-w-[34ch]">{note}</p>
        <ul className="mt-2 space-y-2 max-w-[34ch]">
          <li>Where the food comes from</li>
          <li>Batch and packing details</li>
          <li>Price and delivery cost for your pin code</li>
        </ul>
      </div>
      <div aria-hidden="true" className="perforation-y hidden md:block" />
      <div aria-hidden="true" className="perforation-x md:hidden mx-6" />
      <div className="p-6 md:p-12 text-ink [&_.t-small]:text-[var(--leaf-ink)] [&_label]:text-[var(--leaf-ink)] [&_.link]:text-[var(--leaf-ink)] [&_[role=status]]:text-[var(--leaf-ink)]">
        <EnquiryForm
          whatsappNumber={siteConfig.whatsappNumber}
          contactEmail={siteConfig.contactEmail}
          defaultProduct={defaultProduct}
        />
      </div>
    </div>
  );
}
