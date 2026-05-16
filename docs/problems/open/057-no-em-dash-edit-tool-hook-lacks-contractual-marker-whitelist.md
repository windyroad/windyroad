# Problem 057: no-em-dash.sh (Edit/Write surface) lacks the contractual-marker whitelist that no-em-dash-bash.sh already carries

**Status**: Open
**Reported**: 2026-05-13
**Priority**: 3 (Medium). Impact: 3 x Likelihood: 1 (deferred, re-rate at next /wr-itil:review-problems)
**Effort**: S (deferred, re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

Hook-protocol asymmetry: `.claude/hooks/no-em-dash-bash.sh:34` carries a `WHITELIST_LINE` check that lets the canonical "Upstream report pending" P063 marker line bypass the em-dash block. The sibling `.claude/hooks/no-em-dash.sh` (PreToolUse `Edit` + `Write` surface) does NOT carry the equivalent whitelist. The result: any Edit-tool or Write-tool append of the canonical marker (or the deferred-placeholder template's Priority + Effort lines, which use the same character class) is denied; the agent must fall back to a Bash-tool `printf` workaround.

Surfaced during 2026-05-12 AFK `/wr-itil:work-problems` iter 4 (P049 marker append; Edit-tool denied, Bash-tool succeeded). Recurred 2026-05-13 during loop wrap-up (P014 IT-1 verification Edit denied; P056 capture Write denied for the deferred-placeholder template's Priority + Effort lines).

User direction recorded 2026-05-13 (AskUserQuestion batch-1 answer 3 of 4): "Port whitelist to Edit-tool hook". The whitelist port is windyroad-local because the hook files live in `./.claude/hooks/`, not in plugin space.

## Symptoms

- Edit-tool append of the canonical P063 upstream-pending marker line denied with the em-dash error.
- Write-tool create of a new problem ticket carrying the standard deferred-placeholder template denied because the Priority + Effort lines use the unicode horizontal-bar character.
- Bash-tool `printf` workaround required for every marker append.

## Workaround

Use Bash-tool `printf` (or `cat << EOF >>` heredoc) instead of Edit-tool append. The Bash-tool hook honours the WHITELIST_LINE check.

## Impact Assessment

- **Who is affected**: every iter that appends a P063 upstream-pending marker or writes a new problem ticket with the standard deferred-placeholder template.
- **Frequency**: each AFK iter that classifies a ticket as upstream-blocked plus each capture-problem invocation; multiple per loop.
- **Severity**: workflow friction; not runtime; recurring per-iter time cost.
- **Analytics**: 3 observed Edit/Write-tool denials in 2 days (iter 4 P049; loop wrap-up P014; loop wrap-up P056).

## Root Cause Analysis

### Root Cause

Hook surface asymmetry: the Bash-tool em-dash hook gained a `WHITELIST_LINE` check (see `.claude/hooks/no-em-dash-bash.sh:34`) to allow specific contractual marker lines to pass. The Edit/Write hook (`.claude/hooks/no-em-dash.sh`) did not receive the equivalent change. The canonical contractual markers (P063 upstream-pending; deferred-placeholder template Priority + Effort lines) are content the hook is supposed to permit but doesn't.

### Fix Strategy

1. Diff `.claude/hooks/no-em-dash-bash.sh` against `.claude/hooks/no-em-dash.sh` to extract the WHITELIST_LINE logic.
2. Port the `WHITELIST_LINE` check + the whitelist content array to `no-em-dash.sh`'s PreToolUse Edit/Write code path.
3. Add a bats test covering: (a) canonical P063 marker passes Edit-tool hook; (b) canonical deferred-placeholder Priority + Effort lines pass Write-tool hook; (c) non-whitelisted content still blocks.
4. Verify by re-running a marker append via Edit-tool against a scratch ticket and confirming the hook permits.

### Investigation Tasks

- [ ] Read `.claude/hooks/no-em-dash-bash.sh:34` and document the WHITELIST_LINE shape (regex vs literal, where it's anchored in the matcher).
- [ ] Read `.claude/hooks/no-em-dash.sh` and identify the equivalent insertion point in the Edit/Write code path.
- [ ] Port the WHITELIST_LINE check; add unit test coverage.
- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems.

## Dependencies

- **Blocks**: (none directly; chronic recurring friction)
- **Blocked by**: (none)
- **Composes with**: P030 (work-problems SKILL.md marker wording forces whitelist in PostToolUse:Bash em-dash hook); P057 lives at the sibling surface for the same root-cause class.

## Related

- P030 (work-problems SKILL.md marker wording, also em-dash hook friction class).
- 2026-05-12 AFK iter 4 retro: `docs/retros/2026-05-12-afk-iter-4-p049-ask-hygiene.md` (iter 4 silent-framework observation 2).
- 2026-05-13 loop wrap-up: P014 IT-1 update + P056 capture each hit the Edit/Write hook denial.

(captured via inline-Write during 2026-05-12 AFK work-problems loop wrap-up; user-directed via AskUserQuestion batch-1 "Port whitelist to Edit-tool hook"; expand at next investigation)
