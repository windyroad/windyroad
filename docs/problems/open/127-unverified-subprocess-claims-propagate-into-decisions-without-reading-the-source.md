# Problem 127: Unverified subprocess claims propagate into decisions without reading the source

**Status**: Open
**Reported**: 2026-08-07
**Priority**: 15 (High), Impact: 3 x Likelihood: 5. Impact is 3 because the reachable consequence is a governance artefact changed on a false premise, which misdirects future work and burns iteration budget without reaching readers. Likelihood is 5 (re-rated 2026-08-08) because it recurred twice more during the P122 build, taking the count to six. Both new instances were load-bearing: a claim that two upstream ADRs still carried a rejected stance, made by propagating a third ADR's stale note without opening either file; and a claim that no published edition would fire a new lint check, made after testing one edition. Six instances across two sessions is certain, not likely.
**Origin**: internal
**Effort**: M. The verify-before-asserting family already has four tickets and a memory file, and none of them stopped this instance, so the fix is not another restatement of the rule. It needs a mechanism, and choosing one is the work.
**WSJF**: 7.5 = (15 x 1.0) / 2 (arithmetic corrected 2026-08-08: the prior line stated 12.0 but 12 x 1.0 / 2 is 6.0; the divisor had not been applied)

## Description

An orchestrator repeats a factual claim produced by a subagent or subprocess, without reading the artefact the claim is about, and the claim then becomes load-bearing for a decision.

**Evidence, 2026-08-07.** A `/wr-itil:work-problems` iteration summary for P120 asserted:

> "RISK-POLICY.md places severity 5 in the Medium band against a '< 5' commit appetite, so any residual of impact 5 x likelihood 1 can never clear the gate no matter how many controls are added. Newsletter-body changes are impact 5 by the policy's own table."

The orchestrator repeated this roughly six times across the session: in loop-end summaries, in the queued outstanding-questions file, and finally as the stated reason in an `AskUserQuestion` that asked Tom to change the risk appetite. Tom answered the question, then asked how it had ended up at impact 5. Reading the table took one command and showed the claim was false: impact 5 is defined as a content failure **reaching** LinkedIn readers, so a commit to an unpublished draft is impact 4 at most and usually 3. The scorer reports from 2026-08-05 to 2026-08-07 rate newsletter work at 3 and 4, consistent with the table and inconsistent with the claim.

The policy amendment that followed (`fea3cec`) is sound on other grounds and does not rest on the false premise, and it also fixed a real defect the investigation surfaced (the appetite was not bound to the enforcing gate at all). But the premise put to the user was wrong, and it was wrong for the whole session before anyone checked.

## Root cause

**This is a P032 recurrence, not a new scope.** An earlier draft of this ticket claimed the four existing family members left a gap that this instance fell through, on the reasoning that P032 "covers ticket prose" while this was a claim from a subprocess. That reasoning was wrong, and it was wrong in the way this ticket is about: it was asserted without reading P032. The correction was caught by the risk scorer at the commit gate.

P032's actual title is "Assistant writes ticket bodies **and claims about project state** without verifying current code/config first". Its rule, as shipped into CLAUDE.md, is provenance-independent: *"Before writing a ticket body, framing a problem, or asserting how a hook / skill / gate currently behaves, READ the actual file from disk."* Two of its three cited instances are not ticket prose at all. The claim in this instance was that newsletter commits are structurally un-passable under the commit gate, which is an assertion about how a gate behaves, verbatim inside P032's trigger surface. P103 drew this same boundary and drew it the other way: *"In the P032 class, the truth IS in a file the assistant skipped reading; 'read the file' closes the gap."* One command falsified this claim, so it is that class.

**What is genuinely new is not a claim surface, it is evidence about the fix mechanism.** All five recorded instances were met by adding or restating a prose rule. There are now five such rules, all in the CLAUDE.md preamble, all in context throughout this session, and two of them (P082, P103) were closed on evidence **hours before this instance**. None fired. A prose rule is addressed to a reader who has already decided not to look, so it cannot fire on the occasion of its own violation. That is the finding this ticket carries and the others do not.

