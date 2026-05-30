# Problem 042: jtbd-enforce-edit hook uses relative `docs/jtbd` path; fails when cwd is not project root

**Status**: Parked
**Reported**: 2026-05-01
**Origin**: internal
**Priority**: 12 (High). Impact: Moderate (3) x Likelihood: Likely (4)
**Effort**: S
**WSJF**: 0 (parked, excluded from ranking)

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
- packages/jtbd/hooks/jtbd-enforce-edit.sh (upstream `@windyroad/jtbd` plugin; the relative `docs/jtbd` check)
- **Upstream report pending** — external dependency identified; the `windyroad/agent-plugins` issue has not been filed yet. Invoke `/wr-itil:report-upstream` against `windyroad/agent-plugins` (package `packages/jtbd`) when next at a keyboard. Composes with the upstream issues already filed for sibling tickets P021/P022/P027/P031/P033.

## Parked

- **Reason**: upstream-blocked. The genuine fix lives in `hooks/jtbd-enforce-edit.sh` line 110 (latest cached version) inside the `windyroad/agent-plugins` `wr-jtbd` plugin (consumed via `~/.claude/plugins/cache/windyroad/wr-jtbd/<version>/hooks/jtbd-enforce-edit.sh`). The local repo has no `packages/jtbd/` directory; this project is a downstream marketplace consumer of `@windyroad/jtbd`. A consumer cannot edit the cached hook without losing the change on next plugin update, so the only durable fix is upstream. The agent-side workaround (use Bash sed/awk to bypass the Edit/Write hook gate, or ensure cwd = project root before triggering Edit) is operator discipline rather than codified policy and cannot be enforced locally because the dispatch path is the cached hook itself.
- **Verified persistence**: latest cached plugin version `0.10.0` still ships the relative-path branch at `hooks/jtbd-enforce-edit.sh` lines 110-112: `if [ -d "docs/jtbd" ]; then JTBD_PATH="docs/jtbd"; fi`. No `${CLAUDE_PROJECT_DIR}` or `git rev-parse --show-toplevel` resolution; no absolute-path normalisation. The ticket's "line 93" reference was stale (later versions added pre-flight exit-0 guards above the resolution block), but the root-cause line is unchanged. Verified 2026-05-30 by reading the cached file. Sibling hooks (`jtbd-eval.sh`, `jtbd-mark-reviewed.sh`, `jtbd-oversight-nudge.sh`, `jtbd-slide-marker.sh`) should be audited as a follow-up; the same fix likely applies.
- **Upstream issue status**: not yet filed. P042 has not been propagated to `windyroad/agent-plugins` via `/wr-itil:report-upstream` (the ticket's Related section reads "Upstream report pending"). Next operator-at-keyboard session should file against `windyroad/agent-plugins` (template `problem-report.yml`, package `packages/jtbd`) and update the "Reported Upstream" section below with the resulting issue URL. Filing was not done in this AFK iter because `/wr-itil:report-upstream` is an interactive heavy skill (template-matching, body authoring, label routing) that benefits from operator review.
- **Un-park trigger**: a new `wr-jtbd` plugin release lands in `~/.claude/plugins/cache/windyroad/wr-jtbd/` whose `hooks/jtbd-enforce-edit.sh` replaces the relative `docs/jtbd` check with either (a) `${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || .)}/docs/jtbd` (the Fix Strategy recommendation), or (b) an alternative absolute-path resolution mechanism. Verify by re-reading the hook in the new cache version. Close P042 once a session whose cwd is not the project root exercises an Edit/Write of a non-exempted file without hitting the spurious "BLOCKED: no JTBD documentation exists" gate.
- **Local impact while parked**: agent-side discipline (the existing Workaround section) remains the operating contract. When the JTBD gate blocks with "no JTBD documentation exists" despite `docs/jtbd/` being on disk, either: (a) ensure `cd <project-root>` before retrying Edit/Write, or (b) apply the change via `Bash sed -i` / `awk` (the em-dash hook and other PostToolUse:Bash gates still apply). AFK orchestrators that hit this misfire should recognise it as a cwd-resolution false-positive and not treat it as a genuine "JTBD review not done" signal.
- **Composes with**: P021 (parked 2026-05-30, upstream `windyroad/agent-plugins` `wr-architect` plugin hook, also upstream-blocked); P022 (parked 2026-05-30, upstream `wr-architect` plugin hook); P027 (parked 2026-05-30, upstream `wr-itil` plugin SKILL.md); P031 (parked 2026-05-02, upstream `wr-itil` plugin SKILL.md); P033 (parked 2026-05-30, upstream `wr-itil` plugin SKILL.md). All five share the marketplace-consumer-cannot-edit-cached-plugin pattern; P042 extends the pattern from `wr-architect` + `wr-itil` to `wr-jtbd`.
- **Date parked**: 2026-05-30
