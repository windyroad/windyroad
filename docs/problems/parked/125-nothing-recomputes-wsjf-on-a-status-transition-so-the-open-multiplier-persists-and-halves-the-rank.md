# Problem 125: Nothing recomputes WSJF on a status transition, so the Open multiplier persists and halves the ticket's rank

**Status**: Parked
**Reported**: 2026-08-05
**Priority**: 8 (Medium), Impact: 2 x Likelihood: 4, derived at capture. Impact is 2 because nothing wrong ships to a reader or visitor: the harm is a mis-ranked dev-work queue, and `/wr-itil:work-problems` Step 3 selects top-to-bottom from that queue, so a halved rank silently defers real work. Likelihood is 4 because every Open to Known Error transition is exposed, no control covers the multiplier, and the same arithmetic surface has now produced five recorded errors.
**Origin**: internal
**Effort**: S, derived at capture. The fix is a pre-flight checklist line in the transition path (mirroring the Effort re-rate clause already there), optionally plus an arithmetic self-check in `reconcile-readme` that recomputes WSJF from the ticket's own stated Severity, Status and Effort rather than trusting the stored value. Single-surface prose edit plus an optional check in an existing script; cf. P114, also rated S.
**WSJF**: excluded from ranking = (8 x 0) / 1 (re-rated 2026-08-08: Known Error to Parked, status multiplier 2.0 to 0 per the manage-problem WSJF table. Parked tickets are excluded from the dev-work queue per upstream ADR-022. Prior value was 16.0 = (8 x 2.0) / 1. Recomputing the multiplier at this transition is exactly the discipline this ticket documents the absence of.)
**JTBD**: anchoring left explicitly unconfirmed. `docs/jtbd/` models four personas, all readers or the newsletter author; the affected party here is whoever works the backlog, and no maintainer persona is modelled. The prior `JTBD-001` value was wrong on two counts: in this repo JTBD-001 is Awareness, an Engineering Leader job retired by ADR-041 on 2026-07-10, and the "enforce governance without slowing down" gloss belongs to the upstream agent-plugins corpus, not this one. Same convention as the P130 note.
**Persona**: anchoring left explicitly unconfirmed. The prior `developer` value named this repo's reader persona (a working engineer who reads Tokens Spent on LinkedIn), which has no relationship to the problem backlog.

## Description

Nothing recomputes WSJF when a ticket changes status, so an Open to Known Error transition silently keeps the Open status multiplier and halves the ticket's rank.

Observed 2026-08-05 working P121: the transition correctly re-rated Effort M to L but left the multiplier at 1.0, giving WSJF 3.0 where `(12 x 2.0) / 4 = 6.0`. The wrong value was written consistently into both the ticket body and `docs/problems/README.md`, so every consistency check passed.

It was caught only by the `wr-risk-scorer:pipeline` commit gate, after architect, jtbd, style-guide and voice-tone reviews had all passed. None of those four gates reads WSJF arithmetic.

No control covers this surface:

- `manage-problem` Step 7's README refresh is explicitly "a render, not a re-rank" and trusts the WSJF values stored on the ticket files.
- `wr-itil-reconcile-readme` compares ticket bodies against README rows, so a value that is wrong in both passes clean. That is exactly what happened: reconcile exited 0 on the incorrect 3.0.
- The Step 7 Open to Known Error pre-flight checklist mandates an Effort re-rate against the now-documented fix strategy, but says nothing about the status multiplier that changes in the very same transition.

This is a recurring class, not a one-off. `docs/problems/README.md` Notes records four capture-time WSJF miscalculations corrected in a single 2026-08-05 review pass (P120 10.0 to 5.0, P121 and P122 12.0 to 6.0, P123 18.0 to 9.0), and the P121 transition error is a fifth instance of the same arithmetic surface.

