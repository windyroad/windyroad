# Problem 123: fix:deps gates on vitest only, so a lockfile npm ci cannot install passes locally and reddens master

**Status**: Closed
**Reported**: 2026-08-05
**Priority**: 9 (Medium), Impact: 3 x Likelihood: 3, derived at capture from the description. Impact is 3 because RISK-POLICY rates a broken or delayed build as Moderate, and a red `build` job blocks the whole delivery graph: `gate-accessibility` and `deploy-test` declare `needs: build` directly, and `release-pr` is blocked transitively through `needs: [deploy-test]`. Likelihood is 3 because the uncovered surface is not lockfile shape, it is three entire CI steps: `fix:deps` gates on `npm test` (vitest) and the commit must then survive `npm ci`, `npm run lint`, `npm run deps:check` and `npm run build`, none of which run locally. The dominant member of that class is not an exotic lockfile shape but an ordinary dependency upgrade breaking the static export or the lint config. The EBADPLATFORM instance is one draw from that population, not the population. The observed base rate is one failure in one exercise, and the workaround is operator discipline rather than an automated control.
**Effort**: S, derived at capture. Add `npm run build` and an install-shape check to the flow's green gate at `scripts/fix-deps.sh:146`. One-line-plus change to an existing conditional.
**WSJF**: 9.0 = (9 x 1.0) / 1
**Origin**: internal

## Description

`npm run fix:deps` is this repo's sanctioned response when the dry-aged-deps gate refuses a push on stale dependencies. It applies updates, runs a test suite, and commits only on green. Its green gate is `scripts/fix-deps.sh:146`:

```bash
if npm test; then
```

`npm test` is `vitest run`. It never invokes `npm ci` and never invokes `next build`. The CI job the commit must survive (`.github/workflows/main-pipeline.yml`, "Lint, check deps & build") runs `npm ci`, `npm run lint`, `npm run deps:check`, then `npm run build`. So the flow's gate and the gate the commit actually faces share almost no surface: a lockfile can be structurally uninstallable and still pass `fix:deps` with a fully green 425-test suite.

**That is not hypothetical. It happened on 2026-08-05.**

`fix:deps` ran on darwin/arm64 and produced commit `13ba099`. Tests passed 425/425. It committed and was pushed. CI then failed on master at the `npm ci` step:

```
npm error code EBADPLATFORM
npm error notsup Unsupported platform for @rollup/rollup-android-arm-eabi@4.52.2:
  wanted {"os":"android","cpu":"arm"} (current: {"os":"linux","cpu":"x64"})
```

The lockfile rewrite had stripped `"optional": true` from 22 nested `node_modules/netlify-cli/node_modules/@rollup/rollup-*` entries while leaving their `os` and `cpu` constraints intact. Without the flag, `npm ci` treats a platform-specific binary as a required install and rejects the platform. Established by diffing against `13ba099~1`, where the same entry carried `{'version': '4.52.2', 'optional': True, 'os': ['android'], 'cpu': ['arm']}`. The version in the CI error matches that nested entry, not the top-level 4.60.1 one.

Repaired in `bcfe283` via `npm install --package-lock-only`, which deduped the 22 nested duplicates onto the top-level entries (all 25 of which retain `optional: true`), removing the rejected path entirely.

## Why this is P072's failed end-to-end validation

`docs/problems/closed/072-adr-022-scheduled-cron-pr-supersede-push-fail-fast-plus-separate-fix-flow.md` is the ticket that built this flow. It is Closed, with the status line: *"Phase 1 + Phase 2 shipped; awaiting end-to-end validation on the next real dep issue per ADR-034 criterion (d)"*.

This session was the next real dep issue. The flow ran, self-reported success, and reddened master. So P072's stated closure condition has now been exercised and it did not hold. This ticket carries that finding rather than reopening a closed ticket.

## Symptoms

`npm run fix:deps` reports "Tests green under the updated dependencies. Committing." and produces a commit that fails CI at `npm ci` or `npm run build`. The local signal is unambiguously green and the CI signal is red, with no overlap between the two checks to explain the divergence.

## Workaround

After `fix:deps` commits, run `npm run build` manually before pushing. If `npm ci` installability is in doubt, scan the lockfile for entries carrying `os` or `cpu` constraints without an `optional` flag:

```bash
python3 -c "
import json
lock=json.load(open('package-lock.json'))
bad=[k for k,v in lock['packages'].items() if (v.get('os') or v.get('cpu')) and not v.get('optional')]
print(len(bad)); [print(' ',k) for k in bad[:20]]
"
```

Zero is the healthy state. Any hit is an `npm ci` EBADPLATFORM waiting to happen on a platform that does not match.

## Impact Assessment

- **Who is affected**: anyone pushing after a dependency refresh. On 2026-08-05 it cost a red master, a diagnostic cycle, a repair commit, and a single-shot red-CI acknowledgement to push the fix.
- **Frequency**: once observed, on the first real exercise of the flow since P072 shipped.
- **Severity**: master goes red and the deploy chain stalls until diagnosed. Nothing reaches readers, because `netlify.toml` disables git-triggered builds and production ships only through the changeset-driven release PR.
- **Analytics**: none.

## Root Cause Analysis

The root cause is confirmed and is the one the Description states: the flow's green gate and the gate its commit actually faces share almost no surface. `scripts/fix-deps.sh:146` gated on `npm test` alone, so neither `npm ci` installability nor the static export was exercised locally. The lockfile flag-stripping was the trigger; the missing gate was the cause. A flow that self-reports success on a signal disjoint from the one that decides the outcome will keep reporting success on the wrong thing, whatever the next dependency graph does.

### Investigation Tasks

- [x] **Extend the green gate at `scripts/fix-deps.sh:146` to run what CI runs.** Done. The gate is now a composite: lockfile install-shape scan, `npm run lint`, `npm test`, `npm run build`, cheapest first. `npm run deps:check` is deliberately excluded. `scripts/push-watch.sh:168` already runs `dry-aged-deps --check` before pushing, so CI's `deps:check` step cannot be reached with a stale tree; adding it to this gate would only convert partial-progress commits into restore-and-halt with no CI-redness benefit.
- [x] **Decide whether to verify `npm ci` installability directly.** Decided: no. A clean-tree `npm ci` is slow enough to change the flow's character, and the flow already pays one `npm ci` on its restore path. The lockfile-shape scan is the proxy, implemented as the pure helper `lockfile_platform_flag_violations`. It is honestly a proxy, not a proof: it catches the observed class (constraints without the optional flag) in milliseconds with no network, and would not catch an installability failure of a different shape.
- [x] **Decide where the shape scan belongs.** Decided: in the flow, not a hook or a standalone script. The lockfile rewrite happens in `fix:deps`, so that is where the check has the context to explain itself and the authority to stop the commit. There is no `.githooks/` directory in this repository, so the hook option meant standing up a new enforcement surface as a side effect of a dep-flow fix; that is a separate decision with its own cost.
- [x] **Establish whether the flag-stripping is reproducible.** ~~Not reproduced~~ **REPRODUCED 2026-08-05, later the same day. The trigger is plain `npm install`.** The original entry (retained below) tested only `npm install --package-lock-only`, which preserves the flags correctly, so the reproduction attempt never exercised the command that strips them.

  Measured on darwin/arm64, same host, within the same session, against the same tree:

  | Command | Entries carrying `os`/`cpu` without `optional: true` |
  |---|---|
  | (before, committed lockfile) | 0 |
  | `npm install` | **23** |
  | `npm install --package-lock-only` | 0 |

  All 23 are `node_modules/netlify-cli/node_modules/@rollup/rollup-*`, the same nested-duplicate shape as the original incident. The count differs from the 22 recorded above because that figure came from the `13ba099` incident diff and this one from a fresh install against a since-changed tree; the shape is identical, the counts are two separate measurements and should not be conflated.

  So the guard direction was right and the reasoning under it was incomplete: the hazard is not confined to an uncharacterised nested-duplicate condition, it is the ordinary `npm install` that anyone reaches for by reflex. `--package-lock-only` is the only safe regeneration form in this repository until the netlify-cli nested duplication is resolved upstream.

  **This is also the shape scan's first live catch.** `scripts/fix-deps.test.mjs:216` ("reports the real repo lockfile as clean") failed against the plain-install lockfile and passed against the `--package-lock-only` output. The control detected a real regression it was built for, on its first real exercise, rather than only passing its fixture.

  *Original entry, superseded:* Not reproduced, and the evidence points at the nested-duplicate shape rather than the platform. `npm install --package-lock-only` on the same darwin/arm64 host produced a lockfile preserving `optional: true` on all 25 top-level rollup entries, and the current lockfile carries 244 platform-constrained entries with the flag intact on every one. That supports guarding the shape rather than avoiding lockfile rewrites on macOS, which is the direction taken. The trigger is not fully characterised, and the guard does not depend on characterising it.
- [x] **Record the outcome against P072's ADR-034 criterion (d).** Done, in ADR-034's Confirmation section. Criterion (d) is marked EXERCISED 2026-08-05, DID NOT HOLD, and re-armed against the next dep issue after this gate lands. The ADR's decision is unchanged: fail-fast plus a separate fix flow is still the right shape, and this was a gap in the fix flow's validation depth rather than in its structure. ADR-034's Reassessment trigger (revisit if the flow fails more than 30% of issues, assessed after three) is live but not due: the record is one failure in one issue.

## Fix Strategy

