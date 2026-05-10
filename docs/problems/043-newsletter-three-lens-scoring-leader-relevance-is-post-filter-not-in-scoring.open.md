# Problem 043: /wr-newsletter three-lens scoring lets non-leader-actionable items through; persona relevance is post-filter, not in scoring

**Status**: Open
**Reported**: 2026-05-01
**Priority**: 16 (Significant). Impact: Significant (4) x Likelihood: Likely (4) (re-rated 2026-05-10 per ADR 027: three-lens leak past gate is newsletter content quality at gate, L4 Significant)
**Effort**: M
**WSJF**: (16 x 1.0) / 2 = 8.0 (folklore weight 2.0 dropped per ADR 027)

## Description

The current three-lens filter (`.claude/skills/wr-newsletter/assets/three-lens-filter.md`) scores yes/no on Technical / Operational / Human dimensions, then keeps candidates with yes on ≥2 lenses. The persona's leader-relevance only kicks in as a third-tier qualifier in step 5: "no-map-anchor but all-three-lens AND significant for the Engineering Leader persona."

The result: map-anchored items pass on 2 lenses without ever asking "what should a leader do about this?" The 2026-05-01 initial slate contained the OpenAI cluster, Anthropic regional, and Google-Pentagon, all 2-3 lens scores on map-anchor grounds, all without concrete leader action this week.

User challenged the slate: "are these the ones most relevant to IT leaders?", forcing a reassessment that dropped 3 items and added 2 new ones.

## Symptoms

- 2026-05-01 Edition 3 initial shortlist had 3 of 6 items with no concrete leader-action; user reassessment dropped them
- Reassessment cost: full step 10 capture re-run, drafter rework on 3 items
- Same root cause as P016 (filter drops significant stories) but inverted axis: filter passes insignificant stories

## Workaround

User performs post-filter "is this leader-actionable this week, this quarter, this year?" challenge during step 10 capture. Manual; recurring.

## Root Cause Analysis

### Root Cause

The three-lens definitions are loose enough to admit non-leader-action stories. "Operational" passes on "concrete implication for how engineering teams build, deploy, test, or secure software", true of most tier-1 vendor announcements regardless of whether a leader has anything to do.

### Fix Strategy

User has named the desired direction: **incorporate leader-relevance into the scoring system, not as a post-filter**. Three options under consideration:

**Option A** (4th explicit lens): keep T/O/H, add a 4th "Leader Action" lens (yes if there is a concrete action the leader should take this quarter, procurement question, capability investment, risk audit, measurement update, hiring/policy change). The action MUST be nameable as one sentence in candidate metadata. Threshold: yes on ≥3 of 4 AND yes on Leader Action.

**Option B** (rubric-based numeric scoring): each candidate scores 0-3 on Days-to-action / Action-specificity / Action-consequence / Persona-fit. Total ≥7 = full Item; 5-6 = Also-worth-noting; <5 = drop.

**Option C** (redefine each lens through leader-action): keep three lenses but tighten each to require named leader action. e.g. Technical lens: "yes if the capability change requires the leader to update a procurement, capability, or risk assumption *this quarter*."

**Recommended**: Option C + named-action metadata requirement. Closes the loophole at the lens level, minimal mechanism change. User picks the design before the next edition.

- **Kind**: improve
- **Shape**: skill (filter rubric amendment)
- **Target file**: `.claude/skills/wr-newsletter/assets/three-lens-filter.md`

## Related

- P016 (filter drops significant stories), companion ticket on the inverse axis
- This retrospective: 2026-05-01 edition retro
