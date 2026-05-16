# Problem 030: work-problems SKILL.md marker wording uses em-dash, forces whitelist in PostToolUse:Bash em-dash hook

**Status**: Open
**Reported**: 2026-04-26
**Priority**: 4 (Low). Impact: Minor (2) x Likelihood: Possible (2)

## Description

The upstream `wr-itil:work-problems` SKILL.md fixes the AFK-fallback marker wording as `- **Upstream report pending** (em-dash) external dependency identified; invoke /wr-itil:report-upstream when ready` (the literal U+2014 separator is part of the contract). P025's PostToolUse:Bash em-dash hook (`.claude/hooks/no-em-dash-bash.sh`) ships a narrow whitelist for that exact line so the orchestrator's marker-append flow does not get blocked. The whitelist is technical debt: it widens the em-dash policy by one carve-out, and any future drift in the upstream marker wording silently bypasses the whitelist match.

## Symptoms

- `.claude/hooks/no-em-dash-bash.sh` contains a `WHITELIST_LINE` carve-out that has to stay in lockstep with the upstream SKILL.md marker wording.
- A future drive-by edit to the upstream marker (e.g. wording polish) would either re-block the orchestrator's park flow (if the whitelist no longer matches) or leak em-dashes past the hook (if whitelist matches more liberally than the new wording).
- `docs/VOICE-AND-TONE.md`'s em-dash ban now has a known exception that contributors have to remember.

## Workaround

Whitelist line in `.claude/hooks/no-em-dash-bash.sh`. Acceptable while in place; remove once the upstream wording is amended.

## Impact Assessment

- **Who is affected**: AFK orchestrator (work-problems) on every `upstream-blocked` park; em-dash hook policy clarity for everyone else.
- **Frequency**: Whitelist line is written into the hook once and read on every PostToolUse:Bash invocation. Marker append fires only on `upstream-blocked` parks (rare).
- **Severity**: Low. The hook fails open for the marker line, which is the safe direction. No reader-facing prose is at risk because the marker only lands in problem-ticket Related sections, not blog or newsletter copy.
- **Analytics**: grep `.claude/hooks/no-em-dash-bash.sh` for `WHITELIST_LINE` and confirm the carve-out is present.

## Root Cause Analysis

### Investigation Tasks

- [ ] Decide preferred upstream replacement: comma, parens, period, or colon. Suggested: `- **Upstream report pending**: external dependency identified; invoke /wr-itil:report-upstream when ready`.
- [ ] PR the upstream `wr-itil:work-problems` SKILL.md (lines 49, 141, 393 reference the marker wording; check for other call-sites).
- [ ] Update the AFK-fallback path in `wr-itil:manage-problem` SKILL.md if it carries the same marker text.
- [ ] After upstream change ships and is in this repo's pinned plugin version, remove the `WHITELIST_LINE` block from `.claude/hooks/no-em-dash-bash.sh`.
- [ ] Add a test-fixture step: heredoc-write a marker line via Bash, confirm hook does NOT block once the whitelist is removed (because the upstream wording is em-dash-free).

## Dependencies

- **Blocks**: (none, the whitelist is a stable workaround)
- **Blocked by**: (none, upstream PR can be raised any time)
- **Composes with**: P025 (the PostToolUse:Bash em-dash hook that hosts the whitelist)

## Related

- .claude/hooks/no-em-dash-bash.sh
- docs/VOICE-AND-TONE.md (em-dash policy)
- packages/itil/skills/work-problems/SKILL.md (upstream marker definition)
- packages/itil/skills/manage-problem/SKILL.md (AFK-fallback marker mirror)
- **Reported upstream**: https://github.com/windyroad/agent-plugins/issues/84 (2026-04-27)

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/84
- **Reported**: 2026-04-27
- **Template used**: problem-report.yml
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes
