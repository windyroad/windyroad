# Problem 004: Slider position misleading for probability value

**Status**: Open
**Reported**: 2026-04-14
**Priority**: 8 (Medium). Impact: Significant (4) x Likelihood: Unlikely (2)

## Description

The probability slider uses equally-spaced discrete stops (one per Manifold Markets answer bucket, indexed 0 to N-1), but the cumulative probability values are not evenly distributed. This means the visual position of the thumb does not correspond to the displayed probability percentage.

For example, with the current market data: the default selection is Jul 2026 at index 3 of 5 stops (0-4). The thumb sits at 75% of the slider track (3/4), but the cumulative probability shown is 61%. Visually, a value of 61% appearing at the 75% mark (or a value above 50% appearing below the midpoint) is misleading.

## Symptoms

- The 61% cumulative probability stop appears at a slider position that does not visually correspond to 61%
- Users may expect the slider position to correlate with the probability percentage
- The slider visual metaphor (position = value) is broken because the axis represents month index, not probability

## Workaround

None identified yet. The output text below the slider shows the correct month and probability, so the data is accurate even if the visual position is misleading.

## Impact Assessment

- **Who is affected**: All homepage visitors interacting with the slider
- **Frequency**: Every slider interaction
- **Severity**: Medium (confusing UX that may undermine trust in the prediction data, weakening J1: Awareness)
- **Analytics**: N/A

## Root Cause Analysis

### Preliminary Hypothesis

The slider uses `min=0`, `max=answers.length-1`, `step=1`, mapping each discrete answer bucket to an equally-spaced index position. The visual position of the thumb reflects the index (0,1,2,3,4) not the cumulative probability (5%, 17%, 49%, 62%, 72%).

Previous fix attempt (relabelling to "Target month") rejected. The slider label should remain "Probability threshold" and the stop positions must be at their actual cumulative probability percentage on the track.

Required fix: Use a custom slider where the value range is 0-100 (percentage) and each discrete stop snaps to its cumulative probability value (e.g., 5, 17, 49, 62, 72). The thumb position then visually matches the displayed percentage.

### Investigation Tasks

- [ ] Investigate root cause
- [ ] Create reproduction test
- [ ] Create INVEST story for permanent fix

## Related

- `src/components-next/Countdown/index.tsx` (slider implementation, lines 140-166)
- P003 (slider horizontal alignment, known-error)
