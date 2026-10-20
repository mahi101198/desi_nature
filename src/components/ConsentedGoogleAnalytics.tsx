"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";

const KEY = "dn-analytics-consent";
type Choice = "granted" | "denied" | null;

function readChoice(): Choice {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function ConsentedGoogleAnalytics({ measurementId }: { measurementId: string }) {
  const [choice, setChoice] = useState<Choice>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Reading localStorage must wait for the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChoice(readChoice());
    setReady(true);
  }, []);

  function decide(value: Exclude<Choice, null>) {
    try {
      window.localStorage.setItem(KEY, value);
    } catch {
      // Private mode: the choice lasts for this page view only.
    }
    setChoice(value);
  }

  if (!ready || !/^G-[A-Z0-9]+$/.test(measurementId)) return null;

  if (choice === "granted") {
    return (
      <>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
        <Script id="ga4" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${measurementId}',{anonymize_ip:true});`}
        </Script>
      </>
    );
  }

  if (choice === "denied") return null;

  return (
    <div role="dialog" aria-live="polite" aria-label="Analytics cookies" className="fixed inset-x-0 bottom-0 z-50 bg-ink text-paper">
      <div className="wrap py-4 flex flex-wrap items-center justify-between gap-4 t-small">
        <p className="max-w-[60ch]">
          May we use Google Analytics cookies to count visits and enquiries? Nothing is shared for advertising.{" "}
          <Link href="/privacy-policy" className="link">
            Privacy policy
          </Link>
        </p>
        <div className="flex gap-2">
          <button type="button" className="btn btn-quiet" style={{ minHeight: "2.75rem" }} onClick={() => decide("denied")}>
            No thanks
          </button>
          <button type="button" className="btn" style={{ minHeight: "2.75rem" }} onClick={() => decide("granted")}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
