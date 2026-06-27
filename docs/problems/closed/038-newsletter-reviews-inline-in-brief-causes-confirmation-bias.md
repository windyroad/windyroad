# Problem 038: /wr-newsletter step 16 mandates inline review blocks in brief; creates confirmation-bias risk for next reviewer

**Status**: Closed
**Reported**: 2026-05-01
**Origin**: internal
**Released**: 2026-05-07
**Priority**: 16 (Significant). Impact: Major (4) x Likelihood: Likely (4)
**Effort**: S
**WSJF**: (16 x 2.0) / 1 = 32.0 (weight 2.0: newsletter is primary repo activity per 2026-05-02 direction)

## Fix released (2026-05-07)

Step 16 of `.claude/skills/wr-newsletter/SKILL.md` rewritten per ADR-026: brief contains only frontmatter + body + CTA; all six review classes (Voice Review, Content Risk Review, Critic Review (Newsletter), Editor Review, Critic Review (Wardley Artifacts), Map Delta) plus the LinkedIn-post voice review now live in `<draft-folder>/<publication-date>.reviews.md`. Brief frontmatter declares `companion-files.reviews: <publication-date>.reviews.md` for cross-reference.

Bundled with P040 (Friday-date naming) and P041 (LinkedIn-post sibling file) into a single SKILL.md commit per ADR-014's batch-grain rule because all three amend step 16 simultaneously and depend on each other for path consistency. Architect ALIGNED-WITH-FOLLOWUPS: ADR-026 already exists and pins the spec, no new ADR needed; LinkedIn-post voice review specifically placed in `.reviews.md` (not `.linkedin.md`) to preserve fresh-context discipline. JTBD PASS.

Verification triggers on tonight's `/wr-newsletter phase=prep` run, which writes both `<publication-date>.prep.md` and `<publication-date>.reviews.md`. Then on tomorrow's `phase=finalise` run, the finalise gates re-run on the brief without seeing prior verdicts inline.

## Description

The `/wr-newsletter` skill step 16 (save) mandates that voice / content-risk / sw-critic / editor / Wardley-critic review blocks live INLINE in the saved brief draft, separated only by a `---` rule from the body.

This contradicts ADR 016/018/020's fresh-context principle: subsequent review subagents (e.g. finalise re-running the gates after edits) read the brief file and see the prior verdicts, which biases their own scoring.

## Symptoms

- User flagged during 2026-05-01 finalise: "this stuff does not belong is this document and can bias the reviews"
- Same review subagent (e.g. wr-sw-critic) running on a draft that already contains its own prior `CRITIC_REVIEW` block has visible prior-round verdicts; the agent tooling provides no isolation
- Skill prose mandates this layout for both `phase=prep` and `phase=finalise` saves

## Workaround

Save reviews to a sibling file (`<draft-folder>/<date>.reviews.md`) instead of inline. Brief contains body + LinkedIn post (until P041 separates LinkedIn too); reviews-file frontmatter cross-references the brief. User-applied workaround in 2026-05-01 finalise.

## Root Cause Analysis

### Root Cause

Step 16 was designed for audit-trail completeness: the brief file carries both the artefact and the verdict trail in one place. The fresh-context discipline ADR 016/018/020 establish for the verdict GENERATION step does not extend to the persistence layer; the skill silently undermines its own design.

### Fix Strategy

- **Kind**: improve
- **Shape**: skill (step amendment)
- **Target file**: `.claude/skills/wr-newsletter/SKILL.md` step 16 (all three phase branches)
- **Edit summary**: Move review blocks from inline-in-brief to sibling `<draft-folder>/<date>.reviews.md` file (matching the existing capture-transcript ADR 019 pattern). Add `companion-files.reviews:` to the brief's frontmatter for cross-reference. Update prep + finalise + full save structures to write the sibling file, not the inline section.
- **Companion ADR**: amend ADR 016/018/020 to make the sibling-file pattern explicit (review-bias mitigation rationale).

## Related

- ADR 016 (sw-critic), ADR 018 (content-risk), ADR 020 (editor), fresh-context discipline
- ADR 019 (capture-transcript), sibling-file pattern precedent
- This retrospective: 2026-05-01 edition retro

## Closed

- **Closed**: 2026-06-28 (verification-queue drain; evidence-based per ADR-022)
- **Evidence**: .reviews.md companion present in all published editions since 2026-05-15; brief is frontmatter+body+CTA only
- **Recovery**: reopen via /wr-itil:transition-problem 038 known-error if a regression surfaces
