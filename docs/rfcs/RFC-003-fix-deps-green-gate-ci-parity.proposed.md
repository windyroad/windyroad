---
status: proposed
rfc-id: fix-deps-green-gate-ci-parity
reported: 2026-08-05
human-oversight: unconfirmed
decision-makers: [Tom Howard]
problems: [P123]
adrs: [034-push-watch-fail-fast-plus-separate-deps-fix-flow-supersedes-cron-pr]
jtbd: []
stories: []
---

# RFC-003: Extend the fix:deps green gate to CI parity so an uninstallable lockfile cannot commit green

**Status**: proposed
**Reported**: 2026-08-05
**Problems**: P123
**ADRs**: ADR-034 (push:watch fail-fast plus separate deps-fix flow supersedes cron PR)
**JTBD**: (none)

## Summary

Replace the single-command green gate in `scripts/fix-deps.sh` with a composite gate that mirrors the CI job the resulting commit must survive, and add a cheap lockfile-shape scan that stands in for `npm ci` installability.

## Driving problem trace

**P123 (fix:deps gates on vitest only, so a lockfile npm ci cannot install passes and reddens master).** The flow's green gate at `scripts/fix-deps.sh:146` is `npm test`, which is `vitest run`. The CI job the commit must survive runs `npm ci`, `npm run lint`, `npm run deps:check`, then `npm run build`. The two gates share almost no surface, so a structurally uninstallable lockfile passes locally with a fully green suite. On 2026-08-05 that happened: commit `13ba099` passed 425/425 tests and then failed CI at `npm ci` with EBADPLATFORM, because the lockfile rewrite had stripped `"optional": true` from 22 nested `@rollup/rollup-*` entries while leaving their `os` and `cpu` constraints intact. Repaired in `bcfe283`.

## Scope

Two changes to `scripts/fix-deps.sh`, both inside the existing detect-apply-test-commit flow.

**A lockfile install-shape scan.** A new pure helper `lockfile_platform_flag_violations <lockfile>` in the `FIX_DEPS_LIB_ONLY` sourceable region lists lockfile `.packages` entries that carry `os` or `cpu` constraints without `optional: true`. Such an entry is a required install of a platform-specific artefact, so `npm ci` on a non-matching platform rejects it. Zero hits is the healthy state, verified against the current lockfile: 244 entries carry platform constraints and all 244 are flagged optional. The scan is a proxy, not a proof. A true installability check needs a clean-tree `npm ci`, which is slow enough to change the flow's character; the scan catches the observed defect class in milliseconds with no network. It uses `jq`, already a dependency of the two sibling helpers in the same file.

**A composite green gate.** The gate at line 146 becomes shape-scan, then `npm run lint`, then `npm test`, then `npm run build`, cheapest first, with the name of the failing gate carried into the existing restore-and-halt branch so its operator-facing message and next-steps list stop naming the test suite for a build or lockfile failure. The script's header block, which documents the flow as "test: npm test (vitest)" and exit 1 as "tests failed", is corrected in the same edit, and a cross-reference comment is added in both `scripts/fix-deps.sh` and `.github/workflows/main-pipeline.yml` so the hand-mirrored coupling is visible at the point where a future CI step would be added.

`npm run build` runs `prebuild`, which regenerates the tracked `public/img/og-image.png`. The gate restores that file when it was clean beforehand, so the flow keeps its documented root-manifests-only tree contract.

Three things are deliberately out of scope. `npm run deps:check` is not added to the gate: `scripts/push-watch.sh:168` already runs `dry-aged-deps --check` before pushing, so the CI `deps:check` step cannot be reached with a stale tree, and adding it here would convert partial-progress commits into restore-and-halt for no CI-redness benefit. A direct `npm ci` installability check is not added, for the cost reason above. No `.githooks/` pre-push surface is created: none exists in this repository today, and standing one up is a separate decision with its own cost rather than a side effect of a dep-flow fix.

Behavioural coverage lands in the existing `scripts/fix-deps.test.mjs` through its `FIX_DEPS_LIB_ONLY` probe seam, including a fixture reproducing the observed nested-duplicate shape.

## Stories

`stories: []`. This repository has no story tier: there is no `docs/stories/` and no `docs/story-maps/` directory, so the ADR-089 requirement that every RFC carries at least one story on a story map has no surface to land on here. The work is a single commit against one script plus its test file, so a retrospective story decomposition would record ceremony rather than sequence work. Standing up the story tier here is a separate decision, queued for Tom rather than taken as a side effect of a dep-flow fix. Until then this RFC is a fix-time trace artefact satisfying the I13 propose-fix gate, not a work-breakdown vehicle. Same posture as RFC-002.

## Commits

(rendered from `git log --grep "Refs: RFC-003"` by `/wr-itil:manage-rfc` and `wr-itil-reconcile-rfcs`.)

## Related

- **ADR-034** carries the decision this flow implements. Its Confirmation criterion (d) named "the next dep issue that occurs is handled end-to-end via the new flow" as a condition; 2026-08-05 was that issue and the criterion did not hold. An amendment to ADR-034 recording that outcome lands with the fix commit, not with this capture.
- **P072** (`docs/problems/closed/072-adr-022-scheduled-cron-pr-supersede-push-fail-fast-plus-separate-fix-flow.md`): built the flow, closed pending the same end-to-end validation. Not reopened; P123 carries the finding.
- **P095**, **P026**, **P020**, **P111**: the surrounding dry-aged-deps friction family.
- **P112** (`docs/problems/verifying/112-accessibility-lead-review-misses-contrast-caught-only-by-ci-axe-gate.md`): the same shape at a different surface, a local reviewer passing what only the CI gate can see.
- Captured via `/wr-itil:capture-rfc --fix-time` from the I13 propose-fix gate; born `human-oversight: unconfirmed`, ratified at `/wr-itil:manage-rfc RFC-003 accepted`.
