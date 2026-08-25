#!/usr/bin/env bash
#
# check-newsletter-structure.sh (P089)
#
# Deterministic structural lint for a wr-newsletter brief. Catches the class of
# structural + sourcing defects the five LLM review gates do not catch. ASCII
# only, no em-dashes (this repo enforces a no-em-dash rule; a lint that emitted
# em-dashes in its own messages would be self-contradictory).
#
# Usage: check-newsletter-structure.sh <brief.md> [<linkedin.md>] [<reviews.md>]
#   Env: VOICE_AND_TONE_MD overrides the voice-guide path check (p) parses;
#        NEWSLETTER_SKILL_MD overrides the SKILL path check (o) reads.
#   <brief.md>     path to the newsletter brief
#   <linkedin.md>  optional path to the LinkedIn sibling; auto-derived from the
#                  brief path with any ".prep" phase infix stripped, because
#                  sibling artefacts are named for the publication date (ADR-026).
#                  Check (f) is skipped (not failed) when no sibling file exists.
#   <reviews.md>   optional path to the reviews sibling; auto-derived the same way.
#                  Checks (m) and (n) skip loudly when it does not exist.
#
# Exit codes: 0 = clean, 1 = one or more violations, 2 = usage / IO error.
#
# Checks (each violation prints "FAIL [<id>] <brief>:<line>: <message>"):
#   a  no "**Source.**" / "**Source:**" line in an item that already carries an
#      inline markdown link (the redundant trailing-source defect)
#   b  no link-free line naming a news outlet that is not linked elsewhere in the
#      same item (the name-without-link defect; one bare outlet is enough)
#   c  an "Also worth noting" section is present (the closing coda), H2 or H3
#   n  every non-pass verdict in the reviews sibling is remediated or cleared with
#      a stated author reason (ADR-052); the retired RESIDUAL tag is rejected
#   d  the H1 matches "^# Issue NN: " (the published-edition title prefix)
#   e  a "---" horizontal rule appears after the last section, before the CTA
#   f  model-name strings are consistent between the brief and the .linkedin.md
#   g  no services-pitch sentence in the CTA block (P090): the block after the
#      final "---" carries at most one non-blank prose line (the invitation);
#      the windyroad.com.au closing line (bare or markdown-linked) and blanks do
#      not count, so a "Windy Road runs ..." / "Tokens Spent helps ..." pitch is
#      a disallowed second prose line
#   h  the ADR-032 provenance line sits before the first item heading
#   i  the **From Tom** author-voice opener is present
#   j  the closing CTA carries a question, not a statement or a forward request
#   k  no identical citation (same anchor text and URL) in two different sections
#   l  the LinkedIn post is within 1.5x the trailing median of recent editions
#   m  no gate verdict predates the draft being saved (P099 / ADR-047)
#   o  every block the SKILL prescribes for this phase is present in the reviews
#      sibling (P151); absence, not just staleness
#   p  no word the voice guide lists under "Word list > Avoid" appears in the
#      brief body (P154); the list is parsed from docs/VOICE-AND-TONE.md at run
#      time, not restated here, and quoted spans and link URLs are out of scope
#   q  no markdown hard break (two or more trailing spaces) on a body line (P154)
#   r  no two prose lines with no blank line between them, which render as one
#      joined paragraph (P154); brief body only
#   s  no first person in the factual "What happened" block (ADR-057); brief
#      body only. Owns the "What happened" half of ADR-057's location rule; the
#      move-list half is not checkable until the draft template defines that
#      section, which ADR-057 records rather than fixes.
#
# Notes on determinism:
#   Check (b) fires on a link-free line that names a news outlet which is not
#   linked anywhere in the same item (an item is H2/H3-heading delimited). This
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
  echo "usage: check-newsletter-structure.sh <brief.md> [<linkedin.md>] [<reviews.md>]" >&2
  exit 2
}

brief="${1:-}"
[ -n "$brief" ] || usage
[ -f "$brief" ] || { echo "error: brief not found: $brief" >&2; exit 2; }

# Sibling artefacts are named for the publication date, not the phase (ADR-026):
# a prep-phase brief is "<date>.prep.md" but its siblings are still
# "<date>.reviews.md" and "<date>.linkedin.md". Strip the ".prep" infix so the
# derivations below name the file that actually exists during prep. Without it,
# check (m) skipped for the whole prep phase and check (n) went silent (P140).
# An explicit path overrides the derivation either way, which is ADR-047's
# derive-with-override plumbing and the escape hatch for a brief whose name
# carries a "-2" collision suffix its sibling does not.
sibling_base="${brief%.md}"
sibling_base="${sibling_base%.prep}"

linkedin="${2:-}"
if [ -z "$linkedin" ]; then
  linkedin="${sibling_base}.linkedin.md"
fi

