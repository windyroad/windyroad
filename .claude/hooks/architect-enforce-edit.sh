#!/bin/bash
# Architecture - PreToolUse enforcement hook
# BLOCKS Edit/Write to architecture-bearing files until architect is consulted.
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

# Only gate architecture-bearing files
IS_ARCH=false
BASENAME=$(basename "$FILE_PATH")

case "$FILE_PATH" in
  */package.json)
    IS_ARCH=true ;;
  */tsconfig*.json)
    IS_ARCH=true ;;
  */.github/workflows/*.yml|*/.github/workflows/*.yaml)
    IS_ARCH=true ;;
  */.claude/hooks/*.sh)
    IS_ARCH=true ;;
  */.claude/settings.json)
    IS_ARCH=true ;;
  */scripts/*.sh|*/scripts/*.js|*/scripts/*.ts|*/scripts/*.mjs)
    IS_ARCH=true ;;
  */docs/decisions/*.md)
    IS_ARCH=true ;;
esac

# Also match root config files (*.config.*)
case "$BASENAME" in
  *.config.js|*.config.ts|*.config.mjs|*.config.cjs)
    IS_ARCH=true ;;
  next.config.*|tailwind.config.*|postcss.config.*)
    IS_ARCH=true ;;
esac

if [ "$IS_ARCH" = false ]; then
  exit 0
fi

MARKER="/tmp/architect-reviewed-${SESSION_ID}"
if [ -n "$SESSION_ID" ] && [ -f "$MARKER" ]; then
  exit 0
fi

cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "BLOCKED: Cannot edit architecture-bearing file '${BASENAME}' without architecture review. You MUST first delegate to architect using the Agent tool (subagent_type: 'architect'). The architect will review against existing decisions in docs/decisions/ and flag if a new decision should be documented. After the review completes, this file will be unblocked automatically."
  }
}
EOF
exit 0
