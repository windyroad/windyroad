#!/usr/bin/env bash
# run-skill-eval.sh , promptfoo exec-provider driver for the wr-newsletter
# SKILL eval. Appends SKILL.md as system prompt (`--append-system-prompt`,
# not `--system-prompt`) because a SKILL eval tests the skill's instructions
# in their real harness context, unlike an agent eval where the agent prose
# IS the whole instruction set. Mirrors the sibling plugin repo's
# packages/*/skills/*/eval/run-skill-eval.sh.
#
# Promptfoo invokes this as: bash run-skill-eval.sh "$PROMPT"
#
# Subscription auth via the logged-in claude session: no ANTHROPIC_API_KEY,
# no CLAUDE_CODE_OAUTH_TOKEN.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_MD="${SCRIPT_DIR}/../SKILL.md"

if [[ ! -f "$SKILL_MD" ]]; then
  echo "run-skill-eval.sh: SKILL.md not found at $SKILL_MD" >&2
  exit 2
fi

exec claude -p --append-system-prompt "$(cat "$SKILL_MD")" "$@"
