---
date: '2026-03-08'
title: 'Making work-in-progress visible to your AI agent'
author: 'Tom Howard'
tags: ['ci/cd', 'ai coding', 'claude code', 'deployment', 'production', 'software delivery']
---

An AI agent has no visibility into accumulating work-in-progress. It works on the current prompt. Meanwhile, uncommitted changes grow, commits pile up without a push, changesets go unwritten, and a release PR sits open for days. The accumulation happens silently.

This matters because <span data-pull>work-in-progress is risk.</span> In Lean terms, it is internal inventory: work that has been started but has not yet delivered value to a customer. Uncommitted changes can be lost to a crash or a branch switch. Unpushed commits are invisible to the pipeline. Missing changesets mean no release PR will be created. A stale release PR means tested, reviewed code is sitting in a queue instead of running in production.

I built a [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) hook that surfaces all of this. Four checks monitor four queues where code accumulates on its way to production. Local checks run every prompt. Remote checks run on push. No blocking. The AI keeps working but both it and I can see the state of things.

## Four queues

Code flows through four queues between your editor and production. Each queue is a place where work can stall. Each check monitors one queue.

![Flow diagram showing four queues that code passes through on its way to production: uncommitted changes in the working tree, unpushed commits ahead of origin, pushed commits with no release preview because no changeset file exists, and unreleased code sitting in an open release PR. A dashed vertical line separates the two local queues from the two remote queues. Below each queue, a label shows what monitors it.](/img/social/wip-queues-flow.svg)

The first two queues are local. Checking them requires only git commands against the local repo, which complete in milliseconds. The last two queues are remote. Checking them requires `gh` CLI calls that hit the GitHub API, taking 500ms to 2 seconds each. Running those on every prompt would add noticeable latency, so they run once on push. The remote state only changes when you push, so there's no need to re-check between pushes.

## Local checks (every prompt)

The hook lives in `.claude/hooks/wip-nudge.sh` and fires on `UserPromptSubmit`, the same event used by the [pipeline discipline hooks](/blog/enforcing-pipeline-discipline-with-claude-code-hooks). Every check is independent. If one fails silently (no remote, no `gh` CLI), the others still run.

### 1. Uncommitted changes too large

```bash
DIFF_STAT=$(git diff HEAD --stat 2>/dev/null | tail -1)
```

`git diff HEAD` captures both staged and unstaged changes. The `--stat` summary line looks like `5 files changed, 180 insertions(+), 42 deletions(-)`. The script extracts the insertion and deletion counts and adds them. If the total is 200 or more:

> WIP: ~222 lines of uncommitted changes. Consider committing before continuing.

The threshold of 200 is a judgment call. Below that, you're mid-task. Above it, you have enough work that losing it would hurt.

The check also counts untracked files (excluding `.DS_Store` and `node_modules`) and mentions them separately. A pile of new files that haven't been staged is a different kind of accumulation.

There's a related check for stale modifications. If a tracked file has been modified but not committed for more than 24 hours, the hook flags it:

> WIP: 2 modified file(s) uncommitted for over 24h. Forgotten or should be reverted?

A day-old uncommitted change is either forgotten work or something that should be reverted. Either way, it shouldn't sit there silently.

### 2. Unpushed commits piling up

```bash
UNPUSHED=$(git rev-list --count origin/master..HEAD 2>/dev/null || echo "0")
```

If the count is 3 or more:

> WIP: 5 unpushed commits on master. Consider running `npm run push:watch`.

One or two unpushed commits is normal mid-task flow. Three or more means multiple units of work are sitting locally. The pipeline can't run against them. The release PR can't include them. If the push eventually fails CI, you're debugging a larger delta than necessary.

The nudge suggests `npm run push:watch` rather than bare `git push` because of the pipeline discipline hooks already wired into this project. That script pushes, watches the pipeline, and surfaces the deploy URL.

## Remote checks (on push)

Checks 3 and 4 run inside `scripts/push-watch.sh` after the push completes and the remote refs are updated. The warnings print to stdout alongside the pipeline status and deploy URLs. Since the remote state only changes when you push, running the checks at push time is both the right moment and the only moment they need to run.

### 3. No release preview

```bash
UNRELEASED=$(git rev-list --count origin/publish..origin/master 2>/dev/null || echo "0")
CHANGESET_COUNT=$(find .changeset -name '*.md' ! -name 'README.md' 2>/dev/null | head -20 | wc -l)
OLDEST_UNRELEASED=$(git log --format='%aI' --reverse origin/publish..origin/master 2>/dev/null | head -1)
```

If there are pushed commits ahead of `publish`, no changeset files, and the oldest of those commits is more than 24 hours old or there are 3 or more:

> WIP: 8 unreleased commits with no changeset (oldest: 3 day(s) ago). Run `npx changeset` to describe what's shipping.

