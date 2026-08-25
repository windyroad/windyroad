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

So Issue 19 is not a legacy edition. It is a current edition whose pipeline stopped writing the digests, and the check that exists to catch stale gate verdicts stood down because of exactly the omission that should have alarmed it. Every lint run across twenty-four remediation rounds printed the SKIP line, and it read as expected behaviour.

Two defects, kept in one ticket because the second is what exposed the first and they are fixed together.

1. Check (m) cannot tell a legacy edition from a current one whose digests went missing, and resolves the ambiguity toward the outcome that stops checking.
2. The Issue 19 pipeline emitted no scored-digest lines at all. That is a regression against Issue 18 and needs its own root cause in the drafting skill.

## Symptoms

- `SKIP [m] <reviews>: carries no scored-digest lines; gate-freshness not checked (pre-ADR-047 edition)` on an edition written well after 2026-08-08.
- The lint reports OK overall while its only stale-verdict guard has not run.
- A reader of the lint output has no way to tell a genuinely exempt legacy edition from a live regression.

## Workaround

Compare the reviews sibling's digest count against the preceding edition's before trusting a clean lint. Two greps.

## Impact Assessment

- **Who is affected**: the newsletter finalise, on the publication's primary channel. No reader is known to have been affected, because the Issue 19 gates were re-run manually against fresh freezes and the freeze discipline was in force by hand.
- **Frequency**: every lint run of the Issue 19 finalise, roughly twenty. Continues on every future edition until the digests are re-emitted.
- **Severity**: ADR-047's enforcement is unarmed. The failure it was written to prevent, a gate verdict scoring text that has since changed, is exactly what happened twice by hand in the same edition and is recorded as P164.
- **Analytics**: not instrumented.

## Root Cause Analysis

### Preliminary Hypothesis

The check was written to be tolerant of the back catalogue, which is correct: editions published before 2026-08-08 carry no digests and should not fail. The error is resolving the ambiguity in prose rather than deriving it. Nothing in the file distinguishes the two populations, so the branch guesses, and it guesses toward silence.

The script argues against itself here, three times, in its own comments. Check (h): "Do NOT silently skip: a brief with no items is not a brief that needs no provenance line. Skipping here would make (h) unenforceable on exactly those briefs." Check (p): "Present but unreadable is a broken contract, not an absent one. Drift here is silent in the direction that stops checking, so this fails rather than skipping." Check (o): "the copy drifts, and the drift is silent in the direction that stops checking." Check (m)'s zero-digest branch is the one place that principle was not applied.

The second defect is unexamined. Issue 18 wrote the digests and Issue 19 did not, so something between those two editions stopped the emission, or the Issue 19 run took a path that never reached the emitting step.

### Investigation Tasks

- [ ] Find why Issue 19 emitted no digests when Issue 18 did. Diff the two runs' paths through the save step.
- [ ] Decide how check (m) derives the legacy distinction: edition date against ADR-047's, presence of the ADR-052 tagging conventions, or an explicit frontmatter marker.
- [ ] Create a reproduction test with both populations, a genuine legacy sibling and a current sibling with digests stripped.
- [ ] Confirm the fix fails red against the Issue 19 sibling as it stands before shipping it.

## Fix Strategy

Apply the fail-not-skip principle the neighbouring checks already state. Check (m) derives whether the edition is in scope for ADR-047 rather than inferring it from the absence it is testing for, and fails when a current edition carries no digests. An explicit frontmatter marker on the back catalogue is the cheapest derivation and the least clever; a date comparison is more automatic and more brittle.

Fix the emission separately and first, because the check cannot be tested green until something writes digests again.

Write the check against the requirement rather than against the current corpus, and confirm it goes red against the Issue 19 sibling before shipping. This ticket exists because a check was written that could not fail on the case it was for, and shipping a second one on the same reasoning would be the same error twice.

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
