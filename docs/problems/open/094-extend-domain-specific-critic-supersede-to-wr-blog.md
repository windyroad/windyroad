# Problem 094: extend the domain-specific critic supersede to wr-blog (retire wr-sw-critic entirely)

**Status**: Open
**Reported**: 2026-06-16
**Priority**: 6 (Medium). Impact: Moderate (3) x Likelihood: Unlikely (2)
**Origin**: internal
**Effort**: L
**WSJF**: 1.5 = (6 x 1) / 4
**Type**: technical

## Description

P071 closed with wr-sw-critic deliberately retained as a wr-blog-only shared agent: ADR-033's domain-specific critic supersede was scoped only to the newsletter pipeline (now using wr-newsletter-critic + wr-wardley-critic), and wr-blog still depends on the legacy parameterised wr-sw-critic. Tom's P071 Resolution flagged the follow-on as "a separate ticket if/when wanted" and confirmed filing it (2026-06-16 work-problems gate).

Extend the domain-specific critic supersede to wr-blog so the legacy parameterised wr-sw-critic can be retired entirely.

## Symptoms

- `.claude/agents/wr-sw-critic.md` remains live solely for wr-blog. Live call sites: `skills/wr-blog/create-social-posts/SKILL.md` (invokes wr-sw-critic against social-critic-rubric.md), `skills/wr-blog/assets/genres/root-cause-guide.md` (SW critic loop against article-critic-rubric.md), plus output-contract references in `skills/wr-blog/assets/article-critic-rubric.md` and `create-social-posts/assets/social-critic-rubric.md`.
- The parameterised-critic pattern P071 identified as poor-discoverability/UX persists in the wr-blog surface.

## Impact Assessment

- **Who is affected**: wr-blog content quality + the maintainer (the parameterised pattern is the discoverability/UX problem P071 superseded for newsletters).
- **Frequency**: every wr-blog article + social-post critic invocation.
- **Severity**: Medium. wr-blog is lower-cadence than the newsletter; the shared agent works, so this is a quality/consistency improvement, not a defect.

## Root Cause Analysis

### Hypothesis

Author domain-specific critics `wr-blog-article-critic` and `wr-blog-social-critic` (mirroring wr-newsletter-critic / wr-wardley-critic per ADR-033/035: brief STRENGTHS + WEAKNESSES + optional CONTEXT editorial prompt, no parameterised rubric path). Migrate the wr-blog call-sites to the new critics. Once no call-sites reference wr-sw-critic, retire `.claude/agents/wr-sw-critic.md`. May warrant a small ADR amendment extending ADR-033's scope to wr-blog.

## Fix Strategy

- **Kind**: create
- **Shape**: agent (two new domain-specific critic agents) + skill edits (wr-blog call-site migration)
- **Suggested names**: `wr-blog-article-critic`, `wr-blog-social-critic`.
- **Scope**: author the two critics per the ADR-033/035 brief-editorial-prompt shape; migrate `skills/wr-blog/create-social-posts/SKILL.md` + `assets/genres/root-cause-guide.md` + the two rubric assets off wr-sw-critic; retire `.claude/agents/wr-sw-critic.md` once unreferenced.
- **Evidence**: P071 Resolution (Tom, 2026-06-15) + filing confirmation (2026-06-16).

## Related

- P071 (closed parent : newsletter-axis supersede complete; this is the wr-blog-axis successor Tom's Resolution flagged). ADR-033 + ADR-035 (the domain-specific critic decision to extend to wr-blog).
