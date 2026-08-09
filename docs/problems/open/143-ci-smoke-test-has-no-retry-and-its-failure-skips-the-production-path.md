# Problem 143: CI smoke test has no retry, and its failure skips the production path rather than failing it

**Status**: Open
**Reported**: 2026-08-09
**Priority**: 9 (Medium). Impact: 3 x Likelihood: 3, derived at capture from the description per Step 4a
**Origin**: internal
**Effort**: S, derived at capture per Step 4a

## Description

The smoke test in `main-pipeline.yml` issues bare `curl` calls against the Netlify alias with no retry. A single transient network failure reddens master, and because the release job declares `needs: [deploy-test]` it does not fail, it **skips**. The only path to production therefore goes quiet on a network blip rather than reporting a problem.

Observed 2026-08-09 on run 31301049275 (head `16d988c`, a documentation-only commit). The step failed with `curl: (28) Failed to connect to main-test--windyroad.netlify.app port 443 after 15002 ms: Timeout was reached`. That is a TCP connect timeout, not a bad HTTP response, so no assertion in the test was actually evaluated. `Secrets scan`, `Lint, check deps & build` and `Accessibility gate` all passed; `Create release PR` was skipped.

Both the alias and production answered 200 in under a second when checked minutes later, and `gh run rerun --failed` came back green across all five jobs. One failure in the twelve most recent runs on master.

The skip is the part worth fixing, not the flake. A step that fails is visible; a step that skips looks like a step that had nothing to do. This is the same silent-skip shape recorded against the `changesets/action` output contract in `4b149a7`, where a dropped output would have skipped two dependent steps on a green job.

## Symptoms

- A transient `curl: (28)` connect timeout in the Smoke test step fails the `Deploy draft + smoke test` job.
- `Create release PR` reports `skipped` rather than `failure`, so the production path produces no error signal.
- Re-running the failed job with no code change goes green.

## Workaround

Read a `(28)` on that step as transient. Verify the alias and production respond, then `gh run rerun <run-id> --failed` before investigating. Applied 2026-08-09.

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: one failure in the twelve most recent master runs; the underlying exposure is every push
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Investigate root cause
- [ ] Create reproduction test
- [ ] Add a bounded retry to the smoke-test curls (`--retry` with `--retry-connrefused`, or a short loop), and decide the retry count and backoff
- [ ] Decide whether a skipped `release-pr` should be distinguishable from a `release-pr` that legitimately had nothing to do, since both currently render as `skipped`
- [ ] Check whether the same no-retry shape exists in the other `curl` assertions in the job (blog index, vibe-code-audit, blog post)

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P144 (push:watch forces a full risk rescore after every commit), same release path, distinct mechanism.

## Related

Captured via `/wr-itil:capture-problem` during the 2026-08-09 session retrospective.

P092 (push-watch pull-rebase and transient-error robustness, closed) covered transient-error handling on the local push wrapper. This is the CI-side sibling: the same class of transient failure, a different surface, and no retry there.
