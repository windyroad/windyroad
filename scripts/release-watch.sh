#!/bin/bash
# Usage: npm run release:watch
# Merges the open release PR, watches the publish-pipeline, and surfaces
# the production URL when live. On failure: shows what failed and prompts
# for a fix.

set -euo pipefail

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)

# ── Helper: show failed jobs and guidance ─────────────────────────────────────
show_failure_guidance() {
  local run_id="$1"
  local run_url="$2"

  echo ""
  echo "Failed checks:"
  gh run view "$run_id" --json jobs \
    --jq '.jobs[] | select(.conclusion == "failure") | "  ✗ \(.name)"' 2>/dev/null || true

  echo ""
  echo "Fix the failure above, then re-run: npm run release:watch"
  echo ""
  echo "CLAUDE: The publish pipeline failed. Show the user which checks failed above,"
  echo "help them fix the issue, then run \`npm run release:watch\` again."
}

# ── 1. Find and merge the open release PR ────────────────────────────────────
PR_JSON=$(gh pr list --base publish --state open --limit 1 --json number,url 2>/dev/null)
PR_NUMBER=$(echo "$PR_JSON" | jq -r '.[0].number // empty')
PR_URL=$(echo "$PR_JSON" | jq -r '.[0].url // empty')

if [ -z "$PR_NUMBER" ]; then
  echo "✗ No open release PR found. Has it already been merged?" >&2
  exit 1
fi

echo "Merging release PR: $PR_URL"
gh pr merge "$PR_NUMBER" --squash
echo ""

# ── 2. Find the publish-pipeline run ─────────────────────────────────────────
printf 'Waiting for publish-pipeline'
RUN_ID=""
for i in $(seq 1 40); do
  RUN_ID=$(gh run list \
    --workflow=publish-pipeline.yml \
    --branch publish \
    --limit 5 \
    --json databaseId,status,createdAt \
    --jq '[.[] | select(.status != "completed")] | sort_by(.createdAt) | reverse | .[0].databaseId' 2>/dev/null)
  [ -n "$RUN_ID" ] && [ "$RUN_ID" != "null" ] && break
  printf '.'
  sleep 3
done
echo ""

if [ -z "$RUN_ID" ] || [ "$RUN_ID" = "null" ]; then
  echo "✗ No in-progress publish-pipeline found." >&2
  exit 1
fi

RUN_URL="https://github.com/$REPO/actions/runs/$RUN_ID"
echo "Publish pipeline: $RUN_URL"
echo ""

# ── 3. Watch ──────────────────────────────────────────────────────────────────
if ! gh run watch "$RUN_ID" --exit-status; then
  echo ""
  echo "✗ Production deploy failed — $RUN_URL"
  show_failure_guidance "$RUN_ID" "$RUN_URL"
  exit 1
fi

echo ""
echo "✓ Production live: https://windyroad.com.au"

# ── 4. Sync version bump back to master ──────────────────────────────────────
echo ""
echo "Syncing version bump back to master..."
git fetch origin publish
git checkout master
# Checkout just the version/changelog files from publish — avoids merge conflicts
git checkout origin/publish -- package.json CHANGELOG.md
# Delete any consumed changeset files (they were deleted on the release branch)
git ls-files .changeset/ | grep -v 'README.md\|config.json' | xargs --no-run-if-empty git rm -f
VERSION=$(node -p "require('./package.json').version")
git commit -m "chore: sync version $VERSION from publish to master"
npm run push:watch

echo ""
echo "CLAUDE: The release is live. Let the user know and share the URL: https://windyroad.com.au"
