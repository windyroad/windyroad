# Published

Published issues of the Windy Road newsletters.

## Per-persona structure

- `leader/`: published The Shift editions.
- `developer/`: published Tokens Spent editions.

## Workflow

After posting a draft to LinkedIn, Tom creates a per-date sub-directory `src/newsletters/published/<persona>/<publication-date>/` (per ADR-039) and moves the draft brief plus its sibling artefacts (`.md`, `.reviews.md`, `.linkedin.md`, `.capture.md`, `.cover.svg`, `.cover.png`) into that sub-directory. Keeps a permanent archive with each edition's bundle co-located, and a clear separation between "work in progress" and "shipped."

A future iteration (layer 7 in `docs/ai-engineering-brief/PLAN.md`) will surface this archive on windyroad.com.au.
