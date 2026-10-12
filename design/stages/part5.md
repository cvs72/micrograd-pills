# Chapter 5 — Many neurons, and training
**Question:** How do the knobs get turned on their own?
**Lecture source:** 1:43:55 building an MLP; 1:51:08 dataset and loss; 1:58:01 parameters; 2:01:18 gradient descent and the loop (to 2:14:03).
**Budget:** 12–14 min. **Holds:** 4. Assumes chapters 1–4.

## Goal
Narrate one training step in order (forward, loss, zero the grads, backward, nudge every knob a little against its grad) and say why the
minus and why "a little"; follow his run: MLP(3, [4, 4, 1]), 41 knobs, four examples, the loss falling from its first value toward zero;
name the two classic bugs (forgetting zero_grad; a step too big).

## Handoff to chapter 6
"The viewer can narrate a training step and knows what each chapter contributed to it."

## Concepts (level · second example?)
E1 layer and MLP: neurons sharing inputs; layers stacked; 41 knobs (R) · E2 dataset: inputs with desired answers (R) · E3 loss: one number
for how wrong, from squared differences, built from Values so it has a graph reaching every knob (F, second example: the loss for one
example, then for all four) · E4 why squared (R) · E5 gradient descent: grad = direction of MORE loss; step a little the other way; repeat
(F, second example: the second step after the first) · E6 learning rate — why a little (R; his overshoot) · E7 zero_grad — why (R; chapter 4's +=)
· E8 the loop (F)

## Misconception
"Training is the computer figuring it out." Four moves: belief; why tempting; counter: chapter 3's step, shown again on the loss, is all
that happens; line: the loss pushed down, repeatedly — nothing else is new.

## Vocabulary fixed here
layer · MLP · dataset · target · loss (chapter 1's "how wrong", now built) · gradient descent · learning rate · zero_grad · a training step
Runbook "one training step", in full once: forward · loss · zero the grads · backward · nudge every knob against its grad. Afterwards: "the step".

## Pedagogical arc
Map → need: one neuron gives one number; we want answers to real inputs (T2) → E1 one neuron, three sharing inputs, layers stacked, zoom
out: 41 knobs (T3, T11) → E2 four inputs with their targets; the network's current, wrong outputs (T3) → E3 example 1: one example's
(out − target)²; example 2: predict which of the four contributes most [hold]; the sum: the loss, a Value with a graph to every knob
(T18, T5) → E4 why squared, one sentence → misconception (T14) → `parameters()`: the 41 knobs listed (T16) → `loss.backward()`: the flood
back through all 41 (T11) → E5 example 1: one knob with grad +0.4 — the arrow says the loss goes UP this way, so turn the other way; all 41
move; the loss falls (his number); example 2: predict the second step's effect [hold] (T18, T5) → E6 why a little: the overshoot, his
learning-rate remarks (T3) → E8 the loop as five tiles with the runbook in full; iterations tick; the loss curve falls to his final value
(T10, T17) → E7 his slip: the step without zero_grad; chapter 4's += (T11, T14-style) → self-check → synthesis + handoff. Permission:
"you don't need to pick the learning rate; you need to know what it does". Hard moment: the loss having a graph to every knob.
Returns: the loss → 6; the step → 6; everything → 6.

## Beats
```
5.0  | R | Map          | TECH: T1,T2 | Q: 3 | SCREEN: card 5 lit. | VOICE: question; need. | HOLD: n | SRC: added
5.1  | R | Machine→Zoom | TECH: T3,T11 | Q: 1,2,3,4 | SCREEN: one neuron; three copies sharing inputs = a layer; 3 → 4 → 4 → 1; zoom out: "41 knobs". | VOICE: E1: his Neuron, Layer, MLP, in words; why stack only as far as he says. | HOLD: n | SRC: 1:43:55–1:51:08
5.2  | R | Side by side | TECH: T3 | Q: 1,3 | SCREEN: four input rows, four targets (1, −1, −1, 1), the network's outputs beside them (engine numbers). | VOICE: E2: we want these to be those. | HOLD: n | SRC: 1:51:08–1:53:00
5.3  | F | Graph build  | TECH: T3,T17 | Q: 1,2,4,5 | SCREEN: example 1: (out − target)² for the first example, as a small graph; its number. | VOICE: E3 example 1; E4 why squared in one sentence. | HOLD: n | SRC: 1:53:00–1:55:00
5.4  | F | Graph build  | TECH: T18,T5,T7 | Q: 4,5 | SCREEN: the four squared differences; predict the biggest [HOLD]; they sum into one red node: the loss (his first value). | VOICE: example 2; the loss is a Value with a graph reaching every knob — hard moment named. | HOLD: y | SRC: 1:55:00–1:58:01
5.5  | R | Side by side | TECH: T14 | Q: 5 | SCREEN: left: a "thinking" computer; right: chapter 3's step on the loss graph. | VOICE: misconception, four moves. | HOLD: n | SRC: added
5.6  | F | Trace        | TECH: T16,T11 | Q: 1,3 | SCREEN: `parameters()` → the list of 41 Values; `loss.backward()` → the flood back; 41 green grads. | VOICE: the 41 knobs collected; chapter 3's walk, now through everything. | HOLD: n | SRC: 1:58:01–2:01:18
5.7  | F | Knobs+Nudge  | TECH: T10,T17,T5 | Q: 1,3,4,5 | SCREEN: one knob with grad +0.4; the arrow says the loss goes UP this way; `p.data += -0.01 * p.grad`; all 41 move; forward; the loss falls (his number). | VOICE: E5 example 1 with the runbook in full; why the minus. Predict: after the step, the loss — up or down? [HOLD] | HOLD: y | SRC: 2:01:18–2:05:00
5.8  | F | Trace        | TECH: T18,T5 | Q: 5 | SCREEN: the second step; predict whether it falls as much [HOLD]; his second loss value. | VOICE: example 2; "the step", named. | HOLD: y | SRC: 2:05:00–2:06:00
5.9  | R | Nudge+Story  | TECH: T9,T3,T11 | Q: 3,4,5 | SCREEN: the fog-hill walker: small steps reach the bottom; a huge step jumps the valley; learning rate 0.01 vs 1.0 on the loss curve. | VOICE: E6: why a little; chapter 1's bottom; his overshoot. | HOLD: n | SRC: 2:06:00–2:08:00
5.10 | F | Trace        | TECH: T10,T17 | Q: 1,4 | SCREEN: five tiles: forward → loss → zero_grad → backward → update; iterations tick; the loss curve falls to his final value; outputs ≈ targets. | VOICE: E8: the loop, named once; that is training. | HOLD: n | SRC: 2:05:00–2:10:00
5.11 | R | Side by side | TECH: T11,T7 | Q: 3,5 | SCREEN: left: the loop without zero_grad, grads piling up, the loss misbehaving; right: with it. | VOICE: E7: his own slip; chapter 4's += is why; re-anchor. | HOLD: n | SRC: 2:10:00–2:13:00
5.12 | F | Trace        | TECH: T13 | Q: — | SCREEN: the five tiles frozen. | VOICE: one question: why the minus sign in the update? [HOLD] ready / re-watch the one knob with grad +0.4. | HOLD: y | SRC: added
5.13 | R | Map          | TECH: T1,T8 | Q: — | SCREEN: card 5 ticked, card 6 lit. | VOICE: synthesis ≤ 3 sentences; handoff. | HOLD: n | SRC: added
```

## Closing synthesis
"A network is neurons in layers — 41 knobs here — and the loss is one number for how wrong, built from the same Values, so it has a graph
that reaches every knob. One backward walk tells every knob which way raises the loss; we turn each a little the other way; the loss falls;
repeat. The only new piece since chapter 3 was the loss — and the two things that go wrong are forgetting to zero the grads and stepping too far."

## Notes for the miner
work_v1/stage5/mined.md has his steps and numbers (the loss values per iteration come from running his code with engine.py).
