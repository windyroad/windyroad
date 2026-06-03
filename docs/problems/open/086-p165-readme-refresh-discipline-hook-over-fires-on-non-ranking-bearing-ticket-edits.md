# Problem 086: P165 README-refresh-discipline hook over-fires on non-ranking-bearing problem-ticket edits

**Status**: Open
**Reported**: 2026-06-03
**Priority**: 3 (Medium), Impact: 3 x Likelihood: 4 (deferred, re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: M (deferred, re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

The P165 README-refresh-discipline hook (`packages/itil/hooks/itil-readme-refresh-discipline.sh`) treats ANY staged modification to a problem-ticket file as ranking-bearing and DENIES the `git commit` unless `docs/problems/README.md` is ALSO staged. The hook fires on:

- New ticket creation (correct: rankings change, README must update)
- Status transitions (correct: WSJF Rankings + Verification Queue tables change)
- **Investigation Tasks edits to existing tickets** (over-fire: WSJF + Status fields unchanged; README WSJF Rankings + VQ row unchanged)
- **Description-only prose edits to existing tickets** (over-fire: same reason)

The over-fire case forces either (a) a commit split that violates ADR-014 batch grain, (b) a no-op `git add docs/problems/README.md` that fails silently (no change to add), or (c) use of `BYPASS_README_REFRESH_GATE=1` (which per P173 must live in `.claude/settings.json` env, not on the inline command, making it cumbersome for one-off bypass).

This session's live evidence:

- 2026-06-03 `/wr-architect:review-decisions` follow-up: P076 + P080 Investigation Tasks updates (recording Tom-pinned ADR-037 + ADR-038 sub-decision shapes; non-ranking-bearing) were blocked by P165. Forced commit split into commit `85113e4` (ADRs + compendium, no tickets) and commit `bf15571` (P076 + P080 + P084 with RISK_BYPASS: capture-deferred-readme trailer).
- The `RISK_BYPASS: capture-deferred-readme` trailer (P262/P265 mechanism) cleared the hook, but the trailer's name implies "this is a capture-flow deferral", using it for non-capture edits is semantically wrong.

## Symptoms

- `git commit` BLOCKED with directive `P165. P<NNN> needs README refresh: git add docs/problems/README.md. Bypass: BYPASS_README_REFRESH_GATE=1 via .claude/settings.json env (P173).` on edits that demonstrably don't change README rankings.
- Reconcile-readme script returns exit 0 (clean) before AND after the edit, confirming no actual README change is needed.
- BYPASS_README_REFRESH_GATE=1 inline on the command (e.g. `BYPASS_README_REFRESH_GATE=1 git commit ...`) does NOT work; only the settings.json env path is honoured per P173.

## Workaround

Option A: split the commit so non-ranking-bearing ticket edits ride a commit that doesn't include them, and use `RISK_BYPASS: capture-deferred-readme` trailer on the ticket-bundle commit (re-purposes the capture-flow token; semantically wrong).

Option B: add BYPASS_README_REFRESH_GATE=1 to .claude/settings.json env temporarily (heavy ceremony for one-off bypass).

Option C: regenerate docs/problems/README.md unnecessarily and stage it (no-op write that satisfies the hook's "is staged" check).

## Impact Assessment

- **Who is affected**: every agent or maintainer editing problem tickets (Investigation Tasks, Description edits, Progress log entries) without changing WSJF + Status fields.
- **Frequency**: any session that touches existing problem tickets without transitioning them. Observed live this session.
- **Severity**: Medium. Forces commit grain violations OR cumbersome bypass workflows. Compounds with the P085 external-comms marker hash invalidation when commit splits force commit-message body changes.
- **Analytics**: deferred to investigation.

## Root Cause Analysis

### Hypothesis

The P165 hook's "ticket file staged, README must be staged" rule is correct for new-ticket creation and status transitions but over-conservative for non-ranking-bearing edits. The hook either needs:

1. **Field-aware detection**: parse the staged diff for changes to `**WSJF**:`, `**Status**:`, `**Priority**:`, `**Effort**:` lines specifically; fire only when those fields changed. Investigation Tasks / Description / Progress log edits would silent-pass.
2. **Reconcile-as-check**: invoke `wr-itil-reconcile-readme` against the post-commit state; fire only when reconcile would report drift. (More expensive but precisely correct.)
3. **Allow inline BYPASS_README_REFRESH_GATE=1 env**: relax P173 so the env var works on the immediate command, not just settings.json. (Keeps the safety-by-default but allows one-off bypass without ceremony.)

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Read the P165 hook source (`packages/itil/hooks/itil-readme-refresh-discipline.sh`) to understand current trigger logic
- [ ] Decide between field-aware detection (option 1), reconcile-as-check (option 2), or inline env bypass (option 3)
- [ ] Determine if the fix is local (project-level hook) or upstream (itil plugin)
- [ ] Confirm whether the BYPASS_README_REFRESH_GATE=1 inline-env limitation is a deliberate P173 design choice or an unintended constraint

## Dependencies

- **Blocks**: (none directly; affects commit-flow ergonomics)
- **Blocked by**: (none)
- **Composes with**: P085 (external-comms marker hash invalidation; the cascade where a P165 forced retry changes commit body which invalidates P085 marker).

## Related

- P165 (README-refresh-discipline hook source; the file this ticket targets)
- P262, P265 (RISK_BYPASS allow-list token mechanism; the `capture-deferred-readme` token clears this gate for capture-problem flows; this ticket asks whether a parallel mechanism is needed for non-capture non-ranking-bearing edits)
- P173 (BYPASS_README_REFRESH_GATE=1 must live in .claude/settings.json env; the rationale for this constraint should be re-examined as part of this ticket's investigation)
- P094 (refresh-on-create) and P062 (refresh-on-transition) define the legitimate ranking-bearing surfaces; this ticket addresses the gap where edits don't fall into either bucket.
- Upstream surface (probable): `packages/itil/hooks/itil-readme-refresh-discipline.sh` in agent-plugins repo.

(captured via /wr-itil:capture-problem on 2026-06-03 after live observation in /wr-architect:review-decisions follow-up: P076 + P080 Investigation Tasks edits forced a commit-split workaround; bundled with P085 + P087 in one batch commit per ADR-014 related-cluster carve-out)
