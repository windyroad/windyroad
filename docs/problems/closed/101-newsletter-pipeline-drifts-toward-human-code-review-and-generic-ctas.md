# Problem 101: Newsletter pipeline drifts toward recommending human code review and generic rotation CTAs, against Tom's stance

**Status**: Closed
**Reported**: 2026-06-22
**Priority**: 6 (Medium). Impact: Moderate (3) x Likelihood: Likely (2) (deferred, re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: M (deferred, re-rate at next /wr-itil:review-problems)
**WSJF**: deferred, re-rate at next /wr-itil:review-problems
**Type**: technical

## Description

Two recurring editorial-position drifts surfaced on Issue 10, both corrected by Tom.

(1) Human code review as the answer to AI-generated code. The drafted Item 3 said "Measure review throughput" and framed the new human skills as code-review judgment. Tom's stated position: humans ratify architecture and product-direction decisions (off the critical path, keeping software aligned with the business and heading off costly mistakes); automated gates and evals carry code-level quality at AI pace; human code review gates delivery back to human pace. The drift is broader than one line: the `ai-landscape.md` Risk/Decisions vocabulary ("review-and-oversight load", "review pipeline") and the three-lens persona action vocabulary both default to "human review" as the response to AI code. Notably the brief's OWN Issue 06 ("More review will not fix AI slop") already argued Tom's position; later editions drifted off it. The cross-edition gate confirmed the Issue 10 reframe is a sharpening of Issue 06, not a contradiction.

(2) Weak generic CTAs from the persona rotation list. The persona config's fixed rotating-invitation list produces CTAs ("Reply with what is breaking on your stack this quarter") that could top any edition. Tom wants the CTA tied to the specific edition's thesis and built to foster conversation (he picked "If the model is the easy part now, what is the hard part for your team this quarter?").

## Symptoms

- Item copy, map-analysis vocabulary, and three-lens action vocabulary recommend human code review as the AI-code answer.
- The drafter pulls a generic rotation-list CTA every edition; Tom replaces it with an edition-tied one.

## Workaround

Per-edition manual correction (done on Issue 10). Memory saved: feedback_humans_ratify_decisions_not_review_code.

## Impact Assessment

- **Who is affected**: every edition that discusses AI-generated code, team capability, or oversight; every edition's CTA.
- **Frequency**: recurring across editions (Issue 06 established the position; later editions drifted).
- **Severity**: Moderate. The position is a load-bearing editorial conviction; silently reversing it weakens the brand voice and contradicts prior editions.

## Root Cause Analysis

The pipeline has no codified editorial stance on the human-in-the-loop question, so the drafter defaults to the common-industry "more human review" framing. The CTA mechanism is a fixed generic rotation list rather than an edition-tied prompt.

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [x] Align the brief editorial stance, the `ai-landscape.md` Risk/Decisions vocabulary, and the three-lens persona action vocabulary so they stop recommending human code review; frame the human role as architecture/product-direction ratification plus automated gates/evals.
- [x] Replace or augment the persona's fixed rotating-CTA list with an edition-tied, conversation-fostering CTA derived from the week's thesis.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: the three-lens-filter asset, personas config, ai-landscape.md analysis, VOICE-AND-TONE.

## Fix Strategy

Codify the editorial stance and the CTA mechanism so the drafter stops drifting, rather than relying on per-edition manual correction. Four surfaces (all skill-config / docs prose; no code, no `packages/<plugin>` change, so no changeset):

1. `.claude/skills/wr-newsletter/assets/three-lens-filter.md`: new `## Editorial stance: the human-in-the-loop question (P101)` section codifying that the human role is ratification of architecture and product-direction decisions (off the delivery critical path), that automated gates and evals carry code-level quality at AI pace, and that the drafter must NOT record a `named_action` of "measure review throughput", "add a human review gate", or any "more human code review" framing for AI-code stories.
2. `.claude/skills/wr-newsletter/personas/leader.md` plus `developer.md`: a Voice-addendum pointer to the codified stance, and a reworked `## CTA` whose PRIMARY instruction is an edition-tied, conversation-fostering invitation derived from the week's thesis (mirroring the VOICE-AND-TONE LinkedIn substantive-content-tied-question carve-out), with the fixed rotation list demoted to a fallback well. The ADR-023 funnel-pause / P090 guard lines are preserved.
3. `docs/ai-engineering-brief/ai-landscape.md`: a standing editorial-stance blockquote in the Analysis section, plus surgical reframes of the three drifted phrases ("review-load investment", "review-and-oversight load", "review-throughput measurement").

**Cited decisions** (fix-design trace, per the P104 legacy-path fallback): ADR 015 (reader-respect), ADR-023 (funnel pause / P090), ADR-032 (editorial discipline, the content-tied closing prompt). The human-in-the-loop stance is human-pinned by Tom's Issue 10 correction, saved as memory `feedback_humans_ratify_decisions_not_review_code`.

**I13 RFC-trace gate**: fired `no-rfc-trace: P101`, but this is the documented P104 false positive (this consumer repo has no `docs/rfcs/` tier and zero RFC history). Per the P070 / P103 precedent no RFC was auto-created; the fix uses the SKILL's legacy direct-implementation path with the fix-design trace carried here. This is the third occurrence of the P104 class and is recorded on P104.

## Fix Released

Committed to `master` 2026-06-27 (repo-local skill-config plus docs change; no separate deploy, since the next `/wr-newsletter` run consumes the updated assets). Gate reviews: architect PASS, JTBD PASS, voice-tone PASS (after em-dash remediation). Awaiting user verification that a future edition no longer defaults to human-code-review framing or a generic rotation CTA.

## Related

Captured during the 2026-06-22 Issue 10 retrospective. Memory: feedback_humans_ratify_decisions_not_review_code. Editorial humans-ratify-not-review stance also recorded in the Issue 10 reviews companion file. P104 (I13 false positive in RFC-less repos): this fix is its third recorded occurrence.

## Closed

- **Closed**: 2026-06-28 (verification-queue drain; evidence-based per ADR-022)
- **Evidence**: editorial-stance section + edition-tied CTA present; 2026-06-22 CTA tied to thesis, no human-code-review framing
- **Recovery**: reopen via /wr-itil:transition-problem 101 known-error if a regression surfaces
