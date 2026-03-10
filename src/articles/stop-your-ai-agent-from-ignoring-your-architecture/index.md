---
date: '2026-03-10'
title: 'Stop your AI agent from ignoring your architecture'
author: 'Tom Howard'
tags: ['ai coding', 'claude code', 'software delivery']
draft: true
---

An AI agent makes architectural decisions constantly. Add a dependency, change a build script, restructure a config file. Each choice is reasonable in isolation. None of them get written down.

This is the knowledge management version of technical debt. Six months later, someone asks why the project uses rehype-highlight instead of Shiki. The answer is in a conversation that no longer exists. <span data-pull>The decision was sound. The reasoning is gone.</span>

This system intercepts edits to architecture-bearing files and requires an architecture review before the edit proceeds. The reviewer checks proposed changes against existing decision records in `docs/decisions/` and flags when a new decision should be documented.

## The problem

Architecture Decision Records solve a known problem: decisions made verbally or in chat disappear. The [MADR format](https://adr.github.io/madr/) (Markdown Any Decision Records) gives them structure. Context, options considered, rationale, consequences, reassessment criteria.

<span data-pull>The format is not the hard part. The hard part is remembering to write them.</span> An AI agent adding a dependency to `package.json` will not stop to ask itself whether this choice deserves a decision record. It will install the package and move on.

The same problem exists with compliance. If decision 001 says "use rehype-highlight for syntax highlighting," nothing stops the agent from adding `@shikijs/rehype` to `package.json` in a later session. The decision exists. The agent doesn't check it.

## Four hooks, one gate

The system uses the same four-hook gate pattern as the [voice and tone enforcement](/blog/enforcing-voice-and-tone-with-claude-code-hooks): detect, gate, unlock, reset.

### 1. Detection (UserPromptSubmit)

Every prompt, a hook checks whether `.claude/agents/architect.md` exists in the project. If it does, the hook injects an instruction telling the AI to delegate to the architect agent before editing any architecture-bearing file.

```bash
if [ -f ".claude/agents/architect.md" ]; then
  cat <<'HOOK_OUTPUT'
INSTRUCTION: MANDATORY ARCHITECTURE CHECK. YOU MUST FOLLOW THIS.
DETECTED: .claude/agents/architect.md exists in this project.

This is a NON-OPTIONAL instruction. You MUST use the architect agent
before editing any architecture-bearing file: package.json, config files
(*.config.*, tsconfig*), CI workflows (.github/workflows/*), hook scripts
(.claude/hooks/*), build/deploy scripts (scripts/*), or decision files
(docs/decisions/*).
HOOK_OUTPUT
fi
```

The trigger is the agent definition itself, not any external process document. The entire decision management process is embedded in the agent definition so the system has no external dependencies. Drop the agent file into a repo, wire the hooks, and it works.

### 2. The gate (PreToolUse)

A PreToolUse hook fires before every Edit or Write call. It checks whether the target file is an architecture-bearing file:

```bash
IS_ARCH=false
case "$FILE_PATH" in
  */package.json)
    IS_ARCH=true ;;
  */tsconfig*.json)
    IS_ARCH=true ;;
  */.github/workflows/*.yml|*/.github/workflows/*.yaml)
    IS_ARCH=true ;;
  */.claude/hooks/*.sh)
    IS_ARCH=true ;;
  */.claude/settings.json)
    IS_ARCH=true ;;
  */scripts/*.sh|*/scripts/*.js|*/scripts/*.ts|*/scripts/*.mjs)
    IS_ARCH=true ;;
  */docs/decisions/*.md)
    IS_ARCH=true ;;
esac
```

If the file matches and no session marker exists, the edit is denied:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "BLOCKED: Cannot edit architecture-bearing file 'package.json' without architecture review. You MUST first delegate to architect using the Agent tool."
  }
}
```

### 3. The unlock (PostToolUse)

After the AI calls the Agent tool, a PostToolUse hook checks whether the subagent was the architect. If so, it creates the session marker:

```bash
case "$SUBAGENT" in
  *architect*)
    touch "/tmp/architect-reviewed-${SESSION_ID}" ;;
