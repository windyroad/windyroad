# Problem 099: wr-newsletter has no rule that a post-gate / post-finalise body edit must re-run the FULL gate set

**Status**: Open
**Reported**: 2026-06-22
**Priority**: 6 (Medium). Impact: Moderate (3) x Likelihood: Likely (2) (deferred, re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: S (deferred, re-rate at next /wr-itil:review-problems)
**WSJF**: deferred, re-rate at next /wr-itil:review-problems
**Type**: technical

## Description

The `/wr-newsletter` pipeline runs five LLM gates (voice, content-risk, newsletter-critic, editor, cognitive-accessibility) plus cross-edition consistency and the deterministic structural lint, in a defined sequence. But there is no documented discipline for what happens when the brief or LinkedIn body is edited AFTER that sequence has passed (the common case: author-directed corrections during finalise, or fixes prompted by an external review).

During Issue 10 (2026-06-22) finalise, after the gates first passed, the body changed across roughly six edit rounds: the apocryphal-anecdote fix, the human-code-review reframe of Item 3, the CTA swap, the external-review continuity fixes (model names plus the WSJ link, the Nature hedge), and the "the brief" to "we have tracked" fix. After each edit the agent re-ran only the cheap subset (voice plus structural lint) and did NOT re-run critic / editor / cog-a11y / content-risk. Tom had to ask "have the cog-a11y and strengths/weaknesses checks been run?". They had not.

Re-running the full set on the final text then surfaced real, new weaknesses the post-edit body had introduced: Item 2 lacked a concrete metric, Item 4's "rare week" urgency contradicted Item 1, the Item 3 heading was an abstract maxim, and the LinkedIn post called Gemma 4 "frontier-grade" (contradicting the brief's 12B vs 753B framing). Each shipped past the cheap subset and would have published un-caught.

## Symptoms

- Agent keeps voice plus lint current after each post-finalise edit but silently drops critic / editor / cog-a11y / content-risk.
- The user has to manually ask whether the heavier gates were re-run.
- Real weaknesses introduced by late edits are caught only when the full set is re-run on demand.

## Workaround

Manually re-run the full gate set after any post-finalise body edit. Tom prompting "have the checks been run?" is the current manual backstop.

## Impact Assessment

- **Who is affected**: the newsletter author (Tom) and the pipeline's quality guarantee.
- **Frequency**: every edition that gets author-directed edits after the gate sequence (most editions).
- **Severity**: Moderate. Defects reach a publish-bound artifact; caught only by manual prompting.

## Root Cause Analysis

The SKILL.md gate steps (13 to 15.4) are framed as a one-pass sequence. There is no "any body edit after this point re-enters the gate sequence" rule, so the agent defaults to the cheapest plausible re-check (voice plus lint) rather than the full set.

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Add a wr-newsletter SKILL.md discipline rule: any post-save / post-finalise edit to the brief or LinkedIn body re-runs the full gate set (voice, content-risk, newsletter-critic, editor, cog-a11y, cross-edition, structural lint), not the cheap voice+lint subset.
- [ ] Consider a lightweight mechanism (a "dirty since last full-gate-pass" marker, or a save-time checklist) so the rule is hard to forget rather than a memory load.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P089 (structural lint); the five-gate sequence.

## Related

Captured during the 2026-06-22 Issue 10 retrospective. Sibling to the "gates pass but defects remain" class (P089).
