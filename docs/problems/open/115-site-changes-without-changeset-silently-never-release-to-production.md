# Problem 115: Site changes land on master without a changeset and silently never release to production

**Status**: Open
**Reported**: 2026-07-14
**Priority**: 12 (Significant), Impact: 3 x Likelihood: 4, derived at capture from the description
**Origin**: internal
**Effort**: M, derived at capture

## Description

Site changes land on master without changesets, so they silently never release to production. Production deploys only when the `publish` branch advances via the changeset-release flow: a changeset on master triggers the main-pipeline "Create release PR" job, whose merge to `publish` runs publish-pipeline's `netlify deploy --prod`. Commits with no changeset produce no release PR, so `publish` never moves and the change stays live-invisible on master indefinitely.

Concrete failure: ADR-041's consulting-funnel retirement (commits d358fe3 through ee17f15, landing on master from around 2026-07-07 onward) sat green on master but unreleased for a week. The old pitchy funnel stayed live in production the whole time. The gap was only discovered when Tom saw the live site still showing the old funnel and asked "did you release???". At that point master was 10 commits ahead of publish with 0 changesets pending.

There is no nudge at the point a site-affecting commit lands without a changeset. push-watch does surface a WIP nudge, but only after 3 or more unreleased commits OR a 24h age threshold, and only when zero changesets exist. That fired too late and too quietly here: the retirement accumulated unreleased for a week without anyone acting on the nudge.

Candidate fix strategies:

- (a) A commit-time or push-time gate or nudge that detects site-source changes (`src/app`, `src/components-next`, `netlify.toml`, and similar) landing without a changeset, and prompts to author one before the change can accumulate unreleased.
- (b) Tighten the existing push-watch unreleased-commits nudge thresholds specifically for site-source paths (lower the count and age triggers, or escalate the nudge from advisory to blocking).
- (c) Documentation or runbook making explicit that site changes require a changeset to reach production.

Evidence: session 2026-07-14 releasing the ADR-041 retirement. `git log origin/publish..origin/master` showed 10 commits; `.changeset/` held only `README.md` and `config.json`.

## Symptoms

(deferred to investigation)

## Workaround

Author a changeset for the accumulated site work (`npx changeset`), push it, let the changesets action open the `pipeline: release` PR, then run `npm run release:watch` to merge to `publish` and deploy. This is the manual recovery run in the 2026-07-14 session.

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: (deferred to investigation)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Investigate root cause
- [ ] Create reproduction test

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P012 (CI-status ship gate on push/release), P046 (risk-scorer changeset accounting)

## Related

Captured via /wr-itil:capture-problem; expand at next investigation.

- P012 (`docs/problems/verifying/012-no-ship-gate-on-push-publish-deploy.md`). Adjacent ship-gate concern, but P012 gates on red CI; this ticket is the distinct missing-changeset-authoring nudge for site changes.
- P046 (`docs/problems/parked/046-risk-scorer-treats-changesets-as-queued-when-underlying-commits-are-already-on-origin.md`). Adjacent changeset-accounting concern in the risk scorer, distinct from the missing-changeset-authoring gap here.
- ADR-041 (`docs/decisions/041-retire-consulting-funnel-repurpose-as-the-shift-hub.proposed.md`). The change whose week-long unreleased state surfaced this gap.
