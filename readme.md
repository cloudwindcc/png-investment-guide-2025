# Invest South Pacific

English-first regional business and investment guide at **https://investsouthpacific.com/**, with a complete Chinese edition at `/zh/`.

Eight market guides cover Australia, New Zealand, Fiji, Papua New Guinea, Vanuatu, Samoa, Solomon Islands and Tonga. Every guide links to official sources and shows an actual editorial review date. The publisher is independent of those agencies.

## Develop and validate

Node.js 22 or later is sufficient. No third-party runtime or build dependencies are required.

```sh
npm run build
npm test
npm run dev
```

Generated HTML is committed at the repository root, retaining compatibility with the existing buildless Cloudflare Pages deployment.

```sh
npm run test:browser
node scripts/build.mjs --check
node scripts/verify.mjs --release
```

Browser checks require an installed Chromium browser. Set `BROWSER_PATH` if needed and `SCREENSHOT_DIR` to choose an output folder. They exercise responsive layouts, mobile navigation and focus, filtering, calculation, enquiry copying, resources, CSP and content without JavaScript. They never send an enquiry or submit a payment.

The release check requires all three verified live USD payment links. Until they are configured, service buttons open the enquiry path. Old HKD links must not be reused for USD offers.

## Source layout

| File | Purpose |
| --- | --- |
| `data/site.mjs` | Market copy, references, review date, translations and service descriptions |
| `data/payments.json` | Public Stripe IDs and checkout URLs, with no API credentials |
| `scripts/templates.mjs` | Shared pages, bilingual routing, metadata and schema |
| `scripts/build.mjs` | Generates 32 pages, 404, redirects, headers and discovery files |
| `assets/site.css` | Responsive styles and local system fonts |
| `assets/site.js` | Accessible navigation, filters, enquiries and analytics hooks |
| `assets/scenario.mjs` | Cash-flow model, shared by the page and independent tests |
| `scripts/verify.mjs` | Links, metadata, source provenance, routing and model checks |

## Services

Fixed-price services initially cover **Papua New Guinea**. Other markets require a quotation.

| Service | One-time price |
| --- | --- |
| One-hour telephone consultation | US$199 |
| Local company registration | US$399 |
| Full-service agency support and local resource introductions | US$999 |

Confirm scope, timing and official or third-party costs before payment. See [payment setup](docs/PAYMENTS.md) and [Cloudflare deployment](DEPLOYMENT.md).

## Search and AI discovery

The static pages include self-canonical URLs, reciprocal language alternates, descriptive titles, a canonical sitemap, semantic headings, source citations and real 404s. Schema identifies the actual publisher and mirrors visible content. Government affiliations and investment return forecasts are not invented.

`sources.json` and `llms.txt` supplement the visible source material. No special file guarantees inclusion in an AI answer. See [Google's guidance](https://developers.google.com/search/docs/appearance/ai-features).

For content updates, review the official material, change the relevant copy and actual review date, then rebuild. Do not advance review dates solely because a URL returns 200.

## Conversion measurement

The browser emits `isp:analytics` custom events and forwards them to an existing `dataLayer` if configured: `service_selected`, `checkout_click`, `enquiry_draft_opened`, `enquiry_copied`, `market_filter`, `scenario_calculated`. Enquiry fields and free-text search are omitted. No analytics provider or account ID is fabricated.

Checkout clicks measure intent. Completed payments must be verified in Stripe records or webhook events. The site does not mark a click as a successful purchase.
