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
- `docs/wardley-map.md` (analysis with embedded map image)

## Steps

### 1. Discover the user need

Read the project's README, homepage, main entry point, or package description to determine what need the project serves. The anchor must be a specific need, not a person. "Software delivery insight" not "Reader". "Real-time cricket stats" not "User". The anchor should distinguish this project from others.

### 2. Inventory the codebase

Scan the project to identify components. Look for:

- **User-facing outputs**: UI, API endpoints, CLI commands, reports, pages
- **Content or data**: authored content, databases, data pipelines, models
- **Processing logic**: custom business logic, transformation pipelines, plugins
- **Quality enforcement**: testing, linting, review gates, compliance checks
- **Infrastructure**: hosting, CI/CD, build tools, deployment, monitoring
- **Dependencies**: frameworks, libraries, external services

Adapt the scan to the project type. A web app has pages and components. An API has endpoints and middleware. A CLI has commands and parsers. A library has modules and public API surface.

### 3. Classify evolution

For each component, determine its evolution stage:

| Stage | Evolution (x) | Characteristics |
|-------|--------------|-----------------|
| Genesis | 0.00 to 0.17 | Novel, no off-the-shelf equivalent, high uncertainty |
| Custom-Built | 0.17 to 0.37 | Understood but bespoke, built for this project |
| Product | 0.37 to 0.63 | Standardised, configurable, multiple providers exist |
| Commodity | 0.63 to 1.00 | Utility, interchangeable, barely noticed when working |

### 4. Position on value chain

Visibility (y-axis): 1.0 = directly serves the user need, 0.0 = deep infrastructure the user never thinks about.

### 5. Decide what to split and merge

Aim for 8 to 12 components. Rules:

- **Split** when two things have different evolution positions (one custom, one commodity) or different strategic roles (one differentiates, one is plumbing).
- **Merge** when two things are at the same evolution stage and serve the same strategic purpose.
- Every component should earn its place. If removing it from the map loses no information, remove it.

### 6. Identify evolution movement

For each component, ask: is this evolving? Signs of evolution:

- You are writing articles about it (moving from Genesis toward Custom-Built)
- Multiple projects now use the same pattern (moving toward Product)
- An off-the-shelf alternative has emerged (moving toward Commodity)
- You are considering replacing a custom solution with a standard one

Add `evolve` annotations for components that are actively moving.

### 7. Map dependencies

A->B means "A needs B to function." Not "A influences B" or "A produces B." Only draw links that represent real runtime or build-time dependencies. Fewer lines with clear meaning beats many lines that add noise.

### 8. Generate the OWM file

Write `docs/wardley-map.owm` using OWM syntax:

```
title Project Value Chain

anchor User Need [0.95, 0.55]

component Name [visibility, evolution]

evolve Component Name 0.45

From->To
```

### 9. Render

```bash
node ${CLAUDE_SKILL_DIR}/owm-to-svg.mjs
```

### 10. Verify

Read the generated PNG and check:

- No overlapping labels
- Dependencies flow logically
- Evolution positions match the phase boundaries
- Evolution arrows show meaningful movement
- The map tells a coherent story: where is the differentiation? What is evolving? What is commodity?

If the map has issues, adjust positions in the OWM file and re-render.

### 11. Write the analysis

Write `docs/wardley-map.md` with the following structure:

```markdown
# Wardley Map

![Wardley Map](wardley-map.png)

## Analysis

### Differentiation
(Which components are custom/genesis? These are the competitive advantage.)

### Evolution
(What is moving? In which direction? What does that mean for investment?)

### Risk
(Which custom components could be replaced by commodities? Which commodities could change?)

### Decisions
(Does the map surface any strategic choices the project should make?)
```

The image path should be relative to `docs/` since the PNG lives in the same directory. Keep the analysis concise and actionable. Each section should be 2 to 4 sentences.

## Updating an existing map

If `docs/wardley-map.owm` already exists, read it first. Compare against the current codebase:

- Add components for things that have been added to the project
- Remove components for things that no longer exist
- Adjust evolution positions for things that have matured
- Add or update `evolve` arrows for things in motion
- Preserve the user's positioning choices where the codebase has not changed
