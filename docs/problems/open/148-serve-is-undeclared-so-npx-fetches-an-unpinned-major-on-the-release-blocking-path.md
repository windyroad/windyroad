# Problem 148: serve is undeclared, so npx fetches an unpinned major on the release-blocking path

**Status**: Open
**Reported**: 2026-08-09
**Priority**: 6 (Medium). Impact: 2 x Likelihood: 3, derived at capture from the description per Step 4a
**Origin**: internal
**Effort**: S, derived at capture per Step 4a
**WSJF**: 6.0 = (6 x 1.0) / 1

## Description

The accessibility job serves the built site with `npx serve out -l 3000`, but `serve` is declared nowhere. `npm ci` therefore does not install it, and `npx` fetches whatever the registry's latest major happens to be, on every run.

Verified on disk 2026-08-09: `serve` appears in neither `dependencies` nor `devDependencies` in `package.json`, and `node_modules/serve` does not exist after install. Contrast `pa11y-ci`, which is pinned at 4.1.1 in `devDependencies` and so resolves locally with no registry round-trip.

Three consequences follow, and the third is what makes this worth a ticket now rather than whenever.

It is an external network dependency at job setup. A registry blip fails the job. This matters because the argument for making the accessibility gate a release blocker (ADR-050) leaned on the observation that `.pa11yci.json` targets only `http://localhost:3000` URLs, so the transient-network class that produced P143's `curl (28)` is structurally absent. That holds at assertion time. It does not hold at setup time, and the setup fetch is the part nobody had looked at.

It is an unpinned major. A breaking change to `serve`'s `-l` flag, or to its startup behaviour, breaks the job with no diff in this repository. Same shape as the `trufflesecurity/trufflehog@main` moving-branch pin recorded in P141, on a different surface.

And as of ADR-050 it sits on the release-blocking path. `release-pr` now declares `needs: [deploy-test, gate-accessibility]`, so a `serve` fetch failure or a breaking `serve` release now blocks releases, where previously it only reddened master. The exposure existed before; the change raised its cost.

It also escapes the dependency-freshness gate entirely. `npm run deps:check` runs `dry-aged-deps --check` against the manifests, and an undeclared package is not in the manifests, so there is nothing for it to check. This is the same blindness P141 records for GitHub Actions refs, arriving by a different route: P141's surface is invisible because the checker is scoped to npm manifests, this one is invisible because the package never reaches a manifest.

Worth noting the fix is not quite one line. Adding `serve` to `devDependencies` changes the manifest pair, which brings in RFC-006's coherence machinery and the `dry-aged-deps` gate, so it wants doing deliberately rather than as a side effect of another change.

## Symptoms

- `npx serve out -l 3000` in `.github/workflows/main-pipeline.yml` resolves from the registry on every run rather than from `node_modules`.
- `npm run deps:check` reports clean while an undeclared, unpinned package runs in CI.

## Workaround

None. The 25 most recent master runs all passed, so the observed failure rate is low, but each of those runs included the unpinned fetch.

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: every run of the accessibility job, which is every push to master
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Investigate root cause
- [ ] Create reproduction test
- [ ] Add `serve` to `devDependencies` at a pinned version, landing the manifest pair coherently per RFC-006 rather than as an incidental edit
- [ ] Check whether any other `npx <pkg>` invocation in the workflows resolves an undeclared package. `npx netlify`, `npx pa11y-ci` and `npx changeset` are the candidates to check
- [ ] Decide whether an undeclared-npx-package check belongs alongside the other dependency-surface work on P141, since both are cases of a dependency nothing watches

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P141 (GitHub Actions versions are an uninstrumented dependency surface), the same blindness on a different surface. ADR-050, which raised the cost of this exposure by putting the accessibility job on the release-blocking path.

## Related

Surfaced by the `wr-risk-scorer:pipeline` assessment of the ADR-050 commit, as counter-evidence to my own claim that the external-network transient class was structurally absent from the accessibility job. It is absent at assertion time and present at setup time, and the scorer was right to hold the likelihood at 2 rather than 1 on that basis. Verified independently against `package.json` and `node_modules/` before capture.
