# Problem 121: No gate compares an edition against the prior edition's shape, so pattern breaks and precedent drift reach the reader

**Status**: Known Error
**Reported**: 2026-08-04
**Priority**: 12 (High), Impact: 3 x Likelihood: 4, derived at capture from the description. Impact is 3 because pattern breaks reach the reader and are noticed by returning subscribers (the class the reviewer described as "the two things a returning subscriber will notice"), but nothing factually wrong ships. Likelihood is 4 because every edition is drafted against the skill template rather than against the prior edition's artefact, so drift is the default rather than the exception.
**Origin**: internal
**Effort**: L, re-rated 2026-08-05 at the Known Error transition (was M). The capture-time M assumed the fix was a prompt extension on the existing `wr-newsletter-cross-edition-consistency` gate. Investigation ruled that home out on evidence (see Investigation Task 1) and the settled shape is larger: a new deterministic lint plus its vitest sibling, a stated boundary against ADR-032's already-deferred check (h), five SKILL.md call-site edits, a new ADR, and an amendment to ADR-043. Single repo, no migration, no cross-package work, and the design is now fully specified, so L rather than XL. The dominant remaining cost is a wait on two direction calls, which is not dev effort and is not what the Effort divisor measures.
**WSJF**: 6.0 = (12 x 2.0) / 4. Unchanged from capture: the Effort re-rate M to L and the Open to Known Error status-multiplier change cancel exactly.

## Description

Every newsletter gate reads the edition under production. Only one gate reads prior editions at all, and ADR-038 scopes it to thesis contradiction. Nothing reads the prior edition's artefact as a **shape template**, so recurring structural elements silently drop, label vocabulary drifts, and the companion post's length has no anchor.

**Evidence: The Shift Issue 16 (published 2026-08-03).**

The LinkedIn companion post accumulated four pattern breaks against Issue 15's published post, none caught by any gate, all caught by Tom's external reviewer:

1. **No issue line.** Issue 15's post carried "Issue 15 of The Shift: An AI agent broke its sandbox to cheat on a test." Issue 16's post named neither the issue number nor the article anywhere in its text; the number appeared only in the cover art and the title only in the link card.
2. **Label drift.** Issue 15 used "This week:". Issue 16 used "In this week's issue:".
3. **No reply prompt.** Issue 15 closed with a question plus an instruction ("Reply with where your team is on bounding what your agents can reach"). Issue 16 closed on a bare rhetorical question, even though the brief itself said "Reply and tell us."
4. **Length with no anchor.** Issue 15's post is 1,655 characters. Issue 16's reached 2,993, hit LinkedIn's 3,000-character ceiling three separate times during revision, and each time space was bought by cutting something load-bearing. One of those cuts removed the GCC clause that answered the edition's own checkable question; the same clause came back two review rounds later as a reviewer finding. The precedent post was never compared against until the reviewer did it manually.

The brief had the same class of break: Issues 14 and 15 both carried a forward-deadline slot ("Two weeks out", "Six days out"). Issue 16 dropped it, because that week's deadline had become a deep item. The successors were already in the draft; only the recurring slot was missing. The external reviewer caught it, and the restored section became one of the edition's stronger beats.

## Root cause

`wr-newsletter-cross-edition-consistency` (ADR-038) is the only gate that reads prior editions, and its charter is thesis-level: does this edition contradict a position the series has taken. P117 extended it with an advisory dropped-thread scan, which is content continuity. Neither covers structural shape.

The drafter works from `.claude/skills/wr-newsletter/assets/draft-template.md` plus the persona config. Those encode the canonical shape in the abstract; they do not encode what the last two editions actually did. When a recurring slot is a pattern rather than a template rule (the "N out" forward-deadline beat is not in any template), the only surviving record of it is the previous edition's file, and nothing reads that file for shape.

The companion post is the worst-affected surface because it has the least template coverage. `SKILL.md` step 15.5 enumerates its required contents, but the published corpus is where its actual conventions live: the issue line, the "This week:" label, the closing reply instruction, and a length norm roughly 40% of what Issue 16 produced.

## Symptoms

Recurring structural elements silently disappear between editions; label vocabulary drifts; the companion post has no length anchor and grows until it hits the platform ceiling, at which point load-bearing content is cut to fit. All detected by external review rather than by a gate.

## Workaround

Tom or the reviewer opens the prior edition's published files side by side with the draft and diffs them by eye. This is what caught all five Issue 16 breaks, and it is the standing workaround until the lint lands.

Cheaper interim form, usable by the drafter without a code change: at SKILL.md step 11b (brief) and step 15.5 (LinkedIn post), read the two most recent published artefacts for the persona before drafting, and treat them as the shape reference alongside the template. The prior-edition paths are already resolved at step 11.4 for the cross-edition gate, so the read costs nothing extra. This does not detect anything, so it does not close the ticket; it moves the comparison left of the reviewer.

## Impact Assessment

- **Who is affected**: returning subscribers (the pattern breaks are exactly what a repeat reader notices); Tom and the external reviewer (carry the comparison manually).
- **Frequency**: every edition, since nothing in the pipeline reads the prior artefact for shape.
- **Severity**: no factual error ships. The cost is reader-facing inconsistency plus review rounds spent rediscovering conventions that are already on disk.
- **Analytics**: none.

## Root Cause Analysis

Root cause confirmed 2026-08-05. The reported mechanism holds and is now grounded on a reproducible artefact rather than on the retro's recollection.

### Reproduction

Commit `d2d674a` (`docs(newsletter): The Shift Issue 16 finalise (publish-ready, author-corrected thesis)`) is the pipeline's own declared publication-ready state for Issue 16, immediately before `b39d680` applied the reviewer's revisions. It reproduces all five breaks:

| Break | Check against `d2d674a` | Result |
|---|---|---|
| No issue line in the post | `grep -E 'Issue [0-9]+'` on the `.linkedin.md` | no match. Issue 15's post carries one. |
| Label drift | label line at post line 20 | `In this week's issue:` against Issue 15's `This week:` |
| No reply instruction | `grep -E '\bReply\b'` on the `.linkedin.md` | no match. Issues 14 and 15 both carry one. |
| Post length unanchored | `wc -c` on the `.linkedin.md` | 2988 bytes against Issue 15's 1717 |
| Brief dropped the forward-deadline slot | `### ` heading inventory on the brief | Items 1 to 4 plus Also-worth-noting only. Issue 14 has `### Two weeks out:`, Issue 15 has `### Six days out:`. |

This is the reproduction fixture for the eventual lint. It is git-addressable and does not need synthesising. Note that the **published** corpus cannot be used as a fixture: `src/newsletters/published/leader/2026-08-03/` is the post-remediation artefact and carries the issue line, `This week:`, `Reply and tell us.` and a restored `### Four months out:` slot, so a fixture read from it would be vacuous.

### Investigation Tasks

- [x] **Decide the home.** Neither of the two options the ticket framed is correct. Extending `wr-newsletter-cross-edition-consistency` is ruled out on ordering, not preference: that gate runs at SKILL.md step 11.4, and the LinkedIn post is not drafted until step 15.5, so the gate cannot see the surface that carries three of the four post breaks and the whole length axis. ADR-035 coverage-partitioning independently forbids loading a second axis onto it, which is the same ground ADR-038 used to reject its own Option 2. A sibling **subagent** is also ruled out: ADR-043 records the per-issue subagent budget already breached at roughly 25 against ADR-020 reassessment criterion 6's ceiling of roughly 15, and every axis in the evidence is mechanically computable, so an LLM gate would buy nothing and cost four more invocations. **The home is a deterministic shell lint**, matching the established `scripts/check-newsletter-structure.sh` (P089) idiom with a vitest sibling. Consequence: **ADR-038 does not need widening.** Its thesis-contradiction charter is untouched, which removes the amendment the ticket assumed.
- [x] **Define the shape diff.** Settled as three classes, with one correction the ticket's candidate list got wrong. The ticket proposed a section-heading inventory; a literal heading-text inventory would not fire, because the forward-deadline slot's heading text changes every week (`Two weeks out`, `Six days out`, `Four months out`). The probe has to be a **slot pattern**, and the numeral is a word rather than a digit, so `^### [0-9]` matches zero editions in the corpus. Full axis definition is in Fix Strategy below.
- [x] **Decide whether a shape break is a finding or an advisory.** Split by class, and the ticket's instinct was right for the class it was looking at. A DROP is **stop-and-surface with a required stated reason**, never auto-restored: an empty recurring slot refilled to satisfy a lint is filler, which contradicts JTBD-005 outcome 1 (a read short enough to finish in a few minutes) and JTBD-200 outcome 4 (items excluded on purpose, not missed). Issue 16's forward-deadline slot legitimately had no content that week. Only DRIFT and the length ceiling are safe to remediate automatically. The "stated reason" is recorded as an ADR-043 accepted residual advisory, which delivers what the ticket asked for **without** reintroducing the author-override arm ADR-043 Considered Option 5 rejected: a residual always surfaces to Tom and never shortens the round, whereas an override arm stops the loop and swallows the finding. The reason must be descriptive only (why remediation was unavailable), or the mechanic drifts back into Option 5 under later editing.
- [x] **Check the interaction with P120.** P120 shipped as ADR-043 and SKILL.md step 15.37 (commit `e7d115c`), both read at investigation time. The answer the task anticipated is confirmed: shape findings route through that loop and do **not** become a fifth surface-to-Tom advisory. Three details the routing has to get right, none of them obvious from the ticket:
  1. **The routing splits.** Brief-shape findings enter step 15.37's collect step. Post-shape findings cannot: the post is drafted at 15.5, after 15.37 has run, which is why ADR-043 already applies the same one-round rule inline at 15.55 for the skeptic-on-post. Post-shape findings take that same inline path.
  2. **15.37's no-op condition has to widen**, from "both 15.25 and 15.35 returned PASS" to "15.25, 15.35 and the shape diff are all clean". Otherwise a shape finding is silently dropped on every edition where the two LLM gates both pass, which is the common case.
  3. **15.37's skip condition must NOT be inherited.** Step 15.37 skips entirely when the step-15 critic returns `REJECTED`, on the stated ground that neither upstream gate ran. That rationale does not transfer to a deterministic script with no upstream dependency and zero invocation cost, so the lint needs its own invocation site with its own skip and phase semantics rather than sitting inside 15.37's skip.

> **STALE PREMISE SWEEP, 2026-08-07.** Both deferral grounds below have since been discharged and this section is retained as history, not as live reasoning.
>
> 1. **ADR-043 is ratified** (`human-oversight: confirmed`, `oversight-date: 2026-08-05`). The unratified-dependency argument is spent.
> 2. **Tom's direction landed 2026-08-07.** The reader-benefit question is answered (see Preconditions item 2), and the invocation-budget argument is withdrawn entirely: there was never a ceiling, only a trigger, and the budget was re-asserted.
>
> The fix is now proposed, in ADR-044 (Cross-edition shape as a fresh-context subagent gate). Note it is an **agent**, not the lint this section and the Fix Strategy argue for.

### Why the fix is not proposed in this iteration

Two direction calls block the build, both category-1 and both Tom's. They are recorded here so the next iteration does not re-derive them:

1. **ADR-043 is unratified.** `wr-architect-is-decision-unconfirmed ADR-043 docs/decisions` exits 0, and ADR-043 is the only decision in `docs/decisions/` carrying `human-oversight: unconfirmed`. The fix routes through its step 15.37, widens its no-op condition, and amends its stated contract. Building on it now stacks an unconfirmed decision on an unconfirmed decision, which is the substance-confirm-before-build guard's case exactly. If Tom amends or rejects ADR-043's loop shape, the whole answer to Investigation Task 4 is invalidated.
2. **The reader benefit this fix asserts is not in the JTBD corpus.** No documented job or persona records a stable, recognisable weekly shape as a reader benefit. JTBD-005 outcomes support the DROP of the forward-deadline slot (outcome 4, confidence nothing actionable was missed) and the length ceiling (outcome 1 and outcome 3, via the evidence that a load-bearing GCC clause was cut to buy ceiling space). Nothing supports DRIFT, the issue line, the reply instruction, or a length floor. Under ADR-043 those findings become applied edits to reader-facing prose with no override arm, so shipping them ungrounded is the mis-grounded-finding failure ADR-043 named when it corrected the editor's retired-job grounding in the same commit. The corpus gap is real and pre-existing: the personas are all readers, so Tom's own framing for this ticket ("what would we need to change to require less feedback from me and the reviewer") is an author job nothing in `docs/jtbd/` models. Adding outcomes to JTBD-005 and JTBD-200 is direction-setting and needs ratification. It is also the right question to put to Tom on the merits: is a stable weekly shape a reader benefit or an editorial cage?