The transition case is worse than the capture case in one respect: at capture there is no prior value to be inconsistent with, so a review pass catches it by recomputation. At transition the ticket already carries a plausible-looking WSJF line, and the Effort re-rate the checklist DOES mandate draws attention away from the multiplier that changed alongside it.

## Symptoms

A ticket transitioned Open to Known Error renders at half its correct WSJF and sinks in the ranked table. Every consistency check passes because the wrong value is stored consistently in both the ticket body and the README row.

## Workaround

Recompute WSJF by hand at every status transition: `(Severity x Status Multiplier) / Effort Divisor`, with the multiplier taken from the POST-transition status (Known Error 2.0, Open 1.0). Note that an Effort re-rate in the same transition can mask the error by coincidence: M to L doubles the divisor while Open to Known Error doubles the multiplier, so the two cancel and the correct value is unchanged, which does not look like an error either way.

## Impact Assessment

- **Who is affected**: whoever works the backlog, including the AFK `/wr-itil:work-problems` orchestrator, which selects top-to-bottom from the rendered table.
- **Frequency**: potentially every status transition. Five instances of the same arithmetic surface are already recorded across 2026-08-05.
- **Severity**: no wrong output ships. The cost is deferred work on a mis-ranked ticket, plus the review rounds spent rediscovering the arithmetic.
- **Analytics**: none.

## Root Cause Analysis

### Investigation Tasks

- [x] Confirm which transition surfaces are exposed. Verified 2026-08-08 by reading `@windyroad/itil@0.59.2` in the plugin cache. Five surfaces, not three:
  - `skills/review-problems/SKILL.md` step 8 (line 51) computes WSJF, step 9 writes it, step 10 (line 53) auto-transitions Open to Known Error. The multiplier applied at step 8 is the pre-transition one and nothing re-runs after the rename. This is the mechanism that produced the P121 error, and the original ticket body missed it.
  - `skills/manage-problem/SKILL.md` Step 9b has the identical ordering: step 8 at line 927 calculates, step 9 at line 928 writes, step 10 at line 929 auto-transitions.
  - `skills/transition-problem/SKILL.md:85`, `skills/transition-problems/SKILL.md`, and `skills/manage-problem/SKILL.md:687` host three copies of the pre-flight checklist. All three mandate an Effort re-rate and none mentions the multiplier. `grep -c -i "status multiplier"` returns 0 for the first two files; `manage-problem`'s three matches are at lines 81, 85 and 927, none in the Step 7 checklist.
- [x] Check whether the render path should recompute rather than trust. Confirmed the gap is real on both halves. `skills/transition-problem/SKILL.md:240` states the refresh is "a render, not a re-rank" and that "existing WSJF values on the ticket files are trusted"; `scripts/reconcile-readme.sh` compares ticket-ID-to-status membership only and never parses a WSJF number, so a value wrong in both the ticket body and the README row exits 0 clean. Whether the bound should move is an upstream design call, carried in the issue rather than decided here.
- [ ] Decide between the fix shapes. Carried upstream as three candidate directions in issue #413 (checklist line across all copies; reorder the review pass so the calculation follows the auto-transition; arithmetic self-check in `reconcile-readme.sh`). Not decidable downstream, since every fix site is in the plugin cache.
- [ ] Create a reproduction test. Reproduction steps are recorded in issue #413. A test belongs upstream alongside the fix, in `packages/itil/scripts/test/`, which this repo does not carry.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P086, P096

## Related

