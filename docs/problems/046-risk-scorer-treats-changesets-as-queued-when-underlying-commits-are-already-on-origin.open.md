# Problem 046: Risk scorer treats changesets as queued when underlying commits are already on origin

**Status**: Open
**Reported**: 2026-05-02
**Priority**: 12 (Significant). Impact: Significant (4) x Likelihood: Possible (3)
**Effort**: M
**WSJF**: 6.0 = (12 x 1.0) / 2

## Description

When the risk-scorer pipeline subagent (`wr-risk-scorer:pipeline`) scores Layer 1 (release risk), it reads `.changeset/*.md` files in the working tree and treats the descriptions as "pending consumer-facing changes". It does NOT verify whether the underlying commits that introduced each changeset have already been pushed to `origin/<base>`. This produces a false-high score in a common state: the maintainer pipeline (changesets-action) lands the feature commits to master and the changesets are already on origin, awaiting the next release-PR merge to npm.

The error is asymmetric. False-high release risk leads downstream consumers (the `/wr-itil:work-problems` Step 6.5 above-appetite branch, the `/wr-itil:manage-problem` Step 12 release path, the `/wr-itil:transition-problem` skill) to either halt the loop, route into ADR-042's auto-apply remediation loop (`move-to-holding` the changesets that have already shipped), or surface phantom remediations to the user. None of these are correct when the underlying commits are already live; the changesets just need to drain through the changesets-action release PR.

## Symptoms

Live example, 2026-05-02 AFK loop on this session:

- After AFK iter 2 landed three docs-only commits, Step 6.5 invoked `wr-risk-scorer:pipeline`. The first call assumed the `.changeset/` queue was empty and returned `release=1`, `push=4`. Within appetite. The orchestrator was about to drain.
- Before draining, the orchestrator re-read the changeset filenames and noticed three pending changesets. Re-invoked the scorer with the changeset content visible. Second call returned `release=8`, `push=8`, `commit=8`. **Above appetite.** Per ADR-042, the orchestrator routed into the above-appetite branch and stopped the drain.
- Tom corrected: "pause-commercial-funnel-fully-booked has already been pushed."
- Verification on disk: all three `.changeset/*.md` files were added to git in commits already on `origin/master` (`d6cc6d9 fix(diagrams)...`, `b196c18 fix(social)...`, `b97bc0b feat: pause commercial funnel...`). The pending release PR exists on `origin/changeset-release/publish` (commit `db9ee6b pipeline: release`). The underlying product code was live; the only "pending" surface was the npm version bump and CHANGELOG line.
- The scorer's reasoning treated the changeset content as "would deploy a substantial product pivot" without checking whether the deploy had already happened.

The wrong score consumed orchestrator turns: I had to re-invoke the scorer with explicit context, route through ADR-042 framing, surface a halt option to the user, and only then verify push state. With correct first-pass scoring, the orchestrator would have gone straight to drain.

## Workaround

Tom corrects in-session, as on 2026-05-02. The downstream consumer (orchestrator skill) can also re-verify via `git log --diff-filter=A --oneline origin/<base> -- .changeset/<name>.md` before acting on the scorer's release-layer score, but that hides the error rather than fixing it.

## Impact Assessment

- **Who is affected**: any caller of `wr-risk-scorer:pipeline` or `/wr-risk-scorer:assess-release` whose state has `.changeset/*.md` files committed and pushed but not yet drained through the changesets-action release PR. This is the steady-state for the WR repos every time the maintainer pipeline lands a feature commit before its release PR merges.
- **Frequency**: every Step 6.5 release-cadence check during a window where push has happened but release-PR has not merged. Typical window: hours to days per release.
- **Severity**: Significant. False-high scores route into ADR-042's auto-apply branch, which CAN reach for `move-to-holding` on changesets that have already shipped (the holding action moves the file but does not undo the deploy that already happened). Worst-case: the holding action ships as a chore commit that confuses the next release-PR generation. Best-case: the orchestrator halts unnecessarily and burns user attention.
- **Analytics**: N/A.

## Root Cause Analysis

### Pattern

The scorer's release-layer scoring reads changeset descriptions as if they were a forward-looking "what would deploy if we released right now" projection. It does not separate two distinct states:

1. **Code already live; changeset queue waiting to drain.** The deploy has happened; the changeset just records "this version-bump and CHANGELOG entry are pending". Consumer-facing risk for THIS state is low (the change is in production already; users have seen it).
2. **Code not yet pushed; changeset describes pending deploy.** The deploy has not happened; the changeset is the forward-looking signal. Consumer-facing risk for THIS state is whatever the changeset content implies.

