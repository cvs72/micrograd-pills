# Visual patterns (every beat names exactly one)

Rule: if the voice says it, the picture SHOWS it. On-screen text is a label (≤ 4 words), a formula, or code.
A beat with no pattern is a slide; the visual reviewer rejects it.

| # | Pattern | What is on screen | Use it for | Manim notes |
|---|---------|-------------------|------------|-------------|
| 1 | **Machine** | A rounded box with an input slot (left) and an output slot (right). A number physically slides in, the box pulses, a number slides out. Lid can open to reveal knobs or a formula inside. | Any function, a neuron, a layer, the whole network. | `RoundedRectangle`, `DecimalNumber` moving along a path with `MoveAlongPath`; keep the box at the same screen position within a stage. |
| 2 | **Knobs** | Dials on a Machine. Turning one (rotating arrow) changes the output number live. A small label under each knob. | Weights, bias, learning rate, "which way to turn". | `ValueTracker` + `always_redraw`; output recomputed from the project's Value class, never faked. |
| 3 | **Nudge** | A point on a curve, or a value in a graph node. It moves a tiny step (h); a thin arrow shows how far the output moved; the ratio appears as a number. | The derivative, every time. The "+=" bug (two nudges arriving). | Zoom in with `camera.frame` so h is visible; show h then the output change then the ratio, in that order. |
| 4 | **Graph build** | Nodes and arrows appear one at a time in the order the calculation happens. Each node shows its label and value; from stage 2.5 also an empty `grad` slot. | The expression graph, the neuron graph, the loss graph. | Fixed layout per expression (same positions in every stage that reuses it). Node = rectangle with two rows: `data`, `grad`. Op nodes are small circles. |
| 5 | **Trace** | A highlight (a glow or a moving dot) travels along the arrows; numbers fill in as it passes. Forwards: values. Backwards: grads, and the product of local derivatives shown beside the path. | Forward pass, backward pass, chain rule as "multiply along the path". | `ShowPassingFlash` on the arrow, then `Transform` the number. One edge per beat when first shown; whole path per beat when reviewing. |
| 6 | **Side by side** | Two panels, same object, one difference. The difference is highlighted; nothing else moves. | With/without bias; grad overwritten vs accumulated; micrograd vs PyTorch; before/after a training step; probability vs statistics vs calculus. | Split screen with a thin divider; panels share scale and colours. |
| 7 | **Zoom** | Camera dives from a big thing into a small thing (or out). Scale text appears briefly ("150 lines" / "175 billion knobs"). | Micrograd vs GPT scale; one neuron inside a network; "the same thing, bigger". | `MovingCameraScene`; the small thing must be the exact object used elsewhere, not a sketch. |
| 8 | **Map** | The six stage cards in a row, each with its question. Current stage lit; previous ticked; a thread runs through them. | Stage 0 intro; every chapter start ("you are here", 10 s); stage 6 backwards walk. | One reusable `Map` mobject; never redrawn differently. |
| 9 | **Story** | A ten-second concrete scene with no numbers and no formula: a car on a road (speed), a radio dial, a thermostat, a hill in fog (gradient descent). | Filling (R) time with meaning; the lecture's own analogies. | Simple shapes; may later be swapped for a generated clip of the same length. |
| — | **Hold and ask** (timing, not a picture) | The voice asks; the picture freezes; ≥ 3 s silence; then the reveal. | Before every (F) result; at least once per five beats. | `self.wait(hold)` with nothing moving; the caption shows only the question. |

## Colours (same meaning for the whole video)

- inputs / leaf values: blue · weights: orange · bias: yellow · intermediate values: white · the output / loss: red
- slope / grad numbers: green (one colour for "how much the output cares", from stage 1's slope to every grad) · "h", the nudge: magenta · the highlight on a Trace: pale yellow
- Map card current stage: white on dark; done: dim green; not yet: dim grey
Background dark (#0e0e12). Text light. Formulas via `MathTex`, with the same colours as the objects they refer to.

## Typography and motion defaults

- Labels ≥ 36 px at 1080p; nothing closer than 0.3 units to the frame edge.
- Default `run_time` 1.5 s; big changes 2–3 s; `rate_func=smooth`; one thing moves at a time.
- Between beats: 0.8 s; between sections: 2 s; chapter transition: fade out, 1 s black, map card, fade in.
- A beat's duration = its voice clip length / voice_speed + breath (pacing.json), never less. Animation stretches to fit; never the reverse.
