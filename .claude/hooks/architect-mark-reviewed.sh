#!/bin/bash
# Architecture - PostToolUse hook for Agent tool
# Creates a session marker when architect has been consulted.
# This marker unlocks the architect-enforce-edit.sh PreToolUse block.
# Mirrors: voice-tone-mark-reviewed.sh

# Portable hash: tries md5sum, falls back to md5 -r, then shasum
_hashcmd() { md5sum 2>/dev/null || md5 -r 2>/dev/null || shasum 2>/dev/null; }

INPUT=$(cat)

SUBAGENT=$(echo "$INPUT" | jq -r '.tool_input.subagent_type // empty') || true
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty') || true
PROMPT=$(echo "$INPUT" | jq -r '.tool_input.prompt // empty') || true

if [ -z "$SESSION_ID" ]; then
  exit 0
fi

case "$SUBAGENT" in
  *architect*)
    # Check verdict file from architect agent
    VERDICT_FILE="/tmp/architect-verdict"
    VERDICT=""
    if [ -f "$VERDICT_FILE" ]; then
      VERDICT=$(cat "$VERDICT_FILE")
      rm -f "$VERDICT_FILE"
    fi

    case "$VERDICT" in
      PASS)
        # Architect explicitly passed, create marker
        touch "/tmp/architect-reviewed-${SESSION_ID}"
        ;;
      FAIL)
        # Architect found issues, do NOT create marker
        ;;
      *)
        # No verdict file (agent error or old agent version)
        # Allow with warning to avoid permanent lockout
        touch "/tmp/architect-reviewed-${SESSION_ID}"
        ;;
    esac

    # Store decision hash for drift detection
    if [ -f "/tmp/architect-reviewed-${SESSION_ID}" ]; then
      if [ -d "docs/decisions" ]; then
        HASH=$(find docs/decisions -name '*.md' -not -name 'README.md' -print0 | sort -z | xargs -0 cat 2>/dev/null | _hashcmd | cut -d' ' -f1)
      else
        HASH="none"
      fi
      echo "$HASH" > "/tmp/architect-reviewed-${SESSION_ID}.hash"
    fi

    # Determine if we're in plan mode -- create plan marker too
    IN_PLAN_MODE=false
    # Check for recently active plan files
    LATEST_PLAN=$(find ~/.claude/plans -name '*.md' -mmin -5 2>/dev/null | head -1)
    if [ -n "$LATEST_PLAN" ]; then
      IN_PLAN_MODE=true
    fi
    # Fallback: keyword check
    if echo "$PROMPT" | grep -qi 'plan\|ExitPlanMode'; then
      IN_PLAN_MODE=true
    fi

    if [ "$IN_PLAN_MODE" = true ] && [ -f "/tmp/architect-reviewed-${SESSION_ID}" ]; then
      touch "/tmp/architect-plan-reviewed-${SESSION_ID}"
    fi
    ;;
esac

exit 0
