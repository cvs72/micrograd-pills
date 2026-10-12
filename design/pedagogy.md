# Pedagogy v2 — how we explain, with examples

OBJECTIVE.md says what we are doing and for whom; PROMPT.md §4 and §4b are the rules with their fail conditions. This file is the
support: the learner model, the arc every concept walks, the arc table every script opens with, each technique with a passing and
a failing line, the word lists, the protocols. Writers read it before writing; judges cite it as `pedagogy.md T<n>`. If it ever
disagrees with PROMPT.md, PROMPT.md wins and the owner is told.

## 1. The learner (OBJECTIVE.md §2, as rules of thumb)

- **They are fast.** They run clouds. A well-made explanation lands at once; a second telling of it is an insult. One idea, said well, once.
- **They are new to THIS.** A function, a derivative, a loss: first time. New ideas need their five answers (R13) and a breath — not a
  slower voice, not smaller steps, not reassurance.
- **They fail on gaps, never on speed.** A symbol with no meaning, a number from nowhere, a step skipped, a word used before it was
  bound — those lose them. Pace does not.
- **They learn by seeing it work.** One worked example shows it; a second, with their own prediction first, makes it theirs; the
  third sighting, later and named, is when it becomes knowledge (OBJECTIVE §4). Build every (F) concept that way.
- **They are adults.** No quiz voice, no "you're right", no counting cards, no "take your time". Colleague to colleague.

## 2. The arc table (every script opens with it)

One row per concept in the chapter's Concepts list. A cell names the beat id(s) where that step happens; `—` only where the level
does not require it (§3). verify.sh checks presence and ids; the pedagogy judge checks each cell is TRUE by reading the beat.

```
| concept | level | Q1 what | Q2 from where | Q3 what for | Q4 why combined | Q5 why it works | EXAMPLE 1 | EXAMPLE 2 | PREDICT | RETURNS |
```
- Q1–Q5: the five questions (R13). (R) concepts answer all five briefly (Q5 may be "shown, not derived"). (F) concepts answer all five with numbers.
- EXAMPLE 1: the lecture's worked example (Part 2) or ours (Part 1). EXAMPLE 2: the second example (T18) for concepts the stage file marks;
  PREDICT: the beat where the viewer predicts its outcome (T5). RETURNS: the later chapters/beats where the concept comes back (work/spiral.md).

## 3. The per-concept arc

**(R) recognise:** need → the thing, with its five answers, in 15–40 s → one example → consolidated in the synthesis. No prediction required.
**(F) follow:** need → EXAMPLE 1 worked with every number → the five answers (Q4/Q5 shown on the example) → EXAMPLE 2: question, hold,
answer, worked the same way → named return later. The runbook (T10) is spoken in full on EXAMPLE 1 only.

## 4. The per-chapter arc

Map card with the question (T1) → the need for this chapter, as a limit of what the viewer can do after the previous one (T2) → the concepts
in the stage file's order, each on its arc (§3), the misconception beat where the stage file puts it (T14), three or four holds in the whole
chapter (R6), one permission line, the hard moment announced, one re-anchor after the densest beat (T7) → one self-check question (T13) →
synthesis ≤ 3 sentences + handoff + next card (T8).

## 5. The techniques, one by one — a passing line and a failing line

T1 Advance organizer. PASS: "Chapter two. How does a program keep track of how it computed something?" FAIL: "Now let's look at the Value class."
T2 Motivation. PASS: "We can measure one input's slope by nudging it. A network has forty-one. Nudging each one, every step, is the problem
   this chapter solves." FAIL: "The Value class will be useful later."
T3 CRA. PASS: 3 in → 20 out; then the curve; then "that's a function"; then the rule on the lid. FAIL: the formula first.
T4 Load without sub-stepping. PASS: "Nudge a by a ten-thousandth: d drops to 3.9997." FAIL: "Step one, look at a. Step two, add a tiny
   amount to a. Step three, look at d." — for a move an adult makes at once.
T5 Prediction on the second example. PASS: "Same machine, b nudged this time. a is positive. Does d go up or down?" [hold] "Up, by two
   ten-thousandths: the slope is 2, a's value." FAIL: "What do you think the derivative is?" / "If you said up, you're right."
T6 Dual coding, no narration. PASS (card 2 lights): "This is where the graph is born." FAIL: "Card two lights up."
T7 Respect. PASS: "You don't need to calculate any of this; you need to know what it does." FAIL: "Obviously the slope is one." / "Take your time."
T8 Consolidation. PASS: "A function is a rule; nudging it measures its slope; the sign says which way. That's the whole toolkit — and it
   is one nudge per input, which is what chapter three replaces." FAIL: "We covered functions, slopes and signs."
T9 Analogy. PASS: after the slope exists: "Speed is this: nudge the time, see how far you moved. A car can't run backwards in time — our
   slope can be negative. Keep the speedometer, then drop it." FAIL: opening the chapter with the car.
T10 Procedure, once. PASS: full three steps with the check on x = 3; then "same three steps" at −3 with the numbers shown. FAIL: the three
   steps recited five times.
T11 Spiral. PASS (chapter 3): "That's chapter one's nudge, now done for every node at once." FAIL: calling it "the perturbation".
T12 Foundations first. PASS (chapter 4): "tanh is the squash from chapter one, S-shaped, −1 to 1." FAIL: a 60 s primer on S-curves in chapter 4.
T13 Self-check. PASS: one question, a hold, "if you can answer that, you're ready; if not, re-watch the nudge at minus three." FAIL: a quiz.
T14 Misconception. PASS: belief, why tempting, counter-example with numbers, correct line — one beat. FAIL: "note that functions aren't equations."
T15 Vocabulary. PASS: "He calls it the derivative; we've been saying slope. One thing, two names; from here, either." FAIL: switching to
   "gradient" unannounced.
T16 Code, read. PASS: "`self.grad += out.grad * other.data` — this value's grad gets the grad from above times the other input." FAIL: a
   cell of eight lines and "as you can see".
T17 Complete, not repetitive. PASS: every intermediate number shown once. FAIL: "and so on" / the same forward pass computed twice in full.
T18 Second example. PASS: the d = a·b + c machine after f(x): same picture, the viewer predicts the sign. FAIL: an (F) concept with one
   example only, or a second example drawn differently.

## 6. Word lists

**Banned (R8, T7):** you're right · if you said X you're right · take your time · don't worry · obviously · simply · just (as merely) ·
trivial · easy · clearly · of course · as you know · as you can see · let us · consider · note that · it can be shown · respectively ·
and so on · similarly · skipping ahead · any sentence that only names what is on screen (card lit, number changed, arrow appeared).
**Required once per chapter (T7):** a permission line · the hard moment named before it arrives · a re-anchor after the densest beat.
**Fixed runbooks (T10):** spoken in full on first use, recorded in work/vocabulary.md, afterwards named: "slope by nudging" (nudge the input
by a thousandth · see how far the output moved · divide by the nudge · check); "forward pass"; "backward pass"; "one training step".

## 7. Protocols

**Second example (T18, T5):** same pattern and colours as the first · the voice states what changes ("b this time") · question with a
directional/binary answer · hold ≥ 2 s · the answer with its numbers · one sentence on what the two examples have in common.
**Analogy (T9):** real thing on screen → "X is like Y: the A is the B" → used once → where it stops → retired.
**Misconception (T14):** the belief in the viewer's words → why it is tempting → the counter-example with numbers on screen → the correct line.
**Equivalence beat (T15):** both words over the same object; "one thing, two names"; nothing else new in the beat.
**Self-check (T13):** one question from the chapter's goal · hold · "ready / re-watch <section>".
