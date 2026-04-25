# Problem 009: Content-risk review is inline self-scoring by the drafter, not a fresh-context subagent

**Status**: Known Error
**Reported**: 2026-04-17
**Transitioned to Known Error**: 2026-04-25 (review pass: root cause confirmed in description; workaround = inline scoring + Tom's external review)
**Priority**: 9 (Medium). Impact: Moderate (3) x Likelihood: Possible (3)
**Effort**: M (new wr-content-risk-scorer agent + new content-risk-rubric.md + ADR amendment + SKILL step 12 update)
**WSJF**: (9 x 2.0) / 2 = 9.0
**Re-rated 2026-04-25**: Impact label corrected from Significant (3) to Moderate (3). 3 in the impact ladder is Moderate; Significant is 4. Score 9 unchanged.

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

- [ ] Decide whether to draft ADR 017 (new) or amend ADR 012 (existing) for the subagent-isation
- [ ] Write `content-risk-rubric.md` making the five-axis scoring criteria explicit (current rubric lives inside SKILL.md step 12 prose)
- [ ] Draft `wr-content-risk-scorer` agent definition
- [ ] Update SKILL step 12 to invoke the agent
- [ ] Re-score a prior week's draft with the subagent to validate the output matches inline scoring within 1 axis of difference

## Related

- `.claude/skills/wr-newsletter/SKILL.md` (step 12)
- ADR 012 (AI-generated content review gates)
- ADR 015 (reader-respect, fifth content-risk axis)
- ADR 016 (SW-critic subagent pattern; precedent for subagent-isation rationale)
- Problem 008 (broader review-gate gaps)
