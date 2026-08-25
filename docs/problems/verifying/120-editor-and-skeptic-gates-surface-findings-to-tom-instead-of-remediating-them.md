# Problem 120: Editor and skeptic gates surface findings to Tom instead of remediating them, so their output becomes his review burden

**Status**: Verification Pending
**Reported**: 2026-08-04
**Priority**: 20 (Very High), Impact: 4 x Likelihood: 5, derived at capture from the description. Impact is 4 rather than 5 because no wrong output reaches readers (external review catches it) but the cost lands on the newsletter, which ADR-027 rates as the primary business surface. Likelihood is 5 because this fires on every edition by contract rather than by chance: the gates are non-blocking by design, so every finding they produce is routed to Tom.
**Origin**: internal
**Effort**: XL as delivered (re-rated 2026-08-05; captured as L). The capture estimate anticipated one new ADR plus loop wiring at two SKILL steps. Delivered scope ran to a new ADR plus amendment sections inside both amended ADRs, a new SKILL step plus routing changes at four call sites, a section 15.6 exemption, a phase-table and reference-list drift sweep that also closed ADR-042's outstanding confirmation criterion, edits to both gate agents, a full leader-persona re-grounding surfaced by the JTBD gate, a fix-time RFC, and a compendium refresh. The re-rate is recorded for audit only: the ticket is Verification Pending, so the WSJF status multiplier is 0 and it is excluded from dev-work ranking either way.
**WSJF**: n/a (Verification Pending, multiplier 0). At capture: 5.0 = (20 x 1.0) / 4.

## Description

The newsletter pipeline's editor and adversarial-skeptic gates are single-shot and non-blocking by design. They detect editorial defects correctly and then hand them to Tom rather than remediating them. Their findings therefore arrive as Tom's review feedback, which is the burden the gates were built to remove.

**Evidence: The Shift Issue 16, published 2026-08-03.**

The `wr-newsletter-editor` gate ran ONE round at finalise and returned `NEEDS_EDITORIAL_REVISION`. The ledger at `src/newsletters/published/leader/2026-08-03/2026-08-03.reviews.md` records the verdict as "Non-blocking per ADR 020". Its `EDITORIAL_CRAFT` weaknesses named three specific defects:

- fold-compression: "the opener previews Item 1's verdict almost verbatim"
- atwn-thesis-fit on two Also-worth-noting entries: "the hedge fund and the maths result connect to nothing in the edition's frame"
- audience-pointer-specificity: "the AI-unicorns note names no owner"

All three were then raised INDEPENDENTLY by Tom's external reviewer after the edition was publication-ready, in different words:

- "The navigation paragraph at the end of the opener spoils Item 2."
- "the hedge fund entry... the only one in the issue whose ask is 'have the distinction ready' rather than something to change in the stack"
- "Item 3's human angle is the only one still pointed away from the reader's team."

The gate found them first. The pipeline handed them to Tom instead of fixing them.

The `wr-newsletter-skeptic` gate (ADR-042, built under P116) carries the same contract. `SKILL.md` step 15.35 line 850: "The verdict is non-blocking save-but-revise (ADR-015, same semantics as the editor gate)", and line 852: "The skeptic does not auto-rewrite; Tom decides whether to revise the brief or override." It returned `WEAKNESSES_FOUND` on both the brief and the LinkedIn post this edition; neither was remediated before Tom saw the draft.

By contrast, every gate that HAS a remediation loop converged this edition without Tom's involvement: voice reached PASS, content-risk reached PASS after two REJECTED verdicts at `claims=high`, and cross-edition consistency returned SUPPORTED.

## Root cause

ADR-020 Considered Option 4 ("Iterating editor (multi-round loop, like sw-critic)") was REJECTED on a predicted failure mode:

> "the drafter's round-2 attempt is likely to over-correct or substitute one editorial weakness for another, not to address the original"

and the ADR closes that option with an explicit pre-registration:

> "If retrospective evidence shows iteration would help, a follow-up ADR can lift the loop."

