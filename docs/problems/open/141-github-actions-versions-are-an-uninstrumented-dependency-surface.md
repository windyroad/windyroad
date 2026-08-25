# Problem 141: GitHub Actions versions are an uninstrumented dependency surface

**Status**: Open
**Reported**: 2026-08-09
**Priority**: 12 (High). Impact: 3 x Likelihood: 4, derived at capture from the description per Step 4a
**Origin**: internal
**Effort**: M, re-rated 2026-08-23. S covered pinning one action; the remaining scope is a maintainer decision between three detector shapes plus its implementation, and option B (a narrow pull_request trigger) is not a single-file change. WSJF 12.0 to 6.0
**WSJF**: 6.0 = (12 x 1.0) / 2

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

- [x] Investigate root cause. Verified on disk 2026-08-23: the capture's claims all held
- [x] Create reproduction test. `scripts/check-action-pins.sh` is it: run against the pre-fix tree it printed `FAIL .github/workflows/main-pipeline.yml:17: third-party 'trufflesecurity/trufflehog@main' must pin a 40-char commit SHA, not 'main'` and exited 1; against the post-fix tree it exits 0
- [x] Decide the pinning rule. ADR-055 records it: third-party pins a commit SHA with the version in a TRAILING comment, first-party `actions/*` pins a major tag, `docker://` pins a digest, `./` local is exempt. Option 2 (one rule for everything) was considered and rejected in the record: a SHA on `actions/checkout` costs a manual bump every patch release with no tooling here to do it, so the pins would rot and the rule would be honoured in the breach
- [x] Pin `trufflesecurity/trufflehog`. Now `@bcfcf73aaf4759d4dadc2783177c245a02792318 # v3.97.0`. The check the task asked for was done and it changes the answer in one place: `action.yml` at that tag is BYTE-IDENTICAL to `main@3ab759fe`, so the pin is behaviour-neutral today. Detector updates are NOT lost, because the action's `version` input still defaults to `latest` and resolves `ghcr.io/trufflesecurity/trufflehog:latest` at run time. That residual is deliberate and recorded in ADR-055: freezing the image would trade detector freshness for provenance on a secret scanner, which is the wrong trade
- [x] Top-level `permissions:` block. `main-pipeline.yml` now declares `contents: read`, and `publish-pipeline.yml` and `release-pr-preview.yml` carry inert ones so no job anywhere falls back to repository defaults. Verified safe before landing: no job in `main-pipeline.yml` outside `release-pr` consumes `GITHUB_TOKEN`, artifact upload and same-run download use the Actions runtime token, and a job-level block REPLACES the top-level one rather than merging, so `release-pr`, `deploy-production` and `preview` keep their wider grants
- [x] Make the silent path loud: add a step to `release-pr` that fails when `.changeset/` holds
      real changesets but `steps.changesets.outputs.pullRequestNumber` is empty. **Discharged by the
      P143 fix**, which landed the report step with the count taken before `changeset version`
      consumes the queue. Today an output-contract
      drop on that action skips both dependent steps on a green job. ADR-028's `ci-status-check.sh`
      already blocks the release merge on red master, so making it red is enough to catch it. Narrows
      the P115 known-error shape independently of the Actions-freshness question
- [ ] **OPEN, needs a maintainer decision.** Decide what detects a pin that is merely STALE rather than mis-formed. Three options with their trade-offs are recorded in ADR-055's Decision Outcome; the record deliberately does not pick. A `.github/dependabot.yml` was drafted for this iteration and then dropped, because both the architect and the JTBD reviewer independently found the same defect in it. It reinstates a bot authoring path onto master whose acceptance died when ADR-034 superseded ADR-022 whole, and this repo has no `pull_request` trigger, so the bump PR is validated by nothing until it reaches master. Correction to this ticket's own capture note: Dependabot's action updater does NOT require commit-SHA pins, it handles version tags too
- [ ] Narrow or justify `publish-pipeline.yml`'s `contents: write`. Reading `deploy-production` (checkout, `git rev-parse HEAD^2`, `gh run list`, cross-run `download-artifact`, `netlify deploy`, curl smoke tests) nothing visibly consumes it. Not narrowed here: appears-unused is not is-unused, the only place to find out is a real release, and a wrong narrowing fails the production deploy. Closing trigger is the next production release, per ADR-055's Reassessment
- [x] Decide whether the pinning rule warrants a decision record. It did. ADR-055

## Fix Strategy

Split, because the ticket carries two defects with different readiness.

