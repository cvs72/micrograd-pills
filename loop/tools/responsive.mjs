// The mechanical half of the "phone" row: every page, at many widths and after a live resize, shows no horizontal
// overflow, keeps every control inside the viewport and tappable, keeps the stage as the whole area between the
// eyebrow and the footer, and keeps the canvas the size of the stage. Real clock, pages settle for a moment.
// usage: node loop/tools/responsive.mjs [page ...]    (default: index + every pill)   env: SHOTS_MULTI=1
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

process.env.TMPDIR = path.resolve('.tmp'); fs.mkdirSync(process.env.TMPDIR, { recursive: true });
const SITE = 'site';
const SIZES = [[320, 693], [390, 844], [600, 900], [768, 1024], [1024, 768], [1280, 800], [1920, 1080], [2560, 1440], [844, 390]];
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml' };
const root = path.resolve(SITE);
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const f = path.resolve(path.join(root, p));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const pages = process.argv.slice(2).length ? process.argv.slice(2)
  : ['index.html', ...fs.readdirSync(path.join(SITE, 'pills')).filter(f => f.endsWith('.html')).sort().map(f => 'pills/' + f)];
let bad = 0;
const fail = (page, size, msg) => { console.log(`${page} at ${size}: ${msg}`); bad++; };

// runs in the page: every rule that can be measured
const measure = () => {
  const W = window.innerWidth, H = window.innerHeight, out = [];
  const se = document.scrollingElement || document.documentElement;
  if (se.scrollWidth > W + 1) out.push(`horizontal overflow: page is ${se.scrollWidth}px wide in a ${W}px viewport`);
  const inside = (el, name, min) => {
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    if (r.width <= 1 || r.height <= 1) return;  // hidden state (a closed sheet or menu, a 1 px screen-reader-only link) is fine
    if (cs.visibility === 'hidden' || cs.opacity === '0' || cs.clipPath !== 'none' || (cs.clip && cs.clip !== 'auto')) return;  // screen-reader-only
    if (r.left < -1 || r.top < -1 || r.right > W + 1 || r.bottom > H + 1) out.push(`${name} is outside the viewport (${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)})`);
    if (min && W < 700 && (r.width < min || r.height < min)) out.push(`${name} is ${Math.round(r.width)}x${Math.round(r.height)}, smaller than ${min}px on a phone`);
  };
  for (const id of ['prev', 'next', 'play']) { const el = document.getElementById(id); if (el) inside(el, '#' + id, 44); }
  for (const id of ['menu-toggle', 'sheet-toggle']) { const el = document.getElementById(id); if (el) inside(el, '#' + id, 44); }
  for (const a of document.querySelectorAll('footer a')) inside(a, 'footer link "' + a.textContent.trim() + '"');
  const stage = document.getElementById('stage'), canvas = stage && stage.querySelector('canvas');
  if (stage) {
    const s = stage.getBoundingClientRect(), eyebrow = document.getElementById('eyebrow'), footer = document.querySelector('footer');
    const top = eyebrow ? eyebrow.getBoundingClientRect().bottom : 0, bottom = footer && footer.getBoundingClientRect().height ? footer.getBoundingClientRect().top : H;
    if (W < 900 && (s.top > top + 2 || s.bottom < bottom - 2)) out.push(`stage does not own the screen: it spans ${Math.round(s.top)}..${Math.round(s.bottom)} but the free area is ${Math.round(top)}..${Math.round(bottom)} (the deck must be a sheet over the stage)`);
    if (s.height < 0.45 * H && W < 900) out.push(`stage is only ${Math.round(100 * s.height / H)}% of the height`);
    if (canvas && (Math.abs(canvas.clientWidth - s.width) > 2 || Math.abs(canvas.clientHeight - s.height) > 2)) out.push(`canvas ${canvas.clientWidth}x${canvas.clientHeight} is not the stage size ${Math.round(s.width)}x${Math.round(s.height)}`);
  }
  for (const id of ['title', 'text']) { const el = document.getElementById(id); if (el && el.scrollWidth > el.clientWidth + 1) out.push(`#${id} is clipped horizontally`); }
  const text = document.getElementById('text');
  if (text && W < 700 && text.getBoundingClientRect().height > 0 && parseFloat(getComputedStyle(text).fontSize) < 16) out.push(`#text is ${getComputedStyle(text).fontSize}, smaller than 16px on a phone`);
  return out;
};
const launch = () => chromium.launch({ args: process.env.SHOTS_MULTI ? [] : ['--single-process', '--no-zygote'] });

for (const p of pages) {
  const browser = await launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 810 }, hasTouch: true });
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', e => errors.push(String(e))); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(`http://127.0.0.1:${port}/${p}`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  if (await page.locator('#play').count()) await page.click('#play');
  const check = async label => { await page.waitForTimeout(400); for (const m of await page.evaluate(measure)) fail(p, label, m); };
  for (const [w, h] of SIZES) { await page.setViewportSize({ width: w, height: h }); await check(`${w}x${h}`); }
  // the sheet, when there is one, open: still nothing off-screen, the stage untouched
  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(400);
  if (await page.locator('#sheet-toggle').count()) {
    const before = await page.evaluate(() => document.querySelector('#stage canvas')?.getBoundingClientRect().height);
    await page.click('#sheet-toggle'); await check('390x844 sheet open');
    const after = await page.evaluate(() => document.querySelector('#stage canvas')?.getBoundingClientRect().height);
    if (before !== after) fail(p, '390x844', `opening the sheet resized the stage (${before} -> ${after}); the sheet must lie over the animation`);
    if (await page.evaluate(() => { const t = document.getElementById('text'); const r = t.getBoundingClientRect(); return !(r.height > 0 && r.top >= 0 && r.bottom <= window.innerHeight); })) fail(p, '390x844 sheet open', 'the step text is not visible inside the viewport');
    await page.keyboard.press('Escape'); await check('390x844 sheet closed again');
  } else if (p.startsWith('pills/')) fail(p, '390x844', 'no #sheet-toggle: the deck must become a sheet with a handle on narrow viewports');
  // live resize both ways, no reload
  await page.setViewportSize({ width: 1440, height: 810 }); await check('back to 1440x810');
  await page.setViewportSize({ width: 390, height: 844 }); await check('back to 390x844');
  if (errors.length) fail(p, 'any', `page errors: ${errors.slice(0, 2).join(' | ')}`);
  await ctx.close(); await browser.close();
  console.log(`${p}: checked`);
}
server.close();
console.log(`responsive: ${bad} problem(s)`);
process.exit(bad ? 1 : 0);
