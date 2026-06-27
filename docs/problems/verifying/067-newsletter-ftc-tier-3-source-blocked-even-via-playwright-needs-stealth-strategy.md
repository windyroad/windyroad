# Problem 067: Newsletter FTC tier-3 source blocked even via Playwright; deeper-than-UA bot detection

**Status**: Verification Pending
**Reported**: 2026-05-15
**Origin**: internal
**Priority**: 5 (Medium). Impact: Negligible (1) x Likelihood: Almost certain (5)
**Effort**: M
**WSJF**: 2.5 = (5 x 1) / 2
**Type**: technical

## Description

The newsletter tier-3 source `https://www.ftc.gov/news-events/news/press-releases` returns HTTP 403 to WebFetch. Witnessed 2026-05-14 prep: WebFetch 403 expected per P010 (Cloudflare-class bot detection). Tried the P014 Playwright helper (`scripts/playwright-fetch.mjs`) with a Chrome User-Agent string. Playwright also got a 403-equivalent body: "Apologies; the page you are requesting is currently unavailable. The request resembles an abusive automated request." So FTC's bot detection is deeper than User-Agent (likely TLS fingerprint, JS execution patterns, or proxy detection).

Workaround: Google News RSS scoped to `site:ftc.gov` returned the FTC's recent AI-related items. This is the documented fallback per P010. For Issue 05, FTC's most recent AI item via this fallback was March 24, 2026 (Air AI banned); no items in the May 7-15 window, so the failure was non-blocking for this edition (FTC is tier-3 continue-on-fail per the source-fetch policy).

Pattern observation: FTC remains tier-3 source-failure on every edition. Tom corrected the URL mid-session ("For FTC use the playwrite or pupeteer script"); the existing Playwright helper does NOT bypass FTC's deeper detection. Either:

1. The Playwright helper needs a stealth-plugin layer (puppeteer-extra-plugin-stealth equivalent) to fool deeper detection.
2. Accept the Google News RSS fallback as the permanent FTC path; document it in the SKILL.md as the canonical FTC tier.
3. Drop FTC from the tier-3 list (the marginal regulatory signal beyond what Google News RSS surfaces is low).

## Symptoms

- `WebFetch https://www.ftc.gov/news-events/news/press-releases` returns 403.
- `node scripts/playwright-fetch.mjs https://www.ftc.gov/...` returns a Cloudflare-equivalent body: "request resembles an abusive automated request".
- Google News RSS `site:ftc.gov` works but is delayed and partial.

## Workaround

Use Google News RSS scoped to `site:ftc.gov`. Tier-3 continue-on-fail policy means the failure does not block the map mutation or the edition.

## Impact Assessment

- **Who is affected**: Tom; every newsletter edition where FTC AI activity might be relevant.
- **Frequency**: every edition (FTC fetched as part of the standard tier-3 source list).
- **Severity**: Low. Tier-3 continue-on-fail; the recurring failure is recorded in source_failures and the analysis runs without it. Marginal signal loss only.
- **Analytics**: deferred to investigation.

## Root Cause Analysis

### Hypothesis

FTC's WAF runs a TLS-fingerprinting layer plus JS-based behavioural detection that distinguishes Chrome-controlled-by-Playwright from a real human browser. Chrome's Selenium / Playwright control surfaces leak through:

- `navigator.webdriver` is true under Playwright.
- TLS handshake fingerprint (Cipher suites, extensions, EC curves order) differs from a real Chrome browser.
- Headless mode browser fingerprints are detectable (missing plugins, missing WebGL, etc.).

The stealth-plugin pattern (puppeteer-extra-plugin-stealth) addresses these by patching the browser instance to mask the leaks. Playwright has community stealth equivalents but they're not pre-installed.

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems.
- [x] Decide fix shape (stealth-plugin vs accept-fallback vs drop-FTC). RESOLVED 2026-06-27: a fourth, better option was found. FTC publishes an OFFICIAL machine-readable RSS feed at `https://www.ftc.gov/feeds/press-release.xml` that returns HTTP 200 (verified by curl this session); only the HTML page is WAF-blocked. Use the official feed. The stealth-plugin option was deliberately rejected (evading a federal regulator's WAF is an arms race + the wrong approach per `feedback_blocking_tools_is_a_signal` + the no-scraping posture of ADR-013).
- [x] ~~If stealth-plugin~~: rejected (see above).
- [x] If accept-fallback / official-feed: update the SKILL.md tier-3 entry for FTC. Done 2026-06-27: repointed the FTC tier-3 source from the WAF-blocked HTML page to the official RSS feed `https://www.ftc.gov/feeds/press-release.xml`, with an inline note that the HTML page 403s and the feed returns 200, and that stealth must not be pursued. Updated the "currently-blocked sources" note (FTC resolved; OECD's separate issue retained).

## Fix Released

Released 2026-06-27 (repo-local skill change; release == committed per ADR-022, no changeset). Architect PASS (ALIGNED: ADR-031 anticipated P067 and the official-feed path is more conservative than the forecast stealth fetcher; matches the skill's established RSS-preference pattern; stealth-rejection consistent with ADR-013 no-scraping posture).

- `.claude/skills/wr-newsletter/SKILL.md` line 186: FTC tier-3 source repointed `WebFetch https://www.ftc.gov/news-events/news/press-releases` (403, WAF-blocked beyond UA) -> `WebFetch https://www.ftc.gov/feeds/press-release.xml` (the official RSS feed, returns 200), with a prompt to extract the 5 most recent AI-related feed items + an inline do-not-repoint / do-not-stealth note.
- `.claude/skills/wr-newsletter/SKILL.md` line 191: "currently-blocked sources" note updated to mark FTC resolved.

Verification trigger: the next `/wr-newsletter` prep run fetches the FTC feed cleanly (HTTP 200, AI-relevant items extracted) with no 403 and no source_failures entry for FTC.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: P010 (source fetch blocks OpenAI and Reddit) and P014 (Playwright helper for tool-blocked sources). FTC is a new instance of the same class P010 originally described but represents a STRONGER bot-detection layer that P014's UA-spoofing-Playwright does not bypass.
- **Composes with**: (none)

## Related

- P010 (source fetch blocks OpenAI and Reddit). FTC is a new instance.
- P014 (Playwright helper). Helper does not bypass FTC's deeper detection.
- /wr-newsletter SKILL.md Step 2 tier-3 source list (FTC entry)
- Captured via /wr-retrospective:run-retro on 2026-05-15 session.
