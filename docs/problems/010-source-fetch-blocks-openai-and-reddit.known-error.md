# Problem 010: Tier-1 and tier-2 source fetches blocked by bot protection (OpenAI) and tool-layer refusal (Reddit)

**Status**: Known Error
**Reported**: 2026-04-17
**Transitioned to Known Error**: 2026-04-25 (review pass: root cause confirmed; OpenAI workaround applied; Reddit gap tracked in P014)
**Priority**: 9 (Medium). Impact: Moderate (3) x Likelihood: Possible (3)
**Effort**: L (transitive via P014, see Dependencies; marginal M for the Reddit cutover work in this ticket once the helper exists) <!-- transitive: L via P014 -->
**WSJF**: (9 x 2.0) / 4 = 4.5
**Re-rated 2026-04-25 (post-fix)**: Impact narrowed Significant (4) to Moderate (3) after OpenAI Google News RSS workaround landed in SKILL.md step 2. Tier-1 OpenAI coverage now flows every run; the residual gap is Reddit (developer persona's tier-2), which mostly affects Tokens Spent (zero subscribers as of 2026-04-25) until P014 ships. Likelihood unchanged at Possible (3) (Reddit miss recurs every weekly run). Score 12 to 9 reflects the OpenAI fix; full closure still gated on P014.
**Re-rated 2026-05-12 (P076 transitive)**: Effort marginal M to transitive L. Closure of P010 is strictly blocked on P014 (Playwright helper shipping); the Reddit workaround does not exist absent P014. Formalised the dependency via `## Dependencies` block below; transitive-effort rule (P076) propagates P014's L upward. WSJF 9.0 to 4.5 reflects the honest cost-to-deliver and prevents this ticket from out-ranking its blocker.

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

**OpenAI (applied 2026-04-25)**: SKILL.md step 2 tier-1 swapped from `https://openai.com/news/` to `https://news.google.com/rss/search?q=site:openai.com&hl=en-US&gl=US&ceid=US:en`. The Google News RSS aggregates openai.com syndications and is not bot-protected. Extraction prompt updated to reflect the aggregator format; downstream steps follow the Google News redirect to surface the canonical openai.com URL where present. The `.claude/skills/wr-newsletter/SKILL.md` step 2-prime path inherits the swap because it references tier-1 by name only (no separate URL list).

**Reddit (still open, tracked in P014)**: no workable workaround via WebFetch. SKILL.md now annotates the Reddit tier-2 entries as "Known source gap (P014)" and defaults them to `source_failures` every run. The entries are kept (not deleted) so the canonical config is in place for the P014 Playwright helper to consume once shipped. Until P014 ships, Reddit feeds stay in `source_failures` every run.

**Other blocked sources documented in SKILL.md (2026-04-25)**: US FTC press releases (403, same Cloudflare-class as OpenAI) and OECD AI news (404, URL drift) are noted in the SKILL.md step 2 footer with the recommended fallback pattern: Google News RSS scoped to the site domain for bot-protection-class blocks; defer to P014 helper for tool-layer-refusal-class blocks.

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

- [x] Update SKILL.md step 2 with the OpenAI Google News workaround immediately (landed 2026-04-25; tier-1 OpenAI entry swapped, step 2-prime inherits via name-only reference)
- [ ] Write `scripts/fetch-reddit.mjs` Playwright helper as a follow-up commit (deferred to P014; SKILL.md now annotates Reddit entries as "Known source gap (P014)" so the gap is visible rather than silent)
- [ ] Update SKILL.md step 2 to invoke the helper once written (deferred to P014)
- [ ] Test whether the helper works reliably across sessions (headless Chromium + Cloudflare interactions) (deferred to P014)
- [x] Consider other blocked sources surfaced during the first run (US FTC returned 403, OECD returned 404) and apply the same fix pattern (documented in SKILL.md step 2 footer 2026-04-25 with the bot-protection-vs-tool-layer-refusal pattern; concrete URL swaps deferred until those failures recur on a non-tier-3 source or someone has bandwidth to apply the FTC/OECD-specific Google News queries)

## Dependencies

- **Blocks**: (none)
- **Blocked by**: P014
- **Composes with**: (none)

Closure of P010 is strictly blocked on P014 (Playwright helper for tool-blocked sources) shipping. The Reddit half of P010's symptom set has no in-pipeline workaround; only P014's helper can land a fix. OpenAI workaround already shipped 2026-04-25 (Google News RSS scoped to `site:openai.com`), so that half is functionally addressed but the ticket cannot close until both source-tier symptoms clear. Transitive-effort rule (P076) propagates P014's L upward; see WSJF re-rate dated 2026-05-12 above.

## Related

- `.claude/skills/wr-newsletter/SKILL.md` (step 2 source list)
- `docs/ai-engineering-brief/PLAN.md` (Sources table)
- ADR 013 (no automated LinkedIn scraping; precedent for deliberate exceptions to automation)
- Problem 007 (similar agent-loading mid-session friction)
