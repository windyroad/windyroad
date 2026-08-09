---
status: "proposed"
date: 2026-08-09
human-oversight: confirmed
oversight-date: 2026-08-09
decision-makers: [Tom Howard, Claude]
consulted: [wr-architect:agent, wr-risk-scorer:pipeline]
related: [028-ci-status-check-in-push-and-release-watch, 049-risk-label-bands-adopt-the-3-5-low-shape]
reassessment-date: 2026-11-09
---

# Quality gates are release ancestors, not reports

## Context and Problem Statement

The accessibility gate reddened master and did nothing else. It could not stop a release.

Read from the job graph in `.github/workflows/main-pipeline.yml` on 2026-08-09: `gate-secrets` has no dependencies, `build` needs `gate-secrets`, and both `gate-accessibility` and `deploy-test` hang off `build` as siblings. `release-pr` needed only `deploy-test`. So a failing accessibility check let the release PR be created anyway.

Production was not unprotected, but the protection sat somewhere unexpected. ADR-028's `scripts/ci-status-check.sh` refuses to run `release:watch` when the branch's latest CI conclusion is `failure`, and a red accessibility gate makes the run conclusion `failure`. The release PR got created and then could not be merged through that path. That is a local wrapper script running on one machine. Merging the release PR through the GitHub UI bypasses it entirely.

Note what `CLAUDE.md` does and does not settle. Its WCAG AA rule is an **authoring** standard, enforced by the accessibility specialist agents and the edit-gate hooks described alongside it. It governs the code you write. It says nothing about the release path, and the two are separable: a project can hold WCAG AA as non-negotiable for authored code while treating the CI accessibility run as a report rather than a gate. That was this repo's actual state. So this decision is not the pipeline catching up to a rule already written down; it picks a new enforcement locus and accepts a new coupling.

Tom's direction on 2026-08-09, verbatim: *"Accessibility should be a release blocker."*

## Considered Options

The three homes P147 named for the enforcement.

1. **The workflow graph.** Add `gate-accessibility` to `release-pr`'s `needs`.
2. **Branch protection on `publish`.** Require the accessibility check before the release PR can merge.
3. **The local wrapper only.** Keep the status quo and rely on `ci-status-check.sh`.

## Decision Outcome

**Chosen: option 1, the workflow graph, generalised.** `release-pr` now declares `needs: [deploy-test, gate-accessibility]`.

The generalisation matters more than the accessibility case. `gate-secrets` was *already* a release ancestor, through the `gate-secrets` to `build` to `deploy-test` chain. `gate-accessibility` was the only quality gate that was not. So the durable rule is **every quality gate is an ancestor of `release-pr`, and release blocking lives in the graph rather than only in a local wrapper**. Framed that way, this change completes an existing pattern instead of making accessibility a special case, and it survives the next gate added.

Option 3 is rejected by the direction. Option 2 is not rejected on the merits and is the natural next step, but it cannot work today: the checks reported on the release PR's head SHA come from `release-pr-preview.yml`, and `Accessibility gate` is not among them. It is recorded as follow-up rather than as a discarded option.

### What this actually delivers, and what it does not

Stated precisely, because the shorter claim is wrong. **An accessibility failure on master blocks a new or updated release PR.** It does not deliver "accessibility blocks releases" end to end. Two holes survive, both verified on disk:

An existing release PR stays mergeable. `changesets/action` updates an open PR on each master push. When accessibility goes red the guard fails and the PR is not updated, but a PR created from earlier green commits remains open and merge-able through the UI. The graph edge blocks creation and update, not merge.

The production bytes are never accessibility-tested at all. `gate-accessibility` tests `static-site-<sha>`, built from master. Production gets `release-preview-build`, which `release-pr-preview.yml` builds independently from the release PR's head SHA, and which `publish-pipeline.yml` deploys without rebuilding. `pa11y` runs in `main-pipeline.yml` and nowhere else. Normally the two builds differ only by a version bump and a changelog entry, so the real accessibility delta is small, but the chain "the bytes we tested are the bytes that went live" is not established. Read against P146, neither link in that chain is.

### Consequences

**Good.** The standard is enforced where it cannot be bypassed by choosing a different merge route. The rule is uniform across quality gates rather than special-cased.

**Bad, and accepted deliberately.** There is no override valve. ADR-028 shipped one on purpose: the single-shot `red-ci-acknowledged` marker, with the block message printing the exact command to clear it. A `needs:` edge cannot be acknowledged past. The only recoveries are fixing the violation or re-running the job. This asymmetry against the project's own established pattern is the main cost of this decision, and it is chosen rather than overlooked: an acknowledge-and-ship valve on accessibility would reproduce the gap this decision closes.

**Also accepted.** The release path is now blocked for a docs-only or newsletter-only commit that carries no site-code change, if the accessibility gate happens to be red.

**Flake coupling, measured rather than assumed.** Making `gate-accessibility` a release ancestor imports its infrastructural failure modes too. Most are not incremental: it shares `npm ci` and `download-artifact` with `deploy-test`, and a failure in either would very likely fail `deploy-test`, which already blocks. The genuinely new surface is `serve` startup, headless Chrome launch, and `pa11y` itself. Evidence gathered before deciding: `.pa11yci.json` targets five `http://localhost:3000/` URLs, so the external-network transient class that produced P143's `curl (28)` against a Netlify alias is structurally absent at assertion time; and the `Accessibility gate` job concluded `success` on 25 of the 25 most recent master runs. Stability was measured while failure was cheap, but making failure expensive changes the cost per failure, not the rate, so the evidence transfers.

**Not adopted: retry handling.** P143 added `--retry` to the smoke-test curls. That is deliberately not applied here. Retrying a deterministic accessibility assertion would mask real defects. The only retry-worthy part is server startup, which already has a wait loop; that loop's silent fall-through was fixed in the same commit, because a dead server previously presented as an accessibility failure and that mis-signal costs more now the job blocks releases.

## Confirmation

1. `release-pr` declares `needs: [deploy-test, gate-accessibility]` in `.github/workflows/main-pipeline.yml`.
2. A run where `gate-accessibility` fails shows `Create release PR` as **failed**, not skipped, with the step named `Require a passing accessibility gate` identifying the cause from the run summary.
3. No release PR is created or updated on such a run.
4. The two guards report independently: a run where both preconditions fail names both, rather than the first hiding the second.

## Related

- **P147** (`docs/problems/open/147-accessibility-gate-does-not-gate-the-release-path.md`) is the driving ticket. Its rating rests on `ci-status-check.sh` being the named control that earns a Rare likelihood; this decision adds a second, non-bypassable control, so that rating is now conservative.
- **ADR-028** chose a wrapper-only control. Its option set was entirely about where the wrapper-layer check lives, and none of its rejected options was "enforce in the pipeline". It frames itself as defence in depth and says the layers coexist, so this decision strengthens it rather than reversing it. None of its five confirmation criteria is touched.
- **P143** established the legibility principle this change extends: a release job that fails is better than one that skips, and a named step is better than a shared exit.
- **P146** (production artifact selected by recency, not identity) is the other half of the untested-bytes problem described above.
