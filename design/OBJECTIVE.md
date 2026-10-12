# OBJECTIVE — read this before anything else, every time

Every agent — miner, ledger, writers, judges, editor, animator, reviewers, supervisor — works toward this one objective.
A script, a verdict or a scene that does not serve it is wrong, however well made.

## 1. What this video is

A standalone explanation, in two parts, that lets an intelligent adult with no mathematics or programming foundation
understand Andrej Karpathy's lecture "The spelled-out intro to neural networks and backpropagation: building micrograd".

- **Part 1 — the foundations he assumes.** Karpathy gave this lecture to people who already had first-year university
  mathematics and programming. Part 1 gives the viewer exactly those foundations, from zero: what a function is, the graph
  of a function, what a derivative is and why a tiny nudge measures it, why we look for a minimum, the chain-rule idea,
  what a weight, a bias and a squash are, what a loss is and why we push it down. Nothing more than the lecture needs;
  nothing less. (The syllabus with time budgets: work/v2/concepts.md, Part A.)
- **Part 2 — the lecture, explained.** His order, his examples, his numbers, his code: every step he takes and every word
  he uses is explained — in OUR words, never his sentences paraphrased. The viewer has most likely not watched the lecture
  and may never; the video must stand on its own and credit him as the source.

## 2. Who is watching — as a learner, not a demographic

An adult who has worked years in IT: runs servers, clouds, clusters; manages projects; abstracts fast; learns tools from their
docs; fixes things under pressure. Left school at 16, or passed mathematics by cramming and kept none of it. Never had the
foundations above — not because they could not, because they never needed them.

What that means for every sentence we write:
- **Fast, not slow.** They grasp a well-made explanation at once. Never break a move into sub-steps they do not need; never
  say what the picture already shows; never repeat what was said two beats ago; never "you're right", "take your time",
  "don't worry".
- **New, not known.** An idea met for the first time needs ONE complete, honest explanation and a moment to land — a breath,
  not a lecture. Nothing is taken for granted: no symbol, no word, no number appears without its meaning.
- **Not a student in a classroom.** No school register, no quiz voice, no counting cards. Speak as to a capable colleague
  who is learning this today.

## 3. What "explained" means here — the five questions

For every function, symbol, number, line of code or step that appears, the voice answers, in order and without exception:
1. **What is it?** (in plain words, with the thing on screen)
2. **Where does it come from?** (which earlier thing produced it, or who chose it and why)
3. **What is it for?** (what breaks without it)
4. **Why is it combined this way?** (why multiply here, add there, squash at the end)
5. **Why does it work?** (the mechanism, shown with the numbers — not asserted)
A concept whose five answers are not in the script is not explained, whatever else is said about it.

## 4. How understanding happens — practice by watching

Nobody assimilates a new idea from one statement. In a course the student does exercises; here the viewer cannot, so the
video does the exercise for them, visibly:
- Every key concept gets the lecture's worked example AND, where it helps, **one second example** worked the same way —
  the second time the viewer is asked to predict before seeing (that prediction is their exercise).
- The idea is then **seen at work** later in the video (the spiral): the nudge comes back as the grad, the slope sign comes
  back as "which way to turn", the chain rule comes back inside the neuron. Each return is named.
- Understanding = having seen the thing operate, twice, and recognised it the third time. That is the bar.

## 5. Pace — the middle ground

- Normal speaking pace. A breath after each idea; a short hold before the three or four reveals that matter in a chapter.
- Cues never overlap and never run back to back without air (the previous project's failure); but air is for landing an
  idea, not for stretching the obvious.
- Chapter lengths follow the syllabus budgets (work/v2/concepts.md): the foundations ≈ 12–15 min; each lecture chapter
  8–14 min; the whole ≈ 60–70 min, published as two videos.

## 6. What the judges fail on sight

Paraphrasing his transcript · a symbol, word or number without its five answers · narrating what is on screen · sub-stepping
or repeating · condescension (the banned list in pedagogy.md) · a concept with no second example or no later return ·
a chapter far outside its budget · anything that assumes a foundation Part 1 did not give.

## 7. Credits and fidelity

Unofficial, non-commercial, credits Karpathy and 3Blue1Brown. Part 2 keeps his order, his examples, his numbers and his
code exactly (every number on screen comes from src/*/engine.py). Part 1 may use any example that serves the concept.
