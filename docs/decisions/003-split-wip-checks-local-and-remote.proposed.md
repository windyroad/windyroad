---
status: "proposed"
first-released: 2026-03-09
date: 2026-03-09
decision-makers: [Tom Howard, Claude]
consulted: []
informed: []
---

# Split WIP checks into local (every prompt) and remote (on push)

## Context and Problem Statement

The WIP accumulation nudge monitors four queues where code stalls on its way to production. Two checks use only local git commands (uncommitted changes, unpushed commits). Two checks require GitHub API calls via the `gh` CLI (missing changesets, stale release PR). Running all four on every prompt would add noticeable latency from network calls.

## Decision Drivers

- Prompt responsiveness (hooks run on every `UserPromptSubmit`)
- Accuracy (remote state only changes when you push)
- Simplicity (no caching, no state files)
- Fail-loud for network errors

## Considered Options

1. **Split: local on every prompt, remote on push** - Two execution contexts
2. **All checks on every prompt with caching** - Cache remote results locally
3. **All checks on every prompt without caching** - Accept latency
4. **All checks on push only** - No prompt-time feedback

## Decision Outcome

Chosen option: **Split local and remote checks**, because the remote state only changes when you push, making prompt-time remote checks both slow and redundant.

Local checks (1-2) run in `.claude/hooks/wip-nudge.sh` on `UserPromptSubmit`. They use `git diff`, `git rev-list`, and `git ls-files`, completing in milliseconds.

Remote checks (3-4) run in `scripts/push-watch.sh` after the push completes and remote refs are updated. They use `gh pr list` and `gh pr diff` with `timeout 10`, and fail with `exit 1` on errors rather than silently skipping.

## Consequences

- **Good**: No network latency on every prompt
- **Good**: No cache staleness risk (remote checks run at the moment state changes)
- **Good**: No state files or cache invalidation logic
- **Good**: Network failures surface immediately (fail-loud on push)
- **Neutral**: Remote warnings only appear after a push, not between pushes
- **Bad**: Two execution contexts to maintain (hook script + push script)

## Confirmation

- `wip-nudge.sh` completes in under 200ms
- `push-watch.sh` shows remote warnings after push completes
- `gh` CLI failures produce error messages and exit 1
- No `.wip-cache` or similar state files exist

## Pros and Cons of the Options

### Split local and remote

- Good: Fast prompt response
- Good: No caching complexity
- Good: Remote checks run at exactly the right moment
- Bad: Two files to maintain

### All checks with caching

- Good: All warnings visible on every prompt
- Bad: Cache can go stale (e.g., create changeset locally but cache says "no changeset")
- Bad: Cache invalidation logic adds complexity
- Bad: Cache file is another piece of state to manage

### All checks without caching

- Good: Simple single script
- Bad: 1-4 seconds of latency on every prompt from `gh` CLI calls
- Bad: Network errors could block or delay every prompt

### All checks on push only

- Good: Simple, no prompt-time hook needed
- Bad: No feedback about local accumulation between pushes
- Bad: Uncommitted changes and unpushed commits go unnoticed

## Reassessment Criteria

- If `gh` CLI adds a local cache mode that eliminates network calls
- If Claude Code adds a native WIP monitoring feature
- If the number of checks grows beyond 4 and maintenance of two files becomes burdensome
