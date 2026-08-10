---
status: "proposed"
first-released:
date: 2026-08-07
human-oversight: confirmed
oversight-date: 2026-08-07
decision-makers: [Tom Howard, Claude]
consulted: [wr-architect:agent]
informed: []
reassessment-date: 2026-11-07
amends: [020-newsletter-editor-subagent, 043-bounded-editorial-remediation-loop-for-editor-and-skeptic-gates]
composes-with: [032-newsletter-editorial-discipline-policy, 038-cross-edition-thesis-consistency-check-as-fresh-context-subagent-gate, 042-newsletter-adversarial-skeptic-gate, 043-bounded-editorial-remediation-loop-for-editor-and-skeptic-gates]
related: [016-sw-critic-subagents-and-iteration-loop, 017-ai-brief-prep-and-finalise-phases, 020-newsletter-editor-subagent, 030-shift-the-shift-publication-day-to-monday-aest, 033-domain-specific-critic-agents-supersede-parameterised-sw-critic, 035-critic-rubric-shape-is-strengths-weaknesses-plus-context, 037-compose-newsletter-theme-anchor-before-body, 039-per-date-subdir-layout-for-published-newsletter-editions, 041-retire-consulting-funnel-repurpose-as-the-shift-hub]
---

# Cross-edition shape as a fresh-context subagent gate

> Cite this decision as "ADR-044 (Cross-edition shape as a fresh-context subagent gate)" on first mention. The upstream `wr-retrospective` plugin carries its own ADR-044 in a different ID namespace, and over 70 files under `docs/retros/` carry bare `ADR-044` references to it. Naming this one on first mention keeps the two apart, the same way ADR-043 handles its own collision.

## Context and Problem Statement

Every newsletter gate reads the edition under production. Only one gate reads prior editions at all, and its charter is thesis contradiction. Nothing reads the prior edition as a **shape precedent**, so recurring structural elements silently drop, label vocabulary drifts, and the companion post's length has no anchor.

The Shift Issue 16 (published 2026-08-03) carried four such breaks in the LinkedIn companion post alone, none caught by any gate and all caught by Tom's external reviewer: no issue line, a changed bullet-list label, no reply instruction, and a post that reached 2,993 characters against Issue 15's 1,655. That last one is the costly case. The post hit the platform's 3,000-character limit three times during revision, and each time space was bought by cutting something load-bearing. One of those cuts removed the clause answering the edition's own checkable question, and the same clause came back two review rounds later as a reviewer finding.

The brief had the same class of break: two prior editions carried a forward-deadline slot and Issue 16 dropped it. The successors were already in the draft. Only the recurring heading was missing, so the content existed and nothing retrieved it.

The problem is therefore not that editions vary. It is that specific failure modes hide inside variation, and every one of them was paid for by a human review round.

## Decision Drivers

- **Precedent is a judgement, not a string match.** Whether a dropped slot is an omission or an editorial choice depends on what the edition is doing that week. A mechanical probe cannot tell the difference; it can only report absence.
- **The failure modes are not enumerable in advance.** The four Issue 16 post breaks were found by a reader noticing, not by anyone predicting them. A fixed probe set catches the classes already observed and is blind to the next one.
- **A remediation loop now exists and has no override arm.** ADR-043 made gate findings into applied edits with no author-override. That raises the bar for what may remediate.
- **Most of the observed breaks have no documented reader job behind them.** Only two trace to a ratified job.
- **Precedent is thin and AI-authored.** The corpus is small and its editions were themselves AI-drafted, so "the last edition did X" is weak evidence that X helps a reader. The gate must weigh precedent, not obey it.
- **Ordering constrains where any such check can run.** The companion post is not drafted until step 15.5, so nothing invoked before it can see the surface that carried three of the four observed post breaks. This rules out the existing cross-edition gate at 11.4, and it also forces this decision's own two-site design below.

### Correcting the subagent-cost record

