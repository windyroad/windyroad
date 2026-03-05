# windy-road

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
