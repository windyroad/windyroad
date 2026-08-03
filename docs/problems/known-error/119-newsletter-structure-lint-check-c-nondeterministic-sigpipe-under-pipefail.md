# Problem 119: Newsletter structure lint check (c) is non-deterministic, SIGPIPE under pipefail yields spurious "missing Also worth noting" FAIL

**Status**: Known Error
**Reported**: 2026-08-03
**Priority**: 8 (Medium). Impact: 2 x Likelihood: 4, derived at capture. Impact is 2 rather than 3 because nothing is lost or mis-published: the save is blocked, not corrupted, and a re-run clears it. Likelihood is 4 because the gate runs several times per edition and fires roughly 1 run in 6 on current body lengths. WSJF 16.0 at Effort S, cf. P108 (Severity 6, Effort S, WSJF 12.0)
**Origin**: internal
**Effort**: S, derived at capture; one-line reshape plus an audit of sibling pipelines

## Description

`scripts/check-newsletter-structure.sh` check (c) intermittently reports `FAIL [c] <brief>: missing '### Also worth noting' section` against a brief that plainly contains the heading.

Observed during the `/wr-newsletter phase=prep` run for The Shift Issue 16 (2026-08-03). Six identical invocations against `src/newsletters/drafts/leader/2026-08-03/2026-08-03.prep.md` returned exit codes `0 0 0 1 0 0`. Six invocations against the shorter published `src/newsletters/published/leader/2026-07-27/2026-07-27.md` returned `0 0 0 0 0 0`. The flake rate scales with body length.

**Root cause.** Line 50 sets `set -uo pipefail`. Check (c) at line 167 reads:

```bash
if ! body_text | grep -qE '^### Also worth noting'; then
  fail c "$brief: missing '### Also worth noting' section"
fi
```

`body_text()` is `printf '%s\n' "$body" | cut -f2-`. `grep -q` exits immediately on its first match and closes the pipe. When the body is large enough that `printf` or `cut` still have buffered output to write, they take SIGPIPE and exit 141. Under `pipefail` the pipeline's status becomes 141, so `if !` evaluates true and the check reports the section missing even though it matched.

**Confirmation.** Under `bash -x` the timing shifts and the script passes every time. In the same traced run, `last_heading_ln=89` shows the script's own awk pass DID see `### Also worth noting` at line 89, while check (c) was reporting it absent. Replicating the exact `body_text | grep -qE` pipeline standalone under `set -o pipefail` matched 6 times out of 6, so the race needs the fuller script's I/O timing to surface.

