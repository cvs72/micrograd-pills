# Chapter 1 — Foundations: the few pieces of maths this lecture runs on   (PART 1 of the video)
**Question:** What are the few pieces of maths this lecture runs on?
**Lecture source:** his overview 0:29–8:09 (what micrograd is, "which way to turn"); his derivative chapter 8:09–19:11 supplies the worked
examples (f(x) = 3x² − 4x + 5 at x = 3, −3, 2/3; d = a·b + c with a = 2, b = −3, c = 10). Everything else here is ADDED foundation.
**Budget:** 12–15 min. **Levels:** below. **Holds:** 3–4 (the predictions on the second examples).

## Goal
The viewer can say, in their own words: what a function is and how its graph is read; what a slope/derivative is and how it is measured by
nudging; why the nudge is tiny; that each input has its own slope; why we look for a minimum; what a weight, a bias, a squash and a loss
are FOR (named, with one picture each, so chapter 4 and 5 can use the words); and that calculus is the only maths today.

## Handoff to chapter 2
"The viewer can measure a slope by nudging, reads sign = direction and size = sensitivity, knows one slope per input, knows what the words
weight, bias, squash, loss and minimum mean, and that a network is a calculation with knobs."

## Concepts (level · second example?)
A1 what the lecture is about: a calculation with knobs; training = turning them so the answer is less wrong; "which way?" (R) ·
A2 calculus vs probability vs statistics (R) · A3 function = a rule, number in, number out; a pure function for a programmer (R) ·
A4 the graph of a function; the bottom (R) · A5 slope = derivative by nudging; sign and size (F, second example: x = −3 then 2/3) ·
A6 why the nudge is tiny (R) · A7 several inputs, one slope each; × gives the other input, + gives 1 (F, second example: nudge b then c) ·
A8 why we want the minimum: loss = how wrong; bottom = best; slope zero there (R) · A9 weight, bias, squash, loss — named with one picture
each: weight = how much an input matters (a multiplier), bias = an offset, squash = an S-curve that keeps any number between −1 and 1,
loss = one number for how wrong (R, pictures only; the mechanisms are chapters 4–5) · A10 vocabulary contract: knob = parameter = weight/bias;
slope = derivative = gradient/grad (R)

## Misconception
"This is university maths; I'd need years." Four moves in one beat: the belief; why tempting (the words, the symbols); the counter: the
whole lecture uses multiply, add, one squash and one old idea about walking backwards — shown as the parts of the machine; the line:
what is big is only the repetition.

## Vocabulary fixed here (work/vocabulary.md)
knob · machine (a calculation with knobs) · less wrong · function / rule / input / output · curve · the bottom · nudge · slope (= derivative,
= gradient/grad: bound in A10) · the sign · how much the output cares · weight · bias · squash · loss · calculus
Runbook "slope by nudging", spoken in full ONCE (A5, example 1): nudge the input by a thousandth · see how far the output moved · divide by
the nudge · check the ratio. Afterwards: "same three steps".

## Pedagogical arc
Map (T1) → A1 need and framing (T2, R11 one sentence) → A2 one picture, three panels (T6) → A3 function with 3 → 20, then the rule on the
lid; the programmer's view in one sentence (T3) → A4 the curve from many inputs; the bottom pointed at (T3) → misconception beat (T14) →
A5 example 1 at x = 3 with the runbook in full (T10, T17) → A5 example 2: predict the sign at −3 [hold], answer; then 2/3 → zero at the
bottom (T18, T5) → A6 why tiny: a slope belongs to a point; a big step averages a stretch (one picture: two chords vs the tangent) →
A7 example 1: d = a·b + c, nudge a; example 2: predict b [hold], then c (T18, T5) → A8 why the minimum (T2 for chapter 5) → A9 the four
words with one picture each, 20 s each, no mechanism (T12) → A10 equivalence beat (T15) → self-check (T13) → synthesis + handoff (T8).
Permission line in A5; hard moment named before A7's "the other input"; re-anchor after A7. Analogy: speed = slope, once, after A5 (T9).
Returns (work/spiral.md): nudge → 3, 5; sign → 3, 5; the other input → 3, 4; the bottom → 5; squash → 4; loss → 5; which way → every chapter.

