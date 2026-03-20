---
status: "proposed"
first-released: 2026-03-20
date: 2026-03-20
decision-makers: [Tom Howard, Claude]
consulted: []
informed: []
---

# Post-release drop-in hook pattern

## Context and Problem Statement

The release process (`scripts/release-watch.sh`) handles deploys and version sync but has no extensibility point for post-release automation. Adding new post-release behaviors requires editing the release script itself, which couples unrelated concerns and makes the script harder to maintain.

## Decision Drivers

- Release script should remain focused on its core job (merge, watch, sync)
- Post-release automation should be addable without modifying the release script
- Hook failures must not fail the release (deploy is already live)
- Convention should be simple enough for shell scripts with no framework

## Considered Options

1. **Drop-in directory pattern (`scripts/post-release.d/`)**: executable scripts run in order after deploy
2. **Inline additions to release-watch.sh**: add each new behavior directly to the script
3. **Event-based system (npm lifecycle scripts or custom event bus)**: emit events, subscribe handlers

## Decision Outcome

Chosen option: **Drop-in directory pattern**, because it decouples post-release behaviors from the release script while staying simple and portable.

The convention:
- Scripts live in `scripts/post-release.d/`
- Each script must be executable (`chmod +x`)
- The release runner passes `RELEASE_DATE` as an environment variable
- The list of files changed in the release is passed on stdin
- Scripts run after successful deploy, between the version sync commit and `git push`
- If any hook produces file changes, they are committed as `chore: post-release updates for v$VERSION [skip ci]`
- Hook failures emit a warning but do not fail the release

## Consequences

- **Good**: New post-release behaviors can be added by dropping a script into the directory
- **Good**: Each script is independently testable
- **Good**: Release script stays focused and stable
- **Neutral**: Scripts must handle their own error cases gracefully
- **Bad**: Script ordering depends on filename sort order (lexicographic)

## Confirmation

- `scripts/release-watch.sh` contains a loop over `scripts/post-release.d/*`
- Adding a new executable script to `scripts/post-release.d/` causes it to run on next release
- A failing hook script does not cause `release-watch.sh` to exit non-zero
- File changes from hooks are committed separately from the version sync commit

## Pros and Cons of the Options

### Drop-in directory pattern

- Good: Zero coupling between hooks and the release script
- Good: Standard Unix convention (cron.d, init.d, etc.)
- Good: Each hook is a standalone script, easy to test
- Neutral: Ordering is by filename sort
- Bad: No dependency resolution between hooks

### Inline additions to release-watch.sh

- Good: Everything in one place
- Bad: Every new behavior requires editing a critical script
- Bad: Harder to test individual behaviors in isolation
- Bad: Script grows unboundedly

### Event-based system

- Good: Flexible subscription model
- Bad: Overengineered for a handful of shell scripts
- Bad: Requires a framework or custom event bus
- Bad: Harder to debug

## Reassessment Criteria

- If the number of post-release hooks exceeds 10 and ordering/dependencies become complex
- If hooks need to communicate results to each other (dependency graph needed)
- If the project moves to a CI-based release process where hooks run in pipeline steps
