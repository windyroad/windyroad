# Problem 027: work-problems Step 5 exit-code rule does not handle is_error:true transient API failures (529 Overloaded)

**Status**: Open
**Reported**: 2026-04-26
**Priority**: 12 (Significant). Impact: Significant (4) x Likelihood: Possible (3)

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
