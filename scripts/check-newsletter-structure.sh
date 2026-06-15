#!/usr/bin/env bash
#
# check-newsletter-structure.sh (P089)
#
# Deterministic structural lint for a wr-newsletter brief. Catches the class of
# structural + sourcing defects the five LLM review gates do not catch. ASCII
# only, no em-dashes (this repo enforces a no-em-dash rule; a lint that emitted
# em-dashes in its own messages would be self-contradictory).
#
# Usage: check-newsletter-structure.sh <brief.md> [<linkedin.md>]
#   <brief.md>     path to the newsletter brief
#   <linkedin.md>  optional path to the LinkedIn sibling; auto-derived as
#                  "<brief-without-.md>.linkedin.md" when omitted. Check (f) is
#                  skipped (not failed) when no sibling file exists.
#
# Exit codes: 0 = clean, 1 = one or more violations, 2 = usage / IO error.
#
# Checks (each violation prints "FAIL [<id>] <brief>:<line>: <message>"):
#   a  no "**Source.**" / "**Source:**" line in an item that already carries an
#      inline markdown link (the redundant trailing-source defect)
#   b  no link-free line naming two or more distinct news outlets (the
#      "corroborated by Reuters, FT, NYT, and WSJ" unlinked-list defect)
#   c  a "### Also worth noting" section is present (the closing coda)
#   d  the H1 matches "^# Issue NN: " (the published-edition title prefix)
#   e  a "---" horizontal rule appears after the last section, before the CTA
#   f  model-name strings are consistent between the brief and the .linkedin.md
#   g  no services-pitch sentence in the CTA block (P090): the block after the
#      final "---" carries at most one non-blank prose line (the invitation);
#      the windyroad.com.au closing line (bare or markdown-linked) and blanks do
#      not count, so a "Windy Road runs ..." / "Tokens Spent helps ..." pitch is
#      a disallowed second prose line
#
# Notes on determinism:
#   Check (b) fires on a line that has no markdown link AND names two or more
#   distinct outlets. This catches the "corroborated by Reuters, FT, NYT, and
#   WSJ" unlinked-list defect while passing both the legitimate single-outlet
#   back-reference ("the WSJ piece is worth reading") and the linked-attribution
#   pattern ("The Wall Street Journal reported [headline](url)"). A single bare
#   outlet name, or an outlet name appended to a link-bearing line, is not
#   flagged; that is an accepted trade-off for zero false positives on the
#   known-good published format. A full name and its abbreviation (Wall Street
#   Journal / WSJ) count as two; a single line carrying both is improbable in
#   the unlinked-list defect and is the documented edge.

set -uo pipefail

OUTLETS_FULL='reuters|financial times|new york times|wall street journal|bloomberg|axios|politico'

usage() {
  echo "usage: check-newsletter-structure.sh <brief.md> [<linkedin.md>]" >&2
  exit 2
}

brief="${1:-}"
[ -n "$brief" ] || usage
[ -f "$brief" ] || { echo "error: brief not found: $brief" >&2; exit 2; }

linkedin="${2:-}"
if [ -z "$linkedin" ]; then
  linkedin="${brief%.md}.linkedin.md"
fi

violations=0
fail() { echo "FAIL [$1] $2" >&2; violations=$((violations + 1)); }

