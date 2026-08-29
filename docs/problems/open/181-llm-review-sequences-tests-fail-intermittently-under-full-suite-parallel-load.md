# Problem 181: Test suites fail intermittently under parallel load, most often research/llm-review-sequences

**Status**: Open
**Reported**: 2026-08-30
**Priority**: 8 (Medium), Impact: 2 x Likelihood: 4, derived at capture. Impact is 2 because no product behaviour is wrong: the tests pass in isolation, so the failure reports a harness condition rather than a defect. The cost is that a red suite stops carrying information, which is what makes it worth more than 1. Likelihood is 4 because it reproduced on three of four consecutive full-suite runs.
**Origin**: internal
**Effort**: M, derived at capture. Diagnosis is the work: identifying whether the shared resource is a file, a port, a temp path or a concurrency limit, before any fix can be chosen.
**WSJF**: 4.0 = (8 x 1.0) / 2

## Description

Tests under `research/llm-review-sequences/` fail intermittently when the full suite runs in parallel, and pass reliably when the same files run in isolation.

Observed across four consecutive full-suite runs on 2026-08-30: 15 failures, then 11, then 1, then 0. The same files pass on both clean `HEAD` and the dirty story-map salvage tree when run alone, which rules out any change in that tree as the cause.

A second instance, in a different directory, was observed the same day. `npx vitest run scripts/` reported 5 failures of 279 while a risk-scoring subagent was working the same machine; the identical command over the identical tree returned 279 passed four times once the machine was quiet, and the two newest files in that directory passed three further runs on their own. The failing file was not identified, because the captured output was truncated to its summary. Whether that is the same phenomenon is NOT established: the failing file was never identified, so the two instances cannot be shown to share a cause. Two explanations are live and this ticket does not choose between them. The subagent was reading and writing files in this same tree, so contention on a shared resource is one; general machine load starving the runner is the other. Recorded because if the second instance IS the same fault, scoping the fix to a single directory would miss it.

A varying failure count across identical inputs is the signature of contention rather than of a wrong assertion. The candidate causes are a shared fixture path written by more than one worker, a shared port, or a resource limit reached only when the rest of the suite is running alongside.

## Symptoms

- Failure count varies run to run with no change to the tree.
- Running the same files in isolation is green.
- The failures do not point at a consistent assertion.

## Workaround

Run `research/llm-review-sequences/` in isolation to get a trustworthy result, and do not read a full-suite red in that directory as a signal about the change under test. Manual, and it requires knowing in advance that this directory is the flaky one.

## Impact Assessment

- **Who is affected**: the Internal Maintainer persona, on every full-suite run.
- **Frequency**: three of four observed runs.
- **Severity**: no wrong output reaches a reader. The cost is that an unattended loop cannot distinguish this failure from a real one, so it either stops on a false red or learns to ignore a directory.
- **Analytics**: none.

## Root Cause Analysis

### Investigation Tasks

- [ ] Determine whether the failing tests share a fixture path, a temp directory, or a port.
- [ ] Check whether the runner grants these files their own worker or interleaves them with the rest of the suite.
- [ ] Establish whether the failure count correlates with total suite concurrency.

## Fix Strategy

Not yet chosen: the shared resource has not been identified, and picking a fix before that would be guessing. Once identified, the likely shapes are per-worker isolation of the contended resource, or pinning this directory to a single worker.
