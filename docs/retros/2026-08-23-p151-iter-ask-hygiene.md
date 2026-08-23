# Ask Hygiene, 2026-08-23 (P151 AFK iter)

Iteration: `/wr-itil:work-problems` dispatching P151 (Prescribed newsletter gates can skip a phase entirely and nothing detects the absence).

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | (none) | (none) | No `AskUserQuestion` was invoked. The iteration ran under the AFK orchestrator, whose contract forbids it; every decision that would have warranted one was queued to `outstanding_questions` instead. |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

Two decisions were queued rather than asked, both direction-setting in shape: the story-map the `wr-itil-check-fix-rfc-trace` predicate asked for at exit 3, and the standing residual that this repo's test suite is gated nowhere (captured as P157 so it does not depend on the queue being read).
