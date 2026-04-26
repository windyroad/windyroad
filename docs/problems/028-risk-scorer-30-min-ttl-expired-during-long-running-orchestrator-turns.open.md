# Problem 028: risk-scorer 30-min TTL expired during long-running orchestrator turns

**Status**: Open
**Reported**: 2026-04-26
**Priority**: 12 (Significant). Impact: Moderate (3) x Likelihood: Likely (4)

## Description

The risk-scorer commit gate uses a 1800s TTL on the cached score. During long orchestrator turns (multi-iteration AFK loops), the score expires mid-turn even when no commits happen between scoring and the eventual commit. This forces a fresh scorer invocation just to commit.

## Symptoms

From prior AFK session:
- Final BRIEFING hand-off commit blocked: "Commit blocked: Risk score expired (1826s old, TTL 1800s)"
- Resolution: re-invoked `wr-risk-scorer:pipeline` subagent inline

## Workaround

Re-score before commit if turn duration approaches TTL. Adds extra subagent invocation cost.

## Impact Assessment

- **Who is affected**: Long orchestrator turns (multi-iteration AFK loops, batch operations)
- **Frequency**: Any turn longer than ~30 min between scoring and committing
- **Severity**: Moderate. Wastes a subagent invocation per occurrence; doesn't block work
- **Analytics**: Commit-gate denial logs with TTL-expired reason

## Root Cause Analysis

### Investigation Tasks

- [ ] Review the 1800s TTL choice; why 30 min specifically?
- [ ] Decide fix: TTL extension OR auto-refresh on near-expiry OR commit-gate-side fallback scoring
- [ ] Consider: does TTL serve a real purpose if no commits happened between scoring and gate check?
- [ ] Create reproduction test (long turn with score-then-commit-after-30min)
- [ ] Create INVEST story for permanent fix

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P029 (BRIEFING hand-off commits trigger this; closing P029 reduces P028 trigger frequency)

## Related

- ~/.claude/plugins/cache/windyroad/wr-risk-scorer/ (TTL config)
- docs/decisions/015-*.md (risk-scorer split-skill ADR)
- **Reported upstream**: https://github.com/windyroad/agent-plugins/issues/82 (2026-04-27)

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/82
- **Reported**: 2026-04-27
- **Template used**: problem-report.yml
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes
