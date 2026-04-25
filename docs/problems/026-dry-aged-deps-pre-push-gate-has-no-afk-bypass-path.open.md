# Problem 026: dry-aged-deps pre-push gate has no AFK-bypass path; halts work-problems loop on every stale-dep state

**Status**: Open
**Reported**: 2026-04-26
**Priority**: 16 (Significant). Impact: Significant (4) x Likelihood: Likely (4)

## Description

`dry-aged-deps --check` runs as part of `npm run push:watch` and halts the AFK work-problems loop when deps are stale. The gate has no AFK-bypass nor authorised-update path; user intervention is required.

## Symptoms

From prior AFK session:
- First drain rejected on react/react-dom 16-day staleness
- Required user "fix the deps" intervention to clear the gate
- Loop could not self-recover; orchestrator halted

## Workaround

Pre-emptive `npx dry-aged-deps --update --yes` before starting work-problems, OR commit-time deps-refresh as part of work-problems Step 0.

## Impact Assessment

- **Who is affected**: AFK orchestrator runs
- **Frequency**: Every AFK session with deps older than the staleness threshold
- **Severity**: Significant. Halts the loop; forces user intervention
- **Analytics**: dry-aged-deps gate halt logs; npm push failure transcripts

## Root Cause Analysis

### Investigation Tasks

- [ ] Decide insertion point for fix: work-problems Step 0 (pre-emptive refresh) OR push-watch.sh (AFK-bypass mode)
- [ ] If Step 0: weigh against P020 (cadence): could be the same fix
- [ ] If push-watch.sh: design AFK-bypass mode that authorises auto-update under risk policy
- [ ] Create reproduction test (timestamp-back deps and observe gate halt)
- [ ] Create INVEST story for permanent fix

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P020 (cadence): same root surface; closing P020 reduces P026 trigger frequency

## Related

- packages/itil/skills/work-problems/SKILL.md (Step 0 / Step 6.5 push paths)
- npm dry-aged-deps package