Without a changeset file, the [changesets](https://github.com/changesets/changesets) action won't create a release PR. Changes accumulate on trunk with no release preview, no version bump, no CHANGELOG entry. This is internal inventory: work that has been done but is not flowing toward a release.

The check fires on either condition: the oldest pushed commit is over 24 hours old, or there are 3 or more pushed commits without a changeset. A single recent commit is normal mid-task flow. Three commits in one day without a changeset is accumulation worth flagging, even if everything is fresh.

The check compares `origin/publish..origin/master` rather than `origin/publish..HEAD`, limiting it to pushed commits and avoiding overlap with check 2. One changeset can cover multiple commits, so the check looks for the *existence* of any changeset file, not a 1:1 mapping. Writing a changeset is a product decision: what's the change worth calling out, and how should it be described?

### 4. Unreleased code

```bash
PR_JSON=$(timeout 10 gh pr list --base publish --state open --limit 1 \
  --json number,url,createdAt 2>/dev/null || echo "[]")
```

If an open PR targeting `publish` exists and was created more than 24 hours ago, the nudge reminds you that tested, pipeline-verified code is waiting. The output includes a `CLAUDE:` directive telling the AI to surface the release information and ask the user about it. The AI doesn't decide when to release, but it makes sure the human knows there's a release waiting:

> WIP: Release PR #42 has been open for 3 day(s) with 5 changeset(s), ~1200 lines changed. https://github.com/...
> CLAUDE: Tell the user about this release PR and ask if they want to review and merge it now.

The check reports both changeset count and total diff size. A release with one changeset feels different from one with five, but a single changeset touching 2,000 lines is also worth knowing about. Both dimensions help decide whether to review now or keep working.

The `gh` CLI calls are wrapped in `timeout 10` because they hit the network. If GitHub is slow or unreachable, the script fails with an error rather than silently skipping the check. A silent skip would mean you get no feedback about the release PR, with no indication that the check didn't run. Failing loudly means you know immediately if something is wrong with your GitHub token or network connectivity.

![Four numbered cards showing each check: uncommitted changes threshold at 200 lines, unpushed commits threshold at 3, unreleased commits without changeset files compared against the publish branch, and stale release PR when open longer than 24 hours. Below, a flow diagram showing the hook firing on every prompt, running checks, emitting a systemReminder, and the AI plus human seeing the result.](/img/social/wip-nudge-four-checks.svg)

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

There's no `permissionDecision: "deny"`. The AI keeps working. It sees the warnings injected into the conversation and factors them into its next response: commit before continuing, suggest a push, mention the stale PR. Or it keeps working on the current task if the accumulation isn't relevant yet. If multiple checks fire at once, all the warnings stack into the same `systemReminder`.

One thing to know: `systemReminder` output is injected into the AI's context, not displayed in the terminal. You see the nudges only when the AI mentions them in its response. This is fine for guiding the AI's behavior, but it means you're relying on the AI to surface the warnings to you. If you want to see the state directly, print the warnings to stderr before the JSON output:

```bash
echo "$WARNINGS" >&2
```

The push gate in the [pipeline discipline hooks](/blog/enforcing-pipeline-discipline-with-claude-code-hooks) is a hard block because `git push` without pipeline visibility is the specific action I want to prevent. WIP accumulation is different. <span data-pull>It's state you want to be aware of, not an action you want to block.</span> A gate that blocks every edit until you commit would be counterproductive during a multi-file change.

![Terminal window showing example output from the hook: four warning lines covering uncommitted changes, unpushed commits, missing changeset, and stale release PR. Below, a note that Claude continues working normally with no blocking.](/img/social/wip-nudge-terminal.svg)

## Wiring it up

The prompt-time hook goes in `.claude/settings.json` alongside the other `UserPromptSubmit` hooks:

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

The remote checks run inside `push:watch`, the same script that pushes and watches the pipeline. After the push completes and the remote refs are updated, the script runs checks 3-4 and prints any warnings to stdout. Since the AI is already watching the push output, the warnings are visible in the conversation without any caching mechanism.

## The full hook

The complete local hook (`.claude/hooks/wip-nudge.sh`) and the remote checks in `scripts/push-watch.sh` are in the public repo at [github.com/windyroad/windyroad](https://github.com/windyroad/windyroad). The key snippets are all shown above. The full scripts add error handling, JSON escaping for the `systemReminder` output, and the stale-file detection using `python3` to compare file modification times against a 24-hour threshold.

## Adapting this for your project

The specific checks here are tuned for a trunk-based workflow with changesets and a `publish` branch. The pattern works for any accumulation you want to track.

To build your own version, start by mapping your queues. Where does code accumulate on its way to production? Uncommitted changes, unpushed commits, and missing changesets are common. You might also check for TODO comments in uncommitted code, failing local tests, stale feature branches, or a growing number of skipped tests.

Split checks by cost. Anything that uses only local git commands belongs in the prompt-time hook. Anything that hits the network (GitHub API, CI status, deployment state) belongs in the script you use instead of bare `git push`. In this project, that's `push:watch`, which already pushes, watches the pipeline, and surfaces deploy URLs. Adding the remote WIP checks there means they run at the moment the remote state changes, without adding a separate mechanism.

Set thresholds that match your rhythm. The 200-line and 3-commit thresholds here reflect a workflow where commits are small and pushes are frequent. If your commits are larger or your pushes are batched, adjust accordingly.

Use `systemReminder`, not `permissionDecision`. The warning is in the AI's context when it generates its next response. The AI factors it into what it does next without being blocked.

Make every check independent. Each check should succeed or fail silently on its own. Use `2>/dev/null` and `|| echo "0"` so that a missing remote or absent CLI tool doesn't break the other checks.

Keep the prompt-time hook fast. It runs on every prompt. The git commands are local and near-instant. Network calls belong in the push script, not the prompt hook.

Wire it into `UserPromptSubmit` by adding an entry to the `hooks` object in your `.claude/settings.json`. The hook receives the prompt as JSON on stdin (which this script ignores) and emits the `systemReminder` JSON on stdout.

The [Claude Code hooks documentation](https://docs.anthropic.com/en/docs/claude-code/hooks) covers the full event model: `UserPromptSubmit` for pre-prompt checks, `PreToolUse` for intercepting tool calls, and `PostToolUse` for post-action verification.

The full hook configuration for this site is in the public repo at [github.com/windyroad/windyroad](https://github.com/windyroad/windyroad).
