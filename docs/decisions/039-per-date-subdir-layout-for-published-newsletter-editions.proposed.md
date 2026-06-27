---
status: "proposed"
date: 2026-06-02
human-oversight: confirmed
oversight-date: 2026-06-02
decision-makers: [Tom Howard, Claude]
consulted: [wr-architect:agent, wr-jtbd:agent]
informed: []
reassessment-date: 2026-12-02
composes-with: [019-capture-transcript-artifact, 026-reviews-and-meta-content-to-sibling-files, 038-cross-edition-thesis-consistency-check-as-fresh-context-subagent-gate]
related: [014-batch-grain-related-cluster-carve-out, 017-ai-brief-prep-and-finalise-phases, 030-shift-the-shift-publication-day-to-monday-aest]
amends: [019-capture-transcript-artifact, 026-reviews-and-meta-content-to-sibling-files, 038-cross-edition-thesis-consistency-check-as-fresh-context-subagent-gate]
---

# Per-date sub-directory layout for published newsletter editions

## Context and Problem Statement

Published newsletter editions live under `src/newsletters/published/<persona>/`. Per ADR-019 (capture transcript), ADR-026 (sibling files), and the cover-image render pipeline, a single edition now ships six files: `<publication-date>.md` (brief), `<publication-date>.reviews.md` (review blocks), `<publication-date>.linkedin.md` (share post), `<publication-date>.capture.md` (capture transcript), `<publication-date>.cover.svg` and `<publication-date>.cover.png` (cover image).

At six editions the leader folder is already at ~30 files (six dates plus the `README.md`). At the weekly publication cadence locked in by ADR-030, the folder will reach ~300 files per year per persona. Cognitive load when navigating the folder, glob ergonomics for cross-edition consumers (the ADR-038 thesis-consistency gate, the deferred PLAN.md layer-7 archive page), and the file-listing surface in IDE explorers all degrade as the flat list grows.

The sibling-file pattern from ADR-019 and ADR-026 is the multiplier: every edition's six artifacts share a date prefix but live as peers in the same flat folder. Co-locating them by date is the natural next move and matches the per-state-subdir layout already used in `docs/problems/<state>/` (precedent: state-partitioning of problem tickets, distinct on axis but identical on shape).

Tom directed the per-date-subdir fix in P078's Description. This ADR codifies the decision and identifies the downstream ADRs (ADR-019, ADR-026, ADR-038) whose path encodings must be amended in lockstep so the contract surface stays coherent.

## Decision Drivers

- **Cognitive load at scale.** ~300 flat files per year per persona is past the threshold where a reader can scan the folder and locate a specific edition's artifact set. Per-date sub-directories bundle one edition's artifacts together and reduce top-level folder cardinality by 6x.
- **Bundle cohesion for sibling artifacts (ADR-019, ADR-026).** Each edition's `.md`, `.reviews.md`, `.linkedin.md`, `.capture.md`, `.cover.svg`, `.cover.png` belong together. They are written together, audited together, and (when an archive page lands) read together. Co-location in a per-date sub-directory matches how the files are produced and consumed.
- **Precedent: per-state-subdir layout for `docs/problems/<state>/`.** The repo already partitions a high-cardinality artifact directory by a stable, machine-derivable key (problem state). The per-date-subdir layout here applies the same shape to a different partition axis (publication date). Re-using a known pattern reduces the new-convention learning cost.
- **Glob ergonomics.** A flat `*.md` glob on `<published-folder>` returns all sibling types (`.md`, `.reviews.md`, `.linkedin.md`, `.capture.md`); the canonical-shape filter from P062 is required to extract just the brief files. Under the per-date layout, the canonical glob shape is `<published-folder>/*/<YYYY-MM-DD>.md` where the wildcard sub-directory IS the date and the file basename IS the date. This is a more specific shape that survives renames better; the P062 anti-pattern of accidentally counting siblings is structurally harder to hit.
- **Minimal change surface.** The migration is mechanical (`git mv` per edition), preserves history per-file, and touches a small, enumerable set of references: SKILL.md (three step references), two persona configs, three READMEs, ADR-019 (six path-encoding mentions in the move-workflow text), ADR-026 (three sibling-pattern example paths), ADR-038 (one step-2 glob expression). No reader-facing surface changes (the LinkedIn post is the reader surface; `src/` is internal substrate).

