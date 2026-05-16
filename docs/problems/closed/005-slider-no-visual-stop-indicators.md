# Problem 005: Slider has no visual indicators for discrete stops

**Status**: Closed
**Reported**: 2026-04-14
**Closed**: 2026-04-17 (user-verified fix in production). Slider now renders subtle dot indicators at each stop position on the track.
**Priority**: 8 (Medium). Impact: Significant (4) x Likelihood: Unlikely (2)

## Description

The probability slider has 5 discrete stops (one per Manifold Markets answer bucket) but renders as a continuous range input with no visual tick marks, dots, or other indicators showing where the stops are. Users cannot see how many options exist or where they can snap to.

## Symptoms

- Slider track appears smooth and continuous with no visible stop positions
- Users have no visual affordance showing that the slider snaps to discrete positions
- Unclear how many options are available without dragging back and forth
- The slider looks like it could accept any value rather than only 5 specific stops

## Workaround

The output text below the slider ("Jul 2026 (61%)") updates on each stop, so users can discover the stops by dragging. But there is no upfront visual cue.

## Impact Assessment

- **Who is affected**: All homepage visitors interacting with the slider
- **Frequency**: Every slider interaction
- **Severity**: Medium (reduces discoverability; users may not realise they can explore different months)
- **Analytics**: N/A

## Root Cause Analysis

### Preliminary Hypothesis

The slider uses a native `<input type="range">` with `step=1`, which provides the snapping behaviour but no visual tick marks. Native range inputs do not render tick marks by default. HTML5 provides `<datalist>` with `<option>` elements linked via the `list` attribute to render tick marks, but browser support and styling varies.

Previous fix attempt (text labels below slider) rejected. User wants subtle visual indicators (circles, notches, dots) at each stop position, not text labels.

Required fix: Render small circles or notch marks on the slider track at each stop position. These must be positioned proportionally to cumulative probability (aligned with P004 fix). No text labels.

### Investigation Tasks

- [ ] Investigate root cause
- [ ] Create reproduction test
- [ ] Create INVEST story for permanent fix

## Related

- P004 (slider position misleading for probability, separate issue)
- `src/components-next/Countdown/index.tsx` (slider implementation, lines 140-166)
- `src/components-next/Countdown/Countdown.module.scss` (slider styles)
