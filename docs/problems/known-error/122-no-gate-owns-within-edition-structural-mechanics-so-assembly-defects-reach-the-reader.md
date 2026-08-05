# Problem 122: No gate owns within-edition structural mechanics, so assembly defects reach the reader

**Status**: Known Error
**Reported**: 2026-08-05
**Priority**: 12 (High), Impact: 3 x Likelihood: 4, derived at capture from the description. Impact is 3 because assembly defects degrade the read for every reader (an item run that fights its own thesis, a close that does not discharge the headline) without shipping anything factually wrong. Likelihood is 4 because every edition is assembled fresh and no gate reads for assembly, so the defects are detected only if a human happens to notice. Unchanged at the Known Error transition: investigation confirmed the mechanism rather than resizing it.
**Origin**: internal
**Effort**: L, re-rated 2026-08-05 at the Known Error transition (was M). The capture-time M assumed one agent-prompt extension plus one ADR amendment. Investigation settled a larger shape: a new agent sweep, amendments to **three** ADRs rather than one (020, 042, 043), three SKILL.md edits, a remediation-invariance carve-out against two further ADRs, plus a small deterministic-lint addition with its vitest sibling for the one axis half that is mechanically computable. Single repo, no migration, no cross-package work, and the design is fully specified, so L rather than XL. The dominant remaining cost is a wait on one ratification, which is not dev effort and is not what the Effort divisor measures.
**WSJF**: 6.0 = (12 x 2.0) / 4. Unchanged from capture: the Effort re-rate M to L and the Open to Known Error status-multiplier change cancel exactly.

## Description

The `wr-newsletter-editor` gate has five craft axes, verified on disk in ADR-020: `opener-earns-thesis`, `fold-compression`, `audience-pointer-specificity`, `sentence-rhythm`, `atwn-thesis-fit`. None of them reads how the edition is **assembled**: whether the item order serves the thesis, whether the close discharges the claim the headline makes, whether content is duplicated across sections, or whether cross-references point backward rather than forward. A grep across `.claude/agents/wr-newsletter-*.md` and `newsletter-critic-rubric.md` for "item order", "ordering", "title" and "forward reference" returns nothing on the first, second and fourth.

**Evidence: The Shift Issue 16 (published 2026-08-03).** Eight findings in this class, all raised by Tom or his external reviewer after the gate battery terminated:

1. **Item order did not serve the thesis.** The run was court ruling, project policy, regulation-in-force, industry letters, so the descent from binding to non-binding stumbled in the middle. Reordering to put the two legally binding rules together made the last item's own heading ("not one of them binds anybody") earn its position.
2. **The close did not pay off the title.** The headline claimed "the good ones govern the system". The body delivered three candidates and the close never collected them, so the reader finished on a different question from the one the cover promised.
3. **A promoted argument lived in the demoted section.** The kill-switch bill did load-bearing work in the closing argument while sitting in Also worth noting, which no prior edition had done.
4. **An item broke its own signposting.** Item 4's "Why it matters" promised "two things follow" and then immediately deferred with "before either, note...", handing the reader a third thing first.
5. **A section heading promised what its contents did not deliver.** The dated section was headed "December 2, and two other dates worth a diary entry" when two of its three entries had no date at all.
6. **The same fact carried opposite valence in two places.** Item 4's heading deflated the industry letters for binding nobody; the closing paragraph treated the same non-bindingness as the point, roughly 3,000 words later, without resolving the tension.
7. **Content was told twice at near-full length.** The December 2 material appeared in Item 2's bullet and again in the dated section, including the same citation.
8. **A bullet listed where it should have argued.** The GCC bullet in the LinkedIn post stated the fact but never scored it against the post's own checkable question.

## Root cause

The gates are organised around **content axes**, not assembly. Voice reads register. Content-risk reads claim safety. The critic reads argument quality. The editor reads reader experience and craft at the passage level. The skeptic attacks claim-evidence calibration. Cross-edition reads thesis continuity against prior editions.

Assembly is the seam none of them covers: it is a property of how the parts relate to each other and to the headline, not of any part in isolation. Every one of the eight findings above is invisible when reading a passage on its own and obvious when reading the edition as a whole against its own promises.

