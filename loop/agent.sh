#!/usr/bin/env bash
# usage: ./loop/sandboxed.sh ./loop/agent.sh builder|reviewer|ping|visionping|permcheck
# Permission rules are CLI flags on purpose: in `claude -p`, allow rules from a project's .claude/settings.json are
# ignored unless the folder was trusted interactively, and a private CLAUDE_CONFIG_DIR means no trust record exists.
# CLI flags always apply, and agents cannot edit this file.
set -eu
cd "$(dirname "$0")/.."
role="${1:?role}"
mkdir -p .claude-home .cache .tmp loop/logs loop/shots
export CLAUDE_CONFIG_DIR="$PWD/.claude-home"
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
export XDG_CACHE_HOME="$PWD/.cache" TMPDIR="$PWD/.tmp"
# the capture of twelve pills at four viewports takes over ten minutes inside the sandbox, longer than the Bash tool's default
# ceiling; without this the builder can only run it in the background and ends its turn before the result exists
export BASH_DEFAULT_TIMEOUT_MS=600000 BASH_MAX_TIMEOUT_MS=2700000
model="${CLAUDE_MODEL:-sonnet}"
ALLOW="Read,Edit,Write,Bash(node *),Bash(./node_modules/.bin/html-validate *),Bash(node_modules/.bin/html-validate *),Bash(./loop/verify.sh),Bash(loop/verify.sh),Bash(mkdir *),Bash(ls *),Bash(git status),Bash(git status *),Bash(git log *),Bash(git diff),Bash(git diff *),Bash(git show *)"
DENY="Edit(./loop/*.sh),Edit(./loop/prompts/**),Edit(./loop/tools/**),Edit(./loop/baseline/**),Edit(./loop/srt-settings.json),Edit(./loop/feedback.md),Edit(./loop/reviews/**),Edit(./loop/README.md),Edit(./CLAUDE.md),Edit(./design/**),Edit(./reference/**),Edit(./src/digits/**),Edit(./publish-check.sh),Edit(./package.json),Edit(./package-lock.json),Edit(./.htmlvalidate.json),Edit(./pyproject.toml),Edit(./.env*),Edit(./.claude/**),Edit(./node_modules/**),Bash(curl *),Bash(wget *),Bash(npm install *),Bash(npm i *),Bash(npx playwright install *),Bash(git push *),Bash(git commit *),Bash(git checkout *),Bash(git reset *),Bash(rm -r*),Bash(sudo *)"
case "$role" in
  builder)
    exec claude -p --model "$model" --permission-mode dontAsk \
      --allowedTools "$ALLOW" --disallowedTools "$DENY" \
      --max-turns "${BUILDER_TURNS:-60}" --max-budget-usd "${BUILDER_BUDGET:-4}" \
      --output-format json < loop/prompts/builder.md ;;
  reviewer)
    exec claude -p --model "$model" --permission-mode dontAsk --tools "Read,Bash" --allowedTools "Read,Bash(git diff *),Bash(git show *),Bash(git log *),Bash(ls *)" \
      --max-turns "${REVIEWER_TURNS:-40}" --max-budget-usd "${REVIEWER_BUDGET:-1.5}" \
      --output-format json --json-schema "$(cat loop/prompts/review.schema.json)" < loop/prompts/reviewer.md ;;
  ping)
    printf 'Reply with exactly: OK' | exec claude -p --model "$model" --permission-mode dontAsk --tools "" \
      --max-turns 1 --max-budget-usd 0.25 --output-format json ;;
  visionping)
    printf 'Use the Read tool on .smoke/f.png. Reply with only the text you can read in that image.' | exec claude -p --model "$model" \
      --permission-mode dontAsk --tools "Read" --allowedTools "Read" --max-turns 4 --max-budget-usd 0.25 --output-format json ;;
  permcheck)
    exec claude -p --model "$model" --permission-mode dontAsk --allowedTools "$ALLOW" --disallowedTools "$DENY" \
      --max-turns 14 --max-budget-usd 0.50 --output-format json < loop/prompts/permcheck.md ;;
  *) echo "unknown role $role" >&2; exit 2 ;;
esac
