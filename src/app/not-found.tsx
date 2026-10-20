import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="wrap pt-16 grid md:grid-cols-12 gap-x-8 gap-y-10">
      <div className="md:col-span-6">
        <h1 className="t-head">This page is not in the ledger</h1>
        <p className="t-lead mt-6 max-w-[32ch]">The link may be old, or the article may not be published yet.</p>
      </div>
      <ul className="md:col-span-5 md:col-start-8 sheet edge-zigzag p-8 space-y-3 self-start">
        <li>
          <Link href="/" className="link">
            Home
          </Link>
        </li>
        <li>
          <Link href="/blog" className="link">
            The journal
          </Link>
        </li>
        <li>
          <Link href="/products" className="link">
            Farm foods
          </Link>
        </li>
        <li>
          <Link href="/contact" className="link">
            Send an enquiry
          </Link>
        </li>
      </ul>
    </div>
  );
}
