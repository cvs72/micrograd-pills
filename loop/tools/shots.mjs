// Captures every pill deterministically. Playwright's fake clock drives rAF and timers, so the same page gives the
// same pixels on the same browser build, and the capture needs no hook in the page.
// Viewports come from the VIEWPORTS line of loop/PLAN.md (or SHOTS_VIEWPORTS=390x844,1440x810). The baseline
// viewport (1440x810) is captured at the end of every step, with the readable content per step (the content
// fingerprint) and any console or page error: <slug>-NN.png and <slug>.json, the names loop/baseline/ uses.
// Every other viewport is captured at three steps (first, middle, last): <slug>@WxH-NN.png. At the first step the
// text sheet, when the page has one (#sheet-toggle), is also captured open (<slug>@WxH-01-open.png), and the menu,
// when the page has one (#menu-toggle), open (<slug>@WxH-01-menu.png; also at the baseline viewport).
// Speed: while the clock runs, WebGL draw calls are skipped (the page's own logic, tweens, camera and labels still
// run every frame); one real frame is drawn right before each screenshot. Pills are captured a few at a time.
// usage: node loop/tools/shots.mjs <outDir> [pill-slug ...]      env: SHOTS_WORKERS=4, SHOTS_MULTI=1 (multi-process Chromium)
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

process.env.TMPDIR = path.resolve('.tmp'); fs.mkdirSync(process.env.TMPDIR, { recursive: true });  // browser temp files stay inside the project (sandbox)
const out = process.argv[2];
const only = process.argv.slice(3);
if (!out) { console.log('usage: node loop/tools/shots.mjs <outDir> [slug ...]'); process.exit(2); }
const SITE = 'site', BASE = '1440x810', SETTLE_MS = 30000, WORKERS = Number(process.env.SHOTS_WORKERS || 4);
const planLine = fs.existsSync('loop/PLAN.md') ? (fs.readFileSync('loop/PLAN.md', 'utf8').match(/^VIEWPORTS: *([0-9x, ]+)/m) || [])[1] : '';
const VIEWPORTS = [...new Set((process.env.SHOTS_VIEWPORTS || planLine || BASE).split(',').map(s => s.trim()).filter(Boolean))];
if (!VIEWPORTS.includes(BASE)) VIEWPORTS.unshift(BASE);  // the baseline viewport is always captured in full
const size = v => { const [width, height] = v.split('x').map(Number); return { width, height }; };
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
// single-process: inside the OS sandbox Chromium may not register the Mach port its child processes would use;
// in that mode a browser serves one context reliably, so every capture gets its own browser (launch is cheap)
const launch = () => chromium.launch({ args: process.env.SHOTS_MULTI ? [] : ['--single-process', '--no-zygote'] });
let failed = 0;

async function capture(slug, view) {
  const base = view === BASE, tag = base ? '' : '@' + view;
  const browser = await launch();
  const ctx = await browser.newContext({ viewport: size(view), deviceScaleFactor: 1, hasTouch: !base && size(view).width < 900 });
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
  await ctx.clock.runFor(100);
  // a control that is off-screen or covered is a layout defect at this viewport: say so plainly, then click it anyway so the capture goes on
  const press = async sel => {
    const where = await page.evaluate(s => { const el = document.querySelector(s); if (!el) return 'missing'; const r = el.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1) return 'hidden'; if (r.left < 0 || r.top < 0 || r.right > innerWidth || r.bottom > innerHeight) return `outside the ${innerWidth}x${innerHeight} viewport at ${Math.round(r.left)},${Math.round(r.top)}`;
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return hit && (hit === el || el.contains(hit)) ? '' : 'covered by ' + (hit ? hit.tagName.toLowerCase() + (hit.id ? '#' + hit.id : '') : 'nothing'); }, sel);
    if (where) { const msg = `${sel} is ${where}`; if (!errors.includes(msg)) errors.push(msg); await page.click(sel, { force: true, timeout: 5000 }).catch(() => {}); }
    else await page.click(sel, { timeout: 10000 });
  };
  await press('#play');                            // pause autoplay; the clock has barely moved
  const n = await page.locator('#dots span').count();
  const shot = async name => {
    await ctx.clock.runFor(SETTLE_MS);               // every tween done, camera settled, nothing drawn yet
    await page.evaluate(() => { window.__draw = true; });
    await ctx.clock.runFor(40);                      // one real frame
    await page.screenshot({ path: path.join(out, `${slug}${tag}-${name}.png`) });
    await page.evaluate(() => { window.__draw = false; });
  };
  const toggle = async id => { if (!await page.locator(id).count()) return false; await press(id); await ctx.clock.runFor(1000); return true; };
  const content = [];
  const wanted = base ? [...Array(n).keys()] : [...new Set([0, Math.floor((n - 1) / 2), n - 1])];
  for (let k = 0; k < n; k++) {
    if (k > 0) { await press('#next'); if (!wanted.includes(k)) { await ctx.clock.runFor(500); continue; } }
    await shot(String(k + 1).padStart(2, '0'));
    if (k === 0) {                                   // the two interface states the reviewer must see
      if (!base && await toggle('#sheet-toggle')) { await shot('01-open'); await toggle('#sheet-toggle'); }
      if (await toggle('#menu-toggle')) { await shot('01-menu'); await page.keyboard.press('Escape'); await ctx.clock.runFor(1000); }
    }
    if (base) content.push(await page.evaluate(() => ({
      title: document.querySelector('#title').textContent,
      text: document.querySelector('#text').textContent,
      ledger: document.querySelector('#ledger').innerText,
      eyebrow: document.querySelector('#eyebrow').innerText,
      labels: [...document.querySelectorAll('.lbl.on')].map(e => e.innerText).sort(),
    })));
  }
  if (base) fs.writeFileSync(path.join(out, `${slug}.json`), JSON.stringify({ steps: n, pageTitle: await page.title(), content, errors }, null, 1));
  if (errors.length) { failed++; console.log(`${slug}${tag}: ${errors.length} error(s) in the page: ${errors[0]}`); }
  console.log(`${slug}${tag}: ${base ? n : wanted.length} steps captured`);
  await ctx.close();
  await browser.close();
}
const queue = [];
for (const v of VIEWPORTS) for (const s of pills) queue.push([s, v]);
await Promise.all(Array.from({ length: Math.min(WORKERS, queue.length) }, async () => { while (queue.length) { const [s, v] = queue.shift(); try { await capture(s, v); } catch (e) { failed++; console.log(`${s}@${v}: capture failed: ${String(e).split('\n')[0]}`); } } }));
server.close();
process.exit(failed ? 1 : 0);
