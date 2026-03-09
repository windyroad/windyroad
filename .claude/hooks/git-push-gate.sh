#!/bin/bash
# PreToolUse hook for pipeline discipline:
# - Blocks bare `git push` and directs to npm run push:watch.
# - Blocks `gh pr merge` and directs to npm run release:watch.
# - Prompts for confirmation before `npm run release:watch` (release is deliberate).
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

# Block git push to master/main/publish/changeset-release/*, or bare git push.
# Allow explicit pushes to other branches (feature branches etc).
if echo "$COMMAND" | grep -qE '(^|;|&&|\|\|)\s*git push(\s|$)'; then
    # Allow if pushing to an explicit branch that isn't a protected/managed branch
    if echo "$COMMAND" | grep -qE 'git push\s+\S+\s+\S+' && \
       ! echo "$COMMAND" | grep -qE 'git push\s+\S+\s+(master|main|publish|changeset-release/)'; then
        exit 0
    fi
    cat <<'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Use `npm run push:watch` instead of `git push`. It pushes, watches the pipeline, and then surfaces either the release PR URL (if there are pending changesets) or the test deploy URL so you can review before releasing. The publish and changeset-release/* branches are managed by the pipeline — do not push to them directly."
  }
}
EOF
    exit 0
fi

# Confirm before running release:watch. Releasing should be a deliberate human decision.
if echo "$COMMAND" | grep -qE '(^|;|&&|\|\|)\s*npm run release:watch(\s|$)'; then
    cat <<'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "ask",
    "permissionDecisionReason": "About to run `npm run release:watch`, which merges the release PR and publishes to production. This is a release. Confirm you want to proceed."
  }
}
EOF
    exit 0
fi

# Match gh pr merge. Should go via npm run release:watch instead.
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
