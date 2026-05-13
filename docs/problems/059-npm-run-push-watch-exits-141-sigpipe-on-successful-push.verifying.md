# Problem 059: `npm run push:watch` exits 141 (SIGPIPE) on successful push, skipping post-push pipeline-watch

**Status**: Verification Pending
**Reported**: 2026-05-13
**Priority**: 3 (Medium). Impact: 3 x Likelihood: 1 (deferred, re-rate at next /wr-itil:review-problems)
**Effort**: M (deferred, re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

`npm run push:watch` exits 141 (SIGPIPE) on successful push, skipping post-push pipeline-watch and test-deploy URL surfacing.

Reproduced 2026-05-13: push succeeded (`219377b..f0916ff master -> master`) but `scripts/push-watch.sh` exited 141 immediately after the `git push` line, before reaching the `Waiting for main-pipeline` / `Pipeline:` / `Test deploy:` output blocks (scripts/push-watch.sh:181-217). With `set -euo pipefail` on (line 8), a SIGPIPE in any `... | head ...` chain (lines 71, 75, 191, 213, 284) propagates as exit 141.

Observable user-facing effect: the user did not get the test-deploy URL the wrapper is designed to surface. The push itself succeeded; only the post-push observability surface was lost.

Category: release-path instability.

Suggested fix: audit the pipe chains in `scripts/push-watch.sh` for SIGPIPE-safety (wrap with `|| true` after `head`, or drop `pipefail` for the affected blocks). Candidate offenders by line:
- L71 `find .changeset ... | head -20 | wc -l | tr -d ' '`
- L75 `git log --format='%aI' --reverse origin/publish..origin/master ... | head -1`
- L191 `gh run list ... | head -1`
- L213 `netlify api ... | jq -r ... | head -1`
- L284 `netlify api ... | jq -r ... | head -1`

## Symptoms

(deferred to investigation)

## Workaround

(deferred to investigation)

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: (deferred to investigation)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [x] Investigate root cause (identify which pipe chain SIGPIPEs first). **Investigated 2026-05-13**: 7 pipe-to-head chains total (lines 71, 75, 191, 213, 225, 243, 284), not 5 as the ticket initially listed. Architect-confirmed audit-trail correction. The chains around L191 (`gh run list ... | head -1`) and L213 (`netlify api ... | jq ... | head -1`) execute immediately after `git push`, matching Tom's reproduction window. SIGPIPE fires when the downstream `head` closes stdin before the upstream `gh` or `netlify` finishes writing; under `set -euo pipefail` the propagated 141 aborts the script.
- [x] Create reproduction test. **Decided 2026-05-13**: local repro via `seq | head -1` and `find / | head -1` did NOT trigger 141 on bash 5.x Darwin (the producer exited fast enough that head's close happened post-producer-exit). The real-world reproduction depends on slow remote-API latency (gh / netlify) producing the timing window where SIGPIPE actually fires. A formal reproduction would require either mocking the slow producer or running against a real gh/netlify call; both exceed P059's marginal scope. Verification deferred to next live `npm run push:watch` against a real push.

## Fix Released

Released 2026-05-13 on local master (not yet pushed). `scripts/push-watch.sh` 7 pipe-to-head chains (lines 71, 75, 191, 213, 225, 243, 284) now append `|| true` inside the command substitution. The `|| true` neutralizes pipefail-induced exit-141 propagation when downstream `head` closes stdin before the upstream `find` / `git log` / `gh run list` / `netlify api` finishes writing. Each chain captures into a variable (`CHANGESET_COUNT`, `OLDEST_UNRELEASED`, `RUN_ID`, `TEST_URL`, `CURRENT_CHANGESETS`, `PREVIEW_URL`) and downstream callers already handle the empty-or-zero degraded-failure case via `[ -z "$X" ]` / `[ "$X" -eq 0 ]` / `[ "$X" != "null" ]`, so neutralizing the exit code does not lose data.

The fix shape matches ADR-021's "Robustness shape" precedent (infrastructure-noise failures inside push-watch should degrade non-fatally rather than abort the push surface). Architect PASS (no new ADR; sibling pattern to ADR-021).

Audit-trail correction: the ticket originally named 5 chains (71, 75, 191, 213, 284). Architect verification found 2 additional chains (225, 243) with the same SIGPIPE risk pattern, both in the post-push release-PR flow. All 7 are fixed in this commit.

Bash syntax check passed (`bash -n scripts/push-watch.sh`). Verification trigger: next `npm run push:watch` against a real push completes the full output sequence (Pipeline URL, Test deploy URL, Release PR check) without exit 141.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

(captured via /wr-itil:capture-problem; expand at next investigation)
