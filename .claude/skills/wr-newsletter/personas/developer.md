---
persona: developer
publication-name: Tokens Spent
target-reader: Developer (JOBS_TO_BE_DONE.md J6-J11)
draft-folder: src/newsletters/drafts/developer/
published-folder: src/newsletters/published/developer/
---

# Developer persona config: Tokens Spent

## Audience

Working engineers. Individual contributors, tech leads, staff engineers. AI tools are part of their craft. Limited time to keep up with the field, allergic to hype, capable of independent technical evaluation. Not decision-makers on consulting spend, but they tokens-vote on tools their employers eventually approve. The week's items are filtered for what helps them triage tools fast (J7), distinguish shipped from demo (J11), judge category timing (J8), and protect delivery time from hype (J10).

The default verdict for any item is **skip**. Items must earn their slot.

## Source weighting

Tier-2 (Hacker News, Reddit r/LocalLLaMA, Reddit r/MachineLearning, Simon Willison, ArXiv applied) carries the bulk of the analytical weight for this audience. Engineer-written blogs and named-engineer tool reviews land harder than vendor announcements. Tier-1 (Anthropic, OpenAI, DeepMind) is treated as one set of inputs among many, not the dominant frame; vendor copy is examined skeptically against shipped-vs-demo evidence. Tier-3 (regulatory) is generally low-priority for this audience unless the regulation directly affects what developers can ship.

Default priority: HN AI frontpage = HN AI /newest = Simon Willison = AI Daily Brief > r/LocalLLaMA > r/MachineLearning > ArXiv applied > Anthropic = OpenAI = DeepMind > Thoughtworks Radar > regulatory tier-3.

AI Daily Brief sits at the top of tier-2 for developers because it reliably surfaces societal, policy, and personnel stories (for example: attacks on AI-company executives, major AI-team departures, public-reaction events) that firehose sources like HN and Reddit bury under volume. Developer readers care because those stories shift category timing (J8) and trust signals (J11) even when they are not pure technical news.

## Three-lens weighting

Technical > operational > human. The brief leads with what changed under the hood, with operational consequence as supporting context. The human lens still appears (delivery-time pressure, tool-of-the-week fatigue, peer dynamics) but is not the headline frame.

## Voice addendum

Team voice ("we") in body, "I" only in the "From Tom" opener. Direct, evidence-led, skeptical-by-default. Developer-craft vocabulary is welcome where precise (compile, ship, branch, review, runtime, latency, tokens, context window, eval). Avoid leader-coded vocabulary (governance, posture, pipeline-as-strategy, board-level) unless the item is explicitly about org-level dynamics affecting developers.

Evidence stance is paired (J9 + J11): every item labels its source as **shipped**, **benchmarked**, **demo**, or **not yet**. Where production adopters exist, name them. Where they do not, say so honestly. ADR 015 reader-respect applies: criticise tool choices via evidence, never via implied incompetence of the reader or their team.

## Headline pattern

Per-edition unique POV-carrying H1, plus subtitle:

```
# <Unique edition title, POV-carrying, 6-12 words>

*Tokens Spent, AI engineering for developers, week ending YYYY-MM-DD*
```

## CTA

Description variants (rotate weekly):

- "Tokens Spent is the weekly signal cut for engineers who actually ship code with AI tools. We read the noise so you can spend your tokens on work that matters."
- "Tokens Spent: a working engineer's filter on the week in AI tooling. Default verdict on any tool: skip. Items here earned their slot."
- "Tokens Spent helps engineers tell shipped from demo and triage new tools in under thirty minutes. Weekly. Skeptical by default."

Invitation variants (rotate):

- "Reply with a tool you want us to pressure-test next week."
- "Forward this to an engineer who is drowning in AI announcements."
- "Reply with a tool you tried and abandoned, and why."
- "Tell us what you are actually shipping with this week."

Closing line: `windyroad.com.au` (no consulting-booking link in body; this is the brand-and-community surface, not the funnel.)

## Welcome line (first edition only)

```
About Tokens Spent: each issue cuts the week in AI tooling down to what is worth your time. Items label their evidence as shipped, benchmarked, demo, or not yet. The default verdict is skip; items here earned their slot. Published weekly, Wednesday morning, by Windy Road.
```

For edition >= 2, drop or freshly reframe; do not repeat verbatim.

## Edition counting

Determine the next edition number by reading the frontmatter `edition:` value from the highest-numbered prior edition across BOTH `src/newsletters/published/developer/` and `src/newsletters/drafts/developer/`, then incrementing by 1.

Glob shape (per ADR-039 per-date sub-directory layout for published, flat layout for drafts):

- Published: `src/newsletters/published/developer/*/<YYYY-MM-DD>.md` (the wildcard sub-directory is the publication-date directory; the basename matches the canonical brief shape).
- Drafts: `src/newsletters/drafts/developer/<YYYY-MM-DD>.md` (flat; drafts layout unchanged).

Scan only files whose basename matches the canonical brief shape `YYYY-MM-DD.md` (eight digits and dashes, then `.md`). This excludes ADR-026 sibling files (`.linkedin.md`, `.reviews.md`, `.capture.md`) and folder index files (`README.md`) by construction.

If no prior edition file exists in either folder, the next edition is 1.
