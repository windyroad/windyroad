# Problem 155: A governance subagent's recommended action can be wrong in a way only the enforcement it would break reveals

**Status**: Open
**Reported**: 2026-08-23
**Priority**: 9 (Medium) - Impact: 3 x Likelihood: 3. Impact is 3 because adopting a wrong recommendation lands broken work (in the observed case, a red test) rather than reaching a reader; it is pipeline disruption, caught by CI or by the next run. Likelihood is 3 because governance subagents recommend actions on most iterations and many of those actions touch a surface something else enforces, though a recommendation wrong enough to break that enforcement has been observed once.
**Origin**: internal
**Effort**: M. A consumer-side discipline addition across the governance-skill surfaces that adopt subagent recommendations, plus a briefing entry. No new agent, no new hook.
**WSJF**: 4.5 = (9 x 1.0) / 2

## Description

Working P128 on 2026-08-23, the architect recommended a way to make progress without writing to ratified decision records: author the new record's forward `amends:` claim now, and hold back the three reciprocal `amended-by:` lines the overtaken records need.

Every artefact the verdict cited was real. Every fact it asserted about those artefacts checked out against disk. So the existing verify-before-propagating discipline passed clean: there was no fabricated reference to catch, and no upstream-placement claim to test.

The recommendation was still wrong. `scripts/decisions-supersession.test.mjs` asserts relationship reciprocity in **both** directions, so a forward claim with no reciprocal goes red and a lone reciprocal goes red too. The recommended shape ships a red test. It was caught only because the orchestrator happened to open the test file before acting, and the architect withdrew the recommendation once told.

The gap is that the recorded disciplines cover the inputs to a verdict and not its output. P082 covers references to artefacts that do not exist. P045 covers claims about where work belongs upstream. Neither covers a recommendation built correctly on real citations whose defect is a property of the enforcement surface the recommended action would have to satisfy.

One in-session signal was useful and is worth keeping: two reviewers openly disagreed about the same call. The architect said build; the JTBD reviewer said hold. That disagreement was the cue that some deciding fact had not been read yet, and reading it settled the question in a way neither reviewer had reached.

## Symptoms

- A governance subagent recommends an action. Its citations all verify. The orchestrator adopts it and lands work that a test, hook, or gate then rejects.
- The failure surfaces at commit or CI rather than at review, so the cost is a round-trip plus whatever partial work has to be unwound.
- Nothing in the review loop asks whether the recommended action would satisfy the enforcement that governs its target.

## Workaround

Before adopting a subagent's recommended action, identify what enforces the surface the action touches - a test file, a hook, a lint, a schema - and read it. When two reviewers disagree on the same call, treat the disagreement as a signal that a deciding fact is unread rather than as a tie to break on judgement.

## Impact Assessment

- **Who is affected**: the orchestrator adopting governance-subagent recommendations, most visibly under AFK where there is no human to catch the mistake before it lands.
- **Frequency**: every iteration that adopts a recommended action touching an enforced surface.
- **Severity**: moderate. The enforcement that makes the recommendation wrong is usually the same enforcement that catches it, so the cost is rework rather than escaped breakage. Under AFK the rework can consume the rest of an iteration.
- **Analytics**: none.

## Root Cause Analysis

Verification discipline in this project has been built around what a verdict *cites*. P082 established that a cited artefact must exist on disk. P045 established that a claimed upstream home must be checked for domain fit and placement authority. Both check the verdict's inputs.

A recommendation is an output, and its correctness depends on something neither discipline looks at: whether the recommended action satisfies the constraints that already govern its target. Those constraints usually live in a file nobody reads during review, because reviewing the verdict does not obviously require reading the test that would run afterwards.

### Investigation Tasks

- [ ] Decide where the discipline belongs. Candidates: a consumer-side step in the governance skills that adopt recommendations; an addition to the subagent prompts asking each reviewer to name the enforcement its recommendation must satisfy; or a briefing entry only.
- [ ] Work out whether reviewer disagreement can be made a mechanical signal rather than a noticed one, given that most iterations dispatch several reviewers whose verdicts are already collected in one place.
- [ ] Check whether the same gap has produced other rework, by looking for iterations where a commit was rejected by a test or hook shortly after a subagent recommended the shape that broke it.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P154

## Related

- **P082** (`docs/problems/closed/082-subagent-outputs-include-fabricated-references-to-artefacts-not-on-disk.md`): the closest prior. It covers references to artefacts that do not exist; this covers recommendations whose references all exist.
- **P045**: the upstream-placement half of the same family, also input-side.
- **P128** (`docs/problems/known-error/128-risk-threshold-restated-in-ten-places-with-no-single-source-of-truth.md`): the iteration where this was observed. Its `## Fix shape settled 2026-08-23` section records the recommendation, the test that falsifies it, and the withdrawal.
- Anchoring note: captured under AFK with no persona or job resolved, following this repository's convention of omitting those lines. Worth eliciting at the next interactive pass.
- Duplicate-check matches at capture, none of which is this concern: P039, P081, P082, P074, P132, P021.
