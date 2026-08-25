# Problem 168: The freshness gate reads the installed tree and its fix flow only writes the manifests, so the gate never clears

**Status**: Open
**Reported**: 2026-08-25
**Priority**: 12 (High), Impact: 3 x Likelihood: 4, derived at capture. Impact is 3 because the push path deadlocks: the gate blocks, the prescribed recovery succeeds and commits, and the gate blocks again on the same package with no state that any step in the loop can change. Work sits committed and unpushed until someone steps outside the documented flow. Likelihood is 4 because it follows deterministically from two design choices that are both currently in place, and nothing detects it.

**Origin**: internal
**Effort**: S, derived at capture. One `npm install` after the lockfile write, or one change to what the checker reads. Both sites are local.

## Description

`npm run fix:deps` can succeed completely, commit, pass lint, the test suite and the build, and leave the push gate blocking on the exact package it just updated. Re-running the pair loops forever with nothing changing.

Observed on 2026-08-25 and diagnosed on disk.

Three facts compose into a deadlock.

`scripts/fix-deps.sh` applies updates to `package.json`, then completes the pair with `npm install --package-lock-only`, which the script's own comment explains is deliberate: a plain `npm install` reintroduces the unflagged nested `@rollup/rollup-*` duplicates of the P123 EBADPLATFORM class. That flag writes the lockfile and does not touch `node_modules`.

`dry-aged-deps --check` reports the **installed** version as current. Its own output line after a successful `fix:deps` commit read `dry-aged-deps 2.14.0 2.17.1 2.17.1 30 dev`: current 2.14.0, wanted and latest 2.17.1. At that moment `package.json` said 2.17.1 and the lockfile said 2.17.1, both committed. Only `node_modules/dry-aged-deps/package.json` still said 2.14.0.

So the gate reads a value that the fix flow is structurally unable to change. Each subsequent `push:watch` re-applies the same update to a `package.json` that already carries it, finds no net manifest change, declines, and prints the recovery that just ran.

Broken by `npm install`, which synced the installed tree to 2.17.1 and turned the check clean immediately. That command is in neither script's documented path.

## Symptoms

- `fix:deps` reports "Lockfile shape, lint, tests and build all green under the updated dependencies. Committing." and commits, and the next `push:watch` blocks on the same package.
- `push:watch` prints "The following packages will be updated: <pkg>: X to Y" on a repository whose committed manifests already say Y.
- The freshness check names a current version that appears in no tracked file.
- Committed work accumulates unpushed with every documented step reporting success.

## Workaround

`npm install`, then re-run `push:watch`. Confirmed: it moved the installed tree from 2.14.0 to 2.17.1 and the check went from stale to clean.

Note the side-effect before committing anything afterwards. That `npm install` wrote 346 lines of `"extraneous": true` entries into `package-lock.json`, recording packages present in `node_modules` but not required by the tree. Those are not a dependency change and should not be committed; `git checkout -- package-lock.json` discards them and the installed tree stays synced, because the committed lockfile already carried the correct pin.

## Impact Assessment

- **Who is affected**: anyone pushing after a dependency matures. No reader or visitor path, but nothing ships while it holds.
- **Frequency**: every time `fix:deps` updates a package whose installed copy is not subsequently reinstalled. Once observed, on 2026-08-25, holding three commits.
- **Severity**: the flow has no exit. Both scripts report success at every step, which removes the signal that would prompt someone to look outside them. The state that decides the gate is in `node_modules`, which is gitignored, so nothing in the repository shows why.
- **Analytics**: not instrumented.

## Root Cause Analysis

### Preliminary Hypothesis, and what was verified rather than inferred

The mechanism above is read off disk, not deduced: the three versions were compared directly (`package.json` 2.17.1, lockfile 2.17.1, `node_modules` 2.14.0), the checker's own tabular line was captured showing 2.14.0 as current, and the check flipped from exit 1 to exit 0 on `npm install` alone with no manifest edit. That is the discriminating test.

The underlying disagreement is about what "current" means. The checker means installed. The fix flow means declared. Neither is wrong on its own and the pair cannot converge.

`--package-lock-only` is load-bearing and should not simply be dropped. The comment at `scripts/fix-deps.sh` around line 152 records a real defect it avoids, and reverting it re-opens P123's class. So the fix is an added step or a changed reader, not a flag removal.

### Investigation Tasks

- [ ] Confirm whether `dry-aged-deps --check` can be told to read declared rather than installed versions, or whether its installed-tree reading is the point of the tool.
- [ ] Decide the fix site: an `npm install` after the CI-parity gate passes in `fix-deps.sh`, or a changed reader in the check.
- [ ] If the answer is `npm install`, establish whether it re-introduces the P123 nested-duplicate class that `--package-lock-only` exists to avoid, and what the lockfile looks like afterwards. The observed 346 extraneous lines say this needs checking rather than assuming.
- [ ] Create a reproduction: manifests at Y, installed tree at X, and assert the gate clears. Confirm it fails against the current scripts before shipping.

## Fix Strategy

The flow has to leave the installed tree agreeing with what it just committed, or the gate has to stop reading a value the flow cannot write. Those are the only two shapes and the choice is which one is cheaper to make safe.

Adding `npm install` after the CI-parity gate is the smaller change and it is the one that was observed working, but it re-enters the territory `--package-lock-only` was chosen to avoid, so it needs the P123 class checked rather than assumed. Changing what the check reads is more invasive and removes the disagreement rather than papering over it.

Whichever lands, add the loop detector regardless: if `push:watch` is about to apply an update that the committed manifests already carry, that is this defect and it should say so rather than routing to a recovery that cannot help. That check costs one comparison and it is the thing that turns a silent loop into a message.

Write the reproduction before the fix. The current scripts exit 0 on this path, so a test asserting exit 0 passes against the defect.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P126, P167, P123

## Related

Found on 2026-08-25 while pushing a retrospective commit, after `fix:deps` succeeded and the very next `push:watch` blocked on the package it had just updated.

- **P126** (the deps refresh chain creates a manifest desync and its own recovery path cannot clear it) is the closest sibling and the naming is almost identical, which is why the distinction matters. That ticket is about desync between `package.json` and `package-lock.json`, a pair both of which are tracked and both of which its fix now keeps coherent. This is desync between those two and the installed tree, which is gitignored and which no part of that fix touches. Same family, different pair, and P126's fix is working correctly throughout this failure.
- **P167** (the recovery path cannot run unattended and reports the stall as a judgement call) was found in the same sequence and is upstream of this one: it stopped `fix:deps` from doing anything at all. Fixing it exposed this, because a `fix:deps` that succeeds is what reveals that succeeding is not enough.
- **P123** is why the fix is not a one-line flag change. `--package-lock-only` was chosen over `npm install` to avoid that class, so any fix that reinstates `npm install` owes a check against it.
