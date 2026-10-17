# Cloudflare Pages deployment

Primary production hostname: **investsouthpacific.com**.

The repository includes the generated static site at its root. Keep the existing Pages root-output configuration, or explicitly configure:

- Production branch: `main`
- Build command: `npm run build && npm test`
- Output directory: `.`
- Node version: 22 or later

No environment variables, API credentials or package installation are required to render the site. Generated pages are committed, preserving the current buildless deployment.

## Review and release

Use a `codex/` branch and a pull request against `main`. Review the Cloudflare branch preview. Merge only after owner approval; do not push this work directly to production.

```sh
npm run build
npm test
npm run test:browser
node scripts/build.mjs --check
node scripts/verify.mjs --release
```

The last command requires three configured USD payment links. Verify their live status, merchant, exact service, one-time amount and currency in Stripe before release.

## Routing

- `/` is English, `/zh/` Chinese; each market has both editions.
- `_redirects` maps former URLs to relevant permanent destinations.
- Unknown paths use `404.html` with a 404 status. Do not restore the old catch-all homepage rewrite.
- The production `pages.dev` hostname redirects to the primary domain; branch and hash previews remain available.
- The www redirect requires a separate `www.investsouthpacific.com` Pages binding and DNS record before it can receive requests.

Check `/`, `/zh/`, `/markets/`, `/services/`, `/robots.txt`, `/sitemap.xml` and a missing URL on preview and after approved publication. Sitemap URLs must use the current primary domain.

## Payments and infrastructure

Stripe hosts checkout. The contact form opens an email draft or copies text; it does not claim to submit mail through a server. See `docs/PAYMENTS.md`.

CSP currently permits local resources; checkout uses normal navigation. If adding an analytics provider, update the privacy notice and extend CSP only for its verified resources.
