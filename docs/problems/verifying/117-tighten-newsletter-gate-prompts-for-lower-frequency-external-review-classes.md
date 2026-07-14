# Problem 117: Tighten existing newsletter gate prompts for the lower-frequency external-review classes

**Status**: Verification Pending
**Reported**: 2026-07-14
**Priority**: 6 (Medium), Impact: 2 x Likelihood: 3, derived at capture from the description
**Origin**: internal
**Effort**: M, derived at capture

## Description

The 11-edition external-review corpus analysis (run under P116) surfaced three recurring-but-lower-frequency classes of substantive external-review catch that the new adversarial skeptic gate (ADR-042) deliberately does NOT own, because each maps to an existing gate that is demonstrably missing it:

1. **Through-line / off-thesis pruning** (4 findings: 2026-05-08, 2026-06-01, 2026-06-22, 2026-07-13). An "and this week's news" bullet or item that does not fit the edition's thesis. Owner: the `wr-newsletter-editor` gate already has `atwn-thesis-fit` and `through-line` axes; they miss some. Fix: tighten the editor prompt.
2. **Cross-edition dropped threads** (1 finding but the strongest point of the 2026-06-22 review: threads carried from a prior edition were dropped). Owner: the `wr-newsletter-cross-edition-consistency` gate checks contradiction, not dropped continuity. Fix: extend its prompt to also flag dropped threads.
3. **Operational actionability of the so-what** (2-3 findings: 2026-05-15, 2026-06-29: an item's action too abstract or unauditable to act on). Owner: the `wr-newsletter-critic` gate owns "is the so-what answered"; it misses actionability. Fix: tighten the critic prompt.

Split from P116 so that ticket can verify and close on the adversarial skeptic gate (the dominant claim-evidence class) alone. These three are separate concerns on three separate existing gates, each a bounded prompt-tightening edit rather than a new gate.

## Symptoms

External review catches through-line drift, dropped cross-edition threads, and weak so-what actionability after the internal gates pass. Lower frequency than the claim-evidence class P116 addresses, but recurring across the corpus.

## Workaround

Tom's external editorial review catches them; the same manual ceiling gate P116 addresses.

## Impact Assessment

- **Who is affected**: newsletter readers; Tom (external review still needed for these classes).
- **Frequency**: lower than the claim-evidence class; a handful of editions across the corpus.
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [x] Tighten the editor prompt for through-line / atwn-thesis-fit: sharpened the `atwn-thesis-fit` craft axis into a deliberate per-bullet sweep of every "Also worth noting" bullet.
- [x] Extend the cross-edition-consistency prompt to flag dropped threads: added an advisory dropped-thread scan surfaced in the existing `## Notes` section (verdict-neutral, stays within ADR-038's charter).
- [x] Tighten the critic prompt for so-what operational actionability: added an "Operational actionability of the so-what" section requiring a concrete quarter-scoped move, not abstract implication.
- [ ] Verify each on the next live edition (Issue 14): the sharpened gates fire in-pipeline and catch (or cleanly clear) their class.

## Resolution

Three within-charter prompt tightenings, one per gate, no ADR amendment needed (architect PASS 2026-07-15: each sharpens an existing axis or uses an already-sanctioned advisory surface; JTBD PASS: all serve JTBD-005):

- `newsletter-critic-rubric.md`: operational-actionability facet on the so-what axis.
- `wr-newsletter-editor.md`: per-bullet `atwn-thesis-fit` sweep.
- `wr-newsletter-cross-edition-consistency.md`: advisory dropped-thread Notes observation.

Follow-up flagged by the JTBD review (not in this ticket's scope): the editor agent still grounds its `leader` simulation in the retired JTBD-001/002/003 (ADR-041 retired those; the live leader job is JTBD-005). Worth re-pointing in a separate edit; captured here so it is not lost.

## Fix Released

Delivered to master 2026-07-15: three prompt/rubric edits to `.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md`, `.claude/agents/wr-newsletter-editor.md`, and `.claude/agents/wr-newsletter-cross-edition-consistency.md`. Architect + JTBD gates PASS (within-charter, serves JTBD-005). Live on commit (repo-local agent/skill prose, no changeset).

**Awaiting verification**: the next real edition (Issue 14) exercises the sharpened gates in-pipeline. Verify the editor does the per-bullet ATWN sweep, the critic flags abstract so-whats, and the cross-edition gate surfaces any dropped thread in its Notes.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P116 (adversarial skeptic gate for the dominant claim-evidence class)

## Related

Split from P116 (the corpus analysis that surfaced these three classes lives there).

- P116 (`docs/problems/verifying/116-newsletter-gates-lack-adversarial-ceiling-gate-external-review-still-finds-substance-issues.md`). The adversarial skeptic gate for the dominant claim-evidence class; this ticket is its lower-frequency prompt-tightening siblings.
- ADR-020 (editor gate), ADR-038 (cross-edition-consistency gate), ADR-033/035 (critic). The three gates this ticket tightens.
