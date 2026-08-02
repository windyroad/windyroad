# Problem 119: Newsletter structure lint check (c) is non-deterministic, SIGPIPE under pipefail yields spurious "missing Also worth noting" FAIL

**Status**: Open
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

**Leading hypothesis, not confirmed.** Read this section with the negative result below in view before reshaping anything.

The hypothesis: `set -uo pipefail` at line 50, combined with `grep -q` short-circuiting a pipeline whose upstream still has buffered output, makes the pipeline exit status non-deterministic. Check (d) immediately below already uses the safe shape. It captures to a variable first (`h1=$(body_text | grep -m1 -E '^# ' || true)`) and then greps the variable, so it would not be exposed.

**What is established:** the non-determinism itself is real and reproducible at the script level (exit codes `0 0 0 1 0 0` across six identical invocations), and the script's own awk pass sees the heading in a run where check (c) reports it missing.

**What is NOT established:** the SIGPIPE mechanism. Replicating the `body_text | grep -qE` pipeline standalone under `set -o pipefail` matched 6 times out of 6, so the hypothesis did not reproduce in isolation. Something about the fuller script's I/O timing is load-bearing, or the cause is different. Do not reshape check (c) and declare the problem fixed without first reproducing the failure and then demonstrating the reshape removes it. Investigation Task 4 (the N-run stability test) is the falsification step and should be written before the fix, not after.

### Investigation Tasks

- [ ] Reshape check (c) to avoid `grep -q` directly in a `pipefail` pipeline: capture to a variable first, or append `|| true` and test the captured result, matching check (d)'s existing shape.
- [ ] Audit the rest of `scripts/check-newsletter-structure.sh` for other `| grep -q` pipelines under `pipefail` (checks (f) and (g) are the likely candidates).
- [ ] Audit sibling repo scripts for the same shape, given P059 was the same class.
- [ ] Add a regression test that runs the lint N times against a long fixture brief and asserts a stable exit code.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P089 (introduced the structural lint), P093 (check (b) refinement)

## Related

- P059 (`docs/problems/closed/059-npm-run-push-watch-exits-141-sigpipe-on-successful-push.md`): same SIGPIPE-under-pipefail failure class at a different call site.
- P089 (`docs/problems/closed/089-newsletter-drafter-structural-sourcing-defects-gates-dont-catch.md`): introduced `scripts/check-newsletter-structure.sh` as the deterministic complement to the LLM gates. This defect undermines that determinism guarantee specifically.
- P093 (`docs/problems/closed/093-newsletter-lint-check-b-should-flag-single-bare-outlets.md`): prior refinement to the same script.
- Discovered during the `/wr-newsletter phase=prep` run for The Shift Issue 16 on 2026-08-03. Captured via `/wr-itil:capture-problem`.
