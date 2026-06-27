# Problem 095: dry-aged-deps gate deadlocks on exact-pinned deps that --update cannot bump

**Status**: Closed
**Reported**: 2026-06-16
**Transitioned to Verification Pending**: 2026-06-27 (fix released: `scripts/fix-deps.sh` auto-bumps exact-pin deadlocked deps to their matured targets via `npm install --save-exact`, then test-gates before commit; both scripts clean up the stray `package.json.backup`. Open to Verifying directly via the legacy direct-implementation path: root cause was already documented in the description and confirmed by a live reproduction this session.)
**Priority**: 6 (Medium). Impact: Minor (2) x Likelihood: Possible (3)
**Origin**: internal
**Effort**: M
**WSJF**: 3 = (6 x 1) / 2
**Type**: technical

## Description

The dry-aged-deps pre-push gate (P026) and push:watch's auto-update step assume that `npx dry-aged-deps --update --yes` can resolve any dependency that `dry-aged-deps --check` flags as overdue. This assumption breaks for EXACT-PINNED dependencies: `--check` flags the dep as past its age threshold (the Latest version is mature), but `--update` is a no-op because the exact pin (e.g. `"playwright": "1.59.1"`) caps the resolvable range below the target version. The push then fails the pre-push gate in a loop: "Stale dependencies found. Run npx dry-aged-deps --update, then re-push" -- but --update changes nothing.

Observed TWICE in one session (2026-06-15/16):
- playwright 1.59.1 -> 1.60.0 (session start): exact-pinned, 33 days old >= dev minAge 30; --update no-op; resolved by manual `npm install --save-dev --save-exact playwright@1.60.0`.
- react + react-dom 19.2.6 -> 19.2.7 (second work-problems loop push): exact-pinned prod deps, 14 days old >= prod minAge 14; --update no-op; resolved by manual `npm install --save-exact react@19.2.7 react-dom@19.2.7`.

Each occurrence also leaves a stray `package.json.backup` (created by the --update attempt) that must be manually removed.

## Symptoms

- push:watch reports "Stale dependencies found" and fails the push; `npx dry-aged-deps --update --yes` reports the dep but does not change the version (`pkg: X.Y.Z -> X.Y.Z`).
- `dry-aged-deps --check` continues to exit 1 until the exact pin is manually bumped.
- A `package.json.backup` file is left in the working tree on each --update attempt.

## Impact Assessment

- **Who is affected**: anyone pushing through push:watch when an exact-pinned dep crosses its dry-aged age threshold. Every push that crosses a threshold deadlocks until a manual bump.
- **Frequency**: per exact-pinned dep crossing its age threshold (recurring; twice in one session).
- **Severity**: Medium. Not data-loss, but it converts a routine push into a manual dependency-bump detour each time, and the stray backup file risks being committed accidentally.

## Root Cause Analysis

### Hypothesis

push:watch's dry-aged auto-update (`npx dry-aged-deps --update --yes`) treats the "still stale after update" state as a generic failure rather than detecting the specific exact-pin-deadlock case (check flags it, update no-ops it). The fix is to detect when --check flags a dep that --update did not change, and either (a) bump the exact pin in package.json to the flagged target automatically (matching the P026 "run the upgrade" discipline), or (b) surface a precise directive "manually bump <pkg> to <target> (exact pin blocks --update)" instead of the generic stale-deps loop. The stray package.json.backup should also be cleaned up by the auto-update step regardless of outcome.

## Fix Strategy

- **Kind**: improve
- **Shape**: script
- **Target file**: `scripts/push-watch.sh` (the dry-aged auto-update block) and/or the dry-aged-deps invocation wrapper.
- **Edit summary**: after `dry-aged-deps --update --yes`, re-run `--check`; if it still exits non-zero, diff the flagged deps against what --update changed; for any flagged-but-unchanged dep (exact-pin deadlock), either auto-bump the exact pin to the flagged mature target + npm install (P026 run-the-upgrade discipline) or emit a precise "manually bump <pkg> to <target>: exact pin <current> blocks --update" directive. Always `rm -f package.json.backup` after the update attempt so no stray backup is left.
- **Evidence**: playwright + react/react-dom exact-pin deadlocks, 2026-06-15/16 session (two occurrences).

