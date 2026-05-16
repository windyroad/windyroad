# Problem 042: jtbd-enforce-edit hook uses relative `docs/jtbd` path; fails when cwd is not project root

**Status**: Open
**Reported**: 2026-05-01
**Priority**: 12 (Significant). Impact: Moderate (3) x Likelihood: Almost certain (4)
**Effort**: S
**WSJF**: (12 x 1.0) / 1 = 12.0

## Description

The `jtbd-enforce-edit.sh` hook (line 93) checks `if [ -d "docs/jtbd" ]` using a relative path. The check passes when the hook runs with cwd = project root, fails otherwise. The hook then emits "BLOCKED: Cannot edit '<file>' because no JTBD documentation exists", which is wrong; the directory does exist, just not at the cwd-relative path.

## Symptoms

- 2026-05-01 retro turn: hook blocked Edit/Write to 2026-05-01.md and 2026-05-01.linkedin.md repeatedly with "no JTBD documentation exists" despite `docs/jtbd/` being on disk and the JTBD agent successfully reading from it
- JTBD agent uses absolute paths (resolves correctly); hook uses relative paths (fails when cwd differs)
- Workaround: edit via Bash sed/awk (which doesn't go through the Edit/Write hook)

## Workaround

For edits during sessions where the hook misfires: use `Bash` with `sed -i` or `awk` to apply changes (Bash is not gated by the Edit/Write hook). Or: ensure the hook always runs with cwd at project root.

## Root Cause Analysis

### Root Cause

Line 93 of `jtbd-enforce-edit.sh`:
```bash
if [ -d "docs/jtbd" ]; then
  JTBD_PATH="docs/jtbd"
```

Should use `${CLAUDE_PROJECT_DIR}/docs/jtbd` or resolve to absolute via `git rev-parse --show-toplevel`.

### Fix Strategy

- **Kind**: improve
- **Shape**: hook
- **Target file**: `packages/jtbd/hooks/jtbd-enforce-edit.sh` line 93 (and any sibling references)
- **Edit summary**: Replace relative `docs/jtbd` check with `${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || .)}/docs/jtbd`. Same fix likely applies to other JTBD hooks and possibly to the architect / voice-tone / style-guide hooks if they share the pattern. Audit recommended.

## Related

- 2026-05-01 retro turn (hook regression observed mid-retro)
- **Upstream report pending** — external dependency identified; invoke /wr-itil:report-upstream when ready
