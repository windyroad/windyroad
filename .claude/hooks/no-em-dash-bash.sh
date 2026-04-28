#!/bin/bash
# PostToolUse:Bash hook. Catches em-dashes (U+2014) introduced by Bash-path
# file writes (heredoc, `python -c`, `sed -i`, `cat > file`, etc.) that
# bypass the PreToolUse:Edit|Write em-dash check.
#
# Closes P025 (no-em-dash.sh has zero coverage of Bash-path file writes).
#
# This script must contain ZERO literal U+2014 characters. Search bytes
# are constructed at runtime via printf so this file does not trigger
# the sibling PreToolUse hook when written or edited.

set -euo pipefail

# Drain stdin (PostToolUse JSON payload). We do not need its contents:
# we scan the working tree directly because the Bash tool can write to
# files via many shapes (heredoc, redirect, in-place sed, python -c, etc.)
# and parsing the command line is brittle compared to a file-content scan.
cat >/dev/null

# Only run inside a git working tree.
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    exit 0
fi

# U+2014 in UTF-8 is the byte sequence E2 80 94.
EMDASH=$(printf '\xe2\x80\x94')

# Whitelist: contractual marker line appended by the upstream
# `wr-itil:work-problems` SKILL when an iteration parks a ticket with the
# `upstream-blocked` reason. The marker wording is fixed by upstream
# SKILL.md and contains a literal em-dash. A follow-up problem ticket
# tracks amending the upstream marker wording so this whitelist can be
# removed.
WHITELIST_LINE="- **Upstream report pending** ${EMDASH} external dependency identified"

OFFENDERS=()
while IFS= read -r status_line; do
    [ -z "$status_line" ] && continue
    # `git status --porcelain` format: "XY filename" (XY is two-char status,
    # then a single space, then the path). Strip the first three chars.
    file="${status_line:3}"
    # Handle renamed entries: "R  old -> new". Take the new path.
    if [[ "$file" == *" -> "* ]]; then
        file="${file##* -> }"
    fi
    [ -z "$file" ] && continue
    [ ! -f "$file" ] && continue

    if git ls-files --error-unmatch -- "$file" >/dev/null 2>&1; then
        # Tracked file: check added lines (working-tree vs HEAD) for em-dashes,
        # excluding the whitelisted marker line.
        added=$(git diff --no-color HEAD -- "$file" 2>/dev/null \
            | grep -E '^\+[^+]' \
            | grep -v -F -e "$WHITELIST_LINE" || true)
        if [ -n "$added" ] && printf '%s' "$added" | grep -q -F -e "$EMDASH"; then
            OFFENDERS+=("$file")
        fi
    else
        # Untracked file: full content scan, excluding the whitelisted line.
        if grep -v -F -e "$WHITELIST_LINE" "$file" 2>/dev/null \
            | grep -q -F -e "$EMDASH"; then
            OFFENDERS+=("$file")
        fi
    fi
done < <(git status --porcelain 2>/dev/null)

if [ ${#OFFENDERS[@]} -gt 0 ]; then
    JOINED=""
    for f in "${OFFENDERS[@]}"; do
        if [ -z "$JOINED" ]; then
            JOINED="$f"
        else
            JOINED="${JOINED}, ${f}"
        fi
    done
    REASON="BLOCKED: Em-dashes (U+2014) detected in files modified by Bash. Files: ${JOINED}. Rewrite the affected sentences to avoid em-dashes entirely. Use commas, periods, colons, or parentheses instead. Do NOT replace with double hyphens. (PostToolUse:Bash em-dash scan, closes P025.)"
    ESCAPED=$(printf '%s' "$REASON" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read())[1:-1])')
    printf '{"decision":"block","reason":"%s"}' "$ESCAPED"
    exit 0
fi

exit 0
