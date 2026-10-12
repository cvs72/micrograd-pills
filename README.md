# micrograd-pills

How a neural network learns, in short animated web pages: "knowledge pills" of one to four minutes, one idea each.
Part 1 (twelve pills) takes a reader from the map of AI to the standard vocabulary, with one real network as the
running example throughout: a 64 → 32 → 16 → 10 digit reader trained with numpy on the UCI optdigits data. Part 2
builds micrograd, the tiny autograd engine, in about a hundred lines. Every number on screen comes from the scripts in
`src/digits/`.

The pages are plain HTML, CSS and JavaScript (Three.js r128 from a CDN); the site needs no server.

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

The scripts run in order: `train.py` writes `net.json`; `loss.py`, `slope.py`, `chain.py`, `neuron.py`, `descent.py`
and `names.py` read it and write their own JSON. All are deterministic (seed 42).

## Data

`src/digits/optdigits.tra` and `optdigits.tes`: Optical Recognition of Handwritten Digits, UCI Machine Learning
Repository (Alpaydin & Kaynak), 3,823 training and 1,797 test pictures of 8 × 8 pixels, values 0–16.
