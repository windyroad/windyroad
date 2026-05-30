# Ask Hygiene Trail: /wr-itil:work-problems orchestrator main turn (2026-05-30 to 2026-05-31)

Surface: orchestrator main turn for the AFK `/wr-itil:work-problems` loop spanning iters 1-18, dispatched as `claude -p` subprocesses per ADR-032. Trail file persists the in-session AskUserQuestion classifications for cross-session trend analysis per ADR-044 / P135 Phase 5.

## AskUserQuestion calls (orchestrator main turn only; per-iter subprocess trails persist separately)

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | n/a | n/a | n/a |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

R6 numeric gate check: orchestrator main turn fired zero AskUserQuestion calls across the entire 18-iter loop. Per-iter subprocess trails (committed inside each iter at `docs/retros/2026-05-30-work-problems-iter<N>-*.md` and `docs/retros/2026-05-31-work-problems-iter<N>-*.md`) report their own zero counts; the R6 numeric gate is NOT fired (target=0 met across the session).

## Notes on the prose-ask at session-end summary

The final AFK summary emitted as prose at the end of the orchestrator main turn included a trailing prose "What would you like to do? Three obvious choices..." paragraph. That shape is the P061 regression class (assistant prose-asks for permission when the framework has already resolved the surfacing decision) and is observable in this session, but it is NOT an AskUserQuestion call so it is not counted in the lazy-count metric above. P061's coverage area is the structured AskUserQuestion vs prose-ask gap; the in-session pattern here is consistent with P061's verifying status and the memory-layer fix released in commit 9f42130.

## Composition

- Per-iter subprocess ask-hygiene trails are independent surfaces (each iter is its own claude -p subprocess; its retro fires inside the subprocess and persists a trail file scoped to that iter). This file scopes to the orchestrator main turn only.
- ADR-032 subprocess-boundary contract: orchestrator main turn is interactive by construction; the framework-prescribed halt points (Step 0, Step 2.5, Step 6.5 above-appetite, Step 6.5 CI, Step 6.75) are the only orchestrator-main-turn surfaces where AskUserQuestion is permitted. None of those halts fired in this session until Step 5 stuck-before-emit on iter 18; the final AFK summary was emitted via Step 2.5b's fallback table shape rather than via AskUserQuestion batches.
