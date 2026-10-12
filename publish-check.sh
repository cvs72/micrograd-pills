#!/usr/bin/env bash
# Publish check: fails if any TRACKED file contains a machine path, a personal identifier or something shaped
# like a secret, then runs gitleaks over the whole git history. Run before any push and before the repo goes public.
# reference/ (Karpathy's material) and the lockfile are excluded. Extra words to forbid (your name, old handles):
# PUBLISH_CHECK_EXTRA='name1|name2' in .env, or in the environment.
set -eu
cd "$(git rev-parse --show-toplevel)"
fail=0
check() { # $1 label, $2 regex, $3 optional regex of allowed hits
  hits=$(git grep -n -I -i -E -e "$2" -- . ':!reference/**' ':!uv.lock' ':!./publish-check.sh' || true)
  [ -n "${3:-}" ] && hits=$(printf '%s\n' "$hits" | grep -v -i -E "$3" || true)
  [ -z "$hits" ] || { echo "== $1"; echo "$hits"; echo; fail=1; }
}
check "home or machine paths"  '(^|[^a-z])/(Users|home)/[a-z0-9_.-]+'
check "email addresses"        '[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}' 'users\.noreply\.github\.com'
check "key-shaped strings"     'sk-[a-z0-9_-]{16,}|sk_[a-z0-9]{16,}|AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|xox[baprs]-[0-9A-Za-z-]{10,}|glpat-[A-Za-z0-9_-]{20,}'
[ -z "${PUBLISH_CHECK_EXTRA:-}" ] || check "forbidden words (PUBLISH_CHECK_EXTRA)" "$PUBLISH_CHECK_EXTRA"
git ls-files --error-unmatch .env >/dev/null 2>&1 && { echo "== tracked but must not be: .env"; fail=1; }
if command -v gitleaks >/dev/null 2>&1; then
  gitleaks git --no-banner --redact . || fail=1
else
  echo "gitleaks not installed: history not scanned (brew install gitleaks | see github.com/gitleaks/gitleaks)"; fail=1
fi
if [ "$fail" = 0 ]; then echo "PUBLISH CHECK PASSED"; else echo "PUBLISH CHECK FAILED"; exit 1; fi
