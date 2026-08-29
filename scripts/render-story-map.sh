#!/usr/bin/env bash
# Render a story map, then strip U+2014 from the map and the shared stylesheet.
#
# The upstream renderer emits em-dashes at two sites this repository's
# no-em-dash hooks block, and both come back on every render:
#   - the orientation lead ("Draft <emdash> not yet agreed."), hard-coded in
#     render-story-map.mjs renderOrient with no island override;
#   - 16 occurrences across 13 comment blocks in templates/story-map.css, which
#     ensureSharedAssets rewrites from the upstream template whenever the
#     vendored copy differs.
# Two further renderer sites are conditional and dormant on the current corpus:
# rowLabel's untraced default, and the fallback caption used when an island
# authors no caption key. Both are recorded on P180.
# Scrubbing by hand is therefore reverted by construction. The posture taken
# here is borrowed from P087, which records the same defect in the decisions
# compendium generator; P087 is scoped to that generator and does not record
# this wrapper. The root cause is upstream either way. The standing posture of
# correcting generated output rather than widening the hook is recorded in
# ADR-032 and ADR-044 criterion 12. This wrapper's own upstream report is P180.
#
# THIS IS THE ONLY SAFE WAY TO RENDER A MAP HERE. Every other path, including
# wr-itil-story-map-edit (which re-renders after every operation and rewrites
# the vendored CSS), reintroduces both em-dash sites. Nothing enforces that.
#
# Usage: scripts/render-story-map.sh docs/story-maps/<state>/STORY-MAP-NNN-*.html
set -euo pipefail
# The line-final rule runs FIRST and drops the dash outright. Without it the
# general rule turns a comment ending in an em-dash into one ending in " ,".
# It matches HORIZONTAL whitespace only: \s* would consume the trailing newline
# and splice the next line onto this one, which is a worse corruption than the
# one it fixes. Covered by scripts/render-story-map.test.mjs.
scrub() { perl -i -CSD -pe 's/[ \t]*\x{2014}[ \t]*$//; s/ \x{2014} /, /g; s/\x{2014}/,/g' "$@"; }

for f in "$@"; do
  wr-itil-render-story-map "$f"
  scrub "$f"
  # Rendering regenerates the vendored stylesheet from the upstream template,
  # so it is scrubbed too. Guarded on existence rather than on the unset test
  # the variable can never fail: a missing file would abort under set -e.
  css="$(dirname "$(dirname "$f")")/story-map.css"
  if [ -f "$css" ]; then scrub "$css"; fi
done
