# Developer newsletter concept

A second Windy Road weekly newsletter, separate from The Shift, targeting the Developer persona (J6-J11 in `docs/JOBS_TO_BE_DONE.md`). Brand and community play, no direct commercial offer. This doc captures the concept decisions so the Stage 3 walking skeleton can be built against a fixed target.

## Why a second newsletter

The Shift serves Engineering Leaders (J1-J4): operational risk, governance, patch velocity, delivery pipeline. Developers read different signals and act on different timescales. Their pain is not "my team's patch cycle is too slow"; it is "I cannot tell what to trust this week, and the hype-to-signal ratio is punishing my delivery time."

Serving developers well is how Windy Road earns credibility at the engineer level so later Engineering Leader engagements arrive already de-risked. Developers tokens-vote on tools; Engineering Leaders eventually approve what developers converge on. That is the upstream influence channel JTBD documents in the Developer persona's "Relationship to other personas" section.

No commercial offer is pitched to this audience. Commercial return, if any, is indirect.

## Point of view

Trust and epistemics first. The week's AI news is filtered through three questions:

1. **Is this shipped or is this a demo?** (J11 Trust Shipped vs Demo paired with J9 Peer Validation. Named production adopters, named counter-patterns, honest "not yet" when the case is absent.)
2. **What would a working engineer actually decide this week because of it?** (J7 Tool Triage: go/no-go in under 30 minutes of reading. J8 Category Timing: adopt, pilot, watch, or skip.)
3. **Does this earn your time, or is it noise dressed as signal?** (J6 Signal from Noise: the default is skip; items must earn their slot.)

J10 Experiment vs Delivery Boundary appears in intros and in the "From Tom" opener when the week's theme is about protecting delivery time from the tool-of-the-week churn.

Style implications:
- Reader-respect clause (ADR 015) applies without weakening. Developers are not the enemy. Calling a developer's current tool a mistake is the equivalent disparagement we refused to ship in The Shift's launch issue. Criticise tool choices via evidence, never via implied incompetence.
- Team voice (ADR 010). Body copy uses "we", not "I". The "From Tom" opener may use "I" because it is named author voice, matching The Shift's convention.
- The Wardley map (ADR 014) stays internal substrate. It informs item selection and category timing but is never named in reader copy. Developer readers see the conclusions, not the map vocabulary.

## Publication shape

- **Platform:** LinkedIn native newsletter, separate subscription from The Shift. Subscribers opt in specifically to this publication; no cross-posting of developer editions into The Shift's subscriber base.
- **Cadence:** weekly, published Wednesday morning AEST. Hits US East coast on Tuesday evening local time, EU on Wednesday morning local, AU on Wednesday morning local. Tuesday and Wednesday mornings are the strongest slots for developer-audience LinkedIn content; Friday performs poorly (tabs closed), weekends shift engagement to HN and Reddit.
- **Length:** same ten-minute read target as The Shift. Minimum three items per edition; no upper cap.
- **Item format:** headline, one-sentence what-happened with attribution, one-sentence why-it-matters for someone shipping code, one-sentence evidence stance (shipped, benchmarked, demo, or not yet), inline source links on claim text. Same formatting rules as The Shift (sub-bullet multi-event what-happened, sentences under about 25 words, sources one-per-line).
- **CTA:** community and subscribe loop. Examples: "Subscribe for the weekly signal cut", "Send a tool we should pressure-test next week". No consulting booking link in the body.
- **Title per edition:** unique POV-carrying H1, same rule as The Shift. Publication name and date live in the subtitle.

## Name

**Tokens Spent.**

Locked after independent strengths/weaknesses critique across nine candidates (Signal, Tokens Spent, Ship It?, The Patch Notes, Shipping Lane, Mile Markers, Fork in the Road, Roadcraft, The Toolbox). Tokens Spent was the only candidate that carried the publication's POV in the name itself: attention as a finite budget, tokens-vote as the persona-defining developer behaviour. It is also distinct in the AI/dev publication landscape (no major existing publication owns the phrase).

