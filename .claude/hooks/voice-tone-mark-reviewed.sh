#!/bin/bash
# Voice & Tone - PostToolUse hook for Agent tool
# Creates a session marker when voice-and-tone-lead has been consulted.
# This marker unlocks the voice-tone-enforce-edit.sh PreToolUse block.
# Mirrors: a11y-mark-reviewed.sh

INPUT=$(cat)

eval "$(echo "$INPUT" | python3 -c "
import sys, json
data = json.load(sys.stdin)
ti = data.get('tool_input', {})
subagent = ti.get('subagent_type', '')
session_id = data.get('session_id', '')
print('SUBAGENT=' + repr(subagent))
print('SESSION_ID=' + repr(session_id))
" 2>/dev/null || echo "SUBAGENT=''; SESSION_ID=''")"

if [ -n "$SESSION_ID" ]; then
  case "$SUBAGENT" in
    *voice-and-tone-lead*)
      touch "/tmp/voice-tone-reviewed-${SESSION_ID}" ;;
  esac
fi

exit 0
