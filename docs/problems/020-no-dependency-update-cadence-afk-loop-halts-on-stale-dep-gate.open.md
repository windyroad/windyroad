# Problem 020: No dependency update cadence; AFK loop halts on stale-dep gate when deps fall out of date

**Status**: Open
**Reported**: 2026-04-26
**Priority**: 12 (Significant). Impact: Moderate (3) x Likelihood: Likely (4)

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

- [ ] Investigate root cause: no scheduled cadence for `npx dry-aged-deps --update`
- [ ] Review options: cron job, GitHub Action, scheduled skill invocation
- [ ] Decide cadence: weekly (matches newsletter cycle) seems reasonable
- [ ] Create reproduction test (e.g. timestamp-back deps and observe gate halt)
- [ ] Create INVEST story for permanent fix (scheduled action OR `wr-deps-refresh` skill)

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P026 (dry-aged-deps pre-push gate has no AFK-bypass; same root surface)

## Related

- packages/itil/skills/work-problems/SKILL.md (Step 6 / push-watch interaction)
- npm dry-aged-deps package
