# Chapter 2 — A calculation that remembers   (PART 2 begins)
**Question:** How does a program keep track of how it computed something?
**Lecture source:** 19:11 the Value object and its visualisation (to 32:11). His order, his examples, his numbers, his code.
**Budget:** 8–10 min. **Holds:** 3. Assumes chapter 1 and nothing else.

## Goal
Read his expression graph (a, b, c, e, d, f, L) from inputs to L; say what each node remembers (its number, its two parents, the operation);
read `Value`, `data`, `_prev`, `_op`, `__add__`, `__mul__` in words; say what the empty grad slot is waiting for and why it must exist.

## Handoff to chapter 3
"The viewer reads the graph, knows forward = left to right, knows grad means 'how much does L care about me' and that it is empty."

## Concepts (level · second example?)
B1 the Value object: a number that remembers where it came from (R) · B2 the graph: nodes and arrows; the picture of the memory (R) ·
B3 forward pass: left to right, each node from its parents (F, second example: his second expression with f and L after e, d) ·
B4 the grad slot: the question "how much does L care about me", empty (R) · B5 reading his code: Value(…), data, _prev, _op, __add__, __mul__,
label — one line per beat, read in words (R; code is (F) for readers) · why the memory: 41 knobs cannot be nudged one at a time (R, need)

## Misconception
"Code just runs; nothing is remembered." Four moves: the belief; why tempting (a calculator forgets); the counter: `d = e + c` stores e and c
in d's pocket, shown; the line: the graph IS the memory, and chapter 3 walks it.

## Vocabulary fixed here
Value (a wrapped number) · pocket / came from (`_prev`) · operation (`_op`) · node · arrow · graph · forward pass · grad slot · label

## Pedagogical arc
Map (T1) → need: chapter 1's one-nudge-per-input vs 41 knobs (T2) → B1 the plain number 2.0 becomes a Value card with pockets (T3) →
B5 his first two lines read aloud (T16) → B2 a·b + c as two boxes, then as a graph: a, b → e; e, c → d, pockets filling as it happens (T3) →
misconception beat (T14) → B3 example 1: forward pass left to right on a, b, c; example 2: he adds f and L — predict L's sign [hold] (T18, T5)
→ B5 __add__/__mul__ read aloud, one line each (T16) → his draw_dot picture, our colours (T6) → B4 the grad slot appears on every node, 0.0,
with its question; grad defused (R12) → self-check (T13) → synthesis + handoff (T8).
Permission: "you'll never write this code; you need to read it". Hard moment: the pockets (what `_prev` holds). Re-anchor after __mul__.
Returns: forward pass → 3, 4, 5; grad slot → 3; the graph → 4, 5.

## Beats
```
2.0  | R | Map          | TECH: T1,T2 | Q: 3 | SCREEN: card 1 ticked, card 2 lit. | VOICE: question word for word; the need from chapter 1's handoff. | HOLD: n | SRC: added
2.1  | R | Machine      | TECH: T3,T6,T11 | Q: 1,2,3 | SCREEN: 2.0 alone; it becomes a card: data 2.0, two empty pockets, label a. | VOICE: B1: a Value is a number that remembers where it came from; why he wraps numbers (19:11–20:40, our words). | HOLD: n | SRC: 19:11–21:00
2.2  | R | Graph build  | TECH: T16,T7 | Q: 1,2 | SCREEN: `class Value:` / `def __init__(self, data, _children=(), _op='')` with data, _children, _op glowing with the card's parts. | VOICE: B5: the line read in words; permission line. | HOLD: n | SRC: 20:40–22:58
2.3  | R | Graph build  | TECH: T3,T6 | Q: 1,4 | SCREEN: a·b + c as two boxes; then a, b → e (pocket {a, b}, op ×); e, c → d. | VOICE: B2: the calculation as a chain of small steps; each result carries its parents; hard moment named: the pockets. | HOLD: n | SRC: 22:58–25:40
2.4  | R | Side by side | TECH: T14 | Q: 5 | SCREEN: left: a calculator showing 4; right: d's card with its pockets open. | VOICE: misconception, four moves. | HOLD: n | SRC: added
2.5  | F | Trace        | TECH: T10,T17 | Q: 1,3,5 | SCREEN: the graph a = 2.0, b = −3.0, e = −6.0, c = 10.0, d = 4.0; a highlight runs left to right. | VOICE: B3 example 1: the forward pass, runbook in full (compute each node from its parents, left to right; check the output). | HOLD: n | SRC: 25:40–29:00
2.6  | F | Trace        | TECH: T18,T5 | Q: 4,5 | SCREEN: he adds f = −2.0 and L = d·f; predict L's sign [HOLD]; L = −8.0 fills. | VOICE: example 2: why a single output (L); the sign question; same pass. | HOLD: y | SRC: 28:40–29:30
2.7  | R | Graph build  | TECH: T16 | Q: 1,4,5 | SCREEN: `def __mul__(self, other): out = Value(self.data * other.data, (self, other), '*')`, symbols glowing with e's card. | VOICE: B5: the line read in words: the result's number, its two parents, its operation; __add__ the same with +. Re-anchor. | HOLD: n | SRC: 21:00–25:30
2.8  | R | Graph build  | TECH: T6,T11 | Q: 1 | SCREEN: his draw_dot layout in our colours: inputs blue, intermediates white, L red; op circles. | VOICE: the same picture he draws, read once. | HOLD: n | SRC: 25:40–28:40
2.9  | R | Graph build  | TECH: T2,T12 | Q: 1,3,5 | SCREEN: every card grows a second row: grad 0.0, green. | VOICE: B4: the slot and its question — how much does L care about me; zero = not asked yet; "grad" defused; this is chapter 1's slope, one per node, filled by chapter 3. | HOLD: n | SRC: 30:00–32:11
2.10 | F | Trace        | TECH: T13 | Q: — | SCREEN: the graph frozen. | VOICE: one question: what does d's card remember? [HOLD] ready / re-watch the pockets. | HOLD: y | SRC: added
2.11 | R | Map          | TECH: T1,T8 | Q: — | SCREEN: card 2 ticked, card 3 lit. | VOICE: synthesis ≤ 3 sentences; handoff. | HOLD: n | SRC: added
```

## Closing synthesis
"Wrapping numbers in Values makes every result remember its parents and its operation, and that memory is a graph. Reading it left to right
is the forward pass. Every node has an empty grad — chapter 1's slope, one per node — and chapter 3 fills all of them in one walk backwards."

## Notes for the miner
work_v1/stage2/mined.md has his steps and numbers; reuse. The code lines quoted on screen are his, verbatim from the notebook.