ADR-020 reassessment criterion 6 says that if cumulative subagent cost crosses 15 invocations per issue, "the ADR 016 line 77 cost precedent is no longer obviously fitting" and "the team should explicitly re-assert the budget or trim a gate". That is a **trigger to revisit the cost precedent, offering two responses. It is not a ceiling**, and no prohibitive verb appears anywhere in it.

**The ceiling characterisation is an error with a traceable chain, and this decision corrects the chain rather than one link:**

1. **Origin.** ADR-020's own ratified Decision Drivers "Cost" bullet uses the same two-response grammar: "If the cumulative cost grows materially after a third additional gate is added, the budget should be re-asserted." Criterion 6 is its reassessment-section restatement. Neither sets a limit.
2. **The precedent it defers to sets no number at all.** ADR-016's cost consequence reads "two to six more subagent invocations per issue. At weekly cadence this is negligible; reassess if cadence shifts." Its trigger is a **cadence** change, not a count. A ceiling cannot be inherited from a precedent that never set one. (Cited by content rather than line number: the "line 77" reference in criterion 6 has already drifted and now points elsewhere.) ADR-016 is additionally `.superseded.md` and carries `human-oversight: rejected-pending-supersede`, so it is a historical entry and not a live constraint.
3. **First appearance of "ceiling".** ADR-020's Amendment 2026-06-17, which postdates that ADR's 2026-05-30 ratification, introduces the phrase "the reassessment-criterion-6 15-invocations-per-issue ceiling".
4. **Propagation into ratified text.** ADR-042 carries it in originally-ratified body text ("the ~15-per-issue ceiling") and repeats it four more times. Its strongest normative sentence, however, imposes only a **justification duty**: a new gate "must be justified against it, not added silently". That duty survives this correction unchanged, and this ADR discharges it in this section.
5. **Inheritance.** ADR-043 carries an entire section premised on a breached ceiling, and holds the matter open as "Tom's call, carried as an open question until given".

**Tom gave that direction on 2026-08-07: the budget is re-asserted, not trimmed.** That is the first of the two responses criterion 6 names, executed as written. ADR-043's open question is thereby **discharged**, and the amendment this decision lands on ADR-043 records it as such so a future reassessment pass does not re-open a settled question.

**The arithmetic being re-asserted, worst case.** ADR-043 recorded roughly 25 invocations per issue. This gate adds:

| Call | Count |
|---|---|
| Brief site (15.36), once per phase | 2 |
| Brief re-invocation inside the 15.37 loop, once per phase | 2 |
| Post site (15.57), finalise only | 1 |
| Post inline re-invocation, finalise only | 1 |
| **Total** | **6, landing near 31 per issue** |

Both re-invocations are billable: ADR-043's amendment states that re-running a deterministic contributor inside round 2 costs no invocation but "re-running an agent contributor does, and counts against the round". Under this decision the shape gate is an agent, so it pays. The loop itself runs per phase, which is why the brief re-invocation counts twice rather than once.

Stating the number is the point of a re-assertion; the next gate proposal should inherit an actual worst-case figure rather than "near 25".

**The constraint that actually binds is wall-clock, not count.** ADR-017's under-one-hour finalise-session criterion is what invocation count was ever a proxy for. That criterion is written Friday-anchored, and ADR-030 already settled the re-reading: it states that ADR-017 "is not amended" and that ADR-030 "refines ADR 017's implicit Friday assumption to be a per-persona parameter". So reading it day-agnostic needs no new record; it is the reading ADR-030 established.

## Considered Options

1. **A new fresh-context subagent gate for cross-edition shape.** A sibling to the existing cross-edition thesis gate, reading the current edition against its predecessors and reasoning about what changed.
2. **Widen the existing cross-edition thesis gate with a structural-shape axis.** Reuse the gate that already loads prior editions.
3. **A deterministic lint owning cross-edition precedent.** A script diffing named probes against the two most recent published editions.
4. **Do nothing.** Tom and the external reviewer continue diffing editions by eye.

## Decision Outcome

Chosen option: **"A new fresh-context subagent gate for cross-edition shape"**, because deciding whether a change from precedent is a loss or a choice is a judgement, and because the failure modes in this class are not knowable in advance, which is exactly the condition a fixed probe set handles worst.

### The gate

A new project-local `wr-newsletter-shape` agent, fresh context per invocation, following the domain-specific critic convention (ADR-033) and the strengths-plus-weaknesses output shape (ADR-035). Read-only tools.

Its charter is **cross-edition precedent**: what this edition does differently from its predecessors, and whether each difference costs the reader anything. It is explicitly **not a consistency enforcer**. A difference that serves the week is a good difference and the gate must say so rather than flagging it.

**Prior-edition window: N=2.** The sibling thesis gate pins N=8 with full bodies, which is the corpus's most expensive input contract. Shape precedent decays faster than thesis precedent, and a wider window would surface conventions the publication has already outgrown. Two editions plus judgement is deliberate, and it is judgement rather than a strict two-prior *rule*: the gate may weigh a convention it can see lapsing. Path resolution uses the per-date subdirectory layout (ADR-039).

### Two invocation sites

A single site cannot work, and the reason is the same ordering argument that rules out the existing thesis gate. The brief-shape read must precede the remediation loop at 15.37 to route into it; the companion post does not exist until 15.5. So:

- **Step 15.36, brief shape.** Inputs: the current brief body and the two most recent published briefs. Findings route into ADR-043's step 15.37 collect step.
- **Step 15.57, post shape.** Inputs: the companion post and the two most recent published posts. Findings take the inline one-round path ADR-043 established for the post at 15.55.

Each site has its own skip and phase semantics rather than inheriting the loop's critic-skip.

### Two remediation authorities, judged per finding

Detection is one question; authority to edit is another. Every finding carries one of two authorities:

- **Remediating.** The finding maps to an outcome in a ratified reader job. It enters ADR-043's remediation loop and may become an applied edit. Two are known today: a dropped recurring slot whose content is already present elsewhere in the draft, and a companion post cutting load-bearing content to fit the platform limit.
- **Advisory only.** The finding does not map to a ratified reader job. It is surfaced for Tom to clear with a stated reason and can never become an applied edit. The observed cases are the issue line, the companion post's reply instruction, and the bullet-label wording.

**The classification is the agent's judgement per finding, not a fixed enumeration.** A closed default-deny list (remediating is exactly the two known classes, everything else advisory, widened only by amending this ADR) was considered and **declined by Tom on 2026-08-07**. The architect's objection is recorded here rather than omitted, because it is the sharpest argument against the chosen shape: the safeguard against a silent mis-classification is Tom noticing a wrong edit in his own published prose, which is the human attention this work exists to conserve, and the asymmetry runs one way (over-classifying as advisory costs one dismissible line; under-classifying costs a silent unwanted edit). Reassessment criterion 2 below is the tightening trigger, and the first live run should be read specifically for mis-classification.

The licence for the advisory class comes from **having no remediation authority**, not from the rationale being strong enough. The rule this corpus holds is narrow: an applied edit to reader-facing prose must be job-grounded, because ADR-043 removed the filter that used to absorb mis-grounded findings. Detection carries no such requirement, so a check may exist on a weaker basis provided it cannot edit. The recorded rationale for the advisory class is **distribution**: a returning subscriber scanning a feed needs to recognise the publication. That is not a documented reader job and this decision does not pretend otherwise. Non-job grounds are already accepted in this corpus, on account risk, on publication timing, and on credibility rather than compliance. What a distribution rationale does not buy is the right to edit.

**Minimum post length is not a finding at all.** A short post is not a defective post, and a gate that pressures the drafter to pad inverts the job.

### Hard carve-outs, binding at every authority level

