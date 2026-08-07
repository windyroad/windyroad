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
#   b  no link-free line naming a news outlet that is not linked elsewhere in the
#      same item (the name-without-link defect; one bare outlet is enough)
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
#   Check (b) fires on a link-free line that names a news outlet which is not
#   linked anywhere in the same item (an item is "### "-heading delimited). This
#   catches both the "corroborated by Reuters, FT, NYT, and WSJ" unlinked-list
#   defect AND a single bare outlet ("Bloomberg reported the loss" with no link),
#   per Tom's pipeline rule: do not name a news site without linking it (P093).
#   The legitimate back-reference is carved out per item: "the WSJ piece is worth
#   reading" passes when WSJ is linked elsewhere in the same item. "Linked" is
#   detected from the item's link-bearing lines by (1) the outlet name on a link
#   line, and (2) the outlet's canonical domain (wsj.com, bloomberg.com, ...) or
#   a syndication domain (finance.yahoo.com -> Bloomberg, yahoo.com/news -> Axios)
#   appearing in a markdown-link URL. A bare outlet that is linked nowhere in its
#   item is flagged; the resolution is to add the link (or whitelist upstream),
#   not to suppress the check. The linked-attribution pattern ("The Wall Street
#   Journal reported [headline](url)") is unaffected: the name sits on a
#   link-bearing line, which marks the outlet linked and is never itself flagged.

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
#
# Check (a) is line-level streaming. Check (b) is per-item (P093): it buffers
# every link-free line of an item, builds the item's set of linked outlets from
# its link-bearing lines (by outlet name on a link line, and by canonical /
# syndication URL domain), then flushes at each "### " boundary and at EOF,
# flagging any link-free line that names an outlet NOT linked in that item.
while IFS=$'\t' read -r code ln msg; do
  [ -n "${code:-}" ] || continue
  fail "$code" "$brief:$ln: $msg"
