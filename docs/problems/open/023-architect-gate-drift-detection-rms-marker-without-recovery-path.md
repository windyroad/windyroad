# Problem 023: architect-gate drift detection rm's marker without offering recovery path

**Status**: Open
**Reported**: 2026-04-26
**Origin**: internal
**Priority**: 9 (Medium). Impact: Moderate (3) x Likelihood: Possible (3)
**Effort**: M
**WSJF**: 4.5 = (9 x 1) / 2

## Description

`architect-gate.sh::check_architect_gate` rm's the `/tmp/architect-reviewed-<SID>` marker and returns 1 (deny) when the stored hash differs from the current hash. The agent has no obvious recovery path other than re-invoking the architect agent, which doesn't help if the architect approves but the marker still fails to write (see P021 strict-verdict parser).

## Symptoms

From prior AFK session:
- Drift detected in orchestrator session
- Manual hash file rewrite was the only recovery; re-invoking architect didn't restore the marker because the verdict-parser rejected the affirmative ISSUES FOUND output

## Workaround

Manually `rm` plus re-write the hash file using the find/sort/md5 pipeline. Less obvious to discover than re-invoking the architect agent.

## Impact Assessment

- **Who is affected**: Any session experiencing drift recovery
- **Frequency**: Every session that hits drift (compounded by P022)
- **Severity**: Moderate. Recovery path exists but is non-obvious
- **Analytics**: PreToolUse Edit denials following marker rm

## Root Cause Analysis

### Investigation Tasks

- [ ] Review `architect-gate.sh::check_architect_gate` recovery semantics
- [ ] Decide: emit a self-recovery prompt (or auto-refresh on drift if marker exists) instead of silent marker rm
- [ ] Create reproduction test (drift-then-recover fixture)
- [ ] Create INVEST story for permanent fix

## Dependencies

- **Blocks**: (none)
- **Blocked by**: P021, P022 (the parser and refresh-scope gaps cause the drift in the first place)
- **Composes with**: P024 (architect-gate family)

## Related

- ~/.claude/plugins/cache/windyroad/wr-architect/0.5.0/hooks/lib/architect-gate.sh
- ~/.claude/plugins/cache/windyroad/wr-architect/0.5.0/hooks/architect-enforce-edit.sh
- **Reported upstream**: https://github.com/windyroad/agent-plugins/issues/80 (2026-04-27)

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/80
- **Reported**: 2026-04-27
- **Template used**: problem-report.yml
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes
