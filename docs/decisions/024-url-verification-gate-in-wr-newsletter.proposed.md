---
status: "proposed"
first-released:
date: 2026-05-02
decision-makers: [Tom Howard, Claude]
consulted: [wr-architect agent]
informed: []
---

# URL verification gate in /wr-newsletter

## Context and Problem Statement

The `/wr-newsletter` skill ships briefs to LinkedIn with broken or invented URLs. Edition 3 (2026-05-01) shipped with at least 7 invented URLs (3× Apple CEO outlets, OpenAI on AWS, Claude status incident ID, AI Daily Brief domain, blog reference relative path) and one factually-wrong paraphrase (carb-counting numbers). User flagged post-publish.

The root cause is structural: the inline drafter constructs plausible URLs from headline tokens, never fetches them, and the skill has no verification gate between draft and save. ADR 015 covers attribution adequacy; it does not cover URL existence or article-content fidelity.

P034 (URL invention) and P035 (paraphrasing drift) are companion tickets.

## Decision Drivers

- **Reader trust**: a brief with broken links and wrong numbers undermines the editorial integrity ADR 012/015/016/018 establish.
- **Reversibility**: invented URLs are caught only at publish time, when the cost is highest.
- **Mechanism reuse**: ADR 016/018/020 establish fresh-context subagents for review-gate isolation; the same pattern fits URL semantic verification.
- **Tooling availability**: macOS ships Playwright in the repo (1.58.2) and Chrome; the verification path is already implementable.

## Considered Options

1. **Add a URL-verification gate (step 11.5) between draft and save**. For each URL: fetch via Playwright, spawn a fresh-context subagent that compares article body to the brief's specific claim, return SUPPORTED / REFUTED / NOT MENTIONED. Block save on REFUTED or 404.
2. **Run verification only on publish-finalise (not prep)**. Cheaper but lets prep accumulate broken URLs that finalise must catch under time pressure.
3. **Trust the drafter; rely on user manual verification**. Status quo. Failed Edition 3.
4. **Strip URLs from the brief and provide outlet-name-only attribution**. Loses click-through; the brief is a LinkedIn newsletter where readers expect deep links.

## Decision Outcome

Chosen option: **1. Add a URL-verification gate as step 11.5 in /wr-newsletter, between draft (step 11) and cover image (step 12)**.

The gate runs on every URL in the draft body (Items + Also-worth-noting + From-Tom opener + frontmatter source links). For each URL:

1. **Fetch transport selection**:
   - JS-protected publishers (CNBC, BI, NYT etc.): `scripts/playwright-fetch.mjs` (Playwright + headless Chromium).
   - Static / RSS-style: `curl -A <browser-UA> -L -s` with HTTP status check.
   - Cloudflare-blocked from this environment (openai.com, web.archive.org): note as "URL confirmed via DuckDuckGo HTML search; not directly verifiable from local env" and proceed.
2. **Semantic verification**: spawn a fresh-context `general-purpose` subagent with the article body file path + the brief's specific claim. Subagent returns SUPPORTED / REFUTED / NOT MENTIONED + a verbatim quote.
3. **Save gate**:
   - All URLs SUPPORTED → proceed to step 12.
   - Any URL REFUTED → fix the brief or the URL; re-run.
   - Any URL returns 404 → replace with verified URL or drop the source link entirely.
   - NOT MENTIONED → flag for user; treat as REFUTED unless the user explicitly approves an inferred-but-unstated framing.

The gate runs in both `phase=prep` and `phase=finalise`. A prep-time PASS does not exempt finalise; finalise re-runs the gate on any new or changed URLs.

The skill's step 17 Tom-summary surfaces the per-URL verdicts so the user can spot-check.

## Consequences

### Good

- Zero broken / invented URLs at publish time.
- Catches paraphrasing drift on quantitative claims (the carb-counting case study) as a side-effect of body-content semantic comparison.
- Reuses the fresh-context subagent pattern already in production for the voice / content-risk / sw-critic / editor gates.
- `scripts/playwright-fetch.mjs` becomes durable infrastructure, useful beyond /wr-newsletter (any skill that needs publisher-domain access can call it).

### Bad

- Adds 5-15 minutes of subagent-fan-out time per edition (one fetch + one verification per URL; ~10-15 URLs typical).
- Cloudflare-blocked URLs (openai.com) cannot be directly verified from this environment; the gate must accept the secondary-evidence path (DuckDuckGo search confirmation) as best-available verification, which is weaker than article-body match.

### Neutral

- The gate produces an audit trail (per-URL verdicts in the Tom-summary) that strengthens ADR 015's attribution-adequacy claim.

## Confirmation

- (1) `/wr-newsletter` step 11.5 is documented and exercised across one full prep-finalise cycle without user intervention on URLs.
- (2) Edition 4 ships with zero invented URLs (verified via post-publish spot-check on a random sample of 5 URLs).
- (3) `scripts/playwright-fetch.mjs` is committed to the repo and referenced from the skill prose.
- (4) The Tom-summary at step 17 surfaces a per-URL verdict table.

Reassessment: if the verification step adds more than 30% to the edition's total time-to-publish, simplify (e.g. verify only Source-block URLs, not in-body links).

## More Information

- Companion problem tickets: P034 (URL invention), P035 (paraphrasing drift).
- Related ADRs: ADR 016 (sw-critic), ADR 018 (content-risk), ADR 020 (editor), fresh-context subagent precedent.
- Memory note: `~/.claude/projects/-Users-tomhoward-Projects-windyroad/memory/project_url_verification_skill.md`, this follow-up was flagged in memory before Edition 3 and skipped.
