# Problem 057: no-em-dash.sh (Edit/Write surface) lacks the contractual-marker whitelist that no-em-dash-bash.sh already carries

**Status**: Verifying
**Reported**: 2026-05-13
**Origin**: internal
**Transitioned**: 2026-05-30 (Open -> Verifying: whitelist ported to `no-em-dash.sh`, bash hook expanded to matching 3-entry whitelist for symmetry; smoke tests in commit body verify canonical markers pass and non-whitelisted em-dashes still block)
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

## Additional Evidence

### Staging-trap recurrence pattern observed in 2026-05-30 to 2026-05-31 AFK loop

The fix released 2026-05-30 (whitelist port from `no-em-dash-bash.sh` to `no-em-dash.sh`) closes the em-dash-hook denial surface that this ticket originally captured. A separate but related recurrence pattern in the SAME AFK loop surfaced the staging-trap-recovery shape as the load-bearing operational defect, and user direction 2026-05-31 amended the fix-recovery semantics. Recording the recurrence evidence here per architect direction (append to P057 rather than open a sibling ticket).

**Pattern**: when the em-dash hook denied a co-staged file (Edit / Write blocked mid-multi-file change), the operating recovery contract was "re-stage only the trapped file, then retry commit". In practice this dropped the co-staged sibling files (README refresh, ticket body, sibling test) from the recovery commit, forcing iters to land 2 or 3 commits per logical change instead of one per ADR-014.

**Recurrence count**: 3 consecutive iters split into 2-3 commits (iter 5 P027 park; iter 6 P033 park; iter 7 P042 park, which split into 3 commits: 5a7d8a4 park + 9b0c488 README refresh + 9160530 retro). Iter 8 P047 park proactively mitigated by pre-staging ALL prior-touched paths together before commit; landed as one commit (0a1242b).

**User direction 2026-05-31**: amend the recovery semantics to re-stage ALL prior-touched paths on trap exit (pre-stage-all-mitigation made standard contract). Deviation-approval queued through `outstanding_questions` queue and resolved at orchestrator main turn. The amendment fix-site lives in the upstream `wr-itil` plugin staging-trap recovery hook / contract, NOT in this project. Per ADR-036 (marketplace-consumer-cannot-edit-cached-plugin park classification, proposed 2026-05-31), this ticket's recurrence-class amend is itself a marketplace-consumer park: the operational mitigation (pre-stage-all) is the in-project workaround until the upstream fix lands.

**Implementation status**: pre-stage-all mitigation verified working empirically (iter 8 onward in the 2026-05-30 to 2026-05-31 loop landed all parks as one commit, including iter 14 P029 park as 1 commit, iter 15 P046 park as 2 commits with retro separately by retro discipline, iter 16 P048 park as 2 commits, iter 17 P052 park as 2 commits). The mitigation works; the upstream contract amend is the strategic fix.

**Cross-references**:

- ADR-036 (marketplace-consumer-cannot-edit-cached-plugin park classification). Recurrence-amend fix-site is upstream; in-project workaround documented per the ADR's classification predicate.
- `/wr-itil:work-problems` SKILL.md (upstream). The iter dispatch template carries the pre-stage-all mitigation as a constraint comment ("P057 staging-trap mitigation: pre-stage ALL prior-touched paths together before commit"); future iter prompts inherit the constraint.
- User direction recorded 2026-05-31 during `/wr-itil:work-problems` orchestrator main turn queue resolution: deviation-approval (amend recovery semantics); upstream-blocked routing for the SKILL-level amend.
- **Reported upstream (recurrence-class amend only)**: https://github.com/windyroad/agent-plugins/issues/188 (2026-05-31). Note: this upstream report covers the staging-trap recovery semantics amend (sibling concern surfaced via the Additional Evidence section above), NOT the original P057 scope. The original P057 local hook port shipped 2026-05-30 and is in this ticket's Verifying state.
