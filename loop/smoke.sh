#!/usr/bin/env bash
# Run this BEFORE the loop, from the repository root: ./loop/smoke.sh
# It proves the boundary holds and the toolchain works inside it (it re-launches itself inside the sandbox).
cd "$(dirname "$0")/.." || exit 1
if [ -z "${INSIDE_SMOKE:-}" ]; then
  INSIDE_SMOKE=1 ./loop/sandboxed.sh ./loop/smoke.sh; rc=$?
  echo; echo "== claude auth + network (through the sandbox)"
  ./loop/sandboxed.sh ./loop/agent.sh ping | jq -r '.result // .'
  echo; echo "== can the reviewer SEE an image? (should describe the pill page it is shown)"
  ./loop/sandboxed.sh ./loop/agent.sh visionping | jq -r '.result // .'
  echo; echo "== do the headless permission rules behave as intended? (real Claude, builder allow/deny list)"
  mkdir -p .smoke loop/logs; cp loop/prompts/canary.txt .smoke/canary.before; rm -f .smoke/perm_report.txt
  ./loop/sandboxed.sh ./loop/agent.sh permcheck > loop/logs/permcheck.json 2>&1
  if [ -f .smoke/perm_report.txt ]; then cat .smoke/perm_report.txt; else echo "FAIL  no permission report was written (see loop/logs/permcheck.json)"; rc=1; fi
  for n in 1 2 3; do grep -q "^$n: ALLOWED" .smoke/perm_report.txt 2>/dev/null && echo "PASS  step $n allowed" || { echo "FAIL  step $n should be ALLOWED"; rc=1; }; done
  for n in 4 5 6; do grep -q "^$n: DENIED" .smoke/perm_report.txt 2>/dev/null && echo "PASS  step $n denied" || { echo "FAIL  step $n should be DENIED"; rc=1; }; done
  cmp -s loop/prompts/canary.txt .smoke/canary.before && echo "PASS  protected canary file unchanged" || { echo "FAIL  protected file was modified"; rc=1; }
  [ "$rc" = 0 ] && echo "PERMISSION CHECK PASSED" || echo "PERMISSION CHECK FAILED: do not run the loop"
  exit $rc
fi
export XDG_CACHE_HOME="$PWD/.cache" TMPDIR="$PWD/.tmp"
mkdir -p .smoke .tmp .cache
bad=0
pass() { echo "PASS  $1"; }
nope() { echo "FAIL  $1"; bad=1; }
echo "== toolchain must work inside the sandbox"
node build.js >/dev/null 2>&1 && pass "node build.js" || nope "node build.js"
./node_modules/.bin/html-validate --version >/dev/null 2>&1 && pass "html-validate runs" || nope "html-validate runs"
node loop/tools/pages.mjs links >/dev/null 2>&1 && pass "pages.mjs links" || nope "pages.mjs links"
rm -rf .smoke/shots
if node loop/tools/shots.mjs .smoke/shots 12-the-names > .smoke/shots.log 2>&1 && [ -f .smoke/shots/12-the-names-07.png ]; then
  pass "headless Chromium captures a pill inside the sandbox"; cp .smoke/shots/12-the-names-07.png .smoke/f.png
else nope "headless Chromium capture (see .smoke/shots.log)"; fi
if [ -f .smoke/shots/12-the-names-07.png ] && ls loop/baseline/12-the-names-*.png >/dev/null 2>&1; then
  mkdir -p .smoke/base && cp loop/baseline/12-the-names-* .smoke/base/
  node loop/tools/compare.mjs .smoke/base .smoke/shots 0.01 >/dev/null 2>&1 && pass "capture matches the baseline" || nope "capture differs from the baseline (see: node loop/tools/compare.mjs .smoke/base .smoke/shots)"
fi
gitleaks version >/dev/null 2>&1 && pass "gitleaks runs" || nope "gitleaks runs"
echo "== boundary must HOLD (each of these should be blocked)"
ls "$HOME" >/dev/null 2>&1 && nope "could list your home directory" || pass "home directory unreadable"
touch "$HOME/.smoke_outside" 2>/dev/null && { rm -f "$HOME/.smoke_outside"; nope "could WRITE outside the project"; } || pass "write outside project blocked"
touch loop/prompts/.smoke_write 2>/dev/null && { rm -f loop/prompts/.smoke_write; nope "could write into loop/prompts"; } || pass "control files unwritable"
curl -sS -m 6 -o /dev/null https://example.com 2>/dev/null && nope "example.com reachable" || pass "arbitrary internet blocked"
echo "== allowed network"
code=$(curl -sS -m 8 -o /dev/null -w '%{http_code}' https://api.anthropic.com 2>/dev/null || true)
[ -n "$code" ] && [ "$code" != "000" ] && pass "api.anthropic.com reachable (HTTP $code)" || nope "api.anthropic.com NOT reachable"
[ "$bad" = 0 ] && echo "SMOKE TEST PASSED" || echo "SMOKE TEST FAILED: fix before running the loop"
exit $bad