No RFC is created in this iteration. Per ADR-022's corrected semantics, Known Error means root cause identified and workaround documented with the **fix not yet proposed**; the fix proposal happens after Known Error and is what produces the RFC per ADR-072. `wr-itil-check-fix-rfc-trace` will fire at that point, which is the correct moment: an RFC scoped now would be scoped against two unresolved direction calls, and a mis-scoped auto-authored RFC is the signal ADR-073's own reassessment criterion watches for.

## Fix Strategy

Settled shape, blocked on the two direction calls above. Not yet proposed as an RFC.

> **SUPERSEDED IN PART, 2026-08-07, by ADR-044 (Cross-edition shape as a fresh-context subagent gate).** Sections 1 and 3 below proposed a deterministic lint with fixed probes. Tom chose a **fresh-context subagent gate** instead, at the create-adr substance-confirm, on the grounds that whether a departure from precedent costs the reader anything is a judgement, and that this failure class is defined by not knowing the breaks in advance. Read ADR-044 as authoritative for the home, the probe-versus-judgement question, and the invocation-site design; the sections below are retained for the analysis they carry, which ADR-044 reuses.
>
> **What survives unchanged:** the single-edition versus cross-edition boundary and the three template-invariant corrections (section 2); the two-authority split and its grounding logic (section 3, minus the fixed per-probe mapping); the routing intent (section 4); and every Preconditions entry.
>
> **What changed:** the home is an agent, not a script. The strict two-prior precedence rule is gone, replaced by judgement over a two-edition window, which also dissolves the known limitation section 3 recorded (that a two-prior rule would have missed the motivating label drift). Authority is now judged per finding rather than fixed per probe: Tom considered a closed default-deny enumeration and declined it, and ADR-044 records the architect's objection to that choice plus the tightening trigger. Routing needs **two** sites, not one, because a single site cannot both precede the remediation loop and see a companion post that is not drafted until after it.
>
> **The invocation-budget argument in section 1 is withdrawn.** It rested on a roughly-15-per-issue ceiling that does not exist: ADR-020 reassessment criterion 6 is a trigger naming two responses, and Tom exercised it by re-asserting the budget. ADR-020 and ADR-043 now carry the correction.

### 1. A deterministic lint, not a gate

New `scripts/check-newsletter-shape-drift.sh`, matching the `scripts/check-newsletter-structure.sh` (P089) idiom: ASCII only, no em-dashes in its own messages, one `FAIL [<id>] <file>:<line>: <message>` line per violation, exit 0 clean / 1 violations / 2 usage. Sibling vitest at `scripts/check-newsletter-shape-drift.test.mjs`, with the reproduction fixture taken from commit `d2d674a` rather than from the published corpus.

Inputs: the current draft (brief and, when it exists, the `.linkedin.md` sibling), plus the two most recent published editions for the persona. Path resolution reuses the ADR-039 per-date subdirectory glob that SKILL.md step 11.4 already documents.

### 2. Scope boundary against ADR-032's check (h)

ADR-032's Amendment 2026-08-03 already defers a deterministic check (h) asserting the provenance line is present before the first `### Item` heading, states that extending it to the LinkedIn sibling is "the cheap second half", and says it "should be built with the loop rather than after it". That check belongs in `check-newsletter-structure.sh` as check (h), not here. The boundary to state in the ADR:

- `check-newsletter-structure.sh` owns **single-edition** shape: anything the template or an ADR fixes in the abstract.
- `check-newsletter-shape-drift.sh` owns **cross-edition precedent**: conventions whose only record is the published corpus.

This split also corrects the probe set. Three of the four brief probes the ticket implies are template invariants, not corpus precedent: the `**From Tom**` opener (now an ADR-032-governed slot), the `### Item N:` heading prefix, and the per-item bold labels. Putting them in a two-prior precedence test would make them silently conditional on two priors happening to carry them, and the corpus shows why that fails: `**From Tom**` is absent from the editions published 2026-06-08 through 2026-07-13 and returns at 2026-07-20, so a precedent test would have let it lapse for six weeks. They belong in the single-edition lint as new lettered checks alongside (h).

### 3. The three finding classes

- **DROP.** A named probe present in **both** prior editions and absent from the current artefact. Brief probe, and the only genuine corpus-only convention found: the forward-deadline slot, matched positionally as `^### [A-Za-z]+ (day|days|week|weeks|month|months) out: `. The numeral is a word, so a digit pattern matches zero editions in the corpus. Post probes: a line matching `Issue [0-9]+`, and a line matching `\bReply\b` in the closing block. A `windyroad.com.au` sign-off probe was considered and **dropped**: it is absent from both Issue 15 and Issue 16, so under the two-prior test it can never fire, and it is governed by P079 and ADR-032 element 6 anyway.
- **DRIFT.** The post's bullet-list label line, anchored **positionally** as the last non-blank line immediately preceding the first `- ` bullet, present in both the current post and the immediately prior post with differing verbatim text. The positional anchor is load-bearing: the label has no stable wording across the corpus (`Inside Issue 12 of The Shift:`, `The Shift, Issue 13: ...`, `In Issue 14 of The Shift:`, `This week:`), so a text pattern would be a semantic judgement and would defeat the zero-invocation argument. Restricted to this one probe to bound noise.
- **LENGTH.** Post character count against the trailing median of the prior editions' posts. The **ceiling** (1.5x) is a remediable finding, anchored on JTBD-005 outcome 1 and outcome 3 through the evidence that a load-bearing GCC clause was cut to buy ceiling space. The **floor is dropped entirely** (settled direction 2026-08-07, superseding the advisory-only treatment previously recorded here): nothing in JTBD-005 or JTBD-200 values minimum length, a short issue is a good week rather than a defect, and a floor that pressures the drafter to pad inverts the job. Not implemented, not surfaced, not carried as an advisory. An advisory that can never be right is still noise in Tom's queue.

