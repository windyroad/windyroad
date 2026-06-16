# Problem 070: Newsletter draft-template does not codify the three-deep-items-plus-notes editorial discipline

**Status**: Closed
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

- [x] Investigate root cause (confirmed 2026-06-16: the three contradictory count lines are the operative driver; verified on disk at draft-template lines 20, 82, 112. The ticket's original 20/72/108 line numbers had drifted but the content was unchanged.)
- [x] Create reproduction test / checklist assertion: superseded by ADR-032. The "template encodes a one-thesis rule" assertion is now an ADR-032 confirmation criterion (a thesis-coherence critic-rubric check, criterion d), tracked in ADR-032. A structural test asserting template prose content is discouraged per the wr-tdd:review-test structural-vs-behavioural rule, so none was added.
- [x] Create INVEST story for permanent fix: superseded by ADR-032. The editorial-shape rule was promoted to ADR-032 (the architect's blocker-4 recommendation from the 2026-05-30 review); the permanent fix is the template's reference to that confirmed ADR. The RFC/story tier (ADR-060) is unadopted in this consumer repo (no docs/rfcs/), so no INVEST story vehicle exists here.

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

## Resolution 2026-06-16 (AFK loop, manage-problem on P070)

All four 2026-05-30 blockers are now resolved, mainly because ADR-032 (newsletter editorial-discipline policy) was created after that review and is `human-oversight: confirmed` (Tom, 2026-05-30). Re-verified each blocker against disk this iteration:

1. **Direction-reversal blocker dissolved.** The fix is reframed as a DEPTH discipline, not a content cap. Only roughly three items get deep treatment (the full What happened / Why it matters / Human angle frame); every other story that clears the filter still appears, demoted to "Also worth noting". Nothing significant is dropped. This is consistent with the pinned memory `feedback_brief_item_count` ("no content cap, minimum three, include every significant story"), whose "How to apply" guidance explicitly says the LinkedIn attention budget "belongs in a separate formatting step (excerpt / summary), not in a content cap". The depth-vs-notes split IS that formatting step.
2. **Three-file-contradiction blocker dissolved.** SKILL.md already follows ADR-032 (line 415 binds the 11a theme statement to ADR-032's thesis-first intro; line 470 keeps "Also worth noting"; lines 445 and 1100 preserve "minimum 3, no maximum"). Under the depth-not-cap reframe, "no maximum" still holds for total coverage, so the template and SKILL.md no longer contradict. The ticket's old "SKILL.md lines 416 / 981" had drifted; the live lines were re-read.
3. **Cross-persona-scope blocker dissolved by ADR-032.** ADR-032 makes the scoping decision explicitly: the leader persona (The Shift) is the immediate target; the developer persona (Tokens Spent) inherits the rule unless its persona config opts out (no opt-out currently documented). The shared template carries the default; any developer carve-out belongs in `personas/developer.md`, not the template (confirmed by the JTBD gate this iteration: forcing a carve-out into the shared template would duplicate the rule across surfaces, the anti-pattern ADR-032 rejects).
4. **ADR-vs-inline blocker dissolved.** The editorial-shape rule was promoted to ADR-032 (exactly the architect's blocker-4 recommendation). The template now references ADR-032 rather than carrying the policy, per ADR-032 Option 1 (referenced enforcement, not inline re-spell).
5. **JTBD-ratification blocker dissolved.** The developer persona is now `human-oversight: confirmed` (2026-06-16 check), and ADR-032 (confirmed) already made the persona-scope decision the prior review said the ratification was a precondition for.

### What changed

Five edits to `.claude/skills/wr-newsletter/assets/draft-template.md`, all referencing ADR-032 as the single source of truth:

- Line 20 (formatting rules): "Prefer 4-5 items over 6+" replaced with the three-deep-items depth rule plus the soft-cap (four, justify in reviews.md) and external-review (five-plus) thresholds. This is the one template spot that carries the numeric thresholds (architect advisory: keep them in one place).
- Line 57 (intro scaffold): strengthened to the ADR-032 element-1 thesis-first intro (name the deep items by their shared constraint, preview each variation).
- New Disclosure line (ADR-032 element 4): optional isolated line before the closing rule.
- Line 82 (structure note): "Aim for 4-5 full items" replaced with the three-deep-items target plus demote-not-drop; thresholds point to the formatting rule above.
- Line 112 (what NOT to do): "no maximum" reframed to "no maximum on total stories covered" with deep-treatment routing to "Also worth noting".

### Gate reviews (all pass)

- Architect: ALIGNED. No new ADR needed (downstream enforcement of confirmed ADR-032); no contradiction with ADR 014 / 023 / 026. Advisory acted on (thresholds kept in one spot).
- JTBD: PASS (serves leader JTBD-001/002/003; demote-not-drop preserves developer JTBD-200's "excluded on purpose, not missed" contract).
- Style-guide: OUT OF SCOPE (markdown authoring guide, no CSS).
- Voice-tone: PASS (no em-dashes, no banned patterns).

### I13 RFC-trace gate note

The `wr-itil-check-fix-rfc-trace` predicate flagged a missing RFC trace and directed auto-create via capture-rfc. That auto-create is not actionable in this consumer repo: the RFC tier (ADR-060) is unadopted here (`docs/rfcs/` does not exist), so honouring the directive would mean bootstrapping the whole RFC-tier infrastructure for an Effort-S template doc-edit, far outside scope. The fix-design trace is carried by confirmed ADR-032 instead (ADR-032 § Related: "Resolves the architect-design blocker on P070"; § Enforcement surfaces names this exact template edit).

### Remaining ADR-032 enforcement surfaces (tracked by ADR-032, not P070)

ADR-032 confirmation criterion (b) also names `personas/leader.md` + `personas/developer.md` referencing the ADR, and criterion (d) names a critic-rubric thesis-coherence check. Those are ADR-032's own rollout surfaces, not P070's gap (which was specifically the draft-template). P070 closes on the template codification; the remaining surfaces stay tracked by ADR-032's confirmation criteria.

Outcome: closed. Codification is live on commit; this is a template doc-class edit with no npm/release vehicle, so "live on commit" closes the gap (per the AFK orchestrator's outcome guidance).