**Impact.** This is the pre-save structural gate at `/wr-newsletter` step 16, so a structurally valid brief is intermittently blocked from saving. Worse than the block: the failure message names a content defect that does not exist, so the author goes looking for a missing section. During the Issue 16 run this consumed several turns of diagnosis before the non-determinism was noticed. Newsletter bodies have been growing edition to edition (Issue 16's body is roughly 4,300 words), so the flake rate is trending up.

Same failure class as P059 (`npm run push:watch` exits 141 SIGPIPE on successful push, closed), at a different call site. Worth checking whether other project scripts share the shape.

## Symptoms

- `bash scripts/check-newsletter-structure.sh <brief>` returns exit 1 with `FAIL [c] ... missing '### Also worth noting' section` on a brief that contains the heading.
- Re-running the identical command usually passes.
- Running under `bash -x` masks the failure entirely.
- Longer briefs fail more often than shorter ones.

## Workaround

Re-run the lint. It passes on most invocations. Confirm the heading is genuinely present with `grep -n '^### Also worth noting' <brief>` before treating a check (c) failure as real.

## Impact Assessment

- **Who is affected**: whoever runs `/wr-newsletter` (prep, finalise or full). The lint is the step 16 pre-save gate.
- **Frequency**: roughly 1 run in 6 on a 4,300-word body; 0 in 6 on a 2,600-word body. Rising as editions lengthen.
- **Severity**: blocks a valid save and misdirects the author to a non-existent content defect. Recoverable by re-running, but only once the author knows the gate is flaky.
- **Analytics**: none.

## Root Cause Analysis

**Root cause established 2026-08-04.** The mechanism is now confirmed both behaviourally and by construction. The earlier "not confirmed" caveat is superseded.

`set -uo pipefail` at line 50 combined with `grep -q` short-circuiting a pipeline whose upstream writer still holds buffered output makes the pipeline's exit status non-deterministic. `grep -q` exits on its first match and closes the read end; the upstream `printf '%s\n' "$body" | cut -f2-` then takes SIGPIPE and exits 141, and `pipefail` promotes that to the pipeline status, so `if !` reports the section missing even though it matched.

**What closed the gap.** The ticket previously recorded that a standalone replication matched 6 times out of 6 and therefore did NOT reproduce. That standalone attempt was under-specified in two ways, both identified when the regression test was written:

1. The padded body was roughly 24KB, under the 64KB pipe buffer, so the writer never blocked and SIGPIPE could not fire.
2. The padding sat BEFORE the `### Also worth noting` heading, so `grep` read nearly the whole body before matching and little remained unwritten.

The corrected fixture puts roughly 200KB of padding AFTER the heading, satisfying both conditions: the match fires early and the remainder exceeds the buffer. Under that fixture the pre-fix check (c) fails 20 runs out of 20.

**Falsification performed in both directions**, per this ticket's own requirement that the N-run test be the falsification step rather than a post-hoc assertion. The script was reverted to its pre-fix form and restored: pre-fix the test fails 20/20 with exit 1; post-fix it passes. The first version of the test was itself wrong and passed against the buggy code, which is what surfaced the two fixture defects above.

**No false-PASS path was introduced.** `grep -m1` prints its match (unlike `-q`), so `$atwn` is non-empty if and only if the heading is present, and `|| true` inside the command substitution swallows both grep's exit-1 and any upstream SIGPIPE before `pipefail` can observe it. The pre-existing negative test at `scripts/check-newsletter-structure.test.mjs:150` still fires when the section is genuinely absent.

**Field evidence.** During the Issue 16 finalise phase the flake fired 4 runs in 6, up from the 1-in-6 recorded at capture, on the longest body yet. That confirms the length-scaling this ticket predicted. Recorded in `src/newsletters/published/leader/2026-08-03/2026-08-03.reviews.md`.

### Investigation Tasks

- [x] Reshape check (c) to avoid `grep -q` directly in a `pipefail` pipeline: capture to a variable first, or append `|| true` and test the captured result, matching check (d)'s existing shape.
- [x] Audit the rest of `scripts/check-newsletter-structure.sh` for other `| grep -q` pipelines under `pipefail`. Only two exist. Check (c) is fixed. Line 177's `printf '%s' "$h1" | grep -qE` is structurally identical to the pre-fix check (c) and is safe ONLY because `grep -m1` upstream bounds its payload to a single heading line, far under the pipe buffer. That is a payload-size accident, not a structural fix: a future multi-line input at that call site reopens the same class. Checks (e), (f) and (g) use awk or `grep -oE`, which consume their input fully.
- [ ] Audit sibling repo scripts for the same shape, given P059 was the same class.
- [x] Add a regression test that runs the lint N times against a long fixture brief and asserts a stable exit code. Landed as `scripts/check-newsletter-structure.test.mjs` "(c) is deterministic on a long body (P119 SIGPIPE under pipefail)".

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P089 (introduced the structural lint), P093 (check (b) refinement)

## Related

- **Upstream report pending** -- false positive; detection misfire. The P063 token matched "upstream" in the phrase "a pipeline whose upstream still has buffered output", which names the upstream PROCESS in a shell pipeline, not an external dependency. No third party is involved.

- P059 (`docs/problems/closed/059-npm-run-push-watch-exits-141-sigpipe-on-successful-push.md`): same SIGPIPE-under-pipefail failure class at a different call site.
- P089 (`docs/problems/closed/089-newsletter-drafter-structural-sourcing-defects-gates-dont-catch.md`): introduced `scripts/check-newsletter-structure.sh` as the deterministic complement to the LLM gates. This defect undermines that determinism guarantee specifically.
- P093 (`docs/problems/closed/093-newsletter-lint-check-b-should-flag-single-bare-outlets.md`): prior refinement to the same script.
- Discovered during the `/wr-newsletter phase=prep` run for The Shift Issue 16 on 2026-08-03. Captured via `/wr-itil:capture-problem`.
