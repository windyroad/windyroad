# Diagram inspection checklist

Applied per diagram by the `wr-blog:render-diagrams` skill (and by `wr-blog:create-social-posts` step 2.3 against the cover image). Run this checklist after every render, and after every fix, until all checks pass.

## Render quality

- [ ] Title and subtitle fit canvas width (no horizontal overflow).
- [ ] Every text element is fully visible (not clipped at any edge).
- [ ] Every text element does not overlap any line, arrow, or other text.
- [ ] Every arrow lands on its target box (not in empty space, not crossing through unrelated text or section headers).
- [ ] Every label is visible (not hidden behind a box drawn after it in source order).
- [ ] Container-bound text (badges, cards, callouts) does not overflow its container.
- [ ] Palette matches existing diagrams in `public/img/social/` (slate-900 page bg, slate-800 cards, red-900 / blue-900 column tints, red-500 / green-500 accents).

## WCAG AA contrast (mandatory)

Run the `contrast-master` subagent against the SVG source. The subagent reads the SVG, extracts all hex values (composing alpha-channel `XX80` / `XX90` suffixes over their backgrounds), and computes ratios for every text-on-background pair and every UI border pair.

Targets:

- **4.5:1** for normal text.
- **3:1** for large text (>=18px regular or >=14px bold) and UI borders.
- Decorative elements (dashed seams, ornamental shapes that do not carry information) are exempt.

### Known windyroad-palette failure patterns

These patterns recur across the existing diagrams. Watch for them on every new diagram, and apply the listed fix.

| Pattern | Failure ratio | Fix |
|---|---|---|
| `#XXXXXX80` / `#XXXXXX90` alpha suffix on subtext fills | 3.0 to 4.4:1 | drop alpha (use full-alpha hex); rely on font size / weight for hierarchy |
| `#64748B` slate-500 body text on slate-900 / slate-800 | 3.05 to 3.75:1 | `#94A3B8` slate-400 (5.7 to 7.0:1) |
| `#7F1D1D` red-800 border on page or card bg | 1.78:1 | `#DC2626` red-600 (3.70:1) |
| `#1E40AF` blue-700 border on page or card bg | 2.05 to 2.08:1 | `#3B82F6` blue-500 (4.85:1) |
| `#3B82F650` alpha-blue stroke | 1.57:1 (composed) | `#3B82F6` (drop alpha; 4.85:1) |
| `#334155` slate-700 card stroke on page bg | 1.72:1 | `#64748B` slate-500 (3.75:1) |
| `#475569` slate-600 inner stroke on card | 1.93:1 | `#64748B` slate-500 (3.18:1) |

### Borderline cases

- Saturated text on saturated dark fill of the same hue (e.g. `#EF4444` red-500 on `#3B0E0E` red-950): passes 3:1 large-text bar at 18px+, but only just (4.45:1). For visual clarity, lift to a paler tint (`#FCA5A5` red-300) which gives 8.82:1. Stays unambiguously red.

## Direct-view accessibility

- [ ] SVG has a `<title>` element (read aloud when the SVG is opened directly).
- [ ] SVG has a `<desc>` element describing the diagram in prose (longer description for screen readers viewing the SVG file).
- [ ] When the SVG is embedded as an `<img>` in markdown, the alt text on the markdown image describes the diagram for the embedded use case (the SVG `<title>` and `<desc>` apply when the SVG is opened standalone).

## Reduced-motion

- [ ] No CSS animations or SMIL `<animate>` elements that move on render. Static diagrams only. (If animation is wanted in the future, gate it behind `prefers-reduced-motion: no-preference`.)

## Verification protocol

1. Render the SVG to PNG via `node scripts/render-svg.mjs <input.svg> <output.png>`.
2. Read the PNG via the harness Read tool.
3. Step through this checklist top to bottom.
4. For any FAIL, propose a specific SVG edit (hex swap, position adjust, font-size change). Apply and re-render.
5. Loop until every check passes.

Do not ship a diagram with any known FAIL on this checklist.
