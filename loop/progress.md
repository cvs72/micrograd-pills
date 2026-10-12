K01: pointed all 12 pill sources and site/index.html at ../vendor/fonts/fonts.css (index: vendor/fonts/fonts.css) and ../vendor/three/three.min.js; removed Google Fonts and cdnjs references; ran node build.js.
Verified: `pages.mjs local links` ok, html-validate clean.
BLOCKED: `loop/tools/shots.mjs` crashes twice at launch (chrome-headless-shell closes on newPage, macOS hiservices-xpcservice "Connection invalid") in this sandbox, so the captures-identical check was NOT run. K01 left un-ticked.
Imperfect: the font and script swaps are same-content, so pixels should match, but that is unproven until shots/compare can run.
