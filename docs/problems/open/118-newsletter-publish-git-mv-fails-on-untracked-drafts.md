# Problem 118: Newsletter publish step uses `git mv` on untracked drafts, which fails

**Status**: Open
**Reported**: 2026-07-27
**Priority**: 8 (Medium). Impact: Minor (2) x Likelihood: Likely (4). Derived at capture: trivial workaround, no data/reader impact, but recurs on every publish where drafts were not pre-committed (the default).
**Origin**: internal
**Effort**: S (one-line change to the finalise reminder, or a `git add` in the publish flow)

## Description

The wr-newsletter finalise reminder (`.claude/skills/wr-newsletter/SKILL.md` line 1231) tells the user to publish with `git mv <draft-folder>/<publication-date>/ <published-folder>/<publication-date>/`. But the draft sub-directory's files are untracked: the skill writes drafts across prep and finalise but nothing commits them before publish, so `git mv` fails with `fatal: source directory is empty`.

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

### Investigation Tasks

- [ ] Confirm whether drafts are ever committed before publish in normal use (they were not this session).
- [ ] Decide the fix shape: correct the finalise-reminder wording (`mv` plus `git add`), or `git add` drafts on save so `git mv` works as written.
- [ ] Create a reproduction (publish an uncommitted draft dir with `git mv`).

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P040 (newsletter draft file dates), P078 (published-folder dated subdirs), same publish/draft-lifecycle area, distinct concerns.

## Related

Captured via /wr-itil:capture-problem during the 2026-07-27 run-retro after publishing Issues 14 and 15. Fix Strategy (proposed): **Skill improvement stub**. Target file: `.claude/skills/wr-newsletter/SKILL.md` line 1231. Observed flaw: documented `git mv` publish move fails on untracked drafts. Edit summary: change the reminder to `mv` plus `git add` (or `git add` before `git mv`). Title-only dedup surfaced P040/P041/P078 as newsletter-adjacent but distinct.
