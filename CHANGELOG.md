# windy-road

## 2.13.2

### Patch Changes

- 8effe2f: Retire the consulting funnel and repurpose windyroad.com.au as The Shift hub (ADR-041): hub homepage, deleted funnel routes/components, updated metadata, and Footer availability copy removed. Also ships The Shift Issue 13.

## 2.13.1

### Patch Changes

- 03bfdbd: Publish The Shift Issue 12 (leader persona, week ending 2026-07-05). Also: exclude standalone Playwright e2e specs from the vitest run so `fix:deps` and CI stop mis-globbing them as unit suites, and bump @types/react to 19.2.17 to clear the CI dependency-freshness gate.

## 2.13.0

### Minor Changes

- b97bc0b: Pause the consulting funnel via a "Fully Booked" CTA pattern. Tom is starting a full-time engineering role and has no capacity to take Windy Road clients; the newsletter and blog continue. Per ADR-023, every "Book a Call" anchor across the site is replaced with a non-navigating `FullyBookedCTA` button that visibly marks the offering as paused while preserving the credibility content on `/founders`, `/vibe-code-audit`, and `/ai-quality`.

  Visible label is `~~Book a Call~~ Fully Booked`. The button is `aria-disabled="true"` (not HTML `disabled`), keeping it focusable and click-capturable. A single `aria-live="polite"` region in the root layout announces "We're fully booked right now. Subscribe to The Shift for a note when that changes." on click. Click and hover fire Microsoft Clarity custom events (`fully_booked_click`, `fully_booked_hover`) tagged with the call-site `source`, so demand signal is measurable per surface.

  Contract changes:

  - New `FullyBookedCTA` component at `src/components-next/FullyBookedCTA/`. Sibling to `Button` (which stays anchor-only by contract). Variants `primary` / `inverted`, sizes `default` / `large`, required `source` prop typed against the surface enum.
  - New `FullyBookedStatus` context + polite live region at `src/components-next/FullyBookedStatus/`, mounted once in `src/app/layout.tsx`. `setStatus` clears then re-sets via `requestAnimationFrame` to force re-announcement of identical messages.
  - New typed analytics helper at `src/components-next/Clarity/track.ts` (`trackEvent(name, tags?)`). After this change the Clarity wrapper module is the only importer of `@microsoft/clarity`; leaf components never reach for the SDK directly.
  - Four new disabled-look tokens in `src/styles/globals.scss`: `--color-disabled-bg`, `--color-disabled-border`, and the `-on-dark` variants. Each pair meets WCAG AA at 4.5:1 (text) / 3:1 (border) without relying on opacity.
  - The conditional CTA section on AI/vibe-coding tagged blog posts (`src/app/blog/[slug]/page.tsx`) is removed. Per JTBD review, Developer readers (JTBD-200, JTBD-201, JTBD-205) are doing content consumption; a struck-through pitch reads as a dead-end. Restore when the funnel reopens.
  - Footer adds the caption "Fully booked. Not taking new engagements right now." Phone, email, and LinkedIn stay as peer-contact channels.
  - `NotifyForm` on `/vibe-code-audit` is repurposed as a waitlist (heading "Want to know when we're taking work again?", helper "Leave your email. We'll send one note when we open up. No pitch, no list churn.", button "Notify me", success "Thanks. We'll send one note when we open up."). The "What's breaking?" textarea is removed.

  Reversal: swap `FullyBookedCTA` back to the active `Book a Call` anchor and restore the blog `{showCTA && ...}` block. ADR-023 records the reassessment criteria (90 days, or fewer than one click per week for four weeks).

  ADR-023 references `docs/jtbd/README.md` Job-to-Screen mapping as the canonical reference for which jobs each surface must re-serve when the funnel restarts.

### Patch Changes

