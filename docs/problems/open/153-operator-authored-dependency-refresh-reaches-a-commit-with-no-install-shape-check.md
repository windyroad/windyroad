# Problem 153: An operator-authored dependency refresh reaches a commit with no lockfile install-shape check

**Status**: Open
**Reported**: 2026-08-16
**Priority**: 9 (Medium), Impact: 3 x Likelihood: 3, derived at capture from the description per Step 4a. Impact 3 because RISK-POLICY rates a broken or delayed build as Moderate and a red `npm ci` fails at CI's first step, blocking `build` and transitively the accessibility gate, the smoke test and the release path; nothing reaches readers. Likelihood 3 rather than P126's 4 because the trigger is narrower: not any dependency update, only one a human applies by hand outside the refresh flow, cf. P126.
**Origin**: internal
**Effort**: S, derived at capture: split reporting from acting in one router in `push-watch.sh`, plus a decision about the second locus in `fix-deps.sh`. Comparable to P123 and P126, both rated S.

## Description

A dependency refresh applied by hand reaches a commit with nothing checking whether the lockfile is installable. The detector exists and works; nothing invokes it on that path.

Observed 2026-08-16 while fixing a red dependency-freshness gate. Bumping `@changesets/cli` with `npm install --save-dev --save-exact` produced 19 nested `@rollup/rollup-*` entries under `netlify-cli` missing `optional: true`, which is the P123 EBADPLATFORM class: `npm ci` refuses them on CI's linux/x64 runner. That lockfile was committed and would have reddened master a second time in the same session.

**The tell was visible and went unread.** A 351-insertion, 5-deletion `package-lock.json` delta for a patch bump. A real patch bump is 5 and 5, which is what `npm install --package-lock-only` produced once it deduped the nested entries back onto the flagged top-level ones. A one-sided insertion count on a version bump means entries were added to the resolved tree, and that is the signature.

**The detector is not missing.** `scripts/lib/manifest-sync.test.mjs` carries two cases that scan this repository's real manifests rather than fixtures, and `lockfile_platform_flag_violations` asserts zero against the committed lockfile. Verified directly on 2026-08-16 by restoring the pre-dedupe lockfile and re-running that file: the case goes red and names the offending keys. So `npm test` catches this class locally, and the jq predicate is platform-independent, which is why it reaches an arm a darwin-local `npm ci` cannot.

**What is missing is any automatic invocation between the hand-edit and the commit.** Three separate reasons, each verified on disk:

- `.git/hooks/pre-push` runs `npm run deps:check` and nothing else. That judges staleness, not installability.
- There is no pre-commit hook.
- `npm run fix:deps` cannot help after the fact. `scripts/fix-deps.sh` lines 124 to 127 exit 0 at `dry-aged-deps --check` once dependencies are current, which a hand-applied bump has already made true, so the CI-parity gate further down the file is structurally unreachable once the bump exists. This is a second locus and the fix should not be scoped to `push-watch.sh` alone.

**The push-watch half is a deliberate boundary, not an oversight, and the fix has to respect that.** `scripts/push-watch.sh` computes `REFRESH_VIOLATIONS` from both scans unconditionally, then `manifest_refresh_route` returns `skip` whenever `REFRESH_AUTHORED` is not 1, which is exactly the operator-authored case, so both scans are computed and discarded. Lines 153 to 158 explain why: when either manifest was already dirty on entry, push:watch cannot separate its own writes from the operator's, so it neither sweeps their work into a `chore(deps)` commit nor reverts it. ADR-021's Decision Outcome scopes the auto-commit to "a working-tree change introduced inside push-watch.sh", and this is exactly that.

The ownership gate is right to stop push:watch **acting** on someone else's manifest change. It should not also stop it **reporting** a lockfile that `npm ci` would reject. Splitting reporting from acting is the minimal change.

## Symptoms

- A hand-applied dependency bump commits a lockfile that `npm ci` refuses, and the first detector is CI.
- `push:watch` runs both manifest scans and says nothing about what they found.
- `npm run fix:deps` reports "Dependencies are current. Nothing to fix." and exits before its CI-parity gate, on precisely the tree that needs it.
- The lockfile delta is wildly asymmetric for the size of the version change, and nothing flags that.

