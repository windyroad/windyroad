# Problem 027: work-problems Step 5 exit-code rule does not handle is_error:true transient API failures (529 Overloaded)

**Status**: Parked
**Reported**: 2026-04-26
**Origin**: internal
**Priority**: 12 (High). Impact: Significant (4) x Likelihood: Possible (3)
**Effort**: S
**WSJF**: 0 (parked, excluded from ranking)

## Description

`work-problems` SKILL.md Step 5 says "Non-zero exit -> halt the loop" but doesn't cover `claude -p` returning exit 0 with `is_error: true, total_cost_usd: 0` on transient API failures (e.g. 529 Overloaded). Without an orchestrator-side `is_error` check, the loop would silently treat the failure as success and parse the (missing) ITERATION_SUMMARY.

## Symptoms

From prior AFK session:
- Iter 1 attempt 1: `is_error: true, api_error_status: 529, total_cost_usd: 0, duration_ms: 202870, num_turns: 1, stop_reason: stop_sequence`
- result.field contained "API Error: 529 Overloaded"
- Retry succeeded; the bug was the absence of the retry policy in the SKILL.md, not the API behaviour itself

## Workaround

Orchestrator-side `is_error` check plus retry-once policy. Already applied informally in the prior session.

## Impact Assessment

- **Who is affected**: AFK orchestrator runs during transient API outages
- **Frequency**: Whenever Anthropic API returns 529 or other transient errors
- **Severity**: Significant. Silent failure mode would corrupt iteration counts and ITERATION_SUMMARY parsing
- **Analytics**: claude -p result fields with `is_error: true`

## Root Cause Analysis

### Investigation Tasks

- [ ] Review `work-problems/SKILL.md` Step 5 exit-code rule
- [ ] Decide: extend exit-code rule to include `is_error: true` as halt OR retry-once trigger
- [ ] Decide: retry-once policy bounds (count, backoff)
- [ ] Create reproduction test (mock 529 response and observe orchestrator behaviour)
- [ ] Create INVEST story for permanent fix

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

- packages/itil/skills/work-problems/SKILL.md (Step 5)
- **Reported upstream**: https://github.com/windyroad/agent-plugins/issues/81 (2026-04-27)

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/81
- **Reported**: 2026-04-27
- **Template used**: problem-report.yml
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes

## Parked

- **Reason**: upstream-blocked. The genuine fix lives in `work-problems/SKILL.md` Step 5 exit-code semantics inside the `windyroad/agent-plugins` `wr-itil` plugin (consumed via `~/.claude/plugins/cache/windyroad/wr-itil/<version>/skills/work-problems/SKILL.md` and dispatched per-iteration through the `claude -p` subprocess wrapper). A marketplace consumer cannot edit the cached SKILL.md without losing the change on next plugin update, so the only durable fix is upstream. The orchestrator-side `is_error` check plus retry-once workaround is not codified locally either: the dispatch wrapper is a transient `/tmp/wr-iter-N-dispatch.sh` generated per-iter by the SKILL.md, not a durable repo-local script.
- **Verified persistence**: latest cached plugin version `0.38.0` still ships the halt-on-no-staged-work branch at `skills/work-problems/SKILL.md` lines 485 to 490. The P261 amendment (lines 485 to 490) adds a salvage carve-out ONLY for `is_error: true` WITH staged files in the working tree (the stream-timeout-after-staging class). The ELSE branch at line 488 explicitly halts on `is_error: true` with nothing staged, which is exactly the 529 Overloaded shape (`total_cost_usd: 0, num_turns: 1, nothing staged`). No retry-once policy exists. Verified 2026-05-30 by reading the cached file.
- **Upstream issue status**: `windyroad/agent-plugins#81` is OPEN as of 2026-05-30 (last updated 2026-05-15 per `gh issue view 81`). Tracked upstream as `docs/problems/open/214-...md` (P214, safe-low-fix-risk per maintainer comment 2026-05-15). No labels applied; no resolution committed upstream yet.
- **Un-park trigger**: a new `wr-itil` plugin release lands in `~/.claude/plugins/cache/windyroad/wr-itil/` whose `skills/work-problems/SKILL.md` Step 5 either (a) extends the salvage carve-out to retry-once on `is_error: true` with `total_cost_usd: 0` (the genuine-transient-API-failure shape), or (b) ships an alternative mechanism distinguishing transient API failures from genuine work-completion failures. Verify by re-reading the SKILL.md in the new cache version. Close P027 once a session that previously hit the 529-halt clears cleanly with the upgraded SKILL.md.
- **Local impact while parked**: agent-side workaround (the existing `## Workaround` section) remains the operating contract. When the orchestrator observes `is_error: true` with `total_cost_usd: 0` and `num_turns: 1`, retry once before halting (the informal pattern already applied in the prior session). Sessions that drift from this discipline will halt the AFK loop on the first transient API outage instead of recovering.
- **Composes with**: P031 (parked 2026-05-02, same `wr-itil` plugin upstream surface, also upstream-blocked).
- **Date parked**: 2026-05-30
