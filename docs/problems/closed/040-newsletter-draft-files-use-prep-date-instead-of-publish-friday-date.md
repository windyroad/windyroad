# Problem 040: /wr-newsletter draft and companion files use prep run date instead of Friday publish date

**Status**: Closed
**Reported**: 2026-05-01
**Origin**: internal
**Released**: 2026-05-07
**Priority**: 9 (Moderate). Impact: Moderate (3) x Likelihood: Likely (3)
**Effort**: S
**WSJF**: (9 x 2.0) / 1 = 18.0 (weight 2.0: newsletter is primary repo activity per 2026-05-02 direction)

## Fix released (2026-05-07)

Added `<publication-date>` binding to step 0 of `.claude/skills/wr-newsletter/SKILL.md`, computed as: if today (local time) is Friday, use today; else use the next Friday after today (Mon-Thu resolves forward to this Friday; Sat-Sun resolves forward to next Friday). Audited all path references in the SKILL and replaced `YYYY-MM-DD` placeholders with `<publication-date>` in steps 10, 11, 12, 16, and 17 (per architect's audit list). The brief is now published-Friday-pinned regardless of when prep runs.

Bundled with P038 (sibling-file refactor) and P041 (LinkedIn-post sibling) per ADR-014 because all three amend step 16 simultaneously. Architect ALIGNED-WITH-FOLLOWUPS; JTBD PASS (no documented job depends on prep-time-date filenames).

Verification triggers on tonight's `/wr-newsletter phase=prep` run (2026-05-07 Thursday): all output files should be named `2026-05-08.X` (next Friday), not `2026-05-07.X`. Tomorrow's `phase=finalise` (2026-05-08 Friday) should resolve `<publication-date>` to today (2026-05-08) and the file-naming should be unchanged.

## Description

`/wr-newsletter` step 16 saves prep-phase artefacts using `today's date in ISO format`, but "today" during prep can be Mon-Thu, while the publish date is always Friday. This produces inconsistent filenames (e.g. 2026-04-30.prep.md, 2026-04-30.cover.png, 2026-04-30.capture.md, 2026-04-30.reviews.md when the publish date is 2026-05-01).

User flagged: "the files in the .../drafts/leader' have the wrong date. They should be the friday date, regardless of when we do the prep."

## Symptoms

- 2026-05-01 Edition 3 prep ran 2026-04-30; companion files were named 2026-04-30.* but the publish-date is 2026-05-01
- Files renamed manually post-finalise to 2026-05-01.* for consistency with the brief's `<date>.md` convention
- Skill prose at step 16 (prep + finalise + full) all say "Compute today's date in ISO format", the contract is not Friday-pinned

## Workaround

User manually `mv`'d the 4 companion files to 2026-05-01.* and updated brief frontmatter `cover-image` + `companion-files` paths. Friction every edition that runs prep mid-week.

## Root Cause Analysis

### Root Cause

Step 16's "today's date" contract was written assuming finalise runs the same day as the publish; in the prep/finalise model from ADR 017, prep can run Mon-Thu but the artefact's identity is the publish-Friday date.

### Fix Strategy

- **Kind**: improve
- **Shape**: skill (step amendment)
- **Target file**: `.claude/skills/wr-newsletter/SKILL.md` step 16 (all three phase branches)
- **Edit summary**: Change "today's date in ISO format" to "the upcoming Friday's date in ISO format (or today's date if today is Friday)". Apply across prep / finalise / full saves and across all companion files (cover, capture, reviews, linkedin-post). The brief's headline subtitle already uses Friday-publish date; filename should match.

## Related

- ADR 017 (prep/finalise phases)
- This retrospective: 2026-05-01 edition retro

## Closed

- **Closed**: 2026-06-28 (verification-queue drain; evidence-based per ADR-022)
- **Evidence**: published editions use <publication-date> (Friday-pub) filenames on disk; binding present at SKILL.md step 0
- **Recovery**: reopen via /wr-itil:transition-problem 040 known-error if a regression surfaces
