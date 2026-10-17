import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };

export async function serve(port = 4173) {
  const redirects = (await fs.readFile(path.join(root, '_redirects'), 'utf8')).split('\n').map(line => line.trim().split(/\s+/)).filter(parts => parts.length === 3 && parts[0].startsWith('/') && !parts[0].includes('*'));
  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      const pathname = decodeURIComponent(url.pathname);
      const redirect = redirects.find(([source]) => source === pathname);
      if (redirect) {
        response.writeHead(Number(redirect[2]), { Location: redirect[1] + url.search });
        return response.end();
      }
      const relative = pathname.replace(/^\/+/, '');
      if (relative.split('/').some(part => part.startsWith('.')) || /^(data|scripts|docs)\//.test(relative)) {
        response.writeHead(404, { 'Content-Type': types['.html'] });
        return response.end(await fs.readFile(path.join(root, '404.html')));
      }
      let file = path.resolve(root, relative || 'index.html');
      if (file !== root && !file.startsWith(root + path.sep)) { response.writeHead(403); return response.end(); }
      let stat;
      try { stat = await fs.stat(file); } catch {}
      if (stat?.isDirectory()) {
        if (!pathname.endsWith('/')) { response.writeHead(301, { Location: pathname + '/' + url.search }); return response.end(); }
        file = path.join(file, 'index.html');
      }
      let body;
      try { body = await fs.readFile(file); } catch {
        response.writeHead(404, { 'Content-Type': types['.html'], 'X-Robots-Tag': 'noindex' });
        return response.end(await fs.readFile(path.join(root, '404.html')));
      }
      response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
      response.setHeader('X-Content-Type-Options', 'nosniff');
      response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      // Local HTTP deliberately omits upgrade-insecure-requests.
      response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self' mailto:; frame-ancestors 'none'");
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch (error) { response.writeHead(500); response.end(error.message); }
  });
  await new Promise(resolve => server.listen(port, '127.0.0.1', resolve));
  return { server, url: `http://127.0.0.1:${server.address().port}` };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { url } = await serve(Number(process.env.PORT || 4173));
  console.log(`Local: ${url}`);
}
