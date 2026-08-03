# Problem 120: Editor and skeptic gates surface findings to Tom instead of remediating them, so their output becomes his review burden

**Status**: Open
**Reported**: 2026-08-04
**Priority**: 20 (High), Impact: 4 x Likelihood: 5, derived at capture from the description. Impact is 4 rather than 5 because no wrong output reaches readers (external review catches it) but the cost lands on the newsletter, which ADR-027 rates as the primary business surface. Likelihood is 5 because this fires on every edition by contract rather than by chance: the gates are non-blocking by design, so every finding they produce is routed to Tom.
**Origin**: internal
**Effort**: L, derived at capture. A follow-up ADR amending two ratified decisions (ADR-020 single-shot, ADR-042 non-blocking), plus loop wiring in SKILL.md steps 15.25 and 15.35, plus round-cap and stop-rule design co-ordinated with P113. Comparable to the P116 build (new gate plus ADR plus rubric plus SKILL wiring), also rated L.

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

- [ ] Draft the follow-up ADR that ADR-020 pre-registered, amending its single-shot decision and ADR-042's inherited non-blocking semantics.
- [ ] Co-design the loop bounds with P113. P113 is the UPPER bound (a stop rule so the editor stops treadmilling on one nit per pass); this ticket is the LOWER bound (a start rule so findings are remediated at all). One loop contract, two bounds; designing either alone will fight the other.
- [ ] Decide whether the skeptic gate takes the same loop or a different one. Its findings are claim-evidence calibration rather than presentation shape, so the over-correction risk profile differs.
- [ ] Confirm the round cap interacts correctly with section 15.6's full-gate re-run discipline, which is what makes each remediation round expensive (see P113 cause 2).

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P113, P116, P117, P099

## Related

- **P113** (`docs/problems/known-error/113-newsletter-review-gate-loop-editor-one-nit-per-pass.md`): sibling on the same knob, opposite bound. P113 wants a STOP rule because the editor treadmills; this wants a START rule because its findings are not acted on. P113 already records the same non-blocking fact ("it surfaces to Tom; it does not block the save, but the skill gives no guidance on when to accept residual advisories and stop"). The `wr-itil:hang-off-check` arbitration (2026-08-04) returned PROCEED_NEW and recommended the next `/wr-itil:review-problems` cluster pass consider promoting a common parent for the loop contract.
- **P116** (`docs/problems/verifying/116-newsletter-gates-lack-adversarial-ceiling-gate-external-review-still-finds-substance-issues.md`): built the adversarial skeptic gate under ADR-042. Its root cause was capability absence ("no gate owns thesis-truth"); this ticket is post-delivery discovery that the shipped gate's non-blocking contract prevents its findings being acted on. **This session is material to P116's verification**: the gate shipped and the external-review burden did not drop, because a gate that surfaces findings to Tom relocates his review load rather than reducing it.
- **P117** (`docs/problems/verifying/117-tighten-newsletter-gate-prompts-for-lower-frequency-external-review-classes.md`): inverts the failure mode on a shared signal. P117's premise was that the editor's `atwn-thesis-fit` axis MISSES through-line drift; the Issue 16 evidence is that P117's delivered per-bullet ATWN sweep CAUGHT the two off-thesis entries and the pipeline discarded the finding. Detection half verified; remediation half is this ticket.
- **P099** (`docs/problems/verifying/099-newsletter-post-finalise-edits-dont-rerun-full-gate-set.md`): orthogonal grain. Section 15.6 governs re-gating after an edit is made; this governs whether a gate finding produces an edit at all.
- **ADR-020** (`docs/decisions/020-newsletter-editor-subagent.proposed.md`): line 41 carries the Option-4 rejection and the "follow-up ADR can lift the loop" pre-registration verbatim (verified on disk 2026-08-04).
- **ADR-042** (`docs/decisions/042-newsletter-adversarial-skeptic-gate.proposed.md`): inherits the non-blocking semantics.
- **ADR-015**: save-but-do-not-publish semantics that the non-blocking contract cites.
- Captured via `/wr-itil:capture-problem` during the Issue 16 retrospective (2026-08-04), against Tom's framing: "what would we need to change to require less feedback from me and the external reviewer".
