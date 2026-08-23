# Problem 152: No newsletter gate owns parse-on-first-pass comprehension, so an unreadable sentence passes every gate

**Status**: Verification Pending
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

- [x] Investigate root cause
- [x] Create reproduction test
- [x] Build the regression fixture. Landed as a single behavioural fixture, and the shape it took is not the shape this task expected. See "What the falsification actually found" below.
- [x] Decide where the axis lands. Cognitive accessibility, and the choice was already made: ADR-052 had moved that gate's verdict basis off the formula on 2026-08-10 and its prompt already read "your blocking authority is over comprehension". No third gate was added and the editor's ADR-020 criterion 7 vocabulary was not touched.
- [x] Specify the test in a way that is not itself a formula. Shipped as the restatement test in step 15.4's prompt, close to the shape this task proposed.
- [x] Account for the arbitration conflict this inherits.

### What the on-disk state actually was (verified 2026-08-23)

Two of this ticket's own citations had gone stale, and the difference matters to the fix.

The claim that step 15.4 defines `PASS = no critical findings AND grade level at or below target` is **no longer true**. The ADR-052 implementation rewrote that prompt on 2026-08-10. It now turns the verdict on whether the agent classifies a finding as a defect or a preference, and it says in terms: "do not pass a passage that fails to parse on first reading merely because its score is low, and do not fail one merely because its score is high. Your blocking authority is over comprehension." So the gate's authority over this axis was already correct before this ticket was worked.

The editor citation **holds**. `.claude/agents/wr-newsletter-editor.md` still told the editor to drop anything reducible to word count or grade level, and named no destination for a passage that reads smoothly and still cannot be understood.

That reframes the defect. It was never that cognitive accessibility lacked the authority. It was that the gate's authority was invisible at every point where its scope is enumerated, and every surrounding gate was told to **drop** the readability family rather than hand it anywhere. The architect review found the enumeration in many more places than the two this ticket named, across all four files. The Fix Strategy below is the authoritative list; no summary count is given, for the reason recorded there.

### What the falsification actually found

The first fixture pair pointed at step 15.4 and asked whether the cognitive-accessibility gate catches the witness sentence. Both went **green against the pre-change skill** and were deleted rather than shipped. That is the correct outcome for a hollow guard, and it is direct evidence for the reframing above: the gate already caught the sentence unaided, because the authority was already there. A fixture on that surface guards nothing.

The shipped fixture points at the **editor** instead, and asks what it does with a passage it can read smoothly but cannot restate. It fails against the pre-change editor (which drops it) and passes against the changed one (which names it and hands it to cog-a11y). Forward run 1/1 passed; falsification run 0 passed. That is the routing defect, and it is what this ticket was actually about.

A second editor fixture, checking that the hand-off had not become a licence to re-import the voice and content-risk gates' territory, also went green against the baseline and was deleted. The over-fire bound now rests on prose alone. If over-fire is ever observed, that is the first gap to close, and a fixture built from the observed instance will discriminate where a hypothetical one did not.

## Fix Strategy

Assign parse-on-first-pass comprehension to the cognitive-accessibility gate, name it at every point where a gate's scope is enumerated, and change the surrounding gates from "drop it" to "name it and hand it over". No new gate.

**Every place in four files where a gate's scope or its hand-off is stated, in one commit.** Leaving any one behind would recreate the two-surfaces-disagreeing class that P140 and P141 had just fixed. The list below is the enumeration; it is deliberately not summarised as a count, because an earlier draft of this ticket said "nine" while the same bullets named more than that, and the risk scorer caught the mismatch.

- `.claude/skills/wr-newsletter/SKILL.md`: the preamble clause describing the gate; step 15.4's scope sentence, which gains an explicit sole-ownership paragraph; step 15.4's collect-the-hand-offs instruction and its agent prompt, which gains both the `handed_up_comprehension_findings` input and the criterion; the stale P053 "optional remediation" heading, reconciled with ADR-052; step 15.37, which is told a comprehension hand-off is stop-and-surface and must not be remediated in the loop; and section 15.6's enumeration of what the heavy gates read.
- `.claude/agents/wr-newsletter-editor.md`: the `sentence-rhythm` axis definition, the `other` craft-axis definition (which gains the carve-out that a comprehension hand-off riding `other` is deliberate and does not signal a missing axis), the `cognitive-accessibility` relationship bullet, and the craft-and-assembly boundary twin.
- `.claude/agents/wr-newsletter-critic.md`: the intro hand-off list, the "No cog-a11y commentary ... Ignore." bullet, and the sibling-gate pointer.
- `.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md`: the coverage partition handed to the critic.

