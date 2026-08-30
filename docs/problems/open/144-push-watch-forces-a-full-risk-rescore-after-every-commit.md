# Problem 144: push:watch forces a full risk rescore after every commit

**Status**: Open
**Reported**: 2026-08-09
**Priority**: 10 (High). Impact: 2 x Likelihood: 5, derived at capture from the description per Step 4a
**Origin**: internal
**Effort**: M, derived at capture per Step 4a
**WSJF**: 5.0 = (10 x 1.0) / 2

## Description

`npm run push:watch` refuses to run with `Push blocked: Pipeline state drift: working tree changed since the last push risk assessment. Delegate to wr-risk-scorer:pipeline ... to rescore against the current state.` after any change to the tree, including a commit the previous rescore already covered. Each refusal costs a full synchronous subagent rescore before the push can proceed.

Observed three times in one session on 2026-08-09, at roughly 2 to 10 minutes of subagent work each:

1. After landing `13fd90f` (a ticket capture) and `b4fd273` (the Issue 17 newsletter prep artefacts).
2. After landing `4b149a7` (the changesets action bump) and `c939fa1` (a ticket capture).
3. After landing `16d988c` (the RFC-006 ratification and its ticket capture).

The drift check itself is correct and worth keeping: the risk of pushing a state nobody scored is exactly what it guards. The friction is that the granularity is the whole working tree, so a commit that lands documentation the previous scorer already read still counts as drift.

The cost is not just wall-clock. Each rescore is a fresh-context subagent that re-reads the policy, the changesets directory, the workflows and the diff, and each one emits a full report. In a session that lands several commits before pushing, most of that work is re-derivation of an answer that did not change.

Worth noting what is NOT being proposed: weakening the gate. This is intentional hygiene of the same family as the dependency-freshness gate, and engineering around it would be the wrong fix. The question is whether the drift predicate can be made proportionate.

### Mechanism claim of 2026-08-30 RETRACTED, and what the source actually shows

An earlier version of this section, committed in `c394143`, asserted that the drift check hashes `git diff HEAD --raw` lines carrying the index blob hash per path, and concluded that `git add` alone invalidates a score. **That is false.** It was written from session observation without reading the hook, caught by the risk scorer on the next pass, and is retracted here rather than quietly edited.

What `pipeline-state.sh --hash-inputs` actually does, identical across all five versions cached on this machine (0.9.0, 0.13.5, 0.17.0, 0.18.17, 0.18.19), verified by hashing lines 35 to 75 of each: all five give the same digest:

```bash
STASH_COMMIT=$(git stash create 2>/dev/null || true)
CONCEPTUAL_TREE=$(git rev-parse "${STASH_COMMIT}^{tree}" ...)
eval "git diff --raw 4b825dc642cb6eb9a060e54bf8d69288fbee4904 $CONCEPTUAL_TREE -- $EXCL"
```

Three consequences, each of which contradicts the retracted claim:

1. The inputs are a diff of git's empty tree (`4b825dc...`) against a conceptual tree built by `git stash create`, which already folds index and working tree together. The SHAs listed are content blobs of that tree, not index-state sentinels, and nothing is diffed against HEAD at all.
2. Staging an already-tracked, already-modified file therefore does NOT move the hash: its content was in the conceptual tree before the `git add`. The one staging case that does move it is a previously UNTRACKED file, because `git stash create` without `-u` omits untracked files.
3. `_doc_exclusions` in `gate-helpers.sh` returns `:!docs/ :!.risk-reports/ :!.changeset/ :!governance/ :!.claude/plans/ :!CLAUDE.md :!AGENTS.md :!PRINCIPLES.md :!DECISION-MANAGEMENT.md :!AGENTIC_RISK_REGISTER.md :!PROBLEM-MANAGEMENT.md`, so editing or staging anything under `docs/` cannot move the hash through the tree diff.

There is a SECOND input, and an earlier draft of this retraction missed it by stopping the read a few lines short, which is the same one-screen-early failure this section exists to correct. Lines 68 to 73 emit a changeset count after the tree diff:

```bash
    # Changeset count (affects release/changeset risk - tracked separately
    # because .changeset/ is in the doc-exclusions list and therefore not
    # reflected in the tree listing above).
    if [ -d ".changeset" ]; then
        find .changeset -name '*.md' -not -name 'README.md' 2>/dev/null | wc -l | tr -d ' '
    fi
```

