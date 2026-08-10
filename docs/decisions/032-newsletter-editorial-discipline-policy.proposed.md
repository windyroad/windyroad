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
4. **Disclosure line.** Isolated, single line; any commercial relationship that warrants disclosure for the edition's items. Omitted entirely when there is nothing to disclose.
5. **Provenance line.** Standing, every edition, both personas. States that the edition is AI-drafted, that the reviewers are AI and are never the agent that wrote the draft, and who holds editorial responsibility. Short paragraph rather than a single line. Distinct from element 4 so a reader who has learned that slot means "commercial relationship" does not mis-parse it. The LinkedIn companion carries a compressed variant covering the same three facts. See Amendment 2026-08-03.
6. **Closing reply prompt.** One substantive content-tied question against one of the deep items' threads. Per VOICE-AND-TONE.md LinkedIn carve-outs (P066), distinct from engagement bait.

Cap rule: three deep items is the target; four is a soft cap (justify in `<date>.reviews.md`); five plus requires external review before publish.

### Enforcement surfaces

- `.claude/skills/wr-newsletter/assets/draft-template.md`: contradictory count lines collapse to a single reference to this ADR.
- `.claude/skills/wr-newsletter/personas/leader.md` and `developer.md`: the cap-rule section references this ADR rather than carrying its own count rule.
- Element 5's surfaces: the PROVENANCE slot in `draft-template.md` (between the thesis-first intro slot and Item 1), `SKILL.md` step 11b's body checklist, and `SKILL.md` step 15.5's LinkedIn-post contents list.
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

The fix is confirmed once: (a) this ADR lands, (b) the draft-template + persona configs + SKILL.md Step 11 reference it (single source of truth), (c) the next three editions publish with three deep items unless justified in reviews.md, (d) the critic rubric carries a thesis-coherence check, and (e) the PROVENANCE slot is present in `draft-template.md`, `SKILL.md` step 11b and `SKILL.md` step 15.5, every published edition carries the provenance line before the first `Item` section heading, and Issues 17 and 18 both ship the line in the brief and in the LinkedIn sibling.

## Reassessment

Reassess after four editions: if soft-cap justifications appear more than once per four editions, the cap may be wrong-sized for the genuine signal density; revisit. If thesis-coherence check fires more than once per four editions on round-1 critic, the drafter prompt may need adjustment.

## Related

- Resolves the architect-design blocker on P070 (work-problems iter 8, 2026-05-30).
- Composes with ADR 012 (content review gates), ADR 015 (reader respect + REJECTED policy), ADR 016 (sw-critic iteration), ADR 020 (newsletter-editor subagent), ADR 026 (sibling-file content separation).
- Cross-references VOICE-AND-TONE.md LinkedIn carve-outs landed for P066 (the closing reply prompt's substantive-question rule).

## Amendment 2026-07-24: full-pool-then-theme selection policy

Tom-confirmed 2026-07-24 (Issue 15 prep, re-confirming the 2026-07-20 Issue-14 direction previously held only in the `newsletter-full-pool-then-theme` memory note). This ADR already owns the *resulting shape* (thesis-first intro plus roughly three deep items plus Also-worth-noting); this amendment codifies the *selection path* that reaches it, so the policy has durable substance rather than living only in a decaying memory note and the skill prose.

**Policy.** The deep-item / Also-worth-noting split is decided by a theme chosen across the FULL persona-relevant candidate pool, not by a pre-cut shortlist:

1. Present Tom the complete set of candidates that cleared the three-lens filter, each with a one-line target-reader angle brief. The full inventory, nothing relevant relegated before he sees it.
2. Offer 3-4 candidate themes drawn from across that full set, each with a "why", plus an explicit recommendation.
3. The chosen theme's stories become the Level-1 deep items (this ADR's 3-target / 4-soft-cap / 5+-external-review count still governs); every other persona-relevant story goes to Also worth noting. The theme decides depth, not inclusion. Nothing is dropped before Tom sees it.

**Interaction modality.** The full-pool summary and theme selection are conducted in CHAT PROSE, not `AskUserQuestion`. Long-form content review and full-inventory presentation are the surface P107 identifies `AskUserQuestion` as the wrong tool for (its bounded-option shape forced the Issue-14 inventory out across many question rounds). This is consistent with, not a change to, ADR-037: the 11a theme-anchor Accept / Refine / Reject gate still runs; only its presentation surface may be prose. Modality is not otherwise ADR-governed (the real interaction contract is the still-open P107).

**Why.** In the Issue-14 run the pipeline pre-filtered to a 3-4 item shortlist before theme selection, and the theme "did not pop" because relevant stories (investment governance, the deciding-blind essay, Torvalds, IBM-CEO pressure, the EU AI Act deadline) had been silently relegated; Tom had to pull the full inventory out interactively. Deciding the theme against the full set fixes that (P043 lens-level relevance is preserved; this adds the human-facing selection surface on top).

