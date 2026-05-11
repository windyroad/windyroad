# Ask Hygiene Trail, 2026-05-12 orchestrator main turn (AFK work-problems loop wrap-up)

Orchestrator main turn for the /wr-itil:work-problems loop that ran 2026-05-11 to 2026-05-12. Six subprocess iters dispatched (each with its own ask-hygiene trail file). This file records the orchestrator's own AskUserQuestion calls in the main turn.

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| 1 | Step 0 route | direction | Gap: Step 0 session-continuity halt is a framework-prescribed halt point per P130 + ADR-013 Rule 1. Prior iter2 hit ConnectionRefused leaving staged P002 transition + README + .claude/settings.json reorder + .claude/scheduled_tasks.lock untracked. The 4-option menu (Resume / Discard / Leave-and-lower / Halt) is the framework-prescribed resolution surface for session-continuity dirty state; no framework artefact resolves which branch to pick. |
| 2 | P039 / ADR-025 | deviation-approval | Gap: iter 3 architect review flagged that ADR-025 audit-at-retro shape may need a runtime auto-degrade threshold; the contradicting evidence was a specific architect-review citation. Queue entry per ADR-044 deviation-candidate schema. |
| 3 | P043 design | direction | Gap: P043 ticket body explicitly states "User picks the design before the next edition" with three options (A/B/C). Framework cannot resolve user-flagged direction-setting decisions; ticket marks this as user-answerable. |

**Lazy count: 0**
**Direction count: 2**
**Deviation-approval count: 1**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

## Notes

Calls 2 and 3 were batched in a single `AskUserQuestion` invocation (Step 2.5b loop-end emit per the P135 Phase 3 framework). Counted as separate rows in this trail because each question carries a distinct framework-gap citation.

Direction count plus deviation-approval count is 3; all are framework-prescribed halt-point asks (Step 0 + Step 2.5b). Lazy count is 0, no sub-contracted framework-resolved decisions.

## Cross-session trend (P135 R6 numeric gate)

Per /wr-retrospective:run-retro Step 2d, the R6 gate fires when lazy count remains greater-or-equal-to 2 across 3 consecutive retros. This retro's lazy count is 0. Prior iter trails for this AFK loop: iter1..iter6 all reported lazy count 0 (no AskUserQuestion mid-iter per AFK constraint). No R6 trigger.
