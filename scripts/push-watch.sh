#!/bin/bash
# Usage: npm run push:watch
# Pushes to master, watches the main pipeline, and surfaces deploy URLs.
# If there are pending changesets, also watches the release-pr-preview and
# provides the preview URL and release PR link for human review.
# On failure: shows which checks failed and prompts for a local hook fix.

# Fail-safe guard (P129): the PUSH_WATCH_LIB_ONLY seam below is OPT-IN, so
# sourcing this file to reach a helper and forgetting the variable used to run
# the WHOLE flow: git stash, git pull --rebase, dry-aged-deps --update --yes, the
# deps gate and git push. That published four already-committed commits from a
# session instructed not to push on 2026-08-08. Sourcing is never how the flow is
# invoked, so refuse it here and name the correct incantation instead.
#
# ${BASH_SOURCE[0]} equals $0 when the script is executed and differs when it is
# sourced; "npm run push:watch" runs "bash scripts/push-watch.sh", so the executed
# path is untouched. Deliberately ABOVE "set -euo pipefail": source runs in the
# CALLER's shell, so setting those options first would leave errexit and nounset
# switched on in the probing shell long after this returned.
if [ "${BASH_SOURCE[0]:-}" != "$0" ] && [ "${PUSH_WATCH_LIB_ONLY:-0}" != "1" ]; then
  echo "push-watch.sh was sourced without PUSH_WATCH_LIB_ONLY=1; refusing to run the push flow." >&2
  echo "  To run the flow:   npm run push:watch" >&2
  echo "  To probe a helper: bash -c 'export PUSH_WATCH_LIB_ONLY=1; source scripts/push-watch.sh; manifest_refresh_route 1 1 \"\"'" >&2
  return 0
fi

set -euo pipefail

SITE_ID="${NETLIFY_SITE_ID:-d00c9942-3c2a-420d-9486-0339ae54af4d}"

# ── Helper: show failed jobs and hook guidance ────────────────────────────────
show_failure_guidance() {
  local run_id="$1"
  local run_url="$2"

  echo ""
  echo "Failed checks:"
  gh run view "$run_id" --json jobs \
    --jq '.jobs[] | select(.conclusion == "failure") | "  ✗ \(.name)"' 2>/dev/null || true

  echo ""
  echo "Fix the failure above, then re-run: npm run push:watch"
  echo ""
  echo "Ask Claude: 'What pre-push or pre-commit git hook in .githooks/ could"
  echo "have caught the failure in $run_url ?'"
}

# Helper: classify a gh/network error string as transient (retryable).
# Returns 0 (transient) for connection resets, timeouts, 5xx/429, "could not
# resolve host", and HTTP 401 "Bad credentials" blips, else 1. The 401 case was
# observed polling run 27609565746 on 2026-06-16: a transient HTTP 401 "Bad
# credentials" during watch on a run that genuinely concluded success (P092 C).
# Scope note (architect): 401-as-transient is only consumed by the watch-recheck
# loop below. A persistent 401 on the push itself is a genuine auth failure and
# is NOT routed through here.
is_transient_gh_error() {
  local err="$1"
  printf '%s' "$err" | grep -qiE \
    'connection reset|connection refused|broken pipe|i/o timeout|net/http|Client\.Timeout|timed out|timeout|temporary failure|could not resolve host|TLS handshake|EOF|HTTP 5[0-9][0-9]|HTTP 429|HTTP 401|bad credentials|server error|service unavailable'
}