The editor gate is the closest owner. Its `opener-earns-thesis` axis is adjacent to finding 2 but points at the opener rather than the close, and its `atwn-thesis-fit` axis is adjacent to finding 3 but asks whether an entry fits the thesis, not whether a demoted entry is carrying promoted weight.

## Symptoms

Editions read as a set of well-made parts that do not add up: the item run fights its own logic, the close lands somewhere the headline did not point, sections repeat each other, and references ask the reader to hold a promise forward. All caught by human reading, none by a gate.

## Workaround

Tom or the external reviewer reads the edition end to end as a reader would and notices what the passage-level gates cannot.

Cheaper interim form, usable by the drafter without a code change: at SKILL.md step 15.37, before remediating, read the assembled body once against its own H1 and its own section labels and ask the four axis questions by hand. This detects nothing on its own and so does not close the ticket, but it moves the whole-edition read left of the reviewer and costs no invocation, because the body is already in context at that step.

## Impact Assessment

- **Who is affected**: readers (the edition reads as less than the sum of its parts); Tom and the external reviewer (carry the whole-edition read manually).
- **Frequency**: every edition, since assembly is re-done each week and no gate reads for it.
- **Severity**: no factual error ships. The cost is a weaker read plus the review rounds spent re-assembling after the fact.
- **Analytics**: none.

## Root Cause Analysis

Root cause confirmed 2026-08-05. The reported mechanism holds: the gate battery is partitioned by content axis and no partition owns how the parts relate to each other. Two corrections to the capture-time framing came out of grounding it on the artefacts rather than on the retro's recollection, both recorded below.

### Reproduction

The fixture is a **pair** of commits, not a single artefact, because assembly is a property of a whole edition and the defect is only legible as a diff of two assemblies.

- **Pre-revision**: commit `d2d674a` (`docs(newsletter): The Shift Issue 16 finalise (publish-ready, author-corrected thesis)`). This is the pipeline's own declared publication-ready state, after the full gate battery terminated and before `b39d680` applied the reviewer's revisions.
- **Post-revision**: `src/newsletters/published/leader/2026-08-03/2026-08-03.md`, the hand-remediated edition that shipped.

