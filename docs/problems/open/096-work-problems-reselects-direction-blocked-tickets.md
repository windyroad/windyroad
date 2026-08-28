# Problem 096: work-problems orchestrator re-selects direction-blocked tickets as highest-WSJF every loop, producing no-op skips until the user answers

**Status**: Open
**Reported**: 2026-06-17
**Priority**: 6 (Medium). Impact: Minor (2) x Likelihood: Possible (3) (re-rated 2026-07-15 review: recurs each AFK session holding direction-blocked tickets; iter waste observed 2026-06-16/17 plus the P084 interactive-only variant)
**Origin**: internal
**Effort**: M (upstream work-problems Step 3 selection change)
**WSJF**: 3.0 = (6 x 1.0) / 2

## Description

In the AFK `/wr-itil:work-problems` loop, a ticket carrying an unanswered cat-1 direction question (e.g. P081, P072 this session) is still selected by Step 3 as the highest-WSJF actionable ticket on the next loop, re-dispatched, and re-skipped with no progress, because a queued/unanswered direction question does not deprioritise the ticket from Step 1/Step 3 selection. The iter-2 retro flagged this and it recurred in the same session (P081 direction-blocked since 2026-06-02, re-selected 2026-06-16).

Evidence: this session's iter-2 (P081) and iter-6 (P072) both produced architect NEEDS-DIRECTION no-op skips.

**New trigger variant (2026-06-27, P084 iter):** the family also catches tickets that are NOT blocked by a queued cat-1 direction question but by needing an interactive-only authoring surface. P084's substance is Tom-pinned (no open direction question), yet it cannot complete AFK because its Fix Strategy requires authoring a new ADR-040 via `/wr-architect:create-adr` (AskUserQuestion-bound) plus a `human-oversight` marker that cannot be fabricated AFK. The architect ruled the migration, sibling ADR, and amendments are one related cluster, so no partial commit could land. P084's own Investigation Task line 65 already declared the create-adr dependency at capture time, so Step 3 could have pre-filtered it as not-AFK-actionable before dispatch. Generalised trigger for the family: a ticket whose Fix Strategy names an interactive-only skill (`/wr-architect:create-adr`, `/wr-jtbd:update-guide`, any AskUserQuestion-bound authoring surface) as a non-optional step is not AFK-actionable and should deprioritise from Step 3 selection in AFK mode until an interactive session clears it.

**Third variant, and the most direct one (2026-08-29, P128 iter):** the ticket said so itself and was selected anyway. P128's `## Dependencies` section has carried the sentence *"Do not re-select this ticket AFK at all"* since 2026-08-23, together with the two reasons it will not clear on its own. Step 3 selected it as the top of the queue at WSJF 16.0 regardless, because selection reads WSJF, status and the marker set it knows about, and a ticket's own recorded unselectability is none of those. The iteration was not wasted (it corrected stale claims in the ticket and found a third blocker), but it produced no fix, which is what the sentence was there to predict. The two variants above are inferences the orchestrator could have drawn from a ticket's contents; this one is an instruction it could have read. That suggests a cheaper detection than either: a marker a ticket can carry to opt itself out of AFK selection, checked the way `wr-itil-is-close-blocked` is checked before a close.

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

**Anchoring: JTBD-400 (Trust what the loop did while I was away), Internal Maintainer persona.** The header lines carried at capture, `**JTBD**: JTBD-006` and `**Persona**: plugin-developer`, have been removed. Both are upstream `agent-plugins` values that leaked in; `plugin-developer` is not one of this repo's five personas, and local JTBD-006, written here on 2026-08-09 on direction given the day before, is an Engineering Leader reader job about navigating an edition, so the citation resolved to something real and unrelated. This ticket is close to the centre of JTBD-400: it is the loop spending an iteration on a ticket it cannot advance, discovering the block, and reporting a skip, which is the job's fifth outcome, that the cost of checking is proportionate to the value returned. The job's own Evidence cites the archived briefing line about exactly this re-selection. The fix site is upstream and already filed, so [JTBD-402](../../jtbd/internal-maintainer/JTBD-402-land-the-fix-where-the-defect-lives.proposed.md) governs how it lands. The persona and job were `human-oversight: unconfirmed` when this was written, which is why the line used to call the anchoring provisional; both carry `human-oversight: confirmed` with `oversight-date: 2026-08-09`, verified on disk 2026-08-29, so the caveat is dropped. Recorded in prose rather than `**JTBD**` / `**Persona**` header lines, per local convention.

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/318
- **Reported**: 2026-07-03
- **Template used**: structured default (problem-shaped)
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes
