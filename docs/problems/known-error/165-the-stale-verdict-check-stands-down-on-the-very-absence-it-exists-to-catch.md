# Problem 165: The stale-verdict check stands down on the very absence it exists to catch

**Status**: Known Error
**Reported**: 2026-08-25
**Priority**: 16 (High), Impact: 4 x Likelihood: 4, derived at capture. Impact is 4 because ADR-047's sole enforcement mechanism is currently disarmed on the live pipeline, so a gate verdict scoring superseded text can attach to a published edition with nothing reporting it, and that is the defect ADR-052 was written after. Not 5 because no wrong claim is known to have reached a reader through this path; the Issue 19 gates were re-run manually against fresh freezes. Likelihood is 4 because it has already happened once and nothing detects the omission going forward.

**Origin**: internal
**Effort**: S, held at S on 2026-08-29. The work landed as one branch in the lint, one classification rule beside it, and eleven behavioural cases in the block that pins them. The remaining work is the Known Error to Verification Pending transition once the fix reaches origin, which is smaller again.
**WSJF**: 32.0 = (16 x 2.0) / 1, recomputed on the Known Error multiplier per P498.

## Description

`scripts/check-newsletter-structure.sh` check (m) exists to name any gate verdict that predates the draft being saved. It is the enforcement half of ADR-047. On the Issue 19 finalise it never ran, and the reason it never ran is the condition it exists to detect.

The branch, at line 674:

```bash
ndig=$(grep -cE '^scored-digest: sha256:[0-9a-f]{64}$' "$reviews" || true)
if [ "$ndig" -eq 0 ]; then
  echo "SKIP [m] $reviews: carries no scored-digest lines; gate-freshness not checked (pre-ADR-047 edition)" >&2
```

The predicate tests one thing: this file has zero digest lines. The message asserts a cause the predicate cannot distinguish, and hardcodes the benign reading of it.

Verified on disk 2026-08-25. `docs/decisions/047-stale-gate-verdicts-are-re-run-and-the-check-over-reports.proposed.md` carries `date: 2026-08-08`. Issue 18's reviews sibling, published 2026-08-17, carries five `scored-digest: sha256:` lines. Issue 19's, published 2026-08-24, carries zero. Issue 19 postdates ADR-047 by sixteen days and its immediate predecessor complied.

So Issue 19 is not a legacy edition. It is a current edition that recorded no digests, and the check that exists to catch stale gate verdicts stood down because of exactly the omission that should have alarmed it. Every lint run across twenty-four remediation rounds printed the SKIP line, and it read as expected behaviour.

**Correction, 2026-08-25, from measuring the corpus while building the fix.** An earlier version of this paragraph said Issue 19 was "a current edition whose pipeline stopped writing the digests". That is refuted by the edition before the one it compares against. Counts across the three in-scope editions: 2026-08-10 zero, 2026-08-17 five, 2026-08-24 zero. Adoption is intermittent rather than a regression at a point in time, and the edition between the two breaches complied. Two published editions breached the contract, not one.

The correction matters for the second defect below, because it changes what the investigation is looking for. A regression has a commit; an intermittent omission has a reason the drafter sometimes reaches the emitting step and sometimes does not. The SKILL prescribes the digest lines at length, with templates at nine save-time blocks and a verbatim-copy instruction for prep-carried ones, so this is not a missing instruction. It is an instruction nothing enforced, which is the same sentence as defect one.

Two defects, kept in one ticket because the second is what exposed the first and they are fixed together.

1. Check (m) cannot tell a legacy edition from a current one whose digests went missing, and resolves the ambiguity toward the outcome that stops checking.
2. Two of the three in-scope editions emitted no scored-digest lines at all, with a compliant one between them. That intermittency needs its own root cause in the drafting skill, and defect one is why nobody saw it: the detector treated each omission as licence to stop looking.

## Symptoms

- `SKIP [m] <reviews>: carries no scored-digest lines; gate-freshness not checked (pre-ADR-047 edition)` on an edition written well after 2026-08-08.
- The lint reports OK overall while its only stale-verdict guard has not run.
- A reader of the lint output has no way to tell a genuinely exempt legacy edition from a live regression.

## Workaround

Compare the reviews sibling's digest count against the preceding edition's before trusting a clean lint. Two greps.

## Impact Assessment

- **Who is affected**: the newsletter finalise, on the publication's primary channel. No reader is known to have been affected, because the Issue 19 gates were re-run manually against fresh freezes and the freeze discipline was in force by hand.
- **Frequency**: every lint run of the Issue 19 finalise, roughly twenty, and every run against the 2026-08-10 edition before it. Continues on every future edition that skips the emission.
- **Severity**: ADR-047's enforcement is unarmed. The failure it was written to prevent, a gate verdict scoring text that has since changed, is exactly what happened twice by hand in the same edition and is recorded as P164.
- **Analytics**: not instrumented.

## Root Cause Analysis

### Preliminary Hypothesis

The check was written to be tolerant of the back catalogue, which is correct: editions published before 2026-08-08 carry no digests and should not fail. The error is resolving the ambiguity in prose rather than deriving it. Nothing in the file distinguishes the two populations, so the branch guesses, and it guesses toward silence.

The script argues against itself here, three times, in its own comments. Check (h): "Do NOT silently skip: a brief with no items is not a brief that needs no provenance line. Skipping here would make (h) unenforceable on exactly those briefs." Check (p): "Present but unreadable is a broken contract, not an absent one. Drift here is silent in the direction that stops checking, so this fails rather than skipping." Check (o): "the copy drifts, and the drift is silent in the direction that stops checking." Check (m)'s zero-digest branch is the one place that principle was not applied.

The second defect is unexamined. Issue 18 wrote the digests and Issue 19 did not, so something between those two editions stopped the emission, or the Issue 19 run took a path that never reached the emitting step.

### Investigation Tasks

- [x] Find why 2026-08-10 and 2026-08-24 emitted no digests when 2026-08-17 did. The compliant edition sits between the two breaches, so this is not a bisect: look for what makes the drafter reach the emitting step on some runs and not others. Answered 2026-08-29, and the premise is refuted; see "Defect two has a root cause" below.
- [x] Decide how check (m) derives the legacy distinction: edition date against ADR-047's, presence of the ADR-052 tagging conventions, or an explicit frontmatter marker.
- [x] Create a reproduction test with both populations, a genuine legacy sibling and a current sibling with digests stripped.
- [x] Confirm the fix fails red against the Issue 19 sibling as it stands before shipping it.

## Fix Strategy

Apply the fail-not-skip principle the neighbouring checks already state. Check (m) derives whether the edition is in scope for ADR-047 rather than inferring it from the absence it is testing for, and fails when a current edition carries no digests. An explicit frontmatter marker on the back catalogue is the cheapest derivation and the least clever; a date comparison is more automatic and more brittle.

Fix the emission separately and first, because the check cannot be tested green until something writes digests again.

Write the check against the requirement rather than against the current corpus, and confirm it goes red against the Issue 19 sibling before shipping. This ticket exists because a check was written that could not fail on the case it was for, and shipping a second one on the same reasoning would be the same error twice.

## Defect one shipped 2026-08-25; defect two has a root cause and the same guard acts on it

**The check no longer guesses.** `check-newsletter-structure.sh` check (m) derives whether ADR-047 governs the edition instead of inferring it from the absence it is testing for. The edition date comes from the brief filename, which ADR-026 fixes as the publication date and which the sibling derivation in the same script already depends on, so this adds no new coupling. On or after 2026-08-08, zero digests is a contract breach and fails. Before it, the edition is genuinely exempt and skips. Undateable, and the check reports that it could not tell, which is the only honest answer left and is deliberately not the benign one.

The frontmatter-marker alternative the Fix Strategy preferred was rejected on inspection. It means editing eighteen published editions to record a fact already derivable from their filenames, and it fails closed on an unmarked new file for want of bookkeeping rather than for a real breach.

**7 behavioural cases, 5 confirmed red first.** Including the boundary, where ADR-047's own date is in scope, and the case pinning that a current edition with digests is still compared rather than waved through by being current.

**Defect two was unexamined and is now unmissable.** The emission is prose in the SKILL, at nine save-time templates plus a verbatim-copy instruction for prep-carried blocks, and nothing enforced it. What changed on 2026-08-25 is that an edition which skips the emission is blocked at save rather than waved past with a reassuring message, so the next occurrence announces itself instead of accumulating. The root cause it needed beyond that was found on 2026-08-29 and is recorded in the next section; this paragraph's closing sentence, which left that open, is superseded there.

**Two published editions carry the breach and neither can be repaired.** 2026-08-10 and 2026-08-24 fail the new branch. Backfilling their digests is not available and should not be attempted: computing a digest now, over the final text, would assert that each gate scored that text, which is the custody breach ADR-047 exists to prevent. The lint reporting them is the correct state, the corpus test pins exactly that pair, and a third would show up as a change to the pinned set rather than as one more line nobody reads.

## Defect two has a root cause, and it is not the one this ticket assumed

Worked 2026-08-29. The hypothesis in the Preliminary Hypothesis section was that the drafter sometimes reaches the emitting step and sometimes does not. The corpus does not support it. Both breaching runs recorded gate custody. Neither recorded it in a form the check can read.

The 2026-08-10 sibling carries a section headed "Why check (m) skips this file", and under it a gate ledger table whose Scored digest column holds eight-character digest prefixes. The file says outright that it is "a deliberate off-template handover record, not a precedent for Issue 18". The 2026-08-24 sibling records that the brief "was frozen under an md5 for each round and the checksum passed into every gate prompt". Each run built its own custody mechanism. The one edition that complied, 2026-08-17, is the one whose headings and blocks follow the SKILL's save templates.

So the failure is substitution, not omission. That the custody information survives and the machine-readable form does not is what the corpus shows. Why the trade goes that way is inference, not measurement: the templates prescribe the line's shape at nine sites and nowhere state what the line is for, so a run that re-authors the record's shape has nothing telling it the line must survive the reshaping.

That changes what the shipped guard does for defect two. A substitution cannot survive a save-time failure the way it survived a reassuring skip: the run is stopped and has to reshape the record before it can save. The guard is the fix. Whether the substitution stops recurring is still verified by the next edition rather than asserted here.

Counts re-derived from disk in the same turn, correcting an earlier draft of this section that said six occurrences across five editions. `grep -c '^N/A:'` over `src/newsletters/published/leader/*/*.reviews.md` returns eight lines across four editions: 2026-05-01 one, 2026-05-08 one, 2026-05-15 two, 2026-06-01 four. Every one predates ADR-047, and every one is a REJECTED-family reason rather than the carriage reason. That matters for the third defect below: no published edition currently exercises the block walk with an N/A present, which is why this went unseen.

## A third defect, found in the same check, shipped 2026-08-29

Check (o) (P151) lets a gate record a documented skip as an `N/A: <reason>` block, and refuses any reason the SKILL does not declare in its `SANCTIONED-SKIP-REASONS` anchor. Check (m) decided whether a block held a verdict from its heading text alone, so a sanctioned skip carried no `scored-digest` line, was reported never-scored, and hard-failed the save.

Verified before the fix by copying the compliant 2026-08-17 edition to a scratch directory, replacing the Cognitive Accessibility Review body with the sanctioned `N/A: carried from prep (no material change)`, and running the lint: `FAIL [m] ... carries no scored-digest, so there is no way to tell which draft it scored`. On any edition dated on or after 2026-08-08, a legitimately skipped gate made the edition unsaveable. Satisfying both checks would have meant writing a digest for a gate that never ran, which asserts the custody ADR-047 exists to protect.

This is the same defect class as defect one, one grain down and pointing the other way. Defect one could not tell a legacy edition from a current one and resolved the ambiguity toward silence. This could not tell a gate that produced no verdict from a verdict that lost its digest, and resolved it toward blocking. Both were resolved by assumption where the populations are distinguishable, so both are fixed the same way: derive it.

