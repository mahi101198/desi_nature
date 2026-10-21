import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { JsonLd } from "@/components/JsonLd";
import { RevealScript } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteConfig } from "@/config/site";
import { getSiteEnv } from "@/lib/env";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const isProduction = getSiteEnv() === "production";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name} — ${siteConfig.tagline}`, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  // Preview and development deployments must never be indexed.
  robots: isProduction ? { index: true, follow: true } : { index: false, follow: false },
  verification: {
    ...(siteConfig.verification.google ? { google: siteConfig.verification.google } : {}),
    ...(siteConfig.verification.bing ? { other: { "msvalidate.01": siteConfig.verification.bing } } : {}),
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#fbf8f2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${fraunces.variable} ${manrope.variable}`} suppressHydrationWarning>
      <body className="min-h-svh flex flex-col">
        <RevealScript />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <Analytics />
      </body>
    </html>
  );
}
