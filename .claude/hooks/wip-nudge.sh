#!/bin/bash
# UserPromptSubmit hook: Nudges about accumulating WIP.
# Checks 1-2 (local) run every prompt. Checks 3-4 (remote) run in push:watch.
# These are nudges (systemReminder), not gates (no permissionDecision).

set -euo pipefail

WARNINGS=""

# --- 1. Uncommitted changes too large ---
DIFF_STAT=$(git diff HEAD --stat 2>/dev/null | tail -1 || echo "")
if [ -n "$DIFF_STAT" ]; then
    INSERTIONS=$(echo "$DIFF_STAT" | grep -oE '[0-9]+ insertion' | grep -oE '[0-9]+' || echo "0")
    DELETIONS=$(echo "$DIFF_STAT" | grep -oE '[0-9]+ deletion' | grep -oE '[0-9]+' || echo "0")
    INSERTIONS=${INSERTIONS:-0}
    DELETIONS=${DELETIONS:-0}
    TOTAL=$((INSERTIONS + DELETIONS))
    if [ "$TOTAL" -ge 200 ]; then
        WARNINGS="${WARNINGS}WIP: ~${TOTAL} lines of uncommitted changes. Consider committing before continuing.\n"
    fi
fi

# Count untracked files (excluding noise)
UNTRACKED_COUNT=$(git ls-files --others --exclude-standard 2>/dev/null | grep -vcE '(\.DS_Store|node_modules)' || echo "0")
if [ "$UNTRACKED_COUNT" -gt 0 ] 2>/dev/null; then
    WARNINGS="${WARNINGS}WIP: ${UNTRACKED_COUNT} untracked file(s) not yet staged.\n"
fi

# Flag modified files with stale mtimes (>24h since last modification)
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

    cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "systemReminder": $ESCAPED
  }
}
EOF
    exit 0
fi

# No warnings
exit 0
