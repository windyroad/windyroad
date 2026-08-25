# Problem 162: A claim corrected at one site survives at its sibling sites

**Status**: Open
**Reported**: 2026-08-24
**Priority**: 16 (High), Impact: 4 x Likelihood: 4, derived at capture, rationale corrected at the pre-commit risk scoring. Impact is 4 because every occurrence was stopped before publication and the class indicates gate weakness, which is the impact-4 definition in `RISK-POLICY.md` almost verbatim. Not 5 because no occurrence reached readers; the first one that does is a 5, and that is the table's discriminator, not whether a third party is named. Note that Impact 4 and Likelihood 5 are mutually exclusive under this policy, since Likelihood 5 requires no safety net between the change and publication while Impact 4 requires the failure to be caught at one. Escalation therefore runs through Impact 5, not Likelihood 5.

Likelihood is 4 because no deterministic check covers the class at all, which satisfies the likelihood-4 clause "no hooks or automated checks cover this area", and because the probabilistic gate demonstrably misses within a single pass (occurrence 4). It is not 5, but the reason is weaker than it first looks. Something stopped all eight before publication and it was never the same catcher twice; twice it was not a gate at all, since occurrence 4 was found by an operator sweep in the same pass where a gate had cleared the site, and occurrence 8 by an external reviewer counting on disk after the gate set had run. That is redundancy and luck rather than coverage. Expect this to fall to 3 once the fix has run clean for two or three remediation rounds. Rounds rather than editions, because four of the eight were introduced by fixes, so the rate scales with round count and a short edition would clear the trigger without ever exercising the class.
**Origin**: internal
**Effort**: M, derived at capture. The fix is an enumeration obligation in the newsletter SKILL's remediation loop plus a worked example, and the loop is ADR-043's contract, so adding a new obligation inside it needs a decision record rather than a prose edit alone. That is what separates this from P161, its same-day sibling, which is rated S because a file-mtime comparison in an existing lint script needs no decision. If investigation finds the obligation sits inside ADR-043's existing scope and needs no new decision, this drops to S and the WSJF row moves from 8.0 to 16.0, which would put it at the top of the queue.
**WSJF**: 8.0 = (16 x 1.0) / 2

## Description

When a review gate finds a claim over-stated and the drafter narrows it, the narrowing is applied where the gate pointed. The same claim stated elsewhere in the brief keeps the old, stronger form. Nothing compares the sites, so the edition ships internally inconsistent unless a later gate round happens to read two of them together.

Verified on disk 2026-08-24, and independently re-read at the pre-commit risk scoring: `scripts/check-newsletter-structure.sh` carries 18 checks, ids a through r, listed in the header block at lines 23 to 52. Note that the header block is not in alphabetical order: check (n) sits between (c) and (d) at script lines 29 to 32. So "a through r" resolves to 18 only if the entries are counted. Anyone who assumes the list is ordered and reads the last id gets a different answer, which is a small instance of the same thing this ticket is about, a claim that looks verifiable by inspection and is not. None compares two statements of the same claim within the brief body. The closest are (f), which compares model-name strings between the brief and the companion post, and (k), which rejects an identical citation appearing in two sections. Both are string-identity checks over a fixed comparison set. Neither reads a qualified claim and asks whether the qualifier survives everywhere the claim is made.

Evidence, all from The Shift Issue 19 finalise, eight occurrences across six remediation rounds, not consecutive ones:

1. Round 16. A claim that human reviewers vary by person and by week was downgraded at one site to "nobody has measured it". Two sites three paragraphs away kept asserting the variance as fact, and one of them was the stated reason the edition gave for its central argument. Caught by the skeptic gate.

2. Round 18. A governing condition present at three sites was dropped at a fourth, newly written in the same round that fixed a different site. Read alone, the fourth site contradicted the edition's own carve-out. Caught by the skeptic gate.

3. Round 19. A second governing condition was present at two sites and absent at the third, which by then was the single load-bearing sentence of the argument. Separately, a phrase carrying a human-variance implicature was removed at one site and left standing at a sibling four lines away. Both caught by the skeptic gate.

4. Round 19, after the gate reported. The operator ran a grep sweep for both patterns and found one more site the gate had explicitly cleared in that same pass, carrying the same implicature the gate had condemned four lines below it.

5. Round 20. The skeptic found the sharpest instance of all, in the opener, which the operator's grep sweep had missed. The sentence read "its answer does not change with who is on shift". That presupposes a contrast class in which human answers do change with who is on shift, which is exactly what the edition elsewhere declares unmeasured.

6. A later round added an orientation line to the opener carrying "the first price anyone has published", where the item it summarises hedges the same claim three times and in three different nouns: "the first price we have seen published", "the first figure we have seen published", and "the only such number we have seen published". The escalation was written into a fix for a different finding. The surface-form variance is the point: no single string enumerates the sites.

