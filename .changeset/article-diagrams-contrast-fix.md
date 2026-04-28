---
'windy-road': patch
---

Fix WCAG AA contrast failures across all four diagrams in the "An AI agent deleted production" article (`sign-vs-control.svg`, `risk-gate-flow.svg`, `risk-score-anatomy.svg`, `layered-defence.svg`). Tom flagged the cover image as low-contrast; the `contrast-master` audit found the same patterns repeated across all four SVGs.

Patterns fixed (consistent palette swaps, identity preserved):

- Drop alpha-channel suffixes on subtext fills (`#FCA5A580` and `#86EFAC90` composed to 3.0 to 4.4:1 on saturated dark fills). Use full-alpha hex; rely on font size and weight for hierarchy.
- Slate-500 body text (`#64748B`) on slate-900 page bg or slate-800 cards (3.05 to 3.75:1) lifted to slate-400 (`#94A3B8`, 5.7 to 7.0:1).
- Red-800 borders (`#7F1D1D`) on dark backgrounds (1.78:1) lifted to red-600 (`#DC2626`, 3.70:1).
- Blue-700 (`#1E40AF`) and alpha-blue (`#3B82F650`) borders (1.57 to 2.08:1) lifted to blue-500 (`#3B82F6`, 4.85:1).
- Slate-700 card strokes (`#334155`) and slate-600 inner strokes (`#475569`) lifted to slate-500 (`#64748B`).
- Code-chip strokes in `risk-gate-flow.svg` lifted to slate-400 (`#94A3B8`) for AA against both chip fill and card.

Re-rendered all four PNGs at `public/img/social/` and updated the cover image at `src/social/an-ai-agent-deleted-production-the-model-wasnt-the-problem/cover.png`. Re-audited via `contrast-master`; all four SVGs now pass WCAG 2.2 AA (1.4.3 Text Contrast and 1.4.11 Non-text Contrast).

Also updates the `wr-blog:create-social-posts` skill to require a `contrast-master` pass on every cover image and article-body diagram, codifies the windyroad-palette failure patterns, and adds a shared `skills/wr-blog/assets/diagram-inspection-checklist.md` that the planned `wr-blog:render-diagrams` skill will reference.
