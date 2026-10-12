# Chapter 4 — One neuron
**Question:** What does a neuron compute, and why those three pieces?
**Lecture source:** 52:52 manual backprop #2 (a neuron); 1:09:05 backward per operation; 1:17:36 whole graph; 1:22:32 the += bug;
1:27:05 breaking up tanh; 1:39:33 PyTorch (to 1:43:55).
**Budget:** 12–14 min. **Holds:** 4. Assumes chapters 1–3.

## Goal
Name the three parts of a neuron and say why each exists; follow his neuron (x1 = 2, x2 = 0, w1 = −3, w2 = 1, b = 6.8813735870195432,
n = 0.8813735870195432, o = tanh(n) = 0.7071067811865476) backwards to w1.grad = 1.0, w2.grad = 0, x1.grad = −1.5, x2.grad = 0.5; say why
grads must add when a value is used twice; say "topological order" in words; see PyTorch give the same numbers.

## Handoff to chapter 5
"The viewer knows a neuron = weighted sum + bias → squash, can call .backward() on it and trust the grads, and knows why +=."

## Concepts (level · second example?)
D1 weight = importance (a multiplier) — chapter 1's word, now the mechanism (R) · D2 bias = an offset so the neuron can shift its zero (R) ·
D3 the weighted sum x1·w1 + x2·w2 + b (F) · D4 the squash tanh: an S-curve into −1…1, flat ends; its slope is 1 − o², looked up, not
derived (R; chapter 1's squash) · D5 why these three pieces (R) · D6 one backward rule per operation, stored in the node (F, second example:
the + rule after the × rule) · D7 topological order: a node only after everything it came from (R) · D8 grads add when a value is used twice
(F, second example: his a·b, a+b case after b = a + a) · D9 PyTorch gives the same numbers (R)

## Misconception
"A neuron is mysterious biology / tanh is trigonometry." Four moves in one beat: belief; why tempting (the names); counter: the three
parts on screen with their numbers; the line: a weighted vote, an offset, a squash.

