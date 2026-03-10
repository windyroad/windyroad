---
name: wardley
description: Generate or update the project's Wardley Map by analyzing the codebase. Produces an OWM source file, SVG, and PNG.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Wardley Map Generator

Analyze the codebase and generate a Wardley Map of the project's value chain.

## Output files

- `docs/wardley-map.owm` (OWM source)
- `docs/wardley-map.svg` (rendered SVG)
- `docs/wardley-map.png` (rendered PNG)

## Steps

### 1. Inventory the codebase

Scan the project to identify components across these layers:

- **User-visible**: pages, navigation, interactive elements (what the user sees)
- **Content**: articles, data, authored assets (what differentiates the site)
- **Application**: frameworks, rendering pipelines, custom plugins (what processes content)
- **Quality/process**: hooks, gates, decision records, standards (what enforces quality)
- **Infrastructure**: hosting, CI/CD, build tools (what runs in production)

Key files to check: `package.json`, `src/app/`, `src/components-next/`, `src/lib/`, `src/articles/`, `.claude/hooks/`, `.claude/agents/`, `.github/workflows/`, `netlify.toml`, `docs/decisions/`.

### 2. Classify evolution

For each component, determine its evolution stage:

| Stage | Evolution (x) | Characteristics |
|-------|--------------|-----------------|
| Genesis | 0.00 to 0.17 | Novel, no off-the-shelf equivalent |
| Custom-Built | 0.17 to 0.37 | Understood but bespoke |
| Product | 0.37 to 0.63 | Standardised, configurable |
| Commodity | 0.63 to 1.00 | Utility, interchangeable |

### 3. Position on value chain

Visibility (y-axis): 1.0 = user-facing, 0.0 = deep infrastructure. Place components by how directly a reader interacts with them.

### 4. Keep it simple

Aim for 8 to 12 components. Merge related things. A cluttered map is worse than a slightly lossy one. Every component should earn its place by representing a distinct evolutionary position or a key dependency.

### 5. Generate the OWM file

Write `docs/wardley-map.owm` using OWM syntax:

```
title Project Value Chain

anchor User Need [0.95, 0.55]

component Name [visibility, evolution]

From->To
```

### 6. Render

Run: `node ${CLAUDE_SKILL_DIR}/owm-to-svg.mjs`

### 7. Verify

Read the generated PNG and check:
- No overlapping labels
- Dependencies flow logically (top to bottom, left or right)
- Evolution positions match the phase boundaries
- The map tells a coherent story about where value and novelty live

If the map has issues, adjust positions in the OWM file and re-render.

## Updating an existing map

If `docs/wardley-map.owm` already exists, read it first. Compare against the current codebase. Add new components, remove dead ones, adjust evolution positions if things have matured. Preserve the user's positioning choices where the codebase hasn't changed.