done < <(printf '%s\n' "$body" | awk -F'\t' -v full="$OUTLETS_FULL" '
  BEGIN {
    nfull = split(full, fulls, "|");
    fullcanon["reuters"] = "reuters"; fullcanon["financial times"] = "ft";
    fullcanon["new york times"] = "nyt"; fullcanon["wall street journal"] = "wsj";
    fullcanon["bloomberg"] = "bloomberg"; fullcanon["axios"] = "axios";
    fullcanon["politico"] = "politico";
    nabbr = split("FT|NYT|WSJ", abbrs, "|");
    abbrcanon["FT"] = "ft"; abbrcanon["NYT"] = "nyt"; abbrcanon["WSJ"] = "wsj";
    # Canonical outlet domains (regex; dots escaped). Index-aligned with domcanon.
    ndom = split("reuters\\.com|ft\\.com|nytimes\\.com|wsj\\.com|bloomberg\\.com|axios\\.com|politico\\.com", doms, "|");
    domcanon[1] = "reuters"; domcanon[2] = "ft"; domcanon[3] = "nyt";
    domcanon[4] = "wsj"; domcanon[5] = "bloomberg"; domcanon[6] = "axios";
    domcanon[7] = "politico";
    nbuf = 0;
  }

  # Mark every outlet linked by a link-bearing line: by name on the line, and by
  # canonical or syndication URL domain. Adds canonical keys to the linked[] set.
  function add_linked(line,    low, i) {
    low = tolower(line);
    for (i = 1; i <= nfull; i++)
      if (low ~ ("(^|[^a-z])" fulls[i] "([^a-z]|$)")) linked[fullcanon[fulls[i]]] = 1;
    for (i = 1; i <= nabbr; i++)
      if (line ~ ("(^|[^A-Za-z])" abbrs[i] "([^A-Za-z]|$)")) linked[abbrcanon[abbrs[i]]] = 1;
    # Syndication domains (host + path) checked before bare canonical domains.
    if (low ~ /finance\.yahoo\.com/) linked["bloomberg"] = 1;
    if (low ~ /yahoo\.com\/news/) linked["axios"] = 1;
    for (i = 1; i <= ndom; i++)
      if (low ~ doms[i]) linked[domcanon[i]] = 1;
  }

  # Flush the buffered link-free lines of the item just completed: flag any line
  # naming an outlet that is not in the item linked[] set.
  function flush_item(    k, low, i, hits) {
    for (k = 1; k <= nbuf; k++) {
      low = tolower(buf_line[k]);
      hits = 0;
      for (i = 1; i <= nfull; i++)
        if (low ~ ("(^|[^a-z])" fulls[i] "([^a-z]|$)") && !(fullcanon[fulls[i]] in linked)) hits++;
      for (i = 1; i <= nabbr; i++)
        if (buf_line[k] ~ ("(^|[^A-Za-z])" abbrs[i] "([^A-Za-z]|$)") && !(abbrcanon[abbrs[i]] in linked)) hits++;
      if (hits >= 1)
        printf "b\t%d\tnews outlet named without a link on this line and not linked elsewhere in the item\n", buf_ln[k];
    }
    nbuf = 0;
    split("", linked);
  }

  {
    ln = $1; line = $2;
    if (line ~ /^### /) { flush_item(); item_has_link = 0; }
    has_link = (line ~ /\]\(/);
    if (has_link) item_has_link = 1;

    # (a) a Source attribution line inside an item that already links inline
    if (line ~ /^\*\*Sources?[.:]/ && item_has_link == 1) {
      printf "a\t%d\tredundant **Source** line; item already carries inline link(s)\n", ln;
    }

    # (b) accumulate: link-bearing lines feed the linked[] set; link-free lines
    # are buffered for the flush at the next item boundary / EOF.
    if (has_link) {
      add_linked(line);
    } else {
      nbuf++; buf_line[nbuf] = line; buf_ln[nbuf] = ln;
    }
  }

  END { flush_item(); }
')

# --- (c) "### Also worth noting" section present ------------------------------
# Capture first, then test. `grep -q` closing the pipe early makes the upstream
# printf/cut take SIGPIPE (141), which `pipefail` turns into a spurious FAIL on
# long bodies. Command substitution plus `|| true` swallows it, same as (d). P119.
atwn=$(body_text | grep -m1 -E '^### Also worth noting' || true)
if [ -z "$atwn" ]; then
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
    | sed -E 's/[[:space:].,;:!?]+$//' \
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

# --- (h) provenance line present before the first item (ADR-032 element 5) -----
# Discharges the check ADR-032's Amendment 2026-08-03 deferred: "Under P120's
# loops, check (h) becomes the only mechanism that catches loop-induced drift,
# so it should be built with the loop rather than after it." The loop landed as
# ADR-043; this is the overdue other half. The line is remediation-invariant, so
# a gate may flag it but never rewrite it, which is exactly why a deterministic
# check has to own its presence.
first_item_ln=$(printf '%s\n' "$body" | awk -F'\t' '$2 ~ /^### Item / { print $1; exit }')
if [ -z "${first_item_ln:-}" ]; then
  # No `### Item ` heading at all. Do NOT silently skip: a brief with no items is
  # not a brief that needs no provenance line, and the `### Item N:` prefix check
  # that would have caught the bare-heading shape was deliberately not built (see
  # P121). Skipping here would make (h) unenforceable on exactly those briefs.
  fail h "$brief: no '### Item ' heading found, so the provenance line's required position cannot be checked; briefs must carry '### Item N:' headings per draft-template.md"
else
  # `AI` is matched uppercase-anchored rather than as a case-insensitive substring:
  # /[Aa][Ii]/ matches inside detail, available, again, maintain, email, so an
  # ordinary italic editorial line would have satisfied the predicate.
  prov=$(printf '%s\n' "$body" | awk -F'\t' -v h="$first_item_ln" '
    $1 + 0 < h && $2 ~ /^\*/ && $2 ~ /(^|[^A-Za-z])AI([^A-Za-z]|$)/ && $2 ~ /draft|writ|review/ { c++ }
    END { print c + 0 }')
  if [ "${prov:-0}" -eq 0 ]; then
    fail h "$brief: missing the provenance line before the first '### Item' heading; ADR-032 element 5 requires it every edition, both personas"
  fi
fi

# --- (i) "**From Tom**" opener present ----------------------------------------
# A template invariant, not corpus precedent: the cross-edition shape gate
# (ADR-044) deliberately does NOT own this, because the opener was absent from
# the editions published 2026-06-08 through 2026-07-13 and returned 2026-07-20.
# A precedent test would have let it lapse for six weeks unremarked; a template
# invariant catches it the first week.
from_tom=$(body_text | grep -m1 -E '^\*\*From Tom\*\*' || true)
if [ -z "$from_tom" ]; then
  fail i "$brief: missing the '**From Tom**' author-voice opener (draft-template.md Structure block)"
fi

# --- (j) the CTA invitation is a question (ADR-032 element 6) -----------------
# Element 6 fixes "one substantive content-tied question against one of the deep
# items' threads". Question-ness is not fully decidable here, so this asserts the
# cheap half: the CTA block contains a question mark. A generic question passes
# this and is caught by the LLM gates; a forward request or a bare statement does
# not pass, which is the shape that actually shipped on Issue 16.
# Shares check (g)'s CTA-block extractor so the two cannot disagree about where
# the block starts.
if [ "${cta_hr_ln:-0}" -gt 0 ]; then
  cta_q=$(printf '%s\n' "$body" | awk -F'\t' -v h="$cta_hr_ln" '
    $1 + 0 > h {
      line = $2;
      if (line ~ /^[[:space:]]*$/) next;
      if (line ~ /\]\(/) next;
      if (line ~ /windyroad\.com\.au/) next;
      if (line ~ /\?/) q++;
    }
    END { print q + 0 }')
  if [ "${cta_q:-0}" -eq 0 ]; then
    fail j "$brief: the closing CTA carries no question; ADR-032 element 6 requires a content-tied question, not a statement or a forward request"
  fi
fi

# --- (k) duplicate citation across sections (P122 / RFC-004 item 5) ------------
# The SAME link (identical anchor text AND identical URL) appearing in two
# different `### `-delimited sections is a mechanical defect: the reader meets
# the same citation twice. ADR-042 assigns structural hygiene here, and the
# ADR-020 P122 amendment keeps only the near-full-length-retelling judgement
# with the editor's edition-internal-consistency axis.
#
# WHY ANCHOR TEXT IS PART OF THE KEY, on evidence rather than on taste. The
# looser rule (same URL, any anchor text) was implemented first and run against
# every published edition. It fired on three, and all three are legitimate:
#   - 2026-04-17 cites thoughtworks.com/radar three times for three DIFFERENT
#     findings in one report. The URL is a landing page, so one publication with
#     several findings reads as a duplicate to a URL-only rule.
#   - 2026-06-22 cites a Nature article in the From Tom opener and again in the
#     item that details it. Setup-then-detail is a normal editorial move.
#   - 2026-07-13 repeats a source across two items for two distinct claims.
# "Same URL" is computable but is not the defect. The defect is the same source
# used to make the same point twice, and that needs judgement, which is why the
# residue stays with the editor axis. Requiring identical anchor text is the
# strictest mechanical proxy that has ZERO false positives on the corpus.
#
# Exemption: windyroad.com.au, which recurs legitimately in the CTA and closing.
# The region before the first `### ` heading is its own section, reported as
# "opener".
dup_hits=$(body_text | awk '
  BEGIN { sec_name = "opener" }
  /^### / { sec++; sec_name = $0; sub(/^### +/, "", sec_name); next }
  {
    rest = $0;
    while (match(rest, /\[[^]]*\]\(https?:\/\/[^) ]+\)/)) {
      link = substr(rest, RSTART, RLENGTH);
      rest = substr(rest, RSTART + RLENGTH);
      if (link ~ /windyroad\.com\.au/) continue;
      key = sec SUBSEP link;
      if (key in seen_pair) continue;
      seen_pair[key] = 1;
      nsec[link]++;
      if (!(link in first_sec)) first_sec[link] = sec_name;
      else other_sec[link] = sec_name;
    }
  }
  END {
    for (l in nsec) if (nsec[l] > 1)
      printf "%s\t%s\t%s\n", l, first_sec[l], other_sec[l];
  }
')
if [ -n "$dup_hits" ]; then
  while IFS="$(printf '\t')" read -r link s1 s2; do
    [ -n "$link" ] || continue
    fail k "$brief: the identical citation $link appears in two different sections (\"$s1\" and \"$s2\"); cite it once. There is no per-edition override: if this fires on a legitimate repeat, widen the exemption set in this script with the edition as evidence"
  done <<EOF
$dup_hits
EOF
fi

# --- verdict ------------------------------------------------------------------
if [ "$violations" -gt 0 ]; then
  echo "check-newsletter-structure: $violations violation(s) in $brief" >&2
  exit 1
fi

echo "OK: newsletter structure lint passed ($brief)"
exit 0
