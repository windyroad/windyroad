# Problem 098: work-problems Step 6.5 post-release K->V auto-transition has no vehicle for repo-local-script fixes in a consumer repo (no npm release)

**Status**: Open
**Reported**: 2026-06-17
**Priority**: 3 (Medium). Impact: 3 x Likelihood: 1 (deferred: re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: M (deferred: re-rate at next /wr-itil:review-problems)
**JTBD**: JTBD-006
**Persona**: plugin-developer

## Description

The `/wr-itil:work-problems` Step 6.5 "Post-release K->V auto-transition" (P228) only fires AFTER `release:watch` ships an npm changeset, matching a Known-Error ticket's `**Release vehicle**: .changeset/<name>.md` citation. In a downstream CONSUMER repo (like windyroad) that does not publish to npm, a fix to a repo-local script (e.g. P092's `scripts/push-watch.sh`) is "released" by being pushed to origin (the script runs directly from the working tree), so there is no changeset and no npm version. The K->V auto-transition therefore never fires, and the Known-Error ticket stays in known-error/ indefinitely even though its fix is live.

Evidence: this 2026-06-17 work-problems loop had to MANUALLY dispatch a transition iter to move P092 Known Error -> Verification Pending (commit 732b12a) because the fix (adbdb72, `push-watch.sh`) shipped via push-to-origin with no npm vehicle, so Step 6.5's auto-transition was a no-op.

Recurring class: any repo-local-{script,hook,skill,doc} fix in a consumer repo that does not publish to npm hits this. This is a P342 mechanical-auto-ticket class observation, a recurring framework-gap behaviour rather than a one-off slip.

Candidate fix (UPSTREAM, `wr-itil` work-problems Step 6.5 / the enumerate-postrelease-kv-candidates helper plus derive-release-vehicle): recognise a "repo-local / pushed-to-origin" release-vehicle class (no changeset) so `push:watch` success on a commit that resolves a Known-Error ticket's repo-local fix triggers the K->V transition. Alternatively, document that repo-local-fix consumer repos must transition K->V manually.

Upstream-bound: the fix lives in `@windyroad/wr-itil`, not authorable in this consumer repo. Flag as a `/wr-itil:report-upstream` candidate.

### Recurrence evidence (2026-06-27, Open tier)

The original 2026-06-17 evidence was the Known-Error -> Verifying tier (P092). The same root also drifts tickets stuck at the **Open** tier: a prior session implements + commits a repo-local skill/doc fix but never walks the ticket through any lifecycle transition, so the ticket sits in `open/` while its fix is already live on master. Two instances surfaced during the 2026-06-27 work-problems loop:

- **P075** (newsletter heading-craft checks): fix committed in `70a0503` on 2026-06-16 (repo-local `.claude/skills/wr-newsletter/*` edits); ticket left in `open/` until a 2026-06-27 iter manually transitioned it Open -> Verifying (commit `04bc7cb`).
- **P081** (newsletter editor editorial-craft pass): fix shipped 2026-06-17 (`5879f4b` / `69f6afe`); ticket also "misfiled as Open" and manually transitioned 2026-06-27 (see its `## Fix Released` note).

This broadens P098's scope from "K->V auto-transition vehicle gap" to "any-tier -> Verifying drift for repo-local consumer fixes": the absence of an npm release-vehicle signal means no automated lifecycle transition fires from any starting tier, so tickets drift out of sync with their already-shipped repo-local fixes and only resync when a human notices during a later loop. The upstream fix territory is the same (work-problems / manage-problem post-fix transition recognising a repo-local / pushed-to-origin release-vehicle class).

## Symptoms

(deferred to investigation)

## Workaround

Manually dispatch a transition iter (`/wr-itil:transition-problem`) to move the Known-Error ticket to Verification Pending once the repo-local fix is pushed to origin. This 2026-06-17 loop did exactly that for P092 (commit 732b12a).

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: (deferred to investigation)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Investigate root cause
- [ ] Create reproduction test
- [ ] File as /wr-itil:report-upstream candidate against @windyroad/wr-itil (fix is upstream-bound)

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

- **Reported upstream**: https://github.com/windyroad/agent-plugins/issues/320 (2026-07-03)

(captured via /wr-itil:capture-problem; expand at next investigation)

- **P092** (`docs/problems/verifying/092-push-watch-pull-rebase-and-transient-error-robustness.md`): the Known-Error ticket whose repo-local `push-watch.sh` fix triggered this observation; manually transitioned to Verification Pending in commit 732b12a because Step 6.5 could not.
- **P054** (`docs/problems/open/054-work-problems-skip-just-worked-known-error-pending-push.md`): adjacent work-problems Known-Error / pending-push handling; shares the work-problems post-fix-transition surface.
- Hang-off-check note: the sub-step 2b mechanical pre-filter surfaced more than 5 candidates on the broad `work-problems` / `push-watch` signal, so the fresh-context subagent dispatch was skipped per the candidate-cap latency short-circuit. PROCEED_NEW: no existing ticket scopes the work-problems Step 6.5 release-vehicle-class gap; P092 and P054 are adjacent surfaces, not parents. Defer cluster re-evaluation to /wr-itil:review-problems.

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/320
- **Reported**: 2026-07-03
- **Template used**: structured default (problem-shaped)
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes
