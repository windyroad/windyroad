---
persona: leader
publication-name: The Shift
target-reader: Engineering Leader (JOBS_TO_BE_DONE.md J1-J4)
draft-folder: src/newsletters/drafts/leader/
published-folder: src/newsletters/published/leader/
publish-day: Monday
publish-timezone: Australia/Sydney
---

# Leader persona config: The Shift

## Audience

Engineering Leaders. CTOs, Heads of Engineering, VPs of Engineering at mid-to-large organisations. Decision authority over consulting engagements. Read for governance, risk, and team capability framing. They want to understand operational consequence and what to do about it, not the underlying technical mechanics. The week's items are filtered for what affects delivery pipelines, security posture, and patch fitness.

## Source weighting

Tier-1 (Anthropic, OpenAI, DeepMind) carry the bulk of the analytical weight. Major-vendor announcements drive map updates and the week's theme. Tier-2 (Hacker News AI, Simon Willison, Thoughtworks Radar, ArXiv) provide depth and counter-evidence. Tier-3 (regulatory: OAIC, EU AI Act, NIST, FTC, OECD) is high-priority for this audience. Reddit signals are background noise for this persona.

Default tier-1 priority: Anthropic = OpenAI = DeepMind > HN > Simon Willison = AI Daily Brief > Thoughtworks Radar > ArXiv > Reddit.

AI Daily Brief sits high for leaders because it reliably surfaces societal, policy, and personnel stories (for example: attacks on AI-company executives, regulatory developments, major hires) that tier-1 vendor feeds never cover. Those are J1-relevant context for an Engineering Leader audience.

## Three-lens weighting

Human > operational > technical. The brief leads with what it means for the team, the org, the delivery process. Technical detail is supporting evidence, not the headline.

## Voice addendum

Team voice ("we") in body, "I" only in the "From Tom" opener. Direct, specific, governance-oriented. Frame items as conditions in the industry, not as judgements of the reader's team (ADR 015). Patch-fitness vocabulary is welcome ("dependency staleness", "patch cycle", "review pipeline"). Avoid pure dev-craft jargon (compile-time, monad, type variance) unless the item is unambiguously about that. Prefer plain words over obscure ones in this register: "probably made up" over "apocryphal", "made up" over "fabricated".

On the human-in-the-loop question, follow the codified editorial stance in `assets/three-lens-filter.md`: humans ratify architecture and product-direction decisions, automated gates and evals carry code-level quality, so do not frame human code review as the answer to AI-generated code.

## Headline pattern

Per-edition unique POV-carrying H1, plus subtitle:

```
# <Unique edition title, POV-carrying, 6-12 words>

*The Shift, AI engineering, week ending YYYY-MM-DD*
```

The `YYYY-MM-DD` in "week ending" is `<week-ending>` (the Sunday that ends the editorial week), not the Monday publish date. The Shift publishes Monday (ADR 030), so the week-ending Sunday is the publish date minus one day. Filenames still use the Monday `<publication-date>`.

## CTA

The CTA is one invitation plus the closing line only. Do NOT add a Windy Road services-description sentence (P090): the brief is a brand-and-community surface, not a sales funnel (ADR-023 funnel pause).

Write the invitation tied to this edition's thesis and built to foster conversation: a specific question only a reader who engaged with the week's items can answer. For an edition arguing the model is now the easy part, Tom chose "If the model is the easy part now, what is the hard part for your team this quarter?". This mirrors the VOICE-AND-TONE LinkedIn carve-out for substantive content-tied questions. Do NOT default to a generic prompt that could top any edition.

The variants below are a fallback well for when no edition-tied question presents itself, not the default:

- "Reply with what is breaking on your stack this quarter."
- "Forward this to a colleague who runs an engineering team."
- "Reply with a prediction you are willing to be wrong about."
- "Tell us the conversation you are having with your CTO this week."

Closing line: `windyroad.com.au`

## Welcome line (first edition only)

```
About The Shift: each issue covers what moved in AI engineering this week, what it means for engineering leaders, and where we think the industry is going. Opinions included. Published Monday mornings AEST, 4-5 stories plus shorter notes.
```

For edition >= 2, drop or freshly reframe; do not repeat verbatim.

## Edition counting

Determine the next edition number by reading the frontmatter `edition:` value from the highest-numbered prior edition across BOTH `src/newsletters/published/leader/` and `src/newsletters/drafts/leader/`, then incrementing by 1.

Glob shape (per-date sub-directory layout for published per ADR-039 and for drafts per ADR-040):

- Published: `src/newsletters/published/leader/*/<YYYY-MM-DD>.md` (the wildcard sub-directory is the publication-date directory; the basename matches the canonical brief shape).
- Drafts: `src/newsletters/drafts/leader/*/<YYYY-MM-DD>.md` (the wildcard sub-directory is the publication-date directory; the basename matches the canonical brief shape).

Scan only files whose basename matches the canonical brief shape `YYYY-MM-DD.md` (eight digits and dashes, then `.md`). This excludes ADR-026 sibling files (`.linkedin.md`, `.reviews.md`, `.capture.md`) and folder index files (`README.md`) by construction.

If no prior edition file exists in either folder, the next edition is 1.
