// Compares a capture with the baseline. The readable content per step (titles, texts, ledger, eyebrow, labels) must
// be identical: content is frozen. Pixels are compared per step at the baseline viewport (pixelmatch): with a
// tolerance they must stay within it; with "none" the differences are only reported (a design pass changes pixels
// on purpose and the reviewer judges the captures). Page errors and missing captures always fail.
// usage: node loop/tools/compare.mjs <baselineDir> <shotsDir> [maxMismatchRatio=0.01 | none]
// Writes <shotsDir>/diff-<name>.png for every image over the limit (or, with "none", over 1%, for the reviewer).
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const [base, shots, tolArg] = process.argv.slice(2);
const REPORT = (tolArg ?? '').toLowerCase() === 'none';
const TOL = REPORT ? 0.01 : Number(tolArg ?? 0.01);
if (!base || !shots) { console.log('usage: node loop/tools/compare.mjs <baselineDir> <shotsDir> [tolerance|none]'); process.exit(2); }
const pngs = fs.readdirSync(base).filter(f => f.endsWith('.png')).sort();
const jsons = fs.readdirSync(base).filter(f => f.endsWith('.json')).sort();
let bad = 0, worst = 0, worstName = '', changed = 0;
for (const f of pngs) {
  const want = path.join(shots, f);
  if (!fs.existsSync(want)) { console.log(`MISSING ${f}: no capture (page broken or a step vanished)`); bad++; continue; }
  const a = PNG.sync.read(fs.readFileSync(path.join(base, f))), b = PNG.sync.read(fs.readFileSync(want));
  if (a.width !== b.width || a.height !== b.height) { console.log(`SIZE ${f}: ${b.width}x${b.height} vs baseline ${a.width}x${a.height}`); bad++; continue; }
  const diff = new PNG({ width: a.width, height: a.height });
  const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.12 });
  const ratio = n / (a.width * a.height);
  if (ratio > worst) { worst = ratio; worstName = f; }
  if (ratio > TOL) {
    fs.writeFileSync(path.join(shots, `diff-${f}`), PNG.sync.write(diff));
    if (REPORT) { changed++; console.log(`CHANGED ${f}: ${(ratio * 100).toFixed(2)}% of pixels differ from the baseline (reported, not judged here), see ${path.join(shots, 'diff-' + f)}`); }
    else { bad++; console.log(`PIXELS ${f}: ${(ratio * 100).toFixed(2)}% of pixels differ (limit ${(TOL * 100).toFixed(2)}%), see ${path.join(shots, 'diff-' + f)}`); }
  }
}
for (const f of jsons) {
  const want = path.join(shots, f);
  if (!fs.existsSync(want)) { console.log(`MISSING ${f}`); bad++; continue; }
  const a = JSON.parse(fs.readFileSync(path.join(base, f))), b = JSON.parse(fs.readFileSync(want));
  if (a.steps !== b.steps) { console.log(`CONTENT ${f}: ${b.steps} steps, baseline ${a.steps}`); bad++; continue; }
  if (b.errors && b.errors.length) { console.log(`ERRORS ${f}: ${b.errors.slice(0, 3).join(' | ')}`); bad++; }
  a.content.forEach((s, k) => {
    for (const key of ['title', 'text', 'ledger', 'eyebrow', 'labels']) {
      const x = JSON.stringify(s[key]), y = JSON.stringify(b.content[k]?.[key]);
      if (x !== y) { console.log(`CONTENT ${f} step ${k + 1} ${key}: changed. Content is frozen: titles, texts, ledger lines, eyebrow and every on-stage label must stay exactly as in the baseline.`); bad++; }
    }
  });
}
// captures of other viewports and interface states (<slug>@WxH-..., -open, -menu) have no baseline: the reviewer judges them
const extra = fs.readdirSync(shots).filter(f => /^\d\d-[a-z0-9-]+-\d\d\.png$/.test(f) && !pngs.includes(f));
if (extra.length) { console.log(`EXTRA captures not in the baseline: ${extra.join(', ')}`); bad++; }
const others = fs.readdirSync(shots).filter(f => f.includes('@') && f.endsWith('.png')).length;
console.log(`compared ${pngs.length} images and ${jsons.length} content dumps; worst image ${worstName} at ${(worst * 100).toFixed(2)}%; ${REPORT ? changed + ' image(s) changed (reported); ' : ''}${others} capture(s) at other viewports for the reviewer; ${bad} problem(s)`);
process.exit(bad ? 1 : 0);
