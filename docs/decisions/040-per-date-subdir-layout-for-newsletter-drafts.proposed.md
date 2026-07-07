---
status: "proposed"
first-released: 2026-07-07
date: 2026-06-27
decision-makers: [Tom Howard]
consulted: []
informed: []
reassessment-date: 2026-09-27
human-oversight: confirmed
oversight-date: 2026-06-27
---

# Per-date sub-directory layout for newsletter drafts

## Context and Problem Statement

ADR-039 moved published newsletter editions into per-date sub-directories (`src/newsletters/published/<persona>/<YYYY-MM-DD>/`) to fix the crowding that built up as editions accumulated in a single flat folder. ADR-039 deliberately scoped itself to `published/` only and named the `drafts/` extension as a separate future decision (the P078 Out-of-scope clause), rather than absorbing it. That ratified scope boundary is why this is a new ADR, not an in-place amendment of ADR-039.

The draft folder (`src/newsletters/drafts/<persona>/`) now has the same crowding problem published/ had: each edition writes several sibling files per date (the brief `<YYYY-MM-DD>.md`, plus the ADR-019 / ADR-026 companion siblings `.capture.md`, `.reviews.md`, `.linkedin.md`, `.cover.svg`, `.cover.png`, and so on), and they all accumulate flat in one directory across editions. The question deferred by ADR-039 is now due: should drafts adopt the same per-date sub-directory layout that published editions use?

P084 is blocked on this decision. The iter-10 architect review also flagged a lockstep target that neither P084 nor ADR-039's Out-of-scope clause named: ADR-019 line 52 documents the flat `<YYYY-MM-DD>.capture.md` capture-transcript path, which must move in lockstep if the layout changes.

## Decision Drivers

- **Symmetry with published.** Drafts and published editions are the same artefact at different lifecycle stages. An asymmetric layout (published nested, drafts flat) is a needless inconsistency that the move-workflow has to bridge on every publish.
- **Crowding / navigability.** A flat drafts folder grows unboundedly with sibling files per edition. Per-date sub-dirs keep each edition's companion files grouped and the folder skimmable.
- **Move-workflow simplicity.** Publishing an edition is a `mv` from drafts to published. Matching shapes make that move a whole-directory rename rather than a multi-file gather.
- **Low stakes and reversibility.** This is a file-layout choice with no runtime or visitor-facing surface. It is fully reversible by `git mv`.
- **Lockstep cost.** Whatever is decided must update the wr-newsletter SKILL.md path encoding (steps 0/10/11/16/17), any persona-config edition-count globs that scan drafts, the drafts README move-workflow notes, and the ADR-019 line 52 capture-path reference in one coherent change.

## Considered Options

1. **Extend the same per-date layout to drafts.** Apply the identical `src/newsletters/drafts/<persona>/<YYYY-MM-DD>/` shape ADR-039 uses for published, migrate existing drafts with `git mv`, and update the SKILL.md path encoding, persona-config globs, drafts README, and ADR-019 line 52 in lockstep.
2. **Keep drafts flat (status quo).** Leave `src/newsletters/drafts/<persona>/` flat, accept the crowding and the published/drafts asymmetry, and defer indefinitely.
3. **A different drafts-specific layout.** Invent a drafts-only sub-structure (for example group by status, or by edition-number) that differs from the published per-date shape.

## Decision Outcome

Chosen option: **"Option 1, extend the same per-date layout to drafts"**, because it is a direct application of the already-ratified ADR-039 pattern to the same artefact at an earlier lifecycle stage. It removes the published/drafts asymmetry, keeps the publish step a whole-directory move, and fixes the same crowding ADR-039 fixed for published, at low cost and full reversibility. Option 3 would re-introduce the asymmetry ADR-039 already settled for published, for no benefit. Option 2 leaves the crowding unaddressed.

## Consequences

### Good

- Drafts and published editions share one layout shape. The publish move-workflow becomes a whole-directory rename.
- The drafts folder stays skimmable as editions accumulate. Each edition's companion siblings are grouped under one dated directory.
- The ADR-039 rationale and tooling generalise cleanly. No new layout concept to learn.

### Neutral

- Existing draft files are relocated by `git mv` (history preserved via `--follow`). A one-time migration commit.
- Path-encoding references in the wr-newsletter SKILL.md and persona configs gain a `<YYYY-MM-DD>/` segment.

### Bad

- A lockstep surface: SKILL.md steps 0/10/11/16/17, persona-config edition-count globs (if they scan drafts), the drafts README move-workflow notes, and the ADR-019 line 52 capture-path reference must all change together, or a stale flat-path reference silently breaks draft resolution. This is the same lockstep ADR-039 carried for published, and it is bounded and known.

## Confirmation

- `src/newsletters/drafts/<persona>/` contains per-date sub-directories (`<YYYY-MM-DD>/`) holding each edition's brief plus companion siblings, with no flat per-edition files left at the persona-folder top level after migration.
- A `/wr-newsletter phase=prep` run writes the brief and its companion siblings into `drafts/<persona>/<YYYY-MM-DD>/`, and a subsequent `phase=finalise` plus publish resolves and moves them without a path error.
- `grep` finds no surviving flat `drafts/<persona>/<YYYY-MM-DD>.<ext>` path references in the wr-newsletter SKILL.md, the persona configs, the drafts README, or ADR-019 line 52 after the change.

## Pros and Cons of the Options

### Option 1, extend the per-date layout to drafts

- Good: symmetric with the ratified published layout (ADR-039); whole-directory publish move; fixes crowding; reversible.
- Good: no new layout concept; tooling and rationale generalise.
- Bad: one bounded lockstep change across SKILL.md, persona configs, READMEs, and ADR-019 line 52.

### Option 2, keep drafts flat

- Good: zero work now.
- Bad: crowding persists and worsens; published/drafts asymmetry the move-workflow must keep bridging; defers a now-due decision.

### Option 3, a different drafts-specific layout

- Good: could optimise for a drafts-specific access pattern.
- Bad: re-introduces the published/drafts asymmetry ADR-039 settled; new layout concept to maintain; no demonstrated benefit over the symmetric option.

## Reassessment Criteria

Revisit if: the newsletter pipeline stops using a flat-vs-nested distinction (for example drafts move to a database or a different store); ADR-039's published layout is itself superseded (drafts should track whatever published does); or the per-date grouping proves wrong for a real drafts access pattern that emerges in practice.
