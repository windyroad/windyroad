#!/bin/bash
# PreToolUse hook: Blocks Edit/Write if content contains em-dashes.
# Use commas, periods, colons, or parentheses instead.

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
if echo "$CONTENT" | python3 -c "
import sys
text = sys.stdin.read()
emdash = chr(8212)
entity = chr(38) + 'mdash' + chr(59)
sys.exit(0 if (emdash in text or entity in text) else 1)
"; then
    REASON="BLOCKED: Content contains em-dashes (U+2014 or $(printf '&')mdash;). Rewrite the sentence to avoid em-dashes entirely -- use commas, periods, colons, or parentheses instead. Do NOT replace with double hyphens."
    printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"%s"}}' "$REASON"
    exit 0
fi

exit 0
