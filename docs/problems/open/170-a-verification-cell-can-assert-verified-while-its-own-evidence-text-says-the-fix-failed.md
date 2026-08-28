# Problem 170: A verification cell can assert verified while its own evidence text says the fix failed

**Status**: Open
**Reported**: 2026-08-26
**Priority**: 6 (Medium), Impact: 2 x Likelihood: 3. Re-rated 2026-08-28 review from 12 (Impact was 4): RISK-POLICY.md reserves Impact 4 for a newsletter content-quality failure caught at a gate or the site fully offline. A wrongly-closed problem ticket is neither; the blast radius is problem-management tooling, which the policy rates Impact 2. Sibling precedent: P132 rates the near-identical act (an automation emitting wrong CLOSE verdicts from a bad predicate) at Impact 2. Likelihood stays 3. Original capture rationale: Impact is 4 because the failure closes tickets whose fixes are known not to work, and it closes them silently: the evidence-backed bucket closes without asking, so the wrong close is not surfaced to anyone. A closed ticket stops being worked, so the defect it names stays live with nothing tracking it. Not 5 because the close is recoverable from git and no reader is reached. Likelihood is 3 because writing the contradiction takes a specific operator error, but nothing detects it once written, and it has happened.

**Origin**: internal
**Effort**: S, derived at capture. One predicate over a column that is already parsed.

**WSJF**: 6.0 = (6 x 1.0) / 1 (re-rated 2026-08-28 review from 12.0; Priority re-rate, Effort unchanged)

## Description

The `Likely verified?` column in the Verification Queue carries the evidence signal that decides whether a ticket closes. Per the review-problems contract it takes three canonical values, and the close routine buckets on them: the `yes` bucket closes on evidence WITHOUT asking, and only the unobserved subset prompts.

The cell is free text after that prefix. Nothing checks that the text agrees with the prefix.

Observed on 2026-08-25 in this repository. Three cells were written as `yes - observed`, meaning the verifying run had happened, while each cell's own body recorded that the fix did not work:

- P099: `yes - observed 2026-08-25, and it BLOCKS ... Cannot verify until P165 is fixed`
- P154: `yes - observed 2026-08-24, and the disclosure half did NOT ship`
- P120: `yes - observed 2026-08-24, and it SPLITS ... met the ticket's own not-working condition at 24 rounds against a criterion of one`

All three would have closed as verified on the next close pass. Each says, in its own text, that it should not.

The contradiction was caught by a reviewer reading the bodies, not by any check. It was corrected in commit `9c27152e`, which re-bucketed all three to `no - observed regression`, the canonical third value and the one that describes them exactly.

Verified on disk 2026-08-26: no script, library or hook in the installed `wr-itil` reads the column's value. The only occurrences outside SKILL prose are two table headers inside `scripts/test/reconcile-readme.bats` fixtures. `reconcile-readme.sh` does not read it. This repository carries no local check either.

The original error was the operator's: three canonical values are documented and the wrong one was chosen, because `yes - observed` reads naturally as "the verifying event was observed" when it means "the fix is verified". The defect this ticket records is separate and outlives that mistake. A cell that contradicts itself is the single highest-consequence field in the queue, it is written by hand, and it is checked by nobody.

## Symptoms

- A queue cell reads `yes` and its own evidence sentence describes a regression, a block, or an unshipped half.
- A close pass closes a ticket whose fix is recorded as not working, without asking.
- The ticket lands in `closed/` carrying a Verified section that contradicts its own cell.

## Workaround

Read every `yes` cell's body before running a close pass. Manual, and it is the step that was skipped.

## Impact Assessment

- **Who is affected**: the problem backlog's integrity and anyone relying on `closed/` meaning fixed. No reader or visitor path.
- **Frequency**: three cells in one day, all authored in one session, all caught by one reviewer before any close pass ran.
- **Severity**: a silently-closed ticket whose fix does not work is worse than an open one, because the open one is still ranked and worked. The close routine is explicitly designed not to ask on this bucket, so there is no second surface where a human would see it.
- **Analytics**: not instrumented.

## Root Cause Analysis

### Preliminary Hypothesis

The cell packs a machine-read routing token and human-read prose into one free-text field, with no constraint between them. Once the prefix is written, the body is decoration as far as any consumer is concerned.

The specific trap in the wording is worth recording, because it is what produced the error rather than carelessness: `yes - observed` is ambiguous between "the verifying event was observed" and "the fix is verified". Only the second reading routes correctly. The value that resolves the ambiguity, `no - observed regression`, exists and is documented; it was simply not the one that came to mind while writing prose about an observation that had genuinely happened.

### Investigation Tasks

- [ ] Decide the check's shape: a contradiction predicate over the cell text (a `yes` prefix whose body matches negation markers such as `NOT`, `cannot verify`, `regression`, `did not`, `blocks`), or a stricter cell grammar that separates the routing token from the prose.
- [ ] Establish whether the ambiguity is worth fixing at the vocabulary level as well, since the wording is what mis-cued the author.
- [ ] Build the reproduction from the three real cells at their pre-correction text, recoverable from the parent of `9c27152e`.
- [ ] Confirm the check fails red against those three before shipping it.

## Fix Strategy

Make the two halves of the cell agree, or stop letting one half decide alone.

The cheap version is a contradiction predicate: a `yes` cell whose own body carries a negation marker is a hard fail at review time. It is crude, it will have false positives on cells that legitimately say what a fix does not cover, and it is still better than nothing checking at all. The false positives are cheap because the answer is to reword or re-bucket, both of which improve the cell.

The better version separates the routing token from the prose so the token cannot be written by accident while narrating an observation. That is a larger change to the cell grammar and touches every surface that renders the queue.

Write the check against the requirement rather than against these three cells, and confirm it goes red against their pre-correction text before shipping. A check tuned to the three known strings would pass the next contradiction that phrases itself differently.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P165, P166, P167, P168, P169

## Related

Found on 2026-08-25 by a `/wr-itil:review-problems` pre-flight, which read the three cells, declined to run the close, and said why. The close routine it declined to run is the one that would have closed all three.

- **P165** through **P169** are the same family, and this is the sharpest instance: those controls report a cause they did not test, while this one lets an author assert a conclusion their own evidence contradicts. In every case the artefact reads clean and the honest reading is available in the same file.
- The correction is in `9c27152e`. Its parent holds the three cells in their original form, which is the red fixture this ticket's check needs.
- Worth noting what did work: the cell shape is documented with three canonical values, and the third value described the situation exactly. The contract was adequate; nothing enforced it.
