# Problem 159: A self-produced measurement is trusted without checking, so a broken measurement can kill a correct fix

**Status**: Open
**Reported**: 2026-08-23
**Priority**: 9 (Medium), Impact: 3 x Likelihood: 3, derived at capture from the description per Step 4a. Impact 3 on the calibration P152 and P154 set for defects that reach artefacts and decisions rather than break a running system: the output is a wrong design call, and in the observed case it would have dropped a check the evidence named. Likelihood 3 because a measurement is produced in most design iterations and nothing checks any of them, but only one instance is on record so far.
**Origin**: internal
**Effort**: S, derived at capture: the fix is a discipline statement in the existing verify-before-asserting surfaces, which already exist and already carry four sibling rules. Comparable to the P032 and P103 fixes, both of which were prose edits to those same surfaces.

## Description

The verify-before-asserting family covers four surfaces: a ticket's prose (P032), a bounded search that found nothing (P103), a Fix Strategy's upstream-placement claim (P045), and an artefact reference cited in a governance-subagent verdict (P082). All four are about trusting somebody else's output. None covers a number the agent produced itself, minutes ago, and none of the surfaces that state the rule mention measurement at all.

Observed on the 2026-08-23 P154 iteration. The fix needed a deterministic check for a joined-paragraph defect, which the live witness in the 2026-08-17 reviews ledger records as introduced twice by remediation edits in one edition, the second time immediately after a check was written for the first. Before adding it, the agent measured the proposed predicate against all 18 published brief bodies. It reported 43 hits, which reads as a convention the corpus does not share, so the check was dropped and recorded as declined with the measurement as the stated reason.

The measurement was wrong. The predicate tested for a list marker at the start of the line, so every indented list item counted as prose. Corrected, the same check fires zero times across the same 18 files, and it shipped.

Two things about the failure are worth separating. The number was never checked against the thing it was counting: a single `head` of the hits would have shown `- On July 31 the Landgericht ...` and named the bug in seconds. And the number was believed over a recorded witness that said the opposite. The reviewer that forced the re-look did not re-run anything; it simply pointed out that the ledger records this defect twice while the check being kept in its place had never fired at all.

The general shape: a self-produced measurement arrives with none of the provenance cues that make a citation feel checkable. There is no author to be sceptical of and no artefact to open, so it reads as observation rather than as output. That is what makes it harder to doubt than a ticket's prose, not easier.

## Symptoms

- A design decision is justified by a count the agent produced and no sample of the underlying hits is ever read.
- A measurement contradicts a recorded witness, and the measurement wins without either being re-examined.
- A correct fix is dropped, or a wrong one adopted, and the stated reason is a number.
- A reviewer overturns the decision on reasoning alone, without re-running anything, which is the tell that the number was never the evidence it was taken for.

## Workaround

When a measurement is about to carry a decision, print a few of the hits and read them before believing the count. When it contradicts something already on the record, treat the measurement as the hypothesis rather than the record. Both depend on the agent remembering, which is the defect.

## Impact Assessment

- **Who is affected**: the author, who gets a design decision justified by a number nobody checked, and any reader of the resulting artefact.
- **Frequency**: one instance on record, 2026-08-23. Measurements are produced in most design iterations, so the exposure is broad even though the observed count is one.
- **Severity**: in the observed case the wrong call was caught by a reviewer before the commit, so nothing shipped. The counterfactual is a check the evidence named being permanently dropped with a plausible reason recorded against it, which is the kind of error that never gets revisited.
- **Analytics**: not instrumented.

## Root Cause Analysis

The rule this repo already enforces is stated four times, and every statement of it is framed as trusting someone else. The CLAUDE.md block opens each surface with a source of external prose: a ticket body, a Fix Strategy, a subagent verdict, a bounded search. An agent applying that rule faithfully has no reason to apply it to arithmetic it just did, because the rule as written is about provenance and its own output has none.

### Investigation Tasks

- [ ] Investigate root cause
- [ ] Create reproduction test
- [ ] Decide whether this is a fifth surface on the existing rule or a distinct rule. The four existing surfaces share a shape (someone else's output) that this one does not, so a fifth bullet may read as a category error where a separate sentence would not.
- [ ] Check whether the discipline can be made cheaper than remembering. Printing a sample of hits alongside a count is a one-line habit; whether it can be prompted rather than remembered is the open question.
- [ ] Test P032 as the parent. It is closed, its scope is claims about project state, and a self-produced measurement is arguably one. The counter-argument is that P032 and P103 are both about asserting without looking, while this is about looking and mis-reading, and the fix for mis-reading is not the fix for not-looking.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P032, P045, P082, P103, P154, P156

## Related

Captured via `/wr-itil:capture-problem` during the P154 iteration retro, as a recurring class-of-behaviour observation.

The hang-off dispatch did not run: the description cites no ADR, RFC, skill or file path, so the mechanical pre-filter extracted no signals and the sub-step 2b short-circuit applied. The title-only duplicate grep matched 21 files on the keywords measurement, verify and evidence; the only substantive relative among them is P032 (assistant writes claims about project state without verifying first), which is closed and is tested as a possible parent in the investigation tasks above rather than assumed to be one.

P156 (briefing absence claims are never re-verified) is the nearest open sibling: both are about a statement that was true when written, or looked true when produced, being carried forward without re-checking. They differ in what rots. P156's claim decays because the world moves; this one was wrong at the moment it was made.
