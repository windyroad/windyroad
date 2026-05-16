# Problem 037: /wr-newsletter cover-image step requires 15+ iteration rounds; brand-asset grep + font-rendering diagnostics missing

**Status**: Verification Pending
**Reported**: 2026-05-01
**Priority**: 12 (Significant). Impact: Moderate (3) x Likelihood: Likely (4) (re-rated 2026-05-10 per ADR 027: cover-image iteration is pre-publish pipeline disruption at L3 Moderate)
**Effort**: M
**WSJF**: (12 x 1.0) / 2 = 6.0 (folklore weight 2.0 dropped per ADR 027)

## Description

The /wr-newsletter step 12 (cover image) consumed 15+ user-feedback rounds in the 2026-05-01 finalise:

1. Wrong brand mark (rectangles approximating shift-gate, instead of canonical 6-speed pattern)
2. Wrong WR monogram (didn't grep canonical `the-shift-logo.svg`)
3. Wrong font weight (Heavy too heavy, Bold too compressed)
4. Wrong font family (Helvetica Neue Bold renders as Condensed Bold via sips)
5. Subtitle too wide / too narrow / wrong colour / wrong weight
6. Heading too small relative to last week's
7. Accent stripe present then removed then restored
8. Cover hook ↔ brief H1 mismatch caught manually
9. SVG-vs-PNG font divergence (sips substitutes Condensed weights silently)

The skill prose says "Brand assets must be discovered before any image generation: grep for existing brand-asset paths and styles per BRIEFING.md 'What You Need to Know' rule" but the prompt does not enforce reading the canonical SVG before composing.

## Symptoms

- 2026-05-01 Edition 3 cover took ~15 iteration rounds before user accepted
- macOS Futura.ttc has no Light variant; weight 300 falls through to Helvetica Neue Light silently
- macOS HelveticaNeue.ttc at weight 700/800/900 resolves to Condensed Bold (sips picks the wrong face)
- Diagnostic discovery required hand-writing a multi-row test SVG to identify which font specs render non-condensed

## Workaround

User flags each issue iteratively. Eventual resolution: Avenir Next at weight 500 for hook lines; canonical shift-gate SVG path embedded; render via existing `sips` (still substitutes silently).

## Root Cause Analysis

### Root Cause

Two contributing root causes:

1. **Brand-asset discovery not enforced**: skill prose says grep brand assets but the inline drafter routinely composes from approximations; rendering issues only surface visually.
2. **Font-rendering pipeline silent fallback**: sips (macOS) silently substitutes Condensed Bold for HelveticaNeue 700, and Helvetica Neue Light for Futura 300. There is no diagnostic surface; visual divergence is the only signal.

### Fix Strategy

User has named the right shape directly: a skill built via skill-creator that uses a templated version of the canonical cover SVG and a render script, see P044.

- **Kind**: create
- **Shape**: skill (templated cover generator), see ticket P044 for the design
- **Companion improvement**: switch render pipeline from `sips` to Playwright/Chromium (already proven in `scripts/playwright-fetch.mjs`) so font resolution matches IDE preview.

## Resolution Implementation

**Date**: 2026-05-11 (AFK work-problems iter 5).

**Scope discipline**: The ticket's documented Fix Strategy points to P044 (full templated cover-generator skill, M effort, Playwright render pipeline). That build is deferred to P044's own iter. P037's resolution is the minimum-viable hardening that addresses both documented root causes (brand-asset discovery, font-rendering silent-fallback) without absorbing P044's scope.

**Change**: `.claude/skills/wr-newsletter/SKILL.md` step 12 rewritten into five labelled sub-steps:

- **12.a (mandatory brand-asset read, fail-fast)**: enumerates two specific canonical paths that MUST be read before any SVG composition: `src/newsletters/assets/the-shift-logo.svg` (canonical brand mark, palette, font stack) and the highest-dated `src/newsletters/published/<persona>/*.cover.svg` (canonical layout + typography reference). Halt step 12 if either is missing; do not improvise from approximations. Path-data reuse (shift-gate `line` coordinates, WR monogram `d` attribute) is now an explicit instruction, closing the documented "drafter routinely composes from approximations" failure mode.
- **12.b (typography conventions)**: documents the font conventions discovered through P037's 15-round iteration on the 2026-05-01 edition. Wordmark and subtitle use the Futura stack at weights 300 / 400. Hook lines use Avenir Next at weight 500 (NOT HelveticaNeue, see 12.c). URL wordmark and week-stamp use Futura stack at 600 / 500.
- **12.c (sips silent-substitution traps, font-rendering diagnostics)**: documents the two confirmed traps. HelveticaNeue weights 700+ silently resolve to Condensed Bold (drove ~5 of the 15 iteration rounds). Futura weight 300 falls through to Helvetica Neue Light (acceptable in the wordmark by convention). Mitigation is named: if typography looks wrong in the rendered PNG, author a multi-row diagnostic SVG with suspect font + weight combinations rather than iterating blindly on the cover. This converts "what's wrong with the cover" into "which font face is sips substituting" in one render-and-read cycle.
- **12.d (compose the cover)**: preserved from the prior version, now constrained to "no new colours, no new font families without an ADR amendment".
- **12.e (render-and-verify discipline, P011)**: preserved verbatim from the prior version, with the visual-comparison step updated to reference the canonical brand SVG and prior-edition cover by step number, and to call out compressed weights as a 12.c failure mode.

A "Follow-up" line points to P044 for the full templated solution so future readers do not re-litigate the design space.

**Architect gate**: PASS (no new ADR required; amendment refines the existing ADR-017 confirmation criterion 5 "brand-asset grep" rule by making it enforceable with named paths, fits within existing patterns at SKILL.md line 532 cross-referencing `wr-wardley:generate` step 9-10 and the P011 render-and-verify discipline). ADR-017 confirmation criterion 5 language is now satisfied by a stronger mechanism (enumerated paths), no documentation hygiene action required this iter.

**JTBD gate**: PASS (the change strengthens the visual-identity surface that feeds JTBD-001 Awareness, JTBD-002 Engagement, JTBD-003 Evaluation for the Engineering Leader persona; the credentialing dimension of JTBD-003 in particular depends on brand-fidelity on LinkedIn).

**Confirmation criterion**: next /wr-newsletter run produces a cover image in fewer than 5 iteration rounds (vs the documented 15+ rounds in the 2026-05-01 baseline) with no brand-mark, monogram, or font-weight reverts. If the next finalise hits more than 5 rounds, this resolution is insufficient; escalate to P044.

**Status transition**: Open → Known Error. P044 remains Open and tracks the full templated-skill build that would convert this from a documented procedure into a deterministic generation step.

## Related

- P044 (cover-generator skill design)
- P011 (render-and-verify discipline, cross-referenced in step 12.e)
- ADR-017 (AI brief prep and finalise phases, confirmation criterion 5)
- This retrospective: 2026-05-01 edition retro

## Fix Released

Released 2026-05-12 to `origin/master` in commit `586c21e`: step 12 rewritten into five labelled sub-steps (mandatory brand-asset read, typography conventions, sips silent-substitution traps, compose-the-cover, render-and-verify).

Awaiting user verification. Verification trigger: next finalise producing the cover in fewer than 5 iteration rounds with no brand-mark, monogram, or font-weight reverts.
