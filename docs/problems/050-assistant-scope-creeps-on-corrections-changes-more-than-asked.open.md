# Problem 050: Assistant scope-creeps on user-flagged corrections, changing more than asked

**Status**: Open
**Reported**: 2026-05-08
**Priority**: 3 (Medium). Impact: 3 x Likelihood: 1 (deferred, re-rate at next /wr-itil:review-problems)
**Effort**: M (deferred, re-rate at next /wr-itil:review-problems)

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