# Helper: watch a run, distinguishing genuine CI failure from transient blips.
# "gh run watch --exit-status" can exit non-zero on a transient API/network
# error even when the run later concludes success (P092 case C). On a non-zero
# watch, re-check the real run state via "gh run view" with bounded transient-
# error retry (exponential backoff, capped). Declare failure ONLY on a genuinely
# completed conclusion that is not success. Returns 0 success, 1 failure.
watch_run_resilient() {
  local run_id="$1"
  local attempt max_attempts=8 delay=5
  local view_out view_rc status conclusion

  for attempt in $(seq 1 "$max_attempts"); do
    if gh run watch "$run_id" --exit-status; then
      return 0
    fi
    # Watch exited non-zero. Do NOT trust it as a failure verdict, so re-check
    # the real run state before declaring the pipeline failed.
    view_out=$(gh run view "$run_id" --json status,conclusion 2>&1)
    view_rc=$?
    if [ "$view_rc" -ne 0 ]; then
      if is_transient_gh_error "$view_out"; then
        echo "  (transient API error polling run $run_id; retry $attempt/$max_attempts in ${delay}s)" >&2
        sleep "$delay"
        delay=$((delay * 2)); [ "$delay" -gt 60 ] && delay=60
        continue
      fi
      echo "  (non-transient error viewing run $run_id: $view_out)" >&2
      return 1
    fi
    status=$(printf '%s' "$view_out" | jq -r '.status // empty')
    conclusion=$(printf '%s' "$view_out" | jq -r '.conclusion // empty')
    if [ "$status" != "completed" ]; then
      # Run still in progress; the watch dropped on a transient blip. Re-watch.
      echo "  (watch dropped while run $run_id still in_progress; re-watching, attempt $attempt/$max_attempts)" >&2
      sleep "$delay"
      continue
    fi
    # Run completed: trust the real conclusion, not the watch exit code.
    case "$conclusion" in
      success) return 0 ;;
      *) return 1 ;;
    esac
  done
  echo "  (exhausted $max_attempts attempts confirming run $run_id; treating as failure)" >&2
  return 1
}

# Helper: detect a sibling-amend / same-parent non-fast-forward vs upstream.
# After amending a just-pushed commit, local HEAD and the upstream tip diverge
# but share the same parent (P092 case B). An auto "git pull --rebase" would
# replay the amend onto the original and inject conflict markers into working
# files. Returns 0 when this sibling-amend divergence is detected (caller skips
# the rebase and suggests --force-with-lease); 1 otherwise (fast-forward or
# in-sync states are safe to rebase as before).
is_sibling_amend() {
  local upstream head_sha upstream_sha head_parent upstream_parent
  upstream=$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null) || return 1
  head_sha=$(git rev-parse HEAD 2>/dev/null) || return 1
  upstream_sha=$(git rev-parse "$upstream" 2>/dev/null) || return 1
  [ "$head_sha" = "$upstream_sha" ] && return 1                                   # in sync
  git merge-base --is-ancestor "$upstream_sha" "$head_sha" 2>/dev/null && return 1  # ahead (ff)
  git merge-base --is-ancestor "$head_sha" "$upstream_sha" 2>/dev/null && return 1  # behind (ff)
  # Diverged. Sibling-amend signal: local tip and upstream tip share a parent.
  head_parent=$(git rev-parse 'HEAD^' 2>/dev/null) || return 1
  upstream_parent=$(git rev-parse "${upstream}^" 2>/dev/null) || return 1
  [ "$head_parent" = "$upstream_parent" ]
}

# Helper: route the push gate from the post-auto-resolve dep-check exit code
# (P072 / ADR-034 Phase 1). After ADR-021's inline `dry-aged-deps --update --yes`
# has applied what it can, re-check freshness. Exit 0 -> deps clean, "proceed"
# with the push. Non-zero -> stale deps remain that auto-resolve could not clear
# (major-version bumps, peer-dep conflicts, breaking-change patterns); the caller
# HALTs and routes the operator to the separate fix flow (npm run fix:deps)
# rather than swallowing the signal or deferring it to the ADR-022 cron. A missing
# argument defaults to "proceed" (no stale signal observed).
deps_gate_route() {
  if [ "${1:-0}" -eq 0 ]; then echo proceed; else echo halt; fi
}

