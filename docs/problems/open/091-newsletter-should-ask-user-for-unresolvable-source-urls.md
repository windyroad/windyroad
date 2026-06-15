# Problem 091: wr-newsletter should ask the user for unresolvable source URLs instead of dropping or degrading attribution

**Status**: Open
**Reported**: 2026-06-15
**Priority**: deferred, re-rate at next /wr-itil:review-problems
**Origin**: internal
**Effort**: S (deferred, re-rate at next /wr-itil:review-problems)
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