Land the composite gate and the shape scan in `scripts/fix-deps.sh`, per RFC-003. Correct the script's header, which documented the flow as "test: npm test (vitest)" and exit 1 as "tests failed", so the file's own documentation stops reproducing the divergence this ticket is about. Carry the failing gate's name into the restore-and-halt message and its next-steps list, so a build or lockfile failure no longer tells the operator to re-run the test suite. Add a cross-reference comment in both `scripts/fix-deps.sh` and `.github/workflows/main-pipeline.yml`, because the gate mirrors that CI job by hand and a step added on one side silently re-opens the gap. Cover the helper behaviourally in `scripts/fix-deps.test.mjs` through its existing `FIX_DEPS_LIB_ONLY` probe seam, including a fixture carrying the observed nested-duplicate shape.

`npm run build` runs `prebuild`, which regenerates the tracked `public/img/og-image.png`. The gate restores that file when it was clean beforehand, so the flow keeps its documented root-manifests-only tree contract. In this repository's current state the regeneration is byte-identical, so the guard is a no-op today; it exists for the case where a dependency upgrade changes the generator's output, which is exactly the case `fix:deps` creates.

**Release vehicle**: the fix commit itself. This repository is `private: true` with no published package, so there is no `.changeset/` entry and no npm release to point at. Same shape as P120.

## Fix Released

Shipped 2026-08-05 in the commit that carries this transition: the composite gate and `lockfile_platform_flag_violations` in `scripts/fix-deps.sh`, seven behavioural tests in `scripts/fix-deps.test.mjs`, the cross-reference comment in `.github/workflows/main-pipeline.yml`, and the ADR-034 Confirmation amendment. The transition ran Open to Verification Pending in one commit per ADR-014, because the root cause was already documented at capture and the fix shipped in the same change.

Exercised in-session, on the pieces that can be exercised without a real dependency update: the helper returns empty against the current lockfile and returns the offending key against a fixture reproducing the observed nested-duplicate shape; `npm run lint`, `npm test` (432 passed, 2 skipped) and `npm run build` all pass in this tree, so the composite gate is green here rather than merely syntactically valid.

**What to look for on the next `npm run fix:deps` run**: the flow should print "Running the CI-parity gate before committing" and, on green, "Lockfile shape, lint, tests and build all green". The fix is working if a dependency refresh that would have reddened master instead halts locally, naming which gate failed, with the manifests restored. It is NOT working if a `fix:deps` commit again passes locally and fails CI at `npm ci` or `npm run build`, or if the gate halts on something CI would have accepted (a false positive from the shape scan, which would show as a violation key that `npm ci` installs fine).

This is also the re-armed test of ADR-034 Confirmation criterion (d). The next real dep issue is the one that says whether the flow now handles a dependency change end-to-end.

## Closed on session-observed evidence (2026-08-08)

The fix's contract is that a lockfile which `npm ci` cannot install is caught before commit, rather than passing a vitest-only gate. Exercised directly: sourcing `scripts/fix-deps.sh` with FIX_DEPS_LIB_ONLY=1 and running `lockfile_platform_flag_violations` against a seeded lockfile (a platform-constrained entry with os/cpu but no optional flag) returned exactly that package by name. The same helper against the live `package-lock.json` returned zero violations. Detects the seeded EBADPLATFORM shape, quiet on a healthy tree.

**Recovery**: `/wr-itil:transition-problem 123 known-error` reopens this if the close was wrong.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P072, P111, P095, P026, P020

## Related

- **P072** (`docs/problems/closed/072-adr-022-scheduled-cron-pr-supersede-push-fail-fast-plus-separate-fix-flow.md`): built this flow. Closed pending end-to-end validation on the next real dep issue; this session was that issue and the validation failed. Not reopened, because closed tickets are not absorption targets; this ticket carries the finding.
- **P111** (`docs/problems/.../111-publish-day-push-blocked-by-deps-hygiene-chain.md`): the same hygiene chain blocking a publish-day push. Adjacent cost, different cause (that one is the gate firing correctly; this is the remediation producing a broken artefact).
- **P095** (`docs/problems/.../095-dry-aged-deps-exact-pin-deadlock-on-push.md`) and **P026**, **P020**: the surrounding dry-aged-deps friction family.
- **P112** (`docs/problems/.../112-accessibility-lead-review-misses-contrast-caught-only-by-ci-axe-gate.md`): same shape at a different surface. A local reviewer passes, the CI gate catches what the local check structurally cannot see. Both are "the local check and the CI check do not share a surface".
- Evidence: red run at `13ba099`, repair at `bcfe283`, both on master 2026-08-05.
- Captured via `/wr-itil:capture-problem` while repairing the red master it describes.

## RFCs

| RFC | Status | Title |
|-----|--------|-------|
| RFC-003 | proposed | Extend the fix:deps green gate to CI parity so an uninstallable lockfile cannot commit green |
