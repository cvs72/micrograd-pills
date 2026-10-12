// Builds every pill page: a template from src/pills/ with its data from src/digits/ pasted in, written to site/pills/.
// Pills without numbers (01, 02) are copied as they are. Each built page is syntax-checked.
// Run: node build.js
const fs = require("fs"), path = require("path");
const read = f => fs.readFileSync(f, "utf8");
const data = n => read(path.join("src/digits", n));
const PILLS = [
  ["01-the-map"],
  ["02-a-neuron-from-outside"],
  ["03-a-network-at-work", { __NET__: "net.json" }],
  ["04-one-knob", { __NET__: "net.json" }],
  ["05-the-straight-line", { __NET__: "net.json" }],
  ["06-s-curve-and-hinge", { __NET__: "net.json" }],
  ["07-the-bowl", { __LOSS__: "loss.json", __NET__: "net.json" }],
  ["08-the-slope", { __SLOPE__: "slope.json", __NET__: "net.json" }],
  ["09-the-chain-rule", { __CHAIN__: "chain.json", __NET__: "net.json" }],
  ["10-one-neuron-every-number", { __NEURON__: "neuron.json" }],
  ["11-downhill", { __DESCENT__: "descent.json" }],
  ["12-the-names", { __NAMES__: "names.json", __CURVE__: () => JSON.stringify(JSON.parse(data("loss.json")).curve) }],
];
// What every pill shares around its stage: Open Graph tags, the <main> landmark, the live step text, the <noscript>
// message and the footer with the links to the index and the neighbouring pills (shown when it takes keyboard focus).
// The import map is the one inline script left; the policy admits it by its hash.
const IMPORTMAP = '{"imports":{"three":"../vendor/three/three.module.js"}}';
const csp = `default-src 'self'; script-src 'self' 'sha256-${require("crypto").createHash("sha256").update(IMPORTMAP).digest("base64")}'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; object-src 'none'; base-uri 'none'`;
const frame = (page, slug) => {
  const i = PILLS.findIndex(p => p[0] === slug), href = j => `${PILLS[j][0]}.html`;
  const title = page.match(/<title>([^<]*)<\/title>/)[1], desc = page.match(/<meta name="description" content="([^"]*)">/)[1];
  const link = (j, text) => j >= 0 && j < PILLS.length ? `<a href="${href(j)}">${text}</a>` : "";
  const footer = `<footer id="pillnav"><a href="../index.html">All pills</a>${link(i - 1, "◀ Previous pill")}${link(i + 1, "Next pill ▶")}</footer>`;
  return page
    .replace(/(<meta name="description"[^>]*>\n)/, `<meta http-equiv="Content-Security-Policy" content="${csp}">\n$1<meta property="og:title" content="${title}">\n<meta property="og:description" content="${desc}">\n<meta property="og:type" content="website">\n`)
    .replace('<div id="stage"></div>', "<main>\n<div id=\"stage\"></div>")
    .replace(/(<\/div>\n)(\n<script type="importmap">)/, "$1</main>\n<noscript><p id=\"noscript\">This knowledge pill is an animation and needs JavaScript. Please turn it on and reload.</p></noscript>\n" + footer + "\n$2")
    .replace('<p id="text">', '<p id="text" aria-live="polite">');
};
fs.mkdirSync("site/pills", { recursive: true });
let bad = 0;
for (const [slug, fills] of PILLS) {
  let page;
  if (!fills) page = read(`src/pills/${slug}.html`);
  else {
    page = read(`src/pills/${slug}.template.html`);
    for (const [key, src] of Object.entries(fills)) {
      if (!page.includes(key)) { console.log(`${slug}: ${key} not in template`); bad++; }
      page = page.replace(key, typeof src === "function" ? src() : data(src));
    }
  }
  page = frame(page, slug);
  const left = page.match(/__[A-Z]+__/);
  if (left) { console.log(`${slug}: ${left[0]} left unfilled`); bad++; }
  const m = page.match(/<script type="module">\n([\s\S]*)<\/script>\s*(?:<\/body>\s*<\/html>\s*)?$/);
  try { new Function(m[1]); } catch (e) { console.log(`${slug}: SYNTAX ${e.message}`); bad++; }
  if (!page.includes(`<script type="importmap">${IMPORTMAP}</script>`)) { console.log(`${slug}: import map differs`); bad++; }
  fs.writeFileSync(`site/pills/${slug}.js`, m[1]);
  page = page.replace(m[0], `<script type="module" src="${slug}.js"></script>\n</body>\n</html>\n`);
  fs.writeFileSync(`site/pills/${slug}.html`, page);
  console.log(`${slug}: ${page.length} bytes`);
}
if (bad) { console.log(`${bad} problem(s)`); process.exit(1); }
