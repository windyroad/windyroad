# Problem 092: push:watch pull-rebase collides with amend-chains and false-fails on transient network errors

**Status**: Known Error
**Reported**: 2026-06-15
**Priority**: 9 (Medium). Impact: Moderate (3) x Likelihood: Possible (3) (re-rated 2026-06-15)
**Origin**: internal
**Effort**: M
**WSJF**: 9.0 = (9 x 2.0) / 2 (Known Error multiplier applied 2026-06-16 on root-cause confirmation)
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

### Confirmed (2026-06-16)

Both hypotheses confirmed and the fix implemented in `scripts/push-watch.sh`:

- **B confirmed**: the unconditional `git pull --rebase` at the pull/push step is the conflict-injecting call. Fix adds `is_sibling_amend()` (local HEAD and the upstream tip diverge but share a parent) which gates the rebase: on a sibling-amend it skips the rebase, warns, and suggests `git push --force-with-lease`. Behavioural test asserts SIBLING for the amend-of-a-just-pushed-commit case and NOT for fast-forward-ahead and in-sync states.
- **C confirmed, with a wider transient class than first reported**: fresh evidence on 2026-06-16 (push of commit 5b6948a) showed `npm run push:watch` print "Pipeline failed" after `failed to get run: HTTP 401: Bad credentials` while polling workflow run 27609565746 (Secrets scan), although the push had landed (origin advanced, unpushed=0) and the run was status=in_progress at that moment and later concluded conclusion=success. So a transient HTTP 401 "Bad credentials" blip in the gh-poll path produced a false failure verdict, not just the connection-reset class from the original report (run 27516284951). Fix adds `is_transient_gh_error()` (connection reset/refused, timeout, 5xx/429, "could not resolve host", and the HTTP 401 / "Bad credentials" blip) and `watch_run_resilient()`, which on a non-zero `gh run watch` re-checks the real run state via `gh run view --json status,conclusion` with bounded exponential-backoff retry and declares failure ONLY on a genuinely completed conclusion that is not success. Behavioural test asserts the 401, connection-reset, timeout, and 502 cases classify transient and a generic "result: failure" message does not.

## Workaround

- B: if a sibling-amend rebase has already started and injected conflict markers, run `git rebase --abort` then `git push --force-with-lease` (the recovery used in the Issue 09 session).
- C: when push:watch reports "Pipeline failed", cross-check the real conclusion with `gh run view <run_id> --json status,conclusion` before remediating; a `success` conclusion means the verdict was a transient-error false-fail.

## Fix Strategy

- **Kind**: improve
- **Shape**: script
- **Target file**: `scripts/push-watch.sh`.
- **Edit summary**: (B) detect the sibling-amend / same-parent non-fast-forward case and skip auto-rebase (warn + suggest `--force-with-lease`) rather than starting an interactive rebase that can inject conflict markers; (C) wrap the `gh run view` poll in a transient-error retry (connection reset / timeout / 5xx -> backoff + retry, bounded) and only declare pipeline failure on a genuine CI conclusion=failure.
- **Evidence**: Issue 09 publish session; rebase conflict on b837c89 onto ff6a204; false-fail on run 27516284951 (conclusion=success) after `read: connection reset by peer`; and the 2026-06-16 false-fail on run 27609565746 (conclusion=success) after `HTTP 401: Bad credentials`.
- **Implemented**: `scripts/push-watch.sh` adds `is_sibling_amend()` (B), `is_transient_gh_error()` + `watch_run_resilient()` (C), and a `PUSH_WATCH_LIB_ONLY` test seam; the two `gh run watch` failure gates now route through `watch_run_resilient`. Behavioural test at `scripts/push-watch.test.mjs` (8 cases, vitest per repo TDD discipline). The HTTP 401 "Bad credentials" transient class was added to the retry set per the 2026-06-16 fresh evidence. Committed but NOT yet released: the orchestrator owns push/release cadence, so this ticket is Known Error (fix ready, awaiting release) until push:watch next ships, at which point it moves to Verification Pending per ADR-022.

## Related

- Retro 2026-06-15. Release-path instability category (P074 Step 2b). Sibling to closed P059 (push:watch SIGPIPE exit 141). Distinct from the newsletter drafter cluster (P089-P091).
