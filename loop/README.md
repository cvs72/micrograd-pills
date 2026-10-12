# Kit loop (Claude Code, unattended, confined to this folder)

A builder agent modernises the page kit one task at a time, objective checks gate every iteration, an independent
read-only reviewer reads the diff and the captures, and a bash loop you own decides when it is finished. Nothing the
agents can edit decides when the loop stops. The tasks are in `PLAN.md`; the content of the twelve pills is frozen
and proven unchanged on every iteration by screenshot and text comparison against `baseline/`.

## What is and is not guaranteed
- Confinement: the WHOLE Claude Code process runs inside the OS sandbox `srt`: writes only in this repository (plus
  the system temp directory), reads of the parent of your home directory blocked except this folder, the toolchain
  and Playwright's browsers; network only to Anthropic. `smoke.sh` proves it on your machine before any loop.
- Not guaranteed: srt is a beta research preview; the API token is inside the boundary. No secrets in this folder.
- Not automatable: taste. The captures prove the pages look the same; you review the code at the end.

## One-time setup (macOS or Linux)
    brew install jq ripgrep gitleaks               # Linux: apt install jq ripgrep; gitleaks per its README
    npm install -g @anthropic-ai/sandbox-runtime    # srt
    npm ci                                          # playwright, html-validate, pixelmatch, pngjs (pinned)
    npx playwright install chromium                 # the browser build that playwright 1.64.0 expects
    ./loop/setup.sh                                 # checks tools, writes loop/srt-settings.json
    claude setup-token                              # copy the token it prints
    export CLAUDE_CODE_OAUTH_TOKEN=<token>          # or: export ANTHROPIC_API_KEY=<key>
    ./loop/smoke.sh                                 # MUST print SMOKE TEST PASSED and PERMISSION CHECK PASSED

If `smoke.sh` reports `Operation not permitted`, watch what was blocked (macOS):
`log stream --predicate 'process == "sandbox-exec"' --style syslog` and add ONLY the needed read path to
`allowRead` in `loop/srt-settings.json` (agents cannot edit that file). If headless Chromium cannot start inside the
sandbox, retry with `SHOTS_NO_SANDBOX=1` (Chromium's own sandbox off; srt still confines the process).

## Before the first loop
1. Read `PLAN.md` and change any decision you disagree with; the loop stops if the plan changes while it runs.
2. The vendored files must exist: `site/vendor/fonts/` (woff2 + fonts.css), `site/vendor/three/three.min.js`
   (r128, needed until K04 replaces it) and `site/vendor/three/three.module.js` (THREE_VERSION). The loop has no network; they are fetched once,
   attended, with their versions checked.
3. The baseline: `node loop/tools/shots.mjs loop/baseline`, captured on the current pages, same Playwright version.
   Look at a few of the PNGs; they are the truth the loop defends. Commit them.
4. RESTORE POINT. The loop commits every iteration, so any iteration can be revisited, but make the starting point
   explicit and keep main untouched:
       git tag pre-loop-$(date +%F)                                   # the exact state before the loop
       tar czf ~/Backups/micrograd-pills-$(date +%F).tgz -C .. micrograd-pills   # a copy outside git
       git push --tags origin main                                    # when a remote exists
       git switch -c kit-loop                                         # the loop works on this branch
   To throw the run away: `git switch main && git branch -D kit-loop`. To keep it: merge `kit-loop` into main.
   To go back to one iteration: `git log --oneline` on the branch, then `git switch -c keep <commit>`.

## Run
    MAX_ITER=3 TOTAL_BUDGET=8 ./loop/loop.sh       # pilot: should finish K01 and stop at the cap
    MAX_ITER=12 TOTAL_BUDGET=40 ./loop/loop.sh     # real run, after you have seen the pilot's cost and quality

Keep the Mac awake and plugged in: `caffeinate -i ./loop/loop.sh`. Stop at any time: `touch STOP` (checked before
every iteration). Everything is committed per iteration, so `git log` and `git diff` show what happened; logs are in
`loop/logs/` (loop.log, iter-N.json, verify-N.txt, review-N.txt), captures in `loop/shots/`, diff images as
`loop/shots/diff-*.png`.

Exit codes: 0 done and verified, 1 iteration cap, 3 STOP file, 4 budget, 5 builder failing, 6 stalled,
7 PLAN.md tampered, 8 usage limit did not lift in time. On a subscription the loop shares your limits; when the limit
is hit it probes every 10 minutes and resumes, giving up after 7 hours (re-run later; it resumes from the files).

Knobs: MAX_ITER, TOTAL_BUDGET (USD, client-side estimate), STALL_LIMIT, FAIL_LIMIT, CLAUDE_MODEL (default sonnet),
BUILDER_TURNS/BUILDER_BUDGET, REVIEWER_TURNS/REVIEWER_BUDGET, SANDBOX_OFF=1 (testing only).

## What the gate checks every iteration (`verify.sh`)
`node build.js` · html-validate on every page · every local link resolves · the static checks of each ticked task
(`tools/pages.mjs`: local, skeleton, kit, three, a11y, nav, csp, ci) · every pill captured at the end of every step
with a fake clock (`tools/shots.mjs`, deterministic) and compared with the baseline (`tools/compare.mjs`: pixels
within SHOT_TOL, readable content identical, no console errors) · `publish-check.sh`.

## Files agents cannot change (srt denyWrite AND permission deny rules)
`loop/*.sh`, `loop/prompts/`, `loop/tools/`, `loop/baseline/`, `loop/srt-settings.json`, `loop/feedback.md`,
`loop/reviews/`, this README, `CLAUDE.md`, `design/`, `reference/`, `src/digits/`, `publish-check.sh`,
`package.json`, `package-lock.json`, `.htmlvalidate.json`, `pyproject.toml`, `.claude/`, `node_modules/`.
`PLAN.md` may only be changed by ticking boxes: any other edit stops the loop (exit 7).

## After the loop
Review `git log`, the notes in `loop/reviews/notes/`, and the site with `npm run serve`. Then the design pass that is
out of scope here: the deck layout for wide screens and the portrait layout for phones.
