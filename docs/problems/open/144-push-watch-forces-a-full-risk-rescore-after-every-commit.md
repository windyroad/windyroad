# Problem 144: push:watch forces a full risk rescore after every commit

**Status**: Open
**Reported**: 2026-08-09
**Priority**: 10 (High). Impact: 2 x Likelihood: 5, derived at capture from the description per Step 4a
**Origin**: internal
**Effort**: M, derived at capture per Step 4a
**WSJF**: 5.0 = (10 x 1.0) / 2

## Description

`npm run push:watch` refuses to run with `Push blocked: Pipeline state drift: working tree changed since the last push risk assessment. Delegate to wr-risk-scorer:pipeline ... to rescore against the current state.` after any change to the tree, including a commit the previous rescore already covered. Each refusal costs a full synchronous subagent rescore before the push can proceed.

Observed three times in one session on 2026-08-09, at roughly 2 to 10 minutes of subagent work each:

1. After landing `13fd90f` (a ticket capture) and `b4fd273` (the Issue 17 newsletter prep artefacts).
2. After landing `4b149a7` (the changesets action bump) and `c939fa1` (a ticket capture).
3. After landing `16d988c` (the RFC-006 ratification and its ticket capture).

The drift check itself is correct and worth keeping: the risk of pushing a state nobody scored is exactly what it guards. The friction is that the granularity is the whole working tree, so a commit that lands documentation the previous scorer already read still counts as drift.

The cost is not just wall-clock. Each rescore is a fresh-context subagent that re-reads the policy, the changesets directory, the workflows and the diff, and each one emits a full report. In a session that lands several commits before pushing, most of that work is re-derivation of an answer that did not change.

Worth noting what is NOT being proposed: weakening the gate. This is intentional hygiene of the same family as the dependency-freshness gate, and engineering around it would be the wrong fix. The question is whether the drift predicate can be made proportionate.

### Mechanism identified 2026-08-30

The drift check is not comparing "has the tree changed since the score" in the loose sense. `risk-gate.sh` compares a stored `state-hash` against `pipeline-state.sh --hash-inputs`, and those inputs are the `git diff HEAD --raw` lines, which carry the INDEX blob hash per path. Staging a file therefore changes its raw line (the worktree-only sentinel `000000` becomes the real blob hash) even though no byte of content changed. So `git add` ALONE invalidates a score.

Observed at the commit surface, not push, in the 2026-08-30 deps-remediation iteration: a scoring pass ran against a tree, then `git add` of one already-modified file was enough to produce `Pipeline state drift: working tree changed since the last commit risk assessment` and force a full rescore. The correct sequence is stage everything first, score second, commit immediately, touching nothing in between. That ordering is not stated on any of the gate's four suggested remediations, all of which say "stage files with git add, then delegate to the scorer" without noting that a later `git add` re-invalidates.

A second, more expensive instance of the same class in that session: the gate's marker is only written by a FRESH `Agent` spawn of `wr-risk-scorer:pipeline`. Resuming an existing scorer via `SendMessage` returns a complete analysis with a `RISK_SCORES` line and a `RISK_BYPASS` directive in its text, but writes no `.risk-reports/` file and updates no marker, so the gate keeps reading the stale score. Three consecutive resumed passes produced correct analysis and zero gate movement before a fresh `Agent` call was tried. This is the same fresh-synchronous-Agent constraint the briefing already records for the six `PostToolUse` governance markers; the risk gate belongs on that list.

## Symptoms

- `npm run push:watch` exits with `Pipeline state drift: working tree changed since the last push risk assessment` after any commit, including one whose content the prior assessment covered.
- A multi-commit session pays one full risk rescore per push attempt.

## Workaround

Batch commits and push once at the end, where the ADR-014 commit grain allows it. This reduces the count but does not remove it, because the first push after any commit still triggers a rescore.

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: every push that follows a commit, which is the normal case
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [x] ~~Investigate root cause, including exactly what the drift predicate hashes or compares~~ Answered 2026-08-30: it hashes the `git diff HEAD --raw` lines, which carry the index blob hash per path, so staging alone changes the hash. Status stays Open rather than moving to Known Error because the mechanism is identified but no fix is chosen: the drift check is correct to notice a staging change, and whether the right answer is a narrower hash input, a documented stage-then-score ordering, or nothing at all has not been decided. The transition is `/wr-itil:review-problems`'s call, not this retro's.
- [ ] Create reproduction test
- [ ] Decide whether the predicate can be made proportionate without weakening the guarantee. Candidates: scope the comparison to paths the prior assessment actually read; treat a commit whose diff is a subset of the scored state as covered; carry the prior score forward with an explicit delta assessment rather than a full rescore
- [ ] Check whether the rescore prompt can be shortened when the delta is small, rather than re-deriving the whole pipeline report
- [ ] Confirm the gate is not weakened by any change: pushing an unscored state must stay impossible

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P143 (CI smoke test has no retry), same release path, distinct mechanism. P145 (the risk register is empty so every scorer run regenerates from scratch), which compounds the cost of each rescore this ticket triggers.

## Related

Captured via `/wr-itil:capture-problem` during the 2026-08-09 session retrospective.
