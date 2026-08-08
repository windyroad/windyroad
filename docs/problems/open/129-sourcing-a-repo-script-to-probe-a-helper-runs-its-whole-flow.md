# Problem 129: Sourcing a repo script to probe a helper runs its whole flow, because the LIB_ONLY seam is opt-in

**Status**: Open
**Reported**: 2026-08-08
**Priority**: 9 (Medium), Impact: 3 x Likelihood: 3, derived at capture from the description. Impact is 3 because the flow that runs unguarded is `scripts/push-watch.sh`, which stashes, rebases, auto-updates dependencies, and pushes: RISK-POLICY rates a broken or delayed build as Moderate, and an unintended push can publish work the session was not ready to publish. It is not higher because the push carries only already-committed work and nothing is destroyed. Likelihood is 3 because probing a pure helper is a routine thing to want, both affected scripts expose helpers worth probing, and the correct incantation is easy to omit under time pressure. Observed once on 2026-08-08.
**Effort**: S, derived at capture. One guard clause per script plus a case in each existing test file. Comparable to P123 and P126, both rated S for edits of this size to the same two scripts.

## Description

`scripts/push-watch.sh` and `scripts/fix-deps.sh` both expose pure helpers behind a test seam: sourcing the script with `PUSH_WATCH_LIB_ONLY=1` (respectively `FIX_DEPS_LIB_ONLY=1`) defines the helpers and returns before the flow runs. `scripts/push-watch.test.mjs` and `scripts/fix-deps.test.mjs` use it correctly.

The seam is **opt-in**, so omitting the variable does not fail safe: the source runs the entire script. For `push-watch.sh` that means `git stash`, `git pull --rebase`, `git stash pop`, `npx dry-aged-deps --update --yes`, the deps gate, `ci-status-check.sh`, and `git push`.

**Observed 2026-08-08** during the P126 fix. A one-line probe intended to reach the `manifest_refresh_route` helper ran:

```bash
source scripts/push-watch.sh 2>/dev/null || true
```

The `2>/dev/null || true` was meant to make the source tolerant. It instead hid the script's own output while the flow ran to completion, and four already-committed commits were pushed to `origin/master` in an iteration whose instructions said explicitly not to push. The command then hit the 2-minute Bash timeout partway through the post-push WIP checks.

Nothing was lost: the manifests were clean, `dry-aged-deps` reported no safe updates so no `chore(deps)` commit was created, and the stash/pop cycle restored the working tree intact. The harm was the unintended publish and the diagnostic time to establish exactly what had run.

## Symptoms

A Bash call that reads as a read-only probe produces `git stash` / `Current branch master is up to date` / dependency-check output / WIP-check output, and `git rev-list --count origin/master..HEAD` afterwards returns 0 when the session had unpushed commits.

## Workaround

Never source these scripts directly from an ad-hoc command. Either:

```bash
# Subshell, so a forgotten export cannot leak into the rest of the session.
bash -c 'export PUSH_WATCH_LIB_ONLY=1; source scripts/push-watch.sh; manifest_refresh_route 1 1 ""'
```

or read the helper's source, or add a case to the existing `scripts/*.test.mjs` harness, which already does this correctly.

## Impact Assessment

- **Who is affected**: anyone probing these helpers from a Bash call, and any AFK orchestrator doing so mid-iteration, where an unintended push escapes the loop's own cadence controls.
- **Frequency**: once observed. The pattern recurs whenever a helper is probed outside the vitest harness.
- **Severity**: Medium. The flow is not destructive, but it publishes, and it does so silently enough that the operator may not notice for several turns.
- **Analytics**: none.

## Root Cause Analysis

The seam is a positive condition (`run the flow unless told otherwise`) guarding a side-effecting flow. Fail-safe design puts the burden the other way: a script whose body pushes should refuse to run its body when it was sourced rather than executed, because sourcing is never how you invoke the flow.

Bash distinguishes the two: when a script is executed, `${BASH_SOURCE[0]}` equals `$0`; when it is sourced, they differ. The existing `*_LIB_ONLY` variables would remain as the explicit opt-in for the test harness, but they would stop being the ONLY thing standing between a source and a push.

### Investigation Tasks

- [ ] Add a sourced-without-opt-in guard near the top of `scripts/push-watch.sh` and `scripts/fix-deps.sh`: when `${BASH_SOURCE[0]}` differs from `$0` and the script's `*_LIB_ONLY` variable is unset, print a one-line directive naming the correct incantation and `return 0` instead of running the flow. Confirm the guard sits above every side-effecting line and below nothing that the helpers need.
- [ ] Check the interaction with the existing seam. The guard makes the seam's return redundant for the sourced case, but the seam should stay: it is the documented, greppable contract the test files bind against, and removing it would be a wider change than this fix needs.
- [ ] Add a case to `scripts/push-watch.test.mjs` and `scripts/fix-deps.test.mjs` asserting that sourcing without the opt-in variable defines no flow side effects and returns cleanly. The probe must not be able to pass by accident: assert on the guard's directive line.
- [ ] Check whether any other repo script has the same shape. `scripts/release-watch.sh` and `scripts/ci-status-check.sh` are the obvious candidates; the guard is only worth adding where the body has side effects.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P126, P123

## Related

- **P126** (`docs/problems/verifying/126-deps-refresh-chain-creates-and-cannot-recover-from-a-manifest-desync.md`): the fix during which this was observed. Its `manifest_refresh_route` helper was the probe target.
- **P123** (`docs/problems/verifying/123-fix-deps-gates-on-vitest-only-so-a-lockfile-npm-ci-cannot-install-passes-and-reddens-master.md`): established the `FIX_DEPS_LIB_ONLY` probe seam this ticket proposes to backstop.
- Evidence: the unintended push landed `6676aac` and the three commits before it on `origin/master`, 2026-08-08, from an AFK `/wr-itil:work-problems` iteration whose constraints read "Do NOT push, do NOT run push:watch".
- Captured via `/wr-itil:capture-problem` from the P126 iteration's retro, Step 4b Stage 1 (recurring class-of-behaviour, P342 mechanical-stage carve-out). Persona and JTBD lines omitted per this repo's local convention for maintainer-tooling tickets; `docs/jtbd/` covers audience personas only, and the 2026-06-17 direction to author an internal-maintainer persona is still outstanding work.