So `.changeset/` is excluded from the tree diff and then deliberately re-admitted through this count. Adding or removing a changeset file DOES move the hash, exclusion notwithstanding.

The retracted claim also carried a "stage everything first, score second" prescription. That is superseded by a hook that already exists and is wired: `risk-hash-refresh.sh` is registered as `PostToolUse:Bash` through `risk-scorer-dispatch.sh` line 92, and its own header says it "eliminates the 'stage before prompt' protocol" by rewriting `state-hash` after any `git add|commit|stash|reset|checkout|restore`.

So the drift remains unexplained. Note what this ticket does and does not record: the three reproductions written up above are from 2026-08-09, with commit SHAs. The 2026-08-30 recurrences that prompted this retraction were observed but not captured in the detail those carry, so an investigator should work from the 2026-08-09 set. Four candidates below, none tested, and the list is NOT claimed to be exhaustive: it comes from reading one function, and one draft of this very section already proved that an incomplete read reads exactly like a complete one.

- Staging a previously untracked file, the one genuinely staging-sensitive case. Test it with a path OUTSIDE `docs/`: the exclusion applies before the untracked question arises, so a docs file would falsify the candidate for the wrong reason.
- A `git -C <path> add`, piped, or subshell invocation that `risk-hash-refresh.sh`'s command regex `(^|;|&&|\|\|)\s*git (add|...)` does not match, so no refresh fires.
- A genuine content change to a non-`docs/` path between the score and the commit.
- A `.changeset/*.md` file added or removed between the score and the commit, which moves the count input above. Worth testing early: a changeset is normally created with Write, and the dispatcher routes `Edit|Write` to `wip-risk-mark.sh` (line 96) rather than to `risk-hash-refresh.sh`, so no refresh fires for it.

The second observation from that session stands and was verified independently: only a FRESH synchronous `Agent` spawn writes the report and the marker. `risk-score-mark.sh` guards on `[ "$TOOL_NAME" = "Agent" ] || exit 0` and its header calls itself the only place score files are written, and the dispatcher routes only `tool_name == Agent` to it. A `SendMessage` resume returns a complete analysis carrying `RISK_SCORES` and a `RISK_BYPASS` directive in its text while writing nothing, so the gate keeps reading the stale score. Three consecutive resumes produced good analysis and zero gate movement before a fresh spawn was tried. This is not new to this ticket though: `docs/briefing/README.md` already carries this. Its Critical Point beginning "A genuine PASS can still leave the edit blocked at any of six gates" lists `risk-score` among the six `PostToolUse` markers that only a literal `Agent` tool call fires. Cited by its opening words rather than by position, because the Critical Points are an unnumbered and growing list and an ordinal into it drifts; an earlier draft of this line said "Critical Point 7" when the bullet is the eighth.

## Symptoms

- `npm run push:watch` exits with `Pipeline state drift: working tree changed since the last push risk assessment` after any commit, including one whose content the prior assessment covered.
- A multi-commit session pays one full risk rescore per push attempt.

## Workaround

Batch commits and push once at the end, where the ADR-014 commit grain allows it. This reduces the count but does not remove it, because the first push after any commit still triggers a rescore.

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: every push that follows a commit, which is the normal case
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Investigate root cause. Partially answered 2026-08-30 and then RETRACTED: the predicate hashes a `git stash create` conceptual tree against the empty tree with `docs/` excluded, which rules out the index-blob explanation this ticket briefly carried, but does not explain the drift actually observed. The four untested candidates are listed in the retraction subsection of the Description, above the Root Cause heading. Re-opened deliberately rather than left ticked.
- [ ] Create reproduction test
- [ ] Decide whether the predicate can be made proportionate without weakening the guarantee. Candidates: scope the comparison to paths the prior assessment actually read; treat a commit whose diff is a subset of the scored state as covered; carry the prior score forward with an explicit delta assessment rather than a full rescore
- [ ] Check whether the rescore prompt can be shortened when the delta is small, rather than re-deriving the whole pipeline report
- [ ] Confirm the gate is not weakened by any change: pushing an unscored state must stay impossible

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P143 (CI smoke test has no retry), same release path, distinct mechanism. P145 (the risk register is empty so every scorer run regenerates from scratch), which compounds the cost of each rescore this ticket triggers.

## Related

Captured via `/wr-itil:capture-problem` during the 2026-08-09 session retrospective.
