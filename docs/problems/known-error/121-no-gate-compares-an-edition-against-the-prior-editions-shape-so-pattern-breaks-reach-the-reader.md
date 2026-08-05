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

### Why the fix is not proposed in this iteration

Two direction calls block the build, both category-1 and both Tom's. They are recorded here so the next iteration does not re-derive them:

1. **ADR-043 is unratified.** `wr-architect-is-decision-unconfirmed ADR-043 docs/decisions` exits 0, and ADR-043 is the only decision in `docs/decisions/` carrying `human-oversight: unconfirmed`. The fix routes through its step 15.37, widens its no-op condition, and amends its stated contract. Building on it now stacks an unconfirmed decision on an unconfirmed decision, which is the substance-confirm-before-build guard's case exactly. If Tom amends or rejects ADR-043's loop shape, the whole answer to Investigation Task 4 is invalidated.
2. **The reader benefit this fix asserts is not in the JTBD corpus.** No documented job or persona records a stable, recognisable weekly shape as a reader benefit. JTBD-005 outcomes support the DROP of the forward-deadline slot (outcome 4, confidence nothing actionable was missed) and the length ceiling (outcome 1 and outcome 3, via the evidence that a load-bearing GCC clause was cut to buy ceiling space). Nothing supports DRIFT, the issue line, the reply instruction, or a length floor. Under ADR-043 those findings become applied edits to reader-facing prose with no override arm, so shipping them ungrounded is the mis-grounded-finding failure ADR-043 named when it corrected the editor's retired-job grounding in the same commit. The corpus gap is real and pre-existing: the personas are all readers, so Tom's own framing for this ticket ("what would we need to change to require less feedback from me and the reviewer") is an author job nothing in `docs/jtbd/` models. Adding outcomes to JTBD-005 and JTBD-200 is direction-setting and needs ratification. It is also the right question to put to Tom on the merits: is a stable weekly shape a reader benefit or an editorial cage?

No RFC is created in this iteration. Per ADR-022's corrected semantics, Known Error means root cause identified and workaround documented with the **fix not yet proposed**; the fix proposal happens after Known Error and is what produces the RFC per ADR-072. `wr-itil-check-fix-rfc-trace` will fire at that point, which is the correct moment: an RFC scoped now would be scoped against two unresolved direction calls, and a mis-scoped auto-authored RFC is the signal ADR-073's own reassessment criterion watches for.

## Fix Strategy

Settled shape, blocked on the two direction calls above. Not yet proposed as an RFC.

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
- **LENGTH.** Post character count against the trailing median of the prior editions' posts. The **ceiling** (1.5x) is a remediable finding, anchored on JTBD-005 outcome 1 and outcome 3 through the evidence that a load-bearing GCC clause was cut to buy ceiling space. The **floor** is advisory only and never remediated: nothing in JTBD-005 or JTBD-200 values minimum length, and a short issue is a good week rather than a defect. A floor that pressures the drafter to pad inverts the job.

Known limitation to record in the ADR's Consequences: the two-prior precedent test is deliberately strict and would **not** have fired DRIFT on the motivating case. At Issue 16 the priors were Issues 14 and 15, and only Issue 15 carried `This week:`, so there was no shared precedent to drift from. The DROP probe on the issue line **would** have fired, since Issues 14 and 15 both carry one, so the evidence class survives; but the strictness is a real trade and should be stated rather than left implicit.

### 4. Routing

Per Investigation Task 4. Brief-shape findings enter SKILL.md step 15.37's collect step as a third source alongside the editor and skeptic findings; post-shape findings take the inline one-round path at 15.55 that ADR-043 already established for the skeptic-on-post. The lint gets its own invocation site with its own skip and phase semantics rather than inheriting 15.37's critic-REJECTED skip, and 15.37's no-op condition widens to include the shape diff. Re-running the lint in round 2 costs zero invocations, so the round-2 re-check is free.

DROP findings are stop-and-surface and do not consume the round, mirroring the treatment ADR-043 already gives a skeptic finding that cannot be remediated without new sourcing.