- d6cc6d9: Fix WCAG AA contrast failures across all four diagrams in the "An AI agent deleted production" article (`sign-vs-control.svg`, `risk-gate-flow.svg`, `risk-score-anatomy.svg`, `layered-defence.svg`). Tom flagged the cover image as low-contrast; the `contrast-master` audit found the same patterns repeated across all four SVGs.

  Patterns fixed (consistent palette swaps, identity preserved):

  - Drop alpha-channel suffixes on subtext fills (`#FCA5A580` and `#86EFAC90` composed to 3.0 to 4.4:1 on saturated dark fills). Use full-alpha hex; rely on font size and weight for hierarchy.
  - Slate-500 body text (`#64748B`) on slate-900 page bg or slate-800 cards (3.05 to 3.75:1) lifted to slate-400 (`#94A3B8`, 5.7 to 7.0:1).
  - Red-800 borders (`#7F1D1D`) on dark backgrounds (1.78:1) lifted to red-600 (`#DC2626`, 3.70:1).
  - Blue-700 (`#1E40AF`) and alpha-blue (`#3B82F650`) borders (1.57 to 2.08:1) lifted to blue-500 (`#3B82F6`, 4.85:1).
  - Slate-700 card strokes (`#334155`) and slate-600 inner strokes (`#475569`) lifted to slate-500 (`#64748B`).
  - Code-chip strokes in `risk-gate-flow.svg` lifted to slate-400 (`#94A3B8`) for AA against both chip fill and card.

  Re-rendered all four PNGs at `public/img/social/` and updated the cover image at `src/social/an-ai-agent-deleted-production-the-model-wasnt-the-problem/cover.png`. Re-audited via `contrast-master`; all four SVGs now pass WCAG 2.2 AA (1.4.3 Text Contrast and 1.4.11 Non-text Contrast).

  Also updates the `wr-blog:create-social-posts` skill to require a `contrast-master` pass on every cover image and article-body diagram, codifies the windyroad-palette failure patterns, and adds a shared `skills/wr-blog/assets/diagram-inspection-checklist.md` that the planned `wr-blog:render-diagrams` skill will reference.

