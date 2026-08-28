# Ask Hygiene, 2026-08-29 P128 iter

AFK `/wr-itil:work-problems` iteration subprocess. `AskUserQuestion` is forbidden
mid-loop per ADR-044 and the orchestrator's iter constraints; direction items queue
at `ITERATION_SUMMARY.outstanding_questions` instead.

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | (none) | (none) | No `AskUserQuestion` calls were made this iteration. |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

Two items were queued to `outstanding_questions` rather than asked: the first
story map (the I13 propose-fix gate refuses to draw one, per the skill's exit-3
branch B instruction), and confirmation that skipping the threshold-restatement
ticket AFK was right given the sentence in its own Dependencies section telling
the loop not to select it.