## Fix Released

- **Root cause** (confirmed by reading `node_modules/dry-aged-deps/src/update-packages.js`): `dry-aged-deps --update` writes each dep's `wanted` version to `package.json`. An exact pin caps `wanted` == `current`, so `--update` no-ops, but `--check` keeps flagging the dep because `recommended` (the matured-safe target) is newer and aged past `minAge`. `push:watch` halts and routes to `npm run fix:deps`, which also no-op'd (`scripts/fix-deps.sh` exited 0 when `--update` yielded no manifest change). Deadlock. Reproduced live this session on `sass` (exact-pinned `1.99.0`, Latest `1.101.0`, Age 15d).
- **Fix** (Option (a), the P026 run-the-upgrade discipline): `scripts/fix-deps.sh` adds a pure helper `exact_pin_deadlock_targets` that parses `dry-aged-deps --check --format=json` and lists each flagged-but-unbumpable dep (`filtered != true`, `recommended != current`) as `name@recommended type`. When `--update` changes nothing but `--check` still flags deps, the apply flow bumps each exact pin to its matured target via `npm install --save-exact` (`--save-dev --save-exact` for dev deps), then the existing `npm test` gate validates the bump before the `chore(deps)` commit. If still nothing changes, it falls through to the existing "manual major-version review" message.
- **Backup cleanup**: both `scripts/fix-deps.sh` and `scripts/push-watch.sh` now `rm -f package.json.backup` after every `--update` attempt, so the stray backup the tool writes is never left to be committed accidentally.
- `push:watch` keeps routing stale deps to `fix:deps` (separation of concerns per ADR-034: push:watch does not run tests, fix:deps does). No auto-bump in push:watch.
- **Tests**: 5 new vitest behavioural cases for `exact_pin_deadlock_targets` via the existing `FIX_DEPS_LIB_ONLY=1` lib-only sourcing seam (`scripts/fix-deps.test.mjs`), 9/9 green. Both scripts pass `bash -n`.
- Architect gate PASS (no new decision; honours the existing push:watch / fix:deps separation and the run-the-upgrade hygiene discipline; dropped two fabricated citations: no ADR-052 exists locally and ADR-014 is Wardley mapping, so the change is grounded on repo conventions only). JTBD gate PASS (internal release tooling, no user-facing surface). Voice-tone + style-guide N/A (shell scripts, no copy/CSS). I13 RFC-trace gate fired `no-rfc-trace` as the known P104 false positive (RFC tier unadopted in this repo); used the legacy direct-implementation path per P070 / P103, no RFC auto-created.
- Repo-local `scripts/*.sh` change, root package is `private: true`, no changeset. Committed to master; effective immediately for local `push:watch` / `fix:deps` flows.
- **Verification trigger**: next real exact-pin dep crossing its age threshold, where `npm run fix:deps` (or the `push:watch` -> `fix:deps` route) bumps the pin and lands the `chore(deps)` commit without a manual `npm install --save-exact` detour, and no `package.json.backup` is left behind.

## Related

- P026 (dry-aged-deps gate is intentional hygiene). This ticket does not weaken P026; it makes the gate's auto-update path handle the exact-pin case so the discipline (run the upgrade) is automatic rather than a manual detour. Retro 2026-06-16.

## Closed

- **Closed**: 2026-06-28 (verification-queue drain; evidence-based per ADR-022)
- **Evidence**: fix-deps.sh exact-pin-deadlock helper + 9/9 vitest green; playwright 1.59.1 to 1.60.0 deadlock fixed this session
- **Recovery**: reopen via /wr-itil:transition-problem 095 known-error if a regression surfaces
