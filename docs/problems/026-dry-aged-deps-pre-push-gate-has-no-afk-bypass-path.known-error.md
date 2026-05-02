# Problem 026: dry-aged-deps pre-push gate has no AFK-bypass path; halts work-problems loop on every stale-dep state

**Status**: Known Error
**Reported**: 2026-04-26
**Priority**: 16 (Significant). Impact: Significant (4) x Likelihood: Likely (4)
**Effort**: S
**WSJF**: 32.0 = (16 x 2.0) / 1

## Description

`dry-aged-deps --check` runs as part of `npm run push:watch` and halts the AFK work-problems loop when deps are stale. The gate has no AFK-bypass nor authorised-update path; user intervention is required.

## Symptoms

From prior AFK session:
- First drain rejected on react/react-dom 16-day staleness
- Required user "fix the deps" intervention to clear the gate
- Loop could not self-recover; orchestrator halted

## Workaround

Pre-emptive `npx dry-aged-deps --update --yes` before starting work-problems, OR commit-time deps-refresh as part of work-problems Step 0.

## Impact Assessment

- **Who is affected**: AFK orchestrator runs
- **Frequency**: Every AFK session with deps older than the staleness threshold
- **Severity**: Significant. Halts the loop; forces user intervention
- **Analytics**: dry-aged-deps gate halt logs; npm push failure transcripts

## Root Cause Analysis

The pre-push hook at `.git/hooks/pre-push` runs `npm run deps:check` which is `dry-aged-deps --check`. When any dependency is past the staleness threshold the hook exits non-zero, aborting `git push`. `scripts/push-watch.sh` runs `git push "$@"` directly (line 38 in the pre-fix version), so a stale-deps state surfaces as a halt of the entire `npm run push:watch` flow. The work-problems orchestrator's drain step invokes `push:watch` and has no path to clear the gate without a human in the room.

The gate itself is correct: it surfaces stale deps before they ship. What is missing is a deterministic auto-resolution path for the auto-resolvable subset that does not need human judgement.

### Fix Strategy

Tom corrected the strategy on 2026-05-02. `dry-aged-deps` stays in the pre-push hook. When it fires, the resolution is NOT to auto-bypass the gate. The resolution is to update the recommended dependency, one package per commit, including test and code changes that the update requires. Major-version updates are not exempt.

The mechanism:

1. **Pre-push hook unchanged.** `npm run deps:check` continues to run `dry-aged-deps --check` and exit non-zero on stale state. The gates safety surface is preserved.

2. **New skill: `wr-itil:update-stale-deps`** (built via skill-creator). When invoked, the skill:
   - Reads the staleness report (which packages are over threshold, what version each should move to).
   - For each stale package, in dependency-order where possible:
     - Runs `npx dry-aged-deps --update <package>` (one package only).
     - Runs the test suite. If tests fail, the agent diagnoses and fixes the test, code, or type changes the dep update requires. The orchestrator loop pays agent turns here; it does not skip to the next package.
     - Once tests pass, commits as `chore(deps): bump <package> to <version> (P026)`. The risk-score-commit-gate runs normally; no bypass.
     - Moves to the next package.
   - When all packages clear, the loop exits and the push proceeds.

3. **Major-version updates**: same path. The loop does not exempt majors. The agent reads release notes and applies breaking-change updates per package. If the agent cannot resolve a major autonomously (genuinely needs human judgement), the loop halts on that specific package and surfaces partial progress: N packages updated, package X needs human review.

4. **Wiring**: `wr-itil:update-stale-deps` fires on ANY caller that hits a `dry-aged-deps` pre-push failure, not just `/wr-itil:work-problems`. The trigger surfaces include:
   - Manual `git push` from the developer terminal (the pre-push hook prints a message naming the skill; the developer invokes it explicitly).
   - `scripts/push-watch.sh` (after the auto-resolve revert): when the wrapped `git push` fails on `dry-aged-deps`, the script invokes the skill before retry.
   - `/wr-itil:work-problems` Step 0: when the orchestrator detects `npm run deps:check` returns non-zero before attempting work, the skill runs to clear the gate.
   - Any future caller that wraps push: same contract, same skill. The skill is the single resolution path; no caller bypasses it.

This supersedes the auto-bypass approach in ADR 021, which moved `dry-aged-deps --update --yes` into `push-watch.sh` and silently auto-committed root-manifest changes. ADR 021 is to be marked superseded by a new ADR that codifies the one-package-per-commit policy. Risk-reducing-bypass per ADR-008 still applies for genuinely-trivial dep refreshes (patches within tolerance) but the mechanism moves from "do it silently inside push-watch.sh" to "do it explicitly inside the update-stale-deps skill, with full test runs and per-package commits."

### Investigation Tasks

- [x] Decide insertion point: original choice (push-watch.sh auto-bypass) is superseded by Toms 2026-05-02 correction. New insertion point is a dedicated skill (`wr-itil:update-stale-deps`) invoked by the orchestrator before push.
- [x] Architect review of ADR 021: completed for the original strategy. ADR 021 now needs supersede.
- [x] Implement fix in `scripts/push-watch.sh` with non-fatal failure handling: the auto-resolve and auto-commit behaviour added by ADR 021 must be reverted in `scripts/push-watch.sh`. Pre-push gate stays.
- [ ] Supersede ADR 021 with a new ADR documenting the one-package-per-commit policy, including the major-version case (no exemption) and the AFK orchestrator integration boundary.
- [ ] Revert `scripts/push-watch.sh` auto-resolve and auto-commit modifications.
- [ ] Build `wr-itil:update-stale-deps` skill via skill-creator. Inputs: stale-dep report. Behaviour: per-package update, test run, agent-led test/code fixes if needed, normal-risk commit, loop. Halt on packages the agent cannot resolve autonomously.
- [ ] Wire `wr-itil:update-stale-deps` into every pre-push failure surface: pre-push hook printout, `scripts/push-watch.sh` retry path, `/wr-itil:work-problems` Step 0. The skill is the single resolution path; no caller bypasses or duplicates the logic.
- [ ] Reproduction test: deferred unless a recurrence in the new mechanism justifies the cost. Reproducing requires backdating the lockfile by the staleness threshold and invoking the new skill.
- [ ] User verification on next AFK orchestrator run that touches a stale-deps state, against the new skill (not the push-watch.sh auto-resolve path).


## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P020 (cadence): same root surface; closing P020 reduces P026 trigger frequency

## Related

- ADR 021 (auto-resolve stale dependencies in push:watch): docs/decisions/021-auto-resolve-stale-deps-in-push-watch.proposed.md
- ADR-008 (action-specific pipeline risk management; "Risk-reducing bypass" sub-section): docs/decisions/008-action-specific-pipeline-risk-management.proposed.md
- `scripts/push-watch.sh` (fix site)
- `.git/hooks/pre-push` (the gate this fix avoids tripping on)
- packages/itil/skills/work-problems/SKILL.md (Step 0 / Step 6.5 push paths)
- npm dry-aged-deps package
