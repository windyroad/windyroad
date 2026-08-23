#!/usr/bin/env bash
#
# check-action-pins.sh (P141, ADR-055)
#
# Deterministic lint for GitHub Actions pin form and permissions declaration.
# ASCII only, no em-dashes (this repo enforces a no-em-dash rule; a lint that
# emitted em-dashes in its own messages would be self-contradictory).
#
# The rules it enforces, per ADR-055:
#   1. A third-party action or reusable workflow (any owner other than
#      "actions") pins a 40-character commit SHA.
#   2. A first-party "actions/*" action pins a major version tag (vN).
#   3. A "docker://" step pins an image digest (@sha256:...).
#   4. A "./" local reference is exempt. There is no upstream ref to pin;
#      the code already lives in this repository and moves with it.
#   5. Every workflow file declares a TOP-LEVEL "permissions:" block, and no
#      workflow grants "write-all". Jobs may narrow it; a job-level block
#      replaces the top-level one rather than merging with it.
#
# What it does NOT check, deliberately:
#   * Whether a pinned ref is STALE. Nothing in this repo detects that yet.
#     That is P141's open residual and ADR-055 records it as undecided.
#   * Whether a declared permission scope is the MINIMUM the job needs. Rule 5
#     is what a lint can confirm; least privilege is the driver behind it, not
#     a machine-checkable claim. Requiring the block at TOP level is what makes
#     rule 5 worth checking: it leaves no job on repository defaults, which a
#     per-file "declared somewhere" check would have allowed.
#   * Anything inside a local composite action. Rule 4 exempts a "./" reference
#     because the referenced file lives in this repository, but that exemption
#     stops at the local action's boundary: a third-party "uses:" INSIDE
#     .github/actions/**/action.yml is ungoverned. There are no local composite
#     actions today. Extend the file list here before adding one.
#
# Usage: check-action-pins.sh [<workflow-dir>]   (default .github/workflows)
# Exit:  0 = clean, 1 = one or more violations, 2 = usage / IO error.

set -uo pipefail

dir="${1:-.github/workflows}"
[ -d "$dir" ] || { echo "check-action-pins: no such directory: $dir" >&2; exit 2; }

shopt -s nullglob
files=("$dir"/*.yml "$dir"/*.yaml)
[ ${#files[@]} -gt 0 ] || { echo "check-action-pins: no workflow files in $dir" >&2; exit 2; }

fail=0

# Rule 5, per file.
for f in "${files[@]}"; do
  grep -qE '^permissions:' "$f" \
    || { echo "FAIL $f: declares no top-level permissions: block; jobs fall back to repo defaults"; fail=1; }
  if grep -qE "^[[:space:]]*permissions:[[:space:]]*['\"]?write-all" "$f"; then
    echo "FAIL $f: grants write-all; name the scopes the jobs actually need"
    fail=1
  fi
done

# Rules 1 to 4, per uses: line. -H forces the filename prefix even for one file.
while IFS=: read -r file lineno body; do
  spec="${body#*uses:}"
  spec="${spec#"${spec%%[![:space:]]*}"}"   # trim leading space
  spec="${spec%%[[:space:]#]*}"             # drop trailing comment
  spec="${spec%\"}"; spec="${spec#\"}"      # strip surrounding double quotes
  spec="${spec%\'}"; spec="${spec#\'}"      # strip surrounding single quotes
  [ -n "$spec" ] || continue

  case "$spec" in
    ./*)
      continue ;;                            # rule 4
    docker://*)
      case "$spec" in
        *@sha256:*) ;;
        *) echo "FAIL $file:$lineno: '$spec' must pin an image digest (@sha256:...)"; fail=1 ;;
      esac
      continue ;;                            # rule 3
    */*@*)
      ;;                                     # rules 1 and 2, handled below
    *)
      echo "FAIL $file:$lineno: '$spec' is a uses: form this lint cannot classify;"
      echo "     teach scripts/check-action-pins.sh before relying on it"
      fail=1
      continue ;;
  esac

  owner="${spec%%/*}"
  ref="${spec##*@}"
  if [ "$owner" = "actions" ]; then
    [[ "$ref" =~ ^v[0-9]+$ ]] \
      || { echo "FAIL $file:$lineno: first-party '$spec' must pin a major tag (vN)"; fail=1; }
  else
    [[ "$ref" =~ ^[0-9a-f]{40}$ ]] \
      || { echo "FAIL $file:$lineno: third-party '$spec' must pin a 40-char commit SHA, not '$ref'"; fail=1; }
  fi
done < <(grep -HnE '^[[:space:]]*-?[[:space:]]*uses:' "${files[@]}")

[ "$fail" -eq 0 ] && echo "check-action-pins: OK (${#files[@]} workflow file(s) checked)"
exit "$fail"
