# Problem 147: Accessibility gate does not gate the release path

**Status**: Open
**Reported**: 2026-08-09
**Priority**: 5 (Low). Impact: 5 x Likelihood: 1, derived at capture from the description per Step 4a. Composed per RISK-POLICY.md's constraint on a residual of exactly 5: the severe impact is driven to Rare by a named control, `scripts/ci-status-check.sh`, which blocks `release:watch` on a red run conclusion.
**Origin**: internal
**Effort**: S, derived at capture per Step 4a
**WSJF**: 5.0 = (5 x 1.0) / 1

## Description

The accessibility gate runs in parallel with the deploy, not in front of the release. A failing accessibility check reddens master but does not stop the release PR being created, so the workflow graph does not enforce the standard this project calls non-negotiable.

Verified on disk 2026-08-09, from the job graph in `.github/workflows/main-pipeline.yml`:

```
gate-secrets         needs: null
build                needs: [gate-secrets]
gate-accessibility   needs: build
deploy-test          needs: build
release-pr           needs: [deploy-test]
```

`gate-accessibility` and `deploy-test` are sibling branches off `build`. `release-pr` depends only on `deploy-test`. So `gate-accessibility` can fail while `release-pr` runs to completion and opens the release PR.

Production is protected today, but by a different mechanism than the graph. ADR-028's `scripts/ci-status-check.sh` blocks `npm run release:watch` when the branch's latest CI conclusion is `failure`, and a red accessibility gate makes the run conclusion `failure`. So the release PR gets created but cannot be merged to `publish` while the gate is red, unless someone clears the single-shot `red-ci-acknowledged` marker.

**On the rating.** An earlier draft of this ticket rated the impact at 3 by folding the existing control into the impact rung, then credited the same control again in likelihood. That counts the mitigation twice. Impact is consequence, not probability, and RISK-POLICY.md's Impact Levels table names "Broken accessibility (WCAG AA violation reaching readers or visitors)" at level 5 verbatim, so the consequence of this gap firing is severe regardless of how unlikely it is. The rating is therefore 5 x 1, with `ci-status-check.sh` named as the control that earns the Rare likelihood, which is the composition RISK-POLICY.md line 42 requires for a residual of exactly 5.

That control is real protection. It is also a weaker guarantee than it looks. The protection lives in a local wrapper script rather than in the pipeline, so it holds only for releases driven through `release:watch` from a machine running that script. Anyone merging the release PR through the GitHub UI bypasses it entirely.

The tension worth resolving deliberately: `CLAUDE.md` states WCAG AA compliance as a non-negotiable standard for this project, and the enforcement of that standard currently depends on a local script rather than on the release path itself.

## Symptoms

- No symptom has been observed. This is a structural gap found by reading the job graph, not a reported failure.
- A red `Accessibility gate` and a successful `Create release PR` can appear in the same run.

## Workaround

The existing `ci-status-check.sh` block on `release:watch` is the de facto control. It is not a workaround for this ticket so much as the reason the gap has not caused harm.

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: never observed; the exposure exists on any run where the accessibility gate fails
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Investigate root cause
- [ ] Create reproduction test
- [x] Decide whether `release-pr` should declare `needs: [deploy-test, gate-accessibility]`. Tom directed it on 2026-08-09 ("Accessibility should be a release blocker") and it landed with ADR-050.
- [ ] **Remaining scope.** The graph edge does not finish the job, and the ticket title overstates what has landed. Two holes survive, both verified on disk 2026-08-09:
      1. An existing release PR stays mergeable. `changesets/action` updates an open PR on each master push, so when accessibility goes red the guard fails and the PR is not updated, but a PR created from earlier green commits is still open and merge-able through the UI. The graph edge blocks creation and update, not merge.
      2. The production bytes are never accessibility-tested. `gate-accessibility` tests `static-site-<sha>` built from master; production gets `release-preview-build`, which `release-pr-preview.yml` builds independently from the release PR head SHA and `publish-pipeline.yml` deploys without rebuilding. `pa11y` runs in `main-pipeline.yml` and nowhere else.
      The clean fix for both at once is to run the accessibility gate inside `release-pr-preview.yml`, where it would test the actual production candidate, and require that check via branch protection on `publish`. Branch protection alone cannot work today, because the checks reported on the release PR head SHA come from `release-pr-preview.yml` and `Accessibility gate` is not among them. Kept on this ticket rather than split, since it is the same job to be done.
- [x] Check whether `pa11y-ci` failures are stable enough to be a release blocker. They are, and the argument is structural rather than statistical: `.pa11yci.json` targets five `http://localhost:3000/` URLs, so the external-network transient class that produced P143's `curl (28)` is absent at assertion time. The `Accessibility gate` job also concluded `success` on 25 of the 25 most recent master runs. P143's retry handling was deliberately NOT applied: retrying a deterministic accessibility assertion would mask real defects. The one retry-worthy part, server startup, already had a wait loop, whose silent fall-through was fixed in the same commit because a dead server previously presented as an accessibility failure.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P112 (accessibility-lead review misses contrast, caught only by the CI axe gate), which establishes the CI gate as the load-bearing accessibility control rather than the agent review, and therefore raises what it costs for that gate not to gate.

## Related

Surfaced by the `wr-architect:agent` review of the P143 skip fix, as an observation explicitly outside that change's scope. The job graph was read independently on disk before capture rather than propagated from the verdict.
