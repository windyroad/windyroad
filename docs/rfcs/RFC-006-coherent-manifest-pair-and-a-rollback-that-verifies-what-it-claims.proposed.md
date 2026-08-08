---
status: proposed
rfc-id: coherent-manifest-pair-and-a-rollback-that-verifies-what-it-claims
reported: 2026-08-08
human-oversight: unconfirmed
decision-makers: [Tom Howard]
problems: [P126]
adrs: [021-auto-resolve-stale-deps-in-push-watch, 034-push-watch-fail-fast-plus-separate-deps-fix-flow-supersedes-cron-pr, 006-tdd-enforcement-via-hooks]
jtbd: []
stories: []
---

# RFC-006: Make the deps refresh chain produce a coherent manifest pair, and make its rollback verify what it claims

**Status**: proposed
**Reported**: 2026-08-08
**Problems**: P126
**ADRs**: ADR-021 (auto-resolve stale deps in push:watch), ADR-034 (push:watch fail-fast plus separate deps fix flow), ADR-006 (TDD enforcement via hooks)
**JTBD**: (none. `scripts/` is maintainer toolchain with no reader-facing surface, so the JTBD review's structural-change carve-out applies. That review also warned against inventing a JTBD ID for the AFK-orchestration warrant; ADR-021 and ADR-034 carry it instead.)

## Summary

Complete the manifest write `push-watch.sh` already commits, so the pair it commits is coherent, and make `fix-deps.sh`'s rollback check the postcondition its own message asserts.

## Driving problem trace

**P126 (the deps refresh chain creates a manifest desync and its own recovery path cannot clear it).** `scripts/push-watch.sh:149` runs `npx dry-aged-deps --update --yes`, which rewrites `package.json` only and says so in its own output. Lines 153-157 then stage and commit both root manifests with no install in between, so the commit is desynced by construction and `npm ci` rejects it at CI's first step. `scripts/fix-deps.sh:226-228` is the recovery the operator is routed to; its rollback runs `git checkout "$BASE_REF" -- package.json package-lock.json` then `npm ci`, so when `BASE_REF` IS the desynced commit it restores the defect and fails identically, while printing "so the tree is not left broken". Observed 2026-08-05: commit `f1d7b8b` landed `vitest 4.1.10` against a lockfile still on `3.2.4`; the manual repair via `npm install --package-lock-only` landed as `3d14a32`.

## Scope

Three coordinated code changes plus two decision-record corrections.

**A shared manifest-hygiene library, `scripts/lib/manifest-sync.sh`.** It holds two pure jq scans over the root manifests. `manifest_sync_violations <package.json> <package-lock.json>` compares `package.json`'s `dependencies` / `devDependencies` / `optionalDependencies` against the lockfile's `packages[""]` record of the same three blocks and prints one line per key that disagrees; empty output means the pair is coherent. `lockfile_platform_flag_violations <package-lock.json>` moves here unchanged from `scripts/fix-deps.sh`, so the two sibling scans live together and neither script keeps a private copy. Both scripts source the library above their `*_LIB_ONLY` probe seams, resolving it through `${BASH_SOURCE[0]}` rather than `$0` because both test harnesses source their script under `bash -c`, where `$0` is `bash`.

The relocation changes the helper's file but not its region: `fix-deps.sh` sources the library above its `FIX_DEPS_LIB_ONLY` return, so the helper is still defined under `FIX_DEPS_LIB_ONLY=1` and the existing coverage in `scripts/fix-deps.test.mjs` keeps reaching it. RFC-003's Scope describes that helper as living "in the `FIX_DEPS_LIB_ONLY` sourceable region"; the property that sentence relies on is preserved, and this paragraph is the signpost so the two RFCs do not read as contradicting each other on disk. RFC-003 itself is not edited.

The sync scan is a proxy, not a proof, and the library says so. After `npm install --package-lock-only` the check is close to tautological, because `packages[""]` is regenerated from `package.json`, so its real value is catching a regeneration that silently no-op'd. It also does not cover the case where `packages[""]` agrees but a resolved `packages["node_modules/<name>"].version` fails to satisfy the declared range. `npm ci --dry-run` is the exact-fidelity alternative and is rejected on the same cost reasoning RFC-003 used for the platform scan: it needs network and full resolution, which changes the character of a flow that runs on every push.

On P126 investigation task 4, "does a manifest-sync assertion belong somewhere shared": yes, and a sourced shell library is enough. Two callers, one helper, and the only alternative is duplication, so it does not earn a convention ADR. A third caller, or the library growing past pure scans into flow control, is the point where one would. Standing up a `.githooks/` surface stays declined, as both P123 and P126 already recorded.

**`scripts/push-watch.sh` completes the write it commits.** Before `dry-aged-deps --update --yes` runs, the script records whether each root manifest was already clean, testing both `git diff --quiet` and `git diff --cached --quiet` so the guard does not depend on the stash-pop above it normalising staged changes. After the update and the existing `rm -f package.json.backup`, when `package.json` has changed the script runs `npm install --package-lock-only` so the lockfile follows. That is a registry call inside a `set -euo pipefail` script, so it is wrapped non-fatally exactly as line 149 wraps `dry-aged-deps`: ADR-021's confirmation criterion 2 pins that property, and a transient blip must not abort the push mid-refresh.

Both jq scans then run, and a new pure helper `manifest_refresh_route <authored> <changed> <violations>` decides what happens next: `skip` when the change is not push:watch's to act on or nothing changed, `rollback` on violations, `commit` otherwise. It sits above the `PUSH_WATCH_LIB_ONLY` seam, shaped like the existing `deps_gate_route` that ADR-034's fail-fast routing uses, and is covered by new cases in `scripts/push-watch.test.mjs`.

Ownership gates every acting branch, not just the rollback. `authored` is 1 only when BOTH manifests were clean on entry, so every subsequent change to them is provably this block's. When either was already dirty, push:watch cannot separate its writes from the operator's, so it makes none (the regeneration is gated on the same flag), commits none and reverts none; it says so and leaves the tree alone. An earlier revision guarded only the rollback while the commit branch staged both manifests unconditionally, which would have swept an operator's in-flight manifest work into a `chore(deps)` commit. That asymmetry is what the risk scorer caught, and closing it is what brings the change within appetite. It is also the enforcement of a scope ADR-021's Decision Outcome already stated ("a working-tree change introduced inside `push-watch.sh`") but never checked.

The route REPLACES the existing `if ! git diff --quiet -- package.json package-lock.json` condition rather than sitting beside it. That is load-bearing: with an operator-dirty `package.json` the old condition is still true, so leaving it in place would commit a pair the scans just rejected and reintroduce the defect this RFC exists to remove. On `rollback` the script restores both manifests, which is unambiguous because that branch is reachable only when both were clean on entry, prints the violations, and falls through without committing and without exiting. Because it does not exit, the existing stale-deps gate twenty lines below fires and routes to `npm run fix:deps` exactly as it does today.

A third scan bounds what the refresh is allowed to commit at all. Because push:watch runs no lint, test or build before committing, its commit is only defensible while the regenerated lockfile is a pure SPEC-SYNC: a change confined to the root `packages[""]` block records what `package.json` now declares and cannot alter what npm installs. `lockfile_resolution_delta` compares the lockfile before and after regeneration and lists any resolved `packages["node_modules/<name>"]` entry that was added, removed or re-versioned. When it finds one, the installed tree has changed and nothing in push:watch has executed it, so the refresh is declined and routed to `npm run fix:deps`, whose CI-parity gate runs the shape scan, lint, tests and build before committing. This is what closed the risk scorer's standing finding that push:watch commits an unexecuted lockfile: not by importing the fix flow, which ADR-034 rejected, but by shrinking push:watch's commit to the class that needs no execution and handing the rest to the flow that already gates it. ADR-034's separation of concerns is the mechanism, not the obstacle.

So push:watch either completes its own manifest write coherently as a pure spec-sync and commits it, or undoes its own half-finished write and degrades to the behaviour it had before ADR-021. It adds no halt, adds no routing message, and never reverts a file it did not author in that same block. Only three millisecond offline jq scans are added: no lint, no test, no build, because ADR-034 considered and rejected moving the fix flow into `push:watch` on direct user instruction, and a composite gate there would be that rejected option.

**`scripts/fix-deps.sh` regenerates on the way in and verifies on the way out.** The same non-fatally-wrapped `npm install --package-lock-only` follows its own `dry-aged-deps --update`, placed before the "did anything change" check so the exact-pin deadlock path (P095) is untouched. `manifest_sync_violations` joins the composite CI-parity gate as its first and cheapest check, with its own `FAILED_GATE` name, its own operator message, and a sibling arm on the existing shape-hint branch pointing at `npm install --package-lock-only`. RFC-003 made "stop naming the test suite for a lockfile failure" an explicit requirement of that branch, and a new gate falling through to the generic message would partly undo it.

On the red path the rollback checks the restored pair before trusting it. When `git checkout "$BASE_REF"` hands back an incoherent pair, the script regenerates the lockfile (also non-fatally wrapped, so a registry failure yields the guidance block rather than an npm stack trace) and only then runs `npm ci`. The message names the resulting uncommitted regenerated lockfile explicitly, so the operator does not check it back out and re-enter the trap, and reports what actually happened instead of asserting a postcondition it never checked. The header comment block's "so the tree is not left broken" claim is corrected in the same edit to describe verify-and-repair, as RFC-003 did for its own header claim.

One thing is deliberately left alone: `git checkout "$BASE_REF" -- package.json package-lock.json` can still destroy an operator's uncommitted manifest edit, because `BASE_REF` is just `HEAD`. That is pre-existing behaviour, no recorded decision requires fixing it, and expanding into it here would be scope creep rather than part of this fix.

**Two decision records are corrected.** `docs/decisions/034-...` confirmation criterion (d) currently reads "EXERCISED 2026-08-05, DID NOT HOLD. Re-armed." against P123/RFC-003. That fix shipped, the criterion was exercised again in the same session, and it failed again for the different reason P126 records. The amendment names both defects, re-arms against the next dependency issue, and says plainly that the next exercise is both the third arming and the reassessment trigger, so the re-arm cannot run indefinitely. The live "1 failure in 1 dep issue" sentence is corrected to 2 in 2 so the ADR's own arithmetic does not go stale on the edit that records the second failure.

`docs/decisions/021-...` gains one sentence in its Robustness-shape paragraph naming the added `npm install --package-lock-only` call, its non-fatal wrap, and the rollback path, which is what makes that paragraph's existing degrade-to-existing-behaviour promise true of the code. Its confirmation criterion 3 ("a `chore(deps)` commit is produced when and only when the lockfile or `package.json` changed") gains a recorded reading rather than an assertion that the antecedent is false: the criterion is scoped to push:watch's OWN writes, which is what ADR-021's Decision Outcome already says, so a rollback that deliberately leaves an operator-authored manifest change in place produces no commit without breaching it. Both edits record how an existing decision reads; neither is a new decision. The `docs/decisions/README.md` compendium rows for both ADRs are hand-edited to match, per the P087 posture already applied to existing entries, because the generator its header names lives in a `packages/` tree that does not exist in this repository.

Behavioural coverage lands in a new `scripts/lib/manifest-sync.test.mjs` (vitest plus `spawnSync`, sourcing the library directly) and in new `manifest_refresh_route` cases in `scripts/push-watch.test.mjs`, following the repo TDD discipline ADR-006 enforces. The failing tests land before the implementation.

## Stories

`stories: []` per **ADR-045**: this project carries no story tier, so RFCs here record no stories. Same posture as RFC-002 and RFC-003.

## Commits

(rendered from `git log --grep "Refs: RFC-006"` by `/wr-itil:manage-rfc` and `wr-itil-reconcile-rfcs`.)

## Related

- **P126** (`docs/problems/verifying/126-deps-refresh-chain-creates-and-cannot-recover-from-a-manifest-desync.md`, moved from `known-error/` by this fix): the driving Known Error. Its investigation task 3 asks whether the two defects are one fix or two; they land as one RFC because either fix alone breaks the trap and both need verifying against the same reproduction.
- **RFC-003** (`docs/rfcs/RFC-003-fix-deps-green-gate-ci-parity.proposed.md`): established the fast-offline-jq-scan-as-`npm ci`-proxy pattern this RFC reuses and extends. Its scope was P123's green gate; neither P126 defect is inside it. It is still `human-oversight: unconfirmed` on disk despite having shipped, which is worth a `/wr-itil:manage-rfc` ratification pass but is not this change's job.
- **ADR-021**: authorises the inline auto-update and its auto-commit, and pins the non-fatal wrapping this RFC preserves for the added registry call.
- **ADR-034**: carries the fail-fast-plus-separate-fix-flow decision. Its confirmation criterion (d) is amended by this work, and its reassessment is now one dependency issue away.
- **ADR-045**: governs the empty `stories:` array.
- **ADR-006**: TDD enforcement. The failing tests precede the new library.
- Captured via `/wr-itil:capture-rfc --fix-time` from the I13 propose-fix gate at `/wr-itil:manage-problem`; born `human-oversight: unconfirmed`, ratified at `/wr-itil:manage-rfc RFC-006 accepted`.
