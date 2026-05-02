# Problem 041: /wr-newsletter step 16 keeps LinkedIn post + image notes + alt text inline in brief; risks accidental publication of meta content

**Status**: Open
**Reported**: 2026-05-01
**Priority**: 12 (Significant). Impact: Moderate (3) x Likelihood: Almost certain (4)
**Effort**: S
**WSJF**: (12 x 2.0) / 1 = 24.0 (weight 2.0: newsletter is primary repo activity per 2026-05-02 direction)

## Description

The `/wr-newsletter` step 16 contract embeds the `## LinkedIn Post`, `## Image`, and `## Notes for posting` sections INLINE in the brief draft (separated by a `---` rule from the body).

This creates accidental-publication risk: copy-paste of the brief body, automation that pulls the file, or simple human error can include meta content (LinkedIn share post, image description, alt text, posting notes) in the published newsletter body.

## Symptoms

- User flagged during 2026-05-01 finalise: "I really don't like the article having extra meta content afterwards. It's risks us accidentally publishing that content as part of the newsletter"
- Last week's published `2026-04-24.linkedin.md` already follows the sibling-file pattern, so the inline-in-brief save shape is inconsistent with the working publish convention
- Same separation-of-concerns class as P038 (reviews-inline-in-brief)

## Workaround

Manually split the LinkedIn Post + Image + Notes sections into a sibling `<draft-folder>/<date>.linkedin.md` file (matches the published 2026-04-24.linkedin.md pattern). Update brief frontmatter `companion-files.linkedin-post` for cross-reference. User-applied workaround in 2026-05-01 finalise.

## Root Cause Analysis

### Root Cause

Step 16 was designed for one-file-per-edition completeness: brief, LinkedIn post, image notes, reviews, all in one file. The publish convention (visible in 2026-04-24.linkedin.md) splits LinkedIn content into a sibling file, but the skill mandates the inline shape. The mismatch is silent until user catches it post-finalise.

### Fix Strategy

- **Kind**: improve
- **Shape**: skill (step amendment)
- **Target file**: `.claude/skills/wr-newsletter/SKILL.md` step 16 (finalise + full branches)
- **Edit summary**: Move LinkedIn Post + Image + Notes sections from inline-in-brief to sibling `<draft-folder>/<date>.linkedin.md` file (matching ADR 019 capture-transcript pattern and the published 2026-04-24.linkedin.md convention). Add `companion-files.linkedin-post:` to the brief's frontmatter. Apply consistently with P038 reviews-sibling-file fix.

## Related

- P038 (companion: reviews-inline-in-brief)
- This retrospective: 2026-05-01 edition retro
