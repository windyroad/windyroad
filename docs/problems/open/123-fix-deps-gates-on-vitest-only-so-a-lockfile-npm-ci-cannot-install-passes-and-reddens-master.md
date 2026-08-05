# Problem 123: fix:deps gates on vitest only, so a lockfile npm ci cannot install passes locally and reddens master

**Status**: Open
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

### Investigation Tasks

- [ ] Extend the green gate at `scripts/fix-deps.sh:146` to run what CI runs. At minimum add `npm run build`, since that is the step that exercises the static export against the new dependency graph and is the cheapest high-value addition. Consider `npm run lint` and `npm run deps:check` for parity with the CI job's four steps.
- [ ] Decide whether to verify `npm ci` installability directly. A true check needs a clean-tree `npm ci`, which is slow; the lockfile-shape scan in the Workaround section is a cheap proxy that catches the observed defect class without an install. Either is better than the current zero coverage.
- [ ] Consider whether the shape scan belongs in the flow, in a pre-push hook, or as a standalone script. The push:watch failure message already asks "what pre-push or pre-commit git hook in `.githooks/` could have caught the failure", which points at the hook surface.
- [ ] Establish whether the flag-stripping is reproducible or was specific to the nested-duplicate shape. Evidence for the latter: `npm install --package-lock-only` on the same darwin/arm64 host produced a lockfile preserving `optional: true` on all 25 top-level rollup entries. If the nested-duplicate shape is the trigger, the shape scan is the right guard rather than avoiding lockfile rewrites on macOS.
- [ ] Record the outcome against P072's ADR-034 criterion (d), since this is the validation that criterion was waiting on.

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
