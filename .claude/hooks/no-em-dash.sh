#!/bin/bash
# PreToolUse hook: Blocks Edit/Write if content contains em-dashes.
# Use regular dashes (--) or rewrite the sentence instead.

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

# Check for em-dash character or HTML entity
if echo "$CONTENT" | grep -qP '\x{2014}|&mdash;'; then
    cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "BLOCKED: Content contains em-dashes (U+2014 or &mdash;). Rewrite the sentence to avoid em-dashes entirely -- use commas, periods, colons, or parentheses instead. Do NOT replace with double hyphens."
  }
}
EOF
    exit 0
fi

exit 0