Trade-offs accepted:
- Headline awkwardness on "This week in Tokens Spent". Workaround: edition titles use the same per-issue POV-carrying H1 convention as The Shift, so the publication name appears in subtitle position, not headline position.
- Brand-tied alternatives (The Patch Notes, Roadcraft, Mile Markers) rejected. The Patch Notes had the best brand fit (patch-fitness) but heavy collision with existing gaming and infosec "Patch Notes" newsletters reduces SEO discoverability and risks readers parsing "patch" as the leader-serving practice rather than the dev publication.

Trade-offs preserved as future alternatives if cold-launch metrics show poor recognition: In Production (names shipped-vs-demo stance directly), Pressure Test (echoes the CTA copy and skeptical-default POV).

## Skill mechanism

Mode flag on the existing `/wr-newsletter` skill, not a second skill. Persona argument at step 0 selects an audience config bundle:

- sources weighting (developer bundle weights Hacker News, engineer-written blogs, named-engineer tool reviews, and peer Discord/Reddit signals more heavily than Anthropic and HN AI-filter alone)
- rubric emphasis across the three lenses (technical > operational > human for developer; human > operational > technical for leader)
- voice guide pointer (same `docs/VOICE-AND-TONE.md` but with a persona-specific addendum for CTA tone and author voice)
- CTA copy (community/subscribe for developer, consulting booking for leader)

Drafts land in `src/newsletters/drafts/<persona>/YYYY-MM-DD.md`, for example `src/newsletters/drafts/developer/2026-04-22.md`.

Everything else is reused as-is from The Shift's pipeline:

- three-lens filter (technical, operational, human)
- critic, voice, content-risk review gate order (ADR 016)
- per-item AskUserQuestion voice capture (Agree / Adjust / Drop)
- Wardley map as internal substrate (ADR 014)
- reader-respect clause and gate-rejection policy (ADR 015)
- per-edition unique title, inline source links, sub-bullet what-happened for multi-event items

## What changes per persona

| Dimension | The Shift (leader) | Developer newsletter |
|-----------|-------------------|---------------------|
| Audience | Engineering Leaders (J1-J4) | Developers (J6-J11) |
| POV | Patch fitness, governance, delivery risk | Trust, tool triage, delivery-time protection |
| Primary jobs | J1 Awareness, J2 Engagement | J6 Signal, J7 Triage, J11 Trust |
| Three-lens weighting | human > operational > technical | technical > operational > human |
| Evidence stance | Business consequence framing | Shipped vs demo framing (J9 + J11 paired) |
| CTA | Book a fit-check call | Subscribe, reply with tools to pressure-test |
| Publication day | (current Shift slot) | Wednesday morning AEST |

The Wardley map, critic rubric, voice and content-risk gates, and the walking-skeleton pipeline architecture are shared unchanged.

## Walking skeleton boundary for Stage 3

What Stage 3 delivers:
- Persona argument added to `/wr-newsletter` SKILL frontmatter and step 0
- Audience config bundles under `.claude/skills/wr-newsletter/personas/<persona>.md` (developer and leader)
- Drafts subdirectory per persona: `src/newsletters/drafts/<persona>/`
- Per-persona CTA block in the draft template
- First developer edition drafted end-to-end, passing all gates, saved to `src/newsletters/drafts/developer/YYYY-MM-DD.md`

What Stage 3 does not deliver:
- A new LinkedIn publication setup (Tom does that manually on LinkedIn; there is no automation)
- Crossposting between the two newsletters (explicitly excluded)
- Migration of existing The Shift drafts into a leader subfolder (handled later as a one-time operational move)
- Unique cover art for the developer newsletter (follow-up once name is locked)
- Archive on windyroad.com.au (layer 7 of the overarching PLAN.md)

## Related

- `docs/JOBS_TO_BE_DONE.md` Developer persona, jobs J6-J11
- `docs/ai-engineering-brief/PLAN.md` overarching walking-skeleton plan
- `docs/VOICE-AND-TONE.md` voice rules (inherited; developer addendum may extend, not replace)
- ADRs 010 (team voice), 011 (skill orchestration), 012 (review gates), 013 (no LinkedIn scraping), 014 (Wardley lens), 015 (reader-respect and gate rejection), 016 (critic subagents and iteration loop)
- Memory: `feedback_blocking_tools_is_a_signal`, `feedback_per_item_interactive_voice`, `feedback_map_is_internal_only`
