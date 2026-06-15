# Problem 092: push:watch pull-rebase collides with amend-chains and false-fails on transient network errors

**Status**: Open
**Reported**: 2026-06-15
**Priority**: deferred, re-rate at next /wr-itil:review-problems
**Origin**: internal
**Effort**: M (deferred, re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

Two distinct robustness defects in `scripts/push-watch.sh` (`npm run push:watch`) surfaced during the Issue 09 publish session:

**B. pull-rebase collides with the amend-to-fix-a-just-pushed-commit workflow.** After pushing `ff6a204` and then amending it to `b837c89` (a sibling amend, not a fast-forward), push:watch ran its auto `pull --rebase`, which tried to replay the local sibling-amend onto origin and produced an interactive-rebase conflict with conflict markers written into the published draft mid-session. Resolved manually via `git rebase --abort` + `git push --force-with-lease`. The amend-to-fix-a-just-pushed-draft flow is common in this newsletter pipeline (gate -> commit -> push -> user feedback -> amend -> re-push).

**C. False "Pipeline failed" on a transient network error.** push:watch reported "Pipeline failed" when polling the GitHub API returned `read: connection reset by peer`, even though the CI run (27516284951) actually completed with conclusion=success. The transient network error was treated as a pipeline failure.

## Symptoms

- B: `error: could not apply b837c89...`, `interactive rebase in progress; onto ff6a204`, conflict markers (`<<<<<<< HEAD`) injected into `src/newsletters/drafts/leader/2026-06-15.md` mid-session.
- C: `failed to get run: Get "https://api.github.com/...": read: connection reset by peer` followed by `Pipeline failed`, while `gh run view 27516284951 --json conclusion` returned `success`.

## Impact Assessment

- **Who is affected**: anyone using `npm run push:watch` (the documented release-path drain), especially in the amend-to-fix workflow common to the newsletter and governance pipelines.
- **Frequency**: B fires whenever a just-pushed commit is amended and re-pushed; C fires on any transient GitHub API network blip during the watch.
- **Severity**: Medium. B can inject conflict markers into a working file mid-session (data-integrity scare, recovered via abort + force-with-lease); C produces false-failure noise that masks a successful release and prompts unnecessary remediation.

## Root Cause Analysis

### Hypothesis

- B: push:watch unconditionally runs `git pull --rebase` (or equivalent) before pushing. When local HEAD is a sibling-amend of origin (same parent, different content), the rebase replays and conflicts. push:watch should detect the sibling-amend / non-fast-forward-but-same-parent case and either skip the rebase, warn, or guide toward `--force-with-lease` rather than silently starting an interactive rebase.
- C: push:watch declares pipeline failure on the first non-zero / errored `gh run view` without distinguishing a transient network/API error from a real CI failure. It should retry transient API/network errors (connection reset, timeout, 5xx) with backoff before declaring failure.

## Fix Strategy

- **Kind**: improve
- **Shape**: script
- **Target file**: `scripts/push-watch.sh`.
- **Edit summary**: (B) detect the sibling-amend / same-parent non-fast-forward case and skip auto-rebase (warn + suggest `--force-with-lease`) rather than starting an interactive rebase that can inject conflict markers; (C) wrap the `gh run view` poll in a transient-error retry (connection reset / timeout / 5xx -> backoff + retry, bounded) and only declare pipeline failure on a genuine CI conclusion=failure.
- **Evidence**: Issue 09 publish session; rebase conflict on b837c89 onto ff6a204; false-fail on run 27516284951 (conclusion=success) after `read: connection reset by peer`.

## Related

- Retro 2026-06-15. Release-path instability category (P074 Step 2b). Sibling to closed P059 (push:watch SIGPIPE exit 141). Distinct from the newsletter drafter cluster (P089-P091).
