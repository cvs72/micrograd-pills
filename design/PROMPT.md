# MASTER PROMPT v2 — "Backpropagation from zero" (the micrograd lecture, for IT professionals without the foundations)

Every agent reads OBJECTIVE.md first, then this file, every time. The stage files refine both; they never contradict them.
Files: OBJECTIVE.md · PROMPT.md (this) · pedagogy.md · stages/part1.md … part6.md · patterns.md · rubric.md · pipeline.md · work/v2/concepts.md · reference/

## 1. What we are making

OBJECTIVE.md §1. One standalone video in two parts (published as two files): Part 1 gives the foundations Karpathy's audience
already had; Part 2 explains his lecture in his order, with his examples, numbers and code, in OUR words. Style: 3Blue1Brown.
Voice: the owner's cloned voice. Renderer: Manim; every number on screen is computed by src/*/engine.py, never typed in.

## 2. The viewer, as a learner

OBJECTIVE.md §2: an experienced IT adult, fast and abstract, meeting these ideas for the first time. Two levels, declared per concept:
- **(R) recognise**: the five questions (§4 R13) answered; never asked to compute. Primer length 15–40 s, once.
- **(F) follow**: can follow the lecture's worked example step by step and predict the outcome of the second example before it is shown.
There is no "do it yourself" level; the video does the exercise visibly (OBJECTIVE §4).

## 3. The map — six parts, one question each (shown in full at the start, "you are here" at every chapter start, walked backwards at the end)

1. Foundations — What are the few pieces of maths this lecture runs on?
2. A calculation that remembers — How does a program keep track of how it computed something?
3. Walking backwards — How do we get every gradient in one pass instead of nudging each input?
4. One neuron — What does a neuron compute, and why those three pieces?
5. Many neurons, and training — How do the knobs get turned on their own?
6. The map, backwards — Why did each piece have to exist, and what is the same at GPT scale?

Part 1 = chapter 1 (budget 12–15 min). Part 2 = chapters 2–6 (8–14 min each). Syllabus and per-concept budgets: work/v2/concepts.md.
Each chapter ends with a synthesis (how its concepts interact, ≤ 3 sentences) and a one-line handoff (what the next chapter may assume).

## 4. The rules (the judges reject on any of these)

R1 **Why before what.** Every new symbol, operation, object, code line or step is preceded by the problem it solves, in the viewer's
    terms. Never "it will be useful later".
R2 **Our words, his content.** Part 2 follows his order, his examples, his numbers, his code, and explains every step and word he uses —
    in our own sentences. His transcript is evidence of WHAT to cover, never text to reuse. At most one short quotation of his per
    chapter, credited, and only when the phrase itself is the point ("we will not be doing symbolic derivatives").
R3 **Concrete before abstract.** Numbers first, then the pattern, then the name, then (only if the stage file lists it) the formula or code.
R4 **One new idea per beat.** A beat may carry several steps of the SAME idea; it never introduces two ideas. It also never splits one
    move an adult follows at once into sub-steps (no "step one: look at the number").
R5 **Declared level.** Every concept is (R) or (F) in the stage file; the explanation never exceeds its level.
R6 **Hold before the reveals that matter.** Three or four holds per chapter, ≥ 2 s, each before a prediction's answer. A breath after
    every idea (pacing.json). Not a hold before every result.
R7 **Pictures, not slides — and never narrate the visible.** On-screen text is a label (≤ 4 words), a formula or code, never a sentence.
    The picture carries state; the voice adds meaning. A sentence that only says what is already on screen ("card two is lit",
    "the number went from 4 to 4.0002") is a FIX; the voice says what it MEANS.
R8 **Spoken to a capable adult.** Contractions, short sentences, the occasional "this is the part that trips everyone up". Banned:
    "you're right", "if you said X you're right", "take your time", "don't worry", "obviously", "simply", "let us", "note that",
    counting what is on screen, re-explaining a thing explained two beats ago. pedagogy.md §6 has the full list.
R9 **Never fix timing by cutting words.** If the voice does not fit, the animation gets longer. Audio-first: clips are measured before
    the animation is built; overlap is impossible by construction (pipeline.md).
