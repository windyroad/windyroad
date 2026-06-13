# Ask Hygiene Trail: 2026-06-14

Source: `/wr-retrospective:run-retro` inside a `/wr-itil:work-problems` AFK iter working P071 (ADR-033 + ADR-035 accept).

This iteration ran fully non-interactively (AFK). Zero `AskUserQuestion` calls were fired (the loop forbids mid-loop asks; direction-setting questions are queued to `ITERATION_SUMMARY.outstanding_questions`).

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | | | |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

Note: one direction-setting question (P071 Phase 3 wr-blog scope) was QUEUED to the iteration's `outstanding_questions` rather than asked mid-loop, per the AFK queue-and-continue default (ADR-013 Rule 6 / ADR-044). It is not counted here because no `AskUserQuestion` tool call was made.
