// Static checks on the built site, one per task of loop/PLAN.md. Every check prints what is wrong and exits 1.
// usage: node loop/tools/pages.mjs <check> [<check> ...]    checks: links skeleton local kit three a11y nav csp ci sheet menu footer fit
import fs from 'node:fs';
import path from 'node:path';

const SITE = 'site';
const walk = (d, ext) => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name), ext) : ext.includes(path.extname(e.name)) ? [path.join(d, e.name)] : []);
const pages = () => walk(SITE, ['.html']);
const pills = () => walk(path.join(SITE, 'pills'), ['.html']).sort();
const read = f => fs.readFileSync(f, 'utf8');
const THREE_VERSION = (read('loop/PLAN.md').match(/^THREE_VERSION: *(\S+)/m) || [])[1];
let bad = 0;
const fail = (f, msg) => { console.log(`${f}: ${msg}`); bad++; };

const checks = {
  links() {  // every local href/src resolves to a file
    for (const f of pages()) {
      const html = read(f);
      for (const m of html.matchAll(/(?:href|src)="([^"#?]+)[^"]*"/g)) {
        const u = m[1];
        if (/^(https?:|mailto:|data:|\/\/)/.test(u)) continue;
        const target = u.startsWith('/') ? path.join(SITE, u) : path.join(path.dirname(f), u);
        const t = target.endsWith('/') ? path.join(target, 'index.html') : target;
        if (!fs.existsSync(t)) fail(f, `link to a file that does not exist: ${u}`);
      }
    }
  },
  skeleton() {  // a proper document: doctype, language, viewport, description, title
    for (const f of pages()) {
      const html = read(f);
      if (!/^\s*<!doctype html>/i.test(html)) fail(f, 'must start with <!doctype html>');
      if (!/<html[^>]*\blang="[a-z]{2}/i.test(html)) fail(f, 'needs <html lang="...">');
      if (!/<meta[^>]*name="viewport"/i.test(html)) fail(f, 'needs <meta name="viewport" ...>');
      if (!/<meta[^>]*name="description"/i.test(html)) fail(f, 'needs <meta name="description" ...>');
      if (!/<title>[^<]+<\/title>/i.test(html)) fail(f, 'needs a <title>');
      if (!/<meta[^>]*charset="utf-8"/i.test(html)) fail(f, 'needs <meta charset="utf-8">');
    }
  },
  local() {  // no resource is loaded from another origin: scripts, styles, fonts, import maps, url()
    for (const f of walk(SITE, ['.html', '.css', '.js', '.mjs'])) {
      const s = read(f);
      for (const [i, line] of s.split('\n').entries()) {
        if (/<(script|link)[^>]*\b(src|href)="https?:\/\//i.test(line)) fail(f, `line ${i + 1}: loads a resource from another origin`);
        if (/url\(\s*['"]?https?:\/\//i.test(line)) fail(f, `line ${i + 1}: url() from another origin`);
        if (/@import\s+['"(]*https?:\/\//i.test(line)) fail(f, `line ${i + 1}: @import from another origin`);
        if (/^\s*import\b.*\bfrom\s+['"]https?:\/\//.test(line)) fail(f, `line ${i + 1}: ES import from another origin`);
      }
      if (/"imports"\s*:\s*\{[^}]*https?:\/\//s.test(s)) fail(f, 'import map points to another origin');
    }
  },
  kit() {  // the shared kit lives in site/kit, once; no pill carries its own copy
    for (const k of ['site/kit/pill.js', 'site/kit/pill.css']) if (!fs.existsSync(k)) fail(k, 'missing');
    const markers = ['function makePanel(', 'function placeLabels(', 'new THREE.WebGLRenderer(', 'function fitRadius(', 'function stepAnims('];
    for (const f of pills()) { const s = read(f); for (const m of markers) if (s.includes(m)) fail(f, `still carries kit code: ${m} (must come from site/kit/pill.js)`); }
    for (const f of pills()) { const s = read(f); if (!/<(script|link)[^>]*(src|href)="\.\.\/kit\/pill\.(js|css)"/.test(s) && !/from\s+['"]\.\.\/kit\/pill\.js['"]/.test(s)) fail(f, 'does not load site/kit/pill.js or pill.css'); }
  },
  three() {  // Three.js vendored at the pinned version, loaded as an ES module; nothing points at r128 or three.min.js
    const mod = 'site/vendor/three/three.module.js', core = 'site/vendor/three/three.core.js';
    if (!THREE_VERSION) fail('loop/PLAN.md', 'THREE_VERSION line missing');
    for (const f of [mod, core]) if (!fs.existsSync(f)) fail(f, 'missing');
    if (fs.existsSync(core) && THREE_VERSION && !read(core).includes(`REVISION = '${THREE_VERSION.split('.')[1]}'`)) fail(core, `is not Three.js ${THREE_VERSION} (REVISION mismatch)`);
    for (const f of walk(SITE, ['.html', '.js', '.mjs'])) { const s = read(f); if (/three\.min\.js|three\.js\/r1\d\d|THREE\.Geometry\b/.test(s)) fail(f, 'still references three.min.js / r128 / legacy API'); }
    for (const f of pills()) if (!/<script[^>]*type="importmap"/.test(read(f)) && !/<script[^>]*type="module"/.test(read(f))) fail(f, 'must load Three.js as an ES module (import map + <script type="module">)');
  },
  a11y() {  // what a screen reader and a keyboard need, and a message without JavaScript
    for (const f of pills()) {
      const s = read(f);
      if (!/<noscript>/.test(s)) fail(f, 'needs a <noscript> message');
      if (!/aria-live="polite"/.test(s)) fail(f, 'the step text region needs aria-live="polite"');
      if ((s.match(/aria-label=/g) || []).length < 3) fail(f, 'the three control buttons need aria-labels');
      if (!/<main\b|role="main"/.test(s)) fail(f, 'needs a <main> landmark');
      if (!/prefers-reduced-motion/.test(s) && !/prefers-reduced-motion/.test(fs.existsSync('site/kit/pill.css') ? read('site/kit/pill.css') : '')) fail(f, 'reduced-motion handling missing');
    }
  },
  nav() {  // every pill links to the index and to its neighbours
    const list = pills();
    list.forEach((f, i) => {
      const s = read(f);
      if (!/href="\.\.\/(index\.html)?"/.test(s)) fail(f, 'needs a link back to the index (../ or ../index.html)');
      if (i > 0 && !s.includes(`href="${path.basename(list[i - 1])}"`)) fail(f, `needs a link to the previous pill ${path.basename(list[i - 1])}`);
      if (i < list.length - 1 && !s.includes(`href="${path.basename(list[i + 1])}"`)) fail(f, `needs a link to the next pill ${path.basename(list[i + 1])}`);
    });
  },
  csp() {  // a content security policy that allows only this origin, and no inline scripts
    for (const f of pages()) {
      const s = read(f);
      const m = s.match(/<meta[^>]*http-equiv="Content-Security-Policy"[^>]*content="([^"]*)"/i);
      if (!m) { fail(f, 'needs <meta http-equiv="Content-Security-Policy">'); continue; }
      const csp = m[1];
      if (!/default-src 'self'/.test(csp)) fail(f, "CSP needs default-src 'self'");
      if (/script-src[^;]*'unsafe-inline'/.test(csp)) fail(f, "CSP must not allow 'unsafe-inline' scripts");
      if (!/object-src 'none'/.test(csp)) fail(f, "CSP needs object-src 'none'");
      if (/<script(?![^>]*\b(src|type="importmap"|type="application\/json"))[^>]*>\s*\S/.test(s)) fail(f, 'inline <script> left (blocked by the CSP): move it to a file');
    }
  },
  sheet() {  // on narrow viewports the deck is a sheet over the stage: the handle and its wiring exist in every pill
    for (const f of pills()) {
      const s = read(f);
      if (!/<button[^>]*\bid="sheet-toggle"/.test(s)) fail(f, 'needs <button id="sheet-toggle"> (the handle of the text sheet)');
      if (!/id="sheet-toggle"[^>]*aria-expanded=|aria-expanded=[^>]*id="sheet-toggle"/.test(s)) fail(f, '#sheet-toggle needs aria-expanded');
      if (!/id="sheet-toggle"[^>]*aria-controls=|aria-controls=[^>]*id="sheet-toggle"/.test(s)) fail(f, '#sheet-toggle needs aria-controls');
    }
    const css = fs.existsSync('site/kit/pill.css') ? read('site/kit/pill.css') : '';
    if (!/@media[^{]*max-width/.test(css)) fail('site/kit/pill.css', 'needs a max-width media query for the narrow layout');
  },
  menu() {  // a menu on every page: a button and a panel listing the twelve pills and the index
    const list = pills(), names = list.map(f => path.basename(f));
    for (const f of pages()) {
      const s = read(f), pill = f.includes('/pills/');
      if (!/<button[^>]*\bid="menu-toggle"/.test(s)) { fail(f, 'needs <button id="menu-toggle">'); continue; }
      if (!/id="menu-toggle"[^>]*aria-expanded=|aria-expanded=[^>]*id="menu-toggle"/.test(s)) fail(f, '#menu-toggle needs aria-expanded');
      if (!/id="menu-toggle"[^>]*aria-controls="menu-panel"|aria-controls="menu-panel"[^>]*id="menu-toggle"/.test(s)) fail(f, '#menu-toggle needs aria-controls="menu-panel"');
      if (!/aria-label="Menu"|>\s*Menu\s*</.test(s)) fail(f, 'the menu button needs the accessible name "Menu"');
      const panel = s.match(/<nav[^>]*\bid="menu-panel"[\s\S]*?<\/nav>/);
      if (!panel) { fail(f, 'needs <nav id="menu-panel"> ... </nav>'); continue; }
      for (const n of names) if (!panel[0].includes(`href="${pill ? n : 'pills/' + n}"`)) fail(f, `menu panel lacks the link to ${n}`);
      if (pill && !/href="(\.\.\/|\.\.\/index\.html)"/.test(panel[0])) fail(f, 'menu panel needs the link home (../ or ../index.html)');
      if (pill && !panel[0].includes('aria-current="page"')) fail(f, 'menu panel must mark the current pill with aria-current="page"');
    }
  },
  footer() {  // the credit line on every page, with the two bubbles and the three links
    if (!fs.existsSync('site/LICENSE')) fail('site/LICENSE', 'missing: build.js must copy LICENSE into site/');
    for (const f of pages()) {
      const s = read(f), pill = f.includes('/pills/');
      const m = s.match(/<footer[\s\S]*?<\/footer>/);
      if (!m) { fail(f, 'needs a <footer>'); continue; }
      const t = m[0];
      if (!/Developed by/.test(t) || !/cvs72/.test(t) || !/using Claude/.test(t)) fail(f, 'footer must read "Developed by cvs72 using Claude"');
      if (/CVS72|Cvs72/.test(t)) fail(f, 'the handle is lowercase: cvs72');
      if (!t.includes('Enjoy, Carlos Val Souto.')) fail(f, 'footer lacks the bubble "Enjoy, Carlos Val Souto."');
      if (!t.includes('Contact the developer')) fail(f, 'footer lacks the bubble "Contact the developer"');
      if (!t.includes(`href="${pill ? '../' : ''}LICENSE"`)) fail(f, `footer must link MIT License to ${pill ? '../' : ''}LICENSE`);
      const c = t.match(/<a[^>]*href="https:\/\/github\.com\/cvs72\/micrograd-pills\/issues\/new"[^>]*>/);
      if (!c) fail(f, 'the "Contact the developer" bubble must be a link to https://github.com/cvs72/micrograd-pills/issues/new');
      else if (!/rel="[^"]*noopener/.test(c[0])) fail(f, 'the contact link needs rel="noopener"');
    }
  },
  fit() {  // the first frame is framed after the fonts are ready, with no per-pill workaround left
    const js = fs.existsSync('site/kit/pill.js') ? read('site/kit/pill.js') : '';
    if (!/document\.fonts\.ready/.test(js)) fail('site/kit/pill.js', 'the first layout and fit must wait for document.fonts.ready');
    for (const f of [...walk(SITE, ['.js', '.html']), ...walk('src/pills', ['.html'])]) if (read(f).includes('firstFitBodyFallback')) fail(f, 'firstFitBodyFallback must go');
  },
  ci() {  // the workflow that checks and deploys on every push
    const w = '.github/workflows/site.yml';
    if (!fs.existsSync(w)) { fail(w, 'missing'); return; }
    const s = read(w);
    for (const need of ['node build.js', 'html-validate', 'publish-check.sh', 'actions/upload-pages-artifact', 'actions/deploy-pages', 'loop/tools/pages.mjs']) if (!s.includes(need)) fail(w, `must run ${need}`);
    if (!/permissions:[\s\S]*pages: write/.test(s)) fail(w, 'needs permissions: pages: write and id-token: write');
    if (!fs.existsSync('README.md') || !/GitHub Pages/.test(read('README.md'))) fail('README.md', 'must explain the GitHub Pages deployment');
  },
};
const asked = process.argv.slice(2);
if (!asked.length || asked.some(c => !checks[c])) { console.log(`usage: node loop/tools/pages.mjs <check> ...   (${Object.keys(checks).join(' ')})`); process.exit(2); }
for (const c of asked) { const before = bad; checks[c](); console.log(`check ${c}: ${bad - before ? bad - before + ' problem(s)' : 'ok'}`); }
process.exit(bad ? 1 : 0);