**This session is that evidence, and it also settles the predicted failure mode empirically.** Six external review rounds were spent hand-remediating exactly the classes the editor and skeptic had already named. The predicted over-correction DID occur: each remediation round introduced new defects, including an unsourced generational inference added to a source-verbatim sentence, a directional pointer that said "below" for a section sitting above, an emphatic "do" the voice gate identified as the same reflex as the "actually" it had already removed four times, and two `claims=high` superlatives. But the surrounding gate battery caught every one of those regressions, and the draft converged to voice PASS plus content-risk PASS.

So ADR-020's fear was correct in its mechanism and wrong in its conclusion: iteration does over-correct, and the gate battery contains the over-correction. That is the specific finding that unblocks the pre-registered lift.

## Symptoms

Editorial defects that an internal gate has already named in writing are re-derived independently by Tom or the external reviewer after the edition is publication-ready, and fixed in rounds that occur outside the pipeline. Observed on Issue 16 across three distinct editor-craft axes simultaneously.

## Workaround

Tom reads the gate output in the reviews file and manually re-issues the findings as review feedback, or the external reviewer independently rediscovers them.

## Impact Assessment

- **Who is affected**: Tom (carries the remediation the gates were built to absorb); the external reviewer (spends rounds on already-detected defects).
- **Frequency**: every edition, by contract rather than by chance.
- **Severity**: no wrong output reaches readers, because the manual path catches it. The cost is Tom's review time and the review-round count per edition.
- **Analytics**: none.

## Root Cause Analysis

### Investigation Tasks

- [x] Draft the follow-up ADR that ADR-020 pre-registered, amending its single-shot decision and ADR-042's inherited non-blocking semantics. **Done 2026-08-05**: ADR-043 (Bounded editorial remediation loop for editor and skeptic gates). Amendment sections land inside both amended ADRs rather than only in the new one, so a reader hitting ADR-020's live Option-4 rejection or ADR-042's "no new loop machinery" clause finds the lift from there. ADR-020's amendment names four lifted clauses with Considered Option 4 leading, and records the finding that discharges its pre-registration: the predicted over-correction DID occur on Issue 16 and the surrounding gate battery contained all five instances.
- [x] Co-design the loop bounds with P113. **Done 2026-08-05**: one contract, both bounds. The START rule is the remediate-and-re-invoke step; the STOP rule is the one-round cap plus the residual-advisory exit. P113's fix item (a), editor batching, ships in the same commit because a one-round cap is only sufficient if the editor stops rationing findings. P113 is annotated with what landed and is left at Known Error pending a live-run measurement of rounds per edition.
- [x] Decide whether the skeptic gate takes the same loop or a different one. **Done 2026-08-05**: the same loop, with an asymmetric remediation contract. Remediation may only REDUCE a claim to what the cited source supports (narrow scope, downgrade certainty, correct direction, drop the claim). It may never add evidence, never introduce a source step 11.5 has not verified, and never strengthen a claim. A finding that cannot be remediated without new sourcing is stop-and-surface and does not consume the round. The loop also covers the skeptic on the LinkedIn post at 15.55, applied inline because the post is drafted after 15.37 runs.
- [x] Confirm the round cap interacts correctly with section 15.6's full-gate re-run discipline. **Done 2026-08-05**: three conditions, all stated at step 15.37 and in ADR-043. (a) The full gate set fires ONCE at loop exit, not per remediation round; inner rounds re-invoke only the two gates that raised findings. This is what makes the loop cheaper than the manual path it replaces, where each of Tom's edits already pays a full battery cycle. (b) Any edit the loop-exit pass forces re-marks the body dirty and re-enters 15.6 exactly as today. (c) The remediation counter is per body pass and does NOT reset, so a forced edit gets one more editor and skeptic look and remaining findings become residual advisories. Without (c) the loop either ping-pongs or silently skips the two gates on the re-edited body, and the silent skip is the P099 regression. Cross-edition consistency (11.4) and URL verification (11.5) are named explicitly because their triggers are claim-scoped, and skeptic remediation fires both by construction.

