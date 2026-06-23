# Problem 091: wr-newsletter should ask the user for unresolvable source URLs instead of dropping or degrading attribution

**Status**: Closed
**Reported**: 2026-06-15
**Priority**: 6 (Medium). Impact: Moderate (3) x Likelihood: Unlikely (2) (re-rated 2026-06-15)
**Origin**: internal
**Effort**: S
**WSJF**: 6 = (6 x 1) / 1
**Type**: technical

## Description

During Issue 09, the pipeline could not resolve canonical article URLs for paywalled / JS-protected outlets (WSJ, Bloomberg, NYT, Axios) because Google News RSS exposed only bare publisher domains. The agent initially DROPPED the outlet names (or named them without linking) rather than asking the user for the URLs. Tom corrected this with strong affect: "AND I'M FUCKING HERE TO HELP. If you cannot resolve a URL, ask me. FFS." When Tom supplied the canonical URLs, every item was properly attributed in minutes.

The pipeline (and the drafter discipline) should have an explicit "ask the human for source URLs it cannot resolve" step rather than silently dropping or degrading attribution.

## Symptoms

- WSJ / Bloomberg / NYT / Axios deep links were unresolvable via Google News RSS (bare domains only) and curl (403 paywall / bot-protection).
- The agent dropped outlet names / used name-without-link instead of asking.
- Tom supplied the URLs on request and the attribution was completed.

## Impact Assessment

- **Who is affected**: the Engineering Leader reader (attribution credibility); Tom (had to notice the dropped attribution and prompt for the ask).
- **Frequency**: every edition that cites paywalled / JS-protected outlets, which is most editions.
- **Severity**: Medium. Silent attribution degradation undermines the newsletter's credibility signal; the user is present and willing to supply URLs but was not asked.

## Root Cause Analysis

### Hypothesis

The URL-verification gate (step 11.5, ADR-024) handles transport selection and semantic verification but has no "ask the human" branch when a canonical URL cannot be resolved from any automated transport. The drafter defaults to dropping/degrading rather than surfacing an AskUserQuestion for the missing URLs. Add an explicit ask-the-user step (batched) for unresolvable source URLs before save.

## Fix Strategy

- **Kind**: improve
- **Shape**: skill
- **Target file**: `.claude/skills/wr-newsletter/SKILL.md` step 11.5 (URL verification) and step 11b (drafter discipline).
- **Edit summary**: add a branch that, when a source URL cannot be resolved from any automated transport (RSS, curl, Playwright, DuckDuckGo), collects the unresolved citations and asks the user (single batched AskUserQuestion) for the canonical URLs rather than dropping the outlet name or naming-without-link. Only proceed to drop a citation after the user declines to supply a URL.
- **Evidence**: Issue 09; Tom's correction "If you cannot resolve a URL, ask me."

## Related

- Retro 2026-06-15. Composes with ADR-024 (URL verification gate), P089 (drafter-discipline cluster: name-without-link is the surface symptom this ticket's ask-step prevents). Reinforces the reader-respect + attribution-fidelity direction.

## Fix Released

Fixed in `.claude/skills/wr-newsletter/SKILL.md` (repo-local skill; no changeset):

- **Step 11.5 (URL verification gate, ADR-024)**: amended the `HTTP 404 (or 403/5xx)` save-gate row to route an unresolvable URL to a new terminal fallback before any drop, and added the "Unresolvable-URL terminal fallback: ask the user before dropping (P091)" subsection. Ordered sequence: (1) automated transports first (existing Playwright / curl / DuckDuckGo ladder), (2) collect unresolved citations without dropping, (3) fire a SINGLE batched `AskUserQuestion` (per ADR-013 Rule 1) for the canonical URLs, (4) drop a citation ONLY after the user declines. AFK / non-interactive carve-out per ADR-013 Rule 6: record unresolved citations in the `## URL Verification` block of `.reviews.md` with verdict `UNRESOLVED (awaiting user URL)` and surface at finalise (step 17) rather than silently dropping.
- **Step 11b (drafter discipline)**: added "Unresolvable source URLs: carry to the ask, do not degrade (P091)" after the structural-invariants list. When the drafter cannot resolve a canonical link, it must not satisfy invariant 2 by dropping the outlet name nor emit a name-without-link; it carries the citation to the step 11.5 fallback.
- **Composition (not duplication) with P089**: cross-referenced `scripts/check-newsletter-structure.sh` check (b) (outlet-named-without-link). The lint catches the OUTPUT symptom at save; this ticket prevents PRODUCING the symptom by asking first. No lint logic duplicated.

Architect gate: PASS (refinement within ADR-024's decision shape; no new ADR; AFK carve-out correctly applies ADR-013 Rule 6; no ADR-026 conflict). JTBD gate: PASS (serves JTBD-200 "excluded on purpose, not missed"; JTBD-203 / JTBD-205 attribution credibility; AFK record-and-surface serves JTBD-006).

Awaiting verification on the next `/wr-newsletter` cycle that hits an unresolvable paywalled / bare-domain citation: the pipeline asks Tom for the URL (or records `UNRESOLVED (awaiting user URL)` on the AFK path) rather than dropping the outlet name.
