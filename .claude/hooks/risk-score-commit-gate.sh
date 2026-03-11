#!/bin/bash
# PreToolUse hook: Denies git commit when risk score > 2.
# Reads score from /tmp/risk-score-value-{SESSION_ID}.

set -euo pipefail

INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('tool_name', ''))
except:
    print('')
" 2>/dev/null || echo "")

[ "$TOOL_NAME" = "Bash" ] || exit 0

COMMAND=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('tool_input', {}).get('command', ''))
except:
    print('')
" 2>/dev/null || echo "")

# Only act on git commit commands
echo "$COMMAND" | grep -qE '(^|;|&&|\|\|)\s*git commit' || exit 0

SESSION_ID=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('session_id', ''))
except:
    print('')
" 2>/dev/null || echo "")

[ -n "$SESSION_ID" ] || exit 0

CLEAN_FILE="/tmp/risk-score-clean-${SESSION_ID}"
SCORE_FILE="/tmp/risk-score-value-${SESSION_ID}"

# Clean tree marker means no uncommitted changes when last checked
if [ -f "$CLEAN_FILE" ]; then
    exit 0
fi

# No score file means risk-scorer hasn't run yet; allow
if [ ! -f "$SCORE_FILE" ]; then
    exit 0
fi

SCORE=$(cat "$SCORE_FILE" 2>/dev/null || echo "")

# Validate score is a number
if ! echo "$SCORE" | grep -qE '^[0-9]+(\.[0-9]+)?$'; then
    cat <<'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Risk score file contains invalid value. Re-run the risk-scorer agent to get a valid score before committing."
  }
}
EOF
    exit 0
fi

# Compare: deny if score > 2
DENIED=$(python3 -c "
score = float('$SCORE')
print('yes' if score > 2 else 'no')
" 2>/dev/null || echo "yes")

if [ "$DENIED" = "yes" ]; then
    cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Risk score ${SCORE}/5. Do not commit risky work. Reduce changes first: stash unrelated files, revert exploratory edits, or split your work. Then re-run the risk-scorer agent to get a lower score."
  }
}
EOF
    exit 0
fi

# Score <= 2, allow
exit 0
