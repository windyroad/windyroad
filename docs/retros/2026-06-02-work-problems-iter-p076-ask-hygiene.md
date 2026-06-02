# Ask Hygiene Trail: 2026-06-02 work-problems iter (P076)

Per ADR-044 Phase 5 (`packages/retrospective/skills/run-retro/SKILL.md` Step 2d).

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | (none) | (none) | No `AskUserQuestion` calls emitted in this iter. AFK orchestrator subprocess context per P135; per-iter prose-asks and lazy classification asks are routed through outstanding_questions in the ITERATION_SUMMARY emit instead. |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

## Notes

Zero-ask iter. All decisions were framework-resolvable (silent classification per ADR-044) OR delegated to subagents (architect, jtbd, risk-scorer, voice-tone) which are NOT `AskUserQuestion` calls and therefore do not count against the lazy regression metric.

Two genuine direction-setting questions surface to the iter's `outstanding_questions` queue per the AFK orchestrator's ITERATION_SUMMARY contract (P135 mid-loop forbiddance plus ADR-074 substance-confirm-before-build):

1. ADR-037 § Deferred sub-decision 1: cover-render placement (3 viable options, advisory lean B).
2. ADR-037 § Deferred sub-decision 2: phase=finalise variant 11a-prime (2 viable options, advisory lean A).

Both queue as `category: "direction"` per the ADR-044 taxonomy (substance-confirm-before-build per ADR-074: the framework deliberately does NOT resolve these decisions; the ask is the correct ADR-074 behaviour, not sub-contracting).
