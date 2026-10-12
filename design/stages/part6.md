# Chapter 6 — The map, backwards
**Question:** Why did each piece have to exist, and what is the same at GPT scale?
**Lecture source:** 2:14:03 summary; 2:16:50 code walkthrough; 2:21:13 PyTorch's tanh backward; 2:24:42 conclusion.
**Budget:** 4–6 min. **Holds:** 2. Assumes chapters 1–5.

## Goal
Walk the map in reverse from training back to "a function is a rule", one sentence per card saying why the previous one was needed;
say what is the same in GPT (the loop, the grads, multiply/add/squash) and what differs (data, architecture, tensors for speed); know where to go next.

## Handoff
None. The last line is the credits.

## Concepts (level)
F1 the reverse walk (R) · F2 what scales unchanged (R) · F3 tensors = the same arithmetic on many numbers at once (R, one sentence) ·
F4 PyTorch's own tanh backward is the same 1 − o² (R) · F5 credits and the source (R)

## Vocabulary
tensor (one sentence). Nothing else new.

## Pedagogical arc
Map, all cards lit except 6 → F1: a highlight walks the cards backwards; at each, the one object from that chapter for two seconds, one
sentence of "because" (T1, T11, T8) → hold → F2: zoom from 41 knobs to a wall of knobs; the five loop tiles unchanged; "data" and
"architecture" as the two things that differ; one honest sentence on compute and data (T2, R10 bound to his 2:14 words) → F4: his
engine.py tanh backward vs PyTorch's, the same formula (T16) → F5: the chapter-1 machine, lid open, every part labelled with its chapter;
credits; go watch the original (T8). No self-check (chapter 6 is the self-check).

## Beats
```
6.0  | R | Map          | TECH: T1 | Q: — | SCREEN: card 6 lit; all others ticked. | VOICE: question; looking back. | HOLD: n | SRC: added
6.1  | R | Map+Trace    | TECH: T11,T8 | Q: 3,4 | SCREEN: the highlight walks the map backwards; at each card its object for two seconds: the loop tiles → a grad → a backward trace → a graph → the machine with 3 → 20. | VOICE: F1: training needed grads; grads came from the chain rule; the chain rule needed the graph; the graph is a function written in steps; a function is a rule. One sentence per card. | HOLD: y | SRC: added; his 2:14:03–2:16:50 for the training sentence
6.2  | R | Zoom         | TECH: T2,T11 | Q: 3,5 | SCREEN: zoom out from 41 knobs to a wall; the five tiles overlaid, unchanged; "tensors: same arithmetic, many numbers"; "data", "architecture". | VOICE: F2, F3: the loop is identical in modern networks; what changes; one honest sentence. | HOLD: y | SRC: 2:14:03–2:16:50
6.3  | R | Side by side | TECH: T16 | Q: 5 | SCREEN: his engine.py tanh backward vs PyTorch's C++: the same 1 − o². | VOICE: F4: the real library does exactly what we did. | HOLD: n | SRC: 2:21:13–2:24:42
6.4  | R | Machine      | TECH: T8,T11 | Q: — | SCREEN: the chapter-1 machine, lid open, every part labelled with the chapter that explained it. | VOICE: the opening picture, understood; where to go next (his lecture, the repo, the next lecture). | HOLD: n | SRC: 2:24:42–2:25:20
6.5  | R | Map          | TECH: T1 | Q: — | SCREEN: credits: Karpathy, the lecture link, micrograd licence, 3Blue1Brown, Manim, the voice; "made with AI assistance". | VOICE: thanks; unofficial; watch the original. | HOLD: n | SRC: added
```

## Closing synthesis
This chapter IS the synthesis. Last spoken line before the credits: "Nothing in here was magic. It was multiply, add, a squash, and one old
idea about walking backwards."

## Notes for the miner
work_v1/stage6/mined.md has his summary sentences; reuse as evidence only.
