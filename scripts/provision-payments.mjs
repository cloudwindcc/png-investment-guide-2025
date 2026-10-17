import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Explicit operator command, never invoked by a site build or page request.
const execute = process.argv.includes('--execute');
const expectedAccount = process.argv.find(value => value.startsWith('--account='))?.slice('--account='.length);
const executable = process.env.STRIPE_CLI_PATH || 'stripe';
const file = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../data/payments.json');
const config = JSON.parse(await fs.readFile(file, 'utf8'));
const definitions = {
  consultation: { name: 'Papua New Guinea - One-hour Telephone Consultation', description: 'One-hour telephone consultation for Papua New Guinea business and investment questions. Agree the appointment, language and topic before payment.' },
  registration: { name: 'Papua New Guinea - Company Registration', description: 'Local company registration service for Papua New Guinea. Confirm eligibility, required documents, filing scope and any official or third-party costs before payment.' },
  representation: { name: 'Papua New Guinea - Agency Support and Local Connections', description: 'Full-service agency support and local resource introductions in Papua New Guinea. Agree the project scope, delivery plan and any third-party costs before payment.' }
};

if (!execute) {
  console.log('Dry run. This command would create or verify three live, one-time USD products and payment links:');
  for (const [id, spec] of Object.entries(definitions)) console.log(`${id}: ${spec.name} — USD ${(config.plans[id].amount / 100).toFixed(2)}`);
  console.log('After owner authorization, set STRIPE_CLI_PATH if needed and pass --execute --account=acct_EXPECTED. No API keys belong in arguments or the repository.');
  process.exit(0);
}
if (!/^acct_[A-Za-z0-9]+$/.test(expectedAccount || '')) throw new Error('Supply the expected existing merchant account as --account=acct_...');
function stripe(args) {
  const stdout = execFileSync(executable, [...args, '--live', '--color=off'], { encoding: 'utf8', windowsHide: true, timeout: 45000, stdio: ['ignore', 'pipe', 'pipe'] });
  const value = JSON.parse(stdout);
  if (value.error) throw new Error(`${value.error.type}: ${value.error.message}`);
  return value;
}
const account = stripe(['get', '/v1/account']);
if (account.id !== expectedAccount) throw new Error(`Connected account ${account.id} does not match the expected merchant. No products were created.`);
config.merchantId = account.id;
if (config.currency !== 'usd' || config.mode !== 'live') throw new Error('This provisioning command only supports the approved live USD offers.');
async function save() { await fs.writeFile(file, JSON.stringify(config, null, 2) + '\n'); }
console.log(`Verified merchant ${account.id}; provisioning the owner-approved USD offers.`);

for (const [id, definition] of Object.entries(definitions)) {
  const state = config.plans[id];
  if (!state.productId) {
    const product = stripe(['products', 'create', '--name', definition.name, '--description', definition.description, '-d', 'default_price_data[currency]=usd', '-d', `default_price_data[unit_amount]=${state.amount}`, '-d', 'metadata[site]=investsouthpacific', '-d', `metadata[service]=${id}`, '-d', 'metadata[market]=papua-new-guinea', '--idempotency', `isp-png-${id}-usd-product-v1`, '--confirm']);
    if (!product.livemode || !product.active || !product.default_price) throw new Error(`Unexpected product response for ${id}`);
    state.productId = product.id;
    state.priceId = typeof product.default_price === 'string' ? product.default_price : product.default_price.id;
    await save();
  }
  const price = stripe(['get', `/v1/prices/${state.priceId}`]);
  if (!price.livemode || !price.active || price.currency !== 'usd' || price.unit_amount !== state.amount || price.recurring !== null || price.product !== state.productId) throw new Error(`Price validation failed for ${id}.`);
  if (!state.paymentLinkId) {
    const link = stripe(['payment_links', 'create', '-d', `line_items[0][price]=${state.priceId}`, '-d', 'line_items[0][quantity]=1', '-d', 'currency=usd', '-d', 'after_completion[type]=hosted_confirmation', '-d', `after_completion[hosted_confirmation][custom_message]=Thank you for choosing Invest South Pacific. Please email info@cloudwindai.com with your payment confirmation to arrange your Papua New Guinea service. Include your agreed scope or booking reference.`, '-d', 'metadata[site]=investsouthpacific', '-d', `metadata[service]=${id}`, '-d', 'metadata[market]=papua-new-guinea', '-d', `payment_intent_data[metadata][service]=${id}`, '--idempotency', `isp-png-${id}-usd-link-v1`, '--confirm']);
    if (!link.livemode || !link.active || link.currency !== 'usd') throw new Error(`Unexpected payment link response for ${id}`);
    state.paymentLinkId = link.id;
    state.url = link.url;
    await save();
  }
  const link = stripe(['get', `/v1/payment_links/${state.paymentLinkId}`]);
  const lines = stripe(['get', `/v1/payment_links/${state.paymentLinkId}/line_items`]);
  if (!link.active || !link.livemode || link.currency !== 'usd' || lines.data.length !== 1 || lines.data[0].price.id !== state.priceId || lines.data[0].quantity !== 1) throw new Error(`Payment link validation failed for ${id}`);
  state.url = link.url;
  await save();
  console.log(JSON.stringify({ service: id, amount: state.amount / 100, currency: 'USD', productId: state.productId, priceId: state.priceId, url: state.url, live: true }));
}
