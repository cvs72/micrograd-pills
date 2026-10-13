#!/usr/bin/env bash
# Outer loop. Run this yourself from the repository root (NOT inside Claude): ./loop/loop.sh
# Agents never get write access to this file. Nothing the agents can edit decides when the loop stops.
set -u
cd "$(dirname "$0")/.."
MAX_ITER=${MAX_ITER:-10}; TOTAL_BUDGET=${TOTAL_BUDGET:-30}; STALL_LIMIT=${STALL_LIMIT:-3}; FAIL_LIMIT=${FAIL_LIMIT:-3}
WAIT_POLL=${WAIT_POLL:-600}; WAIT_MAX_SECS=${WAIT_MAX_SECS:-25200}; MAX_LIMIT_WAITS=${MAX_LIMIT_WAITS:-8}
export GIT_AUTHOR_NAME=loop GIT_AUTHOR_EMAIL=loop@localhost GIT_COMMITTER_NAME=loop GIT_COMMITTER_EMAIL=loop@localhost
command -v jq >/dev/null || { echo "jq missing (brew install jq | apt install jq)"; exit 1; }
[ -n "${SANDBOX_OFF:-}" ] || command -v srt >/dev/null || { echo "srt missing (npm install -g @anthropic-ai/sandbox-runtime)"; exit 1; }
[ -n "${SANDBOX_OFF:-}" ] || [ -f loop/srt-settings.json ] || { echo "run ./loop/setup.sh first"; exit 1; }
[ -n "${ANTHROPIC_API_KEY:-}${CLAUDE_CODE_OAUTH_TOKEN:-}" ] || { echo "set CLAUDE_CODE_OAUTH_TOKEN (claude setup-token) or ANTHROPIC_API_KEY"; exit 1; }
[ -d loop/baseline ] && ls loop/baseline/*.png >/dev/null 2>&1 || { echo "no baseline captures: run  node loop/tools/shots.mjs loop/baseline  (attended, before the loop)"; exit 1; }
[ -d node_modules/playwright ] || { echo "run npm ci first"; exit 1; }
mkdir -p loop/logs loop/reviews; touch loop/feedback.md loop/progress.md loop/reviews/passed.txt
spent=0; stall=0; fails=0; waits=0
plan_sig() { sed -E 's/^- \[[ x]\]/- [ ]/' loop/PLAN.md | shasum -a 256 | awk '{print $1}'; }
sig0=$(plan_sig)
log() { echo "[$(date +%H:%M:%S)] $*" | tee -a loop/logs/loop.log; }
add_cost() { spent=$(awk -v a="$spent" -v b="${1:-0}" 'BEGIN{printf "%.4f", a+b}'); }
over_budget() { awk -v a="$spent" -v b="$TOTAL_BUDGET" 'BEGIN{exit !(a>=b)}'; }
commit_all() { git add -A >/dev/null 2>&1; git diff --cached --quiet && return 1; git -c core.hooksPath=/dev/null commit -q --no-verify -m "$1"; return 0; }
probe() { ./loop/sandboxed.sh ./loop/agent.sh ping 2>/dev/null | jq -e '(.is_error != true) and ((.result // "") | test("OK"))' >/dev/null 2>&1; }
looks_limited() { [ -s "$1" ] && jq -e '(.is_error == true) and ((.result // "") | test("limit|resets|rate"; "i"))' "$1" >/dev/null 2>&1; }
wait_for_quota() {
  waits=$((waits+1)); [ "$waits" -gt "$MAX_LIMIT_WAITS" ] && { log "hit the usage limit too many times ($MAX_LIMIT_WAITS waits). Stopping."; exit 8; }
  local t0; t0=$(date +%s)
  log "usage limit (or API outage) detected. Probing every ${WAIT_POLL}s; giving up after ${WAIT_MAX_SECS}s. Nothing is lost: state is in files and git."
  while :; do
    sleep "$WAIT_POLL"
    [ -e STOP ] && { log "STOP file found while waiting"; exit 3; }
    if probe; then log "limit lifted after $(( $(date +%s) - t0 ))s, resuming"; return 0; fi
    [ $(( $(date +%s) - t0 )) -ge "$WAIT_MAX_SECS" ] && { log "still limited after ${WAIT_MAX_SECS}s (weekly limit?). Re-run ./loop/loop.sh later; it resumes from the files."; exit 8; }
  done
}
all_done() {
  grep -q '^- \[ \] [A-Z][0-9]* |' loop/PLAN.md && return 1
  while read -r id; do grep -q "^$id\$" loop/reviews/passed.txt || return 1; done < <(grep -E '^- \[x\] [A-Z][0-9]+ \|' loop/PLAN.md | awk '{print $3}')
  return 0
}
i=0
while [ "$i" -lt "$MAX_ITER" ]; do
  [ -e STOP ] && { log "STOP file found"; exit 3; }
  over_budget && { log "budget reached ($spent USD)"; exit 4; }
  i=$((i+1))
  log "iteration $i/$MAX_ITER, spent so far $spent USD"
  if grep -q '^- \[ \] [A-Z][0-9]* |' loop/PLAN.md; then
    ./loop/sandboxed.sh ./loop/agent.sh builder > "loop/logs/iter-$i.json" 2> "loop/logs/iter-$i.err"; rc=$?
    add_cost "$(jq -r '.total_cost_usd // 0' "loop/logs/iter-$i.json" 2>/dev/null || echo 0)"
    limited=0
    if [ "$rc" -ne 0 ] && ! probe; then limited=1; fi
    looks_limited "loop/logs/iter-$i.json" && limited=1
    if [ "$limited" = 1 ]; then wait_for_quota; i=$((i-1)); continue; fi
    if [ "$rc" -ne 0 ] && [ ! -s "loop/logs/iter-$i.json" ]; then fails=$((fails+1)); log "builder failed rc=$rc (see loop/logs/iter-$i.err), consecutive failures $fails/$FAIL_LIMIT"
    else fails=0; fi
    [ "$fails" -ge "$FAIL_LIMIT" ] && { log "too many consecutive failures"; exit 5; }
    [ "$(plan_sig)" = "$sig0" ] || { log "loop/PLAN.md was changed beyond ticking boxes. Review with git diff, then re-run."; commit_all "iteration $i: builder (PLAN.md tampered)"; exit 7; }
    if commit_all "iteration $i: builder"; then stall=0; else stall=$((stall+1)); log "builder changed no files (stall $stall/$STALL_LIMIT)"; fi
    [ "$stall" -ge "$STALL_LIMIT" ] && { log "stalled: no progress in $STALL_LIMIT iterations"; exit 6; }
  else
    log "every task row is ticked; only verification and review are pending"
  fi
  ./loop/sandboxed.sh ./loop/verify.sh > "loop/logs/verify-$i.txt" 2>&1; vrc=$?
  if [ "$vrc" -eq 0 ]; then
    ./loop/review.sh > "loop/logs/review-$i.txt" 2>&1; rrc=$?
    add_cost "$(sed -n 's/^REVIEW_COST=//p' "loop/logs/review-$i.txt" | tail -1)"
    if [ "$rrc" -eq 2 ] && ! probe; then commit_all "iteration $i: loop bookkeeping" || true; wait_for_quota; i=$((i-1)); continue; fi
  else
    { echo "# Objective check failed after iteration $i (fix these first; the ticked row stays ticked only if you make them pass)"; grep -E 'FAILED|DIFFER|PIXELS|CONTENT|MISSING|ERRORS|SIZE|EXTRA|^site/|^src/|^index|^pills/|^\.github|^loop/PLAN|^README' "loop/logs/verify-$i.txt" | head -n 60; } > loop/feedback.md
    log "objective checks failed (see loop/logs/verify-$i.txt)"
  fi
  commit_all "iteration $i: loop bookkeeping" || true
  if [ "$vrc" -eq 0 ] && all_done; then
    log "ALL TASKS DONE and verified. Spent about $spent USD."
    grep -l "ACCEPTED WITH NOTES" loop/reviews/notes/*.md 2>/dev/null | sed "s/^/task accepted with notes (polish later): /" | tee -a loop/logs/loop.log
    log "Review the site yourself: npm run serve, then open http://127.0.0.1:8765/"
    exit 0
  fi
done
log "iteration cap reached without finishing"; exit 1
