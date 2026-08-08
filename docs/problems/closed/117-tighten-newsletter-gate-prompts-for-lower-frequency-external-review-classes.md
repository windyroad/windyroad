# Problem 117: Tighten existing newsletter gate prompts for the lower-frequency external-review classes

**Status**: Closed
**Reported**: 2026-07-14
**Closed**: 2026-08-08, on user direction after the counter-evidence read: close for the classes that work, route the residue. Class 1 verified on Issue 16, class 3 un-contradicted, class 2's residual miss moved to P121, and the pipeline residue hung off P099. See "Counter-evidence from published editions (2026-08-08), and how it settled".
**Priority**: 6 (Medium), Impact: 2 x Likelihood: 3, derived at capture from the description
**Origin**: internal
**Effort**: M, derived at capture

## Description

The 11-edition external-review corpus analysis (run under P116) surfaced three recurring-but-lower-frequency classes of substantive external-review catch that the new adversarial skeptic gate (ADR-042) deliberately does NOT own, because each maps to an existing gate that is demonstrably missing it:

1. **Through-line / off-thesis pruning** (4 findings: 2026-05-08, 2026-06-01, 2026-06-22, 2026-07-13). An "and this week's news" bullet or item that does not fit the edition's thesis. Owner: the `wr-newsletter-editor` gate already has `atwn-thesis-fit` and `through-line` axes; they miss some. Fix: tighten the editor prompt.
2. **Cross-edition dropped threads** (1 finding but the strongest point of the 2026-06-22 review: threads carried from a prior edition were dropped). Owner: the `wr-newsletter-cross-edition-consistency` gate checks contradiction, not dropped continuity. Fix: extend its prompt to also flag dropped threads.
3. **Operational actionability of the so-what** (2-3 findings: 2026-05-15, 2026-06-29: an item's action too abstract or unauditable to act on). Owner: the `wr-newsletter-critic` gate owns "is the so-what answered"; it misses actionability. Fix: tighten the critic prompt.

Split from P116 so that ticket can verify and close on the adversarial skeptic gate (the dominant claim-evidence class) alone. These three are separate concerns on three separate existing gates, each a bounded prompt-tightening edit rather than a new gate.

## Symptoms

External review catches through-line drift, dropped cross-edition threads, and weak so-what actionability after the internal gates pass. Lower frequency than the claim-evidence class P116 addresses, but recurring across the corpus.

## Workaround

Tom's external editorial review catches them; the same manual ceiling gate P116 addresses.

## Impact Assessment

- **Who is affected**: newsletter readers; Tom (external review still needed for these classes).
- **Frequency**: lower than the claim-evidence class; a handful of editions across the corpus.
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [x] Tighten the editor prompt for through-line / atwn-thesis-fit: sharpened the `atwn-thesis-fit` craft axis into a deliberate per-bullet sweep of every "Also worth noting" bullet.
- [x] Extend the cross-edition-consistency prompt to flag dropped threads: added an advisory dropped-thread scan surfaced in the existing `## Notes` section (verdict-neutral, stays within ADR-038's charter).
- [x] Tighten the critic prompt for so-what operational actionability: added an "Operational actionability of the so-what" section requiring a concrete quarter-scoped move, not abstract implication.
- [x] Verify each on the next live edition: settled on Issue 16 (2026-08-03), not Issue 14. Editor per-bullet ATWN sweep fired; critic ran with no counter-evidence across six external-review rounds; cross-edition dropped-thread scan missed the forward-deadline beat and that scope moved to P121. See "Counter-evidence from published editions (2026-08-08), and how it settled".

## Resolution

Three within-charter prompt tightenings, one per gate, no ADR amendment needed (architect PASS 2026-07-15: each sharpens an existing axis or uses an already-sanctioned advisory surface; JTBD PASS: all serve JTBD-005):

- `newsletter-critic-rubric.md`: operational-actionability facet on the so-what axis.
- `wr-newsletter-editor.md`: per-bullet `atwn-thesis-fit` sweep.
- `wr-newsletter-cross-edition-consistency.md`: advisory dropped-thread Notes observation.

Follow-up flagged by the JTBD review (not in this ticket's scope): the editor agent still grounds its `leader` simulation in the retired JTBD-001/002/003 (ADR-041 retired those; the live leader job is JTBD-005). Worth re-pointing in a separate edit; captured here so it is not lost.

## Fix Released

Delivered to master 2026-07-15: three prompt/rubric edits to `.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md`, `.claude/agents/wr-newsletter-editor.md`, and `.claude/agents/wr-newsletter-cross-edition-consistency.md`. Architect + JTBD gates PASS (within-charter, serves JTBD-005). Live on commit (repo-local agent/skill prose, no changeset).

**Awaiting verification**: the next real edition (Issue 14) exercises the sharpened gates in-pipeline. Verify the editor does the per-bullet ATWN sweep, the critic flags abstract so-whats, and the cross-edition gate surfaces any dropped thread in its Notes.


## Counter-evidence from published editions (2026-08-08), and how it settled

The fix's contract is that tightened gate prompts catch the lower-frequency classes
internally, so external review stops finding them. Three editions have run since it
shipped on 2026-07-15, and Issue 16's reviews sibling records **six further rounds of
external editorial review** after the gate ledger was written
(`src/newsletters/published/leader/2026-08-03/2026-08-03.reviews.md`, section
"Post-gate pass 3: external review rounds 2-6"). On its face that reads as external
review still doing heavy lifting on the classes the prompts were tightened for.

This section originally posed two readings and declined to pick one, on the ground that
settling it needed a read of what those six rounds actually changed against the specific
classes P117 named. **That read has now been done, and it settles on reading 2: the
rounds worked a different class.** The two-reading ambiguity is resolved and no longer
open; what follows replaces it.

**What rounds 2-6 actually changed.** On the brief: the deep items were reordered twice;
a closing paragraph was added collecting the three system-governing moves; the navigation
paragraph, the provenance disclosure's placement and pronoun, Item 4's signposting and
the dated-section heading all changed; a bridge sentence was deleted for
forward-referencing the kill-switch bill and contradicting that bill's own paragraph. On
the LinkedIn companion: rewritten twice, first to restore Issue 15's pattern (issue line,
"This week:", a fourth bullet, the reply prompt), then cut from 2,993 to 2,364 characters
on the author's direction that the post should tease the article rather than restate it.

**None of that is one of this ticket's three classes.** No off-thesis Also-worth-noting
bullet was pruned in those rounds. The cross-edition-consistency gate returned SUPPORTED
on the re-gated final text. No so-what was flagged as too abstract. The rounds are item
order, close-versus-title, signposting, heading-versus-contents, forward-reference
direction, and prior-edition pattern conformance.

**Those classes are ticketed elsewhere, which is why they do not hold this ticket open.**
Item order, the close not paying off the title, signposting, heading-versus-contents and
duplication are five of P122's eight recorded Issue 16 findings (P122 owns within-edition
structural mechanics). Restoring Issue 15's post pattern is prior-edition shape
conformance, which is P121. The number of rounds itself is P113 (gate-loop cost per
pass). Each was verified on disk before being cited here.

**Class-by-class verdict.**

1. **Through-line / off-thesis ATWN pruning (editor gate): verified, closes.** The
   Issue 16 Editor Review names `atwn-thesis-fit` on two Also-worth-noting notes (the
   hedge fund and the maths result, "connect to nothing in the edition's frame"). That is
   the per-bullet sweep this ticket added, firing in-pipeline on a live edition.
2. **Cross-edition dropped threads (cross-edition gate): missed once, and the miss has a
   home.** Issues 14 and 15 both carried a forward-deadline beat; Issue 16 dropped it and
   the advisory Notes scan did not surface it. This is recorded honestly as a miss, not
   as unfalsified. It does not return this ticket to Known Error because the detector for
   it is being built under **P121**, whose Fix Strategy specifies the forward-deadline
   DROP as a JTBD-005-grounded, stop-and-surface probe on a dedicated shape gate. A
   second prompt-tightening on the same advisory Notes surface would compete with that
   gate rather than complement it. The scope moves to P121; it does not stay here.
3. **Operational actionability of the so-what (critic gate): no counter-evidence.** The
   critic ran in-pipeline and returned its verdict, and across six rounds of external
   review no finding in this class was raised. Absence of external catches is weaker than
   a positive firing, so this closes as un-contradicted rather than as demonstrated.

**Closing on this basis.** Two of the three tightenings shipped and are not contradicted
by the strongest available counter-evidence; the third's residual miss is carried by a
ticket that owns the mechanism properly. Keeping P117 open would hold it against work
that is scoped elsewhere, which is what the two-reading ambiguity was risking.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P116 (adversarial skeptic gate for the dominant claim-evidence class)

## Related

Split from P116 (the corpus analysis that surfaced these three classes lives there).

- P116 (`docs/problems/closed/116-newsletter-gates-lack-adversarial-ceiling-gate-external-review-still-finds-substance-issues.md`). The adversarial skeptic gate for the dominant claim-evidence class; this ticket is its lower-frequency prompt-tightening siblings.
- ADR-020 (editor gate), ADR-038 (cross-edition-consistency gate), ADR-033/035 (critic). The three gates this ticket tightens.

Tickets that carry the work Issue 16's external-review rounds 2-6 were actually doing,
established by the 2026-08-08 read that closed this ticket:

- **P121** (`docs/problems/known-error/121-no-gate-compares-an-edition-against-the-prior-editions-shape-so-pattern-breaks-reach-the-reader.md`). Prior-edition shape conformance. Inherits this ticket's class-2 residue: the forward-deadline DROP probe the cross-edition Notes scan missed.
- **P122** (`docs/problems/verifying/122-no-gate-owns-within-edition-structural-mechanics-so-assembly-defects-reach-the-reader.md`). Within-edition assembly mechanics. Five of its eight Issue 16 findings are what rounds 2-6 changed.
- **P113** (`docs/problems/known-error/113-newsletter-review-gate-loop-editor-one-nit-per-pass.md`). The cost of the rounds themselves.
- **P099** (`docs/problems/verifying/099-newsletter-post-finalise-edits-dont-rerun-full-gate-set.md`). Owns the residue those rounds left against the pipeline: editing continued after the gate battery terminated, so the recorded verdicts attach to superseded text.

## Verification evidence: Issue 16 (2026-08-05 review pass). Partial, do not close

Two of the three sharpened gates fired as designed on Issue 16
(`src/newsletters/published/leader/2026-08-03/2026-08-03.reviews.md`):

- **Editor per-bullet ATWN sweep: fired.** The Editor Review names
  `atwn-thesis-fit` on two Also-worth-noting notes (the hedge fund and the maths
  result, "connect to nothing in the edition's frame"), which is exactly the
  per-bullet sweep this ticket added.
- **Critic: ran** and returned its verdict in-pipeline.
- **Cross-edition dropped-thread Notes scan: did not fire on the thread that was
  actually dropped.** Issues 14 and 15 both carried a forward-deadline beat ("Two
  weeks out", "Six days out"); Issue 16 dropped it. The external reviewer caught
  that, not the gate. The gate's own Notes instead flagged a different gap (it was
  not re-run at finalise after the publish-morning thesis correction, which is the
  P099 failure rather than this one).

So the dropped-thread scan is unverified: it has not yet been shown to surface a
dropped thread on an edition that had one.

> **Superseded 2026-08-08.** This section previously closed with "keep in Verification
> Pending until an edition exercises that third criterion". Issue 16 *did* exercise it
> (Issues 14 and 15 carried a forward-deadline beat that Issue 16 dropped) and the scan
> missed it, so the criterion is settled as a miss rather than as untested. The scope
> moves to **P121**, which builds the forward-deadline DROP probe on a dedicated shape
> gate. See the class-2 verdict in the counter-evidence section above. Retained rather
> than deleted so the reasoning that led here stays legible.
