#!/bin/bash
# Shared manifest-hygiene scans for the root package.json / package-lock.json
# pair (P126 / RFC-006). Sourced by scripts/push-watch.sh and scripts/fix-deps.sh
# above their respective *_LIB_ONLY test seams, so both scripts' probe harnesses
# reach these helpers. Two callers, one definition; the alternative was a private
# copy in each script, which is how the two of them came to make the same
# unchecked assumption in the first place (P126 investigation task 4).
#
# Both helpers are PURE: they read the files named in their arguments, write to
# stdout, and touch nothing. Zero output is the healthy state for both.
#
# No `set -e` here on purpose: this file is sourced into callers that set their
# own shell options, and a library that mutates them surprises its callers.

# ── Pure helper: list root dependencies whose two manifests disagree ──────────
# `npm ci` refuses to install (EUSAGE, "can only install packages when your
# package.json and package-lock.json ... are in sync") when the lockfile's root
# entry does not record what package.json declares. That is the shape
# `dry-aged-deps --update` produces on its own: it rewrites package.json and says
# "Run 'npm install' to install the updates", so without a following install the
# lockfile still records the old specs. On 2026-08-05 that landed vitest 4.1.10
# in package.json against 3.2.4 in the lockfile and reddened master at CI's first
# step (P126 defect 1).
#
# The scan compares package.json's dependencies / devDependencies /
# optionalDependencies against the lockfile's `packages[""]` record of the same
# three blocks, in both directions, so a dropped dependency left behind in the
# lockfile is caught alongside a bumped one the lockfile never saw.
#
# This is a PROXY, not a proof, in the same sense as its sibling below:
#
#   - After `npm install --package-lock-only` it is close to tautological,
#     because `packages[""]` is regenerated FROM package.json. Its value on that
#     path is catching a regeneration that silently no-op'd, not proving the
#     result installs.
#   - It does not cover the case where `packages[""]` agrees but a resolved
#     `packages["node_modules/<name>"].version` fails to satisfy the declared
#     range.
#
# `npm ci --dry-run` is the exact-fidelity alternative and is deliberately not
# used: it needs network and a full resolution, which is slow enough to change
# the character of a flow that runs on every push. Same cost reasoning RFC-003
# applied to the platform scan below.
#
# Emits one line per disagreeing dependency name; silent when the pair is
# coherent. A lockfile with no root entry reads as coherent against an empty
# package.json rather than erroring.
manifest_sync_violations() {
  local pkg="${1:?usage: manifest_sync_violations <package.json> <package-lock.json>}"
  local lock="${2:?usage: manifest_sync_violations <package.json> <package-lock.json>}"
  jq -rn --slurpfile p "$pkg" --slurpfile l "$lock" '
    def specs: (.dependencies // {}) + (.devDependencies // {}) + (.optionalDependencies // {});
    (($p[0] // {}) | specs) as $want
    | ((($l[0].packages // {})[""] // {}) | specs) as $have
    | (($want | keys) + ($have | keys) | unique)
    | map(select(($want[.] // null) != ($have[.] // null))
          | "\(.): package.json \($want[.] // "absent") vs lock \($have[.] // "absent")")
    | .[]
  ' 2>/dev/null || true
}

# ── Pure helper: list resolved entries a lockfile regeneration moved ──────────
# `push-watch.sh` commits its refreshed manifest pair without running lint, test
# or build, because ADR-034 considered and rejected moving that flow into
# push:watch. That is only defensible while the regenerated lockfile is a pure
# SPEC-SYNC: a change confined to the root `packages[""]` block records what
# package.json now declares and cannot alter what npm actually installs. The
# moment a resolved `packages["node_modules/<name>"]` entry is added, removed or
# re-versioned, the installed tree changes, and nothing in push:watch has
# executed it. That is the class this scan refuses.
#
# Non-empty output means "hand this to `npm run fix:deps`", whose CI-parity gate
# runs the lockfile shape scan, lint, tests and build before it commits. That is
# ADR-034's separation of concerns doing its job rather than being worked around.
#
# Emits one lockfile package key per moved entry; silent on a pure spec-sync.
lockfile_resolution_delta() {
  local before="${1:?usage: lockfile_resolution_delta <before-lock> <after-lock>}"
  local after="${2:?usage: lockfile_resolution_delta <before-lock> <after-lock>}"
  jq -rn --slurpfile b "$before" --slurpfile a "$after" '
    (($b[0].packages // {}) | del(.[""])) as $was
    | (($a[0].packages // {}) | del(.[""])) as $now
    | (($was | keys) + ($now | keys) | unique)
    | map(select(($was[.] // null) != ($now[.] // null)))
    | .[]
  ' 2>/dev/null || true
}

# ── Pure helper: list lockfile entries that `npm ci` would refuse to install ───
# Relocated verbatim from scripts/fix-deps.sh by P126 / RFC-006 so the two
# sibling scans live together. The file changed; the region did not, because
# fix-deps.sh sources this library above its FIX_DEPS_LIB_ONLY return, so the
# helper is still defined under FIX_DEPS_LIB_ONLY=1 and the existing coverage in
# scripts/fix-deps.test.mjs still reaches it. RFC-003's Scope describes it as
# living "in the FIX_DEPS_LIB_ONLY sourceable region"; that property holds.
#
# An npm lockfile entry carrying `os` or `cpu` constraints WITHOUT `optional:
# true` is a required install of a platform-specific artefact, so `npm ci` on a
# non-matching platform fails EBADPLATFORM. A lockfile rewrite that strips the
# optional flag while leaving the constraints produces exactly that shape: green
# tests on the authoring machine, red `npm ci` on CI's linux/x64 runner. That is
# what happened on 2026-08-05, when 22 nested @rollup/rollup-* duplicates lost
# their flag and reddened master (P123 / RFC-003).
#
# This is a cheap PROXY for installability, not a proof. Proving it needs a
# clean-tree `npm ci`, which is slow enough to change the flow's character; the
# scan costs milliseconds and no network, and catches the observed defect class.
# Zero hits is the healthy state (all 244 platform-constrained entries in the
# current lockfile carry the flag). Emits one lockfile package key per
# violation; silent when clean.
lockfile_platform_flag_violations() {
  local lockfile="${1:?usage: lockfile_platform_flag_violations <package-lock.json>}"
  jq -r '
    (.packages // {})
    | to_entries[]
    | select((.value | has("os")) or (.value | has("cpu")))
    | select((.value.optional // false) != true)
    | .key
  ' "$lockfile" 2>/dev/null || true
}

# ── Installed-tree coherence (P168) ───────────────────────────────────────────
# The two scans above compare the two TRACKED manifests. This one compares the
# lockfile against what is actually installed, which is the pair nothing else
# checks and the one that deadlocks the push path.
#
# Why it is needed: `dry-aged-deps --check`, the gate push-watch.sh consults,
# reports the INSTALLED version as current. fix-deps.sh completes its manifest
# pair with `npm install --package-lock-only`, chosen deliberately over a plain
# `npm install` because the latter reintroduced the P123 EBADPLATFORM class, and
# that flag never touches node_modules. So a fix:deps run can update both
# manifests, pass lint, tests and build, commit, and leave the gate blocking on
# the same package forever: the value it reads lives in a gitignored directory
# that no step in the flow writes. Observed 2026-08-25 holding three commits.
#
# Compares TOP-LEVEL installs only. A nested `node_modules/a/node_modules/b`
# entry is npm resolving a version conflict, not staleness, and no reinstall
# collapses it. A locked package absent from disk is not a desync either: it is
# an optional or platform-specific dependency that was never installed here, and
# reporting it would make the scan fire on every healthy tree.
#
# Emits `<name>: locked <x> vs installed <y>` per desynced package; silent when
# the tree agrees, when nothing is installed, and when the directory is absent.
installed_tree_desync() {
  local lockfile="${1:?usage: installed_tree_desync <package-lock.json> [node_modules_dir]}"
  local tree="${2:-node_modules}"
  [ -d "$tree" ] || return 0
  jq -r '
    (.packages // {})
    | to_entries[]
    | select(.key | startswith("node_modules/"))
    | select((.key | split("node_modules/") | length) == 2)
    | select(.value.version != null)
    | "\(.key | sub("^node_modules/"; ""))\t\(.value.version)"
  ' "$lockfile" 2>/dev/null | while IFS=$'\t' read -r name locked; do
    [ -n "$name" ] || continue
    local manifest="$tree/$name/package.json"
    [ -f "$manifest" ] || continue
    local got
    got=$(jq -r '.version // empty' "$manifest" 2>/dev/null) || continue
    [ -n "$got" ] || continue
    [ "$got" = "$locked" ] || echo "$name: locked $locked vs installed $got"
  done
}
