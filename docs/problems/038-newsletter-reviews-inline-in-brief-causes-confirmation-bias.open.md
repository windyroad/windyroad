# Problem 038: /wr-newsletter step 16 mandates inline review blocks in brief; creates confirmation-bias risk for next reviewer

**Status**: Open
**Reported**: 2026-05-01
**Priority**: 16 (Significant). Impact: Major (4) x Likelihood: Likely (4)
**Effort**: S
**WSJF**: (16 x 2.0) / 1 = 32.0 (weight 2.0: newsletter is primary repo activity per 2026-05-02 direction)

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
