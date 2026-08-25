# Problem 002: Hero content extends beyond the fold

**Status**: Closed
**Reported**: 2026-04-14
**Origin**: internal
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

## Verified

Closed 2026-08-25. Exercised in Chrome against the dev server, measured from the live DOM rather than read off a screenshot, at six viewport sizes plus three reflow widths.

The four named conditions, in order.

**Desktop fold.** At 1920x1080 the hero resolves `min-height` to 1080px and the lowest content sits at 1056, so everything is above the fold with 24px to spare. Same shape at 1280x720: 720px, lowest content at 696.

**Mobile with browser chrome present.** At 390x664, an iPhone 14 viewport after Safari's chrome is subtracted, `min-height` resolves to 664px and content ends at 640. At 412x730, an Android viewport, 730px and 706. The `svh` unit is doing what it was changed to do: the hero fills the visible area rather than the area the URL bar is covering.

**Zoom and the short-viewport guard.** Simulated as effective viewport size, which is what page zoom actually produces: 1280x720 at 200% is a 640x360 viewport, at 400% a 320x180 one. At both, and at an iPhone SE landscape-ish 375x553, `min-height` resolves to 0px rather than to the viewport height, so the `@media (max-height: 600px)` guard fires and the hero takes its natural height instead. Content then extends past the fold, which is the intended outcome of that guard rather than a regression: the alternative is forcing 100svh into a 180px-tall viewport and overlapping the scroll cue with the buttons. The scroll cue does not overlap either call to action at any of the six sizes measured.

Reflow at 320px width, the WCAG 1.4.10 threshold, produces no horizontal overflow: `scrollWidth` equals `clientWidth` at 320, 375 and 390.

**Vertical balance.** At the desktop size the gap between the header and the headline is 181px and the gap below the buttons is 180px. Balanced, which is the asymmetric-padding correction working: `padding-top: calc(var(--header-height) + 4rem)` against `padding-bottom: 4rem` makes the two visible gaps equal even though the padding values are not.

One correction to this ticket's own premise, recorded rather than quietly worked around. The verification list names "headline, sub, both CTAs, countdown, slider, attribution" as the hero content to fit above the fold. The countdown, slider and attribution no longer exist: neither `src/app/page.tsx` nor `src/app/page.module.scss` contains either word, and the rendered hero carries a headline, a two-line sub, two buttons and the scroll cue. So the fold test was exercised against less content than the ticket assumed, which makes it an easier test than the one written. It passes with the content that is actually there, and the elements that would have made it harder were removed by other work rather than by this fix.

A measurement trap worth recording, because it nearly produced a false finding. A first pass asked whether the scroll cue overlaps any `<a>` inside the hero and got "yes" at every size. The cue is itself an anchor, so it was overlapping itself. Excluding the cue from the list it is being compared against gives the real answer, which is no overlap anywhere. A self-comparison reads exactly like a real hit.