- b196c18: Trim the Bluesky social post for the "An AI agent deleted production" article so it fits the 300-character limit. The original body was 296 chars; with the 88-character canonical URL plus a blank line it overshot the limit by 30 (Bluesky counts URLs as their full length, unlike Twitter's `t.co` shortening). New body is 199 chars; total post including URL is 289 chars.

  Also updates the `wr-blog:create-social-posts` skill: adds step 4.5 (mandatory platform character-limit check before save) and documents per-platform URL-counting behaviour in `assets/social-platform-conventions.md` (Bluesky counts URLs full-length; Twitter shortens via `t.co` to ~23 chars; LinkedIn / Reddit / dev.to are effectively unbounded for our use cases).

## 2.11.4

### Patch Changes

- 596ff50: Reverted the OG image filename back to `og-image.png` from
  `og-image-patch-fitness.png`. The cache-bust rename did not clear
  LinkedIn's cached preview. Clean filename is simpler to maintain
  and LinkedIn's cache will expire on its own schedule.

## 2.11.3

### Patch Changes

- bfa1942: Renamed the Open Graph share image from `og-image.png` to
  `og-image-patch-fitness.png` so LinkedIn treats it as a new URL and
  fetches fresh, rather than serving the stale AI-quality image it had
  cached. Updated `scripts/generate-og-image.mjs`, homepage metadata,
  and `/ai-quality` metadata to reference the new filename.

## 2.11.2

### Patch Changes

- 4a38db7: OG share image text now renders crisp on LinkedIn previews. The
  `generate-og-image.mjs` script renders the SVG at 4x density (288 DPI)
  and downscales to 1200x630, so text edges stay sharp instead of
  pixelating when LinkedIn and other platforms re-encode the preview.

## 2.11.1

### Patch Changes

- b9a65b5: OG share image now matches the homepage hero. Fixes P006: the Open
  Graph image was still showing the old AI-quality tagline because the
  SVG text in `scripts/generate-og-image.mjs` was hardcoded and never
  got updated when the homepage pivoted to the patch fitness narrative.

  Permanent fix: hero headline and OG subtitle now live in
  `src/lib/siteCopy.mjs` as a single source of truth. Both the React
  homepage and the OG image generator import the same constants, so
  the share preview cannot drift from the visible hero again. Reproduction
  test in `src/lib/siteCopy.test.ts` asserts both consumers use the
  shared module.

  After deploy, run https://windyroad.com.au through the LinkedIn Post
  Inspector to flush LinkedIn's OG image cache.

## 2.11.0

### Minor Changes

- 767d1fe: Homepage and pricing improvements for the patch fitness narrative.

  **Countdown component**

  - Added a discrete probability slider so visitors can explore Manifold Markets prediction stops by cumulative probability percentage.
  - Slider stops are positioned proportionally to their actual cumulative probability with subtle dot indicators on the track.
  - Filters out the "or later" catch-all bucket and any answers whose midpoint date has passed.
  - Countdown displays the exact Manifold midpoint date in DD MMM YYYY format ("16 Jul 2026") rather than inventing end-of-month semantics.
  - Attribution clarified: "chance a Mythos-level model ships by {date}" with correct a/an grammar for any percentage.
  - Loading skeleton matches the loaded layout so the hero no longer shifts when the API responds.
  - Reduced-motion variant still renders the slider, just without the ticking countdown.

  **Pricing**

  - Raised 1-week engagement pricing across the site from $5,000 to $9,000 (Vibe Code Audit, Patch Fitness Assessment, Quick Wins Week).
  - Synchronised the `/founders` PricingSection with homepage figures so Embedded Delivery Lead and Delivery Sprint match.
  - Tightened spacing between pricing card outcome line and Book a Call button.

  **Other homepage polish**

  - Replaced the regulatory-compliance testimonial with Sidney Shek (Staff Engineer, Stripe) endorsing Continuous Delivery work, a closer fit to the patch fitness narrative.
  - Expanded the "What stack do you work with?" FAQ to include Java, .NET, and Go alongside JavaScript/TypeScript and Python.
  - Added a downward chevron scroll cue at the bottom of the hero for visitors on viewports where the hero fills the screen.

  **Docs and process**

  - Updated Jobs To Be Done with explicit stack coverage in scope for the Engineering Leader persona.
  - Created problem tickets P001 (next build hangs locally), P002 (hero overflow), P003 (slider alignment, closed), P004 (slider position), P005 (no stop indicators).

## 2.10.0

### Minor Changes

- 2abfd90: Action-specific pipeline risk management with downstream back-pressure. Risk scoring now covers commit, push, and release actions with uniform threshold. Each action considers its effect on the next downstream queue. WIP nudge absorbed into the risk system.

## 2.9.2

### Patch Changes

- ea82f55: Add PNG versions of architect article diagrams for Dev.to publishing

## 2.9.1

### Patch Changes

- 234f6fa: Add risk score gate: AI-scored uncommitted changes (1-5) block commits when score exceeds 2, preventing risky WIP accumulation
- 4941be1: Improve /wardley skill with anchor validation, merge tests, analysis quality rules, platform dependency detection, convergence fragility checks, and observable decision triggers. Update Wardley Map with revised anchor, merged components, Claude Code dependency, and strategic analysis.

## 2.9.0

### Minor Changes

- beb24f5: Expand architect gate to cover all source files, add draft post support, add architecture blog article
- 7e4c0c7: Add architect gate for architecture decision review

## 2.8.0

### Minor Changes

- 6a45ea6: feat: add release confirmation hook and update pipeline discipline article

  - Add `permissionDecision: "ask"` hook for `npm run release:watch` to require human confirmation before releasing
  - Update pipeline discipline article with new "Confirming before releasing" section, system flow diagram, stack disclosure, CLAUDE: convention explanation, failure modes guidance, and "Adapting this for your project" section
  - Update hero and code card SVGs to show all three intercept levels (deny, deny, ask)
  - Extend voice-and-tone gate to cover SVGs in public/img/social/
  - Add Dev.to publishing script (scripts/publish-devto.sh)

## 2.7.0

### Minor Changes

- d2b8835: Add voice-and-tone enforcement article, blog nav link, social posts, and voice guide updates

### Patch Changes

- 0a60cf5: Add Stop hook for per-turn voice review reset, update article and social posts to four-hook architecture

## 2.6.7

### Patch Changes

- 06bea6f: Add social post drafts and voice-and-tone guidance for LinkedIn, Twitter, Reddit, Hacker News, Dev.to, Lobsters, and Bluesky

## 2.6.6

### Patch Changes

- 6b19ab5: Add WIP accumulation nudge blog post with pull quote plugin, syntax highlighting, and hook improvements

## 2.6.5

### Patch Changes

- 7421f5d: Replace defensive copy with authoritative voice across all pages

## 2.6.4

### Patch Changes

- 37f2aa7: Tighten FAQ answers and rewrite Wrong Road disqualifiers
- aaf1a6e: Rewrite hero to lead with visitor's problem, add stat strip, promote vibe-code-audit
- 37d4611: Add Tom's headshot, remove numbered section headers
- f017d7d: Add proof story to operator section
- 5a79db3: Reuse release-pr-preview build artifact in publish pipeline instead of rebuilding from scratch
- c2a213b: Fix counter scroll trigger, improve stat strip legibility, sharpen hero subheadline, remove ambiguous route link
- 99d0965: Split AI teams content to dedicated page, sharpen homepage copy, move Claude FAQ below pricing

## 2.6.3

### Patch Changes

- cba27ba: Remove redundant CTA band from footer, add conditional CTA to AI coding blog posts

## 2.6.2

### Patch Changes

- 02d6129: Fix page load jitter: replace Google Fonts @import (render-blocking) with next/font/google for zero-layout-shift font loading, and add preload link for hero banner image to prevent background flash.
- 02d6129: Speed up CI pipelines: skip full pipeline on version-sync commits ([skip-ci]), move release-pr job earlier in dependency chain, and consolidate redundant npm ci invocations.

## 2.6.1

### Patch Changes

- 662661e: Copy and voice refinements: tighter hero subheadline, "This Road"/"Wrong Road" fit check labels, low-pressure footer CTA, sharpened VCA bullet, codebase access FAQ, reduced-commitment CTA button on audit page, duration-specific Cal.com booking links, em-dash removal, and fixed em-dash hook for macOS.

## 2.6.0

### Minor Changes

- 9a42e49: Full design overhaul: brick red accent palette, hero background image with parallax, logo in nav, redesigned footer with CTA, FAQ desktop-open behavior, stat card layout improvements, and compressed banner image.

## 2.5.0

### Minor Changes

- 481fa77: Restructure homepage for two audiences, add FAQ section and email capture form

  - Split ApproachSection problems into "You vibe-coded something" vs "Your team adopted AI tools" columns
  - Thread co-driver metaphor through process steps: Read the road, Call the corners, Train you to drive
  - Reorder OperatorSection to lead with founder proof (products shipped) before enterprise credentials
  - Add FAQ section to homepage ported from vibe-code-audit page
  - Add Netlify Forms email + message capture on vibe-code-audit for warm leads not ready for a call

## 2.4.2

### Patch Changes

- e821d73: Reframe site copy around client outcomes, remove em-dashes, add em-dash prevention hook

## 2.4.1

### Patch Changes

- c3a9aa7: Fix release workflow: hook blocks pipeline-managed branches, release:watch merges PR and syncs version cleanly

## 2.4.0

### Minor Changes

- ecf5d3e: Add blog post: Enforcing pipeline discipline with Claude Code hooks

## 2.3.0

### Minor Changes

- ecf5d3e: Add blog post: Enforcing pipeline discipline with Claude Code hooks

## 2.2.0

### Minor Changes

- 1cb96ce: Add parallel CI/CD quality gates (lint, secrets scan, accessibility), restore full markdown rendering for all blog posts (iframes, tables, footnotes, raw HTML), add tag-based CTAs on blog posts, restore Apache Ant JUnit XML Schema post with redirect from original URL, and update pipeline blog post with product owner review concept and Netlify-specific notes.

## 2.1.0

### Minor Changes

- 3df91d6: Set up full CI/CD pipeline with GitHub Actions and Netlify

  - Three-workflow pipeline: main-pipeline, release-pr-preview, publish-pipeline
  - Quality gates (lint + build) gate all deploys
  - Draft Netlify deploys with smoke tests before any release PR is created
  - Release PRs get a preview environment with smoke tests and a PR comment containing the URL
  - Production deploys only happen via the publish-pipeline after human review
  - push:watch and release:watch scripts for monitoring pipelines from the terminal
  - Changesets for tracking what's in each release