| Check | `d2d674a` | Published | Reads on |
|---|---|---|---|
| Item run | Item 1 GCC project policy, Item 2 EU regulation in force, Item 3 industry letters, Item 4 German court ruling | Item 1 German court, Item 2 EU, Item 3 GCC, Item 4 industry letters | finding 1 |
| Dated forward slot | absent from the `### ` heading inventory | `### Four months out: December 2, Suno's appeal, and a US framework` | finding 5 |
| Close | does not collect the headline's candidates | `Three of the week's moves have the shape:` then names all three | finding 2 |
| Demoted entry carrying weight | kill-switch entry sits in Also worth noting, unacknowledged | close names it in place: `the kill-switch bill in Also worth noting` | finding 3 |

**Correction 1 to the ticket's own prose.** The Description states the pre-revision run was "court ruling, project policy, regulation-in-force, industry letters". On disk it is project policy, regulation-in-force, industry letters, court ruling. The defect is worse than described, not better: the two legally binding rules (Item 2 EU, Item 4 court) sat either side of the non-binding item whose own heading reads `not one of them binds anybody`. The finding stands; the ordering recalled in the ticket does not. Ticket prose is a hypothesis; the artefact is the fact.

**Correction 2: not every finding is reproducible at `d2d674a`.** Findings 3 and 5 arose against **intermediate** revision states between `d2d674a` and `b39d680`, not against the declared-ready body. The dated section did not exist at `d2d674a` at all, so the heading that misdescribed its contents could not have. This is a scoping fact, not a weakening: it means the gate has to run on each revised body, which SKILL.md section 15.6 already mandates and which ADR-043 conditions (b) and (c) already bound. It is also why the fixture is a commit pair rather than one file.

**The published close is the answer to Investigation Task 4 in working form.** The kill-switch entry legitimately stayed demoted; what changed is that the close acknowledged it was reaching down. A stated reason resolved the finding without a restructure. That is the shape the gate should require.

### Investigation Tasks

- [x] **Sequencing gate: do not start before P120 lands.** Satisfied as far as code goes and NOT satisfied as far as decisions go, and the distinction is the blocker. P120's fix shipped as commit `e7d115c` on 2026-08-05: ADR-043 plus SKILL.md step 15.37, both read at investigation time. But for a decision, "lands" means ratified, not committed. ADR-043 carries `human-oversight: unconfirmed` and is the only decision in `docs/decisions/` that does. See "Why the fix is not proposed in this iteration".
- [x] **Decide the home: extend the editor, or add a sibling whole-edition pass.** **Extend the editor**, as a third in-invocation sweep (a new agent-file Step 4.6 alongside the existing Step 4 reader-experience pass and Step 4.5 craft pass). Neither a new subagent nor, mostly, a deterministic lint. Four grounds, in descending strength:
  1. **ADR-042 assigns this work to the editor by name.** Its Decision Outcome states verbatim that "Through-line, cross-edition continuity, and so-what actionability are NOT axes: they are prompt-tightening follow-ups on the editor, cross-edition-consistency, and critic gates (P116)". Item-order-serves-thesis is through-line read across the item run. This is a direct on-disk assignment, not an analogy.
  2. **The test is stance, not scope.** ADR-035 partitions gates by axis and stance. Assembly reading is receptive whole-edition reading, which is the stance the editor already holds. The editor already carries whole-edition relational axes in its pinned vocabulary: `through-line`, `item-count-proportionality`, `atwn-thesis-fit`. Assembly is the under-specified tail of an axis set it already owns.
  3. **Zero new invocations for the sweep itself**, which matters because ADR-020 reassessment criterion 6's ceiling of roughly 15 subagent invocations per issue is recorded by ADR-043 as already breached at roughly 25, with its replacement an open Tom-direction question. A sibling agent would cost four more invocations per issue once the 15.37 loop re-invokes it. (The sweep is free; the loop is not. See Fix Strategy section 5.)
  4. **P081 is the amendment-mechanics precedent, not the placement authority.** The 2026-06-17 ADR-020 amendment resolved new-agent-versus-extend as EXTEND under recorded Tom-direction, and established that in-place vocabulary extension is an amendment rather than a supersession. It is **not** univocal precedent for placement: five weeks later ADR-042 Considered Option 2 rejected absorbing the skeptic into the editor on ADR-035 grounds, because it "folds an adversarial 'break it' stance into a gate whose documented job is to simulate a receptive reader". That rejection turned on stance, which is why ground 2 is the load-bearing one and P081 is cited only for how the amendment is written.
- [x] **Define the axes.** Four, not six. The candidate list in the Description collapses once each finding is traced to an owner, and two of the eight findings turn out not to be assembly at all.

  | Axis | Covers | Anchor |
  |---|---|---|
  | `item-placement` | findings 1, 3: does the item order serve the stated thesis; does any demoted-section entry carry promoted-section weight | JTBD-005 outcomes 3 and 4 |
  | `close-collects-the-so-what` | finding 2 | JTBD-005 job statement plus outcome 3 |
  | `signpost-promises-match-contents` | findings 4, 5: does every section heading, item label and in-body signpost describe what actually follows | JTBD-005 outcome 1 plus the "little time to keep up personally" persona constraint |
  | `edition-internal-consistency` | findings 6, 7: is any content told twice at near-full length; does any fact carry opposite valence in two places | JTBD-005 outcome 1 and JTBD-200 outcome 1 (duplication); job statement plus outcome 3 (valence) |

  **Finding 8 is not an assembly finding.** A LinkedIn-post bullet that lists where it should argue is the skeptic's `promise-payoff` axis on `artifact_kind: linkedin-post`, already in charter at step 15.55 and already running. It is a calibration miss, not a coverage gap, and needs no new axis.

  **Finding 7 splits.** Its "same citation in two places" half is mechanically computable: `scripts/check-newsletter-structure.sh` already delimits items by `### ` heading and already extracts per-item markdown-link URLs for checks (a) and (b), so a duplicate-URL-across-sections check is a small addition to machinery that exists. ADR-042 assigns structural and format hygiene to that lint and explicitly out of the LLM gates' axis sets. Only the "told twice at near-full length" judgement stays with `edition-internal-consistency`.

  **The axis named in the capture list as "does every cross-reference point backward" is dropped.** Its motivating case (finding 4) is a broken in-body signpost, which `signpost-promises-match-contents` covers. A standalone direction-of-reference axis would fire on legitimate forward pointers, which the published edition uses deliberately.

  **One axis was re-worded on JTBD review and the re-wording is load-bearing.** The candidate `close-discharges-headline` makes the **headline** the authority the body must satisfy. No documented job or persona records a title-payoff outcome, and worse, the cheapest remediation it licenses is strengthening the close to match the title. That is exactly the claim-strengthening ADR-043's skeptic differential forbids, and under ADR-043 there is no override arm, so it would land as an applied edit to reader-facing prose. `close-collects-the-so-what` inverts the authority: the **body** is the authority, the axis asks whether the close collects the so-what the body actually delivered and whether the headline describes that, and remediation resolves by collecting what is there or by narrowing the headline, never by inflating the close. Fully grounded on JTBD-005 with no JTBD change required.
- [x] **Decide finding-vs-advisory per axis.** Not per axis. Per **remediation grain**, which is the same rule that answers the next task, and it needs three exemption limbs. See Fix Strategy section 3. The short form: an assembly finding whose minimal remediation would move or delete content across an item or section boundary is stop-and-surface; one remediable inside a single passage remediates normally. The "stated reason" the ticket asks for is the ADR-043 residual-advisory record, which already carries axis, passage and suggested fix and already surfaces to Tom. No new mechanic, and specifically no author-override arm, which ADR-043 Considered Option 5 rejected.
- [x] **Check the interaction with P113's stop rule.** The collision is real and the stop-and-surface classification dissolves it without touching P113's shipped bound. ADR-043 step 15.37 rule 2 says "do not restructure the piece around a finding"; reordering four items and repairing every cross-reference is precisely a restructure, so an item-order finding cannot be remediated inside the one-round cap by construction. Classifying it stop-and-surface means it does not consume the round, which is the same treatment ADR-043 already gives a skeptic finding that cannot be remediated without new sourcing. **P113 needs no change.** What ADR-043 does need is a rule the strategy adds: when every collected finding is stop-and-surface, skip the paired re-invocation entirely and record the residuals directly, because re-running two gates against an unchanged body buys nothing and costs four invocations per issue against a ceiling already breached.

### Why the fix is not proposed in this iteration

One direction call blocks the build. It is category-1 and it is Tom's. It is recorded here so the next iteration does not re-derive it.

**ADR-043 is unratified.** `wr-architect-is-decision-unconfirmed ADR-043 docs/decisions` exits 0, and ADR-043 is the only decision in `docs/decisions/` carrying `human-oversight: unconfirmed`. The substance-confirm-before-build guard in `/wr-itil:manage-problem` fires, and here it fires on more than a technicality: the fix rests on three specific ADR-043 choices that a human ratification could move.

1. **The one-round cap.** ADR-043's own reassessment criterion 1 reads "Raise the cap to two before considering any other change; the cap was chosen as a minimum, not as a ceiling." The whole stop-and-surface classification is calibrated to a cap of one. At two, cheap assembly findings could remediate and re-check, and the classification would want re-drawing.
2. **The no-author-override arm.** The claim that the residual-advisory record IS the stated reason Investigation Task 4 asks for is true only while ADR-043 Considered Option 5's rejection stands. If Tom reinstates an override arm at ratification, the answer to that task is a different answer.
3. **Stop-and-surface does not consume the round.** This mechanic exists only in ADR-043, and the fix extends it with a third class.

Beyond those three, the fix would **amend ADR-043's stated contract** twice over: a third stop-and-surface class, and a widened 15.37 collect source. Building it now stacks an unconfirmed decision on an unconfirmed decision, which is the guard's case exactly. It is the same blocker that stopped P121 one iteration earlier, on the same surface, for the same reason.

