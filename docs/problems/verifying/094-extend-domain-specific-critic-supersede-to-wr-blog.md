# Problem 094: extend the domain-specific critic supersede to wr-blog (retire wr-sw-critic entirely)

**Status**: Verification Pending
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

## Resolution

Shipped 2026-06-27 (`/wr-itil:work-problems` AFK iter). Clean application of the ADR-033 + ADR-035 pattern already proven for the newsletter pipeline. Architect ratified as an **in-place application of the existing accepted decisions, NOT a new ADR** (ADR-033's Decision Outcome already names "Future artifact classes (blog, social) get their own agent at the same pattern"; ADR-035's reassessment criteria already anticipate the blog/social surface). JTBD gate PASS (de-duplication of reader-respect / voice checks keeps the persona constraints enforced by their canonical sibling gates).

What changed:

- **Authored** `.claude/agents/wr-blog-article-critic.md` and `.claude/agents/wr-blog-social-critic.md`, domain-specific critics mirroring `wr-newsletter-critic` / `wr-wardley-critic`: fresh-context, each owns (does not parameterise) its rubric path, emits STRENGTHS + WEAKNESSES + optional RELEVANT CONTEXT + a mechanical VERDICT (PASS / WEAKNESSES_FOUND / PASS_WITH_AUTHOR_OVERRIDES / REJECTED per ADR-025). Article critic: 3-round loop. Social critic: 2-round loop (matching the prior social cap).
- **Simplified** both wr-blog rubrics from numbered-check scoring tables to brief editorial prompts per ADR-035: `assets/article-critic-rubric.md` (10 checks to editorial axes; dropped the voice/banned-pattern check that duplicated the voice gate) and `create-social-posts/assets/social-critic-rubric.md` (9 checks to editorial axes; dropped the voice check and the reader-respect check that duplicated sibling gates). Output-contract references re-pointed from `wr-sw-critic.md` to the new agents; verdict language aligned to the ADR-025 four-value set.
- **Migrated** the two live call-sites: `create-social-posts/SKILL.md` step 7 and `assets/genres/root-cause-guide.md` quality-bar now invoke the new critics.
- **Retired** `.claude/agents/wr-sw-critic.md` (`git rm`) once unreferenced. Also fixed pre-existing P071-era drift: `wr-content-risk-scorer.md` and `wr-newsletter-editor.md` still named `wr-sw-critic` in their coverage-boundary prose; re-pointed to `wr-newsletter-critic` (the newsletter pipeline's actual analytical-quality critic) so retirement orphans no live pointer. This closes ADR-033 Phase 3 repo-wide.

Scope notes:

- **ADR-033 Confirmation bullet deferred.** The architect recommended a one-line "(f) shipped instance" bullet in ADR-033's Confirmation section recording Phase 3 closure. Deferred to an interactive surface: editing an ADR body triggers the ADR-078 `claude -p` compendium-update subprocess, whose failure mode could block the commit via the pre-commit pairing check, a disproportionate AFK risk for an optional audit bullet. ADR-078 makes the compendium auto-refresh on any future ADR-033 edit, so the bullet is not time-sensitive. (The architect cited "ADR-077" as the authority; ADR-077 does not exist on disk and was retired by ADR-078, verified per P082 before acting.)
- **Archival references left intact (out of scope):** `docs/ai-engineering-brief/PLAN.md:202` (historical design doc) and `src/newsletters/drafts/developer/2026-04-19.md:121` (a dated, unpublished draft's marketing copy naming wr-sw-critic). Editing archival artifacts would distort the record.
- **I13 occurrence (P104 known false positive):** this is a fix-time surface with no RFC trace. Per P070 / P103 / P104 the legacy direct-implementation path was used; no RFC auto-created (no RFC tier for this repo-local agent/skill refactor). Recorded here per the AFK contract.

## Fix Released

Committed 2026-06-27 (repo-local `.claude/agents/*` + `skills/wr-blog/*`; no plugin package touched, so no changeset per ADR-014 / repo-local-surface rule). Awaiting verification: the next `/wr-blog` article run and `/wr-blog:create-social-posts` run should exercise `wr-blog-article-critic` and `wr-blog-social-critic` end-to-end and produce the expected CRITIC_REVIEW verdict shape.

## Related

- P071 (closed parent : newsletter-axis supersede complete; this is the wr-blog-axis successor Tom's Resolution flagged). ADR-033 + ADR-035 (the domain-specific critic decision, here applied to wr-blog). ADR-025 (verdict semantics, preserved). ADR-078 (compendium auto-update mechanism; supersedes the phantom ADR-077).
