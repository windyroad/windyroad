# Problem 035: /wr-newsletter drafter paraphrases quantitative claims away from source

**Status**: Verification Pending
**Reported**: 2026-05-01
**Priority**: 16 (Significant). Impact: Major (4) x Likelihood: Likely (4)
**Effort**: S
**WSJF**: 0 (excluded; verification-pending tickets are out of dev-work ranking per ADR-022)

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

## Fix Released

Released 2026-05-02 in commit on master (no version bump; project-local skill prose is read at /wr-newsletter invocation time, so committing to master is the release event for SKILL.md changes).

Fix summary: extended `.claude/skills/wr-newsletter/SKILL.md` step 11 with a new sub-heading "Source-article quantitative-claim fidelity (P035, interim)" placed after the existing ADR-019 capture-fidelity block. The new sub-section directs the drafter to preserve counts, percentages, ratios, ranges, and currency values from the source article body verbatim, forbids rounding or tidying, forbids collapsing ranges or duplicating one value across distinct denominators, and falls back to qualitative phrasing when the article body is unavailable. The rule is framed as interim defence-in-depth that defers to ADR-024 (URL verification gate) once its confirmation criterion 1 is met (step 11.5 documented and exercised across one full prep-finalise cycle).

Architect: ALIGNED on the revised separate-sub-heading + sunset-condition framing (initial review found four issues; revised plan addressed all). JTBD: PASS (serves JTBD-200 Signal-from-Noise, JTBD-203 Peer Validation, JTBD-205 Trust Shipped vs Demo, JTBD-001 Awareness, JTBD-003 Evaluation; aligned with credential-sensitive, hype-allergic persona constraints).

Verification triggers on the next `/wr-newsletter` run that drafts a quantitative claim from a source article body. The drafter should now cite verbatim figures from article bodies, or qualitative phrases when bodies are unavailable, rather than rounding off the news-fetch one-sentence summary.

Awaiting user verification.

## Related

- P034 (companion: URL verification step). Effort M, Open. ADR-024's verification gate is the structural fix; P035 is interim drafter-prose discipline that retires when ADR-024 confirmation criterion 1 is met.
- ADR-024 (URL verification gate in /wr-newsletter), accepted 2026-05-02. Names quantitative-claim fidelity as in-scope (line 60 of the ADR).
- This retrospective: 2026-05-01 edition retro