**A cheaper path exists and is Tom's to take, not the agent's.** Rather than ratifying ADR-043 and then being handed an amendment to it, the third stop-and-surface class plus the skip-the-paired-re-invocation rule could be folded into ADR-043's body **before** ratification, so one coherent remediation contract is ratified in one event. That is recorded as an option, not taken: editing an unconfirmed decision's substance ahead of ratification changes what Tom is asked to ratify, which is the thing the guard exists to prevent.

**One precondition P121 carries does NOT apply here, and that is the second place these two tickets diverge.** P121 was additionally blocked on whether a stable weekly shape is a documented reader benefit, because its axes had no anchor once the cross-edition-familiarity claim was removed. P122's four axes each have an independent reader anchor in JTBD-005 (see the axis table above). Tom's framing for both tickets ("what would we need to change to require less feedback from me and the external reviewer") is the **motivation** here, not the **warrant**; review-load reduction is a downstream consequence. The corpus gap P121 records is real, pre-existing and shared, and it stays open: `docs/jtbd/` models three personas and all three are readers, so there is no author or operator job for review-load reduction. It just does not gate this ticket. Carry the rule forward: any future axis whose only justification is "this reduces Tom's review rounds" is ungrounded and must be blocked until an author persona is added and ratified.

No RFC is created in this iteration. Per ADR-022's corrected semantics, Known Error means root cause identified and workaround documented with the fix **not yet proposed**; the fix proposal happens after Known Error and is what produces the RFC. An RFC scoped now would be scoped against an unresolved ratification.

## Fix Strategy

Settled shape, blocked on the precondition below. Not yet proposed as an RFC.

### 1. A third sweep inside the existing editor invocation

New Step 4.6 in `.claude/agents/wr-newsletter-editor.md`, after the Step 4.5 craft pass, reading the SAME brief body a third time as a whole-edition assembly read. Its four weaknesses feed the existing `EDITORIAL_CRAFT` block, so the output contract grows by four axis names and nothing else. The agent's `## Hard rules` "Return ALL findings on every axis in a single pass" rule extends to the new axes without change; so does its no-rewriting rule.

The agent file's line 190 hard rule ("No further axes, reader-experience or craft, without amending ADR 020") enforces this at the agent as well as by convention, so the ADR-020 amendment is a precondition of the agent edit, not a follow-up to it.

### 2. The four axes and their boundaries

Definitions and anchors are in the Investigation Tasks axis table. Three boundaries have to be written into the agent file or they will collapse into sibling gates:

- **Against `atwn-thesis-fit`.** That axis asks whether a demoted bullet fits the thesis. `item-placement` asks whether an entry is in the right tier and whether the run is in the right order. An entry can fit the thesis perfectly and still be mis-tiered, which is finding 3 exactly.
- **Against the skeptic's `promise-payoff`.** ADR-042 pins that axis to "every story the opener, preview, or fold names must be resolved in the body". The seam to declare: the skeptic's is **evidential** (is the named thing actually delivered as substance), the editor's `signpost-promises-match-contents` is **navigational** (does the label describe what physically follows it). Finding 5 is cleanly navigational. Finding 2 is the contested case and must be argued in the amendment rather than assumed, because a close that does not collect what the headline promised is readable as either.
- **Against the P089 deterministic lint.** Duplicate-citation detection goes to the lint per Fix Strategy section 4; only the near-full-length duplication judgement stays with `edition-internal-consistency`.

Advisory to record as an accepted trade in the ADR-020 amendment, with a reassessment trigger, as the P081 amendment did for its own expansion: this takes the editor's pinned vocabulary from 5 craft plus 5 reader-experience axes to 9 plus 5. That is not an ADR-035 violation, but ADR-035 exists because check accumulation was the failed path (38 checks), and ADR-020's Bad consequences already warn that adding gates becomes the default response to recurrence.

### 3. Remediation classification: one rule, three exemption limbs

**Base rule.** An assembly finding whose minimal remediation would MOVE or DELETE content across an item or section boundary is **stop-and-surface**: recorded immediately as an ADR-043 residual advisory, not consuming the round. One remediable inside a single passage (a heading rename, a re-collected close, a valence clause) remediates normally within the existing one-round cap. This mirrors ADR-043's existing new-sourcing stop-and-surface rule and its "Bounded by ADR-032" clause.