# Body = brief with the leading YAML frontmatter stripped, each surviving line
# prefixed with "<original-line-number><TAB>" so violation messages can cite the
# real line in the source file.
body=$(awk '
  NR==1 && $0=="---" { in_fm=1; next }
  in_fm && $0=="---" { in_fm=0; next }
  in_fm { next }
  { print NR "\t" $0 }
' "$brief")

body_text() { printf '%s\n' "$body" | cut -f2-; }

# --- (a) redundant Source line + (b) outlet named without a link --------------
# One awk pass over the body. Emits "<id>\t<line>\t<message>" rows on stdout.
while IFS=$'\t' read -r code ln msg; do
  [ -n "${code:-}" ] || continue
  fail "$code" "$brief:$ln: $msg"
done < <(printf '%s\n' "$body" | awk -F'\t' -v full="$OUTLETS_FULL" '
  {
    ln = $1; line = $2;
    if (line ~ /^### /) item_has_link = 0;
    if (line ~ /\]\(/) item_has_link = 1;

    # (a) a Source attribution line inside an item that already links inline
    if (line ~ /^\*\*Sources?[.:]/ && item_has_link == 1) {
      printf "a\t%d\tredundant **Source** line; item already carries inline link(s)\n", ln;
    }

    # (b) two or more distinct outlets named on a line that carries no link
    if (line !~ /\]\(/) {
      low = tolower(line);
      n = split(full, fulls, "|");
      hits = 0;
      for (i = 1; i <= n; i++) {
        if (low ~ ("(^|[^a-z])" fulls[i] "([^a-z]|$)")) hits++;
      }
      m = split("FT|NYT|WSJ", abbrs, "|");
      for (i = 1; i <= m; i++) {
        if (line ~ ("(^|[^A-Za-z])" abbrs[i] "([^A-Za-z]|$)")) hits++;
      }
      if (hits >= 2) {
        printf "b\t%d\ttwo or more news outlets named without a link on this line\n", ln;
      }
    }
  }
')

# --- (c) "### Also worth noting" section present ------------------------------
if ! body_text | grep -qE '^### Also worth noting'; then
  fail c "$brief: missing '### Also worth noting' section"
fi

# --- (d) H1 carries the "Issue NN:" prefix -----------------------------------
h1=$(body_text | grep -m1 -E '^# ' || true)
if ! printf '%s' "$h1" | grep -qE '^# Issue [0-9]+: '; then
  fail d "$brief: H1 must match '# Issue NN: ' (found: ${h1:-<none>})"
fi

# --- (e) a "---" rule after the last section, before the CTA -----------------
last_heading_ln=$(printf '%s\n' "$body" | awk -F'\t' '$2 ~ /^### / { ln = $1 } END { print ln + 0 }')
hr_after=$(printf '%s\n' "$body" | awk -F'\t' -v h="$last_heading_ln" '$2 == "---" && $1 + 0 > h { print $1 }' | tail -1)
if [ -z "$hr_after" ]; then
  fail e "$brief: missing '---' horizontal rule between the last section and the closing CTA"
fi

# --- (f) model-name strings consistent across brief + linkedin sibling --------
# Group each model mention by its family (the name with any trailing version /
# size token removed) and require the set of full strings to match across files
# for every family that appears in both.
extract_models() {
  grep -oE 'GPT-[0-9][0-9A-Za-z.-]*|Claude (Fable|Mythos|Opus|Sonnet|Haiku)( [0-9][0-9A-Za-z.]*)*|(Gemma|Llama|Gemini|Mistral|Qwen|DeepSeek|Grok|Phi)( [0-9][0-9A-Za-z.]*)+( [0-9]+[Bb])?' \
    | sed -E 's/[[:space:]]+$//' \
    | awk '{ full = $0; fam = full; sub(/[ -][0-9].*$/, "", fam); print fam "\t" full }' \
    | sort -u
}

if [ -f "$linkedin" ]; then
  brief_models=$(body_text | extract_models)
  ln_models=$(extract_models < "$linkedin")
  fams=$(printf '%s\n%s\n' "$brief_models" "$ln_models" | awk -F'\t' 'NF { print $1 }' | sort -u)
  while IFS= read -r fam; do
    [ -n "$fam" ] || continue
    bset=$(printf '%s\n' "$brief_models" | awk -F'\t' -v f="$fam" '$1 == f { print $2 }' | sort -u)
    lset=$(printf '%s\n' "$ln_models" | awk -F'\t' -v f="$fam" '$1 == f { print $2 }' | sort -u)
    if [ -n "$bset" ] && [ -n "$lset" ] && [ "$bset" != "$lset" ]; then
      bjoin=$(printf '%s' "$bset" | paste -sd'/' -)
      ljoin=$(printf '%s' "$lset" | paste -sd'/' -)
      fail f "$brief: model-name mismatch for '$fam' between brief ($bjoin) and linkedin ($ljoin)"
    fi
  done <<EOF
$fams
EOF
fi

# --- (g) no services-pitch sentence in the CTA block (P090) ------------------
# The CTA block is everything after the final "---" horizontal rule. It carries
# at most one non-blank prose line: the rotating invitation. The closing line
# (bare "windyroad.com.au" or a "[windyroad.com.au](...)" markdown link) and
# blank lines do not count. A services-description sentence ("Windy Road runs
# ...", "Tokens Spent helps ...") is a disallowed second prose line. Citing the
# second prose line keeps the message actionable.
cta_hr_ln=$(printf '%s\n' "$body" | awk -F'\t' '$2 == "---" { ln = $1 } END { print ln + 0 }')
if [ "$cta_hr_ln" -gt 0 ]; then
  read -r cta_count cta_extra_ln < <(printf '%s\n' "$body" | awk -F'\t' -v h="$cta_hr_ln" '
    $1 + 0 > h {
      line = $2;
      if (line ~ /^[[:space:]]*$/) next;       # skip blank lines
      if (line ~ /\]\(/) next;                  # skip markdown-link lines
      if (line ~ /windyroad\.com\.au/) next;    # skip the bare-domain closing line
      c++; if (c == 2) second = $1;
    }
    END { print c + 0, second + 0 }')
  if [ "${cta_count:-0}" -gt 1 ]; then
    fail g "$brief:${cta_extra_ln}: services-description sentence in CTA block; the CTA must be one invitation line plus the windyroad.com.au closing line only (P090)"
  fi
fi

# --- verdict ------------------------------------------------------------------
if [ "$violations" -gt 0 ]; then
  echo "check-newsletter-structure: $violations violation(s) in $brief" >&2
  exit 1
fi

echo "OK: newsletter structure lint passed ($brief)"
exit 0