reviews="${3:-}"
if [ -z "$reviews" ]; then
  reviews="${sibling_base}.reviews.md"
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
# syndication URL domain), then flushes at each H2/H3 boundary and at EOF,
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
    if (line ~ /^###? /) { flush_item(); item_has_link = 0; }
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

# --- (c) "Also worth noting" section present (H2 or H3) -----------------------
# Capture first, then test. `grep -q` closing the pipe early makes the upstream
# printf/cut take SIGPIPE (141), which `pipefail` turns into a spurious FAIL on
# long bodies. Command substitution plus `|| true` swallows it, same as (d). P119.
atwn=$(body_text | grep -m1 -E '^###? Also worth noting' || true)
if [ -z "$atwn" ]; then
  fail c "$brief: missing 'Also worth noting' section (H2 or H3)"
fi

# --- (d) H1 carries the "Issue NN:" prefix -----------------------------------
h1=$(body_text | grep -m1 -E '^# ' || true)
if ! printf '%s' "$h1" | grep -qE '^# Issue [0-9]+: '; then
  fail d "$brief: H1 must match '# Issue NN: ' (found: ${h1:-<none>})"
fi

# --- (e) a "---" rule after the last section, before the CTA -----------------
last_heading_ln=$(printf '%s\n' "$body" | awk -F'\t' '$2 ~ /^###? / { ln = $1 } END { print ln + 0 }')
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
first_item_ln=$(printf '%s\n' "$body" | awk -F'\t' '$2 ~ /^###? Item / { print $1; exit }')
if [ -z "${first_item_ln:-}" ]; then
  # No `Item ` section heading at all. Do NOT silently skip: a brief with no items
  # is not a brief that needs no provenance line, and the `Item N:` prefix check
  # that would have caught the bare-heading shape was deliberately not built (see
  # P121). Skipping here would make (h) unenforceable on exactly those briefs.
  fail h "$brief: no 'Item ' section heading (H2 or H3) found, so the provenance line's required position cannot be checked; briefs must carry '## Item N:' headings per draft-template.md"
else
  # `AI` is matched uppercase-anchored rather than as a case-insensitive substring:
  # /[Aa][Ii]/ matches inside detail, available, again, maintain, email, so an
  # ordinary italic editorial line would have satisfied the predicate.
  prov=$(printf '%s\n' "$body" | awk -F'\t' -v h="$first_item_ln" '
    $1 + 0 < h && $2 ~ /^\*/ && $2 ~ /(^|[^A-Za-z])AI([^A-Za-z]|$)/ && $2 ~ /draft|writ|review/ { c++ }
    END { print c + 0 }')
  if [ "${prov:-0}" -eq 0 ]; then
    fail h "$brief: missing the provenance line before the first 'Item' section heading; ADR-032 element 5 requires it every edition, both personas"
  fi
fi

# --- (i) "From Tom" opener present --------------------------------------------
# A template invariant, not corpus precedent: the cross-edition shape gate
# (ADR-044) deliberately does NOT own this, because the opener was absent from
# the editions published 2026-06-08 through 2026-07-13 and returned 2026-07-20.
# A precedent test would have let it lapse for six weeks unremarked; a template
# invariant catches it the first week.
#
# Both the bold form and the heading form satisfy it. The literal-bold-only
# predicate was what blocked the cognitive-accessibility gate from acting on a
# real WCAG 1.3.1 finding: a 420-word opener with no heading is invisible to
# heading navigation, and the gate's fix was refused by this check rather than
# by any editorial judgement. What the invariant is FOR is that the opener
# exists and is attributable, not which markup carries it.
#
# The heading arm is H2 only, deliberately. Accepting `### From Tom` too would
# pin nothing, and ADR-053 makes H2 the series shape from Issue 17. A template
# invariant needs a deterministic owner or the cross-edition shape gate reports
# the corpus fork as a fresh deviation every week. The bold arm stays forever:
# sixteen published editions carry it and are not being migrated.
from_tom=$(body_text | grep -m1 -E '^(\*\*From Tom\*\*|## From Tom)' || true)
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
# different section-heading-delimited sections is a mechanical defect: the reader meets
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
# The region before the first section heading is its own section, reported as
# "opener".
dup_hits=$(body_text | awk '
  BEGIN { sec_name = "opener" }
  /^###? / { sec++; sec_name = $0; sub(/^#+ +/, "", sec_name); next }
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

# --- (l) LinkedIn post length against the trailing median (P121) ---------------
# Is this week's post materially longer than its recent predecessors? A pure
# arithmetic check: post body characters against 1.5x the median of the two most
# recently published editions' posts for the SAME persona.
#
# WHY THIS LIVES HERE AND NOT IN THE SHAPE GATE. ADR-044's cross-edition shape
# subagent reads the same posts and reports the trend, but declines to make it a
# finding: its only length criterion is LinkedIn's 3,000-character platform
# limit. Verified by dry-run on 2026-08-08 against the published Issue 16, which
# sits at 1.58x its trailing median and which the gate passed. An arithmetic
# threshold is a script's job (ADR-042 assigns structural hygiene to this lint);
# the gate keeps the judgement-shaped cross-edition work it does well.
#
# KNOWN LIMITATION: the trailing median ratchets. An over-length edition joins
# the next week's baseline and so raises its own successor's allowance. Measured
# 2026-08-08: Issue 16 at 2,343 characters fails a 2,182 ceiling, and its
# presence lifts the following edition's ceiling to 2,986, a whisker under the
# 3,000 platform limit. The check reliably catches the FIRST over-length edition
# in a run and is weakest immediately after one, so sustained drift can walk past
# it one edition at a time. Faithful to the trailing-median rule P121 specified
# rather than a defect here. If drift is observed, take the median over recent
# editions that themselves passed rather than over all recent ones.
#
# Corpus root is overridable via NEWSLETTER_PUBLISHED_DIR so the tests can pin
# the arithmetic against a synthetic fixture instead of a moving corpus. It
# resolves relative to this script, not the process cwd, so an off-root
# invocation does not silently skip.
if [ -f "$linkedin" ]; then
  _l_script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
  pub_root="${NEWSLETTER_PUBLISHED_DIR:-$_l_script_dir/../src/newsletters/published}"
  # Persona is the path segment under published/ or drafts/; default leader.
  persona=$(printf '%s' "$linkedin" | sed -nE 's#.*/(published|drafts)/([^/]+)/.*#\2#p')
  [ -n "$persona" ] || persona=leader
  pub_dir="$pub_root/$persona"
  if [ ! -d "$pub_dir" ]; then
    echo "SKIP [l] $linkedin: no published corpus at $pub_dir for persona '$persona'; length ceiling not evaluated" >&2
  else
    cur_real=$(cd "$(dirname "$linkedin")" && pwd)/$(basename "$linkedin")
    priors=$(ls -d "$pub_dir"/*/ 2>/dev/null | sort -r | while read -r d; do
      stem=$(basename "$d")
      cand="$d$stem.linkedin.md"
      [ -f "$cand" ] || continue
      cand_real=$(cd "$(dirname "$cand")" && pwd)/$(basename "$cand")
      [ "$cand_real" = "$cur_real" ] && continue
      echo "$cand"
    done | head -2)
    nprior=$(printf '%s\n' "$priors" | grep -c . || true)
    if [ "$nprior" -lt 2 ]; then
      echo "SKIP [l] $linkedin: only $nprior prior published post(s) for persona '$persona'; need 2 to take a median" >&2
    else
      # Strip frontmatter only when line 1 actually opens one; otherwise count all.
      post_chars() {
        if [ "$(head -1 "$1")" = "---" ]; then
          sed '1,/^---$/d' "$1" | tr -d '\n' | wc -c | tr -d ' '
        else
          tr -d '\n' < "$1" | wc -c | tr -d ' '
        fi
      }
      a=$(printf '%s\n' "$priors" | sed -n 1p); b=$(printf '%s\n' "$priors" | sed -n 2p)
      ca=$(post_chars "$a"); cb=$(post_chars "$b"); cc=$(post_chars "$linkedin")
      med=$(( (ca + cb) / 2 ))
      ceiling=$(( med * 3 / 2 ))
      if [ "$med" -gt 0 ] && [ "$cc" -gt "$ceiling" ]; then
        fail l "$linkedin: post body is $cc characters against a $ceiling ceiling (1.5x the $med-character median of $(basename "$(dirname "$a")") and $(basename "$(dirname "$b")")); tighten it, or say plainly why this edition earns the extra length"
      fi
    fi
  fi
fi

# --- (p) a word the voice guide lists under Avoid (P154) -----------------------
# The editorial remediation loop at SKILL.md step 15.37 had no verification of
# its own: a fix for one gate's finding could introduce a new defect that
# nothing read until the next full gate battery. The 2026-08-17 reviews sibling
# records "actually", a word the guide bans, introduced four separate times by
# remediation edits. Three of the four were caught by a gate a full battery
# later; the fourth was caught by exactly this grep, run by hand, at no cost.
#
# The list is PARSED FROM THE GUIDE AT RUN TIME and is deliberately not restated
# here. A second copy is the two-surfaces-disagree defect P140 and P151 both
# closed on this file, and the guide is the surface Tom edits.
#
# Parsing rules, each load-bearing:
#   - Anchor on the "### Avoid" heading, take column 1 only (the "Why" column
#     quotes words: 'Say "audit" or "review"').
#   - Start collecting only AFTER the "|---|---|" delimiter row. The header cell
#     is "Word/phrase"; splitting slash-alternates before skipping the header
#     would ban "word" and "phrase" outright.
#   - Stop at the blank line or rule that ends the table. The next table down has
#     a "Finance / legal idioms" cell that an unbounded read would split into
#     "finance" and "legal idioms".
#   - Split remaining slash-alternates ("solution/solutions" is one cell, two
#     words).
#
# Matching is WHOLE-WORD, case-insensitive, on the brief body only, and skips
# fenced code blocks. Quoted spans and markdown link targets are stripped from a
# line before matching: the guide's list was written for landing-page copy, and
# in a news brief "leverage" (a market story) and "solutions" (a vendor URL, or
# the mathematical sense) are words the brief is quoting rather than choosing.
# That is a genre scope rule, not a per-word carve-out. If a word on the list
# should be allowed in our own voice, add a genre-scoped carve-out to the GUIDE,
# on the model of its existing "Carve-out for auto-share posts" and "Carve-out
# for recurring-newsletter cadence anchors". Do not add an exception here, and
# do not loosen the Avoid row itself: that row governs site copy too.
#
# Under-matching is accepted: "leveraging", "game-changing" and "reaching out"
# all pass, and so does any avoided word inside quotation marks or a markdown
# link target. Our own parenthetical glosses are NOT exempt. The complement is
# the LLM voice gate at step 13, which reads context. This check is the
# deterministic second reader on a rule that already blocks.
guide_md="${VOICE_AND_TONE_MD:-}"
if [ -z "$guide_md" ]; then
  _p_script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
  guide_md="$_p_script_dir/../docs/VOICE-AND-TONE.md"
fi

if [ ! -f "$guide_md" ]; then
  echo "SKIP [p] $brief: no voice guide at $guide_md; the Word list > Avoid entries are not checked" >&2
else
  # word<TAB>why, one per Avoid row, slash-alternates already split.
  avoid=$(awk '
    /^###[[:space:]]+Avoid[[:space:]]*$/ { in_sec = 1; next }
    !in_sec { next }
    /^#/ { exit }
    /^---/ { if (past_delim) exit; next }
    /^\|[-:| \t]+\|[ \t]*$/ { past_delim = 1; next }
    !past_delim { next }
    /^[[:space:]]*$/ { exit }
    /^\|/ {
      n = split($0, cell, "|");
      if (n < 3) next;
      word = cell[2]; why = cell[3];
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", word);
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", why);
      sub(/\.$/, "", why);
      if (word == "") next;
      m = split(word, alts, "/");
      for (i = 1; i <= m; i++) {
        a = alts[i];
        gsub(/^[[:space:]]+|[[:space:]]+$/, "", a);
        if (a != "") printf "%s\t%s\n", a, why;
      }
    }
  ' "$guide_md")

  n_avoid=$(printf '%s' "$avoid" | grep -c . || true)
  if [ "$n_avoid" -lt 5 ]; then
    # Present but unreadable is a broken contract, not an absent one. Drift here
    # is silent in the direction that stops checking, which is the hazard check
    # (o)'s header names, so this fails rather than skipping.
    fail p "$guide_md: no readable \"Word list > Avoid\" table (parsed $n_avoid entries, expected at least 5); the voice word list cannot be checked, so restore the table or point VOICE_AND_TONE_MD at the guide"
  else
    while IFS=$'\t' read -r ln word why; do
      [ -n "${ln:-}" ] || continue
      fail p "$brief:$ln: \"$word\" is listed under Word list > Avoid in $guide_md: $why. Cut it, or rewrite the sentence so it does not need it"
    # The list travels in the environment, not through -v: awk rejects a
    # newline inside a -v assignment, and the list is one entry per line.
    done < <(printf '%s\n' "$body" | AVOID_ROWS="$avoid" awk -F'\t' '
      BEGIN {
        n = split(ENVIRON["AVOID_ROWS"], rows, "\n");
        for (i = 1; i <= n; i++) {
          if (rows[i] == "") continue;
          j = index(rows[i], "\t");
          w = substr(rows[i], 1, j - 1);
          why[w] = substr(rows[i], j + 1);
          words[++nw] = w;
        }
      }
      {
        ln = $1; line = $2;
        if (line ~ /^[[:space:]]*```/) { fence = !fence; next }
        if (fence) next;
        probe = tolower(line);
        # Quoted spans are the source speaking, not us. A markdown link target
        # is a vendor path, not our prose. Both are stripped before matching.
        # The link strip is anchored on "](" so it takes link targets only: a
        # parenthetical gloss is our own voice and stays in scope, which is what
        # the gloss-on-first-use rule in the guide tells writers to produce.
        gsub(/"[^"]*"/, " ", probe);
        gsub(/\]\([^)]*\)/, " ", probe);
        for (i = 1; i <= nw; i++) {
          # The cell is Tom-edited copy, so escape it rather than trusting it:
          # an entry containing "." or "(" would otherwise over-match silently.
          w = tolower(words[i]);
          gsub(/[][().+*?^$|\\{}]/, "\\\\&", w);
          if (probe ~ ("(^|[^a-z0-9-])" w "([^a-z0-9-]|$)"))
            printf "%d\t%s\t%s\n", ln, words[i], why[words[i]];
        }
      }
    ')
  fi
fi

# --- (q) a markdown hard break left on a body line (P154) ----------------------
# Two or more trailing spaces are a markdown hard break, which renders as a line
# break the reader sees and no brief in the archive uses. It is the shape an
# edit leaves behind when a sentence is split and rejoined, and it is invisible
# in a diff. A single trailing space or tab renders as nothing and is not
# flagged: the finding and the reason given for it have to cover the same thing.
#
# Zero hits across all 18 published brief bodies, and unlike check (r) below, no
# instance is on record: the 2026-08-17 round closes ran this by hand and it
# never fired. The warrant is the reader-visible render plus zero cost, not
# observed recurrence. Re-price it on that basis rather than on a phantom one.
while IFS=$'\t' read -r ln _rest; do
  [ -n "${ln:-}" ] || continue
  fail q "$brief:$ln: two or more trailing spaces are a markdown hard break, which briefs do not use; strip the trailing whitespace, and use a blank line for a paragraph break"
done < <(printf '%s\n' "$body" | awk -F'\t' '$2 ~ /[^ ]  +$/ { print $1 "\t" }')

# --- (r) two prose lines with no blank line between them (P154) ----------------
# A single newline between two prose lines renders as one joined paragraph, so
# the sentence the drafter split is silently rejoined for the reader. The
# 2026-08-17 reviews sibling records this defect introduced twice by remediation
# edits in one edition, the second time immediately after a check was written
# for the first.
#
# Prose means: not blank, not a list item (at any indent), not a heading, not a
# blockquote, not a table row, not a horizontal rule, not a standalone image,
# and not inside a fenced code block. The indent tolerance is load-bearing: the
# first version of this predicate treated "  - nested item" as prose and fired
# 43 times across the archive. With it, the archive is clean: zero hits on all
# 18 published brief bodies. Brief only. The LinkedIn siblings use an arrow-
# bullet convention this predicate would flag, and that convention is theirs.
while IFS=$'\t' read -r ln _rest; do
  [ -n "${ln:-}" ] || continue
  fail r "$brief:$ln: this line runs on from the prose line above it with no blank line between, so the two render as one paragraph; add a blank line above this one, or merge the two into a single line"
done < <(printf '%s\n' "$body" | awk -F'\t' '
  {
    ln = $1; t = $2;
    sub(/^[ \t]+/, "", t);
    if (t ~ /^```/) { fence = !fence; prev = 0; next }
    if (fence) next;
    isprose = (t != "" \
      && t !~ /^[-*+][ \t]/ \
      && t !~ /^[0-9]+[.)][ \t]/ \
      && t !~ /^#/ \
      && t !~ /^>/ \
      && t !~ /^\|/ \
      && t !~ /^-{3,}[ \t]*$/ \
      && t !~ /^!\[/);
    if (isprose && prev) print ln "\t";
    prev = isprose;
  }
')

# --- (m) a gate verdict that predates the current draft (P099 / ADR-047) --------
# Each gate verdict in the edition's .reviews.md sibling records the digest of the
# artefact version it scored, as "scored-digest: sha256:<hex>". This check
# recomputes the current artefact digest and names every gate whose recorded
# digest does not match, i.e. whose verdict describes a text the edition no
# longer carries. ADR-047 tunes it to OVER-REPORT: where uncertain, report stale.
#
# DETECTION ONLY HERE. The response is the SKILL's, not this script's: on a (m)
# failure, step 16 re-invokes the named gates against the current artefact and
# re-saves. A lint cannot invoke a subagent.
#
# Digest is over the BODY with frontmatter excluded, matching this file's general
# stance (see the body= awk above): frontmatter churn at save is not a content
# edit, so including it would produce noise rather than sensitivity.
#
# Skipped, loudly, when the sibling is absent or carries no digests at all, which
# is the pre-adoption state. Never silently.
#
# $reviews is resolved once at the top of the file, from the brief path with the
# ".prep" phase infix stripped, or from the optional third argument.
if [ ! -f "$reviews" ]; then
  echo "SKIP [m] $brief: no reviews sibling at $reviews; gate-freshness not checked" >&2
else
  ndig=$(grep -cE '^scored-digest: sha256:[0-9a-f]{64}$' "$reviews" || true)
  if [ "$ndig" -eq 0 ]; then
    echo "SKIP [m] $reviews: carries no scored-digest lines; gate-freshness not checked (pre-ADR-047 edition)" >&2
  else
    digest_of() {
      if [ "$(head -1 "$1")" = "---" ]; then
        sed '1,/^---$/d' "$1" | shasum -a 256 | awk '{print $1}'
      else
        shasum -a 256 < "$1" | awk '{print $1}'
      fi
    }
    cur_brief=$(digest_of "$brief")
    cur_post=""
    [ -f "$linkedin" ] && cur_post=$(digest_of "$linkedin")
    # Walk the sibling: track the most recent "## <heading>" and, per ADR-047,
    # which artefact that heading scores. A heading naming the LinkedIn post is
    # compared against the post digest; everything else against the brief.
    # Four states per RFC-005, not a boolean. A boolean would report every
    # ADR-017 prep-carried verdict stale by construction, which is the identical
    # objection RFC-005 uses to eliminate the whole-gate-set digest.
    #   matches-current    digest equals the artefact being saved
    #   carried-by-design  explicitly marked carried; expected not to match, and
    #                      not verifiable here since the prep body is replaced
    #   never-scored       a verdict block with no digest at all
    #   stale              anything else: the verdict predates this draft
    # A block is carried-by-design iff its heading ends "(prep)" or it carries a
    # "carried-from: prep" line. ADR-047 criterion 6: silence reads as stale, so
    # an unmarked carried block is reported, not excused.
    stale=$(awk -v cb="$cur_brief" -v cp="$cur_post" '
      function flush() {
        if (head == "") return;
        if (!is_verdict) { head=""; return }
        if (carried && !seen_digest) { printf "%s\tcustody-broken\n", head; head=""; return }
        if (carried) { head=""; return }
        if (!seen_digest) { printf "%s\tnever-scored\n", head; head=""; return }
        head="";
      }
      /^## / {
        flush();
        head = substr($0, 4);
        h = tolower(head);
        # Only VERDICT blocks are in scope. Map Delta, URL Verification and the
        # remediation loop are records, not gate verdicts, and reporting them
        # never-scored would block the save on something that cannot be re-run.
        is_verdict = (h ~ /review|critic|consistency|skeptic|shape|accessibility/) ? 1 : 0;
        # The Wardley critic scores ai-landscape.md, a third artefact this check
        # has no target for. Out of scope rather than permanently stale.
        if (h ~ /wardley/) is_verdict = 0;
        is_post = (h ~ /linkedin|companion|post\)/) ? 1 : 0;
        carried = (h ~ /\(prep\)/) ? 1 : 0;
        seen_digest = 0;
        next
      }
      /^carried-from: *prep/ { carried = 1; next }
      /^scored-digest: sha256:/ {
        seen_digest = 1;
        if (!is_verdict) next;
        if (carried) next;
        d = $2; sub(/^sha256:/, "", d);
        want = is_post ? cp : cb;
        if (want == "") { printf "%s\t(no artefact on disk to compare)\n", head; next }
        if (d != want) printf "%s\t%s\n", head, (is_post ? "post" : "brief");
      }
      END { flush() }
    ' "$reviews")
    if [ -n "$stale" ]; then
      while IFS="$(printf '\t')" read -r gate which; do
        [ -n "$gate" ] || continue
        if [ "$which" = "never-scored" ]; then
          fail m "$brief: the verdict block \"$gate\" carries no scored-digest, so there is no way to tell which draft it scored; re-run that gate against the current draft (ADR-047)"
        elif [ "$which" = "custody-broken" ]; then
          fail m "$brief: the verdict block \"$gate\" is marked carried but has no scored-digest, which is the signature of a block recomposed from context rather than copied verbatim; recover the original block with its digest, or re-run that gate (ADR-047 custody invariant)"
        else
          fail m "$brief: the verdict for \"$gate\" was scored against a different $which than the one being saved; re-run that gate against the current draft before saving (ADR-047)"
        fi
      done <<EOF
$stale
EOF
    fi
  fi
fi

# --- (n) every non-pass verdict is remediated or cleared with a reason (ADR-052) -
# ADR-052 makes every reviewer gate block publication. Its confirmation criteria
# name this check by hand, and name why it is deterministic rather than prose:
# P099 shipped a prose rule at this exact surface and its own Effort line records
# that the rule did not hold. So does the evidence that produced ADR-052 in the
# first place, where a stale advisory verdict was recorded honestly in the reviews
# sibling and the edition was called ready anyway.
#
# What this asserts is deliberately narrow, because the alternative is a verdict
# vocabulary this script would have to keep in sync with seven agents. It does NOT
# try to decide whether a gate passed. It asserts the bookkeeping ADR-052 requires:
# any block tagged BLOCKING must not still be standing at save, and any block
# tagged CLEARED or DECLINED must carry a stated reason. The reason is what makes
# an author-cleared finding a decision rather than a default, and a CLEARED entry
# with no reason is the exact shape of the deferral this decision closes.
#
# The retired RESIDUAL tag is also caught here. It was the accepted-residual
# publication path, so a new edition carrying it is describing the superseded
# regime; editions published before 2026-08-10 keep theirs and are not linted.
if [ -f "$reviews" ]; then
  n_blocking=$(grep -cE '^[^a-zA-Z0-9]*BLOCKING \(survived round 2\)' "$reviews" || true)
  if [ "$n_blocking" -gt 0 ]; then
    fail n "$reviews: $n_blocking finding(s) tagged BLOCKING are still standing; ADR-052 holds the edition until each is fixed, or declined by the author with a stated reason (retag DECLINED plus the reason)"
  fi

  # A CLEARED / DECLINED entry must carry a reason. The reason may sit on the same
  # line after a colon, or on the following non-blank line; both shapes appear in
  # hand-written reviews siblings, so accept either rather than pinning one.
  noreason=$(awk '
    /^[^a-zA-Z0-9]*(CLEARED \(forbidden to remediate\)|DECLINED)/ {
      line = $0; ln = NR;
      sub(/^[^a-zA-Z0-9]*(CLEARED \(forbidden to remediate\)|DECLINED)[:.]?/, "", line);
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", line);
      if (length(line) >= 12) next;
      pending = ln; next;
    }
    pending && /^[[:space:]]*$/ { next }
    pending {
      probe = $0; gsub(/^[[:space:]>*-]+/, "", probe);
      # A heading, or another verdict tag, starts new content rather than
      # continuing the cleared entry, so it cannot be the reason for it.
      # A heading, another verdict tag, or one of the structured finding fields
      # step 15.37 item 5 prescribes alongside the tag, all start new content
      # rather than giving a reason. Without this the documented authoring
      # order (tag, then Passage:, then Suggested fix:) passes with no reason.
      if (probe ~ /^#/ || probe ~ /^(CLEARED|DECLINED|BLOCKING|RESIDUAL)/) probe = "";
      if (probe ~ /^(Passage|Issue|Axis|Gate|Suggested fix|Originating gate|Quoted passage|Verified against)[[:space:]]*:/) probe = "";
      if (length(probe) < 12) printf "%d\n", pending;
      pending = 0; next;
    }
    END { if (pending) printf "%d\n", pending }
  ' "$reviews")
  if [ -n "$noreason" ]; then
    while read -r ln; do
      [ -n "$ln" ] || continue
      fail n "$reviews:$ln: a CLEARED or DECLINED finding carries no stated reason; ADR-052 clears a finding on the author's recorded reason, and an entry without one is a deferral wearing a tag"
    done <<EOF
$noreason
EOF
  fi

  if grep -qE '^[^a-zA-Z0-9]*RESIDUAL \(round 2, accepted\)' "$reviews"; then
    fail n "$reviews: carries the retired 'RESIDUAL (round 2, accepted)' tag; ADR-052 removed the accepted-residual publication path. Use CLEARED (forbidden to remediate) with the author's reason, or BLOCKING (survived round 2)"
  fi
else
  echo "SKIP [n] $brief: no reviews sibling at $reviews; standing-verdict bookkeeping not checked" >&2
fi

# --- (o) a gate the SKILL prescribes for this phase wrote no block (P151) ------
# Check (m) is comparison-based by construction: it classifies only the "## "
# headings physically present in the reviews sibling. A gate that never ran
# writes no heading, so it produces no row to classify. Staleness was detected;
# absence was not, and the only thing that caught the 2026-08-09 prep run
# skipping three prescribed gates was a note a drafter chose to write.
#
# The roster of prescribed blocks is DERIVED from the SKILL's own step-16 save
# templates, never restated here. A second copy in this file is exactly the
# two-surfaces-disagree defect P140 closed on this script a day earlier: the
# copy drifts, and the drift is silent in the direction that stops checking.
#
# Grain is the GATE, not the heading. A finalise template splits one gate across
# "(finalise)" and "(prep)" blocks, which are two passes of the same gate, so
# those qualifiers collapse. "(LinkedIn post)" does not collapse: it names a
# different artefact, and letting the post's voice block satisfy the brief's
# would be the same absence hole one heading over.
#
# The collapse gives something up, and it is named here rather than left for a
# reader to discover: a carried prep block satisfies a finalise slot on its own,
# so a finalise pass that re-runs nothing still reads clean. That is bounded, not
# open. ADR-046 sanctions skipping the re-invocation when the artefact did not
# change, which is when the carry is legitimate; the artefact-changed case
# belongs to P099, not to this check.
#
# Matching tolerates naming drift that still names the gate. A heading whose
# significant words are a superset of the prescribed heading's satisfies it, so
# "Adversarial Skeptic Review" counts as the skeptic gate and "Cross-Edition
# Consistency Review" as the cross-edition gate (both are on disk in the
# 2026-08-17 sibling). The stopword "review" is dropped so it cannot carry a
# match on its own. No prescribed word-set is a subset of another, so this
# cannot cross-satisfy; the roster-size test pins that.
#
# A block recorded "N/A: <reason>" DOES satisfy the check, which is the
# answer to whether a deliberate skip is permitted: it is, on the record. But
# the reason must be one the SKILL prescribes as a skip condition, per ADR-047
# limit 2 (a sanctioned skip is one whose DOCUMENTED skip condition holds).
# A free-hand reason would discharge every gate with one typed line, which is
# this defect relocated one level up.
skill_md="${NEWSLETTER_SKILL_MD:-}"
if [ -z "$skill_md" ]; then
  _o_script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
  skill_md="$_o_script_dir/../.claude/skills/wr-newsletter/SKILL.md"
fi

if [ ! -f "$reviews" ]; then
  echo "SKIP [o] $brief: no reviews sibling at $reviews; gate presence not checked" >&2
elif [ ! -f "$skill_md" ]; then
  echo "SKIP [o] $brief: no wr-newsletter SKILL at $skill_md; cannot tell which gates this phase prescribes, so gate presence is not checked" >&2
else
  # Phase comes from the brief's frontmatter, which all three save templates
  # prescribe. The ".prep" filename infix is the fallback, then full (the
  # SKILL's own default when no phase argument is passed).
  phase=$(awk '
    NR==1 && $0!="---" { exit }
    NR==1 { next }
    /^---$/ { exit }
    /^phase:[[:space:]]*(prep|finalise|full)[[:space:]]*$/ { print $2; exit }
  ' "$brief")
  if [ -z "$phase" ]; then
    case "$brief" in
      *.prep.md) phase=prep ;;
      *)         phase=full ;;
    esac
  fi

  missing=$(awk -v ph="$phase" -v skill="$skill_md" -v rev="$reviews" '
    # " tok tok " so a subset test is a padded index() lookup.
    function toks(s,   t, n, a, i, o) {
      t = tolower(s); gsub(/[^a-z0-9]+/, " ", t)
      n = split(t, a, " "); o = " "
      for (i = 1; i <= n; i++) if (a[i] != "review" && a[i] != "reviews") o = o a[i] " "
      return o
    }
    function flat(s,   t) {
      t = tolower(s); gsub(/[^a-z0-9]+/, " ", t)
      gsub(/^ +| +$/, "", t); return t
    }
    # Splits a heading into G_stem (significant words) and G_post (artefact flag),
    # collapsing the (prep) / (finalise) pass qualifiers.
    function split_head(h,   qual, stem) {
      qual = ""; stem = h
      if (match(h, /\([^)]*\)[ \t]*$/)) {
        qual = flat(substr(h, RSTART + 1, RLENGTH - 2))
        stem = substr(h, 1, RSTART - 1)
      }
      sub(/[ \t]+$/, "", stem)
      G_stem = toks(stem)
      G_post = (qual ~ /linkedin|companion|post/) ? 1 : 0
      G_name = stem (G_post ? " (LinkedIn post)" : "")
    }
    function satisfies(want, got,   n, a, i) {
      n = split(want, a, " ")
      for (i = 1; i <= n; i++) if (a[i] != "" && index(got, " " a[i] " ") == 0) return 0
      return 1
    }
    FILENAME == skill {
      # Sanctioned skip reasons, read ONLY from the SKILL block the anchor
      # comment marks. Scraping every "N/A:" run out of the prose instead would
      # let punctuation decide what counts as sanctioned, and one stray line
      # ending "N/A:." would harvest a key that prefixes every reason and quietly
      # sanction all of them.
      if ($0 ~ /SANCTIONED-SKIP-REASONS:/) { insk = 1; next }
      if (insk) {
        if ($0 ~ /^[ \t]*N\/A:/) { sub(/^[ \t]+/, "", $0); sk[flat($0)] = 1; nsk++; next }
        if (nsk > 0 && $0 ~ /^[ \t]*```[ \t]*$/) insk = 0
      }
      if ($0 ~ /^#### phase=/) { sect = (index($0, "#### phase=" ph ":") == 1); next }
      if ($0 ~ /^### /) { sect = 0; next }
      if (sect && $0 ~ /^[ \t]*## /) {
        h = $0; sub(/^[ \t]*## /, "", h); sub(/[ \t]+$/, "", h)
        split_head(h)
        key = G_stem "|" G_post
        if (!(key in seen)) { seen[key] = 1; rn++; rstem[rn] = G_stem; rpost[rn] = G_post; rname[rn] = G_name }
      }
      next
    }
    FILENAME == rev {
      if ($0 ~ /^## /) {
        h = $0; sub(/^## /, "", h); sub(/[ \t]+$/, "", h)
        split_head(h)
        pn++; pstem[pn] = G_stem; ppost[pn] = G_post; phead[pn] = h; pline[pn] = FNR; pna[pn] = ""
        want_body = 1
        next
      }
      # First real content line under a heading decides whether it is an N/A entry.
      if (want_body && pn > 0) {
        if ($0 ~ /^[ \t]*$/) next
        if ($0 ~ /^(scored-digest:|carried-from:|<!--)/) next
        probe = $0; gsub(/^[ \t>*-]+/, "", probe)
        if (probe ~ /^[Nn]\/[Aa]/) pna[pn] = probe
        want_body = 0
      }
      next
    }
    END {
      if (rn == 0) { print "ROSTER-EMPTY"; exit }
      for (i = 1; i <= rn; i++) {
        hit = 0
        for (j = 1; j <= pn; j++) {
          if (ppost[j] != rpost[i]) continue
          if (!satisfies(rstem[i], pstem[j])) continue
          hit = j; break
        }
        if (!hit) { printf "absent\t%s\t\t\n", rname[i]; continue }
        if (pna[hit] != "" && !(flat(pna[hit]) in sk)) {
          ok = 0
          for (r in sk) if (index(flat(pna[hit]), r) == 1) { ok = 1; break }
          if (!ok) printf "unsanctioned\t%s\t%s\t%d\n", rname[i], phead[hit], pline[hit]
        }
      }
    }
  ' "$skill_md" "$reviews")

  if [ "$missing" = "ROSTER-EMPTY" ]; then
    echo "SKIP [o] $brief: the SKILL at $skill_md prescribes no blocks for phase=$phase; gate presence not checked" >&2
  elif [ -n "$missing" ]; then
    while IFS="$(printf '\t')" read -r kind gate head ln; do
      [ -n "${kind:-}" ] || continue
      if [ "$kind" = "absent" ]; then
        fail o "$brief: the reviews sibling records no block for \"$gate\", which phase=$phase prescribes; run that gate and record its block, or record the block with a reason it did not run that the SKILL prescribes as a skip condition (P151)"
      else
        fail o "$reviews:$ln: the block \"$head\" is recorded N/A for a reason the SKILL does not prescribe as a skip condition; a gate stays skipped only where its documented skip condition holds (ADR-047), so run it, or record one of the prescribed reasons (P151)"
      fi
    done <<EOF
$missing
EOF
  fi
fi

# --- (s) first person in the factual "What happened" bullets (ADR-057) --------
# ADR-057 sorts voice on who is answerable and blocks on LOCATION rather than on
# the test: "I" inside the factual "What happened" bullets or the move list is a
# hard fail; anywhere else a wrong-person call is a finding the author clears
# under ADR-043 clause 4. This check owns the first half. The move-list half is
# not checkable yet, because ADR-057 records that assets/draft-template.md does
# not define that section, so there is nothing stable to anchor on. Recorded
# here rather than silently half-implemented.
#
# Anchors on the "**What happened" label, not on heading level, because ADR-053
# moved the outline to H2 at Issue 17 and left the archive at H3. Anchoring on
# the heading would go blind on one era or the other, which is drift in the
# direction that stops checking.
#
# The predicate requires "I" to be a sentence subject ("I " plus a lowercase
# word) or a contraction. A bare word-boundary \bI\b was measured against the
# corpus first and produced one false positive: the 2026-08-03 edition's
# "Landgericht Munchen I, Germany's Munich Regional Court I", where the I is a
# numeral in a court's name. A check that fires on a published edition gets
# switched off, so the narrower predicate is the one that ships. Quoted spans
# are stripped before matching: a quote is the source speaking, not the
# publication, and ADR-057 governs who the publication speaks as.
#
# Measured at zero hits across all 20 published brief bodies.
while IFS=$'\t' read -r ln hit; do
  [ -n "${ln:-}" ] || continue
  fail s "$brief:$ln: first person in the factual \"What happened\" block ($hit); ADR-057 hard-fails on \"I\" here because these bullets report rather than judge, so rewrite as the publication's reporting, and put the judgement in the analysis below where first person is permitted"
done < <(printf '%s\n' "$body" | awk -F'\t' '
  {
    ln = $1; t = $2;
    if (t ~ /^```/) { fence = !fence; next }
    if (fence) next;
    if (t ~ /^\*\*What happened[.:]?\*\*/) { inblk = 1 }
    else if (t ~ /^\*\*[A-Z]/ || t ~ /^#/ || t ~ /^-{3,}[ \t]*$/) { inblk = 0 }
    if (!inblk) next;

    # Strip inline code, link targets and double-quoted spans before matching.
    line = t;
    gsub(/`[^`]*`/, "", line);
    gsub(/\]\([^)]*\)/, "]", line);
    gsub(/"[^"]*"/, "", line);

    if (match(line, /(^|[^[:alnum:]])I ([a-z])/)) {
      printf "%s\tI %s\n", ln, substr(line, RSTART + RLENGTH - 1, 12); next
    }
    if (match(line, /(^|[^[:alnum:]])I'"'"'(m|ve|d|ll)([^[:alnum:]]|$)/)) {
      printf "%s\t%s\n", ln, substr(line, RSTART, RLENGTH); next
    }
    if (match(line, /(^|[^[:alnum:]])(my|me)([^[:alnum:]]|$)/)) {
      printf "%s\t%s\n", ln, substr(line, RSTART, RLENGTH); next
    }
  }
')

# --- verdict ------------------------------------------------------------------
if [ "$violations" -gt 0 ]; then
  echo "check-newsletter-structure: $violations violation(s) in $brief" >&2
  exit 1
fi

echo "OK: newsletter structure lint passed ($brief)"
exit 0
