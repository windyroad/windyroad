# Problem 146: publish-pipeline selects the production artifact by recency, not identity

**Status**: Open
**Reported**: 2026-08-09
**Priority**: 8 (Medium). Impact: 4 x Likelihood: 2, derived at capture from the description per Step 4a
**Origin**: internal
**Effort**: S, derived at capture per Step 4a

## Description

The production deploy downloads a build artifact chosen by "most recent successful preview run", with no check that the run belongs to the release being published. If that assumption is ever wrong, production receives bytes that do not correspond to the release, and nothing in the pipeline notices.

Verified on disk 2026-08-09. `.github/workflows/publish-pipeline.yml` lines 28 to 40 run:

```
RUN_ID=$(gh run list --workflow=release-pr-preview.yml --status=success --limit=1 --json databaseId --jq '.[0].databaseId')
```

There is no filter on head SHA, PR number, or branch. Lines 42 to 48 then download the `release-preview-build` artifact from that run id, and line 53 deploys those bytes to production with `netlify deploy --prod`. The workflow never rebuilds, so whatever artifact that query returns is exactly what visitors get.

The selection is correct in the normal single-release case, which is why this has not bitten. It is wrong whenever the most recent successful preview run is not the one for the release being published. Two paths to that: two release previews in flight at once, or a preview run for a superseded release PR completing after the current one.

**On the rating.** Impact 4 rather than 5, but by a narrower argument than an earlier draft of this ticket gave. That draft said "it is not a broken-site failure", which maps to the wrong rung: RISK-POLICY.md puts "site fully offline" at level 4, and level 5 is "misleading or factually wrong content reaching site visitors". The sound route to 4 is that a superseded preview artifact is a coherent prior release, so visitors get a consistent older site rather than anything affirmatively untrue. That is worse than level 3 degradation because it is silent and undetected, and short of 5 because nothing false is asserted.

Impact is really a range topping out at 5. The second path named above, an artifact carrying changes not yet intended for release, puts content live that is untrue as of publication, and that is a level 5 outcome. Rated at the lower end because the stale-release case is the more likely of the two.

Likelihood 2 rather than 3 rests on serial releases being current practice, which is a convention rather than an enforced constraint, so 2 is the floor of what is defensible rather than comfortably inside it.

There is no detector. The production smoke test at lines 59 to 80 asserts that the homepage, `/blog/` and `/vibe-code-audit/` each return 200 and that the homepage contains "Tom Howard". Any recent build of this site satisfies all four, so the test cannot distinguish the right artifact from the wrong one.

## Symptoms

- No symptom has been observed. This is a latent correctness gap found by reading the workflow, not a reported failure.
- The production deploy step names no commit, so a wrong-artifact deploy would leave no signal distinguishing it from a correct one.

## Workaround

None in place. Publishing one release at a time keeps the assumption true, which is the current de facto practice rather than an enforced constraint.

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: never observed; the exposure exists on every production deploy
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Investigate root cause
- [ ] Create reproduction test
- [x] Decide how the preview run should be identified. Fixed as this ticket predicted: the artifact is now named `release-preview-build-<pr_head_sha>` and publish resolves `git rev-parse HEAD^2` to find and download that exact one. See the Resolution below. Recorded as ADR-051.
- [ ] Decide whether the publish job should verify the downloaded artifact against the commit it is publishing before deploying, as a check independent of however the run is selected
- [ ] Decide whether the production smoke test should assert something release-specific rather than only that the homepage is up and contains a name that any build satisfies
- [x] Check whether the same recency-not-identity selection appears anywhere else. It does not. `main-pipeline.yml` is the only other artifact producer and consumer, and it already keys on `static-site-<sha>` for the upload and both downloads, all inside a single run, so there is no cross-run lookup to get wrong. `publish-pipeline.yml` was the repo's only cross-workflow artifact consumer.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P143 (CI smoke test has no retry, and its failure skips the production path), same production path, same family of the pipeline doing something quietly rather than loudly. P115 (site changes without a changeset silently never release to production), also about production diverging from what master says.

## Related

Surfaced by the `wr-architect:agent` review of the P143 skip fix, as an observation explicitly outside that change's scope. Verified independently against `publish-pipeline.yml` on disk before capture rather than propagated from the verdict.