## Considered Options

1. **Per-date sub-directories at `<published-folder>/<YYYY-MM-DD>/<publication-date>.<ext>`** (chosen).
2. **Flat layout, status quo at `<published-folder>/<publication-date>.<ext>`** (rejected).
3. **Per-year sub-directories at `<published-folder>/<YYYY>/<publication-date>.<ext>`** (rejected).
4. **Per-month sub-directories at `<published-folder>/<YYYY-MM>/<publication-date>.<ext>`** (rejected).

## Decision Outcome

Chosen option: **"Per-date sub-directories at `<published-folder>/<YYYY-MM-DD>/<publication-date>.<ext>`."**

**Layout.** Each published edition occupies a sub-directory named by its publication date in ISO format (`YYYY-MM-DD/`). The sub-directory contains every sibling artifact produced for that edition. The `<publication-date>` binding from SKILL step 0 (P040 single-path-source) is reused; no new date binding is introduced.

Example layout for the leader persona after migration:

```
src/newsletters/published/leader/
  README.md
  2026-04-17/
    2026-04-17.md
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
  2026-05-15/
    ...
  2026-05-25/
    ...
  2026-06-01/
    ...
```

The leader `README.md` stays at `src/newsletters/published/leader/` (one-up from per-date sub-directories) as the persona-archive index. Future archive-page work (PLAN.md layer 7) reads this README plus the per-date sub-directories.

**Edition-counting Glob shape.** The persona-config rule scans `<published-folder>/*/<canonical-brief-shape>.md` where `<canonical-brief-shape>` is `YYYY-MM-DD` (eight digits and dashes). The wildcard sub-directory IS the publication date, so the sub-directory name and the file basename are identical. This redundancy is intentional: if the file ever drifts out of its sibling sub-directory, the glob no longer matches it, and the next edition-count run surfaces the inconsistency. The P062 anti-pattern (matching `.linkedin.md` siblings as candidates) is impossible under this shape because siblings have different basenames within the same sub-directory.

**Migration.** Existing six editions migrate via `git mv` per file. History is preserved per-file. The migration ships in one commit alongside the SKILL.md / persona-config / README / downstream-ADR amendments per ADR-014 related-cluster carve-out (the file moves and the path-encoding amendments are one logical change).

**Drafts layout: Tom-pinned 2026-06-03 to extend.** Tom direction-set via `/wr-architect:review-decisions` follow-up: extend the per-date-subdir pattern to `src/newsletters/drafts/<persona>/` (Option A). Rationale: layout consistency between drafts/ and published/ outweighs the lower cognitive-load surface for drafts (drafts hold 1-3 editions in flight). Implementation work tracked as a follow-up ticket; the implementation needs a sibling ADR for the drafts extension plus a drafter-side migration of any in-flight drafts plus SKILL.md write-path updates at step 11 (drafter write paths). The drafts extension does NOT amend this ADR's published-side scope; the sibling ADR carries the drafts scope.

**Downstream ADR amendments.** Three ADRs encode the flat layout and are amended in the same commit as this ADR and the migration:

- **ADR-019 (capture-transcript-artifact).** Amends scope: published-folder move workflow text.
  - Line 37 (Considered Options, chosen option text): "The file moves to `<published-folder>` together with the published `.md` when Tom moves the published edition." Substance unchanged; path encoding refreshed to the per-date-subdir bundle.
  - Line 84 (Decision Outcome, Lifecycle): "When Tom moves the published `<draft-folder>/YYYY-MM-DD.md` to `<published-folder>/<persona>/YYYY-MM-DD.md`, he moves `YYYY-MM-DD.capture.md` to `<published-folder>/<persona>/YYYY-MM-DD.capture.md` alongside it" becomes "When Tom moves the published `<draft-folder>/YYYY-MM-DD.md` and its siblings to `<published-folder>/<persona>/YYYY-MM-DD/` (per ADR-039 per-date sub-directory layout), the `YYYY-MM-DD.capture.md` moves into the same sub-directory alongside the brief".
  - Lines 116, 118, 131, 141, 167: analogous path refresh in Consequences, Confirmation, Pros/Cons, Reassessment sections.

