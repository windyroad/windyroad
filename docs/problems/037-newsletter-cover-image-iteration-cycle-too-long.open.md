# Problem 037: /wr-newsletter cover-image step requires 15+ iteration rounds; brand-asset grep + font-rendering diagnostics missing

**Status**: Open
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

## Related

- P044 (cover-generator skill design)
- This retrospective: 2026-05-01 edition retro
