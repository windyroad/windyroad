# Ask hygiene trail, 2026-06-02 work-problems iter on P071

Session: AFK `/wr-itil:work-problems` iter; subprocess context.
Ticket: P071 (ADR-016 parameterised sw-critic pattern has poor discoverability + UX; supersede with domain-specific critic agents).
Commit: `2e0348e`.

## In-session AskUserQuestion calls

None.

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | n/a | n/a | n/a |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

## Notes

- AFK iter, P135 constraint forbids mid-loop `AskUserQuestion`; direction-setting observations queue at `ITERATION_SUMMARY.outstanding_questions` instead.
- All decisions in this iter were framework-resolved: ADR-033 directed the Phase 2 SKILL.md migration verbatim; ADR-035 directed the agent contract shape (no `accepted_overrides` input, S/W + context output); architect confirmed PASS (2026-06-02) after raising 3 issues that were addressed before write; JTBD confirmed PASS; risk-scorer commit 2/25 (Very Low); external-comms gate PASS; voice-tone gate PASS.
- No human-judgment-bound branch surfaced during the iter, no observation queued for `outstanding_questions`.
