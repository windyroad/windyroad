# Problem 022: architect-refresh-hash.sh only refreshes hash on docs/decisions/* writes, leaving cross-session drift on other gated paths

**Status**: Open
**Reported**: 2026-04-26
**Priority**: 12 (Significant). Impact: Significant (4) x Likelihood: Possible (3)

## Description

The `architect-refresh-hash.sh` PostToolUse hook only fires for Edit/Write to paths matching `*/docs/decisions/*|docs/decisions/*`. Edits to other gated paths (`.claude/skills/`, `.claude/agents/`, source) don't refresh the stored hash, so any prior session's drift persists. The PreToolUse `architect-enforce-edit.sh` rm's the marker on detected drift, blocking all subsequent gated edits.

## Symptoms

From prior AFK session:
- Stored hash in `/tmp/architect-reviewed-<SID>.hash` was `ea7623326d0ebccd04707f4acea5a526` from a prior session
- Current `md5 -r` produced `2176673c23f6582870d1e4b38b90162a`
- ADR files had not changed in the active session; drift was carried in from a previous session

## Workaround

Manually refresh the hash:
```bash
find docs/decisions -name '*.md' -not -name 'README.md' -print0 | sort -z | xargs -0 cat | md5 -r | cut -d' ' -f1 > /tmp/architect-reviewed-<SID>.hash
```

## Impact Assessment

- **Who is affected**: Sessions with prior architect activity carrying drift
- **Frequency**: Every session start when the previous session left drift
- **Severity**: Significant. Compounds with P021 (mark-reviewed parser); both gate gaps block legitimate edits
- **Analytics**: PreToolUse Edit denials with hash-mismatch logs

## Root Cause Analysis

### Investigation Tasks

- [ ] Review the matcher conditions in `architect-refresh-hash.sh`
- [ ] Decide: trigger hash refresh on every successful PostToolUse Edit/Write that the gate allowed (not just on docs/decisions/* writes)
- [ ] Create reproduction test (cross-session drift fixture)
- [ ] Create INVEST story for permanent fix

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P021, P023 (architect-gate family)

## Related

- ~/.claude/plugins/cache/windyroad/wr-architect/0.5.0/hooks/architect-refresh-hash.sh
- ~/.claude/plugins/cache/windyroad/wr-architect/0.5.0/hooks/lib/architect-gate.sh
- **Upstream report pending** — external dependency identified; invoke /wr-itil:report-upstream when ready