- **The provenance line is remediation-invariant.** ADR-032's Amendment 2026-08-03 states a gate loop may flag it but may not silently rewrite it, because its wording is ADR-governed rather than per-edition editorial. It is the most obviously recurring slot in the corpus and has per-surface variant wording, so it falls inside the remediating class "a dropped recurring slot whose content is present elsewhere" **by construction**. It is excluded by name. Any finding touching it is advisory regardless of grounding.
- **The brief's closing reply prompt is not this gate's territory.** ADR-032 element 6 fixes it as a ratified shape invariant for the brief. Under this decision's own boundary rule, anything a ratified decision fixes in the abstract belongs to the single-edition lint. Only the *companion post's* reply instruction is in scope here, and only as advisory, because ADR-032 extends only element 5 to the companion.

  **Stated plainly: ADR-032 element 6 is currently unenforced.** The structure lint implements checks (a) through (g) and none covers a reply prompt, so assigning the brief's prompt to the lint assigns it to coverage that does not exist. Issue 16's observed break was a missing reply instruction, so this is a live gap and not a theoretical one. Confirmation criterion 6 adds it to the lint's new-check list.

### Two framings the gate must carry

The two remediating cases are not really shape checks, and naming them accurately is what makes them defensible:

- A dropped recurring slot is an **omission check**. At Issue 16 the successor deadlines were already drafted and only the retrieval heading was missing.
- A post at the platform limit is a **cut-to-fit warning**. The harm was never inconsistent length; it was that hitting the limit forced out a load-bearing clause.

Consistency is a side effect of both, not the goal of either.

### Boundary partitions, declared so a future retro can detect collapse

Following ADR-042's convention, because this is the fourth gate to touch cross-edition or structural concerns and ADR-020 reassessment criterion 2 needs something to test against.

- **vs the cross-edition thesis gate (ADR-038).** That gate owns propositional continuity: does this edition assert something a prior edition contradicts. This gate owns structural and presentational precedent: which recurring elements are present, how they are labelled, how long the companion runs. Seam: **a claim versus a container.**
- **vs the skeptic's promise-payoff facet (ADR-042).** Promise-payoff is within-edition: every story the opener or fold names must be resolved in the body. This gate is cross-edition: a slot two prior editions carried is absent now. Seam: **an unkept promise this edition made versus a habit this edition dropped.**
- **vs the editor's axes (ADR-020).** `item-count-proportionality` and `reader-orientation` are `EDITORIAL_FINDINGS` axes; `fold-compression` is an `EDITORIAL_CRAFT` axis. All three read the current edition against its own stated intent. This gate reads it against its predecessors. Seam: **internal coherence versus external precedent.**
- **vs the within-edition assembly axes (P122).** These land in the same editor invocation and feed the same 15.37 collect step under the same amendment, so this is the nearest neighbour of all. `signpost-promises-match-contents` asks whether a heading or label describes what actually follows; this gate asks whether a heading that two prior editions carried is missing. `item-placement` asks whether a demoted entry carries promoted weight within this edition; this gate asks whether the slot tier itself changed between editions. Seam: **does this edition keep its own promises, versus does this edition keep its own habits.** Declared here because ADR-020 reassessment criterion 2 fires on exactly this adjacency and a retro will look in this section, not in a problem ticket.
- **vs ADR-032's ratified shape elements.** Anything ADR-032 fixes in the abstract is single-edition lint territory. This gate owns only conventions whose sole record is the published corpus. Seam: **written down versus merely habitual.**
- **vs the P116 cross-edition dropped-threads follow-up (ADR-042).** ADR-042 allocated "cross-edition dropped-threads" to prompt-tightening of the thesis gate. That allocation stands and is **not** taken over here. Seam: a dropped **thread** is content continuity, where the substance is absent and would have to be written; a dropped **slot** is structural retrieval, where the substance is already drafted and only the heading that surfaces it is missing. The Issue 16 forward-deadline case is the latter: the successor deadlines were in the draft.

### Boundary against the deterministic lints

Some conventions look like precedent but are template invariants. The From Tom opener, the `Item N:` heading prefix and the per-item bold labels are fixed in the abstract by the template or a ratified decision. The corpus shows why this matters: `**From Tom**` is absent from the editions published 2026-06-08 through 2026-07-13 and returns at 2026-07-20, so treating it as precedent would have let it lapse for six weeks unremarked.

