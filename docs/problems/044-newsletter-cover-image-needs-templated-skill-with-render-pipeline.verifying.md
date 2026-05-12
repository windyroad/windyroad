# Problem 044: /wr-newsletter needs a dedicated cover-image skill (templated SVG + render script) for consistent weekly output

**Status**: Verification Pending
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

## Resolution Implementation (2026-05-11, iter 6 of AFK work-problems loop)

Landed the templated cover-image skill per the architect-approved M-effort minimum. The structural extraction of `/wr-newsletter` step 12 supersedes P037's in-line amendment; P037's font conventions (Avenir Next 500 for hooks, Futura Lt BT 300 for the wordmark with HelveticaNeue Light fallback) now live as the canonical defaults baked into the template, so the working set survives the move.

### What landed

- New skill `.claude/skills/wr-newsletter-cover/SKILL.md` with five steps: brand-asset preflight (fail-fast), accessible title/desc composition, render-script invocation, P011 render-and-verify, alt-text return.
- Template `.claude/skills/wr-newsletter-cover/assets/cover-template.svg` parameterised from the verified `src/newsletters/published/leader/2026-05-01.cover.svg`. Brand mark, monogram, accent stripe, font stack, palette, and layout are baked in; the seven dynamic placeholders are `{{TITLE_TEXT}}`, `{{DESC_TEXT}}`, `{{WORDMARK}}`, `{{SUBTITLE}}`, `{{HOOK_LINE_1}}`, `{{HOOK_LINE_2}}`, `{{WEEK_ENDING}}`.
- Render script `scripts/render-cover.mjs` with exported `substituteCoverTemplate(template, params)` plus a CLI that writes the SVG and shells out to `scripts/render-svg.mjs` for the PNG. XML special characters in inputs are escaped automatically.
- Unit test `scripts/render-cover.test.mjs` covering placeholder substitution, missing-parameter error, and XML escaping (4 tests, all green via `npx vitest run scripts/render-cover.test.mjs`).
- `/wr-newsletter` SKILL.md step 12 collapsed from 12.a-e prose (~45 lines) to a single skill-invocation block (~15 lines). Step 12-prime updated to re-invoke the cover skill on finalise-time headline changes; idempotent date-anchored output paths mean prep-then-finalise overwrites the same file deterministically.

### Verification

End-to-end render of the 2026-05-01 leader-edition inputs against the new template produces a PNG visually identical to the published `2026-05-01.cover.png`. SVG diff against the published source shows only cosmetic differences: trimmed brand-mark comments and `&quot;` vs literal `"` escaping in `<desc>` (both XML-equivalent). Brand mark coordinates, font stack, hook scale, monogram scale, accent stripe geometry are byte-identical.

### Deviations from the ticket fix strategy

Per the wr-architect:agent review (2026-05-11), two scope deviations were approved:

1. **Render engine.** Ticket proposed Playwright + headless Chromium. Approved deferral: reuse `scripts/render-svg.mjs` (sips) since P037 just landed the sips font conventions and no ADR binds the render pipeline. If reader-feedback or legibility flags break the sips workarounds, file a new ADR + companion ticket to introduce Playwright. The cover skill's "When to extend the template" section names this as the trigger.
2. **Skill name + placement.** Ticket suggested `wr-newsletter:create-cover` (colon-namespaced). ADR-011 reserves colon namespacing for marketplace plugins; `/wr-newsletter` is project-local under `.claude/skills/`. Approved alternative: `.claude/skills/wr-newsletter-cover/SKILL.md` with `name: wr-newsletter-cover` (flat, project-local, telegraphs newsletter relationship).

### Relationship to P037

P037 (cover-image iteration cycle too long) is the minimal-fix predecessor that landed in iter 5 of this loop. P037's in-line step-12 amendment documented the brand-asset read, sips font traps, and P011 render-and-verify. This ticket (P044) is the structural-fix successor: the same content now lives inside a dedicated skill with a deterministic template + script, eliminating the prose-driven composition that P037 only partially constrained.

P037 should remain in its current `.known-error.md` (or `.verifying.md` if released since iter 5) state; the skill landing here does not re-open P037 but it does deliver the durable fix P037 deferred to P044. Mark P037 as superseded-by-P044 at next `manage-problem review`.

### Files touched

- `.claude/skills/wr-newsletter-cover/SKILL.md` (new)
- `.claude/skills/wr-newsletter-cover/assets/cover-template.svg` (new)
- `scripts/render-cover.mjs` (new)
- `scripts/render-cover.test.mjs` (new)
- `.claude/skills/wr-newsletter/SKILL.md` (step 12 + 12-prime delegate)
- `docs/problems/044-...known-error.md` (this file; renamed from .open.md, Status updated)

## Fix Released

Released 2026-05-12 to `origin/master` in commit `95cd9c6`: wr-newsletter-cover skill with templated SVG plus render script, vitest tests, and step 12 collapse from 5-stage inline prose to single skill invocation.

Awaiting user verification. Verification trigger: next /wr-newsletter prep+finalise cycle that produces the cover in 1 invocation with no brand-mark, monogram, or font-weight reverts.
