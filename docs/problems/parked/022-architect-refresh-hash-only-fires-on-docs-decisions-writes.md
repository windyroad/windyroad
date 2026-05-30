# Problem 022: architect-refresh-hash.sh only refreshes hash on docs/decisions/* writes, leaving cross-session drift on other gated paths

**Status**: Parked
**Reported**: 2026-04-26
**Origin**: internal
**Priority**: 12 (High). Impact: Significant (4) x Likelihood: Possible (3)
**Effort**: S
**WSJF**: 0 (parked, excluded from ranking)

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
- **Reported upstream**: https://github.com/windyroad/agent-plugins/issues/79 (2026-04-27)

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/79
- **Reported**: 2026-04-27
- **Template used**: problem-report.yml
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes

## Parked

- **Reason**: upstream-blocked. The genuine fix lives in `architect-refresh-hash.sh` inside the `windyroad/agent-plugins` `wr-architect` plugin (consumed via `~/.claude/plugins/cache/windyroad/wr-architect/<version>/hooks/architect-refresh-hash.sh`). A marketplace consumer cannot edit the cached hook without losing the change on next plugin update, so the only durable fix is upstream.
- **Verified persistence**: latest cached plugin version `0.12.2` still ships the `docs/decisions/*`-only matcher at `hooks/architect-refresh-hash.sh` lines 20 to 26. Edits to other gated paths (`.claude/skills/`, `.claude/agents/`, source) still do not refresh the stored hash. Verified 2026-05-30 by reading the file in the cache.
- **Upstream issue status**: `windyroad/agent-plugins#79` is OPEN as of 2026-05-30 (last updated 2026-05-15 per `gh issue view 79`). No labels applied; no resolution committed upstream yet.
- **Un-park trigger**: a new `wr-architect` plugin release lands in `~/.claude/plugins/cache/windyroad/wr-architect/` whose `hooks/architect-refresh-hash.sh` either (a) refreshes the stored hash on every successful PostToolUse Edit/Write the gate allowed (not just on `docs/decisions/*` writes), or (b) ships an alternative mechanism that prevents cross-session drift on other gated paths. Verify by re-reading the hook in the new cache version. Close P022 once a session that previously hit the cross-session-drift block clears cleanly with the upgraded hook.
- **Local impact while parked**: agent-side workaround (the existing `## Workaround` section) remains the operating contract. When the gate blocks on hash drift not attributable to in-session ADR writes, manually refresh `/tmp/architect-reviewed-<SID>.hash` using the documented `find ... | md5 -r` recipe. Sessions that drift from this discipline will still hit the Edit-blocked retry path until upstream lands.
- **Date parked**: 2026-05-30
