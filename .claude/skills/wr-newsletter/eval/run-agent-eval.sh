#!/usr/bin/env bash
# run-agent-eval.sh, promptfoo exec-provider driver for reviewer-AGENT fixtures.
#
# Sibling of run-skill-eval.sh. That one appends SKILL.md, because a SKILL eval
# tests the skill's instructions in their harness context. This one appends a
# single agent definition, because an agent eval tests that agent's prose as the
# whole instruction set.
#
# The agent is named as the FIRST argument, so one driver serves every reviewer:
#
#   providers:
#     - id: 'exec:bash ./run-agent-eval.sh .claude/agents/wr-newsletter-editor.md'
#
# Do NOT try to pass it through the provider's `config.env` block instead. That
# block is not applied to exec providers on promptfoo 0.120.19: the variable
# arrives unset and every fixture errors rather than failing, which reads as a
# broken harness rather than a red test.
#
# Promptfoo appends the rendered prompt after the configured arguments, so this
# is invoked as: bash run-agent-eval.sh <agent-path> "$PROMPT"
#
# The path is repo-relative. falsify.sh swaps that same path from a baseline
# ref, so pointing a fixture at an agent is all that is needed to falsify it.
#
# Subscription auth via the logged-in claude session: no ANTHROPIC_API_KEY.
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "run-agent-eval.sh: usage: run-agent-eval.sh <agent-path> <prompt>" >&2
  exit 2
fi

AGENT_PATH="$1"
shift

AGENT_MD="$(git rev-parse --show-toplevel)/${AGENT_PATH}"

if [[ ! -f "$AGENT_MD" ]]; then
  echo "run-agent-eval.sh: agent not found at $AGENT_MD" >&2
  exit 2
fi

exec claude -p --append-system-prompt "$(cat "$AGENT_MD")" "$@"
