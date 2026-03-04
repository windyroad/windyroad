---
date: '2026-03-04'
title: 'Enforcing pipeline discipline with Claude Code hooks'
author: 'Tom Howard'
tags: ['ci/cd', 'ai coding', 'claude code', 'deployment', 'production', 'software delivery']
---

In [the previous post](/blog/before-it-goes-live-you-should-be-able-to-click-on-it) I described a pipeline where every push to `main` ends with a live preview of the production candidate, smoke-tested and ready for human review. The idea is that nothing ships without you seeing it running.

There's a gap, though. The pipeline only works if you actually watch it. If you `git push` and then context-switch to something else, the pipeline becomes theatre: gates that run, checks that pass or fail, deploy URLs that appear in PRs you never open. The discipline only matters if it's followed.

Claude Code has a hook system that can enforce this at the point where an AI agent is about to run a command. I use it to intercept `git push` and redirect to a script that watches the pipeline and surfaces the right URL when it's done.

![Before: git push with no pipeline visibility. After: git push blocked by hook, npm run push:watch runs, pipeline watched live, preview URL surfaced automatically.](/img/social/hook-intercept-flow.svg)

## The hook

Claude Code hooks are shell scripts that fire before or after tool calls. `PreToolUse` runs before the tool executes and can deny it entirely.

The hook lives in `.claude/hooks/git-push-gate.sh` and is wired into `.claude/settings.json`:

![settings.json wiring the PreToolUse hook to git-push-gate.sh on the left, and the key intercept logic in the shell script on the right](/img/social/hook-code-card.svg)

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/git-push-gate.sh"
          }
        ]
      }
    ]
  }
}
```

The script receives the tool call as JSON on stdin. It checks whether the command is a bare `git push` and, if so, returns a denial:

```bash
INPUT=$(cat)

COMMAND=$(echo "$INPUT" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(data.get('tool_input', {}).get('command', ''))
" 2>/dev/null || echo "")

if echo "$COMMAND" | grep -qE '(^|;|&&|\|\|)\s*git push(\s|$)'; then
  cat <<'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Use `npm run push:watch` instead of `git push`. It pushes, watches the pipeline, and surfaces either the release PR URL or the test deploy URL so you can review before releasing."
  }
}
EOF
  exit 0
fi
```

When Claude tries to run `git push`, it sees the denial reason and uses `npm run push:watch` instead. The hook doesn't require any human involvement — it just reroutes the action.

## What push:watch does

`push:watch` pushes, finds the pipeline run for the current commit SHA, watches it live in the terminal, and then surfaces the right URL:

- **No pending changesets:** shows the test deploy URL and exits. Nothing to release.
- **Pending changesets:** shows the test deploy URL, then finds and watches the `release-pr-preview` workflow, then outputs the preview URL and release PR link.

The end state is always: here is the URL to look at, here is where to merge if you're satisfied.

One implementation note: when looking for the `release-pr-preview` run, the script records the push timestamp and filters for runs created *after* that time. Without this, it would immediately find the previous run (already completed) and watch that instead of the new one. The filter uses ISO 8601 string comparison — it works, but it only works if you pipe through standalone `jq` rather than using the `gh run list --jq` flag, which doesn't accept `--arg` parameters.

![Terminal session showing git push blocked by hook, npm run push:watch running, all pipeline checks passing, and the preview URL surfaced automatically](/img/social/push-watch-terminal.svg)

If either pipeline fails, the script shows which checks failed and prompts:

```
Failed checks:
  ✗ Accessibility gate

Fix the failure above, then re-run: npm run push:watch

Ask Claude: 'What pre-push or pre-commit git hook in .githooks/ could
have caught the failure in https://github.com/.../actions/runs/...'
```

This is the loop I care about. When CI catches something, the question isn't just "how do I fix this?" It's "how do I make sure this gets caught *before* CI next time?" The failure message makes that question explicit.

## Why hooks for this, not just instructions

You could tell Claude "always use `npm run push:watch` instead of `git push`." It would probably comply most of the time. But instructions drift.

![Comparison table: Guidelines are trust-based and depend on the AI remembering. Hooks are structural and enforced every time regardless of context.](/img/social/guidelines-vs-hooks.svg)

A long context window, a new session, a pasted snippet with `git push` in it — there are many ways an instruction gets forgotten.

A hook is different. It's structural enforcement. The gate doesn't care about context — it fires on every `Bash` tool call, checks the command, and denies it if it matches. The AI can't accidentally bypass it by forgetting.

This is the same principle as the pipeline itself. You could tell developers "always watch the pipeline." The pipeline enforces it by making the release PR the only path to production — and by putting the preview URL directly in that PR so opening it is one click.

The hook enforces the equivalent thing locally: watching the pipeline isn't a habit you have to remember, it's the only path available.

## The broader pattern

Claude Code's hook system is designed for exactly this kind of guardrail. The hooks I'm using in this project:

- **`UserPromptSubmit`** — runs a project health check before every prompt
- **`PreToolUse` on `Edit`/`Write`** — scans for secrets before any file is written
- **`PreToolUse` on `Bash`** — intercepts `git push` and redirects to `push:watch`

Each one turns a discipline ("don't push without watching," "don't write secrets to files") into a structural constraint that the AI can't accidentally violate.

If you're using Claude Code to ship code at any pace — and especially if you're letting it push to `main` — hooks are worth understanding. They're the difference between guidelines that depend on the AI's attention and guardrails that fire regardless.

The full hook configuration for this site is in the public repo at [github.com/windyroad/windyroad](https://github.com/windyroad/windyroad).
