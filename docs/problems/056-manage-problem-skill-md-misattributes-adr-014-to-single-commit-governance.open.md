# Problem 056: manage-problem SKILL.md misattributes ADR-014 to "single-commit governance" in 6+ blocks

**Status**: Open
**Reported**: 2026-05-13
**Priority**: 3 (Medium). Impact: 3 x Likelihood: 1 (deferred, re-rate at next /wr-itil:review-problems)
**Effort**: M (deferred, re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

manage-problem SKILL.md misattributes ADR-014 to single-commit-governance citations in 6+ blocks (Step 5 P094, Step 6 P094, Step 7 P062, Step 9e, Step 11, README-refresh). On-disk `docs/decisions/014-*.md` is the Wardley Mapping ADR (proposed 2026-04-17); `grep -rE 'single.commit|one.commit.per' docs/decisions/` returns 0 matches. No on-disk ADR governs single-commit-per-iteration. The misattribution propagates through any skill or ticket that cites ADR-014 by reference for commit-grain rules.

Independently confirmed by iter 5 + iter 6 architect reviews during the 2026-05-12 AFK `/wr-itil:work-problems` loop (orchestrator session). Iter 5 architect surfaced the advisory; iter 6 architect independently verified via direct grep and concurred. Both retro trails record the observation at `docs/retros/2026-05-12-afk-iter-5-p051-ask-hygiene.md` (iter 5 observation) and `docs/retros/2026-05-12-afk-iter-6-p045-ask-hygiene.md` (iter 6 observation + verified evidence).

Cross-skill: manage-problem lives in the upstream agent-plugins repo at `~/.claude/plugins/marketplaces/windyroad/packages/itil/skills/manage-problem/SKILL.md`. Placement is likely upstream per P045 discipline, but verify before propagating; this ticket may need to be reported upstream rather than fixed in this project.

## Symptoms

- manage-problem SKILL.md Step 5 P094 cites ADR-014 for single-commit-per-iteration governance.
- Same citation pattern in Step 6 P094, Step 7 P062, Step 9e, Step 11, and the README-refresh contract block (confirm exact line numbers at investigation time).
- Downstream skills (work-problems, transition-problem, transition-problems, review-problems, reconcile-readme) repeat the ADR-014 citation as a propagated convention.
- Existing problem tickets and retros that cite "ADR-014 single-commit governance" inherit the same misattribution.

## Workaround

(deferred to investigation. Likely: identify the correct ADR or absence governing single-commit-per-iteration; if no ADR exists, draft a new one via `/wr-architect:create-adr` and re-cite from the SKILL.md blocks.)

## Impact Assessment

- **Who is affected**: any reader following an ADR-014 reference to verify the governance claim; iter 5 + iter 6 architects each spent two minutes of audit time reconciling on-disk ADR vs. SKILL.md citations.
- **Frequency**: every invocation of manage-problem and work-problems that hits the 6 cited blocks (effectively every AFK iter that commits).
- **Severity**: documentation drift; non-runtime; verify-before-asserting discipline catches it but pays the per-iter audit cost.
- **Analytics**: 2 architect-verified independent confirmations in one AFK loop (iter 5, iter 6).

## Root Cause Analysis

### Root Cause

(deferred to investigation. Candidate hypotheses: (a) ADR-014 was the single-commit-governance ADR at some prior point and got repurposed for Wardley Mapping without sweeping the SKILL.md citations; (b) the single-commit-governance rule was always informal convention and got retroactively attributed to ADR-014 by a misremembered citation chain; (c) the correct citation is a different ADR number that needs to be located.)

### Fix Strategy

(deferred to investigation. Likely shape: (1) verify upstream placement, since manage-problem SKILL.md lives in agent-plugins; (2) enumerate the affected blocks via `grep -nE 'ADR.014|ADR 014|adr-014' upstream/packages/itil/skills/manage-problem/SKILL.md`; (3) identify the correct ADR or absence, possibly drafting a new ADR via `/wr-architect:create-adr`; (4) re-cite from the 6 affected SKILL.md blocks; (5) propagate to sibling skills that inherited the citation.)

### Investigation Tasks

- [ ] Verify upstream placement: confirm `manage-problem` SKILL.md lives in `~/.claude/plugins/marketplaces/windyroad/packages/itil/skills/manage-problem/SKILL.md` and is read-only from this project (P045 discipline).
- [ ] Enumerate the affected blocks: `grep -nE 'ADR.014|ADR 014|adr-014' upstream/packages/itil/skills/manage-problem/SKILL.md` and produce a line-numbered list.
- [ ] Identify the correct ADR or absence: grep `docs/decisions/` upstream for "single.commit|one.commit.per|commit.grain|single-ticket-unit-of-work" and produce candidate ADR numbers.
- [ ] If no correct ADR exists, draft a new one via `/wr-architect:create-adr` (placement upstream).
- [ ] Re-cite from the affected blocks once the correct ADR is identified or drafted.
- [ ] Propagate the corrected citation to sibling skills that inherited the misattribution (work-problems, transition-problem, transition-problems, review-problems, reconcile-readme).
- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems.
- [ ] Create reproduction test (likely: bats contract assertion on the upstream SKILL.md verifying ADR citations resolve to on-disk decisions).

## Dependencies

- **Blocks**: (none directly; chronically inherited by every iter that commits)
- **Blocked by**: (none; investigation is in-pipeline)
- **Composes with**: P032 (verify-before-asserting discipline, the rule that surfaced this misattribution); P045 (upstream-placement framing, the rule that says verify placement before propagating fix)

## Related

- P032 verify-before-asserting discipline.
- P045 upstream-placement framing.
- `docs/retros/2026-05-12-afk-iter-5-p051-ask-hygiene.md` (iter 5 silent-framework observation 2, first surface).
- `docs/retros/2026-05-12-afk-iter-6-p045-ask-hygiene.md` (iter 6 direction observation 1, independent confirmation with verified evidence).
- `docs/decisions/014-wardley-mapping-as-strategic-lens.proposed.md` (the ADR that ADR-014 actually IS on disk).

(captured via /wr-itil:capture-problem during 2026-05-12 AFK work-problems loop wrap-up; expand at next investigation)
