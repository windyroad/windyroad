#!/bin/bash
# UserPromptSubmit hook: Checks project health and injects reminders.
# Mitigates WR-R1 (Dependency staleness) and WR-R3 (CI pipeline absent).

set -euo pipefail

REMINDERS=""

# Check WR-R3: No GitHub Actions workflows
if [ ! -d ".github/workflows" ] || [ -z "$(ls -A .github/workflows 2>/dev/null)" ]; then
    REMINDERS="${REMINDERS}WR-R3 REMINDER: No GitHub Actions workflows exist in this repo. The CI pipeline needs to be set up. See RISK_REGISTER.md.\n"
fi

# Check WR-R1: Detect npm install/add commands in user prompt to remind about audit
INPUT=$(cat)
USER_PROMPT=$(echo "$INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('prompt', ''))
except:
    print('')
" 2>/dev/null || echo "")

if echo "$USER_PROMPT" | grep -qEi 'npm (install|add|i )|yarn add|pnpm add|upgrade|update dep|add dep'; then
    REMINDERS="${REMINDERS}WR-R1 REMINDER: When adding or updating dependencies, use \`npx dry-aged-deps\` (not just \`npm audit\`) to check both age and security. dry-aged-deps enforces a maturity gate so you only upgrade to releases that have had time to stabilise. Gatsby v2 and Node 10 are end-of-life — see RISK_REGISTER.md.\n"
fi

# Output reminders if any
if [ -n "$REMINDERS" ]; then
    # Escape for JSON
    ESCAPED=$(echo -e "$REMINDERS" | python3 -c "
import sys, json
text = sys.stdin.read().strip()
print(json.dumps(text))
" 2>/dev/null || echo '""')

    cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "systemReminder": $ESCAPED
  }
}
EOF
    exit 0
fi

# No reminders needed
exit 0
