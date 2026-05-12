# 2026-05-13 orchestrator ask-hygiene trail

Session: `/wr-itil:work-problems` AFK loop (6 iters) + wrap-up + `/wr-itil:review-problems` + this retro.

Classification per ADR-044 6-class taxonomy. The session's `AskUserQuestion` calls fired in the orchestrator's main turn only. Per-iter subprocesses had the `AskUserQuestion`-suppressed constraint and emitted observations to `outstanding_questions` instead. Queue accumulated 6 entries; surfaced at loop wrap-up via two `AskUserQuestion` batches (4 + 2).

## Calls

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| 1 | ADR-014 fix | direction | Gap: no framework rule resolves "create new ticket vs defer" for a 2-iter-corroborated cross-skill misattribution; framework-mediated capture-or-defer choice is genuine new territory. |
| 2 | Retro hook gate | direction | Gap: no ADR exists for which `docs/` paths belong in the architect/JTBD edit-enforce hook exclusion list; the policy was last extended ad-hoc 2026-05-02; this is direction-setting on hook scope. |
| 3 | Em-dash hook | direction | Gap: no ADR covers Edit/Write hook surface asymmetry; choice was port-now vs ticket-and-defer; framework cannot resolve user pacing preference. |
| 4 | P014 manual verify | direction | Gap: P014 IT-1 contains an explicit manual-confirmation gate; framework cannot run Playwright headed-mode autonomously; only user can execute. |
| 5 | P046 placement | direction | Gap: P045-discipline says verify placement before propagating; ticket body proposes upstream as default; user confirms or reverses. Not lazy because P045 discipline explicitly delegates the verify-step to user. |
| 6 | P053 cog-a11y gate | direction | Gap: P053 default proposal is taste-class; framework cannot resolve whether default vs alternate shape is correct without user preference. |

**Lazy count: 0**
**Direction count: 6**
**Deviation-approval count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

R6 numeric gate (P135 / ADR-044 Reassessment): not fired. Lazy count = 0 this retro. Cross-session trail (`check-ask-hygiene.sh`) reads: 2026-05-12 retros logged 0 lazy across iters 3/4/5/6 (subprocess lazy counts). Orchestrator-level lazy count for 2026-05-12 + 2026-05-13 both 0. Trend: zero lazy across 6+ retros, R6 gate dormant.
