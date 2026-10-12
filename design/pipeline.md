# Pipeline — roles, artifacts, gates, models, supervisor

One chapter = one stage file (stages/partN.md). Every role reads OBJECTIVE.md first. Chapters move through the gates below in order; a chapter never
skips a gate. Every artifact is a file in the repo and every change is a git commit, so the morning diff shows
everything that happened at night.

## Roles

| Role | Kind | Reads | Writes | Model (default) |
|------|------|-------|--------|-----------------|
| **Miner** | producer | transcript, notebooks, stage file | `work/<stage>/mined.md`: for each lecture step in this stage: what he does, HIS words for why (quoted, timestamp), the exact values, the code cell | opus |
| **Ledger** | producer | mined.md, transcript, stage file, work/vocabulary.md, work/spiral.md | `work/<stage>/ledger.md`: every concept used in this stage without being defined so far; for each: level (R/F), first appearance, primer needed (y/n, 30–90 s), which earlier stage already covered it. Also appends to the two cumulative files: `work/vocabulary.md` (term → the one word, its definition, the beat that defines it, fixed runbook wordings; T15/T10) and `work/spiral.md` (concept → the stages where it must recur; T11). Flags any concept with fewer than two planned recurrences for the owner. | opus |
| **Writer A/B/C** | producer | PROMPT (incl. §4b), pedagogy.md, stage file, patterns, mined, ledger, work/vocabulary.md, work/spiral.md, previous stage's approved script | `work/<stage>/script.A.md` etc.: the arc table, then beats in the PROMPT §6 format with TECH. A: leads with a question/puzzle. B: leads with the concrete numbers. C: leads with a Story analogy. Same facts, same arc table, different openings and transitions. | opus |
| **Script judge** | judge | the three scripts, rubric A | `work/<stage>/judge.json` per script, plus a pick: which script, or a splice plan (beats from which) | opus |
| **Pedagogy judge** | judge | the picked/spliced script, PROMPT §4b, pedagogy.md, vocabulary.md, spiral.md, rubric F | `work/<stage>/pedagogy.json` | opus |
| **Naive critic** | judge | the picked/spliced script, rubric B | `work/<stage>/critic.json` | opus |
| **Editor** | producer | picked script + ALL rounds of judge, pedagogy and critic items | `work/<stage>/script.md` (the approved script); loops with the three judges up to N rounds | opus |
| **Voice** | tool, run by loop.sh itself OUTSIDE the sandbox (no agent ever holds the key) | script.md, `.env` | `audio/<stage>/NN.mp3` one per beat (tts_elevenlabs.py, cached by text) + `work/<stage>/timing.json` (measured lengths) | — |
| **Animator** | producer | script.md, timing.json, patterns, engine.py | `scenes/stageN.py` (Manim) using the Narrator helper that holds for each clip's real length; `captions/`; renders at -ql | sonnet (opus if budget allows) |
| **Visual reviewer** | judge | frames at beat starts/midpoints, script.md, rubric C | `work/<stage>/visual.json` | sonnet |
| **Final judge** | judge | script, timing report, muxed video frames, previous stage's handoff, rubric D | `work/<stage>/final.json` → PASS ticks the chapter | opus |
| **Supervisor** | process | logs/, the last judge outputs, feedback.md, pacing.json, PLAN.md | one allowed move + `work/supervisor.log` | opus |

Models are variables at the top of agent.sh: MODEL_WRITER, MODEL_JUDGE, MODEL_PEDAGOGY, MODEL_CRITIC, MODEL_EDITOR, MODEL_ANIMATOR, MODEL_VISUAL, MODEL_FINAL, MODEL_SUPERVISOR.
Drop animator and visual reviewer to sonnet first if usage limits bite; they have verifiers behind them.

## Gates (a chapter's row in PLAN.md records which gate it has passed)

```
G0 mined + ledger exist and cite timestamps; vocabulary.md and spiral.md updated   (mechanical: every step has a timestamp)
G1 script judge PASS, pedagogy judge PASS and naive critic PASS on script.md       (hard gate; nothing downstream runs before it;
   mechanical pre-check by verify.sh: arc table present and consistent, every beat has TECH, every beat id unique)
G2 voice clips exist for every beat; timing.json written  (mechanical; produced by loop.sh outside the sandbox)
G3 render ok; pacing gate ok (no overlap, holds honoured)  (mechanical: check_pacing.py --gate)
G4 visual reviewer PASS
G5 final judge PASS                                       → row ticked
```
The owner may require manual approval at G1 for the first chapters (`REQUIRE_OWNER_OK=1`): the loop stops after G1 with
a note, the owner reads script.md in the morning, writes `OK` into `work/<stage>/owner.ok`, and restarts the loop.

## Rounds and rejection

- Editor ↔ the three judges: up to 6 rounds per chapter (MAX_SCRIPT_ROUNDS). Then the chapter is parked (row marked `[p]`) and the supervisor is called.
- Animator ↔ visual reviewer / pacing gate: up to 6 rounds (MAX_VISUAL_ROUNDS). Same.
- Final judge FIX: items routed to editor (script) or animator (visual/timing); counts as a round for that pair.
- Nothing is "accepted with notes". A chapter is PASS or it is parked for the owner.

Convergence (what makes six rounds worth more than four):
- Every judge receives its own previous JSON and marks each earlier item FIXED / NOT FIXED before raising anything new
  (rubric, top). A new item in round ≥ 3 needs `why_new`; verify.sh drops items without it.
- The editor receives every round's JSON, not only the latest, and the stage file; it may not change a beat no item points at.
- Early consolidate: if ≥ 50 % of round N's items (by beat + rule) were also in round N−1, loop.sh calls the supervisor at once
  (move 1, consolidate) instead of spending the remaining rounds.
- Rounds are per pair, not per gate: a final-judge FIX routed to the editor counts against MAX_SCRIPT_ROUNDS.

## Supervisor (process judge; runs only when loop.sh exits with a non-zero code or a chapter is parked)

Input: the exit reason, the last 200 lines of logs, the latest judge/critic/visual/final JSON for the parked chapter,
feedback.md, pacing.json, the supervisor's own log (so it does not repeat itself).
It reasons freely, then takes exactly ONE of these moves, writes one paragraph to work/supervisor.log, commits, and
loop.sh restarts:
1. **Consolidate**: rewrite feedback.md with a single, clearer instruction to the editor or animator (when the fix lists repeat or contradict).
2. **Tolerance**: change ONE value in pacing.json by at most 20 % (when the pacing gate fails every chapter the same way).
3. **Park and continue**: leave the chapter `[p]`, let the loop move to the next row (when one chapter is stuck and others are not).
4. **Retry once**: unpark and re-run from the failing gate with a fresh editor/animator session (when the failure looks like a bad run, e.g. a crash, not a design problem).
5. **Stop**: write a note for the owner and exit 9 (when none of the above applies, or budget/limits are the cause).
Never allowed: editing PROMPT.md, pedagogy.md, stages/, patterns.md, rubric.md, prompts/, any script.md, any scene file, loop/verify/agent scripts, .env, .env.example.
Cap: MAX_SUPERVISOR=3 interventions per loop run; after that, move 5.
Every move is a git commit with the message "supervisor: <move>: <reason>" and a notify.sh message to the owner.

## Loop (loop.sh, sketch for the interactive session to implement from the existing kit)

```
for each unticked row in PLAN.md (in order):
  for each gate G0..G5 the row has not passed:
    G2: loop.sh itself runs tts_elevenlabs.py with .env loaded, outside the sandbox; no agent is involved
    otherwise: run the role(s) for that gate in the sandbox (claude -p, prompts/<role>.md, json output)
                with ELEVENLABS_* unset in the agent's environment
    run the mechanical check for the gate
    PASS → record gate in PLAN.md row, commit, next gate
    FIX  → write feedback.md from the JSON items, bump the round counter, commit, re-run the producer for that gate
    rounds exhausted → mark row [p], commit, exit 10 (supervisor hook)
  all gates passed → tick row, commit, notify
on any non-zero exit (except 0 done, 3 STOP file, 8 usage limit wait): run supervisor, apply its move, restart
```
Keep from the existing kit: sandboxed.sh/srt, agent.sh permission flags, hash.sh caching, review JSON schema idea,
STOP file, usage-limit wait, plan_sig tamper check, notify.sh, check_pacing.py gate, tts_elevenlabs.py, sync_audio.py.
Change: the builder becomes several roles; review.sh becomes the judge/critic/visual/final runners; PLAN.md rows carry
`gates: G0 G1 …`; "accepted with notes" is removed; supervisor hook added; per-role models.

## Secrets and portability (the repo will be public; anyone must be able to clone and run)

- Secrets live only in `.env` (gitignored). `.env.example` is committed with every variable and a placeholder. loop.sh and the
  kit scripts load it with `set -a; source .env; set +a`; nothing else reads it.
- `.env` is in srt `denyRead` and `denyWrite` and in the agent permission deny list. Agents receive only the Anthropic
  token (claude -p needs it); loop.sh unsets `ELEVENLABS_*` before launching any agent and runs the voice tool itself.
- Machine-specific files are generated, gitignored, and have a committed `.example`: `srt-settings.json` (setup.sh derives
  the home directory and tool paths at run time; nothing is hardcoded).
- No personal names, emails, hostnames or absolute paths in tracked files. The owner is "the owner"; the voice is
  `ELEVENLABS_VOICE_NAME`; notifications go to `NTFY_TOPIC`. `./publish-check.sh` greps tracked files for these shapes and
  runs gitleaks over the history; it runs before any push and before the repo goes public. gitleaks also runs as a
  pre-commit hook (`.pre-commit-config.yaml`; `uv run pre-commit install` after cloning).
- Rendered video, audio and frames are never committed; the finished video is published via a video host and/or a GitHub
  Release and linked from the README.

## Audio-first timing (the Narrator helper, src/<package>/anim.py)

`say(beat_id)`: looks up `work/<stage>/timing.json`, plays nothing (audio is muxed later) but returns the duration
`clip_len / voice_speed + breath`; the scene's animation for that beat must take at least that long, so the helper
pads with `self.wait` and writes the caption cue with the real start time. `hold(seconds)`: nothing moves.
check_pacing.py verifies the result from the rendered video and the clips, so a wrong helper cannot pass G3.

**No overlap is a mechanical guarantee, enforced four times, never a judgement call:** (1) G2 accepts only measured clip lengths
(an estimated timing.json fails); (2) the Narrator helper pads every beat to clip/voice_speed + breath, rounded up to whole frames,
and the scene code cannot shorten it; (3) G3 re-measures every cue window from the rendered video against the real clip
(check_pacing.py) and fails on one short window; (4) the mux runs `sync_audio.py --strict`: a clip that would need speeding up,
overlap the next cue or run past the video fails the chapter back to the animator — the voice is never sped up, cut or overlapped.
