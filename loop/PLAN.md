# Kit modernisation plan (the loop's task list)

Scope: the shared page kit, the dependencies, the document hygiene, the site structure and the deployment of the
twelve finished pills. NOT the content: every title, step text, ledger line, eyebrow, on-stage label, number, colour,
layout and timing stays exactly as it is. The loop proves that mechanically on every iteration: each pill is
captured at the end of every step and compared with `loop/baseline/` (pixels within SHOT_TOL, readable content
identical).

Rows are worked top to bottom, one per iteration. The builder ticks a row only when its own checks pass; the loop
re-verifies, an independent reviewer reads the diff and the captures, and the loop records the verdict. Editing
anything in this file other than the tick boxes stops the loop.

THREE_VERSION: 0.186.1
SHOT_TOL: 0.01
MAX_REVIEW_REJECTS: 4

- [x] K01 | vendor | Self-hosted dependencies. The fonts (Outfit, IBM Plex Sans, IBM Plex Mono as woff2 in `site/vendor/fonts/` with one `fonts.css` of @font-face rules) and Three.js r128 (`site/vendor/three/three.min.js`, the same build the pages use today) are already in `site/vendor/`; wire every page to them and remove the Google Fonts and cdnjs references. Checks: local, links, captures identical.
- [x] K02 | skeleton | A proper document for every page: `<!doctype html>`, `<html lang="en">`, charset, viewport, a one-sentence description, the title as "NN · Name · Knowledge pills". Checks: skeleton, html-validate, captures identical.
- [x] K03 | kit | One shared kit. Move the code that all twelve templates carry (theme tokens and layout CSS; renderer, camera and fit; labels and placeLabels; tube/cone/quads/makePanel helpers; the tween engine; the deck, dots, keyboard and player; the preview hook) into `site/kit/pill.css` and `site/kit/pill.js` (classic script for now). Each pill keeps only its own scene, numbers, labels, steps and enter functions. Where templates differ slightly (pill 10's `.op`/`.cell` classes, pill 12's 42 px stage offset), the kit takes the most recent behaviour and the captures decide. Checks: kit, captures identical. Templates in `src/pills/` are the sources: edit them, then `node build.js`.
- [x] K04 | three | Upgrade Three.js to THREE_VERSION as an ES module: `site/vendor/three/three.module.js` (already vendored), an import map on every page, `pill.js` as a module that imports `three`, pills as `<script type="module">`. Restore the exact look after the upgrade (colour management, light intensities, material defaults changed since r128): the captures are the judge, within SHOT_TOL. Checks: three, local, captures.
- [ ] K05 | access | Accessibility, metadata and navigation: `<main>` landmark, `aria-live="polite"` on the step text, a `<noscript>` message, visible focus styles kept, a footer line in every pill linking to the index and to the previous and next pill, Open Graph title and description. Checks: a11y, nav, html-validate, captures identical.
- [ ] K06 | csp | Hygiene: a Content-Security-Policy meta on every page (`default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; object-src 'none'; base-uri 'none'`), no inline scripts left (each pill's script and its JSON move to files, e.g. `site/pills/NN-slug.js` and the data as a JSON module or a `<script type="application/json">` block), `rel="noopener"` on external links, no console errors under the policy. Checks: csp, local, captures identical.
- [ ] K07 | ci | Continuous checks and deployment: `.github/workflows/site.yml` that on every push runs `node build.js`, html-validate, `node loop/tools/pages.mjs links skeleton local kit three a11y nav csp` and `./publish-check.sh` (with PUBLISH_CHECK_SKIP_HISTORY unset and gitleaks via its action), then deploys `site/` to GitHub Pages with `actions/upload-pages-artifact` and `actions/deploy-pages`; README updated with the Pages setup and the local preview command. Checks: ci, html-validate.

## Decisions taken in this plan (change them before the loop runs, not during)
- ES modules mean the pages need http: `npm run serve` for a local preview. Double-clicking a page from the file system stops working after K04. GitHub Pages, and any host, serves over http, so nothing is lost for visitors.
- Capture viewport 1440 × 810 (16:9), device scale 1, Chromium from Playwright 1.64.0 headless (software rendering, deterministic). The baseline was captured on the same version before the loop.
- The deck layout, text sizes and the portrait (phone) layout are out of scope: that is the design pass that follows, and it changes the captures on purpose.
