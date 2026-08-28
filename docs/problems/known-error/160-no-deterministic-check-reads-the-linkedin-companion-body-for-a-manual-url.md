# Problem 160: No deterministic check reads the LinkedIn companion body for a manual URL

**Status**: Known Error
**Reported**: 2026-08-23
**Priority**: 2 (Very Low), Impact: 1 x Likelihood: 2, derived at capture. Impact is 1 because the failure is a redundant brand line sitting beside an auto-injected article card: no reader loses anything, and the same rating is already carried by P114. Likelihood is 2 rather than 4 because P114 removed the instruction that caused it from both the SKILL and both persona configs, so a drafter now has no prompt to write the URL. What remains is the absence of a net, not a live pull toward the defect.
**Origin**: internal
**Effort**: S. One companion-scoped check in an existing script plus cases alongside the existing fixtures, the same size class as the check (o) work that shipped for P151.
**WSJF**: 4.0 = (2 x 2.0) / 1 (re-rated 2026-08-28 review: Open -> Known Error auto-transition, status multiplier 1.0 -> 2.0)
**JTBD**: JTBD-300
**Persona**: publication-author

## Description

`docs/VOICE-AND-TONE.md` line 261 states "Do NOT include a manual URL in the body of an auto-share post". Nothing enforces it deterministically.

`scripts/check-newsletter-structure.sh` has three companion-scoped checks: (f) model-name consistency, (l) length ceiling and (m) digest staleness. None reads the companion body for a URL. The only enforcement is the LinkedIn-post voice gate, which is an LLM verdict.

That gate is demonstrably non-deterministic on this finding. It FAILed Issue 13 on 2026-07-13, recorded in that edition's reviews sibling. It then passed a bare `windyroad.com.au` body line in five published editions: 2026-06-08, 2026-06-22, 2026-06-29, 2026-07-06 and 2026-07-20.

Measurement method, recorded per P159: `grep -qE '^windyroad\.com\.au[[:space:]]*$'` over `src/newsletters/published/leader/*/*.linkedin.md`, five hits across seventeen editions. A first pass at this count was wrong, because `grep -c` prints `0` and exits 1, so a `|| echo 0` fallback fired alongside it and every edition appeared to match.

P114 fixed the cause and this ticket is the missing net. The two are separate: removing the instruction takes away the reason a drafter writes the URL, but it does not stop a drafter who writes it anyway. P114's own record notes the non-determinism inside its How-to-verify section, which is read once at verification and then closed. That is a standing risk in a transient home, which is why it needs its own ticket.

## Symptoms

A LinkedIn companion ships with a manual URL in the body, in violation of a ratified guide rule, and every automated surface passes it.

## Workaround

Grep the draft companion before publishing: `grep -nE '^windyroad\.com\.au[[:space:]]*$' src/newsletters/drafts/<persona>/<date>/<date>.linkedin.md` should find nothing. This is the verification step P114 now carries.

## Impact Assessment

- **Who is affected**: readers of the LinkedIn edition, who see a redundant bare domain beside the auto-injected article card; and the publication author, whose ratified guide rule is unenforced.
- **Frequency**: five occurrences in seventeen leader editions before P114. Expected to be rare now that the instruction is gone, but unbounded, because nothing detects it.
- **Severity**: cosmetic per occurrence. The significance is that a ratified guide rule has no deterministic enforcement at all, so its compliance rate is whatever the LLM gate happens to produce that week.
- **Analytics**: none.

## Root Cause Analysis

The lint's own header states its purpose as catching "the class of structural + sourcing defects the five LLM review gates do not catch". A URL in the companion body is squarely that class and was never added.

### Investigation Tasks

- [ ] Add a companion-scoped check that fails when the post body carries a bare domain or markdown link.
- [ ] Scope it to the BODY only. The domain appears legitimately in the image footer and alt text in 2026-04-24 and 2026-05-01, and the carve-out does not govern those.
- [ ] Decide whether the check should be general (any manual URL) or specific (the brand domain). The guide rule is general; the observed defect is specific.
- [ ] Add cases alongside the existing fixtures in `scripts/check-newsletter-structure.test.mjs`.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P114 (the instruction-level cause, fixed 2026-08-23; this is the enforcement half), P122 (no gate owns within-edition structural mechanics; sibling shape on the brief rather than the companion), P079 (closed; narrowed the LinkedIn shape for auto-share extras but left the brand line exempt).

## Related

Captured via `/wr-itil:capture-problem`; expand at next investigation.

Surfaced by the risk review of the P114 fix on 2026-08-23, which named it as a distinct standing risk that the P114 commit records nowhere durable.

The Step 2b hang-off pre-filter returned ten candidates sharing a signal with this description, above the five-candidate cap, so the arbitration subagent was skipped per the contract and the list is recorded here for review-time re-evaluation: P077, P099, P114, P119, P122, P140, P151, P152, P154, P157. The nearest by shape are P122 and P114.
