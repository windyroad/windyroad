# Problem 055: AFK iter subprocess `Stream idle timeout` API errors recur at high rate

**Status**: Open
**Reported**: 2026-05-12
**Origin**: internal
**Priority**: 3 (Low). Impact: Moderate (3) x Likelihood: Rare (1)
**Effort**: M
**WSJF**: 1.5 = (3 x 1) / 2
**Type**: technical

## Description

The `/wr-itil:work-problems` AFK orchestrator's `claude -p` subprocess dispatch hit `is_error: true` with `result: "API Error: Stream idle timeout - partial response received"` on 3/3 attempts today (2026-05-12). Total burned cost: $9.11+ for one substantive file edit landed plus zero ITERATION_SUMMARY blocks emitted.

P027 documents the orchestrator-side `is_error: true` handling rule for `529 Overloaded`. Stream-idle-timeout is a distinct subclass:

- 529 Overloaded: cumulative cost typically near $0 (API rejects upstream), 0 turns, fast exit.
- Stream-idle-timeout: cumulative cost can reach $6+ (the subprocess does substantial work, then the stream-idle watchdog kills the response mid-emit), 19 to 44 turns, slow exit (13 to 32 min wall-clock).

Per P147 the SIGTERM path on stuck-before-emit produces 0-byte JSON; the stream-idle-timeout path produces parseable JSON with `is_error: true` and `partial response received` in the result. The two failure shapes need distinct orchestrator handling.

Today's orchestrator-main-turn recovery path: user direction "finish the iteration" / "keep going" triggered manual completion of the partial work, with re-stage and ADR-014 commit through the standard risk-scorer gate. This worked because the user was interactive; AFK loops that fire this failure mode without user presence silently halt or burn quota on retries.

Concrete evidence:

- 2026-05-12 iter 1 (P024 transition): `duration_ms: 774952` (12.9 min), `num_turns: 19`, `total_cost_usd: 2.29`, `is_error: true`, partial work in tree (staged rename plus Verification Outcome section). JSON preserved at `.afk-run-state/resolved/iter-1-2026-05-12.json`.
- 2026-05-12 iter 2 first attempt (P043 named_action): poll loop showed 62-min gap between consecutive 60s sleeps (OS suspend; cross-references the sibling P056 ticket). SIGTERM at 5848s elapsed; JSON 0 bytes.
- 2026-05-12 iter 2 retry (P043 named_action): `duration_ms: 1906381` (31.8 min), `num_turns: 44`, `total_cost_usd: 6.82`, `is_error: true`. Partial work: 27 insertion / 13 deletion edit to `.claude/skills/wr-newsletter/assets/three-lens-filter.md`. JSON preserved at `.afk-run-state/resolved/iter-2-retry-2026-05-12.json`.

## Symptoms

(deferred to investigation)

## Workaround

(deferred to investigation; current path is interactive orchestrator-main-turn manual completion under user direction)

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: (deferred to investigation; 3/3 dispatches today is anomalously high and may be environmental)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation; cumulative session burn visible on Anthropic billing dashboard)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Investigate root cause (environmental API stream stability vs structural claude -p protocol)
- [ ] Add stream-idle-timeout subclass to work-problems SKILL.md Step 5 exit-code semantics
- [ ] Decide retry-once policy bounds (count, scope-narrowing, lower idle-timeout on retry)
- [ ] Document orchestrator-main-turn manual-completion recovery path as a first-class fallback

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P027 (`is_error:true` 529 Overloaded handling), P147 (SIGTERM stuck-before-emit metadata-loss), P121 (idle-timeout SIGTERM in poll loop)

## Related

(captured via /wr-itil:capture-problem; expand at next investigation)

- `packages/itil/skills/work-problems/SKILL.md` Step 5 (Exit-code semantics, SIGTERM exit-flush, P147 stuck-before-emit subclass)
- ADR-032 (governance skill invocation patterns, subprocess-boundary variant)
- ADR-013 Rule 1 (interactive recovery on user direction)
- `.afk-run-state/resolved/iter-1-2026-05-12.json`
- `.afk-run-state/resolved/iter-2-retry-2026-05-12.json`
- 2026-05-12 retro session evidence at `docs/retros/2026-05-12-ask-hygiene.md`
