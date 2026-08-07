---
status: "proposed"
first-released:
date: 2026-08-08
human-oversight: confirmed
oversight-date: 2026-08-08
decision-makers: [Tom Howard, Claude]
consulted: [wr-architect:agent]
informed: []
reassessment-date: 2026-11-08
amends: [043-bounded-editorial-remediation-loop-for-editor-and-skeptic-gates]
composes-with: [017-ai-brief-prep-and-finalise-phases, 026-reviews-and-meta-content-to-sibling-files, 046-skip-the-agent-re-invocation-when-the-artefact-is-unchanged]
related: [020-newsletter-editor-subagent, 042-newsletter-adversarial-skeptic-gate]
---

# A gate whose verdict predates the current draft is re-run, and the check is tuned to over-report

> **ID namespaces.** Bare `ADR-0NN` means a **local** decision in `docs/decisions/`. **ADR-060, ADR-073, ADR-077** are **upstream `@windyroad` plugin** IDs and are marked upstream at each mention. Local ADR-046 collides with a different upstream ADR-046.

## Context and Problem Statement

The newsletter pipeline runs seven review gates before a draft is saved. The draft then gets edited, most often on publish morning, and only some of those gates are asked again. The rest keep verdicts that describe a text the edition no longer carries.

This is not hypothetical. Issue 16's own review sibling records it, unprompted, at `src/newsletters/published/leader/2026-08-03/2026-08-03.reviews.md:213-217`: six further rounds of external review ran after the ledger was written, "so that ledger describes a text this edition no longer carries ... because the ledger's verdicts attach to superseded artefacts". Critic, editor, both skeptics and cognitive accessibility never saw that text.

P099 shipped a prose rule for this at SKILL.md step 15.6 and its own Effort line records that the rule "did not hold". RFC-005 proposes the mechanism: each verdict records a digest of the artefact it scored, and the save-time comparison finds the stale ones.

Two questions were left open and are decided here: how the comparison is tuned, and what happens to a gate it finds stale.

## Decision Drivers

- The author edits on publish morning. Anything that lands work on him at that moment lands it at the worst moment.
- A missed review is silent. A needless re-run is visible and cheap by comparison.
- ADR-043 bounded the remediation loop deliberately; auto-re-running is the cost it bounded, so the bound has to survive.
- Some gates legitimately do not track the body at all, and re-running them on an unrelated edit is pure waste.

## Considered Options

1. **Over-report and re-run** (chosen).
2. **Under-report**: flag only unambiguous staleness. Quiet on publish morning, but it misses the subtle rewrites that caused the problem.
3. **Report without acting**: surface what each gate saw and leave the call to the author. No false alarms, but it puts the judgement back on him at the moment the driving problem says he cannot take it.

## Decision Outcome

**Chosen: over-report and re-run.** Tom's direction, 2026-08-08, asked how fussy the check should be and what should happen to what it finds:

> I'm happy with Fussy. But I don't want it just telling me that the review hasn't been run. I want to actually run the missing reviews.

### Tuned to over-report

Where the comparison is uncertain, it reports stale. A gate that was in fact current gets re-run needlessly, and that is the accepted cost of never staying quiet about a gate that genuinely missed an edit. The failure direction is fixed: toward a wasted invocation, never toward a silent miss.

### A stale gate is re-invoked, not reported

The response to staleness is to re-run that gate against the current artefact. Handing the author a list on publish morning is the shape option 3 rejects.

### What over-report resolves, so it is not re-asked

RFC-005 enumerated five open dimensions of the comparison. "Over-report" settles four of them and the fifth was never a tuning question:

1. **Per-surface artefact**: per-surface. The brief and the companion post are digested separately. A single artefact would miss the LinkedIn-side gap, which is the sharpest one on record (`reviews:240-243`).
2. **The prep-to-finalise boundary**: a verdict carried across the boundary is treated as stale unless the orchestrator has explicitly written it as carried. Silence reads as stale, not as current.
3. **What is digested**: the body, with frontmatter excluded. This is not a softening. Frontmatter churn at save is not a content edit, so including it would produce noise rather than sensitivity, and the lint already strips frontmatter for its whole brief check set.
4. **How the check reaches the review sibling**: derived from the artefact path, with an explicit override available. This mirrors the existing sibling-derivation the lint already implements and is a plumbing question, not a tuning one.
5. **Sub-artefact scope**: unchanged from the existing triggers, per the limits below.

### Three limits, so this re-runs the stale and not the world

- **Claim-scoped gates keep their own triggers.** Cross-edition consistency tracks a thesis-bearing line changing; URL verification tracks a URL or URL-anchored claim changing. SKILL.md:1091 already records that "body changed" is the wrong test for both. A body edit touching neither does not re-invoke them.
- **Sanctioned skips stay skipped.** Where a gate's documented skip condition holds, it is not re-invoked. Re-running the editor against a body the critic rejected is waste.
- **The bound holds.** The stale set is re-run **once** against the current artefact. A re-run that itself forces an edit re-enters the existing section 15.6 machinery rather than recursing here. This is what keeps ADR-043's cap intact.

## Consequences

**Good.** A review that missed an edit gets run, without the author noticing or asking. The silent-miss failure mode P099 records is closed for body-tracking gates.

**Bad.** This spends agent invocations at the busiest moment of the week, and by construction some of them are unnecessary. That is the accepted trade, not an oversight. If publish mornings start running long, this decision is a contributor and should be read alongside ADR-017's under-one-hour finalise constraint.

**Neutral.** The comparison inherits RFC-005's custody requirement: a verdict not re-scored keeps the digest it originally recorded. That is durable on-disk state in the review sibling, which is a different shape from ADR-046's in-context digest and is deliberately not unified with it (ADR-046 pins its own to context precisely so it does not become the marker file ADR-043's Neutral consequence declines).

## Confirmation

1. A gate whose recorded digest does not match the current artefact is re-invoked against the current artefact, not reported.
2. Claim-scoped gates are not re-invoked by a body edit that does not touch what they track.
3. A gate whose documented skip condition holds is not re-invoked.
4. The stale set is re-run once per save; a forced edit re-enters section 15.6 rather than recursing.
5. The brief and the companion post are digested separately.
6. A verdict carried across the prep boundary without an explicit carried marker is treated as stale.
7. Frontmatter is excluded from the digest.

## Reassessment Criteria

- **If publish mornings start running long**, this decision is a contributor and is read alongside ADR-017's under-one-hour finalise constraint before anything else is trimmed.
- **If needless re-runs outnumber genuine catches across four editions**, the over-report tuning is wrong for this pipeline and the balance should move toward option 2.
- **If a genuine miss still reaches publication**, the comparison is not over-reporting enough and the limits above are the first place to look.
- **If a re-run is ever observed recursing**, the bound has failed and that is a defect, not a tuning question.

## Related

- **P099**: the driving problem, and the prose rule that did not hold.
- **RFC-005**: the fix vehicle carrying the mechanism, the evidence and the custody requirement this decision tunes.
- **ADR-043**: whose remediation-loop bound this preserves, and whose Neutral consequence on marker files the custody requirement is deliberately not unified with.
- **ADR-046**: the digest precedent, pinned to context for a different purpose.
- **ADR-017**: the phase model that makes carried verdicts legitimate, and the under-one-hour finalise constraint this trades against.
