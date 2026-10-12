// Captures every pill at the end of every step, deterministically. Playwright's fake clock drives rAF and timers,
// so the same page gives the same pixels on the same browser build, and the capture needs no hook in the page.
// Also dumps every text the viewer can read per step (the content fingerprint) and any console or page error.
// Speed: while the clock runs, WebGL draw calls are skipped (the page's own logic, tweens, camera and labels still
// run every frame); one real frame is drawn right before each screenshot. Pills are captured a few at a time.
// usage: node loop/tools/shots.mjs <outDir> [pill-slug ...]      env: SHOTS_NO_SANDBOX=1, SHOTS_WORKERS=4
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const out = process.argv[2];
const only = process.argv.slice(3);
if (!out) { console.log('usage: node loop/tools/shots.mjs <outDir> [slug ...]'); process.exit(2); }
const SITE = 'site', VIEW = { width: 1440, height: 810 }, SETTLE_MS = 30000, WORKERS = Number(process.env.SHOTS_WORKERS || 4);
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };

// a static server for site/: pages that use ES modules need http, file:// will not do
const root = path.resolve(SITE);
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.resolve(path.join(root, p));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

// installed before any page script: WebGL draws are no-ops unless window.__draw is true, and CSS transitions are off
// (they run on the compositor's real clock, which the fake clock does not control)
const skipDraws = () => {
  window.__draw = false;
  document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; }'; document.head.appendChild(s); });
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    const gl = orig.call(this, type, ...rest);
    if (gl && /webgl/.test(type) && !gl.__wrapped) {
      gl.__wrapped = true;
      for (const name of ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced', 'clear']) {
        const fn = gl[name]; if (!fn) continue;
        gl[name] = function (...a) { if (window.__draw) return fn.apply(this, a); };
      }
    }
    return gl;
  };
};

const pills = fs.readdirSync(path.join(SITE, 'pills')).filter(f => f.endsWith('.html')).map(f => f.slice(0, -5))
  .filter(s => !only.length || only.includes(s)).sort();
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch(process.env.SHOTS_NO_SANDBOX ? { args: ['--no-sandbox'] } : {});
let failed = 0;

async function capture(slug) {
  const ctx = await browser.newContext({ viewport: VIEW, deviceScaleFactor: 1 });
  await ctx.addInitScript(skipDraws);
  await ctx.clock.install({ time: 0 });
  await ctx.clock.pauseAt(0);                      // paused before the page loads: time moves only through runFor
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  page.on('requestfailed', r => errors.push('request failed: ' + r.url()));
  await page.goto(`http://127.0.0.1:${port}/pills/${slug}.html`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.click('#play');                       // pause autoplay; the clock has not moved yet
  const n = await page.locator('#dots span').count();
  const content = [];
  for (let k = 0; k < n; k++) {
    if (k > 0) await page.click('#next');
    await ctx.clock.runFor(SETTLE_MS);               // every tween done, camera settled, nothing drawn yet
    await page.evaluate(() => { window.__draw = true; });
    await ctx.clock.runFor(40);                      // one real frame
    await page.screenshot({ path: path.join(out, `${slug}-${String(k + 1).padStart(2, '0')}.png`) });
    await page.evaluate(() => { window.__draw = false; });
    content.push(await page.evaluate(() => ({
      title: document.querySelector('#title').textContent,
      text: document.querySelector('#text').textContent,
      ledger: document.querySelector('#ledger').innerText,
      eyebrow: document.querySelector('#eyebrow').innerText,
      labels: [...document.querySelectorAll('.lbl.on')].map(e => e.innerText).sort(),
    })));
  }
  fs.writeFileSync(path.join(out, `${slug}.json`), JSON.stringify({ steps: n, pageTitle: await page.title(), content, errors }, null, 1));
  if (errors.length) { failed++; console.log(`${slug}: ${errors.length} error(s) in the page: ${errors[0]}`); }
  console.log(`${slug}: ${n} steps captured`);
  await ctx.close();
}
const queue = [...pills];
await Promise.all(Array.from({ length: Math.min(WORKERS, queue.length) }, async () => { while (queue.length) await capture(queue.shift()); }));
await browser.close();
server.close();
process.exit(failed ? 1 : 0);
