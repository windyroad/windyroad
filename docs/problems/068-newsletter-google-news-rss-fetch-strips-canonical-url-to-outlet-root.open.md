# Problem 068: Newsletter URL discovery via Google News RSS strips canonical to outlet root; misses real article URL

**Status**: Open
**Reported**: 2026-05-15
**Priority**: 4 (Medium). Impact: 3 x Likelihood: 4 (deferred, re-rate at next /wr-itil:review-problems)
**Effort**: S (deferred, re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

The newsletter source-fetch step uses Google News RSS queries (per the OpenAI tier-1 fallback established in P010, generalised in /wr-newsletter SKILL.md Step 2 and Step 4b corroboration). The Google News RSS feed returns items with three URL surfaces:

1. The Google News redirect URL (`https://news.google.com/rss/articles/CBMi...?oc=5`). Long opaque base64 token; follows a redirect chain to the canonical outlet article URL.
2. The canonical outlet article URL (e.g. `https://www.axios.com/2026/05/14/mythos-cyberscurity-human-ai-models`). Resolves via the Google News redirect.
3. The outlet root (e.g. `https://www.axios.com`). Sometimes WebFetch's extraction processing returns just this when the redirect resolution times out or fails.

Witnessed 2026-05-15 finalise: the Axios article "The next phase of AI cybersecurity still needs humans" was returned by the US/UK AI policy Google News RSS query at extraction time as outlet-root `https://www.axios.com` (the redirect URL was lost in WebFetch's HTML-to-prompt processing). Multiple attempts to recover the canonical URL during this session failed:

1. Targeted Google News RSS query (`site:axios.com "next phase of AI cybersecurity still needs humans"`) returned channel metadata only (WebFetch parsed the RSS as a search results page with no item rows).
2. Playwright direct fetch of guessed URL slug (`/2026/05/14/ai-cybersecurity-humans-essential`) returned 404 (wrong slug; Axios uses `mythos-cyberscurity-human-ai-models` with a real spelling-typo).
3. Playwright fetch of Axios's search page returned 404 (Axios doesn't expose /search).
4. Raw curl on Google News RSS returned the redirect URL in the XML, but the redirect chain when followed returned the same Google News redirect URL plus a regional suffix, not the canonical outlet URL.
5. Tom supplied the canonical URL `/2026/05/14/mythos-cyberscurity-human-ai-models` directly. Playwright confirmed it resolved to the correct article. The slug uses the real typo "cyberscurity" which a guess-based recovery would never find.

The session's brief carried the Axios entry with outlet-only attribution (content-risk gate scored attribution=medium non-blocking). Tom resolved by supplying the URL pre-publish.

## Symptoms

- Google News RSS source-fetch returns items with article-level metadata (headline, outlet, date) but URLs default to outlet root after WebFetch processing.
- Recovery via additional Google News queries returns channel metadata, not the article.
- Recovery via guessed slugs hits 404 because outlet URL slugs are not derivable from headlines (typos, abbreviations, vary by outlet).
- Recovery via outlet search pages hits 404 because most outlets don't expose /search.
- Recovery via raw RSS curl gets the Google News redirect URL but the redirect chain does not resolve to the canonical outlet URL without further work (likely needs to follow JavaScript-based redirects in a real browser).

## Workaround

Use Playwright fetch on each Google News redirect URL to follow it to the canonical outlet URL. Existing helper `scripts/playwright-fetch.mjs` returns the FINAL_URL after redirect, but only for URLs already known. Apply this systematically to every Google News RSS source-fetch return.

Alternative: accept outlet-only attribution and surface as content-risk attribution=medium per the rubric (current fallback shape).

## Impact Assessment

- **Who is affected**: Tom; every newsletter edition that cites a paywalled or JS-protected outlet via Google News RSS (NYT, Bloomberg, WSJ, Reuters, Axios, Politico).
- **Frequency**: every edition with US/UK AI policy or US AI business sources. Witnessed 3+ times across recent editions (Issue 03 NYT lobbying blitz, Issue 04 NYT $950B valuation, Issue 05 Axios humans-in-the-loop).
- **Severity**: Medium. Content-risk rubric allows outlet-only attribution as fallback (medium flag, non-blocking). Reader-facing artefact carries outlet name but no clickable link to the specific article; reduces verifiability + reduces forwarding-value for readers who want to share the underlying source.
- **Analytics**: deferred to investigation.

## Root Cause Analysis

### Hypothesis

The Google News RSS feed encodes article URLs as opaque base64 tokens that decode to a Google News redirect that JS-redirects to the canonical outlet URL. WebFetch's HTML-to-prompt processing strips the redirect URL to the outlet root because the canonical URL is not visible in the raw RSS XML; only the redirect URL is. The redirect resolution requires:

1. Following the Google News redirect with a real browser (the redirect uses JS-injected navigation, not HTTP 301/302).
2. OR decoding the base64 token (the encoded payload contains the article ID; Google's resolver produces the canonical URL).

Three possible fixes:

a. **Add a URL-resolution pass to the source-fetch step**: after WebFetch returns items, run each Google News redirect URL through Playwright to capture FINAL_URL. Adds 10-30 seconds per tier-1 fetch (acceptable in prep, less so in finalise).
b. **Decode the base64 redirect token**: write a script that parses the Google News redirect base64 and emits the canonical URL without a browser fetch. Faster but brittle (token format is undocumented and changes).
c. **Use a different source-fetch primitive for paywalled outlets**: instead of Google News RSS, hit each outlet's own RSS feed or atom feed where available. Outlet-direct RSS preserves canonical URLs but loses the breadth of Google News' aggregation.

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems.
- [ ] Pick fix shape (Playwright resolution vs base64 decode vs outlet-direct RSS).
- [ ] If Playwright resolution: add a step to /wr-newsletter SKILL.md Step 2 that runs `scripts/playwright-fetch.mjs` on each Google News redirect URL returned by tier-1 / tier-2 Google News fetches. Cache the FINAL_URL alongside the item metadata.
- [ ] If base64 decode: prototype the decode against the live Google News RSS XML; verify FINAL_URL matches Playwright-resolved version on 5+ samples.
- [ ] If outlet-direct RSS: identify which outlets have stable RSS feeds (NYT, Reuters do; Axios, Politico, Bloomberg variable).

## Dependencies

- **Blocks**: (none)
- **Blocked by**: P010 (source fetch blocks OpenAI and Reddit; Google News RSS is the OpenAI fallback that this issue surfaces on).
- **Composes with**: P051 (newsletter tier-1 source list misses US regulatory news outlets). P051 added the Google News RSS US/UK policy and US business queries; this ticket is the URL-resolution follow-on that surfaced when those queries went into production.

## Related

- /wr-newsletter SKILL.md Step 2 (Google News RSS source-fetch)
- /wr-newsletter SKILL.md Step 4b (corroboration via Google News RSS)
- P010 (source fetch blocks)
- P014 (Playwright helper)
- P051 (US AI regulatory and business news sources added via Google News RSS)
- ADR-024 (URL verification gate; the gate scored Axios entry attribution=medium this session)
- 2026-05-15.reviews.md (URL Verification block with the Axios outlet-only citation)
- Captured via /wr-retrospective:run-retro on 2026-05-15 session.
