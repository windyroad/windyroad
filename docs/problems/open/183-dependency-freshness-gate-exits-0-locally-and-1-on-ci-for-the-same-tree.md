# Problem 183: The dependency-freshness gate exits 0 locally and 1 on CI for the same tree

**Status**: Open
**Reported**: 2026-08-30
**Priority**: 9 (Medium), Impact: 3 x Likelihood: 3, derived at capture. Impact is 3 because RISK-POLICY rates a broken or delayed build as Moderate, and this is the delay: the gate that exists to catch stale dependencies before a push cannot see the condition CI fails on, so a red release path is only discoverable by reading the CI log after the fact. On 2026-08-29 that cost an overnight block, with `deploy-test` and `gate-accessibility` skipped and `Create release PR` failing deliberately. Likelihood is 3 because the trigger is a maturity boundary, which every dependency crosses eventually, but the divergence has been observed once, on a pair of packages sitting exactly at the 30-day threshold, so a narrower rounding-only trigger is not yet ruled out.
**Origin**: internal
**Effort**: M, derived at capture. The work is diagnosis before any fix: establishing where `dry-aged-deps` gets each version's publish date and why two machines reading the same registry compute different ages. The likely fix site is the `dry-aged-deps` package rather than this repository, which makes landing it a cross-repo change per ADR-048.
**WSJF**: 4.5 = (9 x 1.0) / 2

## Description

The main-pipeline run at `7e7317cb` on 2026-08-29 failed its `Check dependency freshness` step. The step runs `npm run deps:check`, which is `dry-aged-deps --check`. Its `Outdated packages` table carried two rows:

```
Name            Current   Wanted    Latest    Age (days)   Type
@types/react    19.2.17   19.2.18   19.2.18   30           dev
playwright      1.60.0    1.60.0    1.62.1    30           dev
```

Both are dev dependencies, and `.dry-aged-deps.json` sets `"dev": { "minAge": 30 }`, so both had just matured past the threshold.

Running the same command locally on the same commit printed:

```
Outdated packages:
Name	Current	Wanted	Latest	Age (days)	Type
No outdated packages with mature versions found (prod >= 14 days, dev >= 30 days).
```

and exited 0. The local tree was not stale relative to CI: `node_modules/@types/react/package.json` read 19.2.17 and `node_modules/playwright/package.json` read 1.60.0, matching CI's `Current` column exactly, and `npm outdated --json` locally reported `latest` as 19.2.18 and 1.62.1, matching CI's `Latest` column. Version resolution agrees. The maturity computation does not.

The advisory table both runs printed below the outdated table is not the failure. `dry-aged-deps` prints it under the heading `Known vulnerabilities without safe fix` and does not change its exit code for it, so the roughly 35 advisory groups listed are informational. The two outdated rows are the entire difference between exit 0 and exit 1.

## Symptoms

`npm run deps:check` exits 0 on the operator's machine while the identical command on the identical commit exits 1 in CI, with the local run reporting no matured outdated packages and the CI run naming two.

The knock-on is that `scripts/fix-deps.sh`, the repository's designated remedy for exactly this failure, cannot help. Its first step is:

```bash
if npx --no-install dry-aged-deps --check; then
  echo "✓ Dependencies are current. Nothing to fix."
  exit 0
fi
```

On this machine that branch is taken, so the flow returns before it reaches the apply, gate and commit stages that exist to clear the failure. An operator following the documented recovery path is told there is nothing to fix while the release path is blocked.

## Workaround

Read the CI log rather than the local gate. `gh run view <id> --log-failed` prints the `Outdated packages` table CI saw; bump the packages it names by hand (an exact pin needs `npm install --save-exact`, a caret range needs only a lockfile refresh), then confirm nothing else is close to its threshold by checking each remaining outdated package's `latest` publish date against the prod and dev minimums:

```bash
npm outdated --json > /tmp/o.json
curl -sS "https://registry.npmjs.org/<pkg>" | node -e '...'  # age of dist-tags.latest
```

## Impact Assessment

- **Who is affected**: anyone pushing from this machine, and any AFK orchestrator that reaches `push:watch` or `fix:deps`, since both consult the same local `dry-aged-deps --check`.
- **Frequency**: once observed, on 2026-08-29. The trigger class (a dev dependency crossing 30 days, or a prod dependency crossing 14) recurs continuously.
- **Severity**: the release path stays blocked until someone reads CI. Nothing reaches readers in the meantime, because `netlify.toml` disables git-triggered builds and the deploy jobs are downstream of `build`.
- **Analytics**: not applicable.

## Root Cause Analysis

### Investigation Tasks

- [ ] Establish where `dry-aged-deps` reads each version's publish date, and whether it goes to the registry directly or through `npm`'s metadata cache. A stale packument in `~/.npm/_cacache` giving an older `time` entry for the same version is the leading hypothesis.
- [ ] Reproduce with the cache cleared (`npm cache clean --force`, or `--prefer-online`) and compare the computed ages against CI's, which runs on a cold `actions/setup-node` cache.
- [ ] Determine whether the age comparison is inclusive at the boundary. Both CI rows read `Age (days) 30` against a `minAge` of 30, so a `>` versus `>=` difference, or a floor-versus-round difference on the same instant, would produce exactly this split without any cache involvement.
- [ ] Decide the fix site. If the cause is the local metadata cache, the fix is a flag or a documented pre-step in `scripts/fix-deps.sh` and `scripts/push-watch.sh`. If it is a boundary or timezone difference in the age computation, the fix is upstream in `dry-aged-deps` and lands as a pull request per ADR-048.
- [ ] Create a reproduction test.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P168, P126, P123, P153

## Related

Captured via `/wr-itil:capture-problem`; expand at next investigation.

The title-only duplicate grep matched six existing tickets on the `deps` keyword: P026 (closed, no AFK bypass path for the pre-push gate), P095 (closed, exact-pin deadlock), P123 (closed, `fix:deps` gated on vitest only), P111 (known error, publish-day push blocked by the deps hygiene chain), P126 (verifying, the refresh chain creates a manifest desync) and P168 (verifying, the freshness gate reads the installed tree). None is this defect.

P168 is the nearest sibling and the distinction matters: there the installed tree lagged the committed manifests, so the gate read an old version and kept blocking. Here the installed versions match CI's `Current` column exactly and the registry agrees on `latest`; only the derived age differs. P123 is the same local-green / CI-red class on a different surface, the lockfile install shape.

The hang-off pre-filter surfaced ten candidates sharing at least one signal (P055, P141, P148, P153, P157, P167, P169, P170, P126, P168). That exceeds the five-candidate cap, so the arbitration subagent was skipped per the capture skill's short-circuit and the list is recorded here for re-evaluation at the next `/wr-itil:review-problems`.

Observed while clearing the red gate in the 2026-08-30 dependency-refresh iteration, committed as `307e8bff`.
