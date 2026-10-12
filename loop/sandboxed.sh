#!/usr/bin/env bash
# Runs any command inside the OS sandbox (srt), from the repository root. Everything that executes agent-written code
# or the agent itself MUST go through this script. Secrets other than the Anthropic token never cross this line.
cd "$(dirname "$0")/.." || exit 1
unset PUBLISH_CHECK_EXTRA
if [ -n "${SANDBOX_OFF:-}" ]; then exec "$@"; fi
exec srt --settings "$PWD/loop/srt-settings.json" "$@"
