#!/bin/bash
# Usage: npm run push:watch
# Pushes to master, watches the main pipeline, and surfaces deploy URLs.
# If there are pending changesets, also watches the release-pr-preview and
# provides the preview URL and release PR link for human review.
# On failure: shows which checks failed and prompts for a local hook fix.

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
if ! npx dry-aged-deps --update --yes; then
  echo "  (dry-aged-deps auto-update non-fatal; pre-push gate will fire if state is still stale)"
fi
if ! git diff --quiet -- package.json package-lock.json; then
  echo "Auto-deps refresh changed root manifests; committing as chore(deps)."
  git add package.json package-lock.json
  git commit -m "chore(deps): refresh stale dependencies (P026)"
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