**Landed 2026-08-23.** The pin-form half, which needed no new direction and rests on this repo's own on-disk precedent.

- `trufflesecurity/trufflehog@main` becomes a commit SHA at v3.97.0.
- A top-level `permissions: contents: read` on `main-pipeline.yml`, plus inert top-level blocks on the other two workflows.
- `scripts/check-action-pins.sh` enforces the rule on every push, running in `gate-secrets` immediately after checkout and BEFORE the secret scan. The order is load-bearing: if it ran after, the exact scenario the pin prevents would already have executed against a full-history checkout and the lint would only report it.
- ADR-055 records the rule and the reasoning.
- `changesets/action`'s version assertion moves from a block comment into a trailing one, so the corpus does not violate rule 1 at the moment the rule takes effect.

**Open.** Staleness detection. See the open investigation task above. Until it is answered this surface detects mis-formed pins and nothing else, which is a narrower claim than the ticket title makes.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

Captured via `/wr-itil:capture-problem`; expand at next investigation.

Surfaced twice independently during the `4b149a7` action bump: by the `wr-architect:agent` review, which found no governing decision and named the surface uninstrumented, and by the `wr-risk-scorer:pipeline` commit gate, which scored it 9/25 as a standing finding with zero available controls and excluded it from the cumulative score because the commit did not create it.

Related to P115 (site changes land on master without a changeset and silently never release to production) by shape rather than by cause: a gate that runs on every build and reports nothing about a whole class of change is the same failure pattern.

Serves JTBD-400 (Trust What the Loop Did While I Was Away). A secret scan whose detector can change underneath it makes a missing measurement read the same as a clean one, which is that job's core failure shape. `docs/jtbd/README.md` gained a Job-to-Screen Mapping row for `.github/workflows/` in the same change, because the CI and release-path surface had none and a workflow edit therefore mapped to no job.

Records ADR-055 (GitHub Actions are pinned by owner, and permissions are declared per workflow), which Tom ratified on 2026-08-23.

Governance notes from the 2026-08-23 iteration, recorded so the next reader does not repeat the work.

- The I13 propose-fix trace gate returned exit 3, not a trace failure: `wr-itil-check-fix-rfc-trace` refuses to answer because this repository holds no story maps at all, and drawing the first map for a journey needs a person. The fix landed anyway under the local precedent set when P070 closed (design already lives in a decision record; do not bootstrap a tier for one Effort-S edit). Drawing a story map covering CI supply-chain work is queued for the maintainer.
- `wr-architect-generate-decisions-compendium` emits em-dashes, which this repo's `no-em-dash-bash.sh` PostToolUse hook blocks. The committed `docs/decisions/README.md` has none, so a prior session normalised them by hand too. Every regeneration will hit this.
- One architect claim needed correcting before use, per the standing verify-before-propagating discipline: the review reported `wr-architect-generate-decisions-compendium` absent from this box after globbing the repo. It is on `$PATH` at `~/.claude/plugins/cache/windyroad/wr-architect/0.20.0/bin/`. A bounded search that found nothing is not proof of absence.

## Maintainer decision, 2026-08-23

Tom chose auto-capture over every advisory shape for the staleness half of this ticket. A stale action pin should create a problem ticket, so it enters the WSJF backlog and gets worked on priority like anything else, rather than printing a notice someone has to read. Explicitly rejected: failing the build (blocks the release path on a hygiene issue, which is the chain P111 records), a SessionStart nudge, and an advisory line in push:watch. His reason, verbatim in substance: he needs an option the agent is going to notice, and a report nobody reads is the same failure as the hand-written note in P154 and the advisory nudge in P115. The pin-form half of this ticket already shipped under ADR-055, now ratified.

**Constraints on the auto-capture fix, from the architect review of the decision commit (2026-08-23).** Two, and both are load-bearing. First, the fix must dedupe against an existing open ticket rather than capturing on every run, or it reproduces the flood shape ADR-056 was written to prevent, one directory over: 71 of the 72 unique slugs in that queue each match a single ordinary commit and would have destroyed the metric in the act of taking it. A stale action pin is a single deduplicable event, which is why the shapes differ, and that reasoning belongs in the record rather than being rediscovered. Second, this answer supersedes or extends ADR-055's open staleness question and needs its own new ADR, not an edit to ADR-055, which is now ratified. Note the answer is not option A, B or C as ADR-055 enumerates them: it is C-shaped in that no bot authors a pull request, but it routes the output into the WSJF backlog rather than into a report.
