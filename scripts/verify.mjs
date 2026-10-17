import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { root, getPages } from './build.mjs';
import { site, markets, plans } from '../data/site.mjs';
import { route } from './templates.mjs';
import { calculateScenario } from '../assets/scenario.mjs';
import { serve } from './serve.mjs';
import paymentConfig from '../data/payments.json' with { type: 'json' };

const pages = getPages();
const decode = text => text.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
const documents = new Map();
for (const page of pages) documents.set(route(page.key, page.lang), await fs.readFile(path.join(root, route(page.key, page.lang), 'index.html'), 'utf8'));
const ids = new Map([...documents].map(([url, html]) => [url, [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1])]));
let linksChecked = 0;
const titles = new Set();
for (const [url, html] of documents) {
  const page = pages.find(item => route(item.key, item.lang) === url);
  const label = `Page ${url}`;
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${label}: exactly one h1`);
  assert.match(html, new RegExp(`<html lang="${page.lang === 'zh' ? 'zh-CN' : 'en'}"`), `${label}: document language`);
  assert.equal(new Set(ids.get(url)).size, ids.get(url).length, `${label}: unique IDs`);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  assert.ok(title && !titles.has(title), `${label}: descriptive unique title`);
  titles.add(title);
  assert.match(html, /<meta name="description" content="[^"]{20,}"/);
  assert.ok(html.includes(`<link rel="canonical" href="${site.origin + url}">`), `${label}: self canonical`);
  for (const lang of ['en', 'zh']) assert.ok(html.includes(`hreflang="${lang === 'zh' ? 'zh-CN' : 'en'}" href="${site.origin + route(page.key, lang)}"`), `${label}: reciprocal language URL`);
  assert.doesNotMatch(html, /pnginvestor\.com|investpng\.com|yourwebsite\.com|2025|GA_MEASUREMENT_ID|pk_live_|buy_btn_/i, `${label}: no stale branding, dated claims or legacy payment embeds`);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)[1]);
  assert.ok(schema['@graph'].some(entity => entity['@type'] === 'Organization' && entity.url === site.origin + '/'), `${label}: publisher identity`);
  for (const entity of schema['@graph']) if (entity['@type'] === 'Service') {
    assert.equal(entity.offers.priceCurrency, 'USD');
    assert.equal(entity.areaServed.name, 'Papua New Guinea');
    assert.ok([199, 399, 999].includes(entity.offers.price));
  }
  for (const match of html.matchAll(/<(?:a|link|script|img)\b[^>]*?\b(?:href|src)="([^"]+)"/g)) {
    const target = new URL(decode(match[1]), site.origin + url);
    if (target.origin !== site.origin) {
      assert.ok(['https:', 'mailto:'].includes(target.protocol), `${label}: secure external link`);
      continue;
    }
    const destination = target.pathname;
    if (documents.has(destination)) {
      if (target.hash) assert.ok(ids.get(destination).includes(decodeURIComponent(target.hash.slice(1))), `${label}: missing anchor ${destination}${target.hash}`);
    } else {
      assert.ok(!target.hash, `${label}: unexpected non-document anchor`);
      await fs.access(path.join(root, destination));
    }
    linksChecked++;
  }
}

const sitemap = await fs.readFile(path.join(root, 'sitemap.xml'), 'utf8');
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert.equal(locations.length, documents.size);
assert.equal(new Set(locations).size, locations.length);
for (const url of documents.keys()) assert.ok(locations.includes(site.origin + url));
const robots = await fs.readFile(path.join(root, 'robots.txt'), 'utf8');
assert.ok(robots.includes(`Sitemap: ${site.origin}/sitemap.xml`));
assert.doesNotMatch(robots, /sitemap-index\.xml/);
assert.equal((documents.get('/markets/').match(/data-market data-name=/g) || []).length, markets.length);
for (const market of markets) assert.ok(documents.get(`/markets/${market.id}/`).includes(market.source), `Official source for ${market.id}`);
const css = await fs.readFile(path.join(root, 'assets/site.css'), 'utf8');
const definitions = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map(match => match[1]));
for (const match of css.matchAll(/var\(\s*(--[\w-]+)/g)) assert.ok(definitions.has(match[1]), `Undefined CSS variable ${match[1]}`);
assert.ok(Buffer.byteLength(css) < 60000, 'Shared CSS budget < 60 KB uncompressed');
const js = await fs.readFile(path.join(root, 'assets/site.js'), 'utf8');
assert.doesNotMatch(js, /localStorage|sessionStorage|innerHTML|eval\(/, 'No PII storage or HTML injection');
assert.deepEqual(plans.map(plan => [plan.amount, plan.currency]), [[199, 'USD'], [399, 'USD'], [999, 'USD']]);
assert.equal(paymentConfig.currency, 'usd');
assert.equal(paymentConfig.serviceMarket, 'Papua New Guinea');
for (const plan of plans) {
  const payment = paymentConfig.plans[plan.id];
  assert.equal(payment.amount, plan.amount * 100, `${plan.id}: price and checkout config agree`);
  if (payment.url) {
    assert.equal(paymentConfig.mode, 'live');
    assert.match(payment.url, /^https:\/\/buy\.stripe\.com\/(?!test_)[A-Za-z0-9]+$/);
    assert.match(payment.productId, /^prod_/);
    assert.match(payment.priceId, /^price_/);
    assert.match(payment.paymentLinkId, /^plink_/);
  }
}
const missingPayments = plans.filter(plan => !plan.checkout);
if (process.argv.includes('--release')) assert.equal(missingPayments.length, 0, 'Release requires all three verified USD Stripe links');

// Independent expected values and edge cases for the cash-flow model.
const sample = calculateScenario({ capital: 100000, cashflow: 15000, years: 10, discount: 8 });
assert.ok(Math.abs(sample.npv - 651.220984) < 0.01);
assert.equal(sample.yieldPercent, 15);
assert.ok(Math.abs(sample.payback - 6.6666666667) < 1e-9);
assert.deepEqual(calculateScenario({ capital: 100, cashflow: 20, years: 5, discount: 0 }), { yieldPercent: 20, payback: 5, npv: 0 });
assert.equal(calculateScenario({ capital: 100, cashflow: 10, years: 5, discount: 0 }).payback, null);
assert.deepEqual(calculateScenario({ capital: 100, cashflow: -10, years: 2, discount: 0 }), { yieldPercent: -10, payback: null, npv: -120 });
assert.equal(calculateScenario({ capital: 100, cashflow: 0, years: 5, discount: 10 }).npv, -100);
for (const invalid of [{ capital: 0 }, { years: 1.5 }, { years: 0 }, { discount: -1 }, { cashflow: NaN }]) assert.throws(() => calculateScenario({ capital: 100, cashflow: 10, years: 5, discount: 8, ...invalid }), RangeError);

const { server, url: local } = await serve(0);
try {
  for (const url of documents.keys()) assert.equal((await fetch(local + url)).status, 200, `${url}: HTTP 200`);
  for (const missing of ['/audit-nonexistent-page', '/images/logo.png']) assert.equal((await fetch(local + missing)).status, 404, `${missing}: real 404`);
  for (const [old, expected] of [['/index-en.html', '/'], ['/investSouthPacific.html', '/'], ['/additional-projects-optimized.html', '/markets/papua-new-guinea/']]) {
    const response = await fetch(local + old, { redirect: 'manual' });
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('location'), expected);
  }
} finally { await new Promise(resolve => server.close(resolve)); }
console.log(`PASS: ${documents.size} pages, ${linksChecked} internal links/assets, language/canonical/schema, source provenance, CSS budget, redirects, real 404s and financial model edge cases.`);
if (missingPayments.length) console.log(`RELEASE NOTE: ${missingPayments.length} USD checkout links await configuration; service requests use the working email enquiry path.`);