- The single-edition structure lint owns anything the template or a ratified decision fixes in the abstract.
- This gate owns conventions whose only record is the published corpus, and the judgement of whether departing from one costs anything.

**These lint checks do not exist yet.** The structure lint currently implements checks (a) through (g), and none covers the three conventions above; ADR-032's deferred provenance check (h) is also unbuilt. Assigning them to the lint is therefore new work this decision creates, not existing coverage it relies on.

### Declining to add a job outcome

Tom explicitly declined to add a stable-weekly-shape outcome to the leader or developer jobs. This is recorded as a decision, not an omission.

Adding the outcome would have grounded every finding in this class and licensed them all to remediate. It was rejected because writing the grounding in and then reading it back out as support is circular: the corpus would appear to justify the checks because the justification was authored to fit them. That is the same contamination corrected when the editor agent was moved off retired jobs. If a stable shape is later shown to serve a reader, the outcome can be added on that evidence and this decision revisited.

## Consequences

### Good

- Catches breaks nobody predicted, which is the actual shape of this failure class.
- Distinguishes a deliberate departure from an accidental loss, which a probe cannot do at all.
- No brittle precedent arithmetic. A strict two-prior rule would not have flagged the Issue 16 label change, because only one of the two priors carried the label it drifted from.
- Ungrounded conventions are visible without being enforced, so precedent informs without binding.
- Corrects a characterisation error that had propagated through three ADRs, and discharges an open question rather than leaving it to be re-asked.

### Neutral

- Advisory findings still land in Tom's queue. This replaces potential edits to his prose with dismissible lines.
- Another agent file to keep grounded as the jobs corpus evolves.
- Two invocation sites rather than one, which is more wiring but is forced by the pipeline's own ordering.

### Bad

- **Adds up to six invocations per issue, landing near 31.** The budget is re-asserted rather than trimmed, so this is an accepted cost, not an unnoticed one. If the finalise session crosses one hour, this gate is the newest and the first candidate to move to prep-only.
- **A mis-classification can silently edit published prose.** Authority is the agent's per-finding judgement, and the closed-enumeration alternative was considered and declined. The detection signal for this failure is weak by construction: it depends on Tom noticing a wrong edit, which is the attention this design conserves. This is the most serious accepted risk in the decision.
- A reasoning gate can hallucinate a precedent that never existed, which a deterministic probe cannot. Pinning the prior editions as inputs bounds this but does not eliminate it.
- Findings will be less reproducible edition to edition than a lint's, so a flake is harder to distinguish from a real change.
- Assigning three template invariants to the single-edition lint creates unbuilt work that this decision names but does not deliver.
- The compendium entry must be hand-maintained minimally, per the posture ADR-032's amendment already records: P087 blocks regeneration because the generator emits em-dashes this repository's hook rejects. It fired three times in the session that produced this decision, twice while ratifying ADR-043 and once on this file's own entry.

## Confirmation

