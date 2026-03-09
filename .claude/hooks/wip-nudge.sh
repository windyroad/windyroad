#!/bin/bash
# UserPromptSubmit hook: Nudges about accumulating WIP.
# Checks 1-2 (local) run every prompt via UserPromptSubmit.
# Checks 3-4 (remote) run in push:watch after push completes.
# These are nudges, not gates (no permissionDecision).
# Uses systemMessage (visible in terminal) + additionalContext (injected into AI).

set -euo pipefail

WARNINGS=""

# --- 1. Uncommitted changes too large ---
# Tracked changes (staged + unstaged)
DIFF_STAT=$(git diff HEAD --stat 2>/dev/null | tail -1 || echo "")
INSERTIONS=$(echo "$DIFF_STAT" | grep -oE '[0-9]+ insertion' | grep -oE '[0-9]+' || echo "0")
DELETIONS=$(echo "$DIFF_STAT" | grep -oE '[0-9]+ deletion' | grep -oE '[0-9]+' || echo "0")
INSERTIONS=${INSERTIONS:-0}
DELETIONS=${DELETIONS:-0}
TRACKED_LINES=$((INSERTIONS + DELETIONS))

# Untracked file lines (excluding noise)
UNTRACKED_FILES=$(git ls-files --others --exclude-standard 2>/dev/null | grep -vE '(\.DS_Store|node_modules)' || true)
UNTRACKED_COUNT=0
UNTRACKED_LINES=0
if [ -n "$UNTRACKED_FILES" ]; then
    UNTRACKED_COUNT=$(echo "$UNTRACKED_FILES" | wc -l | tr -d ' ')
    UNTRACKED_LINES=$(echo "$UNTRACKED_FILES" | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")
    # xargs wc -l prints "total" line only when >1 file; for 1 file it's just the count
    if [ "$UNTRACKED_COUNT" -eq 1 ]; then
        UNTRACKED_LINES=$(wc -l < "$(echo "$UNTRACKED_FILES" | head -1)" 2>/dev/null || echo "0")
    fi
fi

TOTAL=$((TRACKED_LINES + UNTRACKED_LINES))
if [ "$TOTAL" -ge 200 ]; then
    WARNINGS="${WARNINGS}WIP: ~${TOTAL} lines of uncommitted changes (${TRACKED_LINES} tracked, ${UNTRACKED_LINES} untracked). Consider committing before continuing.\n"
fi

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
