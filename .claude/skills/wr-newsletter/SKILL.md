---
name: wr-newsletter:generate
description: Draft a weekly Windy Road newsletter. Defaults to The Shift (persona=leader, target Engineering Leaders, publishes Monday mornings AEST per ADR 030). Pass persona=developer to draft Tokens Spent (target working Developers). Pipeline runs in three phases (ADR 017): pass phase=prep for pre-publish-day research and drafting, phase=finalise on the persona's publish-day for tier-1 refresh and publish, or phase=full (default) for the legacy single-shot run. Collects news from multiple sources, filters candidates through the Wardley precondition and three-lens criterion, updates the AI Engineering Landscape Wardley map, updates the map analysis, produces a brief that reports on what changed on the map, and runs voice + content-risk + SW-critic review gates with 3-round iteration. Saves the result to src/newsletters/drafts/<persona>/YYYY-MM-DD.md (or .prep.md during the prep phase). Run weekly when Tom is ready to produce a new issue.
allowed-tools: Read, Bash, WebFetch, Glob, Grep, Write, Edit, Skill, Agent, AskUserQuestion
---

# Windy Road newsletter generator

Weekly pipeline for either The Shift (persona=leader) or Tokens Spent (persona=developer). Persona and phase are both resolved at step 0 from `$ARGUMENTS`; everything downstream reads the resolved persona's config bundle and branches on phase. The brief is structured as commentary on a living Wardley map of the AI engineering landscape (ADR 014), with the map updated before the brief is drafted. The map and the source-fetch tier are shared across personas; weighting, voice addendum, headline, CTA, and save path differ per persona. Five review gates run on the outputs: voice (ADR 012), content-risk (ADR 012 + ADR 015 + ADR 018), SW-critic (ADR 016), editor (ADR 020), and cognitive accessibility (P053; one-round-with-optional-remediation pass against WCAG 2.2 cognitive SC + reading-grade-level target). Phase boundaries (ADR 017, refined by ADR 030) split the pipeline so the time-expensive work runs in the days before the persona's publish-day (prep) and publish-day morning is reserved for a tier-1 refresh plus publish (finalise).

## Reference

- Plan: `docs/ai-engineering-brief/PLAN.md`, `docs/ai-engineering-brief/developer-newsletter-concept.md`
- ADRs: `docs/decisions/011-ai-brief-orchestration-via-claude-code.proposed.md`, `012-ai-generated-content-review-gates.proposed.md`, `013-no-automated-linkedin-scraping.proposed.md`, `014-wardley-mapping-as-strategic-lens.proposed.md`, `015-reader-respect-and-gate-rejection-policy.proposed.md`, `016-sw-critic-subagents-and-iteration-loop.superseded.md` (superseded by ADR 033), `017-ai-brief-prep-and-finalise-phases.proposed.md`, `018-content-risk-subagent.proposed.md`, `019-capture-transcript-artifact.proposed.md`, `020-newsletter-editor-subagent.proposed.md`, `025-pass-with-author-overrides-verdict-for-sw-critic.proposed.md` (amended by ADR 035), `026-reviews-and-meta-content-to-sibling-files.proposed.md`, `033-domain-specific-critic-agents-supersede-parameterised-sw-critic.accepted.md`, `035-critic-rubric-shape-is-strengths-weaknesses-plus-context.accepted.md`
- Voice: `docs/VOICE-AND-TONE.md` (base) plus persona addendum from `personas/<persona>.md`
- Personas: `docs/JOBS_TO_BE_DONE.md` (J1-J4 leader, J5 founder, J6-J11 developer)
- Persona configs: `.claude/skills/wr-newsletter/personas/leader.md`, `.claude/skills/wr-newsletter/personas/developer.md`
- Landscape map: `docs/ai-engineering-brief/ai-landscape.owm`, `docs/ai-engineering-brief/ai-landscape.md`
- Rubrics: `.claude/skills/wr-newsletter/assets/wardley-critic-rubric.md`, `.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md`
- Critic agents (ADR 033): `.claude/agents/wr-newsletter-critic.md` (newsletter draft), `.claude/agents/wr-wardley-critic.md` (Wardley artifact). `.claude/agents/wr-sw-critic.md` is the legacy parameterised critic retained during Phase 2 -> Phase 3 transition; no live call sites in this skill.
- Filter: `.claude/skills/wr-newsletter/assets/three-lens-filter.md`
- Template: `.claude/skills/wr-newsletter/assets/draft-template.md`

## Phase model (ADR 017)

The pipeline runs in one of three phases, selected by the `phase` argument at step 0:

| phase     | When to run                          | Steps executed                              | Saves                              |
|-----------|--------------------------------------|---------------------------------------------|------------------------------------|
| `prep`    | Days before `<publish-day>` (e.g. Sat-Sun for The Shift's Monday publish per ADR 030) | 0, 1, 2 (all tiers), 3, 4, 4b, 5-9, 9.5, 10, 11, 11.5 (URL verify), 12 (image), 13, 14, 15, 15.25, 16 (as `.prep.md` + `.reviews.md`), 17 | `<draft-folder>/<publication-date>.prep.md` (brief) and `<publication-date>.reviews.md` (sibling) per ADR-026 |
| `finalise`| `<publish-day>` morning (Monday morning AEST for The Shift)                       | 0, 0.5 (load prep state), 2-prime (tier-1 refresh only), 1-prime (inbox diff), 10-prime (per-item capture on new items only), late-story branch (steps 5-9 if map-moving), 11a-prime (theme-anchor re-confirm gate per ADR-037), 11b-prime (re-draft only changed sections), 11.5-prime (URL re-verify on new/changed URLs), 12 (re-render image only if hook changed), 13, 14, 15, 15.25, 15.5 (LinkedIn post), 16 (rename `.prep.md` to `.md`, refresh `.reviews.md`, write `.linkedin.md`), 17 | `<draft-folder>/<publication-date>.md` (brief), `.reviews.md`, `.linkedin.md` siblings per ADR-026 |
| `full` (default if no phase argument) | First-time use, one-off editions, or weeks where no mid-week prep ran | 0, 1, 2, 3, 4, 4b, 5-9, 9.5, 10, 11, 11.5 (URL verify), 12 (image), 13, 14, 15, 15.25, 15.5 (LinkedIn post), 16, 17 | `<draft-folder>/<publication-date>.md` (brief), `.reviews.md`, `.linkedin.md` siblings per ADR-026 |

Default behaviour when no `phase` argument is present: `phase=full` (preserves the original single-shot run for backward compatibility per ADR 017 line 51).

The "prime" suffix on a step number means the finalise variant of that step. Where the prime variant is materially different (sources fetched, candidates filtered, items captured, sections drafted), the body of the step calls out the difference explicitly.

The critic gates (steps 9, 13, 14, 15, 15.25) run independently in prep and finalise. ADR 016's 3-round cap is read per-artifact-pass, not per-edition: prep produces `.prep.md` (one artifact pass, up to 3 rounds), finalise produces the final `.md` (a second artifact pass, up to 3 rounds). See ADR 017 lines 39-41.

## Pipeline

Execute in order. Each numbered step is a distinct phase.

### 0. Resolve persona and phase

Parse `$ARGUMENTS` for `persona=<value>` and `phase=<value>` pairs (order does not matter; both are optional).

Persona handling (unchanged):

- Default to `persona=leader` if absent.
- Valid values: `leader`, `developer`. Reject any other value with: `ERROR: unknown persona '<value>'. Valid personas: leader, developer. See .claude/skills/wr-newsletter/personas/ for available configs.`

Phase handling (new in ADR 017):

- Default to `phase=full` if absent (preserves the original single-shot behaviour).
- Valid values: `prep`, `finalise`, `full`. Reject any other value with: `ERROR: unknown phase '<value>'. Valid phases: prep, finalise, full. See ADR 017 for phase semantics.`
- Record the resolved phase alongside the persona in the draft summary and in any commit messages produced from this run.

Read the resolved persona config: `.claude/skills/wr-newsletter/personas/<persona>.md`. Bind the following variables for the rest of the pipeline:

- `<publication-name>`: e.g. "The Shift" or "Tokens Spent". Used in headline subtitle and Tom-summary.
- `<target-reader>`: e.g. "Engineering Leader (J1-J4)". Used in Tom-summary.
- `<source-weighting>`: tier ordering specific to the persona. Used at step 4 to break ties when shortlisting.
- `<three-lens-weighting>`: e.g. "human > operational > technical" or the inverse. Used at step 4 (lens scoring) and step 9.5 (persona-weighted ranking, once the map has been updated).
- `<voice-addendum>`: persona-specific voice notes (vocabulary preferences, evidence-stance language). Combined with the base `docs/VOICE-AND-TONE.md` rules at steps 11a (theme anchor) + 11b (body draft) per ADR-037.
- `<cta-invitation>`: invitation variants from the persona config; pick one per edition, rotating week-to-week to avoid repetition. There is no `<cta-description>` (services-pitch) variant: the CTA is invitation + closing line only (P090; ADR-023 funnel pause).
- `<welcome-line>`: persona-specific first-edition welcome text.
- `<headline-pattern>`: e.g. `"# <Title>\n\n*The Shift, AI engineering, week ending YYYY-MM-DD*"` or the Tokens Spent variant. The `YYYY-MM-DD` in "week ending" is `<week-ending>` (the Sunday), not `<publication-date>` (the publish day).
- `<draft-folder>`: e.g. `src/newsletters/drafts/leader/` or `src/newsletters/drafts/developer/`.
- `<published-folder>`: e.g. `src/newsletters/published/leader/` or `src/newsletters/published/developer/`. Per ADR-039, each published edition lives in a per-date sub-directory of this folder: `<published-folder>/<publication-date>/<publication-date>.<ext>`. The persona-archive `README.md` stays at the persona-folder root.
- `<publish-day>`: the day-of-week the persona publishes (e.g. `Monday` for leader / The Shift per ADR 030). Read from the persona-config frontmatter `publish-day` field. Required.
- `<publish-timezone>`: the IANA timezone the publish-day is anchored to (e.g. `Australia/Sydney` for leader, which is AEST/AEDT). Read from the persona-config frontmatter `publish-timezone` field. Required. The day-of-week comparison in `<publication-date>` uses this timezone, not the host's local time, so prep and finalise resolve the same publish-day regardless of where Tom runs them.

If either `publish-day` or `publish-timezone` is absent from the resolved persona config, do NOT guess or default to a hard-coded day. Surface to Tom via `AskUserQuestion` (per ADR 030 backward-compatibility clause):

- **question**: `"Persona '<persona>' config is missing publish-day and/or publish-timezone. ADR 030 requires both to be set per persona. Backfill now, or abort?"`
- **options**:
  - `Backfill now`: ask Tom for the day and timezone, then write them to the persona config frontmatter before continuing.
  - `Abort`: stop the pipeline. Tom can edit the persona config and re-invoke.
- **multiSelect**: false
- `<publication-date>` (ADR-026, P040, ADR 030): the ISO-format date (`YYYY-MM-DD`) used for all draft and companion-file paths in this run. Compute as follows: if today in `<publish-timezone>` is `<publish-day>`, use today; otherwise use the next `<publish-day>` after today. The brief is published on `<publish-day>`, so all `<draft-folder>/<publication-date>.X` paths share the publication-day date regardless of when prep runs. This binding is the single date source for all FILE PATHS (steps 10, 11, 12, 16, and 17).
- `<week-ending>` (ADR 030): the reader-facing "week ending" label, distinct from `<publication-date>`. A week does not end on the publication Monday, so the label uses the Sunday that ends the editorial week: the most recent Sunday on or before `<publication-date>`. For the leader persona's Monday publish-day this is `<publication-date>` minus one day (e.g. publication-date 2026-05-25 gives week-ending 2026-05-24). `<week-ending>` is a DISPLAY LABEL ONLY: it appears in the headline subtitle, the cover "WEEK ENDING" stamp, and the capture-transcript header, and it NEVER appears in a file path (P040's single path-source binding remains `<publication-date>`). Use `<week-ending>` everywhere the text reads "week ending"; use `<publication-date>` for every filename.

Branch on phase:

- `phase=full` or `phase=prep`: continue to step 1.
- `phase=finalise`: continue to step 0.5.

### 0.5. Load prior prep state (phase=finalise only)

Skip this step unless `phase=finalise`.

Locate the most recent `<draft-folder>/*.prep.md`:

```
Glob: <draft-folder>/*.prep.md
```

Pick the file with the most recent `prep-date` frontmatter value (tie-break by filename ISO date). If no `.prep.md` is found, surface to Tom via `AskUserQuestion`:

- **question**: `"phase=finalise was requested but no .prep.md draft was found in <draft-folder>. Run as phase=full instead, or abort?"`
- **options**:
  - `Run as phase=full`: rebind phase variable to `full` and continue to step 1.
  - `Abort`: stop the pipeline. Tom can re-invoke with phase=prep.
- **multiSelect**: false

If a `.prep.md` is found, read it and parse its frontmatter. Required fields:

- `phase: prep` (sanity check)
- `prep-date: YYYY-MM-DD`
- `prep-source-cutoff: <ISO timestamp>`
- `source-failures`: list of tier-1/tier-2/tier-3 source URLs that failed during prep
- `map-mutation-status`: `mutated` or `skipped` (with reason if skipped)

Bind the prior-prep state for downstream steps:

- `<prep-draft-body>`: the full body content after the frontmatter (per ADR-026, the prep `.prep.md` contains only frontmatter + body; no review-block separator is present).
- `<prep-shortlist-snapshot>`: the list of items represented in the prep draft (parse the `### Item N` blocks).
- `<prep-inbox-snapshot>`: the inbox files that were resolved during the prep run (recorded in the `.prep.md` frontmatter or, if absent, derived from the prep-date by re-globbing `src/newsletters/inbox/*.md` and filtering to mtime <= prep-source-cutoff).
- `<prep-tier1-snapshot>`: the tier-1 candidate set as recorded in prep metadata (or, if absent, the tier-1 items resolvable from the prep-draft Source lines).
- `<prep-image-path>`: the path to the cover image generated in step 12 of the prep run, if any.
- `<prep-source-failures>`: the list of source URLs that failed in prep.
- `<prep-map-mutation-status>`: whether the map was mutated in prep.
- `<prep-reviews-path>`: `<draft-folder>/<publication-date>.reviews.md` (per ADR-026). Read this sibling file to extract prep-time review blocks (Voice Review, Content Risk Review, Critic Review (Newsletter), Editor Review, Cognitive Accessibility Review, Critic Review (Wardley Artifacts), Map Delta, URL Verification) for the carry-forward sections in the finalise reviews file at step 16.