7. The same round rewrote a closing line to assert that the student was the only thing in the edition anybody watched work. That wording is a reconstruction; the review record paraphrases it in reported speech and the corrected line on disk reads differently again. The body contradicted the assertion twice, once in a sentence written deliberately to credit the maintainer for not being talked round. The review record establishes that this instance was introduced while fixing something else; the specific mechanism, that removing the maintainer from the close left the absolute behind, is our reading of the sequence rather than something an artefact records.

8. The operator reported to the author that a repeated conditional phrase had been cut from four occurrences to two. It was at three. The previous round had removed one instance and added another back in a new paragraph, and the count was asserted without being re-checked. An external reviewer caught it by counting on disk.

Occurrences 6, 7 and 8 sharpen the ticket rather than merely extending it. All three were introduced while fixing something else, which makes the remediation loop itself a source of this defect and not only a place where it is detected. Occurrence 8 adds a second failure mode to the first: not only does a correction fail to reach every site, the operator's own count of how many sites remain is unreliable, so "I have fixed all of them" is not evidence that they are fixed.

## Symptoms

- A claim the edition retracts in one paragraph is asserted in another, often the opener.
- A fix for one finding introduces a fresh instance at the seam where it was stitched in.
- The operator's stated count of remaining sites does not match the count on disk.
- The lint reports OK; the divergence is invisible to every deterministic check.
- Detection depends on which gate happens to read two sites in one pass, so the same defect class is caught by a different gate each round, or by nobody.

## Workaround

After any claim narrowing, enumerate the claim's other sites by hand and check the qualifier at each. This caught occurrence 4 and missed occurrence 5.

## Impact Assessment

- **Who is affected**: readers, who are handed an over-claim in the paragraph they are most likely to finish, while the withdrawal sits below the fold.
- **Frequency**: eight occurrences in one edition, across six of its remediation rounds. Fires whenever a finalise runs more than one remediation round, which is every edition. Four of the eight were introduced by fixes, so the rate rises with the number of rounds rather than being fixed per edition.
- **Severity**: an argument the edition has already conditioned, published unconditioned at its most prominent point.
- **Analytics**: not instrumented.

## Root Cause Analysis

### Preliminary Hypothesis

A gate reports the instances it notices; it does not enumerate. Occurrence 4 is the direct evidence: in a single pass the skeptic condemned an implicature at one site and explicitly cleared a sibling four lines below it. Nothing in the pipeline holds a list of the sites at which a given claim is made, so a correction has as many sites as the drafter happened to look at rather than as many as the claim has.

### Why a grep sweep is not sufficient

Occurrence 5 is the counter-example to the obvious fix, and the reason is worth recording.

First, lexical. The same check property is asserted in at least five surface forms across one edition: "does not change with who is on shift", "does not depend on who is doing the looking", "gives the same answer whoever runs it", "does not change its answer between runs", "rather than who is looking". No single string enumerates them. The missed site hid behind the word "shift", which is the publication's own name, so the real hit drowned in the masthead, the running head and the file path.

Second, structural. The implicature is not carried by a keyword at all. It is carried by the contrast frame ("does not change with X", "rather than X"), and the unearned claim lives in the implied comparison class, which no regex can see.

The pass that works is an enumeration, not a search: list every sentence whose subject is a check or gate and whose predicate is an invariance, an unarguability or a staffing property, then ask of each whether it carries the governing conditions and what contrast class it implies about people. Run against Issue 19 this produced thirteen candidate sentences, eleven real, and settled each.

### Investigation Tasks

- [ ] Investigate root cause
- [ ] Create reproduction test
- [ ] Decide between the enumeration obligation and the co-occurrence check (see Fix Strategy) and record why

## Fix Strategy

**Option A, an enumeration obligation in the remediation loop.** After any claim narrowing, extract the claim's predicate class rather than its wording, enumerate every sentence in the brief asserting that predicate of the same subject, and check the governing conditions at each. Belongs at SKILL.md step 15.37, not in the lint. This is the shape that worked; it is also the shape that needs a worked example in the SKILL, because the first attempt at it (a term grep) missed the sharpest site.

**Option B, a deterministic co-occurrence check in `check-newsletter-structure.sh`.** For a configured set of claim/qualifier pairs, assert the qualifier appears within N words of every occurrence of the claim term. Cheap, but the pair set is authored per edition, so it only catches claims somebody already thought to configure. Assessed against the first five occurrences only, it would have caught 2 and 3 and missed 1, 4 and 5. Occurrences 6, 7 and 8 are not assessed here, and they are the case Option B handles worst, because two of them are surface-form escalations where the configured pair set would have to anticipate the wording.

Occurrence 8 adds a requirement to Option A that was not obvious from the first five: the sweep's result has to be a counted output, not a claim. The operator reported a count that disk contradicted, so the obligation must produce a number from the file rather than a sentence from the person. That is cheap to satisfy and it is the difference between a check and a habit, which is the distinction the edition this ticket came out of spends its length arguing.

Option A first. Option B is a fallback if predicate extraction proves unreliable.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P161, P154, P122, P099

