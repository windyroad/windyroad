# Problem 020: No dependency update cadence; AFK loop halts on stale-dep gate when deps fall out of date

**Status**: Verification Pending
**Reported**: 2026-04-26
**Priority**: 12 (Significant). Impact: Moderate (3) x Likelihood: Likely (4)
**Effort**: S
**WSJF**: 12.0 (Severity 12 x Open multiplier 1.0 / Effort divisor 1)

## Description

The project lacks a cadence for refreshing dependencies. When the AFK `/wr-itil:work-problems` loop tries to drain after 14+ days of no dep updates, the `dry-aged-deps --check` pre-push gate halts the loop and forces user intervention. User explicitly flagged in the AFK retro response: "you should refresh often. Maybe create a problem ticket for there being no update cadence".

## Symptoms

- First push:watch drain in the prior session failed: "Stale dependencies found. Run 'npx dry-aged-deps --update' to update them, then re-push." (react/react-dom 16 days old)
- Required user "fix the deps" intervention to clear the gate
- AFK loop blocked until deps refreshed and pushed; not a true AFK-safe operation

## Workaround

Refresh deps proactively at start of each work-problems session, OR keep a scheduled job that bumps mature versions on a known cadence.

## Impact Assessment

- **Who is affected**: AFK orchestrator runs; user when intervening to unblock
- **Frequency**: Any AFK session after 14+ days of deps not refreshed
- **Severity**: Significant. Blocks AFK drains; forces user intervention
- **Analytics**: dry-aged-deps gate halts; npm/git history of dep refresh commits

## Root Cause Analysis

### Investigation Tasks

- [x] Investigate root cause: no scheduled cadence for `npx dry-aged-deps --update`
- [x] Review options: cron job, GitHub Action, scheduled skill invocation
- [x] Decide cadence: weekly (matches newsletter cycle), Mondays 09:00 UTC
- [x] Create permanent fix: `.github/workflows/deps-refresh.yml` opens a PR weekly when manifests change

### Findings

Root cause: no scheduled job refreshes manifests, so accumulated drift past `dry-aged-deps`'s configured tolerances (`dev: 30, prod: 14`) eventually halts `dry-aged-deps --check` at push time. ADR-021 closes the reactive half (push-watch auto-resolves at push time, P026), but the proactive cadence half is missing.

Fix path chosen (per ADR-022): GitHub Actions cron (`0 9 * * 1`, Mondays 09:00 UTC) running `npx dry-aged-deps --update --yes` and opening a PR via `peter-evans/create-pull-request@v7` when root manifests change. PR shape preserves the existing main-pipeline review trail.

Architectural notes:
- Sibling to ADR-021 (proactive cadence vs. reactive bypass).
- New ADR (022) records the bot-author identity (`github-actions[bot]`) and the changeset-policy boundary (root manifests only, project is `private: true`).
- Composes with P026's iteration 1 fix in `scripts/push-watch.sh`; both surfaces remain in force.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P026 (dry-aged-deps pre-push gate has no AFK-bypass; same root surface)

## Related

- packages/itil/skills/work-problems/SKILL.md (Step 6 / push-watch interaction)
- npm dry-aged-deps package
- docs/decisions/021-auto-resolve-stale-deps-in-push-watch.proposed.md (sibling: reactive bypass)
- docs/decisions/022-scheduled-stale-deps-refresh-pr.proposed.md (this fix: proactive cadence)
- .github/workflows/deps-refresh.yml (the workflow)
- P026 (dry-aged-deps pre-push gate has no AFK-bypass; reactive half of the same surface)

## Fix Released

Workflow added in `.github/workflows/deps-refresh.yml` and ADR-022 in the same commit on 2026-04-26.

- Weekly cron on Mondays 09:00 UTC runs `npx dry-aged-deps --update --yes` on origin.
- Opens a PR via `peter-evans/create-pull-request@v7` when root manifests change; the PR triggers `main-pipeline.yml` and merges through the existing review trail.
- Composes with ADR-021 (push-watch reactive bypass) and P026 (same surface, reactive half).

Awaiting user verification:
- First scheduled run lands the following Monday (2026-05-04 09:00 UTC) or sooner via `gh workflow run deps-refresh.yml` (manual dispatch enabled).
- Verify by observing a PR titled `chore(deps): scheduled refresh of stale dependencies` against `master` and confirming `main-pipeline.yml` passes its `Check dependency freshness` step on the PR.
- Verify by observing a future AFK `/wr-itil:work-problems` drain that does NOT halt on accumulated auto-resolvable drift.