Continue to step 1-prime.

### 1. Check the inbox

```
Glob: src/newsletters/inbox/*.md
```

Read any matching files. Each file contains a link plus a one-sentence note (see `src/newsletters/inbox/README.md`). Carry these as candidates. They skip the source-fetch step but still pass through the Wardley precondition and the three-lens filter.

**Phase variant `1-prime` (phase=finalise only):** instead of treating every inbox file as a fresh candidate, diff the current inbox glob against `<prep-inbox-snapshot>`. New files (those not in the snapshot) are flagged as new-inbox-since-prep and surfaced via per-item interactive capture at step 10-prime. Files already present in the snapshot are carried forward via `<prep-shortlist-snapshot>` and do not need re-filtering.

### 2. Fetch all sources

Fetch the following in parallel where possible. Each source has an extraction prompt attached.

**Phase variant `2-prime` (phase=finalise only):** re-fetch tier 1 only (all tier-1 sources; see the tier-1 block below). Tier 2 and tier 3 are carried forward from `<prep-shortlist-snapshot>` and the prep-time `source_failures` list. The tier-1 refresh is the entire point of finalise: it picks up launches that landed after the prep cutoff and could not have been seen mid-prep. For The Shift specifically (Monday-morning AEST publish, ADR 030), this window captures Friday US/EU launches that broke after the weekend prep run. New tier-1 items are diffed against `<prep-tier1-snapshot>` (by URL); only the new entries are carried into step 3-prime (build candidate list).

**Tier 1 (critical, fail the map update if any of these fail):**

- **Anthropic news**: `WebFetch https://www.anthropic.com/news` with prompt: "Extract the 10 most recent news items. For each: title, absolute URL, date if visible, one-sentence summary. Return as numbered list."
- **OpenAI news** (Playwright cache primary; Google News RSS fallback per P010). Walk these rungs in order (ADR-029 tier-1 fallback precedence). The first rung that yields items wins; do NOT call later rungs once a rung returns items. The map-update gate (step 5) reads `source_failures` only; it does not care which rung produced the items.

  1. **Playwright cache** at `.cache/newsletters/openai-news/<YYYY-MM-DD>.json` (P014a fetcher; ADR-029). If the most-recent file exists AND its `fetched_at` is within 48 hours of now, `Read` the JSON and consume the items array. Each item already has `{title, url, date, summary}` per the ADR-029 schema; canonical `openai.com/index/...` URLs (not Google News landers).
  2. **Auto-invoke fetcher** (P014c). If rung 1 finds no fresh cache, run `Bash npm run fetch:newsroom -- --source=openai` from the project root. The helper writes the canonical cache file synchronously (~3-4s). After the Bash returns successfully, retry rung 1 to consume the new cache. If the helper exits 2 (zero items extracted) or non-zero (Playwright failure), advance to rung 3. Do NOT retry the auto-invoke within the same SKILL run.
  3. **Google News RSS fallback** (P010 workaround): `WebFetch https://news.google.com/rss/search?q=site:openai.com&hl=en-US&gl=US&ceid=US:en` with prompt: "Extract the 10 most recent items syndicated from openai.com. For each: title, absolute URL (prefer the openai.com URL where Google News provides it; fall back to the Google News redirect URL otherwise), date if visible, one-sentence summary. Return as numbered list." Note: the direct page `https://openai.com/news/` returns HTTP 403 to WebFetch (Cloudflare bot protection); Google News RSS scoped to `site:openai.com` is the documented fallback per P010. URLs may resolve to `help.openai.com` or `platform.openai.com` landers rather than the canonical announcement page; downstream steps can follow the Google News redirect to surface the primary URL where needed.
  4. **All rungs empty or failed**: record `openai-news` in `source_failures` per the tier-1 failure policy.
- **Google DeepMind blog**: `WebFetch https://deepmind.google/discover/blog/` with prompt: "Extract the 10 most recent blog posts. For each: title, absolute URL, date if visible, one-sentence summary. Return as numbered list."
- **US/UK AI-policy news (via Google News RSS, P051)**: `WebFetch https://news.google.com/rss/search?q=(site:politico.com+OR+site:axios.com+OR+site:reuters.com)+AI&hl=en-US&gl=US&ceid=US:en` with prompt: "Extract the 10 most recent items from politico.com, axios.com, or reuters.com that mention AI, artificial intelligence, AI policy, AI regulation, AI safety, AI executive order, or AI Act. For each: title, absolute URL (prefer the outlet's direct URL where Google News provides it; fall back to the Google News redirect URL otherwise), date if visible, one-sentence summary. Return as numbered list." Note: reporter coverage of US and UK AI policy actions, often surfacing days or weeks before the regulator's own page updates. Single combined query (Politico OR Axios OR Reuters) is treated as ONE source for failure-tracking purposes per the OpenAI precedent (P010); this halves the map-update-block surface vs three separate queries.

**Tier 2 (important, continue on fail):**

- **Hacker News AI frontpage**: `WebFetch https://hnrss.org/frontpage?q=AI` with prompt: "Extract the top 10 items. For each: title, link URL, one-sentence summary. Skip items clearly not about AI."
- **Hacker News AI /newest**: `WebFetch https://hnrss.org/newest?q=AI&points=50` with prompt: "Extract the top 10 items with at least 50 points. For each: title, link URL, one-sentence summary. Skip items clearly not about AI."

**Reddit coverage** (P014b landed): `reddit.com` URLs are refused by the WebFetch tool layer; the Playwright helper from P014 reads `shreddit-post` web-component attributes from the modern Reddit HTML page (anonymous, no consent gate fires). Both Reddit entries below follow the ADR-029 three-rung precedence applied at tier-2 continue-on-fail policy: (1) Playwright cache fresh, (2) skip (no RSS fallback for Reddit), (3) record `source_failures` and continue.

- **Reddit r/LocalLLaMA** (Playwright cache primary; no RSS fallback). Walk these rungs in order; first rung that yields items wins.

  1. **Playwright cache** at `.cache/newsletters/reddit-locallama/<YYYY-MM-DD>.json` (P014b fetcher; ADR-029). If the most-recent file exists AND its `fetched_at` is within 48 hours of now, `Read` the JSON and consume the items array. Each item already has `{title, url, date, summary}` per the ADR-029 schema (canonical `reddit.com/r/LocalLLaMA/comments/...` permalinks; summary is `<score> upvotes, <count> comments` for the filter to use as a signal hint).
  2. **Auto-invoke fetcher** (P014c). If rung 1 finds no fresh cache, run `Bash npm run fetch:newsroom -- --source=reddit-locallama` from the project root. The helper writes the canonical cache file synchronously (~5-8s including 2 scroll cycles). After the Bash returns successfully, retry rung 1. If the helper exits 2 (zero items, possible Reddit DOM drift) or non-zero (Playwright failure), advance to rung 3. Do NOT retry the auto-invoke within the same SKILL run.
  3. **Empty or failed**: record `reddit-locallama` in `source_failures` per the tier-2 continue-on-fail policy.

- **Reddit r/MachineLearning** (Playwright cache primary; no RSS fallback). Same rung structure as r/LocalLLaMA.

  1. **Playwright cache** at `.cache/newsletters/reddit-machinelearning/<YYYY-MM-DD>.json` (P014b fetcher; ADR-029). Filter the items downstream: focus on research results and industry developments, skip pure academic discussion.
  2. **Auto-invoke fetcher** (P014c). If rung 1 finds no fresh cache, run `Bash npm run fetch:newsroom -- --source=reddit-ml` from the project root. After the Bash returns successfully, retry rung 1. Exit 2 or non-zero advances to rung 3. Do NOT retry within the same SKILL run.
  3. **Empty or failed**: record `reddit-machinelearning` in `source_failures` per the tier-2 continue-on-fail policy.
- **Simon Willison weekly notes**: `WebFetch https://simonwillison.net/atom/everything/` with prompt: "Extract the 5 most recent posts. For each: title, URL, date, one-sentence summary."
- **AI Daily Brief (beehiiv)**: `WebFetch https://aidailybrief.beehiiv.com/` with prompt: "Extract the 10 most recent posts or episodes. For each: title, absolute URL to the post, publish date, one-sentence summary. Prioritise items that cover societal, policy, personnel, or industry-dynamics stories (for example: attacks on AI-company executives, AI-regulation votes, major hires or departures, enterprise-adoption shifts, public-reaction events). Deprioritise items that are pure product announcements from Anthropic, OpenAI, or Google DeepMind, since those are already covered by tier-1 sources. If the archive is teaser-only, return the surface-level title and date; the downstream step can follow links as needed."
- **Thoughtworks Radar**: `WebFetch https://www.thoughtworks.com/radar` with prompt: "Extract any new or moved AI, LLM, or agent-related blips in the most recent edition. For each: blip name, quadrant (Techniques/Tools/Platforms/Languages & Frameworks), ring (Adopt/Trial/Assess/Hold), one-sentence description."
- **ArXiv cs.AI recent**: `WebFetch https://arxiv.org/list/cs.AI/recent` with prompt: "Extract the 10 most recent papers from this listing. For each: title, arxiv abstract URL, authors, one-sentence summary. Focus on applied and systems-oriented work, skip pure theory."
- **US AI-business news (via Google News RSS, P051)**: `WebFetch https://news.google.com/rss/search?q=(site:nytimes.com+OR+site:bloomberg.com+OR+site:wsj.com)+AI&hl=en-US&gl=US&ceid=US:en` with prompt: "Extract the 10 most recent items from nytimes.com, bloomberg.com, or wsj.com that mention AI, artificial intelligence, machine learning, or AI policy. For each: title, absolute URL (prefer the outlet's direct URL where Google News provides it; fall back to the Google News redirect URL otherwise), date if visible, one-sentence summary. Return as numbered list." Note: paywalled outlets accessed via Google News snippets per P051; full article access requires subscription. Single combined query (NYT OR Bloomberg OR WSJ) is treated as ONE source for failure-tracking purposes; tier-2 policy is continue-on-fail, so a Google News quota or rate-limit issue is non-blocking.

**Tier 3 (regulatory, continue on fail):**

