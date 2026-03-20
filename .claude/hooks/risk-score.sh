#!/bin/bash
# UserPromptSubmit hook: Delegates risk scoring to the risk-scorer agent.
# Gathers full pipeline state via lib/pipeline-state.sh, injects instruction
# to call risk-scorer agent for commit + push scoring.
# Absorbs WIP nudge warnings (stale files, unpushed count).

set -euo pipefail

INPUT=$(cat)

SESSION_ID=$(echo "$INPUT" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(data.get('session_id', ''))
" 2>/dev/null || echo "")

COMMIT_SCORE_FILE="/tmp/risk-commit-${SESSION_ID}"
PUSH_SCORE_FILE="/tmp/risk-push-${SESSION_ID}"
CLEAN_FILE="/tmp/risk-clean-${SESSION_ID}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# --- Gather full pipeline state ---
PIPELINE_STATE=$("$SCRIPT_DIR/lib/pipeline-state.sh" --all 2>/dev/null || echo "(pipeline state unavailable)")

# --- Clean tree? Write marker and exit silently ---
if echo "$PIPELINE_STATE" | grep -q "No uncommitted changes."; then
    # Check if also no unpushed changes (fully clean)
    if [ -n "$SESSION_ID" ]; then
        printf '1' > "$CLEAN_FILE"
        rm -f "$COMMIT_SCORE_FILE"
    fi
    # Even if tree is clean, if there are unpushed changes we still need push scoring
    if echo "$PIPELINE_STATE" | grep -q "No unpushed commits."; then
        rm -f "$PUSH_SCORE_FILE"
        exit 0
    fi
fi

# Dirty tree: remove clean marker if it exists
if ! echo "$PIPELINE_STATE" | grep -q "No uncommitted changes."; then
    rm -f "$CLEAN_FILE"
fi

# --- Build WIP warnings (absorbed from wip-nudge.sh) ---
WARNINGS=""

# Stale files warning
if echo "$PIPELINE_STATE" | grep -q "uncommitted for over 24h"; then
    STALE_LINE=$(echo "$PIPELINE_STATE" | grep "uncommitted for over 24h" | head -1)
    WARNINGS="${WARNINGS}WIP: ${STALE_LINE}\n"
fi

# Unpushed commits warning
UNPUSHED_COUNT=$(echo "$PIPELINE_STATE" | grep -oP 'Unpushed commits \(\K[0-9]+' || echo "0")
if [ "$UNPUSHED_COUNT" -ge 3 ]; then
    WARNINGS="${WARNINGS}WIP: ${UNPUSHED_COUNT} unpushed commits on master. Consider running \`npm run push:watch\`.\n"
fi

# --- Check for existing high scores (nudge) ---
NUDGE=""
if [ -f "$COMMIT_SCORE_FILE" ]; then
    PREV_COMMIT=$(cat "$COMMIT_SCORE_FILE" 2>/dev/null || echo "")
    IS_HIGH=$(python3 -c "
try:
    print('yes' if float('$PREV_COMMIT') >= 5 else 'no')
except:
    print('no')
" 2>/dev/null || echo "no")
    if [ "$IS_HIGH" = "yes" ]; then
        NUDGE="${NUDGE}WARNING: Previous commit risk rating was ${PREV_COMMIT}/25. Reduce uncommitted changes before committing.\n"
    fi
fi

if [ -f "$PUSH_SCORE_FILE" ]; then
    PREV_PUSH=$(cat "$PUSH_SCORE_FILE" 2>/dev/null || echo "")
    IS_HIGH=$(python3 -c "
try:
    print('yes' if float('$PREV_PUSH') >= 5 else 'no')
except:
    print('no')
" 2>/dev/null || echo "no")
    if [ "$IS_HIGH" = "yes" ]; then
        NUDGE="${NUDGE}WARNING: Previous push risk rating was ${PREV_PUSH}/25. Consider pushing or reducing unpushed changes before continuing.\n"
    fi
fi

# --- Determine which actions to score ---
HAS_UNCOMMITTED=true
HAS_UNPUSHED=true
if echo "$PIPELINE_STATE" | grep -q "No uncommitted changes."; then
    HAS_UNCOMMITTED=false
fi
if echo "$PIPELINE_STATE" | grep -q "No unpushed commits."; then
    HAS_UNPUSHED=false
fi

SCORE_INSTRUCTIONS=""
if [ "$HAS_UNCOMMITTED" = true ]; then
    SCORE_INSTRUCTIONS="Score COMMIT risk. Write commit residual risk rating to: ${COMMIT_SCORE_FILE}
Command: printf '%s' N > ${COMMIT_SCORE_FILE}"
fi

if [ "$HAS_UNPUSHED" = true ] || [ "$HAS_UNCOMMITTED" = true ]; then
    SCORE_INSTRUCTIONS="${SCORE_INSTRUCTIONS}

Score PUSH risk (the accumulated unpushed changes, including any uncommitted work that would be committed). Write push residual risk rating to: ${PUSH_SCORE_FILE}
Command: printf '%s' N > ${PUSH_SCORE_FILE}"
fi

# --- Build the instruction ---
INSTRUCTION="${WARNINGS}${NUDGE}RISK SCORE CHECK (mandatory, every prompt).

You MUST call the risk-scorer agent (subagent_type: \"risk-scorer\") with this prompt:

Produce risk reports for the following pipeline state.

${PIPELINE_STATE}

${SCORE_INSTRUCTIONS}

After the agent returns, include the full risk reports in your response."

# --- Output ---
ESCAPED=$(echo -e "$INSTRUCTION" | python3 -c "
import sys, json
text = sys.stdin.read().strip()
print(json.dumps(text))
" 2>/dev/null || echo '""')

# Include WIP warnings as systemMessage if present
if [ -n "$WARNINGS" ]; then
    SYSTEM_MSG=$(echo -e "$WARNINGS" | python3 -c "
import sys, json
text = sys.stdin.read().strip()
print(json.dumps(text))
" 2>/dev/null || echo '""')
    cat <<EOF
{
  "systemMessage": $SYSTEM_MSG,
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": $ESCAPED
  }
}
EOF
else
    cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": $ESCAPED
  }
}
EOF
fi
