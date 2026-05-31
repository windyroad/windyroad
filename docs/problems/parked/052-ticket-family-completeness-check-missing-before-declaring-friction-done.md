# Problem 052: Ticket-family completeness check missing before declaring friction "done"

**Status**: Parked
**Reported**: 2026-05-10
**Origin**: internal
**Priority**: 12 (High). Impact: Moderate (3) x Likelihood: Likely (4) (re-rated 2026-05-10 per ADR 027: process-discipline gap that misclassifies friction "done" affects newsletter pipeline quality at L3 Moderate; live this session in three friction classes simultaneously, Likely)
**Effort**: M
**WSJF**: 0 (parked; multiplier 0 per ADR-022)

## Description

When closing or reviewing a problem ticket, the framework does not run a sibling-family scan: tickets sharing a friction-class keyword (source-fetch, cover-image, editorial-meta, etc.) that are still `.open.md` or `.known-error.md` are not surfaced before the close is allowed. The result is that we mark the friction class "addressed" while sibling work that the same friction depends on stays open, and the friction recurs every cycle.

Tom's marquee 2026-05-08 retro finding (verbatim): *"items we had flagged previously, we had 'done' all the relevant problem tickets, but not all the relevant problem tickets were done, hence the repeated friction."*

Live evidence (2026-05-08 newsletter prep + finalise + retro session, three friction classes simultaneously):

1. **Source-fetch friction class**. P010 (`.known-error.md`, OpenAI 403 + Reddit blocked at tool layer), P014 (`.known-error.md`, Playwright helper for tool-blocked sources deferred), P034 (`.open.md`, `/wr-newsletter` generates plausible-but-invented URLs and skips verification before save), and P051 (just-opened, tier-1 source list misses US regulatory-news outlets) all in flight at the same time. Both P010 and P014 sit at `.known-error.md` (acknowledged, workaround exists). But every edition the workaround has to be re-derived: this edition needed a hand-rolled Playwright resolver script `scripts/resolve-gnews-urls.mjs` to convert news.google.com redirects to direct outlet URLs because WebFetch was rate-limited on Verge / WaPo. The script closes a piece of P014, but the helper proper (a `wr-newsletter`-integrated step that fans out the resolver against the source-failures list) is still wanted. Marking P010 + P014 as known-error obscures the per-edition tax.

2. **Cover-image friction class**. P037 (`.open.md`, cover-image step requires 15+ iteration rounds; brand-asset grep + font-rendering diagnostics missing), P044 (`.open.md`, /wr-newsletter needs a dedicated cover-image skill with templated SVG + render script), and P011 (`.verifying.md`, visual artifacts shipped without render-verify discipline). P011 is verifying after the render-verify pattern shipped, but P037 + P044 are open and the pattern's productisation is still wanted. P050 captured this edition's recurrence (cover image scope-creep when Tom said "use last week's cover svg as a template" and the assistant changed font sizes + y-positions + added a third subtitle line).

3. **Editorial-meta friction class**. P036 (`.verifying.md`, editorial-process meta-commentary leaks into reader-facing body) released 2026-05-07 with an editorial-meta rule added to `/wr-newsletter` SKILL.md step 11 voice rules. The 2026-05-08 finalise session put pipeline-meta about the WaPo Cloudflare block into the brief body anyway: *"(URL not Playwright-resolvable due to Cloudflare; available via search at washingtonpost.com)"*. Tom called FFS and re-stated the rule explicitly. The shipped rule covered evidence-stance language (the case P036 originally captured) but did not catch the sibling case of pipeline-diagnostic prose. P036 verification is therefore exercised-with-regression: the rule caught the case it was designed for, but the friction class as a whole is not addressed.

## Symptoms

- 2026-05-08 retro Step 4a found 11 verifying tickets exercisable for close, but Tom's marquee finding requires deferring all closes pending the sibling-family check; without the check, closing P011 would obscure P037 + P044's open status and the cover-image friction would recur the same way it did this edition.
- 2026-05-08 finalise session re-derived the Playwright news.google URL resolver from scratch and committed it as `scripts/resolve-gnews-urls.mjs`. That work has been done and undone N times because P014 sits at known-error: every edition that hits the friction reinvents the wheel without P014's WSJF advancing.
- The `## Related` section on each ticket already names sibling tickets via Composes-with, but `/wr-itil:transition-problem` and `/wr-itil:review-problems` do not enforce or surface that graph at close-time.

