# Rubric v2 — what the judges check, and how they fail a script

Every judge returns JSON: `{"verdict": "PASS" | "FIX", "items": [ {"beat": "<id>", "rule": "R1" | ... | "T18" | "VIEWER", "quote": "<the offending or
missing sentence, verbatim>", "fix": "<one concrete instruction>"} ]}`. A judge never rewrites a line and never changes anything. An item
without a quote is discarded. Rules R1–R14 and techniques T1–T18 are in PROMPT.md; the objective is OBJECTIVE.md and binds every judge.

Convergence (every judge, from round 2 on): the JSON carries `"previous": [ {"beat", "rule", "status": "FIXED" | "NOT FIXED"} ]`, one entry per
item of the judge's previous round, decided before any new item. A new item in round 3 or later carries `"why_new"`; without it the loop
discards it. A judge never reopens an item it marked FIXED unless the quoted text changed. Judge the whole chapter in round 1.

## A. Script judge (per chapter script, before any voice or animation)

Checks, per beat, in this order. Every item quotes.
1. **Paraphrase (R2).** Any VOICE sentence that is his transcript sentence lightly reworded → FIX (quote both). More than one credited
   quotation per chapter → FIX.
2. **Why-chain (R1, T2).** For every new element: the need sentence in this or the previous beat; in Part 2, the need must match what he
   does there (cite the timestamp from the stage file / work_v1 mined.md).
3. **The five questions (R13).** For every concept in the arc table: Q1–Q5 each pointed at a beat that really answers it; Q5 shown with
   numbers for (F). A missing or asserted answer → FIX.
4. **Narrating the visible (R7).** Any VOICE sentence whose whole content is the SCREEN field's state → FIX.
5. **Level and load (R4, R5, T4).** One new idea per beat; no trivial move split into sub-steps; nothing above its level.
6. **Density.** At ~150 words/min, a new idea (or a new answer to a Q) at least every 30 s of voice; a stretch longer than that with no new
   content → FIX (quote the stretch). Three or four holds per chapter, not more (R6).
7. **Repetition (T10, T17, R8).** A procedure recited in full more than once; a sentence re-explaining a thing from an earlier beat;
   a banned phrase (pedagogy.md §6) → FIX.
8. **Concrete first (R3).** Numbers → pattern → name → formula/code; no number not from engine.py / the lecture.
9. **Second example and returns (R14, T18, T11).** Every concept the stage file marks has EXAMPLE 2 with its PREDICT beat; returns named.
10. **Fidelity (R10).** Part 2: his order, examples, numbers, code; nothing he does not touch. Part 1: additions marked added.
11. **Synthesis, handoff, self-check (T8, T13).** ≤ 3 sentences of interactions; the handoff equals the stage file's; one self-check question.
12. **Budget.** Spoken words / 150 + holds against the chapter budget in the stage file; over by > 25 % → FIX naming the beats to tighten
    (never the numbers or the five answers — the padding).
13. **Quiz test.** Three questions a viewer should answer after the chapter; cite the beats that make each answerable; any unsupported → FIX.
PASS only when items is empty.

## B. Naive-viewer critic (in parallel with A)

You are the viewer in OBJECTIVE.md §2: years in IT, fast, abstract, no maths or programming foundation, never watched the lecture. Read
the script beat by beat with only the SCREEN field in front of you. Write down every point where you would say one of these, with the beat id:
- "Wait, what is that?" — a word, symbol, number or code line not explained.
- "Where did that come from?" — a number or object with no origin.
- "Why did we just do that?" — a step with no reason.
- "Why is it combined like that?" — a formula or line whose shape is not explained.
- "Hang on, which one is that?" — two similar things, or an off-screen referent.
- "I've lost the thread" — you no longer know where this sits in the map.
- "That's a lot at once" — two new ideas in a beat.
- "I'd need to pause here" — a result that mattered, shown without a moment.
- **"I can see that"** — the voice is telling you what is on screen.
- **"You already said that"** — a repetition, or a procedure recited again.
- **"I got it two beats ago"** — a sub-step, a re-explanation, or a hold where none was needed.
- **"Don't talk to me like that"** — "you're right", "take your time", "don't worry", a quiz voice, counting cards.
- "This sounds like his transcript" — a sentence that reads like a captions paraphrase rather than an explanation.
Each note is an item with rule "VIEWER" and the fix that would have stopped it. You do not judge correctness. PASS only if you reached the end
without interrupting.

