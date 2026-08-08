# Ask Hygiene trail: 2026-08-09 (P115 AFK iter)

AFK `/wr-itil:work-problems` iteration. `AskUserQuestion` was explicitly barred by the orchestrator
for this run, and none was called.

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | (none) | (none) | No `AskUserQuestion` calls made. Barred by the iteration prompt and unavailable in AFK context per ADR-013 Rule 6. |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

## Deferred-to-queue instead of asked

Three genuinely user-bound decisions arose and were routed to `ITERATION_SUMMARY.outstanding_questions`
per P352 queue-and-continue rather than asked. Recorded here so the trend surface does not read a
zero lazy count as "no decisions arose".

1. Ratify the `internal-maintainer` persona and JTBD-400/401/402. Blocks the P115 fix from landing.
   Category: direction. `Gap: ratification is the user's by construction; no framework resolves it.`
2. Two missing jobs covering the release path, reader side and maintainer side. Category: direction.
   `Gap: new JTBDs are direction-setting; writing the reader's job to justify the agent's own halt is
   the collapse the persona's "not the readers' interests by proxy" clause forbids.`
3. How a machine-authored dependency refresh should reach production. Category: direction.
   `Gap: three viable options (halt for a hand-authored changeset, auto-author one under ADR-021's
   existing write authority, or leave manifests out of the gate), no ADR pins the choice.`

## Note on the correction-signal hook

The `UserPromptSubmit` correction detector fired on the iteration prompt again, matching `DO NOT`
inside the orchestrator's standing constraint block. Nothing had been corrected, so no
capture-on-correction offer was made. Already ticketed as P137; recorded here only as another
instance of the false-positive rate that ticket describes.
