#!/bin/bash
# PreToolUse hook: Blocks Edit/Write if content contains em-dashes.
# Use commas, periods, colons, or parentheses instead.
#
# This script must contain ZERO literal U+2014 characters. Search and
# whitelist strings are constructed at runtime via chr(8212) so this
# file does not trigger itself when edited.

set -euo pipefail

INPUT=$(cat)

# Extract the content being written
CONTENT=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    tool_input = data.get('tool_input', {})
    text = tool_input.get('new_string', '') + tool_input.get('content', '')
    print(text)
except:
    print('')
" 2>/dev/null || echo "")

if [ -z "$CONTENT" ]; then
    exit 0
fi

# Check for em-dash: literal UTF-8 character (U+2014) or HTML entity
# Use python3 because macOS grep lacks -P (Perl regex) support
# Build both search strings via chr()/join to avoid triggering this hook on itself
#
# Whitelist: contractual marker lines authored by upstream wr-itil skills
# (P063 upstream-pending marker, capture-problem deferred-placeholder
# Priority + Effort lines). These carry literal em-dashes by upstream
# SKILL.md contract; the hook must let them pass. Sibling hook
# no-em-dash-bash.sh carries the matching whitelist.
if echo "$CONTENT" | python3 -c "
import sys
text = sys.stdin.read()
emdash = chr(8212)
entity = chr(38) + 'mdash' + chr(59)
whitelist = [
    '- **Upstream report pending** ' + emdash + ' external dependency identified',
    '**Priority**: 3 (Medium) ' + emdash + ' Impact: 3 x Likelihood: 1 (deferred ' + emdash + ' re-rate at next /wr-itil:review-problems)',
    '**Effort**: M (deferred ' + emdash + ' re-rate at next /wr-itil:review-problems)',
]
filtered = '\n'.join(line for line in text.split('\n') if not any(w in line for w in whitelist))
sys.exit(0 if (emdash in filtered or entity in filtered) else 1)
"; then
    REASON="BLOCKED: Content contains em-dashes (U+2014 or $(printf '&')mdash;). Rewrite the sentence to avoid em-dashes entirely -- use commas, periods, colons, or parentheses instead. Do NOT replace with double hyphens."
    printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"%s"}}' "$REASON"
    exit 0
fi

exit 0