## C. Visual reviewer (per rendered chapter, from frames at every cue start and mid-point)

1. Every beat shows its pattern from patterns.md and the frame matches it. 2. No sentence on screen (R7); labels ≤ 4 words. 3. Every formula
symbol has a visible referent of the same colour. 4. Colours obey patterns.md. 5. Nothing clipped, overlapping, below minimum size, or moving
during a hold. 6. The map card at the chapter start with the right chapter lit. 7. For five random beats: what the viewer sees, what they hear,
whether seeing it helps — and whether the voice is narrating the picture instead of adding to it. 8. Whatever a beat's SCREEN field requires is
on screen by the cue's mid-point. Items carry the frame file. The review must open every frame and judge every previous item (verify.sh checks).

## D. Final judge (per chapter, after voice is synced; sees script, timing report, muxed video)

1. Re-run A and B on the final script; any wording difference between the judged script and the spoken text (timing.json) → FIX.
2. Timing: no overlap; every beat ≥ clip/voice_speed + breath; every hold ≥ hold seconds. Length is reported (`length_seconds`, `within_range`),
   never failed on its own (the voice is never cut); padding beyond the clips (dead air) is a FIX.
3. Continuity: the previous chapter's handoff honoured; vocabulary introduced once; the running example's numbers unchanged; colours unchanged;
   every planned return (work/spiral.md) present and named.
4. The three quiz questions from A answerable from the VIDEO. 5. OBJECTIVE.md §6 — anything there, on sight.
PASS marks the chapter done. FIX routes items: script → editor; visual/timing → animator.

## E. What the judges must NOT do

- Reward fluency, length or caution. A polished sentence that teaches nothing, or that repeats, is a FIX.
- Suggest new topics (R10 binds judges too). Accept "the viewer can look it up". Soften a rule because writers keep failing it.
- Treat a technique as "implied". It is performed in a quotable beat or it is a FIX.
- Raise an item they cannot quote, re-raise one marked FIXED, or keep items in reserve for later rounds.
- Ask for MORE words as the fix for a gap when a sharper sentence closes it. The default fix is precision, not length.

## F. Pedagogy judge (per chapter script, in parallel with A and B)

Mechanical first: arc table present, one row per concept in the stage file's list, every beat id exists, no Q cell empty, every (F) row with
EXAMPLE 2 and PREDICT where the stage file marks it; every beat has TECH and Q. Then the arc table cell by cell (quote the beat; does it do
what the cell claims?). Then every TECH and Q claim per beat. Then T1–T18 with the FAILS line of PROMPT.md §4b as the condition:

| T | collect | FIX when |
|---|---------|----------|
| T1 | first voiced beat, Map beats | question differs from PROMPT §3; card missing |
| T2 | per new element: the need sentence | missing or abstract |
| T3 | per concept: beat ids of numbers/pattern/name/formula | order violated |
| T4 | new ideas per beat and per 5 beats; sub-steps; unreferenced objects | >1 idea; >5 per 5; a trivial move split; a beat that only re-says |
| T5 | per second example and key reveal: question, hold, answer | missing; numeric guess; "you're right"; holds where none needed |
| T6 | per beat: pattern, referent, on-screen text, narration | sentence on screen; referent absent; voice narrating state |
| T7 | banned phrases; permission; forewarning; re-anchor | any banned phrase; any of the three missing |
| T8 | synthesis, handoff | list; > 3 sentences; handoff too wide |
| T9 | Story beats: referent before, mapping, boundary, retirement | any missing; two per concept |
| T10 | every procedure, each occurrence | recited in full more than once; two wordings |
| T11 | work/spiral.md vs script | return unnamed or redrawn |
| T12 | Part 1: every primer the syllabus lists present; Part 2: no primer for a Part-1 concept | a Part-2 re-teach; a Part-1 gap |
| T13 | the self-check | missing; more than one question; quiz voice |
| T14 | the misconception beat's four moves | missing; out of order; assertion only |
| T15 | every term vs work/vocabulary.md | synonym without an equivalence beat |
| T16 | per code beat: need, read-aloud, symbol→referent, line count | any missing; > 1 new line |
| T17 | per (F) result: the chain of numbers; repetitions | a number with no predecessor; a computation recited twice |
| T18 | per marked concept: EXAMPLE 2 beat, same pattern | missing; different picture; no prediction |
The fix in each item is one concrete instruction. PASS only when items is empty.
