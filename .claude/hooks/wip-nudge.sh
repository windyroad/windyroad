#!/bin/bash
# UserPromptSubmit hook: Nudges about accumulating WIP.
# Four checks: uncommitted size, unpushed commits, missing changesets, stale release PR.
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

# --- 2. Unpushed commits piling up ---
UNPUSHED=$(git rev-list --count origin/master..HEAD 2>/dev/null || echo "0")
if [ "$UNPUSHED" -ge 3 ]; then
    WARNINGS="${WARNINGS}WIP: ${UNPUSHED} unpushed commits on master. Consider running \`npm run push:watch\`.\n"
fi

# --- 3. Commits without changesets ---
if [ "$UNPUSHED" -gt 0 ]; then
    CHANGESET_COUNT=$(find .changeset -name '*.md' ! -name 'README.md' 2>/dev/null | head -20 | wc -l | tr -d ' ')
    if [ "$CHANGESET_COUNT" -eq 0 ]; then
        WARNINGS="${WARNINGS}WIP: ${UNPUSHED} commits on master with no changeset. Run \`npx changeset\` to describe what's shipping.\n"
    fi
fi

# --- 4. Release PR accumulating unreleased work ---
if command -v gh &>/dev/null; then
    PR_JSON=$(timeout 5 gh pr list --base publish --state open --limit 1 --json number,url,createdAt 2>/dev/null || echo "[]")
    if [ "$PR_JSON" != "[]" ] && [ -n "$PR_JSON" ]; then
        CREATED_AT=$(echo "$PR_JSON" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data:
        print(data[0].get('createdAt', ''))
except:
    print('')
" 2>/dev/null || echo "")

        if [ -n "$CREATED_AT" ]; then
            AGE_HOURS=$(python3 -c "
from datetime import datetime, timezone
try:
    created = datetime.fromisoformat('$CREATED_AT'.replace('Z', '+00:00'))
    now = datetime.now(timezone.utc)
    hours = (now - created).total_seconds() / 3600
    print(int(hours))
except:
    print(0)
" 2>/dev/null || echo "0")

            if [ "$AGE_HOURS" -ge 24 ]; then
                PR_NUMBER=$(echo "$PR_JSON" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data[0].get('number', ''))
except:
    print('')
" 2>/dev/null || echo "")
                PR_URL=$(echo "$PR_JSON" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data[0].get('url', ''))
except:
    print('')
" 2>/dev/null || echo "")
                AGE_DAYS=$((AGE_HOURS / 24))
                WARNINGS="${WARNINGS}WIP: Release PR #${PR_NUMBER} has been open for ${AGE_DAYS} day(s). Review and merge: ${PR_URL}\n"
            fi
        fi
    fi
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
