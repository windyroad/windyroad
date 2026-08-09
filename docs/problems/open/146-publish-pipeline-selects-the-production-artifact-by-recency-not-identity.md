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
- [ ] Decide how the preview run should be identified. Note the identity already exists upstream and is discarded at the naming step: `main-pipeline.yml` lines 246 to 249 dispatch the preview with `pr_head_sha` and `pr_number`, and `release-pr-preview.yml` line 26 checks out that SHA, but line 41 uploads under the constant artifact name `release-preview-build`. So the cheapest fix may be to include the SHA in the artifact name and have the publish job ask for the one it wants, rather than filtering the run list
- [ ] Decide whether the publish job should verify the downloaded artifact against the commit it is publishing before deploying, as a check independent of however the run is selected
- [ ] Decide whether the production smoke test should assert something release-specific rather than only that the homepage is up and contains a name that any build satisfies
- [ ] Check whether the same recency-not-identity selection appears anywhere else that consumes a cross-workflow artifact

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P143 (CI smoke test has no retry, and its failure skips the production path), same production path, same family of the pipeline doing something quietly rather than loudly. P115 (site changes without a changeset silently never release to production), also about production diverging from what master says.

## Related

Surfaced by the `wr-architect:agent` review of the P143 skip fix, as an observation explicitly outside that change's scope. Verified independently against `publish-pipeline.yml` on disk before capture rather than propagated from the verdict.