esac
```

### 4. The reset (Stop)

A Stop hook removes the marker when the AI finishes responding, so the next prompt starts locked. Each turn that touches an architecture file gets a fresh review.

## The reviewer

The architect agent is defined in `.claude/agents/architect.md`. Like the voice-and-tone-lead, it has read-only access (Read, Glob, Grep) and cannot edit files.

It checks three things:

**Existing decision compliance.** For each decision in `docs/decisions/`, does the proposed change conflict with the decision's outcome? Does it violate documented constraints or consequences?

**New decision detection.** Does the change represent an undocumented architectural choice? A new dependency, a new CI workflow, a structural reorganisation. Not every config tweak needs a record. The agent is told to be pragmatic: focus on choices that affect how the team works, what dependencies the project carries, or how code flows to production.

**Decision quality.** When a change includes a new decision file, does it follow MADR 4.0 format? Required frontmatter, at least two considered options, reassessment criteria.

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

## Self-contained by design

The decision management process is embedded directly in the architect agent definition. Earlier versions relied on a separate `DECISION-MANAGEMENT.md` file in the project root. That created a coupling: the hooks checked for the file's existence, the agent read it on every invocation, and if someone deleted it, the whole system silently stopped working.

The current design has one dependency: the agent file itself. The hooks check for `.claude/agents/architect.md`. The agent contains the full decision lifecycle (statuses, MADR 4.0 format, naming conventions, superseding process). Drop it into any repo and the system works, even if `docs/decisions/` doesn't exist yet. The agent handles an empty or missing decisions directory gracefully and recommends creating it when the first decision needs documenting.

## What gets gated

Everything except stylesheets, images, lockfiles, and fonts.

The earlier version of this system only gated infrastructure files: package.json, configs, CI workflows, hooks, scripts. Source code was excluded on the theory that architecture lives in config, not in code.

That theory breaks down when decisions specify how code should behave. If a decision says "all API responses must include RFC 8288 Link headers" or "resource URIs must be flat, no nesting," those rules are enforced in source files, not in config. <span data-pull>An architecture gate that only watches config files is checking the blueprint while ignoring the building.</span>

The gate now covers all project files. The architect agent is told to be pragmatic: a refactored function or a bug fix gets a quick PASS. A new API endpoint that skips an established pattern gets flagged.

## Decisions as living documents

The embedded process follows a lifecycle. Decisions start as `proposed` and move to `accepted` after production validation. They can be `deprecated` when phased out or `superseded` when replaced by a better approach.

The status lives in the filename: `001-use-rehype-highlight.proposed.md` becomes `001-use-rehype-highlight.accepted.md` after the site ships with rehype-highlight and nothing breaks.

This matters because the architect agent checks compliance against accepted and proposed decisions. A superseded decision is historical context. A rejected decision prevents re-proposing the same approach. The lifecycle gives the agent enough information to make pragmatic judgements about what conflicts and what doesn't.

## The bootstrapping problem

Wiring the hooks required editing `.claude/settings.json`, which is itself an architecture-bearing file. The moment the first two hooks were active (detection and gate), the gate blocked further edits to `settings.json` because the unlock hook wasn't wired yet.

The fix was straightforward. The gate only intercepts Edit and Write tool calls, not Bash commands. A Python script writing JSON to the file bypassed the gate cleanly. This is not a security hole. The gate is designed to catch the AI's normal editing workflow, not to be tamper-proof. If someone wants to bypass it with a shell command, they can. The value is in catching the default path, not in being unbreakable.

## Tradeoffs

The architect agent call adds 10-20 seconds per turn that touches architecture files. For most work this doesn't matter because architecture changes are infrequent relative to source code changes.

The "when NOT to flag" list is critical. Without it, the agent flags every version bump, every bug fix to a config file, every cosmetic change. The pragmatism criteria (temporary, obvious, reversible, local) keep the signal-to-noise ratio manageable.

False negatives are more dangerous than false positives. The agent might miss a decision-worthy change because the "when NOT to flag" list was too generous, or because the change didn't match any of the new-decision-detection patterns. There's no exhaustive list of what constitutes an architectural decision. The agent approximates.

When the agent flags something you disagree with, override it. The gate blocks the AI, not you. Claude Code prompts for confirmation on denied edits, and you can approve directly.

## Adapting this for your project

Start with the agent file. Drop `.claude/agents/architect.md` into your repo. The embedded process works out of the box with an empty `docs/decisions/` directory. The first time the agent flags an undocumented decision, create the directory and the first record.

Wire the four hooks into `.claude/settings.json`. Detection in `UserPromptSubmit`, gate in `PreToolUse` (matcher: `Edit|Write`), unlock in `PostToolUse` (matcher: `Agent`), reset in `Stop`. The hook scripts are minimal shell scripts, each under 30 lines.

Adjust the scope. The gated file patterns match this project's structure. If your CI lives in `.circleci/` instead of `.github/workflows/`, update the case statement. If your deploy scripts are in `deploy/` instead of `scripts/`, change the path. The pattern is the same.

Write your first decision. Pick a technology choice you've already made and document why. The MADR 4.0 format gives you: context, options considered, outcome, consequences, and reassessment criteria. The reassessment criteria are the most valuable part. They tell future-you (and the agent) when to revisit the decision instead of following it blindly.

The full configuration is in the public repo at [github.com/windyroad/windyroad](https://github.com/windyroad/windyroad). The [Claude Code hooks documentation](https://docs.anthropic.com/en/docs/claude-code/hooks) covers the full event model.
