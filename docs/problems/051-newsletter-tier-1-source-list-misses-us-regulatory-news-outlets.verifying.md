# Problem 051: Newsletter tier-1 source list misses US regulatory-news outlets

**Status**: Verification Pending
**Reported**: 2026-05-08
**Priority**: 12 (Significant). Impact: Moderate (3) x Likelihood: Likely (4) (re-rated 2026-05-10 per ADR 027: tier-1 source coverage gap is pre-publish pipeline disruption at L3 Moderate; recurs every edition with US regulatory news, Likely)
**Effort**: M
**WSJF**: (12 x 1.0) / 2 = 6.0

## Description

The `/wr-newsletter` SKILL.md tier-1 source list at step 2 is currently restricted to vendor announcement pages: Anthropic news (`anthropic.com/news`), OpenAI via Google News RSS (`site:openai.com` per P010), and DeepMind blog. Tier-2 covers Hacker News, Simon Willison, AI Daily Brief, Thoughtworks Radar, ArXiv. Tier-3 covers regulatory bodies: OAIC, EU AI Act, NIST, FTC, OECD.

What is missing: **tier-1 regulatory-news outlets** that cover US (and EU / UK) AI policy actions before they appear on the regulator's own page. Politico, Axios, NYT technology, Reuters technology, Washington Post technology, Bloomberg technology, FT technology, WSJ technology. These outlets break AI-policy stories that affect engineering-leader procurement and security-review decisions days or weeks before the regulator publishes the action on its own page.

Live evidence (2026-05-08 finalise session): Tom asked "haven't the White House announced they are also reintroducing something like the UK AI Safety Institute". The story was real and tier-1 corroborated across NYT, Reuters, Politico, Washington Post, and Axios as of May 4-5, with Politico's URL slug referencing "CAISI" as the apparent new safety-testing body. None of the SKILL.md tier-1, tier-2, or tier-3 sources would have surfaced this story before publication. The brief's headline Item 1 (AISI cyber-capability evaluation) is directly strengthened by the US policy reversal it triggered, but the brief almost shipped without it because the source list does not reach this outlet class.

## Symptoms

- 2026-05-08 brief tier-1 refresh (step 2-prime, finalise) returned only 2 new items from OpenAI and 0 new from Anthropic / DeepMind. The Trump White House CAISI / pre-release-vetting story (May 4-5) was nowhere in the surfaced candidate set.
- Recovery cost: Tom recalled the story from external context, asked the assistant to verify, two Google News RSS queries surfaced 5 tier-1 primary outlets, Item 1 was expanded post-finalise to incorporate the policy response. Total recovery time: roughly one full additional finalise gate cycle worth of work.
- This is qualitatively different from P010 (specific URL fetch failures from Reddit, NIST, FTC, OECD). P010 is about endpoints that should work but do not. P051 is about endpoints that are not in the source list at all.

## Workaround

User-driven recall: when Tom remembers a story the assistant did not surface, the assistant runs a Google News RSS query, corroborates against tier-1 outlets, and grafts the result into the draft post-finalise. Friction: depends on the user's recall, not the source coverage; un-recalled stories ship missing.

## Impact Assessment

- **Who is affected**: every `/wr-newsletter` edition. The leader audience is governance-and-procurement focused; missing US AI-policy news weakens the brief's core value proposition.
- **Frequency**: at minimum every week the US administration takes a policy action (currently weekly to fortnightly cadence). Likely also affects EU AI Act enforcement actions when they precede the artificialintelligenceact.eu page update.
- **Severity**: medium. Brief-quality issue, not a content-risk or factual issue. Cumulative cost is one major story per edition that the assistant misses.
- **Analytics**: 2026-05-08 finalise transcript shows the recovery flow.

## Root Cause Analysis

### Fix Strategy (decided 2026-05-12 AFK iter 5)

- **Tier-1 outlet list**: Politico + Axios + Reuters (default proposal accepted). NYT + Bloomberg + WSJ added at tier-2 (paywalled but high signal; accessed via Google News snippets).
- **Query shape**: option (b), a single combined Google News RSS scoped query per tier. Form: `q=(site:politico.com+OR+site:axios.com+OR+site:reuters.com)+AI` for tier-1 and analogous for tier-2 (NYT, Bloomberg, WSJ). Matches the OpenAI P010 workaround mechanism; halves the failure surface vs three separate queries (one query failing only fails one source for the map-mutation gate per JTBD review feedback on tier-1 widening).
- **Failure-tracking semantics**: each combined query is treated as ONE source for `source_failures` and the tier-1 map-mutation gate, mirroring the OpenAI precedent.
- **Tier-3 regulator-direct pages (OAIC, EU AI Act, NIST, FTC, OECD)**: stay tier-3 unchanged. Regulator vs reporter distinction deferred to a separate investigation per architect review (P051 follow-up).
- **Primary-outlet allowlist in `three-lens-filter.md`**: not touched in this edit per architect recommendation. The new outlets are already covered by the allowlist's "non-exhaustive" clause (Reuters/NYT/Bloomberg/WSJ are explicitly named; Politico/Axios are policy-class outlets covered by the wire/established-publisher framing). Revisit if corroboration tagging in step 4b misbehaves on the new entries.
- **Standalone source-tier-policy ADR**: deferred per architect recommendation. Revisit after 2-3 editions on the expanded set when the reliability profile of the combined Google News RSS queries is known.
- **`docs/ai-engineering-brief/ai-landscape.md` "Source coverage" section**: not touched in this edit. That section is per-edition narrative prose, not a structural source-list. Next edition's prep flow updates it automatically.

