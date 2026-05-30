# Problem 072: ADR-022 scheduled-cron deps refresh PR is wrong shape; push-fail-fast + separate fix flow is the desired pattern

**Status**: Open
**Reported**: 2026-05-30
**Priority**: 4 (Medium). Impact: 2 x Likelihood: 4 (deferred. re-rate at next /wr-itil:review-problems)
**Effort**: M (deferred. re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

ADR-022 (scheduled stale-deps refresh PR via GitHub Actions cron) was rejected during the 2026-05-30 /wr-architect:review-decisions drain. User direction verbatim:

> We should auto-update in push watch. If there are dep issues, then we should do an auto update and test and fix, then commit. But that shouldn't be done in a push watch. If there are updates available (dry-aged-deps exits non-zero), fail the push and then fix by updating.

The desired shape has three pieces:

1. **push:watch auto-updates** (per ADR-021, which stays confirmed). When dry-aged-deps can auto-resolve, push:watch handles it inline.
2. **push:watch fails fast** when dry-aged-deps exits non-zero (cases auto-update cannot resolve: major-version bumps, peer-dep conflicts, breaking change patterns). The push gate halts on this signal rather than swallowing it.
3. **Separate fix flow** handles the failed-push case. The flow runs auto-update, tests, fixes any test failures (delegate to architect/JTBD review per ADR-014), then commits. This flow is NOT inside push:watch (push:watch should stay focused on push + watch); it is invoked when the push gate halts on a dep issue.

This supersedes ADR-022's scheduled-cron-PR shape because the cron PR opens a review surface for changes that have not been validated against the project tests, leaving Tom to do the test-and-fix work as part of the PR review rather than automatically.

## Symptoms

- ADR-022 cron PR cadence (Mondays 09:00 UTC) opens PRs that may carry breaking changes; review surface accumulates work that the user originally wanted automated.
- Push gate currently does NOT fail fast on dry-aged-deps non-zero exit (per ADR-021's auto-commit shape); the auto-update can silently include bumps that have not been tested.

## Workaround

(deferred to investigation. current state: ADR-022 cron exists; PRs accumulate; user manually reviews. ADR-021 auto-update fires in push:watch.)

## Impact Assessment

- **Who is affected**: Tom (every dep refresh PR review). Future adopters of the patch-fitness pattern who would expect the workflow.
- **Frequency**: weekly (ADR-022 cadence) + per-push (ADR-021 inline).
- **Severity**: Medium. The cron PR pattern works mechanically but creates review burden the user wanted automated; the proposed fix flow would close that gap.

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems.
- [ ] Author the superseding ADR via /wr-architect:create-adr documenting: (1) push:watch auto-update inline behaviour (preserved from ADR-021), (2) push:watch fail-fast on dry-aged-deps non-zero (new), (3) separate fix flow shape (auto-update plus test plus fix plus commit, outside push:watch).
- [ ] Decide whether to retire ADR-022's cron workflow (.github/workflows/deps-refresh.yml) once the new flow ships, or keep it as a belt-and-braces cadence.
- [ ] Design the fix flow invocation surface: standalone script? new /wr-itil:fix-deps skill? hook on push gate failure?

## Dependencies

- **Blocks**: ADR-022 final-status. Until this ticket lands a superseding ADR, ADR-022 carries `human-oversight: rejected-pending-supersede` marker.
- **Blocked by**: (none)
- **Composes with**: ADR-021 (push:watch auto-update; stays confirmed and load-bearing for the inline branch). ADR-028 (CI-status check in push and release watch; same scripts/push-watch.sh surface).

## Related

- Captured via /wr-itil:capture-problem on 2026-05-30 during /wr-architect:review-decisions drain after user rejected ADR-022 with explicit design direction.
- ADR-022 frontmatter carries `human-oversight: rejected-pending-supersede` plus `supersede-ticket: P072`.
- User direction verbatim quoted in the Description above.
