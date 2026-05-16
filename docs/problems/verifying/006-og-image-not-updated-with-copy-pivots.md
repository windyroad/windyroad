# Problem 006: OG share image does not track homepage copy pivots

**Status**: Verification Pending
**Reported**: 2026-04-15
**Priority**: 8 (Medium). Impact: Significant (4) x Likelihood: Unlikely (2)
**Effort**: S (await prod release; flush LinkedIn cache via Post Inspector; user verification)
**WSJF**: (8 x 2.0) / 1 = 16.0

## Description

The Open Graph share image displayed on LinkedIn and other social shares was still showing the old AI-quality tagline ("Your team adopted AI tools. Here's what's slipping through.") well after the site pivoted to the patch fitness narrative ("You're taking too long to patch your software."). Social previews of windyroad.com.au therefore contradicted the landing page content.

## Symptoms

- LinkedIn preview of windyroad.com.au shows the old AI-quality tagline
- Open Graph image `/public/img/og-image.png` content did not match the hero headline
- The hardcoded SVG in `scripts/generate-og-image.mjs` was never updated when the hero copy pivoted
- No test or hook enforces that the OG image stays in sync with hero headline copy
- LinkedIn caches OG images aggressively, so even after an update the old image persists until the user requests a re-scrape

## Workaround

Manually update the hardcoded SVG text in `scripts/generate-og-image.mjs` whenever the hero headline changes, regenerate the PNG, commit, and request LinkedIn to re-scrape the URL via the LinkedIn Post Inspector.

## Impact Assessment

- **Who is affected**: Everyone viewing shared windyroad.com.au links on LinkedIn or other OG-consuming platforms (Engineering Leaders, Technical Founders)
- **Frequency**: Every social share of the homepage until the OG image is regenerated and caches flush
- **Severity**: Medium (contradicts the landing page narrative, undermines J1 Awareness when prospects share the link)
- **Analytics**: N/A

## Root Cause Analysis

### Root Cause

The Open Graph image is generated at build time by `scripts/generate-og-image.mjs`, which has the hero headline and subtitle **hardcoded as SVG text strings**. When the hero copy on `src/app/page.tsx` changed during the patch fitness pivot, the OG image script was not updated in the same commit, and no automated check caught the drift.

Contributing factors:
- No single source of truth for the hero headline shared between the React component and the OG image script
- No test or hook that asserts the OG image content matches the hero headline
- LinkedIn's aggressive OG caching means regenerating the image after the fact still leaves stale previews until `/post-inspector` is used

### Fix Strategy

Short-term (applied in commit 754a04a):
- Updated the hardcoded SVG in `scripts/generate-og-image.mjs` to match the patch fitness headline and removed the personal attribution footer (team voice per ADR 010)
- Regenerated `/public/img/og-image.png`

Longer-term options (not yet implemented):
- Extract hero headline and subtitle into a shared constant (e.g. `src/lib/siteCopy.ts`) imported by both `src/app/page.tsx` and `scripts/generate-og-image.mjs`
- Add a test that snapshots the OG image metadata (or renders the SVG string) and compares it against the hero headline in `page.tsx`
- Add a hook that flags edits to the hero headline without a corresponding edit to the OG image script

### Investigation Tasks

- [x] Investigate root cause
- [x] Workaround applied (hardcoded SVG updated, PNG regenerated)
- [x] Create reproduction test (src/lib/siteCopy.test.ts asserts OG script imports the shared constants and page.tsx uses HERO_HEADLINE)
- [x] Permanent fix applied (shared constants in src/lib/siteCopy.mjs consumed by both src/app/page.tsx and scripts/generate-og-image.mjs)

## Fix Released

Short-term content fix deployed in commit 754a04a. Permanent fix (shared `src/lib/siteCopy.mjs` constants with reproduction test) applied in commit 100df63. Both commits on origin/master.

### Verification trigger

1. Production deploy of origin/master to https://windyroad.com.au (Vercel auto-deploy on master push, or manual promotion).
2. Flush LinkedIn's OG cache by submitting the homepage URL through https://www.linkedin.com/post-inspector/ and clicking "Inspect" then "Re-scrape" if the cached preview still shows the old AI-quality tagline.
3. Visual confirmation: share the homepage URL in a LinkedIn post draft (or open the Post Inspector preview) and confirm the OG preview renders the patch fitness headline "You're taking too long to patch your software." with no personal attribution footer.

Transition to Closed once all three steps confirm the fix on the deployed site.

## Related

- `scripts/generate-og-image.mjs` (hardcoded SVG source)
- `src/app/page.tsx` (hero headline, OG metadata)
- ADR 010 (team voice, drove the attribution footer removal)
- Commit 754a04a (fix)
