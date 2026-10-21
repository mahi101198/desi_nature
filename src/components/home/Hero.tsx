import { ArrowRight, BookOpenCheck, Leaf, ShieldCheck, Wallet } from "lucide-react";
import Link from "next/link";
import { Visual } from "../Visual";
import { SeasonChip } from "./SeasonCalendar";

const promises = [
  { icon: ShieldCheck, text: "Source and batch details with every reply" },
  { icon: Wallet, text: "No payment until you confirm" },
  { icon: BookOpenCheck, text: "Every guide lists its sources" },
];

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="bg-hero relative overflow-hidden">
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="container-x relative grid items-center gap-12 pb-16 pt-10 sm:pt-14 lg:grid-cols-12 lg:gap-10 lg:pb-24 lg:pt-20">
        <div className="reveal-stagger lg:col-span-6">
          <span className="pill">
            <Leaf className="size-4" aria-hidden="true" /> Farm to home · sourced by season
          </span>
          <h1 id="hero-title" className="display mt-6">
            Farm-fresh ghee, honey &amp; grains, <span className="text-leaf italic">honestly sourced.</span>
          </h1>
          <p className="lead mt-6 max-w-xl">
            Desi Nature brings food from Indian farms to your kitchen. Ask what&apos;s in stock and we reply with where it
            comes from, the batch details and the price, before you pay anything.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="btn btn-lg">
              Ask what&apos;s in stock <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
            <Link href="/products" className="btn btn-ghost btn-lg">
              Explore farm foods
            </Link>
          </div>
          <ul className="mt-10 grid gap-3 sm:grid-cols-3">
            {promises.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2.5 text-[0.95rem] font-semibold text-ink-2">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-leaf-soft text-forest">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative lg:col-span-6">
          <div className="grid grid-cols-5 grid-rows-6 gap-3 sm:gap-4 h-[440px] sm:h-[540px]">
            <Visual
              photo="hero-ghee"
              art="ghee"
              alt="A jar of golden ghee with a steel spoon"
              priority
              className="col-span-3 row-span-6 rounded-[28px] shadow-[var(--shadow-lg)]"
            />
            <Visual
              photo="hero-honey"
              art="honey"
              alt="A jar of honey with a wooden dipper"
              className="col-span-2 row-span-3 rounded-[24px] shadow-[var(--shadow)]"
            />
            <Visual
              photo="hero-grains"
              art="grains"
              alt="A jute sack of wheat with ears of grain"
              className="col-span-2 row-span-3 rounded-[24px] shadow-[var(--shadow)]"
            />
          </div>
          <div className="float absolute -bottom-6 left-4 w-64 rounded-2xl border border-line bg-white/95 p-4 shadow-[var(--shadow-lg)] backdrop-blur sm:left-[-1.5rem]">
            <SeasonChip initialMonth={new Date().getMonth()} />
          </div>
          <div className="float-slow absolute -top-4 right-4 hidden rounded-full bg-forest px-4 py-2 text-sm font-bold text-white shadow-[var(--shadow-lg)] sm:block">
            Enquiry-first · no cart, no guesswork
          </div>
        </div>
      </div>
    </section>
  );
}
