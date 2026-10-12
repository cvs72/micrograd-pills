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
  const left = page.match(/__[A-Z]+__/);
  if (left) { console.log(`${slug}: ${left[0]} left unfilled`); bad++; }
  const m = page.match(/<script type="module">\n([\s\S]*)<\/script>\s*(?:<\/body>\s*<\/html>\s*)?$/);
  try { new Function(m[1]); } catch (e) { console.log(`${slug}: SYNTAX ${e.message}`); bad++; }
  fs.writeFileSync(`site/pills/${slug}.html`, page);
  console.log(`${slug}: ${page.length} bytes`);
}
if (bad) { console.log(`${bad} problem(s)`); process.exit(1); }
