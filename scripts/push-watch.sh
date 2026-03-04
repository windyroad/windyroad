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
  echo ""
  echo "No pending changesets — nothing to release."
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