1. `.claude/agents/wr-newsletter-shape.md` exists, fresh context, read-only tools, emitting a strengths-plus-weaknesses block with a mechanical verdict in the ADR-035 shape.
2. Its input contract pins the two most recent published editions for the persona, and the window rationale is stated in the agent file.
3. Every finding carries an explicit authority marker, remediating or advisory, machine-readable by the remediation loop.
4. The provenance line and the brief's closing reply prompt are excluded by name in the agent prompt, and no authority level can reach them.
5. Minimum post length appears nowhere in the agent, its prompt, or its output.
6. `check-newsletter-structure.sh` gains checks for the From Tom opener, the `Item N:` prefix, the per-item bold labels, and the brief's closing reply prompt (ADR-032 element 6, currently unenforced), with sibling tests. These are **new checks to be added**, not existing coverage.
7. `SKILL.md` invokes the gate at **two** sites: 15.36 routing brief findings into 15.37's collect step, and 15.57 taking the inline path for the post. Each has its own skip and phase semantics.
8. An advisory finding cannot reach an applied edit by any path through the loop.
9. ADR-043 carries one `## Amendment 2026-08-07 (P121, P122)` section with **five** clauses: (1) widened collect sources and no-op condition, (2) the third stop-and-surface class keyed on wrongness, (3) the classification precedence, (4) who states the reason plus prep-to-finalise carry-forward, and (5) the ceiling-to-trigger correction **including an explicit discharge of its open budget question**.
10. ADR-020 carries the correction adjacent to reassessment criterion 6 itself, and the "ceiling" sentence in its 2026-06-17 amendment is corrected in place so the file does not contain both the correction and an uncorrected restatement.
11. Both ADR-020 and ADR-043 gain `amended-by: [044-cross-edition-shape-as-a-fresh-context-subagent-gate]`.
12. `docs/decisions/README.md` carries an ADR-044 entry with no em-dashes and a corrected total count, hand-edited minimally per the P087 posture.
13. First live run: the reviews file records which findings fired, their authorities, and which advisories Tom cleared. Finalise-session wall-clock is recorded against ADR-017's one-hour criterion, read as day-agnostic.

## Pros and Cons of the Options

### Option 1: A fresh-context subagent gate (chosen)

- Good: judges whether a departure costs the reader anything, which is the actual question.
- Good: catches unanticipated breaks; the observed failure class was discovered by noticing, not by predicting.
- Good: no brittle precedent arithmetic to tune.
- Bad: adds up to six invocations per issue.
- Bad: can hallucinate precedent, and its findings are less reproducible than a lint's.
- Bad: authority rests on per-finding judgement, so a mis-classification can edit prose silently.

### Option 2: Widen the existing cross-edition thesis gate

- Good: already loads prior editions, so no second expensive read.
- Bad: runs at 11.4, before the companion post exists, so it cannot see three of the four observed post breaks.
- Bad: loads a second axis onto one agent, which ADR-035's coverage-partitioning discipline rejects; widening its charter needs an amendment.

### Option 3: A deterministic lint

- Good: zero added invocations, deterministic, diffable, testable.
- Bad: only finds what it is told to look for, and this failure class is defined by not knowing in advance.
- Bad: cannot distinguish a deliberate departure from an accidental loss, so it either over-reports or needs a precedent rule strict enough to miss real cases. A two-prior rule would have missed the motivating label change.

### Option 4: Do nothing

- Good: no build cost, no new maintenance surface, no added invocations.
- Bad: the observed cost is already real: four breaks in one edition, one of them a load-bearing cut recovered only after two review rounds.
- Bad: leaves the class dependent on a human noticing, which is the review load this work exists to reduce.

## Reassessment Criteria

- **If the finalise session crosses one hour**, this gate is the newest addition and the first candidate to move to prep-only or to merge into an adjacent gate. That criterion, read day-agnostic, is the real budget.
- **If the gate ever mis-classifies an ungrounded finding as remediating**, the per-finding judgement is not holding and authority should move to the closed default-deny enumeration declined on 2026-08-07. This is the tightening trigger for the decision's most serious accepted risk, and the first live run should be read specifically for it.
- **If advisory findings are cleared with the same reason every edition**, the convention is settled and either belongs in the template as an invariant or should be dropped.
- **If a remediating finding ever produces an edit Tom reverts**, its job grounding is weaker than claimed and it should drop to advisory pending re-grounding.
- **If the gate flags a departure that was obviously right for that week**, its charter has drifted from precedent-as-evidence toward consistency-as-goal. Re-read the "not a consistency enforcer" clause and tighten the prompt.
- **If this gate and the thesis gate flag the same passages**, the declared boundary partition has collapsed and one should absorb the other, per ADR-020 reassessment criterion 2.
- **If a stable weekly shape is later shown to serve a reader**, add the outcome to the job on that evidence and reconsider the advisory class. The decline recorded above is on current evidence, not permanent.
