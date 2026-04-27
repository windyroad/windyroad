# Problem 032: Assistant writes ticket bodies and claims about project state without verifying current code/config first

**Status**: Verification Pending
**Reported**: 2026-04-27
**Priority**: 16 (Significant). Impact: Significant (4) x Likelihood: Likely (4)
**Effort**: S (memory-note + optional hook + optional CLAUDE.md addition)
**WSJF**: (16 x 1.0) / 1 = 16.0

## Description

The assistant repeatedly makes assertions about project hooks, gates, and configuration based on memory of related tickets or upstream patterns rather than reading the actual current state. The user has had to correct multiple times in single sessions. Specific examples from this 2026-04-27 session:

- Asserted "no ship-gate on push/publish/deploy" based on P012 ticket prose without reading `git-push-gate.sh`. User corrected: push and release ARE gated. The corrected scope is captured in P012 (rescoped 2026-04-27).
- Asserted that all `.claude/**` writes are blocked, when in fact `.claude/settings.json` and `.claude/hooks/*` work fine; only `.claude/skills/**` and `.claude/agents/**` hit the gate. P024 documents the actual blocked surface.
- Architect-PASS marker semantics: asserted strict-string parsing was the fix path without reading `architect-mark-reviewed.sh` carefully (it does grep "Architecture Review: PASS" but the marker creation logic has more nuance). P021 captures the actual root cause.

The pattern is: the assistant trusts ticket prose written by a prior session, treats it as ground truth, and writes new tickets, design notes, or implementation choices on top of that prose without re-reading the source files. When prior-session prose was wrong (P012 was wrong), the new work compounds the error.

## Symptoms

- Tickets get created with incorrect framing because the assistant trusts ticket prose written by a prior session instead of re-reading the code.
- Design discussions waste time on phantom problems that are already solved.
- User's documented preference (memory `feedback_verify_from_own_observation.md`) is to verify from in-session evidence, but the discipline isn\'t applied to project-state claims (only to scan-for-evidence tasks).
- User correction-signal patterns ("are you sure...?", "DON\'T claim X without checking") fire repeatedly within a single session.

## Workaround

User explicitly corrects each instance ("are you sure...?", "DON\'T claim X without checking"). Doesn\'t scale; relies on the user catching every wrong claim before it lands in a ticket or commit.

## Impact Assessment

- **Who is affected**: Tom (review load), the integrity of docs/problems/ (tickets accumulate wrong framing), and downstream sessions (which then trust the wrong prose and compound the error).
- **Frequency**: Likely. Three confirmed instances in this single 2026-04-27 session; the pattern is recurrent across recent sessions whenever the assistant is reasoning about hook/gate/config state.
- **Severity**: Significant. Wrong tickets become design constraints that waste time when they reach implementation; wrong claims in commit messages or PR bodies pollute the audit trail.

## Root Cause Analysis

### Root Cause

The assistant has a documented preference (memory `feedback_verify_from_own_observation.md`) to verify scan-for-evidence tasks from in-session observation rather than from prior-conversation memory. The preference is encoded narrowly: "for analytical tasks, scan for evidence in the current session". It does NOT extend to project-state claims (hook contents, gate behaviour, config file shapes). Since most state-of-the-project assertions feel like recall rather than analysis, the assistant treats them as cheap and skips the verification step.

The CLAUDE.md global discipline note is silent on this specific pattern. Hooks fire on Edit/Write but not on the moment of drafting a claim in prose.

### Fix Strategy

Three levers, not mutually exclusive:

1. **Memory note** (cheapest, fastest): write `~/.claude/projects/-Users-tomhoward-Projects-windyroad/memory/feedback_verify_project_state_before_writing.md`. Encode: "before writing a ticket body, asserting current hook/skill/config state, or proposing a fix path that depends on existing behaviour, read the actual file from disk first. Do NOT trust prior-session ticket prose as ground truth on hook/gate/config behaviour. The verification cost is low (one Read or grep); the cost of compounding wrong claims is high (P012 had to be rescoped after one such error)." Cross-reference `feedback_verify_from_own_observation.md` so both feedback notes appear in the index.
2. **Hook** (more intrusive, more durable): UserPromptSubmit pattern detector that injects "VERIFY FIRST: read the file, don\'t trust ticket prose" reminder when the assistant\'s next action is likely to draft a ticket body or assert project state. Pattern surface: prompts containing "rescope", "create problem", "assert", "claim", "verify", "the gate does X". Cost: one new hook script, one settings.json wire-up.
3. **CLAUDE.md addition** (durable, inherited by fresh sessions): add a short discipline note to the project CLAUDE.md so a fresh session inherits the rule from prompt 1. Sibling section to "Mandatory Accessibility Check" titled e.g. "Verify project state from source, not from prior-session prose".

Recommend starting with lever 1 (memory) and lever 3 (CLAUDE.md). Defer lever 2 (hook) until a later session shows the memory + CLAUDE.md combination is insufficient.

### Investigation Tasks

- [x] Write `feedback_verify_project_state_before_writing.md` with body matching the lever 1 description above.
- [x] Update `MEMORY.md` index with the new entry.
- [x] Cross-reference `feedback_verify_from_own_observation.md` in the new memory.
- [x] Add the CLAUDE.md discipline note (lever 3) and confirm it survives the next session restart.
- [x] Defer lever 2 (hook) until a follow-up session demonstrates lever 1 + 3 are insufficient.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P019 (proactivity-on-dirty-state, same family of assistant-discipline gaps)

## Related

- P019 (Claude does not proactively act on ambient dirty state during retrospective and wrap-up; same family of assistant-discipline gaps closed by memory-layer notes)
- Memory `feedback_verify_from_own_observation.md` (existing scan-for-evidence preference; this ticket extends it to project-state claims)
- This 2026-04-27 retro session\'s correction events: P012 rescope, .claude/** scope correction, architect-PASS marker semantics
- P012 (rescoped 2026-04-27 after this exact verification gap landed wrong framing)
- **Upstream report pending**: false positive; detection misfire (P063 strict detection fired on the descriptive phrase "upstream patterns" in the ticket prose; this ticket is internal-toolchain assistant discipline, not an external dependency)

## Fix Released

**Released**: 2026-04-27

**Fix summary**: Two of the three planned levers shipped. Lever 2 (the optional UserPromptSubmit hook) deferred per the original Fix Strategy until lever 1 + 3 prove insufficient.

- **Lever 1 (memory note)**: `~/.claude/projects/-Users-tomhoward-Projects-windyroad/memory/feedback_verify_project_state_before_writing.md` written. Encodes the "read the file before asserting hook/skill/config behaviour" discipline, cross-references the three correction events from this session (P012 framing, .claude/** scope, architect-PASS marker semantics), and lists anti-patterns the rule blocks. MEMORY.md index updated with a sibling pointer line.
- **Lever 3 (CLAUDE.md addition)**: New "Verify before asserting" section appended to project `CLAUDE.md` immediately after the `<!-- accessibility-agents: end -->` marker. One paragraph that cites the memory note path and references P032 as origin. Survives session restart since CLAUDE.md is loaded into every fresh main-session context.
- **Lever 2 (UserPromptSubmit hook)**: deferred. Re-open this ticket if a future session shows the memory + CLAUDE.md combination is insufficient.

**Verification trigger**: the next assistant turn that asserts current project state (hook contents, gate behaviour, config file shape) should now READ the file before asserting, not paraphrase prior-session ticket prose. If a correction-signal fires on a project-state claim ("are you sure...?", "DON\'T claim X without checking") within the next few sessions, levers 1 + 3 are insufficient and lever 2 (the hook) needs to land.
