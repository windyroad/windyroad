---
status: "proposed"
first-released: 2026-07-07
date: 2026-05-30
human-oversight: confirmed
oversight-date: 2026-05-30
decision-makers: [Tom Howard, Claude]
consulted: []
informed: []
reassessment-date: 2026-08-30
---

# Newsletter editorial-discipline policy: thesis-coherence plus three-deep-items shape

## Context and Problem Statement

The newsletter draft-template (`.claude/skills/wr-newsletter/assets/draft-template.md`) currently carries a count heuristic spread across three contradictory lines: "Prefer 4 to 5 items over 6+" (line 20), "Aim for 4 to 5 full items" (line 72), and "Three items is the minimum, and there is no maximum: include every candidate that clears the filter" (line 108). The "no maximum, include every candidate" reading fights the "prefer 4 to 5" reading; there is no instruction that the items must each be a variation on ONE thesis.

That gap permitted a 6-item dilution that Edition 03 and the Edition 06 prep draft both hit, requiring external review to cut back to a coherent set. In Edition 06, the external reviewer named the cut-back shape as "a method that could repeat": a thesis-first intro that names the deep items, roughly three items each a variation on one constraint, an "Also worth noting" section for the other stories that cleared filters, an isolated commercial Disclosure line, and a closing reply prompt.

The discipline currently lives only in Tom's editorial judgement and the external reviewer's feedback. It is not encoded anywhere the drafter reads, so each edition re-derives it (or misses it) from scratch. P070 captured the gap; the architect-design blocker on the cap-rule fix surfaced during the 2026-05-30 AFK loop and required a single canonical source of truth via this ADR.

## Decision Drivers

- **Thesis coherence over coverage.** Items must serve a single thesis or constraint, not maximise inclusion. Coverage without coherence produces dilution that external review consistently cuts back.
- **Single source of truth.** The editorial rule must live in one place, not three contradictory locations. Other artefacts (draft-template, persona configs, SKILL.md prose) reference it rather than duplicate it.
- **Repeatable shape.** The Edition 06 cut-back shape (thesis-first intro plus three deep items plus Also-worth-noting plus Disclosure plus reply prompt) is observable, gradable, and rubric-able. Codifying it lets the drafter target it directly.
- **Tom-as-final-editor preservation.** The rule must not eliminate Tom's editorial judgement; it must reduce the surface area where Tom has to apply that judgement to recover from drift.
- **Persona scope.** The leader persona (The Shift) is the immediate target. Developer persona (Tokens Spent) inherits the rule unless its persona config opts out (currently no opt-out documented).

## Considered Options

1. **Single canonical ADR plus referenced enforcement in draft-template + SKILL.md + persona configs** (chosen). The ADR is the single source of truth. The draft-template's contradictory count lines collapse to: "Target three deep items each serving one thesis variation; demote everything else to Also worth noting. See ADR 032 for the shape." Persona configs and SKILL.md Step 11 reference the ADR rather than redefine the rule.
2. **Expand the draft-template inline to spell out the shape.** Resolves the contradiction but keeps the rule in one secondary file; later additions risk drift between the draft-template and SKILL.md prose.
3. **Add a checklist gate to /wr-newsletter Step 11 (or new sub-step) that enforces thesis-coherence.** Mechanical enforcement (refuse to save if items per ratio exceeds threshold). Risks over-constraint: some legitimate editions may genuinely need four deep items.
4. **Status quo: rely on external review per edition.** Working pattern in practice (Editions 03 and 06 both recovered), but persists the per-edition recovery tax and ships dilution risk every time external review is unavailable.

## Decision Outcome

Chosen option: **Single canonical ADR plus referenced enforcement**, because it places the rule in one architectural-decision-record where it composes with other policy ADRs (012, 015, 016, 020, 026), preserves the drafter's editorial latitude (no mechanical refusal), and gives the contradictory draft-template + persona-config + SKILL.md surfaces a single reference point.

### The shape codified

A leader edition targets:

1. **Thesis-first intro.** One paragraph that names the deep items by their shared constraint and previews the variation each item shows.
2. **Three deep items.** Each item is a variation on the thesis named in the intro. The variation explains a specific observed move, not a general claim.
3. **Also worth noting section.** Single section (no sub-headings) listing every other candidate that cleared the filter, each in one to two sentences. No deep treatment.
4. **Disclosure line.** Isolated, single line; any commercial relationship that warrants disclosure for the edition's items.
5. **Closing reply prompt.** One substantive content-tied question against one of the deep items' threads. Per ADR-066 / VOICE-AND-TONE.md LinkedIn carve-outs (P066), distinct from engagement bait.

Cap rule: three deep items is the target; four is a soft cap (justify in `<date>.reviews.md`); five plus requires external review before publish.

### Enforcement surfaces

- `.claude/skills/wr-newsletter/assets/draft-template.md`: contradictory count lines collapse to a single reference to this ADR.
- `.claude/skills/wr-newsletter/personas/leader.md` and `developer.md`: the cap-rule section references this ADR rather than carrying its own count rule.
- `.claude/skills/wr-newsletter/SKILL.md` Step 11: the editorial-shape rule references this ADR; the existing review rubric (`newsletter-critic-rubric.md`) gains a check (likely check_39) for thesis-coherence per this ADR.

## Consequences

### Good

- Edition 07 forward: drafter targets the codified shape directly; no per-edition re-derivation.
- External review threshold (five-plus items) is the only manual gate; recovery surface shrinks.
- Cross-edition consistency: readers learn the shape, which serves JTBD-001 to JTBD-003 (awareness, engagement, evaluation) for the engineering leader persona.

### Bad

- The three-item cap may genuinely under-fit weeks with four equally-thesis-coherent stories; the soft cap (justify in reviews.md) is the escape valve but adds reviews.md content per such edition.
- Persona-config and draft-template references to this ADR create a documentation chain; readers of any single surface have to follow the reference to get the full rule.

## Confirmation

The fix is confirmed once: (a) this ADR lands, (b) the draft-template + persona configs + SKILL.md Step 11 reference it (single source of truth), (c) the next three editions publish with three deep items unless justified in reviews.md, and (d) the critic rubric carries a thesis-coherence check.

## Reassessment

Reassess after four editions: if soft-cap justifications appear more than once per four editions, the cap may be wrong-sized for the genuine signal density; revisit. If thesis-coherence check fires more than once per four editions on round-1 critic, the drafter prompt may need adjustment.

## Related

- Resolves the architect-design blocker on P070 (work-problems iter 8, 2026-05-30).
- Composes with ADR 012 (content review gates), ADR 015 (reader respect + REJECTED policy), ADR 016 (sw-critic iteration), ADR 020 (newsletter-editor subagent), ADR 026 (sibling-file content separation).
- Cross-references VOICE-AND-TONE.md LinkedIn carve-outs landed for P066 (the closing reply prompt's substantive-question rule).
