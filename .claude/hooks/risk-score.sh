#!/bin/bash
# UserPromptSubmit hook: Delegates risk scoring to the risk-scorer agent.
# Collects diff summary, injects instruction to call risk-scorer agent.
# If a previous score >= 5 exists, adds a nudge to reduce changes.

set -euo pipefail

INPUT=$(cat)

SESSION_ID=$(echo "$INPUT" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(data.get('session_id', ''))
" 2>/dev/null || echo "")

SCORE_FILE="/tmp/risk-score-value-${SESSION_ID}"
CLEAN_FILE="/tmp/risk-score-clean-${SESSION_ID}"

# --- Noise filter: lockfiles, binary assets, OS junk ---
NOISE='(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb|Gemfile\.lock|Pipfile\.lock|poetry\.lock|composer\.lock|Cargo\.lock|go\.sum|shrinkwrap\.json|\.DS_Store|node_modules|\.png$|\.svg$|\.jpg$|\.jpeg$|\.gif$|\.ico$|\.woff2?$|\.ttf$|\.eot$)'

# --- Collect tracked changes (staged + unstaged vs HEAD) ---
DIFF_STAT=$(git diff HEAD --stat -- . ':(exclude)package-lock.json' ':(exclude)yarn.lock' ':(exclude)pnpm-lock.yaml' ':(exclude)bun.lockb' ':(exclude)Gemfile.lock' ':(exclude)Pipfile.lock' ':(exclude)poetry.lock' ':(exclude)composer.lock' ':(exclude)Cargo.lock' ':(exclude)go.sum' ':(exclude)shrinkwrap.json' 2>/dev/null || echo "")
DIFF_NAMES=$(git diff HEAD --name-only 2>/dev/null | grep -vE "$NOISE" || echo "")

# --- Collect untracked files ---
UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null | grep -vE "$NOISE" || true)

# --- Clean tree? Write marker and exit silently ---
if [ -z "$DIFF_NAMES" ] && [ -z "$UNTRACKED" ]; then
    if [ -n "$SESSION_ID" ]; then
        printf '1' > "$CLEAN_FILE"
        rm -f "$SCORE_FILE"
    fi
    exit 0
fi

# Dirty tree: remove clean marker if it exists
rm -f "$CLEAN_FILE"

# --- Build the change summary ---
SUMMARY=""

if [ -n "$DIFF_STAT" ]; then
    SUMMARY="${SUMMARY}Tracked changes (git diff HEAD --stat):\n${DIFF_STAT}\n\n"
fi

if [ -n "$UNTRACKED" ]; then
    UNTRACKED_COUNT=$(echo "$UNTRACKED" | wc -l | tr -d ' ')
    SUMMARY="${SUMMARY}Untracked files (${UNTRACKED_COUNT}):\n${UNTRACKED}\n\n"
fi

# --- Categorise changed files ---
ALL_FILES=""
if [ -n "$DIFF_NAMES" ]; then
    ALL_FILES="$DIFF_NAMES"
fi
if [ -n "$UNTRACKED" ]; then
    if [ -n "$ALL_FILES" ]; then
        ALL_FILES="${ALL_FILES}\n${UNTRACKED}"
    else
        ALL_FILES="$UNTRACKED"
    fi
fi

CATEGORIES=$(echo -e "$ALL_FILES" | python3 -c "
import sys
cats = {
    'hooks': [], 'config': [], 'ci': [], 'ui': [], 'styles': [],
    'content': [], 'generated': [], 'skills': [], 'docs': [],
    'tests': [], 'lib': [], 'agents': [], 'other': []
}
for line in sys.stdin:
    f = line.strip()
    if not f:
        continue
    if '.claude/hooks/' in f:
        cats['hooks'].append(f)
    elif '.claude/agents/' in f:
        cats['agents'].append(f)
    elif '.claude/skills/' in f:
        cats['skills'].append(f)
    elif '.claude/' in f or f.endswith(('.json', '.toml', '.yml', '.yaml', '.mjs', '.cjs')) and '/' not in f:
        cats['config'].append(f)
    elif '.github/' in f:
        cats['ci'].append(f)
    elif f.endswith(('.tsx', '.jsx', '.html', '.vue', '.svelte')):
        cats['ui'].append(f)
    elif f.endswith(('.scss', '.css', '.less')):
        cats['styles'].append(f)
    elif f.endswith(('.md', '.mdx')):
        if 'generated' in f or 'architecture' in f:
            cats['generated'].append(f)
        elif 'articles/' in f or 'content/' in f or 'posts/' in f:
            cats['content'].append(f)
        else:
            cats['docs'].append(f)
    elif 'generated/' in f:
        cats['generated'].append(f)
    elif f.endswith(('.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx')):
        cats['tests'].append(f)
    elif f.endswith(('.ts', '.js')):
        cats['lib'].append(f)
    else:
        cats['other'].append(f)
out = []
for cat, files in cats.items():
    if files:
        out.append(f'  {cat}: {len(files)} file(s)')
if out:
    print('\n'.join(out))
" 2>/dev/null || echo "  (could not categorise)")

SUMMARY="${SUMMARY}Categories:\n${CATEGORIES}"

# --- Check for existing high score (nudge) ---
NUDGE=""
if [ -f "$SCORE_FILE" ]; then
    PREV_SCORE=$(cat "$SCORE_FILE" 2>/dev/null || echo "")
    IS_HIGH=$(python3 -c "
try:
    print('yes' if float('$PREV_SCORE') >= 5 else 'no')
except:
    print('no')
" 2>/dev/null || echo "no")
    if [ "$IS_HIGH" = "yes" ]; then
        NUDGE="WARNING: Previous risk score was ${PREV_SCORE}/25. Reduce uncommitted changes (git stash, git checkout, revert) before committing. Edits are allowed -- use them to bring the score down. Then re-run risk-scorer.\n\n"
    fi
fi

# --- Build the instruction ---
INSTRUCTION="${NUDGE}RISK SCORE CHECK (mandatory, every prompt).

You MUST call the risk-scorer agent (subagent_type: \"risk-scorer\") with this prompt:

Give this a risk score out of 25.

${SUMMARY}

Write your score to: ${SCORE_FILE}
Command: printf '%s' N > ${SCORE_FILE}

After the agent returns, report the score in your response: \"Risk score: N/25 (Label)\"."

# --- Output as additionalContext ---
ESCAPED=$(echo -e "$INSTRUCTION" | python3 -c "
import sys, json
text = sys.stdin.read().strip()
print(json.dumps(text))
" 2>/dev/null || echo '""')

cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": $ESCAPED
  }
}
EOF
