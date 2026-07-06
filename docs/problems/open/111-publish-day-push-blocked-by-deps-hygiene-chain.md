# Problem 111: Publish-day push blocked by deps-hygiene tooling chain (lock desync + local-vs-CI freshness divergence)

**Status**: Open
**Reported**: 2026-07-06
**Priority**: 3 (Medium) — Impact: 3 x Likelihood: 1 (deferred — re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: M (deferred — re-rate at next /wr-itil:review-problems)

## Description

On publish day, pushing a routine content commit (The Shift newsletter Issue 12) was blocked by a chain of pre-existing release/deps/test tooling failures, none related to the content change.

1. **Lock desync from auto-deps.** `push:watch`'s dry-aged-deps step auto-bumped `@types/react` in `package.json` (committed as `chore(deps)`) but did NOT update `package-lock.json`, leaving manifest and lock out of sync. That breaks `npm ci`, and made `fix:deps`' restore step error (`npm error ... lock file's @types/react@19.2.14 does not satisfy @types/react@19.2.17`).

2. **vitest mis-globs a Playwright e2e script (FIXED this session).** `fix:deps`' green-check failed because `vitest run` globbed `tests/mobile-nav.spec.mjs` (a standalone Playwright script: bare `async function test()` driving `localhost:3000`, no vitest import) as a unit suite, emitting "No test suite found in file". Fixed in commit `7fe5046` by adding `tests/**/*.spec.mjs` to the existing `vitest.config.ts` `test.exclude` (NB: a `vitest.config.ts` with react/jsdom/setup/@-alias already existed; a second `vitest.config.mjs` would have shadowed it, dropping jsdom/setup/alias, caught by architect review).

3. **Local-vs-CI freshness-gate divergence.** After the vitest fix, `push:watch` DID push (origin/master advanced with the newsletter + vitest-fix commits), but the remote CI job "Lint, check deps & build" failed at "Check dependency freshness" while the LOCAL dry-aged-deps step reported "no outdated packages with safe, mature versions". The remaining stale deps are transitive vulnerabilities needing parent-bumps/overrides that neither auto-resolve nor `fix:deps` applies, so master CI stays red on ambient staleness and blocks deploy/release.

Net effect: a routine newsletter publish could not clear the pipeline without unrelated dependency-hygiene work.

Evidence: background task outputs `b5ddvx0y4` (push:watch dry-aged-deps HALT + partial chore(deps) commit), `b7j6l1wh0` (fix:deps EUSAGE npm ci lock mismatch + the "No test suite found" failure), `b46srb4j8` (CI run 28778804078 "Check dependency freshness" failed).

Suggested fix strategy: (a) make dry-aged-deps run `npm install` to sync `package-lock.json` after bumping the manifest, so the auto `chore(deps)` commit is self-consistent; (b) reconcile the local dry-aged-deps freshness heuristic with the CI "Check dependency freshness" gate so a locally-clean tree does not fail CI; the vitest-misglob sub-issue is already fixed in `7fe5046`.

## Symptoms

(deferred to investigation)

## Workaround

Reset the partial `chore(deps)` commit, fix the vitest mis-glob, re-run `fix:deps` then `push:watch`; the ambient dep-freshness CI failure still requires a manual dependency-update pass (parent-bumps/overrides) to clear.

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: (deferred to investigation)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Investigate root cause (auto-deps lock-sync + local/CI freshness gate divergence)
- [ ] Create reproduction test

## Fix Strategy

**Kind**: improve
**Shape**: script (`scripts/push-watch.sh` / the dry-aged-deps + `fix:deps` flow) plus a CI-gate reconciliation.
**Observed flaw**: auto-deps bumps the manifest without syncing the lock; local freshness heuristic disagrees with the CI freshness gate.
**Edit summary**: (a) `npm install` after the manifest bump in the dry-aged-deps step; (b) align the local vs CI freshness thresholds/vuln handling.
**Evidence**: task outputs `b5ddvx0y4`, `b7j6l1wh0`, `b46srb4j8` (CI run 28778804078); vitest sub-fix already shipped in `7fe5046`.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P026 (dry-aged-deps hygiene family)

## Related

Captured via /wr-itil:capture-problem during the 2026-07-06 The Shift Issue 12 publish retro. P026 family (dry-aged-deps). The vitest-misglob sub-issue was fixed in-session (commit 7fe5046).