## Beats (writers turn these into scripts; VOICE is intent, not final text)
```
1.0  | R | Map          | TECH: T1,T2 | Q: 3 | SCREEN: the six cards; card 1 lit. | VOICE: the chapter question word for word; what the two parts of the video are. | HOLD: n | SRC: added
1.1  | R | Machine+Knobs| TECH: T2,T6,T11 | Q: 1,3 | SCREEN: a box, a grid of pixels in, "cat" out; lid opens on rows of knobs; counter 41 → 175,000,000,000. | VOICE: A1: a network is a calculation with knobs; training turns them so the answer is less wrong; the one question: which way to turn each knob. R11 in one sentence. | HOLD: n | SRC: added (his 0:29–8:09 for what micrograd is)
1.2  | R | Side by side | TECH: T6,T15 | Q: 1,3 | SCREEN: three panels: dice → "70 % cat"; a ruler on "how wrong"; a knob with an arrow. The third lights. | VOICE: A2: three words people lump together; today is calculus: how things change when you nudge them. | HOLD: n | SRC: added
1.3  | R | Machine      | TECH: T3,T6 | Q: 1,2 | SCREEN: box labelled f; 3.0 in, 20.0 out; then the lid: 3x² − 4x + 5, x in blue. | VOICE: A3: a function is a rule, number in, number out; feed it, read it; for a programmer, a pure function. The rule is his. | HOLD: n | SRC: 8:09–8:50
1.4  | R | Graph build→plot | TECH: T3,T6 | Q: 1,3 | SCREEN: inputs −5…5 go in, dots land, the curve joins; the bottom marked. | VOICE: A4: the curve is the function seen all at once; the lowest point is where the output is smallest — remember it. | HOLD: n | SRC: 8:50–10:00
1.5  | R | Machine      | TECH: T14,T7 | Q: 5 | SCREEN: the lid fully open: only ×, +, and an S-shaped part; "1970". | VOICE: misconception, four moves. | HOLD: n | SRC: added
1.6  | F | Nudge        | TECH: T2,T10,T17,T7 | Q: 1,2,3,5 | SCREEN: zoom to x = 3; magenta step 0.001; output 20.0 → 20.014003000000002; ratio 14.00300000000243. | VOICE: need: the curve shows every answer but not "if I nudge the input, which way does the output go"; A5 example 1 with the runbook in full and its check; permission line; his "not symbolic" quotation (the one allowed). | HOLD: n | SRC: 10:03–12:50
1.7  | F | Nudge        | TECH: T18,T5,T11 | Q: 4,5 | SCREEN: x = −3: output 44.0 → 43.978003; ratio −21.996999999998934. Then x = 2/3: 3.666666666666667 → 3.6666696666666665; ratio 0.0029999999995311555. | VOICE: example 2: predict the sign at −3 [HOLD] answer; sign = direction, size = how much the output cares; at 2/3, zero: the bottom (returns in chapter 5). | HOLD: y | SRC: 12:50–14:10
1.8  | R | Side by side | TECH: T2,T6 | Q: 4,5 | SCREEN: the curve at x = 3 with a long chord, a short chord, and the tangent; three ratio numbers from the engine (h = 1, 0.1, 0.001). | VOICE: A6: why tiny — a slope belongs to one point; a big step measures the average over a stretch; shrink it until it stops changing; too tiny and the computer's arithmetic breaks. | HOLD: n | SRC: 11:23–12:43
1.9  | R | Story        | TECH: T9 | Q: — | SCREEN: car, road, speedometer, ten seconds. | VOICE: speed is this ratio; where it stops; retired. | HOLD: n | SRC: added
1.10 | F | Machine+Nudge| TECH: T2,T10,T17,T7 | Q: 1,2,3,5 | SCREEN: three input slots a = 2.0, b = −3.0, c = 10.0 (blue), lid a·b + c, output d = 4.0 (red); nudge a by 0.0001: 3.999699999999999; ratio −3.000000000010772; b's value glows. | VOICE: need: real calculations have many inputs; one slope per input; example 1 on a; "same three steps"; hard moment named: the slope turned out to be b's value. | HOLD: n | SRC: 14:15–17:52
1.11 | F | Nudge        | TECH: T18,T5,T11 | Q: 4,5 | SCREEN: nudge b: 4.0002, ratio 2.0000000000042206, a glows; nudge c: 4.0001, ratio 0.9999999999976694. | VOICE: example 2: predict b's sign [HOLD]; then c: a plus passes the nudge through, slope 1; re-anchor: three inputs, three slopes; for × the other input, for + one — returns in chapter 3. | HOLD: y | SRC: 17:52–19:05
1.12 | R | Graph build→plot | TECH: T2,T11 | Q: 3,5 | SCREEN: a curve labelled "how wrong" with its bottom; a knob under it; the slope arrow at a point pointing downhill. | VOICE: A8: training will push one number — how wrong — down; the bottom is the best knobs; the slope says which way is down; slope zero = nothing left to improve. | HOLD: n | SRC: added (his 2:01–2:05 for direction)
1.13 | R | Side by side | TECH: T12,T6 | Q: 1,3 | SCREEN: four small pictures, 20 s each in turn: a multiplier on an input (weight); an offset slider (bias); the S-curve squashing −6 and +6 to ±0.99999 (squash); the "how wrong" number (loss). Labels only. | VOICE: A9: the four words, what each is for, no mechanism yet (chapters 4 and 5). tanh ≠ trigonometry, one sentence. | HOLD: n | SRC: added
1.14 | R | Side by side | TECH: T15 | Q: 1 | SCREEN: "slope · derivative · gradient · grad" over the same arrow; "knob · parameter · weight / bias" over the same knob. | VOICE: A10: one thing, several names; he uses all of them. | HOLD: n | SRC: added
1.15 | F | Nudge        | TECH: T13 | Q: — | SCREEN: the a, b, c machine, frozen. | VOICE: one question: we nudged a and the slope was b's value — why? [HOLD] "if you can say it, you're ready; if not, the two nudges on the three-input machine." | HOLD: y | SRC: added
1.16 | R | Map          | TECH: T1,T8 | Q: — | SCREEN: card 1 ticked; card 2 lit. | VOICE: synthesis ≤ 3 sentences; handoff; the gap chapter 2 opens (one nudge per input is too slow for 41 knobs, let alone 175 billion). | HOLD: n | SRC: added
```

## Closing synthesis (≤ 3 sentences, interactions)
"A function is a rule, and nudging its input measures its slope: the sign says which way, the size says how much. Every input has its own
slope, and the slope points downhill on the one number we'll want to push down — how wrong. That's the whole toolkit; the only problem is
that it's one nudge per knob, and chapters 2 and 3 fix that."

## Notes for the miner
work_v1/stage1/mined.md and work_v1/stage0/mined.md already hold his steps, numbers and code for 0:29–19:11; reuse them. Add the three
chord ratios for 1.8 (h = 1, 0.1, 0.001 at x = 3, from engine.py). Nothing here is his wording; his one allowed quotation is "we're not
going to take this kind of like a symbolic approach" (10:20).
