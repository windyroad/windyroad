# Problem 084: Extend per-date sub-directory layout to src/newsletters/drafts/<persona>/

**Status**: Open
**Reported**: 2026-06-03
**Priority**: 3 (Medium), Impact: 3 x Likelihood: 1 (deferred, re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: M (deferred, re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

Tom-pinned 2026-06-03 via `/wr-architect:review-decisions` follow-up on ADR-039's deferred sub-decision (drafts extension chose Option A: yes, extend now).

ADR-039 (Per-date sub-directory layout for published newsletter editions) shipped 2026-06-02 covering the published-side migration. The sub-decision "extend per-date subdir layout to drafts/?" was deferred at ADR-039 landing time (P078 Out-of-scope clause). Tom pinned Option A (extend now) on 2026-06-03 via the review-decisions sub-decision drain.

**Scope of follow-up work:**

1. **Sibling ADR for drafts scope.** ADR-039 is explicitly scoped to `src/newsletters/published/<persona>/` only (its Out-of-scope clause names ADR-011 + ADR-012 drafts-folder example paths as NOT amended). A sibling ADR carries the drafts layout decision with its own Considered Options, Decision Drivers, Confirmation, and Reassessment. The sibling ADR cites ADR-039 as the published-side precedent and ADR-074 (substance-confirm-before-build) as the Tom-direction-pinning record.

2. **Migration of any in-flight drafts.** When the sibling ADR lands, migrate any current draft folders (`src/newsletters/drafts/leader/`, `src/newsletters/drafts/developer/`) from the flat shape to per-date subdirs via `git mv` (preserves history, matching ADR-039 migration pattern).

3. **SKILL.md write-path updates.** `/wr-newsletter` SKILL.md step 11 (drafter) writes draft files to `<draft-folder>/<publication-date>.{md,prep.md,capture.md,reviews.md,linkedin.md,cover.svg,cover.png}`. Under the new layout these write paths become `<draft-folder>/<publication-date>/<publication-date>.{md,...}`. Update step 11 plus any sub-steps that write to the drafts surface. Step 16's "move to published" workflow ALREADY assumes per-date subdir target shape per ADR-039 amendment.

4. **Drafts edition-counting Glob.** `.claude/skills/wr-newsletter/personas/<persona>.md` carries an edition-counting Glob (`src/newsletters/drafts/<persona>/2026-*.md` or similar). Update to the per-date subdir shape (`src/newsletters/drafts/<persona>/*/*.md`) to match the canonical brief shape (basename equals subdir name equals publication date).

5. **Cross-ADR amendments.** ADR-011 and ADR-012 cite drafts-folder example paths (per ADR-039 Out-of-scope clause line). The sibling ADR amends these in lockstep, matching ADR-039's amendment pattern for ADR-019/026/038.

**Target layout** (mirroring ADR-039 published-side shape):

```
src/newsletters/drafts/leader/
  README.md
  2026-06-08/
    2026-06-08.md
    2026-06-08.prep.md
    2026-06-08.capture.md
    2026-06-08.reviews.md
    2026-06-08.linkedin.md
    2026-06-08.cover.svg
    2026-06-08.cover.png
```

**Rationale (Tom direction 2026-06-03)**: layout convention consistency between drafts/ and published/ outweighs the lower cognitive-load surface for drafts (drafts hold 1-3 editions in flight at any time). Reduces the "what shape does this folder use" cognitive switch when moving between drafting and reviewing published editions. Sets the per-date subdir convention earlier in the lifecycle so any new sibling-artifact class (e.g. future video or audio companion) defaults to the right shape from creation, not from the published-side move.

## Symptoms

(deferred to investigation)

## Workaround

(deferred to investigation. Current workaround: drafts/ stays flat; the published-side per-date subdir layout is the only place the new convention applies.)

## Impact Assessment

- **Who is affected**: (deferred to investigation. Direct: the agent running /wr-newsletter drafting. Indirect: Tom navigating drafts folders.)
- **Frequency**: (deferred to investigation. Per-drafting-session.)
- **Severity**: (deferred to investigation. Low day-to-day; one-time migration cost when the sibling ADR lands.)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Draft sibling ADR for drafts-folder per-date sub-directory layout via /wr-architect:create-adr (full intake; substance is Tom-pinned, but Considered Options + Decision Drivers + Confirmation need full authoring)
- [ ] Migrate any in-flight drafts via git mv (preserves history)
- [ ] Update /wr-newsletter SKILL.md step 11 (and any related sub-steps) drafter write paths to the per-date subdir shape
- [ ] Update persona configs (leader.md, developer.md) drafts-side edition-counting Globs to the per-date subdir shape
- [ ] Cross-ADR amendments to ADR-011 + ADR-012 (drafts-folder example paths) in the same commit as the new sibling ADR + migration
- [ ] Confirm new layout via spot-check that drafter writes resolve correctly and the next /wr-newsletter run produces files in the right shape

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none direct; the sibling ADR can be drafted at any time. Substance is confirmed by Tom direction-set 2026-06-03.)
- **Composes with**: P078 (newsletters published folder per-date subdir layout, ADR-039 published-side precedent); ADR-039 (the published-side ADR this work mirrors on the drafts side).

## Related

- ADR-039 (`docs/decisions/039-per-date-subdir-layout-for-published-newsletter-editions.proposed.md`). Published-side precedent; drafts-side sibling ADR mirrors its shape and amendment pattern.
- P078 (`docs/problems/verifying/078-newsletters-published-folder-needs-dated-subdirs.md`). Parent ticket for the published-side migration; this P084 carries the deferred drafts-extension scope.
- ADR-011 (`docs/decisions/011-ai-brief-orchestration-via-claude-code.proposed.md`). Carries a drafts-folder example path that needs amending in lockstep.
- ADR-012 (`docs/decisions/012-mandatory-voice-and-risk-review-gates-for-ai-generated-content.proposed.md`). Carries a drafts-folder example path that needs amending in lockstep.
- ADR-074 (`docs/decisions/074-confirm-decisions-substance-before-building-dependent-work.proposed.md`). Tom-direction-pin record at 2026-06-03 satisfies the substance-confirm-before-build guard for this work.

(captured via /wr-itil:capture-problem on 2026-06-03; substance confirmed by Tom 2026-06-03 via /wr-architect:review-decisions sub-decision drain on ADR-039)

## Duplicate-check matches (capture-time, conservative title-only grep)

- P076 (`docs/problems/open/076-newsletter-pipeline-drafts-body-before-heading.md`): keyword overlap on "drafts"; different concern (H1-first composition order, not folder layout). NOT a duplicate.
- P078 (`docs/problems/verifying/078-newsletters-published-folder-needs-dated-subdirs.md`): keyword overlap on "subdirs"; P084 is the deferred drafts-side sibling per ADR-039 Out-of-scope clause. Composes-with relationship, NOT a duplicate.
