# Problem 171: Killing the orchestrator wrapper orphans the iter subprocess, which keeps write access with no supervisor

**Status**: Open
**Reported**: 2026-08-26
**Priority**: 12 (High), Impact: 4 x Likelihood: 3, derived at capture. Impact is 4 because an orphan holds full write access to the repository with every verification surface detached: it can commit, and no orchestrator remains to read its ITERATION_SUMMARY, run the Step 6.75 dirty-tree check, or run the P335 over-claim verifier. A commit that lands this way is unattributable to any session. Not 5 because the commit is recoverable from git and nothing reaches a reader. Likelihood is 3 because it needs an interrupted loop, but interruption is ordinary (a user changing their mind mid-loop) and it fired twice in one session.

**Origin**: internal
**Effort**: S, derived at capture. A trap in the dispatch wrapper, or a documented cleanup step. The fix site is the `wr-itil` plugin.

## Description

The AFK loop dispatches each iteration as a backgrounded `claude -p` subprocess supervised by a poll loop. Killing the supervising wrapper does not kill the subprocess. It keeps running with full repository write access and nothing watching it.

Observed twice on 2026-08-26 in the same session, both times after the user stopped the loop.

The second occurrence was measured. After the wrapper was killed, `pgrep -f 'claude -p'` still returned a live process, `ps` reported 28 minutes elapsed, and it was still holding the plugin-dir arguments from the dispatch. It was terminated by hand with SIGTERM; the tree was clean afterwards and HEAD unchanged, so it had not yet committed.

Every verification surface the orchestrator provides is detached from an orphan:

- Its `ITERATION_SUMMARY` is written to a file the dead wrapper was going to read. Nobody reads it.
- Step 6.75's `git status --porcelain` check never runs, so a dirty tree it leaves is never classified.
- The P335 verify-iter-claims check never runs, so an over-claiming commit message is never compared against disk.
- The Step 6.5 release-cadence check never runs, so anything it commits sits unpushed and unscored.

The failure this produces is worse than a lost iteration. If the orphan commits, the next loop's Step 0 finds a commit no session accounts for, which routes to the Branch 3 session-continuity halt with a report that cannot explain itself. If it commits while a later session is working, the two interleave in one tree.

## Symptoms

- `pgrep -f 'claude -p'` returns a live process after the orchestrator loop has been stopped.
- `ps -o etime` on that process shows it outliving the wrapper by minutes or longer.
- A commit appears with no orchestrator iteration summary accounting for it.
- The next loop's Step 0 Branch 3 detection reports prior-session state that no record explains.

## Workaround

After stopping a loop, check for and terminate orphans:

```
pgrep -f 'claude -p' && kill -TERM $(pgrep -f 'claude -p')
```

Confirmed working: SIGTERM terminated the 28-minute orphan on the first signal, no escalation to SIGKILL needed, tree clean afterwards.

## Impact Assessment

- **Who is affected**: anyone who interrupts an AFK loop. No reader or visitor path.
- **Frequency**: twice in one session, once per interruption.
- **Severity**: an unsupervised writer in the repository. The whole orchestrator design rests on the wrapper observing the subprocess and verifying its work before the next dispatch; an orphan removes the observer and keeps the writer.
- **Analytics**: not instrumented.

## Root Cause Analysis

### Preliminary Hypothesis

The dispatch backgrounds the subprocess with `&` and supervises it from a `while kill -0` poll loop. The subprocess is a child of the shell, not of the poll loop, and nothing installs a trap. When the wrapper is killed the child is reparented and survives.

The SKILL's failure taxonomy is thorough about subprocesses that die badly and silent about one that outlives its supervisor. P121 covers the idle subprocess the orchestrator must SIGTERM. P147 covers the SIGTERM that loses metadata. P261 and P214 cover `is_error: true` with and without staged work. P370 covers a background task that dies at its own turn boundary. Every one of those assumes the orchestrator is alive to classify the outcome. This is the case where it is not.

### An evidence note on the first occurrence, recorded because it was reported wrongly

After the first kill, a `pgrep -f 'claude -p' | wc -l` returned 0 and that was reported as no orphan. The second kill, checked the same way, returned 1. The most likely reading is that the first check raced a subprocess that had not yet been exec'd, or matched before the process's command line was set. So the first occurrence was probably also an orphan and the all-clear was a race, not an observation. A single `pgrep` at one instant is not evidence of absence; the check needs a settle delay or a repeat.

### Investigation Tasks

- [ ] Determine whether a `trap 'kill $ITER_PID' EXIT INT TERM` in the dispatch wrapper survives the kill shape the harness uses, or whether the wrapper dies un-trappably.
- [ ] If a trap cannot be relied on, decide the alternative: a process group kill, or a documented post-interrupt cleanup step in the SKILL.
- [ ] Establish whether an orphan that commits is detectable after the fact, and what Step 0's Branch 3 report should say about it.
- [ ] Confirm whether the first occurrence was an orphan, by reproducing the kill and sampling `pgrep` repeatedly rather than once.
- [ ] Create a reproduction: dispatch an iter, kill the wrapper, assert no `claude -p` survives.

## Fix Strategy

Make the subprocess die with its supervisor, or make the SKILL say what to do when it does not.

A trap in the dispatch wrapper is the direct fix and needs testing against the actual kill shape, because a wrapper killed with SIGKILL runs no trap. Killing the whole process group is more robust and more blunt. Whichever lands, the SKILL should also carry the manual cleanup as a documented step, because an operator who interrupts a loop is exactly the person who will not know to look.

The detection half deserves separate thought. The orchestrator cannot detect this, because the orchestrator is the thing that died. The check belongs at the start of the next loop: Step 0's Branch 3 signal set should include a live `claude -p` process, which today it does not enumerate. That turns an invisible orphan into a named prior-session signal.

Write the reproduction before the fix, and sample `pgrep` more than once, since the first observation in this ticket was a false negative from a single sample.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: fix lands upstream in `wr-itil`
- **Composes with**: P169, P121, P147, P261, P214, P370

## Related

Found on 2026-08-26 across two interrupted loops in one session, the second measured at 28 minutes of orphaned runtime before manual termination.

- **P121**, **P147**, **P261**, **P214** and **P370** are the existing subprocess-failure taxonomy, and every one of them assumes a live orchestrator classifying the outcome. This is the complement: the subprocess is healthy and the supervisor is gone. It belongs alongside them rather than inside any of them.
- **P169** is the sibling found in the same loop, and both share a shape: the orchestrator's shell mechanics are specified in prose and not tested against the environment they run in. One assumes bash, the other assumes a child dies with its parent.
- Step 0's Branch 3 detection enumerates five session-continuity signals and a live iter subprocess is not among them. That is the natural home for the detection half of this fix.
