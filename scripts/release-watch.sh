#!/bin/bash
# Usage: npm run release:watch
# Run after merging the release PR. Watches the publish-pipeline and
# reports the production URL when the deploy completes.

set -euo pipefail

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)

# ── 1. Find the publish-pipeline run ─────────────────────────────────────────
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
  echo "✗ No in-progress publish-pipeline found. Has the release PR been merged?" >&2
  exit 1
fi

echo "Publish pipeline: https://github.com/$REPO/actions/runs/$RUN_ID"
echo ""

# ── 2. Watch ──────────────────────────────────────────────────────────────────
if ! gh run watch "$RUN_ID" --exit-status; then
  echo ""
  echo "✗ Production deploy failed — https://github.com/$REPO/actions/runs/$RUN_ID"
  exit 1
fi

echo ""
echo "✓ Production live: https://windyroad.com.au"
