# Problem 046: Risk scorer treats changesets as queued when underlying commits are already on origin

**Status**: Parked
**Reported**: 2026-05-02
**Origin**: internal
**Priority**: 12 (High). Impact: Significant (4) x Likelihood: Possible (3)
**Effort**: M
**WSJF**: 0 (parked, excluded from ranking)

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

- **Reported upstream**: https://github.com/windyroad/agent-plugins/issues/121 (2026-05-13)

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/121
- **Reported**: 2026-05-13
- **Template used**: problem-report.yml (problem-shaped, per ADR-033 primary classifier)
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes (issue body contains downstream ticket reference)

## Parked

- **Reason**: upstream-blocked. The genuine fix lives in the `wr-risk-scorer` plugin at `~/.claude/plugins/cache/windyroad/wr-risk-scorer/<version>/` (specifically the `pipeline` agent reasoning rubric at `agents/pipeline.md` and / or the `assess-release` SKILL prompt-build at `skills/assess-release/SKILL.md` step 4), inside the `windyroad/agent-plugins` repo. The local repo has no `packages/wr-risk-scorer/` directory; this project is a downstream marketplace consumer of `@windyroad/wr-risk-scorer`. A consumer cannot edit the cached agent prose or SKILL.md without losing the change on next plugin update, so the only durable fix is upstream. The Option 2 caller-side defensive wrapper named in the ticket's Fix Strategy (re-verify `.changeset/*.md` introducing-commit ancestry in the orchestrator skills before acting on a Layer 1 release-risk score) is itself orchestrator-side prose that lives in upstream `wr-itil` SKILL.md files (`work-problems/SKILL.md` Step 6.5, `manage-problem/SKILL.md` Step 12), the same marketplace-consumer-cannot-edit-cached-plugin shape just one plugin over. No local-codifiable surface exists.
- **Verified persistence**: latest cached plugin version `0.11.2` still ships the bug. `skills/assess-release/SKILL.md` step 2 (lines 36 to 37) lists `.changeset/*.md` filenames via `ls .changeset/*.md 2>/dev/null | head -20` and step 4 (lines 59 to 62) passes "the changeset list (if any)" to the pipeline subagent without any `git merge-base --is-ancestor` push-state verification. The `agents/pipeline.md` rubric does not contain the P046-recommended `git log --diff-filter=A` plus `git merge-base --is-ancestor <commit> origin/<base>` introducing-commit ancestry check anywhere in its release-layer scoring guidance: a `grep -n` for `changeset|merge-base|--is-ancestor` returns 16 hits on `changeset` referencing graduation-from-holding logic (ADR-061 / ADR-042) and zero on the P046 push-state-verification rule. Verified 2026-05-31 by reading the cached files.
- **Upstream issue status**: `windyroad/agent-plugins#121` OPEN as of 2026-05-31 (last updated 2026-05-15T05:31:56Z, no labels). Filed 2026-05-13 via problem-report.yml template; cross-reference confirmed in the "Reported Upstream" section above. No fix committed upstream yet.
- **Un-park trigger**: a new `wr-risk-scorer` plugin release lands in `~/.claude/plugins/cache/windyroad/wr-risk-scorer/` whose `agents/pipeline.md` release-layer scoring guidance (or, alternatively, `skills/assess-release/SKILL.md` step 4 prompt-build) implements the Option 1 introducing-commit ancestry check: for each file in `.changeset/*.md`, identify the introducing commit (`git log --diff-filter=A --oneline -- <file>`) and check `git merge-base --is-ancestor <commit> origin/<base>`. If ancestor, score the changeset's release contribution at "underlying code already pushed; release queue pending drain only" (residual ≤ 2/25); only apply forward-looking risk treatment when the introducing commit is NOT yet on `origin/<base>`. Verify by re-reading the cached prose in the new version. Close P046 once a session producing release-cadence checks against `.changeset/*.md` files committed-and-pushed (but undrained through changesets-action release PR) returns residual ≤ 2/25 instead of the current false-high 8/25.
- **Local impact while parked**: existing Workaround (Tom corrects in-session; orchestrator skill can re-verify via `git log --diff-filter=A --oneline origin/<base> -- .changeset/<name>.md` before acting on the scorer's release-layer score) remains the operating contract. The risk is asymmetric and false-high, not false-low. When the scorer over-scores release risk for a pushed-but-undrained changeset queue, the AFK orchestrator's Step 6.5 above-appetite branch halts the loop or surfaces phantom remediations to the user (per ADR-042), and the user catches up at next interactive session. The Step 6.5 halt is recoverable; the scoring asymmetry never costs the project a deploy.
- **Composes with**: P028 (verifying 2026-05-16, upstream `windyroad/agent-plugins` `wr-risk-scorer` TTL-band policy shipped in v0.9.0); P047 (parked 2026-05-30, upstream `windyroad/agent-plugins#110` `wr-risk-scorer` assess-release SKILL.md step 5 prose). All three share the `wr-risk-scorer` plugin and the marketplace-consumer-cannot-edit-cached-plugin shape; P028 differs in that the upstream fix has already shipped (verifying not parked). P046 extends the surface from TTL-band policy plus delegation prose to release-layer scoring logic.
- **Date parked**: 2026-05-31
