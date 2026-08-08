# Problem 118: Newsletter publish step uses `git mv` on untracked drafts, which fails

**Status**: Verification Pending
**Reported**: 2026-07-27
**Priority**: 8 (Medium). Impact: Minor (2) x Likelihood: Likely (4). Derived at capture: trivial workaround, no data/reader impact, but recurs on every publish where drafts were not pre-committed (the default).
**Origin**: internal
**Effort**: S (one-line change to the finalise reminder, or a `git add` in the publish flow)
**WSJF**: 16.0 = (8 x 2.0) / 1 (re-rated 2026-08-08: Open to Known Error auto-transition, status multiplier 1.0 to 2.0 per P125)

## Description

The wr-newsletter finalise reminder (`.claude/skills/wr-newsletter/SKILL.md` line 1450) tells the user to publish with `git mv <draft-folder>/<publication-date>/ <published-folder>/<publication-date>/`. But the draft sub-directory's files are untracked: the skill writes drafts across prep and finalise but nothing commits them before publish, so `git mv` fails with `fatal: source directory is empty`.

Observed 2026-07-27 publishing The Shift Issues 14 and 15: the `git mv` failed and required a `mv` plus `git add` fallback to promote the two editions into `published/`.

Concrete bounded fix: change the finalise reminder to promote untracked drafts with `mv` plus `git add` (or `git add` the drafts before `git mv`), or have the skill track drafts on save. Recurs every publish where the drafts were not pre-committed, which is the default state.

## Symptoms

- `git mv src/newsletters/drafts/leader/<date>/ src/newsletters/published/leader/<date>/` exits non-zero with `fatal: source directory is empty` when the draft files were never committed.
- The documented one-step publish move does not work as written; the user (or agent) must fall back to `mv` plus `git add`.

## Workaround

Promote with a plain `mv` then `git add` the destination (what was done on 2026-07-27), instead of `git mv`.

## Impact Assessment

- **Who is affected**: whoever runs the newsletter publish step (Tom, or the agent on Tom's behalf).
- **Frequency**: every publish where the draft sub-directory was not pre-committed (the default; roughly weekly).
- **Severity**: Minor. Trivial workaround, no reader-facing or data impact; friction plus a misleading instruction only.

## Root Cause Analysis

The skill writes draft files to disk and never stages or commits them: `git add`, `git commit` and `git status` appear nowhere in `.claude/skills/wr-newsletter/SKILL.md`. `git mv` requires its source to have index entries, so on an untracked draft directory it refuses with `fatal: source directory is empty` before moving anything. The reminder documented a command that could only work in a state the skill never produces.

### Investigation Tasks

- [x] Confirm whether drafts are ever committed before publish in normal use (they are not: the skill issues no git commands at all, so a draft is untracked unless the user committed it by hand).
- [x] Decide the fix shape: correct the finalise-reminder wording. Rejected the alternative of staging drafts on save, on two locally-grounded objections raised by the architect gate. ADR-012 makes a draft a gated artefact the author may still reject, so staging it on save couples index state to unreviewed content. ADR-008's commit and push risk gates read live git state, so a skill that silently mutates the index changes those gates' inputs as an invisible side effect. The chosen shape also keeps the skill free of git commands entirely.
- [x] Create a reproduction. `git mv` on an untracked directory exits 128 with `fatal: source directory is empty`.

Two further silent-failure modes surfaced during review, both reproduced, and both are why the fix is a guarded chain rather than a bare `mv` plus `git add`:

- A plain `mv` onto an existing destination directory does not refuse. It nests the source inside it and exits 0, yielding `<date>/<date>/x.md`. That would trade this ticket's loud failure for a silent one, and a nested edition falls out of the one-level-deep edition-count glob.
- `git add -A <src> <dst>` in a single invocation aborts with `fatal: pathspec ... did not match any files` when the source was never tracked, because after the move the pathspec matches nothing in either the worktree or the index. Both pathspecs share one invocation, so the whole command fails after the `mv` has already succeeded, leaving the edition promoted on disk with nothing staged.

## Resolution

Fixed 2026-08-08. The promotion command on all three surfaces that carried it is now:

```
test ! -e <published-folder>/<publication-date>/ && git add -A <draft-folder>/<publication-date> && mv <draft-folder>/<publication-date>/ <published-folder>/<publication-date>/ && git add -A <draft-folder>/<publication-date> <published-folder>/<publication-date>
```

The `test` stops the chain before anything moves if the destination already exists. The leading `git add -A` gives the source index entries so the post-move add can stage the removal, and preserves the rename when the draft was already tracked. Staging stays scoped to the one edition rather than the parent persona folder, which would sweep in any other in-flight draft.

Surfaces changed: `.claude/skills/wr-newsletter/SKILL.md` line 1450, `src/newsletters/drafts/leader/README.md`, `src/newsletters/drafts/developer/README.md`. The prose-only `src/newsletters/drafts/README.md` and `src/newsletters/published/README.md` carry no command and were left alone. The ADR-039 and ADR-040 `git mv` references are about the one-time migration of already-tracked files and remain correct.

Verifies on the next publish. Doc-only, no changeset.

## Fix Released

Released 2026-08-08 in this repository. <!-- no-changeset-reference -->

No release vehicle: the change is documentation across three repo-local surfaces, so nothing shippable or package-behavioural changed and no changeset was authored. This is the repo-local-fix shape P098 names, where the K to V transition rides the fix commit rather than an npm release.

Fix summary: the promotion command in the finalise reminder and both persona drafts READMEs is now a guarded chain that pre-stages the source, refuses a pre-existing destination, moves, then stages both paths, replacing a `git mv` that could never work on an untracked draft.

Awaiting user verification. Verifies on the next `/wr-newsletter` publish, when the reminder's command is run against a real draft directory. No exercise evidence yet from this session beyond the isolated reproductions: `git mv` on an untracked directory exits 128 with `fatal: source directory is empty`; the adopted chain exits 0 and stages the promoted edition, exits 1 without moving anything when the destination exists, and preserves the rename on an already-tracked draft.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P040 (newsletter draft file dates), P078 (published-folder dated subdirs), same publish/draft-lifecycle area, distinct concerns.

## Related

Captured via /wr-itil:capture-problem during the 2026-07-27 run-retro after publishing Issues 14 and 15. Fix Strategy (proposed): **Skill improvement stub**. Target file: `.claude/skills/wr-newsletter/SKILL.md` line 1450. Observed flaw: documented `git mv` publish move fails on untracked drafts. Edit summary: change the reminder to `mv` plus `git add` (or `git add` before `git mv`). Title-only dedup surfaced P040/P041/P078 as newsletter-adjacent but distinct.
