# Problem 184: netlify-cli cannot be updated at all because a peer conflict rejects every resolution

**Status**: Open
**Reported**: 2026-08-30
**Priority**: 12 (High), Impact: 3 x Likelihood: 4, derived at capture. Impact is 3 because RISK-POLICY rates a broken or delayed build as Moderate: the conflict blocks the blanket `npm install --package-lock-only` that `scripts/fix-deps.sh` runs after `dry-aged-deps --update`, so the repository's automated dependency-hygiene flow cannot complete a refresh once the tool asks for a netlify-cli move. It also strands roughly 25 advisory groups, including a critical `tar`, whose only stated remediation is a netlify-cli parent bump. It is not 4, because none of those packages ships to the site: the export is static and netlify-cli is a devDependency. Likelihood is 4 because this is not probabilistic, it is a standing state: every resolution attempted on 2026-08-30 failed, including a minor move inside the declared `^24` range.
**Origin**: internal
**Effort**: M, derived at capture. Breaking the conflict is small and was demonstrated locally in one line, but landing the bump means moving netlify-cli three majors, and netlify-cli is the tool that performs production deploys. Verifying `netlify deploy --dir=out --prod --json` and `netlify api listSiteDeploys` still behave needs a real deploy, which is not reachable from a local gate.
**WSJF**: 6.0 = (12 x 1.0) / 2

## Description

`netlify-cli` is declared as `"netlify-cli": "^24.0.1"` and resolves to 24.0.1. It cannot move to any version, and that includes 24.11.3, which is inside its own declared range.

Every attempt fails identically. `npm install --package-lock-only --save-dev netlify-cli@^27`, `@^26`, and a plain `npm update --package-lock-only` all end in:

```
npm error code ERESOLVE
npm error Found: @opentelemetry/api@1.8.0
npm error   @opentelemetry/api@"^1.8.0" from netlify-cli@27.4.1
npm error   peer @opentelemetry/api@"~1.8.0" from @netlify/build@36.4.2
npm error Could not resolve dependency:
npm error peerOptional @opentelemetry/api@"^1.9.0" from vitest@4.1.10
```

`@netlify/build` declares a hard peer of `@opentelemetry/api` at `~1.8.0`, which forces 1.8.x to the root of the tree. `vitest` declares a `peerOptional` of `^1.9.0`. The two ranges are disjoint, so npm refuses the tree rather than nesting.

A second, quieter consequence: `dry-aged-deps` does not list netlify-cli's 24.11.3 as an available update, because `npm outdated`'s own resolution hits the same wall. The staleness is invisible to the gate that exists to report it.

## Symptoms

`npm update --package-lock-only` and any `npm install` naming netlify-cli exit non-zero with `ERESOLVE`, citing `@opentelemetry/api` and naming `vitest` as the unsatisfiable peer. The manifests are left untouched.

Inside `scripts/fix-deps.sh` the failure is quieter still. The apply step is `dry-aged-deps --update` followed by `npm install --package-lock-only`, and that install is wrapped non-fatally under `set -e`:

```bash
if ! npm install --package-lock-only; then
  echo "  (lockfile regeneration failed; the manifest sync gate below will catch the desync)" >&2
fi
```

So a refresh that touches netlify-cli produces a desynced pair, the manifest sync scan catches it, and the flow restores and halts, having made no progress and named the sync scan rather than the peer conflict as the failure.

## Workaround

Declaring `@opentelemetry/api` at the root breaks the deadlock, because an explicit root dependency outranks the hoisting npm was attempting, and the netlify subtree then nests its own `~1.8.0` copy:

```bash
npm install --package-lock-only --save-dev netlify-cli@^27 @opentelemetry/api@^1.9.1
```

Verified on 2026-08-30. The resulting tree carries `@opentelemetry/api` 1.9.1 at the root, 1.8.0 nested under both `netlify-cli` and `@netlify/zip-it-and-ship-it`, and 1.9.1 nested under `@netlify/otel`.

This was NOT applied. It adds a root devDependency the project does not import, purely to steer resolution, and it carries netlify-cli across three majors. netlify-cli runs the production deploy in `publish-pipeline.yml` and the alias deploys in `main-pipeline.yml` and `release-pr-preview.yml`, and `scripts/push-watch.sh` calls `netlify api listSiteDeploys`. None of that is exercisable from a local gate, and a blocked release path is preferable to a broken deploy.

An `overrides` entry was considered and rejected: overrides ignore peer ranges, so forcing 1.9.1 everywhere would install it under `@netlify/build` against that package's stated `~1.8.0` peer.

## Impact Assessment

- **Who is affected**: the dependency-hygiene flow, and therefore any AFK orchestrator that reaches `push:watch` or `fix:deps` on a refresh that touches netlify-cli.
- **Frequency**: every attempt. Observed four times on 2026-08-30 across three target versions plus a blanket update.
- **Severity**: the roughly 25 stranded advisory groups are all dev or build-time transitive dependencies of a CLI, so none reaches a site visitor. The blocked refresh path is the real cost.
- **Analytics**: not applicable.

## Root Cause Analysis

### Investigation Tasks

- [ ] Confirm whether the conflict is upstream's to fix. `@netlify/build`'s `~1.8.0` peer against a package whose 1.9.x is current and API-compatible looks like an over-tight pin worth reporting per ADR-048.
- [ ] Decide whether the root `@opentelemetry/api` declaration is acceptable as a standing resolution steer, or whether it should be recorded as a decision first. It is a dependency the project never imports, which is a shape worth naming rather than slipping in under a chore commit.
- [ ] Establish how to verify a netlify-cli major bump without a production deploy. A draft-alias deploy on a branch is the obvious candidate; `main-pipeline.yml` already runs one at `deploy-test`.
- [ ] Read the netlify-cli 25, 26 and 27 release notes for changes to `deploy` flags and to `api listSiteDeploys`, the two surfaces this repository calls.
- [ ] Make the failure legible where it happens. `scripts/fix-deps.sh` currently reports a manifest sync failure when the real cause is an `ERESOLVE` two steps earlier.
- [ ] Create a reproduction test.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P126, P168, P153

## Related

Captured via `/wr-itil:capture-problem`; expand at next investigation.

The title-only duplicate grep found no ticket naming netlify, a peer conflict, or `ERESOLVE`.

The hang-off pre-filter surfaced ten candidates sharing at least one signal (P055, P141, P148, P153, P157, P167, P169, P170, P126, P168). That exceeds the five-candidate cap, so the arbitration subagent was skipped per the capture skill's short-circuit and the list is recorded here for re-evaluation at the next `/wr-itil:review-problems`.

P126 is the closest neighbour and is distinct: there the refresh chain created a desync by writing `package.json` without the lockfile, and its fix added the `npm install --package-lock-only` this ticket reports as blocked. P126's fix is sound; this is the case where the step it added cannot run.

Observed while clearing the red dependency-freshness gate in the 2026-08-30 refresh iteration, committed as `307e8bff`, which deliberately left netlify-cli at `^24.0.1` and said so in its commit body.
