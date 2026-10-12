#!/usr/bin/env bash
# Runs OUTSIDE the sandbox but only talks to the reviewer agent (which itself runs sandboxed). A task passes when the
# reviewer reports no BLOCKING issue. After MAX_REVIEW_REJECTS rejections a task is accepted with notes, so one
# stubborn task can never stall the project. The loop, not the agent, records verdicts and un-ticks rejected tasks.
cd "$(dirname "$0")/.." || exit 1
trim() { sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//'; }
max_rej=$(sed -n 's/^MAX_REVIEW_REJECTS: *\([0-9][0-9]*\).*/\1/p' loop/PLAN.md | head -1); max_rej=${max_rej:-4}
mkdir -p loop/reviews/notes loop/logs; touch loop/reviews/rejects.txt loop/reviews/passed.txt
: > loop/reviews/queue.txt
while IFS='|' read -r head key desc; do
  id=$(echo "$head" | awk '{print $NF}')
  grep -q "^$id\$" loop/reviews/passed.txt || echo "$id | $(printf '%s' "$key" | trim) | $(printf '%s' "$desc" | trim | cut -c1-300)" >> loop/reviews/queue.txt
done < <(grep -E '^- \[x\] K[0-9]+ \|' loop/PLAN.md)
[ -s loop/reviews/queue.txt ] || { echo "nothing new to review"; echo "REVIEW_COST=0"; exit 0; }
git diff HEAD~1 --stat > loop/reviews/diff-stat.txt 2>/dev/null || true
git diff HEAD~1 -- src site build.js README.md .github > loop/reviews/diff.patch 2>/dev/null || true
out="loop/logs/review-$(date +%s).json"
./loop/sandboxed.sh ./loop/agent.sh reviewer > "$out" 2> "$out.err" || echo "reviewer exited non-zero"
echo "REVIEW_COST=$(jq -r '.total_cost_usd // 0' "$out" 2>/dev/null || echo 0)"
verdict=$(jq -c '.structured_output // empty' "$out" 2>/dev/null)
[ -n "$verdict" ] || { echo "reviewer returned no structured output"; exit 2; }
: > loop/feedback.md
anyfail=0
while IFS='|' read -r id rest; do
  id=$(printf '%s' "$id" | trim); [ -n "$id" ] || continue
  mentioned=$(echo "$verdict" | jq -r --arg id "$id" '[.tasks[] | select(.id==$id)] | length')
  if [ "$mentioned" = "0" ]; then echo "review MISSING $id (no verdict returned)"; anyfail=1; continue; fi
  blocking=$(echo "$verdict" | jq -r --arg id "$id" '[.tasks[] | select(.id==$id) | .issues[]? | select(.severity=="blocking")] | length')
  nminor=$(echo "$verdict" | jq -r --arg id "$id" '[.tasks[] | select(.id==$id) | .issues[]? | select(.severity!="blocking")] | length')
  blist=$(echo "$verdict" | jq -r --arg id "$id" '.tasks[] | select(.id==$id) | [.issues[]? | select(.severity=="blocking")][:5][] | "- BLOCKING: " + .text')
  mlist=$(echo "$verdict" | jq -r --arg id "$id" '.tasks[] | select(.id==$id) | [.issues[]? | select(.severity!="blocking")][:3][] | "- optional polish: " + .text')
  if [ "$blocking" = "0" ]; then
    echo "$id" >> loop/reviews/passed.txt
    grep -v "^$id " loop/reviews/rejects.txt > loop/reviews/rejects.tmp 2>/dev/null; mv loop/reviews/rejects.tmp loop/reviews/rejects.txt 2>/dev/null
    { echo "# $id: passed review"; [ -n "$mlist" ] && { echo "Minor polish ideas:"; echo "$mlist"; }; } > "loop/reviews/notes/$id.md"
    echo "review PASS $id (minor notes: $nminor)"; continue
  fi
  n=$(awk -v id="$id" '$1==id{print $2}' loop/reviews/rejects.txt | tail -1); n=$(( ${n:-0} + 1 ))
  grep -v "^$id " loop/reviews/rejects.txt > loop/reviews/rejects.tmp 2>/dev/null; echo "$id $n" >> loop/reviews/rejects.tmp; mv loop/reviews/rejects.tmp loop/reviews/rejects.txt
  if [ "$n" -ge "$max_rej" ]; then
    echo "$id" >> loop/reviews/passed.txt
    { echo "# $id: ACCEPTED WITH NOTES after $n rejections (polish later)"; echo "$blist"; [ -n "$mlist" ] && echo "$mlist"; } > "loop/reviews/notes/$id.md"
    echo "review ACCEPTED-WITH-NOTES $id after $n rejections"
  else
    anyfail=1; echo "review FAIL $id (rejection $n of $max_rej)"
    perl -pi -e "s/^- \[x\] $id \|/- [ ] $id |/" loop/PLAN.md
    { echo "## Reviewer feedback for $id (row un-ticked; fix ONLY the blocking items, rejection $n of $max_rej)"; echo "$blist"; [ -n "$mlist" ] && { echo "(optional, ignore unless you have time:)"; echo "$mlist"; }; echo; } >> loop/feedback.md
  fi
done < loop/reviews/queue.txt
[ "$anyfail" = 0 ] && echo "No outstanding review issues." > loop/feedback.md
exit 0
