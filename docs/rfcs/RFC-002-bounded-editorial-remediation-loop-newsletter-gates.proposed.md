---
status: proposed
rfc-id: bounded-editorial-remediation-loop-newsletter-gates
reported: 2026-08-05
human-oversight: unconfirmed
decision-makers: [Tom Howard]
problems: [P120]
adrs: [043-bounded-editorial-remediation-loop-for-editor-and-skeptic-gates, 020-newsletter-editor-subagent, 042-newsletter-adversarial-skeptic-gate]
jtbd: [JTBD-005, JTBD-200, JTBD-203, JTBD-205]
stories: []
---

# RFC-002: Wire a bounded editorial remediation loop into the wr-newsletter editor and skeptic gates

**Status**: proposed
**Reported**: 2026-08-05
**Problems**: P120
**ADRs**: ADR-043 (Bounded editorial remediation loop for editor and skeptic gates), ADR-020 (Newsletter editor subagent), ADR-042 (Newsletter adversarial skeptic gate)
**JTBD**: JTBD-005, JTBD-200, JTBD-203, JTBD-205

## Summary

Route the newsletter editor gate (SKILL step 15.25) and adversarial-skeptic gate (steps 15.35 and 15.55) through a bounded one-round remediation loop instead of terminating their findings at the Tom-summary, per ADR-043. Ships with the editor's leader persona re-grounding and the batching invariant the cap depends on.

## Driving problem trace

**P120 (Editor and skeptic gates surface findings to Tom instead of remediating them).** Both gates are single-shot and non-blocking, so they detect editorial defects correctly and then hand them to Tom rather than fixing them. On The Shift Issue 16 the editor named three defects (fold-compression, `atwn-thesis-fit` on two Also-worth-noting entries, `audience-pointer-specificity`) and all three were re-raised independently by Tom's external reviewer after the edition was publication-ready. The skeptic returned `WEAKNESSES_FOUND` on both the brief and the LinkedIn post the same edition; neither was remediated. P120's root cause is that ADR-020 rejected an iterating editor on a predicted over-correction failure mode, and ADR-042 inherited the same posture, but on Issue 16 the over-correction did happen AND the surrounding gate battery caught every instance the session produced, which is exactly the retrospective evidence ADR-020 pre-registered as the condition for lifting the loop.

This RFC also carries the fix half of **P113 (editor treadmills one nit per pass; section 15.6 re-runs all gates per edit)**, which is the opposite bound on the same knob. P113 is not a `problems:` trace here because it is not the driving problem: its two Fix Strategy items land as a consequence of designing P120's loop with a stop rule, and P113 stays at Known Error pending its own live-run measurement.

## Scope

The fix is a new SKILL step **15.37**, an editorial remediation loop that sits between the skeptic gate (15.35) and cognitive accessibility (15.4).

The loop collects the editor's `EDITORIAL_FINDINGS` and `EDITORIAL_CRAFT` weaknesses plus the skeptic's `SKEPTIC_REVIEW` weaknesses, all against the same body version; remediates each finding minimally at the passage it names; then re-invokes both gates once as a paired round against the revised body. Anything still standing after that round is recorded as an accepted residual advisory in the `.reviews.md` sibling and surfaced in the Tom-summary. There is no second round and no author-override arm, because the drafter is the agent that wrote the passage and self-certification would recreate the defect with one extra step.

**Implementation approach and the constraints it has to respect:**

- **Churn detection is orchestrator-side.** The skill compares round-2 findings to round-1 by axis and passage. The agents stay fresh-context with their pinned three-input contract untouched, and inner rounds run against the body only, so no review block ever enters the brief and round 2 cannot read round 1's own verdict (ADR-026).
- **The skeptic's remediation contract is asymmetric.** It may only reduce a claim to what the cited source supports: narrow scope, downgrade certainty, correct direction, or drop it. It may never add evidence, introduce an unverified source, or strengthen a claim. Findings needing new sourcing are stop-and-surface and do not consume the round. This is the JTBD-205 (Trust, Shipped vs Demo) encoding and it protects JTBD-203 (Peer Validation).
- **The section 15.6 cost bound is three conditions.** The full gate battery fires once at loop exit rather than per remediation round; any edit that pass forces re-marks the body dirty as normal; and the remediation counter does not reset, so a forced edit gets one more editor and skeptic look before remaining findings become residuals. Without the third condition the loop either ping-pongs or silently skips the two gates on the re-edited body, and the silent skip is the P099 regression. Cross-edition consistency (11.4) and URL verification (11.5) are checked explicitly because their triggers are claim-scoped and skeptic remediation fires both by construction.
- **Remediation is bounded by ADR-032's editorial shape.** A finding whose only remediation would drop, merge, or promote an item across the deep-items / Also-worth-noting boundary is a residual advisory, not an automatic edit.
- **Two preconditions ship with the loop rather than after it.** The editor must return all findings in a single pass, because a one-round cap is only sufficient if it is not rationing findings (P113 fix item a). And the editor's leader simulation must stop reading JTBD-001, JTBD-002 and JTBD-003, retired by ADR-041, instead of the live JTBD-005: while the gate was advisory a mis-grounded finding was noise Tom filtered, but the loop turns findings into applied edits, so a `WOULD_FORWARD` finding grounded in the retired consulting-funnel jobs would automatically push the body back toward framing ADR-041 removed.

## Stories

`stories: []`. This repository has no story tier: there is no `docs/stories/` and no `docs/story-maps/` directory, so the ADR-089 requirement that every RFC carries at least one story on a story map has no surface to land on here. The work also lands as a single commit alongside the P120 fix rather than as a sequence, so a retrospective story decomposition would be recording ceremony rather than sequencing work. Authored is not working: the loop's first live-run validation is ADR-043 confirmation criterion 11.

Standing up the story tier in this repository is a separate decision with its own cost, and it is queued for Tom rather than taken unilaterally as a side effect of a newsletter-pipeline fix. Until then this RFC is a fix-time trace artefact satisfying the I13 propose-fix gate, not a work-breakdown vehicle.

## Commits

(rendered from `git log --grep "Refs: RFC-002"` by `/wr-itil:manage-rfc` and `wr-itil-reconcile-rfcs`.)

## Related

- **ADR-043** carries the decision, the invocation-budget re-assertion, and the reassessment criteria.
- **ADR-020** and **ADR-042** carry `## Amendment 2026-08-05 (P120)` sections naming the lifted clauses.
- **P113** (`docs/problems/known-error/113-newsletter-review-gate-loop-editor-one-nit-per-pass.md`): the opposite bound, co-designed here; both its Fix Strategy items land with this change.
- **P099** (`docs/problems/known-error/099-newsletter-post-finalise-edits-dont-rerun-full-gate-set.md`): owns the dirty-body re-gate discipline this loop composes with.
- **P116** and **P117** (both `docs/problems/verifying/`): the gates whose detection halves shipped and whose remediation halves this closes.
- Captured via `/wr-itil:capture-rfc --fix-time` from the I13 propose-fix gate; born `human-oversight: unconfirmed`, ratified at `/wr-itil:manage-rfc RFC-002 accepted`.