**Codification home.** `.claude/skills/wr-newsletter/SKILL.md` step 9.7 (new, between 9.5 ranking and step 10 per-item capture), with step 11a composing the anchor for the chosen theme. (The 2026-07-24 wording of move 3 and the closing paragraph, that step 10's per-item Agree/Adjust/Drop capture runs on the theme-driven deep-item set, is SUPERSEDED by the 2026-07-28 correction below: per-item capture runs on the full pool, before theme.) The phantom `ADR-013 Rule 1` / `Rule 6` citations at the 11a gate, the cross-edition CONTRADICTS gate, and the P091 URL-fallback ask were corrected to cite P107 in the same edit (ADR-013 has no numbered interaction rules; it governs the no-automated-LinkedIn-scraping posture only).

**Reassessment.** Reassess with this ADR's existing four-edition trigger: if the full-pool presentation regularly runs long enough to be friction, or if Tom stops adjusting the pool at step 9.7 (implying the pre-9.7 ranking already lands the right set), revisit whether the full-pool surface still earns its cost.

## Correction 2026-07-28: per-item voice capture runs on the full pool, before theme

Tom-directed 2026-07-28 after the Issue 15 run: *"one issue with the new approach was it didn't get my voice on each story. That process we had before was good and we should do that for each IT leader relevant story, then you can go into the new theme process."*

**What this supersedes.** The 2026-07-24 amendment above ordered theme selection first (its move 2), then ran step 10's per-item capture on only the theme-driven deep-item set (its move 3 + closing paragraph). That lost Tom's authorial voice on every story the theme did not promote to a deep item, which for the leader persona is the newsletter's differentiator (JTBD-005). The clause "step 10's per-item capture runs on the theme-driven deep-item set" is REVERSED.

**Corrected selection path (SKILL.md step 9.7, four moves).**

1. Present the full persona-relevant pool (prose).
2. **Capture Tom's per-item Agree / Adjust / Drop voice on EVERY story in the pool, before any theme is chosen.** His Adjust free-text per story feeds the drafter whether the story becomes a deep item or an Also-worth-noting entry. This restores the process recorded in the `feedback_per_item_interactive_voice` memory, now applied to the full pool.
3. Offer 3-4 themes with a "why" plus a recommendation (prose), informed by Tom's per-story reactions from move 2.
4. On the theme pick, promote the fitting stories to deep items; the rest carry their move-2 capture into Also worth noting. The theme still decides depth, not inclusion; the three-deep count rule is unchanged.

**Interaction modality (refines the 2026-07-24 clause, does not reverse it).** The full-pool PRESENTATION (move 1) and the theme rationale (move 3) stay prose per P107. The per-item bounded three-option capture (move 2) may use `AskUserQuestion` (the process Tom values, per `feedback_per_item_interactive_voice`) or prose if he is running the edition conversationally. P107's Issue-14 failure was the full INVENTORY dragged out via `AskUserQuestion`; showing the inventory in prose first removes that, so the bounded per-item decision keeps its `AskUserQuestion` option.

**Unchanged.** The three-deep shape (3-target / 4-soft-cap / 5+-external-review), ADR-037's 11a theme-anchor gate, and the "nothing dropped before Tom sees it" invariant all hold.

## Amendment 2026-08-03: standing provenance line (element 5)

Tom-confirmed 2026-08-03 (Issue 16 finalise). Every edition carries a standing provenance disclosure, in a slot distinct from element 4's per-edition commercial disclosure.

**Why voluntary.** EU AI Act Article 50(4) requires deployers publishing AI-generated text "with the purpose of informing the public on matters of public interest" to disclose it, but exempts content that "has undergone a process of human review or editorial control and where a natural or legal person holds editorial responsibility for the publication of the content". Our reading, which is not advice and has not been tested, is that Windy Road sits in that exemption, and that the territorial hook is weak besides. We are treating the disclosure as a credibility decision, not a compliance one, and **the published line must not assert a legal position**: an earlier Issue 16 draft claimed the exemption in-body and was cut, because Item 2 of the same edition tells readers the scope test comes first and the line skipped it.

**Why it earns its place.** The Shift's recurring argument is that humans belong on the loop rather than in it. The publication is produced by that arrangement, so stating it converts the argument into a worked example. The line also states honestly which part is not yet automated, per the transitional position published in Issue 06 ("keep review running until the machinery holds the line on its own, then ease it back").

**Issue 16 text as shipped.** Brief, inside the From Tom block:

> *Disclosure, new this week, though the practice is not. The Shift is drafted by AI, and a different AI reviews it, never the one that wrote the draft. I pick the stories, set the argument and hold editorial responsibility for what follows. I still read every line, and the work is to move that check onto the AI that reads the draft, not to end it.*

LinkedIn companion, compressed:

> Disclosure, new this week, though the practice is not: AI drafts this newsletter and a different AI reviews it, never the one that wrote it. I set the argument, hold editorial responsibility, and still read every line.

The compression is instructive: the companion drops the forward-looking clause entirely and keeps only the three facts the element requires.

**Constraints learned at Issue 16.** The line is **first person**, and the pronoun settled only after several review rounds. The deciding argument is narrow: "we still read every line" sitting immediately after "a different AI reviews it" leaves "we" ambiguous about whether it includes the machines, which is unaffordable in the one paragraph whose job is naming who is accountable. First person also reads stronger than self-naming, which in a bylined publication distances the author at the moment the copy claims responsibility. The editorial "we" continues to carry the publication's positions everywhere else; the disclosure draws no we-versus-I distinction, because making the pronoun load-bearing is what caused the churn. Permission for the pronoun comes from the element-5 carve-out recorded below, not from where the line sits, so moving it does not change what is allowed. Placement is decided separately and on different grounds: **inside the From Tom opener, after the thesis-first intro and immediately before the first item**. A footer placement interrupts the landing and reaches only readers who finish the Also-worth-noting section, and the disclosure is most load-bearing for readers who never get that far. Do not call the publication "the brief" in reader-facing copy. State retrospective-loop claims as intention, not accomplished fact.

**Deferred, not decided.** Whether the provenance policy warrants its own ADR spanning all AI-generated outbound surfaces (ADR-012 enumerates that scope in its Reassessment section at line 95) is open; this amendment covers newsletters only. Also deferred: a deterministic check (h) asserting the line's presence, the ADR-032 confirmation criterion (b) persona-config references, and the leader-side JTBD gap the JTBD review raised (no documented job covers content-provenance trust; a new job needs human ratification per the upstream agent-plugins decision-delegation contract).

**Voice carve-out.** Element 5 is first person on both surfaces. In the brief that is already permitted, because the slot sits inside the From Tom opener. On the LinkedIn companion there is no From Tom opener, so the permission is recorded explicitly in `SKILL.md`'s step 11b Voice rules (the team-voice bullet) and at line 31 of both persona configs. This is consonant with ADR-010 rather than an exception to it: ADR-010's Consequences section (line 92) already holds that on social posts "'I' remains acceptable for personal observations", and a first-person accountability statement is nearer a personal observation than service copy. What ADR-010 does not do is reach newsletters at all: its Confirmation section enumerates service copy, metadata, credentials, testimonials, blog articles, FAQ and external threat copy. The binding rule for newsletter surfaces is therefore the skill files, which is why the carve-out is recorded there and not by amending ADR-010.

**Interaction with P120 (gate remediation loops).** P120 proposes lifting the editor and skeptic gates from single-shot to remediate-then-re-gate. Two constraints follow for element 5. First, the provenance line is **remediation-invariant**: a gate loop may flag it, but may not silently rewrite it, because its wording is ADR-governed rather than per-edition editorial. The staleness this amendment corrects was produced by exactly that drift operating manually, when six external-review rounds superseded a text this ADR had already quoted; automating the loop raises the frequency. Second, the deferred deterministic check (h) gains a sharper spec and a higher priority: it must assert the line is present **before the first `Item` section heading**, not merely present somewhere, because a presence-anywhere check written against the old footer placement would pass a footer-placed line, which is now wrong. That spec is brief-only by construction. The LinkedIn companion's placement (after the item bullets, before the CTA) is prose-enforced at `SKILL.md` step 15.5 only, with no deterministic backstop; if check (h) is built, extending it to the sibling is the cheap second half. Under P120's loops, check (h) becomes the only mechanism that catches loop-induced drift, so it should be built with the loop rather than after it.

**Compendium is knowingly partial.** `docs/decisions/README.md`'s ADR-032 entry has been hand-edited only to drop two phantom Related references (ADR-066, ADR-031) that this amendment removes from the body, and to add ADR-010, which this amendment newly cites. Its Decides and Confirmation summaries predate this amendment and do not mention element 5. Regenerating is blocked by P087 (the upstream generator emits em-dashes that trip this repo's no-em-dash hook), so the entry is deliberately left partial rather than hand-diverged further.

**Not done:** a discoverability pointer in ADR-010's Confirmation section was considered and declined. It would make ADR-010 a changed body needing its own compendium touch under P087, to signpost a rule already recorded at the three point-of-use surfaces a drafter reads.
