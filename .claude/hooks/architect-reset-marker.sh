#!/bin/bash
# Architecture - Stop hook
# Removes the architect session marker so the next turn requires a fresh review.
# Mirrors: voice-tone-reset-marker.sh

INPUT=$(cat)

SESSION_ID=$(echo "$INPUT" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(data.get('session_id', ''))
" 2>/dev/null)

if [ -n "$SESSION_ID" ]; then
  rm -f "/tmp/architect-reviewed-${SESSION_ID}"
fi

exit 0
