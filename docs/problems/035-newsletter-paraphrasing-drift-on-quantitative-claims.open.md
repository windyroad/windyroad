# Problem 035: /wr-newsletter drafter paraphrases quantitative claims away from source

**Status**: Open
**Reported**: 2026-05-01
**Priority**: 16 (Significant). Impact: Major (4) x Likelihood: Likely (4)
**Effort**: S
**WSJF**: (16 x 2.0) / 1 = 32.0 (weight 2.0: newsletter is primary repo activity per 2026-05-02 direction)

## Description

The drafter paraphrases quantitative claims into superficially similar but semantically wrong statements. Example from 2026-05-01 edition Item 2: "an engineer asked an AI to count the carbohydrates in a recipe 27,000 times and got 27,000 different answers."

The actual source (Diabettech, "I Asked AI to Count My Carbs 27,000 Times") reports:
- 26,904 total queries (not 27,000)
- Across 4 AI models on food photos (not "a recipe")
- Estimates varied widely (not "27,000 different answers", answers were inconsistent across queries, but no claim of 27,000 distinct values)
- Worst case: paella photo, 55g-484g range across 500+ queries

The drafter's output is plausible-sounding but factually wrong on the specific numbers.

## Symptoms

- 2026-05-01 Edition 3, Item 2 paraphrasing fact-checked post-publish via Playwright fetch + fresh-context subagent
- Pattern: drafter rounds, simplifies, or rephrases quantitative claims; result diverges from source
- Capture-fidelity rule (P015 + ADR 019) covers preserving Tom's adjust text but does not cover preserving source-article quantitative claims

## Workaround

Manually fact-check every quantitative claim against source before save. Same fresh-context subagent verification as P034 catches this (the article body comparison surfaces the drift).

## Root Cause Analysis

### Root Cause

The drafter inherits the news fetch's one-sentence summary and elaborates from there, which is fine for narrative but lossy for numbers. The skill's voice rules ("Direct, specific, confident. Name the org, name the artifact, name the date.") encourage specificity but do not constrain it to source-faithful values.

### Fix Strategy

- **Kind**: improve
- **Shape**: skill (step amendment)
- **Target file**: `.claude/skills/wr-newsletter/SKILL.md` step 11 + capture-fidelity rule
- **Edit summary**: Extend P015 capture-fidelity to source-article quantitative claims. When the brief cites a number, percentage, count, or quantitative range, the drafter MUST fetch the source URL and verify the value verbatim. Solved as a side-effect of the P034 URL-verification gate (the fresh-context subagent that verifies semantic match would also catch quantitative drift).

## Related

- P034 (companion: URL verification step)
- This retrospective: 2026-05-01 edition retro