The fix surface is the scorer's reasoning rule: before classifying a `.changeset/*.md` as "pending consumer-facing change", the scorer must verify whether the commit that introduced the changeset has already reached `origin/<base>`. Only changesets whose introducing commit is unpushed get the forward-looking risk treatment.

### Verification check (per P045 discipline)

The fix surface most likely lives in `wr-risk-scorer` (the subagent's pipeline reasoning logic). Two checks per P045 before propagating that as the placement claim:

1. **Domain fit**: pipeline-state reasoning is `wr-risk-scorer`'s domain. The scorer's job is to read the working tree + git state + policy and emit a residual. Yes, fit.
2. **Placement authority**: this project is the `wr-risk-scorer` plugin's consumer, not maintainer. Recommendation only; the maintainers decide where the fix lands. Possible alternatives: a windyroad-local RISK-POLICY.md amendment that names the verify-pushed-state rule and a wrapper around `assess-release` that checks before invoking the upstream subagent. Local placement keeps the fix shippable without an upstream PR but compounds wrapping debt.

Default placement (until evidence shows otherwise): upstream `wr-risk-scorer` subagent prompt extension.

### Fix Strategy

Two options, in increasing scope.

**Option 1: scorer-side commit-state check**

Amend the `wr-risk-scorer:pipeline` subagent prompt (or the rubric the agent reads) to include this rule:

> For each file in `.changeset/*.md`, identify the commit that added the file (`git log --diff-filter=A --oneline -- <file>`). If that commit is reachable from `origin/<base>` (`git merge-base --is-ancestor <commit> origin/<base>`), score the changeset's release contribution at "underlying code already pushed; release queue pending drain only" (residual ≤ 2/25). Apply forward-looking risk treatment only when the introducing commit is NOT yet on `origin/<base>`.

This is a single-rule extension. The scoring delta is 6 points (8 to 2 in the live example). No tool surface change, no new ADR.

**Option 2: caller-side verification (defensive layer)**

In the orchestrator skills (`/wr-itil:work-problems` Step 6.5, `/wr-itil:manage-problem` Step 12), before acting on a Layer 1 release-risk score, re-verify the .changeset/* commit state and override the scorer's score if the introducing commits are already pushed. This is defence-in-depth, but it duplicates reasoning the scorer should own. Skip unless option 1 proves insufficient.

### Investigation Tasks

- [ ] Verify the proposed `git merge-base --is-ancestor` check works against this project's origin (test against the three live .changeset files: each should resolve to a commit ancestor of `origin/master`).
- [ ] Confirm the `wr-risk-scorer:pipeline` subagent currently has the tools needed to run `git log --diff-filter=A` and `git merge-base --is-ancestor` (Bash with git is the natural channel).
- [ ] Review ADR-015 and the current `assess-release` skill flow for any place this rule should also be surfaced (rubric file, skill prompt, agent definition).
- [ ] Decide placement: upstream wr-risk-scorer subagent prompt vs local RISK-POLICY.md amendment vs caller-side verification. Per P045 discipline, do NOT pre-emptively classify as upstream-blocked; the maintainers decide.
- [ ] Once placement decided: amend the chosen surface, write a regression test fixture (changeset whose introducing commit is on origin vs unpushed), and ship.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P028, P045

## Related

- P028 (risk-scorer 30-min TTL expired during long-running orchestrator turns): different surface (TTL expiry vs queued-but-already-pushed reasoning), same plugin (wr-risk-scorer).
- P045 (assistant accepts ticket Fix Strategy upstream-placement framing without questioning): the discipline this ticket applied when classifying the fix surface. Pre-emptive "upstream wr-risk-scorer skill build" framing was avoided.
- ADR-015 (on-demand assessment skills): the skill / subagent delegation pattern that the scorer fits into.
- ADR-042 (above-appetite remediation loop): the consumer that misroutes when the scorer's release-layer score is inflated.
- Live example commits in this session: `d6cc6d9` (contrast fix), `b196c18` (Bluesky length fix), `b97bc0b` (Fully Booked CTA pivot), `db9ee6b` (changesets-action release PR sitting on `origin/changeset-release/publish`).
- `~/.claude/plugins/cache/windyroad/wr-risk-scorer/` (current cached plugin location for the scorer subagent and its rubric, for reference).

**Upstream placement confirmed 2026-05-13** (user direction via AskUserQuestion batch-2 answer 1): file upstream via `/wr-itil:report-upstream` next interactive session. Fix Strategy default (upstream wr-risk-scorer subagent-prompt extension per P045 discipline applied in the ticket body) stands. Ticket is in `upstream-blocked` state for AFK iters until upstream lands.
