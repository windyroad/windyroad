# Problem 152: No newsletter gate owns parse-on-first-pass comprehension, so an unreadable sentence passes every gate

**Status**: Open
**Reported**: 2026-08-10
**Priority**: 12 (Medium), Impact: 3 x Likelihood: 4, derived at capture from the description per Step 4a. Impact 3 because the failure ships reader-facing prose the reader cannot parse rather than breaking a system, matching P151's calibration for reader-facing newsletter defects; Likelihood 4 because it occurred three times in a single edition and no mechanism prevents recurrence.
**Origin**: internal
**Effort**: M, derived at capture: a contract change to one gate's verdict basis (or one new pass) plus a regression fixture built from the three known instances

## Description

A sentence can satisfy every newsletter reviewer gate and still be unreadable, because no gate owns parse-on-first-pass comprehension.

On the 2026-08-10 Issue 17 finalise run Tom read a publish-bound sentence and could not parse it:

> Of the policy, the record and the number, our answer is the record, and not because it is the most valuable of the three.

It names the record twice and counts to three twice. It had passed voice and content risk, because neither owns readability.

**The seam is on disk and both sides of it point at the other.** `.claude/agents/wr-newsletter-editor.md` line 246 tells the editor to drop the finding: *"If a flag is really about word count or grade level, drop it; that is the cog-a11y gate's job."* And `.claude/skills/wr-newsletter/SKILL.md` line 957 keys the cognitive-accessibility gate on *"Reading grade level (Flesch-Kincaid or equivalent)"*, with line 962 defining `PASS = no critical findings AND grade level at or below target`. Verified on disk 2026-08-10.

A reading-level formula is a function of sentence length and word length. It cannot see referential ambiguity, repeated referents, or answer-before-question ordering. So a passage that is short, plainly worded, low-grade and incomprehensible falls through the gap between the two gates, each of which has explicitly assigned it to the other.

**The gate itself confirmed the formula is the wrong instrument.** When cognitive accessibility later read the current text it reported that the closing paragraph scored Flesch-Kincaid Grade 5.8 in isolation while still failing parse-on-first-pass, and stated that a reading-level formula alone would not have caught either instance.

## Symptoms

Three instances in one edition, all the same class, none caught by a gate:

1. **Repeated referent plus double enumeration.** The triggering sentence above. Caught by Tom.
2. **Bare numeral with competing antecedents.** "the three" resolving against three different candidate triples across the body. Caught by cognitive accessibility only after it was asked to read for comprehension rather than to score a formula.
3. **Answer stated before the question is asked.** "Our answer is the record." Tom's correction was "Our answer to what??". This is a discourse-ordering defect, not a sentence-complexity one, and no axis in any gate reads discourse order. Caught by Tom.

## Workaround

The author reads every line. That is the check ADR-052 exists to take off him, so the workaround is the defect.

## Impact Assessment

- **Who is affected**: readers of any edition, and the author, who remains the only backstop on this axis after ADR-052 removed him from every other one.
- **Frequency**: three instances in one edition (2026-08-10, Issue 17). No mechanism prevents recurrence.
- **Severity**: the triggering instance reached the publish-bound draft and was the proximate cause of the ADR-052 rule change.
- **Analytics**: not instrumented.

## Root Cause Analysis

Two gates could own comprehension and each has scoped itself away from it. The editor owns editorial cadence and explicitly excludes anything reducible to grade level. Cognitive accessibility owns grade level and computes its verdict from a formula. Neither owns the question a human answers instantly: can I read this once and know what it says.

The gap is narrow rather than general, and the evidence for that is strong. When all ten gates were run properly against a frozen digest later in the same session they returned roughly thirty findings and caught every substantive factual, sourcing and claim-calibration defect in the edition, including four an external human reviewer missed, while six of that reviewer's own factual assertions did not survive checking. Detection is not weak. This is one specific uncovered axis, and it is the axis that produced the defect that triggered the rule change.

**Warrant from a ratified decision.** ADR-052's Context states the residue in this ticket's own terms at line 30: *"Readability had no blocking owner, so a sentence could satisfy every blocking gate and still be unreadable."* Its Decision changes only whether a verdict blocks, not what the verdict is computed from. Making a formula-scored gate blocking does not give the formula a comprehension test.

### Investigation Tasks

- [ ] Investigate root cause
- [ ] Create reproduction test
- [ ] Build the regression fixture from the three instances above before designing the fix. All three are real published-adjacent text, not hypotheticals, which makes falsification cheap: a candidate pass must flag all three and must not flag the surrounding paragraphs that read cleanly.
- [ ] Decide where the axis lands. Adding it to cognitive accessibility means changing that gate's verdict basis from a formula to a formula plus a comprehension test. Adding it to the editor re-opens the ADR-020 criterion 7 vocabulary-growth trade that P122's Fix Strategy recorded as an accepted trade with a reassessment trigger. A third pass is the third option and costs a gate.
- [ ] Specify the test in a way that is not itself a formula. The candidate shape: the reviewer restates each paragraph's claim in its own words, and flags every passage it cannot restate without re-reading, plus every pronoun or bare numeral whose nearest candidate antecedent is not the intended one, plus every answer given before its question is asked.
- [ ] Account for the arbitration conflict this inherits. ADR-052 line 82 records that cognitive accessibility already required changes another gate forbade. A comprehension pass landing on that gate inherits that history and the fix design has to say how conflicts arbitrate.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P113, P122

## Related

Captured via `/wr-itil:capture-problem`.

Hang-off check dispatched against P122, P151, P113 and P077; verdict PROCEED_NEW. Rationale from that arbitration, recorded so the next reviewer sees what was tested:

- **P122** (no gate owns within-edition structural mechanics) was tested hard as the parent and does not hold, on three grounds. Its own root cause defines its class as defects "invisible when reading a passage on its own and obvious when reading the edition as a whole"; the triggering sentence here is fully diagnosable in isolation, so it fails P122's membership criterion. Its four shipped axes are on disk and none reads antecedent resolution. And it is Verification Pending with the 2026-08-10 run as its live verification, so absorbing a new axis class would confound that verification, which is the same reasoning P122 itself used against P117.
- **P151** (prescribed gates can skip a phase) is same session and same pipeline but orthogonal: there every relevant gate ran, produced a verdict, and passed. P151 is enforcement of execution; this is coverage of an axis.
- **P113** (review-gate loop economics) composes rather than parents. A restatement-based pass adds findings into the same step 15.37 collect and will need a remediation-grain classification, so ADR-043's bounded loop is an interaction to design against.
- **P077** (voice gate misses Tom-specific idioms) is a different gate with a different oracle. A well-voiced sentence can be unparseable and a badly-voiced one perfectly clear.

Suggested for the next `/wr-itil:review-problems` cluster pass: a common parent over this ticket plus P122 and P121, on the theme of gate-coverage gaps in the newsletter reviewer battery, distinguished by input scope. Within-passage semantic is this ticket, within-edition assembly is P122, cross-edition shape is P121. The 2026-08-05 arbitration already made the same recommendation for the P121 and P122 pair, so this consolidates three rather than opening a second cluster.
