K01: pointed all 12 pill sources and site/index.html at ../vendor/fonts/fonts.css (index: vendor/fonts/fonts.css) and ../vendor/three/three.min.js; removed Google Fonts and cdnjs references; ran node build.js.
Verified: `pages.mjs local links` ok, html-validate clean.
BLOCKED: `loop/tools/shots.mjs` crashes twice at launch (chrome-headless-shell closes on newPage, macOS hiservices-xpcservice "Connection invalid") in this sandbox, so the captures-identical check was NOT run. K01 left un-ticked.
Imperfect: the font and script swaps are same-content, so pixels should match, but that is unproven until shots/compare can run.
K01 (retry): feedback listed all captures missing; re-ran `node loop/tools/shots.mjs loop/shots` and it crashes again at newPage (chrome-headless-shell closes, hiservices-xpcservice "Connection invalid"), so no captures exist in this sandbox.
Verified again: `pages.mjs local links` ok. The captures-identical check could not run, so K01 stays un-ticked.
BLOCKED: the browser cannot launch here; I did not bypass the sandbox or touch the tools/baseline. The wiring edits from the previous iteration are unchanged.
K01 (retry 2): re-ran `node loop/tools/shots.mjs loop/shots`; it crashes at newPage again (chrome-headless-shell, hiservices-xpcservice "Connection invalid"), so no captures exist.
Verified again: `pages.mjs local links` ok. Wiring edits unchanged; nothing further to fix in the sources.
BLOCKED: the browser cannot launch in this sandbox, so the captures-identical check did not run and K01 stays un-ticked. I did not touch the tools or baseline.
K01 (retry 3): the capture tool now launches. Rebuilt with `node build.js` and re-captured all 12 pills.
Verified: html-validate clean, `pages.mjs local links` ok, compare.mjs: 83 images and 12 content dumps, 0 problems (worst 0.06% on 01-the-map-04).
K01 ticked. Nothing imperfect that I know of; the sources were unchanged this iteration.
K02: every pill source now starts with `<!DOCTYPE html>`, `<html lang="en">`, `<head>` (charset, viewport, one-sentence description, title "NN · Name · Knowledge pills"), then `</head><body>` before the stage and `</body></html>` after the script; index got a description. build.js's script regex accepts the closing tags.
Verified: node build.js, html-validate clean, `pages.mjs skeleton` ok, shots + compare.mjs: 83 images, 12 dumps, 0 problems (worst 0.06%).
Imperfect: the descriptions are my own wording of each pill's idea; pill 02's title keeps its existing short name "Neuron From Outside".
