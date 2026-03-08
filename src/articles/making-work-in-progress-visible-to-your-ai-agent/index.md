---
date: '2026-03-08'
title: 'Making work-in-progress visible to your AI agent'
author: 'Tom Howard'
tags: ['ci/cd', 'ai coding', 'claude code', 'deployment', 'production', 'software delivery']
---

An AI agent doesn't feel the weight of a growing diff. It doesn't notice that five commits have piled up without a push, or that a release PR has been sitting open for three days. It works on what's in front of it. The accumulation happens silently.

This is a problem because work-in-progress is risk. Uncommitted changes can be lost to a crash or a branch switch. Unpushed commits are invisible to the pipeline. Missing changesets mean the release PR won't describe what's shipping. A stale release PR means tested, reviewed code is sitting in a queue instead of running in production.

I built a [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) hook that surfaces all of this before every prompt. Four checks, one script, no blocking. The AI keeps working but both it and I can see the state of things.

![Four numbered cards showing each check: uncommitted changes threshold at 200 lines, unpushed commits threshold at 3, missing changesets when commits exist without changeset files, and stale release PR when open longer than 24 hours. Below, a flow diagram showing the hook firing on every prompt, running checks, emitting a systemReminder, and the AI plus human seeing the result.](/img/social/wip-nudge-four-checks.svg)

## The four checks

The hook lives in `.claude/hooks/wip-nudge.sh` and fires on `UserPromptSubmit`, the same event used by the [pipeline discipline hooks](/blog/enforcing-pipeline-discipline-with-claude-code-hooks). Every check is independent. If one fails silently (no remote, no `gh` CLI), the others still run.

### 1. Uncommitted changes too large

```bash
DIFF_STAT=$(git diff HEAD --stat 2>/dev/null | tail -1)
```

`git diff HEAD` captures both staged and unstaged changes. The `--stat` summary line looks like `5 files changed, 180 insertions(+), 42 deletions(-)`. The script extracts the insertion and deletion counts and adds them. If the total is 200 or more:

> WIP: ~222 lines of uncommitted changes. Consider committing before continuing.

The threshold of 200 is a judgment call. Below that, you're mid-task. Above it, you have enough work that losing it would hurt.

The check also counts untracked files (excluding `.DS_Store` and `node_modules`) and mentions them separately. A pile of new files that haven't been staged is a different kind of accumulation.

### 2. Unpushed commits piling up

```bash
UNPUSHED=$(git rev-list --count origin/master..HEAD 2>/dev/null || echo "0")
```

If the count is 3 or more:

> WIP: 5 unpushed commits on master. Consider running `npm run push:watch`.

One or two unpushed commits is normal mid-task flow. Three or more means multiple units of work are sitting locally. The pipeline can't see them. The release PR can't include them. If the push eventually fails CI, you're debugging a larger delta than necessary.

The nudge suggests `npm run push:watch` rather than bare `git push` because of the [pipeline discipline hooks](/blog/enforcing-pipeline-discipline-with-claude-code-hooks) already wired into this project. That script pushes, watches the pipeline, and surfaces the deploy URL.

### 3. Commits without changesets

```bash
CHANGESET_COUNT=$(find .changeset -name '*.md' ! -name 'README.md' 2>/dev/null | head -20 | wc -l)
```

If there are unpushed commits and no changeset files:

> WIP: 3 commits on master with no changeset. Run `npx changeset` to describe what's shipping.

This check exists because [changesets](https://github.com/changesets/changesets) are how the pipeline knows what's in a release. Without a changeset file, the release PR won't have a description. The version won't bump. The CHANGELOG won't update. The work ships as a version with no visible record of what changed.

One changeset can cover multiple commits, so the check isn't looking for a 1:1 mapping. It just checks whether *any* changeset file exists. If you have five commits and one changeset describing all of them, that's fine.

This nudge is aimed at the human, not the AI. Writing a changeset is a product decision: what's the change worth calling out, and how should it be described?

### 4. Release PR accumulating unreleased work

```bash
PR_JSON=$(timeout 5 gh pr list --base publish --state open --limit 1 \
  --json number,url,createdAt 2>/dev/null || echo "[]")
```

If an open PR targeting `publish` exists and was created more than 24 hours ago:

> WIP: Release PR #42 has been open for 3 day(s). Review and merge: https://github.com/...

The 24-hour threshold avoids nagging about a PR the pipeline just created. After that, it's a reminder that tested, pipeline-verified code is waiting for a human to look at it and merge.

This is the check I built for myself. The AI doesn't decide when to release. But it can remind me that there's a release sitting in a queue, every time I start a new prompt.

The `gh` CLI call is wrapped in `timeout 5` because it hits the network. If GitHub is slow or unreachable, the check silently skips rather than blocking the prompt.

## Informing without blocking

Every warning line is appended to a single `systemReminder` in the hook's JSON output. The pattern is the same one used by other [pipeline discipline hooks](/blog/enforcing-pipeline-discipline-with-claude-code-hooks):

```bash
cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "systemReminder": $ESCAPED
  }
}
EOF
```

There's no `permissionDecision: "deny"`. The AI keeps working. It sees the warnings injected into the conversation and can decide to act on them: commit before continuing, suggest a push, mention the stale PR. Or it can keep working on the current task if the accumulation isn't relevant yet.

This is a deliberate design choice. The push gate in the [pipeline discipline hooks](/blog/enforcing-pipeline-discipline-with-claude-code-hooks) is a hard block because `git push` without pipeline visibility is the specific action I want to prevent. WIP accumulation is different. It's state you want to be aware of, not an action you want to block.

![Terminal window showing example output from the hook: four warning lines covering uncommitted changes, unpushed commits, missing changeset, and stale release PR. Below, a note that Claude continues working normally with no blocking.](/img/social/wip-nudge-terminal.svg)

## Wiring it up

The hook goes in `.claude/settings.json` alongside the other `UserPromptSubmit` hooks:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/project-health-check.sh"
          }
        ]
      },
      {
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/wip-nudge.sh"
          }
        ]
      }
    ]
  }
}
```

Each `UserPromptSubmit` entry runs independently. The health check and the WIP nudge don't know about each other. They both emit `systemReminder` output if they have something to say, and stay silent if they don't.

## The full script

Here's the complete implementation. Every check uses `2>/dev/null` so that missing remotes, detached HEADs, or absent tools produce silence rather than errors.

```bash
#!/bin/bash
set -euo pipefail

