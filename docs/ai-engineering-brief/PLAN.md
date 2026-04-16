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
- Fetch RSS feeds (Anthropic blog, OpenAI blog, Google DeepMind, GitHub blog, HBR, MIT Sloan, ArXiv cs.CR + cs.SE, NIST/CVE)
- Fetch Reddit top posts via JSON API (r/MachineLearning, r/LocalLLaMA, r/ExperiencedDevs, r/cscareerquestions)
- Scrape Twitter/X via Nitter instances (Playwright, no auth)
- Check src/newsletters/inbox/ folder for manually dropped LinkedIn links/notes

#### 2. Filter and rank
- Claude API filters each item: "Would an engineering leader care about this?"
- Score by three lenses: technical impact, operational impact, human impact
- Deduplicate across sources (same story from blog + Reddit + Twitter = one item)
- Pick top 5-7 stories for the week

#### 3. Draft brief
- Claude API drafts in voice and tone guide style
- Structure: 3-5 items, each with:
  - What happened (one sentence, factual, source linked)
  - Why it matters to your team (one sentence, engineering leader POV)
  - The human angle (one sentence, change management / psychology / sociology)
- Generate LinkedIn-formatted text (no markdown, line breaks for readability)
- Include soft CTA footer: "We help engineering teams navigate this. windyroad.com.au"
- Save to src/newsletters/drafts/YYYY-MM-DD.md

#### 4. Review
- Voice and tone review agent checks draft against docs/VOICE-AND-TONE.md
- Risk review agent scores the draft for reputational risk (factual accuracy, tone, claims)
- Tom reviews markdown draft (~5 minutes)
- Tom edits, cuts, adds personal takes where inspired

#### 5. Publish
- Tom posts to LinkedIn newsletter
- Move draft to src/newsletters/published/YYYY-MM-DD.md

#### 6. Retrospective
- Run /wr-retrospective:run-retro after each published issue
- Capture: what worked, what didn't, quality of source signal, filter accuracy, voice quality
- Update docs/BRIEFING.md with learnings
- Create problem tickets for friction points (bad sources, weak filtering, missed stories)
- Feed learnings back into filter prompts and source list for next issue

---

## Walking skeleton (thinnest vertical slice)

Proves the full loop end-to-end with minimum sources:

1. Fetch 2 RSS feeds (Anthropic blog + Hacker News front page)
2. Claude API picks top 3 stories relevant to engineering leaders
3. Draft a 3-item brief in markdown with the three-lens structure
4. Run voice and tone review agent on the draft (flag violations before Tom sees it)
5. Run risk review on the draft (factual accuracy, reputational risk, claims that need evidence)
6. Save to src/newsletters/drafts/YYYY-MM-DD.md with review results appended
7. Tom reads it, gives feedback, publishes
8. Run /wr-retrospective:run-retro on the session (what worked, what didn't, update BRIEFING.md with learnings, create problem tickets for friction)

---

## Iteration layers (after skeleton works)

| Layer | Adds |
|-------|------|
| 1 (skeleton) | 2 RSS feeds, Claude filter, 3-item draft, voice review, risk review, save to file |
| 2 | All RSS feeds (blogs, ArXiv, NIST, HBR, MIT Sloan) |
| 3 | Reddit JSON feeds (4 subreddits) |
| 4 | Twitter/Nitter scraping via Playwright |
| 5 | Manual inbox/ drop folder for LinkedIn links |
| 6 | Weekly cron schedule (Claude Code scheduled agent or GitHub Actions) |
| 7 | LinkedIn newsletter archive page on windyroad.com.au |
| 8 | Automated retrospective after each published issue (learnings, problem tickets) |

---

## Sources

### Fully automated (RSS/JSON, no auth)

| Source | Feed URL pattern | Signal |
|--------|-----------------|--------|
| Anthropic blog | anthropic.com RSS | Model releases, safety |
| OpenAI blog | openai.com RSS | GPT releases, policy |
| Google DeepMind | deepmind.google RSS | Research, Gemini |
| GitHub blog | github.blog/feed/ | Copilot, security, supply chain |
| HN front page | hnrss.org/frontpage?q=AI | Community-filtered AI signal |
| ArXiv cs.CR | rss.arxiv.org/rss/cs.CR | Security research |
| ArXiv cs.SE | rss.arxiv.org/rss/cs.SE | Software engineering research |
| NIST CVE | nvd.nist.gov feeds | Vulnerability discovery pace |
| HBR | hbr.org/topic/ai/feed | Org change, AI adoption |
| MIT Sloan | Feed TBD | Technology + workforce |
| r/MachineLearning | reddit.com JSON | ML community |
| r/LocalLLaMA | reddit.com JSON | Open-source AI |
| r/ExperiencedDevs | reddit.com JSON | Senior dev perspective |
| r/cscareerquestions | reddit.com JSON | Career/workforce impact |

### Semi-automated (Playwright, no auth)

| Source | Method | Signal |
|--------|--------|--------|
| Twitter/X | Playwright scrape of Nitter instances | Real-time AI announcements, practitioner reactions |

### Manual (Tom drops links)

| Source | Method | Signal |
|--------|--------|--------|
| LinkedIn | Tom saves 0-3 posts/week to src/newsletters/inbox/ | Engineering leader discourse, org change signals |

---

## Three-lens filter prompt (for Claude API)

Each candidate story is evaluated against:

1. **Technical**: "Does this represent a meaningful capability change in AI models, tools, or infrastructure?"
2. **Operational**: "Does this change how an engineering team should build, deploy, test, or secure software?"
3. **Human**: "Does this affect how engineering leaders manage their teams, how developers feel about their work, or how organisations need to adapt?"

A story must score on at least 2 of 3 lenses to make the brief. Stories that hit all 3 are prioritised.

---

## Review gates (applied to every draft)

### Voice and tone review
- Run wr-voice-tone:agent against the draft
- Check for: "we" voice, no banned patterns, direct/specific/confident tone, no em-dashes
- Flag violations for Tom to fix before publishing

### Risk review
- Check factual claims: are sources cited? Are numbers verifiable?
- Check reputational risk: are we making predictions we can't back up? Dismissing competitors? Making unsupported claims about AI capabilities?
- Check legal: are we quoting copyrighted content beyond fair use? Attributing quotes correctly?
- Score: low/medium/high risk. Medium or above requires Tom's explicit review of flagged items.

---

## Technical decisions

- Walking skeleton runs as a local script first (prove the loop before scheduling)
- Playwright for Nitter scraping (already in devDependencies)
- Claude API for filtering and drafting (Anthropic SDK)
- Output format: markdown file in src/newsletters/drafts/
- Scheduling (later): Claude Code scheduled agent or GitHub Actions cron
- Review agents run automatically on every draft before Tom sees it
