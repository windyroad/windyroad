# Ask Hygiene Trail: work-problems iter P078 (2026-06-02)

This iter ran inside an AFK `/wr-itil:work-problems` subprocess (iter 5). Per P135 / ADR-044 framework-resolution boundary and the AFK constraints documented in the orchestrator's iter-prompt body, `AskUserQuestion` was forbidden mid-loop (P135, treat the user as transient per P130).

## Ask classification

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | n/a | n/a | n/a |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

Zero AskUserQuestion calls fired in this iter. AFK orchestrator forbids them (P135 transient-user assumption). All classification, ticket-update, ADR-amendment, and migration decisions ran as silent agent action per ADR-044 framework-resolution boundary.

## Notes

- One direction-setting observation surfaced (drafts/ layout extension); queued to `outstanding_questions` for orchestrator-end batched surfacing per P342 + ADR-044 category-1.
- Architect-agent ISSUES FOUND (round 1) was resolved by revising ADR-039 scope and re-invoking the architect; round-2 PASS recorded. No AskUserQuestion fired during architect round-trip, agent-agent flow.
