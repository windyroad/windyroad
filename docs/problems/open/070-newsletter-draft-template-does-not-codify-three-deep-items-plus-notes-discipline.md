# Problem 070: Newsletter draft-template does not codify the three-deep-items-plus-notes editorial discipline

**Status**: Open
**Reported**: 2026-05-25
**Origin**: internal
**Priority**: 3 (Low). Impact: Negligible (1) x Likelihood: Possible (3)
**Effort**: S
**WSJF**: 3 = (3 x 1) / 1

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

## Investigation update 2026-05-30 (AFK loop iter 8)

Attempted to apply the Fix Strategy (thesis-coherence cap plus Issue-06 shape in `draft-template.md`). The architect and JTBD reviewers found four blockers that put the change out of scope for AFK execution. Skipping the edit; recording the findings so the next interactive pass has the full picture.

**Architect findings (ISSUES FOUND):**

1. **Reverses a pinned user direction.** Memory `feedback_brief_item_count.md` records Tom rejecting three "cap" options on 2026-04-17 and saying "pick all the ones that are significant, there shouldn't be a cap. There must be at least three." The Fix Strategy reverses that to a thesis-coherence cap. Verified the memory is current ("no cap, minimum three" is still the pinned direction). A direction reversal needs explicit human confirmation; cannot land in AFK.
2. **The contradiction is three-file, not one-file.** `SKILL.md` line 416 ("minimum 3, no maximum") and line 981 ("Final item count (minimum 3, no cap)") encode the same "no cap" rule the template carries. Verified both lines exist as quoted. Editing only `draft-template.md` would leave SKILL.md and the template in contradiction; the orchestrator and the template would disagree on each draft. Single-file edit understates the scope.
3. **Cross-persona scope conflict.** The template is shared between The Shift (leader, persona=leader, ADR 030) and Tokens Spent (developer). `docs/jtbd/developer/JTBD-200-signal-from-noise.proposed.md` defines a consistent-filter contract ("excluded on purpose, not missed"), not a thesis-coherence contract; a developer's weekly digest of unrelated runtime/tool/model news may legitimately have no single thesis. Applying the cap to both personas would violate JTBD-200. The fix needs either persona-scoped guidance or template split.
4. **Editorial-shape rule should be an ADR, not inline prose.** The Issue-06 shape (thesis-first intro, then three thesis-variation items, then "Also worth noting", then isolated Disclosure, then closing reply prompt) is load-bearing direction that recurs across editions. Burying it as a template bullet reproduces the P070 failure (next editor re-derives it). Should be promoted to an ADR so the template asset cross-references rather than carries the policy.

**JTBD findings (ISSUES FOUND):**

5. **Unratified persona/job dependencies.** The leader persona and `JTBD-001`/`JTBD-002`/`JTBD-003` (Awareness, Engagement, Evaluation) are still `.proposed.md`. The developer persona and `JTBD-200` (Signal from Noise) are also `.proposed.md`. Per `feedback_new_jtbd_and_persona_need_human_confirmation.md`, new JTBDs and personas are direction-setting and need explicit human confirmation. Ratifying via `/wr-jtbd:confirm-jobs-and-personas` is a precondition for this template change because the cap-rule scoping depends on which jobs the template is serving.

**Pre-existing drift surfaced during review (out of P070 scope, noted for future ticket):**

- ADR 014 (Wardley mapping as strategic lens) Confirmation §5 requires the draft template to include "a mandatory 'Map movement' line per item." Lines 47-62 of `draft-template.md` do NOT include a `**Map movement:**` field. The per-item sub-bullets are `What happened`, `Why it matters to your team`, `The human angle`, `Source`. SKILL.md line 416 still lists "Map movement" as a per-item field, so this is template-vs-SKILL drift. Worth a separate problem ticket if it has not already been raised.

**Resolution path for next interactive pass (requires user direction):**

1. Confirm or amend the item-count direction reversal. The current pinned direction is "no cap, minimum three"; the proposed direction is "three deep items, thesis-coherence cap, overflow to 'Also worth noting'". Tom to confirm which one wins.
2. Decide whether to promote the editorial-shape rule to an ADR (architect recommendation) or keep it as template prose. ADR creation needs human confirmation.
3. Decide scope: per-persona guidance (Shift uses thesis-coherence, Tokens Spent keeps consistent-filter) or template split.
4. Once direction is confirmed, the implementation is a three-file edit: `draft-template.md` lines 20, 72, 108 plus `SKILL.md` lines 416, 981, with updates to `feedback_brief_item_count.md` to supersede the old pin.

**Why this iter did not apply the fix:**

Standard AFK constraints (no AskUserQuestion mid-loop, no capture-*, no push) make all four direction questions and the prerequisite JTBD ratification unactionable. Editing the template without resolving them would either reverse a pinned direction silently or leave SKILL.md and the template in contradiction. Both outcomes are worse than the current contradiction, which is at least caught by external editorial review at the prep/finalise boundary (the existing workaround).
