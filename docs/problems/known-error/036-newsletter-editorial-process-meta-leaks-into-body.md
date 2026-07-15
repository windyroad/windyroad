# Problem 036: /wr-newsletter drafter leaks editorial-process meta-commentary into reader-facing body

**Status**: Known Error
**Reported**: 2026-05-01
**Origin**: internal
**Released**: 2026-05-07
**Priority**: 6 (Medium). Impact: Moderate (3) x Likelihood: Unlikely (2) (re-rated 2026-07-15 flip-back: interim banned-pattern rule shipped; one observed recurrence 2026-05-08)
**Effort**: M (fix strategy proposes a dedicated editorial-meta-detector agent)
**WSJF**: 6.0 = (6 x 2.0) / 2

## Fix released (2026-05-07)

Added "No editorial-process meta-commentary in body copy" rule to step 11 voice rules of `.claude/skills/wr-newsletter/SKILL.md`, with five banned-pattern categories (corroboration assurance, editorial-cycle time-window tags, evidence-stance hedge prose ABOUT the rating system, business-state disclosure, surfacing-attribution prose, self-referential editorial commitment) and explicit examples of each.

**JTBD constraint honoured**: the rule wording explicitly distinguishes (a) the evidence-stance LABELS themselves ("shipped", "benchmarked", "demo", "not yet", "varied widely") which are JTBD-205 + ADR-019 + P035 REQUIRED and are NOT banned, from meta-prose ABOUT the labels which IS banned; and (b) outlet names in Source lines / inline citations pointing at verifiable URLs which are JTBD-205 + JTBD-203 + content-risk-rubric check_4 REQUIRED and are NOT banned, from editorial-process narration in body sentences which IS banned. Per JTBD review feedback, both distinctions are in the rule prose so the executor does not over-apply.

**Interim discipline pattern, mirroring ADR-019**: the rule lives in SKILL.md prose (not a subagent) because the inline drafter reads the SKILL prose as its working instructions; promoting to a fresh-context subagent would lose access to the in-session AskUserQuestion conversation history that the drafter relies on.

**Reassessment trigger**: if Tom logs more than one editorial-meta correction per edition for the next 4 editions after this rule lands, escalate to a detector subagent (`wr-newsletter:editorial-meta-detector`, suggested by this ticket's original Fix Strategy). Counted from the first edition run against this rule (next prep run, 2026-05-07).

Architect: ALIGNED-WITH-FOLLOWUPS (interim discipline rule acceptable on a discipline failure; ADR-019 sets precedent; pair with reassessment trigger).
JTBD: PASS (JTBD-205 evidence labels and JTBD-203 attribution requirements honoured by the explicit carve-out wording).

Verification triggers on tonight's `/wr-newsletter phase=prep` run: examine the prep `.prep.md` body for any of the five banned patterns. Tomorrow's `phase=finalise` re-runs the voice gate; manual reading of the brief body should confirm zero editorial-meta corrections.

## Description

The drafter inserts editorial-process language that doesn't belong in reader-facing copy. Recurring patterns observed across multiple 2026-05-01 editing rounds:

- Corroboration assurance: "(corroborated across LA Times, CNBC, and Business Insider, week of April 20)"
- Editorial-time tags: ", week of April 28.", "the same week", "surfaced via Simon Willison and Hacker News on April 30"
- Evidence-stance hedges: "(qualitative observation, no published comparative benchmarks cited here)"
- Business-state disclosure: "Tom is currently in a full-time engineering role, so the Windy Road consulting practice is fully booked"
- Self-referential commitment: original "test theatre" framing surfaced as "I call that test theatre" (process artefact rather than reader-facing claim)

User had to flag each pattern manually with "remove this", "we don't need to assure the reader", "you shouldn't say this part out loud."

## Symptoms

- 2026-05-01 Edition 3 had 5+ separate editorial-process-meta corrections from user during finalise
- Pattern recurs across editions: 2026-04-24 prep had similar inline "(via Stratechery)" / "(per The Register)" framings that user trimmed manually
- Voice gate (step 13) does not flag these, they don't violate ADR 010 (team voice), ADR 015 (reader-respect), or em-dash hook

## Workaround

User manually identifies and corrects each instance. Adds session-cost; recurs every edition.

## Root Cause Analysis

### Root Cause

The drafter blends fact + provenance + editorial-process into single sentences because the source-fetch + capture-transcript both surface "where we got this" alongside "what happened". The drafter then includes both in the body. Voice rules don't have an explicit "no editorial-process meta-commentary in body copy" clause.

### Fix Strategy

- **Kind**: create
- **Shape**: agent
- **Suggested name**: `wr-newsletter:editorial-meta-detector`
- **Scope**: Subagent that scans body copy for editorial-process language patterns (corroboration assurance, surfacing-attribution prose, time-window tags, evidence-stance hedges, business-state disclosure). Returns flagged passages with quoted text and suggested rewrite. Run alongside or as part of the voice gate (step 13).
- **Triggers**: regex / pattern match on phrases like `corroborated across`, `surfaced via`, `(week of`, `qualitative observation`, `(per <outlet>)`, `(via <outlet>)` in body copy.
- **Prior uses**: 5+ corrections from user in 2026-05-01 finalise; recurring pattern across editions.

## Related

- ADR 015 (reader-respect)
- This retrospective: 2026-05-01 edition retro

## Flip-back to Known Error (2026-07-15)

Flipped back from Verification Pending per the P186 Bucket 3 rule: an observed-regression cell must not sit in the Verification Queue as a closure candidate. Recurrence citation: the 2026-05-08 retro flagged editorial-meta leakage recurring in the interim period after the banned-pattern rule shipped. The fix needs reinforcement (the proposed editorial-meta-detector agent was never built). Recovery: /wr-itil:transition-problem 036 verifying once the reinforced fix ships.
