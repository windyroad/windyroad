#!/bin/bash
# Usage: scripts/publish-devto.sh <article-slug>
# Example: scripts/publish-devto.sh enforcing-voice-and-tone-with-claude-code-hooks
#
# Reads src/social/<slug>/devto.md, extracts front matter, and creates/updates
# a Dev.to article via the API. Articles are created as drafts unless the front
# matter has published: true.
#
# Requires DEV_TO_API_KEY in .env

set -euo pipefail

SLUG="${1:?Usage: scripts/publish-devto.sh <article-slug>}"
DEVTO_FILE="src/social/${SLUG}/devto.md"

if [ ! -f "$DEVTO_FILE" ]; then
  echo "Error: $DEVTO_FILE not found" >&2
  exit 1
fi

# Load DEV_TO_API_KEY from .env (python3 script to handle 1Password-mounted files)
if [ -z "${DEV_TO_API_KEY:-}" ] && [ -e .env ]; then
  _PY_SCRIPT=$(mktemp)
  cat > "$_PY_SCRIPT" << 'PYEOF'
with open(".env") as f:
    for line in f:
        line = line.strip()
        if line.startswith("DEV_TO_API_KEY="):
            print(line.split("=", 1)[1].strip().strip("'\""))
            break
PYEOF
  DEV_TO_API_KEY=$(python3 "$_PY_SCRIPT" || true)
  rm -f "$_PY_SCRIPT"
  export DEV_TO_API_KEY
fi

if [ -z "${DEV_TO_API_KEY:-}" ]; then
  echo "Error: DEV_TO_API_KEY not set. Add it to .env or export it." >&2
  exit 1
fi

# Parse front matter and build API payload
ARTICLE_JSON=$(python3 -c "
import sys, json, re
from urllib.parse import urlparse

with open('$DEVTO_FILE') as f:
    content = f.read()

match = re.match(r'^---\n(.*?)\n---\n(.*)', content, re.DOTALL)
if not match:
    print(json.dumps({'error': 'No front matter found'}))
    sys.exit(1)

fm_text = match.group(1)
body = match.group(2).strip()

# Simple YAML parsing (no PyYAML dependency)
fm = {}
for line in fm_text.split('\n'):
    if ':' not in line:
        continue
    key, val = line.split(':', 1)
    key = key.strip()
    val = val.strip()
    if val.startswith('\"') and val.endswith('\"'):
        val = val[1:-1]
    elif val.startswith(\"'\") and val.endswith(\"'\"):
        val = val[1:-1]
    if val.startswith('[') and val.endswith(']'):
        val = [v.strip().strip('\"').strip(\"'\") for v in val[1:-1].split(',')]
    fm[key] = val

article = {
    'title': fm.get('title', ''),
    'body_markdown': body,
    'canonical_url': fm.get('canonical_url', ''),
    'published': fm.get('published', 'false') == 'true',
}

tags = fm.get('tags', [])
if isinstance(tags, list):
    article['tags'] = tags[:4]

cover = fm.get('cover_image', '')
if cover:
    if cover.startswith('http'):
        article['main_image'] = cover
    else:
        canonical = fm.get('canonical_url', '')
        if canonical:
            parsed = urlparse(canonical)
            base = f'{parsed.scheme}://{parsed.netloc}'
            article['main_image'] = f'{base}/img/social/{cover}'

print(json.dumps({'article': article}))
")

# Check for parse errors
ERROR=$(echo "$ARTICLE_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error',''))" 2>/dev/null)
if [ -n "$ERROR" ]; then
  echo "Error: $ERROR" >&2
  exit 1
fi

TITLE=$(echo "$ARTICLE_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['article']['title'])")
PUBLISHED=$(echo "$ARTICLE_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['article']['published'])")
CANONICAL=$(echo "$ARTICLE_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['article']['canonical_url'])")

echo "Posting to Dev.to..."
echo "  Title: $TITLE"
echo "  Published: $PUBLISHED"

# Check if article already exists (by canonical URL)
EXISTING=$(curl -s -H "api-key: ${DEV_TO_API_KEY}" \
  "https://dev.to/api/articles/me/all?per_page=100" | \
  python3 -c "
import sys, json
articles = json.load(sys.stdin)
for a in articles:
    if a.get('canonical_url') == '$CANONICAL':
        print(a['id'])
        break
" 2>/dev/null || true)

if [ -n "$EXISTING" ]; then
  echo "  Updating existing article (ID: $EXISTING)..."
  RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X PUT \
    -H "api-key: ${DEV_TO_API_KEY}" \
    -H "Content-Type: application/json" \
    -d "$ARTICLE_JSON" \
    "https://dev.to/api/articles/${EXISTING}")
else
  echo "  Creating new article..."
  RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST \
    -H "api-key: ${DEV_TO_API_KEY}" \
    -H "Content-Type: application/json" \
    -d "$ARTICLE_JSON" \
    "https://dev.to/api/articles")
fi

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  URL=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('url',''))" 2>/dev/null)
  ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
  echo ""
  echo "Success! (HTTP $HTTP_CODE)"
  echo "  ID:  $ID"
  echo "  URL: $URL"
else
  echo ""
  echo "Failed (HTTP $HTTP_CODE):" >&2
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY" >&2
  exit 1
fi