R10 **Fidelity, where it binds.** Part 2: his order, examples, numbers and code, exactly. Part 1: any example that serves the concept,
    marked `SRC: added`. Nowhere: topics he does not touch, or "in modern networks you'd actually…" beyond chapter 6.
R11 **No fear.** The maths here is small and old (multiply, add, one squash, one 1970 idea about walking backwards); what is big is
    only how many times it is repeated. Said once, early, plainly.
R12 **Names that mislead get defused on arrival.** tanh is not trigonometry; "grad" is a question, not a command; "backward" walks a
    graph, nothing goes back in time; "loss" is a score, not a failure.
R13 **The five questions.** For every function, symbol, number, code line or step the voice answers, in order: what is it · where does it
    come from · what is it for · why combined this way · why does it work (shown with numbers). Declared per beat in the `Q:` field (§6);
    across a concept's beats all five must appear. A concept missing one is not explained.
R14 **Practice by watching.** Every (F) concept has the lecture's worked example AND one second example worked the same way, where the
    viewer predicts before seeing (the prediction is their exercise); the concept then returns later, named ("that's the nudge from
    chapter one"). The stage file says which concepts get a second example and where each returns (work/spiral.md).

## 4b. The teaching techniques (mandatory; the pedagogy judge rejects on any of these)

Each technique: MUST (what the writer does) · FAILS (what the judge quotes). pedagogy.md explains each with an example and an anti-example.
T1 **Advance organizer.** MUST: the map at the start; a 10 s "you are here" card at every chapter start, the chapter question word for word;
    the synthesis names the next card. FAILS: no card; a paraphrased question; "later" without a chapter name.
T2 **Motivation before mechanism.** MUST: the need, as a limit of what the viewer already has, in the same or previous beat (R1).
    FAILS: a thing before its need; an abstract need.
T3 **Concrete → representational → abstract.** MUST: numbers → pattern (≥ 2 instances) → name → formula/code (R3). FAILS: a name or formula before its numbers.
T4 **Cognitive load, without sub-stepping.** MUST: one new idea per beat (R4); at most five new ideas per five beats; nothing on screen the
    voice does not use; an adult-sized move stays one move. FAILS: two ideas in a beat; a trivial move split; decoration; a beat that
    exists only to re-say the previous one.
T5 **Prediction, on the second example.** MUST: before the answer of each second example (and the three or four key reveals), a directional
    or binary question, a hold ≥ 2 s, the answer — without "you're right". FAILS: a reveal that mattered with no question; a numeric guess;
    a hold before a result that did not need one.
T6 **Dual coding.** MUST: one pattern per beat; the referent on screen when spoken; labels ≤ 4 words; the voice adds meaning, never
    narrates state (R7). FAILS: a sentence on screen; a referent missing; narration of the visible.
T7 **Respect.** MUST: one permission line per chapter ("you don't need to calculate this"), the hard moment named before it comes, one
    re-anchor after the densest beat; none of the banned phrases (R8). FAILS: a banned phrase; a hard moment unannounced.
T8 **Consolidation.** MUST: a synthesis of ≤ 3 sentences that says how the concepts INTERACT, the handoff line, the next card named.
    FAILS: a list; a handoff wider than the stage file; a synthesis longer than three sentences.
T9 **Analogy discipline.** MUST: after the real thing; one per concept; mapped, bounded, retired; a Story's picture ≤ 10 s. FAILS: before its
    referent; two for one concept; never retired.
T10 **Procedural framing, said once.** MUST: every (F) procedure spoken as numbered steps with a check the FIRST time; afterwards named
    ("same three steps") and shown, not re-recited. FAILS: a procedure re-recited; two wordings of one procedure.
T11 **Spiral.** MUST: every concept returns in ≥ 2 later chapters, named, same picture and colours (work/spiral.md). FAILS: a return
    unnamed or redrawn.
T12 **Foundations first, then nothing assumed.** MUST: Part 1 holds every primer; Part 2 assumes Part 1 and NOTHING else; a Part-2
    beat that needs a foundation names the chapter-1 return instead of re-teaching it. FAILS: a primer in Part 2 for a Part-1 concept;
    a Part-2 concept with no Part-1 ground.
T13 **Self-check.** MUST: one spoken question from the chapter's goal before the closing card, a hold, and "if you can answer that,
    you're ready; if not, the place is <section>". FAILS: missing; a quiz voice; more than one question.
T14 **Misconception protocol.** MUST: the stage file's misconception in four moves — the belief, why tempting, the counter-example with
    numbers, the correct line — in one beat. FAILS: by assertion; missing.
T15 **Vocabulary contract.** MUST: one word per thing (work/vocabulary.md); a second word only in an equivalence beat. FAILS: a synonym swap.
T16 **Code, read.** MUST: before any code line its need; the line read aloud in words; each symbol pointing at its coloured referent; one
    new line per beat; his code verbatim. FAILS: code shown unread; two new lines; a symbol without a referent.
T17 **Complete, not repetitive.** MUST: every intermediate number of an (F) result shown once, in order, from engine.py; the lecture's
    skips filled. FAILS: a number with no predecessor; "similarly"; the same computation recited twice in full.
T18 **The second example.** MUST: for each (F) concept the stage file marks, a second worked example in the same pattern, same
    colours, with the viewer's prediction first (T5); in Part 1 it may be ours, in Part 2 it is his if he gives one, else ours and
    marked added. FAILS: a marked concept with no second example; a second example in a different picture.

## 5. Vocabulary hygiene (said once in chapter 1, then used consistently)

Probability: how likely — not today. Statistics: learning from data — appears only as "the loss". Calculus: how things change when you
nudge them — today's subject. Linear algebra: the same arithmetic on millions of numbers at once (tensors) — chapter 6, one sentence.
Function: a rule, number in, number out. Weight: how much an input matters. Bias: an offset. Loss: one number for how wrong. Gradient /
grad / slope / derivative: which way to nudge and how much the output cares — one thing, four names, bound once. Knob = parameter = weight or bias.

## 6. Beat format (every stage file and every script)

`<id> | <R|F> | <pattern> | TECH: <T-codes> | Q: <digits 1-5 answered here, for the beat's element> | SCREEN: ... | VOICE: ... | HOLD: y/n | SRC: timestamp or "added"`

A script is: the **arc table** (pedagogy.md §2) — one row per concept of the chapter: level · the beat ids answering Q1…Q5 · EXAMPLE 1 ·
EXAMPLE 2 · PREDICT · RETURNS — then the beats in order with the VOICE text final. One beat = one voice clip (a `[HOLD]` marker splits it into
question and answer clips) = one or two caption cues. verify.sh rejects a script with no arc table, a row missing a Q, a beat without TECH
or Q, or a beat line the voice tool cannot parse (no ` | ` inside a field; one line per beat).

## 7. Roles (pipeline.md)

Producers: miner, ledger, writers (three angles), editor, animator. Judges: script judge (rubric A), pedagogy judge (rubric F),
naive critic (rubric B), visual reviewer (rubric C), final judge (rubric D). They return PASS or a quoted fix list; they change nothing.
Supervisor: one narrow move when the loop exits abnormally. The owner alone edits OBJECTIVE.md, PROMPT.md, pedagogy.md, stages/, patterns.md, rubric.md.

## 8. Source material

reference/transcript.md (his words — evidence of what to cover, never text to reuse) · reference/micrograd/ · reference/lectures/*.ipynb
(ground truth for code and numbers) · src/micrograd_animation/engine.py (every number on screen) · work/v2/concepts.md (the syllabus) ·
work_v1/<stage>/mined.md (v1's mining of his steps and numbers: reusable evidence).

Lecture chapters → parts: 0:00–8:09 overview → chapter 1 framing · 8:09–19:11 derivatives → chapter 1 (his examples as the worked examples) ·
19:11–32:11 Value object → chapter 2 · 32:11–52:52 manual backprop, first step → chapter 3 · 52:52–1:43:55 the neuron → chapter 4 ·
1:43:55–2:14:03 MLP, loss, training → chapter 5 · 2:14:03–end summary, PyTorch, conclusion → chapter 6.
