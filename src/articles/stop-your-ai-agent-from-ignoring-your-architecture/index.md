---
date: '2026-03-17'
title: 'Stop your AI agent from ignoring your architecture'
author: 'Tom Howard'
tags: ['ai coding', 'claude code', 'software delivery']
draft: false
---

An AI agent makes architectural decisions constantly. Add a dependency, change a build script, restructure a config file. Each choice is reasonable in isolation. None of them get written down.

This is the knowledge management version of technical debt. Six months later, someone asks why the project uses rehype-highlight instead of Shiki. The answer is in a conversation that no longer exists. <span data-pull>The decision was sound. The reasoning is gone.</span>

A hook-based gate can close this gap. This implementation uses [Claude Code hooks](https://docs.anthropic.com/en/docs/claude-code/hooks) ([source code](https://github.com/windyroad/windyroad)), but the pattern (detect, gate, review, unlock, reset) applies to any agent system that exposes lifecycle events.

Claude Code hooks are shell scripts that run at specific points in the agent's lifecycle. `UserPromptSubmit` fires when the user sends a message. `PreToolUse` fires before the agent calls a tool (Edit, Write, Bash). `PostToolUse` fires after a tool call completes. `Stop` fires when the agent finishes its turn. Each hook receives JSON on stdin describing the event, and can inject context, allow the action, or deny it.

The gate intercepts edits to project files and requires an architecture review before the edit proceeds. The reviewer checks proposed changes against existing decision records in `docs/decisions/` and flags when a new decision should be documented.

## The problem

Architecture Decision Records solve a known problem: decisions made verbally or in chat disappear. The [MADR format](https://adr.github.io/madr/) (Markdown Any Decision Records) gives them structure. Context, options considered, rationale, consequences, reassessment criteria.

The format is not the hard part. The hard part is remembering to write them. An AI agent adding a dependency to `package.json` will not stop to ask itself whether this choice deserves a decision record. It will install the package and move on.

The same problem exists with compliance. If decision 001 says "use rehype-highlight for syntax highlighting," nothing stops the agent from adding `@shikijs/rehype` to `package.json` in a later session. The decision exists. The agent doesn't check it.

## Five hooks, one gate

Five hooks enforce the gate. Four follow a cycle: detect that the project has an architect agent, block edits until the architect reviews them, unlock the block when the review passes, reset the block when the turn ends. A fifth hook blocks exiting plan mode without a review. This is a variation of the pattern used for [voice and tone enforcement](/blog/enforcing-voice-and-tone-with-claude-code-hooks), with additional hardening.

| Role | Hook event | Script | Purpose |
|------|-----------|--------|---------|
| Detect | `UserPromptSubmit` | `architect-detect.sh` | Inject review instructions on every prompt |
| Gate | `PreToolUse` (Edit\|Write) | `architect-enforce-edit.sh` | Block edits without a valid session marker |
| Plan gate | `PreToolUse` (ExitPlanMode) | `architect-plan-enforce.sh` | Block plan exit without review |
| Unlock | `PostToolUse` (Agent) | `architect-mark-reviewed.sh` | Create marker when architect passes |
| Reset | `Stop` | `architect-reset-marker.sh` | Remove marker so next turn starts locked |

![Flow diagram showing the five-hook architect gate: a UserPromptSubmit hook detects architect.md and injects context, a PreToolUse hook checks for a session marker with TTL and drift validation and blocks edits if invalid, a PostToolUse hook creates the marker only when the architect verdict is PASS, a Stop hook removes the marker so the next turn starts locked, and a fifth PreToolUse hook on ExitPlanMode checks the same marker to block plan exit without review.](/img/social/architect-five-hooks.svg)

### The gate

The code samples below are excerpts. The complete hook scripts are each under 40 lines.

The gate is fail-closed. It parses the hook input with `jq`, and if parsing fails, the edit is blocked. From `architect-enforce-edit.sh`:

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

If the file is not excluded (CSS, images, lockfiles, fonts, memory files) and no valid session marker exists, the edit is denied. The same check runs on `ExitPlanMode`, sharing the marker.

### The unlock

The unlock only fires after the architect agent returns. It reads a verdict file that the architect writes during its review. From `architect-mark-reviewed.sh`:

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

If the verdict is FAIL, no marker is created and edits stay blocked until the issues are resolved and the architect is re-run. The missing-verdict fallback defaults to PASS to prevent permanent lockout if the agent errors out.

## Marker validity

A marker file in `/tmp` is not enough. Three checks run before the gate allows an edit through.

![Marker validity flow: an edit attempt passes through three sequential checks. First, a TTL check verifies the marker is younger than ARCHITECT_TTL (default 600 seconds), blocking if stale. Second, a drift check compares the stored hash of docs/decisions/ files against the current hash, blocking if any decision file changed. Third, if both pass, the edit proceeds and the marker timestamp is refreshed, creating a sliding window so the next edit gets another 10 minutes.](/img/social/architect-marker-validity.svg)

**TTL.** The marker has a configurable time-to-live, defaulting to 600 seconds. If the marker is older than this, it is removed and the gate blocks. The TTL is configurable via the `ARCHITECT_TTL` environment variable. From `lib/architect-gate.sh`:

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

**Drift detection.** When the unlock hook creates a marker, it also stores a content hash of all files in `docs/decisions/`. From `architect-mark-reviewed.sh`:

```bash
HASH=$(find docs/decisions -name '*.md' -not -name 'README.md' \
  -print0 | sort -z | xargs -0 cat 2>/dev/null \
  | _hashcmd | cut -d' ' -f1)
echo "$HASH" > "/tmp/architect-reviewed-${SESSION_ID}.hash"
```

Before allowing an edit, the gate recomputes the hash and compares it to the stored value. If a decision file changed since the review, the marker is invalidated and a re-review is required.

## The reviewer

The architect agent is defined in `.claude/agents/architect.md`. It has read-only access (Read, Glob, Grep) plus Bash for writing the verdict file. It cannot edit project files.

It checks five things, in order of importance. The first three affect the PASS/FAIL verdict. The last two are advisory.

![Reviewer checks diagram showing five checks in priority order: (1) Existing decision compliance, (2) Confirmation criteria violations, and (3) New decision detection affect the PASS/FAIL verdict; (4) Decision quality (MADR format) and (5) Decision staleness (age, reassessment dates) are advisory only.](/img/social/architect-reviewer-checks.svg)

**Existing decision compliance.** For each decision in `docs/decisions/`, does the proposed change conflict with the decision's outcome? Does it violate documented constraints or consequences?

**Confirmation criteria.** Many decisions include a Confirmation section describing how to verify compliance (e.g. "Client JS does not contain hardcoded API URLs beyond the entry point"). The agent checks proposed code against these criteria and flags violations as `[Confirmation Violation]`.

**New decision detection.** Does the change represent an undocumented architectural choice? The agent is told to be pragmatic. A version bump to an existing dependency is reversible and local: no flag. Adding a new ORM, switching from REST to GraphQL, or introducing a new CI workflow affects how the team works and how code flows to production: flag it.

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

## What gets gated

The gate excludes files by extension. From `architect-enforce-edit.sh`:

```bash
case "$FILE_PATH" in
  *.css|*.scss|*.sass|*.less)             exit 0 ;;  # Styles
  *.png|*.jpg|*.jpeg|*.gif|*.svg|*.ico)   exit 0 ;;  # Images
  *.woff|*.woff2|*.ttf|*.eot)             exit 0 ;;  # Fonts
  *package-lock.json|*yarn.lock)          exit 0 ;;  # Lockfiles
  *.map)                                  exit 0 ;;  # Sourcemaps
  *.changeset/*.md)                       exit 0 ;;  # Changesets
  */MEMORY.md|*/.claude/projects/*)       exit 0 ;;  # Memory files
  */.claude/plans/*.md)                   exit 0 ;;  # Plan files
esac
```

Everything else goes through the gate. Adjust the list for your project: if you want to gate only infrastructure files, narrow the exclusions. The architect agent is told to be pragmatic: a refactored function or a bug fix gets a quick PASS. A new API endpoint that skips an established pattern gets flagged.

## Decisions as living documents

Decisions follow a lifecycle. They start as `proposed`, move to `accepted` after production validation, and eventually get `deprecated` or `superseded`. The status lives in the filename: `001-use-rehype-highlight.proposed.md` becomes `001-use-rehype-highlight.accepted.md` after the site ships with rehype-highlight and nothing breaks.

![Decision lifecycle diagram showing four states: proposed decisions are new and enforced by the gate; when they ship, the release hook stamps a first-released date; after 14 days in production, the hook promotes them to accepted by renaming the file; accepted decisions can later be deprecated (no longer relevant, ignored by gate) or superseded (replaced by a newer decision, ignored by gate).](/img/social/decision-lifecycle.svg)

In this project, that decision started as proposed when the agent flagged `rehype-highlight` as an undocumented dependency. The MADR record captured why Shiki was rejected (bundle size, build complexity) and when to revisit (if rehype-highlight drops maintained status). Three deploys later, the decision moved to accepted. Now when the agent sees a new syntax highlighting dependency in `package.json`, it has context: not just what was chosen, but why, and under what conditions to reconsider.

Without automation, promotion does not happen. Decisions stay `proposed` indefinitely because nothing triggers the rename after a successful deploy. A post-release hook closes this gap. It runs after each deploy as a drop-in script in `scripts/post-release.d/`, receiving the list of changed files on stdin and the release date as an environment variable.

The hook works in two passes. From `stamp-and-promote-decisions.sh`:

```bash
# Pass 1: Stamp first-released on proposed decisions included in this release
for file in "$DECISIONS_DIR"/*.proposed.md; do
  if has_field "$file" "first-released"; then
    continue  # Already stamped
  fi
  if echo "$FILE_LIST" | grep -qF "$file"; then
    sed "s/^status: *\"*proposed\"*/status: \"proposed\"\nfirst-released: $RELEASE_DATE/" \
      "$file" > "$file.tmp" && mv "$file.tmp" "$file"
  fi
done

# Pass 2: Promote decisions past the 14-day threshold
for file in "$DECISIONS_DIR"/*.proposed.md; do
  FIRST_RELEASED=$(grep "^first-released:" "$file" | awk '{print $2}')
  AGE_DAYS=$(( (NOW_EPOCH - $(date_to_epoch "$FIRST_RELEASED")) / 86400 ))
  if [ "$AGE_DAYS" -ge "$PROMOTION_DAYS" ]; then
    sed "s/^status: *\"*proposed\"*/status: \"accepted\"/" "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    git mv "$file" "$(echo "$file" | sed 's/\.proposed\.md$/.accepted.md/')"
  fi
done
```

Pass 1 stamps a `first-released` date on each proposed decision that shipped in the release. Pass 2 checks all stamped decisions and promotes any that have been in production longer than 14 days (configurable via `DECISION_PROMOTION_DAYS`). The promotion renames the file from `.proposed.md` to `.accepted.md`, updates the frontmatter status, and adds an `accepted-date` field. Any changes are committed and pushed as part of the release.

The 14-day grace period exists so that decisions can be reverted if they cause production issues. A decision that ships on Monday and breaks something on Wednesday can be rolled back before it gets promoted. The architect agent enforces compliance against both `proposed` and `accepted` decisions but ignores `superseded` ones. A rejected decision prevents re-proposing the same approach without new evidence.

## Tradeoffs

The architect agent call adds 10-20 seconds per turn that touches project files. The sliding TTL means this cost is paid once per session, not once per edit, as long as edits are less than 10 minutes apart.

False negatives are more dangerous than false positives. The agent might miss a decision-worthy change because the pragmatism criteria were too generous, or because the change didn't match any detection patterns. There's no exhaustive list of what constitutes an architectural decision. The agent approximates.

The system now runs in two repos. A second project ([bbstats](https://github.com/windyroad/bbstats)) has 33 architecture decisions: 11 promoted from proposed to accepted via the release hook, 3 superseded, and 19 still proposed. The hooks and agent definition were copied to the second repo without changes. Every major feature in that project's changelog references an ADR. Decisions accumulate at the `proposed` stage and batch-promote when a release crosses the 14-day threshold.

The verdict gating matters more than it looks. In an earlier version of this system (before the PASS/FAIL verdict file), the architect flagged issues but the gate unlocked regardless. The AI could proceed with edits while leaving the flagged issues unresolved.

A real example: the AI was removing an unused API endpoint. The architect flagged that a smoke test depended on it and recommended updating the smoke test to check something that validates the health of the system. Without verdict gating, the AI proceeded with the rest of the task, left the API in place, left the smoke test unchanged, and moved on. The architect caught the problem. The AI chose the path of least resistance: do nothing about it.

With verdict gating, the gate stays locked after ISSUES FOUND. The AI has two options: fix the smoke test and remove the API properly, or stop. No middle ground where you half-do the work and leave broken dependencies in place. The hook system cannot make the AI choose the right fix. But it can prevent the AI from ignoring the issue and continuing as if the review never happened.

The system has known edge cases. Marker files live in `/tmp`, which is world-writable and not shared across machines. Drift detection hashes file contents, not filenames, so renaming a decision file without changing its content won't trigger a re-review. Concurrent sessions share the verdict file, creating a small race window (the PostToolUse hook reads and deletes it immediately, so the window is the time between two architect agents finishing simultaneously).

<span data-pull>The gate blocks the AI, not you.</span> The hooks constrain the agent's workflow. You control the hooks, the agent definition, and the decisions. If the architect flags something you disagree with, adjust the decision or the agent's instructions. The system is yours to tune.

## Adapting this for your project

Start with the agent file. Drop `.claude/agents/architect.md` into your repo. The embedded process works out of the box with an empty `docs/decisions/` directory. The first time the agent flags an undocumented decision, create the directory and the first record.

Wire the five hooks (detection, gate, plan gate, unlock, reset) into `.claude/settings.json`. The full configuration, including matchers and hook scripts, is in the linked repo.

Adjust the scope. The exclusion list matches this project's structure. If you want to gate only infrastructure files instead of everything, modify the case statement to match only the file types you care about. The pattern is the same.

Bootstrap your decisions. Once the hooks are wired, ask the AI to survey the codebase and document the existing architectural choices as decision records. The architect agent already knows the MADR 4.0 format and will create records for the technology choices, patterns, and conventions it finds. Review what it produces, fill in any context the agent missed (the "why" behind a choice is often not in the code), and add reassessment criteria. This gives you a populated `docs/decisions/` directory in one session instead of building it incrementally over months.

Wire the release hook. Drop `scripts/post-release.d/stamp-and-promote-decisions.sh` into your repo and call it from your release script after deploy. It handles both normal runs (file list on stdin) and cold-start backfill (checks git history for first-release dates). The 14-day promotion threshold is configurable via `DECISION_PROMOTION_DAYS`.

The pattern works in any agent system that exposes lifecycle events. Cursor has Rules for AI that can inject context and constrain behavior. The key requirements are three: inject instructions before the agent acts, intercept file writes, and run a check after the agent finishes. The gate logic (marker files, TTL, drift detection) is plain shell and works anywhere.

The full configuration is in the public repo at [github.com/windyroad/windyroad](https://github.com/windyroad/windyroad). The [Claude Code hooks documentation](https://docs.anthropic.com/en/docs/claude-code/hooks) covers the full event model.

The gate writes the decision down. The release hook tracks when it ships. Fourteen days later, the decision earns its place in the record. The reasoning that used to vanish in a chat thread now outlives the conversation that produced it.
