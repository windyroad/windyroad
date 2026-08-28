# Problem 173: A ticket's verification criterion is never re-checked against decisions ratified after it was written

**Status**: Open
**Reported**: 2026-08-29
**Priority**: 6 (Medium), Impact: 2 x Likelihood: 3, derived at capture from the description. Impact is 2 on the same basis P139 and P170 use for problem-management tooling defects: the harm is a ticket wrongly reopened or wrongly closed, which reaches no reader or visitor and produces no wrong site or newsletter output. RISK-POLICY.md reserves Impact 3 for visitor degradation or newsletter-pipeline disruption. Likelihood is 3 for the same reason P170 carries 3, and the counter-reading is recorded rather than hidden: P139 rates a structurally similar nothing-joins-these-two-surfaces gap at 4 on RISK-POLICY's coverage definition, which applies here too since nothing covers this area either. 3 is chosen because the triggering circumstance is conditional rather than standing. At 4 this would rank 4.0 alongside P139; the next review-problems pass is where that settles. The chosen basis: it takes a specific circumstance, a decision ratified after a criterion was written that changes what the criterion measures, but nothing detects it once the circumstance arises, and it has happened once.
**Origin**: internal
**Effort**: M, derived at capture. The ADR half is cheap: a decision's `amended-by` array and each amending decision's ratification date are both structured frontmatter. The ticket half is not: a criterion's write date is prose, recoverable from git blame on the line or from the `## Fix Released` section's own date, and neither is a declared field. The cost is that join and deciding where the check fires, which is the same shape P139 records for its own detector.
**WSJF**: 3.0 = (6 x 1.0) / 2
**JTBD**: JTBD-400
**Persona**: internal-maintainer

## Description

A problem ticket's close criterion is written once, at the moment the fix ships, and is then read months later to decide whether the fix worked. Between those two moments a decision can be ratified that changes what the criterion measures. Nothing joins the two, so the criterion is read at face value and the wrong conclusion is drawn from correct evidence.

The observed instance. P120 (Editor and skeptic gates surface findings to Tom instead of remediating them) shipped its fix on 2026-08-05 and wrote a close criterion saying the fix is not working if "the remediation loop at step 15.37 runs more than one round inside a single body pass" (P120's own 2026-08-25 note restates it as "if the loop runs more than one round per body pass", and the quote here is from the criterion itself, which is the point). ADR-052 (Every newsletter reviewer gate blocks publication) was ratified on 2026-08-10 and made every reviewer gate blocking, so a surviving finding now holds the edition and each fix starts a further body pass. On 2026-08-25 a verification note read a twenty-four-round newsletter finalise against the criterion and concluded the fix had regressed by a factor of twenty-four. On 2026-08-28 the ticket was flipped back from Verification Pending to Known Error on Tom's confirmation of that reading.

The reading was wrong twice over. The twenty-four counted full-battery body passes; the criterion caps remediation rounds inside one body pass. And the number of body passes an edition takes is what ADR-052 changed. Establishing that cost a full iteration and four architect rounds on 2026-08-29, and the ticket sat at the top of the Tier 0 queue in the meantime.

This is the fourth surface in the verify-before-X family, after ticket prose (P032, P103), upstream placement claims (P045) and subagent artefact references (P082). It differs from all three in where the error comes from. In those three the artefact was wrong when it was read, and reading the source on disk settles it. Here the ticket text was accurate when written and was falsified from outside by a later decision, so reading the ticket carefully is not enough. What has to be read is what changed after the ticket was written.

## Symptoms

A verification pass reads a ticket's close criterion, compares correct evidence against it, and reaches a conclusion the evidence does not support, because the criterion measures something a later decision redefined. Observed once, on P120, where the conclusion was a wrong reopen confirmed by the user.

## Workaround

When verifying a ticket, read the `amended-by` frontmatter of every ADR the ticket's Fix Strategy cites, and check whether any amending decision was ratified after the criterion was written. Where it was, re-read the criterion against the current regime before comparing evidence to it.

## Impact Assessment

- **Who is affected**: the internal maintainer, whose queue carries a ticket reopened on a wrong reading, and any AFK iteration that selects it.
- **Frequency**: once observed, on 2026-08-25 and confirmed 2026-08-28. The exposure is every ticket whose criterion depends on a decision that has been amended since.
- **Severity**: Minor. Problem-management tooling; recoverable from git; no reader reached.
- **Analytics**: none.

## Root Cause Analysis

### Investigation Tasks

- [ ] Investigate root cause
- [ ] Create reproduction test
- [ ] Decide where the check fires: at the Verification Queue read, at the `manage-problem` Known-Error-to-Verifying transition, or at `review-problems`

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P139, P170, P120

## Related

Captured via `/wr-itil:capture-problem` during the 2026-08-29 P120 iteration retrospective; expand at next investigation.

Serves JTBD-400 (Trust What the Loop Did While I Was Away), whose third desired outcome is that a verdict is grounded in the relationship it claims rather than in a string that resembles one. A criterion read against a superseded regime is exactly that failure: the number matched the criterion's shape but not its unit.

The hang-off-check subagent was not dispatched. The mechanical pre-filter at capture matched more than five open and verifying tickets on shared signals, which triggers the candidate-cap short-circuit, so the candidate list is recorded here for re-evaluation at the next `/wr-itil:review-problems` cluster pass. The two closest were read directly at capture rather than deferred:

- **P139** (Ratification flips frontmatter but nothing sweeps the prose asserting the prior unconfirmed state): the nearest sibling, and the same family. Its join is a prose oversight claim against the `human-oversight:` frontmatter it describes, inside the artefacts that carry the claim. This one's join is a ticket's criterion against the ratification dates of decisions amending the ADRs the ticket depends on. Different detector, different inputs; kept separate.
- **P170** (A verification cell can assert verified while its own evidence text says the fix failed): its description cites P120's cell for the same wrong reading this ticket is opened against, so the two share the observed episode and differ only in mechanism. That is what makes the separation load-bearing rather than incidental. P170 is a cell contradicting its own adjacent text, which a single predicate over one column settles. Here the criterion and the evidence agree with each other and both are internally consistent; what is stale is the regime the criterion assumed.

Other pre-filter candidates, unread at capture: P056, P069, P077, P127, P133, P135, P156, P159, P162, P165, P172, P050, P094, P140.
