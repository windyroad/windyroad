# Problem 007: Project-local subagents defined mid-session are not discoverable until Claude Code session restart

**Status**: Closed
**Reported**: 2026-04-17
**Closed**: 2026-04-17 (user-verified via `wr-sw-critic` smoke test in a fresh session: agent returned `CRITIC_AGENT_READY`).
**Priority**: 6 (Medium-Low). Impact: Moderate (3) x Likelihood: Likely (2)

## Description

A new project-local subagent was defined at `.claude/agents/wr-sw-critic.md` during the 2026-04-17 session to implement the ADR 016 strengths/weaknesses critic pattern. When the skill tried to invoke it via `Agent(subagent_type: "wr-sw-critic", ...)`, the runtime returned `Agent type 'wr-sw-critic' not found. Available agents: [...]` and listed every other registered agent. The agent registry is populated at session start and does not refresh when `.claude/agents/*.md` is added, removed, or edited during the session.

## Symptoms

- `Agent(subagent_type: "wr-sw-critic", ...)` fails with "Agent type 'wr-sw-critic' not found"
- The file exists at the correct path and passes manual inspection
- Other registered agents in `.claude/agents/` work normally
- First weekly run of the `/wr-newsletter` skill in a fresh session will succeed where the mid-session first run did not

## Workaround

Invoke `general-purpose` with the critic's full process, hard rules, and role block inlined in the prompt. Fresh-context semantics are still preserved because each Agent() call gets an independent context; the critic agent definition is effectively loaded into the general-purpose agent via prompt content. Result is indistinguishable from the registered agent for a single run, but the inline prompt must travel with every invocation and the agent file itself stays dormant until session restart.

## Impact Assessment

- **Who is affected**: anyone building new project-local subagents mid-session. Specifically bites the `/wr-newsletter` pipeline the first time it runs after a critic-agent edit.
- **Frequency**: every session in which a new `.claude/agents/*.md` file is created, until session restart
- **Severity**: Medium. Workaround is reliable but adds 50+ lines of prompt text per call, which is wasted tokens and a drift risk if the inline copy diverges from the on-disk file.

## Root Cause Analysis

### Root Cause

Claude Code's agent registry is loaded at session start from `.claude/agents/`, `~/.claude/agents/`, and plugin marketplace paths. There is no filesystem watcher or per-invocation re-read that would pick up new files during the session.

This is expected runtime behaviour; the failure mode only shows up when skill-authoring and skill-invoking happen in the same session (as they do when iterating on a new pipeline).

### Fix Strategy

Short-term: document the restart requirement. Add a session-start check to the skill's preamble: "if any `.claude/agents/*.md` has been edited in the current session, restart Claude Code before running the pipeline for real."

Longer-term options:
- Feature request to Claude Code for hot-reload of project-local agents when files change in `.claude/agents/`
- Alternative: package project-local critics as plugin skills (marketplace load path) instead of `.claude/agents/`, if that path has different refresh semantics
- Alternative: invoke via Skill instead of Agent where the skill wraps the critic logic and can be edited mid-session

### Investigation Tasks

- [x] Confirm the restart workaround (2026-04-17): Tom restarted the Claude Code session; `wr-sw-critic` smoke test returned `CRITIC_AGENT_READY`; retroactive validation against `src/newsletters/drafts/2026-04-17.md` ran successfully with the full 25-check rubric.
- [ ] Confirm whether plugin-delivered agents (`~/.claude/plugins/.../agents/`) have the same no-refresh behaviour as project-local (deferred, not required to close; the project-local restart workaround is sufficient for the `wr-newsletter` skill)
- [ ] Test whether renaming (not editing) a project-local agent triggers a refresh on any in-session file read (deferred, same reason)
- [ ] Document the workaround in `.claude/skills/wr-newsletter/SKILL.md` as a known failure mode (deferred, captured in `docs/BRIEFING.md` "What Will Surprise You" instead; future sessions will see the briefing)
- [ ] Consider whether to file an upstream Claude Code issue (deferred, low urgency since the workaround is cheap)

## Resolution

Session restart registered the project-local `wr-sw-critic` agent. Smoke test in the fresh session returned `CRITIC_AGENT_READY`. Retroactive validation run against the 2026-04-17 draft confirmed the agent loads, reads the rubric, and scores all 25 checks. Closed as a known limitation of Claude Code's agent-registry bootstrap; the restart workaround is documented in `docs/BRIEFING.md` so future sessions know to restart after any `.claude/agents/*.md` change.

## Related

- `.claude/agents/wr-sw-critic.md`
- `.claude/skills/wr-newsletter/SKILL.md` (steps 9 and 13 that invoke the critic)
- ADR 016 (SW-critic subagent pattern)
