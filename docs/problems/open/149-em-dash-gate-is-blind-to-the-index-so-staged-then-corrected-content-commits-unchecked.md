# Problem 149: Em-dash gate is blind to the index, so staged-then-corrected content commits unchecked

**Status**: Open
**Reported**: 2026-08-10
**Priority**: 8 (Medium). Impact: 2 x Likelihood: 4, derived at capture from the description per Step 4a
**Origin**: internal
**Effort**: S, derived at capture per Step 4a
**WSJF**: 8.0 = (8 x 1.0) / 1

## Description

Both em-dash hooks read the working tree. Neither reads the index. So content that is staged and then corrected in the worktree commits with the staged version intact, and nothing notices.

Verified on disk 2026-08-10:

`.claude/hooks/no-em-dash-bash.sh` line 62 runs `git diff --no-color HEAD -- "$file"` and greps the added lines. That comparison is worktree against HEAD. Normally it does see staged content, because the worktree usually contains it too.

`.claude/hooks/no-em-dash.sh` lines 18 and 19 read `tool_input.new_string` and `tool_input.content`, so it inspects the Edit or Write payload and never touches git at all.

Neither runs `git diff --cached`. Grepping both files for `cached` returns nothing.

**The uncovered shape is any stage-then-fix-the-worktree sequence.** Stage a file, then Edit that same file, and the worktree is clean while the index still holds the original. The Bash hook's worktree-against-HEAD comparison now shows the corrected content and passes. The commit takes the staged blob.

**It does not self-correct afterwards.** Once the stale blob is committed, the worktree differs from HEAD by the *removal* of the em-dashes, so `git diff HEAD` produces `-` lines. The hook greps `^\+[^+]`, added lines only. It stays silent. No later firing rescues it.

Observed 2026-08-09 and again the same session. A PostToolUse hook regenerates `docs/decisions/README.md` whenever an ADR is written, and that regeneration emits em-dashes (P087). The file was therefore already staged when I corrected it by hand with Edit. `wr-risk-scorer-restage-commit` re-adds only the paths it is given, so the compendium kept its stale index entry and a commit landed carrying two em-dashes. My own check had passed, because I checked the worktree. The commit was unpushed and was amended out, so nothing reached origin.

The hook-authored staging is how it arose here, but it is not the defect and framing it that way would scope the fix too narrowly. A plain `git add` followed by an Edit produces the same hole, and the combination of a path-scoped restage helper plus hand corrections produces it as a matter of routine.

Worth separating from its neighbours. P087 is about the generator emitting the character. P135 is about the same hook not doing arithmetic over its own counts. Both are about what the tool produces. This one is about what the gate can see, and it would still be a hole if the generator never emitted an em-dash again.

## Symptoms

- A commit can contain em-dashes while both hooks pass and the worktree is clean.
- Verified instance: `git show :docs/decisions/README.md | grep -c` returned 1 while `grep -c` on the same path in the worktree returned 0.
- No subsequent hook firing reports the committed content, because the diff shows removal rather than addition.

## Workaround

Verify the staged blob rather than the worktree before committing:

```
for f in $(git diff --cached --name-only); do
  printf '%s %s\n' "$(git show ":$f" | grep -c '\xe2\x80\x94')" "$f"
done
```

and confirm `git diff --name-only` is empty for those paths, so index and worktree agree. Applied on 2026-08-10, and it caught a live second instance that would otherwise have shipped.

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: any commit where a file is staged and then corrected before committing
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Investigate root cause
- [ ] Create reproduction test: stage a file containing an em-dash, correct it in the worktree, commit, and assert the committed blob still carries it
- [ ] Decide where the check belongs. A PreToolUse gate on `git commit` scanning `git diff --cached` would cover every path into a commit regardless of who staged it, which the current two hooks cannot
- [ ] Decide whether the same index blindness affects the other content gates that scan files, since the shape is not specific to em-dashes
- [ ] Check whether a `pre-commit` git hook is preferable to a Claude Code hook here, given the gap is in git's staging model rather than in the assistant's tool use

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P087 (the compendium generator emits em-dashes) and P135 (the same hook does no count arithmetic). Those two are about what the tooling produces; this is about what the gate can see. The three compose because P087 is what most often puts a violating blob into the index in the first place.

## Related

Surfaced by the `wr-risk-scorer:pipeline` assessment of the P146 commit on 2026-08-09, which caught the live instance before it was pushed. My first framing of the mechanism was wrong and is corrected above: I described it as hook-authored files being swept in from a pre-existing index entry, which is narrower than the truth. The hook path is how it arose, not what is uncovered.
