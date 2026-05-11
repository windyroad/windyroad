# Problem 002: Hero content extends beyond the fold

**Status**: Verification Pending
**Reported**: 2026-04-14
**Known Error since**: 2026-04-25
**Verification Pending since**: 2026-05-11
**Priority**: 9 (Medium). Impact: Moderate (3) x Likelihood: Possible (3) (re-rated 2026-05-10 per ADR 027: static-site visitor degradation now L3 Moderate, ADR 023 paused-CTA reference-material context)
**Effort**: S (CSS adjustment in src/app/page.module.scss; min-height + padding rebalance)
**WSJF**: (9 x 2.0) / 1 = 18.0 (Known Error multiplier 2.0 per upstream wr-itil:manage-problem; prior 12.0 was missing the multiplier)
**Re-rated 2026-04-25**: Likelihood Unlikely (2) to Possible (3). Fold issue visible to most visitors on standard 1080p viewports with no automated fold-fit check; review pass realigns Likelihood with the no-automated-control reality.

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

- [x] Investigate root cause - confirmed: `min-height: 45vh` (35vh on mobile) is well below the height needed to fit headline + sub + CTAs + Countdown (with slider + attribution). Asymmetric `padding-top` with no matching `padding-bottom` also breaks `align-items: center`.
- [ ] Create reproduction test - automated fold-fit check is out of scope for the S envelope; covered by P012 (no ship-gate on push/publish/deploy) for future automation.
- [x] Create INVEST story for permanent fix - landed inline as the SCSS-only fix below.

## Fix Released

**Released**: 2026-04-25 in commit `72c3c2b` on `origin/master` (`fix(hero): set min-height to 100svh for fold-fit (P002)`).
**Scope**: SCSS-only change to `src/app/page.module.scss` `.hero` selector.
**Awaiting user verification**. The browser checks below need to be exercised on the next interactive session before this ticket can close. AFK iter 2 (2026-05-11) cannot run a browser, so transition to Verification Pending per ADR-022 captures the released-but-not-yet-confirmed state.

Changes:
- `min-height: 45vh` to `min-height: 100svh`. `svh` (small viewport height) accounts for mobile browser chrome so 100% truly fits without the URL bar pushing content below.
- Mobile breakpoint `min-height: 35vh` to `min-height: 100svh` (same reasoning).
- Added `padding-bottom: 4rem` to balance the existing `padding-top: calc(var(--header-height) + 4rem)`. Asymmetric padding was breaking `align-items: center`; with both sides padded, vertical centring is true.
- Added `@media (max-height: 600px) { min-height: auto; }` short-viewport guard. Per accessibility-lead review, at 400% zoom (WCAG 1.4.10 Reflow) the effective viewport shrinks and forcing `100svh` would risk content overlap with the absolutely-positioned `scrollCue`. Dropping `min-height` on short viewports lets the hero collapse to its natural height; users can still scroll.

Gates run before edit (recorded at fix time):
- wr-style-guide:agent: PASS (svh already used elsewhere in the codebase).
- accessibility-lead: CONDITIONAL PASS. 400% zoom mitigation incorporated; cognitive-a11y concern mitigated by retained scrollCue; minor scrollCue label suggestion deferred (out of S envelope).
- wr-risk-scorer:pipeline: see commit `72c3c2b` message.

Verification trigger (next interactive session, browser, AFK cannot exercise):
- 1080p desktop (1920x1080): all hero content (headline, sub, both CTAs, countdown, slider, attribution) above the fold.
- Mobile (Safari iOS, Chrome Android): hero fills viewport including with browser chrome present.
- 200% and 400% zoom on 1280x720: scrollCue does not overlap CTAs or Countdown; if viewport height drops below 600px, hero collapses to natural height.
- Vertical centring visually balanced (top and bottom whitespace approximately equal).

Close after the interactive verification holds with no regression observed for one release cycle.

## Related

- `src/app/page.module.scss` (hero layout styles, line 17)
- `src/app/page.tsx` (hero section structure, line 152)
- `src/components-next/Countdown/` (countdown and slider component)
