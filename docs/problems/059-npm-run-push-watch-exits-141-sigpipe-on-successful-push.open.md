# Problem 059: `npm run push:watch` exits 141 (SIGPIPE) on successful push, skipping post-push pipeline-watch

**Status**: Open
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
- [ ] Investigate root cause (identify which pipe chain SIGPIPEs first)
- [ ] Create reproduction test (force the failing branch via fixture)

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

(captured via /wr-itil:capture-problem; expand at next investigation)
