# Problem 165: The stale-verdict check stands down on the very absence it exists to catch

**Status**: Open
**Reported**: 2026-08-25
**Priority**: 16 (High), Impact: 4 x Likelihood: 4, derived at capture. Impact is 4 because ADR-047's sole enforcement mechanism is currently disarmed on the live pipeline, so a gate verdict scoring superseded text can attach to a published edition with nothing reporting it, and that is the defect ADR-052 was written after. Not 5 because no wrong claim is known to have reached a reader through this path; the Issue 19 gates were re-run manually against fresh freezes. Likelihood is 4 because it has already happened once and nothing detects the omission going forward.

**Origin**: internal
**Effort**: S, derived at capture. One branch in the lint and one root cause in the drafting skill. Both surfaces are local.

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

- [ ] Find why 2026-08-10 and 2026-08-24 emitted no digests when 2026-08-17 did. The compliant edition sits between the two breaches, so this is not a bisect: look for what makes the drafter reach the emitting step on some runs and not others.
- [x] Decide how check (m) derives the legacy distinction: edition date against ADR-047's, presence of the ADR-052 tagging conventions, or an explicit frontmatter marker.
- [x] Create a reproduction test with both populations, a genuine legacy sibling and a current sibling with digests stripped.
- [x] Confirm the fix fails red against the Issue 19 sibling as it stands before shipping it.

## Fix Strategy

Apply the fail-not-skip principle the neighbouring checks already state. Check (m) derives whether the edition is in scope for ADR-047 rather than inferring it from the absence it is testing for, and fails when a current edition carries no digests. An explicit frontmatter marker on the back catalogue is the cheapest derivation and the least clever; a date comparison is more automatic and more brittle.

Fix the emission separately and first, because the check cannot be tested green until something writes digests again.

Write the check against the requirement rather than against the current corpus, and confirm it goes red against the Issue 19 sibling before shipping. This ticket exists because a check was written that could not fail on the case it was for, and shipping a second one on the same reasoning would be the same error twice.

## Defect one shipped 2026-08-25; defect two is now guarded rather than solved

**The check no longer guesses.** `check-newsletter-structure.sh` check (m) derives whether ADR-047 governs the edition instead of inferring it from the absence it is testing for. The edition date comes from the brief filename, which ADR-026 fixes as the publication date and which the sibling derivation in the same script already depends on, so this adds no new coupling. On or after 2026-08-08, zero digests is a contract breach and fails. Before it, the edition is genuinely exempt and skips. Undateable, and the check reports that it could not tell, which is the only honest answer left and is deliberately not the benign one.

The frontmatter-marker alternative the Fix Strategy preferred was rejected on inspection. It means editing eighteen published editions to record a fact already derivable from their filenames, and it fails closed on an unmarked new file for want of bookkeeping rather than for a real breach.

**7 behavioural cases, 5 confirmed red first.** Including the boundary, where ADR-047's own date is in scope, and the case pinning that a current edition with digests is still compared rather than waved through by being current.

**Defect two is not fixed and is now unmissable.** The emission is prose in the SKILL, at nine save-time templates plus a verbatim-copy instruction for prep-carried blocks, and nothing enforced it. That is unchanged. What has changed is that an edition which skips the emission is now blocked at save rather than waved past with a reassuring message, so the next occurrence announces itself instead of accumulating. Whether the intermittency needs a root cause beyond that is worth deciding after one edition runs under the new check: a rule nobody could break silently may simply stop being broken.

**Two published editions carry the breach and neither can be repaired.** 2026-08-10 and 2026-08-24 fail the new branch. Backfilling their digests is not available and should not be attempted: computing a digest now, over the final text, would assert that each gate scored that text, which is the custody breach ADR-047 exists to prevent. The lint reporting them is the correct state, the corpus test pins exactly that pair, and a third would show up as a change to the pinned set rather than as one more line nobody reads.

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
- The three-times-stated fail-not-skip principle in the same script is the strongest argument for the fix and the reason this is a defect rather than a design choice.
