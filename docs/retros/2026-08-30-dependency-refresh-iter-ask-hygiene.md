# Ask Hygiene, 2026-08-30 (dependency-refresh iter)

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

Zero calls is not evidence of good hygiene on its own: the iteration prompt forbade `AskUserQuestion` outright and directed direction-setting items to `outstanding_questions`. Unlike the story-map salvage run, nothing took that route either. One decision could have gone there and did not need to: whether to bump `netlify-cli` across three majors behind an added root `@opentelemetry/api` declaration. The iteration prompt settles it in its own words ("A blocked release path is better than a broken site"), and the release path was already unblocked by the two packages the gate actually named, so the framework resolved it and the reasoning is recorded on P184 rather than queued as a question.
