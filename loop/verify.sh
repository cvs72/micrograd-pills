#!/usr/bin/env bash
# Objective gate. Runs INSIDE the sandbox (it executes agent-written code). Exit 0 = the site builds, validates,
# every ticked task of loop/PLAN.md passes its checks, and every pill still shows exactly what the baseline shows.
cd "$(dirname "$0")/.." || exit 1
export XDG_CACHE_HOME="$PWD/.cache" TMPDIR="$PWD/.tmp"
mkdir -p loop/logs loop/shots .cache .tmp
fail=0
trim() { sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//'; }
tol=$(sed -n 's/^SHOT_TOL: *\([0-9.a-z]*\).*/\1/p' loop/PLAN.md | head -1); tol=${tol:-0.01}
echo "== build"
node build.js || { echo "BUILD FAILED"; fail=1; }
echo "== html-validate"
./node_modules/.bin/html-validate "site/**/*.html" || { echo "HTML VALIDATION FAILED"; fail=1; }
echo "== links"
node loop/tools/pages.mjs links || fail=1
echo "== checks of the ticked tasks"
checks=""; live=0
while IFS='|' read -r head key rest; do
  id=$(echo "$head" | awk '{print $NF}'); key=$(printf '%s' "$key" | trim)
  case "$key" in
    vendor) c="local" ;; skeleton) c="skeleton" ;; kit) c="kit" ;; three) c="three local" ;; access) c="a11y" ;; csp) c="csp local" ;; ci) c="ci" ;;
    phone) c="sheet"; live=1 ;; menu) c="menu links" ;; footer) c="footer links" ;; fit) c="fit" ;; polish) c="links skeleton" ;; *) c="" ;;
  esac
  echo "-- $id ($key): ${c:-no static check}"; checks="$checks $c"
done < <(grep -E '^- \[x\] [A-Z][0-9]+ \|' loop/PLAN.md)
if [ -n "$(echo "$checks" | trim)" ]; then node loop/tools/pages.mjs $checks || { echo "TASK CHECKS FAILED"; fail=1; }; fi
if [ "$live" = 1 ]; then echo "== responsive (every page at nine sizes, sheet open, live resize)"; node loop/tools/responsive.mjs > loop/logs/responsive.txt 2>&1 || { echo "RESPONSIVE CHECK FAILED (see loop/logs/responsive.txt)"; grep -v ': checked$' loop/logs/responsive.txt | head -n 40; fail=1; }; fi
echo "== captures against the baseline (content frozen; pixel tolerance $tol)"
rm -f loop/shots/*
if node loop/tools/shots.mjs loop/shots > loop/logs/shots.txt 2>&1; then :; else echo "CAPTURE REPORTED ERRORS (see loop/logs/shots.txt)"; tail -n 20 loop/logs/shots.txt; fail=1; fi
node loop/tools/compare.mjs loop/baseline loop/shots "$tol" || { echo "CAPTURES DIFFER FROM THE BASELINE"; fail=1; }
echo "== publish check"
PUBLISH_CHECK_SKIP_HISTORY=1 ./publish-check.sh || fail=1
[ "$fail" = 0 ] && echo "VERIFY PASSED" || echo "VERIFY FAILED"
exit $fail