**Limb (a): ADR-governed text is stop-and-surface regardless of grain.** The base rule keys only on remediation grain, so an in-passage reword classifies as remediate-normally. That is wrong for the standing provenance line: ADR-032's Amendment 2026-08-03 records it as **remediation-invariant**, "a gate loop may flag it, but may not silently rewrite it, because its wording is ADR-governed rather than per-edition editorial". Two of the four axes reach it. The line sits inside the From Tom opener before the first `### Item`, so `signpost-promises-match-contents` can flag its placement, and by ADR-032's own design the brief and the compressed LinkedIn variant state the same three facts in different words, which is a duplication `edition-internal-consistency` will see. Both are stop-and-surface.

**Limb (b): the theme anchor is remediation-invariant.** `close-collects-the-so-what` names a mismatch with two remediation directions, and one of them reaches a Tom-approved artefact. The H1, cover hook lines and theme statement are approved at ADR-037's 11a gate, and its pinned sub-decision 2 makes the `11a-prime` re-confirm gate always run at finalise. Remediation is **close-side only**. A finding dischargeable only by changing the anchor is stop-and-surface, routed back to the 11a or 11a-prime gate rather than edited in the loop, or an automatic anchor edit would silently discharge an approval gate ADR-037 pins.

**Limb (c): remediation direction is deflationary on three of the four axes.** Each of `close-collects-the-so-what`, `signpost-promises-match-contents` and `edition-internal-consistency` has a cheap remediation that inflates. Collect what the body delivered or narrow the headline, never inflate the close. Fix the heading to describe the contents, never change the contents to match the heading. Acknowledge and resolve a valence tension, never delete the deflating reading to make the edition read cleaner. ADR-043's loop has no override arm, so an inflating default becomes an applied edit to reader-facing prose, and JTBD-205 outcome 4 ("a default skeptical stance that nonetheless lets through what is genuinely ready") is what it would run against.

### 4. The deterministic half

A new check in `scripts/check-newsletter-structure.sh` asserting no markdown-link URL appears in two different `### `-delimited sections of the brief, with its `.test.mjs` sibling case taken from the `d2d674a` fixture. Costs zero invocations, honours ADR-042's assignment of structural hygiene to this lint, and narrows `edition-internal-consistency` to the judgement half.

**Open question to settle when this is built, not now**: ADR-032's Amendment 2026-08-03 says its deferred check (h) "should be built with the loop rather than after it", because under the loop check (h) becomes the only mechanism that catches loop-induced provenance drift. Limb (a) above makes provenance findings stop-and-surface, which reduces but does not remove that exposure (the loop can still move text around the line). Whether this work depends on (h) existing, or merely raises its priority, needs stating in the ADR-020 amendment.

### 5. Loop cost, and the invocation rule the fix must add

The "zero new invocations" claim is true only of the sweep. It is **false of the loop**, and the correction matters because the ceiling it lands on is already breached.

Because the new axes go into `EDITORIAL_CRAFT`, ADR-020's mechanical verdict makes **any** craft weakness force `NEEDS_EDITORIAL_REVISION`. A stop-and-surface assembly finding is unremediable by construction, so it survives every round, and step 15.37 as written still fires the paired re-invocation against an unchanged body: two invocations per phase, four per issue, for zero body delta. P122's own Description says these defects occur every edition. At weekly cadence, ADR-043's roughly-25 worst case stops being the tail case and becomes the standing case, on a ceiling (ADR-020 reassessment criterion 6, roughly 15) already breached and whose replacement is an open Tom-direction question.

**Rule the fix adds to step 15.37**: when every collected finding is stop-and-surface, skip the paired re-invocation and record the residuals directly.

**Second-order effect to record in the ADR-020 amendment**: an axis that can never be remediated means the editor can never return `PASS` on an edition carrying one. That will trip ADR-020 reassessment criterion 4 (Tom repeatedly overriding `NEEDS_EDITORIAL_REVISION` without rewriting) as a **false positive**. The criterion's remedy is recalibrating the persona grounding, which would be the wrong fix; say so in the amendment so a future reassessment does not act on it.

### 6. Decision record: three amendments, no new ADR

