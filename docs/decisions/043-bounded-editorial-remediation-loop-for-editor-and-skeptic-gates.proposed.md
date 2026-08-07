---
status: "proposed"
first-released:
date: 2026-08-05
human-oversight: confirmed
oversight-date: 2026-08-05
decision-makers: [Tom Howard, Claude]
consulted: [wr-architect:agent, wr-jtbd:agent, wr-voice-tone:agent]
informed: []
reassessment-date: 2026-10-05
amends: [020-newsletter-editor-subagent, 042-newsletter-adversarial-skeptic-gate]
amended-by: [044-cross-edition-shape-as-a-fresh-context-subagent-gate, 046-skip-the-agent-re-invocation-when-the-artefact-is-unchanged]
composes-with: [015-reader-respect-and-gate-rejection-policy, 017-ai-brief-prep-and-finalise-phases, 032-newsletter-editorial-discipline-policy]
related: [012-ai-generated-content-review-gates, 024-url-verification-gate-in-wr-newsletter, 025-pass-with-author-overrides-verdict-for-sw-critic, 026-reviews-and-meta-content-to-sibling-files, 035-critic-rubric-shape-is-strengths-weaknesses-plus-context, 038-cross-edition-thesis-consistency-check-as-fresh-context-subagent-gate, 041-retire-consulting-funnel-repurpose-as-the-shift-hub]
---

# Editor and skeptic gates gain a bounded editorial remediation loop

> Cite this decision as "ADR-043 (Bounded editorial remediation loop for editor and skeptic gates)" on first mention. Several retro files in `docs/retros/` carry bare `ADR-043` references to the upstream `wr-retrospective` plugin's own ADR-043, a different ID namespace. 043 is the correct next local ID; naming it on first mention keeps the two apart.

## Context and Problem Statement

The `wr-newsletter` pipeline's editor gate (ADR-020, SKILL.md step 15.25) and adversarial-skeptic gate (ADR-042, steps 15.35 and 15.55) are single-shot and non-blocking. They detect editorial defects correctly and then hand them to Tom rather than remediating them. Their findings arrive as Tom's review feedback, which is the burden the gates were built to remove.