The second half of the finding is a coverage asymmetry. The risk scorer caught two of the three instances in this session and caught this ticket's own bad reasoning, because it reads files independently and challenges claims in a diff. It did not catch the original claim, which never appeared in a diff: it lived in conversational prose and a queued question. Gated surfaces are checked; user-facing prose is not.

## Symptoms

A claim about a file's contents circulates through summaries, queued questions and user-facing prose, accumulating apparent authority through repetition, until someone asks a question that requires opening the file. The orchestrator can usually then falsify its own claim in one command.

## Workaround

Read the file before repeating a claim about its contents, particularly before putting the claim to the user as the reason for a decision.

## Impact Assessment

- **Who is affected**: Tom, who was asked to make a governance decision on a false premise and had to catch it himself; future readers of any artefact that carries the propagated claim.
- **Frequency**: fourth recorded instance in this repo, third in one session. The other two on 2026-08-07 were an unverified "there is no local P055" (caught by the risk scorer) and a claimed control delegated to a section-15.6 table row that did not exist (caught by the risk scorer).
- **Severity**: no reader-facing consequence. The cost is a wrong premise reaching a user decision, plus the iteration budget spent building on it.
- **Analytics**: none.

## Root Cause Analysis

### Investigation Tasks

- [ ] Decide whether the fix is a sixth prose rule or a mechanism. The evidence argues against prose: five rules exist, two were closed as fixed hours before this instance, and none fired. Options worth costing: a claim-citation convention (any factual claim about a file's contents carries the path and the line, so an unread claim is visibly unciteable); a check at the `AskUserQuestion` boundary specifically, since that is where a wrong premise becomes a user decision; or accepting the class and relying on the scorers, which caught two of the three instances this session.
- [ ] Establish why the risk scorer caught two instances and missed this one. It reads files independently and challenges claims, which is exactly the control that worked twice. The difference may be that the third claim never appeared in a diff it was scoring, only in conversational prose and a queued question. If so, the gap is that user-facing prose is ungated, which is a much larger finding than this ticket.
- [ ] Check whether the family should be consolidated. P032, P045, P082, P103 and this one are one behaviour recorded five times. The drafting of this very ticket shows the cost of the split: an author reaching for the right family member mis-stated P032's scope in order to justify a fifth. One ticket with an explicit scope list may be more useful than five slices.
- [ ] Consider whether iteration summaries deserve different trust than review verdicts. P082 established the asymmetric trust model for governance-subagent verdicts: the subagent need not self-verify, the consumer verifies before propagating. An iteration summary is the same shape and is not covered.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P032, P045, P082, P103

## Related

- **P032** (`docs/problems/closed/032-assistant-writes-claims-about-project-state-without-verifying-first.md`): the original, and the class this instance belongs to. Its scope is claims about project state, not ticket prose alone.
- **P045**: Fix-Strategy upstream-placement claims.
- **P082** (`docs/problems/closed/082-subagent-outputs-include-fabricated-references-to-artefacts-not-on-disk.md`): artefact references in governance-subagent verdicts. Nearest neighbour, and the gap is existence-versus-content: P082 asks whether the cited thing exists, not whether the claim about its contents is true. Closed on evidence 2026-08-07, hours before this instance.
- **P103** (`docs/problems/closed/103-assistant-asserts-negative-project-state-claims-from-incomplete-search.md`): negative and absence claims. Also closed 2026-08-07. The "there is no local P055" instance the same day is arguably a recurrence of it.
- **Memory**: `feedback_verify_subagent_references_before_propagating.md` and `feedback_verify_project_state_before_writing.md` both carry this family and both were in context throughout.
- Evidence: the false claim reached `fea3cec`'s decision surface; the correction is recorded in RISK-POLICY.md Amendment History and in that commit's message.
- Captured 2026-08-07 after Tom asked how the impact rating had ended up at 5.
