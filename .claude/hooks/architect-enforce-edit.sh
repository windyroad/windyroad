#!/bin/bash
# Architecture - PreToolUse enforcement hook
# BLOCKS Edit/Write to all project files until architect is consulted.
# Excludes only non-architectural files: stylesheets, images, generated files.
# Mirrors: voice-tone-enforce-edit.sh

INPUT=$(cat)

eval "$(echo "$INPUT" | python3 -c "
import sys, json
data = json.load(sys.stdin)
ti = data.get('tool_input', {})
print('FILE_PATH=' + repr(ti.get('file_path', '')))
print('SESSION_ID=' + repr(data.get('session_id', '')))
" 2>/dev/null || echo "FILE_PATH=''; SESSION_ID=''")"

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
esac

# Everything else is gated
MARKER="/tmp/architect-reviewed-${SESSION_ID}"
if [ -n "$SESSION_ID" ] && [ -f "$MARKER" ]; then
  exit 0
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