No new ADR. The home is an existing gate, ADR-020 confirmation criterion 1 explicitly permits amendment ("Format changes require amending or superseding ADR 020"), and P081 is the worked precedent for in-place vocabulary extension being an amendment rather than a supersession.

- **ADR-020**: the four new craft-axis names, the verdict mechanic folding them in additively, the accepted-trade note on vocabulary growth with a reassessment trigger, the criterion-4 false-positive note, and the check (h) dependency answer.
- **ADR-042**: one line in its boundary-partition list declaring the evidential-versus-navigational seam against `promise-payoff`. The ticket's capture-time assumption that ADR-042 needed no change was wrong. ADR-042 declares its partitions expressly "so a future retro can detect collapse", and both its own boundary-collapse trigger and ADR-020 reassessment criterion 2 fire when the editor and skeptic flag the same passages. Shipping two overlapping promise-payoff surfaces without a declared seam re-opens the boundary ADR-042 pinned.
- **ADR-043**: the third stop-and-surface class, the widened 15.37 collect source, and the skip-the-paired-re-invocation rule. Best folded into the body before ratification rather than appended after; see "Why the fix is not proposed in this iteration".

`docs/decisions/README.md` must be hand-edited rather than regenerated: P087 records that the upstream generator emits em-dashes that trip this repo's no-em-dash hook, and ADR-032's amendment records its own compendium entry as knowingly partial for that reason. Say so in the amendment so the divergence stays deliberate.

### Preconditions

1. **ADR-043 ratified** via `/wr-architect:review-decisions`. The only precondition. Optionally fold Fix Strategy section 3's base rule and section 5's invocation rule into ADR-043 first, so one contract is ratified once.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none). P120's code landed at `e7d115c`; what remains is a ratification, which is recorded as a precondition rather than a ticket dependency because no ticket owns it.
- **Composes with**: P120, P121, P117, P113, P116

## Related

