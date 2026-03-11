#!/bin/bash
# Stop hook: Clears risk score temp files on session end.

INPUT=$(cat)

SESSION_ID=$(echo "$INPUT" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(data.get('session_id', ''))
" 2>/dev/null)

if [ -n "$SESSION_ID" ]; then
    rm -f "/tmp/risk-score-value-${SESSION_ID}" "/tmp/risk-score-clean-${SESSION_ID}"
fi

exit 0
