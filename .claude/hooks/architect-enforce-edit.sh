#!/bin/bash
# Architecture - PreToolUse enforcement hook
# BLOCKS Edit/Write to all project files until architect is consulted.
# Excludes only non-architectural files: stylesheets, images, generated files.
# Mirrors: voice-tone-enforce-edit.sh

# Portable mtime: tries GNU stat, falls back to macOS stat
_mtime() { stat -c%Y "$1" 2>/dev/null || /usr/bin/stat -f%m "$1" 2>/dev/null || echo 0; }

# Portable hash: tries md5sum, falls back to md5 -r, then shasum
_hashcmd() { md5sum 2>/dev/null || md5 -r 2>/dev/null || shasum 2>/dev/null; }

INPUT=$(cat)

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty') || true
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty') || true

if [ -z "$SESSION_ID" ]; then
  # Fail-closed: block on parse failure
  cat <<'EOF'
{ "hookSpecificOutput": { "hookEventName": "PreToolUse", "permissionDecision": "deny",
    "permissionDecisionReason": "BLOCKED: Could not parse hook input. Gate is fail-closed." } }
EOF
  exit 0
fi

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Only check if the architect agent exists
if [ ! -f ".claude/agents/architect.md" ]; then
  exit 0
fi

BASENAME=$(basename "$FILE_PATH")

# Exclude non-architectural files
case "$FILE_PATH" in
  *.css|*.scss|*.sass|*.less)
    exit 0 ;;
  *.png|*.jpg|*.jpeg|*.gif|*.svg|*.ico|*.webp)
    exit 0 ;;
  *.woff|*.woff2|*.ttf|*.eot)
    exit 0 ;;
  *package-lock.json|*yarn.lock|*pnpm-lock.yaml)
    exit 0 ;;
  *.map)
    exit 0 ;;
  *.changeset/*.md|*/.changeset/*.md)
    exit 0 ;;
  */MEMORY.md|*/.claude/projects/*/memory/*)
    exit 0 ;;
esac

# Everything else is gated
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
        rm -f "$MARKER" "$HASH_FILE"
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
    # Falls through to deny block
  fi
fi

cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "BLOCKED: Cannot edit '${BASENAME}' without architecture review. You MUST first delegate to architect using the Agent tool (subagent_type: 'architect'). The architect will review against existing decisions in docs/decisions/ and flag if a new decision should be documented. After the review completes, this file will be unblocked automatically."
  }
}
EOF
exit 0
