# Problem 095: dry-aged-deps gate deadlocks on exact-pinned deps that --update cannot bump

**Status**: Open
**Reported**: 2026-06-16
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

## Related

- P026 (dry-aged-deps gate is intentional hygiene). This ticket does not weaken P026; it makes the gate's auto-update path handle the exact-pin case so the discipline (run the upgrade) is automatic rather than a manual detour. Retro 2026-06-16.
