# Problem 093: newsletter structural-lint check (b) should flag single bare unlinked outlets, not only 2+

**Status**: Closed
**Reported**: 2026-06-16
**Priority**: 6 (Medium). Impact: Moderate (3) x Likelihood: Unlikely (2)
**Origin**: internal
**Effort**: M
**WSJF**: 3 = (6 x 1) / 2
**Type**: technical

## Description

The P089 structural-lint `scripts/check-newsletter-structure.sh` check (b) flags a link-free line only when it names TWO OR MORE distinct news outlets (the "corroborated by Reuters, FT, NYT, and WSJ" unlinked-list defect). A SINGLE bare unlinked outlet name is currently NOT flagged (accepted trade-off for zero false-positives on the known-good format, e.g. the legitimate back-reference "the WSJ piece is worth reading").

User direction (2026-06-15, P089 review gate): **also flag single bare outlets**, accepting more false-positives on legitimate back-references that get whitelisted. Tom's rule across the newsletter pipeline is: do not name a news site without linking it.

## Symptoms

- A draft naming a single outlet without a link (e.g. "Bloomberg reported the loss" with no inline link) passes check (b) silently.
- The name-without-link defect Tom corrected in Issue 09 is only partially caught (2+ outlets), not the single-outlet case.

## Impact Assessment

- **Who is affected**: Engineering Leader readers (attribution credibility); Tom (catches the single-outlet case manually).
- **Frequency**: per edition where a single outlet is named without linking.
- **Severity**: Medium. Refinement of an already-shipped deterministic gate; closes the remaining gap in the name-without-link invariant.

## Root Cause Analysis

### Hypothesis

Check (b)'s `hits >= 2` threshold was chosen for zero false-positives. To flag single outlets without false-positiving on legitimate back-references (where the outlet IS linked elsewhere in the same item), the check needs per-item linked-outlet tracking: collect the outlets that appear inside a markdown link within the item (by anchor text AND by URL domain, including syndication domains: finance.yahoo.com may carry a Bloomberg piece, yahoo.com/news an Axios piece), then on a link-free line flag any named outlet NOT in the item's linked set. The syndication-domain mapping is the non-trivial part (Issue 09's Bloomberg link is a finance.yahoo.com URL; Axios is a yahoo.com URL), so naive domain-matching is insufficient.

## Fix Strategy

- **Kind**: improve
- **Shape**: script + test fixture
- **Target file**: `scripts/check-newsletter-structure.sh` (check b) + `scripts/check-newsletter-structure.test.mjs`.
- **Edit summary**: lower check (b) to flag a link-free line naming ONE OR MORE outlets, with an "already-linked-in-this-item" carve-out: an outlet named bare passes only if that same outlet appears inside a markdown link earlier/later in the same item (matched by anchor text OR by URL, including a syndication-domain map for finance.yahoo.com -> Bloomberg, yahoo.com/news -> Axios, plus the canonical outlet domains). Validate the published Issue 09 brief still PASSES (its "the WSJ piece" back-reference is legitimate because WSJ is linked in Item 2 via a wsj.com URL). Add vitest cases: single bare unlinked outlet flagged; single bare outlet with same-item link passes (back-reference); syndication-domain back-reference passes.
- **Evidence**: P089 review, Tom's direction "Also flag single outlets" (2026-06-15).

## Resolution

Implemented 2026-06-16. Check (b) in `scripts/check-newsletter-structure.sh` was restructured from a line-level `hits >= 2` test to a per-item accumulator: each `### `-delimited item builds a set of linked outlets from its link-bearing lines (by outlet name on a link line, by canonical outlet domain, and by the syndication-domain map finance.yahoo.com -> Bloomberg / yahoo.com/news -> Axios), then flushes at each item boundary and EOF, flagging any link-free line that names an outlet NOT in that item's linked set. A single bare unlinked outlet now flags; legitimate same-item back-references ("the WSJ piece is worth reading") pass via the carve-out. The 2+ behaviour is preserved as a subset.

Verified by 3 new behavioural vitest cases in `scripts/check-newsletter-structure.test.mjs` (single bare unlinked outlet flagged; same-item back-reference passes; syndication-domain back-reference passes) plus the unchanged published-Issue-09 fixture, which still PASSES. Full suite: 16/16 green. The lint runs at newsletter-build time and is live on commit (deterministic repo-local script; no npm release vehicle), so the ticket closes directly rather than entering the Verification Queue.

## Related

- P089 (parent : the structural-lint this refines; P089 is Verifying). Composes with the name-without-link invariant. Direct implementation of Tom's P089-review directive.
