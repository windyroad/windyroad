# Problem 147: Accessibility gate does not gate the release path

**Status**: Open
**Reported**: 2026-08-09
**Priority**: 5 (Low). Impact: 5 x Likelihood: 1, derived at capture from the description per Step 4a. Composed per RISK-POLICY.md's constraint on a residual of exactly 5: the severe impact is driven to Rare by a named control, `scripts/ci-status-check.sh`, which blocks `release:watch` on a red run conclusion.
**Origin**: internal
**Effort**: S, derived at capture per Step 4a

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
- [ ] Decide whether `release-pr` should declare `needs: [deploy-test, gate-accessibility]`. This is the obvious fix and it is one line, but check first whether it would make the accessibility gate a release blocker in a way that is wanted, since it also means an accessibility flake blocks releases
- [ ] Decide whether enforcement belongs in the workflow graph, in branch protection on `publish`, or in the local wrapper where it currently sits. A wrapper-only control is bypassed by a UI merge, and the whole rating rests on that control holding: if it is bypassed the likelihood is not 1 and the residual is 10, above appetite
- [ ] Check whether `pa11y-ci` failures are stable enough to be a release blocker, or whether they would need the same transient handling P143 applied to the smoke test

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P112 (accessibility-lead review misses contrast, caught only by the CI axe gate), which establishes the CI gate as the load-bearing accessibility control rather than the agent review, and therefore raises what it costs for that gate not to gate.

## Related

Surfaced by the `wr-architect:agent` review of the P143 skip fix, as an observation explicitly outside that change's scope. The job graph was read independently on disk before capture rather than propagated from the verdict.
