import { spawn } from 'node:child_process';
import { mkdtemp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

export const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function launchBrowser() {
  const executable = process.env.BROWSER_PATH || [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome'
  ].find(existsSync);
  if (!executable) throw new Error('Set BROWSER_PATH to a Chromium browser executable.');
  const profile = await mkdtemp(path.join(tmpdir(), 'south-pacific-browser-'));
  const child = spawn(executable, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
  let ws;
  try {
    const endpoint = await new Promise((resolve, reject) => {
      let output = '';
      const timer = setTimeout(() => reject(new Error('Browser startup timeout')), 15000);
      child.stderr.on('data', data => {
        output += data;
        const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/);
        if (match) { clearTimeout(timer); resolve(match[1]); }
      });
      child.once('error', error => { clearTimeout(timer); reject(error); });
    });
    ws = new WebSocket(endpoint);
    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
    let sequence = 0;
    const pending = new Map();
    const listeners = new Set();
    ws.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const item = pending.get(message.id);
        if (item) {
          clearTimeout(item.timer);
          pending.delete(message.id);
          message.error ? item.reject(new Error(JSON.stringify(message.error))) : item.resolve(message.result);
        }
      } else for (const listener of listeners) listener(message);
    };
    function send(method, params = {}, sessionId) {
      return new Promise((resolve, reject) => {
        const id = ++sequence;
        const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 20000);
        pending.set(id, { resolve, reject, timer });
        ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
      });
    }
    return {
      send,
      onEvent(listener) { listeners.add(listener); return () => listeners.delete(listener); },
      async page(url = 'about:blank') {
        const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
        const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
        const call = (method, params) => send(method, params, sessionId);
        await call('Page.enable');
        await call('Runtime.enable');
        await call('Network.enable');
        const page = {
          targetId, sessionId, call,
          async evaluate(expression) {
            const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
            if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
            return result.result.value;
          },
          async navigate(destination) {
            await call('Page.navigate', { url: destination });
            for (let i = 0; i < 120; i++) {
              await pause(100);
              if (await page.evaluate('document.readyState === "complete"')) return;
            }
            throw new Error(`Page did not finish loading: ${destination}`);
          }
        };
        if (url !== 'about:blank') await page.navigate(url);
        return page;
      },
      async close() {
        await send('Browser.close').catch(() => {});
        ws.close();
        child.kill();
      }
    };
  } catch (error) { ws?.close(); child.kill(); throw error; }
}
