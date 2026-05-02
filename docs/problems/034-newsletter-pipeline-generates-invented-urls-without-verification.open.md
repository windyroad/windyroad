# Problem 034: /wr-newsletter generates plausible-but-invented URLs and skips verification before save

**Status**: Open
**Reported**: 2026-05-01
**Priority**: 20 (Critical). Impact: Major (5) x Likelihood: Almost certain (4)
**Effort**: M
**WSJF**: (20 x 2.0) / 2 = 20.0 (weight 2.0: newsletter is primary repo activity per 2026-05-02 direction)

## Description

When the `/wr-newsletter` skill drafts a brief, the inline drafter constructs publisher URLs by inferring slugs from headlines (e.g. turning "Apple incoming CEO John Ternus faces a defining challenge" into `cnbc.com/2026/04/21/apple-incoming-ceo-john-ternus-...html`) without ever fetching them to verify they resolve. The resulting brief ships with broken links to the reader.

The skill's step 11 (Draft) and step 16 (Save) have no URL-verification gate. ADR 015 attribution rules cover whether a source is cited, not whether the URL resolves to the cited content.

## Symptoms

- 2026-05-01 edition of The Shift (Edition 3) shipped with at least 7 invented URLs:
  - 3× Apple CEO outlet URLs (CNBC, LA Times, Business Insider), confirmed HTTP 404 via curl
  - OpenAI on AWS partnership URL (`openai.com/blog/openai-aws-partnership`), invented slug
  - Claude status incident URL (`status.claude.com/incidents/9l93x2ht4s5w`), fabricated incident ID
  - AI Daily Brief URL, wrong domain (`theaidailybrief.com` instead of `aidailybrief.beehiiv.com`)
  - Blog reference (`/blog/an-ai-agent-deleted-production-...`), relative path, broken on LinkedIn
- User flagged the broken links post-publish: "I published the draft and there are invalid links."
- Recurring class: same pattern would have surfaced earlier had the verification step existed; it is documented as a follow-up in `~/.claude/projects/-Users-tomhoward-Projects-windyroad/memory/project_url_verification_skill.md`.

## Workaround

After draft, before save, manually fetch each URL via curl + spawn fresh-context subagent to verify article body matches brief claim. Replace 404s with verified canonical URLs found via DuckDuckGo HTML search. For publisher domains that block sips/curl/WebFetch, use `scripts/playwright-fetch.mjs` (added this session). For Cloudflare-blocked domains (`openai.com`), trust DuckDuckGo's confirmation since the URL is unverifiable from the local environment.

## Root Cause Analysis

### Root Cause

The drafter generates plausible URLs from headline tokens because (a) `WebFetch` returns headlines but often surfaces Google News redirect URLs that obscure publisher canonical URLs, and (b) the skill's prompt for step 11 emphasises capture-fidelity for body content but does not mandate fetch-and-verify on each URL before save. The result: the drafter constructs URLs that look right, ships them, and the reader finds them broken.

### Fix Strategy

- **Kind**: improve
- **Shape**: skill (step amendment)
- **Target file**: `.claude/skills/wr-newsletter/SKILL.md` step 11 (or new step 11.5)
- **Edit summary**: Add a non-skippable URL-verification step between draft and save: for each URL in the draft, fetch via the appropriate transport (Playwright for JS-protected sites, curl for static, DuckDuckGo HTML for indirect), then spawn a fresh-context subagent that compares article body against the brief's specific claim and returns SUPPORTED / REFUTED / NOT MENTIONED. Block save on REFUTED or 404.
- **Companion**: commit `scripts/playwright-fetch.mjs` (added this session) into `scripts/` and reference it in the skill prose.

## Related

- This retrospective: 2026-05-01 edition retro
- Memory note: `feedback_verify_project_state_before_writing.md` (P032), verification before assertion
- Memory note: `project_url_verification_skill.md`, pre-existing follow-up flagged but skipped
