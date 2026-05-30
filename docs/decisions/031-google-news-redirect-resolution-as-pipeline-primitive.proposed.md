---
status: "proposed"
date: 2026-05-30
human-oversight: confirmed
oversight-date: 2026-05-30
decision-makers: [Tom Howard, Claude]
consulted: []
informed: []
reassessment-date: 2026-08-30
---

# Google News redirect resolution as pipeline primitive

## Context and Problem Statement

The `/wr-newsletter` source-fetch step queries Google News RSS as a fallback for tier-1 outlets blocked by bot protection (OpenAI per ADR 010 workaround, later generalised in SKILL.md Step 2 and Step 4b corroboration). Google News RSS returns three URL surfaces per item: (a) the opaque Google News redirect URL (`news.google.com/rss/articles/CBMi...?oc=5`), (b) the canonical outlet article URL reached by following the redirect chain, and (c) the outlet root when redirect resolution fails or times out under WebFetch HTML-to-prompt processing.

P068 captured the recurring failure: WebFetch processing of the RSS feed strips the canonical URL and surfaces only the outlet root for many items (witnessed 2026-05-15: Axios story "The next phase of AI cybersecurity still needs humans" returned `https://www.axios.com` rather than `/2026/05/14/mythos-cyberscurity-human-ai-models`). Recovery via additional queries, slug guessing, outlet /search pages, and raw curl all fail because outlet slugs are not derivable from headlines (typos, abbreviations vary) and Google News redirects do not resolve to canonical URLs without JavaScript execution.

The existing helper `scripts/playwright-fetch.mjs` returns `FINAL_URL` after following the JavaScript redirect, but only for URLs already known. The fix is to apply it systematically to every Google News RSS source-fetch return.

## Decision Drivers

- **Reader verifiability.** Outlet-root attribution forces readers to search for the article themselves; canonical deep links preserve forward-clickability and source-checkability.
- **Pipeline determinism.** Per-item URL resolution should be a documented pipeline primitive, not ad-hoc recovery work the drafter has to invent each edition.
- **In-project surface.** The Playwright helper is already in `scripts/`; the fix lives in this project, not upstream agent-plugins (P068 architect finding).
- **Cost-of-resolution.** Playwright-per-URL adds wall-clock; the rule should be cost-aware (skip resolution when the canonical URL is already present in the RSS XML; only invoke Playwright when the WebFetch return is outlet-root or empty).
- **Failure-mode discipline.** When Playwright resolution fails too (paywall, anti-bot escalation), the rule should fall through to documented `source_failures` rather than fabricate a URL.

## Considered Options

1. **Playwright resolution as pipeline primitive** (chosen). Wire `scripts/playwright-fetch.mjs` into `/wr-newsletter` SKILL.md Step 2 + Step 4b corroboration as a documented sub-step: when the WebFetch return for a Google News RSS item is outlet-root or empty, invoke Playwright on the redirect URL to resolve to canonical. Cache the resolution to avoid re-fetching across prep + finalise of the same edition. Fall through to `source_failures` on Playwright failure.
2. **Strip URLs from the brief.** Use outlet-name-only attribution and skip the canonical-URL surface entirely. Loses click-through verifiability; reduces forwarding value for readers who want to share the underlying source.
3. **Drop Google News RSS as a source.** Use only direct WebFetch on tier-1 outlets. Loses coverage of bot-protected outlets where Google News RSS is the only viable path (the original P010 driver).
4. **Hand-curated URL fix-up after WebFetch.** Tom supplies canonical URLs pre-publish for any items that came back outlet-root. Status quo workaround; persists the per-edition manual tax that P068 was opened to remove.

## Decision Outcome

Chosen option: **Playwright resolution as pipeline primitive**, because it preserves source coverage (no outlet drops), preserves reader verifiability (canonical deep links), and removes the per-edition manual recovery tax. The Playwright helper already exists; the cost is wiring + documentation, not new infrastructure.

### Scope rung

The decision covers Google News RSS items only (the documented failure-mode surface). Direct WebFetch returns from tier-1 outlets are unchanged: if the outlet returns a canonical URL directly, no Playwright resolution is invoked. The rule fires on the specific pattern "Google News RSS source plus WebFetch return is outlet-root or empty".

### Shared-primitives composition

`scripts/playwright-fetch.mjs` stays the single Playwright-fetch primitive in the project. Subsequent newsletter-pipeline needs (e.g., the future stealth fetcher for FTC-class deeper bot detection per P067) compose with this primitive rather than duplicating it. This addresses the architect-noted shared-primitives question on P068 iter 4.

## Consequences

### Good

- Edition 06 forward: zero manual URL recovery for Google News RSS-sourced items.
- Reader-verifiability gap closed for the most common newsletter-source class.
- `scripts/playwright-fetch.mjs` graduates from "occasional helper" to "documented pipeline primitive" with documented invocation points.

### Bad

- Per-edition wall-clock increases by Playwright cost x number of Google-News-resourced items (estimated 1 to 3 seconds per item, 5 to 15 items per edition; 5 to 45 seconds added per finalise).
- Adds a documented failure surface (Playwright resolution fail) that needs its own fallback to `source_failures`.

## Confirmation

The fix is confirmed once `/wr-newsletter` Step 2 + Step 4b carry the Playwright-resolution sub-step in SKILL.md, the next prep + finalise cycle ships with zero manual URL recovery on Google News RSS items, and an audit of one edition's `<date>.reviews.md` shows the resolution audit-trail per item.

## Reassessment

Reassess after four editions: if per-edition Playwright cost exceeds 60 seconds wall-clock or fails for more than 20 percent of items, revisit the resolution strategy (caching window, batching, alternative resolver service).

## Related

- Resolves the architect-design blocker on P068 (work-problems iter 4, 2026-05-30).
- Composes with P067 (Newsletter FTC tier-3 source blocked even via Playwright; deeper-than-UA bot detection): the stealth fetcher P067 needs will compose with the primitive this ADR establishes rather than duplicate it.
- Composes with ADR 010 (OpenAI Google News RSS workaround), ADR 024 (URL verification gate), ADR 026 (reviews-and-meta-content to sibling files): the resolution audit-trail lives in `<date>.reviews.md` per ADR 026.
