# Problem 009: Content-risk review is inline self-scoring by the drafter, not a fresh-context subagent

**Status**: Verification Pending
**Reported**: 2026-04-17
**Origin**: internal
**Transitioned to Known Error**: 2026-04-25 (review pass: root cause confirmed in description; workaround = inline scoring + Tom's external review)
**Transitioned to Verification Pending**: 2026-04-25 (fix released: ADR 018 + content-risk-rubric.md + wr-content-risk-scorer agent + SKILL step 14/14-prime updated to invoke the subagent)
**Priority**: 9 (Medium). Impact: Moderate (3) x Likelihood: Possible (3)
**Effort**: M (new wr-content-risk-scorer agent + new content-risk-rubric.md + ADR 018 + SKILL step 14 update)
**WSJF**: (9 x 2.0) / 2 = 9.0
**Re-rated 2026-04-25**: Impact label corrected from Significant (3) to Moderate (3). 3 in the impact ladder is Moderate; Significant is 4. Score 9 unchanged.

## Fix Released

- ADR 018 drafted at `docs/decisions/018-content-risk-subagent.proposed.md`. Documents the shift from inline content-risk scoring to fresh-context subagent following ADR 016's pattern. Additive to ADR 012 (the gate exists) and ADR 015 (output format). Output contract pinned to ADR 015 confirmation criterion 3.
- Content-risk rubric extracted to `.claude/skills/wr-newsletter/assets/content-risk-rubric.md`. Five axes (factual, reputational, claims, attribution, reader-respect) defined as numbered checks with `low` / `medium` / `high` definitions and persona constraints from the JTBD review.
- Project-local agent created at `.claude/agents/wr-content-risk-scorer.md`. Mirrors `wr-sw-critic.md` shape: takes artifact_path + rubric_path, fresh context, no rewrites, mechanical verdict, output format pinned by ADR 015.
- SKILL.md step 14 (and 14-prime) updated to invoke the agent instead of inline scoring. Same downstream artifact structure (step 16 save logic unchanged).
- Stale references cleaned up: SKILL.md line 655 follow-up annotated as landed; `wr-sw-critic.md` line 102 updated from "inline in the skill" to reference the subagent and ADR 018.

**Verification trigger**: next live `/wr-newsletter` run when the subagent is exercised against a real draft. Pass criterion: subagent emits the `CONTENT_RISK:` block in the ADR 015 criterion 3 byte-stable format and the verdict matches Tom's editorial judgement to within one axis level. Task 5 (re-score a prior week's draft) deferred to live run rather than fixture-based validation.

## Description

ADR 012 established voice and content-risk review gates. The voice gate is a subagent call (`wr-voice-tone:agent`); the content-risk gate is still inline self-scoring by the drafter. Per ADR 016, self-critique suffers from confirmation bias because the context that produced the draft has already reconciled its weaknesses. That argument applies equally to content-risk: the drafter scored its own reputational, claims, factual, attribution, and reader-respect risks throughout the 2026-04-17 session, and the scores were adequate but not independent.

## Symptoms

- `.claude/skills/wr-newsletter/SKILL.md` step 12 instructs the drafter to emit a `CONTENT_RISK:` block inline as part of drafting
- No fresh-context subagent evaluates the draft for the five content-risk axes
- Reader-respect in particular was caught by the voice gate (subagent) or by Tom's external review, not by the content-risk inline score, even on passages where content-risk should have flagged reputational=medium or reader-respect=high

## Workaround

Inline scoring still produces a machine-readable block that downstream steps consume. It just does not catch its own confirmation bias. External review (Tom) acts as the de-facto subagent substitute.

## Impact Assessment

- **Who is affected**: draft quality; every weekly issue's content-risk axis is under-scored
- **Frequency**: every issue
- **Severity**: Medium. Not catastrophic because voice and critic gates plus Tom's review catch most reputational/reader-respect failures. But the confirmation-bias risk argues for the same subagent-isation applied to the critic.

## Root Cause Analysis

### Root Cause

ADR 012 accepted content-risk scoring as inline because, at walking-skeleton time, the specialists existed for voice but not for content-risk. A dedicated `wr-content-risk-scorer` skill was named in ADR 012 as a follow-up. It has not been built.

### Fix Strategy

Subagent-ise the content-risk gate:

1. Draft a new project-local agent at `.claude/agents/wr-content-risk-scorer.md` that takes an artifact path and returns the `CONTENT_RISK:` block in the exact format SKILL step 12 currently expects.
2. Agent scores the five axes (factual, reputational, claims, attribution, reader-respect) in a fresh context, seeing only the artifact and the rubric (`.claude/skills/wr-newsletter/assets/content-risk-rubric.md`, new).
3. Amend ADR 012 or draft a new ADR (017?) to document the shift from inline scoring to subagent-scoring.
4. Update SKILL step 12 to invoke the agent.

Depends on problem 007 being documented so future contributors understand the session-restart bootstrap requirement.

### Investigation Tasks

- [x] Decide whether to draft ADR 017 (new) or amend ADR 012 (existing) for the subagent-isation. Decision (2026-04-25): drafted **ADR 018** (017 was already taken by the phase-split per P018). Reasoning: ADR 012 is a category decision (gates exist); ADR 018 is a narrower decision (how the gate runs). ADR 016 set the additive-not-superseding precedent.
- [x] Write `content-risk-rubric.md` making the five-axis scoring criteria explicit. Created at `.claude/skills/wr-newsletter/assets/content-risk-rubric.md`.
- [x] Draft `wr-content-risk-scorer` agent definition. Created at `.claude/agents/wr-content-risk-scorer.md`.
- [x] Update SKILL step 14 (formerly step 12 before ADR-017 phase restructuring) to invoke the agent. Updated step 14 + step 14-prime variant.
- [ ] Re-score a prior week's draft with the subagent to validate the output matches inline scoring within 1 axis of difference. **Deferred** to next live `/wr-newsletter` run as the verification trigger.

## Related

- `.claude/skills/wr-newsletter/SKILL.md` (step 12)
- ADR 012 (AI-generated content review gates)
- ADR 015 (reader-respect, fifth content-risk axis)
- ADR 016 (SW-critic subagent pattern; precedent for subagent-isation rationale)
- Problem 008 (broader review-gate gaps)
