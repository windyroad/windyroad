# Problem 166: A governance surface that silently degrades to a subset of its specification reads as a clean run

**Status**: Open
**Reported**: 2026-08-25
**Priority**: 12 (High), Impact: 3 x Likelihood: 4, derived at capture. Impact is 3 because the loss is governance coverage rather than anything reaching a reader: prescribed checks do not run and the operator is not told, so a decision gets made on a thinner basis than the specification promises. Likelihood is 4 because the version skew that causes it is already present and nothing detects it.

**Origin**: internal
**Effort**: S, derived at capture. One coverage declaration emitted by the skill that already knows what it prescribed.

## Description

The session retrospective ran on 2026-08-25 against a plugin version whose PATH shim set does not carry three of the detectors its own SKILL prescribes. The retro completed, produced findings, and reported nothing about the gap. A reader of that output cannot tell it apart from a session where those three checks ran and found nothing.

Verified on disk 2026-08-25. PATH resolves `wr-retrospective` to 0.27.0 while 0.27.4 is present in the plugin cache. The three unreachable checks are the ask-hygiene trail, the tickets-deferred-cause check, and the Tier 3 briefing-budget pass. The budget pass was computed by hand and its result recorded; the other two were skipped with nothing written down.

The failure is that degradation makes the output *shorter*, not wrong. A retro missing three detectors emits fewer findings, and fewer findings reads as a cleaner session. There is no error, no warning, and no line saying which checks were unavailable.

## Symptoms

- A retro summary is shorter than the SKILL specifies with no statement of what was not run.
- A prescribed detector is absent from PATH and nothing surfaces its absence.
- A reader takes reduced coverage for a clean result.

## Workaround

Before trusting a retro, compare the SKILL's prescribed detector list against `command -v` for each shim name. Manual, and nobody will remember.

## Impact Assessment

- **Who is affected**: anyone reading a retro summary, including the next session, which loads the briefing the retro curated. No reader or visitor path.
- **Frequency**: every retro run at a version whose shim set is behind its SKILL. Currently that is every run.
- **Severity**: three prescribed governance checks are not running and their absence is invisible. The retro is the surface that exists to catch drift, and it was degraded by exactly the drift it exists to catch.
- **Analytics**: not instrumented.

## Root Cause Analysis

### Preliminary Hypothesis

The SKILL prescribes detectors by name. Nothing reconciles that list against what is callable at run time, and no step requires the output to declare its own coverage. The skill knows what it asked for and knows what it got; it just never subtracts one from the other.

The version skew is the trigger rather than the cause. Fix the skew and this recurs the next time a SKILL gains a detector before the shim set does, which is the normal release order.

### Investigation Tasks

- [ ] Enumerate the prescribed detector names from the SKILL rather than by hand, so the list cannot drift from what the steps actually call.
- [ ] Decide where the coverage declaration goes: the retro summary body, a machine-readable line, or both.
- [ ] Create a reproduction with a deliberately-absent shim and confirm the declaration names it.
- [ ] Confirm the check goes red against the 2026-08-25 retro as it stands before shipping it.

## Fix Strategy

Have the retro declare its own coverage: which prescribed detectors resolved, which did not, and what was computed by hand instead. The skill already knows all three, so this is a subtraction and a paragraph, not new machinery.

Say it in the summary the operator actually reads, not only in a log. The whole defect is that the gap is invisible at the surface where the judgement gets made.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P165, P156, P130, P162

## Related

Found on 2026-08-25 during the retro itself, when three prescribed steps could not be run and the summary was about to go out without saying so.

- **P165** (the stale-verdict check stands down on the absence it exists to catch) is the same shape one surface over, and the pairing is what makes this a class rather than an incident. Both are controls that report "nothing to check" where the honest report is "I could not check". Two independent instances in one session.
- **P156** (briefing absence claims are never re-verified) is adjacent and distinct. That ticket is about a claim whose truth value changed underneath it; this is about a control that silently runs a subset of itself. Different failure locus, different fix: periodic re-verification does not make a degraded run announce itself.
- **P130** (two run-retro detectors assume a packages/ monorepo and produce nothing in a consumer repo) is the closest sibling and covers a narrower case: detectors that resolve but find nothing because the repo shape is wrong. This covers detectors that do not resolve at all. The coverage declaration would serve both.
- **P162** (a claim corrected at one site survives at its sibling sites) shares the general form, which is that a self-reported result is not a counted output.