## Workaround

Manual: at retro time, list all verifying tickets and, before close, scan keyword overlaps with `.open.md` and `.known-error.md` filenames. Tom did this implicitly in the 2026-05-08 retro by deferring 10 close-candidates to a future `/wr-itil:review-problems` pass.

## Impact Assessment

- **Who is affected**: every retro and every `/wr-itil:transition-problem` close-flow on a ticket whose friction class is not fully addressed. Frequency: weekly to fortnightly per edition retro cycle, plus every AFK iteration close.
- **Frequency**: at least one occurrence per retro this session; recurrence-pattern observed across 4+ editions on the source-fetch class.
- **Severity**: Significant. Misframed closes accumulate hidden tax across editions; the same workaround gets re-derived without WSJF re-rating; readers / users see the friction through degraded output (this edition: cover-image scope-creep + pipeline-meta-in-body + tier-1 source-coverage gap).
- **Analytics**: 2026-05-08 retro summary captures 11 verifying ticket close-candidates plus 2 regression flags (P016, P036); P050 + P051 + P052 (this ticket) all opened the same retro cycle.

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems.
- [ ] Decide codification shape. Two candidates: (a) read-only advisory script (similar to `wr-retrospective-check-readme-jtbd-currency`) invoked at retro Step 4a that surfaces sibling-family completeness gaps inline; (b) improvement to `/wr-itil:transition-problem` (or `/wr-itil:review-problems`) that runs a friction-class keyword scan and lists open / known-error siblings before allowing close. Default proposal: start with (a) because it's lower-risk and the surfacing alone is high-value; promote to (b) if the advisory pattern is ignored across N retros.
- [ ] Decide friction-class taxonomy. Candidates: source-fetch, cover-image, editorial-meta, ASK-hygiene, hook-protocol, release-path, subagent-delegation, manage-problem-flow. Could be ticket-tag-driven (a new `## Friction-class` section on each ticket) or keyword-driven (greppable from title + Description).
- [ ] Reproduction test: after the advisory script ships, re-run a retro on a known cluster (P010 + P014 + P034 + P051) and verify the script reports the cluster.

## Dependencies

- **Blocks**: closing P011 (cover-image render-verify) until P037 + P044 are factored. Closing P035 / P038 / P040 / P041 (newsletter editorial / sibling-file family) until P036 regression is addressed.
- **Blocked by**: (none)
- **Composes with**: P032 (verify before asserting; same discipline-gap shape, different surface). P045 (assistant accepts upstream-placement framing without questioning; same shape on placement). P050 (assistant scope-creeps on corrections; same shape on edit-scope). P051 (tier-1 source coverage gap; same shape on source-coverage). P078 (capture-on-correction; the surface where corrections fire). P088 (run-retro context-marshalling deferred; the retro is the surface where this check fires).

## Related

Captured via `/wr-itil:capture-problem` on 2026-05-10 from the 2026-05-08 retro Step 4b Stage 1. Tom's marquee retro finding was the trigger. Live cluster evidence: P010 + P014 + P034 + P051 (source-fetch); P037 + P044 + P011 (cover-image); P036 + P016 (editorial-meta + filter-corroboration). Expand investigation at next `/wr-itil:review-problems` pass.

- **Reported upstream**: https://github.com/windyroad/agent-plugins/issues/187 (2026-05-31)

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/187
- **Reported**: 2026-05-31
- **Template used**: structured default (problem-shaped per ADR-033)
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes

## Parked

