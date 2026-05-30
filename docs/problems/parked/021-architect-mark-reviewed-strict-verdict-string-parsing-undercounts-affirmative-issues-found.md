# Problem 021: architect-mark-reviewed.sh strict-verdict-string parsing under-counts affirmative ISSUES FOUND verdicts as FAIL

**Status**: Parked
**Reported**: 2026-04-26
**Origin**: internal
**Priority**: 16 (High). Impact: Significant (4) x Likelihood: Likely (4)
**Effort**: S
**WSJF**: 0 (parked, excluded from ranking)

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

## Parked

- **Reason**: upstream-blocked. The genuine fix lives in `architect-mark-reviewed.sh` inside the `windyroad/agent-plugins` `wr-architect` plugin (consumed via `~/.claude/plugins/cache/windyroad/wr-architect/<version>/hooks/architect-mark-reviewed.sh`). A marketplace consumer cannot edit the cached hook without losing the change on next plugin update, so the only durable fix is upstream.
- **Verified persistence**: latest cached plugin version `0.12.2` still ships the strict `grep -q "Architecture Review: PASS"` parser at `hooks/architect-mark-reviewed.sh` lines 27 to 30. The `ISSUES FOUND` branch still routes to `VERDICT="FAIL"` unconditionally. Verified 2026-05-30 by reading the file in the cache.
- **Upstream issue status**: `windyroad/agent-plugins#78` is OPEN as of 2026-05-30. Upstream tracks the same bug as their local `P217` with the `safe-low-fix-risk` label, per Tom's own 2026-05-15 comment on issue 78 confirming the local mirror.
- **Un-park trigger**: a new `wr-architect` plugin release lands in `~/.claude/plugins/cache/windyroad/wr-architect/` whose `hooks/architect-mark-reviewed.sh` parser either (a) recognises affirmative-bottom-line `ISSUES FOUND` verdicts as PASS, or (b) ships an alternative marker the agent can emit to signal "issues found but bottom-line affirmative". Verify by re-reading the hook in the new cache version. Close P021 once the upstream behaviour change is exercised in a session that previously hit the FAIL classification.
- **Local impact while parked**: agent-side discipline (the existing workaround in the Workaround section) remains the operating contract. Emit `Architecture Review: PASS` verbatim whenever the architect's bottom line is affirmative even if individual issues exist. Sessions that drift from this discipline will still hit the Edit-blocked retry path until upstream lands.
- **Date parked**: 2026-05-30
