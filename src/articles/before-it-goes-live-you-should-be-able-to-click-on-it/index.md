---
date: '2026-03-03'
title: "Before it goes live, you should be able to click on it"
author: 'Tom Howard'
tags: ['deployment', 'release', 'ci/cd', 'vibe coding', 'production', 'software delivery']
---

Most founders I talk to have the same deployment anxiety: *what if pushing breaks something?*

The instinct is to add more automated checks — more tests, more linting, more gates. Those are worth having. But they don't actually fix the anxiety, because passing CI doesn't mean the app works. It means the app passed the tests you wrote. That's not the same thing.

The thing that actually fixes the anxiety is being able to see the app running before you commit to shipping it.

Here's the approach I've been using.

## A release PR, not a deploy button

The pipeline I built for my current app separates two things that usually get smashed together: *readiness to release* and *decision to release*.

When code lands on `main` and all the gates pass, the pipeline automatically prepares a release — but it doesn't push it live. Instead, it opens a pull request to a `publish` branch and deploys the candidate to a preview URL. The release waits there until I choose to merge.

That PR is the decision point. Merging it is how I say "yes, ship this."

The key is what happens before I look at the PR. By the time I open GitHub, the pipeline has already:

1. Built a Docker image from the candidate commit
2. Deployed that image to Cloud Run with the exact same runtime configuration as production
3. Run smoke tests against the live preview — real HTTP requests, checking real API responses
4. Reported all of that as required checks on the PR

If the smoke tests fail, the PR is blocked. I won't see it in a mergeable state unless the preview is actually working.

## "Works in staging" is a different problem

Most staging environments fail in the same way: they run *different code* than production. A different branch, a different build, a different configuration. So when something breaks in prod that was fine in staging, the reason is usually one of those gaps.

The preview I'm looking at is not a staging environment in that sense. It's the production candidate. The same Docker image — identified by content digest, not tag — that will be deployed to production if I merge the PR. The pipeline signs the image with [cosign](https://github.com/sigstore/cosign) when it's built, and verifies that signature before every deploy step.

Before deploying to production, the pipeline re-verifies:

```
cosign verify \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp "^https://github.com/.../publish-pipeline.yml@refs/heads/publish$" \
  "$IMAGE_REF"
```

This means you can't accidentally ship an image that wasn't built by the pipeline, and you can't ship a different image than the one that was tested. The preview and production are provably the same artifact.

## What the smoke tests actually check

The temptation with smoke tests is to write them as a health check: "is the server up?" That's not nothing, but it's not much either.

The smoke tests I run against the preview check things that could be subtly broken even if the server is up:

- The `/health` endpoint returns the expected build SHA — confirming this is actually the candidate, not a stale deploy
- An unauthenticated API request returns `401` — not `500`, not `200`, not a redirect loop
- An authenticated request with a known input returns the expected output — specific field values, not just a `200` status

That last one is doing real work. It's a regression check on the core logic of the app, run against the live deployed instance. If I shipped a change that broke how the app handles a known scenario, the smoke test catches it before I've merged anything.

## The release waits

The thing I find most useful about this setup is that I don't have to decide anything under pressure. The release PR sits there until I'm ready. I can look at it in the morning when I'm fresh. I can deploy the preview to my phone and use the app. I can wait until the weekend feature I'm building is ready to ship alongside it.

If I'm heads-down and don't want to think about releases, nothing ships. If I'm ready and the preview looks right, I merge and it's live in a few minutes.

This might sound obvious, but it's different from the two failure modes I see most often: fully manual deploys that require courage (and a good day), or fully automatic deploys that require complete trust in your test suite. The review PR is a middle path — automation does the preparation, a human makes the call.

## What this looks like in practice

The pipeline has three services in play at any given time:

- `bbstats-test` — deployed on every push to `main` that touches app code, publicly accessible, used for smoke-testing in the main pipeline
- `bbstats-release-preview` — deployed from the release PR, publicly accessible, used for human review before merging
- `bbstats-prod` — deployed only after the release PR is merged and the publish pipeline has verified the candidate

The test and preview services are intentionally throwaway. They get overwritten on every run. Production only gets updated when the full publish pipeline passes, which requires the same image to have survived the review step.

## Should you build this?

If you're shipping a vibe-coded prototype to a handful of early users, probably not yet. The overhead isn't worth it at that stage.

But if you have real users, real data, and production incidents that have actually cost you something — yes, I think you should build something like this. The specific technology doesn't matter much. What matters is the pattern:

1. Automated checks prepare a candidate
2. The candidate is deployed to a preview that looks like production
3. A human reviews the running app before it ships
4. Merging is the explicit release decision

The result is that deploying stops feeling like a coin flip. It starts feeling like a thing you do on purpose, when you're ready, with confidence that what you saw in the preview is what your users are going to get.

That's a much better place to ship from.