# Helper: route the auto-deps refresh from what it produced (P126 / RFC-006).
# ADR-021 authorises push:watch to rewrite and commit the two root manifests.
# `dry-aged-deps --update --yes` only writes package.json, so the caller runs
# `npm install --package-lock-only` to complete the write and then scans the
# result. This decides what to do with it:
#   commit   - push:watch authored the change and the pair is coherent (the
#              ADR-021 path).
#   rollback - push:watch authored the change but the pair is not coherent, so
#              undo it rather than commit what `npm ci` rejects with EUSAGE.
#   skip     - nothing changed, or the change is not push:watch's to act on.
#
# Ownership gates BOTH acting branches, not just rollback. When either manifest
# was already dirty on entry, push:watch cannot separate its own writes from the
# operator's, so it neither sweeps their work into a chore(deps) commit nor
# reverts it: it leaves the tree alone and the existing stale-deps gate below
# does the halting. ADR-021's Decision Outcome scopes the auto-commit to "a
# working-tree change introduced inside push-watch.sh", which is exactly this.
#
# $1 = 1 when BOTH manifests were clean before the refresh (so any change is
# ours), $2 = 1 when the manifests changed, $3 = scan output (empty = coherent).
# Missing arguments default to skip (nothing observed, nothing to do).
manifest_refresh_route() {
  if [ "${1:-0}" != "1" ]; then echo skip
  elif [ "${2:-0}" != "1" ]; then echo skip
  elif [ -n "${3:-}" ]; then echo rollback
  else echo commit
  fi
}

# Shared manifest-hygiene scans (P126 / RFC-006), sourced ABOVE the seam below so
# scripts/push-watch.test.mjs reaches them. BASH_SOURCE, not $0: the test harness
# sources this script under `bash -c`, where $0 is "bash".
# shellcheck source=lib/manifest-sync.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/manifest-sync.sh"

# Test seam (P092): allow the behavioural test (scripts/push-watch.test.mjs) to
# source the helper functions above without executing the push/watch flow. The
# "&&" short-circuit is exempt from "set -e" when the condition is false.
[ "${PUSH_WATCH_LIB_ONLY:-0}" = "1" ] && return 0

# ── 1. Pull + Push ───────────────────────────────────────────────────────────
STASHED=0
if ! git diff --quiet || ! git diff --cached --quiet; then
  git stash
  STASHED=1
fi
if is_sibling_amend; then
  echo "Detected a sibling-amend: local HEAD shares a parent with the upstream tip but differs."
  echo "Skipping auto pull --rebase to avoid replaying the amend and injecting conflict markers (P092)."
  echo "If this amend is intentional, re-push with: git push --force-with-lease"
else
  git pull --rebase
fi
[ "$STASHED" = "1" ] && git stash pop

# Pre-emptively resolve auto-resolvable stale dependencies before the push.
# The pre-push hook (.git/hooks/pre-push) runs `dry-aged-deps --check` and
# halts on stale deps. AFK orchestrator runs (e.g. /wr-itil:work-problems)
# cannot clear the gate without a human, so apply --update --yes here.
# Anything not auto-resolvable stays stale and the pre-push gate still fires.
# See ADR 021 for the policy and ADR-008 risk-reducing-bypass framing.
#
# Record which manifests were already dirty BEFORE the refresh, so the rollback
# path below only ever undoes writes this block authored. A manifest the operator
# had already modified is theirs, not ours (P126 / RFC-006). Both the worktree
# and the index are tested: the guard must not depend on the stash pop above
# having normalised staged changes to unstaged.
PKG_WAS_CLEAN=0
LOCK_WAS_CLEAN=0
git diff --quiet -- package.json && git diff --cached --quiet -- package.json && PKG_WAS_CLEAN=1
git diff --quiet -- package-lock.json && git diff --cached --quiet -- package-lock.json && LOCK_WAS_CLEAN=1
REFRESH_AUTHORED=0
[ "$PKG_WAS_CLEAN" = "1" ] && [ "$LOCK_WAS_CLEAN" = "1" ] && REFRESH_AUTHORED=1
if [ "$REFRESH_AUTHORED" != "1" ]; then
  echo "  (root manifests were already modified; skipping the auto-deps refresh entirely this run)"
fi

# Gated on REFRESH_AUTHORED like every other writer in this block: on a tree
# whose manifests the operator already modified, push:watch cannot act on the
# result, so writing to package.json at all would dirty their work for nothing
# and delete the backup --update leaves behind.
if [ "$REFRESH_AUTHORED" = "1" ]; then
  if ! npx dry-aged-deps --update --yes; then
    echo "  (dry-aged-deps auto-update non-fatal; pre-push gate will fire if state is still stale)"
  fi
  rm -f package.json.backup  # --update leaves a stray package.json.backup (P095)
fi

