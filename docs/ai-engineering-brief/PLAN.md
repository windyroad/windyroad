# AI Engineering Brief: Plan

## What

A weekly automated newsletter: "The AI Engineering Brief: What happened in AI this week. What it means for your team."

Covers AI developments through three lenses:
1. **Technical**: what shipped or broke
2. **Operational**: what engineering teams need to do differently
3. **Human**: change management, psychology, sociology, workforce impact

## Why

- Engineering Leaders (primary persona) need to stay current on AI but are overwhelmed by volume
- Most AI newsletters cover pure tech or pure hype. Ours covers the human and operational impact, which is Tom's 25-year differentiator
- Builds trust and authority across ALL Windy Road offerings (not just patch fitness)
- Top-of-funnel: gives prospects a reason to follow before they need consulting

## Who

- **Author persona**: Tom Howard (Windy Road)
- **Reader persona**: Engineering Leader (CTO, Head of Engineering, VP Engineering at mid-to-large orgs)
- Voice: docs/VOICE-AND-TONE.md (team voice "we", direct, specific, confident)

## Distribution

- Primary: LinkedIn newsletter (built-in subscriber feature, zero infrastructure)
- Future: optional email list, archive page on windyroad.com.au

## Cadence

- Start weekly (prove sustainability for 4-6 weeks)
- Reassess for daily after traction is validated

---

## User Story Map

### Persona: Tom (brief author/publisher)
### Goal: "I want a weekly draft brief on my desk that I review in 5 minutes and post to LinkedIn"

### Backbone (activities left to right)

#### 1. Gather sources
- Fetch tier-1 (Anthropic news, OpenAI news, Google DeepMind blog): critical, fail the map update if any fail
- Fetch tier-2 (HN frontpage, HN /newest, Reddit r/LocalLLaMA, r/MachineLearning, Simon Willison weekly, Thoughtworks Radar, ArXiv cs.AI): important, continue on fail
- Fetch tier-3 regulatory (OAIC, EU AI Act, UK AISI, NIST AI, US FTC AI, OECD AI): regulatory signal, continue on fail
- Check src/newsletters/inbox/ for manually dropped LinkedIn links/notes (ADR 013)

