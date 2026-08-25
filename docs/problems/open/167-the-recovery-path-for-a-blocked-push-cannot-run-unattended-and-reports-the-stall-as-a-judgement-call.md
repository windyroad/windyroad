# Problem 167: The recovery path for a blocked push cannot run unattended and reports the stall as a judgement call

**Status**: Open
**Reported**: 2026-08-25
**Priority**: 8 (Medium), Impact: 2 x Likelihood: 4, derived at capture. Impact is 2 because the exposure is the maintainer's push path and its audit trail, not anything reaching a reader or a visitor; the work is recoverable by re-running with a terminal attached. Likelihood is 4 because it fires on every non-interactive invocation, nothing detects it, and the message it prints on the way out actively discourages the retry that would fix it.

**Origin**: internal
**Effort**: S, derived at capture. One flag on one line, plus narrowing a message that asserts a cause it did not test.
**WSJF**: 8.0 = (8 x 1.0) / 1

## Description

`npm run push:watch` refuses to push when dependencies are stale and names `npm run fix:deps` as the recovery. That recovery cannot run without a terminal, and when it cannot, it exits 0 having done nothing and blames the dependencies.

Observed on 2026-08-25 and reproduced the same session. Verified on disk.

`scripts/fix-deps.sh` line 141 calls `npx --no-install dry-aged-deps --update`, which prompts `Update package.json? [y/N]`. With no terminal attached, the prompt takes its default of No, the tool applies nothing, and `--update` still exits 0. Control reaches lines 186 to 187, which print:

```
No manifest changes resulted from --update (remaining updates are still maturing or not auto-applicable).
Nothing to commit. If the pre-push gate still fails, the stale deps need a manual major-version review.
```

Both sentences are false in this case, and they are false in the reassuring direction. There was an available, auto-applicable update. Re-running the identical command with `y` supplied on stdin applied `dry-aged-deps` 2.14.0 to 2.17.1, passed the lockfile shape scan, lint, the test suite and the build, and committed at `032c4354`. Same command, same repository state, different answer to one prompt, opposite outcome. The message attributes to dependency maturity a stall that was entirely about stdin.

The sibling script already knows the answer. `scripts/push-watch.sh` line 224 calls the same tool as `npx dry-aged-deps --update --yes`, and the tool's own help documents `-y, --yes  Skip confirmation prompts (assume yes)`. So the two scripts call one tool two ways, and the one that is documented as the recovery path for the other is the one that cannot run unattended.

## Symptoms

- `npm run fix:deps` exits 0, commits nothing, and reports that remaining updates are maturing or need a manual major-version review.
- The next `push:watch` blocks on the same stale dependency, so the pair loops with no state change.
- An operator following the printed advice looks for a major-version decision that does not exist.

## Workaround

Supply the answer: `printf 'y\n' | npm run fix:deps`. Confirmed working.

## Impact Assessment

- **Who is affected**: anyone pushing when the freshness gate fires, and any unattended run that reaches the recovery path. No reader or visitor path.
- **Frequency**: every non-interactive invocation. One occurrence observed and one reproduction, both on 2026-08-25.
- **Severity**: the push path stalls with no way forward that the printed guidance leads to, and the audit trail records a dependency-maturity cause that was never tested. An unattended loop would alternate between a blocked push and a no-op recovery indefinitely, each step reporting success.
- **Analytics**: not instrumented.

## Root Cause Analysis

### Preliminary Hypothesis

Two defects, kept together because one flag fixes the first and the second is what made the first hard to see.

The interactive call is the mechanical cause. `--update` without `--yes` needs a terminal, and `fix:deps` is invoked from contexts that do not have one, including the recovery a blocked push prints.

The message is the reason it cost a cycle rather than a second. It infers a cause from a single observation, that the manifest did not change, and there are at least two paths to that observation: nothing was applicable, or nothing was answered. The code cannot distinguish them and picks the benign reading. This is the shape recorded twice already today in P165 and P166, where a step reports a condition it never tested.

### Investigation Tasks

- [ ] Confirm whether `--yes` is the right default for this script, or whether the interactive confirmation is deliberate for the wider update set that `fix:deps` applies beyond push:watch's auto-resolvable subset.
- [ ] If the confirmation is deliberate, decide how the script detects a missing terminal and fails loudly rather than taking the default.
- [ ] Narrow the lines 186 to 187 message to what the script actually knows.
- [ ] Create a reproduction with stdin closed and confirm it goes red before shipping the fix.

## Fix Strategy

Whichever way the confirmation question lands, the message has to stop asserting a cause it did not test. That half is not contingent on the first.

On the flag: if the confirmation exists to put a human in front of the wider update set, then a missing terminal is a reason to stop and say so, not a reason to answer for them. `[ -t 0 ]` is the whole test. If the confirmation is habit rather than design, `--yes` matches the sibling call and the two scripts stop disagreeing about one tool.

Write the check against the requirement rather than against today's behaviour, and confirm it fails against the current script before shipping it. The current script exits 0 on this path, so a test asserting exit 0 would pass against the defect.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P165, P166, P126, P163

## Related

Found on 2026-08-25 while pushing a retrospective commit. The freshness gate blocked the push correctly, the printed recovery ran and did nothing, and the discrepancy only surfaced because the same command was run again with an answer piped in.

- **P165** and **P166** are the same shape at two other surfaces: a control reporting a benign cause it never established. Three instances in one session makes this a class rather than three incidents, and the common fix is that a step's message may only state what its predicate tested.
- **P126** (the deps refresh chain creates a manifest desync and its own recovery cannot clear it) is the ticket whose fix routed this run to `fix:deps` in the first place, and that routing worked exactly as designed. This is about what happens after the routing lands, so it is downstream rather than a recurrence.
- **P163** (risk scorer report persistence writes empty files) shares the silent-success-on-a-persistence-step family, though the mechanism differs.
- The two-surfaces-disagree framing is worth carrying: `push-watch.sh` and `fix-deps.sh` call one tool two ways, and this repo has fixed that shape on the newsletter lint (P140) and the LinkedIn sign-off (P114) already.