Problem 120 (`docs/problems/known-error/120-editor-and-skeptic-gates-surface-findings-to-tom-instead-of-remediating-them.md`) records the evidence. The Shift Issue 16, published 2026-08-03, ran the editor once at finalise. It returned `NEEDS_EDITORIAL_REVISION` and named three specific defects: a fold-compression problem (the opener previewed Item 1's verdict almost verbatim), an `atwn-thesis-fit` problem on two Also-worth-noting entries, and an `audience-pointer-specificity` problem on a third. All three were then raised independently by Tom's external reviewer after the edition was already publication-ready. The gate found them first; the pipeline handed them to Tom instead of fixing them. The skeptic returned `WEAKNESSES_FOUND` on both the brief and the LinkedIn post the same edition; neither was remediated before Tom saw the draft.

By contrast, every gate that HAS a remediation loop converged that edition without Tom's involvement: voice reached PASS, content-risk reached PASS after two `REJECTED` verdicts at `claims=high`, and cross-edition consistency returned SUPPORTED.

ADR-020 rejected an iterating editor (its Considered Option 4) on a predicted failure mode, that "the drafter's round-2 attempt is likely to over-correct or substitute one editorial weakness for another, not to address the original", and closed the option with an explicit pre-registration: *"If retrospective evidence shows iteration would help, a follow-up ADR can lift the loop."* ADR-042 inherited the same single-shot, non-blocking posture for the skeptic ("No new multi-round loop machinery is added").

The Issue 16 session is that retrospective evidence, and it also settles the predicted failure mode empirically. Six external review rounds were spent hand-remediating exactly the classes the editor and skeptic had already named. **The predicted over-correction did occur**: the remediation rounds introduced an unsourced generational inference on a source-verbatim sentence, a directional pointer that said "below" for a section sitting above, an emphatic "do" that the voice gate identified as the same reflex as an "actually" it had already removed four times, and two `claims=high` superlatives. **And the surrounding gate battery caught every one of them.** The draft converged to voice PASS plus content-risk PASS.

ADR-020's fear was therefore correct in its mechanism and wrong in its conclusion: iteration does over-correct, and in that session the gate battery contained the over-correction. That is the finding that unblocks the pre-registered lift.

## Decision Drivers

- **A routing defect, not a calibration defect.** ADR-020 reassessment criterion 4 fires when Tom repeatedly overrides `NEEDS_EDITORIAL_REVISION` without rewriting, and its remedy is recalibrating the persona grounding or relaxing the verdict mechanic. Issue 16 is not that case. The findings were correct and they were acted on, by Tom manually and by his external reviewer independently, after the pipeline had already discarded them. The defect is where a finding is routed, not whether it was right. Recalibrating a gate that is already accurate would make things worse.
- **Two bounds on one knob.** Problem 113 (`docs/problems/known-error/113-newsletter-review-gate-loop-editor-one-nit-per-pass.md`) is the opposite bound on the same contract: the editor treadmills one rhythm nit per pass, and section 15.6 re-runs every gate on every body edit, so a single one-line fix costs a full gate cycle. P113 wants a STOP rule; P120 wants a START rule. Designing either alone would fight the other, so this decision carries both.
- **The loop should cost less than the status quo, not more.** Today Tom remediates these findings by hand, and each of his edits already re-enters the full gate set via section 15.6. Moving that remediation inside the pipeline, where a round re-invokes only the two gates that raised the findings, should cost less gate traffic than the manual path it replaces. That is a design-time deduction, not a measurement: nothing has run yet, and confirmation criterion 11 is where it gets checked.
- **Containment held once, under observation.** The over-correction ADR-020 feared is real, and on Issue 16 the voice, content-risk, critic, cross-edition and URL gates caught every instance the session produced. One edition is not a guarantee, but it is the first time the mechanism has been watched end to end. The loop does not need to prevent over-correction; it needs to run the battery over the corrected body before the draft is declared done.
- **Truth calibration is not editorial taste.** The skeptic's findings are claim-evidence calibration. Remediating them by strengthening a claim, or by adding evidence, would be the worst available failure of an automated loop. The remediation contract has to be asymmetric.
- **An applied finding must be correctly grounded.** While the gates were advisory, a mis-grounded finding was noise Tom filtered out. A loop turns findings into edits, so the grounding has to be right before the loop ships. See the persona-grounding correction below.

## Considered Options

1. **A bounded editorial remediation loop, capped at one round, covering the editor and skeptic together** (chosen). Findings from both gates are remediated in a single pass, both gates re-invoke once against the revised body, and anything still standing becomes a recorded residual advisory. The full gate battery runs once at loop exit.
2. **Status quo: keep both gates single-shot and non-blocking.** Rejected: this is the defect P120 documents. It routes correct findings to the reader of last resort and burns external review rounds on defects an internal gate already named in writing.
3. **Unbounded remediation loop, iterating until both gates PASS.** Rejected: it re-creates P113's treadmill without a stop rule, and it gives a gate that can always find one more craft nit an unbounded claim on the invocation budget. Both gates are advisory by design; a gate that cannot be satisfied must not be able to hold the pipeline.
4. **Editor-only loop; leave the skeptic single-shot.** Rejected: the Issue 16 evidence names the skeptic on both the brief and the LinkedIn post, and ADR-042's corpus analysis found claim-evidence over-claim in 6 of the last 7 external reviews. A brief-only, editor-only loop closes the ticket halfway and leaves the highest-frequency external-review class un-remediated.
5. **Multi-round loop with an author-override arm**, where the drafter marks a finding as an accepted editorial choice and the loop stops. Rejected on two grounds. ADR-042 explicitly declines to reintroduce ADR-025's `PASS_WITH_AUTHOR_OVERRIDES` mechanism on the skeptic. And "the drafter" is the agent that wrote the passage: an agent self-certifying that its own unremediated finding is acceptable is the confirmation-bias failure that ADR-016, ADR-018, ADR-020 and ADR-042 all exist to break. It would recreate P120 with one extra step and a silent swallow.

## Decision Outcome

Chosen option: **"A bounded editorial remediation loop, capped at one round, covering the editor and skeptic together."**

### The loop

A new SKILL.md step **15.37** runs after the skeptic (15.35) and before cognitive accessibility (15.4). It is skipped entirely when the step-15 critic returned `VERDICT: REJECTED`, because neither upstream gate ran.

1. Collect the editor's `EDITORIAL_FINDINGS` plus `EDITORIAL_CRAFT` weaknesses and the skeptic's `SKEPTIC_REVIEW` weaknesses, all taken against the same body version.
2. If both gates returned PASS, the loop is a no-op; proceed to 15.4.
3. Otherwise remediate each finding minimally: address the named defect at the named passage, and do not restructure the piece around it.
4. Re-invoke **both** gates once against the revised body, as one paired round. **ADR-046 (Skip the agent re-invocation when the artefact is unchanged) conditions this: the agent re-invocation is skipped when the artefact is byte-identical to the version findings were collected against, and a declined look still consumes the counter.**
5. Any finding still standing after that round is recorded as an **accepted residual advisory** and surfaced in the Tom-summary. There is no second round.

**Round cap: one.** This is the cheapest bound that fixes the routing defect. The gates are advisory, so an unremediated finding after one round lands in front of Tom exactly as it does today. The terminal state is the status quo; the loop adds only the attempt that was previously missing. Raising the cap is a live reassessment trigger below, not a decision this ADR needs to pre-empt.

**No author-override arm.** Residual advisories are the only exit for an unremediated finding, and recording one is mandatory on every exit path, not only at the cap. This satisfies ADR-012 confirmation criterion 1 and ADR-015 criterion 5 without reintroducing the ADR-025 override mechanism ADR-042 declined.

### Churn detection is orchestrator-side

Both agents remain fresh-context, and their pinned input contract (`artifact_path` plus `persona` plus `edition_number`, ADR-020 confirmation criterion 2) is **unchanged**. The skill, not the agent, compares round-2 findings against round-1 findings by axis and passage to decide what counts as remediated and what is residual.

Inner-loop re-invocations run against the **body only**. No `EDITOR_REVIEW` or `SKEPTIC_REVIEW` block is written into the brief at any point in the loop; the blocks land in the `.reviews.md` sibling at step 16, per ADR-026. This preserves the fresh-context discipline ADR-026 exists to protect: round 2 must not read round 1's own verdict off the artifact.

### The skeptic differential

Skeptic findings are truth calibration, not presentation shape, and their remediation contract is asymmetric:

- Remediation **reduces** a claim to what the cited source supports. It narrows scope, downgrades certainty, or corrects direction.
- Remediation **never** adds evidence, never introduces a source that was not already cited and verified, and never strengthens a claim to meet the assertion.
- A finding that cannot be remediated without new sourcing is **stop-and-surface**: record it as a residual advisory immediately. It does not consume the round. **That is a finding-level rule; ADR-046 governs the loop level, where a declined look does consume the round.**

This is a direct encoding of JTBD-205 (Trust, Shipped vs Demo), whose desired outcomes are clear labelling of demo versus benchmark versus shipped-in-production, an honest "not yet", and a default skeptical stance that still lets through what is genuinely ready. It also protects JTBD-203 (Peer Validation), which needs concrete non-vendor evidence.

### Cost bound and the section 15.6 interaction

The section 15.6 dirty-body discipline (P099) says any post-gate body edit re-enters the FULL gate set. That rule is preserved. What this decision pins is **when** it fires relative to the loop:

- **(a)** The loop's remediation edits do not each trigger a full re-gate. The full pass runs **once**, against the final post-remediation body, at loop exit. Inner rounds re-invoke only the editor and the skeptic.
- **(b)** Any edit that the loop-exit full pass itself forces, whether a voice FAIL, a content-risk `REJECTED`, or a critic `WEAKNESSES_FOUND`, re-marks the body dirty and re-enters section 15.6 exactly as today. This is the containment mechanism, and P120's evidence shows it working.
- **(c)** The remediation counter is **per body pass and does not reset**. If the loop-exit full pass forces an edit, the editor and skeptic re-run once against the re-edited body and any remaining findings go straight to residual advisory. Without this the loop either ping-pongs or silently skips the editor and skeptic on the re-edited body, and the silent skip is the P099 regression.

Two section 15.6 rows have claim-scoped triggers that skeptic remediation fires **by construction**, so the loop names them rather than relying on a "body changed" test:

- **Cross-edition consistency (11.4, ADR-038)** triggers on a thesis-bearing line changing. Skeptic thesis-truth remediation changes exactly those lines.
- **URL verification (11.5, ADR-024)** triggers on a URL or a URL-anchored claim changing. The skeptic differential, reducing a claim to what the source supports, changes URL-anchored claims by definition. ADR-024's per-URL verdict table stays required in the Tom-summary.

### Scope: brief body and LinkedIn post

The loop covers the editor and skeptic on the brief body (15.25 and 15.35) **and** the skeptic on the LinkedIn post (15.55), under the same one-round rule applied inline at 15.55. The post is drafted at 15.5, after 15.37 has run, so it cannot route back through 15.37; the inline application is how the post gets the same treatment. ADR-042 gave the post its own invocation precisely because two Issue-13 misses lived there, and P120's evidence records `WEAKNESSES_FOUND` on both surfaces the same edition. A brief-only loop would close the ticket halfway.

### Remediation is bounded by ADR-032

The loop's remediations stay inside the editorial shape ADR-032 owns: the three-deep-items plus Also-worth-noting structure, item proportionality, and the provenance and CTA elements. A finding whose only available remediation would drop, merge, or promote an item across that boundary is a residual advisory, not an automatic edit. The pre-save structural lint at step 16 remains the backstop, but it runs after the loop and must not be the first thing to notice a shape breach.

### Residual advisories survive the phase boundary

Under ADR-017, a finalise-time gate can be a no-op when nothing material changed since prep. Prep-time residual advisories carry forward **with their residual status intact** and still appear in the finalise Tom-summary. A prep-accepted residual that evaporates at the phase boundary would silently ship an unremediated finding, which is P120 in a different costume.

### Leader persona grounding corrected in the same change

The editor agent grounds its leader simulation in JTBD-001 (Awareness), JTBD-002 (Engagement) and JTBD-003 (Evaluation). All three were **retired by ADR-041** on 2026-07-10, along with JTBD-004. The live leader job is **JTBD-005 (Stay Ahead of the Shift)**, must-have, ratified 2026-07-12, which the editor has never read. These are not stale labels: the agent's `WOULD_FORWARD` criterion turns on "ammunition to justify the engagement" per JTBD-003, and Windy Road no longer sells an engagement. The drift is already visible in production: the 2026-07-13 published reviews file records the editor scoring against a "JTBD-005 awareness-shift and JTBD-003 board-ammunition" hybrid, attaching a retired job's framing to a live job's ID.

While the gate was advisory this was tolerable, because Tom filtered the findings before anything reached the body. The loop removes that filter: findings become applied edits with no override arm, and the residual arm only catches findings that *survive* remediation, not findings that should never have been raised. A mis-grounded `WOULD_FORWARD` finding would automatically push The Shift's body back toward the funnel framing ADR-041 retired. That is why the correction ships in this commit rather than as follow-up work.

The correction covers the whole scoring path, not just the read-list:

- The leader read-list becomes `docs/jtbd/engineering-leader/persona.md` plus `JTBD-005-stay-ahead-of-the-shift.proposed.md`. The developer read-list gains `JTBD-205-trust-shipped-vs-demo.proposed.md`, closing a pre-existing ADR-020 criterion-2 breach: JTBD-205 is must-have tier and was absent entirely.
- The pre-read constraints sentence becomes persona-conditional, so each resolution seeds itself from its own documented read-time budget: a few minutes for `leader` per JTBD-005, under 10 minutes for `developer` per JTBD-200. The retired-era terms (share-worthy ammunition, awareness shift, board-defence ammunition) are removed.
- `WOULD_OPEN`, `WOULD_READ_THROUGH` and the `opener-authenticity` gloss are re-grounded on JTBD-005's desired outcomes: a weekly read short enough to finish in a few minutes; what changed at the frontier, filtered for teams shipping production code; the "so what" for delivery, tooling and risk decisions; and confidence nothing actionable was missed. `WOULD_READ_THROUGH`'s 15-minute tentative threshold tightens to JTBD-005's "a few minutes", which is what makes the rewrite real rather than a citation swap that leaves the axis calibrated to a retired job.
- The `WOULD_FORWARD` axis rationale drops its JTBD-002 citation and confines JTBD-203 to the developer half, correcting a latent scope error: JTBD-203 is a developer job and was being cited to justify the axis for both personas.
- `WOULD_FORWARD`'s leader criterion drops the board-ammunition framing rather than leaving it unsourced, because JTBD-005 carries no positive forward-or-share outcome. It is re-grounded on JTBD-005's "confidence I am not missing a shift my team should be acting on" plus the persona's credential-sensitivity constraint, "cannot forward content that implies their own team is behind". That absence is a gap in the job file, not a defect in the agent, and it is carried as a reassessment criterion below.

ADR-020 confirmation criterion 2 pins the read-list, so the correction lands in ADR-020's amendment section too.

### Batching is a precondition, not a nicety

One round is only sufficient if the editor returns everything it has in a single pass. P113 observed roughly 8 consecutive single-nit editor verdicts across one session, and the agent file does not specify one-nit-per-pass anywhere, so the treadmill is emergent behaviour rather than a contract. The editor's `## Hard rules` gains an explicit invariant: return ALL findings on every axis in a single pass, never one nit at a time. This is P113 fix-strategy item (a), and it ships with this decision because the cap depends on it.

## Invocation budget re-assertion

> **HISTORICAL FRAMING, corrected 2026-08-07. See `## Amendment 2026-08-07 (P121, P122)` clause 5 at the end of this file.** This section describes a ceiling "set" at roughly 15 and "breached" at 25. There is no ceiling: ADR-020 reassessment criterion 6 is a trigger naming two responses. The question this section leaves open was answered on 2026-08-07 by re-asserting the budget. Do not re-open it.

ADR-020 reassessment criterion 6 set a ceiling of roughly 15 subagent invocations per issue and instructed the team to "explicitly re-assert the budget or trim a gate" when it is crossed. The honest tally says the ceiling was **already breached before this change**:

| Per phase, brief body | Invocations |
|---|---|
| voice (13) plus content-risk (14) | 2 |
| newsletter critic (15) | up to 3 |
| editor (15.25) plus skeptic (15.35) plus cog-a11y (15.4) | 3 |
| cross-edition consistency (11.4) | 1 |
| **per phase** | **up to 9** |
| prep plus finalise | up to 18 |
| finalise-only: LinkedIn voice (15.5) plus LinkedIn skeptic (15.55) | 2 |
| **per issue, before this decision** | **up to ~20** |

ADR-042's "well inside the ceiling" claim counted only its own +2 delta, not the cumulative total including cog-a11y and ADR-038's gate. This decision adds one remediation round of editor plus skeptic per phase (+2 per phase, +4 per issue) plus one skeptic re-invocation on the LinkedIn post, taking the worst case to roughly **25 per issue**.

The one-round cap is chosen partly to keep that delta at its minimum. Whether ~15 is replaced by an explicit higher ceiling, or retired in favour of the wall-clock metric it was proxying (ADR-017 confirmation criterion 3's under-one-hour finalise session, which is what hurts), is **direction Tom has not yet given**. This decision records the true tally and the breach rather than restating a ceiling it knows to be dead; the reassessment criteria below carry the open question.

## Consequences

### Good

- Findings the pipeline already produces get acted on inside the pipeline. The Issue 16 defects map one-to-one onto ratified reader outcomes: `fold-compression` onto JTBD-005's few-minute read and JTBD-200's under-10-minutes, `atwn-thesis-fit` onto JTBD-200's "excluded on purpose, not missed", `audience-pointer-specificity` onto JTBD-005's "so what" for delivery, tooling and risk decisions. Remediating them is the reader-aligned behaviour; discarding them left an outcome undelivered.
- P113's stop rule and P120's start rule land as one contract, so neither bound can later be tightened in a way that silently breaks the other.
- Should cost less total gate traffic than the manual path it replaces, because a remediation round re-invokes two gates rather than the full battery. Unmeasured until the first live run (confirmation criterion 11).
- The editor's leader grounding stops running on jobs ADR-041 retired, and the developer read-list stops omitting a must-have job.

### Neutral

- Roughly five more subagent invocations per issue in the worst case. The budget position is stated plainly above rather than assumed.
- The skill now carries orchestrator-side round bookkeeping: which findings were remediated, which are residual. This is in-context judgement, consistent with the existing `*-prime` and dirty-body discipline; no marker file is added.

### Bad

- **The re-entry cycle needs its own bound.** An edit forced by the loop-exit full pass re-enters section 15.6 in full, so voice and content-risk do get a second look; condition (b) is the normative contract and the 15.6 checklist rows for both gates trigger on "brief body changed". What condition (c) bounds is only the editor and skeptic counter. That leaves the outer cycle, a full pass forcing an edit which re-enters the full pass, without a stated stopping rule, so step 15.37 adds one: after two consecutive loop-exit passes that each force an edit, stop and surface to Tom rather than continuing. Two is a judgement, not a measurement; if editions routinely hit it, the bound is wrong.
- **An unbounded-cycle risk the loop inherits rather than creates.** The outer cycle above is section 15.6's existing behaviour (P099), not something this decision introduces. It matters more now because the loop can be the thing that forces the first edit, so the bound is written down here rather than left to the drafter's judgement.
- **One round may not be enough** for a body carrying several interacting findings, in which case the residual advisory list is longer than it would be under a higher cap and Tom still does the tail. That is the trade the cap buys, and it is measurable.
- **Automatic edits on advisory findings.** A wrong finding now becomes a wrong edit rather than a discarded suggestion. The mitigations are the loop-exit battery, the minimal-remediation rule, and the persona re-grounding above. The residual risk is real, and it is why the cap is one.

## Confirmation

1. `docs/decisions/020-newsletter-editor-subagent.proposed.md` carries an `## Amendment 2026-08-05 (P120)` section naming four lifted clauses, with Considered Option 4 (line 41, the pre-registered lift) leading, plus Considered Option 1's "Single-shot, no iteration loop", the `**Additive, not superseding**` paragraph, and confirmation criterion 2's "no rewrites". The section records the Issue 16 evidence that discharges the pre-registration, corrects the Decision Outcome persona-grounding enumeration, and states that this decision is ADR-020's overdue reassessment.
2. `docs/decisions/042-newsletter-adversarial-skeptic-gate.proposed.md` carries an `## Amendment 2026-08-05 (P120)` section naming **both** amended clauses: "No new multi-round loop machinery is added" and "any revision re-enters the full gate set via the existing SKILL.md section 15.6 dirty-body re-gate discipline".
3. `.claude/skills/wr-newsletter/SKILL.md` has a step `15.37. Editorial remediation loop (ADR-043)` between 15.35 and 15.4, documenting the one-round cap, orchestrator-side churn detection, body-only inner rounds, the skeptic differential, the residual-advisory record, and the four section 15.6 conditions (a) full pass once at loop exit, (b) forced edits re-enter the full set as normal, (c) the editor and skeptic counter does not reset, and (d) the outer cycle stops after two consecutive edit-forcing passes.
4. SKILL.md steps 15.25 and 15.35 route their non-PASS verdicts into 15.37 instead of terminating at "surface to Tom", and step 15.55 carries the same one-round rule inline for the LinkedIn post.
5. SKILL.md section 15.6 records the inner-loop exemption and names cross-edition consistency (11.4) and URL verification (11.5) as claim-scoped triggers that skeptic remediation fires by construction.
6. `.claude/agents/wr-newsletter-editor.md` `## Hard rules` carries "return ALL findings on every axis in a single pass; never surface one nit at a time" (P113 fix item a).
7. `.claude/agents/wr-newsletter-editor.md` Step 1's leader read-list names `docs/jtbd/engineering-leader/persona.md` and `JTBD-005-stay-ahead-of-the-shift.proposed.md` and no retired job; the developer read-list includes `JTBD-205-trust-shipped-vs-demo.proposed.md`; and the pre-read constraints sentence plus every leader axis criterion (`WOULD_OPEN`, `WOULD_READ_THROUGH`, `opener-authenticity`, the `WOULD_FORWARD` rationale and its leader arm) cite JTBD-005 or the leader persona file rather than JTBD-001, JTBD-002 or JTBD-003.
8. SKILL.md's preamble gate-count sentence (line 9) and its ADR reference list (line 14) name ADR-042 and ADR-043. The phase table and the "critic gates run independently in prep and finalise" line name steps 11.4, 15.35, 15.37, 15.4 and 15.55, closing ADR-042 confirmation criterion 2 in the same sweep.
9. SKILL.md step 16 save blocks record residual advisories, and step 17's Tom-summary leads with them plus the rounds spent.
10. `docs/decisions/README.md` is regenerated so the compendium carries an ADR-043 entry and refreshed lines for the amended ADR-020 and ADR-042.
11. **First live-run validation.** On the next `/wr-newsletter` run, the `.reviews.md` records the loop's rounds and any residual advisories. If Tom's external review then raises a class the loop had already named and marked residual, the cap is too tight and reassessment criterion 1 fires.

## Reassessment Criteria

- **If external review repeatedly raises findings the loop marked residual**, one round is too tight. Raise the cap to two before considering any other change; the cap was chosen as a minimum, not as a ceiling.
- **If remediation rounds routinely introduce regressions the loop-exit battery catches**, the minimal-remediation rule is not being honoured, or the findings are too coarse to act on mechanically. Tighten the remediation contract before loosening the loop.
- **If the loop-exit full pass routinely forces edits**, condition (c)'s single extra editor and skeptic look is doing real work and condition (d)'s two-pass outer bound is being approached rather than being theoretical. Voice and content-risk already get their second look under condition (b), so the question is not coverage but convergence: if editions keep hitting the (d) bound, either the minimal-remediation rule is not holding or two passes is the wrong number.
- **If a skeptic finding is ever remediated by adding evidence or strengthening a claim**, the differential has failed and the skeptic must be removed from the loop and returned to advisory-only. This is the one failure mode that would make the loop worse than the defect it fixes.
- **Invocation budget: ADR-020 reassessment criterion 6 is open.** The ~15-per-issue ceiling is breached at ~25. It needs either an explicit re-assertion at a higher number or retirement in favour of ADR-017's under-one-hour finalise-session wall-clock criterion, which is the thing the count was proxying. Tom's call, carried as an open question until given.
- **If the leader `WOULD_FORWARD` axis misfires** in a future edition retro, the gap is in JTBD-005's outcome list, not in the agent. With JTBD-003 retired, no live Engineering Leader job documents a positive forward-or-share outcome, so the axis rests on JTBD-005's "confidence I am not missing a shift" plus a negative credential-sensitivity test. The fix is to add the outcome to the job file.
- **AMENDED 2026-08-07, see the amendment section below.** The editor-and-skeptic-same-passage criterion stands; the invocation-budget criterion above it is discharged.
- **If the editor and skeptic remediations routinely address the same passage**, the ADR-020 reassessment criterion 2 boundary has collapsed and one gate should absorb the other before the loop is tuned further.

## Amendment 2026-08-07 (P121, P122)

Landed by ADR-044 (Cross-edition shape as a fresh-context subagent gate). Five clauses covering P121's and P122's changes to step 15.37 in one section, rather than sequential patches on the same step. **Amendment, not supersession**: the chosen option, the one-round cap, the skeptic reduce-only differential, the residual-advisory arm and the absent author-override arm all survive unchanged. The four section-15.6 conditions survive unchanged **in this section**; they are separately amended by **ADR-046 (Skip the agent re-invocation when the artefact is unchanged)**, which changes what consumes condition (c)'s counter and leaves condition (d) unaffected. That change is recorded inline in the Decision Outcome above, not only here, on Tom's 2026-08-07 direction that a new decision gets its own document rather than an amendment section a reader can miss.

### Clause 1: the collect step gains sources, and the no-op condition widens

Step 15.37 currently collects editor and skeptic findings only, and no-ops when both return PASS. It now also collects:

- **cross-edition shape findings** from the new shape gate at step 15.36 (brief surface only; the post surface takes the inline path at 15.57, mirroring the skeptic-on-post treatment already established here);
- **within-edition assembly findings** from the editor's new assembly sweep (P122).

The no-op condition widens accordingly: the loop no-ops only when every contributing source is clean. Re-running a deterministic contributor inside round 2 costs no invocation; re-running an agent contributor does, and counts against the round.

### Clause 2: a third stop-and-surface class, keyed on wrongness

This decision already carries two stop-and-surface classes, and both key on **remediation availability**: a finding needing new sourcing, and a finding whose only remediation crosses an ADR-032 shape boundary.

The new class keys on something different: **wrongness**. A finding may be perfectly remediable and still must not be remediated, because it is not a defect. The distinction:

- A **defect** is wrong against a stated standard. It remediates.
- A **deviation** is merely different from precedent and may be deliberate. It is surfaced for a stated reason and never becomes an applied edit.

The mechanic is the existing residual-advisory arm; the keying is new and is recorded as its own class so a future reader does not assume it falls out of the other two.

### Clause 3: classification precedence, one rule not two

P121 and P122 each add a classification axis to this step. They are ONE rule with a stated order:

1. **Outer test, wrongness.** Defect or deviation? A deviation never enters remediation, whatever its grain.
2. **Inner test, grain.** Applied only to defects: remediable within the passage, or does it cross an item or section boundary? Cross-boundary defects are stop-and-surface per ADR-032.

Wrongness outer, grain inner. This ordering subsumes P122's ADR-governed-text limb, since text governed by a ratified decision is by construction not wrong by a lint's or a shape gate's authority. That limb is retained as an explicit restatement because the provenance case is load-bearing.

### Clause 4: who states the reason, and what it may say

A surfaced deviation is cleared by **Tom**, never by the drafter. Considered Option 5 of this decision rejected an author-override arm because "an agent self-certifying that its own unremediated finding is acceptable is the confirmation-bias failure", and a drafter-stated reason would restore that option under a new name.

The reason must be **descriptive only**: why the deviation was deliberate, or why remediation was unavailable. It may never be a judgement that the finding is unimportant.

A deviation Tom clears at prep **carries forward to finalise** with residual status intact, per this decision's existing residual carry-forward rule. It does not re-fire. Asking the same question twice per edition is the review load this work exists to reduce.

### Clause 5: the invocation-budget question is DISCHARGED

This decision's reassessment criteria carried "ADR-020 reassessment criterion 6 is open ... Tom's call, carried as an open question until given". **Tom gave that direction on 2026-08-07. The question is closed.**

Two corrections come with it:

1. **Criterion 6 is a trigger, not a ceiling.** This decision's `## Invocation budget re-assertion` section describes a ceiling "set" at roughly 15 and "breached" at 25. That characterisation is wrong. Criterion 6 contains no prohibitive verb; it names two valid responses to crossing 15, and the precedent it defers to sets no number at all. The word "ceiling" first appears against criterion 6 in ADR-020's own 2026-06-17 amendment, which postdates that ADR's ratification, and propagated from there into ADR-042's ratified text and then into this decision. ADR-020 now carries the correction adjacent to criterion 6 itself.
2. **The budget is re-asserted, not trimmed.** That is the first of the two responses criterion 6 names. The pipeline stood near 25; the shape gate adds up to 6 worst case (two brief-site calls, two brief re-invocations inside this loop, one post-site call, one post inline re-invocation), landing near 31. The constraint that actually binds is ADR-017's under-one-hour finalise-session criterion, read day-agnostic since publication moved to Monday.

Read this decision's `## Invocation budget re-assertion` section as historical framing, corrected here. Do not re-open the question at the next reassessment pass.
