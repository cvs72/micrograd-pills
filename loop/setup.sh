#!/usr/bin/env bash
# One-time, run by YOU in a normal terminal from the repository root (not by an agent): ./loop/setup.sh
# Checks tools, writes loop/srt-settings.json (the sandbox boundary).
set -eu
cd "$(dirname "$0")/.."
miss=0
need() { command -v "$1" >/dev/null 2>&1 || { echo "MISSING: $1   -> $2"; miss=1; }; }
need node "https://nodejs.org (nvm)"; need npm "comes with node"; need jq "brew install jq | apt install jq"; need rg "brew install ripgrep (needed by srt)"
need srt "npm install -g @anthropic-ai/sandbox-runtime"; need claude "install Claude Code"; need git "your package manager"
need python3 "your package manager"; need perl "your package manager"; need gitleaks "brew install gitleaks"
[ "$miss" = 0 ] || { echo "Install the missing tools, then re-run ./loop/setup.sh"; exit 1; }
git rev-parse --git-dir >/dev/null 2>&1 || { echo "Not a git repo."; exit 1; }
[ -d node_modules/playwright ] || { echo "run: npm ci   (then: npx playwright install chromium)"; exit 1; }
mkdir -p loop/logs loop/shots loop/reviews .cache .tmp
python3 - << 'PY'
import json, os, shutil, subprocess
from pathlib import Path
def real(p): return os.path.realpath(p)
home = str(Path.home()); home_parent = str(Path.home().parent)
tmp_dirs = sorted({"/tmp", real("/tmp")})
allow = ["."]
def add(p):
    if p and p not in allow and (p.startswith(home) or p.startswith("/opt/homebrew") or p.startswith("/usr/local")): allow.append(p)
for exe in ("claude", "node", "npm", "npx", "gitleaks", "git", "jq", "rg", "perl", "python3"):
    p = shutil.which(exe)
    if p: add(os.path.dirname(p)); add(os.path.dirname(real(p)))
# Playwright's browsers (macOS and Linux caches), unless PLAYWRIGHT_BROWSERS_PATH points elsewhere
for c in (os.environ.get("PLAYWRIGHT_BROWSERS_PATH"), f"{home}/Library/Caches/ms-playwright", f"{home}/.cache/ms-playwright"):
    if c and os.path.isdir(c): add(c)
# git refuses to run when the global config exists but cannot be read
for c in (f"{home}/.gitconfig", f"{home}/.config/git"):
    if os.path.exists(c): add(c)
cfg = {
  "network": {"allowedDomains": ["api.anthropic.com", "claude.ai", "platform.claude.com"], "deniedDomains": [],
              "allowLocalBinding": True},  # the capture tool serves site/ on a loopback port for headless Chromium
  "filesystem": {
    "denyRead": [home_parent, "./.env"],
    "allowRead": allow,
    "allowWrite": ["."] + tmp_dirs,
    "denyWrite": ["./loop/loop.sh", "./loop/verify.sh", "./loop/review.sh", "./loop/agent.sh", "./loop/sandboxed.sh", "./loop/setup.sh",
                  "./loop/smoke.sh", "./loop/prompts", "./loop/tools", "./loop/baseline", "./loop/srt-settings.json", "./loop/feedback.md",
                  "./loop/reviews", "./loop/README.md", "./.env", "./.env.example", "./.claude", "./CLAUDE.md", "./design", "./reference",
                  "./src/digits", "./publish-check.sh", "./package.json", "./package-lock.json", "./.htmlvalidate.json", "./pyproject.toml",
                  "./node_modules", "./.git/hooks", "./.git/config"]
  }
}
json.dump(cfg, open("loop/srt-settings.json", "w"), indent=2)
print("wrote loop/srt-settings.json with read access to:", allow)
PY
echo
echo "Next: run 'claude setup-token', copy the token it prints, then:"
echo "  export CLAUDE_CODE_OAUTH_TOKEN=<token>     (or export ANTHROPIC_API_KEY=<key>)"
echo "  ./loop/smoke.sh"