## Fix Strategy

- **Kind**: improve
- **Shape**: ADR plus skill plus agent
- **Target files**: `docs/decisions/043-bounded-editorial-remediation-loop-for-editor-and-skeptic-gates.proposed.md` (new); `docs/decisions/020-newsletter-editor-subagent.proposed.md` and `docs/decisions/042-newsletter-adversarial-skeptic-gate.proposed.md` (amendment sections); `.claude/skills/wr-newsletter/SKILL.md` (new step 15.37, routing changes at 15.25 / 15.35 / 15.55, section 15.6 exemption, preamble and phase-table sweep, step 16 save blocks, step 17 summary); `.claude/agents/wr-newsletter-editor.md` (batching hard rule plus leader persona re-grounding); `.claude/agents/wr-newsletter-skeptic.md` (loop-aware invocation note plus reduce-only Suggested-fix rule); `docs/decisions/README.md` (compendium).
- **Observed flaw**: both gates terminate at "surface to Tom", so correct findings become Tom's review burden instead of edits.
- **Edit summary**: a bounded one-round editorial remediation loop at step 15.37. Collect both gates' findings against the same body version, remediate minimally, re-invoke both gates once as a paired round, record anything still standing as an accepted residual advisory. Churn detection is orchestrator-side so the agents' pinned input contract is untouched; inner rounds run body-only so no review block ever enters the brief and round 2 cannot read round 1's verdict (ADR-026). No author-override arm: the drafter wrote the passage, so letting it self-certify an unremediated finding would recreate this defect with one extra step.
- **A JTBD finding folded in, and why it could not wait**: the editor's leader simulation reads JTBD-001, JTBD-002 and JTBD-003, all retired by ADR-041 on 2026-07-10, instead of the live JTBD-005. The drift was already visible in production: the 2026-07-13 published reviews file records the editor scoring against a "JTBD-005 awareness-shift and JTBD-003 board-ammunition" hybrid. While the gate was advisory this was noise Tom filtered; the loop turns findings into applied edits with no override arm, so a mis-grounded `WOULD_FORWARD` finding would automatically push the body back toward the funnel framing ADR-041 retired. The whole scoring path is swept, not just the read-list, and the 15-minute read-through threshold tightens to JTBD-005's "a few minutes" so the axis is not left calibrated to a retired job.
- **Evidence**: The Shift Issue 16 (2026-08-03), three editor findings discarded then independently re-raised by the external reviewer; skeptic `WEAKNESSES_FOUND` on both brief and LinkedIn post, neither remediated.
- **Reviews**: architect PASS and JTBD PASS (2026-08-05), each across three passes. The architect surfaced the omitted ADR-020 Option-4 clause and the phase-table drift; JTBD surfaced the retired-job grounding and the read-time threshold.

## RFCs

| RFC | Status | Title |
|-----|--------|-------|
| RFC-002 | proposed | Wire a bounded editorial remediation loop into the wr-newsletter editor and skeptic gates |

## Fix Released

Shipped 2026-08-05 as ADR-043 plus the SKILL and agent wiring above. Awaiting user verification.

**Release vehicle**: the fix commit itself. This repository is `private: true` with no published package, so there is no `.changeset/` entry and no npm release to point at. The transition ran Open to Known Error to Verification Pending in a single commit per ADR-014, because the root cause was already documented at capture and the fix shipped in the same change.

**What to look for on the next `/wr-newsletter` run**: the edition's `.reviews.md` carries an `## Editorial Remediation Loop` section recording rounds spent and any residual advisories. The fix is working if editor and skeptic findings that would previously have arrived as Tom-summary items instead show as remediated in the body, with only genuinely hard cases (chiefly skeptic findings that need new sourcing) surfacing as residuals. It is NOT working if Tom's external review still re-derives a class the gates named, or if the loop runs more than one round per body pass.

