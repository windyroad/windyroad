# Problem 122: No gate owns within-edition structural mechanics, so assembly defects reach the reader

**Status**: Open
**Reported**: 2026-08-05
**Priority**: 12 (High), Impact: 3 x Likelihood: 4, derived at capture from the description. Impact is 3 because assembly defects degrade the read for every reader (an item run that fights its own thesis, a close that does not discharge the headline) without shipping anything factually wrong. Likelihood is 4 because every edition is assembled fresh and no gate reads for assembly, so the defects are detected only if a human happens to notice.
**Origin**: internal
**Effort**: M, derived at capture. Extend the editor gate's craft-axis set and its prompt, or add a sibling pass. Comparable to P117's three-gate prompt tightening, also rated M.
**WSJF**: 6.0 = (12 x 1.0) / 2

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

## Impact Assessment

- **Who is affected**: readers (the edition reads as less than the sum of its parts); Tom and the external reviewer (carry the whole-edition read manually).
- **Frequency**: every edition, since assembly is re-done each week and no gate reads for it.
- **Severity**: no factual error ships. The cost is a weaker read plus the review rounds spent re-assembling after the fact.
- **Analytics**: none.

## Root Cause Analysis

### Investigation Tasks

- [ ] **Sequencing gate: do not start before P120 lands.** Adding axes to a gate whose findings are routed to Tom by contract increases his review load instead of reducing it. This is the same constraint P121 records in its Investigation Task 4, and it is the reason this ticket is captured rather than built.
- [ ] Decide the home: extend the editor gate's craft-axis set, or add a sibling whole-edition pass. Extending is cheaper (the editor already reads the full body); a sibling keeps the editor's reader-experience charter clean. ADR-020 pins the craft-axis vocabulary, so extending needs an amendment.
- [ ] Define the axes. Candidates from the evidence: does the item order serve the stated thesis; does the close discharge the headline's claim; is any content duplicated across sections; does every cross-reference point backward; does any demoted-section entry carry promoted-section weight; does every section heading describe what its contents actually deliver.
- [ ] Decide finding-vs-advisory per axis. Some assembly choices are deliberate: Issue 16's kill-switch entry legitimately stayed in Also worth noting once the close acknowledged it was reaching down. The gate should require a stated reason, not force a restructure.
- [ ] Check the interaction with P113's stop rule. Assembly findings are structural and therefore expensive to remediate (finding 1 required reordering four items and repairing every cross-reference). A round cap tuned for one-line rhythm nits will be wrong for these.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: P120 (sequencing, see the first Investigation Task)
- **Composes with**: P120, P121, P117, P113

## Related

- **P120** (`docs/problems/open/120-editor-and-skeptic-gates-surface-findings-to-tom-instead-of-remediating-them.md`): same gate, different root cause. P120's cause is the routing contract (the gate detects correctly and hands the finding to Tom); this ticket's cause is coverage absence (five craft axes exist and none reads assembly). This ticket is sequenced behind it.
- **P121** (`docs/problems/open/121-no-gate-compares-an-edition-against-the-prior-editions-shape-so-pattern-breaks-reach-the-reader.md`): sibling by shape, distinct by input. Both are "no gate owns X" and both sequence behind P120. P121 is **cross-edition**: it needs the prior edition's artefact to detect anything, and targets the ADR-038 cross-edition gate. This is **within-edition**: every one of the eight findings is detectable from Issue 16 in isolation, and it targets the ADR-020 editor gate. The `wr-itil:hang-off-check` arbitration (2026-08-05) returned PROCEED_NEW on exactly that distinction, and recommended `/wr-itil:review-problems` consider a common "gate-coverage gaps sequenced behind P120" cluster at the next pass.
- **P117** (`docs/problems/verifying/117-tighten-newsletter-gate-prompts-for-lower-frequency-external-review-classes.md`): the prior round of editor-prompt tightening, fix released and verifying. Its delivered per-bullet ATWN sweep demonstrably WORKED on Issue 16 (it caught the two off-thesis entries); the failure was that the finding was not acted on, which is P120's surface. So this is post-fix-released discovery of a different class, not scope P117 named.
- **P116** (`docs/problems/verifying/116-newsletter-gates-lack-adversarial-ceiling-gate-external-review-still-finds-substance-issues.md`): finding 8 (a bullet listing where it should argue) is adjacent to the skeptic's promise-payoff facet, but the other seven are presentation and assembly rather than claim-evidence.
- **P113** (`docs/problems/known-error/113-newsletter-review-gate-loop-editor-one-nit-per-pass.md`): the round-cap and stop-rule design must account for assembly findings being structurally expensive to remediate.
- **ADR-020** (`docs/decisions/020-newsletter-editor-subagent.proposed.md`): pins the five craft axes. Extending the set needs an amendment.
- Captured via `/wr-itil:capture-problem` during the Issue 16 follow-up (2026-08-05). This class was identified during the 2026-08-04 retrospective and not ticketed at the time, which was a gap in that retro's Step 4b execution.
