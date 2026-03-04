#!/bin/bash
# PreToolUse hook: Blocks bare `git push` and directs to npm run push:watch.
# push:watch pushes, watches the pipeline, and surfaces the release PR URL
# or test deploy URL depending on whether there are pending changesets.

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

# Match bare git push
if echo "$COMMAND" | grep -qE '(^|;|&&|\|\|)\s*git push(\s|$)'; then
    cat <<'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Use `npm run push:watch` instead of `git push`. It pushes, watches the pipeline, and then surfaces either the release PR URL (if there are pending changesets) or the test deploy URL so you can review before releasing."
  }
}
EOF
    exit 0
fi

# Match gh pr merge — should go via npm run release:watch instead
if echo "$COMMAND" | grep -qE '(^|;|&&|\|\|)\s*gh pr merge(\s|$)'; then
    cat <<'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Use `npm run release:watch` instead of `gh pr merge`. It merges the release PR, watches the publish pipeline, and surfaces the production URL when live — or tells you what failed and how to fix it."
  }
}
EOF
    exit 0
fi

exit 0
