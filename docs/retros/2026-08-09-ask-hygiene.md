# Ask Hygiene - 2026-08-09 (risk band + edition-shape job iter)

Per ADR-044 / P135 Phase 5. Classification of this iteration's `AskUserQuestion` calls.

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | - | - | - |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

Zero calls. The iteration ran under a standing instruction never to call `AskUserQuestion` and to queue anything needing a decision at `ITERATION_SUMMARY.outstanding_questions`, which is where the four open items went.

Note that a zero here is not evidence of good ask hygiene, because the surface was closed rather than unused. Two decisions in this iteration would have been genuine `direction` calls under ADR-074 (substance-confirm-before-build) had the surface been open: whether to keep the composition constraint on a residual of exactly 5 when adopting the band, and whether JTBD-006's existence should promote any advisory shape probe to remediating. Both were resolved by taking the conservative branch (keep the constraint, promote nothing) and queueing the question, which is the correct AFK shape, but the lazy-count metric cannot distinguish that from a session that had nothing to ask.

## R6 numeric gate

Read the trail: `2026-08-08-p126`, `2026-08-08-p125`, `2026-08-08-p118` all record lazy count 0, and this retro is 0. The gate condition (lazy count >= 2 across 3 consecutive retros) does not fire. No deviation-candidate queued.

Checked by hand rather than by `check-ask-hygiene.sh`, which ships no `wr-retrospective-*` shim in the plugin's `bin/` at 0.27.0. That absence is already recorded in P130.
