# Problem 164: A gate finding applied while another gate is reading invalidates that gate's verdict

**Status**: Open
**Reported**: 2026-08-25
**Priority**: 6 (Medium), Impact: 3 x Likelihood: 2, derived at capture. Impact is 3 because the cost is a wasted gate round and a verdict that cannot be counted, which is pipeline disruption rather than anything reaching a reader; the freeze discipline means the stale verdict is detectable rather than silently trusted. Likelihood is 2 because it needs concurrent gates AND a blocking finding arriving mid-read, which is common in a long finalise and rare in a short one.

**Origin**: internal
**Effort**: S, derived at capture. One paragraph in the remediation loop's step, plus the round-close instruction that already exists for freezing.

## Description

The newsletter pipeline freezes the brief under a digest and passes that digest to every gate, so a gate reading superseded text says so rather than silently scoring the wrong version. That part works. What the SKILL does not say is what to do when gates run concurrently and one of them returns a blocking finding while another is still reading.

The obvious move is to fix the blocking finding immediately. That moves the file under the gate still reading, and its verdict then applies to text that no longer exists.

Observed twice on 2026-08-24 during The Shift Issue 19 finalise, both times for the same reason, and both times by an operator who had explicitly said they would not let it happen again after the first.

1. The voice gate returned FAIL with four blocking findings while the skeptic was mid-read at freeze `22950a82`. Acting on the voice FAIL moved the file to `b6ebafdf`. The skeptic's verdict, when it arrived, was against text that had been superseded, and it could not be counted.
2. The same shape recurred within the hour on a later freeze.

Neither break was ignorance of the rule. The freeze discipline was in force, the digests were being computed and handed to each gate (md5, computed by hand for this purpose, which is a different thing from ADR-047's `scored-digest` custody line and does not contradict P165's finding that none of those were written), and the operator had stated the rule out loud. What defeated it was that a blocking finding feels urgent, and the cost of waiting is invisible while the cost of sitting on a known defect is vivid.

## Symptoms

- A gate reports a digest at the start of its read that differs from the digest at the end, or reviews text whose quoted passages no longer exist on disk.
- A verdict arrives that cannot be counted, so the round is spent without producing a gate result.
- The operator reports the break themselves, after the fact, having intended not to.

## Workaround

Queue. Collect findings from every gate in flight, apply them in one pass, re-freeze, re-dispatch. Costs one round.

## Impact Assessment

- **Who is affected**: the finalise loop and its round budget. Nothing reaches a reader; the freeze discipline is what makes the stale verdict visible instead of silently trusted.
- **Frequency**: twice in one edition, in the two rounds where gates were dispatched concurrently and a blocking finding landed mid-read.
- **Severity**: one wasted gate round per occurrence, plus the risk that an operator counts the stale verdict without noticing. In the observed cases the staleness was caught, because the gates report their digests.
- **Analytics**: not instrumented.

## Root Cause Analysis

### Preliminary Hypothesis

The freeze contract is written for the sequential case. It tells the drafter to compute a digest, hand it to each gate, and have each gate confirm what it read. It says nothing about the interval between dispatching several gates and collecting all their results, which is exactly the window where a blocking finding creates pressure to edit.

The rule as written is a property of the artefact (it is frozen). What is missing is a property of the operator's behaviour (do not edit until every dispatched gate has reported). Those are different obligations and only the first is codified.

### Investigation Tasks

- [ ] Investigate root cause
- [ ] Create reproduction test
- [ ] Decide whether the fix is prose in the remediation loop or a mechanical check

## Fix Strategy

One paragraph in the remediation loop step, stating that a freeze holds until every dispatched gate has reported, and that findings from concurrent gates are collected and applied in one pass before re-freezing. That is the whole rule and it is cheap to state.

Worth considering whether it can be made mechanical rather than prose, because this edition's own evidence is that stating a rule out loud does not make an operator follow it under pressure. A candidate: have the round-close lint compare the current digest against the digest recorded in the most recent gate verdict block in the reviews sibling, and fail when they differ with any gate still unreported. That reuses the digest the gates already record, so it needs no new bookkeeping. It shares its shape with P162's requirement that a sweep produce a counted output rather than a claim, and with P163's requirement that a persistence step read back what it wrote: in all three the defect is a discipline the operator is trusted to hold, and the fix is a check that does not depend on them holding it.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P099, P154, P162

## Related

Captured via the session retrospective on 2026-08-25, from The Shift Issue 19 finalise the previous day.

- **P099** (post-finalise edits do not re-run the full gate set) is the nearest sibling and is distinct. P099 is about edits made AFTER a gate set completes, where the remedy is to re-run. This is about edits made WHILE gates are still reading, where re-running is what you are forced into and the remedy is to wait. Both are freeze-adjacent; neither covers the other.
- **P154** (remediation edits are never independently verified) shares the remediation-loop surface and the general shape of a discipline nobody checks.
- **P162** (a claim corrected at one site survives at its sibling sites) is the same family at the level of the artefact rather than the process: both are cases where the operator's stated intention is not a control.
