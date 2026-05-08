# Problem 051: Newsletter tier-1 source list misses US regulatory-news outlets

**Status**: Open
**Reported**: 2026-05-08
**Priority**: 3 (Medium). Impact: 3 x Likelihood: 1 (deferred, re-rate at next /wr-itil:review-problems)
**Effort**: M (deferred, re-rate at next /wr-itil:review-problems)

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

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems.
- [ ] Decide tier-1 outlet list. Candidates for AI-policy coverage: Politico (politico.com/agenda/ai-policy or technology section), Axios (axios.com/technology/ai-policy), Reuters technology, NYT technology, Bloomberg technology, FT technology, WSJ technology. Default proposal: Politico + Axios + Reuters at tier-1 (free / RSS-able), NYT / Bloomberg / WSJ at tier-2 (paywalled but high signal).
- [ ] Decide query shape. Two options: (a) per-outlet feed URLs (politico.com/rss/politicopicks.xml or similar; axios.com/feeds/feed.rss); (b) a single Google News RSS query scoped across the named outlets ("(site:politico.com OR site:axios.com OR site:reuters.com) AI policy" type queries). Option (b) is the same shape as the existing OpenAI tier-1 workaround per P010 and likely simpler.
- [ ] Amend SKILL.md step 2 (tier-1 list and / or tier-2 list, depending on outcome of the prior task). Add to docs/ai-engineering-brief/ai-landscape.md "Source coverage" section.
- [ ] Decide whether the OAIC / EU AI Act / NIST / FTC / OECD tier-3 list also needs the regulatory-news complement, or whether the regulator-direct pages stay tier-3 and the news-about-the-regulator goes to tier-1 / tier-2 only. The two surfaces are different (regulator action vs reporter coverage of action).
- [ ] Reproduction test: after the source list ships, re-run the next prep cycle and verify the brief surfaces the next Trump White House / EU AI Office / FTC / NIST AI policy action without user-driven recall.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P010 (specific tier-1 URL fetch failures; same SKILL.md step 2 surface, different failure mode). P016 (corroboration step; the new tier-1 regulatory-news outlets would feed corroboration the same way Google News RSS does today). P032 / P045 / P050 family (assistant-discipline gaps; this ticket is the source-coverage analogue of those discipline tickets).

## Related

Captured via /wr-itil:capture-problem on 2026-05-08 from the finalise session, after Item 1 was expanded post-finalise to include the White House CAISI / pre-release-vetting story. Tier-1 corroboration set used in the recovery: NYT, Reuters, Politico, Axios, Washington Post (Cloudflare-blocked on Playwright; recoverable via search). Expand investigation at next /wr-itil:review-problems pass.