### Investigation Tasks

- [x] Re-rate Priority and Effort at next /wr-itil:review-problems.
- [x] Decide tier-1 outlet list. Decided: Politico + Axios + Reuters at tier-1; NYT + Bloomberg + WSJ at tier-2.
- [x] Decide query shape. Decided: option (b) single combined Google News RSS query per tier.
- [x] Amend SKILL.md step 2. Shipped (see Fix Released below).
- [ ] Decide whether the OAIC / EU AI Act / NIST / FTC / OECD tier-3 list also needs the regulatory-news complement, or whether the regulator-direct pages stay tier-3 and the news-about-the-regulator goes to tier-1 / tier-2 only. The two surfaces are different (regulator action vs reporter coverage of action). **Deferred to a separate investigation post-verification.**
- [ ] Reproduction test: after the source list ships, re-run the next prep cycle and verify the brief surfaces the next Trump White House / EU AI Office / FTC / NIST AI policy action without user-driven recall. **Verification trigger.**

## Fix Released

Released to `origin/master` in AFK iter 5 of 2026-05-12 work-problems loop (commit pending; this iter's grain).

Concrete edits:

1. `.claude/skills/wr-newsletter/SKILL.md` step 2 Tier 1 block: appended `US/UK AI-policy news (via Google News RSS, P051)` entry using a single combined `q=(site:politico.com+OR+site:axios.com+OR+site:reuters.com)+AI` Google News RSS query. Mirrors the OpenAI P010 workaround shape (single query treated as one source for failure-tracking and the tier-1 map-mutation gate).
2. `.claude/skills/wr-newsletter/SKILL.md` step 2 Tier 2 block: appended `US AI-business news (via Google News RSS, P051)` entry using `q=(site:nytimes.com+OR+site:bloomberg.com+OR+site:wsj.com)+AI` for NYT, Bloomberg, WSJ. Tier-2 is continue-on-fail per existing policy.
3. `.claude/skills/wr-newsletter/SKILL.md` lines 131, 182, 219: replaced stale inline tier-1 enumerations (`Anthropic, OpenAI, DeepMind`) with back-references to the tier-1 block at step 2, per architect review pass 1 (durable; removes the staleness vector that would otherwise re-open every time the tier-1 list grows).
4. `docs/decisions/017-ai-brief-prep-and-finalise-phases.proposed.md` line 47 Constraints text: updated to reflect the expanded tier-1 set and opportunistically fixed the pre-existing `OpenAI via Playwright workaround` to `OpenAI via Google News RSS workaround per P010` drift.

Architect Review: PASS (after first-pass ISSUES FOUND addressed); JTBD Review: PASS (change serves JTBD-001 / JTBD-002 / JTBD-003 for the Engineering Leader persona via the Shift newsletter surface).

**Verification trigger**: next `/wr-newsletter` prep cycle (Mon/Tue 2026-05-18+) where the new tier-1 combined query surfaces at least one AI-policy story that the previous tier-1 list would not have caught. Recovery cost for the 2026-05-08 CAISI / pre-release-vetting story was ~1 full additional finalise gate cycle of work; verification PASS is "the recovery cost is zero on the next applicable story".

**Reassessment trigger**: if the combined Google News RSS query produces excessive noise or misses stories that the per-outlet RSS feeds (option (a) from the ticket) would have caught, revisit option (a) per the ticket's investigation task 2.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P010 (specific tier-1 URL fetch failures; same SKILL.md step 2 surface, different failure mode). P016 (corroboration step; the new tier-1 regulatory-news outlets would feed corroboration the same way Google News RSS does today). P032 / P045 / P050 family (assistant-discipline gaps; this ticket is the source-coverage analogue of those discipline tickets).

## Related

Captured via /wr-itil:capture-problem on 2026-05-08 from the finalise session, after Item 1 was expanded post-finalise to include the White House CAISI / pre-release-vetting story. Tier-1 corroboration set used in the recovery: NYT, Reuters, Politico, Axios, Washington Post (Cloudflare-blocked on Playwright; recoverable via search). Expand investigation at next /wr-itil:review-problems pass.
