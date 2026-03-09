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

# ── 1. Pull + Push ───────────────────────────────────────────────────────────
STASHED=0
if ! git diff --quiet || ! git diff --cached --quiet; then
  git stash
  STASHED=1
fi
git pull --rebase
[ "$STASHED" = "1" ] && git stash pop
PUSH_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
git push "$@"
COMMIT_SHA=$(git rev-parse HEAD)
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)

# ── 1b. WIP checks on remote state (checks 3-4) ─────────────────────────────
# These run after push when remote refs are fresh. Results print to stdout.

# Check 3: Pushed but unreleased commits without changesets
UNRELEASED=$(git rev-list --count origin/publish..origin/master 2>/dev/null || echo "0")
if [ "$UNRELEASED" -gt 0 ]; then
    CHANGESET_COUNT=$(find .changeset -name '*.md' ! -name 'README.md' 2>/dev/null | head -20 | wc -l | tr -d ' ')
    if [ "$CHANGESET_COUNT" -eq 0 ]; then
        SHOULD_NUDGE=false
        AGE_DETAIL=""
        OLDEST_UNRELEASED=$(git log --format='%aI' --reverse origin/publish..origin/master 2>/dev/null | head -1)
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
            PR_DIFF_STAT=$(timeout 10 gh pr diff "$CHECK_PR_NUMBER" --stat | tail -1) || {
                echo "✗ Failed to fetch release PR stats (gh CLI or GitHub API error)" >&2
                exit 1
            }
            PR_INSERTIONS=$(echo "$PR_DIFF_STAT" | grep -oE '[0-9]+ insertion' | grep -oE '[0-9]+' || echo "0")
            PR_DELETIONS=$(echo "$PR_DIFF_STAT" | grep -oE '[0-9]+ deletion' | grep -oE '[0-9]+' || echo "0")
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
    --jq ".[] | select(.headSha == \"$COMMIT_SHA\") | .databaseId" 2>/dev/null | head -1)
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
if ! gh run watch "$RUN_ID" --exit-status; then
  echo ""
  echo "✗ Pipeline failed — $RUN_URL"
  show_failure_guidance "$RUN_ID" "$RUN_URL"
  exit 1
fi

# ── 4. Test deploy URL ────────────────────────────────────────────────────────
TEST_URL=$(netlify api listSiteDeploys --data "{\"site_id\": \"$SITE_ID\", \"per_page\": 20}" 2>/dev/null | \
  jq -r --arg t "main-$COMMIT_SHA" '.[] | select(.title == $t) | .deploy_url' | head -1)
echo ""
[ -n "$TEST_URL" ] && [ "$TEST_URL" != "null" ] \
  && echo "✓ Test deploy:  $TEST_URL" \
  || echo "  (test deploy URL not found — check Netlify dashboard)"

# ── 5. Check for release PR ───────────────────────────────────────────────────
PR_JSON=$(gh pr list --base publish --state open --limit 1 --json number,url 2>/dev/null)
PR_NUMBER=$(echo "$PR_JSON" | jq -r '.[0].number // empty')
PR_URL=$(echo "$PR_JSON" | jq -r '.[0].url // empty')

if [ -z "$PR_NUMBER" ]; then
  CHANGESET_COUNT=$(find .changeset -name '*.md' ! -name 'README.md' 2>/dev/null | head -20 | wc -l | tr -d ' ')
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

if ! gh run watch "$PREVIEW_RUN_ID" --exit-status; then
  echo ""
  echo "✗ Preview pipeline failed — $PREVIEW_RUN_URL"
  show_failure_guidance "$PREVIEW_RUN_ID" "$PREVIEW_RUN_URL"
  exit 1
fi

# ── 7. Preview deploy URL ─────────────────────────────────────────────────────
PREVIEW_URL=$(netlify api listSiteDeploys --data "{\"site_id\": \"$SITE_ID\", \"per_page\": 20}" 2>/dev/null | \
  jq -r --arg t "release-pr-$PR_NUMBER" '.[] | select(.title == $t) | .deploy_url' | head -1)

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
