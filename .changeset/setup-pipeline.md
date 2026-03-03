---
"windy-road": minor
---

Set up full CI/CD pipeline with GitHub Actions and Netlify

- Three-workflow pipeline: main-pipeline, release-pr-preview, publish-pipeline
- Quality gates (lint + build) gate all deploys
- Draft Netlify deploys with smoke tests before any release PR is created
- Release PRs get a preview environment with smoke tests and a PR comment containing the URL
- Production deploys only happen via the publish-pipeline after human review
- push:watch and release:watch scripts for monitoring pipelines from the terminal
- Changesets for tracking what's in each release
