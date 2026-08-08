#!/bin/bash
# Usage: npm run fix:deps
#
# Repo-local dependency-fix flow (ADR-034 Phase 1, P072). This is the "separate
# fix flow" ADR-034 requires: it is invoked when push:watch HALTs on a stale-deps
# state that the ADR-021 inline auto-resolve (dry-aged-deps --update --yes) could
# not clear (major-version bumps, peer-dep conflicts, breaking-change patterns).
#
# It is deliberately NOT part of push:watch (ADR-034 separation of concerns):
# push:watch stays focused on push + watch; the apply-test-commit work lives here.
#
# Flow (detect -> apply -> gate -> commit-on-green / restore-and-halt-on-red),
# modelled on the sibling repo ../bbstats's auto-deps flow, adapted to
# windyroad's local, non-CI, single-package shape:
#   1. detect:  dry-aged-deps --check. Clean -> nothing to do, exit 0.
#   2. apply:   dry-aged-deps --update (applies available updates beyond the
#               --yes auto-resolvable subset that push:watch already tried).
#   3. gate:    manifest sync scan, lockfile install-shape scan, npm run lint,
#               npm test, npm run build. This mirrors the CI job the resulting
#               commit must survive (.github/workflows/main-pipeline.yml, "Lint,
#               check deps & build"). Gating on npm test alone shared almost no
#               surface with that job, so an uninstallable lockfile could commit
#               green and redden master (P123 / RFC-003).
#   4. green:   commit chore(deps) (root manifests ONLY) and report success.
#      red:     restore the manifests from BASE_REF, VERIFY the restored pair is
#               actually coherent (BASE_REF is not guaranteed to be: a desynced
#               commit restores as a desynced pair, which is P126 defect 2) and
#               regenerate the lockfile when it is not, then npm ci, then HALT
#               non-zero naming the failed gate. The halt message reports what
#               the restore actually achieved rather than asserting it.
#
# No changeset: the root package is private (package.json "private": true) per
# ADR-021, so root dep refreshes have no published API contract. The chore(deps)
# commit follows the same risk-reducing-bypass framing as push:watch's existing
# auto-deps commit (ADR-021 / ADR-008): it is bounded to the two root manifests
# and closes a staleness gap, so it does not re-run the commit risk gate.
#
# Exit: 0 = deps already current OR updated + gate green + committed;
#       1 = update applied but a gate failed (manifests restored; manual fix needed);
#       2 = usage / environment error.

# Fail-safe guard (P129): the FIX_DEPS_LIB_ONLY seam below is OPT-IN, so sourcing
# this file to reach a helper and forgetting the variable used to run the WHOLE
# detect/apply/gate/commit flow. Sourcing is never how the flow is invoked, so
# refuse it here and name the correct incantation instead. Mirrors the guard in
# scripts/push-watch.sh, including sitting ABOVE "set -euo pipefail" so that a
# probe does not leave errexit and nounset switched on in the calling shell.
if [ "${BASH_SOURCE[0]:-}" != "$0" ] && [ "${FIX_DEPS_LIB_ONLY:-0}" != "1" ]; then
  echo "fix-deps.sh was sourced without FIX_DEPS_LIB_ONLY=1; refusing to run the deps-fix flow." >&2
  echo "  To run the flow:   npm run fix:deps" >&2
  echo "  To probe a helper: bash -c 'export FIX_DEPS_LIB_ONLY=1; source scripts/fix-deps.sh; fix_deps_commit_body updates.json'" >&2
  return 0
fi

set -euo pipefail

# Shared manifest-hygiene scans (P126 / RFC-006): manifest_sync_violations and
# lockfile_platform_flag_violations, the latter relocated here from this file.
# Sourced ABOVE the FIX_DEPS_LIB_ONLY seam so scripts/fix-deps.test.mjs still
# reaches both. Resolved via BASH_SOURCE, not $0: the test harness sources this
# script under `bash -c`, where $0 is "bash".
# shellcheck source=lib/manifest-sync.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/manifest-sync.sh"

