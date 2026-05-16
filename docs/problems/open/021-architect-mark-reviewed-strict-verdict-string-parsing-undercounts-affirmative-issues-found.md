# Problem 021: architect-mark-reviewed.sh strict-verdict-string parsing under-counts affirmative ISSUES FOUND verdicts as FAIL

**Status**: Open
**Reported**: 2026-04-26
**Priority**: 16 (Significant). Impact: Significant (4) x Likelihood: Likely (4)

## Description

The `architect-mark-reviewed.sh` PostToolUse hook only creates the gate-release marker when the architect agent's output contains the literal string `Architecture Review: PASS`. When the architect's verdict is "ISSUES FOUND" but the bottom-line text is affirmative (e.g. "the proposed edit is acceptable on minimum-delta grounds"), the hook classifies the verdict as FAIL, so no marker is written and the subsequent Edit is blocked. Strict string-grep loses useful nuance.

## Symptoms

From prior AFK session:
- Orchestrator's `package.json` dep-bump path: 2 architect agent invocations both returned ISSUES FOUND with affirmative bottom-lines; 2 Edit retries were blocked: "BLOCKED: Cannot edit ... without architecture review"
- Iter 11's own retro independently flagged the same friction on `.claude/skills/<skill>/SKILL.md`

## Workaround

Agent-side discipline: emit "Architecture Review: PASS" verbatim when bottom-line is affirmative even if individual issues exist. OR: manually write marker plus refresh hash after architect approval is clearly given.

## Impact Assessment

- **Who is affected**: Any session that invokes the architect agent on gated paths
- **Frequency**: Multiple times per AFK iteration when issues are found but affirmative
- **Severity**: Significant. Blocks legitimate edits; forces workaround discipline
- **Analytics**: Architect agent invocation logs; PreToolUse Edit denials

## Root Cause Analysis

### Investigation Tasks

- [ ] Review the parser logic in `architect-mark-reviewed.sh`
- [ ] Decide: extend parser to recognise affirmative-but-with-issues bottom-lines, OR require architect agents to emit PASS verbatim when bottom-line is affirmative
- [ ] Create reproduction test (architect output fixtures with affirmative ISSUES FOUND verdicts)
- [ ] Create INVEST story for permanent fix

## Dependencies

- **Blocks**: P022 (hash-refresh path interacts with same gate; this gate gap compounds drift recovery)
- **Blocked by**: (none)
- **Composes with**: P023, P024 (same architect-gate family)

## Related

- ~/.claude/plugins/cache/windyroad/wr-architect/0.5.0/hooks/architect-mark-reviewed.sh
- docs/decisions/ (architect review ADRs)
- **Reported upstream**: https://github.com/windyroad/agent-plugins/issues/78 (2026-04-27)

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/78
- **Reported**: 2026-04-27
- **Template used**: problem-report.yml
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes
