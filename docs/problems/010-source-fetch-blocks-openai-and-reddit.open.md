# Problem 010: Tier-1 and tier-2 source fetches blocked by bot protection (OpenAI) and tool-layer refusal (Reddit)

**Status**: Open
**Reported**: 2026-04-17
**Priority**: 8 (Medium). Impact: Moderate (4) x Likelihood: Likely (2)

## Description

Two of the declared source tiers for the `/wr-newsletter` pipeline cannot be fetched via `WebFetch` on the first-run test:

1. **OpenAI news (tier-1)**: `https://openai.com/news/` returns HTTP 403. Cloudflare or similar bot protection rejects `WebFetch`'s client fingerprint. Tom can load the same URL in a browser without issue, confirming the block is client-side, not a service outage.
2. **Reddit (tier-2, r/LocalLLaMA + r/MachineLearning)**: Any `reddit.com` URL is refused at the Claude Code tool layer itself, before the network call. `WebFetch` returns "Claude Code is unable to fetch from www.reddit.com". RSS, `.json` endpoints, `old.reddit.com`, and `i.reddit.com` variants all refused.

OpenAI has a workable bypass (Google News RSS scoped `site:openai.com`). Reddit has no in-pipeline bypass.

## Symptoms

- Tier-1 source coverage drops from 3/3 (Anthropic, OpenAI, DeepMind) to 2/3 direct, triggering the map-mutation gate in SKILL.md step 5
- Tier-2 source coverage loses two of the seven declared feeds (both Reddit subs)
- Tom has to override the strict tier-1 rule manually when it fires on an OpenAI outage (which is effectively every week until the bypass is wired into the skill)

## Workaround

**OpenAI**: swap to `https://news.google.com/rss/search?q=site:openai.com&hl=en-US&gl=US` as the tier-1 Anthropic-peer source. Update SKILL.md step 2 tier-1 list with the Google News URL and a note that the direct URL is bot-blocked.

**Reddit**: no workable workaround via WebFetch. Queued follow-up is a Playwright helper (`scripts/fetch-reddit.mjs`) that launches headless Chromium out-of-band, writes JSON to `tmp/`, and the skill reads the file. Playwright is already a devDependency per PLAN.md. Until the helper is written, Reddit feeds stay in `source_failures` every run.

## Impact Assessment

- **Who is affected**: draft quality (lost signal from OpenAI native releases, open-weight discussions on r/LocalLLaMA, research on r/MachineLearning)
- **Frequency**: every weekly run until fixes are applied
- **Severity**: Medium. Alternate sources cover much of the signal (HN, Willison, Thoughtworks Radar, ArXiv) but Reddit's signal is distinctive for open-weight and practitioner discussion that does not hit HN frontpage.

## Root Cause Analysis

### Root Cause

**OpenAI**: edge-provider bot protection fingerprints the client. WebFetch's simpler fetch fails JS/TLS/User-Agent checks that browsers pass. Not a configuration error on our end.

**Reddit**: Claude Code explicitly refuses `reddit.com` at the tool layer. This is a deliberate block, not a network issue. Reason is likely a terms-of-service or rate-limit concern from the Claude Code side. No error message on the Reddit side because the request never reaches it.

### Fix Strategy

**Short-term (apply this week):**
- Update SKILL.md step 2 tier-1 OpenAI URL to Google News RSS scoped to `site:openai.com`. Leave a note that the direct URL is bot-blocked.
- Document Reddit as a known source gap in SKILL.md step 2; add to `source_failures` by default until helper exists.

**Longer-term:**
- Build `scripts/fetch-reddit.mjs` Playwright helper:
  - Launches headless Chromium
  - Visits `/r/X/top/.json?t=week` for each configured subreddit
  - Writes the JSON to `tmp/reddit-<sub>-<date>.json`
  - Exits cleanly
- Update SKILL.md step 2 to run the helper before fetching, then read the local JSON files via `Read`

**Even longer-term:**
- Reddit's official API with registered app + OAuth; probably overkill for read-only weekly use
- Third-party Reddit mirrors (redlib, libreddit) are unreliable and rotate availability

### Investigation Tasks

- [ ] Update SKILL.md step 2 with the OpenAI Google News workaround immediately
- [ ] Write `scripts/fetch-reddit.mjs` Playwright helper as a follow-up commit
- [ ] Update SKILL.md step 2 to invoke the helper once written
- [ ] Test whether the helper works reliably across sessions (headless Chromium + Cloudflare interactions)
- [ ] Consider other blocked sources surfaced during the first run (US FTC returned 403, OECD returned 404) and apply the same fix pattern

## Related

- `.claude/skills/wr-newsletter/SKILL.md` (step 2 source list)
- `docs/ai-engineering-brief/PLAN.md` (Sources table)
- ADR 013 (no automated LinkedIn scraping; precedent for deliberate exceptions to automation)
- Problem 007 (similar agent-loading mid-session friction)
