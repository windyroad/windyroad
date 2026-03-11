#!/bin/bash
# UserPromptSubmit hook: Nudges about accumulating WIP.
# Checks 1-2 (local) run every prompt via UserPromptSubmit.
# Checks 3-4 (remote) run in push:watch after push completes.
# These are nudges, not gates (no permissionDecision).
# Uses systemMessage (visible in terminal) + additionalContext (injected into AI).

set -euo pipefail

WARNINGS=""

# --- 1. Stale modified files (>24h since last modification) ---
# (Line-count and untracked-file-count checks removed; now covered by risk-scorer agent)
STALE_COUNT=$(git diff --name-only HEAD 2>/dev/null | python3 -c "
import sys, os, time
threshold = time.time() - 86400
count = 0
for line in sys.stdin:
    f = line.strip()
    if not f or not os.path.isfile(f):
        continue
    try:
        if os.path.getmtime(f) < threshold:
            count += 1
    except OSError:
        pass
print(count)
" 2>/dev/null || echo "0")
if [ "$STALE_COUNT" -gt 0 ]; then
    WARNINGS="${WARNINGS}WIP: ${STALE_COUNT} modified file(s) uncommitted for over 24h. Forgotten or should be reverted?\n"
fi

# --- 2. Unpushed commits piling up ---
UNPUSHED=$(git rev-list --count origin/master..HEAD 2>/dev/null || echo "0")
if [ "$UNPUSHED" -ge 3 ]; then
    WARNINGS="${WARNINGS}WIP: ${UNPUSHED} unpushed commits on master. Consider running \`npm run push:watch\`.\n"
fi

# --- Output ---
if [ -n "$WARNINGS" ]; then
    ESCAPED=$(echo -e "$WARNINGS" | python3 -c "
import sys, json
text = sys.stdin.read().strip()
print(json.dumps(text))
" 2>/dev/null || echo '""')

    # systemMessage: displayed directly in the user's terminal
    # additionalContext: injected into the AI's context for the next response
    cat <<EOF
{
  "systemMessage": "WIP accumulation detected. See warnings below.",
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": $ESCAPED
  }
}
EOF
    exit 0
fi

# No warnings
exit 0
