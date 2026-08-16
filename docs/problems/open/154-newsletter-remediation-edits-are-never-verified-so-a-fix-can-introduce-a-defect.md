# Problem 154: Newsletter remediation edits are never independently verified, so a fix can introduce a defect that survives until the next full battery

**Status**: Open
**Reported**: 2026-08-17
**Priority**: 12 (Medium), Impact: 3 x Likelihood: 4, derived at capture from the description per Step 4a. Impact 3 because the failure ships reader-facing prose defects and factual errors into publish-bound drafts rather than breaking a system, matching the calibration P151 and P152 set for reader-facing newsletter defects. Likelihood 4 on the same basis P152 used: it recurred repeatedly inside a single edition and no mechanism prevents recurrence. Five instances in one edition is at the top of that band rather than outside it.
**Origin**: internal
**Effort**: M, derived at capture: a contract change to the step 15.37 loop plus a cheap deterministic re-check at round close, and a decision about whether the expensive diff-scoped read is worth its invocation. Comparable to P152, also rated M.

## Description

The newsletter editorial remediation loop has no verification step of its own. A remediation edit that introduces a new defect is invisible until the next full gate battery happens to re-read that passage.

ADR-043 defines the bounded loop at `.claude/skills/wr-newsletter/SKILL.md` step 15.37: collect the findings, remediate each one minimally, re-invoke the contributing gates once. ADR-047 separately re-runs any gate whose verdict predates the current draft, via the `scored-digest` mechanism and check (m). Neither asks whether a remediation edit is itself correct. The loop re-invokes the gate that raised the finding, which will confirm its own finding is addressed and says nothing about damage the edit did elsewhere in the passage or elsewhere in the artefact. ADR-046 worsens it at the margin: an unchanged-artefact skip can suppress the re-read that would have caught it.

Observed five times during the 2026-08-17 Issue 18 prep run. Four were caught only a full battery later; three were regressions on gates that had already returned a pass on the very passages the fix broke.

1. **Factual regression from propagating a gate suggestion unverified.** The cognitive-accessibility gate raised a referential defect on the phrase "the July event" and suggested, as its own preference, dating the referent at first mention: "a US directive from July". That month was the agent's inference from surrounding context, not a checked fact. It was applied verbatim. The directive was June, verified afterwards against `src/newsletters/published/leader/2026-06-22/2026-06-22.md` (Issue 10), which reads "Last week a US directive forced Anthropic to suspend foreign access". Content risk had returned PASS on that passage before the edit and returned REJECTED with `factual=high` after it. Cross-edition consistency had returned SUPPORTED before and CONTRADICTS after. One unverified fix flipped two passing gates to failing.

2. **A second factual regression of the same shape, later in the same run.** Acting on a voice-gate advisory to carry an antecedent for the word "counterweight", the drafter expanded a callback into "the Chrome result we ran in Issue 16 where AI fixed more browser bugs in a month than the prior two years combined". Issue 16 as published (`src/newsletters/published/leader/2026-08-03/2026-08-03.md`) says 1,072 security bugs across Chrome 149 and 150, more than the prior 23 milestones combined, with an explicit caveat that nobody outside Google has reproduced it. Two releases is not a month, so the compression roughly doubles the implied rate against an unchanged denominator, and the same sentence upgraded an unreproduced vendor-internal result to "evidence that the capability works", which is the reading Issue 16 told readers not to take. Content risk caught it on the final pass, again at `factual=high`.

3. **Duplication introduced while fixing sentence length.** The cognitive-accessibility gate flagged a 46-word stacked sentence in the OpenAI ads entry. Splitting it produced two statements of the same contract-term limitation four words apart. The editor gate caught it on the next pass and named the cause: "this reads as new damage from a sentence break-up rather than a pre-existing issue".

4. **Banned word reintroduced while fixing a comprehension defect.** Rewriting a bullet to put the question before the answer produced "how long a government-ordered model suspension actually costs". The voice gate had already failed the edition once on "actually" as defensive emphasis, and failed it again on the instance the fix created.

5. **New ambiguity introduced while fixing an over-claim.** The skeptic flagged "no control at all" as overstated. The reduction produced "no control that runs without a person watching", whose relative clause can attach to either noun. Cognitive accessibility then classified that as a blocking comprehension defect and noted that both readings are true, which is what makes it hard to detect.

The common shape: remediation is performed by the agent that wrote the passage, immediately after being told what is wrong with it, and nothing independent reads the result before the round closes. The gates are not the weak point. Every one of these five was caught. They were caught a full battery late, which is what turned ADR-043's one-round budget into five rounds on this edition and is a direct contributor to the churn ADR-052 was ratified to reduce.

Instances 1 and 2 share a narrower sub-shape worth naming separately: a reviewer gate supplied a factual claim inside a suggested fix, and the drafter applied it without checking the source. That is gate-output grounding rather than gate coverage, and no current rule covers it.

## Symptoms

- A gate that passed a passage on one round fails the same passage on the next, because the fix for a different gate's finding broke it.
- A remediation round closes with the raising gate satisfied and a new defect elsewhere in the same sentence.
- A factual claim suggested by a reviewer gate reaches the draft without ever being checked against the cited source.
- Round counts exceed the ADR-043 budget, and the extra rounds are spent on defects the prior round created rather than on the original findings.

## Workaround

Re-run the free deterministic checks by hand after every remediation edit rather than only at save:

```
bash scripts/check-newsletter-structure.sh <draft>
grep -nE '\bactually\b|\bleverage\b|\bdeep dive\b|\breach out\b' <draft>
```