**Not exercised in this session.** No edition ran through the loop; this is authored-and-reviewed, not observed. The verification is a live run, and it is shared with P113, whose own symptom (rounds per edition) is measured from the same block.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P113, P116, P117, P099

## Observed 2026-08-25: the stated failure test fired

The Fix Released section names both directions. It is working if editor and skeptic findings show as remediated in the body with only genuinely hard cases surfacing as residuals. It is "NOT working if Tom's external review still re-derives a class the gates named, or if the loop runs more than one round per body pass."

The remediating half worked. Editor and skeptic findings were acted on in the body across the Issue 19 finalise rather than arriving as Tom-summary items, and exactly three findings surfaced as residuals, all of them cross-boundary placement calls Tom ruled on.

The round count did not. That edition's record opens "the finalise pass ran to twenty-four", against a criterion of one round per body pass. That is the ticket's own not-working condition, met by a factor of twenty-four.

Two things stop this being a simple regression. The rounds were run under a standing instruction to keep going until the gates stopped finding defects, which is not the loop's default behaviour. And the late rounds kept earning their cost: round 15 caught a factual inversion that would have published, and rounds 22 to 24 caught a fairness problem, a broken contrast and an over-claim, so the rounds were not churn.

What that means for the criterion is the open question. Either one-round-per-body-pass is the wrong measure of this fix, in which case the criterion needs replacing rather than the fix reopening, or the loop genuinely does not converge and P113's round economics is the ticket that owns it. Left in Verification Pending pending that call; the round count is recorded here so the next verification attempt does not have to re-derive it.

## Related

- **P113** (`docs/problems/known-error/113-newsletter-review-gate-loop-editor-one-nit-per-pass.md`): sibling on the same knob, opposite bound. P113 wants a STOP rule because the editor treadmills; this wants a START rule because its findings are not acted on. P113 already records the same non-blocking fact ("it surfaces to Tom; it does not block the save, but the skill gives no guidance on when to accept residual advisories and stop"). The `wr-itil:hang-off-check` arbitration (2026-08-04) returned PROCEED_NEW and recommended the next `/wr-itil:review-problems` cluster pass consider promoting a common parent for the loop contract.
- **P116** (`docs/problems/verifying/116-newsletter-gates-lack-adversarial-ceiling-gate-external-review-still-finds-substance-issues.md`): built the adversarial skeptic gate under ADR-042. Its root cause was capability absence ("no gate owns thesis-truth"); this ticket is post-delivery discovery that the shipped gate's non-blocking contract prevents its findings being acted on. **This session is material to P116's verification**: the gate shipped and the external-review burden did not drop, because a gate that surfaces findings to Tom relocates his review load rather than reducing it.
- **P117** (`docs/problems/verifying/117-tighten-newsletter-gate-prompts-for-lower-frequency-external-review-classes.md`): inverts the failure mode on a shared signal. P117's premise was that the editor's `atwn-thesis-fit` axis MISSES through-line drift; the Issue 16 evidence is that P117's delivered per-bullet ATWN sweep CAUGHT the two off-thesis entries and the pipeline discarded the finding. Detection half verified; remediation half is this ticket.
- **P099** (`docs/problems/known-error/099-newsletter-post-finalise-edits-dont-rerun-full-gate-set.md`, path corrected 2026-08-05; the capture-time reference said `verifying/`): orthogonal grain. Section 15.6 governs re-gating after an edit is made; this governs whether a gate finding produces an edit at all.
- **ADR-020** (`docs/decisions/020-newsletter-editor-subagent.proposed.md`): line 41 carries the Option-4 rejection and the "follow-up ADR can lift the loop" pre-registration verbatim (verified on disk 2026-08-04).
- **ADR-042** (`docs/decisions/042-newsletter-adversarial-skeptic-gate.proposed.md`): inherits the non-blocking semantics.
- **ADR-015**: save-but-do-not-publish semantics that the non-blocking contract cites.
- Captured via `/wr-itil:capture-problem` during the Issue 16 retrospective (2026-08-04), against Tom's framing: "what would we need to change to require less feedback from me and the external reviewer".
