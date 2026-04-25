# Problem 014: OpenAI news and Reddit return 403 or block at the tool layer during `/wr-newsletter`, depriving the map of tier-1 and tier-2 signal

**Status**: Known Error
**Reported**: 2026-04-19
**Transitioned to Known Error**: 2026-04-25 (review pass: root cause confirmed; workaround = OpenAI via Google News, Reddit gap accepted; phased Playwright plan documented)
**Priority**: 12 (High). Impact: Significant (4) x Likelihood: Possible (3)
**Effort**: L (phased multi-script: walking skeleton, Reddit coverage, fallback smarts, schema validation; ~3 hours focused work)
**WSJF**: (12 x 2.0) / 4 = 6.0
**Re-rated 2026-04-25**: Likelihood Unlikely (2) to Possible (3). Reddit gap recurs every weekly run; OpenAI workaround is partial. Score 8 to 12.

## Description

The `/wr-newsletter` skill fetches news from vendor, community, and regulatory sources at step 2. Two recurring failure modes block signal every run:

1. **OpenAI news (https://openai.com/news/)** returns HTTP 403 to `WebFetch`. Bot protection recognises the automated fetcher and denies the request. The same URL loads fine in a human browser.
2. **Reddit (r/LocalLLaMA, r/MachineLearning)** is blocked at the Claude Code tool layer entirely; any `reddit.com` URL is refused before the fetch is attempted.

The result is that every newsletter run loses the canonical OpenAI announcement stream (mitigated by a Google News RSS workaround) and the two developer-community signal sources that the Tokens Spent persona config weights most heavily (no workaround in place).

The first Tokens Spent edition (2026-04-19) shipped without Reddit coverage at all, and with OpenAI coverage coming via the Google News RSS workaround that returns less structured data than the primary page does.

## Symptoms

- `WebFetch https://openai.com/news/` returns `Request failed with status code 403`.
- Any `reddit.com` URL refused by the WebFetch tool with a blanket block.
- Developer persona's three highest-weighted tier-2 sources (r/LocalLLaMA, r/MachineLearning alongside HN and Simon Willison) are only half-populated on every run.
- Pipeline summary consistently names these as `source_failures`; readers of the draft see unnecessarily narrow source attribution.

## Workaround

- **OpenAI**: Google News RSS scoped `site:openai.com` returns 10 recent items (title, URL, date, summary). Less structured than the primary page; URLs sometimes point to `help.openai.com` or `platform.openai.com` generic landers rather than the primary announcement URL.
- **Reddit**: no workaround. The pipeline runs without Reddit coverage.

Both workarounds are accepted trade-offs as of 2026-04-19. This ticket is to replace them with a reliable browser-based fetcher.

## Impact Assessment

- **Who is affected**: Tokens Spent subscribers (miss developer-community signal), The Shift subscribers (miss OpenAI primary announcements unless Google News catches them).
- **Frequency**: every weekly newsletter run.
- **Severity**: Medium. Individual missed stories are recoverable via the following week's pickup. Cumulatively the brand voice reads as "caught up on OpenAI via Google News" rather than "first-hand coverage", which weakens perceived editorial authority.
- **Analytics**: N/A (no subscribers yet on Tokens Spent; The Shift has one edition published).

## Root Cause Analysis

### Root Cause

- **OpenAI**: OpenAI's news page serves HTTP 403 to automated user-agents that WebFetch presents. The response is bot-protection, not an outage. Human browsers with JavaScript and standard headers succeed.
- **Reddit**: Claude Code's tool layer blacklists `reddit.com` URLs. Even with Reddit's public JSON API, the tool refuses the call.

Both failures are upstream of the newsletter pipeline itself. WebFetch is the wrong tool for authenticated-feel bot-protected sources.

### Fix Strategy

Build a Playwright-based fetcher helper that runs out-of-band (not via WebFetch) and produces normalised JSON consumable by `/wr-newsletter` step 2.

**Design sketch:**

- **Location**: `scripts/fetchers/playwright-newsroom.mjs` (new). Node script using `playwright` npm package (Chromium).
- **Invocation**: `npm run fetch:newsroom -- --sources=openai,reddit-locallama,reddit-ml` (new package.json script). Optionally invoked automatically by SKILL step 2 as a fallback when WebFetch returns 403 on OpenAI, or manually by Tom once before each newsletter run.
- **Output**: `src/newsletters/cache/<source-slug>/YYYY-MM-DD.json` with schema:
  ```json
  {
    "source": "openai-news",
    "fetched_at": "2026-04-19T09:00:00Z",
    "items": [
      { "title": "...", "url": "...", "date": "2026-04-18", "summary": "..." }
    ]
  }
  ```
- **SKILL integration**: step 2 tries `WebFetch` first. If it returns 403 (OpenAI) or refuses (Reddit), read from `src/newsletters/cache/<source-slug>/<most-recent-date>.json` if present and within a freshness window (configurable, default 48 hours). If the cache is stale or missing, note the source as failed per existing behaviour.
- **Session persistence**: Playwright saves a persistent browser profile under `.cache/playwright-profiles/` (gitignored) so Reddit's consent banner and age gates do not require re-clicking every run.
- **Rate limit**: one fetch per source per 30 minutes minimum to avoid tripping rate limits or looking like a scraping loop.

**Phased implementation:**

1. **Walking skeleton (P014a)**: single script that fetches OpenAI news, writes JSON to cache. SKILL reads if present. ~60-90 min.
2. **Reddit coverage (P014b)**: add r/LocalLLaMA and r/MachineLearning with subreddit listing parsing. ~45 min (Reddit's HTML structure is well-known, but consent gate handling adds friction).
3. **Fallback smarts (P014c)**: SKILL step 2 detects WebFetch 403 and auto-invokes the fetcher rather than requiring a separate manual step. ~30 min.
4. **Schema validation + retries (P014d)**: JSON schema check on output, retry once on transient failure. ~30 min.

Total: ~3 hours end-to-end across one focused session.

**Out of scope for this ticket:**

- Authenticated Reddit (requires account login flow, cookie persistence beyond public-page access).
- Twitter/X coverage (separate problem if it becomes desirable).
- Scheduling the fetcher on a cron (layer 6 of PLAN.md).

### Investigation Tasks

- [ ] Verify Playwright headed-mode fetch of `https://openai.com/news/` succeeds locally (manual confirmation before writing code).
- [ ] Confirm Reddit old.reddit.com or .json JSON listings are accessible via Playwright without authentication.
- [ ] Decide on cache location: `src/newsletters/cache/` (tracked but gitignored?) vs `.cache/newsletters/` (fully gitignored).
- [ ] Prototype `scripts/fetchers/playwright-newsroom.mjs` against OpenAI first, measure fetch time.
- [ ] Extend SKILL step 2 with the fallback logic once the walking skeleton works.

## Related

- P010 (OpenAI 403 + Reddit block, original ticket flagging the issue). This ticket is the implementation follow-up; P010 may close when P014 ships.
- `docs/BRIEFING.md` "What Will Surprise You" section on OpenAI 403 and Reddit tool block.
- `docs/ai-engineering-brief/developer-newsletter-concept.md` (source weighting note: developer persona weights Reddit and HN heavily, so Reddit coverage matters more for Tokens Spent than for The Shift).
- `.claude/skills/wr-newsletter/SKILL.md` (step 2 source list and Tier-2 entries for Reddit; Tier-1 entry for OpenAI).
- `.claude/skills/wr-newsletter/personas/developer.md` (source weighting line that names r/LocalLLaMA and r/MachineLearning at the top of tier-2).
