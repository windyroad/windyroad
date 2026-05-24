# Problem 070: Newsletter draft-template does not codify the three-deep-items-plus-notes editorial discipline

**Status**: Open
**Reported**: 2026-05-25
**Priority**: 3 (Low). Impact: Negligible (1) x Likelihood: Possible (3)

## Description

The newsletter draft-template (`.claude/skills/wr-newsletter/assets/draft-template.md`) does not codify the "three thesis-serving deep items plus demote-the-rest-to-Also-worth-noting" editorial discipline that Issue 06 of The Shift discovered via external review.

The template's existing guidance is a count heuristic, not a thesis-coherence rule, and the two count lines pull against a third "no maximum" line:

- Line 20: "Prefer 4-5 items over 6+. ... demote the borderline ones to an 'Also worth noting' section."
- Line 72: "Aim for 4-5 full items."
- Line 108: "Three items is the minimum, and there is no maximum: include every candidate that clears the filter AND anchors to a map movement."

The "no maximum, include every candidate" reading fights the "prefer 4-5" reading, and there is no instruction that the items must each be a variation on ONE thesis. That gap permitted a 6-item dilution that two editions (03 and the 06 prep draft) hit and that needed an external-review round to cut back. In Issue 06 the external reviewer named the cut-back shape as "a method that could repeat": a thesis-first intro that names the deep items, roughly three items each a variation on one constraint, an "Also worth noting" section for the other stories, an isolated commercial Disclosure line, and a closing reply prompt.

The discipline currently lives only in Tom's editorial judgement and the external reviewer's feedback. It is not encoded anywhere the drafter reads, so each edition re-derives it (or misses it) from scratch.

## Symptoms

- Editions 03 and the 06 prep draft both shipped 6+ items and required an external-review round to cut back to a coherent set.
- The drafter optimises for "include every candidate that clears the filter" (line 108) rather than "every item serves one thesis", because the template rewards coverage over coherence.
- The cut-back shape is reconstructed by hand each time rather than read from the template.

## Workaround

External editorial review at the prep/finalise boundary catches the dilution and cuts items back by hand. This works but costs an extra review round per affected edition and depends on a reviewer noticing.

## Impact Assessment

- **Who is affected**: The newsletter drafter (the agent running `/wr-newsletter`) and Tom as editor; readers are shielded because the dilution is caught before publish.
- **Frequency**: Roughly one edition in three to date (03 and 06 of the editions run so far).
- **Severity**: Low. No reader-facing harm because it is caught pre-publish; the cost is an extra editorial-review round and re-derivation of a known-good shape.
- **Analytics**: N/A (editorial-process friction, not a measured metric).

## Root Cause Analysis

### Investigation Tasks

- [ ] Investigate root cause (confirm the line-20 / line-72 / line-108 tension is the operative driver)
- [ ] Create reproduction test (or a checklist assertion that the template encodes a one-thesis rule)
- [ ] Create INVEST story for permanent fix

Preliminary hypothesis (not yet confirmed): the template encodes a count target and a "no maximum, include everything that clears the filter" rule, but no thesis-coherence rule, so the drafter has explicit permission to over-include and no explicit instruction to make every item serve one argument.

## Fix Strategy

Kind: improve. Shape: skill asset edit.

Add an editorial-discipline note to `.claude/skills/wr-newsletter/assets/draft-template.md` (and a cross-reference from `SKILL.md` step 11, drafting) encoding the rule: one thesis; roughly three deep items each a variation on that thesis; demote every other story, even strong on-topic ones, to a compressed "Also worth noting" note. Resolve the line-20 / line-72 / line-108 tension so "no maximum" no longer reads as licence to dilute: the maximum is governed by thesis-coherence, not by how many candidates clear the filter.

Effort: S (single asset edit plus a one-line SKILL.md cross-reference). Exact WSJF deferred to the next `/wr-itil:review-problems` per the capture note.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P008 (SW-critic rubric misses external-review findings), P043 (three-lens scoring persona relevance). These share the "external review catches what the gates and template miss" theme but neither blocks this; the fix surfaces are distinct (P008 = critic rubric, P043 = three-lens scoring, P070 = draft template).

## Related

- Trigger: The Shift Issue 06 (`src/newsletters/published/leader/2026-05-25.md`), cut from 6 items to 3 deep items plus 4 notes after external review.
- Skill asset: `.claude/skills/wr-newsletter/assets/draft-template.md` (lines 20, 72, 108).
- Captured by `/wr-retrospective:run-retro` on 2026-05-25.
