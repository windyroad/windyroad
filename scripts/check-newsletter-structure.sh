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
#   h  the ADR-032 provenance line sits before the first item heading
#   i  the **From Tom** author-voice opener is present
#   j  the closing CTA carries a question, not a statement or a forward request
#   k  no identical citation (same anchor text and URL) in two different sections
#   l  the LinkedIn post is within 1.5x the trailing median of recent editions
#   m  no gate verdict predates the draft being saved (P099 / ADR-047)
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
reviews="${brief%.md}.reviews.md"
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

# --- verdict ------------------------------------------------------------------
if [ "$violations" -gt 0 ]; then
  echo "check-newsletter-structure: $violations violation(s) in $brief" >&2
  exit 1
fi

echo "OK: newsletter structure lint passed ($brief)"
exit 0