## Vocabulary fixed here
neuron · weighted sum · tanh (the squash) · saturated · _backward (the node's own rule) · topological order · accumulate (+=)

## Pedagogical arc
Map → need: chapter 3's graph was any calculation; what calculation does a network actually run? (T2) → D1–D3 the three parts, each with
its number live (T3, T12: chapter 1's words) → misconception beat (T14) → D4 the squash: 0.88 in → 0.707 out, −6 → −0.99999; the slope
1 − o² "looked up" (T3, R12) → D5 why three pieces, 20 s (T8-style) → the neuron as a graph: same Values, one new op (T11) → backward by hand:
o.grad = 1, n.grad = 0.5, b and the two products 0.5, then x1·w1: his "can you think through what this should be" kept as the hold (T5) →
D6 example 1: the × rule written into the node as `_backward`; example 2: predict what the + rule must be [hold] (T18, T16) → D7 order in
words, then `backward()` presses every rule in reverse (T16) → D8 example 1: b = a + a overwrites → wrong; example 2: his a·b, a+b case,
predict f's grad on a [hold]; grads add (T18, T5) → breaking tanh into exp and division: the grads agree (R; compressed) → D9 PyTorch side
by side, same six numbers → self-check → synthesis + handoff. Permission: "you never derive tanh's slope; you look it up". Hard moment: +=.
Returns: weighted sum → 5; squash → 5, 6; += → 5 (zero_grad); backward() → 5.

## Beats
```
4.0  | R | Map          | TECH: T1,T2 | Q: 3 | SCREEN: card 4 lit. | VOICE: question word for word; the need. | HOLD: n | SRC: added
4.1  | R | Machine+Knobs| TECH: T3,T12,T11 | Q: 1,2,3,4 | SCREEN: inputs x1 = 2.0, x2 = 0.0 (blue); knobs w1 = −3.0, w2 = 1.0 (orange); the sum −6.0 + 0.0 = −6.0 live. | VOICE: D1, D3: weights are chapter 1's multipliers; why multiply (an unimportant input gets a tiny weight); x2 with weight 1 and value 0 contributes nothing. | HOLD: n | SRC: 52:52–54:32
4.2  | R | Side by side | TECH: T3,T12 | Q: 1,3,4 | SCREEN: left: the sum alone, stuck at −6.0; right: a yellow knob b = 6.8813735870195432 slides the output to 0.8813735870195432. | VOICE: D2: the bias shifts where the neuron's zero is; without it the sum can't move past its inputs. | HOLD: n | SRC: 53:30–54:30
4.3  | R | Machine      | TECH: T14 | Q: 5 | SCREEN: the three parts labelled with their numbers; "tanh ≠ tan". | VOICE: misconception, four moves. | HOLD: n | SRC: added
4.4  | R | Machine      | TECH: T3,T12,T7 | Q: 1,3,4,5 | SCREEN: the S-curve; 0.8813735870195432 in → 0.7071067811865476 out; −6 → −0.9999877116507956; +6 → 0.9999877116507956; the slope 1 − o² = 0.4999999999999999 beside it. | VOICE: D4: chapter 1's squash, now with numbers; flat ends = saturated; its slope is looked up; permission line; why 6.88 (nice numbers, his words paraphrased as fact, not quoted). | HOLD: n | SRC: 54:32–56:43
4.5  | R | Graph build  | TECH: T11,T6 | Q: 1,2 | SCREEN: the whole neuron as a graph: x1·w1, x2·w2, their sum, + b → n, tanh → o; grads 0. | VOICE: D5: same Values as chapter 2, one new operation; three parts, three reasons. | HOLD: n | SRC: 56:43–59:33
4.6  | F | Trace        | TECH: T10,T17,T5 | Q: 2,4,5 | SCREEN: o.grad = 1.0; n.grad = 0.4999999999999999; b.grad and both products 0.5; then x1.grad = w1·0.5 = −1.5, w1.grad = x1·0.5 = 1.0, x2.grad = 0.5, w2.grad = 0.0. His hold kept before x1·w1. | VOICE: chapter 3's walk, same words, one new local slope; predict w2's grad [HOLD]. | HOLD: y | SRC: 59:33–1:09:05
4.7  | F | Graph build  | TECH: T2,T16,T18 | Q: 1,3,4,5 | SCREEN: the × node grows a `_backward` tag; `self.grad += out.grad * other.data` read aloud; press it: the grads fill. | VOICE: D6 example 1: each operation stores its own rule; need: "we don't want to do this by hand"; permission. | HOLD: n | SRC: 1:09:05–1:14:00
4.8  | F | Graph build  | TECH: T18,T5,T16 | Q: 4,5 | SCREEN: the + node: predict its rule [HOLD]; `self.grad += out.grad` — pass it through. | VOICE: example 2: chapter 3's routing, now a line of code. | HOLD: y | SRC: 1:14:00–1:17:36
4.9  | R | Graph build  | TECH: T16,T3 | Q: 1,3,4 | SCREEN: the nodes line up in order, every node after its parents; `backward()` runs the list in reverse; all grads fill at once. | VOICE: D7: in words — a node only after everything it came from; the list reversed; one call. | HOLD: n | SRC: 1:17:36–1:22:32
4.10 | F | Side by side+Nudge | TECH: T18,T5,T7 | Q: 4,5 | SCREEN: left: a = 3, b = a + a, backward → a.grad = 1 (wrong, overwritten); right: two arrows arrive, 1 + 1 = 2. Then his a = −2, b = 3, d = a·b, e = a + b, f = d·e: predict a's grad [HOLD]; engine numbers. | VOICE: D8: hard moment named; example 1 the bug, example 2 his second case; grads add; re-anchor. | HOLD: y | SRC: 1:22:32–1:27:05
4.11 | R | Side by side | TECH: T6 | Q: 5 | SCREEN: tanh as one box vs built from exp and division; backward through both; the same grads. | VOICE: compressed: the level of detail is ours to choose; the grads agree either way. | HOLD: n | SRC: 1:27:05–1:39:33
4.12 | R | Side by side | TECH: T11,T6 | Q: 5 | SCREEN: micrograd's graph vs PyTorch code; the same six numbers. | VOICE: D9: identical; tensors are for many numbers at once; nothing was magic. | HOLD: n | SRC: 1:39:33–1:43:55
4.13 | F | Trace        | TECH: T13 | Q: — | SCREEN: the neuron frozen. | VOICE: one question: a value used twice — what happens to its grad? [HOLD] ready / re-watch the two arrows. | HOLD: y | SRC: added
4.14 | R | Map          | TECH: T1,T8 | Q: — | SCREEN: card 4 ticked, card 5 lit. | VOICE: synthesis ≤ 3 sentences; handoff. | HOLD: n | SRC: added
```

## Closing synthesis
"A neuron is three parts with three reasons: weights so inputs can matter more or less, a bias so it can shift its zero, a squash so the
output stays tame. It's the same graph as before with one new operation, so the same backward walk works — now stored in each node and run
by one call, with the one trap that a value used twice adds its grads. Chapter 5 asks it 'which way' a thousand times."

## Notes for the miner
work_v1/stage4/mined.md has his steps and numbers. Compute tanh(±6) and 1 − o² with engine.py for 4.4.