And treat any factual assertion inside a gate's suggested fix as a hypothesis, checking it against the cited artefact before applying. Both depend on the operator remembering, which is the defect.

## Impact Assessment

- **Who is affected**: readers of any edition, and the author, who absorbs the extra rounds and the publish-deadline slip.
- **Frequency**: five instances in one edition, 2026-08-17 Issue 18 prep. The loop runs on every edition, so the exposure is per-edition rather than occasional.
- **Severity**: two of the five were `factual=high` content-risk findings, meaning wrong facts about named third parties in publish-bound prose. The other three were comprehension and voice defects. None reached publication, because the battery caught them, but only because the battery ran again.
- **Analytics**: not instrumented. Round counts per edition are recoverable from the `## Editorial Remediation Loop` block in each reviews sibling.

## Root Cause Analysis

The loop's verification is scoped to the finding, not to the edit. Re-invoking the raising gate answers "is the thing I complained about fixed", which is necessary and insufficient: it cannot see damage outside its own axis, and in the two factual cases the raising gate was the source of the error rather than its detector.

A second contributor is who performs the remediation. The drafter that wrote the passage rewrites it under time pressure immediately after being told it is wrong, which is the same independence problem the fresh-context gates exist to solve everywhere else in this pipeline, applied to the one step that has no fresh-context reader.

### Investigation Tasks

- [ ] Investigate root cause
- [ ] Create reproduction test
- [ ] Build the regression fixture from the five instances above before designing the fix. All five are real publish-adjacent text with a known-good and known-bad form, which makes falsification cheap.
- [ ] Land the cheap deterministic half first and measure it: re-run `scripts/check-newsletter-structure.sh` plus a voice word-list grep at the close of each remediation round rather than only at step 16 save. That alone would have caught instance 4 immediately and costs no agent invocation.
- [ ] Decide the gate-suggested-factual-change rule separately from the general case. Instances 1 and 2 would both have been caught by a requirement that a remediation applying a factual change suggested by a gate cites the artefact it was verified against. This is the P082 verify-before-propagating discipline extended from artefact references to content assertions; see the note below on why that is an extension rather than a recurrence.
- [ ] Cost the expensive option honestly before adopting it: a diff-scoped verification read of only the remediated passages is the general answer, but it adds an agent invocation per round and interacts directly with ADR-043's cost argument, since the loop exists to be cheaper than the manual path it replaced. Read P113's round-economics analysis before pricing this.
- [ ] Check whether ADR-046's unchanged-artefact skip needs a carve-out. If a round's only change is a remediation edit, skipping the re-invocation on digest equality is exactly the wrong behaviour for this defect class.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P113, P151, P152, P099

## Related

Captured via `/wr-itil:capture-problem`.

Hang-off check dispatched against P113, P151 and P152; verdict PROCEED_NEW. Rationale from that arbitration, recorded so the next reviewer sees what was tested:

- **P113** (newsletter review-gate loop, editor one nit per pass) was tested hardest as the parent and does not hold, on three grounds. Its two named causes are the editor's finding-emission grain and section 15.6's per-edit full-gate re-run, both about how findings are emitted and priced, neither about whether a remediation edit is itself correct. Both its Fix Strategy items are recorded as shipped. And it is parked awaiting a live `/wr-newsletter` run whose `## Editorial Remediation Loop` block is its verification evidence, so absorbing a new defect class would confound exactly that verification. The relationship is composes-with in both directions: the round-count data from this run is legitimate P113 verification evidence, and any per-round verification step interacts with P113's cost argument.
- **P151** (prescribed gates can skip a phase entirely) requires a gate that never produced a verdict. Here every relevant gate ran, wrote a verdict, and passed before the edit broke it. Enforcement of execution versus correctness of the edit.
- **P152** (no gate owns parse-on-first-pass comprehension) is an uncovered-axis defect. Here every one of the five was caught, just a full battery too late. Instance 5 is a comprehension defect and instance 4 involves a banned word, so the surfaces overlap, but the fix loci diverge: P152 changes a gate's verdict basis, this changes when and by whom a remediated passage is re-read. Instance 1 is a shape P152 does not cover at all, since the gate supplied the wrong fact rather than missing one.

**P099 was not in the pre-filtered candidate set and has not been arbitrated.** The hang-off subagent flagged it unprompted: both P151 and P152 name P099 (post-finalise edits do not re-run the full gate set) as the nearest freshness-defect ticket, and P151 describes its precondition as "a prior passing verdict plus a later body edit", which is structurally this ticket's precondition too. Test P099 as a parent or sibling at the next `/wr-itil:review-problems` cluster pass, alongside P151's standing suggestion for a common parent over P151, P099 and P140 on the reviews-sibling-as-ledger theme.

**Relationship to P082, which is closed.** P082 established verify-before-propagating for `ADR-NNN`, `RFC-NNN`, `JTBD-NNN`, skill names, script names and file paths cited in governance-subagent verdicts, on the asymmetric-trust model that the consumer verifies rather than the subagent. Instances 1 and 2 are the same failure applied to a different payload: a factual assertion inside a reviewer-gate's suggested fix rather than an artefact reference in a verdict. That is a scope extension of a closed ticket rather than a recurrence of it, and it suggests the verify-before-propagating rule should name reviewer-gate content suggestions alongside governance-verdict artefact references. This is the fourth surface in the verify-before-X family, after ticket prose (P032, P103), Fix-Strategy placement (P045) and subagent artefact references (P082).
