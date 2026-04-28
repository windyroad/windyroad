---
status: "proposed"
date: 2026-04-17
decision-makers: [Tom Howard, Claude]
consulted: []
informed: []
reassessment-date: 2026-07-17
---

# Mandatory voice and risk review gates for AI-generated content

## Context and Problem Statement

We are adding AI-generated content to our publishing pipeline, starting with the AI Engineering Brief newsletter (ADR 011). AI can generate copy that drifts from our voice, makes unverifiable claims, paraphrases copyrighted content, or creates reputational exposure. We need a consistent policy for how AI-generated content is reviewed before it reaches any public channel, and we want the policy to apply to future AI-generated content beyond the newsletter (blog drafts, social posts, landing page copy).

## Decision Drivers

- **Reputation**: published content is permanent. A single off-voice or factually wrong issue undermines the brand Tom has spent 25 years building.
- **Trust**: readers should experience our AI-assisted content as indistinguishable from Tom's voice. Drift destroys that trust.
- **Cost**: reviews add tokens and session time. Gates must add value proportional to their cost.
- **Reuse**: we already have voice and risk specialists (`wr-voice-tone:agent`, `wr-risk-scorer:pipeline`). Reimplementing review logic would be wasteful.
- **Applies beyond newsletters**: the same policy needs to govern any future AI-generated publishable content.

## Considered Options

1. **Mandatory voice + risk review gates on every AI-generated draft before human review** (chosen). Every AI-drafted piece runs through `wr-voice-tone:agent` and a content-risk scorer before Tom sees it. Tom then does a final editorial pass.
2. **Human-only review**. Tom reads every draft without automated review gates.
3. **Post-hoc review after publication**. Publish on a fast cadence, audit and correct after the fact.
4. **Voice review only, no risk review**. Skip the risk gate on the grounds that Tom's final read catches claim and reputation issues.

## Decision Outcome

Chosen option: **"Mandatory voice + risk review gates on every AI-generated draft before human review"**, because AI-generated content has systematically different failure modes than human-generated content (subtle voice drift, plausible-sounding but wrong facts, unflagged unsupported claims), and because Tom's final read is more effective when the obvious issues are already surfaced. The specialists already exist; the marginal cost of running them is a few tokens per draft.

## Consequences

### Good

- Catches voice drift, factual issues, and reputational risk before anything reaches Tom's desk.
- Tom's final editorial review focuses on judgement calls (what's interesting, what's in scope) instead of basic compliance.
- Consistent standard across all AI-generated content.
- Review output is structured and saved alongside the draft, which feeds retrospectives (see `docs/ai-engineering-brief/PLAN.md`).

### Neutral

- Adds two extra steps to every AI-generated content pipeline. Adds time and tokens. For weekly cadence this is negligible; if we ever move to daily, we reassess.
- Risk review is a new capability. `wr-risk-scorer:pipeline` is the existing primitive but was designed for commit/push/release scoring. A content-risk adaptation may be needed; this decision records that such a scorer will be built if the existing one does not fit.

### Bad

- False positives from the gates waste Tom's time (he has to triage flags that are not real issues).
- Gates can generate false confidence. Tom still must apply final editorial judgement.
- If the specialists are updated without reviewing downstream impact on content pipelines, newsletter drafts can start failing for unrelated reasons.

## Confirmation

- Every AI-generated draft artifact (e.g. `src/newsletters/drafts/YYYY-MM-DD.md`) has a "Review results" section appended showing voice and risk verdicts.
- Drafts that fail voice review have the violations listed inline with the relevant passage.
- Drafts that fail risk review are flagged with severity (low, medium, high) and the specific claim or passage.
- Tom publishes only after the review section shows PASS or after he has explicitly overridden a flag with a reason recorded in the retrospective.

## Pros and Cons of the Options

### Mandatory voice + risk review gates (chosen)

- Good: catches AI-specific failure modes before human review
- Good: reuses existing specialists
- Good: consistent standard for all AI-generated content
- Bad: adds steps (time and tokens)

### Human-only review

- Good: simple, no tooling to build
- Bad: relies entirely on Tom noticing voice drift and claim issues in every piece
- Bad: slower per-piece and less consistent

### Post-hoc review

- Good: fastest publishing cadence
- Bad: reputational exposure is already live by the time an issue is found
- Bad: corrections carry their own credibility cost (visible retractions)

### Voice review only

- Good: cheaper per run than full gates
- Bad: leaves factual and reputational risk entirely to human review, which defeats the main point of the gates

## Reassessment Criteria

- If voice or risk specialists materially change in a way that affects their suitability for content review.
- If the review gates generate too many false positives and erode Tom's trust in the automation.
- If we add a new AI content surface (blog posts, social, landing pages) with materially different risk profile.
- After 4 weekly issues, review whether both gates are pulling their weight or whether one is consistently redundant.
