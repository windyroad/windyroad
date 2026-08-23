# Ask Hygiene Trail: 2026-08-23 (P145 iter)

Retro invoked from the AFK `/wr-itil:work-problems` iteration working P145
(Risk register is empty, so every scorer run regenerates from scratch).

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | (none) | (none) | AFK iteration: `AskUserQuestion` is forbidden by the orchestrator contract. Two direction-setting questions were routed to `ITERATION_SUMMARY.outstanding_questions` per upstream ADR-044 (agent-plugins) AFK carve-out instead. |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

Both queued items would have classified as **direction** (category 1) had they
been asked interactively, not lazy:

- The `RISK-POLICY.md` `## Risk Catalog` section is policy substance, which is
  the operator's to set. Note the framework does NOT block this mechanically:
  the edit gate unblocks on a `wr-risk-scorer:policy` PASS with no interactive
  step, so the deferral is an authority judgement, not a capability limit.
- Which of four remedies resolves the em-dash collision that will bite whoever
  arms the register. The architect enumerated the options and explicitly
  declined to pick, and P060 already rejected one of them on the record.

Upstream reports were deliberately NOT queued as questions. Standing permission
to report upstream is recorded on P061, and the JTBD reviewer flagged queuing
them as a JTBD-401 outcome-6 breach in round 2 of this iteration's review.
