#!/bin/bash
# PreToolUse hook for pipeline discipline:
# - Blocks bare `git push` and directs to npm run push:watch.
# - Gates `npm run push:watch` on push risk score < 5.
# - Gates `npm run release:watch` on release risk score < 5 (collects release context first).
# - Blocks `gh pr merge` and directs to npm run release:watch.
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

SESSION_ID=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('session_id', ''))
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
    "permissionDecisionReason": "Use `npm run push:watch` instead of `git push`. It pushes, watches the pipeline, and then surfaces either the release PR URL (if there are pending changesets) or the test deploy URL so you can review before releasing. The publish and changeset-release/* branches are managed by the pipeline -- do not push to them directly."
  }
}
EOF
    exit 0
fi

# Gate push:watch on push risk score
if echo "$COMMAND" | grep -qE '(^|;|&&|\|\|)\s*npm run push:watch(\s|$)'; then
    if [ -n "$SESSION_ID" ]; then
        PUSH_SCORE_FILE="/tmp/risk-push-${SESSION_ID}"
        if [ -f "$PUSH_SCORE_FILE" ]; then
            PUSH_SCORE=$(cat "$PUSH_SCORE_FILE" 2>/dev/null || echo "")
            if echo "$PUSH_SCORE" | grep -qE '^[0-9]+(\.[0-9]+)?$'; then
                DENIED=$(python3 -c "
score = float('$PUSH_SCORE')
print('yes' if score >= 5 else 'no')
" 2>/dev/null || echo "no")
                if [ "$DENIED" = "yes" ]; then
                    cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Push risk score ${PUSH_SCORE}/25. The accumulated unpushed changes are too risky to push as a batch. Consider: split into smaller pushes, add tests for risky changes, revert exploratory commits, or release existing unreleased changes first. Then re-run the risk-scorer agent."
  }
}
EOF
                    exit 0
                fi
            fi
        fi
    fi
    # No score file or score < 5: allow push:watch
    exit 0
fi

# Gate release:watch on release risk score + confirmation
if echo "$COMMAND" | grep -qE '(^|;|&&|\|\|)\s*npm run release:watch(\s|$)'; then
    if [ -n "$SESSION_ID" ]; then
        RELEASE_SCORE_FILE="/tmp/risk-release-${SESSION_ID}"
        if [ -f "$RELEASE_SCORE_FILE" ]; then
            RELEASE_SCORE=$(cat "$RELEASE_SCORE_FILE" 2>/dev/null || echo "")
            if echo "$RELEASE_SCORE" | grep -qE '^[0-9]+(\.[0-9]+)?$'; then
                DENIED=$(python3 -c "
score = float('$RELEASE_SCORE')
print('yes' if score >= 5 else 'no')
" 2>/dev/null || echo "no")
                if [ "$DENIED" = "yes" ]; then
                    cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Release risk score ${RELEASE_SCORE}/25. The accumulated unreleased changes are too risky to release. Consider: add smoke tests, verify preview deploy, split the release, or fix outstanding issues first. Then re-run the risk-scorer agent with ACTION=release."
  }
}
EOF
                    exit 0
                fi
            fi
        fi
    fi
    # No release score or score < 5: ask for confirmation (release is deliberate)
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
    "permissionDecisionReason": "Use `npm run release:watch` instead of `gh pr merge`. It merges the release PR, watches the publish pipeline, and surfaces the production URL when live -- or tells you what failed and how to fix it."
  }
}
EOF
    exit 0
fi

exit 0
