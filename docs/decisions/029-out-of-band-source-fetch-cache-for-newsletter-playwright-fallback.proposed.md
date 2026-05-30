---
status: "proposed"
date: 2026-05-13
human-oversight: confirmed
oversight-date: 2026-05-30
decision-makers: [unspecified, fill at canonical review]
consulted: []
informed: []
reassessment-date: 2026-08-13
---

# Out-of-band source-fetch cache for newsletter Playwright fallback

> Captured via /wr-architect:capture-adr (foreground-lightweight aside-invocation per ADR-032 P156 amendment). Run /wr-architect:create-adr on this ID to expand the deferred sections canonically.

## Context and Problem Statement

The `/wr-newsletter` skill fetches news from vendor, community, and regulatory sources at step 2 via Claude Code's `WebFetch` tool. Two recurring failure modes block tier-1 and tier-2 signal every run (P014):

1. **OpenAI news** (`https://openai.com/news/`) returns HTTP 403 to `WebFetch` (Cloudflare-class bot protection). The current mitigation is a Google News RSS query scoped to `site:openai.com`, but the RSS path returns landers (help.openai.com, platform.openai.com) rather than the canonical announcement URL.
2. **Reddit** (`r/LocalLLaMA`, `r/MachineLearning`) is refused at the Claude Code tool layer entirely; any `reddit.com` URL is denied before the network call is made. There is no workaround in place; the developer-persona newsletter (Tokens Spent) loses its two highest-weighted tier-2 sources every run.

`WebFetch` is the wrong tool for bot-protected and tool-layer-refused sources. P014's plan is a Node `playwright` script that fetches these sources out-of-band, writes structured JSON to a local cache, and is consumed by the SKILL via `Read`. The architectural surface this ADR records: where the cache lives, how SKILL step 2 falls through between paths, and what freshness window separates "fresh enough to trust" from "stale, fall through".

The 48h freshness default is sized to the pipeline's prep-finalise rhythm (ADR-017). Prep typically runs Mon/Tue; finalise runs Fri morning. A 48h window allows same-prep-session cache hits (re-runs the same day) while ensuring the Friday finalise's tier-1 re-fetch (SKILL step 2-prime, line 131: "pick up Thursday-evening or Friday-morning launches") sees a cache miss for Monday-prep-cached items and falls through to fresh sources. Sub-48h defaults would force re-fetches within the prep session; over-48h defaults would mask stale prep-time data during finalise. The JTBD-200 weekly digest cadence does not require sub-48h freshness.

## Decision Drivers

- (deferred to /wr-architect:create-adr canonical review)

## Considered Options

1. **Option A (chosen)**: Node Playwright helper at `scripts/fetchers/playwright-newsroom.mjs`, cache at `.cache/newsletters/<source-slug>/YYYY-MM-DD.json`, SKILL step 2 reads cache first within a 48h freshness window then falls through to Google News RSS then records `source_failures`.
2. (deferred, see /wr-architect:create-adr canonical review)

## Decision Outcome

Chosen option: **"Option A"**, because Playwright is already a `devDependency` (`playwright@1.59.1`) so no new dependency is required; `.cache` is already in `.gitignore` so the cache is gitignored with zero new ignore rules; the `.cache/newsletters/` placement matches the existing project-root convention for gitignored state (`.afk-run-state/`, `.risk-reports/`, `.netlify`, `.next`) and avoids the tracked-tree-with-hidden-cache anomaly that `src/newsletters/cache/` would introduce; the precedence rule (Playwright cache fresh, then RSS fallback, then `source_failures`) extends the existing fallback chain at SKILL.md line 166 ("If WebFetch returns 403, the Google News RSS fallback used for OpenAI is the first thing to try") without changing tier-1 map-update semantics.

### Cache layout

```
.cache/newsletters/<source-slug>/YYYY-MM-DD.json
```

Schema:

```json
{
  "source": "openai-news",
  "fetched_at": "2026-05-13T09:00:00Z",
  "items": [
    { "title": "...", "url": "...", "date": "2026-05-13", "summary": "..." }
  ]
}
```

### Freshness window

Default 48 hours. A cache file whose `fetched_at` is older than 48 hours before the SKILL step 2 invocation is treated as stale and the fallback chain advances to the next rung. The default is configurable (left for P014d schema-validation + retries phase to surface as a flag).

### Tier-1 fallback precedence

SKILL step 2 consumes a tier-1 source (where a Playwright path exists) by walking these rungs in order. The SKILL.md edit MUST land this as a numbered rung list, not prose, so future readers cannot misread the precedence:

1. **Playwright cache fresh**: `.cache/newsletters/<slug>/<most-recent>.json` exists AND its `fetched_at` is within the 48h freshness window. Items consumed; no `source_failures` entry.
2. **Google News RSS fallback** (per P010 for OpenAI; analogous query for other bot-protected tier-1 sources). Items consumed; no `source_failures` entry.
3. **All rungs empty or failed**: record the source in `source_failures`. The map-update gate (SKILL.md lines 221-229) decides whether to skip the weekly map mutation per its existing rules.

Any successful primary path produces "not a failure" for tier-1 map-update gate purposes. The map-update gate reads `source_failures` only; the gate does not care which rung produced the items.

For tier-2 / tier-3 sources (continue-on-fail per SKILL.md lines 140, 155), the same precedence applies but with the existing continue-on-fail policy: a failure on every rung records `source_failures` and continues.

### Out of scope for this ADR

- Authenticated Reddit (account login, session-cookie persistence beyond public-page access): sibling decision when P014b's Reddit consent-gate handling lands.
- Twitter/X coverage: separate decision if it becomes desirable.
- Scheduling the fetcher on cron: orthogonal to this ADR's cache contract.
- Per-source-class persistent browser profiles: Playwright profile management surface is P014b's responsibility.

### Forward-looking note (ADR-024 composition)

ADR-024 (URL verification gate) line 43 documents `openai.com` as "DuckDuckGo HTML search; not directly verifiable from local env" because the Cloudflare 403 closes off direct fetches at step 11.5. Once P014a's Playwright cache is populated for OpenAI, the cache body could double as URL-verification evidence for openai.com URLs at step 11.5, closing the weaker-evidence path ADR-024 line 67 records. This is a follow-up opportunity, not in scope for P014a, but worth flagging so the future enhancement does not re-litigate the cache layout.

## Consequences

### Good

- (deferred to /wr-architect:create-adr canonical review)

### Neutral

- (deferred to /wr-architect:create-adr canonical review)

### Bad

- (deferred to /wr-architect:create-adr canonical review)

## Confirmation

(deferred to /wr-architect:create-adr canonical review)

## Pros and Cons of the Options

### Option A

- (deferred to /wr-architect:create-adr canonical review)

## Reassessment Criteria

(deferred to /wr-architect:create-adr canonical review; default reassessment-date 3 months from capture)
