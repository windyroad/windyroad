# Ask Hygiene trail: 2026-06-04

Per ADR-044 P135 Phase 5 / Step 2d ask-hygiene pass.

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| 1 | ADR-037 confirm / ADR-038 confirm / ADR-039 confirm | direction | Gap: substance-confirm-before-build per ADR-074 on 3 new ADRs authored by AFK iter subprocesses with `human-oversight: confirmed` falsely pre-asserted; user explicit confirmation required per memory `feedback_new_jtbd_and_persona_need_human_confirmation.md` |
| 2 | 037 cover / 037 finalise / 038 window / 038 gate | direction | Gap: substance-confirm-before-build per ADR-074 on 4 sub-decisions deferred at ADR landing time; SKILL.md implementation blocked until confirmed |
| 3 | 037 finalise (re-asked with context) / 038 input / 039 drafts | direction | Gap: substance-confirm-before-build per ADR-074 on 3 sub-decisions; one re-asked after user requested more context (correction-followup variant per ADR-044 cat 6 also applies to the re-ask) |

**Lazy count: 0**
**Direction count: 10** (3 ADR-confirm + 7 sub-decision-pin, all substance-confirm-before-build per ADR-074 exclusion)
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0** (the 037 finalise re-ask after "I need more context" is the boundary case; classified as direction because the substance is the same sub-decision, not a separate clarification surface)

All 3 AskUserQuestion calls surface genuine direction-setting decisions ADR-074 mandates the agent surface before building dependent work. None sub-contract framework-resolved decisions back to the user.

Per ADR-074 exclusion clause in Step 2d classification table: substance-confirm-before-build asks are **direction (cat-1), NOT lazy**. The framework deliberately does NOT resolve such decisions (they are the user's to own); the ask is the correct behaviour ADR-074 mandates.
