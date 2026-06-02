# Leader published: The Shift

Archive of published editions of The Shift.

## Layout

Per ADR-039 (per-date sub-directory layout for published newsletter editions), each published edition occupies a sub-directory of this folder named by its publication date in ISO format (`YYYY-MM-DD/`). The sub-directory contains the brief (`YYYY-MM-DD.md`) plus its sibling artefacts: `.reviews.md` (review blocks per ADR-026), `.linkedin.md` (share post), `.capture.md` (capture transcript per ADR-019), `.cover.svg` and `.cover.png` (cover image).

This `README.md` stays at the persona-folder root as the persona-archive index; it is not pulled down into any sub-directory.

The flat draft `src/newsletters/drafts/2026-04-17.md` (The Shift edition 1) predates the per-persona split. Once Tom publishes that edition to LinkedIn it should land in `src/newsletters/published/leader/2026-04-17/` alongside any siblings, not in the parent flat folder.