WARNINGS=""

# 1. Uncommitted changes too large
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

# Untracked files (excluding noise)
UNTRACKED_COUNT=$(git ls-files --others --exclude-standard 2>/dev/null \
  | grep -vcE '(\.DS_Store|node_modules)' || echo "0")
if [ "$UNTRACKED_COUNT" -gt 0 ] 2>/dev/null; then
    WARNINGS="${WARNINGS}WIP: ${UNTRACKED_COUNT} untracked file(s) not yet staged.\n"
fi

# 2. Unpushed commits piling up
UNPUSHED=$(git rev-list --count origin/master..HEAD 2>/dev/null || echo "0")
if [ "$UNPUSHED" -ge 3 ]; then
    WARNINGS="${WARNINGS}WIP: ${UNPUSHED} unpushed commits on master. Consider running \`npm run push:watch\`.\n"
fi

# 3. Commits without changesets
if [ "$UNPUSHED" -gt 0 ]; then
    CHANGESET_COUNT=$(find .changeset -name '*.md' ! -name 'README.md' 2>/dev/null \
      | head -20 | wc -l | tr -d ' ')
    if [ "$CHANGESET_COUNT" -eq 0 ]; then
        WARNINGS="${WARNINGS}WIP: ${UNPUSHED} commits on master with no changeset. Run \`npx changeset\` to describe what's shipping.\n"
    fi
fi

# 4. Release PR accumulating unreleased work
if command -v gh &>/dev/null; then
    PR_JSON=$(timeout 5 gh pr list --base publish --state open --limit 1 \
      --json number,url,createdAt 2>/dev/null || echo "[]")
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

# Output
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

exit 0
```

## Adapting this for your project

The specific checks here are tuned for a trunk-based workflow with changesets and a `publish` branch. The pattern works for any accumulation you want to track.

To build your own version, start by picking your checks. What accumulates silently in your workflow? Uncommitted changes, unpushed commits, and missing changesets are common. You might also check for TODO comments in uncommitted code, failing local tests, stale feature branches, or a growing number of skipped tests.

Set thresholds that match your rhythm. The 200-line and 3-commit thresholds here reflect a workflow where commits are small and pushes are frequent. If your commits are larger or your pushes are batched, adjust accordingly.

Use `systemReminder`, not `permissionDecision`. Nudges work because they inform without blocking. The AI can weigh the warning against what it's doing and decide whether to act. A gate that blocks every edit until you commit would be counterproductive during a multi-file change.

Make every check independent. Each check should succeed or fail silently on its own. Use `2>/dev/null` and `|| echo "0"` so that a missing remote or absent CLI tool doesn't break the other checks.

Keep it fast. This runs on every prompt. The git commands are local and near-instant. The `gh` CLI call hits the network, so it gets a `timeout 5`. If your checks include anything slow, wrap it the same way.

Wire it into `UserPromptSubmit` by adding an entry to the `hooks` object in your `.claude/settings.json`. The hook receives the prompt as JSON on stdin (which this script ignores) and emits the `systemReminder` JSON on stdout.

The [Claude Code hooks documentation](https://docs.anthropic.com/en/docs/claude-code/hooks) covers the full event model: `UserPromptSubmit` for pre-prompt checks, `PreToolUse` for intercepting tool calls, and `PostToolUse` for post-action verification.

The full hook configuration for this site is in the public repo at [github.com/windyroad/windyroad](https://github.com/windyroad/windyroad).