## Resolution

The selection defect is fixed, recorded as ADR-051 (ratified 2026-08-10). Two of the four investigation tasks are closed; two remain open, so this ticket stays open.

**The mechanism.** `scripts/release-watch.sh` merges the release PR with `gh pr merge --merge`, so the commit pushed to `publish` is a merge whose second parent is the PR head the preview built from. `release-pr-preview.yml` now uploads under `release-preview-build-<pr_head_sha>`, and `publish-pipeline.yml` resolves `git rev-parse HEAD^2`, finds the preview run whose `headSha` matches that rather than the most recent one, and downloads the SHA-named artifact.

**Which half is load-bearing, since it is not the obvious one.** The artifact *name* is the identity: it derives from the same `pr_head_sha` input that drives the preview's checkout, so the name cannot disagree with the bytes. The run lookup is only how the haystack is found. A wrong lookup asks for an artifact that run does not have and fails, rather than deploying what it does have.

**Verified before landing, and the check took three attempts to get right.** The first reported seven single-parent publish commits, which was wrong: those SHAs are absent from the local clone, and `git rev-parse X^2` fails identically for a non-merge and for a missing object, so the check could not distinguish them. The second restricted itself to locally-present objects and gave five of five merges, but could say nothing about the other seven, which turn out to be unfetchable from the remote as well. Asking the GitHub API for each commit's parent count resolves every one without needing the objects: **all twelve publish runs on record are merge commits.** Separately, `HEAD^2` matched the preview run's `headSha` on full SHAs for the three checked against preview history.

**Three defects in the first draft, all caught at review before anything landed.** The `GH_TOKEN` env block was dropped from the rewritten lookup step, which would have failed `gh` unauthenticated. The failure message asserted that `release-watch.sh` always produces a merge commit, which is false for a UI squash or rebase merge and for the publish-ref realignment at the end of that script; that realignment was then verified empirically not to fire a publish run, one run per release across the last five. And both error paths were dead ends, so each now names its recovery.

**Deliberate behaviour change.** Merging the release PR by squash or rebase through the UI now hard-fails at publish, because neither produces a second parent. That route was already named as un-closed in ADR-050; this does not close it but makes one variant fail safely rather than silently.

**Still open, and why this ticket stays open.**

Nothing verifies the artifact independently of the mechanism that selected it. Both checks derive from the same producer-applied label, so a preview that built from the wrong ref while being handed the right SHA would pass both. A content hash of `out/`, published by the preview and checked by publish, is the stronger option that was consciously not taken.

There is still no release-specific detector, and a cheap one is not available: the build emits nothing release-identifying, so a detector needs the build to emit something first. This ships a preventer with no detector, which is the same shape ADR-050 shipped four hours earlier.

## Investigation Tasks (remaining)

- [ ] Make the run lookup robust to a moved branch. It matches the RUN's `headSha`, which for a dispatch is the tip of `--ref`, not the `pr_head_sha` input. Normally they coincide, but if master has moved and updated the release PR, re-dispatching the preview rebuilds under the right artifact name while the run's `headSha` no longer matches, so the lookup still misses and the printed recovery does not clear it. Selecting by dispatch input or by artifact presence would close it. Fails closed either way, so this is a recoverability gap rather than a safety one
- [ ] Exercise the new path once before a release depends on it: dispatch the preview for a known SHA and confirm the artifact lands under `release-preview-build-<sha>` and that the lookup finds it. This change cannot be executed locally and nothing runs it before a real release, which is its irreducible risk floor
- [ ] Publish a content hash of `out/` from the preview and check it at publish, so the artifact is verified independently of the label the producer applied
- [ ] Make the build emit something release-identifying, then assert it in the production smoke test, so a wrong deploy is detectable and not only preventable. Note the detector gap is wider than this ticket first said: the smoke test asserts three URLs, but `src/app/` has no `vibe-code-audit` route, `netlify.toml` lines 41 to 44 redirect `/vibe-code-audit` to `/` with a 302, and the tests use `curl -sS -L`, which follows it. So one of the three assertions lands on the homepage, the same page assertion one already checked. Two distinct pages are covered, not three, and one assertion passes for a reason unrelated to what it appears to check. Pre-existing and identical in both the production and preview smoke tests.