# Problem 183: The dependency-freshness gate exits 0 locally and 1 on CI for the same tree

**Status**: Open
**Reported**: 2026-08-30
**Priority**: 9 (Medium), Impact: 3 x Likelihood: 3, derived at capture. Impact is 3 because RISK-POLICY rates a broken or delayed build as Moderate, and this is the delay: the gate that exists to catch stale dependencies before a push cannot see the condition CI fails on, so a red release path is only discoverable by reading the CI log after the fact. On 2026-08-29 that cost an overnight block, with `deploy-test` and `gate-accessibility` skipped and `Create release PR` failing deliberately. Likelihood is 3 because the maturity boundary that every dependency eventually crosses is what triggers CI's VISIBILITY of the divergence, not the divergence itself, but the local gate computes no age for any row on any run, so the divergence is a standing condition rather than an occasional one. The rating was set at capture on the reading that a narrower rounding-only trigger might explain it; the root-cause work below rules that out. What happened once is CI making the divergence visible, not the divergence itself. The number is left as derived at capture because re-rating is `/wr-itil:review-problems`' call; that process owns backlog ordering and its cross-ticket effects.
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

Status stays Open rather than moving to Known Error even though the root cause is traced to source and a workaround is documented, which is the Known Error shape. Three investigation tasks remain genuinely open: the upstream report is not filed, no decision has been taken on an interim local instrument, and there is no reproduction test. The transition is `/wr-itil:review-problems`' call, the same posture P144 takes for the same reason.

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
- **Frequency**: continuous, on every local run. Corrected 2026-08-30 from the capture-time reading of "once observed": the root-cause work below establishes that every row is dropped on every invocation, so the local gate has never been able to compute an age. What was observed once, on 2026-08-29, is CI disagreeing loudly enough to notice.
- **Severity**: the release path stays blocked until someone reads CI. Nothing reaches readers in the meantime, because `netlify.toml` disables git-triggered builds and the deploy jobs are downstream of `build`.
- **Analytics**: not applicable.

## Root Cause Analysis

### Root cause found 2026-08-30, traced to source

**The three hypotheses in the task list at the end of this section are superseded and the leading one is falsified; they are struck through rather than deleted so the record shows what was ruled out.**

`fetch-version-times.js` line 41 runs `npm view <pkg> time deprecated --json`. Lines 62 to 68 discriminate the response shape with `wrapped = parsed.time !== null && typeof parsed.time === 'object'`, then take `times = wrapped ? parsed.time : parsed`. On this machine npm returns that call as a JSON ARRAY. `parsed.time` on an array is `undefined`, so `wrapped` is false, `times` becomes the array itself, and `Object.entries()` yields integer index keys instead of version keys. Every `versionTimes[info.latest]` lookup therefore misses, `age` stays at its `'N/A'` initialiser (`build-rows.js` line 27), and `filterByAge`'s `typeof age === 'number'` test (`filter-by-age.js` line 22) drops the row. Every row, always.

### The observation

`dry-aged-deps --check --format json` on this tree reports `totalOutdated: 9, filteredByAge: 9`: all nine outdated rows were dropped by the age filter, while a direct `registry.npmjs.org` fetch over the same nine showed one of them (jsdom 30.0.1 at 31 days) genuinely mature against the 30-day dev threshold. The gate exits 0 locally not because it agrees with CI but because it cannot compute any age at all. Those nine rows are the set the table-mode re-run below also covers.

### The payload

Captured 2026-08-30 on npm 12.0.2 so an upstream report can act on it. `npm view jsdom time deprecated --json`:

```
[
  {
    "created": "2011-11-21T03:09:04.421Z",
    "modified": "2026-07-29T04:18:42.751Z",
    "0.0.1": "2011-11-21T03:09:05.477Z",
    ...
  }
]
```

Top-level type `list`, length 1, element 0 a `dict` whose first keys are `created`, `modified`, `0.0.1`.

### Two independent things are going on, and an earlier draft of this ticket conflated them

**The missing `time` wrapper key** is the collapse. npm reduced the two-field projection to the one field that had a value, because jsdom is not deprecated. Upstream's comment at `fetch-version-times.js` lines 62 to 66 describes this collapse, and the collapse MODEL it describes is right; it is what the line-67 discriminator is built to detect, and a fix should keep it. Note the narrower point though: the two literal shapes that comment names, `{ time: {...}, deprecated: ... }` and the bare time map, are both un-wrapped, so on npm 12.0.2 neither is what actually arrives. The model survives; the shapes do not.

**The array wrap** is not the collapse. ~~npm collapsed the two-field projection and then wrapped the result in an array~~ is superseded. Varying only the spec on npm 12.0.2:

| Query | Versions the spec matches | Result |
|---|---|---|
| `npm view jsdom time --json` | 1 (the `latest` dist-tag) | `list`, length 1 |
| `npm view jsdom@29.1.1 time --json` | 1 | `list`, length 1 |
| `npm view "jsdom@^29" time --json` | 5, confirmed by `npm view "jsdom@^29" version --json` returning `29.0.0, 29.0.1, 29.0.2, 29.1.0, 29.1.1` | `list`, length 5 |

The length tracks the match count, so on npm 12.0.2 `npm view <pkg> <field> --json` returns one element per matched version. A bare name matches one, which is why the wrapper looks pointless in the failing call.

**Scoped deliberately to npm 12.0.2, because the unscoped claim would contradict this ticket's own premise.** CI computes ages correctly on the same tree, which means CI's npm does not wrap this way. CI resolves Node from `.nvmrc` (20.19.0) via `actions/setup-node`, and the npm bundled with Node 20 is a different major line from the 12.0.2 this machine runs, which is the obvious candidate for the divergence. That last point is stated from general knowledge of Node's bundling, NOT verified from this repo or from a run: nothing here records which npm Node 20.19.0 ships, and an upstream reader should check it against Node's own release record rather than take it from this ticket. This has NOT been confirmed: the query has not been run under that npm, and CI's exact npm version is not recorded anywhere in this repo. Establishing it is the first thing an upstream report needs and it is listed as a task below.

### Consequences for the fix

- `npm cache clean --force` cannot fix this. It is a response-shape mismatch, not stale metadata.
- The single-field `npm view <pkg> time --json` is NOT a workaround: checked on 2026-08-30, it also returns array-form (`list`, length 1), so it breaks the unwrapped path at line 68 the same way. It does NOT, however, prove wrap and collapse are independent, which an earlier draft claimed: a single-field projection is also single-valued, so a collapse-coupled wrap would predict exactly this. Only the spec-varying table above discriminates.
- The boundary question is moot: no comparison is reached, because the value never becomes a number.
- The fix site is upstream in `dry-aged-deps` per ADR-048. The discriminator at line 67 needs to handle a per-matched-version array envelope. Note the fix has to cover the both-fields-present case too, an array of `{ time: ..., deprecated: ... }` objects; that shape is inferred here rather than observed, because every payload captured was for a non-deprecated package.

### Corroboration that no fetch threw

The `totalOutdated: 9, filteredByAge: 9` observation above proves only that no age was computed; a throw inside `fetchVersionTimes` would give the same count. The discriminator is the `Warning: failed to fetch version times for <name>` line at `build-rows.js` line 49, but it only means something in the right format: line 47 guards it with `if (format !== 'xml' && format !== 'json')`, so in the `--format json` run its absence proves nothing. Re-run in table mode on 2026-08-30 (`npm run deps:check`) it emits zero such warnings across all nine rows. So no fetch threw. `fetchVersionTimes` also retries twice on non-`SyntaxError` before throwing, which makes a transient failure less likely still.

### Investigation Tasks

- [x] ~~Establish where `dry-aged-deps` reads each version's publish date, and whether it goes to the registry directly or through `npm`'s metadata cache. A stale packument in `~/.npm/_cacache` giving an older `time` entry for the same version is the leading hypothesis.~~ Answered: it shells out to `npm view`. The stale-packument hypothesis is FALSIFIED.
- [x] ~~Reproduce with the cache cleared (`npm cache clean --force`, or `--prefer-online`) and compare the computed ages against CI's, which runs on a cold `actions/setup-node` cache.~~ Not needed; the cache is not involved.
- [x] ~~Determine whether the age comparison is inclusive at the boundary. Both CI rows read `Age (days) 30` against a `minAge` of 30, so a `>` versus `>=` difference, or a floor-versus-round difference on the same instant, would produce exactly this split without any cache involvement.~~ Moot; the comparison is never reached.
- [ ] Establish the npm version CI actually runs, and whether `npm view <pkg> time deprecated --json` array-wraps under it. This is the load-bearing unknown: the whole local-versus-CI divergence is attributed to it and it has not been checked.
- [ ] Capture a both-fields-present payload from a deprecated package, so the array-of-wrapped-object shape an upstream fix must handle is observed rather than inferred.
- [ ] Report upstream to `dry-aged-deps` per ADR-048 with the array-form reproduction.
- [ ] Decide whether `scripts/fix-deps.sh` and `scripts/push-watch.sh` should carry a direct-registry age check as an interim local instrument, given the local gate currently cannot fail.
- [x] ~~Decide the fix site. If the cause is the local metadata cache, the fix is a flag or a documented pre-step in `scripts/fix-deps.sh` and `scripts/push-watch.sh`. If it is a boundary or timezone difference in the age computation, the fix is upstream in `dry-aged-deps` and lands as a pull request per ADR-048.~~ Answered: neither branch applies. The cache is not involved and no boundary comparison is reached. The fix site is upstream in `dry-aged-deps`, in the response-shape discriminator, and lands as a pull request per ADR-048.
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
