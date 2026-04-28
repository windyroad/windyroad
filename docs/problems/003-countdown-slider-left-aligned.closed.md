# Problem 003: Countdown and slider left-aligned in hero

**Status**: Closed
**Reported**: 2026-04-14
**Closed**: 2026-04-17 (user-verified fix in production). Countdown grid and slider now centred in the hero via `margin: 0 auto` on `.grid` and `.slider` in `Countdown.module.scss`.
**Priority**: 8 (Medium). Impact: Significant (4) x Likelihood: Unlikely (2)

## Description

The countdown grid, probability slider, and attribution text are left-aligned within the hero section, while the headline, body text, and CTA buttons are horizontally centred. The Countdown component's block elements have `max-width: 400px` but no auto margins to centre them.

## Symptoms

- Countdown numbers (Days, Hours, Minutes, Seconds) are flush-left
- Probability slider and its label are flush-left
- Attribution text ("Manifold Markets gives a 61% chance of arrival by Jul 2026") is flush-left
- Headline, body paragraph, and CTA buttons above are centred
- Visual imbalance: content appears lopsided

## Workaround

None identified yet.

## Impact Assessment

- **Who is affected**: All homepage visitors
- **Frequency**: Every homepage visit
- **Severity**: Medium (visual polish issue that undermines professional credibility with Engineering Leader persona)
- **Analytics**: N/A

## Root Cause Analysis

### Preliminary Hypothesis

The `.grid` and `.slider` classes in `src/components-next/Countdown/Countdown.module.scss` both have `max-width: 400px` but no `margin: 0 auto`. The hero parent uses `text-align: center` which centres inline and text content, but block-level elements with constrained `max-width` default to left alignment. The `.attribution` paragraph has no max-width constraint but its text is left-aligned by default.

Fix: add `margin: 0 auto` to `.grid` and `.slider` in `Countdown.module.scss`.

### Investigation Tasks

- [x] Investigate root cause (hero `text-align: center` does not centre block-level elements with `max-width: 400px` unless they also carry `margin: 0 auto`)
- [x] Apply fix (`margin: 0 auto` on `.grid` and `.slider` in `Countdown.module.scss`)
- [x] User-verified in production on 2026-04-17

## Related

- P002 (hero content extends beyond fold, separate vertical issue)
- `src/components-next/Countdown/Countdown.module.scss` (lines 5-10: `.grid`, lines 69-72: `.slider`)
