# Problem 050: Assistant scope-creeps on user-flagged corrections, changing more than asked

**Status**: Verification Pending
**Reported**: 2026-05-08
**Priority**: 9 (Medium). Impact: Moderate (3) x Likelihood: Possible (3) (re-rated 2026-05-10 per ADR 027: scope-creep affects newsletter pipeline quality at pre-publish stage, L3 Moderate; recurrence 3x in one session = Possible)
**Effort**: M
**WSJF**: 0 (Verification Pending; excluded from dev-work ranking per ADR-022)

## Description

Assistant scope-creeps on user-flagged corrections. When the user asks for a specific change (FFS pattern), the assistant treats it as license to redesign adjacent surfaces beyond the literal request.

Live examples from the 2026-05-08 finalise session:

1. Tom said "use last week's cover SVG as a template". Assistant swapped content correctly but also added a third subtitle line, changed font sizes (80px on the orange line vs the template's 60px), and changed y-positions (360 / 440 vs the template's 380 / 460). Required a second pass to revert to template-exact structure.

2. Tom said "remove this pitch line FFS" (referring to the cta-description rotation). Assistant removed the line but also reshaped the entire CTA invitation (build-vs-buy product-vs-bespoke ask) without being asked to.

3. Tom said "fix the news.google links FFS". Assistant escalated through three rounds (search-query URLs, then outlet-section URLs with bracketed-link prose, then Google News redirect URLs, then finally Playwright-resolved direct article URLs). Each round added more rework than the previous request had asked for.

Pattern: assistant infers a larger redesign scope than the user requested.

## Symptoms

- Tom flagged the cover-image structural-change in his "FFS" message after the first render. Direct quote: "I said use last weeks cover svg as a template, but you changed more than just the content."
- Tom flagged the URL-fix scope-creep on the third round with "FUCK OFF. Make the links proper links to the relevant articles. Don't make the reader search."
- Tom flagged the pitch-line/CTA scope-creep with "and do a better engagnement pitch FFS" after the assistant had already removed the description line he asked about.
- Three FFS-tagged correction signals in a single session; the prior pattern (ADR-013 correction-signal hook) fired on each.

## Workaround

User flags the over-correction explicitly and waits for a second pass. Friction every correction; cumulative cost is several minutes of rework per session plus the affective load of having to police the assistant's scope.

## Impact Assessment

- **Who is affected**: every user-correction surface where the assistant is invited to fix something.
- **Frequency**: 3 instances in the 2026-05-08 finalise session alone; the recurrence rate is the strongest signal that this is a pattern, not a one-off.
- **Severity**: medium. Each instance is a corrected over-correction, not a destructive action; cumulative cost is real but bounded.
- **Analytics**: ADR-013 correction-signal hook fires each time; transcripts of the three FFS exchanges are available in the 2026-05-08 prep + finalise conversation log.

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems.
- [ ] Three-lever fix mirroring P032 and P045 discipline tickets:
  - [ ] **Lever 1 (memory)**: write a feedback memory note "smallest-change-that-satisfies-correction discipline" so future sessions read it on context-load.
  - [ ] **Lever 2 (in-prompt check)**: when a user-correction signal fires (FFS, "no don't", explicit "I said X but you did Y"), the assistant should explicitly ask itself "am I changing only what was literally asked, or am I redesigning adjacent surfaces". Add to CLAUDE.md correction-handling discipline.
  - [ ] **Lever 3 (hook)**: optional UserPromptSubmit hook that injects a one-line nudge when correction signals fire, reminding the assistant of the smallest-change discipline.
- [ ] Default: ship lever 1 (memory). Ship 2 (CLAUDE.md amendment) only if recurrence persists. Lever 3 is reserved for future repeat surfaces.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P032 (assistant writes ticket bodies without verifying), P045 (assistant accepts ticket framing without questioning). Same family of assistant-discipline gaps; the meta-pattern is "assistant infers a larger scope than the input warrants" (P032 on assertion scope, P045 on placement-claim propagation, P050 on correction-action scope).

## Related

Captured via /wr-itil:capture-problem on 2026-05-08 from the finalise session. Duplicate-check matched P032 and P045 by title keyword "assistant"; the matches are part of the same assistant-discipline family, not duplicates of this ticket. Expand investigation at next /wr-itil:review-problems pass.

## Fix Released

**Release marker:** 2026-05-12 AFK iter 3 (no project-tree commit; memory layer is outside the repo).

**Fix summary:** Lever 1 of the three-lever fix shipped per the ticket's default. New feedback memory note at `~/.claude/projects/-Users-tomhoward-Projects-windyroad/memory/feedback_smallest_change_satisfies_correction.md` directs the assistant, on any correction signal (FFS, "no don't", "I said X but you did Y", "FUCK", "wait", explicit reversal), to execute the smallest change that satisfies the literal correction. Do not redesign adjacent surfaces, retune neighbouring parameters, or reshape the structure around the corrected element. Each additional change beyond the literal request is its own scope-creep that costs another correction round. MEMORY.md index updated to surface the new note.

The memory note follows the established three-lever template applied to P032 and P045 (assistant-discipline family): ship lever 1 (memory) first; defer lever 2 (CLAUDE.md amendment) until recurrence persists; reserve lever 3 (UserPromptSubmit hook) for repeat surfaces. Reassessment trigger inlined in the memory note's tail: if scope-creep on corrections persists past 3 sessions after this memory note is in place, ship Lever 2 and re-evaluate the friction class against P032 + P045 to see if the meta-pattern needs a higher-leverage fix.

Awaiting user verification. Verification triggers on the next correction-signal turn (FFS pattern, ADR-013 correction-signal hook fires) where the assistant executes the smallest atomic change and does NOT bundle adjacent redesigns. Compose-with-P032-and-P045 means the family is partially complete: P032 (assertion scope) + P045 (placement-claim scope) + P050 (correction-action scope). The meta-pattern "assistant infers a larger scope than the input warrants" is now covered across all three observed surfaces.
