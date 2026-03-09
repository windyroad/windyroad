#!/bin/bash
# Voice & Tone - PreToolUse enforcement hook
# BLOCKS Edit/Write to copy-bearing files until voice-and-tone-lead is consulted.
# Gated: .tsx in src/app/ and src/components-next/, .md in src/articles/
# Mirrors: a11y-enforce-edit.sh

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

# Only gate copy-bearing files
IS_COPY=false
case "$FILE_PATH" in
  */src/app/*.tsx|*/src/components-next/*.tsx)
    IS_COPY=true ;;
  */src/articles/*.md)
    IS_COPY=true ;;
  */src/social/*.md)
    IS_COPY=true ;;
  */public/img/social/*.svg)
    IS_COPY=true ;;
esac

if [ "$IS_COPY" = false ]; then
  exit 0
fi

MARKER="/tmp/voice-tone-reviewed-${SESSION_ID}"
if [ -n "$SESSION_ID" ] && [ -f "$MARKER" ]; then
  exit 0
fi

BASENAME=$(basename "$FILE_PATH")
cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "BLOCKED: Cannot edit copy file '${BASENAME}' without voice & tone review. You MUST first delegate to voice-and-tone-lead using the Agent tool (subagent_type: 'voice-and-tone-lead'). After the review completes, this file will be unblocked automatically."
  }
}
EOF
exit 0