# ── Pure helper: format the chore(deps) commit body from dry-aged-deps JSON ────
# Lists each package whose version actually changed as "name current -> recommended".
# Packages whose recommended == current have an update available but none matured-
# safe yet, so --update leaves them alone; they are excluded. Tolerates the flat
# array, {rows:[...]}, {packages:[...]}, and single-object wrapper shapes.
fix_deps_commit_body() {
  local json_file="${1:?usage: fix_deps_commit_body <updates.json>}"
  local list
  list=$(jq -r '
    (if type == "object" and has("rows") then .rows
     elif type == "object" and has("packages") then .packages
     else . end)
    | (if type == "array" then . else [.] end)
    | map(select(.current != null and .recommended != null and .current != .recommended))
    | map("\(.name) \(.current) -> \(.recommended)")
    | join(", ")
  ' "$json_file" 2>/dev/null || true)

  if [ -n "$list" ]; then
    printf 'Routine dependency maintenance: dependencies updated to matured, safe versions: %s. No user-facing behaviour change is intended.\n' "$list"
  else
    printf 'Routine dependency maintenance: matured, safe dependency updates applied. No user-facing behaviour change is intended.\n'
  fi
}

# ── Pure helper: emit the exact-pin deadlock set from --check --format=json ────
# `dry-aged-deps --update` writes each dep's `wanted` version to package.json.
# An EXACT pin (e.g. "sass": "1.99.0") caps wanted == current, so --update
# no-ops, yet --check still flags the dep because `recommended` (the matured-
# safe target) is newer. Such deps deadlock: --check keeps failing, --update
# changes nothing. This helper lists them so the flow can bump the exact pin
# directly with `npm install --save-exact`. Emits one "name@recommended type"
# line per flagged-but-unbumpable dep (filtered != true, recommended != current).
# Tolerates the flat array, {packages:[...]}, and {rows:[...]} shapes. (P095)
exact_pin_deadlock_targets() {
  local json_file="${1:?usage: exact_pin_deadlock_targets <check.json>}"
  jq -r '
    (if type == "object" and has("packages") then .packages
     elif type == "object" and has("rows") then .rows
     else . end)
    | (if type == "array" then . else [.] end)
    | map(select(
        (.filtered != true) and .recommended != null and .current != null
        and .recommended != .current))
    | .[] | "\(.name)@\(.recommended) \(.type // "prod")"
  ' "$json_file" 2>/dev/null || true
}

# `lockfile_platform_flag_violations` used to be defined here. It now lives in
# scripts/lib/manifest-sync.sh alongside its sibling `manifest_sync_violations`,
# sourced at the top of this file (P126 / RFC-006). Both remain in scope below.

# Test seam (mirrors push-watch.sh): sourcing with FIX_DEPS_LIB_ONLY=1 defines
# the helpers above and returns before the detect/apply/test/commit flow runs.
# The "&&" short-circuit is exempt from "set -e" when the condition is false.
[ "${FIX_DEPS_LIB_ONLY:-0}" = "1" ] && return 0

# ── 1. Detect ─────────────────────────────────────────────────────────────────
echo "Checking dependency freshness (dry-aged-deps --check)..."
if npx --no-install dry-aged-deps --check; then
  echo "✓ Dependencies are current. Nothing to fix."
  exit 0
fi
echo ""
echo "Stale dependencies detected. Applying available updates..."

# Capture pre-update manifest state so we can restore known-good on test failure.
BASE_REF=$(git rev-parse HEAD)

# ── 2. Apply ──────────────────────────────────────────────────────────────────
# Capture the update set as JSON for the commit body, then apply.
UPDATES_JSON="$(mktemp)"
CHECK_JSON="$(mktemp)"
trap 'rm -f "$UPDATES_JSON" "$CHECK_JSON" package.json.backup' EXIT
npx --no-install dry-aged-deps --check --format=json > "$UPDATES_JSON" 2>/dev/null || true

if ! npx --no-install dry-aged-deps --update; then
  rm -f package.json.backup
  echo "✗ dry-aged-deps --update failed. Manifests left untouched; investigate the registry/network error above." >&2
  exit 1
fi
rm -f package.json.backup  # --update leaves a stray package.json.backup (P095)

# `dry-aged-deps --update` rewrites package.json ONLY and says so in its own
# output ("Run 'npm install' to install the updates"). Complete the write so the
# lockfile follows, otherwise the pair is desynced by construction and `npm ci`
# refuses it (P126 / RFC-006). `--package-lock-only` rather than a plain `npm
# install`, which reintroduces the unflagged nested @rollup/rollup-* duplicates
# of the P123 EBADPLATFORM class. Wrapped non-fatally under `set -e` so a
# registry blip does not abort mid-refresh; the sync scan in the gate below is
# what decides whether the result is usable.
if ! git diff --quiet -- package.json; then
  if ! npm install --package-lock-only; then
    echo "  (lockfile regeneration failed; the manifest sync gate below will catch the desync)" >&2
  fi
fi

if git diff --quiet -- package.json package-lock.json; then
  # --update changed nothing. If --check still flags deps, they are the exact-pin
  # deadlock (P095): an exact pin caps `wanted` == current so --update can't bump
  # them, but `recommended` is a matured target. Bump the exact pin directly to
  # the matured target (the P026 "run the upgrade" discipline) and let the test
  # gate below validate it before commit.
  npx --no-install dry-aged-deps --check --format=json > "$CHECK_JSON" 2>/dev/null || true
  DEADLOCK="$(exact_pin_deadlock_targets "$CHECK_JSON")"
  if [ -n "$DEADLOCK" ]; then
    echo "  --update no-op'd but --check still flags deps: exact-pin deadlock (P095)."
    echo "  Bumping pinned deps to their matured targets:"
    while read -r spec type; do
      [ -z "$spec" ] && continue
      echo "    $spec ($type)"
      if [ "$type" = "dev" ]; then
        npm install --save-dev --save-exact "$spec"
      else
        npm install --save-exact "$spec"
      fi
    done <<< "$DEADLOCK"
    rm -f package.json.backup
  fi

  if git diff --quiet -- package.json package-lock.json; then
    echo "  No manifest changes resulted from --update (remaining updates are still maturing or not auto-applicable)."
    echo "  Nothing to commit. If the pre-push gate still fails, the stale deps need a manual major-version review."
    exit 0
  fi
fi

# ── 3. Gate: run what CI runs ─────────────────────────────────────────────────
# Mirrors .github/workflows/main-pipeline.yml's "Lint, check deps & build" job,
# cheapest check first, so the commit faces locally the gate it will face on CI
# (P123 / RFC-003). `npm run deps:check` is DELIBERATELY omitted: push:watch
# already runs `dry-aged-deps --check` before pushing (scripts/push-watch.sh),
# so CI's deps:check step cannot be reached with a stale tree, and gating on it
# here would only convert partial progress into restore-and-halt.
#
# Keep this list in step with that workflow job. A step added there without a
# matching step here silently re-opens the local-gate-vs-real-gate divergence.
echo ""
echo "Manifests changed. Running the CI-parity gate before committing..."

# `npm run build` runs prebuild (scripts/generate-og-image.mjs), which rewrites
# the TRACKED public/img/og-image.png. Restore it afterwards if it was clean
# beforehand, so the flow keeps its "root manifests ONLY" tree contract.
OG_IMAGE="public/img/og-image.png"
OG_WAS_CLEAN=0
git diff --quiet -- "$OG_IMAGE" && OG_WAS_CLEAN=1

FAILED_GATE=""
DESYNC="$(manifest_sync_violations package.json package-lock.json)"
VIOLATIONS="$(lockfile_platform_flag_violations package-lock.json)"
if [ -n "$DESYNC" ]; then
  # Cheapest check of all, and the one the regeneration above is meant to have
  # made unreachable: reaching it means the lockfile did not follow package.json
  # (P126 / RFC-006). `npm ci` rejects such a pair outright with EUSAGE.
  FAILED_GATE="manifest sync scan"
  echo "" >&2
  echo "✗ package.json and package-lock.json disagree on:" >&2
  printf '    %s\n' "$DESYNC" >&2
  echo "  'npm ci' would fail EUSAGE: the two manifests are not in sync." >&2
elif [ -n "$VIOLATIONS" ]; then
  FAILED_GATE="lockfile install-shape scan"
  echo "" >&2
  echo "✗ Lockfile entries carry os/cpu constraints without \"optional\": true:" >&2
  printf '    %s\n' $VIOLATIONS >&2
  echo "  'npm ci' would fail EBADPLATFORM on any platform these do not match." >&2
elif ! npm run lint; then
  FAILED_GATE="npm run lint"
elif ! npm test; then
  FAILED_GATE="npm test"
elif ! npm run build; then
  FAILED_GATE="npm run build"
fi

[ "$OG_WAS_CLEAN" = "1" ] && git checkout -- "$OG_IMAGE" 2>/dev/null || true

if [ -z "$FAILED_GATE" ]; then
  # ── 4a. Green: commit the refresh (root manifests ONLY) ─────────────────────
  echo ""
  echo "✓ Lockfile shape, lint, tests and build all green under the updated dependencies. Committing."
  git add package.json package-lock.json
  BODY="$(fix_deps_commit_body "$UPDATES_JSON")"
  git commit -m "chore(deps): fix stale dependencies via fix:deps flow (P072)" -m "$BODY"
  echo ""
  echo "✓ Dependency fix committed. Re-run: npm run push:watch"
  exit 0
else
  # ── 4b. Red: restore the manifests, VERIFY the restore, then HALT ───────────
  # BASE_REF is just HEAD, and HEAD is not guaranteed to name a coherent pair:
  # push:watch used to commit a desynced one, so restoring it reinstated the
  # defect and the npm ci below failed identically while this block claimed the
  # tree was fine (P126 defect 2). Check what the restore actually produced and
  # repair it before asserting anything.
  echo "" >&2
  echo "✗ Gate failed under the updated dependencies: $FAILED_GATE." >&2
  echo "  Restoring the manifests from $BASE_REF..." >&2
  git checkout "$BASE_REF" -- package.json package-lock.json

  RESTORED_DESYNC="$(manifest_sync_violations package.json package-lock.json)"
  REGENERATED=0
  if [ -n "$RESTORED_DESYNC" ]; then
    echo "  The restored manifests are themselves out of sync on:" >&2
    printf '    %s\n' "$RESTORED_DESYNC" >&2
    echo "  $BASE_REF carries a desynced pair, so restoring it is not enough." >&2
    echo "  Regenerating the lockfile against the restored package.json..." >&2
    # Non-fatally wrapped under `set -e` so a registry failure still reaches the
    # next-steps block below rather than aborting on an npm stack trace.
    if npm install --package-lock-only; then
      REGENERATED=1
    else
      echo "  Lockfile regeneration failed; the tree is still uninstallable." >&2
    fi
  fi

  npm ci || echo "  'npm ci' failed against the restored manifests." >&2

  echo "" >&2
  echo "✗ fix:deps could not land a green dependency update automatically." >&2
  echo "  The update broke '$FAILED_GATE' and the manifests were restored from $BASE_REF." >&2
  if [ "$REGENERATED" = "1" ]; then
    echo "  NOTE: $BASE_REF's own manifests were out of sync, so package-lock.json has been" >&2
    echo "  REGENERATED and is now uncommitted. Keep it: checking it back out restores the" >&2
    echo "  desync and 'npm ci' fails again (P126). Commit it once you are green." >&2
  fi
  echo "  Next steps:" >&2
  echo "    1. Run 'npx dry-aged-deps --check' to see which packages are stale." >&2
  echo "    2. Update and fix the breakage manually (one package at a time helps isolate it)." >&2
  echo "    3. Re-run '$FAILED_GATE', then 'npm run push:watch' once green." >&2
  if [ "$FAILED_GATE" = "lockfile install-shape scan" ]; then
    echo "  For the lockfile shape specifically: 'npm install --package-lock-only' often" >&2
    echo "  dedupes nested platform-specific duplicates back onto flagged top-level entries." >&2
  fi
  if [ "$FAILED_GATE" = "manifest sync scan" ]; then
    echo "  For the sync failure specifically: 'npm install --package-lock-only' regenerates" >&2
    echo "  the lockfile against package.json; 'npm ci --dry-run' confirms the pair." >&2
  fi
  exit 1
fi
