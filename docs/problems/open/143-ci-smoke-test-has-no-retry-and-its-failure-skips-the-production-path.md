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

A third cost, surfaced by the architect review and not previously recorded here: ADR-028's `scripts/ci-status-check.sh` blocks `npm run push:watch` and `npm run release:watch` whenever the branch's most recent CI conclusion is `failure`. So a flake does not only skip the release job, it also blocks every local push and release until someone clears the `red-ci-acknowledged` bypass marker. ADR-028's own third reassessment criterion names this pattern ("the wrapper check fires false positives ... revisit branch-scope"). It is answered by fixing the flake at source rather than by narrowing the gate, which would weaken a control that exists to stop shipping onto red master. No ADR change is needed.

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
- [x] Add a bounded retry to the smoke-test curls. Landed: `--retry 3 --retry-connrefused` on all ten call sites across three workflows. `--retry-delay` deliberately omitted so curl's default exponential backoff (1s, 2s, 4s) applies.
- [ ] Decide whether a skipped `release-pr` should be distinguishable from a `release-pr` that legitimately had nothing to do, since both currently render as `skipped`
- [x] Check whether the same no-retry shape exists elsewhere. It did, and wider than this ticket assumed: ten call sites across three workflows, not four in one job. `publish-pipeline.yml` (production deploy verification) and `release-pr-preview.yml` carried the identical shape. All fixed together, because leaving the production instance unfixed would have kept the worst case in place.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P144 (push:watch forces a full risk rescore after every commit), same release path, distinct mechanism.

## Related

Captured via `/wr-itil:capture-problem` during the 2026-08-09 session retrospective.

P092 (push-watch pull-rebase and transient-error robustness, closed) covered transient-error handling on the local push wrapper. This is the CI-side sibling: the same class of transient failure, a different surface, and no retry there.

## Partial resolution

The retry half is fixed. The skip half, which this ticket's Description calls the part worth fixing, is NOT, so this ticket stays open.

Landed: `--retry 3 --retry-connrefused` on all ten smoke-test `curl` calls in `main-pipeline.yml`, `publish-pipeline.yml` and `release-pr-preview.yml`, each step carrying an inline comment naming this ticket and the reasoning.

Verified empirically against a local server before landing, because the architect review flagged a plausible worse-than-the-defect failure mode: if `-w "%{http_code}"` emitted once per attempt, a 503 recovering to 200 would yield `STATUS="503200"` and fail on recovery. It does not. Measured with the exact shipping flag set on curl 8.7.1:

- 503, 503, then 200 gives `STATUS='200'`, three characters, one emission. The failure mode does not occur.
- A genuine 404 gives `404` on the first attempt with no retry, so real breakage is not masked.
- A healthy 200 returns in 0 seconds, so the green path costs nothing.
- Nothing listening gives `000` after 7 seconds of backoff, and the status assertion still fails.

`--retry-all-errors` was deliberately not used: it would retry DNS and TLS failures, which on a Netlify alias indicate a real misconfiguration rather than noise.

Still open: `release-pr` reports `skipped` rather than `failure` when `deploy-test` fails. Retry reduces how often that ambiguity is reached; it does not change the ambiguity. `release-pr-preview.yml` lines 78 to 87 already carry this repo's pattern for it, an `if: always()` step posting an explicit check status, which is the shape to reuse.