- **Reason**: upstream-blocked. The genuine fix sites live in upstream plugins at `~/.claude/plugins/cache/windyroad/<plugin>/<version>/`. Two codification homes named in the ticket Investigation Tasks both resolve to upstream prose: (a) advisory script at retro Step 4a lives in `wr-retrospective` plugin (`skills/run-retro/SKILL.md`); (b) close-flow / close-eligibility extension lives in `wr-itil` plugin across two skills (`skills/transition-problem/SKILL.md` pre-flight checks plus `skills/review-problems/SKILL.md` Step 9d close-eligibility logic). This project has no `packages/wr-itil/` or `packages/wr-retrospective/`; downstream marketplace consumer cannot edit cached SKILL.md prose without losing the change on next plugin update. No local-codifiable surface exists.
- **Verified persistence**: latest cached `wr-itil@0.38.0` plus `wr-retrospective@0.21.4` still ship the gap. `transition-problem/SKILL.md` Pre-flight checks block (lines 75 to 94) is destination-specific (Open to Known Error gates on root-cause identification; Known Error to Verifying gates on fix-implemented; Verifying to Closed gates on user-confirmation) and does NOT include a sibling-family / friction-class scan. `review-problems/SKILL.md` Step 9d close-eligibility surfaces verifying tickets ready for user confirmation, but the graph walk (line 58) explicitly states "Ignore `**Composes with**` (does not propagate)"; the friction-class sibling-family check the ticket proposes would need to either extend the close-eligibility graph walk to honour Composes-with edges, or add a separate friction-class keyword scan layered on top. `run-retro/SKILL.md` Step 4a similarly has no friction-class advisory surface. Verified 2026-05-31 by reading the three cached SKILL.md files.
- **Upstream issue status**: not yet filed. Same shape as P042 / P049 / P060 / P073 / P048 (parked with upstream issue deferred to next interactive session). File via `/wr-itil:report-upstream` next time Tom is at the keyboard; classify as problem-report per ADR-033 primary classifier; possible split into two issues (one per plugin) given the cross-plugin fix surface.
- **Un-park trigger**: a new `wr-itil` plugin release whose `transition-problem/SKILL.md` pre-flight (or `review-problems/SKILL.md` Step 9d close-eligibility) implements a friction-class keyword scan listing open / known-error siblings before allowing close, OR a new `wr-retrospective` release whose `run-retro/SKILL.md` Step 4a invokes an advisory script surfacing sibling-family completeness gaps inline. Verify by re-reading the cached files in the new version. Close P052 once a retro session and a manage-problem close-flow each report sibling-family completeness gaps before allowing close.
- **Local impact while parked**: existing Workaround (manual at retro time: list all verifying tickets, scan keyword overlaps with `.open.md` and `.known-error.md` filenames before close; Tom did this implicitly in the 2026-05-08 retro by deferring 10 close-candidates to a future `/wr-itil:review-problems` pass) remains the operating contract. Risk is detect-by-discipline-not-by-skill: the manual scan can be skipped on a hurried retro and the friction class will recur. Live evidence in the ticket body: three friction classes (source-fetch, cover-image, editorial-meta) simultaneously misframed as "done" the same retro cycle. Live composing-with-friction this AFK loop: iters 5 (P047), 6 (P033), 8 (P049), 14 (P029), 15 (P046), 16 (P048) all `wr-itil` plugin surfaces parked upstream-blocked without filing upstream issues; that backlog of unfiled `wr-itil` upstream issues IS itself the source-fetch friction class for this AFK loop (recurring upstream-blocked decisions accumulate without batch upstream-issue-filing pass).
- **Composes with**: P032 (verify before asserting; discipline-gap shape), P045 (placement-authority before propagating; discipline-gap shape), P050 (scope-creep on corrections; discipline-gap shape), P051 (tier-1 source coverage gap on source-coverage), P078 (capture-on-correction surface), P088 (run-retro context-marshalling deferred; the retro is the surface where this check fires). Also composes with P031 (parked, upstream #85), P049 (parked), P048 (parked) as fourth `wr-itil` plugin surface this AFK loop has touched on the close-flow / review-problems contract: P031 covers reactive script-path resolution; P049 covers section-order assumption false-positive STALE; P048 covers P094 README refresh contract on create-paths; P052 covers preventive sibling-family scan on close-paths.
- **Date parked**: 2026-05-31
