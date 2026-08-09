---
status: "proposed"
date: 2026-08-09
human-oversight: confirmed
oversight-date: 2026-08-10
decision-makers: [Tom Howard, Claude]
consulted: [wr-architect:agent, wr-risk-scorer:pipeline]
related: [050-quality-gates-are-release-ancestors-not-reports, 028-ci-status-check-in-push-and-release-watch]
reassessment-date: 2026-11-09
---

# Production deploys only bytes that provably came from the release commit

## Context and Problem Statement

The production deploy picked its payload by asking which preview build finished most recently, and deployed that.

`.github/workflows/publish-pipeline.yml` selected the artifact with `gh run list --workflow=release-pr-preview.yml --status=success --limit=1`, with no filter on commit, PR or branch. It then downloaded that run's `release-preview-build` artifact and deployed it with `netlify deploy --prod`, never rebuilding. So whatever that query returned was exactly what visitors got.

That is correct while releases are strictly serial, which is why it has never bitten. It is wrong whenever the most recent successful preview is not the one being published: two previews in flight, or a superseded release PR's preview finishing later than the current one. The result is production serving a coherent but different release. There was no detector, because the production smoke test asserts three pages return 200 and the homepage contains a name that any build of this site satisfies.

The identity needed to do better already existed and was being discarded. `main-pipeline.yml` dispatches the preview with `pr_head_sha`, `release-pr-preview.yml` checks that exact ref out, and then uploaded under a constant artifact name, throwing the identity away at the last step.

## Considered Options

Three, differing in how wide a guarantee to commit to.

1. **Identity only.** Production deploys bytes that provably correspond to the commit being released. Says nothing about whether anything tested them.
2. **Tested-bytes chain.** Production deploys only bytes that a gate actually ran against.
3. **Record nothing.** Treat it as a bug fix in an area no decision covers.

## Decision Outcome

**Chosen: option 1, identity only.**

Tom chose this on 2026-08-09 over the broader option. The reasoning is that option 2 is the better end state but writing it now would record an intent rather than a decision: accessibility runs against the master build and never against the build that ships, so option 2 would be in violation the moment it was written, with unscoped work attached. Naming the narrower rule keeps the record honest, and leaves the untested-bytes gap where ADR-050 already put it, as a named gap rather than a broken promise.

Option 3 was rejected because the change installs two new conditions that can refuse a production deploy, and ADR-050 established the same day that where release blocking lives is decision-worthy here.

### Mechanism

The commit pushed to `publish` is a merge commit whose **second parent** is the release PR head that the preview built from. `scripts/release-watch.sh` line 64 merges with `gh pr merge --merge`, which always produces one.

That was verified rather than assumed, and the check had to be redone twice before it was sound. A first pass reported seven single-parent publish commits; that was wrong, because those SHAs are absent from the local clone and `git rev-parse X^2` fails identically for a non-merge and for a missing object. A second pass restricted to locally-present objects gave five of five merges but could say nothing about the other seven, which no longer exist on the remote either. Asking the GitHub API for each commit's parent count resolves all of them without needing the objects: **all twelve publish runs on record are merge commits.** Separately, `HEAD^2` matched the preview run's `headSha` exactly on full SHAs for the three checked against preview history.

Two coordinated edits follow from that.

The preview uploads under `release-preview-build-<pr_head_sha>` instead of a constant name. The publish job resolves `git rev-parse HEAD^2`, finds the preview run whose `headSha` equals it rather than the most recent one, and downloads that SHA-named artifact.

**Which half carries the safety is worth stating, because it is not the obvious one.** The artifact *name* is the identity: it derives from the same `pr_head_sha` input that drives the preview's checkout, so the name cannot disagree with the bytes. The run lookup is only how the haystack is found. If the lookup ever selected the wrong run, the download asks that run for an artifact it does not have and fails, rather than deploying what it does have. The two are not redundant belt and braces; one is load-bearing and one is convenience.

**The haystack half can miss, and the printed recovery does not always clear it.** For a `workflow_dispatch` run, the run-level `headSha` is the tip of the `--ref` the workflow was dispatched on, not the `pr_head_sha` input. In the normal path they coincide, because the dispatch reads the release PR's head and dispatches against the same branch seconds later, which is why the three sampled runs matched exactly. They are still distinct identities. If master has moved and updated the release PR, re-dispatching the preview rebuilds under the correct artifact name but the new run's `headSha` no longer equals the wanted SHA, so the lookup still misses. The failure remains fail-closed, never a wrong deploy, but the recovery text has to say so, and it does. Selecting the run by its dispatch input or by artifact presence would close it and is not done here.

