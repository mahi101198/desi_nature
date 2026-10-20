# Search Console, Bing and analytics

Nothing below is done yet: each step needs the owner's Google/Microsoft account. The code is ready for all of it.

## Google Search Console (do this first, after the domain is live)

Recommended: **Domain property** verified by DNS (covers http/https and www).

1. search.google.com/search-console → Add property → Domain → `desinature.in`.
2. Google shows a TXT record like `google-site-verification=...`. In GoDaddy → My Products → desinature.in → DNS → Add record: Type `TXT`, Name `@`, Value = the string Google shows, TTL default. Save.
3. Back in Search Console, click Verify (DNS can take from minutes to a few hours).
4. Sitemaps → submit `https://desinature.in/sitemap.xml`.
5. After each publication: URL inspection → paste the article URL → Request indexing.

Alternative (URL-prefix property, HTML tag): copy only the `content="..."` value into the Vercel environment variable `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (Production), redeploy, then verify.

Being in the sitemap or deployed does **not** mean a page is indexed. Check Pages → Indexing and URL inspection. Rich results are never guaranteed; use the Rich Results Test to check structured data is valid.

Reporting: Performance → Search results (queries, pages, clicks, impressions, CTR, position). Export monthly. The Search Console API can be connected later with a Google Cloud service account given read access to the property; not set up in this version.

## Bing Webmaster Tools

bing.com/webmasters → Import from Google Search Console (easiest), or add the site and put the `msvalidate.01` code in `NEXT_PUBLIC_BING_SITE_VERIFICATION`. Submit the sitemap. Bing data also feeds some other search engines.

## Analytics

**Vercel Web Analytics** (already in the code, cookie-free): Vercel → Project → Analytics → Enable. The Hobby plan includes a limited monthly event allowance; custom events (enquiry tracking) need a paid plan.

**Google Analytics 4** (optional): create a property, copy the Measurement ID `G-...` into `NEXT_PUBLIC_GA_MEASUREMENT_ID` (Production). GA loads only in production and only after the visitor accepts the cookie notice. Events sent: `enquiry_submit` (food, channel), `whatsapp_click` (placement), `article_cta_click`. No names, numbers, emails or messages are ever sent. Mark `enquiry_submit` as a key event in GA4 to count leads.

Privacy: the privacy policy already describes both. If you enable GA4, review the policy wording and keep the consent notice. India's DPDP Act 2023 applies to personal data from enquiries; collect only what is needed to reply.

## Lead tracking without paid tools

Enquiries go to `ENQUIRY_WEBHOOK_URL`. A free option is a Google Apps Script web app bound to a Google Sheet:

```js
// Extensions → Apps Script in a new Google Sheet. Deploy → New deployment → Web app,
// execute as you, access "Anyone". Put the URL in ENQUIRY_WEBHOOK_URL on Vercel.
function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  SpreadsheetApp.getActiveSheet().appendRow([d.receivedAt, d.product, d.name, d.phone, d.email, d.pincode, d.message]);
  return ContentService.createTextOutput("ok");
}
```

Set notifications in the Sheet (Tools → Notification settings) to get an email per enquiry. Restrict who can open the Sheet; delete rows older than 12 months as the privacy policy says. Until a webhook is set, the form offers the same message by WhatsApp or email (if those are configured) instead of losing it.
