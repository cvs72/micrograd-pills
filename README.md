# micrograd-pills

> Unofficial, non-commercial, educational project based on Andrej Karpathy's lecture *The spelled-out intro to
> neural networks and backpropagation: building micrograd* and his micrograd repository. All credit for the ideas
> and the code belongs to him; see [Credits and licence](#credits-and-licence).

How a neural network learns, in short animated web pages: "knowledge pills" of one to four minutes, one idea each.
Part 1 (twelve pills) takes a reader from the map of AI to the standard vocabulary, with one real network as the
running example throughout: a 64 → 32 → 16 → 10 digit reader trained with numpy on the UCI optdigits data. Part 2
builds micrograd, the tiny autograd engine, in about a hundred lines. Every number on screen comes from the scripts in
`src/digits/`.

The pages are plain HTML, CSS and JavaScript (Three.js and the fonts are self-hosted in `site/vendor/`). They use ES
modules, so preview them over http (`npm run serve`), not by opening the files directly.

## Layout

- `src/pills/` one template per pill (`NN-slug.template.html`), or the finished page for pills without numbers
- `src/digits/` the numpy scripts, the JSON they write, and the UCI optdigits data they read
- `build.js` pastes each pill's JSON into its template and writes `site/pills/`
- `site/` the website as served: `index.html` plus `pills/`
- `design/` the design documents (objective, pedagogy, prompt, rubric, patterns, pipeline, stages), pending the rewrite for the pill format
- `reference/` Karpathy's lecture transcript and micrograd source, for Part 2

## Build

```sh
node build.js                       # site/pills/*.html from src/
uv sync && cd src/digits && uv run python train.py && uv run python loss.py   # regenerate the numbers (optional)
python3 -m http.server 8765 --bind 127.0.0.1 --directory site               # preview
./publish-check.sh                  # before any push
```

Local preview: `npm run serve`, then open http://127.0.0.1:8765/.

## GitHub Pages

`.github/workflows/site.yml` runs on every push: `node build.js`, html-validate, the page checks and
`./publish-check.sh` (with gitleaks over the full history). On `main` it then deploys `site/` to GitHub Pages. One-time
setup: in the repository's Settings → Pages, set Source to "GitHub Actions".

The scripts run in order: `train.py` writes `net.json`; `loss.py`, `slope.py`, `chain.py`, `neuron.py`, `descent.py`
and `names.py` read it and write their own JSON. All are deterministic (seed 42).

## Data

`src/digits/optdigits.tra` and `optdigits.tes`: Optical Recognition of Handwritten Digits, UCI Machine Learning
Repository (Alpaydin & Kaynak), 3,823 training and 1,797 test pictures of 8 × 8 pixels, values 0–16.

## Credits and licence

Developed by [cvs72](https://github.com/cvs72) using Claude (Anthropic): the pages were planned in conversation and
the code and animations written by Claude Code, directed and reviewed step by step by the developer. They may
contain errors; verify anything you rely on against the original lecture.

This project is not affiliated with, endorsed by or sponsored by Andrej Karpathy. The knowledge in these pages
follows his lecture and notebooks, which he has made publicly available:

- Video: https://www.youtube.com/watch?v=VMj-3S1tku0
- micrograd: https://github.com/karpathy/micrograd
- nn-zero-to-hero: https://github.com/karpathy/nn-zero-to-hero

Micrograd is a complete autograd engine at its smallest expression; this series builds on it, never replaces it.

The pages, scripts and original content of this repository are released under the [MIT License](LICENSE). This does
not apply to anything under `reference/`, which contains Andrej Karpathy's materials and remains under their original
licence and copyright (`reference/micrograd/LICENSE`). Fonts and Three.js under `site/vendor/` keep their own
licences (`site/vendor/README.md`).
