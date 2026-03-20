#!/bin/bash
# Post-release hook: stamp and promote architecture decisions
#
# Pass 1 (stamp): Add first-released date to proposed decisions included in this release.
# Pass 2 (promote): Promote proposed decisions whose first-released date exceeds the
#                    promotion threshold to accepted status.
#
# Input modes:
#   With file list on stdin (normal post-release run): stamps only decisions in the release.
#   Empty stdin (manual/cold-start run): falls back to git log origin/publish for each
#     unstamped proposed decision, using the actual first-release date from git history.
#
# Environment:
#   RELEASE_DATE         - date of this release (YYYY-MM-DD), defaults to today
#   DECISION_PROMOTION_DAYS - days before auto-promotion (default: 14)

set -euo pipefail

RELEASE_DATE="${RELEASE_DATE:-$(date +%Y-%m-%d)}"
PROMOTION_DAYS="${DECISION_PROMOTION_DAYS:-14}"
DECISIONS_DIR="docs/decisions"

if [ ! -d "$DECISIONS_DIR" ]; then
  exit 0
fi

# Read file list from stdin (may be empty)
FILE_LIST=""
if [ ! -t 0 ]; then
  FILE_LIST=$(cat)
fi

# Portable date math: compute epoch seconds from YYYY-MM-DD
date_to_epoch() {
  local d="$1"
  # Try GNU date first, then macOS date
  date -d "$d" +%s 2>/dev/null || date -j -f "%Y-%m-%d" "$d" +%s 2>/dev/null || echo 0
}

# Check if a file contains a frontmatter field
has_field() {
  local file="$1"
  local field="$2"
  grep -q "^${field}:" "$file" 2>/dev/null
}

# ── Pass 1: Stamp first-released on unstamped proposed decisions ──────────────

for file in "$DECISIONS_DIR"/*.proposed.md; do
  [ -f "$file" ] || continue
  [ "$(basename "$file")" = "README.md" ] && continue

  # Skip if already stamped
  if has_field "$file" "first-released"; then
    continue
  fi

  STAMP_DATE=""

  if [ -n "$FILE_LIST" ]; then
    # Normal mode: stamp only if this file is in the release
    if echo "$FILE_LIST" | grep -qF "$file"; then
      STAMP_DATE="$RELEASE_DATE"
    fi
  else
    # Cold-start mode: check git history on origin/publish
    GIT_DATE=$(git log --format=%ai origin/publish -- "$file" 2>/dev/null | tail -1 | cut -d' ' -f1)
    if [ -n "$GIT_DATE" ]; then
      STAMP_DATE="$GIT_DATE"
    fi
  fi

  if [ -n "$STAMP_DATE" ]; then
    # Insert first-released after the status line in frontmatter (handles quoted and unquoted)
    sed "s/^status: *\"*proposed\"*/status: \"proposed\"\nfirst-released: $STAMP_DATE/" "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    echo "Stamped first-released: $STAMP_DATE on $(basename "$file")"
  fi
done

# ── Pass 2: Promote decisions past the threshold ──────────────────────────────

NOW_EPOCH=$(date_to_epoch "$RELEASE_DATE")

for file in "$DECISIONS_DIR"/*.proposed.md; do
  [ -f "$file" ] || continue
  [ "$(basename "$file")" = "README.md" ] && continue

  # Only promote if stamped
  if ! has_field "$file" "first-released"; then
    continue
  fi

  FIRST_RELEASED=$(grep "^first-released:" "$file" | head -1 | awk '{print $2}')
  if [ -z "$FIRST_RELEASED" ]; then
    continue
  fi

  RELEASED_EPOCH=$(date_to_epoch "$FIRST_RELEASED")
  if [ "$RELEASED_EPOCH" -eq 0 ]; then
    continue
  fi

  AGE_DAYS=$(( (NOW_EPOCH - RELEASED_EPOCH) / 86400 ))

  if [ "$AGE_DAYS" -ge "$PROMOTION_DAYS" ]; then
    # Update status to accepted (handles quoted and unquoted)
    sed "s/^status: *\"*proposed\"*/status: \"accepted\"/" "$file" > "$file.tmp" && mv "$file.tmp" "$file"

    # Add accepted-date after first-released
    sed "s/^first-released: .*/&\naccepted-date: $RELEASE_DATE/" "$file" > "$file.tmp" && mv "$file.tmp" "$file"

    # Rename file from proposed to accepted
    NEW_FILE=$(echo "$file" | sed 's/\.proposed\.md$/.accepted.md/')
    git mv "$file" "$NEW_FILE"
    echo "Promoted $(basename "$file") to accepted (age: ${AGE_DAYS} days)"
  fi
done

# Stage any changes in the decisions directory
git add -A "$DECISIONS_DIR/"

exit 0
