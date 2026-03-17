#!/bin/bash
# Architecture - PreToolUse enforcement hook for ExitPlanMode
# BLOCKS ExitPlanMode until architect has reviewed the plan against ADRs.
# Uses the same marker-file pattern as architect-enforce-edit.sh.

# Portable mtime: tries GNU stat, falls back to macOS stat
_mtime() { stat -c%Y "$1" 2>/dev/null || /usr/bin/stat -f%m "$1" 2>/dev/null || echo 0; }

# Portable hash: tries md5sum, falls back to md5 -r, then shasum
_hashcmd() { md5sum 2>/dev/null || md5 -r 2>/dev/null || shasum 2>/dev/null; }

INPUT=$(cat)

SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty') || true

if [ -z "$SESSION_ID" ]; then
  # Fail-closed: block on parse failure
  cat <<'EOF'
{ "hookSpecificOutput": { "hookEventName": "PreToolUse", "permissionDecision": "deny",
    "permissionDecisionReason": "BLOCKED: Could not parse hook input. Gate is fail-closed." } }
EOF
  exit 0
fi

# Only check if the architect agent exists
if [ ! -f ".claude/agents/architect.md" ]; then
  exit 0
fi

MARKER="/tmp/architect-reviewed-${SESSION_ID}"
TTL_SECONDS="${ARCHITECT_TTL:-600}"

if [ -n "$SESSION_ID" ] && [ -f "$MARKER" ]; then
  NOW=$(date +%s)
  MARKER_TIME=$(_mtime "$MARKER")
  AGE=$(( NOW - MARKER_TIME ))
  if [ "$AGE" -lt "$TTL_SECONDS" ]; then
    # TTL still valid -- check for decision drift
    HASH_FILE="/tmp/architect-reviewed-${SESSION_ID}.hash"
    if [ -f "$HASH_FILE" ]; then
      STORED=$(cat "$HASH_FILE")
      if [ -d "docs/decisions" ]; then
        CURRENT=$(find docs/decisions -name '*.md' -not -name 'README.md' -print0 | sort -z | xargs -0 cat 2>/dev/null | _hashcmd | cut -d' ' -f1)
      else
        CURRENT="none"
      fi
      if [ "$STORED" != "$CURRENT" ]; then
        rm -f "$HASH_FILE"
        # Don't delete the edit marker -- only invalidate for plan-enforce
        # Falls through to deny block
      else
        touch "$MARKER"  # Slide TTL window forward
        exit 0
      fi
    else
      touch "$MARKER"  # Slide TTL window forward
      exit 0  # No hash = old marker format, allow
    fi
  else
    rm -f "$MARKER"
  fi
fi

cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "BLOCKED: Architect must review the plan file before exiting plan mode. You MUST first delegate to architect using the Agent tool (subagent_type: 'architect') to review the plan against existing decisions in docs/decisions/. After the review completes, this will be unblocked automatically."
  }
}
EOF
exit 0
