# USD service payments

The owner approved these **one-time USD** prices for **Papua New Guinea**. Other markets require a quotation.

| ID | Service | Amount in cents |
| --- | --- | --- |
| `consultation` | One-hour telephone consultation | 19900 |
| `registration` | Local company registration | 39900 |
| `representation` | Full-service agency support and local resource introductions | 99900 |

Confirm scope, schedule and any official or third-party costs before purchase.

## Activate checkout

Use a separate live product, a one-time USD price and a Payment Link for each service in the existing merchant account. Never substitute an HKD price for a USD offer.

Store the resulting **public IDs and URLs** in `data/payments.json`. No API keys, OAuth tokens or CLI credentials belong in the repository. The renderer turns a service-request button into a Stripe checkout button when its validated hosted URL is present.

The official CLI supports a browser authorisation flow completed by the account owner. [Stripe login documentation](https://docs.stripe.com/cli/login)

`node scripts/provision-payments.mjs` previews the three offers without writing to Stripe. After authorisation, an explicit `--execute --account=acct_EXPECTED` creates the approved live offers, verifies amounts and one-time prices, and records public IDs. Set `STRIPE_CLI_PATH` when the CLI is not on PATH. The command rejects a different account and persists partial progress so it can resume safely.

Use a hosted confirmation message with `info@cloudwindai.com`, the purchased service and instructions for arranging the appointment or next step. This avoids depending on an undeployed success page before PR approval.

```sh
npm run build
npm test
node scripts/verify.mjs --release
npm run test:browser
```

Open each hosted checkout and verify live status, merchant, service, USD amount and one-time payment without entering card details or placing an order.

## Attribution and fulfilment

- Checkout anchors work without JavaScript and carry service-specific UTM and `client_reference_id` labels without enquiry or personal details. [Stripe parameter documentation](https://docs.stripe.com/payment-links/url-parameters)
- The site emits `checkout_click` for intent; paid orders come from Stripe records or a verified `checkout.session.completed` webhook. Some methods confirm asynchronously.
- Enquiry forms prepare an email or copy text. Visitors send the email themselves.
- Legacy HKD products are not automatically deactivated while the existing production site may still use them. The new site only accepts new USD offers in its checkout configuration.
