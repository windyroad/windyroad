# Ask Hygiene, 2026-08-30 (story-map salvage iter)

Per ADR-044 framework-resolution boundary. Lazy count is the regression metric; target 0.

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| n/a | n/a | n/a | No `AskUserQuestion` call was made this session. |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

Zero calls is not evidence of good hygiene this run: the iteration prompt forbade `AskUserQuestion` outright and directed direction-setting items to `outstanding_questions` instead. One item took that route (whether to stand up `docs/stories/`, which is the precondition for the J4 reverse trace and is ADR-058 reassessment criterion 1). Under the normal contract that item would have been a `direction` call, not a lazy one, so the underlying hygiene reading for this session is 1 direction and 0 lazy.