**Framing correction (settled direction 2026-08-07).** Neither remediable probe is really a "shape" check, and calling them that invited the editorial-cage objection. The forward-deadline DROP is an **omission check**: at Issue 16 the successor deadlines were already in the draft and only the recurring slot was missing, so the heading was the retrieval index for content that existed. The LENGTH ceiling is a **cut-to-fit warning**: the harm was not inconsistent length, it was that hitting the 3,000-character limit forced a load-bearing clause out and it took two external-review rounds to come back. Name them that way in the ADR. Consistency is a side effect, not the goal.

Known limitation to record in the ADR's Consequences: the two-prior precedent test is deliberately strict and would **not** have fired DRIFT on the motivating case. At Issue 16 the priors were Issues 14 and 15, and only Issue 15 carried `This week:`, so there was no shared precedent to drift from. The DROP probe on the issue line **would** have fired, since Issues 14 and 15 both carry one, so the evidence class survives; but the strictness is a real trade and should be stated rather than left implicit.

### 4. Routing

Per Investigation Task 4. Brief-shape findings enter SKILL.md step 15.37's collect step as a third source alongside the editor and skeptic findings; post-shape findings take the inline one-round path at 15.55 that ADR-043 already established for the skeptic-on-post. The lint gets its own invocation site with its own skip and phase semantics rather than inheriting 15.37's critic-REJECTED skip, and 15.37's no-op condition widens to include the shape diff. Re-running the lint in round 2 costs zero invocations, so the round-2 re-check is free.

DROP findings are stop-and-surface and do not consume the round, mirroring the treatment ADR-043 already gives a skeptic finding that cannot be remediated without new sourcing.

**Classification rule and precedence (settled direction 2026-08-07).** Step 15.37 will carry two classification axes once P121 and P122 both land, and they must be ONE rule with a stated order, not two rules discovered independently:

1. **Outer test, wrongness.** Is the finding a **defect** (wrong against a stated standard) or a **deviation** (merely different from precedent, possibly deliberate)? A deviation NEVER enters remediation, whatever its grain. A defect proceeds to the inner test.
2. **Inner test, grain.** Applied only to defects: is it remediable within the passage, or does it cross an item boundary (P122's axis)? Cross-boundary defects are stop-and-surface per ADR-032.

Wrongness outer, grain inner. This ordering also subsumes P122's ADR-governed-text limb, since text governed by a ratified decision is by construction not wrong by the lint's authority.

**Who states the reason, and what it may say.** A surfaced deviation is cleared by **Tom**, never by the drafter. ADR-043 Considered Option 5 rejected an author-override arm precisely because "an agent self-certifying that its own unremediated finding is acceptable is the confirmation-bias failure", and a drafter-stated reason would restore Option 5 under a new name. The reason must be **descriptive only** (why the deviation was deliberate, or why remediation was unavailable), never a judgement that the finding is unimportant, or the mechanic drifts back into Option 5 under later editing.

**Phase-boundary carry-forward.** A deviation Tom clears at prep carries its reason forward to finalise with residual status intact, per ADR-043's existing residual carry-forward rule. It does not re-fire. Asking the same question twice per edition is precisely the review-load this work exists to reduce.

One remediation carve-out to name explicitly: ADR-032 records the provenance line as **remediation-invariant**, so a loop may flag it but may not silently rewrite it. Any shape finding touching that line is residual-advisory only. ADR-043 already carries the general form ("Bounded by ADR-032"); the ADR for this work must name the provenance case specifically, because the `**From Tom**` slot the line now lives in is exactly what a shape probe would reach for.

### 5. Decision record

A new ADR recording the deterministic-lint home, the single-edition versus cross-edition boundary, the three classes and their asymmetric remediation contracts, plus:

- an `## Amendment <date> (P121)` section on ADR-043 naming the widened no-op condition and the third collect source verbatim. Amendment, not supersession: ADR-043's chosen option, one-round cap, skeptic differential, residual-advisory arm, no-override arm, and its four section-15.6 conditions all survive unchanged. This matches how ADR-043 itself amended ADR-020 and ADR-042 in place.
- a note recording that ADR-038's charter was considered and deliberately **not** widened, with the ordering reason.
- 044 is the next free local ID, but the upstream `wr-retrospective` plugin has its own ADR-044 in a different namespace, so cite it with its title on first mention the way ADR-043 line 17 already does for its own ID.
- `docs/decisions/README.md` must be hand-edited rather than regenerated: P087 records that the upstream generator emits em-dashes that trip this repo's no-em-dash hook. Say so in the ADR so the divergence stays deliberate. **Confirmed live 2026-08-05**: ratifying ADR-043 fired a compendium hook that introduced two U+2014 characters into a file that had zero at HEAD, blocking the next Bash call until they were hand-repaired. P087 is not theoretical and it fires on ordinary ADR edits, not only on explicit regeneration.

Three additions from the architect review of the settled direction (2026-08-07), all of which the ADR must carry:

- **The routing seam is the genuinely novel part, not the lint home.** ADR-042 already assigns structural and format hygiene to the deterministic P089 lint and holds those findings OUT of the LLM gates' axis sets. Section 4 does the opposite: it feeds a deterministic lint's output INTO 15.37's collect step, where a drafter remediates it. Deterministic-lint-output-as-remediation-loop-input has no decision covering it and is a stronger reason for a new ADR than the choice of home. Cite ADR-042's positive assignment as the warrant for the home itself, which is a stronger ground than section 1's current negative argument (ordering rules the ADR-038 gate out, budget rules a sibling subagent out).
- **The defect/deviation split is a THIRD stop-and-surface class, not the existing residual-advisory arm.** ADR-043's two existing classes both key on *remediation availability* (needs new sourcing; crosses an ADR-032 boundary). This one keys on *wrongness*. The mechanic is shared, the keying is new, and it must be written down as its own class rather than assumed to fall out of the existing arm.
- **The advisory-only-because-ungrounded class is a first for this corpus.** No prior decision records a check that detects but is forbidden from remediating on grounding grounds. Record it as a named class with the remediation-authority reasoning above, so a future reader does not read it as an oversight.

### Preconditions

1. ~~ADR-043 ratified via `/wr-architect:review-decisions`.~~ **DONE 2026-08-05.** `human-oversight: confirmed`, `oversight-date: 2026-08-05`, substance-confirmed by Tom against the full contract including the one-round cap, the no-author-override arm, the reduce-only skeptic differential, and the recorded invocation-budget breach. Compendium entry updated.

2. ~~Tom's call on whether a stable weekly shape is a documented reader benefit.~~ **SETTLED 2026-08-07, and the answer took a third path this ticket did not anticipate.**

   The question as originally posed offered two branches: ground the axes in a JTBD and remediate them, or drop them. Tom took neither. The settled direction:

   - **The two job-grounded probes remediate** through 15.37: the forward-deadline DROP and the LENGTH ceiling. Both trace to JTBD-005, and both have a correct answer, so automatic remediation is safe.
   - **The ungrounded probes ship advisory-only**: the issue-line DROP, the `Reply` DROP, and DRIFT. Surfaced, never auto-edited, cleared by Tom stating a descriptive reason. **DRIFT is NOT dropped**, which is where this supersedes the old branch text.
   - **The LENGTH floor is dropped entirely.** See section 3.
   - **No JTBD outcome is added.** Explicitly declined. Adding a "stable weekly shape" outcome to JTBD-005 or JTBD-200 would manufacture grounding for a decision already made, and the corpus would then appear to support the probes because the support was written into it. That is the same contamination ADR-043 corrected when it moved the editor off the ADR-041-retired jobs. The decline is itself a decision and the ADR must record it with this reasoning.

   **Why a third path is legitimate.** The advisory-only class carries an honestly-recorded **non-reader rationale**: the issue line and the label serve feed recognition for a returning subscriber, which is distribution, not a documented reader job. This corpus does not require every check to trace to a JTBD (ADR-013 is grounded on account risk, ADR-030 partly on distribution, ADR-032's provenance amendment explicitly on credibility rather than compliance). The rule it does hold is narrower: **an applied edit to reader-facing prose must be job-grounded**, because ADR-043 removed the filter that used to absorb mis-grounded findings. The licence for the advisory class comes from having no remediation authority, not from the rationale being strong enough. State it in those terms in the ADR.

   **Not a breach of P122's forward rule.** P122 pins that any future axis justified only by "this reduces Tom's review rounds" is ungrounded and must be blocked until an author persona is ratified. Distribution and feed recognition is a different justification from review-load reduction, so the advisory class is compliant as written. The two records will read as inconsistent to a future reader unless the ADR names the distinction, so name it.

   > **REVERSED IN PART, 2026-08-09. Read this before acting on the decline above.**
   >
   > The "No JTBD outcome is added. Explicitly declined." bullet no longer stands.
   > Tom was asked the separate merits question this ticket queued at line 90, is a
   > stable weekly shape a reader benefit or an editorial cage, and answered that it
   > is a reader benefit. The job is recorded at
   > `docs/jtbd/engineering-leader/JTBD-006-navigate-an-edition-i-already-know-my-way-around.proposed.md`.
   >
   > Three things that did **not** change, and the distinctions matter:
   >
   > - **The contamination objection is not answered by the job existing.** It is
   >   about causal order, so filing the grounding in a new job rather than as new
   >   outcomes on JTBD-005 is a topological move, not an evidentiary one. JTBD-006's
   >   Notes section says so in its own words. What discharges it is ratification via
   >   `/wr-jtbd:confirm-jobs-and-personas`, which has not happened. JTBD-006 carries
   >   `human-oversight: unconfirmed`.
   > - **No probe's authority changes.** The advisory class stays advisory. This
   >   ticket's own rule holds: the licence for that class comes from having no
   >   remediation authority, not from the rationale being strong enough, and those
   >   are two axes. JTBD-006 moves the grounding axis only, and carries an operative
   >   anti-outcome clause saying so. Promoting the issue-line DROP, the `Reply` DROP
   >   or DRIFT to remediating is a separate decision for Tom. DRIFT additionally
   >   carries the reliability limitation at line 129, which grounding does not touch.
   > - **The length ceiling stays**, on Tom's direction, and the GCC-clause evidence
   >   at line 21 is carried into JTBD-006 as its anti-outcome rather than dropped.
   >   Coming in under the ceiling is not evidence the job was served; what got cut
   >   to get there is the question.
   >
   > The "Why a third path is legitimate" paragraph below is now partly stale: feed
   > recognition is a documented reader job as of JTBD-006 outcome 3, not only a
   > distribution rationale. It becomes fully stale on ratification. It is left in
   > place rather than rewritten, because it is the reasoning as it stood on
   > 2026-08-07 and this ticket is the record of that.

3. ~~**New:** settle the step-15.37 classification precedence (section 4) in whichever of P121 or P122 lands first.~~ **DONE 2026-08-07.** Settled as wrongness outer, grain inner, and recorded in ADR-043's `## Amendment 2026-08-07 (P121, P122)` clause 3, which covers both tickets in one section rather than two sequential patches.

4. **DONE 2026-08-07: the decision record exists.** ADR-044 (Cross-edition shape as a fresh-context subagent gate) is written and substance-confirmed, and lands the joint amendment on ADR-043 plus the criterion-6 correction on ADR-020. **This ticket's remaining work is implementation**, not design: author `.claude/agents/wr-newsletter-shape.md`, wire steps 15.36 and 15.57 into SKILL.md, and add the three template-invariant checks to `check-newsletter-structure.sh` with tests. Note that last item is new work ADR-044 creates: the structure lint implements checks (a) through (g) today and none covers the `**From Tom**` opener, the `### Item N:` prefix or the per-item bold labels.

## Implementation state, 2026-08-07

**Part 1 DONE.** `.claude/agents/wr-newsletter-shape.md` exists, satisfying ADR-044 confirmation criteria 1 through 5. It carries the fresh-context clause, the mechanical-verdict rule, the N=2 window rationale with the explicit "window not threshold" correction, the ADR-039 path shape, both boundary seams, the two framings, and the two-axis classification. Note the design changed twice under architect review: the post's reply instruction is carved back **in** as advisory (ADR-032 extends only element 5 to the companion, so the brief-side exclusion must not swallow it), and findings now carry **both** `CLASS: defect|deviation` and `AUTHORITY: remediating|advisory` because ADR-043 clause 3's outer wrongness test needs an input rather than inferring one. `REMEDIATING_COUNT` was added so the loop can treat an advisory-only verdict as clean.

**Part 2 DONE.** SKILL.md carries steps 15.36 (brief) and 15.57 (post), both invoking `wr-newsletter-shape`. Delivered against the specification below; three things were settled in the doing:

1. **The post-surface asymmetry resolves as sequence, and 15.57's inline round re-invokes ONLY the shape gate.** Not the skeptic. That is what keeps the post inside ADR-044's budget of one site call plus one re-invocation. The skeptic already had its paired round at 15.55 against a body the shape edit has since changed, and re-gating that is section 15.6's job rather than a second inline round.
2. **Step 15.37's no-op condition now keys on a count, not a verdict.** It no-ops when 15.25 and 15.35 returned PASS AND 15.36 returned `REMEDIATING_COUNT: 0`. An advisory-only `DIFFERENCES_FOUND` is clean, because the loop is forbidden to act on advisories and would otherwise burn an agent invocation for zero body delta.
3. **Section 15.6 gained three rows, not two**: 15.36, 15.57, and a rewritten 15.37 row whose trigger and no-op both had to change. The inner-loop exemption paragraph also names the shape contributor now, or a reader would conclude the loop re-invokes only two gates.

Also updated: the preamble gate count (six to seven, with the shape gate described), the ADR reference list, the gate-inventory sentence, all three phase-table rows, the step 16 save-block (`## Shape Review`, plus finalise and LinkedIn-post variants), and the step 17 Tom-summary, which reports advisory differences in full because they are the ones waiting on Tom, and reports the gate's Strengths so a departure that served the edition is visible rather than only the negatives.

**Part 3 PARTIALLY DONE.** Three checks landed in `scripts/check-newsletter-structure.sh` with six sibling tests (25 passing):

- **(h) provenance line before the first `### Item`.** This discharges ADR-032's deferred check, which its Amendment 2026-08-03 said should be built with the loop rather than after it. The loop shipped as ADR-043 on 2026-08-05, so this was overdue independently of P121. Taking `(h)` for provenance also avoids the letter collision: ADR-032 names it `(h)` twice, so labelling the new checks h-k would have pointed a ratified reference at the wrong check.
- **(i) the `**From Tom**` opener.** Verified against the corpus: editions published 2026-07-06 and 2026-07-13 open with inline `From Tom: ...` instead of the bold slot, and the test uses that exact shape.
- **(j) the CTA is a question (ADR-032 element 6).** Tom settled the conflicting-targets question on 2026-08-07 by choosing to keep the ADR and correct the template, which landed in the same session. The check asserts the cheap half, a question mark in the CTA block, and shares check (g)'s extractor so the two cannot disagree about where that block starts. It catches both failing shapes that actually shipped: a statement CTA, and a forward request.

**Behaviour on the historical corpus, which is the point rather than a defect.** Check (h) fires on the editions published 2026-07-20 and 2026-07-27 because element 5 did not exist until the 2026-08-03 amendment; Issue 16 passes. The Issue 09 fixture test was rescoped to assert cleanliness on checks (a) through (g) only, rather than asserting a June edition satisfies August's rules. This is ADR-044's argument for lint ownership made concrete: a precedent-based check would have let these lapse, a template invariant catches them.

**Two checks deliberately NOT written, because the corpus says they would be wrong:**

- **`### Item N:` prefix.** The architect specified carving out `### Also worth noting`. That is necessary but not sufficient: the corpus also carries legitimate non-item `###` sections, including the forward-deadline slot (`### Four months out: ...`), which is the very convention P121 exists to protect. A check asserting every `###` is an item would fire on it every edition. Needs a rule that distinguishes an item section from a named section, which is not obviously deterministic.
- **Per-item bold labels.** The architect flagged the persona risk and the corpus confirms it: `personas/developer.md` never defines the three labels, and there are no published Tokens Spent editions to check against. Hardcoding `**Why it matters to your team:**` would break the developer persona the first time it runs. Needs the developer labels settled first.

Both are recorded here rather than shipped half-right.

### Part 2: SKILL.md wiring (delivered 2026-08-07; specification retained)

Step numbers 15.36 and 15.57 are ADR-pinned in both ADR-044 and ADR-043 clause 1; renumbering needs an amendment. Ordering verified: 15.36 sorts between the skeptic at 15.35 and the loop at 15.37; 15.57 sorts between the skeptic-on-post at 15.55 and section 15.6.

- **Section 15.6's dirty-body re-run table needs a row per site.** A gate with no row is silently skipped after a late edit, which is exactly the P099 regression that table prevents. Give 15.36 a brief-body-changed trigger and 15.57 a post-body-changed trigger, each with its skip, and decide how ADR-043 condition (c)'s non-resetting counter applies to the shape contributor.
- **Skip semantics must be stated, not inherited.** ADR-044 requires each site to carry its own. At minimum 15.57 skips on `phase=prep` (no post exists, mirroring 15.55). 15.36 needs an explicit skip-on-critic-REJECTED decision and a `15.36-prime` carry-forward rule matching the 15.25-prime and 15.35-prime pattern.
- **Two inventory lines need updating**: the gate enumeration around SKILL.md line 38, and the ADR reference list near line 9.
- **Resolve the post-surface asymmetry explicitly.** On the brief, 15.37 collects editor, skeptic and shape into one paired round. On the post, 15.55 runs its inline round and 15.57 would run a second, so a shape remediation there re-dirties the post and re-enters 15.6. Pick pairing or sequence in the prose and write down the interaction with condition (c). ADR-044's budget table assumes one post-site call plus one inline re-invocation, so a pairing design must not silently exceed it.

### Part 3: deterministic lint checks

- **Letter collision, resolve first.** ADR-032's amendment names the deferred provenance check `(h)` and the script currently implements (a) through (g). Labelling the new checks h-k would point ADR-032's ratified reference at the wrong check. **Build (h) as provenance here** (its spec is fully written: presence before the first `### Item` heading, brief-only, with the companion as the cheap second half) and label the four new ones i-l. This discharges an ADR-032 obligation that is already overdue, since its amendment said to build it *with* the loop and the loop has landed. Record it as discharging ADR-032, not P121.
- **The reply-prompt check has two ratified targets that disagree, and must not ship until resolved.** ADR-032 element 6 fixes "one substantive content-tied question against one of the deep items' threads". But `draft-template.md` and both persona configs offer four invitation variants, none containing a question, one of which ("Forward this to a colleague...") is not a reply prompt at all. Published practice follows ADR-032, not the template: every recent edition closes with a question plus "Reply and tell us". So a faithful element-6 check passes the corpus and fails the drafter's own instructions. Either assert presence-of-one-invitation-line only (the exact complement of check (g), leaving question-ness to the LLM gates), or assert question-ness **and** correct the template plus both persona configs in the same change.
- **Reuse check (g)'s CTA-block extractor.** It defines the block as everything after the final `---`, skipping blanks, markdown-link lines and the domain. Note it skips all markdown-link lines, and two recent editions render the sign-off as a markdown link. A reply-prompt check that does not share the extractor will disagree with (g) about where the CTA block starts.
- **Two checks encode invariants the recent corpus violates**, which is intended (it is ADR-044's argument for lint ownership) but needs a conformance decision. `**From Tom**`: 2026-06-08 uses an H2 heading and 2026-07-06 and 2026-07-13 use inline prose. Decide whether those forms conform, and make the failure message name the template form. `### Item N:` prefix: Issues 12 and 13 use a bare `### <headline>`. The check must carve out `### Also worth noting` or it fires on the coda every edition, and it must assert the prefix only, never contiguous numbering from 1, which would over-fire.
- **Per-item bold labels: scope and persona risk.** Scope the check to `### Item` sections only, since Also-worth-noting entries use bold headline leads and would false-positive. Confirm the developer persona uses the same three labels before hardcoding "your team": the lint takes only a path and cannot tell the personas apart, and there are no published developer editions to check against.


## Fix delivery diverged from this Fix Strategy (noted 2026-08-08)

**Not transitioned to Verification Pending, deliberately, because the delivered form is not what this strategy specifies and the gap has not been assessed.**

This strategy's section 1 is titled "A deterministic lint, not a gate", and sections 3 and 4 specify three finding classes (DROP, DRIFT, LENGTH) with named probes and a routing table. What shipped is **ADR-044 (Cross-edition shape as a fresh-context subagent gate)**, which Tom ratified on 2026-08-07 after choosing "add a new subagent gate, remove the ceiling" over the lint. The subagent is live: `.claude/agents/wr-newsletter-shape.md` exists, and SKILL.md wires it at step 15.36 (brief) and step 15.57 (LinkedIn post).

So the decision this ticket asked for was made, and made against this strategy rather than for it. The subagent emits `SHAPE_VERDICT` / `SURFACE` / `WINDOW` / `EDITIONS_REVIEWED` / `REMEDIATING_COUNT` plus per-difference `CLASS` and `AUTHORITY`, which is a different output shape from the DROP / DRIFT / LENGTH probe classes this strategy names.

**What is not established** is whether the subagent's judgement covers what the named probes would have caught deterministically. The forward-deadline DROP and the LENGTH ceiling were the two this strategy marked as JTBD-005-grounded and therefore remediating; a subagent may or may not surface them reliably, and no run has exercised it yet.

**Next step**: after the first `/wr-newsletter` run under ADR-044, compare what the shape gate actually reported against the five probes named in section 3. If the grounded two are covered, this ticket transitions to Verification Pending on that evidence and sections 1, 3 and 4 are marked superseded by ADR-044. If they are not, the residue is a real gap and this ticket stays open against it.

Flagged rather than transitioned because transitioning on "a decision was made" would record a fix that has not been shown to close the ticket's own evidence.


## Dry-run result, 2026-08-08: one probe of three is a real gap

The shape gate was run against the published Issue 16 companion post with Issues 15 and 14 as priors, before any new edition, specifically to answer whether ADR-044's subagent covers the probes this strategy specified. It does not need a live run to settle; the published corpus is sufficient evidence.

**LENGTH ceiling: NOT covered. This is the gap.** Section 3 specifies the post's character count against a **1.5x trailing median** of the prior editions' posts, and marks it JTBD-005-grounded and therefore remediating. The gate read the same three posts and reported 1,320 / 1,650 / 2,340 characters. The median of the two priors is 1,485, so the 1.5x ceiling sits at 2,228 and Issue 16's post is 2,340, over it by about five percent. The gate saw the trend and said so, then explicitly declined to make it a finding: *"This is explicitly not a finding, since nothing appears cut to fit and my only length criterion is the upper bound"*, that bound being LinkedIn's 3,000-character platform limit. So the gate applies a much looser, differently-grounded threshold. On this edition, this strategy's probe fires and the gate does not.

**DROP forward-deadline: no gap demonstrated.** All three briefs carry forward-deadline language (Issue 14 "from 6 to 10 months through 2025", Issue 15 the Article 50 transparency obligation, Issue 16 "deadline took effect"). Nothing was dropped, so the probe would not have fired either. The gate's silence is correct behaviour rather than a miss. Untested, not failed.

**DRIFT: expected absence.** This strategy already recorded that the two-prior precedent test would not fire DRIFT on Issue 16, because only Issue 15 carried the label line. Confirmed.

**What the gate did instead, which is worth keeping.** It surfaced two differences this strategy's probes would have missed entirely: the brief's headline no longer reproduced verbatim anywhere in the post, and the post giving no signal that the issue holds ten more roundup entries including a direct continuation of the prior issue's lead. Both classed `deviation` / `advisory`, both argued rather than asserted. So the subagent is not a weaker instrument than the lint; it is a differently-shaped one that misses a mechanical threshold while catching judgement-shaped breaks a probe could not express.

**Residue is therefore one probe**, and it is the one that is purely arithmetic: character count against a trailing median. Where it should live is an open question, recorded below rather than decided here.


## Residue closed 2026-08-08: check (l) in the structure lint

Tom's direction: the arithmetic check goes to the deterministic lint, not into the subagent. Grounds: it is a character count against a median, so a script does it exactly and for free, and ADR-042 already assigns structural hygiene to this lint while keeping judgement with the agents. The dry-run above is the evidence that the agent does not do it reliably, since it read the same numbers and declined to act on them.

Shipped as **check (l)** in `scripts/check-newsletter-structure.sh`. Verified against the corpus: it fires on Issue 16 (2,343 characters against a 2,182 ceiling, being 1.5x the 1,455-character median of Issues 15 and 14) and stays quiet on Issues 14 and 15. It self-excludes, so re-linting a published edition does not compare it against itself, and it skips rather than fails when fewer than two priors exist.

**Known limitation, measured rather than assumed.** The trailing median ratchets: Issue 16's over-length post lifts the following edition's ceiling from 2,182 to 2,986, which is within a whisker of LinkedIn's 3,000 limit. So the check reliably catches the first over-length edition in a run and is weakest immediately after one, and a sustained upward drift could walk past it one edition at a time. This is faithful to the trailing-median rule section 3 specifies rather than a defect in the implementation. If drift is observed, the fix is to take the median over recent editions that themselves passed rather than over all recent ones. Recorded here so it is not rediscovered as a surprise.

With this shipped, all three of section 3's finding classes are accounted for: LENGTH is the lint's, DROP and DRIFT are the subagent's and neither showed a gap on the dry run. Sections 1 and 4 are superseded by ADR-044 on the home question. Transitioning to Verification Pending on the next run's evidence remains the right gate, because the subagent half has still not run in anger.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P120, P117, P080

## Related

- **P120** (`docs/problems/open/120-editor-and-skeptic-gates-surface-findings-to-tom-instead-of-remediating-them.md`): the remediation-loop ticket. If a shape gate lands while gate findings still route to Tom by default, it adds detection without reducing his load. Sequencing matters; see Investigation Task 4.
- **P117** (`docs/problems/verifying/117-tighten-newsletter-gate-prompts-for-lower-frequency-external-review-classes.md`): extended the cross-edition gate with a dropped-thread scan. That is content continuity; this is structural continuity. Same gate, adjacent axis.
- **P080** (`docs/problems/.../080-newsletter-pipeline-has-no-cross-edition-thesis-contradiction-check.md`): the ticket that built the cross-edition gate under ADR-038, scoping it to thesis contradiction.
- **P070** (`docs/problems/.../070-newsletter-draft-template-does-not-codify-three-deep-items-plus-notes-discipline.md`): codified the canonical shape into ADR-032. That work encodes the shape in the abstract; this ticket is about the conventions that live only in the published corpus.
- **ADR-038** (`docs/decisions/038-cross-edition-thesis-consistency-check-as-fresh-context-subagent-gate.proposed.md`): scopes the cross-edition gate to thesis consistency. Capture assumed widening it would need an amendment; investigation ruled the gate out as the home on ordering grounds, so its charter is untouched and no amendment is needed.
- **ADR-043** (`docs/decisions/043-bounded-editorial-remediation-loop-for-editor-and-skeptic-gates.proposed.md`): the decision P120 shipped as. Its step 15.37 is where brief-shape findings route, and its 15.55 inline rule is where post-shape findings route. ~~Currently `human-oversight: unconfirmed`, which is precondition 1~~ **RATIFIED 2026-08-05** (`human-oversight: confirmed`, `oversight-date: 2026-08-05`); precondition 1 is discharged.
- **ADR-032** (`docs/decisions/032-newsletter-editorial-discipline-policy.proposed.md`): owns the newsletter editorial shape, already defers the deterministic check (h) this work has to draw a boundary against, and records the provenance line as remediation-invariant.
- **ADR-035** (`docs/decisions/035-critic-rubric-shape-is-strengths-weaknesses-plus-context.accepted.md`): the coverage-partitioning driver that rules out loading a shape axis onto an existing gate.
- **ADR-020** (`docs/decisions/020-newsletter-editor-subagent.proposed.md`): ~~reassessment criterion 6 sets the subagent invocation ceiling ADR-043 records as already breached, which is why the fix is a script rather than an agent.~~ **Both halves of that sentence are wrong, corrected 2026-08-07.** Criterion 6 sets no ceiling: it is a trigger naming two valid responses to crossing 15 invocations, and it contains no prohibitive verb. And the fix is an agent, not a script, per ADR-044. The budget was re-asserted, which is the first of the two responses the criterion authorises. ADR-020 now carries the correction adjacent to criterion 6 itself.
- **P089** (`docs/problems/.../089-...md`): built `scripts/check-newsletter-structure.sh`, the deterministic-lint idiom this fix follows.
- **JTBD-005** (`docs/jtbd/engineering-leader/JTBD-005-stay-ahead-of-the-shift.proposed.md`) and **JTBD-200** (`docs/jtbd/developer/JTBD-200-signal-from-noise.proposed.md`): the live persona anchors. JTBD-001 through JTBD-004 were retired by ADR-041 on 2026-07-10 and must not be cited here.
- **JTBD-006** (`docs/jtbd/engineering-leader/JTBD-006-navigate-an-edition-i-already-know-my-way-around.proposed.md`), added 2026-08-09: the reader job this ticket's shape rationale was missing, recorded on Tom's direction. It is the foundation for the ticket's shape claim, and it is **provisional**: `human-oversight: unconfirmed`, and it reverses the 2026-08-07 decline recorded in precondition 2 above without discharging that decline's objection. Cite it as provisional grounding, never as settled. It changes no probe's remediation authority.
- Reproduction fixture: commit `d2d674a`, `src/newsletters/drafts/leader/2026-08-03/`. The published edition at `src/newsletters/published/leader/2026-08-03/` is post-remediation and is NOT usable as a fixture.
- **Upstream report pending** -- false positive; detection misfire. The P063 external-root-cause scan matches the word "external" in this ticket's prose, where it describes a human reviewer rather than an upstream dependency. There is no upstream dependency and nothing to report.
- Evidence corpus: `src/newsletters/published/leader/2026-07-27/2026-07-27.linkedin.md` (1,655 chars, carries all four elements Issue 16 dropped) against `src/newsletters/published/leader/2026-08-03/2026-08-03.linkedin.md`.
- Captured via `/wr-itil:capture-problem` during the Issue 16 retrospective (2026-08-04), against Tom's framing: "what would we need to change to require less feedback from me and the external reviewer".