# `--update --yes` rewrites package.json ONLY and says so in its own output
# ("Run 'npm install' to install the updates"). Complete the write so the
# lockfile follows; committing the pair without it is desynced by construction
# and `npm ci` rejects it at CI's first step, which reddens master (P126 defect
# 1). `--package-lock-only` rather than a plain `npm install`, which reintroduces
# the unflagged nested @rollup/rollup-* duplicates of the P123 EBADPLATFORM
# class. Wrapped non-fatally per ADR-021 confirmation criterion 2: a registry
# blip must not abort the push here. If it does fail, the scans below see the
# desync it left and route to rollback.
# Gated on REFRESH_AUTHORED, not on bare dirtiness: if the operator arrived with
# a modified package.json, `git diff --quiet` is true whether or not --update
# touched anything, so regenerating here would rewrite a lockfile push:watch does
# not own. Only write when every change in sight is provably this block's.
RESOLUTION_DELTA=""
if [ "$REFRESH_AUTHORED" = "1" ] && ! git diff --quiet -- package.json; then
  LOCK_BEFORE="$(mktemp)"
  cp package-lock.json "$LOCK_BEFORE"
  if ! npm install --package-lock-only; then
    echo "  (lockfile regeneration non-fatal; the manifest scans below decide what happens next)"
  fi
  # push:watch commits this pair without running lint, test or build, because
  # ADR-034 rejected moving that flow here. That holds only while the regenerated
  # lockfile is a pure spec-sync. If a resolved entry moved, the installed tree
  # changed and nothing here has executed it, so decline and let fix:deps apply
  # its CI-parity gate instead (P126 / RFC-006).
  RESOLUTION_DELTA="$(lockfile_resolution_delta "$LOCK_BEFORE" package-lock.json)"
  rm -f "$LOCK_BEFORE"
fi

MANIFESTS_CHANGED=0
git diff --quiet -- package.json package-lock.json || MANIFESTS_CHANGED=1
REFRESH_VIOLATIONS="$(
  manifest_sync_violations package.json package-lock.json
  lockfile_platform_flag_violations package-lock.json
)"
if [ -n "$RESOLUTION_DELTA" ]; then
  echo "  Lockfile regeneration moved resolved entries, so this refresh is not a pure spec-sync:" >&2
  printf '    %s\n' "$RESOLUTION_DELTA" >&2
  echo "  push:watch does not commit an installed-tree change it has not executed; routing to fix:deps." >&2
  REFRESH_VIOLATIONS="${REFRESH_VIOLATIONS}${REFRESH_VIOLATIONS:+
}resolved entries moved; not a pure spec-sync"
fi

# This routing REPLACES the old bare `git diff --quiet` test. It must, not sit
# beside it: on the rollback path with an operator-dirty package.json the old
# test is still true, so keeping it would commit the desynced pair the scans just
# caught and reintroduce the defect (P126 / RFC-006).
case "$(manifest_refresh_route "$REFRESH_AUTHORED" "$MANIFESTS_CHANGED" "$REFRESH_VIOLATIONS")" in
  commit)
    echo "Auto-deps refresh changed root manifests; committing as chore(deps)."
    git add package.json package-lock.json
    git commit -m "chore(deps): refresh stale dependencies (P026)"
    ;;
  rollback)
    # Reached only when REFRESH_AUTHORED=1, so both manifests were clean on entry
    # and restoring them undoes this block's writes and nothing else.
    echo "✗ Auto-deps refresh produced manifests 'npm ci' would reject:" >&2
    printf '    %s\n' "$REFRESH_VIOLATIONS" >&2
    echo "  Rolling this run's refresh back rather than committing it." >&2
    git checkout -- package.json package-lock.json
    # No exit: the stale-deps gate below sees the unrefreshed state and routes to
    # the fix flow exactly as it does today. This block adds no halt of its own.
    ;;
esac