- **ADR-026 (reviews-and-meta-content-to-sibling-files).** Amends scope: example-path refresh only. The sibling-file pattern substance is unchanged.
  - Line 26 (Context): cited example `src/newsletters/published/leader/2026-04-24.linkedin.md` becomes `src/newsletters/published/leader/2026-04-24/2026-04-24.linkedin.md`.
  - Line 86 (Consequences, Good): same example path refresh.
  - Line 111 (More Information, Aligns with): same example path refresh.

- **ADR-038 (cross-edition thesis-consistency check).** Amends scope: step 2 glob expression in the subagent contract.
  - Line 90 (Decision Outcome, step 2): "Reads the prior N editions from `<published-folder>` (resolved per the persona config at step 0), filtered to `YYYY-MM-DD.md` matching the canonical brief shape, sorted by edition number descending, take top N." becomes "Reads the prior N editions by globbing `<published-folder>/*/<YYYY-MM-DD>.md` (where the wildcard sub-directory is the publication-date directory established by ADR-039 and the basename is the canonical brief shape), sorted by edition number descending, take top N."

**Out-of-scope amendments (closed by ADR-040, 2026-06-27).** ADR-011 line 65 and ADR-012 line 59 cite drafts-folder example paths (`src/newsletters/drafts/YYYY-MM-DD.md`). Drafts layout was explicitly deferred per P078's Out-of-scope clause at this ADR's landing; these ADRs were NOT amended in this commit. That deferral has since been taken up: ADR-040 (per-date sub-directory layout for newsletter drafts) extended the same per-date-subdir pattern to drafts and amended ADR-011 line 65, ADR-012 line 59, and ADR-019's drafts-side capture paths in lockstep.

## Consequences

### Good

- Flat-folder cognitive load is bounded at the per-date sub-directory level. The top-level folder cardinality grows linearly in editions (one entry per week) rather than in artifacts (six entries per week).
- Sibling artifacts co-locate by edition. A reader (or a future archive-page consumer) opens one sub-directory and sees the full bundle. The P062 anti-pattern of matching sibling files when only the brief is wanted is structurally harder to hit.
- The migration is mechanical, fully reversible, and history-preserving. `git mv` per file keeps `git log --follow` working on each migrated artifact.
- The pattern composes with ADR-014 batch-grain (one commit for the related cluster), ADR-019 (capture-transcript move workflow), ADR-026 (sibling files), and ADR-038 (cross-edition gate glob). All downstream consumers updated in lockstep means no contract drift.
- Precedent re-use. The per-state-subdir layout from `docs/problems/<state>/` is already a project convention. Adding a second per-key sub-directory layout reinforces the pattern.

### Neutral

- The drafts folder is unchanged. Drafts and published now differ in layout shape; this is acceptable because the drafts folder has different cardinality characteristics (one to three editions in flight). If/when drafts grows past the cognitive-load threshold, a separate decision can extend the pattern.
- The leader `README.md` stays at the persona-archive root. It is not pulled down into any sub-directory. A future archive-page consumer reads the README from the parent level.
- Glob shape for cross-edition consumers changes from `<published-folder>/*.md` to `<published-folder>/*/*.md` (with the canonical-shape filter applied at the basename). Existing consumers (SKILL step 11 edition-counting, ADR-038 cross-edition gate) get a one-line edit.

### Bad

- One indirection level added when navigating to a specific artifact. Reading `2026-05-01.reviews.md` is now two clicks (sub-directory then file) instead of one. The trade-off is per-edition bundling; the cost is per-artifact reach.
- The downstream-ADR amendments (ADR-019, ADR-026, ADR-038) need to ship in this same commit. If only the migration ships, the ADR text contradicts the on-disk layout, and a future contributor reading ADR-019's move workflow follows stale guidance. The amendment lockstep is mandatory.
- A contributor adding a new sibling-artifact class (e.g. a future video or audio companion) places the file in the per-date sub-directory by default. This is the right default but is not explicitly enforced; the convention lives in this ADR plus the SKILL.md write paths.

## Confirmation

