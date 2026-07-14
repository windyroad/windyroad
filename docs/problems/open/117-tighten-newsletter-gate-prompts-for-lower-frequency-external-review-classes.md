# Problem 117: Tighten existing newsletter gate prompts for the lower-frequency external-review classes

**Status**: Open
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

- [ ] Tighten the editor prompt for through-line / atwn-thesis-fit (confirm the axes exist, sharpen the guidance).
- [ ] Extend the cross-edition-consistency prompt to flag dropped threads, not only contradictions.
- [ ] Tighten the critic prompt for so-what operational actionability.
- [ ] Retro-validate each against the corpus editions that surfaced the class.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P116 (adversarial skeptic gate for the dominant claim-evidence class)

## Related

Split from P116 (the corpus analysis that surfaced these three classes lives there).

- P116 (`docs/problems/verifying/116-newsletter-gates-lack-adversarial-ceiling-gate-external-review-still-finds-substance-issues.md`). The adversarial skeptic gate for the dominant claim-evidence class; this ticket is its lower-frequency prompt-tightening siblings.
- ADR-020 (editor gate), ADR-038 (cross-edition-consistency gate), ADR-033/035 (critic). The three gates this ticket tightens.
