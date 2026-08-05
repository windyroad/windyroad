# Problem 110: work-problems Step 5 iter/pre-flight dispatch exceeds the interactive harness foreground Bash ceiling

**Status**: Known Error
**Reported**: 2026-07-03
**Priority**: 6 (Medium) -- Impact: Minor (2) x Likelihood: Possible (3) (re-rated 2026-07-15 review: caps any foreground-dispatched iter at 10min; AFK loop cannot progress on long iters)
**Origin**: internal
**Effort**: M (upstream Step 5 dispatch rework to the background primitive)
**WSJF**: 6.0 = (6 x 2.0) / 2

## Description

`/wr-itil:work-problems` Step 5 dispatches each iteration (and the Step 0b/0c/0d pre-flights) to a `claude -p` subprocess wrapped in a backgrounded poll loop inside a single Bash call. That poll loop assumes the orchestrator process can foreground-wait for up to `WORK_PROBLEMS_IDLE_TIMEOUT_S` (default 3600s / 60min). In the interactive Claude Code harness the Bash tool caps a single foreground call at 10 minutes, so any iter or pre-flight that runs longer is SIGTERM'd at ~10min with a 0-byte JSON file (the P147 stuck-before-emit class), and no iter work lands.

Observed 2026-07-03: the Step 0b `/wr-itil:review-problems` pre-flight subprocess died at exactly 10min (exit 143, empty JSON), forcing the P358 non-blocking revert-and-proceed path (reverted the partial `docs/problems/.upstream-cache.json` + `docs/audits/inbound-discovery-log.md` writes). The same ceiling blocks full `/wr-itil:manage-problem` iter dispatch, so the loop cannot make forward progress on any ticket whose iter exceeds 10min when orchestrated foreground.

## Symptoms

- Step 0b review-problems pre-flight: exit 143, 0-byte JSON, at ~600s wall-clock (2026-07-03).
- Any manage-problem iter dispatched as a single foreground Bash call is capped at 10min regardless of `WORK_PROBLEMS_IDLE_TIMEOUT_S`.

## Workaround

Dispatch long subprocesses via the harness-level background primitive (Bash tool `run_in_background: true`) which runs detached across turns and re-invokes the orchestrator on completion, rather than a single foreground Bash call with an in-call poll loop. The Step 5 poll-loop shape is designed for a host that permits unbounded foreground shell waits; the interactive Claude Code harness is not that host.

**CONTESTED 2026-08-05.** The prescription above was falsified in practice; see the second-occurrence section below. It is left standing rather than rewritten because Investigation Task 3 owns the choice of dispatch shape and has not been settled. Do not follow it without reading that section first.

## Second occurrence, 2026-08-05: the prescribed workaround failed and the shape it replaced succeeded

Observed across a four-ticket `/wr-itil:work-problems` session (P120, P123, P121, P122) in an interactive Claude Code harness.

**Finding 1: `run_in_background: true` did not survive; `nohup` detach did.** Three separate Bash-tool calls made with `run_in_background: true` were killed by the harness before completing (two `claude -p` dispatch wrappers and one `until kill -0 ...; do sleep; done` waiter), each reported back as status `killed`. In the same session a `claude -p` subprocess detached with `nohup ... &`, reparented to init (PPID 1), ran 97 minutes and exited normally with a complete 42KB JSON result. All four iterations were subsequently dispatched via `nohup` detach and all four completed. So for this harness the ticket's Workaround section names the shape that fails and rejects the shape that works, which is the inverse of the 2026-07-03 reading.

**Finding 2: a 0-byte output file is the normal mid-run state, not a death signature.** `claude -p --output-format json` writes its entire result as a single blob at exit, so an empty output file is indistinguishable from a dead subprocess by inspection of the file alone. In this session the orchestrator read a 0-byte file as evidence of death and re-dispatched the same ticket, leaving two `claude` processes working P120 concurrently in the same repo for about 9 minutes. Cost: about USD 5.64 on the duplicate, which died at turn 28 with `error_during_execution`. No repository corruption resulted, because neither process had reached its commit gate. The correct liveness check is the PID (`kill -0` / `ps`), never the output file size.

**This weakens, but does not overturn, the original 2026-07-03 diagnosis.** The Description and Symptoms sections both cite "0-byte JSON" as evidence the subprocess died. Per Finding 2 that half of the evidence proves nothing. The 2026-07-03 conclusion still holds, but it rests on the other half: `exit 143` at exactly 600s wall-clock, which is an unambiguous SIGTERM at the documented ceiling. A future reader should not carry "0-byte JSON" forward as a death signature.

**Exposure is wider than the Impact Assessment currently records.** Frequency is scoped below to "every iter/pre-flight exceeding 10min" under foreground dispatch. Harness background-primitive dispatches were also killed here, at well under 10 minutes in at least one case, so the failure surface is not bounded by the foreground ceiling alone. Left for Investigation Task 1 rather than re-rated here.

## Impact Assessment

- **Who is affected**: (deferred to investigation) -- anyone running `/wr-itil:work-problems` from an interactive Claude Code session (vs a headless/cron host without the 10min cap).
- **Frequency**: (deferred to investigation) -- every iter/pre-flight exceeding 10min.
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Confirm the interactive-harness 10min foreground Bash ceiling vs the headless-host behaviour the Step 5 poll loop assumes
- [ ] Decide the fix shape: document/require `run_in_background` dispatch for interactive-harness orchestration, or a harness-aware dispatch branch in Step 5. **Note the 2026-08-05 evidence inverts the premise of the first option**: `run_in_background` was the shape that got killed, `nohup` detach was the shape that survived. Neither observation is more than n=1, so this stays undecided.
- [ ] Correct the Workaround section once the fix shape is settled. It currently prescribes `run_in_background: true` as an unqualified imperative, which the 2026-08-05 evidence contradicts. Carrying a CONTESTED marker in the interim.
- [ ] Add a liveness-check contract to whatever dispatch shape is chosen: check the PID, never the output file size, and never treat an empty `--output-format json` file as a terminal state (see Finding 2, 2026-08-05).

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: **local P055** (`docs/problems/open/055-afk-iter-subprocess-stream-idle-timeout-api-error-recurrence.md`, AFK iter subprocess `Stream idle timeout` API errors -- different root cause), agent-plugins P147 (SIGTERM stuck-before-emit metadata loss -- this ticket is a trigger of that class), agent-plugins P121 (idle-timeout SIGTERM design).

  Citations audited 2026-08-05. P147 and P121 are upstream `agent-plugins` IDs and are namespaced as such: no local ticket 147 exists, and local P121 is the newsletter prior-edition-shape ticket, an unrelated collision. **P055 resolves locally and was previously mis-namespaced upstream in this line.** Local P055 line 20 already draws the distinction Finding 2 above corrects: the SIGTERM stuck-before-emit path produces 0-byte JSON, while the stream-idle-timeout path produces parseable JSON carrying `is_error: true`. The two tickets' evidence bases are joined, not duplicated.

## Related

- **Reported upstream**: https://github.com/windyroad/agent-plugins/issues/327 (2026-07-03)

- **Upstream-blocked (fix site)**: the fix belongs in the upstream `wr-itil` `work-problems` SKILL.md (agent-plugins repo). This consumer content repo has no `packages/itil/` source tree to edit (ADR-036 predicate); it records the observation only.
- Captured via /wr-itil:capture-problem during a zero-iter `/wr-itil:work-problems` session retro (2026-07-03). Expand at next investigation.

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/327
- **Reported**: 2026-07-03
- **Template used**: structured default (problem-shaped)
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes
