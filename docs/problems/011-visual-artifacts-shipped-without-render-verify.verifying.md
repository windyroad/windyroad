# Problem 011: Visual artifacts iterated and presented without render-and-verify discipline

**Status**: Verification Pending
**Reported**: 2026-04-17
**Transitioned to Known Error**: 2026-04-25 (review pass: root cause confirmed; render-and-verify workaround documented in BRIEFING.md)
**Transitioned to Verification Pending**: 2026-04-25 (fix released: render-and-verify discipline note added to wr-newsletter SKILL.md step 12 with explicit 5-step flow; shared helper `scripts/render-svg.mjs` created; smoke-tested against `the-shift-logo.svg`. Verification fires on the next visual-artifact iteration: logo rework, OG image update, or cover-image generation.)
**Priority**: 6 (Medium). Impact: Moderate (3) x Likelihood: Unlikely (2)
**Effort**: S (add render-and-verify reminder to skills that produce visual output; optional sips wrapper script)
**WSJF**: (6 x 2.0) / 1 = 12.0
**Re-rated 2026-04-25**: Likelihood label corrected from Likely (2) to Unlikely (2). 2 in the likelihood ladder is Unlikely; Likely is 4. Score 6 unchanged.

## Description

During the logo work in the 2026-04-17 session, the assistant produced multiple SVG iterations for `src/newsletters/assets/the-shift-logo.svg`, described what each would look like, and presented them to Tom without rendering to PNG or viewing the result first. Tom caught a broken arrowhead, an overlapping monogram, and a shift-pattern with the horizontal extending past the rightmost slot. Each of those would have been visible in a rendered PNG. Tom had to direct the correction explicitly: "You should be converting to png and assessing yourself."

## Symptoms

- Multiple SVG-edit iterations shipped to Tom without a local render and self-check
- Specific visual bugs reached the user first: overlapping "WINDY ROAD" text and WR monogram; accent-orange S-curve chevron arrow rendering wrong at stroke-width; shift-pattern horizontal overshooting the rightmost vertical
- Each bug was trivial to detect by looking at the PNG; zero were detected before Tom called them out

## Workaround

When producing a visual artifact:

1. Write the SVG with the `Write`/`Edit` tool as usual.
2. Immediately convert to PNG via `sips -s format png -Z <size> in.svg --out out.png` (macOS built-in).
3. `Read` the output PNG, which the harness renders as a visual in the tool result.
4. Visually assess the rendered image against the intent before calling the iteration done.
5. Fix and re-render until the PNG looks right.
6. Present to the user with confidence that the image matches the description.

This workflow is already in use for Wardley maps (via `wr-wardley:generate`'s `owm-to-svg.mjs`). The pattern was not applied to one-off SVG work on the logo.

## Impact Assessment

- **Who is affected**: anyone producing visual artifacts in this project (logos, diagrams, OG images, Wardley maps). The weekly newsletter does not need a new logo, so the direct frequency is low, but the discipline gap affects all visual-output workflows.
- **Frequency**: every time a visual artifact is produced or iterated without rendering
- **Severity**: Medium. Wasted iteration cycles, user-detected bugs, erosion of trust in visual output.

## Root Cause Analysis

### Root Cause

No explicit process step in any skill or instruction says "convert and self-verify before presenting". The render-and-verify pattern is present in `wr-wardley:generate` (step 9 "Render" + step 10 "Verify") but is not generalised.

The assistant defaulted to describing the SVG's intent rather than rendering it, which is safe for text-based artifacts but fails for visual ones where the rendered output depends on font availability, stroke paths, coordinate systems, and layering.

### Fix Strategy

Short-term:
- Document the render-and-verify pattern in BRIEFING.md "What Will Surprise You" (done 2026-04-17)
- When iterating visual artifacts in future sessions, add a TaskCreate item "Render and verify" so the step is visible in task state

Longer-term:
- Add a `visual-artifact` discipline note to the newsletter skill (and consider a generic one for other projects)
- Consider a helper script `scripts/render-svg.mjs` that wraps `sips` so the command is consistent across contributors
- If the pattern generalises, extract to a project-level convention (CLAUDE.md or similar)

### Investigation Tasks

- [x] Capture the lesson in BRIEFING.md (done)
- [x] Add a "render and verify" reminder to the Logo section of any skill that produces visual output (done 2026-04-25: discipline note added to `.claude/skills/wr-newsletter/SKILL.md` step 12; same pattern already lives in `wr-wardley:generate` step 9-10)
- [x] Consider whether a shared helper script is warranted for SVG-to-PNG conversion (done 2026-04-25: `scripts/render-svg.mjs` wraps `sips -s format png -Z <size> in.svg --out out.png`; smoke-tested against `src/newsletters/assets/the-shift-logo.svg`)
- [ ] Project-level convention extraction (CLAUDE.md or similar) is deferred. Effort is S only because items 1 and 2 are scoped to the newsletter skill; whether the pattern generalises to a project-wide convention is a separate design question to revisit if a third visual-output workflow appears.

## Related

- `src/newsletters/assets/the-shift-logo.svg`
- `src/newsletters/assets/the-shift-logo.png`
- `~/.claude/plugins/cache/windyroad/wr-wardley/0.1.0/skills/generate/owm-to-svg.mjs` (example of render-and-verify done right)
- `docs/BRIEFING.md` (captures the lesson)
