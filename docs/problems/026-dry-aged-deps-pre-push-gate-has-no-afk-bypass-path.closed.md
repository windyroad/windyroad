# Problem 026: dry-aged-deps pre-push gate has no AFK-bypass path; halts work-problems loop on every stale-dep state

**Status**: Closed
**Reported**: 2026-04-26
**Closed**: 2026-05-07
**Priority**: 16 (Significant). Impact: Significant (4) x Likelihood: Likely (4)
**Effort**: N/A (closed as misframed; no fix shipped)
**WSJF**: N/A (closed)

## Closure note (2026-05-07)

Closed as misframed on Tom's direction. The dry-aged-deps gate is intentional discipline, not a missing AFK bypass. Tom's framing: "it does have an AFK bypass. Do the necessary upgrades. It's there to make sure we do this. It's like brushing your teeth."

The "AFK bypass" the original ticket title looked for is doing the upgrades the gate exists to enforce. There is no escape valve and there shouldn't be one. The Fix Strategy (build a windyroad-local `update-stale-deps` skill that auto-bumps packages per commit with agent-led test fixes) over-engineers around the gate when the correct response is to clear stale state by upgrading.

P020 (verifying) covers the legitimate complement: proactive cadence via `.github/workflows/deps-refresh.yml` weekly cron. As of 2026-05-07 the cron has run twice (2026-04-27, 2026-05-04) and `npx dry-aged-deps` reports zero outdated packages with mature versions. The gate has not halted an AFK loop since P020 shipped, which is itself evidence that the cadence is the right shape of fix.

The principle is captured in user memory `feedback_dry_aged_deps_is_intentional_discipline.md` so future iters do not re-open this framing. Future AFK halts on this gate should run upgrades (or escalate to the user when upgrades introduce breaking changes), not park / re-rate / classify-upstream.

ADR 021 (auto-resolve stale deps in push:watch) remains in proposed state. Whether to mark it superseded, withdrawn, or accepted-as-shipped is a separate decision; not in scope for this closure.

---

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

**Placement (corrected mid AFK iter 2 on 2026-05-02):** the new skill is **windyroad-local**, not upstream in the wr-itil plugin or anywhere else in the agent-plugins repo. Two reasons. First, this project cannot dictate placement to agent-plugins maintainers. Second, the skill operates on this project's `package.json`, `package-lock.json`, and test suite; the per-package update logic, breaking-change handling, and "agent diagnoses test/code fixes that a dep bump requires" all run against windyroad's actual code surface. A generic version may eventually be worth pulling upstream, but only after a local implementation has shown what the right abstraction is.

The mechanism:

1. **Pre-push hook unchanged.** `npm run deps:check` continues to run `dry-aged-deps --check` and exit non-zero on stale state. The gates safety surface is preserved.