### Consequences

**Good.** The wrong-artifact deploy is structurally impossible rather than merely unlikely. Both failure modes are loud, and both error messages name the recovery: re-merge with a merge commit, or re-dispatch the preview for the exact SHA.

**A behaviour change to a live route, chosen deliberately.** Merging the release PR by squash or rebase through the GitHub UI now hard-fails at publish, because neither produces a second parent. ADR-050 identified UI merging as a route it could not close. This does not close it either, but it does make one variant of it fail safely instead of silently. That is fail-closed and wanted, and it is recorded here rather than left for someone to discover.

**Artifact expiry now bites differently.** Pinning to one run means that run's expiry matters even when newer previews exist, where before a newer one would have been silently substituted. That is not an availability regression: the case newly failing is exactly the wrong-artifact case this decision exists to prevent. Availability of a *correct* deploy is unchanged; availability of an *incorrect* one drops to zero. Retention moved from 3 days to 7 to widen the window anyway, which costs nothing for a static-site build.

**The lookup window is bounded at 50 successful preview runs.** If more than fifty land between a preview and its publish, the lookup misses. Not plausible at this cadence, and it fails closed.

**`fetch-depth: 0` in the publish checkout is now load-bearing.** A future optimisation to a shallow clone would break the resolve step.

**Rejected identities, recorded so they are not re-proposed.** The version in `package.json` is not unique per build: two patch changesets produce the same version, and `changesets/action` updates the same open PR across master pushes, so one version can carry different bytes at different head SHAs. The PR number identifies a long-lived PR, not the bytes.

**The stronger option not taken.** A content hash of `out/`, published by the preview and checked by publish, identifies bytes rather than a commit. It is the only thing that would catch a preview that built from the wrong ref while being handed the right SHA, since the artifact name is a label applied by the producer rather than a property derived from the bytes. It costs more machinery and is not adopted here.

### What this does not deliver

Two things stay open, and P146 stays open with them.

Nothing verifies the artifact independently of the mechanism that selected it. Both checks derive from the same producer-applied label.

There is still no release-specific detector. The production smoke test cannot distinguish one build of this site from another, and a cheap fix is not available: the build emits nothing release-identifying, no build id, no SHA, no rendered version. A detector needs the build to emit something first.

Worth naming the pattern rather than just the instances: this pipeline keeps landing prevention ahead of detection. ADR-050 did the same thing four hours earlier.

## Confirmation

1. `release-pr-preview.yml` uploads under `release-preview-build-${{ github.event.inputs.pr_head_sha }}`.
2. `publish-pipeline.yml` resolves `git rev-parse HEAD^2` and fails, naming both recoverable causes, when HEAD is not a merge commit.
3. The preview run is selected by matching `headSha` against that SHA, not by recency.
4. The download requests the SHA-named artifact, so a wrong run yields a not-found rather than a deploy.
5. `gh run list` retains its `GH_TOKEN` env, without which the lookup fails unauthenticated.

## Related

- **P146** is the driving ticket. This closes its selection defect and its check for other occurrences; independent artifact verification and a release-specific detector remain open on it.
- **ADR-050** established that release blocking lives in the workflow graph, and its body names this gap: "the chain 'the bytes we tested are the bytes that went live' is not established". This closes one of that chain's two links. The other, that nothing accessibility-tests the shipped bytes, is unchanged and still a named gap.
- **On whether this breaks ADR-050's rule, since it looks like it might.** ADR-050 generalised to "every quality gate is an ancestor of `release-pr`", and the two conditions installed here can refuse a production deploy without being ancestors of anything. They cannot be: they exist only after the merge. The rule is not broken, because these are not quality gates. A quality gate asks whether the code is good enough to release; these ask which bytes are the ones being released. Different class, different point in the path, and the ancestor rule governs the former.
- **`main-pipeline.yml`** already keys its own artifact as `static-site-<sha>` and downloads it by that name twice. This applies the repo's existing convention to the one workflow that departed from it, which is why the mechanism needed no deliberation.
