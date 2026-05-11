# Ask-Hygiene Trail: 2026-05-11 iter2 (AFK work-problems)

Scope: AFK `claude -p` subprocess executing iter 2 of `/wr-itil:work-problems` against P006 (OG share image does not track homepage copy pivots). Iteration progressed P006 from Known Error to Verification Pending per ADR-022. Underlying fix already on `origin/master` since 2026-04-15 in commits `754a04a` (short-term content fix) plus `100df63` (permanent shared-constants fix); this iter performed the metadata transition only. Risk-scorer pipeline gate passed (commit=2 push=0 release=0 Very Low); architect / JTBD / style-guide / voice-tone gates do not fire (docs/problems/ excluded per CLAUDE.md). Commit landed at `02d6f7e`.

Per ADR-013 Rule 6 fail-safe and ADR-044 framework-resolution boundary; lazy classification is the regression metric.

## Per-call classification

No formal `AskUserQuestion` tool calls were made in this AFK iter (P135 / ADR-044 prohibits AskUserQuestion mid-loop in AFK; questions queue at `ITERATION_SUMMARY.outstanding_questions` for loop-end batched presentation). All decisions inside this iter were either framework-resolved (act per ADR / SKILL / policy) or did not warrant surfacing.

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | (no formal AskUserQuestion calls in AFK iter) | n/a | n/a |

**Lazy count: 0**
**Direction count: 0**
**Deviation-approval count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

## Notes

The R6 numeric gate continues at lazy=0 across 8 consecutive retros (2026-05-02 iter1 / iter2 / iter3, plus 2026-05-04, 2026-05-08, 2026-05-10, 2026-05-11-iter1, plus this one). Not approaching the >= 2 lazy across 3 consecutive retros trigger.

Per the AFK iter constraint shape (P135 / ADR-044), the ask-hygiene metric is naturally low under AFK because the loop forbids interactive questions; the discipline question is whether questions queue cleanly at `outstanding_questions` (verified: none queued this iter, framework resolved every decision; the transition was a mechanical Known Error to Verification Pending per ADR-022 with both fix commits already on `origin/master`).

## Framework-resolved decisions (no AskUserQuestion required)

- Verification Queue insertion position for P006: resolved by P150 / ADR-022 contract (oldest released-date at row 1). P006's 2026-04-15 release date is the oldest in the queue, so row 1 was the correct insertion position. Existing sort drift in the queue (newer entries at top from prior insertions) is a pre-existing P150 issue out of scope for this iter; not re-sorted.
- Whether to enrich the Fix Released section with explicit verification triggers: resolved by the iter brief's explicit instruction ("Document the verification trigger ... in the Fix Released section of the ticket body"). Acted directly.
- Commit-grain: resolved by ADR-014. Single commit covering the rename plus Status edit plus Fix Released enrichment plus README refresh plus notes-bullet update. Same shape as iter1's P012 transition (`c060820`) and the resume-branch P002 transition (`fe31e3d`).
