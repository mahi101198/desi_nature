"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ENQUIRY_PRODUCTS, enquiryText } from "@/lib/enquiry";
import { track } from "@/lib/track";

type Props = {
  whatsappNumber: string;
  contactEmail: string;
  defaultProduct?: (typeof ENQUIRY_PRODUCTS)[number];
};

const LABELS: Record<(typeof ENQUIRY_PRODUCTS)[number], string> = {
  ghee: "Ghee",
  honey: "Honey",
  "grains-and-flours": "Grains and flours",
  "something-else": "Something else",
};

type State =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "fallback"; text: string }
  | { kind: "error"; message: string; fields?: Record<string, string> };

const field =
  "block w-full min-h-[3.25rem] px-4 py-3 bg-[color-mix(in_srgb,var(--paper)_88%,var(--leaf))] text-ink placeholder:text-muted t-body";

/**
 * The enquiry coupon. Submits to /api/enquiry; if no delivery channel is set up
 * there, it offers the same message by WhatsApp or email instead, so a visitor
 * is never left with a form that silently goes nowhere.
 */
export function EnquiryForm({ whatsappNumber, contactEmail, defaultProduct = "ghee" }: Props) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const openedAt = useRef<number>(0);
  const [product, setProduct] = useState<string>(defaultProduct);

  useEffect(() => {
    // Links such as /contact?product=honey preselect the food. Read on the client
    // so the page itself stays static.
    const fromUrl = new URLSearchParams(window.location.search).get("product");
    if (fromUrl && (ENQUIRY_PRODUCTS as readonly string[]).includes(fromUrl)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProduct(fromUrl);
    }
  }, []);

  function markOpened() {
    if (!openedAt.current) openedAt.current = Date.now();
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      product: String(form.get("product") ?? "ghee"),
      pincode: String(form.get("pincode") ?? ""),
      message: String(form.get("message") ?? ""),
      consent: form.get("consent") === "on",
      company: String(form.get("company") ?? ""),
      elapsedMs: openedAt.current ? Date.now() - openedAt.current : 0,
    };
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        fallback?: boolean;
        error?: string;
        fields?: Record<string, string>;
      };
      if (res.ok && body.ok) {
        track({ name: "enquiry_submit", params: { product: payload.product, channel: "form" } });
        setState({ kind: "sent" });
        return;
      }
      if (body.fallback) {
        setState({
          kind: "fallback",
          text: enquiryText({
            name: payload.name,
            product: payload.product as (typeof ENQUIRY_PRODUCTS)[number],
            pincode: payload.pincode,
            message: payload.message,
          }),
        });
        return;
      }
      setState({ kind: "error", message: body.error ?? "Something went wrong. Please try again.", fields: body.fields });
    } catch {
      setState({ kind: "error", message: "Could not reach the server. Check your connection and try again." });
    }
  }

  if (state.kind === "sent") {
    return (
      <div role="status" className="space-y-3">
        <p className="t-lead">Thank you. Your enquiry has reached us.</p>
        <p>We reply with the source, batch details and price before you decide anything.</p>
      </div>
    );
  }

  if (state.kind === "fallback") {
    const wa = /^\d{10,15}$/.test(whatsappNumber)
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(state.text)}`
      : null;
    const mail = contactEmail.includes("@")
      ? `mailto:${contactEmail}?subject=${encodeURIComponent("Desi Nature enquiry")}&body=${encodeURIComponent(state.text)}`
      : null;
    return (
      <div role="status" className="space-y-4">
        <p className="t-lead">Almost there. Send it with one tap:</p>
        <div className="flex flex-col gap-2">
          {wa && (
            <a
              className="btn btn-ink w-full"
              href={wa}
              target="_blank"
              rel="noopener"
              onClick={() => track({ name: "enquiry_submit", params: { product: "form-fallback", channel: "whatsapp" } })}
            >
              Send on WhatsApp
            </a>
          )}
          {mail && (
            <a
              className="btn btn-quiet w-full"
              href={mail}
              onClick={() => track({ name: "enquiry_submit", params: { product: "form-fallback", channel: "email" } })}
            >
              Send by email
            </a>
          )}
        </div>
        {!wa && !mail && (
          <p>
            Our enquiry inbox is being set up. Please copy your message below and check back soon, or see the{" "}
            <Link className="link" href="/contact">
              contact page
            </Link>
            .
          </p>
        )}
        <pre className="whitespace-pre-wrap font-serif t-small bg-[var(--paper)] p-3">{state.text}</pre>
      </div>
    );
  }

  const err = state.kind === "error" ? state.fields ?? {} : {};
  return (
    <form onSubmit={onSubmit} onFocus={markOpened} onPointerDown={markOpened} noValidate className="flex flex-col gap-[10px]">
      <label className="sr-only" htmlFor="enq-name">Your name</label>
      <input id="enq-name" name="name" required autoComplete="name" placeholder="Your name" className={field} aria-invalid={!!err.name} />
      {err.name && <p className="t-small">{err.name}</p>}

      <label className="sr-only" htmlFor="enq-phone">Phone or WhatsApp number</label>
      <input id="enq-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="Phone or WhatsApp" className={field} aria-invalid={!!err.phone} />
      {err.phone && <p className="t-small">{err.phone}</p>}

      <label className="sr-only" htmlFor="enq-email">Email (optional if you gave a phone)</label>
      <input id="enq-email" name="email" type="email" autoComplete="email" placeholder="Email (optional)" className={field} aria-invalid={!!err.email} />
      {err.email && <p className="t-small">{err.email}</p>}

      <div className="grid grid-cols-2 gap-[10px]">
        <div>
          <label className="sr-only" htmlFor="enq-product">What are you looking for?</label>
          <select id="enq-product" name="product" value={product} onChange={(e) => setProduct(e.target.value)} className={field}>
            {ENQUIRY_PRODUCTS.map((p) => (
              <option key={p} value={p}>
                {LABELS[p]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="sr-only" htmlFor="enq-pin">Delivery pin code</label>
          <input id="enq-pin" name="pincode" inputMode="numeric" autoComplete="postal-code" maxLength={6} placeholder="Pin code" className={field} aria-invalid={!!err.pincode} />
        </div>
      </div>
      {err.pincode && <p className="t-small">{err.pincode}</p>}

      <label className="sr-only" htmlFor="enq-message">Quantity or question</label>
      <textarea id="enq-message" name="message" rows={3} maxLength={1500} placeholder="Quantity, or your question" className={`${field} resize-y`} />

      <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label htmlFor="enq-company">Company</label>
        <input id="enq-company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="flex items-start gap-3 t-small py-1">
        <input name="consent" type="checkbox" required className="mt-1 size-5 accent-[var(--ink)]" />
        <span>
          Use these details only to reply to this enquiry. See the{" "}
          <Link className="link" href="/privacy-policy">
            privacy policy
          </Link>
          .
        </span>
      </label>
      {err.consent && <p className="t-small">{err.consent}</p>}

      {state.kind === "error" && (
        <p role="alert" className="t-small">
          {state.message}
        </p>
      )}
      <button type="submit" className="btn btn-ink w-full min-h-14" disabled={state.kind === "sending"}>
        {state.kind === "sending" ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