- Captured via `/wr-itil:capture-problem` during the P121 iteration retro (2026-08-05).
- Driver evidence: commit `747d2c0` (the P121 Open to Known Error transition) and the `wr-risk-scorer:pipeline` commit-gate report that caught it. The scorer's own `RISK_REGISTER_HINT` names the gap: "no control recomputes WSJF and the mis-ranked ticket is silently deprioritised in work-problems Step 3 selection".
- Prior instances: `docs/problems/README.md` Notes, 2026-08-05 review pass, four capture-time miscalculations corrected.
- **P096** (`docs/problems/open/096-work-problems-reselects-direction-blocked-tickets.md`): also concerns what the orchestrator selects from the ranked table. Composes; neither blocks the other.
- **P086** (`docs/problems/known-error/086-...md`): the README-refresh-discipline hook surface. Adjacent to the render path this ticket questions.
- Duplicate-check matches (title-only grep on `wsjf|multiplier|transition`): P069 (work-problems WSJF ranking does not factor placement-authority) and P098 (work-problems Step 6.5 K to V auto-transition has no vehicle for repo-local script fixes). Neither covers the multiplier-recompute gap; listed here per the capture-problem contract for resolution at the next `/wr-itil:review-problems`.
- Hang-off pre-filter ran with zero shared-signal candidates, so no `wr-itil:hang-off-check` dispatch was made.
- **Reported upstream**: https://github.com/windyroad/agent-plugins/issues/413 (2026-08-08)

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/413
- **Reported**: 2026-08-08
- **Template used**: `problem-report.yml` (upstream problem-first intake, per upstream ADR-033)
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes. The issue body's `## Cross-reference` section names this repository and ticket P125.
- **Dedup check**: `gh issue list` across three keyword sets returned #315, #312, #394, #187, #218, #42 and #63. Read in full; none covers the status-multiplier recompute. #315 and #312 are the closest, and both concern what the ranked table selects rather than how a row's value is computed. Recorded in the issue's Additional context.
- **Gates**: `wr-risk-scorer:external-comms` PASS and `wr-voice-tone:external-comms` PASS. The risk reviewer caught a factual error in the first draft (a claim that all three `status multiplier` matches in `manage-problem/SKILL.md` sat in the definition table, when line 927 is in the Step 9b re-score pass) and an overstated net-effect claim that missed `review-problems/SKILL.md` entirely. Both were verified against the cache and corrected before filing, and the second one materially sharpened the report: the defect is a recompute-then-transition ordering, not an absence of recompute.

## Parked

- **Reason**: upstream-blocked, `marketplace-consumer-cannot-edit-cached-plugin` per ADR-036. All three predicate conditions hold. (1) The investigation identifies specific fix sites, listed under Investigation Tasks. (2) Every one of them lives inside `~/.claude/plugins/cache/windyroad/wr-itil/0.59.2/`, in the `windyroad/agent-plugins` repository. (3) This project carries no `packages/itil/` source tree; it has no `packages/` directory at all, and `grep -ril wsjf` across `.sh` / `.mjs` / `.js` / `.ts` outside `node_modules` returns zero hits. A consumer cannot edit the cached plugin without losing the change on the next update, so the only durable fix is upstream.
- **Verified persistence**: latest cached version `0.59.2` still ships the defect on every surface. Verified 2026-08-08 by reading the cached files directly; line references are recorded under Investigation Tasks.
- **Upstream issue status**: filed 2026-08-08 as https://github.com/windyroad/agent-plugins/issues/413, open. No prior issue covered this gap.
- **Un-park trigger**: a `wr-itil` release lands in `~/.claude/plugins/cache/windyroad/wr-itil/` that closes the gap by any of the three directions carried in the issue. Verify by re-reading the cached transition surfaces in the new version, then transitioning a test ticket Open to Known Error and confirming the stored WSJF adopts the 2.0 multiplier. Un-park to Verifying if the release has already shipped and only downstream confirmation remains.
- **Local impact while parked**: the manual recompute in `## Workaround` remains the operating discipline at every status transition in this repo. This ticket's own Known Error to Parked transition applied it, and the WSJF line records the multiplier change.
- **Composes with**: P096 (work-problems re-selects direction-blocked tickets) and P086 (README-refresh-discipline hook surface), both already listed under Dependencies. Also the fourteen prior marketplace-consumer parks that share this classification.
- **Date parked**: 2026-08-08
