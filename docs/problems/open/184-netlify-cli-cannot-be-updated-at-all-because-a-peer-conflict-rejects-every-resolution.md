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
- **Severity**: nothing in this set reaches a site visitor. The export is static, netlify-cli is a devDependency, and none of these packages is bundled into the shipped site. That observation is correct and unchanged.

  It is not the whole blast radius, and the earlier phrasing let it stand as if it were. These packages execute at BUILD and DEPLOY time, in jobs that hold real production credentials. `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` are passed to netlify-cli in all three workflows: `main-pipeline.yml` line 147, `publish-pipeline.yml` line 112, `release-pr-preview.yml` line 67. Two of the stranded advisories are critical and both sit in archive unpackers: `tar` GHSA-23hp-3jrh-7fpw, and `@xhmikosr/decompress` GHSA-mp2f-45pm-3cg9, the latter reached through its `-tar`, `-tarbz2` and `-targz` variants. Those identifiers, the reachability through the decompress variants, and the "roughly 25 advisory groups" figure all come from a `dry-aged-deps --format json` run on 2026-08-30 over the then-current tree; re-run it rather than treating them as standing fact.

  The credential is not environment-scoped, which is the hinge of everything below. All three workflows reference the same repo-level `secrets.NETLIFY_AUTH_TOKEN`, no job in any of the three declares an `environment:` block, and `publish-pipeline.yml` line 109 uses that same secret with `--prod`. So a token present in any of these jobs is one that can deploy to production.

  The co-location is the point, and it is NOT confined to one workflow. In `publish-pipeline.yml` the single `deploy-production` job runs `npm ci` (line 33), then the only `--prod` deploy across the three workflow files and the netlify-touching scripts that were read (line 109; the other two deploys are `--alias`), with the token (line 112). The whole netlify-cli tree, carrying the critical archive-unpacker advisories, is installed in the same job that performs the production deploy. `main-pipeline.yml` `deploy-test` has the same shape (`npm ci` line 133, deploy line 144, token line 147), as does `release-pr-preview.yml` `preview` (`npm ci` line 40, deploy line 64, token line 67). `deploy-production` and `preview` are co-primary hardening targets, and it is worth being exact about why neither can be deprioritised. On the Netlify token specifically, and only there, `deploy-production` holds no advantage over the other two, because the token is not environment-scoped and carrying the `--prod` flag is irrelevant to an attacker who already holds a credential that can deploy to production from any job. On job-level `permissions:` the picture is not symmetric, and the general form of the claim would be false. `publish-pipeline.yml` lines 18 to 20 grant `deploy-production` `contents: write` and `actions: read`; `release-pr-preview.yml` lines 26 to 29 grant `preview` only `contents: read`, plus `pull-requests: write` and `statuses: write`; `main-pipeline.yml` `deploy-test` declares no job block at all and inherits the workflow default `contents: read` at line 11. So `deploy-production` is the only one of the three whose `GITHUB_TOKEN` can write to the repository, and code execution there buys a persistent foothold that outlives the deploy and can poison every later build, where the Netlify token alone buys a single publish. The co-primary conclusion survives that asymmetry rather than depending on its absence: neither permission set dominates, since `preview` uniquely holds pull-request and status write on top of the artefact path into production. And `publish-pipeline.yml` never builds anything: it downloads the artefact named `release-preview-build-<sha>` in a step literally called "Download build from release preview" (lines 95 to 104) and deploys those bytes verbatim (line 109). The `preview` job is therefore what produces the content that ships to production, so a compromise there reaches production twice over, through the token directly and through the artefact.

  What `release-pr-preview.yml` adds on top is the build toolchain, not the dependency tree. Its `preview` job is the only credentialed one that does not consume a build artefact: it checks out (line 31), runs `npm ci` (40), runs `npm run build` (43), uploads an artefact (46) and only then deploys (64). There is no `download-artifact` step anywhere in that file, whereas `main-pipeline.yml` `deploy-test` (lines 135 to 139) and `publish-pipeline.yml` `deploy-production` (lines 95 to 104) both fetch one. So `next build` and the `prebuild` script `scripts/generate-og-image.mjs` execute alongside the token there and in no other CI job. That negative is scoped to the three workflow files and the netlify-touching scripts, which is what was actually read; it is not an exhaustive repository sweep. One execution context it deliberately excludes: `npm run fix:deps` runs `npm run build`, prebuild included, on an operator machine that also holds Netlify credentials for `push-watch.sh`'s `netlify api listSiteDeploys` calls. That workflow is not operator-only either: `main-pipeline.yml` lines 299 to 307 run `gh workflow run release-pr-preview.yml` automatically whenever the release-PR step yields a pull-request number.

  Taken together, the worst case of a critical advisory in an archive unpacker running in any of these jobs is arbitrary content published to windyroad.com.au. "Does not reach a visitor through the shipped bundle" and "cannot affect the site" are different claims, and only the first one holds.

  Stated precisely, this is a standing exposure and not a demonstrated path. Nothing here traces attacker-influenced bytes into `tar.extract`. The unpackers plausibly run in netlify-cli's plugin, extension and `@netlify/build` subsystems, and `netlify deploy --dir=out` without `--build` is unlikely to reach them, though nothing on disk establishes that and it is recorded as an inference rather than a finding. The gap between "these libraries are installed here" and "these libraries process hostile bytes here" is unclosed, and this ticket does not close it.

  What actually keeps this exposure small is not the devDependency classification. It is that `package-lock.json` is committed and every workflow job that installs dependencies does so with `npm ci` (`main-pipeline.yml` lines 64, 94, 133, 229; `publish-pipeline.yml` line 33; `release-pr-preview.yml` line 40), which installs exactly the versions the lockfile names and fails rather than re-resolving. That is six of the seven jobs across the three files; `gate-secrets` installs nothing. Scoped precisely, because the general form of the claim is false: no new upstream version enters the CREDENTIALED jobs without a reviewed lockfile change. netlify-cli is a declared devDependency, so `npx netlify` in all three deploy steps resolves out of the `npm ci` tree, and a freshly-published malicious release of one of its transitives cannot arrive on its own. The unqualified version does not hold pipeline-wide: `main-pipeline.yml` line 104 runs `npx serve out -l 3000` and `serve` is declared nowhere in `package.json`, so that call fetches from the registry unpinned at run time. That is already tracked as P148, and it does not qualify the control above, because `gate-accessibility` holds no Netlify credential and `serve` is not in the netlify-cli tree. That pinning is the control carrying the residual here. The dev-vs-prod split is not, and should not be cited as though it were.

  One inconsistency this amendment leaves standing, named rather than silently patched. The Priority line above justifies impact 3 partly with "none of those packages ships to the site: the export is static and netlify-cli is a devDependency", which is the same dev-vs-prod reasoning this bullet has just rejected as the load-bearing control. The rating itself is not in question: scored on its own the advisory exposure is impact 5 at likelihood 1 under the lockfile control, which is 5 and sits below the headline 12, so nothing pushes the headline up. Correcting the Priority rationale is a re-rate and belongs to the next `/wr-itil:review-problems` pass, not to this amendment. One further item for that same re-rate: the Priority line says the conflict blocks "the blanket `npm install --package-lock-only`", but the Description evidences the `--save-dev netlify-cli@^27` and `@^26` forms and `npm update --package-lock-only`, not the bare form, and it separately records that `dry-aged-deps` cannot see the netlify-cli update at all, which may make that precondition unreachable today.

  The blocked refresh path remains the ticket's primary cost.
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
- **Composes with**: P126, P168, P153, P148

## Related

Captured via `/wr-itil:capture-problem`; expand at next investigation.

The title-only duplicate grep found no ticket naming netlify, a peer conflict, or `ERESOLVE`.

The hang-off pre-filter surfaced ten candidates sharing at least one signal (P055, P141, P148, P153, P157, P167, P169, P170, P126, P168). That exceeds the five-candidate cap, so the arbitration subagent was skipped per the capture skill's short-circuit and the list is recorded here for re-evaluation at the next `/wr-itil:review-problems`.

P126 is the closest neighbour and is distinct: there the refresh chain created a desync by writing `package.json` without the lockfile, and its fix added the `npm install --package-lock-only` this ticket reports as blocked. P126's fix is sound; this is the case where the step it added cannot run.

Observed while clearing the red dependency-freshness gate in the 2026-08-30 refresh iteration, committed as `307e8bff`, which deliberately left netlify-cli at `^24.0.1` and said so in its commit body.
