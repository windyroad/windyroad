# Problem 143: CI smoke test has no retry, and its failure skips the production path rather than failing it

**Status**: Open
**Reported**: 2026-08-09
**Priority**: 9 (Medium). Impact: 3 x Likelihood: 3, derived at capture from the description per Step 4a
**Origin**: internal
**Effort**: S, derived at capture per Step 4a
**WSJF**: 9.0 = (9 x 1.0) / 1

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
- [x] Decide whether a skipped `release-pr` should be distinguishable from a `release-pr` that legitimately had nothing to do. Yes, and both halves were needed: `if: ${{ !cancelled() }}` plus a first-step guard makes an upstream failure a loud red instead of a skip, and a report step makes the no-PR case explicit instead of a silent green. Three legible outcomes now.
- [x] Check whether the same no-retry shape exists elsewhere. It did, and wider than this ticket assumed: ten call sites across three workflows, not four in one job. `publish-pipeline.yml` (production deploy verification) and `release-pr-preview.yml` carried the identical shape. All fixed together, because leaving the production instance unfixed would have kept the worst case in place.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P144 (push:watch forces a full risk rescore after every commit), same release path, distinct mechanism.

## Related

Captured via `/wr-itil:capture-problem` during the 2026-08-09 session retrospective.

P092 (push-watch pull-rebase and transient-error robustness, closed) covered transient-error handling on the local push wrapper. This is the CI-side sibling: the same class of transient failure, a different surface, and no retry there.

## Resolution

Both halves are fixed, in two commits. The retry half landed first, the skip half second.

Landed: `--retry 3 --retry-connrefused` on all ten smoke-test `curl` calls in `main-pipeline.yml`, `publish-pipeline.yml` and `release-pr-preview.yml`, each step carrying an inline comment naming this ticket and the reasoning.

Verified empirically against a local server before landing, because the architect review flagged a plausible worse-than-the-defect failure mode: if `-w "%{http_code}"` emitted once per attempt, a 503 recovering to 200 would yield `STATUS="503200"` and fail on recovery. It does not. Measured with the exact shipping flag set on curl 8.7.1:

- 503, 503, then 200 gives `STATUS='200'`, three characters, one emission. The failure mode does not occur.
- A genuine 404 gives `404` on the first attempt with no retry, so real breakage is not masked.
- A healthy 200 returns in 0 seconds, so the green path costs nothing.
- Nothing listening gives `000` after 7 seconds of backoff, and the status assertion still fails.

`--retry-all-errors` was deliberately not used: it would retry DNS and TLS failures, which on a Netlify alias indicate a real misconfiguration rather than noise.

Both halves are now fixed. The skip half landed after the retry half, in a second commit.

**The skip half.** Adding any `if:` to a job drops the implicit `success()` on its `needs`, so `if: ${{ !cancelled() }}` makes `release-pr` run when `deploy-test` did not succeed, and a first-step guard fails it with the upstream result named. `!cancelled()` rather than `always()` so a user-cancelled run produces no spurious red. Verified against ADR-028: there is no reachable path where this turns a `success` run into a `failure` run, because every case where the guard fires is a run already concluding `failure`, and `ci-status-check.sh` reads the run conclusion rather than any job's.

**The nothing-to-release half.** A report step now distinguishes three outcomes: a PR created, the queue empty at job start, or changesets queued with no `pullRequestNumber` returned. The third exits 1, which is the P141 remediation: a dropped output would otherwise skip the two dependent steps on a green job.

Two defects in the first draft of that step were caught by the architect review before anything landed.

The first inverted the check it existed to perform. The count was taken after the changesets step, but `changeset version` deletes the changeset files it consumes, so in the output-dropped case the count would read zero, take the nothing-queued branch and pass green. The count is now taken in its own step before the action runs, with `${COUNT:-0}` so an empty value cannot fail the comparison under `bash -e`.

The second reproduced a known error's own trap. The draft printed "no changesets queued, nothing to release", which is close to verbatim the wording P115 line 30 records as misleading: it reads as reassurance when it can mean site changes are stranded on master. The message now describes the mechanism, says the release path is not armed for this commit, and points at P115.

Branch behaviour was checked before landing: a PR number present takes the PR path; queue 0 with no PR takes the not-armed path and exits 0; queue 3 with no PR takes the output-dropped path and exits 1; an empty count falls safely to the not-armed path.
