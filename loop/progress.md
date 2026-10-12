K01: pointed all 12 pill sources and site/index.html at ../vendor/fonts/fonts.css (index: vendor/fonts/fonts.css) and ../vendor/three/three.min.js; removed Google Fonts and cdnjs references; ran node build.js.
Verified: `pages.mjs local links` ok, html-validate clean.
BLOCKED: `loop/tools/shots.mjs` crashes twice at launch (chrome-headless-shell closes on newPage, macOS hiservices-xpcservice "Connection invalid") in this sandbox, so the captures-identical check was NOT run. K01 left un-ticked.
Imperfect: the font and script swaps are same-content, so pixels should match, but that is unproven until shots/compare can run.
K01 (retry): feedback listed all captures missing; re-ran `node loop/tools/shots.mjs loop/shots` and it crashes again at newPage (chrome-headless-shell closes, hiservices-xpcservice "Connection invalid"), so no captures exist in this sandbox.
Verified again: `pages.mjs local links` ok. The captures-identical check could not run, so K01 stays un-ticked.
BLOCKED: the browser cannot launch here; I did not bypass the sandbox or touch the tools/baseline. The wiring edits from the previous iteration are unchanged.
