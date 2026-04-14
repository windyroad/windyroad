# Problem 002: Hero content extends beyond the fold

**Status**: Open
**Reported**: 2026-04-14
**Priority**: 8 (Medium). Impact: Significant (4) x Likelihood: Unlikely (2)

## Description

The homepage hero section content (headline, body text, CTAs, countdown grid, probability slider, and attribution) extends below the viewport fold. The slider output text and Manifold Markets attribution are cut off at the bottom of the screen. The hero section uses `min-height: 45vh` which is insufficient to contain all the content while maintaining vertical centering.

The countdown and slider are also not vertically centred within the hero. Content is pushed toward the top by `padding-top: calc(var(--header-height) + 4rem)` but nothing compensates at the bottom, so visual centre is offset.

## Symptoms

- Attribution text ("Manifold Markets gives a 61% chance of arrival by Jul 2026") is partially or fully below the viewport fold
- Slider output ("Jul 2026 (61%)") is barely visible at the fold line
- Content appears top-heavy rather than vertically centred
- Problem is more pronounced on shorter viewports and standard 1080p displays

## Workaround

Users can scroll down to see the full attribution. The content is accessible but not immediately visible.

## Impact Assessment

- **Who is affected**: All homepage visitors (Engineering Leaders, the primary persona)
- **Frequency**: Every homepage visit
- **Severity**: Medium (the urgency narrative depends on seeing the prediction data; hiding it below the fold weakens J1: Awareness)
- **Analytics**: N/A

## Root Cause Analysis

### Preliminary Hypothesis

The hero section in `src/app/page.module.scss` uses `min-height: 45vh` with `align-items: center`. Adding the probability slider and its output increased the total content height beyond what 45vh can accommodate. The `padding-top: calc(var(--header-height) + 4rem)` adds to the offset without a corresponding `padding-bottom`, breaking the vertical centring.

Possible fixes:
- Increase `min-height` to `100vh` or `100svh` so the hero fills the viewport
- Add matching `padding-bottom` for true vertical centring
- Reduce content density (smaller countdown, tighter spacing)

### Investigation Tasks

- [ ] Investigate root cause
- [ ] Create reproduction test
- [ ] Create INVEST story for permanent fix

## Related

- `src/app/page.module.scss` (hero layout styles, line 17)
- `src/app/page.tsx` (hero section structure, line 152)
- `src/components-next/Countdown/` (countdown and slider component)