**The criterion is a restatement test, not a formula.** Read each paragraph once at reading speed, then state its claim without looking back. Flag every passage that cannot be restated without re-reading, and in particular a word that points back at something where the nearest candidate is not the one meant, a sentence that names the same thing twice or counts the same set twice, and an answer given before its question is asked. The witness sentence is quoted in the prompt as the worked example. Two bounds ride with it: technical depth is not a defect (a term the passage defines is WCAG 3.1.3's axis), and the fix shape is to split, reorder or de-ambiguate rather than bolt on explanation, so a comprehension fix cannot be spent out of the reader's time budget.

**Arbitration, per the architect review.** Step 15.4 runs after the 15.37 remediation loop, so its findings never enter that loop's collect. They are not free of it: remediating one edits the body, which re-enters the full gate set at section 15.6 and consumes the same non-resetting counter, counting toward ADR-043 condition (d). Where a comprehension fix would breach the deterministic structure lint or ADR-053's outline, structure does **not** automatically win. The recorded precedent is that the lint's predicate was widened rather than the finding refused (check (i) in `scripts/check-newsletter-structure.sh`), so the ordering is: restate inside the passage, else capture against the predicate, else let it stand as a blocker. ADR-052 reassessment criterion 4 is the home for a conflict Tom cannot arbitrate without changing a ratified invariant.

**Release vehicle**: none. This change touches reviewer-agent prose, skill prose, an eval harness, two `package.json` script entries, and this ticket plus the problems README. None of it is a build input to the site: `npm run build` reads none of these paths, `npm run lint` covers `src/` only, and the package is `private: true`. So no `.changeset/*.md` entry was authored.

**The hand-off needed a carrier, and the risk scorer found it had none.** Telling the editor to hand a finding over is not enough on its own: ADR-020 closes its axis vocabulary and its Step 6 forbids output outside the fixed block, so there was no field for the finding to travel in, and the first version of this fix would have turned every comprehension observation into an ordinary editor blocker that the drafter fixed inline. That is the opposite of the intent, and it is self-certification on an axis no gate had scored. The carrier is now named explicitly and uses only fields that already exist, so ADR-020 needs no amendment: the editor rides `EDITORIAL_CRAFT` `axis: other` with a `Suggested fix:` line opening `stop-and-surface: parse-on-first-pass comprehension`, and the critic rides its optional `RELEVANT CONTEXT` block, which is the right slot precisely because it does not feed the critic's verdict. Step 15.37 is told not to remediate either one, and step 15.4's prompt gained a `handed_up_comprehension_findings` input so the owning gate actually reads them, judges them itself, and sweeps the body anyway.

**No ADR.** The architect ruled this implementation of ADR-052's own recorded residue ("readability had no blocking owner"), not a new decision. ADR-052 is `accepted` with `human-oversight: confirmed` and was not edited.

## Fix Released

Landed 2026-08-23 on `master`. Every scope-and-hand-off statement across `SKILL.md`, the editor agent, the critic agent and the critic rubric updated so that cognitive accessibility owns parse-on-first-pass comprehension and the editor, critic and rubric hand findings there instead of dropping them, plus a discriminating behavioural fixture at `.claude/skills/wr-newsletter/eval/comprehension.promptfooconfig.yaml`.

Exercised in-session: `npm run eval:newsletter:comprehension` returned 1 passed / 0 failed against the changed editor, and the same fixture returned 0 passed against the editor at `acb3d234`, which is the falsification result the harness requires.

Awaiting user verification. The verification that matters is the next `/wr-newsletter` run: whether a comprehension finding raised by the editor or the critic actually reaches step 15.4 rather than dying at the gate that spotted it.

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

## Worked 2026-08-23

Gate reviews: architect ISSUES FOUND then addressed (many more enumeration sites than the two this ticket named; the ADR-043 counter interaction restated; the flat "structure wins" arbitration rule withdrawn in favour of the recorded predicate-widening precedent; the fixture design warned as likely non-discriminating, which it proved to be). JTBD PASS against JTBD-300 with four carried conditions, all applied. Style guide PASS, nothing in scope. Voice and tone ISSUES FOUND with six items, all applied, including that the first draft of the comprehension criterion failed its own restatement test.

I13 propose-fix trace gate returned exit 3: this repository holds no story maps at all, so no release row could be drawn. Queued for the maintainer rather than auto-created, per the gate's own instruction.
