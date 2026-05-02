# Problem 036: /wr-newsletter drafter leaks editorial-process meta-commentary into reader-facing body

**Status**: Open
**Reported**: 2026-05-01
**Priority**: 12 (Significant). Impact: Moderate (3) x Likelihood: Almost certain (4)
**Effort**: S
**WSJF**: (12 x 2.0) / 1 = 24.0 (weight 2.0: newsletter is primary repo activity per 2026-05-02 direction)

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
