# Problem 029: work-problems iteration boundary leaves run-retro BRIEFING.md edits uncommitted

**Status**: Open
**Reported**: 2026-04-26
**Priority**: 12 (Significant). Impact: Moderate (3) x Likelihood: Likely (4)

## Description

Iteration retros inside `/wr-itil:work-problems` write to `docs/BRIEFING.md` but cannot commit per ADR-014 (run-retro out of scope for own commits). The orchestrator must add separate "BRIEFING hand-off" commits between iterations to keep Step 6.75 dirty-state classification clean. Each hand-off commit triggers another risk-scorer subagent invocation (compounds with P028 TTL expiry).

## Symptoms

From prior AFK session:
- Iters 7, 9, 11 each modified BRIEFING.md but committed only the main ticket fix
- Orchestrator added 4 hand-off commits: `4c644e5`, `3b3a703`, `556ef92`, `180b829`
- Each cost an additional risk-scorer subagent invocation cycle

## Workaround

Orchestrator adds a separate "BRIEFING hand-off" commit per iteration that touched BRIEFING. Mechanical but expensive.

## Impact Assessment

- **Who is affected**: AFK orchestrator runs that include retros
- **Frequency**: Most iterations (retros are the default closeout shape)
- **Severity**: Moderate. Adds risk-scorer invocations and commit churn; doesn't block work
- **Analytics**: Git history pattern: ticket commit followed by BRIEFING hand-off commit pairs

## Root Cause Analysis

### Investigation Tasks

- [ ] Review `work-problems/SKILL.md` Step 6 / Step 6.5 (commit-staging contract)
- [ ] Decide fix: orchestrator iteration prompt grants retro permission to fold BRIEFING into the iteration's main commit, OR work-problems explicitly stages BRIEFING in the iteration's commit before risk-scoring
- [ ] Consider ADR-014 amendment: retro-as-part-of-iteration commit scope
- [ ] Create reproduction test (run-retro inside work-problems iteration)
- [ ] Create INVEST story for permanent fix

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P028 (each hand-off commit triggers a risk-scorer call; closing P029 reduces P028 frequency)

## Related

- packages/itil/skills/work-problems/SKILL.md (Step 6 / Step 6.5 / Step 6.75)
- docs/decisions/014-*.md (governance skills commit own work)
- packages/wr-retrospective/skills/run-retro/SKILL.md