- **P120** (`docs/problems/verifying/120-editor-and-skeptic-gates-surface-findings-to-tom-instead-of-remediating-them.md`): same gate, different root cause. P120's cause is the routing contract (the gate detects correctly and hands the finding to Tom); this ticket's cause is coverage absence (five craft axes exist and none reads assembly). This ticket is sequenced behind it.
- **P121** (`docs/problems/known-error/121-no-gate-compares-an-edition-against-the-prior-editions-shape-so-pattern-breaks-reach-the-reader.md`): sibling by shape, distinct by input. Both are "no gate owns X" and both sequence behind P120. P121 is **cross-edition**: it needs the prior edition's artefact to detect anything, and targets the ADR-038 cross-edition gate. This is **within-edition**: every one of the eight findings is detectable from Issue 16 in isolation, and it targets the ADR-020 editor gate. The `wr-itil:hang-off-check` arbitration (2026-08-05) returned PROCEED_NEW on exactly that distinction, and recommended `/wr-itil:review-problems` consider a common "gate-coverage gaps sequenced behind P120" cluster at the next pass.
- **P117** (`docs/problems/verifying/117-tighten-newsletter-gate-prompts-for-lower-frequency-external-review-classes.md`): the prior round of editor-prompt tightening, fix released and verifying. Its delivered per-bullet ATWN sweep demonstrably WORKED on Issue 16 (it caught the two off-thesis entries); the failure was that the finding was not acted on, which is P120's surface. So this is post-fix-released discovery of a different class, not scope P117 named.
- **P116** (`docs/problems/verifying/116-newsletter-gates-lack-adversarial-ceiling-gate-external-review-still-finds-substance-issues.md`): finding 8 (a bullet listing where it should argue) is adjacent to the skeptic's promise-payoff facet, but the other seven are presentation and assembly rather than claim-evidence.
- **P113** (`docs/problems/known-error/113-newsletter-review-gate-loop-editor-one-nit-per-pass.md`): the round-cap and stop-rule design must account for assembly findings being structurally expensive to remediate.
- **ADR-020** (`docs/decisions/020-newsletter-editor-subagent.proposed.md`): pins the five craft axes and, at reassessment criterion 6, the roughly-15 subagent invocation ceiling. Its Amendment 2026-06-17 (P081) is the precedent for how the vocabulary is extended in place. Confirmed; amendable.
- **ADR-042** (`docs/decisions/042-newsletter-adversarial-skeptic-gate.proposed.md`): three separate loads on this ticket. It assigns through-line prompt-tightening to the editor (the strongest ground for the home decision), it pins `promise-payoff` to the skeptic (the seam this fix must declare), and it assigns structural and format hygiene to the P089 deterministic lint and explicitly out of the LLM gates' axis sets (which is why finding 7 splits). Its Considered Option 2 rejected absorbing the skeptic into the editor on stance grounds, which is why the home decision turns on stance rather than on the P081 analogy.
- **ADR-043** (`docs/decisions/043-bounded-editorial-remediation-loop-for-editor-and-skeptic-gates.proposed.md`): the decision P120 shipped as, and the sole precondition. Its step 15.37 is where assembly findings route, its residual-advisory arm is the "stated reason" mechanic, and three of its choices are load-bearing for this fix. Currently `human-oversight: unconfirmed`.
- **ADR-032** (`docs/decisions/032-newsletter-editorial-discipline-policy.proposed.md`): records the provenance line as remediation-invariant (limb (a)) and defers the check (h) whose priority this work raises.
- **ADR-037** (`docs/decisions/037-compose-newsletter-theme-anchor-before-body.proposed.md`): pins the H1, cover hook and theme statement behind the 11a and 11a-prime approval gates, which is limb (b).
- **ADR-035** (`docs/decisions/035-critic-rubric-shape-is-strengths-weaknesses-plus-context.accepted.md`): the coverage-partitioning driver. It partitions by axis and stance, not by axis count, so extending within the editor's own stance is not a breach. Its 38-check history is why vocabulary growth is recorded as an accepted trade rather than passed over.
- **P089**: built `scripts/check-newsletter-structure.sh`, the lint that takes the duplicate-citation half of finding 7.
- **JTBD-005** (`docs/jtbd/engineering-leader/JTBD-005-stay-ahead-of-the-shift.proposed.md`) and **JTBD-200** (`docs/jtbd/developer/JTBD-200-signal-from-noise.proposed.md`): the live persona anchors, both ratified. The motivating evidence is `persona=leader`, so JTBD-005 carries the grounding; JTBD-200 grounds only the developer arm of the duplication clause. JTBD-001 through JTBD-004 were retired by ADR-041 on 2026-07-10 and must not be cited. Honesty note carried from the JTBD review: no outcome in the corpus uses assembly vocabulary, so each anchor is an instrumental inference from a documented outcome. That is legitimate but is a longer chain than `fold-compression` had, which is why the axis table records the anchor per axis rather than leaving the derivation to the agent prompt.
- Reproduction fixture: the commit pair `d2d674a` (pre-revision, declared publication-ready) against `src/newsletters/published/leader/2026-08-03/2026-08-03.md` (post-remediation). Neither alone is usable: the published edition is the corrected assembly, and `d2d674a` does not carry findings 3 or 5.
- **Upstream report pending** -- false positive; detection misfire. The P063 external-root-cause scan matches "external reviewer" throughout this ticket's prose, where it names a human editor rather than an upstream dependency. There is no upstream repository and nothing to report. Recorded rather than auto-filed, matching the same disposition on P121.
- Gate reviews at the Known Error transition (2026-08-05): architect ISSUES FOUND, jtbd ISSUES FOUND. Every finding from both is folded into the Fix Strategy above rather than deferred, and each cited artefact was verified on disk before propagation (P082). The architect's five substantive corrections were the ADR-043 ratification blocker, the ADR-032 provenance limb, the ADR-037 anchor limb, the undeclared skeptic seam (which corrected the ticket's "no ADR-042 change" assumption), and the loop-cost correction. The jtbd review's blocking correction was the `close-discharges-headline` re-wording. Style-guide and voice-tone gates are no-ops by scope: this iteration touches no `.css`, no UI component file, and no user-facing copy surface.
- Captured via `/wr-itil:capture-problem` during the Issue 16 follow-up (2026-08-05). This class was identified during the 2026-08-04 retrospective and not ticketed at the time, which was a gap in that retro's Step 4b execution.