# Fail fast on stale deps the inline auto-resolve could not clear (ADR-034
# Phase 1, P072). ADR-021's `--update --yes` above handles the auto-resolvable
# subset; anything left (major-version bumps, peer-dep conflicts, breaking-change
# patterns) is a manual-intervention class. Re-check now and HALT before spending
# a push + CI round-trip, routing the operator to the separate fix flow. This
# supersedes ADR-022's cron-PR deferral: the fix flow validates (test) before it
# commits, so the operator does not review untested dep bumps. push:watch stays
# focused on push + watch and does NOT run the fix flow inline.
deps_check_rc=0
npx --no-install dry-aged-deps --check >/dev/null 2>&1 || deps_check_rc=$?
if [ "$(deps_gate_route "$deps_check_rc")" = "halt" ]; then
  echo ""
  echo "✗ Stale dependencies remain that auto-resolve could not clear." >&2
  echo "  Run the separate fix flow, then re-run push:watch:" >&2
  echo "" >&2
  echo "    npm run fix:deps   # apply updates, run tests, commit on green" >&2
  echo "    npm run push:watch" >&2
  exit 1
fi

# Defence-in-depth: block on red CI on the branch we're about to push to.
# See ADR-028 and P012. The upstream wr-risk-scorer plugin gate scores risk
# but does not check CI status; this wrapper closes that gap until the
# upstream issue (windyroad/agent-plugins#86) lands.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
bash "$SCRIPT_DIR/ci-status-check.sh" "$(git branch --show-current)"

PUSH_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
git push "$@"
COMMIT_SHA=$(git rev-parse HEAD)
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)

# ── 1b. WIP checks on remote state (checks 3-4) ─────────────────────────────
# These run after push when remote refs are fresh. Results print to stdout.

