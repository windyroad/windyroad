# Problem 025: no-em-dash.sh has zero coverage of Bash-path file writes

**Status**: Open
**Reported**: 2026-04-26
**Priority**: 9 (Moderate). Impact: Moderate (3) x Likelihood: Possible (3)

## Description

The `no-em-dash.sh` PreToolUse hook only inspects `tool_input.new_string + tool_input.content`, which only fires for Edit/Write. Bash-path writes (heredocs, `python -c`, `sed`) bypass the hook entirely. This couples nastily with P024's python3 workaround: every `.claude/**` write via the workaround silently bypasses the em-dash check.

## Symptoms

From prior AFK session:
- Iter 3 introduced 2 stray em-dashes via python3 heredoc that the hook missed
- Caught only by an explicit `assert chr(8212) not in content` post-write check the iteration added
- Iter 11 retro re-flagged the same gap

## Workaround

Explicit `assert chr(8212) not in content` before any Bash-path write. Adds boilerplate to every workaround call site.

## Impact Assessment

- **Who is affected**: Any session writing files via Bash (heredoc, python, sed)
- **Frequency**: Every Bash-path write; common when P024 workaround is in use
- **Severity**: Moderate. Em-dashes leak into committed files; voice/style gates miss them
- **Analytics**: Post-commit grep for em-dashes; voice-tone agent reports

## Root Cause Analysis

### Investigation Tasks

- [ ] Review `no-em-dash.sh` matcher conditions
- [ ] Decide: add a PostToolUse:Bash post-write file-content scan to catch heredoc, python-exec, and sed paths
- [ ] Consider: does the post-write scan need to detect "what was written"? Could scan modified files in the working tree instead
- [ ] Create reproduction test (heredoc write with em-dash, expect block)
- [ ] Create INVEST story for permanent fix

## Dependencies

- **Blocks**: (none)
- **Blocked by**: P024 (closing P024 removes the python3 workaround; this gap shrinks by amount of workaround usage)
- **Composes with**: (none)

## Related

- .claude/hooks/no-em-dash.sh
- docs/VOICE-AND-TONE.md (em-dash policy)
