# Problem 116: Newsletter gates are all floor gates; no adversarial ceiling gate, so external review still finds substance issues every edition

**Status**: Open
**Reported**: 2026-07-14
**Priority**: 16 (High), Impact: 4 x Likelihood: 4, derived at capture from the description
**Origin**: internal
**Effort**: L, derived at capture (new adversarial critic agent + ADR + rubric/prompt + SKILL wiring, comparable to the wr-newsletter-editor build P008 rated L)

## Description

The newsletter pipeline has five internal review gates (voice, content-risk, newsletter-critic, editor, cognitive-accessibility). They are all floor gates that check conformance to a rubric, not a ceiling gate that checks whether the edition actually works. Every edition still returns real substantive fixes from Tom's external editorial review AFTER all five gates PASS.

Issue 13 evidence (`src/newsletters/published/leader/2026-07-13/2026-07-13.reviews.md`): all five gates PASSed across the prep multi-round loop AND the finalise re-gate, then the external review caught:

1. The headline thesis did not hold. "Half were theatre" was overstated: only the China item is strictly manufactured.
2. Promise/payoff gap on the LinkedIn post: it named four stories but resolved only two.
3. Overstated causation: "an exam without laptops cut scores in half" implied laptops caused the drop, which is the exact misread the edition itself warns against.
4. Flat human-angle beats that restate the practical point rather than land emotionally.

Root cause:

- (a) No gate owns thesis-truth. Content-risk checks whether claims are sourced, not whether the synthesis is right. The editor's opener-earns-thesis / atwn-thesis-fit axes check internal setup and fit, not whether the evidence across all items supports the headline proportion claim.
- (b) No gate owns promise/payoff completeness or causation-vs-correlation honesty.
- (c) The internal critics are the same model family reading against the same rubric the draft was optimized to satisfy, so the draft teaches to the test and the critic shares the drafter's frame.

Crucially, this is NOT simply "the rubric needs more checks". P008 and P017 already tried that path and were closed 2026-05-30: P008 expanded the newsletter-critic rubric to 31 checks AND built the `wr-newsletter-editor` editorial-sim (ADR-020); P017 added seven contradiction/ambiguity checks. Both shipped, both were verified-closed, and the gap recurred anyway on Issue 13. The reason the editor gate does not close it: `wr-newsletter-editor` simulates a RECEPTIVE reader (would-open / would-read-through / would-forward), not an adversarial skeptic trying to break the piece. Simulating a receptive editor is a different job from attacking the thesis. That is why a weak edition still clears it.

Fix direction (Tom-confirmed 2026-07-14): build an adversarial "skeptic reader" critic agent that runs BEFORE the human review and, instead of scoring a rubric, attacks:

- Refute the headline thesis against the actual items (does the evidence across all items support the headline claim, including any proportion or magnitude claim).
- Hunt every promised-but-unresolved story (every story the preview/fold names must be resolved in the body).
- Flag any causation claim that is really correlation.
- Call out human-angle beats that merely restate the practical point instead of landing a people/emotional beat.

Wire it into the wr-newsletter pipeline gate sequence. Adds a sixth review gate to the governed pipeline described in ADR-016 / ADR-020 / ADR-033 / ADR-035, so it warrants an ADR.

## Symptoms

External review (Tom) repeatedly catches substance-level weaknesses (thesis-truth, promise/payoff completeness, causation honesty, live-vs-restated human angle) after every internal gate returns PASS. Documented instances: the 2026-04-17 first-edition session (P008), the 2026-04-24 edition (P017), and Issue 13 on 2026-07-13 (this ticket). Third tracked recurrence.

## Workaround

Tom runs an external editorial review of the finalised draft (and the LinkedIn post) and feeds the weaknesses back for a further edit round. This is the manual ceiling gate the pipeline lacks.

## Impact Assessment

- **Who is affected**: newsletter readers (weaker editions risk shipping); Tom (must run the external review every week or tolerate weaker output).
- **Frequency**: every weekly run of the pipeline.
- **Severity**: High. The review gates are the primary quality mechanism; the gap between what they catch and what a reader notices is the gap between solid synthesis and subscriber churn.
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Root Cause

The gates enforce floor-level conformance (no banned words, structure present, claims sourced, readable grade, would-a-receptive-reader-engage). None performs adversarial top-level judgement: is the thesis true against the evidence, does every promise pay off, is the causation honest, is the human angle alive. The drafter plus same-family critics cannot self-supply that ceiling because they share the frame that produced the draft. The prior fixes (P008 rubric expansion + receptive editorial-sim; P017 contradiction/ambiguity checks) stayed within the rubric-scoring / receptive-sim shape and so did not close the gap.

### Fix Strategy

Build an adversarial "skeptic reader" critic agent (working name) that runs as a fresh-context gate before the human review, prompted to REFUTE rather than score: thesis-truth attack, promise/payoff completeness sweep, causation-vs-correlation check, live-vs-restated human-angle check. Record an ADR adding it to the governed gate sequence (ADR-016 / ADR-020 / ADR-033 / ADR-035 lineage). Distinct in shape from the existing receptive `wr-newsletter-editor`.

### Investigation Tasks

- [ ] Draft the ADR proposing the adversarial ceiling gate (position in the gate sequence, verdict shape, relationship to the existing editor gate).
- [ ] Build the skeptic-reader agent + its attack prompt/rubric.
- [ ] Wire it into `.claude/skills/wr-newsletter/SKILL.md` gate sequence (prep + finalise + full).
- [ ] Retro-validate against Issue 13: would the skeptic gate have caught the four external-review findings.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P113 (editor one-nit-per-pass treadmill, an efficiency problem on the same editor gate)

## Related

Captured via /wr-itil:capture-problem after the duplicate check surfaced P008 and P017.

- P008 (`docs/problems/closed/008-critic-rubric-misses-external-review-findings.md`). Same core problem, closed 2026-05-30. Its fixes (rubric expansion to 31 checks; the `wr-newsletter-editor` receptive editorial-sim, ADR-020) shipped but proved insufficient; Issue 13 is the recurrence. This ticket reframes the fix as an ADVERSARIAL gate, distinct from the receptive editorial-sim.
- P017 (`docs/problems/closed/017-critic-rubric-misses-contradictions-and-ambiguity.md`). Closed 2026-05-30; added contradiction/ambiguity rubric checks. Same rubric-scoring shape that did not close the gap.
- P015. Anchored alongside P008 in the ADR-020 editor-gate design; part of the same critic-misses-substance cluster.
- P113 (`docs/problems/open/113-newsletter-review-gate-loop-editor-one-nit-per-pass.md`). Adjacent but distinct: P113 is the editor gate's one-nit-per-pass efficiency treadmill; this ticket is the missing adversarial-substance capability.
- Memory `feedback_rubric_pass_does_not_mean_newsletter_is_good.md`. The documented rubric-pass-vs-substance gap this ticket is the third recurrence of.
- ADR-016 / ADR-020 / ADR-033 / ADR-035. The governed critic/editor pipeline the new gate extends.
