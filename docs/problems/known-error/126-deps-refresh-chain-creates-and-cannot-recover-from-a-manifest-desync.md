# Problem 126: The deps refresh chain creates a manifest desync and its own recovery path cannot clear it

**Status**: Known Error
**Reported**: 2026-08-05
**Priority**: 12 (High), Impact: 3 x Likelihood: 4, derived at capture from the description. Impact is 3 because RISK-POLICY rates a broken or delayed build as Moderate and a red `npm ci` fails at CI's first step, blocking `build` and transitively `gate-accessibility`, `deploy-test` and `release-pr`; nothing reaches readers because `netlify.toml` disables git-triggered builds. Likelihood is 4 because the trigger is not an exotic lockfile shape: it is any dependency update whose resolution changes the lockfile, which is essentially all of them. It fired on the first exercise after P123 shipped.
**Origin**: internal
**Effort**: S, derived at capture. One `npm install --package-lock-only` plus a sync assertion in `push-watch.sh`, and a post-checkout sync check in the `fix-deps.sh` rollback. Two small edits to existing scripts, comparable to P123 which was also rated S.
**WSJF**: 24.0 = (12 x 2.0) / 1 (re-rated 2026-08-08: Open to Known Error auto-transition, status multiplier 1.0 to 2.0 per P125)

## Description

Two coupled defects, both verified on disk 2026-08-05. Together they form a trap: the refresh path creates a state that the documented recovery path restores rather than clears.

### Defect 1, creation: push-watch commits a desynced manifest pair

`scripts/push-watch.sh:149` runs `npx dry-aged-deps --update --yes`. That command rewrites `package.json` ONLY, and says so in its own output: "Run 'npm install' to install the updates". Line 153 then tests `git diff --quiet -- package.json package-lock.json` and lines 155-156 stage BOTH manifests and commit:

```bash
if ! npx dry-aged-deps --update --yes; then ...; fi
rm -f package.json.backup
if ! git diff --quiet -- package.json package-lock.json; then
  echo "Auto-deps refresh changed root manifests; committing as chore(deps)."
  git add package.json package-lock.json
  git commit -m "chore(deps): refresh stale dependencies (P026)"
```

No `npm install` runs between the rewrite and the commit, so only `package.json` has changed and the commit is desynced by construction. The `git add` of `package-lock.json` is a no-op that makes the code read as though both manifests move together.

**Observed**: commit `f1d7b8b` landed `vitest 4.1.10` in `package.json` against `3.2.4` in `package-lock.json`. `npm ci` rejects that outright:

```
npm error code EUSAGE
npm error `npm ci` can only install packages when your package.json and
npm error package-lock.json or npm-shrinkwrap.json are in sync.
npm error Invalid: lock file's vitest@3.2.4 does not satisfy vitest@4.1.10
```

### Defect 2, non-recovery: the rollback restores the defect

`push-watch.sh` halts on remaining stale deps and instructs the operator to run `npm run fix:deps`. That flow's red-path rollback is `scripts/fix-deps.sh:226-228`:

```bash
echo "  Restoring known-good manifests (git checkout + npm ci) so the tree is not left broken..." >&2
git checkout "$BASE_REF" -- package.json package-lock.json
npm ci
```

The rollback assumes `BASE_REF` names a coherent commit. When `BASE_REF` IS the desynced commit, the checkout restores the desync and the following `npm ci` fails `EUSAGE` for the same reason. The message claims the tree is "not left broken" while leaving it exactly as broken as before.

**Net effect**: the sanctioned refresh path creates an uninstallable commit, and the sanctioned recovery path cannot clear it. Manual repair was required: `npm install --package-lock-only` to regenerate the lockfile against the new `package.json`, then re-run the gate. Landed as `3d14a32`.

## Why this is not P123

P123 fixed the `fix:deps` GREEN gate at `scripts/fix-deps.sh:146`, so an uninstallable lockfile can no longer pass as green. **That fix works**: on this same exercise its install-shape scan caught a live reintroduction of the EBADPLATFORM defect (`scripts/fix-deps.test.mjs:216` failed against a plain-`npm install` lockfile and passed against the `--package-lock-only` output).

Neither defect here is in P123's scope, and the P123 gate structurally cannot fire on either:

- Defect 1 happens in a different script, before `fix:deps` is ever invoked.
- Defect 2 happens after the gate has already failed, on the rollback path the gate hands off to.

The `wr-itil:hang-off-check` arbitration (2026-08-05) returned PROCEED_NEW on exactly this distinction, characterising P123's root cause as gate coverage on the commit path and this ticket's as rollback correctness on the failure path plus construction of the desync upstream of both. It also declined P012 (no ship gate on push/publish/deploy), whose `ci-status-check.sh` is invoked at `push-watch.sh:183`, downstream of the defective block at 149-156, and would at best catch the consequence on a later push rather than the desynced commit's creation.

## Symptoms

`npm run push:watch` reports "Auto-deps refresh changed root manifests; committing as chore(deps)" and leaves a commit that `npm ci` refuses. Running the `npm run fix:deps` remedy it recommends produces "Restoring known-good manifests" followed by an `npm ci` that fails `EUSAGE`, leaving the tree in the same state it started in.

## Workaround

```bash
npm install --package-lock-only   # regenerate the lockfile against the new package.json
npm ci --dry-run                  # confirm the pair is in sync
npm run lint && npm test && npm run build
```

Then commit the lockfile. Do NOT use plain `npm install` in this repository: it reintroduces 23 unflagged nested `netlify-cli/node_modules/@rollup/rollup-*` entries, which is the EBADPLATFORM class recorded in P123 (reproduced 2026-08-05; see P123 Investigation Task 4).

## Impact Assessment

- **Who is affected**: anyone pushing after a dependency refresh, and any AFK orchestrator that reaches `push:watch`, since the auto-update at line 149 exists specifically to clear the gate without a human (P026).
- **Frequency**: every dependency update whose resolution changes the lockfile, which is the normal case.
- **Severity**: master goes red at CI's first step and the delivery graph stalls. Recovery needs a human who knows to reach for `--package-lock-only`, because the documented recovery path does not work.
- **Analytics**: none.

## Root Cause Analysis

### Investigation Tasks

- [ ] Fix defect 1 in `scripts/push-watch.sh`. Either run `npm install --package-lock-only` after `dry-aged-deps --update` and before staging, or refuse to commit when only one of the two manifests changed. The second is the cheaper guard and fails loudly rather than silently doing the right thing.
- [ ] Fix defect 2 in `scripts/fix-deps.sh` lines 226-228. After `git checkout "$BASE_REF" -- package.json package-lock.json`, verify the restored pair is actually in sync (`npm ci --dry-run`, or a direct manifest comparison) and regenerate rather than assuming `BASE_REF` is coherent. The current message asserts a postcondition it does not check.
- [ ] Decide whether these are one fix or two. They are one failure chain but two scripts with two independent fixes, and **either fix alone breaks the trap**: fixing defect 1 means no desynced commit is ever created, and fixing defect 2 means the rollback recovers whatever it is handed. Captured as one ticket because the two defects were discovered as one failure and any fix should be verified against that same reproduction, NOT because the coupling is load-bearing for the severity rating. It is not: defect 1 alone reddens CI, which is where the Impact 3 comes from. If the two fixes want separate verification, splitting is cheap and this ticket should be split rather than stretched.
- [ ] Consider whether a manifest-sync assertion belongs somewhere shared, since two scripts have now made the same assumption. Note there is no `.githooks/` directory in this repository, so a hook surface would have to be stood up first, which P123 Investigation Task 3 already declined as out of scope for a dep-flow fix.
- [ ] Record the outcome against P072's ADR-034 criterion (d). This session was the re-armed exercise that P123's Fix Released section named, and the result is mixed: the P123 gate did what it was built to do, and the flow still failed end to end for reasons outside that gate.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P123, P072, P012, P111, P026

## Related

- **P123** (`docs/problems/verifying/123-fix-deps-gates-on-vitest-only-so-a-lockfile-npm-ci-cannot-install-passes-and-reddens-master.md`): same file, different code path and different root cause. See the "Why this is not P123" section above. This session is material to P123's verification: its gate fired correctly on a real regression, which is evidence FOR the fix, while the flow still failed for causes this ticket owns.
- **P012** (`docs/problems/verifying/012-no-ship-gate-on-push-publish-deploy.md`): shares `scripts/push-watch.sh` but its `ci-status-check.sh` runs at line 180, downstream of the defective block. Considered and declined by the hang-off arbitration.
- **P072** (`docs/problems/closed/072-adr-022-scheduled-cron-pr-supersede-push-fail-fast-plus-separate-fix-flow.md`): built the fix flow; closed pending end-to-end validation on the next real dep issue. That validation has now been exercised twice and failed twice, for different reasons each time.
- **P026** (`docs/problems/closed/026-dry-aged-deps-pre-push-gate-has-no-afk-bypass-path.md`): the reason `push-watch.sh:149` exists at all. Its `--update --yes` IS the AFK bypass. This ticket is not an argument against that bypass, which is intentional hygiene; it is about line 155 committing the bypass's output without completing it.
- **P111** (`docs/problems/known-error/111-publish-day-push-blocked-by-deps-hygiene-chain.md`): adjacent cost in the same chain, different cause (the gate firing correctly rather than a defective artefact).
- Evidence: `f1d7b8b` (the desynced commit), `3d14a32` (the manual repair), CI run 30999217454 (green after repair), all on master 2026-08-05.
- Captured via `/wr-itil:capture-problem` at the close of a four-ticket `/wr-itil:work-problems` loop, while pushing that loop's work.

## RFCs

| RFC | Status | Title |
|-----|--------|-------|
| RFC-006 | proposed | Make the deps refresh chain produce a coherent manifest pair, and make its rollback verify what it claims |
