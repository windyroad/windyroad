# Problem 072: ADR-022 scheduled-cron deps refresh PR is wrong shape; push-fail-fast + separate fix flow is the desired pattern

**Status**: Verification Pending (Phase 1 + Phase 2 shipped; awaiting end-to-end validation on the next real dep issue per ADR-034 criterion (d))
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

### Phase 2 Implemented (2026-06-27, work-problems loop)

ADR-034 Phase 2 (cron-retire) shipped:

- **`.github/workflows/deps-refresh.yml` (deleted)**: ADR-022's scheduled cron (Mondays 09:00 UTC, `dry-aged-deps --update --yes` then `peter-evans/create-pull-request@v7`) is retired per ADR-034 Mechanism Phase 2. The cron-PR shape is superseded by the push:watch fail-fast plus `npm run fix:deps` flow that shipped in Phase 1. No live caller referenced the workflow (grep across `*.yml`, `*.sh`, `*.json` found only doc references), so deletion is non-breaking.
- **ADR-022 status**: already at `status: superseded`, renamed `.superseded.md`, `superseded-by: 034-...`, in a prior slice, so the workflow deletion was the only Phase 2 action remaining.

**Gate reviews (pre-edit)**: architect PASS (literal Phase-2 action inside ADR-034's `human-oversight: confirmed` envelope; no new ADR; no conflict with ADR-021, ADR-028, ADR-019). jtbd PASS (internal CI/dev tooling, no user-facing surface). style-guide plus voice-tone N/A (no CSS/UI, no user-facing copy).

**I13 RFC-trace note (P104 known false positive)**: windyroad has not adopted the ADR-060 Problem-RFC-Story framework (no `docs/rfcs/`). The manage-problem I13 fix-time gate fires `no-rfc-trace`; per P104 plus P070/P103 this iter took the documented legacy direct-implementation path and did NOT auto-create an RFC (auto-create would bootstrap an unadopted framework, a direction-setting scope expansion).

### Remaining (validation only)

- ADR-034 confirmation criterion (d): the next real dep issue handled end-to-end via the new flow (future event; validates the design in practice). This is the sole remaining item, user-side and real-world validation rather than dev effort, hence Verification Pending.

### Investigation Tasks

- [x] Re-rate Priority and Effort at next /wr-itil:review-problems (Phase 1 + Phase 2 effort now consumed; only criterion (d) real-world validation remains, which is user-side, so the ticket is Verification Pending and excluded from WSJF ranking).
- [x] Author the superseding ADR via /wr-architect:create-adr documenting: (1) push:watch auto-update inline behaviour (preserved from ADR-021), (2) push:watch fail-fast on dry-aged-deps non-zero (new), (3) separate fix flow shape. (DONE: ADR-034 exists, `human-oversight: confirmed`.)
- [x] Phase 2: retire ADR-022's cron workflow (.github/workflows/deps-refresh.yml) now that Phase 1 has shipped, and flip ADR-022 to superseded. (DONE 2026-06-27: workflow deleted; ADR-022 was already `.superseded.md` from a prior slice. See Phase 2 Implemented above.)
- [x] Design the fix flow invocation surface: standalone script? new /wr-itil:fix-deps skill? hook on push gate failure? (RESOLVED 2026-06-17: repo-local flow `scripts/fix-deps.sh`, modelled on ../bbstats; NOT upstream in wr-itil. Implemented this iteration. See Phase 1 Implemented above.)

## Fix Released

ADR-034 supersede shipped in two slices, both now landed:

- **Phase 1 (2026-06-17)**: `scripts/push-watch.sh` fail-fast branch, `scripts/fix-deps.sh`, `npm run fix:deps`, behavioural tests. push:watch halts and routes to the fix flow when stale deps remain after the ADR-021 inline auto-resolve.
- **Phase 2 (2026-06-27)**: `.github/workflows/deps-refresh.yml` (ADR-022's cron) deleted; ADR-022 already `superseded`.

Released as a local commit per ADR-014 (windyroad is `private: true`, no npm publish surface, no version tag). Awaiting ADR-034 confirmation criterion (d): the next real dep issue handled end-to-end via the new flow without a cron-PR-style review. Close this ticket once that validation occurs.

## Dependencies

- **Blocks**: ADR-022 final-status. Until this ticket lands a superseding ADR, ADR-022 carries `human-oversight: rejected-pending-supersede` marker.
- **Blocked by**: (none)
- **Composes with**: ADR-021 (push:watch auto-update; stays confirmed and load-bearing for the inline branch). ADR-028 (CI-status check in push and release watch; same scripts/push-watch.sh surface).

## Related

- Captured via /wr-itil:capture-problem on 2026-05-30 during /wr-architect:review-decisions drain after user rejected ADR-022 with explicit design direction.
- ADR-022 frontmatter carries `human-oversight: rejected-pending-supersede` plus `supersede-ticket: P072`.
- User direction verbatim quoted in the Description above.
