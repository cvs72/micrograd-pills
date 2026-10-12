# Chapter 3 — Walking backwards
**Question:** How do we get every gradient in one pass instead of nudging each input?
**Lecture source:** 32:11 manual backpropagation #1; 51:10 one optimisation step (to 52:52).
**Budget:** 10–12 min. **Holds:** 4 (this is the heart). Assumes chapters 1–2.

## Goal
Do the backward pass once with his numbers and get L.grad = 1, f.grad = 4, d.grad = −2, c.grad = −2, e.grad = −2, a.grad = 6, b.grad = −4;
say the chain rule in words and why it is multiplication; predict that nudging a leaf along its grad raises L, and see it.

## Handoff to chapter 4
"The viewer has filled every grad by walking backwards, multiplying local slopes, and has seen one nudge step raise L." Automation is chapter 4.

## Concepts (level · second example?)
C1 dL/dL = 1 (F) · C2 local slope of one step: × → the other input, + → 1 (chapter 1's observation, now the rule) (F) · C3 the chain rule:
effects along a chain multiply (R intuition, then F) · C4 the backward pass: start at the end, step back one arrow at a time, multiply; one
walk fills every grad (F, second example: the path to a and b after the path to c) · C5 check one grad by nudging (F) · C6 one optimisation
step: nudge every leaf along its grad; L rises; against it, L falls — that is training (F, second example: the step in the other direction, ours)

## Misconception
"Backwards means undoing." Four moves: belief; why tempting (the word); counter: nothing changes, we only ask each node a question and the
answer at each node is built from the next node's answer — shown on the first edge; line: walk the arrows in reverse, nothing is undone.

## Vocabulary fixed here
local slope · chain · the other input · routing (+ passes the grad through) · backward pass · one step
Runbook "backward pass", in full once: start at the end with 1 · step back one arrow · multiply the grad after it by this step's local slope ·
write it in the slot · repeat until the inputs. Afterwards: "same walk".

## Pedagogical arc
Map (T1) → need: 41 slots, one nudge each is too slow (T2) → misconception (T14) → C1 the end cares about itself exactly 1 (T3) → C2 the first
edge back: L = d·f, so d's slope is f's value — chapter 1's "the other input", now a rule (T11) → C3 chain rule as a story (car/bike/walker,
his 41:52) after the real thing (T9), then as the multiplication beside the path (T3) → C4 example 1: the path to c (+ routes the grad
through, −2); example 2: predict a's sign [hold], the longest path a → e → d → L: −3 × −2 = 6, and b (T18, T5, T17) → runbook in full
once (T10) → C5 his numerical check on a (T11: chapter 1's nudge) → C6 example 1: every leaf nudged by 0.01 × grad; predict L up or down
[hold]; L: −8 → −7.286496; example 2 (ours, added): the other direction, L falls — "that is training" (T18, T2 for chapter 5) → self-check →
synthesis + handoff. Permission: "you never do this by hand after today". Hard moment: the chain rule. Re-anchor after C4.
Returns: backward pass → 4, 5; the other input → 4; routing → 4; one step → 5.

## Beats
```
3.0  | R | Map          | TECH: T1,T2 | Q: 3 | SCREEN: card 3 lit. | VOICE: question word for word; why this chapter is the one the lecture exists for. | HOLD: n | SRC: added
3.1  | R | Side by side | TECH: T14 | Q: 5 | SCREEN: left: a video rewinding; right: the graph with a question mark walking the arrows backwards. | VOICE: misconception, four moves. | HOLD: n | SRC: added
3.2  | F | Trace        | TECH: T3,T17 | Q: 1,2,5 | SCREEN: L's grad fills: 1.0. | VOICE: C1: how much does L change if we nudge L — by exactly that much; 1. | HOLD: n | SRC: 32:11–34:12
3.3  | F | Trace        | TECH: T11,T3 | Q: 2,4,5 | SCREEN: back one edge: L = d·f; d.grad = −2.0 (f's value), f.grad = 4.0 (d's value); the local rule shown beside the edge. | VOICE: C2: chapter 1's observation is now the rule — for a ×, the local slope is the other input; shown with the numbers. | HOLD: n | SRC: 34:12–38:30
3.4  | R | Story        | TECH: T9 | Q: — | SCREEN: car 2× bike, bike 4× walker → car 8× walker. | VOICE: C3 intuition in his car/bike story: effects along a chain multiply; retired. | HOLD: n | SRC: 41:52–43:40
3.5  | F | Trace        | TECH: T10,T17,T7 | Q: 1,4,5 | SCREEN: path L ← d ← c: local slope of + is 1; c.grad = 1 × d.grad = −2.0; e.grad the same; the product written beside the path. | VOICE: C4 example 1 with the runbook in full and its check; hard moment named: the chain rule is just this multiplication. | HOLD: n | SRC: 38:30–46:19
3.6  | F | Trace        | TECH: T18,T5,T17 | Q: 4,5 | SCREEN: path L ← d ← e ← a: predict a's sign [HOLD]; de/da = b = −3.0, × e.grad −2.0 → 6.0; b.grad = 2.0 × −2.0 = −4.0. | VOICE: example 2: the longest chain, three numbers multiplied; same walk. Re-anchor: one walk, every slot full. | HOLD: y | SRC: 46:19–50:10
3.7  | F | Nudge        | TECH: T11,T17 | Q: 5 | SCREEN: nudge a by 0.001; L moves by 0.006; ratio 6. | VOICE: C5: his check — chapter 1's nudge confirms the walk. | HOLD: n | SRC: 50:04–51:10
3.8  | F | Knobs        | TECH: T5,T18,T2 | Q: 3,4,5 | SCREEN: a, b, c, f each nudged by 0.01 × its grad; predict L up or down [HOLD]; forward again: L −8.0 → −7.286496. | VOICE: C6 example 1: along the grad, L rises — that is what the sign means. | HOLD: y | SRC: 51:10–52:52
3.9  | F | Knobs        | TECH: T18,T2,T11 | Q: 3,5 | SCREEN: the same step with the minus sign: L falls (engine number). | VOICE: example 2 (added): against the grad, L falls; push "how wrong" down this way, repeatedly, and you have training — chapter 5. | HOLD: n | SRC: added
3.10 | F | Trace        | TECH: T13 | Q: — | SCREEN: the graph frozen with all grads. | VOICE: one question: why is a's grad six? [HOLD] ready / re-watch the longest path. | HOLD: y | SRC: added
3.11 | R | Map          | TECH: T1,T8 | Q: — | SCREEN: card 3 ticked, card 4 lit. | VOICE: synthesis ≤ 3 sentences; handoff. | HOLD: n | SRC: added
```

## Closing synthesis
"Start at the end, where L cares about itself exactly 1, and step back one arrow at a time, multiplying by each step's local slope — the
other input for a ×, 1 for a +. That multiplication along the path is the chain rule, and one walk fills every grad. Nudge every knob along
its grad and L goes up; against it, down — which is training, once we have something worth training."

## Notes for the miner
work_v1/stage3/mined.md has his steps and numbers. The step-in-the-other-direction (3.9) is ours: compute it with engine.py.
