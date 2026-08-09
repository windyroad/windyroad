# Problem 141: GitHub Actions versions are an uninstrumented dependency surface

**Status**: Open
**Reported**: 2026-08-09
**Priority**: 12 (High). Impact: 3 x Likelihood: 4, derived at capture from the description per Step 4a
**Origin**: internal
**Effort**: S, derived at capture per Step 4a

## Description

Nothing in this repo watches GitHub Actions versions. The dependency-freshness tooling that runs on every build is scoped to npm manifests and structurally cannot see Actions refs, and there is no Dependabot or Renovate config to cover the gap.

Verified on disk 2026-08-09. `.github/` contains only `workflows/main-pipeline.yml`, `workflows/publish-pipeline.yml`, `workflows/release-pr-preview.yml`, `ISSUE_TEMPLATE/config.yml` and `ISSUE_TEMPLATE/problem-report.yml`. There is no `dependabot.yml`. There is no `renovate.json` at the repo root; the only match is inside `node_modules/`. ADR-021 and ADR-034 both scope dependency-version policy to root npm manifests, and ADR-034 says so explicitly, so `npm run deps:check` cannot reach this surface by design rather than by oversight.

The demonstrated consequence: `changesets/action` sat pinned to v1.5.3 (May 2025) for fifteen months and was only surfaced when GitHub emitted a runtime-deprecation annotation about its Node 20 target. An external deprecation notice is currently the only detector this surface has. Fixed for that one pin in `4b149a7` (bumped to v1.9.0), but the surface remains uninstrumented and the next stale pin will surface the same way or not at all.

The sharpest instance of the same absence is a separate and more serious concern. `main-pipeline.yml` line 17 runs `trufflesecurity/trufflehog@main`, a third-party action pinned to a **moving branch**. It runs in `gate-secrets`, the first job, immediately after a `fetch-depth: 0` checkout of the entire repository including full history, and the workflow declares no top-level `permissions:` block constraining the default `GITHUB_TOKEN`. That is the highest-trust position in the pipeline sitting on the weakest available pin, and because the ref moves, the code executed there can change between two runs with no diff in this repo and no notification.

Also worth noting for whoever picks this up: the repo has no recorded pinning policy at all. ADR-022 pinned a third-party action by major tag and is superseded by ADR-034, and that workflow is no longer on disk. What remains is one SHA pin (changesets), one moving-branch third-party pin (trufflehog), and first-party major tags elsewhere. The split reads as accretion rather than policy, so a fix here probably wants to decide the rule as well as apply it.

## Symptoms

- A third-party action pin went fifteen months out of date with no internal signal; the only detector was a GitHub deprecation annotation in CI log output.
- `trufflesecurity/trufflehog@main` can execute different code between two consecutive runs with no diff in this repository.
- `npm run deps:check` reports clean while Actions refs are arbitrarily stale, which makes the freshness gate weaker evidence than it looks.

## Workaround

None in place. Stale pins surface only when GitHub itself complains, or when someone reads the workflow.

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: continuous; the surface has no detector at all
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Investigate root cause
- [ ] Create reproduction test
- [ ] Decide the pinning rule: SHA for all third-party actions, major tag for first-party, or one rule for everything
- [ ] Pin `trufflesecurity/trufflehog` to a released version instead of `@main`, checking first whether the project treats `@main` as its documented usage and whether a pinned version loses detector updates
- [ ] Consider a top-level `permissions:` block on `main-pipeline.yml` to constrain the default token in `gate-secrets`
- [ ] Make the silent path loud: add a step to `release-pr` that fails when `.changeset/` holds
      real changesets but `steps.changesets.outputs.pullRequestNumber` is empty. Today an output-contract
      drop on that action skips both dependent steps on a green job. ADR-028's `ci-status-check.sh`
      already blocks the release merge on red master, so making it red is enough to catch it. Narrows
      the P115 known-error shape independently of the Actions-freshness question
- [ ] Decide whether to add `.github/dependabot.yml` with the `github-actions` ecosystem, weighing the PR noise against the detection gain. Note Dependabot's action updater requires commit-SHA pins, which the `4b149a7` pin-form correction now satisfies for changesets
- [ ] Decide whether the pinning rule warrants a decision record

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

Captured via `/wr-itil:capture-problem`; expand at next investigation.

Surfaced twice independently during the `4b149a7` action bump: by the `wr-architect:agent` review, which found no governing decision and named the surface uninstrumented, and by the `wr-risk-scorer:pipeline` commit gate, which scored it 9/25 as a standing finding with zero available controls and excluded it from the cumulative score because the commit did not create it.

Related to P115 (site changes land on master without a changeset and silently never release to production) by shape rather than by cause: a gate that runs on every build and reports nothing about a whole class of change is the same failure pattern.
