# Problem 125: Nothing recomputes WSJF on a status transition, so the Open multiplier persists and halves the ticket's rank

**Status**: Known Error
**Reported**: 2026-08-05
**Priority**: 8 (Medium), Impact: 2 x Likelihood: 4, derived at capture. Impact is 2 because nothing wrong ships to a reader or visitor: the harm is a mis-ranked dev-work queue, and `/wr-itil:work-problems` Step 3 selects top-to-bottom from that queue, so a halved rank silently defers real work. Likelihood is 4 because every Open to Known Error transition is exposed, no control covers the multiplier, and the same arithmetic surface has now produced five recorded errors.
**Origin**: internal
**Effort**: S, derived at capture. The fix is a pre-flight checklist line in the transition path (mirroring the Effort re-rate clause already there), optionally plus an arithmetic self-check in `reconcile-readme` that recomputes WSJF from the ticket's own stated Severity, Status and Effort rather than trusting the stored value. Single-surface prose edit plus an optional check in an existing script; cf. P114, also rated S.
**WSJF**: 16.0 = (8 x 2.0) / 1 (re-rated 2026-08-08: Open to Known Error auto-transition, status multiplier 1.0 to 2.0 per P125)
**JTBD**: JTBD-001
**Persona**: developer

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

- [ ] Confirm which transition surfaces are exposed. `manage-problem` Step 7 and `/wr-itil:transition-problem` host separate copies of the transition logic per the ADR-010 copy-not-move rule, and `/wr-itil:transition-problems` batches it. A checklist fix has to land in all of them or it drifts.
- [ ] Decide between the two fix shapes, or both: a pre-flight checklist line mandating the multiplier re-rate alongside the existing Effort clause, versus an arithmetic self-check in `reconcile-readme` that recomputes WSJF from the ticket's own Severity, Status and Effort fields and reports a mismatch. The checklist is cheaper; the self-check is the only one that catches a value wrong in both places, which is the observed failure mode.
- [ ] Check whether the render path should recompute rather than trust. "Render, not a re-rank" is a deliberate cost bound, but recomputing WSJF from three fields already present on the ticket is arithmetic, not a re-rate, and may sit inside that bound.
- [ ] Create a reproduction test.

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