## Workaround

Run the scans by hand before committing a hand-authored manifest change:

```
bash -c 'source scripts/lib/manifest-sync.sh; lockfile_platform_flag_violations package-lock.json; manifest_sync_violations package.json package-lock.json'
```

Zero output from both is the healthy state. On violations, `npm install --package-lock-only` dedupes. This depends on the operator remembering, which is the defect.

## Impact Assessment

- **Who is affected**: whoever pushes after a hand-applied dependency change, and anyone blocked behind the resulting red master.
- **Frequency**: observed once, 2026-08-16. The trigger is a hand-applied bump outside the refresh flow, which is less frequent than P126's any-dependency-update trigger.
- **Severity**: a red `build` job blocks the accessibility gate, the smoke test and the release path. Nothing reaches readers, because `netlify.toml` disables git-triggered builds.
- **Analytics**: not instrumented.

## Root Cause Analysis

Two loci, one shape: the CI-parity checking is attached to the automated refresh flow, and a hand-applied bump is outside it in both directions. `push-watch.sh` declines to report because it correctly declines to act. `fix-deps.sh` exits before its gate because the bump it would have applied is already applied.

### Investigation Tasks

- [ ] Investigate root cause
- [ ] Create reproduction test
- [ ] Split reporting from acting in `manifest_refresh_route`, so push:watch still refuses to commit or revert an operator's manifest change but does surface a lockfile `npm ci` would reject
- [ ] Decide the `fix-deps.sh` locus separately: either the early exit at lines 124 to 127 gains an installability check before it returns, or a `--check-only` path reaches the CI-parity gate without requiring stale deps
- [ ] Decide whether the resolution-delta asymmetry is worth surfacing on its own. A one-sided insertion count on a version bump was the visible tell here and no check reads it
- [ ] Read P123's Investigation Task 3 before proposing a git hook. It explicitly declined `.githooks/` as a separate decision with its own cost, and this ticket reopens that decision rather than assuming it

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P123, P126

## Related

Captured via `/wr-itil:capture-problem`.

Hang-off check dispatched against P126, P123, P095 and P111; verdict PROCEED_NEW. Rationale from that arbitration, recorded so the next reviewer sees what was tested:

- **P126** (deps refresh chain creates a manifest desync and cannot recover from it) was tested hardest as the parent and does not hold. Its two defects are about the tooling's own writes being incoherent: push-watch committing a pair it authored, and fix-deps' rollback restoring that pair. Both are the `REFRESH_AUTHORED=1` path. This is the `REFRESH_AUTHORED=0` path, where the machinery behaved exactly as designed and the gap is that designed behaviour reports nothing. P126's own body argues against absorption twice: its Investigation Task 3 says that if the two fixes want separate verification, splitting is cheap and it should be split rather than stretched; and its Fix Released section carries an unmet condition, that the end-to-end path has not run for real, so new scope would confound a pending verification. P126 also never touches the `fix-deps.sh` early-exit locus.
- **P123** (fix-deps gates on vitest only) is the defect class this incident reproduced, not the enforcement gap. P123's fix works here: `lockfile_platform_flag_violations` is live and catches the shape. Nothing calls it on this path. P123 is closed, and the local precedent is that closed tickets are not absorption targets.
- **P095** (dry-aged-deps exact-pin deadlock) shares only the command shape. Its root cause is `--update` no-opping against an exact pin; here the hand-bump succeeded and the failure is downstream. Note the capture-time pre-filter listed P095 as known-error; it is closed, verified on disk.
- **P111** (publish-day push blocked by deps hygiene chain) has the pre-P126 desync as its defect 1, already fixed, and its live remainder is local-versus-CI freshness divergence. That is staleness judgement; this is installability, which is the same distinction this ticket draws about `deps:check`.

Advisory carried from that arbitration: the proposed push-watch change edits code P126 shipped, so P126's re-armed ADR-034 criterion (d) exercise should be read against the current shape before the split lands.
