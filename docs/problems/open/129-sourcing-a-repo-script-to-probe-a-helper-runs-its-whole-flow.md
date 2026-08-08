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

- [x] Add a sourced-without-opt-in guard near the top of `scripts/push-watch.sh` and `scripts/fix-deps.sh`: when `${BASH_SOURCE[0]}` differs from `$0` and the script's `*_LIB_ONLY` variable is unset, print a one-line directive naming the correct incantation and `return 0` instead of running the flow. Confirm the guard sits above every side-effecting line and below nothing that the helpers need. **Done**, with one correction from the architect review: the guard sits above `set -euo pipefail`, not below it. `source` runs in the CALLER's shell, so setting those options first leaves `errexit` and `nounset` switched on in the probing shell long after the guard returns. That is the same class of lasting effect from a read-only probe that this ticket is about, and the original probe (`source scripts/push-watch.sh 2>/dev/null || true`) would still have suffered it.
- [x] Check the interaction with the existing seam. **Done**, both seams stay verbatim (`push-watch.sh` and `fix-deps.sh`). The guard backstops them and does not invert their polarity. A test in each file asserts the opt-in probe path still works, so the seam cannot rot unnoticed.
- [x] Add a case to `scripts/push-watch.test.mjs` and `scripts/fix-deps.test.mjs` asserting that sourcing without the opt-in variable defines no flow side effects and returns cleanly. **Done**, three asserting cases per file rather than one: the directive line, the helpers left undefined (an independent signal that the guard fired, harder to satisfy by accident than a string match), and no `errexit`/`nounset` leak into the calling shell. All three fail with the guard removed; confirmed RED before the guards were written, per ADR-006.
- [x] Check whether any other repo script has the same shape. **Done.** `scripts/release-watch.sh` has it and is worse: its body runs `gh pr merge`, `git commit` and `git push`, so a stray source publishes a release. It is guarded, with its own new test file. `scripts/ci-status-check.sh` is excluded: its only mutation is `rm -f "$MARKER"` on its own single-shot override marker. Recorded so the exclusion is not re-litigated from a half-fact: it is excluded on consequence, not on absence of side effects. It uses bare `exit`, so a stray source would terminate the probing shell outright, and a sourced script inherits the caller's positional parameters, which makes its branch-argument requirement less protective than it reads. Consequence is still a consumed marker and an ended Bash call, never repository state.

## Resolution

Fixed 2026-08-09. Three guards, each above `set -euo pipefail` in its file:

- `scripts/push-watch.sh` and `scripts/fix-deps.sh`: refuse the source unless the script's existing `*_LIB_ONLY` variable is set, then print the flow's real entry point and the correct probe incantation.
- `scripts/release-watch.sh`: refuse the source outright. This script has no `*_LIB_ONLY` seam and no pure helper worth probing, so unlike its two siblings there is no probe path to preserve and no opt-in variable is warranted. Its guard is pure accident-prevention, which is a different justification from the other two and is recorded as such in the file. If a helper there ever becomes worth probing, the comment directs the next reader to add `RELEASE_WATCH_LIB_ONLY` in the sibling shape rather than invent a third mechanism. The guard also sits above the `gh repo view` call on line 9, which would otherwise fire a network request on every source.

Tests: `scripts/push-watch.test.mjs`, `scripts/fix-deps.test.mjs`, and a new `scripts/release-watch.test.mjs`. The new file also pins the premise every guard depends on: `package.json` must keep invoking all three as `bash scripts/<name>.sh`, because that is the only reason `$0` and `${BASH_SOURCE[0]}` match on the executed path. Rewriting one of those entries to source the file would silently flip a guard from a backstop into a block on the real flow, and no other test would have noticed.

### Verification

Reproduced directly in a scratch directory confirmed not to be a git repo, so no reproduction could reach a remote:

- Sourced without the opt-in variable, all three scripts print their directive, return 0, and leave the calling shell alive. `git status` against the repo afterwards showed only this fix's own edits, with no manifest churn and no commits created.
- Executed (`bash scripts/push-watch.sh`) from the same scratch directory, the script passes straight through the guard and dies inside the flow at `git diff`, which is the proof the guard is inert on the real invocation path rather than merely absent from it.
- Full suite green: 500 passed, 2 skipped, 30 files. `npm run lint` clean.

No changeset: the root package is `private: true` and these are repo-local dev-tooling scripts with no published API contract. This matches the reasoning already recorded in `scripts/fix-deps.sh` for the same class of change.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P126, P123

## Related

- **P126** (`docs/problems/verifying/126-deps-refresh-chain-creates-and-cannot-recover-from-a-manifest-desync.md`): the fix during which this was observed. Its `manifest_refresh_route` helper was the probe target.
- **P123** (`docs/problems/verifying/123-fix-deps-gates-on-vitest-only-so-a-lockfile-npm-ci-cannot-install-passes-and-reddens-master.md`): established the `FIX_DEPS_LIB_ONLY` probe seam this ticket proposes to backstop.
- Evidence: the unintended push landed `6676aac` and the three commits before it on `origin/master`, 2026-08-08, from an AFK `/wr-itil:work-problems` iteration whose constraints read "Do NOT push, do NOT run push:watch".
- Captured via `/wr-itil:capture-problem` from the P126 iteration's retro, Step 4b Stage 1 (recurring class-of-behaviour, P342 mechanical-stage carve-out). Persona and JTBD lines omitted from the header per this repo's local convention for maintainer-tooling tickets.
- Anchoring, provisional and in prose only. The **internal-maintainer** persona (`docs/jtbd/internal-maintainer/persona.md`) does describe the person this fix serves: someone frequently absent while the work runs, with nobody watching the console when a surface fails. That anchor is provisional because the persona is unratified; it was written on 2026-08-08 on Tom's in-session direction and he has not read it. Separately, and this is a second fact rather than a restatement of the first, **no documented job covers unattended-action safety**, so no job is claimed here. JTBD-400 (Trust What the Loop Did While I Was Away) reads like a fit from its title but is not one: its job statement and all five outcomes are about the loop's verdicts and measurements being right or visibly absent, and a `git push` is neither a verdict nor a measurement. A candidate job for the gap was drafted during this fix's JTBD review and is queued for Tom to accept, amend or reject; it was deliberately not authored, because new jobs are direction-setting and need human confirmation exactly as a new ADR does. Re-check this paragraph once that ask is answered, since either outcome makes it stale.
- Corrects a stale claim this ticket carried at capture. The original text read that `docs/jtbd/` "covers audience personas only, and the 2026-06-17 direction to author an internal-maintainer persona is still outstanding work". Verified on disk 2026-08-09: `docs/jtbd/internal-maintainer/` holds `persona.md` plus JTBD-400, JTBD-401 and JTBD-402. The persona was authored the same day this ticket was captured, so the sentence was already false when written, and it was the sentence the ticket used to justify omitting the anchor.
