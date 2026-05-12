# Ask Hygiene Pass (2026-05-13, push session)

Per ADR-044 / Step 2d of `/wr-retrospective:run-retro`. Session scope: from user `/clear` through `push` then `/wr-retrospective:run-retro`.

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | (no AskUserQuestion calls fired this session) | n/a | n/a |

**Lazy count: 0**
**Direction count: 0**
**Deviation-approval count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

## Notes

- Session was 6 turns: status check, blocked push, blocked push:watch, risk-scorer delegate, successful push:watch, retro.
- Two Agent delegations fired (wr-risk-scorer:pipeline x2: push gate, commit gate for P059 capture). Agent delegations are not AskUserQuestion calls; not counted.
- Step 1.5 type-classification in capture-problem (technical vs user-business) was silently classified per `feedback_silent_classify_obvious_capture_type.md` (description signal was obvious: script bug). Not fired, not counted.
- Step 2b detection of push-watch SIGPIPE quirk was silently routed to ticket creation via /wr-itil:capture-problem per P148 anti-pattern guard and the no-pitching memory. Framework-resolved decision (real detection, real fix-path, ticket-worthy), not asked.
