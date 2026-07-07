---
status: "proposed"
first-released: 2026-07-07
date: 2026-05-30
human-oversight: confirmed
oversight-date: 2026-05-30
decision-makers: [Tom Howard, Claude]
consulted: []
informed: []
supersedes: 022-scheduled-stale-deps-refresh-pr
reassessment-date: 2026-08-30
---

# push:watch fail-fast on dry-aged-deps non-zero plus separate deps-fix flow

## Context and Problem Statement

ADR 022 introduced a scheduled GitHub Actions cron workflow (Mondays 09:00 UTC) that opens a PR via `peter-evans/create-pull-request@v7` when manifests change. The intent was to absorb the dep-cadence that ADR 021's inline `push:watch` auto-resolve could not (major-version bumps, peer-dep conflicts, breaking-change patterns).

The 2026-05-30 `/wr-architect:review-decisions` drain surfaced the user's direction (verbatim from P072):

> We should auto-update in push watch. If there are dep issues, then we should do an auto update and test and fix, then commit. But that shouldn't be done in a push watch. If there are updates available (dry-aged-deps exits non-zero), fail the push and then fix by updating.

The desired shape:
- `push:watch` continues to auto-update inline per ADR 021 when `dry-aged-deps` can self-resolve.
- `push:watch` FAILS FAST when `dry-aged-deps` exits non-zero (auto-update could not resolve; manual intervention class).
- A separate fix flow (NOT inside push:watch) handles the failed-push case: auto-update, run tests, fix any test failures, commit. The fix flow is invoked when push:watch halts on a dep issue.

This supersedes ADR 022's scheduled-cron-PR shape because the cron PR opens a review surface for changes that have not been validated against project tests, leaving Tom to do the test-and-fix work as part of PR review rather than automatically.

## Decision Drivers

- **Validation before review.** Dep updates should be auto-validated (run tests, fix failures) before any PR or commit lands. ADR 022's cron pattern lands PR-first, validate-later.
- **Fail-fast at push time.** The push gate is the right surface to halt on dep issues; cron cadence is too slow (a week's worth of pushes can land before the cron fires).
- **Separation of concerns.** push:watch should stay focused on push + watch. The auto-update plus test plus fix logic is a separate fix flow with its own invocation, hooks, and audit trail.
- **Retire silent state accumulation.** ADR 022's cron PR can sit open for days carrying breaking changes; the user manually reviews each. The new flow eliminates the open-PR-with-untested-changes class.
- **Composition with ADR 021 (auto-resolve inline).** ADR 021's auto-resolve continues to fire inline for the cases it can handle; this ADR adds the fail-fast branch for the cases it cannot.

## Considered Options

1. **push:watch fail-fast plus separate fix flow** (chosen). When `dry-aged-deps` exits non-zero in push:watch (and ADR 021's `--update --yes` could not auto-resolve), push:watch HALTS with a clear "dep issue, run /wr-itil:fix-deps" message. A new `/wr-itil:fix-deps` skill (or equivalent flow) handles: auto-update + run tests + fix failures + commit, all in the local working tree, then re-attempt push:watch.
2. **Keep ADR 022's cron PR cadence.** Status quo. Loses on the validation-before-review and silent-state-accumulation drivers.
3. **Move the fix flow INTO push:watch.** Auto-update plus test plus fix all inline. Rejected per user direction: push:watch should stay focused; the test-and-fix work belongs in a separate, dedicated flow.
4. **Belt-and-braces: keep cron PR AND add fail-fast.** Both mechanisms run. Rejected: duplicates concern; the cron PR's silent-state-accumulation cost remains even if fail-fast lands.

## Decision Outcome

Chosen option: **push:watch fail-fast plus separate fix flow**, because it satisfies all five drivers, aligns with the user's explicit design direction (P072), and matches the project's existing pattern of "policy-authorised silent proceed for in-appetite cases; halt with clear next-action for out-of-appetite cases".

### Mechanism

Phase 1 (this ADR plus implementation):
- Modify `scripts/push-watch.sh` (or the windyroad-local wrapper if upstream owns push-watch.sh in agent-plugins): when `dry-aged-deps --update --yes` reports manifest changes that auto-committed, continue per ADR 021. When `dry-aged-deps` exits non-zero AFTER the auto-resolve attempt (manual intervention class), HALT with a clear message: "Dep update needed but auto-resolve failed. Run /wr-itil:fix-deps to handle (auto-update + test + fix + commit), then re-run push:watch."
- Author `/wr-itil:fix-deps` skill (or equivalent flow): orchestrates auto-update plus npm test plus fix failures plus commit. Failure mode: if tests fail in a way the assistant cannot fix non-interactively, halt with clear next-action.

Phase 2 (cleanup):
- Retire `.github/workflows/deps-refresh.yml` (ADR 022's cron). Document the retirement in the workflow file's deletion commit message + cross-link to this ADR.
- Update ADR 022 status to "superseded" and rename to `.superseded.md`.

### Scope-rung

This decision covers root-manifest deps (package.json + package-lock.json) only, matching ADR 021's scope. Per-package deps (in monorepo sub-packages, if any) are out of scope and stay at status quo.

## Consequences

### Good

- Validation-before-review: dep updates land tested + fixed, not as PR-for-review.
- Fail-fast surface: push gate halts on dep issues at push time, not days later via cron.
- Separation of concerns: push:watch stays focused; fix flow is dedicated.
- Removes silent state accumulation: no more open dep-refresh PRs sitting for days.

### Bad

- New skill to author (`/wr-itil:fix-deps` or equivalent), which is itself work.
- The fix flow's failure mode (auto-update plus tests fail in a way the assistant cannot fix) needs a clear halt + manual-action prompt; otherwise it could loop or silently leave the tree in a bad state.
- Cron-PR pattern is a known shape; this supersede introduces a less-conventional pattern that requires documentation for adopters.

## Confirmation

The supersede is confirmed once: (a) this ADR lands, (b) `scripts/push-watch.sh` carries the fail-fast branch, (c) `/wr-itil:fix-deps` (or equivalent) exists and is invocable, (d) the next dep issue that occurs is handled end-to-end via the new flow without manual cron-PR-style review, and (e) ADR 022 status flips to "superseded" and `.github/workflows/deps-refresh.yml` is retired.

## Reassessment

Reassess after the first three dep issues handled via the new flow. If the fix flow takes longer than the prior cron-PR cycle (mean time to "deps current") or fails for more than 30% of issues, revisit the design (e.g., partial automation, hybrid back to cron PR for specific failure classes).

## Related

- Supersedes ADR 022 (scheduled stale-deps refresh PR). Closes P072.
- ADR 022 will flip to status: superseded and rename to `.superseded.md` once this ADR's Phase 2 (cron retirement) ships.
- Composes with ADR 021 (push:watch inline auto-resolve: preserved unchanged for the auto-resolvable branch), ADR 028 (CI-status check in push and release watch: same scripts/push-watch.sh wrapper surface).
- User direction verbatim quoted in the Context and Problem Statement above.
