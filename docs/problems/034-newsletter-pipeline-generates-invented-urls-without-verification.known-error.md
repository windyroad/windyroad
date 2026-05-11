# Problem 034: /wr-newsletter generates plausible-but-invented URLs and skips verification before save

**Status**: Known Error
**Reported**: 2026-05-01
**Priority**: 20 (Critical). Impact: Severe (5) x Likelihood: Likely (4) (re-rated 2026-05-10 per ADR 027: invented URLs in saved drafts can reach LinkedIn readers, L5 Severe; manual finalise review catches some, Likely)
**Effort**: M
**WSJF**: (20 x 1.0) / 2 = 10.0 (folklore weight 2.0 dropped per ADR 027; newsletter primacy now encoded in RISK-POLICY.md Impact rubric)

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

## Resolution Implementation

**Released**: 2026-05-11 (AFK work-problems iter 4, local commit on master, push pending per ADR-022).

Implemented step 11.5 URL verification gate in `.claude/skills/wr-newsletter/SKILL.md` per ADR-024 Decision Outcome. The gate sits between step 11 (Draft the brief) and step 12 (Generate cover image) and is non-skippable across `phase=prep`, `phase=finalise`, and `phase=full`. Sections shipped:

- **Step 11.5 (URL verification gate)**: documents the URL scope (Item Source lines, in-body citation URLs, Also-worth-noting blocks, From-Tom opener, frontmatter source links; persona CTA URLs excluded), transport selection rules (Playwright for JS-protected publishers, curl for static/RSS-style hosts, DuckDuckGo HTML for Cloudflare-blocked URLs tagged `INDIRECT_CONFIRMED` as a transport-class outcome), fresh-context semantic verification subagent contract (`Agent subagent_type: general-purpose` returning `SUPPORTED` / `REFUTED` / `NOT MENTIONED` plus verbatim quote, with explicit isolation from the rest of the brief per ADR 016/018/020 precedent), and save-gate semantics (SUPPORTED -> proceed; REFUTED -> fix and re-run, never save; 404 -> replace via DuckDuckGo search or drop link; NOT MENTIONED -> AskUserQuestion escalation, default treat-as-REFUTED unless author-approved inference).
- **Phase variant `11.5-prime`** (finalise only): re-verifies only new or changed URLs; carries forward prep-time verdicts on identical URL + claim sentences.
- **Audit trail**: per-URL verdict table written to `<draft-folder>/<publication-date>.reviews.md` under a new `## URL Verification` block per ADR-026 sibling-file convention. Columns: URL | Transport | Semantic verdict | Note.
- **Step 16 save templates**: `## URL Verification` block added to the prep, finalise (with `(prep)` / `(finalise)` split for audit-trail carry-forward), and full save templates. Reviews-sibling structure now seven blocks plus the LinkedIn-post voice review (was six).
- **Step 17 Tom-summary**: surfaces a one-line verdict headline (e.g. "9 SUPPORTED, 1 INDIRECT_CONFIRMED, 0 REFUTED") plus inline notes on save-gate interventions (REFUTED fixes, 404 replacements, NOT MENTIONED escalations). Full table lives in `.reviews.md`. Per ADR-024 confirmation criterion 4.
- **Failure modes**: three new entries cover REFUTED-the-drafter-cannot-resolve (AskUserQuestion + fix-or-drop), non-Cloudflare fetch failure (retry once, then 404 path or `FETCH_FAILED` with author approval), and multi-URL NOT MENTIONED (single batched AskUserQuestion + retro signal).
- **Phase model table** (top of skill): adds step 11.5 / 11.5-prime to the prep / finalise / full step lists.
- **Step 11 cross-reference paragraph** (P035 interim discipline): unchanged for this ship; ADR-024 confirmation criterion 1 ("step 11.5 documented AND exercised across one full prep-finalise cycle") is documentation-complete but exercise is verification-pending. The interim sub-section reduces to a one-line cross-reference after the first prep-finalise cycle runs without user intervention on URLs.

Architect: ALIGNED (review covered ADR-024 Decision Outcome compliance, fresh-context subagent layering (no dedicated agent file required for the trivial path-plus-claim contract; matches ADR-024 line 44 `general-purpose` decision), confirmation criteria coverage 1+3+4, ADR-019 non-regression, and noted the two non-blocking advisories that were incorporated before commit: explicit audit-trail destination `<publication-date>.reviews.md` and `INDIRECT_CONFIRMED` clarified as transport-class outcome not fourth semantic verdict).

JTBD: PASS across JTBD-200 (Signal from Noise: ensures included items are real), JTBD-203 (Peer Validation: broken sources destroy peer-validation utility), JTBD-205 (Shipped vs Demo: invented URLs are marketing-theatre-grade failure mode), JTBD-001 (Awareness, engineering leader credibility funnel), and JTBD-003 (Evaluation, demonstrated-proof-over-theory). No persona conflict; Tom's 5-15 min publisher cost is governed by ADR-024's 30% reassessment trigger, outside JTBD scope.

ADR alignment: ADR-024 (decision being implemented, status proposed -> stays proposed until automated promotion via first-released after exercise), ADR-026 (sibling-file convention for audit trail), ADR-016/018/020 (fresh-context subagent isolation pattern reused), ADR-019 (capture-fidelity inline rule unchanged; ADR-024 wraps over it once verified), ADR-014 (single commit covers skill amendment + ticket transition + README refresh), ADR-022 (transition to verifying gated on push).

**Verification triggers**:

- (ADR-024 criterion 1) Next prep + finalise cycle of `/wr-newsletter` runs step 11.5 + 11.5-prime end-to-end without user intervention on URLs.
- (ADR-024 criterion 2) Edition 4 ships with zero invented URLs (post-publish spot-check on a random sample of 5 URLs).
- (ADR-024 criterion 4) Tom-summary surfaces the per-URL verdict headline + interventions on the next edition.

On verification PASS, transition Known Error -> Verification Pending (.verifying.md) per ADR-022 (release age = git push date), then Verification Pending -> Closed per `/wr-itil:transition-problem`. ADR-024 itself gets `first-released: 2026-05-11` and status -> accepted via automated decision promotion (ADR-005) on the next release cycle.

## Related

- This retrospective: 2026-05-01 edition retro
- Memory note: `feedback_verify_project_state_before_writing.md` (P032), verification before assertion
- Memory note: `project_url_verification_skill.md`, pre-existing follow-up flagged but skipped
- ADR-024 (`docs/decisions/024-url-verification-gate-in-wr-newsletter.proposed.md`), URL verification gate decision shape
- Companion ticket P035 (paraphrasing drift; ADR-024 catches quantitative drift as a side-effect of body-content semantic comparison)
- `scripts/playwright-fetch.mjs` (durable transport for JS-protected publishers; committed in `a0f4a8f`)