2. **New windyroad-local skill: `update-stale-deps`** (built via skill-creator, located in this project's skills tree, e.g. `.claude/skills/update-stale-deps/`). When invoked, the skill:
   - Reads the staleness report (which packages are over threshold, what version each should move to).
   - For each stale package, in dependency-order where possible:
     - Runs `npx dry-aged-deps --update <package>` (one package only).
     - Runs the test suite. If tests fail, the agent diagnoses and fixes the test, code, or type changes the dep update requires. The orchestrator loop pays agent turns here; it does not skip to the next package.
     - Once tests pass, commits as `chore(deps): bump <package> to <version> (P026)`. The risk-score-commit-gate runs normally; no bypass.
     - Moves to the next package.
   - When all packages clear, the loop exits and the push proceeds.

3. **Major-version updates**: same path. The loop does not exempt majors. The agent reads release notes and applies breaking-change updates per package. If the agent cannot resolve a major autonomously (genuinely needs human judgement), the loop halts on that specific package and surfaces partial progress: N packages updated, package X needs human review.

4. **Wiring**: the skill fires on ANY caller that hits a `dry-aged-deps` pre-push failure, not just `/wr-itil:work-problems`. The trigger surfaces include:
   - Manual `git push` from the developer terminal (the pre-push hook prints a message naming the skill; the developer invokes it explicitly).
   - `scripts/push-watch.sh` (after the auto-resolve revert): when the wrapped `git push` fails on `dry-aged-deps`, the script invokes the skill before retry.
   - `/wr-itil:work-problems` Step 0: when the orchestrator detects `npm run deps:check` returns non-zero before attempting work, the skill runs to clear the gate.
   - Any future caller that wraps push: same contract, same skill. The skill is the single resolution path; no caller bypasses it.

This supersedes the auto-bypass approach in ADR 021, which moved `dry-aged-deps --update --yes` into `push-watch.sh` and silently auto-committed root-manifest changes. ADR 021 is to be marked superseded by a new ADR that codifies the one-package-per-commit policy. Risk-reducing-bypass per ADR-008 still applies for genuinely-trivial dep refreshes (patches within tolerance) but the mechanism moves from "do it silently inside push-watch.sh" to "do it explicitly inside the update-stale-deps skill, with full test runs and per-package commits."

### Investigation Tasks

- [x] Decide insertion point: original choice (push-watch.sh auto-bypass) is superseded by Toms 2026-05-02 correction. New insertion point is a dedicated skill invoked by the orchestrator before push.
- [x] Architect review of ADR 021: completed for the original strategy. ADR 021 now needs supersede.
- [x] Implement fix in `scripts/push-watch.sh` with non-fatal failure handling: the auto-resolve and auto-commit behaviour added by ADR 021 must be reverted in `scripts/push-watch.sh`. Pre-push gate stays.
- [x] **Decide skill placement** (corrected 2026-05-02): windyroad-local, NOT upstream in agent-plugins. Skill operates on this project's package.json, lockfile, and test suite; placement is project-local.
- [ ] Supersede ADR 021 with a new ADR documenting the one-package-per-commit policy, including the major-version case (no exemption) and the AFK orchestrator integration boundary. Note new placement (windyroad-local skill) in the new ADR.
- [ ] Revert `scripts/push-watch.sh` auto-resolve and auto-commit modifications.
- [ ] Build the `update-stale-deps` skill locally (e.g. `.claude/skills/update-stale-deps/`) via skill-creator. Inputs: stale-dep report. Behaviour: per-package update, test run, agent-led test/code fixes if needed, normal-risk commit, loop. Halt on packages the agent cannot resolve autonomously.
- [ ] Wire the skill into every pre-push failure surface: pre-push hook printout, `scripts/push-watch.sh` retry path, `/wr-itil:work-problems` Step 0. The skill is the single resolution path; no caller bypasses or duplicates the logic.
- [ ] Reproduction test: deferred unless a recurrence in the new mechanism justifies the cost. Reproducing requires backdating the lockfile by the staleness threshold and invoking the new skill.
- [ ] User verification on next AFK orchestrator run that touches a stale-deps state, against the new skill (not the push-watch.sh auto-resolve path).
- [ ] Re-rate Effort and WSJF after placement and ADR-supersede tasks are scoped (current: TBD, previous values invalidated by placement correction).


## Dependencies

- **Blocks**: (none)
- **Blocked by**: nothing upstream. Previously framed as "blocked by upstream wr-itil:update-stale-deps skill build in agent-plugins"; that framing was invalidated by the 2026-05-02 placement correction. Local work, no external dependencies.
- **Composes with**: P020 (cadence): same root surface; closing P020 reduces P026 trigger frequency. P045 (assistant parrots upstream-placement framing without questioning): the discipline ticket capturing the meta-pattern that produced the original wrong framing on this ticket.

## Related

- ADR 021 (auto-resolve stale dependencies in push:watch): docs/decisions/021-auto-resolve-stale-deps-in-push-watch.proposed.md
- ADR-008 (action-specific pipeline risk management; "Risk-reducing bypass" sub-section): docs/decisions/008-action-specific-pipeline-risk-management.proposed.md
- `scripts/push-watch.sh` (fix site)
- `.git/hooks/pre-push` (the gate this fix avoids tripping on)
- `~/.claude/plugins/cache/windyroad/wr-itil/0.23.1/skills/work-problems/SKILL.md` (Step 0 / Step 6.5 push paths; orchestrator caller, not the skill's home)
- npm dry-aged-deps package
- P045 (meta-pattern: assistant accepted the original "upstream wr-itil skill build" framing on this ticket without questioning whether the skill belongs upstream at all)
