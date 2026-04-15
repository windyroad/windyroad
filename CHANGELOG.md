# windy-road

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
