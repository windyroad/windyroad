# Ask Hygiene: 2026-08-29 (P120 iter)

AFK `/wr-itil:work-problems` iteration subprocess. `AskUserQuestion` was
unavailable by orchestrator constraint, and no call was made.

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | (none) | (none) | No `AskUserQuestion` call was made this session. |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

Three items were queued to `ITERATION_SUMMARY.outstanding_questions` instead of
asked: the P120 status transition and close (the flip-back it would reverse was
user-confirmed, and the architect returned Needs Direction on reversing it), a
voice-guide scope gap the voice reviewer raised, and an ADR-043 reassessment
criterion whose firing is currently recorded only in a problem ticket. Queuing
rather than asking is the AFK default per ADR-013 Rule 6 as amended by P352.