**The fix.** Check (m) waives the digest requirement for a block that records a skip, bounded three ways. The reason must be one the SKILL declares, read from the same anchored block check (o) reads, so the two checks cannot disagree about what a legitimate skip looks like. The `N/A:` must be the block's first content line, skipping exactly what check (o) skips, so a live verdict whose prose happens to contain the string keeps owing its digest. And the block must not be marked carried, because a carried block does hold a verdict, produced at prep, and check (m)'s carried arm is the only thing verifying it was copied across rather than recomposed at save. A reason that claims carriage marks the block carried whatever its heading says, so the one declared reason asserting a verdict exists cannot buy the waiver on its own text.

Check (m) reads the declared list itself rather than leaning on check (o) having run. Check (o) skips loudly when the SKILL cannot be found or its roster is empty, and a waiver granted on sanctioning nobody performed would discharge presence and custody together on one typed line. An unreadable SKILL waives nothing.

**Five new behavioural cases**, in the same block, which now holds eleven. The block held seven when defect one shipped and six at the start of this work: the corpus pin moved out the same day into the combined sweep that runs the lint once per edition for all five corpus-wide properties, and it still asserts exactly the 2026-08-10 and 2026-08-24 pair. One was confirmed red first: the sanctioned, non-carried skip that the check was hard-failing. The other four pin boundaries the fix must not cross and were written to stay green, an unsanctioned free-hand reason, a carried-marked block, an unmarked block whose reason claims carriage, and a live verdict whose prose contains the string. All 132 cases in the file pass. The published corpus is unchanged by the fix: 2026-08-10 and 2026-08-24 still fail, 2026-08-17 is still compared block by block, and 2026-07-27 still skips as pre-adoption.

**Next step.** The fix is committed locally. The Known Error to Verification Pending transition is owed once it reaches origin, and the verification after that is the next edition's finalise run.

**Note for P099.** That ticket cannot verify while this is open, and defect one is the half that blocked it. Its mechanism now runs; its verification still needs an edition that takes post-gate edits with digests recorded, which is the next edition rather than a re-read of Issue 19.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P099, P164, P162, P163

## Related

Found on 2026-08-25 during the session retrospective, by a risk-scoring pass challenging a premise in the retro itself. The retro had recorded that check (m) "reported the artefact as a pre-ADR-047 edition", treating the SKIP as expected. That reading was wrong: the check reports nothing about the edition, it prints a fixed string. The correction came from reading the branch rather than the message.

- **P099** (post-finalise edits do not re-run the full gate set) shipped this check as its enforcement. It stays in Verification Pending, and its status is worse than unverified: the mechanism it shipped is not running. This ticket is why, and P099 cannot be verified until it is fixed.
- **P164** (a gate finding applied while another gate is reading invalidates that verdict) is the human half of the same failure. Both are about a gate verdict attaching to text that has moved; P164 is the operator causing it, this is the check that should have reported it being asleep.
- **P162** and **P163** share the shape named in this session's retrospective: a discipline someone is trusted to hold, where the fix is a check that does not depend on them holding it. Here the check existed and disarmed itself, which is the sharpest version of it.
- **P151** (a prescribed gate can skip a phase entirely and nothing detects the absence) shipped check (o), which is what makes a recorded skip legitimate. The third defect above is the seam between the two checks: (o) admits a documented skip, (m) demanded a digest from it, and no published edition exercised the pair because every N/A on disk predates ADR-047. Check (m) now reads the same declared reason list check (o) reads, so the two cannot disagree about which reasons are legitimate. The list is single-sourced in the SKILL; the readers of it are not, and the five-line extraction now exists twice in the script. That duplication is recorded rather than hidden: a reason added or removed still propagates to both checks with no edit to either, and both copies are exercised against the real SKILL by the tests either side of them.
- The three-times-stated fail-not-skip principle in the same script is the strongest argument for the fix and the reason this is a defect rather than a design choice.
