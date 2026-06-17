# Problem 072: ADR-022 scheduled-cron deps refresh PR is wrong shape; push-fail-fast + separate fix flow is the desired pattern

**Status**: Open (Phase 1 implemented 2026-06-17; Phase 2 cron-retire + end-to-end validation remain)
**Reported**: 2026-05-30
**Origin**: internal
**Priority**: 8 (Medium). Impact: Minor (2) x Likelihood: Likely (4)
**Effort**: M
**WSJF**: 4 = (8 x 1) / 2
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

### Direction Resolved (2026-06-17, work-problems loop end)

The open question was how windyroad should satisfy ADR-034 Phase 1's deps-fix flow: Option A (place it upstream-first in the wr-itil plugin), Option B (build it repo-local), or Option C (status quo). Tom's answer:

> I don't think this should live in wr-itil. Build the solution here, but look at ../bbstats for how it does dependency patching.

Resolution: **Option B (repo-local)**. Build the deps-fix flow IN THIS REPO, e.g. `scripts/fix-deps.sh` per ADR-034's "or equivalent flow" phrasing (ADR-034 lines 40, 53, 80 authorise a `/wr-itil:fix-deps` skill OR an equivalent flow; confirmation criterion (c) is satisfied by a repo-local invocable script). Do NOT place it in the upstream wr-itil plugin.

- **Implementer cue: read `../bbstats` first.** The sibling repo at `/Users/tomhoward/Projects/bbstats` (verified present 2026-06-17) already does dependency patching; model the windyroad flow on how bbstats handles it. This is a hint, not a hard dependency.
- **Architect (2026-06-17): PASS.** Repo-local placement is inside ADR-034's decision envelope ("or equivalent flow") and contradicts no ADR; it also keeps the work under this project's own authority rather than proposing it to an external repo (per project memory on upstream-placement, P045). ADR-034 carries `human-oversight: confirmed`, so building against it is ratified.
- This resolves the Investigation Task "Design the fix flow invocation surface" toward a repo-local script (not a new upstream skill).

### Phase 1 Implemented (2026-06-17, work-problems loop)

ADR-034 Phase 1 shipped repo-local in windyroad (per Tom's resolved direction, Option B):

- **`scripts/fix-deps.sh` (new)**: the separate deps-fix flow ADR-034 requires ("or equivalent flow"). Flow is detect (`dry-aged-deps --check`), apply (`dry-aged-deps --update`), test (`npm test`), then commit-on-green or restore-known-good-manifests-and-HALT-on-red. Modelled on the sibling repo `../bbstats`'s auto-deps flow (detect, apply, test, then commit-on-green or revert-and-escalate-on-red), adapted to windyroad's local, non-CI, single-package, `private: true` shape (no changeset, no prod-deploy surface). Invoked via `npm run fix:deps`. Carries a `FIX_DEPS_LIB_ONLY` sourcing seam for behavioural unit tests.
- **`scripts/push-watch.sh` (edited)**: after the ADR-021 inline `dry-aged-deps --update --yes` auto-resolve plus `chore(deps)` commit, re-checks `dry-aged-deps --check` and HALTs (exit non-zero) routing the operator to `npm run fix:deps` when stale deps remain that auto-resolve could not clear, BEFORE the push plus CI round-trip. New pure `deps_gate_route` helper (exit-code to proceed or halt) makes the routing decision unit-testable. push:watch stays focused on push plus watch; it does NOT run the fix flow inline (ADR-034 separation-of-concerns).
- **`package.json` (edited)**: added `"fix:deps": "bash scripts/fix-deps.sh"`.
- **Tests**: `scripts/fix-deps.test.mjs` (new, covers `fix_deps_commit_body`) plus `deps_gate_route` cases added to `scripts/push-watch.test.mjs`. TDD red then green; all 16 vitest cases pass.

**Gate reviews (pre-edit)**: architect PASS (inside ADR-034's confirmed "or equivalent flow" envelope; no new ADR needed), jtbd PASS (internal tooling, no user-facing surface), risk-scorer PASS (residual 4/25 Low, within appetite).

**Deviation note (no RFC trace)**: windyroad has NOT adopted the wr-itil Problem-RFC-Story framework (no `docs/rfcs/`, no `docs/stories/`, no ADR adopting ADR-060). The wr-itil `manage-problem` I13 RFC-trace gate's auto-create path would bootstrap an entire unadopted framework, a direction-setting scope expansion outside ADR-034 Phase 1. This fix took the SKILL's documented legacy direct-implementation path (the pre-RFC-framework flow) instead. Framework adoption, if ever desired, is a separate human-confirmed decision.

### Remaining (Phase 2 plus validation)

- ADR-034 confirmation criterion (d): the next real dep issue handled end-to-end via the new flow (future event; validates the design in practice).
- ADR-034 Phase 2 (explicitly out of scope this iteration): retire `.github/workflows/deps-refresh.yml` (ADR-022's cron) and flip ADR-022 to `superseded`. ADR-034 sequencing forbids retiring the cron before Phase 1 ships; Phase 1 has now shipped, so Phase 2 is unblocked as a future slice.

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems (Phase 1 effort consumed; remaining is Phase 2 cron-retire, S).
- [x] Author the superseding ADR via /wr-architect:create-adr documenting: (1) push:watch auto-update inline behaviour (preserved from ADR-021), (2) push:watch fail-fast on dry-aged-deps non-zero (new), (3) separate fix flow shape. (DONE: ADR-034 exists, `human-oversight: confirmed`.)
- [ ] Phase 2: retire ADR-022's cron workflow (.github/workflows/deps-refresh.yml) now that Phase 1 has shipped, and flip ADR-022 to superseded. (Decided in ADR-034 Decision Outcome; sequenced as Phase 2.)
- [x] Design the fix flow invocation surface: standalone script? new /wr-itil:fix-deps skill? hook on push gate failure? (RESOLVED 2026-06-17: repo-local flow `scripts/fix-deps.sh`, modelled on ../bbstats; NOT upstream in wr-itil. Implemented this iteration. See Phase 1 Implemented above.)

## Dependencies

- **Blocks**: ADR-022 final-status. Until this ticket lands a superseding ADR, ADR-022 carries `human-oversight: rejected-pending-supersede` marker.
- **Blocked by**: (none)
- **Composes with**: ADR-021 (push:watch auto-update; stays confirmed and load-bearing for the inline branch). ADR-028 (CI-status check in push and release watch; same scripts/push-watch.sh surface).

## Related

- Captured via /wr-itil:capture-problem on 2026-05-30 during /wr-architect:review-decisions drain after user rejected ADR-022 with explicit design direction.
- ADR-022 frontmatter carries `human-oversight: rejected-pending-supersede` plus `supersede-ticket: P072`.
- User direction verbatim quoted in the Description above.
