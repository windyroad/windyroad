# Problem 078: src/newsletters/published/leader/ folder is crowded; needs dated sub-directories

**Status**: Verifying
**Reported**: 2026-06-01
**Priority**: 3 (Medium). Impact: 2 x Likelihood: 4 (deferred. Re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: S (deferred. Re-rate at next /wr-itil:review-problems)
**Type**: technical
**Released**: 2026-06-02

## Fix Summary

ADR-039 (per-date sub-directory layout for published newsletter editions) shipped alongside the 6-edition `git mv` migration (2026-04-17, 2026-04-24, 2026-05-01, 2026-05-15, 2026-05-25, 2026-06-01 per-date sub-dirs created; all sibling artefacts moved in). SKILL.md step 0 published-folder binding annotated; step 11 edition-counting glob refreshed to `<published-folder>/*/<YYYY-MM-DD>.md`; step 17 Tom-summary publish reminder names the per-date sub-directory target. Persona configs (leader.md + developer.md) `## Edition counting` section updated with the new glob shape. READMEs (drafts/leader, published, published/leader) carry the new move workflow. ADR-019, ADR-026, ADR-038 each carry an `## Amendment Note (2026-06-02, ADR-039)` block at the top documenting the path-encoding refresh. ADR-038 step 2 of the subagent contract (line 90) inline-edited to the per-date-subdir glob. Drafts layout intentionally deferred per the Out-of-scope clause of this ticket; a separate decision takes that up.

Verification trigger: next `/wr-newsletter` run (live drafter exercise) resolves the next edition number against the per-date-subdir glob without contract drift, AND next manual `mv` of a finalised edition into `<published-folder>/<persona>/<publication-date>/` lands the bundle cohesively.

## Description

The `src/newsletters/published/leader/` folder is getting crowded. Each published edition lands six files (`.md`, `.reviews.md`, `.linkedin.md`, `.capture.md`, `.cover.svg`, `.cover.png`), and at six editions in the corpus already the folder is at ~30 files. With weekly publication, the folder will hit ~300 files per year.

Tom-directed fix: use dated sub-directories. One folder per edition, named by the publication date (matching the ADR-026 file-naming pattern).

Proposed layout:

```
src/newsletters/published/leader/
  2026-04-17/
    2026-04-17.md
    (any sibling files that existed at the time)
  2026-04-24/
    2026-04-24.md
    2026-04-24.linkedin.md
    2026-04-24.linkedin.png
  2026-05-01/
    2026-05-01.md
    2026-05-01.linkedin.md
    2026-05-01.capture.md
    2026-05-01.reviews.md
    2026-05-01.cover.svg
    2026-05-01.cover.png
  ...
  2026-05-25/
    2026-05-25.md
    ...etc
```

This matches the per-state-subdir layout already used for `docs/problems/<state>/` (ADR-031).

Migration tasks:

- Decide the sub-directory naming convention (most likely `YYYY-MM-DD/` matching publication-date, not week-ending-date).
- Migrate existing 6 editions in `src/newsletters/published/leader/` into the new layout via `git mv` (preserves history).
- Update `/wr-newsletter` SKILL.md step 16 (and finalise step 16) to write into `<published-folder>/<publication-date>/<publication-date>.<ext>` rather than `<published-folder>/<publication-date>.<ext>`.
- Update the persona config (`.claude/skills/wr-newsletter/personas/leader.md`) edition-counting Glob (`src/newsletters/published/leader/2026-*.md`) to scan the new sub-directory layout: `src/newsletters/published/leader/*/*.md` (matches per-date sub-directory contents).
- Update the same for the developer persona (`personas/developer.md`) even though no published editions yet exist there.
- Update any references in docs/ai-engineering-brief/, docs/jtbd/, or other places that mention the published-leader path.
- Site build (if any) that reads from this folder will need its glob updated.

Consider whether the same pattern should apply to `src/newsletters/drafts/leader/` for consistency, though drafts have fewer files at any one time.

Out of scope for this ticket: archival policy (moving very old editions to a separate /archive folder); cross-edition indices (a README in the leader/ folder listing all editions); compression of cover PNGs (most folder weight is in the PNGs).

## Symptoms

(deferred to investigation)

## Workaround

(deferred to investigation. Current workaround is to live with the crowded folder.)

## Impact Assessment

- **Who is affected**: (deferred to investigation. Direct: anyone navigating the folder; indirect: any tool globbing it.)
- **Frequency**: (deferred to investigation. Grows weekly per publication cadence.)
- **Severity**: (deferred to investigation. Low per file, but compounds with corpus growth.)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Confirm sub-directory naming convention (publication-date vs week-ending-date)
- [ ] Migrate existing 6 editions via `git mv` in a single commit (preserves history)
- [ ] Update /wr-newsletter SKILL.md step 16 write paths
- [ ] Update edition-counting Globs in persona configs
- [ ] Sweep for other path references (docs/ai-engineering-brief/, docs/jtbd/, site build configs, etc.)
- [ ] Confirm with Tom whether the same pattern applies to drafts/

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P062 (newsletter persona-config edition-count rule globs sibling files). The Glob update here interacts with the same file P062 amends.

## Related

- **ADR-031** (`docs/decisions/031-...`). The per-state-subdir layout for `docs/problems/<state>/` is the precedent pattern.
- **ADR-026** (`docs/decisions/026-...`). Sibling-file naming convention; this ticket extends the path-shape question, not the naming.
- **P062** (`docs/problems/verifying/062-newsletter-persona-config-edition-count-rule-globs-sibling-files.md`). Adjacent: the same persona-config Glob this ticket would update.

(captured manually following the /wr-itil:capture-problem template after Tom-direction; bundled with P076 + P077 in one batch commit per ADR-014 related-cluster carve-out)

## Closed

- **Closed**: 2026-06-28 (verification-queue drain; evidence-based per ADR-022)
- **Evidence**: all published leader editions in dated subdirs on disk (e.g. published/leader/2026-06-22/)
- **Recovery**: reopen via /wr-itil:transition-problem 078 known-error if a regression surfaces