# Check 3: Pushed but unreleased commits without changesets
UNRELEASED=$(git rev-list --count origin/publish..origin/master 2>/dev/null || echo "0")
if [ "$UNRELEASED" -gt 0 ]; then
    CHANGESET_COUNT=$(find .changeset -name '*.md' ! -name 'README.md' 2>/dev/null | head -20 | wc -l | tr -d ' ' || true)
    if [ "$CHANGESET_COUNT" -eq 0 ]; then
        SHOULD_NUDGE=false
        AGE_DETAIL=""
        OLDEST_UNRELEASED=$(git log --format='%aI' --reverse origin/publish..origin/master 2>/dev/null | head -1 || true)
        if [ -n "$OLDEST_UNRELEASED" ]; then
            UNRELEASED_AGE_HOURS=$(python3 -c "
from datetime import datetime, timezone
try:
    oldest = datetime.fromisoformat('$OLDEST_UNRELEASED')
    now = datetime.now(timezone.utc)
    print(int((now - oldest).total_seconds() / 3600))
except:
    print(0)
" 2>/dev/null || echo "0")
            if [ "$UNRELEASED_AGE_HOURS" -ge 24 ]; then
                SHOULD_NUDGE=true
                UNRELEASED_AGE_DAYS=$((UNRELEASED_AGE_HOURS / 24))
                AGE_DETAIL=" (oldest: ${UNRELEASED_AGE_DAYS} day(s) ago)"
            fi
        fi
        if [ "$UNRELEASED" -ge 3 ]; then
            SHOULD_NUDGE=true
        fi
        if [ "$SHOULD_NUDGE" = true ]; then
            echo "WIP: ${UNRELEASED} unreleased commits with no changeset${AGE_DETAIL}. Run \`npx changeset\` to describe what's shipping."
        fi
    fi
fi

# Check 4: Release PR accumulating unreleased work
PR_CHECK_JSON=$(timeout 10 gh pr list --base publish --state open --limit 1 --json number,url,createdAt)
if [ $? -ne 0 ]; then
    echo "✗ Failed to check release PR status (gh CLI or GitHub API error)" >&2
    exit 1
fi
if [ "$PR_CHECK_JSON" != "[]" ] && [ -n "$PR_CHECK_JSON" ]; then
    CREATED_AT=$(echo "$PR_CHECK_JSON" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data:
        print(data[0].get('createdAt', ''))
except:
    print('')
" 2>/dev/null || echo "")

    if [ -n "$CREATED_AT" ]; then
        CHECK_AGE_HOURS=$(python3 -c "
from datetime import datetime, timezone
try:
    created = datetime.fromisoformat('$CREATED_AT'.replace('Z', '+00:00'))
    now = datetime.now(timezone.utc)
    hours = (now - created).total_seconds() / 3600
    print(int(hours))
except:
    print(0)
" 2>/dev/null || echo "0")

        if [ "$CHECK_AGE_HOURS" -ge 24 ]; then
            CHECK_PR_NUMBER=$(echo "$PR_CHECK_JSON" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data[0].get('number', ''))
except:
    print('')
" 2>/dev/null || echo "")
            CHECK_PR_URL=$(echo "$PR_CHECK_JSON" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data[0].get('url', ''))
except:
    print('')
" 2>/dev/null || echo "")
            CHECK_AGE_DAYS=$((CHECK_AGE_HOURS / 24))
            PR_DIFF_NAMES=$(timeout 10 gh pr diff "$CHECK_PR_NUMBER" --name-only) || {
                echo "✗ Failed to fetch release PR diff (gh CLI or GitHub API error)" >&2
                exit 1
            }
            PR_CHANGESET_COUNT=$(echo "$PR_DIFF_NAMES" | grep -cE '^\.changeset/.*\.md$' || echo "0")
            # Get the total diff size of the release PR
            PR_INSERTIONS=$(timeout 10 gh pr view "$CHECK_PR_NUMBER" --json additions -q '.additions') || PR_INSERTIONS="0"
            PR_DELETIONS=$(timeout 10 gh pr view "$CHECK_PR_NUMBER" --json deletions -q '.deletions') || PR_DELETIONS="0"
            PR_INSERTIONS=${PR_INSERTIONS:-0}
            PR_DELETIONS=${PR_DELETIONS:-0}
            PR_TOTAL_LINES=$((PR_INSERTIONS + PR_DELETIONS))
            # Build the detail string
            DETAIL=""
            if [ "$PR_CHANGESET_COUNT" -gt 0 ]; then
                DETAIL="${PR_CHANGESET_COUNT} changeset(s)"
            fi
            if [ "$PR_TOTAL_LINES" -gt 0 ]; then
                if [ -n "$DETAIL" ]; then
                    DETAIL="${DETAIL}, ~${PR_TOTAL_LINES} lines changed"
                else
                    DETAIL="~${PR_TOTAL_LINES} lines changed"
                fi
            fi
            if [ -n "$DETAIL" ]; then
                echo "WIP: Release PR #${CHECK_PR_NUMBER} has been open for ${CHECK_AGE_DAYS} day(s) with ${DETAIL}. ${CHECK_PR_URL}"
            else
                echo "WIP: Release PR #${CHECK_PR_NUMBER} has been open for ${CHECK_AGE_DAYS} day(s). ${CHECK_PR_URL}"
            fi
            echo "CLAUDE: Tell the user about this release PR and ask if they want to review and merge it now."
        fi
    fi
fi

# ── 2. Find the main-pipeline run ────────────────────────────────────────────
echo ""
printf 'Waiting for main-pipeline'
RUN_ID=""
for i in $(seq 1 30); do
  RUN_ID=$(gh run list \
    --workflow=main-pipeline.yml \
    --branch master \
    --limit 10 \
    --json databaseId,headSha \
    --jq ".[] | select(.headSha == \"$COMMIT_SHA\") | .databaseId" 2>/dev/null | head -1 || true)
  [ -n "$RUN_ID" ] && break
  printf '.'
  sleep 2
done
echo ""

[ -n "$RUN_ID" ] || { echo "✗ Could not find pipeline run for $COMMIT_SHA" >&2; exit 1; }
RUN_URL="https://github.com/$REPO/actions/runs/$RUN_ID"
echo "Pipeline: $RUN_URL"
echo ""

# ── 3. Watch main pipeline ────────────────────────────────────────────────────
if ! watch_run_resilient "$RUN_ID"; then
  echo ""
  echo "✗ Pipeline failed — $RUN_URL"
  show_failure_guidance "$RUN_ID" "$RUN_URL"
  exit 1
fi

# ── 4. Test deploy URL ────────────────────────────────────────────────────────
TEST_URL=$(netlify api listSiteDeploys --data "{\"site_id\": \"$SITE_ID\", \"per_page\": 20}" 2>/dev/null | \
  jq -r --arg t "main-$COMMIT_SHA" '.[] | select(.title == $t) | .deploy_url' | head -1 || true)
echo ""
[ -n "$TEST_URL" ] && [ "$TEST_URL" != "null" ] \
  && echo "✓ Test deploy:  $TEST_URL" \
  || echo "  (test deploy URL not found — check Netlify dashboard)"

# ── 5. Check for release PR ───────────────────────────────────────────────────
PR_JSON=$(gh pr list --base publish --state open --limit 1 --json number,url 2>/dev/null)
PR_NUMBER=$(echo "$PR_JSON" | jq -r '.[0].number // empty')
PR_URL=$(echo "$PR_JSON" | jq -r '.[0].url // empty')

if [ -z "$PR_NUMBER" ]; then
  CHANGESET_COUNT=$(find .changeset -name '*.md' ! -name 'README.md' 2>/dev/null | head -20 | wc -l | tr -d ' ' || true)
  echo ""
  if [ "$CHANGESET_COUNT" -eq 0 ]; then
    echo "No pending changesets. Run \`npx changeset\` to describe what's shipping."
  else
    echo "Changesets exist but no release PR yet. The changesets action will create one on the next pipeline run."
  fi
  echo ""
  echo "CLAUDE: Show the user the test deploy URL above so they can review it."
  exit 0
fi

echo "  Release PR:   $PR_URL"
echo ""

# ── 6. Find and watch release-pr-preview ─────────────────────────────────────
# Only wait if changeset files exist. If the release PR is from a previous
# changeset that was since removed, no preview pipeline will trigger.
CURRENT_CHANGESETS=$(find .changeset -name '*.md' ! -name 'README.md' 2>/dev/null | head -20 | wc -l | tr -d ' ' || true)
if [ "$CURRENT_CHANGESETS" -eq 0 ]; then
  echo "Release PR exists but no changeset files found. Skipping preview pipeline wait."
  echo ""
  echo "CLAUDE: Show the user the test deploy URL and release PR URL above. Note that no changesets exist, so the release PR may be stale."
  exit 0
fi

printf 'Waiting for release-pr-preview'
PREVIEW_RUN_ID=""
for i in $(seq 1 60); do
  PREVIEW_RUN_ID=$(gh run list \
    --workflow=release-pr-preview.yml \
    --limit 10 \
    --json databaseId,createdAt 2>/dev/null | \
    jq -r --arg since "$PUSH_TIME" \
    '[.[] | select(.createdAt > $since)] | sort_by(.createdAt) | reverse | .[0].databaseId // empty')
  [ -n "$PREVIEW_RUN_ID" ] && [ "$PREVIEW_RUN_ID" != "null" ] && break
  printf '.'
  sleep 3
done
echo ""

if [ -z "$PREVIEW_RUN_ID" ] || [ "$PREVIEW_RUN_ID" = "null" ]; then
  echo "✗ Could not find release-pr-preview run" >&2
  exit 1
fi

PREVIEW_RUN_URL="https://github.com/$REPO/actions/runs/$PREVIEW_RUN_ID"
echo "Preview pipeline: $PREVIEW_RUN_URL"
echo ""

if ! watch_run_resilient "$PREVIEW_RUN_ID"; then
  echo ""
  echo "✗ Preview pipeline failed — $PREVIEW_RUN_URL"
  show_failure_guidance "$PREVIEW_RUN_ID" "$PREVIEW_RUN_URL"
  exit 1
fi

# ── 7. Preview deploy URL ─────────────────────────────────────────────────────
PREVIEW_URL=$(netlify api listSiteDeploys --data "{\"site_id\": \"$SITE_ID\", \"per_page\": 20}" 2>/dev/null | \
  jq -r --arg t "release-pr-$PR_NUMBER" '.[] | select(.title == $t) | .deploy_url' | head -1 || true)

echo ""
[ -n "$PREVIEW_URL" ] && [ "$PREVIEW_URL" != "null" ] \
  && echo "✓ Release preview: $PREVIEW_URL" \
  || echo "  (preview URL not found — check PR comments)"
echo "  Release PR:      $PR_URL"
echo ""
echo "Review the preview, then merge the PR when satisfied."
echo "Run: npm run release:watch"
echo ""
echo "CLAUDE: Show the user the release preview URL and release PR URL above so they can review and merge."
