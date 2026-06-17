# Problem 096: work-problems orchestrator re-selects direction-blocked tickets as highest-WSJF every loop, producing no-op skips until the user answers

**Status**: Open
**Reported**: 2026-06-17
**Priority**: 3 (Medium). Impact: 3 x Likelihood: 1 (deferred: re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: M (deferred: re-rate at next /wr-itil:review-problems)
**JTBD**: JTBD-006
**Persona**: plugin-developer

## Description

In the AFK `/wr-itil:work-problems` loop, a ticket carrying an unanswered cat-1 direction question (e.g. P081, P072 this session) is still selected by Step 3 as the highest-WSJF actionable ticket on the next loop, re-dispatched, and re-skipped with no progress, because a queued/unanswered direction question does not deprioritise the ticket from Step 1/Step 3 selection. The iter-2 retro flagged this and it recurred in the same session (P081 direction-blocked since 2026-06-02, re-selected 2026-06-16).

Evidence: this session's iter-2 (P081) and iter-6 (P072) both produced architect NEEDS-DIRECTION no-op skips.

Candidate fix (UPSTREAM, in the `@windyroad/wr-itil` work-problems SKILL): when a ticket has an open queued cat-1 direction question in `.afk-run-state/outstanding-questions.jsonl` (or a recorded direction-pending marker), Step 3 should skip or deprioritise it from selection until the question is answered, so the loop advances to genuinely-actionable tickets instead of re-skipping.

This is upstream-bound: the fix lives in `@windyroad/wr-itil` work-problems SKILL.md, not authorable in this consumer repo. Flag as a candidate for `/wr-itil:report-upstream`.

## Symptoms

(deferred to investigation)

## Workaround

(deferred to investigation)

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: (deferred to investigation)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Investigate root cause
- [ ] Create reproduction test

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

- Captured via /wr-itil:capture-problem (lightweight aside).
- Anti-circular-work sibling family (hang-off-check verdict PROCEED_NEW, 2026-06-17): shares the "Step 3 selection re-picks a not-actually-actionable ticket every loop" family root with P069 and P054, but the trigger here (an open queued cat-1 direction question) is named by neither candidate, and neither is a multi-phase master. Defer family consolidation to next /wr-itil:review-problems cluster pass.
  - P069 (`docs/problems/open/069-work-problems-orchestrator-wsjf-ranking-does-not-factor-placement-authority.md`): distinct trigger, upstream-blocked tickets keyed on `## Reported Upstream` markers.
  - P054 (`docs/problems/open/054-work-problems-skip-just-worked-known-error-pending-push.md`): distinct trigger, just-worked Known Error awaiting push.
- Upstream-bound: candidate for /wr-itil:report-upstream against `@windyroad/wr-itil`.