1. The six existing leader editions (2026-04-17, 2026-04-24, 2026-05-01, 2026-05-15, 2026-05-25, 2026-06-01) are migrated to per-date sub-directories with all siblings co-located. Verified by `ls src/newsletters/published/leader/` showing one sub-directory per date plus the persona `README.md`, and each sub-directory containing only that date's artifact set.
2. `git log --follow` works on each migrated artifact (history preserved).
3. `.claude/skills/wr-newsletter/SKILL.md` step 11 edition-counting reads `<published-folder>/*/<YYYY-MM-DD>.md` (per-date-subdir shape) and step 17 Tom-summary publish reminder names `<published-folder>/<persona>/<YYYY-MM-DD>/` as the move target.
4. `.claude/skills/wr-newsletter/personas/leader.md` and `developer.md` `## Edition counting` sections describe the per-date-subdir glob shape.
5. `src/newsletters/published/README.md`, `src/newsletters/published/leader/README.md`, and `src/newsletters/drafts/leader/README.md` reflect the new move workflow.
6. ADR-019, ADR-026, ADR-038 amendment edits land in the same commit as the migration.
7. P078 transitions to Verifying after the commit lands; closure trigger is the next `/wr-newsletter` finalise run that resolves edition number correctly against the new layout AND a manual `mv` of a finalised edition into the new sub-directory shape without contract drift.

## Reassessment Criteria

- After 26 editions per persona (six months at weekly cadence), review whether per-date sub-directories scale or whether a second-level partition (per-year, per-quarter) is warranted.
- If the drafts folder hits its own cognitive-load threshold (more than ~5 editions in flight simultaneously) or if Tom directs the extension, take up the deferred drafts-layout decision as a separate ticket.
- If the deferred PLAN.md layer-7 archive page lands and the per-date-subdir layout interacts with the rendering pipeline awkwardly (e.g. URL shape under `/newsletters/<date>/` collides with the sub-directory shape), revisit this ADR alongside the archive-page architecture.
- If a third persona is added (beyond leader and developer), the per-persona `README.md` plus per-date-subdir convention scales as-is; no amendment needed.

## Pros and Cons of the Options

### Per-date sub-directories (chosen)

- Good: bounds top-level folder cardinality; co-locates each edition's bundle; precedent matches; glob shape disambiguates briefs from siblings; minimal change surface.
- Bad: one indirection level when navigating to a specific artifact; ADR-019, ADR-026, ADR-038 amendment lockstep required.

### Flat layout, status quo

- Good: zero migration cost; existing globs unchanged.
- Bad: cognitive load grows linearly in artifacts (six per week); IDE explorer surface degrades; sibling-vs-brief disambiguation relies entirely on the canonical-shape filter (the P062 anti-pattern can resurface if a future glob forgets it).

### Per-year sub-directories

- Good: bounds cardinality at a coarser grain.
- Bad: a year of editions (~52) is still beyond the cognitive-load threshold within a single sub-directory. Doesn't bundle one edition's siblings (the original problem). The grain mismatches the per-edition mental model.

### Per-month sub-directories

- Good: bounds cardinality at an intermediate grain.
- Bad: still doesn't bundle one edition's siblings. Month boundaries are arbitrary relative to the editorial week. A late-month publish bundles awkwardly with an early-next-month publish across the boundary.

## Related context

- **P078** (`docs/problems/open/078-newsletters-published-folder-needs-dated-subdirs.md`). Tom-directed fix; substance-confirmed; this ADR codifies the architectural commitment.
- **ADR-014** (`docs/decisions/014-batch-grain-related-cluster-carve-out.proposed.md`). The migration ships in one commit with downstream ADR amendments as a related cluster.
- **ADR-019** (`docs/decisions/019-capture-transcript-artifact.proposed.md`). Amended by this ADR (published-folder move workflow text).
- **ADR-026** (`docs/decisions/026-reviews-and-meta-content-to-sibling-files.proposed.md`). Amended by this ADR (sibling-pattern example-path refresh only).
- **ADR-038** (`docs/decisions/038-cross-edition-thesis-consistency-check-as-fresh-context-subagent-gate.proposed.md`). Amended by this ADR (cross-edition-gate step-2 glob expression).
- **P062** (`docs/problems/verifying/062-newsletter-persona-config-edition-count-rule-globs-sibling-files.md`). The canonical-shape filter rule; under per-date-subdir layout the rule still holds but the sibling-collision surface shrinks.
- **PLAN.md layer 7.** Future archive page on windyroad.com.au will read the per-date-subdir layout; the URL shape is a separate decision when that work lands.