#### 2. Filter candidates
- Apply the Wardley precondition (ADR 014): candidate must anchor to an observable movement on the AI Engineering Landscape map
- Score each surviving candidate on the three lenses (technical, operational, human)
- Keep candidates scoring yes on at least two lenses; include every significant candidate, minimum three, no maximum (per Tom's direction)
- Deduplicate across sources (prefer primary source over aggregators)

#### 3. Update the Wardley map
- Map-mutation gate: if any tier-1 source failed, skip steps 3 and 4 and draft against last week's map (ADR 016)
- Update `docs/ai-engineering-brief/ai-landscape.owm` with observed component movements, new components, dependency changes, or retargeted evolve arrows
- Re-render to SVG and PNG via `wr-wardley`'s `owm-to-svg.mjs`

#### 4. Update the landscape analysis
- Update `docs/ai-engineering-brief/ai-landscape.md` Differentiation / Evolution / Risk / Decisions sections to reflect what moved
- Add a "This week" note summarising the delta
- Run the SW-critic loop (ADR 016) against the Wardley artifacts, up to 3 rounds; on round-3 REJECTED, proceed to drafting and surface residual weaknesses to Tom

#### 5. Draft the brief
- The brief is commentary on what changed on the map. Each item points back to at least one map movement.
- Structure per item: What happened, Map movement, Why it matters to your team, The human angle, Source
- Minimum three items, no maximum
- Closing CTA footer from the template repertoire
- Save to src/newsletters/drafts/YYYY-MM-DD.md

#### 6. Review the draft
- Voice review (wr-voice-tone:agent) against docs/VOICE-AND-TONE.md
- Content-risk review (ADR 012 + ADR 015): five axes (factual, reputational, claims, attribution, reader-respect) with VERDICT: PASS or REJECTED
- SW-critic loop (ADR 016) against the newsletter draft, up to 3 rounds
- All three gate outputs are appended to the saved draft file alongside the map delta

#### 7. Publish
- Tom reads the draft, the gate outputs, and the map delta
- If acceptable, Tom posts to LinkedIn newsletter and moves the draft to src/newsletters/published/YYYY-MM-DD.md

#### 8. Retrospective
- Run /wr-retrospective:run-retro after each published issue
- Capture: source coverage, map-mutation quality, gate outcomes (including critic round counts and any REJECTED), filter signal strength
- Update docs/BRIEFING.md with learnings
- Create problem tickets for friction points (bad sources, weak filtering, missed stories, critic false-positives)
- Feed learnings into filter prompts, source list, and critic rubrics for next issue

---

## Current pipeline (post ADR 014 + ADR 016)

The pipeline was expanded from the original walking skeleton (2 sources, 3-item auto-pick, voice + risk review, save) to the current order:

1. Collect from tier-1 (Anthropic, OpenAI, DeepMind), tier-2 (HN frontpage + /newest, Reddit r/LocalLLaMA + r/MachineLearning, Simon Willison, Thoughtworks Radar, ArXiv cs.AI), tier-3 regulatory (OAIC, EU AI Act, UK AISI, NIST AI, US FTC AI, OECD AI), and inbox
2. Wardley precondition + three-lens filter
3. Map-mutation gate (skip map update if any tier-1 source failed)
4. Update `ai-landscape.owm` and re-render
5. Update `ai-landscape.md` analysis
6. SW-critic loop on the Wardley artifacts (3 rounds max)
7. Draft newsletter with Map movement line per item
8. Voice review
9. Content-risk review (5 axes with VERDICT)
10. SW-critic loop on the newsletter draft (3 rounds max)
11. Save draft with all review blocks and map delta
12. Tom reviews and publishes
13. Retrospective

The walking-skeleton version (ADR 011's original scope) proved out steps 1, 2, 7, 8, 9, 11, 12, 13 with only Anthropic and HN as sources. Steps 3-6 and 10 were added per ADR 014 (Wardley substrate) and ADR 016 (SW-critic gate). Source expansion was added in the same change set.

---

## Iteration layers

| Layer | Adds |
|-------|------|
| 1 (original walking skeleton) | 2 RSS feeds, 3-item auto-pick, voice + risk review, save |
| 2 (current) | Wardley substrate (ADR 014), tier-1/2/3 source expansion, regulatory feeds, SW-critic loops (ADR 016), no-cap item count |
| 3 | Semi-automated secondary sources (Playwright for sites without RSS, if needed) |
| 4 | Weekly cron schedule (Claude Code scheduled agent or GitHub Actions) |
| 5 | LinkedIn newsletter archive page on windyroad.com.au |
| 6 | Automated retrospective after each published issue with structured metrics (critic round distribution, gate REJECTED counts, source coverage drift) |

---

## Sources

Tier gating per ADR 016: if any tier-1 source fails, the map is not mutated this week and the brief runs against last week's map. Tier-2 and tier-3 failures do not block map mutation.

### Tier 1 (critical, gate the map update)

| Source | Method | Signal |
|--------|--------|--------|
| Anthropic news | WebFetch `https://www.anthropic.com/news` | Anthropic model releases, research, policy |
| OpenAI news | WebFetch `https://openai.com/news/` | OpenAI model releases, product, policy |
| Google DeepMind blog | WebFetch `https://deepmind.google/discover/blog/` | Research, Gemini, safety |

### Tier 2 (important, continue on fail)

| Source | Method | Signal |
|--------|--------|--------|
| HN frontpage AI | WebFetch `https://hnrss.org/frontpage?q=AI` | Community-filtered AI signal |
| HN /newest AI (points >= 50) | WebFetch `https://hnrss.org/newest?q=AI&points=50` | Early signal not yet on frontpage |
| Reddit r/LocalLLaMA | WebFetch `https://www.reddit.com/r/LocalLLaMA/top/.json?t=week` | Open-source and open-weight AI |
| Reddit r/MachineLearning | WebFetch `https://www.reddit.com/r/MachineLearning/top/.json?t=week` | ML community, research |
| Simon Willison weekly notes | WebFetch `https://simonwillison.net/atom/everything/` | Practitioner digest, pre-filtered |
| Thoughtworks Radar | WebFetch `https://www.thoughtworks.com/radar` | AI/LLM/agent blips, industry adoption signal |
| ArXiv cs.AI recent | WebFetch `https://arxiv.org/list/cs.AI/recent` | Applied AI research |

### Tier 3 (regulatory, continue on fail)

| Source | Method | Signal |
|--------|--------|--------|
| Australia OAIC | WebFetch `https://www.oaic.gov.au/newsroom` | AU privacy and automated decisions |
| EU AI Act | WebFetch `https://artificialintelligenceact.eu/` | EU implementation updates |
| UK AI Safety Institute | WebFetch `https://www.aisi.gov.uk/work` | UK AI safety publications |
| NIST AI | WebFetch `https://www.nist.gov/news-events/news/search?key=&topic-op=or&topic-area-fieldset%5B%5D=2753736` | US standards, frameworks (AI-topic-filtered news search; the `/artificial-intelligence/news` path 404s, corrected 2026-05-24) |
| US FTC AI actions | WebFetch `https://www.ftc.gov/news-events/news/press-releases` | US enforcement, consumer protection |
| OECD AI | WebFetch `https://oecd.ai/en/wonk/news` | International policy |

### Manual (Tom drops links)

| Source | Method | Signal |
|--------|--------|--------|
| LinkedIn | Tom saves 0-3 posts/week to src/newsletters/inbox/ (ADR 013) | Engineering leader discourse, org change signals |

---

## Filter: Wardley precondition + three-lens

Full detail in `.claude/skills/wr-newsletter/assets/three-lens-filter.md`.

### Wardley precondition (ADR 014)

Before scoring the three lenses, the candidate must anchor to an observable movement on the AI Engineering Landscape map (`docs/ai-engineering-brief/ai-landscape.owm`). Candidates that cannot anchor to a map movement are dropped before lens scoring. This keeps the brief disciplined as commentary on what changed in the landscape, not a news roundup.

### Three lenses

1. **Technical**: "Does this represent a meaningful capability change in AI models, tools, or infrastructure?"
2. **Operational**: "Does this change how an engineering team should build, deploy, test, or secure software?"
3. **Human**: "Does this affect how engineering leaders manage their teams, how developers feel about their work, or how organisations need to adapt?"

A story must score on at least 2 of 3 lenses to make the brief. Stories that hit all 3 are prioritised. Include every significant candidate; minimum three items, no maximum.

---

## Review gates (three gate classes)

### 1. Voice and tone review (ADR 012)
- Run `wr-voice-tone:agent` against the draft
- Check for "we" voice, no banned patterns, direct/specific/confident tone, no em-dashes, reader-respect clause (ADR 015)
- FAIL requires fix before proceeding; the skill does not save a voice-failing draft

### 2. Content-risk review (ADR 012 + ADR 015)
- Five axes: factual, reputational, claims, attribution, reader-respect
- Scored low / medium / high per axis
- Any axis `high` produces `VERDICT: REJECTED`; otherwise `VERDICT: PASS`
- REJECTED drafts are still saved for Tom's inspection, but must not be published as-is

### 3. SW-critic loop (ADR 016)
- Strengths/weaknesses critic runs as a subagent (`wr-sw-critic`) against a rubric
- Applies to the Wardley artifacts (before drafting) and the newsletter draft (after voice + content-risk)
- Up to 3 rounds: skill fixes weaknesses, re-invokes, repeats
- Round-3 exhaustion emits `VERDICT: REJECTED` with `REJECTED_REASON: critic-loop-exhausted`

### Gate order

On the newsletter draft: voice -> content-risk -> critic. If voice fails, no content-risk. If content-risk returns REJECTED, no critic.

On the Wardley artifacts: critic only (voice and reader-respect apply because the analysis is prose, but they fire via global hooks and are included in the critic's rubric cross-references).

---

## Wardley landscape map (ADR 014)

The brief is structured as commentary on a living Wardley map of the AI engineering landscape.

- **Source**: `docs/ai-engineering-brief/ai-landscape.owm` (OWM text format)
- **Render**: `docs/ai-engineering-brief/ai-landscape.svg` and `.png`, generated by `wr-wardley`'s `owm-to-svg.mjs`
- **Analysis**: `docs/ai-engineering-brief/ai-landscape.md` (Differentiation / Evolution / Risk / Decisions)
- **Update cadence**: weekly, as part of the `/wr-newsletter` pipeline. If any tier-1 source fails, the map is not mutated this week and the brief runs against the previous map.
- **Tom overrides**: edit `ai-landscape.owm` by hand, re-render. Hand-edited positions are preserved by the skill.

---

## Technical decisions

- Pipeline runs inside Claude Code via the `/wr-newsletter` skill (ADR 011)
- `wr-wardley`'s OWM renderer reused for the landscape map (ADR 014)
- `wr-sw-critic` is a project-local subagent at `.claude/agents/wr-sw-critic.md`, parameterised by rubric files under `.claude/skills/wr-newsletter/assets/` (ADR 016)
- Voice and content-risk gates reuse existing specialists (ADR 012)
- Output format: markdown file in src/newsletters/drafts/ with all gate outputs appended
- Scheduling (later): Claude Code scheduled agent or GitHub Actions cron
- Every gate runs automatically on every draft; Tom sees a summary with verdicts and residual weaknesses
