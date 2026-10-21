"use client";

import { ArrowRight, CircleCheck, Loader2, Mail, MessageCircle } from "lucide-react";
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
  "block w-full min-h-12 rounded-xl border border-line bg-bg px-4 py-3 text-ink placeholder:text-ink-3 transition-colors focus:border-leaf focus:bg-white focus:outline-none focus:ring-4 focus:ring-leaf/15 aria-[invalid=true]:border-clay";
const labelCls = "mb-1.5 block text-sm font-bold text-ink";
const errCls = "mt-1.5 text-sm font-semibold text-clay";

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
      <div role="status" className="flex flex-col items-start gap-3 py-6">
        <CircleCheck className="size-12 text-leaf" aria-hidden="true" />
        <p className="font-display text-2xl">Thank you — your enquiry has reached us.</p>
        <p className="muted">We reply with the source, batch details and price before you decide anything.</p>
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
      <div role="status" className="flex flex-col gap-4">
        <p className="font-display text-2xl">Almost there — send it with one tap</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          {wa && (
            <a
              className="btn flex-1"
              href={wa}
              target="_blank"
              rel="noopener"
              onClick={() => track({ name: "enquiry_submit", params: { product: "form-fallback", channel: "whatsapp" } })}
            >
              <MessageCircle className="size-4" aria-hidden="true" /> Send on WhatsApp
            </a>
          )}
          {mail && (
            <a
              className="btn btn-ghost flex-1"
              href={mail}
              onClick={() => track({ name: "enquiry_submit", params: { product: "form-fallback", channel: "email" } })}
            >
              <Mail className="size-4" aria-hidden="true" /> Send by email
            </a>
          )}
        </div>
        {!wa && !mail && (
          <p className="muted">
            Our enquiry inbox is being set up. Please copy your message below and check back soon, or see the{" "}
            <Link className="link" href="/contact">
              contact page
            </Link>
            .
          </p>
        )}
        <pre className="whitespace-pre-wrap rounded-xl bg-bg-2 p-4 font-sans text-sm">{state.text}</pre>
      </div>
    );
  }

  const err = state.kind === "error" ? state.fields ?? {} : {};
  return (
    <form onSubmit={onSubmit} onFocus={markOpened} onPointerDown={markOpened} noValidate className="flex flex-col gap-5">
      <fieldset>
        <legend className={labelCls}>What are you looking for?</legend>
        <div className="grid grid-cols-2 gap-2">
          {ENQUIRY_PRODUCTS.map((p) => (
            <label
              key={p}
              className={`flex min-h-12 cursor-pointer items-center justify-center rounded-xl border px-3 text-center text-sm font-bold transition-all ${
                product === p ? "border-forest bg-forest text-white shadow-[var(--shadow)]" : "border-line bg-bg text-ink-2 hover:border-[#d6ccbc] hover:bg-white"
              }`}
            >
              <input type="radio" name="product" value={p} checked={product === p} onChange={() => setProduct(p)} className="sr-only" />
              {LABELS[p]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="enq-name">Your name</label>
          <input id="enq-name" name="name" required autoComplete="name" placeholder="e.g. Asha Rao" className={field} aria-invalid={!!err.name} />
          {err.name && <p className={errCls}>{err.name}</p>}
        </div>
        <div>
          <label className={labelCls} htmlFor="enq-phone">Phone or WhatsApp</label>
          <input id="enq-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+91" className={field} aria-invalid={!!err.phone} />
          {err.phone && <p className={errCls}>{err.phone}</p>}
        </div>
        <div>
          <label className={labelCls} htmlFor="enq-email">
            Email <span className="font-semibold text-ink-3">(optional)</span>
          </label>
          <input id="enq-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" className={field} aria-invalid={!!err.email} />
          {err.email && <p className={errCls}>{err.email}</p>}
        </div>
        <div>
          <label className={labelCls} htmlFor="enq-pin">Delivery pin code</label>
          <input id="enq-pin" name="pincode" inputMode="numeric" autoComplete="postal-code" maxLength={6} placeholder="6 digits" className={field} aria-invalid={!!err.pincode} />
          {err.pincode && <p className={errCls}>{err.pincode}</p>}
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="enq-message">Quantity or question</label>
        <textarea id="enq-message" name="message" rows={3} maxLength={1500} placeholder="e.g. 1 kg of ghee every month — what are the options?" className={`${field} resize-y`} />
      </div>

      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="enq-company">Company</label>
        <input id="enq-company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="flex items-start gap-3 text-sm text-ink-2">
        <input name="consent" type="checkbox" required className="mt-0.5 size-5 shrink-0 accent-[var(--forest)]" />
        <span>
          Use these details only to reply to this enquiry. See the{" "}
          <Link className="link" href="/privacy-policy">
            privacy policy
          </Link>
          .
        </span>
      </label>
      {err.consent && <p className={errCls}>{err.consent}</p>}

      {state.kind === "error" && (
        <p role="alert" className="rounded-xl bg-[#fbe9e2] px-4 py-3 text-sm font-semibold text-clay">
          {state.message}
        </p>
      )}
      <button type="submit" className="btn btn-lg w-full" disabled={state.kind === "sending"}>
        {state.kind === "sending" ? (
          <>
            <Loader2 className="size-5 animate-spin" aria-hidden="true" /> Sending…
          </>
        ) : (
          <>
            Send enquiry <ArrowRight className="size-5" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}
