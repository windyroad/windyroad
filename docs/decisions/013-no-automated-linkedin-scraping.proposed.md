---
status: "proposed"
date: 2026-04-17
human-oversight: confirmed
oversight-date: 2026-05-30
decision-makers: [Tom Howard, Claude]
consulted: []
informed: []
reassessment-date: 2026-07-17
---

# No automated LinkedIn scraping

## Context and Problem Statement

The AI Engineering Brief (ADR 011) pulls source material from RSS feeds, Reddit JSON, and Twitter via Nitter. LinkedIn is the channel where Tom's target persona (Engineering Leaders) spends most of their professional time, so LinkedIn posts are a high-signal source. The question is whether to automate LinkedIn fetching too.

## Decision Drivers

- **Account risk**: LinkedIn actively detects automation and suspends accounts that scrape. Tom's personal LinkedIn account is his primary sales and distribution channel. A suspension would cause real business harm.
- **Terms of service**: LinkedIn's ToS prohibit scraping. Even if technically feasible, it creates legal exposure.
- **Signal value**: LinkedIn posts are high signal, but Tom is on LinkedIn daily anyway. Manually noting 0-3 posts per week is a 30 second operation.
- **Cost**: automated LinkedIn fetch requires either LinkedIn API access (approved app, slow) or headless browser scraping (operationally expensive, high risk).

## Considered Options

1. **No automated LinkedIn scraping, manual drop folder for Tom-curated links** (chosen). Tom pastes interesting LinkedIn URLs or notes into `src/newsletters/inbox/` during his normal LinkedIn browsing. Pipeline ingests whatever is in the folder.
2. **Headless browser scraping (Playwright or Puppeteer) against linkedin.com**. Automated, but high account-ban risk.
3. **LinkedIn official API**. Requires an approved app, rate-limited, limited scope. Slow to set up for a walking skeleton.
4. **Third-party scraping service (Bright Data, Apify, etc.)**. Moves the risk off Tom's account but adds vendor cost and still operates in a legally ambiguous space.

## Decision Outcome

Chosen option: **"No automated LinkedIn scraping, manual drop folder for Tom-curated links"**, because the business risk of a LinkedIn account suspension outweighs the marginal signal value, and because Tom's existing LinkedIn routine already surfaces the best posts at near-zero marginal time cost. The drop folder lets manual signal join the automated pipeline without requiring any scraping.

## Consequences

### Good

- Zero account risk to Tom's primary LinkedIn presence.
- Zero ToS exposure.
- Zero new vendor cost or API setup.
- Editorial control: the LinkedIn signal that enters the pipeline has already passed Tom's human filter.

### Neutral

- Relies on Tom's manual curation habit. If Tom drops nothing in a given week, the LinkedIn source is empty. Acceptable given LinkedIn is a supplement to the automated RSS/Reddit/Twitter feeds.

### Bad

- Missed signal if Tom is not actively reading LinkedIn in a given week (holiday, focus week).
- No retrospective on what we did not see.

## Confirmation

- The pipeline source list explicitly excludes LinkedIn automated fetch.
- `src/newsletters/inbox/` directory exists and is documented in `docs/ai-engineering-brief/PLAN.md`.
- The orchestration command (ADR 011) reads from `inbox/` as one source among the automated feeds.
- No module, dependency, or environment variable references LinkedIn credentials or scraping libraries targeting linkedin.com.

## Pros and Cons of the Options

### Manual drop folder (chosen)

- Good: zero risk to Tom's account
- Good: zero ToS exposure
- Good: zero new cost
- Good: human-filtered signal
- Bad: depends on Tom's habit

### Headless browser scraping

- Good: fully automated
- Bad: account suspension risk is high and the business impact is severe
- Bad: violates ToS

### LinkedIn official API

- Good: legitimate access path
- Good: no account risk
- Bad: approval process is slow and scope is limited
- Bad: overkill for the walking skeleton

### Third-party scraping service

- Good: moves account risk off Tom's account
- Bad: still ToS-ambiguous
- Bad: new vendor cost (violates the $0-at-margin constraint from ADR 011)

## Reassessment Criteria

- If LinkedIn materially changes its ToS or offers an API tier that supports our use case at no cost.
- If Tom's manual curation rate consistently falls to zero and the LinkedIn signal becomes genuinely missing from the brief.
- If business conditions change such that losing Tom's LinkedIn account is no longer critical.
