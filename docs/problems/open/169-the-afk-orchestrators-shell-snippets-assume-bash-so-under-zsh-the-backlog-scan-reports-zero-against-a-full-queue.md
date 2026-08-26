# Problem 169: The AFK orchestrator's shell snippets assume bash, so under zsh the backlog scan reports zero against a full queue

**Status**: Open
**Reported**: 2026-08-26
**Priority**: 15 (High), Impact: 3 x Likelihood: 5, derived at capture. Impact is 3 because the AFK loop is the mechanism for unattended backlog progress and it stops before doing any: nothing reaches a reader, and no data is lost, but an operator who leaves it running returns to a loop that reported success and did nothing. Likelihood is 5 because it is not conditional on anything: zsh is the macOS default login shell since Catalina, both defects are present in every cached version, and one of them reproduces on every single invocation.

**Origin**: internal
**Effort**: S, derived at capture. Two lines in one SKILL. The fix site is the `wr-itil` plugin, so the local half is a report and the change lands upstream.

## Description

`/wr-itil:work-problems` carries shell snippets its own prose presents as copy-paste-ready. Two of them are bash-only. Under zsh they do not degrade, they misreport.

Verified on disk 2026-08-26 against all three cached versions, 1.1.1, 1.1.2 and 1.2.0. Both defects are present in all three. PATH resolves the shim set to 1.1.1.

**Defect one, and it is the dangerous one. The Step 1 backlog scan reports an empty backlog under zsh.** The scan is written as a bare multi-glob:

```
ls docs/problems/*.open.md docs/problems/*.known-error.md docs/problems/open/*.md docs/problems/known-error/*.md 2>/dev/null
```

Run in this repository on 2026-08-26, same command, same working directory:

```
zsh:  0
bash: 65
```

The repository holds 45 open and 20 known-error tickets. The flat-layout halves of the dual-tolerant glob match nothing, because this repo migrated to the per-state subdir layout. bash leaves an unmatched pattern as a literal, `ls` fails on it, and the other two patterns still list. zsh treats an unmatched glob as an error, aborts the whole command before `ls` runs, and prints `no matches found`. The `2>/dev/null` does not help: the abort happens at glob expansion, before any redirect applies.

So the dual-tolerant glob, whose entire purpose is to work across both layouts during the RFC-002 migration window, is the thing that breaks. A repo that has completed the migration is exactly the case that fails.

Zero actionable tickets is stop-condition #1. The orchestrator would report "no actionable problems", run its pre-`ALL_DONE` gates, and emit `ALL_DONE` against a backlog of 65. Gate (0) does not save it: the P390 re-scan is the same glob, so it re-derives the same zero and agrees.

**Defect two. The iter dispatch dies before dispatching.** Step 5's canonical command starts:

```
mapfile -t PLUGIN_DIR_ARGS < <(wr-itil-resolve-governance-plugin-dirs)
```

`mapfile` is a bash 4+ builtin and does not exist in zsh. Observed on the first pre-flight dispatch of this session: `command not found: mapfile`, the `claude -p` call never ran, and the output file was left empty. The caller then parsed that empty file as JSON and got `Expecting value: line 1 column 1`, which reads as a malformed API response rather than as a shell incompatibility.

That misreport matters more than the failure. The Step 0 pre-flight contract routes an empty-or-broken result to non-blocking revert-and-proceed, so the loop continues and the annotation names an API failure class that never happened.

## Symptoms

- The loop emits `ALL_DONE` reporting no actionable problems while `docs/problems/open/` is full.
- `no matches found: docs/problems/*.open.md` on stderr, followed by a zero count.
- `command not found: mapfile` on a pre-flight or iter dispatch, followed by a JSON parse error naming column 1.
- The Gate (0) re-scan table agrees with the false zero, because it runs the same glob.

## Workaround

Run the snippets under bash: `bash -c 'shopt -s nullglob; ls ...'`. Confirmed to return 65 where zsh returns 0.

## Impact Assessment

- **Who is affected**: any operator whose shell is not bash, which on macOS is the default. No reader or visitor path.
- **Frequency**: defect one on every invocation in a migrated repo. Defect two on every dispatch.
- **Severity**: the loop's stop condition is satisfied by a measurement error, and every downstream check agrees with it because they all read the same broken glob. An unattended run reports success having done nothing.
- **Analytics**: not instrumented.

## Root Cause Analysis

### Preliminary Hypothesis

The snippets were written and tested in bash and the SKILL does not say which shell it assumes. Nothing pins it: no shebang, no `bash -c` wrapper, no note. The invoking agent runs them in whatever shell the session has.

Both defects share the shape this repository has now recorded four times in two days: a step reports a condition it did not test. The glob reports "no tickets" when it means "my shell aborted". The dispatch reports a JSON parse failure when it means "this builtin does not exist here".

### Investigation Tasks

- [ ] Decide the fix shape: wrap the snippets in `bash -c`, or make them POSIX-portable (`for f in ...; do [ -e "$f" ] || continue` for the glob, `while IFS= read -r` for `mapfile`).
- [ ] Sweep the rest of the SKILL for other bash-isms; two were found by hitting them, which is not a search.
- [ ] Add an assertion that the backlog count is non-zero when `docs/problems/open/` is non-empty, so a false zero fails loudly rather than satisfying stop-condition #1.
- [ ] Confirm the fix red against zsh before shipping.

## Fix Strategy

Make the snippets shell-portable, or state the shell and wrap them. Either is fine; leaving it implicit is not.

Separately, and worth more than the portability fix: a zero-length backlog should never be trusted as a stop condition without a cross-check. Comparing the glob's count against a plain directory listing costs one command and converts a silent false stop into a loud contradiction. That check is the thing that would have caught this class regardless of which shell-ism caused it.

The fix site is the `wr-itil` plugin, not this repository. Local action is a report upstream.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: fix lands upstream in `wr-itil`
- **Composes with**: P165, P166, P167, P168

## Related

Found on 2026-08-26 during a `/wr-itil:work-problems` run, by hitting both defects in the first five minutes: the dispatch died on `mapfile`, and the Step 1 scan reported zero against a backlog of 65.

- **P165**, **P166**, **P167** and **P168** are the same family: a control reporting a benign or wrong cause it never established. This is the fifth and sixth instance in two days, and the first where the false report satisfies a loop's stop condition rather than merely misleading a reader.
- The `2>/dev/null` detail is worth keeping. It is present, it looks like it handles the missing-file case, and it does nothing here because zsh fails before redirection applies. A reader auditing the line would reasonably conclude it was already guarded.
