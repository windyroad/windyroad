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

**New trigger variant (2026-06-27, P084 iter):** the family also catches tickets that are NOT blocked by a queued cat-1 direction question but by needing an interactive-only authoring surface. P084's substance is Tom-pinned (no open direction question), yet it cannot complete AFK because its Fix Strategy requires authoring a new ADR-040 via `/wr-architect:create-adr` (AskUserQuestion-bound) plus a `human-oversight` marker that cannot be fabricated AFK. The architect ruled the migration, sibling ADR, and amendments are one related cluster, so no partial commit could land. P084's own Investigation Task line 65 already declared the create-adr dependency at capture time, so Step 3 could have pre-filtered it as not-AFK-actionable before dispatch. Generalised trigger for the family: a ticket whose Fix Strategy names an interactive-only skill (`/wr-architect:create-adr`, `/wr-jtbd:update-guide`, any AskUserQuestion-bound authoring surface) as a non-optional step is not AFK-actionable and should deprioritise from Step 3 selection in AFK mode until an interactive session clears it.

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

- **Reported upstream**: https://github.com/windyroad/agent-plugins/issues/318 (2026-07-03)

- Captured via /wr-itil:capture-problem (lightweight aside).
- Anti-circular-work sibling family (hang-off-check verdict PROCEED_NEW, 2026-06-17): shares the "Step 3 selection re-picks a not-actually-actionable ticket every loop" family root with P069 and P054, but the trigger here (an open queued cat-1 direction question) is named by neither candidate, and neither is a multi-phase master. Defer family consolidation to next /wr-itil:review-problems cluster pass.
  - P069 (`docs/problems/open/069-work-problems-orchestrator-wsjf-ranking-does-not-factor-placement-authority.md`): distinct trigger, upstream-blocked tickets keyed on `## Reported Upstream` markers.
  - P054 (`docs/problems/open/054-work-problems-skip-just-worked-known-error-pending-push.md`): distinct trigger, just-worked Known Error awaiting push.
- Upstream-bound: candidate for /wr-itil:report-upstream against `@windyroad/wr-itil`.

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/318
- **Reported**: 2026-07-03
- **Template used**: structured default (problem-shaped)
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes
