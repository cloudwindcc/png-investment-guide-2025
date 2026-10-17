import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { serve } from './serve.mjs';
import { launchBrowser, pause } from './cdp.mjs';
import { getPages } from './build.mjs';
import { route } from './templates.mjs';

const output = path.resolve(process.env.SCREENSHOT_DIR || '.cache/browser-review');
await fs.mkdir(output, { recursive: true });
const { server, url } = await serve(0);
const browser = await launchBrowser();
const exceptions = [], failedResponses = [], report = [];
browser.onEvent(event => {
  if (event.method === 'Runtime.exceptionThrown') exceptions.push(event.params.exceptionDetails.exception?.description || event.params.exceptionDetails.text);
  if (event.method === 'Network.responseReceived' && event.params.response.status >= 400 && !event.params.response.url.endsWith('/favicon.ico')) failedResponses.push(event.params.response.url);
  if (event.method === 'Log.entryAdded' && event.params.entry.source === 'security' && event.params.entry.level === 'error') exceptions.push(event.params.entry.text);
});
try {
  const page = await browser.page();
  await page.call('Log.enable');
  const widths = [360, 390, 768, 1440];
  for (const width of widths) {
    await page.call('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
    const paths = width === 390 ? getPages().map(item => route(item.key, item.lang)) : ['/', '/zh/', '/markets/', '/services/', '/tools/', '/markets/papua-new-guinea/', '/research/'];
    for (const pathname of paths) {
      await page.navigate(url + pathname);
      const layout = await page.evaluate(`(() => { const root = document.documentElement; const header = document.querySelector('.site-header').getBoundingClientRect(); const h1 = document.querySelector('h1').getBoundingClientRect(); return { client: root.clientWidth, scroll: root.scrollWidth, h1Top: h1.top, headerBottom: header.bottom, overflowing: [...document.querySelectorAll('body *')].filter(e => { const r=e.getBoundingClientRect(); return r.width > 0 && (r.right > root.clientWidth + 1 || r.left < -1) }).slice(0,5).map(e=>({tag:e.tagName,cls:e.className,text:e.textContent.slice(0,45)})) }; })()`);
      assert.ok(layout.scroll <= layout.client + 1, `${pathname} at ${width}px overflows: ${JSON.stringify(layout)}`);
      assert.ok(layout.h1Top >= layout.headerBottom, `${pathname}: header overlaps h1`);
      report.push({ path: pathname, width, ...layout });
    }
  }
  await page.call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
  await page.navigate(url + '/');
  assert.equal(await page.evaluate('document.getElementById("menu-toggle").getAttribute("aria-expanded")'), 'false');
  await page.evaluate('document.getElementById("menu-toggle").click()');
  assert.equal(await page.evaluate('getComputedStyle(document.getElementById("primary-nav")).display'), 'flex');
  await page.call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape' });
  assert.equal(await page.evaluate('document.getElementById("menu-toggle").getAttribute("aria-expanded")'), 'false');
  assert.equal(await page.evaluate('document.activeElement.id'), 'menu-toggle');
  await page.navigate(url + '/markets/?sector=tourism');
  assert.ok(await page.evaluate('[...document.querySelectorAll("[data-market]:not([hidden])")].every(e=>e.dataset.sectors.includes("tourism"))'));
  await page.evaluate('document.getElementById("market-search").value="fiji"; document.getElementById("market-search").dispatchEvent(new Event("input"))');
  assert.equal(await page.evaluate('document.querySelectorAll("[data-market]:not([hidden])").length'), 1);
  await page.evaluate('document.getElementById("market-search").value="no-such-market"; document.getElementById("market-search").dispatchEvent(new Event("input"))');
  assert.equal(await page.evaluate('document.getElementById("market-empty").hidden'), false);
  await page.evaluate('document.getElementById("reset-filters").click()');
  assert.equal(await page.evaluate('document.querySelectorAll("[data-market]:not([hidden])").length'), 8);
  await page.navigate(url + '/tools/');
  const before = await page.evaluate('document.getElementById("result-npv").textContent');
  await page.evaluate('document.getElementById("scenario-capital").value="200000"; document.getElementById("scenario-capital").dispatchEvent(new Event("input",{bubbles:true}))');
  const after = await page.evaluate('document.getElementById("result-npv").textContent');
  assert.notEqual(before, after);
  assert.match(after, /99,348/);
  await page.evaluate('document.getElementById("scenario-capital").value="0"; document.getElementById("scenario-capital").dispatchEvent(new Event("input",{bubbles:true}))');
  assert.equal(await page.evaluate('document.getElementById("scenario-results").hidden'), true);
  await page.navigate(url + '/services/?market=papua-new-guinea#enquiry');
  assert.equal(await page.evaluate('document.getElementById("contact-market").value'), 'papua-new-guinea');
  await page.evaluate('document.querySelector("[data-select-plan=registration]")?.click()');
  if (await page.evaluate('Boolean(document.querySelector("[data-select-plan=registration]"))')) assert.equal(await page.evaluate('document.getElementById("contact-service").value'), 'registration');
  // Exercise the contact workflow without sending email or submitting personal data.
  await page.evaluate(`window.__copied=''; Object.defineProperty(navigator,'clipboard',{value:{writeText: async value=>{window.__copied=value}},configurable:true}); document.getElementById('contact-name').value='Browser test'; document.getElementById('contact-email').value='test@example.invalid'; document.getElementById('contact-brief').value='A local registration research enquiry for testing.'; document.getElementById('contact-consent').checked=true; document.getElementById('copy-brief').click();`);
  await pause(50);
  assert.match(await page.evaluate('window.__copied'), /Papua New Guinea/);
  assert.equal(await page.evaluate('localStorage.length + sessionStorage.length'), 0);
  for (const [pathname, width, label] of [['/', 1440, 'home-desktop'], ['/', 390, 'home-mobile'], ['/zh/', 390, 'home-zh-mobile'], ['/services/', 1440, 'services-desktop'], ['/markets/', 1440, 'markets-desktop']]) {
    await page.call('Emulation.setDeviceMetricsOverride', { width, height: width > 760 ? 1050 : 844, deviceScaleFactor: 1, mobile: false });
    await page.navigate(url + pathname);
    const screenshot = await page.call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await fs.writeFile(path.join(output, `${label}.png`), Buffer.from(screenshot.data, 'base64'));
  }
  // All primary navigation and market content remains available without JavaScript.
  await page.call('Emulation.setScriptExecutionDisabled', { value: true });
  await page.navigate(url + '/markets/');
  assert.equal(await page.evaluate('document.querySelectorAll("[data-market]:not([hidden])").length'), 8);
  await page.call('Emulation.setScriptExecutionDisabled', { value: false });
  assert.deepEqual(exceptions, [], 'No runtime or security policy errors');
  assert.deepEqual(failedResponses, [], 'No missing page resources');
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify({ layouts: report, interactions: ['mobile menu + Escape focus', 'sector/search/empty/reset filters', 'cash-flow update + invalid input', 'market-prefilled enquiry + clipboard', 'no PII in browser storage', 'crawlable content without JS'], exceptions, failedResponses }, null, 2));
  console.log(`PASS: ${report.length} responsive page layouts, menu, filters, calculator, enquiry, progressive enhancement, no runtime/CSP/resource errors. Screenshots: ${output}`);
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
