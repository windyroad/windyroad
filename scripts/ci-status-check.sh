#!/bin/bash
# Usage: bash scripts/ci-status-check.sh <branch>
#
# Defence-in-depth CI-status check for npm run push:watch and
# npm run release:watch. Blocks the wrapper when the most recent CI
# run on <branch> has conclusion=failure, with a single-shot
# acknowledged-override marker.
#
# See docs/decisions/028-ci-status-check-in-push-and-release-watch.proposed.md
# and docs/problems/012-no-ship-gate-on-push-publish-deploy.known-error.md.
#
# Exit codes:
#   0  proceed (CI green, in-progress, cancelled, no runs, marker present, gh failed non-fatally)
#   1  block   (CI conclusion is definitively "failure")

set -euo pipefail

BRANCH="${1:-}"
if [ -z "$BRANCH" ]; then
  echo "✗ ci-status-check.sh: branch argument required" >&2
  echo "  Usage: bash scripts/ci-status-check.sh <branch>" >&2
  exit 1
fi

SESSION_ID="${CLAUDE_SESSION_ID:-no-session}"
RDIR="/tmp/wr-push-watch-${SESSION_ID}"
MARKER="${RDIR}/red-ci-acknowledged"

if [ -f "$MARKER" ]; then
  rm -f "$MARKER"
  echo "  CI-status check bypassed (red-ci-acknowledged marker consumed)."
  exit 0
fi

# Single-row response, non-fatal on gh failure.
LATEST_CI_CONCLUSION=$(gh run list --branch "$BRANCH" --limit 1 --json conclusion --jq '.[0].conclusion // ""' 2>/dev/null || echo "")

if [ "$LATEST_CI_CONCLUSION" = "failure" ]; then
  echo ""
  echo "✗ Blocked: most recent CI run on \"$BRANCH\" is FAILED."
  echo ""
  echo "  Fix the failure first (recommended), or acknowledge to override:"
  echo "    mkdir -p $RDIR && touch $MARKER"
  echo ""
  echo "  Then re-run the same npm script. The marker is single-shot and"
  echo "  is deleted on use."
  exit 1
fi

# Anything else (success, in_progress, cancelled, empty, gh transient) proceeds.
exit 0
