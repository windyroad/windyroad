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

- [x] Verify Playwright headed-mode fetch of `https://openai.com/news/` succeeds locally (manual confirmation before writing code). **Verified 2026-05-13** via `/tmp/openai-news-headed-check.mjs` (headed Chromium 1.59.1, macOS user-agent, 1280x900 viewport). HTTP 200. Page rendered the canonical OpenAI News landing: "All" headline, Company/Research/Product/Safety/Engineering/Security/Global-Affairs/AI-Adoption tag filters, three current article tiles (OpenAI Campus Network, OpenAI Deployment, Running Codex safely at OpenAI). No bot-protection challenge, no 403, no captcha. Tom visually confirmed `looks good` on the live browser window. Screenshot at `/tmp/openai-news-headed-screenshot.png`. IT-1 unblocked. The M-effort helper scope is viable. Subsequent ITs (Reddit access, cache location, prototype fetcher, SKILL step 2 fallback) are now AFK-progressable.
- [x] Confirm Reddit old.reddit.com or .json JSON listings are accessible via Playwright without authentication. **Verified 2026-05-13** (P014b): the `.json` endpoint returns "blocked by network security" at both `old.reddit.com` and `www.reddit.com` (Akamai-class bot protection on the API). The modern Reddit HTML page at `www.reddit.com/r/<sub>/top/?t=week` is reachable anonymously; 2x scroll cycles load 27+ posts; `shreddit-post` web-component attributes (`permalink`, `post-title`, `created-timestamp`, `score`, `comment-count`) give clean structured data. No consent gate, no age gate, no persistent profile required. Strategy decided: HTML scrape via Playwright, not the JSON API.
- [x] Decide on cache location. **Decided 2026-05-13**: `.cache/newsletters/<source-slug>/YYYY-MM-DD.json` per ADR-029 (out-of-band source-fetch cache for newsletter Playwright fallback). Architect direction: `.cache/` matches the existing project-root gitignored-state convention (`.afk-run-state/`, `.risk-reports/`, `.netlify`, `.next`); already gitignored at .gitignore line 49; avoids the tracked-tree-with-hidden-cache anomaly that `src/newsletters/cache/` would introduce.
- [x] Prototype `scripts/fetchers/playwright-newsroom.mjs` against OpenAI first, measure fetch time. **Landed 2026-05-13** (P014a walking skeleton). End-to-end fetch including headless Chromium launch + 2s render settle: ~3-4s. Wrote 10 items to `.cache/newsletters/openai-news/2026-05-13.json`. Items have canonical `openai.com/index/...` URLs (the primary value-add over the Google News RSS lander URLs), ISO dates parsed from the OpenAI tile suffix, and category (Research/Company/Product/Safety/Engineering/Security/Global Affairs/AI Adoption/Policy) captured as `summary`. Pure-function unit tests (vitest, 17 passing) cover `parseArgs`, `buildCacheEntry`, `cacheFilePath`, `cleanOpenAITitle`. Live network test is manual via `npm run fetch:newsroom -- --source=openai` per architect Q4 direction.
- [x] Extend SKILL step 2 with the fallback logic once the walking skeleton works. **Landed 2026-05-13**: `.claude/skills/wr-newsletter/SKILL.md` OpenAI tier-1 entry now lists the ADR-029 fallback precedence as a numbered rung list (Playwright cache fresh, then Google News RSS, then `source_failures`). The "Known source gap (P014)" note was rewritten as "Known source gap (P014b)" to reflect that OpenAI is now wired and Reddit is the remaining gap.

## P014a-b Status (walking skeleton + Reddit coverage landed)

P014a (walking skeleton, OpenAI) shipped 2026-05-13:

- `scripts/fetchers/playwright-newsroom.mjs` Playwright Node script plus colocated vitest unit tests.
- `.cache/newsletters/openai-news/YYYY-MM-DD.json` cache shape per ADR-029.
- `npm run fetch:newsroom` invocation entrypoint in package.json.
- SKILL step 2 OpenAI entry rewritten as a three-rung precedence list (Playwright cache fresh, then Google News RSS, then `source_failures`).
- ADR-029 captures the cache layout, 48h freshness default, and fallback precedence (status `proposed`).

P014b (Reddit coverage) shipped 2026-05-13:

- Same `scripts/fetchers/playwright-newsroom.mjs` extended with `reddit-locallama` and `reddit-ml` sources. New pure helper `buildRedditItem` covered by vitest cases (24 tests total passing across both phases).
- `.cache/newsletters/reddit-locallama/YYYY-MM-DD.json` + `.cache/newsletters/reddit-machinelearning/YYYY-MM-DD.json` populated via `npm run fetch:newsroom -- --source=reddit-locallama` (and `reddit-ml`).
- Strategy: HTML scrape of `https://www.reddit.com/r/<sub>/top/?t=week` (the `.json` API is blocked by Akamai-class protection at both old. and www. subdomains; HTML page is reachable anonymously). 2x 2000px scrolls with 1.5s settle each loads the top 27+ posts; we take the top 10. `shreddit-post` web-component attributes provide canonical permalinks, ISO timestamps, score, and comment count.
- No persistent browser profile required (anonymous access works; ADR-029 out-of-scope item "persistent browser profiles" resolves to "not needed for P014b").
- SKILL step 2 Reddit entries rewritten as three-rung precedence lists (cache fresh, no RSS fallback for Reddit, then `source_failures` per tier-2 continue-on-fail policy).
- Live end-to-end smoke tests: 10 items each from r/LocalLLaMA and r/MachineLearning with canonical permalinks, ISO dates, and `<score> upvotes, <count> comments` summary.

Remaining phases (ticket stays Known Error until both ship):

- **P014c**: Fallback smarts (SKILL step 2 auto-invokes the fetcher on WebFetch 403 / Reddit refusal rather than requiring manual `npm run fetch:newsroom`) (~30 min).
- **P014d**: JSON schema validation + retry-once-on-transient-failure (~30 min).

## Dependencies

- **Blocks**: P010
- **Blocked by**: (none)
- **Composes with**: (none)

P010 (source-tier fetch failures for OpenAI and Reddit) cannot close until this Playwright helper ships. Captured 2026-05-12 per the P076 transitive-effort rule to formalise the dependency that the ticket prose has documented since 2026-04-25.

## Related

- P010 (OpenAI 403 + Reddit block, original ticket flagging the issue). This ticket is the implementation follow-up; P010 may close when P014 ships.
- `docs/BRIEFING.md` "What Will Surprise You" section on OpenAI 403 and Reddit tool block.
- `docs/ai-engineering-brief/developer-newsletter-concept.md` (source weighting note: developer persona weights Reddit and HN heavily, so Reddit coverage matters more for Tokens Spent than for The Shift).
- `.claude/skills/wr-newsletter/SKILL.md` (step 2 source list and Tier-2 entries for Reddit; Tier-1 entry for OpenAI).
- `.claude/skills/wr-newsletter/personas/developer.md` (source weighting line that names r/LocalLLaMA and r/MachineLearning at the top of tier-2).
