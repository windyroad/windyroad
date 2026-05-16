# Problem 025: no-em-dash.sh has zero coverage of Bash-path file writes

**Status**: Verification Pending
**Reported**: 2026-04-26
**Fix Released**: 2026-04-26
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

- [x] Review `no-em-dash.sh` matcher conditions
- [x] Decide: add a PostToolUse:Bash post-write file-content scan to catch heredoc, python-exec, and sed paths
- [x] Consider: does the post-write scan need to detect "what was written"? Resolved: scan modified files in the working tree via `git status --porcelain` plus `git diff` for added-line filtering. Brittle to parse the Bash command itself; file-content scan is robust across heredoc, redirect, in-place sed, and `python -c` shapes.
- [x] Create reproduction test (heredoc write with em-dash, expect block). Five inline test cases run during implementation: clean tree, untracked-with-em-dash, untracked-marker-only (whitelist), untracked-marker-plus-extra, tracked-diff-em-dash. All pass.
- [x] Create INVEST story for permanent fix. Shipped in this commit.

## Fix Released

PostToolUse:Bash em-dash content scan added at `.claude/hooks/no-em-dash-bash.sh` and wired into `.claude/settings.json` PostToolUse section, matcher `Bash`. Hook reads PostToolUse JSON payload, scans the working tree via `git status --porcelain`, and for each modified file checks added lines (against HEAD for tracked files, full content for untracked) for U+2014. The hook contains zero literal em-dashes; the search byte sequence is constructed via `printf '\xe2\x80\x94'` so the file does not trigger its sibling PreToolUse hook when written or edited. A narrow whitelist exempts the contractual `- **Upstream report pending** (em-dash) external dependency identified` marker line that the upstream `wr-itil:work-problems` SKILL appends on `upstream-blocked` parks. Removing the whitelist is tracked in P030.

Architect review: PASS (no new ADR required; precedent-following, follows ADR-006 Pre+Post pairing pattern and ADR-009 project-local hook carve-out).
JTBD review: PASS (internal toolchain; no persona job has a workflow that produces em-dashes via Bash).

## Dependencies

- **Blocks**: (none)
- **Blocked by**: P024 (closed; the `.claude/**` permission entries that allow editing the hook file are in place)
- **Composes with**: P030 (upstream marker wording amendment, lets the whitelist be removed)

## Related

- .claude/hooks/no-em-dash.sh (PreToolUse:Edit|Write, first line of defence)
- .claude/hooks/no-em-dash-bash.sh (PostToolUse:Bash, this fix)
- docs/VOICE-AND-TONE.md (em-dash policy)
- docs/decisions/006-tdd-enforcement-via-hooks.accepted.md (Pre+Post pairing precedent)
- docs/problems/030-work-problems-skill-md-marker-wording-uses-em-dash.open.md (whitelist removal follow-up)
