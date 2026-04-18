---
persona: leader
publication-name: The Shift
target-reader: Engineering Leader (JOBS_TO_BE_DONE.md J1-J4)
draft-folder: src/newsletters/drafts/leader/
published-folder: src/newsletters/published/leader/
---

# Leader persona config: The Shift

## Audience

Engineering Leaders. CTOs, Heads of Engineering, VPs of Engineering at mid-to-large organisations. Decision authority over consulting engagements. Read for governance, risk, and team capability framing. They want to understand operational consequence and what to do about it, not the underlying technical mechanics. The week's items are filtered for what affects delivery pipelines, security posture, and patch fitness.

## Source weighting

Tier-1 (Anthropic, OpenAI, DeepMind) carry the bulk of the analytical weight. Major-vendor announcements drive map updates and the week's theme. Tier-2 (Hacker News AI, Simon Willison, Thoughtworks Radar, ArXiv) provide depth and counter-evidence. Tier-3 (regulatory: OAIC, EU AI Act, NIST, FTC, OECD) is high-priority for this audience. Reddit signals are background noise for this persona.

Default tier-1 priority: Anthropic = OpenAI = DeepMind > HN > Simon Willison > Thoughtworks Radar > ArXiv > Reddit.

## Three-lens weighting

Human > operational > technical. The brief leads with what it means for the team, the org, the delivery process. Technical detail is supporting evidence, not the headline.

## Voice addendum

Team voice ("we") in body, "I" only in the "From Tom" opener. Direct, specific, governance-oriented. Frame items as conditions in the industry, not as judgements of the reader's team (ADR 015). Patch-fitness vocabulary is welcome ("dependency staleness", "patch cycle", "review pipeline"). Avoid pure dev-craft jargon (compile-time, monad, type variance) unless the item is unambiguously about that.

## Headline pattern

Per-edition unique POV-carrying H1, plus subtitle:

```
# <Unique edition title, POV-carrying, 6-12 words>

*The Shift, AI engineering, week ending YYYY-MM-DD*
```

## CTA

Description variants (rotate weekly):

- "Windy Road runs Patch Fitness Assessments for engineering teams: one-week audits that leave you with a prioritised fix list and working guardrails."
- "Windy Road helps engineering leaders keep their pipelines patch fit as the pace of change picks up: assessments, working guardrails, and hands-on remediation."
- "Windy Road works with engineering teams that need to move faster without breaking things: audits, guardrails, shipped fixes."

Invitation variants (rotate):

- "Reply with what is breaking on your stack this quarter."
- "Forward this to a colleague who runs an engineering team."
- "Reply with a prediction you are willing to be wrong about."
- "Tell us the conversation you are having with your CTO this week."

Closing line: `windyroad.com.au`

## Welcome line (first edition only)

```
About The Shift: each issue covers what moved in AI engineering this week, what it means for engineering leaders, and where we think the industry is going. Opinions included. Published weekly, 4-5 stories plus shorter notes.
```

For edition >= 2, drop or freshly reframe; do not repeat verbatim.

## Edition counting

Count `src/newsletters/published/leader/*.md` plus the current draft.