- **Australia OAIC**: `WebFetch https://www.oaic.gov.au/newsroom` with prompt: "Extract the 5 most recent news items mentioning AI, automated decision-making, or data privacy. For each: title, URL, date, one-sentence summary."
- **EU AI Act updates**: `WebFetch https://artificialintelligenceact.eu/` with prompt: "Extract the most recent developments, implementation updates, or guidance documents. For each: title, URL, date, one-sentence summary."
- **UK AI Safety Institute**: `WebFetch https://www.aisi.gov.uk/work` with prompt: "Extract the 5 most recent publications or announcements. For each: title, URL, date, one-sentence summary."
- **NIST AI**: `WebFetch https://www.nist.gov/news-events/news/search?key=&topic-op=or&topic-area-fieldset%5B%5D=2753736` with prompt: "Extract the 5 most recent AI-related news items or publications. For each: title, URL, date, one-sentence summary." (URL corrected 2026-05-24: the prior `/artificial-intelligence/news` path 404s. This is the NIST news-search endpoint; the `topic-area-fieldset[]=2753736` query param is the load-bearing filter, where `2753736` is NIST's topic ID for the AI topic area. If NIST renumbers its topic taxonomy this feed breaks silently; re-derive the ID from the AI filter on the news-search page. NIST is low-velocity, so expect the most recent items to be weeks or months old.)
- **US FTC AI actions**: `WebFetch https://www.ftc.gov/news-events/news/press-releases` with prompt: "Extract the 5 most recent press releases that mention artificial intelligence, AI, machine learning, or automated decision-making. For each: title, URL, date, one-sentence summary."
- **OECD AI**: `WebFetch https://oecd.ai/en/wonk/news` with prompt: "Extract the 5 most recent news items. For each: title, URL, date, one-sentence summary."

For any source whose URL 404s or whose extraction fails, note the failure in a local `source_failures` list and continue. Do not retry more than once per source. Record the ISO timestamp of completion of this step as `<source-cutoff>`; this is the value that gets written into `prep-source-cutoff` when phase=prep saves at step 16.

**Other currently-blocked sources (P010 investigation)**: US FTC press releases (`https://www.ftc.gov/news-events/news/press-releases`) returned 403 on first-run testing (likely the same Cloudflare-class bot protection as OpenAI; a Google News RSS query scoped to `site:ftc.gov` is the same-pattern fallback when needed) and OECD AI news (`https://oecd.ai/en/wonk/news`) returned 404 on first-run testing (URL drift; a Google News RSS query scoped to `site:oecd.ai` is the same-pattern fallback). These are tier-3 regulatory sources, so failures are non-blocking under the existing policy; the entries are retained for when the underlying issues clear or a follow-up edit applies the Google News fallback. If WebFetch returns 403 (bot protection) on any tier-1, tier-2, or tier-3 source, the Google News RSS fallback used for OpenAI is the first thing to try; if WebFetch returns a tool-layer refusal (Reddit-style), defer to P014's Playwright helper.

### 3. Build the candidate list

Combine inbox items, tier-1, tier-2, and tier-3 extracted items into one candidate list. Deduplicate where the same story appears in multiple feeds (prefer the primary source, for example Anthropic's own announcement over an HN discussion of it).

Record per-tier counts and the `source_failures` list so the Tom-summary can report on source coverage.

**Phase variant `3-prime` (phase=finalise only):** the candidate list is `<prep-shortlist-snapshot>` plus any new tier-1 items from step 2-prime plus any new inbox items from step 1-prime. Carry the prep-time tier-2 and tier-3 candidates forward unchanged; finalise does not re-fetch them and does not re-filter them. Only the new (post-prep) candidates need filtering at step 4-prime.

### 4. Apply the Wardley preference + three-lens filter

Read `.claude/skills/wr-newsletter/assets/three-lens-filter.md` and `docs/ai-engineering-brief/ai-landscape.md`.

For every candidate:

1. **Wardley preference**: tag each candidate `MAP_ANCHORED` or `NO_MAP_ANCHOR` against the previous week's map. Map anchoring is a preference, not a precondition; a candidate without a clean map anchor can still qualify on three-lens strength alone (see the asset `three-lens-filter.md` for the full policy). The map update itself runs next at step 5, before per-item voice capture.
2. **Three-lens scoring**: for surviving candidates, score yes or no on technical, operational, human. Keep those scoring yes on at least two. Each yes-scored lens MUST record a `named_action: <one-sentence>` field in the candidate's metadata, drawn from the persona-conditional action vocabulary in `three-lens-filter.md` (the action the `<target-reader>` should take this quarter). A lens with no nameable persona-conditional action scores no, regardless of topical fit. The named-action requirement absorbs the prior post-filter "significant for the Engineering Leader persona" check (P043 Option C).
3. **Source tagging**: for each surviving candidate, inspect the URLs on the candidate. Tag `HAS_PRIMARY_SOURCE` if any URL is a tier-1 primary outlet (any tier-1 source per the tier-1 block at step 2, or any outlet in the primary-outlet allowlist in `three-lens-filter.md`). Tag `NO_PRIMARY_SOURCE` if the only URLs are secondary aggregators (AI Daily Brief, Stratechery, podcast notes, letsdatascience.com, aidailybrief.beehiiv.com). The corroboration sub-step 4b acts on the `NO_PRIMARY_SOURCE` set.

The filtered list is the interim shortlist passed to step 4b (corroboration) and then to steps 5 through 9. There is no upper cap. Minimum three. If fewer than three candidates clear the filter, note the shortfall in the summary for Tom rather than padding. **Persona-weighted ranking runs after the map is updated** (see step 9.5), because the ranking needs this week's map positions, not last week's.

**Phase variant `4-prime` (phase=finalise only):** apply the filter only to the new (post-prep) candidates from step 3-prime. The prep-time shortlist is already filter-passed; it does not need re-filtering. New candidates that clear the filter join the shortlist; new candidates that fail are dropped silently (they were not in the prep edition and never made it to a per-item capture).

### 4b. Corroborate aggregator-only candidates (P016)

For every candidate tagged `NO_PRIMARY_SOURCE` at step 4 that also scored yes on at least two lenses, attempt multi-outlet corroboration before finalising the shortlist. This step closes the P016 failure mode where the filter silently dropped the Tim Cook transition from the 2026-04-24 edition despite multi-outlet primary coverage being one query away.

For each qualifying candidate:

1. Extract the named entity from the candidate title (person, company, product, policy, or event).
2. URL-encode the named entity and issue one Google News RSS query:

   ```
   WebFetch https://news.google.com/rss/search?q=<encoded-entity>&hl=en-US&gl=US&ceid=US:en
   ```

   Extraction prompt: "Extract the top 5-10 items. For each: outlet (publisher name), headline, absolute URL, publish date. Skip items that are clearly re-posts of a wire story (opening with 'per Reuters', 'via AP', etc.) rather than independent primary reporting."

3. Count distinct primary outlets (see the primary-outlet allowlist in `three-lens-filter.md`). The same outlet domain counts once regardless of how many Google News entries it has; aggregator re-posts do not count.

4. Apply the threshold:
   - **3+ distinct primary outlets**: tag the candidate `CORROBORATED_PRIMARY`. Attach the 3 strongest outlet/URL pairs to the candidate's metadata (this becomes the Source line's attribution in step 11b). Move the candidate into the main shortlist as if it were tier-1-sourced.
   - **0 to 2 distinct primary outlets**: tag the candidate `WEAK_ATTRIBUTION`. Do NOT drop. Carry on a separate weak-attribution list that step 10 surfaces to Tom for explicit keep/drop/ask-for-help resolution.

5. Record per-candidate corroboration outcome in internal metadata (count of distinct primary outlets, query used, top 3 outlets). The Tom-summary at step 17 reports on the corroboration pass.

**Placement rationale** (P016 investigation task resolution): corroboration runs AFTER three-lens scoring so weak-three-lens candidates are cheap-dropped before burning a Google News query, and BEFORE the map-mutation gate (step 5) so `CORROBORATED_PRIMARY` candidates can legitimately anchor to map movement in step 6. Tier-1-sourced candidates bypass this step entirely; the expected fan-out is 0-2 Google News queries per edition in a typical week.

**Precedent**: the Google News RSS mechanism is already established in the pipeline for OpenAI tier-1 source-fetch fallback (see `docs/ai-engineering-brief/ai-landscape.md` Source-coverage notes and P010). This sub-step reuses the same mechanism for a second use case; a follow-up ADR amendment codifying Google News RSS as a first-class pipeline primitive for both tier-1 fallback and aggregator corroboration is advisable (see `docs/decisions/031-google-news-redirect-resolution-as-pipeline-primitive.proposed.md`).

**Phase variant `4b-prime` (phase=finalise only):** corroborate only new (post-prep) candidates that landed in `NO_PRIMARY_SOURCE`. Prep-time corroboration outcomes are carried forward in `<prep-shortlist-snapshot>`.

### 5. Map-mutation gate (ADR 016 failure-mode rule)

Before touching the map, check the `source_failures` list. If any **tier-1 source** (any tier-1 source; see the tier-1 block at step 2) failed this run, **do not mutate the map this week**.

In the tier-1-fail case:
- Skip steps 6, 7, 8 (map update, render, analysis update).
- Produce the brief against the *unchanged* map from the previous run.
- Note the skip in the summary: "MAP_UPDATE_SKIPPED: tier-1 source(s) <names> failed, running against previous map."
- Each item's Map movement line refers to existing movement in the current analysis, not to any update this run.

If all tier-1 sources succeeded, proceed to step 6. Tier-2 or tier-3 failures do not block map mutation; record them in a note on the commit message when the map is updated.

**Phase variant `5-prime` (phase=finalise only): late-breaking map-moving story branch (ADR 017 line 74).** If step 2-prime surfaced new tier-1 items (and step 4-prime kept any of them), evaluate whether any of the kept new items is **map-moving**: would including it require a new component, a moved component, an evolution-arrow change, or a dependency edit relative to the map state recorded in `<prep-map-mutation-status>`? Use the same map-anchoring rubric as step 4.

Branch:

- **No new map-moving stories**: skip steps 6-prime through 9-prime. The map state from prep is carried forward as the published map this week. Continue to step 9.5-prime.
- **At least one new map-moving story**: surface to Tom via `AskUserQuestion`:
  - **question**: `"Late-breaking item lands as map-moving: <story summary>. Treat as Also-worth-noting (no map mutation), or Restructure (re-mutate map, re-run Wardley critic)?"`
  - **options**:
    - `Also-worth-noting`: keep the item but do not mutate the map. Add as Also-worth-noting in step 11b-prime. Continue to step 9.5-prime.
    - `Restructure`: re-run steps 6, 7, 8, 9 against the prep-time map plus the new map-moving items. The Wardley critic gets a fresh per-artifact-pass budget per ADR 017 lines 39-41. Continue to step 9.5-prime once the critic passes.
  - **multiSelect**: false

Record the branch decision in internal metadata for Tom-summary reporting at step 17.

### 6. Update `ai-landscape.owm`

Read `docs/ai-engineering-brief/ai-landscape.owm`.

For each shortlisted candidate, propose one or more of:
- Component position change: update a component's `[visibility, evolution]` coordinates.
- Evolution arrow update: change an `evolve X <target>` line's target, or add/remove an arrow.
- New component: add a `component <Name> [v, e]` line.
- Dependency change: add or remove a `A->B` link.
- Component removal or merge: remove a `component` line (only if a component is genuinely gone from the landscape, not just unmentioned this week).

Apply the changes to the `.owm` file. Preserve any hand-edited positions from prior Tom overrides; only change what this week's evidence warrants.

### 7. Re-render the map

```bash
node ~/.claude/plugins/cache/windyroad/wr-wardley/0.1.0/skills/generate/owm-to-svg.mjs docs/ai-engineering-brief/ai-landscape.owm docs/ai-engineering-brief/ai-landscape.svg
```

If the render fails, revert the `.owm` edit and note the failure in the summary.

### 8. Update `ai-landscape.md`

Read the current `docs/ai-engineering-brief/ai-landscape.md` and update:
- The Differentiation / Evolution / Risk / Decisions sections to reflect the new map state.
- Add a short "This week" note near the top of the Analysis section summarising what moved and why.
- Check that every `evolve` arrow in the `.owm` has a corresponding Evolution-section explanation. The simplified Wardley critic (ADR 035) will flag missing explanations as a weakness; landing this consistency at draft time avoids round-2 rework.
- Check that every component in Genesis or Custom-Built phase appears in Differentiation. Silent omissions of custom components surface as critic weaknesses.

### 9. Critic loop on the Wardley artifacts (ADR 016, ADR 025, ADR 035)

Run the critic agent against the updated map and analysis. Per ADR 035, the rubric is a brief editorial prompt (STRENGTHS, WEAKNESSES, optional RELEVANT CONTEXT); no structured numbered-check list, no `accepted_overrides` allowlist. The critic is an editorial reader of the analytical quality of the artifact.

```
Agent subagent_type: wr-wardley-critic
prompt: "Review the Wardley artifact.

artifact_path: /Users/tomhoward/Projects/windyroad/docs/ai-engineering-brief/ai-landscape.md
rubric_path: /Users/tomhoward/Projects/windyroad/.claude/skills/wr-newsletter/assets/wardley-critic-rubric.md
round_number: 1
prior_weaknesses: n/a"
```

Parse the returned `CRITIC_REVIEW` block:
- If `VERDICT: PASS`: proceed to step 9.5.
- If `VERDICT: WEAKNESSES_FOUND`: fix each listed weakness in `ai-landscape.md` (or `.owm` if the weakness is structural). Re-invoke the critic with `round_number: 2` and `prior_weaknesses: <round-1 weaknesses verbatim>`.
- Repeat for up to round 3. On `VERDICT: PASS_WITH_AUTHOR_OVERRIDES`: the drafter has accepted a critic-flagged weakness as an editorial choice (named verbatim in the saved review block per ADR 035). Proceed to step 9.5 because the variant is publish-ready.
- On `VERDICT: REJECTED` with `REJECTED_REASON: critic-loop-exhausted`, save the review block with the artifacts and note the unresolved weaknesses in the summary, but still proceed to step 9.5. The map is the best we have this week; a weak map still beats no map.

Capture the final critic block for inclusion in the saved draft.

**Phase variant `9-prime` (phase=finalise only):** runs only when the late-story branch (step 5-prime) chose `Restructure`. The critic gets a fresh per-artifact-pass budget (up to 3 rounds) under ADR 017 lines 39-41, distinct from the prep-time critic budget. If `Also-worth-noting` was chosen, skip 9-prime and carry the prep-time Wardley critic block forward.

### 9.5. Persona-weighted ranking

Among the candidates that cleared step 4, and using this week's updated map (steps 5-8) plus the Wardley critic's latest verdict (step 9), order by `<three-lens-weighting>` from the persona config. Items strong on the persona's primary lens rank above items strong only on secondary lenses. Ties broken by `<source-weighting>` (a primary-tier-source item beats a secondary-tier-source item on the same lens score). Map movement this week is explicit input to the ordering: candidates whose related map component moved this week rank above candidates with comparable lens scores whose components did not move.

Output: the final persona-weighted shortlist. This is the input to step 10's per-item voice capture.

**Phase variant `9.5-prime` (phase=finalise only):** re-rank only if new items joined the shortlist at step 4-prime, or if the late-story branch (step 5-prime) chose `Restructure` (which changes map state and may shift the ranking input). Otherwise carry `<prep-shortlist-snapshot>`'s ranking forward unchanged.

### 10. Per-item interactive voice capture (AskUserQuestion)

For each shortlisted candidate, call the `AskUserQuestion` tool with:

- **question**: `"Item <N>: <one-sentence story summary>. Our take: <1-2 sentences on why it matters or the angle we'd emphasise, grounded in this week's map movement from step 8's analysis>. Source: <URL>. Agree, Adjust, or Drop?"`
- **options**:
  - `Agree`: carry the candidate forward with the original take.
  - `Adjust`: Tom edits or adds via the "Other" free-text escape hatch. His text becomes source material for the item's Why-it-matters and Human-angle lines.
  - `Drop`: remove from shortlist; record Tom's reason in internal metadata.
- **multiSelect**: false

Because the map has already been updated (steps 5-8) and the Wardley critic has already passed (step 9), the "Our take" presented per item is informed by this week's actual landscape movements, not by last week's analysis applied to raw candidates. Tom's adjusts land against the richer substrate, so the "From Tom" opener and Why-it-matters lines have more to push off.

Capture per-item responses. Adjusts feed the drafter (step 11b): Why-it-matters and Human-angle lines incorporate Tom's phrasing where he gave any, otherwise use the original take. The "From Tom" opener (step 11b) is assembled from the strongest POV across Tom's adjusts that week.

If zero candidates get an Adjust with a strong POV, the opener defaults to a meta-observation about the week's theme (not a model-guess at Tom's voice). Note in the summary.

After the main shortlist per-item capture completes, run a second pass for any candidates tagged `WEAK_ATTRIBUTION` at step 4b (P016). For each weak-attribution candidate, call `AskUserQuestion` with:

- **question**: `"Weak-attribution item <N>: <one-sentence story summary>. Aggregator-only source: <aggregator URL>. Corroboration outcome: <N> distinct primary outlets found (<list of outlet names>); threshold for primary-sourced treatment is 3. Keep as Also-worth-noting, Drop, or Ask for help?"`
- **options**:
  - `Keep as Also-worth-noting`: include in the draft as an Also-worth-noting entry (not a full Item block). Attribution line names the aggregator plus any primary outlets that did surface.
  - `Drop`: remove from consideration. Record reason in internal metadata.
  - `Ask for help`: Tom wants to discuss further before deciding. Free-text capture via "Other". The drafter pauses on this item; the Tom-summary surfaces the unresolved question.
- **multiSelect**: false

Weak-attribution handling preserves the signal that the earlier filter would have silently dropped. A weak-attribution candidate that Tom keeps joins the main draft as an Also-worth-noting entry (short paragraph, not a full Item). Tom's Drop reasons feed future filter tuning.

**Capture transcript artifact (ADR 019).** After both passes (main shortlist plus weak-attribution) complete, write the per-item capture decisions to `<draft-folder>/<publication-date>.capture.md`. This file is the persisted reference the drafter (step 11b) reads against to preserve verbatim spans, and the comparison surface for human editorial review. Format per ADR 019:

```
---
persona: <leader|developer>
edition: <N from step 11a>
date: <YYYY-MM-DD>
phase-written: <prep|finalise|full>
phase-last-appended: <prep|finalise|full>
---

# Capture transcript: <publication-name>, week ending <week-ending>

## Item N: <one-sentence story summary>

- **Outcome**: <Agree | Adjust | Drop | Keep as Also-worth-noting | Ask for help>
- **Original take presented**: <the "Our take" sentence shown in the AskUserQuestion prompt>
- **Source**: <URL>
- **Adjust text** (if outcome is Adjust):

  > <Tom's free-text verbatim, indented as quoted block>

- **Drop reason** (if outcome is Drop): <Tom's reason>
- **Ask for help question** (if outcome is Ask for help): <Tom's question>
```

For `phase=full` and `phase=prep`, write the file once after capture completes. Today's consumer is the drafter at step 11b; future consumers (possible voice / content-risk extensions) are scoped per ADR 019. The voice gate (step 13), content-risk gate (step 14), and SW-critic (step 15) do not read this file in the current pipeline.

**Phase variant `10-prime` (phase=finalise only):** run per-item capture only on:

1. New tier-1 items from step 2-prime that cleared step 4-prime, plus new inbox items from step 1-prime.
2. Late-story `Also-worth-noting` items from the step 5-prime branch (if `Also-worth-noting` was chosen).
3. New `WEAK_ATTRIBUTION` candidates from step 4b-prime (a separate pass, same as step 10's second pass).

Prep-time per-item responses (Agree, Adjust, Drop) are carried forward via `<prep-shortlist-snapshot>` and not re-asked. Tom's prep-time Adjusts and Drops still drive the corresponding Item blocks in the finalise draft.

**Capture transcript append (ADR 019).** Read the existing `<draft-folder>/<publication-date>.capture.md` written during prep. Append new-item sections (only the items captured in 10-prime: new tier-1, late-story Also-worth-noting, new WEAK_ATTRIBUTION). Update frontmatter `phase-last-appended: finalise`. Do not rewrite or delete prep-time entries. The append step must check for an existing item-section anchor before writing to avoid duplicates on a partial-failure re-run (ADR 019 Consequences/Bad).

**Missing-capture-file handling (ADR 019).** If the expected `<draft-folder>/<publication-date>.capture.md` is absent at the start of 10-prime, surface to Tom via `AskUserQuestion`:

- **question**: `"phase=finalise expected a capture transcript at <expected-path>. Continue without capture transcript (drafter discipline rule has no input for prep-time items), Recreate transcript from prep-time shortlist (best-effort, Adjust text will be empty), or Abort?"`
- **options**: `Continue without capture transcript`, `Recreate transcript from prep-time shortlist`, `Abort`.
- **multiSelect**: false

Default branch when Tom is unavailable: `Continue without capture transcript`. The drafter loses the verbatim-preservation reference for prep-time items but does not block publication. Note the missing-file event in the Tom-summary at step 17.

### 11a. Compose theme anchor (H1 + cover hook + theme statement) per ADR-037

Before drafting, determine the edition number per the persona config's `## Edition counting` rule: scan files matching the canonical brief shape `YYYY-MM-DD.md` (eight digits and dashes, then `.md`) across BOTH `<published-folder>/*/<YYYY-MM-DD>.md` (per-date sub-directory shape per ADR-039) and `<draft-folder>/<YYYY-MM-DD>.md` (flat shape, drafts layout unchanged), read each match's frontmatter `edition:` value, take the maximum, and add one for the current draft. The `YYYY-MM-DD.md` basename filter excludes ADR-026 sibling files (`.linkedin.md`, `.reviews.md`, `.capture.md`) and folder index files (`README.md`) by construction; do NOT use a plain `*.md` glob (P062). If no prior edition file exists in either folder, the next edition is 1. Assert that the computed edition number is exactly one greater than the highest prior `edition:` value before writing the draft frontmatter; if not, surface to Tom and abort rather than publishing with a wrong issue number. Write the edition number into the draft frontmatter (`edition: N`) so the critic (ADR 035) can reason about first-edition vs ongoing framing when deciding whether to flag a missing welcome line as a weakness. For edition 1, include the persona's `<welcome-line>` above the voice opener; for edition >=2, drop or freshly reframe the welcome line rather than repeating the first-edition text.

Read `docs/VOICE-AND-TONE.md` (base) and the `<voice-addendum>` from the persona config, plus `.claude/skills/wr-newsletter/assets/draft-template.md` and `docs/ai-engineering-brief/ai-landscape.md`.

Compose the theme anchor (text only at 11a; cover image render stays at step 12 unchanged per ADR-037 sub-decision 1 / Option C, Tom-pinned 2026-06-03):

- **Headline (H1)**: a unique POV-carrying H1 (6-12 words). Follow on the next non-blank line with the persona's `<headline-pattern>` subtitle (e.g. `*The Shift, AI engineering, week ending YYYY-MM-DD*` for leader, or `*Tokens Spent, AI engineering for developers, week ending YYYY-MM-DD*` for developer). The `YYYY-MM-DD` is `<week-ending>` (the Sunday), not `<publication-date>`.
- **Cover hook line 1** (white, around 28 chars max per P063 LinkedIn-crop budget) and **line 2** (accent orange, around 45 chars max). Text only at 11a; the cover image renders at step 12 (status quo).
- **One-paragraph theme statement** that names the deep items by their shared constraint and previews the variation each item shows. This statement IS the "thesis-first intro" element 1 from ADR-032's three-deep-items shape; the body opener at 11b will elaborate it. Keep to one paragraph; specific (named constraint, named variation); honors the voice rules below.

Voice rules at 11a (subset of step-13 voice gate, applied to the anchor only):

- Team voice ("we"), not "I" (ADR 010). The H1 + theme statement carry the editorial position; the "From Tom" opener is at 11b.
- Direct, specific, confident. Name the constraint, name the variation.
- No em-dashes. Use commas, periods, colons, or parentheses.
- No hype words.
- Respect the reader's team (ADR 015).

#### 11a Tom-approval gate (per ADR-037)

After composing the theme anchor, fire an `AskUserQuestion` (per ADR-013 Rule 1):

- `header`: "Theme anchor"
- `question`: "Theme anchor for Issue <N>. H1: <H1 text>. Hook lines: <line 1> / <line 2>. Theme statement: <theme statement>. Approve?"
- Options:
  1. **Accept** (Recommended) - proceed to 11b with the approved anchor.
  2. **Refine** - Tom edits the H1, hook lines, or theme statement via the "Other" free-text escape hatch; 11a re-runs the approval gate with the refined anchor.
  3. **Reject** - back to step 9.5 (re-ranking) or step 10 (per-item capture) with a note on what failed.

Do NOT proceed to 11b until the gate returns Accept. The approved anchor is the load-bearing frame the body work amortises against (per ADR-037 Decision Drivers: theme anchor first).

### 11b. Draft body using approved theme anchor (per ADR-037)

Using the approved H1, hook lines, and theme statement from 11a, produce the full draft body:

- The approved headline + subtitle from 11a.
- One-sentence intro that elaborates the 11a theme statement (the body opener leads with the approved theme; do not author a fresh intro that competes with the anchor).
- For developer persona, label each item's evidence stance as **shipped**, **benchmarked**, **demo**, or **not yet** (J9 + J11 paired). For leader persona, the evidence label is optional; business-consequence framing carries primary weight.
- One `### Item N` block per shortlisted candidate (minimum 3, no maximum), ordered by `<three-lens-weighting>`. Each item has: What happened (with the primary claim inline-linked), Why it matters to your team, The human angle. Do NOT append a separate `**Source:**` block when the What-happened text already carries inline links (structural invariant, P089).
- Item Why-it-matters lines reference the 11a theme where natural (per ADR-037: body threads the approved frame).
- Closing CTA: pick one `<cta-invitation>` from the persona config (rotate week to week to avoid verbatim repetition), followed by the closing line `windyroad.com.au`. Do NOT emit a Windy Road services-description sentence (P090): the CTA is invitation + linked `windyroad.com.au` only. This is enforced at save by `check-newsletter-structure.sh` check (g).

Voice rules (enforced by step 13 voice gate):
- Team voice ("we"), not "I" (ADR 010). The "From Tom" opener is the only place where "I" is permitted.
- Direct, specific, confident. Name the org, name the artifact, name the date.
- No em-dashes. Use commas, periods, colons, or parentheses.
- No hype words.
- Respect the reader's team (ADR 015). Describe industry baselines and situations, not the reader's team's competence. This applies to both personas; the developer-audience equivalent is "do not call a developer's tool choice incompetent; criticise via evidence."
- Apply the persona's `<voice-addendum>` for vocabulary preferences (leader-coded vs developer-coded language).
- **No editorial-process meta-commentary in body copy (P036, interim).** The body of an Item block describes what happened and why it matters to the reader's team. It is not a place to narrate the editorial process by which the item arrived in this brief. Banned patterns include:
  - **Corroboration assurance**: "(corroborated across LA Times, CNBC, and Business Insider, week of April 20)". The corroboration discipline (step 4b) is internal; the reader does not need reassurance.
  - **Time-window tags about the editorial cycle**: ", week of April 28.", "the same week", "surfaced via Simon Willison and Hacker News on April 30". These narrate when the editorial team noticed the story rather than when the story happened.
  - **Evidence-stance hedge prose ABOUT the rating system itself**: "(qualitative observation, no published comparative benchmarks cited here)", "we treat this as a qualitative observation rather than a quantitative finding". This is meta-prose about evidence stance, not evidence itself. **The evidence-stance LABELS themselves ("shipped", "benchmarked", "demo", "not yet", "varied widely") are JTBD-205 + ADR-019 + P035 required and are NOT banned by this rule. Use the labels; do not narrate the rating system.**
  - **Business-state disclosure**: "Tom is currently in a full-time engineering role, so the Windy Road consulting practice is fully booked". Internal context about the publisher; not part of the reader-facing artefact.
  - **Surfacing-attribution prose in body sentences**: "We're flagging this, via Stratechery, as worth watching", "per The Register, the bug was…". Narrates editorial process inside body prose. **Outlet names in the Source line and as inline citations pointing at a verifiable URL are REQUIRED attribution per JTBD-205 + JTBD-203 + content-risk rubric check_4 and ADR-026, and are NOT banned by this rule. The rule targets editorial-process narration in body sentences, not legitimate citation.**
  - **Self-referential editorial commitment**: "I call that test theatre" (process artefact framing); rephrase as the claim the editorial position rests on, not as the editorial position itself.

  This is **interim discipline** rule (mirroring ADR-019's inline-discipline-rule pattern for capture-fidelity). **Reassessment trigger**: if Tom logs more than one editorial-meta correction per edition for the next 4 editions after this rule lands, escalate to a detector subagent (`wr-newsletter:editorial-meta-detector`, suggested by P036's original Fix Strategy). The reassessment count starts on the first edition that runs against this rule. Until escalation, the rule is enforced by the step 13 voice gate plus the next reviewer's manual reading of the brief body.

**Structural invariants (P089, P090).** The five LLM review gates check voice, content-risk, editorial quality, reader-experience, and cross-edition consistency; none checks deterministic structural format. Produce these seven invariants by construction (a deterministic lint blocks the step 16 save when any is violated):

1. **No trailing `**Source:**` block** in an item whose What-happened text already carries inline links. Inline-link the claim; do not also append a Source line.
2. **Do not name two or more outlets on a line without linking them** ("corroborated by Reuters, FT, NYT, and WSJ" is banned). Link the outlet when you name it; a single back-reference to an already-linked article is fine.
3. **Keep the `### Also worth noting` section** as a standalone closing coda; do not fold it into the items.
4. **H1 carries the `Issue NN:` prefix** matching published editions (`# Issue 09: <one-liner>`), set from the edition number at step 11a.
5. **A `---` horizontal rule precedes the closing CTA block.**
6. **Model names are consistent across the brief and the `.linkedin.md` sibling** (write "Gemma 4 12B" in both, not "Gemma 4 12B" in the brief and "Gemma 4" in the post).
7. **No services-pitch sentence in the closing CTA (P090).** The CTA block (everything after the final `---` horizontal rule) carries at most one non-blank, non-link prose line: the rotating invitation. The `windyroad.com.au` closing line and blank lines do not count. A Windy Road / Tokens Spent services-description sentence is a disallowed second prose line.

These are codified in `assets/draft-template.md` (the "Structural invariants" section) and enforced at save by `scripts/check-newsletter-structure.sh`.

**Unresolvable source URLs: carry to the ask, do not degrade (P091).** When the drafter names an outlet but cannot resolve a canonical deep link for it (Google News RSS surfaced only the bare publisher domain, or the article sits behind a paywall / bot wall), do NOT satisfy invariant 2 by dropping the outlet name, and do NOT emit a name-without-link. Carry the citation (outlet, claim, any bare-domain URL) into the step 11.5 **Unresolvable-URL terminal fallback**, which batches all such citations into a single `AskUserQuestion` for the canonical URLs before any drop. The user is present to help (P091: "If you cannot resolve a URL, ask me"). The P089 lint check (b) is the deterministic backstop at save; this discipline prevents producing the name-without-link in the first place.

**Capture fidelity (P015 + ADR 019).** When composing each Item block from a step-10 Adjust capture, preserve the load-bearing noun-phrases, first-person observations, and named artifacts from the Adjust text verbatim wherever the LinkedIn column can carry them. Specifically:

- Named tools, products, vendors, model versions, repository names, dates, and quantitative claims appear verbatim in the rendered Item.
- First-person observations Tom supplied (e.g. "we shipped this last quarter and it broke under load") survive as quoted or paraphrase-with-quote spans, not as flattened third-person commentary.
- Paraphrase only connective tissue (transitions, headline framing, the lens-anchor sentence). Never paraphrase the load-bearing claim.
- Optionally during generation, mark verbatim spans with `{{verbatim}}…{{/verbatim}}` markers so the drafter can self-check that fidelity holds before save. Strip these markers before the step-16 save; they must not appear in the final draft body or LinkedIn post.
- Read `<draft-folder>/<publication-date>.capture.md` (written at step 10) as the persisted reference. The AskUserQuestion conversation history is also available in-context; both inputs feed the same fidelity discipline.

The drafter is an inline main-assistant pass (not a subagent). The capture-fidelity rule lives in this skill prose because the inline drafter reads the skill as its working instructions. Promoting the drafter to a fresh-context subagent would lose access to the AskUserQuestion conversation history; ADR 019 documents the rationale.

If `<draft-folder>/<publication-date>.capture.md` is absent (e.g. `phase=finalise` chose `Continue without capture transcript`), the drafter falls back to the in-context AskUserQuestion turn for any items captured in this session, and treats prep-time items without a transcript reference as best-effort (verbatim preservation cannot be checked against a persisted source).

**Source-article quantitative-claim fidelity (P035, interim).** The capture-fidelity rule above governs Tom's Adjust text. A separate discipline applies to numbers cited from the source article body. When an Item references a count, percentage, ratio, range, or currency value drawn from the source article (as distinct from Tom's Adjust capture), the value must appear verbatim from the article body, not paraphrased from the news-fetch one-sentence summary. Specifically:

- Do not round or "tidy" counts (write `26,904` not `27,000`; `42.7%` not `~40%`).
- Do not collapse a range into a single value or replace a specific count with a magnitude phrase ("thousands of", "tens of thousands").
- Do not duplicate one value across distinct denominators (e.g. "27,000 queries got 27,000 different answers" when the source's count of queries and count of distinct answers are not the same number).
- If the article body is unavailable in this session (Cloudflare block, Playwright fetch failure, paywall, or the news-fetch surfaced only a redirect URL), cite the qualitative claim ("varied widely", "across thousands of queries") rather than fabricating a number.

This rule is **interim defence-in-depth**. ADR-024 (URL verification gate) owns this responsibility structurally. Its fresh-context subagent compares article body against the brief's specific claim and returns SUPPORTED / REFUTED / NOT MENTIONED, which catches quantitative drift as a side-effect of body-content semantic comparison. Until ADR-024 confirmation criterion 1 is met (step 11.5 documented and exercised across one full prep-finalise cycle without user intervention on URLs), the drafter operates this rule as in-context discipline. Once met, this sub-section reduces to a one-line cross-reference to ADR-024.

**Phase variant `11a-prime` + `11b-prime` (phase=finalise only) per ADR-037:**

**`11a-prime`** always re-runs the theme-anchor approval gate (per ADR-037 sub-decision 2 / Option B, Tom-pinned 2026-06-03). Fire an `AskUserQuestion` carrying the prep-time approved anchor as the default:

- `header`: "Theme anchor (finalise)"
- `question`: "Prep-time theme anchor for Issue <N>: H1: <prep H1>. Hook lines: <prep line 1> / <prep line 2>. Theme statement: <prep theme statement>. Still right at finalise?"
- Options:
  1. **Accept** (Recommended) - prep-time anchor carries over unchanged; proceed to 11b-prime.
  2. **Refine** - Tom edits via "Other" free-text; 11a-prime re-runs the gate. The refined anchor replaces the prep-time anchor for finalise.

This catches Friday/Saturday/Sunday theme-drift between prep and finalise even when ADR-017's Restructure rule does not fire. Cost is one approval gate per finalise; the default-Accept path keeps the friction low.

**`11b-prime`** starts from `<prep-draft-body>` rather than drafting from scratch. Apply changes only for:

1. New Item blocks for kept new tier-1 items from step 10-prime.
2. New Also-worth-noting blocks for `Also-worth-noting` items from step 5-prime, kept new `WEAK_ATTRIBUTION` items from step 10-prime, and any prep-time `Ask for help` items Tom resolved between phases.
3. Re-ranked Item ordering if step 9.5-prime re-ranked.
4. Updated headline / intro / theme statement if 11a-prime gate returned Refine OR if the late-story branch (step 5-prime) chose `Restructure` and the week's theme genuinely shifted.
5. Updated Map movement lines on existing items if the map was re-mutated at step 6-prime.

If no material changes apply AND 11a-prime gate returned Accept, `11b-prime` is a no-op and `<prep-draft-body>` is the finalise draft body unchanged.

### 11.4. Cross-edition thesis-consistency gate (ADR-038)

After 11b body draft completes, invoke the `wr-newsletter-cross-edition-consistency` subagent to check the current draft's load-bearing theses against the prior N=8 published editions in the same persona series. Catches the failure mode where Issue N silently contradicts Issue N-K (witnessed in the 2026-06-01 Issue 07 prep run where Item 1 contradicted Issue 06's "capacity not smaller team" thesis; the 5 in-isolation gates shipped past it without flagging).

**Prior-edition window** per Tom-pinned sub-decision 1 / Option C (ADR-038): N=8 (rolling two-month window at weekly cadence).

**Subagent input shape** per Tom-pinned sub-decision 3 / Option A (ADR-038): full prior-edition bodies for all N editions.

**Resolve prior-edition paths**:

```bash
# Glob via the per-date subdir shape per ADR-039:
GLOB="<published-folder>/*/<YYYY-MM-DD>.md"
# Filter to publication-date basename matching YYYY-MM-DD.md (8 digits and dashes, then .md).
# Sort by basename descending (basename IS publication date so this sorts by edition order).
# Take top 8.
```

If fewer than 8 prior editions exist in the persona's published folder (early in the series), pass what is available. The subagent surfaces the count in its verdict.

**Invocation**:

Delegate to `wr-newsletter-cross-edition-consistency` via the Skill tool (subagent_type matches the agent's `name:` frontmatter field). Pass:

- `artifact_path`: absolute path to the current draft (`<draft-folder>/<publication-date>.md` for `phase=prep` writing `.prep.md`, OR the resolved `.prep.md` / `.md` for finalise).
- `prior_edition_paths`: the up-to-8 absolute paths from the glob above, sorted by edition number descending.
- `persona`: `leader` or `developer`.
- `publication_date`: the resolved `<publication-date>` from step 0.

The subagent returns a structured block beginning with `CROSS_EDITION_CONSISTENCY_VERDICT: <SUPPORTED|CONTRADICTS|NEUTRAL>` on its own line. Parse the verdict and route per the save-gate semantics below.

**Save-gate semantics** per Tom-pinned sub-decision 2 / Option A (ADR-038): block save until Tom resolves on CONTRADICTS.

| Verdict | Action |
|---------|--------|
| `SUPPORTED` | Gate passes silently. Append verdict block to `.reviews.md ## Cross-Edition Consistency` (see step 16). Proceed to step 11.5. |
| `NEUTRAL` | Gate passes silently. Append verdict block to `.reviews.md ## Cross-Edition Consistency`. Proceed to step 11.5. |
| `CONTRADICTS` | Block save. Fire `AskUserQuestion` (per ADR-013 Rule 1) with the contradictions surfaced. Three options: |

**`AskUserQuestion` on CONTRADICTS**:

- `header`: "Cross-edition contradiction"
- `question`: name the count of contradictions and the prior-edition dates involved (for example, "1 contradiction found vs Issue 06 (2026-05-25). Resolve?"). Include the first contradiction's current-draft and prior-edition quoted passages inline for at-a-glance context.
- Options:
  1. **Rewrite** (Recommended on a contradiction Tom did not intend) - the drafter re-runs on the conflicting passages with the prior-edition quoted context attached; 11.4 gate re-runs after rewrite.
  2. **Override with reason** - Tom records a one-line reason via "Other" free-text; gate passes with `PASS_WITH_AUTHOR_OVERRIDES`-equivalent verdict (per ADR-025); reason is logged to `.reviews.md ## Cross-Edition Consistency`.
  3. **Accept as deliberate evolution** - Tom records a one-line reason naming the position-shift via "Other" free-text (for example, "Q2 evidence changes the capacity argument; intentional position update"); gate passes; reason is logged. The next-edition drafter should reference this evolution in the new edition's framing.

When Rewrite is chosen, the drafter loop runs once more on the affected items only (not a full 11b re-draft); the gate re-fires after the rewrite. When Override or Accept-as-evolution is chosen, the gate passes immediately.

**Audit trail**: append the verdict block (plus override / evolution reason where applicable) to `.reviews.md ## Cross-Edition Consistency` per ADR-026 sibling-file pattern. Every edition's `.reviews.md` carries this section; SUPPORTED and NEUTRAL verdicts contribute a one-line "no findings" entry, CONTRADICTS verdicts carry the full Findings block.

**Phase variant `11.4-prime` (phase=finalise only)**: re-run only if 11a-prime gate returned Refine OR 11b-prime introduced new items or theme changes. If 11a-prime returned Accept AND 11b-prime was a no-op AND no new items landed, carry the prep-time verdict forward (append `(carried from prep)` to the `.reviews.md ## Cross-Edition Consistency` entry). Default when in doubt: re-run.

### 11.5. URL verification gate (ADR-024)

For every URL that appears in the draft body, verify the URL resolves and the article body matches the brief's specific claim. Block save on REFUTED or 404. This step is non-skippable in `phase=prep`, `phase=finalise`, and `phase=full`; ADR-024 owns the decision shape and P034 documents the failure mode this gate prevents.

**URL scope.** Verify every URL that appears in any of the following surfaces in the step-11 draft:

- Item Source lines.
- Inline citation URLs inside any Item body (`What happened`, `Map movement`, `Why it matters to your team`, `The human angle`).
- Also-worth-noting block URLs.
- The From-Tom opener (rare; some editions cite a personal artefact).
- Frontmatter source links (if any).

Do NOT verify outbound CTA URLs that are part of the persona's `<cta-invitation>` rotation or the closing line (windyroad.com.au and friends); those are owned by the persona config and verified there, not per-edition.

**Transport selection (per URL).** Choose the fetch transport based on publisher class:

1. **JS-protected publishers** (CNBC, Business Insider, NYT, LA Times, Bloomberg, FT, WSJ, The Information, The Verge, TechCrunch, Wired, Reuters when JS-required, and similar): use `node scripts/playwright-fetch.mjs <url>`. The helper returns TITLE, FINAL_URL, and the first 4000 chars of `document.body.innerText`. Inspect the title and FINAL_URL for resolution (HTTP-level 404 surfaces as a TITLE like "Page not found"; redirect chains surface as a non-matching FINAL_URL). Pass the BODY output to the semantic verification subagent below.
2. **Static / RSS-style hosts** (status.claude.com, anthropic.com news, GitHub blog, status.openai.com, dev.to, GitHub README files): use `curl -A 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' -L -s -o /tmp/wr-url-<short-hash>.html -w '%{http_code}' <url>`. HTTP 200 plus a body that matches the URL slug content counts as resolved; 404 / 403 / 5xx counts as 404 for the save-gate.
3. **Cloudflare-blocked from this environment** (openai.com article pages, anthropic.com article pages when fronted by Cloudflare bot protection, web.archive.org snapshots, some Substack writers): a DuckDuckGo HTML search (`curl -A '<browser-UA>' 'https://html.duckduckgo.com/html/?q=<urlencoded-query>'`) is used to confirm the URL exists on the public web, then the semantic verification step runs against the search-result snippet rather than the article body. Tag the URL `INDIRECT_CONFIRMED` as a **transport-class outcome** (set BEFORE the semantic step runs); it is not a fourth semantic verdict. The semantic subagent still returns SUPPORTED / REFUTED / NOT MENTIONED against the snippet.

Choice of transport is a per-URL judgement; do not run all three. Start with the cheapest viable transport and escalate only on failure.

**Semantic verification subagent contract.** For each fetched body (or DuckDuckGo snippet for `INDIRECT_CONFIRMED`), spawn a fresh-context subagent:

```
Agent subagent_type: general-purpose
prompt: "Compare the article body below against the specific claim. Return one of SUPPORTED, REFUTED, or NOT MENTIONED, plus a verbatim quote from the article body that justifies the verdict where applicable.

CLAIM (verbatim from the brief): <quoted claim sentence from the Item block>

ARTICLE BODY:
<paste the playwright-fetch BODY output, or the curl-fetched HTML body text, or the DuckDuckGo snippet for INDIRECT_CONFIRMED URLs>

Rules:
- SUPPORTED: the article body asserts the claim (verbatim or by clear paraphrase).
- REFUTED: the article body asserts something incompatible with the claim (different number, different actor, different outcome).
- NOT MENTIONED: the article body does not address the claim either way (the brief inferred or extrapolated beyond what the source says).
- You do NOT have access to the brief outside the claim above; do not infer from headline tokens. Treat the article body as the only ground truth.
- Return verdict on the first line, then a one-line verbatim quote on the second line (or 'no supporting quote' if NOT MENTIONED).
"
```

Fresh-context isolation matters: the subagent must NOT see the rest of the brief, the per-item capture transcript, or the Wardley map. ADR 016 / 018 / 020 establish this pattern; the URL verifier is a direct application of the same isolation rule.

**Save-gate semantics.** Block the save unless every URL clears:

| Verdict / outcome      | Action                                                                                                                                                                                                |
|------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `SUPPORTED`            | Pass. Proceed to step 12 (cover image) once all URLs report.                                                                                                                                          |
| `INDIRECT_CONFIRMED` + `SUPPORTED` (semantic) | Pass. Note the transport outcome in the audit trail; readers cannot tell the difference but Tom can audit which URLs ran via DuckDuckGo at retro. |
| `REFUTED`              | Fix the brief (rewrite the claim to match the article body, citing the verbatim quote) OR replace the URL with one whose body supports the claim. Re-run step 11.5 on the affected URL. Do NOT save while any URL remains REFUTED.    |
| HTTP 404 (or 403/5xx)  | Replace the URL with a verified canonical URL (use DuckDuckGo HTML search to find the canonical). If no automated transport can resolve a canonical URL, do NOT drop the source link yet: carry the citation to the **Unresolvable-URL terminal fallback** below (ask the user) before any drop. Re-run step 11.5 on the replacement URL.                          |
| `NOT MENTIONED`        | Escalate to Tom via `AskUserQuestion` with the claim and the article-body excerpt. Default action: treat as REFUTED (fix the brief or swap the URL). Tom may explicitly approve an inferred-but-unstated framing, in which case the verdict is downgraded to `NOT MENTIONED (author-approved inference)` and recorded in the audit trail.   |

**Unresolvable-URL terminal fallback: ask the user before dropping (P091).** The transport ladder above (Playwright for JS-protected publishers, curl for static / RSS hosts, DuckDuckGo HTML search for Cloudflare-blocked hosts) is the *automated* resolution path. When a source URL cannot be resolved by ANY of these transports (Google News RSS exposed only a bare publisher domain with no deep link, curl returned 403 for a paywall / bot wall, the Playwright fetch failed, AND the DuckDuckGo search surfaced no canonical URL), the citation is **unresolvable by machine, not unresolvable**. The user is present and willing to supply the canonical URL (Issue 09: every paywalled item was attributed in minutes once asked). Do NOT drop the outlet name and do NOT emit a name-without-link. Ask.

Ordered resolution sequence. The terminal step is the ask, not the drop:

1. **Automated transports first.** Exhaust the per-URL transport ladder above for every URL in the draft. Most URLs resolve here and never reach this fallback.
2. **Collect, do not drop.** Accumulate every citation that survives the ladder unresolved into a single unresolved-citations list (outlet name, the specific claim it attributes, and any partial / bare-domain URL the news fetch surfaced). Keep working through the rest of the draft; do not degrade attribution mid-pass.
3. **Ask the user with one batched question (terminal fallback before any drop).** After the ladder has run for every URL, if the unresolved-citations list is non-empty, fire a SINGLE batched `AskUserQuestion` (per ADR-013 Rule 1) that lists every unresolved citation and asks the user for the canonical URLs. Brief each citation's outlet plus claim in the prompt so the user can answer without filesystem access (P350 brief-before-ID discipline). Re-run step 11.5 on each URL the user supplies through the normal transport ladder plus semantic verification.
4. **Drop only after the user declines.** A citation is dropped (outlet name removed; the claim re-sourced or cut) ONLY after the user explicitly declines to supply a URL for it via the batched question. Dropping a citation the user was never asked about is the P091 defect this fallback closes.

**AFK / non-interactive carve-out (ADR-013 Rule 6).** When `AskUserQuestion` is unavailable (the `/wr-newsletter` run is orchestrated AFK or otherwise non-interactive), do NOT silently drop. Record every unresolved citation (outlet, claim, partial URL) in the `## URL Verification` block of `<draft-folder>/<publication-date>.reviews.md` with verdict `UNRESOLVED (awaiting user URL)`, and surface the list at finalise (step 17 names the count) so the user resolves the URLs on the next interactive pass before publish. The brief is held with the unresolved citations flagged, not published with degraded attribution.

**Composition with the P089 structural lint (not duplication).** `scripts/check-newsletter-structure.sh` check (b) catches the OUTPUT symptom, a line naming two or more outlets with no link, at save. This fallback addresses the PROCESS: it prevents *producing* a name-without-link by asking the user for the URL first. They compose. The lint is the deterministic backstop for a name-without-link that slips through (including the single-outlet case check (b) deliberately allows); this fallback is the human-in-the-loop step that stops the drafter degrading attribution in the first place. Do not fold one into the other.

**Phase variant `11.5-prime` (phase=finalise only).** Re-run step 11.5 only on URLs that are NEW or CHANGED in `11b-prime`. URLs that were verified in prep and have not changed (URL string identical AND surrounding claim sentence identical) carry their prep-time verdict forward. If a claim sentence was rewritten in `11b-prime` but the URL is unchanged, the URL must re-verify against the new claim (the URL is the same, the claim is not). Record any carry-forwards in the audit trail as `<verdict> (carried from prep)`.

**Audit trail.** Write per-URL verdicts to `<draft-folder>/<publication-date>.reviews.md` under a new `## URL Verification` block (per ADR-026 sibling-file convention). One row per URL:

```
| URL | Transport | Semantic verdict | Note |
|-----|-----------|------------------|------|
| https://www.example.com/article-slug | playwright | SUPPORTED | "<verbatim quote>" |
| https://status.claude.com/incidents/abc123 | curl | REFUTED | replaced with https://... before save |
| https://openai.com/index/<slug> | duckduckgo | INDIRECT_CONFIRMED + SUPPORTED | snippet quoted |
```

Step 17 summarises this table for Tom (final-line headline only; full table lives in `.reviews.md`).

### 12. Generate cover image

The cover image is generated by the `/wr-newsletter-cover` skill (P044, landed 2026-05-11). The skill encapsulates the brand-asset read, template substitution, font conventions, and the P011 render-and-verify cycle that previously lived inline. Invoke it with the resolved persona, edition number, publication date, and the two-line hook from the cover hook lines composed at step 11a (per ADR-037; cover render stays at step 12 unchanged per Tom-pinned sub-decision 1 / Option C, with 11a outputting hook-line text only):

```
Skill: wr-newsletter-cover
args:
  persona: <leader|developer>
  edition_number: <NN, two digits>
  publication_date: <YYYY-MM-DD, the `<publish-day>` date from step 0; output filename anchor>
  week_ending: <YYYY-MM-DD, `<week-ending>` from step 0; the Sunday rendered as the "WEEK ENDING" stamp>
  hook_line_1: <first hook line, white, around 30 chars max>
  hook_line_2: <second hook line, accent orange, around 45 chars max>
  draft_folder: <persona draft folder from the persona config>
```

The skill returns `cover_svg_path`, `cover_png_path`, and a 100-160 character `alt_text` string. Record `cover_png_path` and `alt_text` in the brief frontmatter `cover-image:` block so the finalise phase can locate the artifact (see step 12-prime). The hook lines should support the headline and the week's theme; use the H1 final-line plus the most resonant lead-paragraph sentence as the starting candidates.

If `/wr-newsletter-cover` reports a missing brand asset (fail-fast preflight), halt step 12 and surface the missing path in the Tom-summary. If the script exits non-zero, surface the error and do not improvise; the documented sips font conventions (`Avenir Next` 500 for hooks, `Futura Lt BT` 300 for the wordmark) are the canonical set, and the diagnostic flow in the cover skill's step 4 is the way to investigate when typography looks wrong.

If the image generation tooling fails or returns an unbranded result, do not block the pipeline: note the failure in the summary, fall back to a text-only edition, and continue.

**Phase variant `12-prime` (phase=finalise only): re-render gate.** Compare the finalise-time headline + hook lines (from step 11a-prime, which always re-runs the theme-anchor approval gate per ADR-037 sub-decision 2 / Option B) against the prep-time headline + hook lines (from `<prep-draft-body>`). If the headline + hook lines are unchanged AND the week's theme is unchanged, carry `<prep-image-path>` forward without re-rendering. If either changed materially (11a-prime gate returned Refine, or restructure shifted the theme), re-invoke `/wr-newsletter-cover` with the finalise-time hook lines (output paths are date-anchored, so the same `<publication-date>` will overwrite the prep artifact deterministically). The re-render check is a string compare on the H1 line plus a semantic check on the theme statement (a single-word edit that does not change meaning is "unchanged"; a re-framed theme is "changed"). When in doubt, re-render: image work in finalise is the explicit ADR 017 safety valve for late-breaking news.

### 13. Voice review gate (ADR 012)

```
Agent subagent_type: wr-voice-tone:agent
prompt: "Review the following AI Engineering Brief draft against docs/VOICE-AND-TONE.md. Pay particular attention to em-dashes, word list, hype words, team voice (ADR 010), and the 'Respectful of the reader's team' clause (ADR 015). Return PASS or FAIL plus specific findings.

<paste the full draft here>"
```

If FAIL: fix the flagged passages in the draft, re-run voice review. Do not proceed until PASS. Capture the final voice review block for the saved draft.

**Phase variant `13-prime` (phase=finalise only):** run the voice gate against the finalise-time draft body. The gate runs on the full draft (not a diff against `<prep-draft-body>`) so any voice regressions introduced by step 11b-prime's edits (or by an 11a-prime Refine that propagated into 11b-prime) are caught.

### 14. Content-risk review gate (ADR 012 + ADR 015 + ADR 018)

Invoke the `wr-content-risk-scorer` subagent (ADR 018). The subagent runs in fresh context, reads the in-progress draft and the rubric, and returns the five-axis CONTENT_RISK block in the format pinned by ADR 015 confirmation criterion 3. The five axes (factual, reputational, claims, attribution, reader-respect) and their persona constraints live in the rubric file, not in this skill.

```
Agent subagent_type: wr-content-risk-scorer
prompt: "Score the newsletter draft against the content-risk rubric.

artifact_path: <absolute path to the in-progress draft>
rubric_path: /Users/tomhoward/Projects/windyroad/.claude/skills/wr-newsletter/assets/content-risk-rubric.md"
```

Parse the returned block. The agent emits exactly:

```
CONTENT_RISK: factual=<...> reputational=<...> claims=<...> attribution=<...> reader-respect=<...>
VERDICT: <PASS|REJECTED>
Notes:
- <flagged passage 1, or "no flags">
```

If `VERDICT: REJECTED`: save the draft with the block, surface the rejection prominently in the Tom-summary, and skip step 15. Tom decides whether to rewrite or override.

If `VERDICT: PASS`: proceed to step 15. Any `medium` flags listed in the Notes section are surfaced to Tom for optional touch-up but do not block the SW-critic.

**Phase variant `14-prime` (phase=finalise only):** invoke the same agent against the finalise-time full draft body. Same rubric path. A prep-time PASS does not exempt finalise; new items or restructured framing in 11b-prime (or theme-anchor changes from 11a-prime that propagated through) can change the risk surface, so the agent runs again with the finalise-time draft.

### 15. Critic loop on the newsletter draft (ADR 016, ADR 025, ADR 035)

Per ADR 035, the critic rubric is a brief editorial prompt (STRENGTHS, WEAKNESSES, optional RELEVANT CONTEXT); no structured numbered-check list, no `accepted_overrides` allowlist. The critic owns analytical quality (does the argument hold; is specificity preserved; is the "so what?" answered; is the piece pablum). Sibling gates own voice (step 13), content-risk (step 14), cog-a11y (step 15.4), and editor (step 15.25).

```
Agent subagent_type: wr-newsletter-critic
prompt: "Review the newsletter draft.

artifact_path: <path to the in-progress draft>
rubric_path: /Users/tomhoward/Projects/windyroad/.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md
round_number: 1
prior_weaknesses: n/a"
```

Parse the `CRITIC_REVIEW` block:
- `VERDICT: PASS`: proceed to step 16.
- `VERDICT: WEAKNESSES_FOUND`: fix each listed weakness in the draft. Re-invoke with `round_number: 2` and `prior_weaknesses: <round-1 verbatim>`.
- `VERDICT: PASS_WITH_AUTHOR_OVERRIDES`: publish-ready. Per ADR 035, the verdict variant covers editorial-judgement overrides of named weaknesses (the drafter accepts a critic call as an intentional editorial choice). The override is named verbatim in the saved review block. Proceed to step 16.
- Up to round 3. On round-3 exhaustion (any remaining weakness that is not an editorial-judgement override), the agent emits `VERDICT: REJECTED` with `REJECTED_REASON: critic-loop-exhausted`. Save the draft with the block and surface the unresolved weaknesses in the Tom-summary.

If the round-3 REJECTED pattern recurs across consecutive editions on the same class of weakness, file a problem ticket or revisit the editorial prompt in `newsletter-critic-rubric.md`. Per ADR 035, the rubric is a brief editorial prompt; substantive shape changes go through an ADR-035-reassessment cycle, not silent inline accretion.

Capture the final critic block for the saved draft.

**Phase variant `15-prime` (phase=finalise only):** runs against the finalise-time draft with a fresh per-artifact-pass budget (up to 3 rounds) under ADR 017 lines 39-41. The prep-time critic block is preserved in the saved draft alongside the finalise-time block (see step 16-prime); both are part of the audit trail. If finalise has no material changes (11a-prime gate returned Accept AND 11b-prime was a no-op AND 12-prime carried the image forward AND 13-prime/14-prime passed without edits), the prep-time critic block can be carried forward and 15-prime is a no-op. Default behaviour when in doubt: re-run.

### 15.25. Editor review gate (ADR 020)

Invoke the `wr-newsletter-editor` subagent (ADR 020). The subagent runs in fresh context, plays the role of an experienced LinkedIn newsletter editor, reads the persona's JTBD context, reads the in-progress draft body, and returns the `EDITOR_REVIEW` block in the format pinned by ADR 020 confirmation criterion 1. The three reader-experience axes (would-open, would-read-through, would-forward) and their persona constraints are documented inside the agent file, not in this skill.

**Skip-on-upstream-REJECTED.** If the critic loop at step 15 (newsletter-critic per ADR 033) returned `VERDICT: REJECTED` (round-3 exhausted), skip step 15.25 entirely. The editor is not invoked on an analytically-rejected draft; reviewing reader-experience on a draft that already failed argument-quality is not useful. The skipped step is recorded in the saved file (step 16 save-block) as `<editor block> = "N/A: newsletter-critic returned REJECTED"`. A `VERDICT: PASS_WITH_AUTHOR_OVERRIDES` from step 15 does **not** skip step 15.25; the variant is publish-ready (ADR 025) and the editor runs against it as it would against a `PASS`.

```
Agent subagent_type: wr-newsletter-editor
prompt: "Review the newsletter draft as an experienced LinkedIn newsletter editor.

artifact_path: <absolute path to the in-progress draft>
persona: <leader|developer>
edition_number: <N from step 11a>"
```

Parse the returned block. The agent emits exactly:

```
EDITOR_REVIEW
artifact: <artifact_path>
persona: <leader|developer>
edition: <N>

WOULD_OPEN: <yes|no|tentative>
Reason: ...

WOULD_READ_THROUGH: <yes|no|tentative>
Reason: ...

WOULD_FORWARD: <yes|no|tentative>
Reason: ...

EDITORIAL_FINDINGS
- axis: <preamble-density|through-line|item-count-proportionality|opener-authenticity|reader-orientation|other>
  Passage: "<quoted passage>"
  Issue: <one sentence>
  Suggested fix: <concrete direction, not a rewrite>
- axis: ...

EDITOR_VERDICT: <PASS|NEEDS_EDITORIAL_REVISION>
END_EDITOR_REVIEW
```

If `EDITOR_VERDICT: NEEDS_EDITORIAL_REVISION`: save the draft with the block, surface the verdict prominently in the Tom-summary (lead with the failing axes and Suggested fixes), and proceed to step 15.5 (LinkedIn post still drafts so Tom has both surfaces in the saved file). The editor does not auto-rewrite; Tom decides whether to revise the brief or override the verdict (per ADR 020 Decision Outcome).

If `EDITOR_VERDICT: PASS`: proceed to step 15.5. Any `tentative` axis flagged with findings still emits `NEEDS_EDITORIAL_REVISION` per the agent's mechanical-verdict rule; a true PASS means three `yes` answers (or three answers with no findings).

If the agent returns `EDITOR_ERROR: upstream gate returned REJECTED; editor will not run` despite the skip-on-REJECTED rule above, treat it as a skill-logic bug. Do not retry; surface the inconsistency in the Tom-summary so the gate orchestration can be fixed.

**Phase variant `15.25-prime` (phase=finalise only):** invoke the same agent against the finalise-time full draft body. Same persona; the edition number is carried from prep frontmatter (it does not change between phases). A prep-time PASS does not exempt finalise; new items or restructured framing in 11b-prime (or theme-anchor changes from 11a-prime that propagated through) can change the reader-experience surface (longer read, weaker through-line, item-count overflow). If finalise has no material changes (11a-prime returned Accept AND 11b-prime was a no-op AND 15-prime carried the prep critic block forward), the prep-time editor block can be carried forward and 15.25-prime is a no-op. Default behaviour when in doubt: re-run.

### 15.4. Cognitive accessibility gate (P053)

Invoke the `cognitive-accessibility` subagent on the in-progress brief body. The agent reviews reading-level (target Grade 10 or lower for the Engineering Leader audience; tier-2 stories of technical depth may exceed Grade 10 without failing), plain-language clarity, unusual-words density, abbreviation/acronym handling, sentence length, and the WCAG 2.2 cognitive success criteria (3.1.5 Reading Level, 3.1.3 Unusual Words, 3.1.4 Abbreviations, 3.1.4 Abbreviations, 3.2.4 Consistent Identification).

**One-round pass with optional remediation** (per the P053 default proposal confirmed 2026-05-13). No iteration loop: the agent fires once, returns findings, and the brief either gets remediated by Tom (or by a subsequent edit pass) or proceeds with the findings surfaced to the Tom-summary.

**Skip-on-upstream-REJECTED.** If step 15 newsletter-critic returned `VERDICT: REJECTED`, skip step 15.4 entirely. Reviewing reading-level on an analytically-rejected draft is not useful. Recorded in the saved file as `<cog-a11y block> = "N/A: newsletter-critic returned REJECTED"`. A `PASS_WITH_AUTHOR_OVERRIDES` from step 15 does NOT skip 15.4 (variant is publish-ready per ADR 025).

```
Agent subagent_type: cognitive-accessibility
prompt: "Review the in-progress newsletter brief body for cognitive accessibility.

artifact_path: <absolute path to the in-progress draft>
persona: <leader|developer>
edition_number: <N from step 11a>
target_reading_level: Grade 10 (leader) or Grade 11 (developer)

Return:
- Reading grade level (Flesch-Kincaid or equivalent)
- Findings by severity (critical / medium / advisory) with line citations and suggested fixes
- WCAG 2.2 SC findings (3.1.3, 3.1.4, 3.1.5) if applicable
- One-line verdict: PASS / NEEDS_REVISION / NEEDS_REVISION_OPTIONAL

PASS = no critical findings AND grade level at or below target.
NEEDS_REVISION = any critical finding OR grade level more than 2 above target.
NEEDS_REVISION_OPTIONAL = grade level 1-2 above target OR medium findings present."
```

Capture the agent's full prose output verbatim. Parse the trailing verdict line.

If `COGA_VERDICT: NEEDS_REVISION`: save the draft with the block, surface the verdict prominently in the Tom-summary (lead with the failing findings + grade level + suggested fixes), and proceed to step 15.5. The agent does not auto-rewrite; Tom decides whether to revise the brief or override per the same pattern as the editor gate.

If `COGA_VERDICT: NEEDS_REVISION_OPTIONAL` or `PASS`: proceed to step 15.5. Optional-revision findings still surface in the Tom-summary but do not block.

**Phase variant `15.4-prime` (phase=finalise only):** re-run only if the finalise-time brief body changed since prep. If 11a-prime returned Accept AND 11b-prime was a no-op (no new candidates from step 2-prime), carry forward the prep-time cog-a11y block from `<prep-reviews-path>` without re-invocation. If 11a-prime returned Refine OR 11b-prime introduced new items or restructured framing, re-run the agent against the finalise body. Default behaviour when in doubt: re-run.

### 15.5. Draft the LinkedIn post

Skip this step when `phase=prep`. The LinkedIn post is the publication-day artifact; drafting it during prep would burn tokens on a draft that finalise will likely re-do once late-breaking news lands.

For `phase=finalise` and `phase=full`, draft a LinkedIn post that:

- Opens with a hook line (one sentence) that names the week's theme and the main map movement.
- Carries the headline H1 from step 11a / 11a-prime.
- Includes 2-3 bullet items (the strongest items from the brief), each one sentence.
- Closes with a call-to-read pointing to the published edition (link inserted at publish time).
- Is no longer than the LinkedIn 3000-character limit.

The LinkedIn post carries the cover image from step 12/12-prime as its hero image; alt text from step 12 is reused.

**Voice review gate on the LinkedIn post (P013).** Before step 16 writes the LinkedIn-post sibling file, run a voice review on the LinkedIn post text the same way step 13 runs on the brief body. The teaser is an external-facing surface; ADR 012 confirmation criterion 1 ("every AI-generated draft artifact has a Review results section showing voice and risk verdicts") applies to the LinkedIn post, not just the brief body. The 2026-04-17 first-edition session caught a reader-respect violation in the teaser via manual review; this gate makes the check automatic.

```
Agent subagent_type: wr-voice-tone:agent
prompt: "Review the following LinkedIn post for The Shift / Tokens Spent against docs/VOICE-AND-TONE.md. Pay particular attention to em-dashes, word list, hype words, team voice (ADR 010), and the 'Respectful of the reader's team' clause (ADR 015). The audience is LinkedIn subscribers reading a one-screen teaser. Return PASS or FAIL plus specific findings.

<paste the full LinkedIn post text here>"
```

If FAIL: fix the flagged passages in the LinkedIn post text and re-run. Do not proceed to step 16 with a voice-failing post. Capture the final voice review block; per ADR-026 it is saved in `<draft-folder>/<publication-date>.reviews.md` under a `## Voice Review (LinkedIn post)` heading alongside the brief-body voice review block, NOT in `<publication-date>.linkedin.md`. The separation preserves fresh-context discipline so the next voice-gate run on the LinkedIn post does not see its own prior verdict.

Step 16 writes the LinkedIn post body, image description, alt text, and posting notes to `<draft-folder>/<publication-date>.linkedin.md` (per ADR-026). Tom edits and posts manually per ADR 013.

### 16. Save the draft

This step writes the brief and its sibling artefact files. Per ADR-026 (companion tickets P038 + P041), reviews and meta content live in sibling files, not inline in the brief: the brief contains only frontmatter + body + CTA. Per P040, all draft and companion-file paths use the `<publication-date>` binding (resolved at step 0 to the `<publish-day>` date in `<publish-timezone>`), not the prep-run date.

Use the `Write` tool. If a file for `<publication-date>` already exists at the path being written, ask Tom whether to overwrite or append a suffix like `-2` to the filename.

**Pre-save structural lint (P089).** After writing the brief `.md` (and, in `phase=finalise` / `phase=full`, its `.linkedin.md` sibling), run the deterministic structural lint and block the save on any violation:

```bash
scripts/check-newsletter-structure.sh "<draft-folder>/<publication-date>.md"
```

The lint auto-derives the `.linkedin.md` sibling from the brief path; pass it explicitly as a second argument only when it lives elsewhere. Exit 0 means the six structural invariants (step 11b) hold; proceed. Exit 1 prints one `FAIL [<id>] <file>:<line>: <message>` line per violation; fix the brief (or sibling) in place and re-run the lint until it exits 0 before continuing. Exit 2 is a usage / IO error (wrong path); correct the invocation. In `phase=prep` the LinkedIn sibling does not yet exist, so check (f) is skipped automatically; run the lint against the `.prep.md` brief path. The lint is deterministic and cheap; it does not replace the LLM gates (steps 13-15.5), it complements them by catching format defects those gates miss.

Branch on phase:

#### phase=prep: save brief as `.prep.md` and reviews as `.reviews.md`

Write `<draft-folder>/<publication-date>.prep.md` with the following structure:

```
---
phase: prep
prep-date: <YYYY-MM-DD of the prep run>
prep-source-cutoff: <ISO timestamp recorded at end of step 2>
source-failures:
  - <URL of any tier-1/2/3 source that failed>
map-mutation-status: <"mutated" or "skipped: <reason>" per step 5>
edition: <N from step 11a>
persona: <leader|developer>
cover-image: <path>
companion-files:
  capture-transcript: <publication-date>.capture.md
  reviews: <publication-date>.reviews.md
---

<draft body from step 11b, after any step-15 fixes>
```

Write `<draft-folder>/<publication-date>.reviews.md` with the following structure:

```
---
companion-to: <publication-date>.prep.md
phase: prep
---

## Voice Review

<voice review block from step 13>

## Content Risk Review

<content-risk block from step 14>

## Critic Review: Newsletter

<critic block from step 15, or "N/A: content-risk returned REJECTED" if step 15 was skipped>

## Editor Review

<editor block from step 15.25, or "N/A: newsletter-critic returned REJECTED" if step 15.25 was skipped>

## Cognitive Accessibility Review

<cog-a11y block from step 15.4, or "N/A: newsletter-critic returned REJECTED" if step 15.4 was skipped>

## Critic Review: Wardley Artifacts

<critic block from step 9>

## Map Delta

<one-sentence summary of what moved in ai-landscape.owm this run, or "MAP_UPDATE_SKIPPED: <reason>" if step 5 blocked the update>

## Cross-Edition Consistency

<verdict block from step 11.4: CROSS_EDITION_CONSISTENCY_VERDICT (SUPPORTED|CONTRADICTS|NEUTRAL), window (K editions read), editions reviewed (dates), Findings block on CONTRADICTS, optional Notes. Per ADR-038.>

## URL Verification

<per-URL verdict table from step 11.5: URL | Transport | Semantic verdict | Note. Per ADR-024.>
```

The LinkedIn post is NOT generated in prep (step 15.5 is skipped); no `<publication-date>.linkedin.md` is written in prep. Image path (from step 12) is recorded in the brief's frontmatter as `cover-image: <path>` for finalise to pick up.

#### phase=finalise: rename `.prep.md` to `.md`, refresh `.reviews.md`, write `.linkedin.md`

The finalise-time output replaces the prep-time `.prep.md` and refreshes the reviews sibling. Four operations:

1. Write brief to `<draft-folder>/<publication-date>.md` with this structure:

   ```
   ---
   phase: finalise
   prep-date: <carried from prep frontmatter>
   prep-source-cutoff: <carried from prep frontmatter>
   finalise-date: <YYYY-MM-DD of the finalise run>
   finalise-source-cutoff: <ISO timestamp recorded at end of step 2-prime>
   source-failures:
     - <combined list: prep failures + finalise failures, deduped>
   map-mutation-status: <prep status, plus "+ re-mutated in finalise" if step 5-prime restructured>
   late-story-branch: <"none" | "also-worth-noting" | "restructure">
   edition: <carried from prep frontmatter>
   persona: <leader|developer>
   cover-image: <path>
   companion-files:
     capture-transcript: <publication-date>.capture.md
     reviews: <publication-date>.reviews.md
     linkedin-post: <publication-date>.linkedin.md
   ---

   <final draft body from step 11b-prime>
   ```

2. Write reviews to `<draft-folder>/<publication-date>.reviews.md`, replacing the prep-time file. The finalise reviews file carries forward prep blocks alongside finalise blocks so the audit trail is intact:

   ```
   ---
   companion-to: <publication-date>.md
   phase: finalise
   ---

   ## Voice Review (finalise)

   <voice review block from step 13-prime>

   ## Voice Review (prep)

   <voice review block carried from prep .reviews.md>

   ## Voice Review (LinkedIn post)

   <voice review block from step 15.5's LinkedIn-post voice gate (P013); this lives here, not alongside the LinkedIn post in `.linkedin.md`, so the next voice gate run does not see its prior verdict (fresh-context discipline per ADR-026)>

   ## Content Risk Review (finalise)

   <content-risk block from step 14-prime>

   ## Content Risk Review (prep)

   <content-risk block carried from prep .reviews.md>

   ## Critic Review: Newsletter (finalise)

   <critic block from step 15-prime>

   ## Critic Review: Newsletter (prep)

   <critic block carried from prep .reviews.md>

   ## Editor Review (finalise)

   <editor block from step 15.25-prime, or "N/A: newsletter-critic returned REJECTED" if step 15.25-prime was skipped, or "N/A: carried from prep (no material change)" if 15.25-prime was a no-op>

   ## Editor Review (prep)

   <editor block carried from prep .reviews.md>

   ## Cognitive Accessibility Review (finalise)

   <cog-a11y block from step 15.4-prime, or "N/A: newsletter-critic returned REJECTED" if step 15.4-prime was skipped, or "N/A: carried from prep (no material change)" if 15.4-prime was a no-op>

   ## Cognitive Accessibility Review (prep)

   <cog-a11y block carried from prep .reviews.md>

   ## Critic Review: Wardley Artifacts

   <critic block from step 9-prime if Restructure ran, else carried from prep .reviews.md>

   ## Map Delta

   <prep-time map delta line, plus "+ <one-sentence finalise re-mutation summary>" if step 5-prime restructured, else prep delta unchanged>

   ## URL Verification (finalise)

   <per-URL verdict table from step 11.5-prime: URL | Transport | Semantic verdict | Note. Carry-forward rows tagged "(carried from prep)" per step 11.5-prime rules.>

   ## URL Verification (prep)

   <URL Verification block carried from prep .reviews.md>
   ```

3. Write LinkedIn post to `<draft-folder>/<publication-date>.linkedin.md`. The LinkedIn-post voice review does NOT appear here; it lives in the reviews sibling above:

   ```
   ---
   post-type: linkedin-share
   companion-to: <publication-date>.md
   ---

   ## LinkedIn Post

   <LinkedIn post body from step 15.5>

   ## Image

   <image description and alt text>

   ## Notes for posting

   <any posting notes, e.g. preferred publish window, hashtag suggestions>
   ```

4. Delete the `.prep.md` file. The audit trail lives in the carried-forward prep review blocks inside `<publication-date>.reviews.md` plus the git history of the `.prep.md`.

#### phase=full: save brief as `.md`, reviews as `.reviews.md`, linkedin as `.linkedin.md`

Single-pass equivalent of the prep + finalise pair. Three operations:

1. Write brief to `<draft-folder>/<publication-date>.md`:

   ```
   ---
   phase: full
   source-cutoff: <ISO timestamp recorded at end of step 2>
   source-failures:
     - <URL of any tier-1/2/3 source that failed>
   map-mutation-status: <"mutated" or "skipped: <reason>" per step 5>
   edition: <N from step 11a>
   persona: <leader|developer>
   cover-image: <path>
   companion-files:
     capture-transcript: <publication-date>.capture.md
     reviews: <publication-date>.reviews.md
     linkedin-post: <publication-date>.linkedin.md
   ---

   <draft body from step 11b>
   ```

2. Write reviews to `<draft-folder>/<publication-date>.reviews.md` with the same seven-block structure as the prep variant above (Voice Review, Content Risk Review, Critic Review (Newsletter), Editor Review, Critic Review (Wardley Artifacts), Map Delta, URL Verification), plus an eighth block `## Voice Review (LinkedIn post)` that captures the step-15.5 LinkedIn-post voice gate verdict (P013). No prep / finalise distinction in the section headings (single-pass).

3. Write LinkedIn post to `<draft-folder>/<publication-date>.linkedin.md` with the same shape as the finalise variant above (post body + image + notes; no voice review block).

### 17. Summarise for Tom

Report back in chat:

- Phase resolved (`prep` / `finalise` / `full`).
- Persona resolved (`leader` / `developer`) and publication name (`The Shift` / `Tokens Spent`).
- For `phase=finalise`: prep-source-cutoff (from frontmatter) and finalise-source-cutoff (from this run), so Tom can see the gap between them.
- Candidate count by source tier (tier-1, tier-2, tier-3, inbox). For finalise: how many were carried from prep vs new in this run.
- Source failures, if any (combined across phases for finalise).
- Map-mutation status (mutated / skipped with reason). For finalise: explicit note on whether the late-story branch fired and which option was chosen (none, also-worth-noting, restructure).
- Filtered count that cleared the Wardley preference and three-lens bar.
- Corroboration outcome count (P016): candidates that ran the Google News corroboration query, of which N were tagged `CORROBORATED_PRIMARY` and N were tagged `WEAK_ATTRIBUTION`. For each `WEAK_ATTRIBUTION` candidate, note Tom's step-10 decision (Keep / Drop / Ask for help) and any unresolved Ask-for-help items.
- Final item count (minimum 3, no cap).
- Voice review verdict (per phase if finalise).
- Content-risk block with verdict (per phase if finalise).
- Newsletter critic verdict and round count (per phase if finalise). Surface per the variant:
  - `PASS`: report as "Newsletter critic: PASS (round N)".
  - `PASS_WITH_AUTHOR_OVERRIDES`: report as "Newsletter critic: publish-ready with N documented overrides (round 3)". Quote the `OVERRIDDEN:` list verbatim so the audit trail is visible in chat. Do **not** lead with rejection language; the variant is publish-ready (ADR 025).
  - `REJECTED`: lead the summary with "VERDICT: REJECTED. Do not publish as-is. Rewrite and re-run." and quote the residual weaknesses.
  - The variant is read from the saved structured verdict, not inferred from the weakness list. If the saved verdict and the inferred verdict disagree (e.g. the agent emitted REJECTED but every remaining weakness is in the override list), treat as a skill-logic bug and surface the inconsistency rather than re-classifying the verdict.
- Editor verdict (per phase if finalise). If `NEEDS_EDITORIAL_REVISION`, lead the summary with the failing reader-experience axes (would-open / would-read-through / would-forward) and the Suggested fixes from the EDITORIAL_FINDINGS list. If skipped (newsletter-critic returned REJECTED), note "Editor: skipped (upstream REJECTED)".
- Wardley critic verdict and round count.
- Map delta (one sentence; for finalise, include any re-mutation delta).
- URL verification (step 11.5 / 11.5-prime): per-URL verdict summary as a one-line headline (e.g. "URL verification: 9 SUPPORTED, 1 INDIRECT_CONFIRMED, 0 REFUTED, 0 NOT MENTIONED across 10 URLs"). Surface any save-gate interventions inline: REFUTED fixes (with old URL and replacement URL), 404 replacements, NOT MENTIONED escalations to Tom (with the eventual disposition: dropped, swapped, or author-approved). Full per-URL table lives in `<publication-date>.reviews.md` under `## URL Verification`. Per ADR-024 confirmation criterion 4.
- Cover image: path, plus whether finalise re-rendered or carried prep image forward.
- LinkedIn post: drafted (finalise/full) or skipped (prep).
- File path to the draft (under the persona's `<draft-folder>`). For prep, this is `<draft-folder>/<publication-date>.prep.md` and the reminder is "Run `/wr-newsletter phase=finalise` on `<publish-day>` to publish." For finalise, this is `<draft-folder>/<publication-date>.md` with the reminder: "When you have published to LinkedIn, create the per-date sub-directory `<published-folder>/<persona>/<publication-date>/` (per ADR-039) and move all four files (`<publication-date>.md`, `<publication-date>.reviews.md`, `<publication-date>.linkedin.md`, `<publication-date>.capture.md`) plus the cover-image siblings (`<publication-date>.cover.svg`, `<publication-date>.cover.png`) from `<draft-folder>` into that sub-directory, then run `/wr-retrospective:run-retro` to capture learnings for next week."
- Capture transcript path: `<draft-folder>/<publication-date>.capture.md` (written at step 10, appended at 10-prime if finalise). Note any 10-prime missing-file branch outcome (`Continue without`, `Recreate`, `Abort`) per ADR 019.
- Reviews and LinkedIn-post sibling-file paths (per ADR-026): `<draft-folder>/<publication-date>.reviews.md` carries all seven review classes (Voice Review, Content Risk Review, Critic Review (Newsletter), Editor Review, Critic Review (Wardley Artifacts), Map Delta, URL Verification) plus the LinkedIn-post voice review. For finalise/full, `<draft-folder>/<publication-date>.linkedin.md` carries the LinkedIn share post body, image description, alt text, and posting notes. Confirm both siblings were written.

## Failure modes

- **Source fetch fails**: continue with available sources; record in `source_failures`. Do not retry more than once per source. Tier-1 failures block the map mutation (step 5).
- **Tier-1 source fails**: do not mutate the map this week. Run the brief against the previous map. Note the skip in the summary and in the draft's Map Delta section.
- **Tier-1 source fails during finalise (phase=finalise)**: this is the most acute failure mode in the new flow because finalise depends on the tier-1 refresh to catch late-breaking stories. If any tier-1 source fails in step 2-prime, surface to Tom via `AskUserQuestion`: (a) publish on the prep state (no late-breaking refresh), (b) abort and retry finalise later in the morning, or (c) fall back to an Also-worth-noting note in the published edition acknowledging the tier-1 source-fetch gap. Default to (a) if Tom is unavailable; the prep state is publish-ready by definition.
- **Render fails at step 7**: revert the `.owm` edit, treat as a map-update failure, note in summary, continue against previous map.
- **Fewer than three candidates clear the filter**: produce a two-item brief (or one-item if only one clears) rather than padding. Note the shortfall.
- **Google News RSS corroboration query fails at step 4b**: treat the failure like a source-fetch failure, note in `source_failures`, and default the affected candidate to `WEAK_ATTRIBUTION`. Do NOT drop on corroboration-fetch-failure alone; the corroboration path failing is a pipeline signal, not a story signal.
- **Voice review returns FAIL**: fix and re-run. Do not save a voice-failing draft.
- **Content-risk returns `VERDICT: REJECTED`**: save the draft with the block for Tom's inspection, surface the rejection in the summary, skip the newsletter critic step. Tom decides.
- **Wardley critic returns `VERDICT: REJECTED` (round-3 exhausted)**: save the critic block with the artifacts; proceed to draft the brief anyway. A weak map is still better than no map for this week's brief. Note the residual weaknesses in the summary so Tom can decide whether to rewrite the analysis.
- **Newsletter critic returns `VERDICT: REJECTED` (round-3 exhausted)**: save the draft with the block. Surface the rejection prominently. Tom decides whether to rewrite or override.
- **Newsletter critic returns `VERDICT: PASS_WITH_AUTHOR_OVERRIDES` (ADR 025)**: save the draft with the block; this is a publish-ready verdict. Surface "publish-ready with N documented overrides" in the Tom-summary along with the `OVERRIDDEN:` list. Editor (step 15.25) and downstream steps run as if the verdict were `PASS`.
- **Upstream gate returned REJECTED but critic was invoked anyway**: the critic will emit `CRITIC_ERROR: upstream gate returned REJECTED; critic will not run`. Fix the skill logic; do not ignore the error.
- **`phase=finalise` invoked with no `.prep.md` available**: handled at step 0.5 via `AskUserQuestion`. Default options: rebind to `phase=full` or abort. Do not silently fall back; the difference between phase=full and phase=finalise is meaningful.
- **`.prep.md` frontmatter missing required fields**: surface the missing fields in the summary, default missing values where safe (`map-mutation-status` defaults to `unknown`, triggering a fresh map evaluation), and continue. Do not abort: a partial prep is better than re-running everything.
- **Image generation fails at step 12 or 12-prime**: continue without image. Note in summary. The LinkedIn post adapts to a text-only format.
- **URL verification gate (step 11.5) returns REFUTED the drafter cannot resolve**: surface to Tom via `AskUserQuestion` with the specific claim and the article-body excerpt (verbatim quote from the semantic subagent). Default to dropping the claim or swapping in a different verified URL. Do NOT save the brief while any URL remains REFUTED. Record the disposition (`fixed-by-rewrite`, `url-replaced`, `claim-dropped`) in the audit-trail table.
- **URL verification gate (step 11.5) fetch fails on a non-Cloudflare URL**: retry once. If the retry fails, escalate to Tom: (a) treat as 404 and apply 404 handling (replace or drop), or (b) tag the URL `FETCH_FAILED` in the audit trail and accept the gap for this edition with explicit author approval. Default to (a). The `FETCH_FAILED` outcome is a transport-class outcome (no semantic verdict ran); it is not a fourth semantic verdict.
- **URL verification gate (step 11.5) returns NOT MENTIONED across multiple URLs in the same edition**: this is a signal that the drafter is over-extrapolating from headlines. Surface to Tom in a single `AskUserQuestion` rather than one-at-a-time, and consider it diagnostic data for the next retrospective (does the drafter need stronger capture-fidelity rules around quantitative claims? Does the brief have an over-extrapolation pattern?). Default action per URL is unchanged (treat as REFUTED unless author-approved).

## Out of scope for this pipeline

- ~~A purpose-built `wr-content-risk-scorer` skill (follow-up to ADR 012).~~ Landed as the `wr-content-risk-scorer` agent per ADR 018; see step 14.
- Scheduling, cron, GitHub Actions automation (layer 6 in PLAN.md).
- An archive page on windyroad.com.au (layer 7 in PLAN.md).
- Promoting the domain-specific critic agents (`wr-newsletter-critic`, `wr-wardley-critic`) to a marketplace plugin (ADR 016 reassessment criterion, inherited by ADR 033 as the superseding decision).
- Extracting the map-maintenance workflow to a standalone skill (ADR 014 reassessment criterion).

$ARGUMENTS
