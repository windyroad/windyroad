# Problem 161: No check compares a brief against its own companion post for agreement

**Status**: Open
**Reported**: 2026-08-24
**Priority**: 15 (High), Impact: 5 x Likelihood: 3, re-rated at capture-review on the risk scorer's correction
**Origin**: internal
**Effort**: S, derived at capture per Step 4a
**WSJF**: 15.0 = (15 x 1.0) / 1

## Description

No deterministic check compares a brief against its own LinkedIn companion for factual agreement, so a fix applied to one and not the other reaches publication unless an LLM gate happens to notice.

`scripts/check-newsletter-structure.sh` has exactly three companion-scoped checks, verified on disk at lines 225, 432 and 685: (f) model-name strings consistent between brief and `.linkedin.md`, (l) companion length ceiling at 1.5x the median of two priors, and (m) scored-digest staleness. Check (f) is the only one that compares content across the two files, and its comparison set is model names only. Nothing reads a claim in the brief and asks whether the companion still says the same thing.

The companion is generated at step 15.5 from the brief as it stood at that moment. Every subsequent remediation round edits the brief. Nothing re-derives the companion, and nothing flags the divergence. The two files then go to separate gates: the brief to the full seven-gate set, the companion to voice and shape only. A claim corrected in the brief and left standing in the companion is therefore checked by whichever LLM gate happens to read both, which is not a gate whose job it is.

Evidence, all from the Issue 19 finalise on 2026-08-23/24, three occurrences in one edition:

1. The brief's claim that GitHub code scanning "has to be bought" was corrected to free-on-public-repos-but-must-be-enabled. The companion kept the original. Caught by the cross-edition consistency gate, which is scoped to prior editions, not to siblings.
2. A "malicious logic" phrasing was corrected in the brief and left in the companion. Caught by the voice gate on the post, incidentally.
3. At round 5 the brief's code-scanning counterfactual was narrowed twice: its documented job is finding vulnerabilities and errors, not code hidden on purpose; and "We do not know whether this project had" gained its missing object. The companion carried both defects. This one was caught only because the operator deliberately re-read the companion after every brief edit, having been bitten twice already. That is a habit, not a control, which is the exact distinction the edition itself argues.

Occurrences 1 and 2 were caught by gates doing a different job. Occurrence 3 was caught by a person who happened to look. None was caught by anything whose job it is.

## Symptoms

- A claim corrected in the brief survives unchanged in the published `.linkedin.md`, which is the higher-reach artefact of the two.
- The divergence is invisible to `scripts/check-newsletter-structure.sh`, which reports OK on both files.
- Detection depends on which LLM gate happens to read both artefacts in the same pass, so the same defect class is caught by a different gate each time, or by nobody.

## Workaround

Re-read the companion after every brief edit during a remediation round, and re-apply any factual narrowing by hand. This is what caught occurrence 3. It is operator discipline with no enforcement behind it.

## Impact Assessment

- **Who is affected**: readers of the LinkedIn companion post, which is the artefact with the widest reach; and the publication's credibility, since the companion is where a corrected claim is most likely to be quoted onward.
- **Frequency**: three occurrences in one edition. Fires whenever a finalise runs more than one remediation round, which is every edition.
- **Severity**: a factual claim the brief has already retracted, published to the wider audience. Correctable after the fact, but only by editing a live post.
- **Impact rating note**: originally rated Impact 3 at capture, by inheriting the calibration of the neighbouring remediation-verification ticket. That was wrong. Impact 3 in the risk policy is bounded by "does not reach readers, caught before publish", and the defining property of this defect is that nothing owns the brief-to-companion comparison, so it can cross the publication boundary. Occurrence 1 is the worked case: a factually wrong claim about a named third party, standing in the artefact with the widest reach. That is the Impact 5 cell as written. Corrected to 5 x 3 = 15 (High) on the risk scorer's finding, 2026-08-24.
- **Analytics**: not instrumented.

## Root Cause Analysis

### Preliminary Hypothesis

The companion is a one-time projection of the brief, taken at step 15.5, with no re-derivation step and no back-reference. The gate topology then splits: the brief gets seven gates, the companion gets two. Nothing in the pipeline owns the relationship between the two files, so a change to one is not an event for the other.

### Investigation Tasks

- [ ] Investigate root cause
- [ ] Create reproduction test
- [ ] Decide between the process check and the content check (see Fix Strategy) and record why

## Fix Strategy

The natural home is a fourth companion-scoped check in `scripts/check-newsletter-structure.sh`, whose header states its purpose as catching the class of structural and sourcing defects the LLM review gates do not catch. This is squarely that class.

Scoping needs care: the companion is a compression of the brief, not a copy, so a check cannot demand shared sentences. Two shapes are worth evaluating, and they are not equivalent.

**Option A, a process check.** Fail when the brief's mtime is newer than the companion's. This catches the whole class by construction, needs no natural-language reasoning, and cannot produce a false negative on this failure mode. The cost is that it forces a companion re-read on every brief edit, including edits that cannot possibly affect the companion. Evaluate this first, precisely because its failure mode is over-firing rather than under-firing.

**Option B, a content check.** Compare only what is mechanically comparable: shared numerals and units appearing in both files must not disagree; a shared proper-noun claim present in both must not carry opposite polarity on a small marker set (free/paid, on/off, by default/must be enabled); any URL cited in both must be described consistently. Cheaper to live with, but it will miss anything outside the marker set, and occurrence 2 ("malicious logic") is exactly that kind of miss.

Option A is the one that matches the evidence. All three occurrences were brief-edited-after-companion-generated, and all three would have fired.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P160, P154, P099

## Related

Captured via `/wr-itil:capture-problem` on 2026-08-24, during the Issue 19 finalise that produced the evidence.

The sub-step 2b hang-off arbitration was **skipped under the candidate-cap short-circuit**: the mechanical pre-filter returned 10 candidates sharing the `check-newsletter-structure.sh` or `.linkedin.md` signal, above the 5-candidate ceiling. Per the skill contract the candidate list is recorded here for review-time re-evaluation rather than arbitrated at capture. Candidates: P157, P160, P099, P114, P119, P122, P140, P151, P152, P154.

Three of those deserve a specific look at review time, because a reviewer could reasonably decide this hangs off one of them rather than standing alone:

- **P160** (no deterministic check reads the LinkedIn companion body for a manual URL) is the nearest sibling and shares the exact fix surface, a missing companion-scoped check in the same script. It is nonetheless a different defect class: P160 is a single-file content rule, checkable by reading the companion alone. This one is a two-file agreement problem that no single-file rule can express. If both are fixed together, they are two checks, not one.
- **P154** (newsletter remediation edits are never independently verified) is the general case of which this is one concrete, mechanically checkable instance. It is NOT a live absorption candidate: P154's fix shipped on 2026-08-23, and its three new checks are brief-body only, as is the round-close lint at step 15.37. It shipped without a step that re-reads every artefact, so it does not cover this. It is also in Verification Pending, so hanging new scope off it would confound its verification.
- **P099** (post-finalise edits do not re-run the full gate set) is adjacent but distinct: P099 is about gates not re-running on the brief; this is about the companion not being regenerated or compared at all, which no amount of re-running the brief's gates would catch. Also in Verification Pending.

That leaves P160 as the only genuinely open competing ticket, and the distinction drawn against it above holds on inspection.