## Related

Captured via `/wr-itil:capture-problem` on 2026-08-24, during the Issue 19 finalise that produced the evidence.

The mechanical pre-filter returned 10 candidates, above the 5-candidate ceiling, so the skill's short-circuit would normally have skipped the hang-off arbitration and recorded the candidate list unarbitrated. The operator narrowed the set by hand and dispatched the arbiter anyway, because the nearest candidate looked close enough that an unarbitrated overlap disclosure would have been worse than the latency. Verdict: **PROCEED_NEW**.

The arbiter's reasoning, recorded because it is the reason this stands alone rather than hanging off a parent: every candidate's mechanism is a reader (an LLM pass, a diff-scoped read, a re-run gate), and occurrence 4 is direct evidence that a reader cannot discharge this class. The obligation here is edit-keyed and completeness-shaped, which no candidate's fix expresses.

- **P122** (no gate owns within-edition structural mechanics) is closest on subject matter, and its `edition-internal-consistency` axis covers whether a fact carries opposite valence in two places. It does not absorb: its fix locus is a receptive whole-edition LLM read, edition-keyed and once per pass, whose detection is probabilistic. Its fix shipped 2026-08-08, so these occurrences are post-release discovery. Its own Fix Released section notes the four axes have never fired in anger, which this evidence bears on as verification input.
- **P154** (remediation edits never independently verified) is the strongest structural candidate, sharing the fix locus at SKILL.md step 15.37. It does not absorb because its deferred expensive option is defined on disk as a diff-scoped read of the remediated passages, and this class lives outside the diff by construction: the divergent sites are precisely the passages the round did not edit. P154 asks whether the edit made is correct; this asks where else the claim appears.
- **P161** (no check compares a brief against its own companion) is a true sibling, not a parent: same phenomenon, different site topology. Its winning fix compares file mtimes, which is only expressible because the companion is a separate file. There is no mtime between two paragraphs of one body.
- **P099** (post-finalise edits do not re-run the full gate set) concerns verdict staleness. Occurrence 4 happened inside a gate pass that did run against the current body.

On lifecycle: the operator believed hanging scope off a Verification Pending ticket would confound its verification. The arbiter found that roughly right for the wrong reason, and noted this repo has already ruled against the general form: P099 carries a section headed "Scope hung off this ticket 2026-08-08" while sitting in Verification Pending. What actually bars absorption is that P154 and P122 have shipped fixes whose recorded scope decisions exclude this class, so absorbing would mean re-opening a shipped ticket to carry unshipped scope.

For the next `/wr-itil:review-problems` cluster pass: consider a common parent over P161 and this one, "a correction applied at one site is never propagated to that claim's other sites", with an inter-artefact surface (P161) and an intra-body surface (this). Neither ticket is that parent.

Six corrections to this ticket's own evidence, all recorded because each is an instance of the failure the ticket describes.

1. The capture text asserted, as disk-verified, "18 checks, ids a through r plus w". There is no check (w); the only `w` in the script is an awk array index at line 568 inside check (p). Caught by the hang-off arbiter.

2. The Impact rationale stated the inverse of the policy table's own test, giving "crosses the publication boundary" as the reason for a 4 when the table makes that the definition of a 5. The number was right and the reasoning was wrong, in the direction that would have deflated a genuine reader-facing escape to a 4 if reused as precedent. Caught at the pre-commit risk scoring.

3. The Likelihood rationale argued a firing rate against a table keyed on reach. The number survives on a different argument, recorded above. Caught at the same pass.

4. The capture cited ADR-076 as the governing rule for honest likelihood. There is no ADR-076 in this repo; local decisions run 001 to 056, and ADR-076 is an upstream decision governing reported-first tier ordering, which does not govern likelihood. That is the P082 failure, propagating a cited artefact without checking it exists, committed inside a ticket about unverified claims. The governing artefact is `RISK-POLICY.md`'s likelihood table. Caught at the same pass.

A fifth, recorded for the same reason: the capture stated that the WSJF effort divisor "was not documented". It is documented, in narrative rather than in a formula block, in `docs/problems/README-history.md`. That is a bounded-search negative claim asserted as fact, the P103 shape. The divisors are S=1, M=2, L=4, and the back-solved arithmetic was independently reproduced against nine existing rows.

A sixth, and the one that matters most. When this ticket was updated from five occurrences to eight, the new count reached the Description and not the Impact Assessment or the Priority rationale, which are the two sections a re-rating pass actually opens. The fix for that then added a ninth member to the evidence list without reaching the sentence two lines below that generalises over it, so a list of four members sat under a count of three. Both were caught by the risk scorer at the pre-commit gate. This is the only instance in the whole record where the failure happened inside a document about the failure, written by someone holding the class in mind, twice in succession. It is the evidence that awareness does not discharge this class, which is what rules out a reminder-shaped fix and what the counted-output requirement in the Fix Strategy rests on.
