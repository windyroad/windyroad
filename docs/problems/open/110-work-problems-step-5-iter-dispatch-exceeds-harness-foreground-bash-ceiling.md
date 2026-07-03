# Problem 110: work-problems Step 5 iter/pre-flight dispatch exceeds the interactive harness foreground Bash ceiling

**Status**: Open
**Reported**: 2026-07-03
**Priority**: 3 (Medium) -- Impact: 3 x Likelihood: 1 (deferred -- re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: M (deferred -- re-rate at next /wr-itil:review-problems)

## Description

`/wr-itil:work-problems` Step 5 dispatches each iteration (and the Step 0b/0c/0d pre-flights) to a `claude -p` subprocess wrapped in a backgrounded poll loop inside a single Bash call. That poll loop assumes the orchestrator process can foreground-wait for up to `WORK_PROBLEMS_IDLE_TIMEOUT_S` (default 3600s / 60min). In the interactive Claude Code harness the Bash tool caps a single foreground call at 10 minutes, so any iter or pre-flight that runs longer is SIGTERM'd at ~10min with a 0-byte JSON file (the P147 stuck-before-emit class), and no iter work lands.

Observed 2026-07-03: the Step 0b `/wr-itil:review-problems` pre-flight subprocess died at exactly 10min (exit 143, empty JSON), forcing the P358 non-blocking revert-and-proceed path (reverted the partial `docs/problems/.upstream-cache.json` + `docs/audits/inbound-discovery-log.md` writes). The same ceiling blocks full `/wr-itil:manage-problem` iter dispatch, so the loop cannot make forward progress on any ticket whose iter exceeds 10min when orchestrated foreground.

## Symptoms

- Step 0b review-problems pre-flight: exit 143, 0-byte JSON, at ~600s wall-clock (2026-07-03).
- Any manage-problem iter dispatched as a single foreground Bash call is capped at 10min regardless of `WORK_PROBLEMS_IDLE_TIMEOUT_S`.

## Workaround

Dispatch long subprocesses via the harness-level background primitive (Bash tool `run_in_background: true`) which runs detached across turns and re-invokes the orchestrator on completion, rather than a single foreground Bash call with an in-call poll loop. The Step 5 poll-loop shape is designed for a host that permits unbounded foreground shell waits; the interactive Claude Code harness is not that host.

## Impact Assessment

- **Who is affected**: (deferred to investigation) -- anyone running `/wr-itil:work-problems` from an interactive Claude Code session (vs a headless/cron host without the 10min cap).
- **Frequency**: (deferred to investigation) -- every iter/pre-flight exceeding 10min.
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Confirm the interactive-harness 10min foreground Bash ceiling vs the headless-host behaviour the Step 5 poll loop assumes
- [ ] Decide the fix shape: document/require `run_in_background` dispatch for interactive-harness orchestration, or a harness-aware dispatch branch in Step 5

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P055 (AFK iter Stream idle timeout -- different root cause), P147 (SIGTERM stuck-before-emit metadata loss -- this ticket is a trigger of that class), P121 (idle-timeout SIGTERM design)

## Related

- **Upstream-blocked (fix site)**: the fix belongs in the upstream `wr-itil` `work-problems` SKILL.md (agent-plugins repo). This consumer content repo has no `packages/itil/` source tree to edit (ADR-036 predicate); it records the observation only.
- Captured via /wr-itil:capture-problem during a zero-iter `/wr-itil:work-problems` session retro (2026-07-03). Expand at next investigation.
