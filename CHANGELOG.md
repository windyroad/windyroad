# windy-road

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