One remediation carve-out to name explicitly: ADR-032 records the provenance line as **remediation-invariant**, so a loop may flag it but may not silently rewrite it. Any shape finding touching that line is residual-advisory only. ADR-043 already carries the general form ("Bounded by ADR-032"); the ADR for this work must name the provenance case specifically, because the `**From Tom**` slot the line now lives in is exactly what a shape probe would reach for.

### 5. Decision record

A new ADR recording the deterministic-lint home, the single-edition versus cross-edition boundary, the three classes and their asymmetric remediation contracts, plus:

- an `## Amendment <date> (P121)` section on ADR-043 naming the widened no-op condition and the third collect source verbatim. Amendment, not supersession: ADR-043's chosen option, one-round cap, skeptic differential, residual-advisory arm, no-override arm, and its four section-15.6 conditions all survive unchanged. This matches how ADR-043 itself amended ADR-020 and ADR-042 in place.
- a note recording that ADR-038's charter was considered and deliberately **not** widened, with the ordering reason.
- 044 is the next free local ID, but the upstream `wr-retrospective` plugin has its own ADR-044 in a different namespace, so cite it with its title on first mention the way ADR-043 line 17 already does for its own ID.
- `docs/decisions/README.md` must be hand-edited rather than regenerated: P087 records that the upstream generator emits em-dashes that trip this repo's no-em-dash hook. Say so in the ADR so the divergence stays deliberate.

### Preconditions

1. ADR-043 ratified via `/wr-architect:review-decisions`.
2. Tom's call on whether a stable weekly shape is a documented reader benefit. If yes, add the outcome to JTBD-005 and JTBD-200 and ratify via `/wr-jtbd:confirm-jobs-and-personas` before the lint lands. If no, the fix narrows to the two job-grounded axes (the forward-deadline DROP and the length ceiling) and DRIFT is dropped.

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
- **ADR-043** (`docs/decisions/043-bounded-editorial-remediation-loop-for-editor-and-skeptic-gates.proposed.md`): the decision P120 shipped as. Its step 15.37 is where brief-shape findings route, and its 15.55 inline rule is where post-shape findings route. Currently `human-oversight: unconfirmed`, which is precondition 1.
- **ADR-032** (`docs/decisions/032-newsletter-editorial-discipline-policy.proposed.md`): owns the newsletter editorial shape, already defers the deterministic check (h) this work has to draw a boundary against, and records the provenance line as remediation-invariant.
- **ADR-035** (`docs/decisions/035-critic-rubric-shape-is-strengths-weaknesses-plus-context.accepted.md`): the coverage-partitioning driver that rules out loading a shape axis onto an existing gate.
- **ADR-020** (`docs/decisions/020-newsletter-editor-subagent.proposed.md`): reassessment criterion 6 sets the subagent invocation ceiling ADR-043 records as already breached, which is why the fix is a script rather than an agent.
- **P089** (`docs/problems/.../089-...md`): built `scripts/check-newsletter-structure.sh`, the deterministic-lint idiom this fix follows.
- **JTBD-005** (`docs/jtbd/engineering-leader/JTBD-005-stay-ahead-of-the-shift.proposed.md`) and **JTBD-200** (`docs/jtbd/developer/JTBD-200-signal-from-noise.proposed.md`): the live persona anchors. JTBD-001 through JTBD-004 were retired by ADR-041 on 2026-07-10 and must not be cited here.
- Reproduction fixture: commit `d2d674a`, `src/newsletters/drafts/leader/2026-08-03/`. The published edition at `src/newsletters/published/leader/2026-08-03/` is post-remediation and is NOT usable as a fixture.
- **Upstream report pending** -- false positive; detection misfire. The P063 external-root-cause scan matches the word "external" in this ticket's prose, where it describes a human reviewer rather than an upstream dependency. There is no upstream dependency and nothing to report.
- Evidence corpus: `src/newsletters/published/leader/2026-07-27/2026-07-27.linkedin.md` (1,655 chars, carries all four elements Issue 16 dropped) against `src/newsletters/published/leader/2026-08-03/2026-08-03.linkedin.md`.
- Captured via `/wr-itil:capture-problem` during the Issue 16 retrospective (2026-08-04), against Tom's framing: "what would we need to change to require less feedback from me and the external reviewer".
