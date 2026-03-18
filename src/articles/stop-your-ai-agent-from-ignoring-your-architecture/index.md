---
date: '2026-03-17'
title: 'Stop your AI agent from ignoring your architecture'
author: 'Tom Howard'
tags: ['ai coding', 'claude code', 'software delivery']
draft: true
---

An AI agent makes architectural decisions constantly. Add a dependency, change a build script, restructure a config file. Each choice is reasonable in isolation. None of them get written down.

This is the knowledge management version of technical debt. Six months later, someone asks why the project uses rehype-highlight instead of Shiki. The answer is in a conversation that no longer exists. <span data-pull>The decision was sound. The reasoning is gone.</span>

A hook-based gate can close this gap. It intercepts edits to project files and requires an architecture review before the edit proceeds. The reviewer checks proposed changes against existing decision records in `docs/decisions/` and flags when a new decision should be documented.

## The problem

Architecture Decision Records solve a known problem: decisions made verbally or in chat disappear. The [MADR format](https://adr.github.io/madr/) (Markdown Any Decision Records) gives them structure. Context, options considered, rationale, consequences, reassessment criteria.

<span data-pull>The format is not the hard part. The hard part is remembering to write them.</span> An AI agent adding a dependency to `package.json` will not stop to ask itself whether this choice deserves a decision record. It will install the package and move on.

The same problem exists with compliance. If decision 001 says "use rehype-highlight for syntax highlighting," nothing stops the agent from adding `@shikijs/rehype` to `package.json` in a later session. The decision exists. The agent doesn't check it.

## Five hooks, one gate

Five hooks enforce the gate. Four follow a cycle: detect that the project has an architect agent, block edits until the architect reviews them, unlock the block when the review passes, reset the block when the turn ends. A fifth hook blocks exiting plan mode without a review. This is a variation of the pattern used for [voice and tone enforcement](/blog/enforcing-voice-and-tone-with-claude-code-hooks), with additional hardening.

![Flow diagram showing the five-hook architect gate: a UserPromptSubmit hook detects architect.md and injects context, a PreToolUse hook checks for a session marker with TTL and drift validation and blocks edits if invalid, a PostToolUse hook creates the marker only when the architect verdict is PASS, a Stop hook removes the marker so the next turn starts locked, and a fifth PreToolUse hook on ExitPlanMode checks the same marker to block plan exit without review.](/img/social/architect-five-hooks.svg)

### 1. Detection (UserPromptSubmit)

Every prompt, a hook checks whether `.claude/agents/architect.md` exists in the project. If it does, the hook injects an instruction telling the AI to delegate to the architect agent before editing any project file.

```bash
if [ -f ".claude/agents/architect.md" ]; then
  cat <<'HOOK_OUTPUT'
INSTRUCTION: MANDATORY ARCHITECTURE CHECK. YOU MUST FOLLOW THIS.
DETECTED: .claude/agents/architect.md exists in this project.

This is a NON-OPTIONAL instruction. You MUST use the architect agent
before editing any project file. This includes source code, configuration,
CI workflows, hook scripts, build scripts, and decision files.
HOOK_OUTPUT
fi
```

The trigger is the agent definition itself, not any external process document. The entire decision management process is embedded in the agent definition so the system has no external dependencies. Drop the agent file into a repo, wire the hooks, and it works.

### 2. The gate (PreToolUse)

A PreToolUse hook fires before every Edit or Write call. It parses the tool input with `jq` and checks whether an architect session marker exists:

```bash
INPUT=$(cat)

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty') || true
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty') || true

if [ -z "$SESSION_ID" ]; then
  # Fail-closed: block on parse failure
  cat <<'EOF'
{ "hookSpecificOutput": { "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "BLOCKED: Could not parse hook input." } }
EOF
  exit 0
fi
```

If the file is not excluded (CSS, images, lockfiles, fonts, memory files) and no valid session marker exists, the edit is denied.

### 3. The unlock (PostToolUse)

After the AI calls the Agent tool, a PostToolUse hook checks whether the subagent was the architect and whether the review passed:

```bash
VERDICT_FILE="/tmp/architect-verdict"
VERDICT=""
if [ -f "$VERDICT_FILE" ]; then
  VERDICT=$(cat "$VERDICT_FILE")
  rm -f "$VERDICT_FILE"
fi

case "$VERDICT" in
  PASS)
    touch "/tmp/architect-reviewed-${SESSION_ID}" ;;
  FAIL)
    ;; # Do NOT create marker
  *)
    # No verdict file: allow to prevent permanent lockout
    touch "/tmp/architect-reviewed-${SESSION_ID}" ;;
esac
```

The architect agent writes `PASS` or `FAIL` to `/tmp/architect-verdict` via Bash. The unlock hook reads and deletes it. If the verdict is FAIL, no marker is created and edits stay blocked until the issues are resolved and the architect is re-run.

The missing-verdict fallback defaults to PASS. Without this, an agent error or timeout would lock the gate permanently for the rest of the session. The instruction layer (the detection hook telling the AI to resolve issues before editing) provides a second line of defence.

### 4. Reset and plan gate (Stop + PreToolUse: ExitPlanMode)

A Stop hook removes the marker when the AI finishes responding, so the next prompt starts locked. A fifth hook fires on `ExitPlanMode` and checks the same edit marker. No separate marker is needed. The `ExitPlanMode` matcher on the hook is itself proof that the AI is in plan mode.

## Marker validity

A marker file in `/tmp` is not enough. Three checks run before the gate allows an edit through.

![Marker validity flow: an edit attempt passes through three sequential checks. First, a TTL check verifies the marker is younger than ARCHITECT_TTL (default 600 seconds), blocking if stale. Second, a drift check compares the stored hash of docs/decisions/ files against the current hash, blocking if any decision file changed. Third, if both pass, the edit proceeds and the marker timestamp is refreshed, creating a sliding window so the next edit gets another 10 minutes.](/img/social/architect-marker-validity.svg)

**TTL.** The marker has a configurable time-to-live, defaulting to 600 seconds. If the marker is older than this, it is removed and the gate blocks. The TTL is configurable via the `ARCHITECT_TTL` environment variable.

```bash
TTL_SECONDS="${ARCHITECT_TTL:-600}"
NOW=$(date +%s)
MARKER_TIME=$(_mtime "$MARKER")
AGE=$(( NOW - MARKER_TIME ))
if [ "$AGE" -lt "$TTL_SECONDS" ]; then
  # Still valid, proceed to drift check
fi
```

**Sliding window.** Each successful gate pass refreshes the marker timestamp. A long editing session is not interrupted as long as edits are less than 10 minutes apart. The TTL catches abandoned markers, not active work.

**Drift detection.** When the unlock hook creates a marker, it also stores a content hash of all files in `docs/decisions/`:

```bash
HASH=$(find docs/decisions -name '*.md' -not -name 'README.md' \
  -print0 | sort -z | xargs -0 cat 2>/dev/null \
  | _hashcmd | cut -d' ' -f1)
echo "$HASH" > "/tmp/architect-reviewed-${SESSION_ID}.hash"
```

Before allowing an edit, the gate recomputes the hash and compares it to the stored value. If a decision file changed since the review, the marker is invalidated and a re-review is required. <span data-pull>The gate catches decisions that change under your feet, not just decisions that existed at review time.</span>

The hash function is portable: it tries `md5sum`, falls back to `md5 -r` (macOS native), then `shasum`. The `stat` call for TTL checks tries GNU `stat -c%Y` before macOS `/usr/bin/stat -f%m`. The hooks run on both platforms without Homebrew dependencies.

## The reviewer

The architect agent is defined in `.claude/agents/architect.md`. It has read-only access (Read, Glob, Grep) plus Bash for writing the verdict file. It cannot edit project files.

It checks five things, in order of importance:

**Existing decision compliance.** For each decision in `docs/decisions/`, does the proposed change conflict with the decision's outcome? Does it violate documented constraints or consequences?

**Confirmation criteria.** Many decisions include a Confirmation section describing how to verify compliance (e.g. "Client JS does not contain hardcoded API URLs beyond the entry point"). The agent checks proposed code against these criteria and flags violations as `[Confirmation Violation]`.

**New decision detection.** Does the change represent an undocumented architectural choice? A new dependency, a new CI workflow, a structural reorganisation. The agent is told to be pragmatic: focus on choices that affect how the team works, what dependencies the project carries, or how code flows to production.

**Decision quality.** When a change includes a new decision file, does it follow MADR 4.0 format? Required frontmatter, at least two considered options, reassessment criteria.

**Decision staleness (advisory).** If an `accepted` decision is older than 6 months, the agent flags `[Stale Decision]`. If a `reassessment-date` has passed, `[Reassessment Overdue]`. These do not affect the PASS/FAIL verdict.

A typical review:

> **Architecture Review: PASS**
> No conflicts with existing decisions. No new architectural decision required.

Or:

> **Architecture Review: ISSUES FOUND**
>
> 1. **[Undocumented Decision]** - File: `package.json`
>    - **Issue**: Adding `@shikijs/rehype` as a dependency. Decision 001 chose `rehype-highlight` over Shiki.
>    - **Existing Decision**: 001-use-rehype-highlight-for-syntax-highlighting
>    - **Action**: This conflicts with an accepted decision. Either update the decision or remove the dependency.

After either verdict, the agent writes to the verdict file:

```bash
echo "PASS" > /tmp/architect-verdict
```

## Self-contained by design

The design has one dependency: the agent file itself. The hooks check for `.claude/agents/architect.md`. The agent contains the full decision lifecycle (statuses, MADR 4.0 format, naming conventions, superseding process). Drop it into any repo and the system works, even if `docs/decisions/` doesn't exist yet. The agent handles an empty or missing decisions directory gracefully and recommends creating it when the first decision needs documenting.

## What gets gated

Everything except stylesheets, images, lockfiles, fonts, and memory files.

Gating only config files sounds reasonable until decisions specify how code should behave. If a decision says "all API responses must include RFC 8288 Link headers" or "resource URIs must be flat, no nesting," those rules are enforced in source files, not in config. <span data-pull>An architecture gate that only watches config files is checking the blueprint while ignoring the building.</span>

The architect agent is told to be pragmatic: a refactored function or a bug fix gets a quick PASS. A new API endpoint that skips an established pattern gets flagged.

## Decisions as living documents

Decisions follow a lifecycle. They start as `proposed`, move to `accepted` after production validation, and eventually get `deprecated` or `superseded`. The status lives in the filename: `001-use-rehype-highlight.proposed.md` becomes `001-use-rehype-highlight.accepted.md` after the site ships with rehype-highlight and nothing breaks.

In this project, that decision started as proposed when the agent flagged `rehype-highlight` as an undocumented dependency. The MADR record captured why Shiki was rejected (bundle size, build complexity) and when to revisit (if rehype-highlight drops maintained status). Three deploys later, the decision moved to accepted. Now when the agent sees a new syntax highlighting dependency in `package.json`, it has context: not just what was chosen, but why, and under what conditions to reconsider.

The lifecycle matters because the agent checks compliance against `accepted` and `proposed` decisions but ignores `superseded` ones. A rejected decision prevents re-proposing the same approach without new evidence.

## Tradeoffs

The architect agent call adds 10-20 seconds per turn that touches project files. The sliding TTL means this cost is paid once per session, not once per edit, as long as edits are less than 10 minutes apart.

The "when NOT to flag" list is critical. Without it, the agent flags every version bump, every bug fix to a config file, every cosmetic change. The pragmatism criteria (temporary, obvious, reversible, local) keep the signal-to-noise ratio manageable.

False negatives are more dangerous than false positives. The agent might miss a decision-worthy change because the "when NOT to flag" list was too generous, or because the change didn't match any of the new-decision-detection patterns. There's no exhaustive list of what constitutes an architectural decision. The agent approximates.

The verdict gating matters more than it looks. In an earlier version of this system (before the PASS/FAIL verdict file), the architect flagged issues but the gate unlocked regardless. The AI could proceed with edits while leaving the flagged issues unresolved.

A real example: the AI was removing an unused API endpoint. The architect flagged that a smoke test depended on it and recommended updating the smoke test to check something that validates the health of the system. Without verdict gating, the AI proceeded with the rest of the task, left the API in place, left the smoke test unchanged, and moved on. The architect caught the problem. The AI chose the path of least resistance: do nothing about it.

With verdict gating, the gate stays locked after ISSUES FOUND. The AI has two options: fix the smoke test and remove the API properly, or stop. No middle ground where you half-do the work and leave broken dependencies in place. The hook system cannot make the AI choose the right fix. But it can prevent the AI from ignoring the issue and continuing as if the review never happened.

When the agent flags something you disagree with, override it. The gate blocks the AI, not you. When a hook denies an edit, Claude Code shows the denial reason and asks whether to proceed. Type "y" and the edit goes through. The architect review still happened; you just chose to act on it differently than the agent recommended.

## Adapting this for your project

Start with the agent file. Drop `.claude/agents/architect.md` into your repo. The embedded process works out of the box with an empty `docs/decisions/` directory. The first time the agent flags an undocumented decision, create the directory and the first record.

Wire the five hooks into `.claude/settings.json`. Detection in `UserPromptSubmit`, gate in `PreToolUse` (matcher: `Edit|Write`), plan gate in `PreToolUse` (matcher: `ExitPlanMode`), unlock in `PostToolUse` (matcher: `Agent`), reset in `Stop`. The hook scripts are minimal shell scripts, each under 40 lines.

Adjust the scope. The exclusion list matches this project's structure. If you want to gate only infrastructure files instead of everything, modify the case statement to match only the file types you care about. The pattern is the same.

Write your first decision. Pick a technology choice you've already made and document why. The MADR 4.0 format gives you: context, options considered, outcome, consequences, and reassessment criteria. The reassessment criteria are the most valuable part. They tell future-you (and the agent) when to revisit the decision instead of following it blindly.

The full configuration is in the public repo at [github.com/windyroad/windyroad](https://github.com/windyroad/windyroad). The [Claude Code hooks documentation](https://docs.anthropic.com/en/docs/claude-code/hooks) covers the full event model.
