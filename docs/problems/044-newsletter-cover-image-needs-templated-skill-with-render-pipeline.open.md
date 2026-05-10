# Problem 044: /wr-newsletter needs a dedicated cover-image skill (templated SVG + render script) for consistent weekly output

**Status**: Open
**Reported**: 2026-05-01
**Priority**: 12 (Significant). Impact: Moderate (3) x Likelihood: Likely (4) (re-rated 2026-05-10 per ADR 027: templated cover-image skill is pre-publish pipeline disruption at L3 Moderate)
**Effort**: M
**WSJF**: (12 x 1.0) / 2 = 6.0 (folklore weight 2.0 dropped per ADR 027)

## Description

The /wr-newsletter step 12 (cover image) currently asks the inline drafter to compose an SVG from scratch each edition, with brand-asset discovery as a soft requirement. This produces inconsistent output (15+ iteration rounds in 2026-05-01) and recurring font-rendering issues (sips Condensed-Bold fallback at weights 700-900).

User-named direction (2026-05-01): "we should have a skill for creating it (created using the skill creator) that uses a templated version of the current cover SVG and a script to convert it to PNG, that way it's consistent each week."

## Symptoms

- 2026-05-01 Edition 3 cover: 15+ iteration rounds before user accepted (P037 root cause)
- 2026-04-24 Edition 2 cover: cited by user as the brand reference; current cover converged on matching it after many rounds
- Brand mark, monogram, accent stripe, font weights, sizes all hand-iterated each edition

## Workaround

Hand-iterate the cover SVG each edition; user catches brand-fidelity issues; sips font fallbacks discovered via diagnostic test SVGs.

## Root Cause Analysis

### Root Cause

Step 12 is prompt-driven composition rather than template-driven generation. Each edition starts from approximations because the canonical brand SVG isn't reused programmatically. Font-rendering pipeline (sips) silently substitutes weights without surface diagnostic.

### Fix Strategy

- **Kind**: create
- **Shape**: skill (built via skill-creator)
- **Suggested name**: `wr-newsletter:create-cover`
- **Scope**: Generate the weekly cover image (SVG + PNG) from a template + dynamic inputs.
- **Components**:
  - **Template**: `.claude/skills/wr-newsletter/assets/cover-template.svg`, parameterised version of the verified `2026-05-01.cover.svg` with placeholders `{{ISSUE_NUMBER}}`, `{{WEEK_ENDING_DATE}}`, `{{HOOK_LINE_1}}`, `{{HOOK_LINE_2}}`. Brand-asset paths (shift-gate, WR monogram, accent stripe) baked into the template, not regenerated each edition.
  - **Render script**: `scripts/render-cover.mjs`, Playwright + headless Chromium (matches IDE preview font resolution, not sips fallback). Reuses the `playwright-fetch.mjs` pattern (P034 follow-up: commit that script too).
  - **Skill inputs**: edition N, week-ending YYYY-MM-DD, two-line hook (white + accent), persona-specific subtitle ("AI ENGINEERING, WEEKLY · ISSUE 0X").
  - **Skill outputs**: `<draft-folder>/<date>.cover.svg`, `<draft-folder>/<date>.cover.png`, alt text (100-160 chars).
  - **Step 1 of skill**: grep `src/newsletters/assets/` to confirm brand assets exist before rendering. Fail-fast if missing.
- **Triggers**: invoked from `/wr-newsletter` step 12 (replace inline cover composition).
- **Replaces**: step 12's hand-composition prompt with a deterministic invocation.

## Related

- P037 (cover-image iteration cycle too long), root cause this skill addresses
- P034 (URL verification), companion: `playwright-fetch.mjs` is shared infrastructure
- This retrospective: 2026-05-01 edition retro
