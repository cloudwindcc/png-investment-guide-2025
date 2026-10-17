import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { site, markets } from '../data/site.mjs';
import { document, home, marketIndex, marketPage, servicesPage, researchPage, toolsPage, aboutPage, policyPage, notFound, route, escape } from './templates.mjs';
import { renderMap } from './map.mjs';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function getPages() {
  const pages = [];
  for (const lang of ['en', 'zh']) {
    for (const [key, render] of [['', home], ['markets', marketIndex], ['services', servicesPage], ['research', researchPage], ['tools', toolsPage], ['about', aboutPage]]) pages.push({ key, lang, ...render(lang) });
    for (const kind of ['privacy', 'terms']) pages.push({ key: kind, lang, ...policyPage(kind, lang) });
    for (const market of markets) pages.push({ key: `markets/${market.id}`, lang, ...marketPage(market, lang) });
  }
  return pages;
}

export async function build() {
  const check = process.argv.includes('--check');
  const versions = {};
  for (const [key, file] of [['css', 'assets/site.css'], ['js', 'assets/site.js']]) versions[key] = createHash('sha256').update(await fs.readFile(path.join(root, file))).digest('hex').slice(0, 10);
  const files = new Map();
  files.set('assets/pacific-map.svg', await renderMap());
  const pages = getPages();
  for (const page of pages) files.set(`${route(page.key, page.lang).slice(1)}index.html`, document(page, page.key, page.lang, versions));
  files.set('404.html', document(notFound(), '', 'en', versions));
  const sitemap = pages.map(page => `  <url><loc>${site.origin + route(page.key, page.lang)}</loc><lastmod>${site.reviewed}</lastmod><xhtml:link rel="alternate" hreflang="en" href="${site.origin + route(page.key, 'en')}"/><xhtml:link rel="alternate" hreflang="zh-CN" href="${site.origin + route(page.key, 'zh')}"/><xhtml:link rel="alternate" hreflang="x-default" href="${site.origin + route(page.key, 'en')}"/></url>`).join('\n');
  files.set('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${sitemap}\n</urlset>\n`);
  files.set('robots.txt', `User-agent: *\nAllow: /\nDisallow: /scripts/\nDisallow: /data/\nDisallow: /docs/\nDisallow: /.claude/\nDisallow: /.github/\nDisallow: /*.md$\n\nSitemap: ${site.origin}/sitemap.xml\n`);
  const sourceData = { publisher: site.name, canonical: site.origin, reviewed: site.reviewed, methodology: `${site.origin}/research/`, markets: markets.map(m => ({ name: m.en, url: site.origin + route(`markets/${m.id}`, 'en'), summary: m.summary[0], officialSources: [m.source, m.extraSource].filter(Boolean), sourceReviewed: site.reviewed })) };
  files.set('sources.json', JSON.stringify(sourceData, null, 2) + '\n');
  files.set('llms.txt', `# Invest South Pacific\n\n> Independent South Pacific business and investment information, with English-first market guides and a Chinese edition.\n\nCanonical site: ${site.origin}/\nSource review date: ${site.reviewed}. This is an editorial review date, not a live data feed.\n\n## Market guides\n\n${markets.map(m => `- [${m.en}](${site.origin + route(`markets/${m.id}`, 'en')}): ${m.summary[0]}`).join('\n')}\n\n## Research and services\n\n- [Official sources and review method](${site.origin}/research/)\n- [Business services and USD pricing](${site.origin}/services/)\n- [Cash-flow scenario planner](${site.origin}/tools/): Calculates user-supplied assumptions, not forecast investment returns.\n- [About the publisher](${site.origin}/about/): Independent; government links do not imply affiliation.\n- [Chinese edition](${site.origin}/zh/)\n- [Structured source directory](${site.origin}/sources.json)\n\nFor current project-specific rules, use the official sources linked on each market guide. Service availability and scope are confirmed before booking.\n`);
  files.set('_redirects', `# Hostname redirects require Cloudflare account-level rules.\n# Existing public URLs retain useful destinations.\n/index.html / 301\n/index-en.html / 301\n/index-en / 301\n/investSouthPacific.html / 301\n/investSouthPacific / 301\n/zh/index.html /zh/ 301\n/additional-projects-optimized.html /markets/papua-new-guinea/ 301\n/additional-projects-optimized /markets/papua-new-guinea/ 301\n/additional-projects.html /markets/papua-new-guinea/ 301\n/additional-projects /markets/papua-new-guinea/ 301\n/ultimate-enhanced.html /markets/papua-new-guinea/ 301\n/ultimate-enhanced /markets/papua-new-guinea/ 301\n/beautiful-version.html /research/ 301\n/beautiful-version /research/ 301\n/seo-optimized.html /markets/papua-new-guinea/ 301\n/seo-optimized /markets/papua-new-guinea/ 301\n`);
  files.set('_headers', `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self' mailto:; frame-ancestors 'none'; upgrade-insecure-requests\n\n/assets/*\n  Cache-Control: public, max-age=3600, must-revalidate\n\n/assets/site.js\n  Cache-Control: public, max-age=0, must-revalidate\n\n/assets/scenario.mjs\n  Cache-Control: public, max-age=0, must-revalidate\n\n/404.html\n  X-Robots-Tag: noindex\n\n/*.md\n  X-Robots-Tag: noindex\n\n/scripts/*\n  X-Robots-Tag: noindex\n\n/data/*\n  X-Robots-Tag: noindex\n\n/sources.json\n  Content-Type: application/json; charset=utf-8\n\n/llms.txt\n  Content-Type: text/plain; charset=utf-8\n`);
  let changed = 0;
  for (const [relative, content] of files) {
    const file = path.join(root, relative);
    let previous;
    try { previous = await fs.readFile(file, 'utf8'); } catch {}
    if (previous !== content) {
      if (check) throw new Error(`Generated file is stale: ${relative}. Run npm run build.`);
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, content);
      changed++;
    }
  }
  console.log(`${check ? 'Verified' : 'Built'} ${pages.length} bilingual pages + 404 and discovery files (${changed} changed).`);
  return pages;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build();
