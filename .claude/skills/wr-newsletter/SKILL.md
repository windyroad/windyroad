---
name: wr-newsletter:generate
description: Draft a weekly Windy Road newsletter. Defaults to The Shift (persona=leader, target Engineering Leaders). Pass persona=developer to draft Tokens Spent (target working Developers). Pipeline runs in three phases (ADR 017): pass phase=prep for mid-week research and drafting, phase=finalise on Friday for tier-1 refresh and publish, or phase=full (default) for the legacy single-shot run. Collects news from multiple sources, filters candidates through the Wardley precondition and three-lens criterion, updates the AI Engineering Landscape Wardley map, updates the map analysis, produces a brief that reports on what changed on the map, and runs voice + content-risk + SW-critic review gates with 3-round iteration. Saves the result to src/newsletters/drafts/<persona>/YYYY-MM-DD.md (or .prep.md during the prep phase). Run weekly when Tom is ready to produce a new issue.
allowed-tools: Read, Bash, WebFetch, Glob, Grep, Write, Edit, Skill, Agent, AskUserQuestion
---

# Windy Road newsletter generator

Weekly pipeline for either The Shift (persona=leader) or Tokens Spent (persona=developer). Persona and phase are both resolved at step 0 from `$ARGUMENTS`; everything downstream reads the resolved persona's config bundle and branches on phase. The brief is structured as commentary on a living Wardley map of the AI engineering landscape (ADR 014), with the map updated before the brief is drafted. The map and the source-fetch tier are shared across personas; weighting, voice addendum, headline, CTA, and save path differ per persona. Three review gates run on the outputs: voice (ADR 012), content-risk (ADR 012 + ADR 015), and SW-critic (ADR 016). Phase boundaries (ADR 017) split the pipeline so the time-expensive work runs mid-week (prep) and Friday morning is reserved for a tier-1 refresh plus publish (finalise).

## Reference

- Plan: `docs/ai-engineering-brief/PLAN.md`, `docs/ai-engineering-brief/developer-newsletter-concept.md`
- ADRs: `docs/decisions/011-ai-brief-orchestration-via-claude-code.proposed.md`, `012-ai-generated-content-review-gates.proposed.md`, `013-no-automated-linkedin-scraping.proposed.md`, `014-wardley-mapping-as-strategic-lens.proposed.md`, `015-reader-respect-and-gate-rejection-policy.proposed.md`, `016-sw-critic-subagents-and-iteration-loop.proposed.md`, `017-ai-brief-prep-and-finalise-phases.proposed.md`
- Voice: `docs/VOICE-AND-TONE.md` (base) plus persona addendum from `personas/<persona>.md`
- Personas: `docs/JOBS_TO_BE_DONE.md` (J1-J4 leader, J5 founder, J6-J11 developer)
- Persona configs: `.claude/skills/wr-newsletter/personas/leader.md`, `.claude/skills/wr-newsletter/personas/developer.md`
- Landscape map: `docs/ai-engineering-brief/ai-landscape.owm`, `docs/ai-engineering-brief/ai-landscape.md`
- Rubrics: `.claude/skills/wr-newsletter/assets/wardley-critic-rubric.md`, `.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md`
- Critic agent: `.claude/agents/wr-sw-critic.md`
- Filter: `.claude/skills/wr-newsletter/assets/three-lens-filter.md`
- Template: `.claude/skills/wr-newsletter/assets/draft-template.md`

## Phase model (ADR 017)

The pipeline runs in one of three phases, selected by the `phase` argument at step 0:

| phase     | When to run                          | Steps executed                              | Saves                              |
|-----------|--------------------------------------|---------------------------------------------|------------------------------------|
| `prep`    | Mid-week (Mon-Thu)                   | 0, 1, 2 (all tiers), 3, 4, 4b, 5-9, 9.5, 10, 11, 12 (image), 13, 14, 15, 16 (as `.prep.md`), 17 | `<draft-folder>/YYYY-MM-DD.prep.md` with `phase: prep` frontmatter |
| `finalise`| Friday morning                       | 0, 0.5 (load prep state), 2-prime (tier-1 refresh only), 1-prime (inbox diff), 10-prime (per-item capture on new items only), late-story branch (steps 5-9 if map-moving), 11-prime (re-draft only changed sections), 12 (re-render image only if hook changed), 13, 14, 15, 15.5 (LinkedIn post), 16 (rename `.prep.md` to `.md`), 17 | `<draft-folder>/YYYY-MM-DD.md` (final) |
| `full` (default if no phase argument) | First-time use, one-off editions, or weeks where no mid-week prep ran | 0, 1, 2, 3, 4, 4b, 5-9, 9.5, 10, 11, 12 (image), 13, 14, 15, 15.5 (LinkedIn post), 16, 17 | `<draft-folder>/YYYY-MM-DD.md` |

Default behaviour when no `phase` argument is present: `phase=full` (preserves the original single-shot run for backward compatibility per ADR 017 line 51).

The "prime" suffix on a step number means the finalise variant of that step. Where the prime variant is materially different (sources fetched, candidates filtered, items captured, sections drafted), the body of the step calls out the difference explicitly.

The critic gates (steps 9, 13, 14, 15) run independently in prep and finalise. ADR 016's 3-round cap is read per-artifact-pass, not per-edition: prep produces `.prep.md` (one artifact pass, up to 3 rounds), finalise produces the final `.md` (a second artifact pass, up to 3 rounds). See ADR 017 lines 39-41.

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
- `<voice-addendum>`: persona-specific voice notes (vocabulary preferences, evidence-stance language). Combined with the base `docs/VOICE-AND-TONE.md` rules at step 11 (drafting).
- `<cta-description>` and `<cta-invitation>`: variants from the persona config; pick one each per edition, rotating week-to-week to avoid repetition.
- `<welcome-line>`: persona-specific first-edition welcome text.
- `<headline-pattern>`: e.g. `"# <Title>\n\n*The Shift, AI engineering, week ending YYYY-MM-DD*"` or the Tokens Spent variant.
- `<draft-folder>`: e.g. `src/newsletters/drafts/leader/` or `src/newsletters/drafts/developer/`.
- `<published-folder>`: e.g. `src/newsletters/published/leader/` or `src/newsletters/published/developer/`.

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

- `<prep-draft-body>`: the full body content above the `---` review-block separator.
- `<prep-shortlist-snapshot>`: the list of items represented in the prep draft (parse the `### Item N` blocks).
- `<prep-inbox-snapshot>`: the inbox files that were resolved during the prep run (recorded in the `.prep.md` frontmatter or, if absent, derived from the prep-date by re-globbing `src/newsletters/inbox/*.md` and filtering to mtime <= prep-source-cutoff).
- `<prep-tier1-snapshot>`: the tier-1 candidate set as recorded in prep metadata (or, if absent, the tier-1 items resolvable from the prep-draft Source lines).
- `<prep-image-path>`: the path to the cover image generated in step 12 of the prep run, if any.
- `<prep-source-failures>`: the list of source URLs that failed in prep.
- `<prep-map-mutation-status>`: whether the map was mutated in prep.

Continue to step 1-prime.

### 1. Check the inbox

```
Glob: src/newsletters/inbox/*.md
```

Read any matching files. Each file contains a link plus a one-sentence note (see `src/newsletters/inbox/README.md`). Carry these as candidates. They skip the source-fetch step but still pass through the Wardley precondition and the three-lens filter.

**Phase variant `1-prime` (phase=finalise only):** instead of treating every inbox file as a fresh candidate, diff the current inbox glob against `<prep-inbox-snapshot>`. New files (those not in the snapshot) are flagged as new-inbox-since-prep and surfaced via per-item interactive capture at step 10-prime. Files already present in the snapshot are carried forward via `<prep-shortlist-snapshot>` and do not need re-filtering.

### 2. Fetch all sources

Fetch the following in parallel where possible. Each source has an extraction prompt attached.

**Phase variant `2-prime` (phase=finalise only):** re-fetch tier 1 only (Anthropic, OpenAI, DeepMind). Tier 2 and tier 3 are carried forward from `<prep-shortlist-snapshot>` and the prep-time `source_failures` list. The tier-1 refresh is the entire point of finalise: it picks up Thursday-evening or Friday-morning launches that the prep run could not have seen. New tier-1 items are diffed against `<prep-tier1-snapshot>` (by URL); only the new entries are carried into step 3-prime (build candidate list).

**Tier 1 (critical, fail the map update if any of these fail):**

- **Anthropic news**: `WebFetch https://www.anthropic.com/news` with prompt: "Extract the 10 most recent news items. For each: title, absolute URL, date if visible, one-sentence summary. Return as numbered list."
- **OpenAI news**: `WebFetch https://openai.com/news/` with prompt: "Extract the 10 most recent news items. For each: title, absolute URL, date if visible, one-sentence summary. Return as numbered list."
- **Google DeepMind blog**: `WebFetch https://deepmind.google/discover/blog/` with prompt: "Extract the 10 most recent blog posts. For each: title, absolute URL, date if visible, one-sentence summary. Return as numbered list."

**Tier 2 (important, continue on fail):**

- **Hacker News AI frontpage**: `WebFetch https://hnrss.org/frontpage?q=AI` with prompt: "Extract the top 10 items. For each: title, link URL, one-sentence summary. Skip items clearly not about AI."
- **Hacker News AI /newest**: `WebFetch https://hnrss.org/newest?q=AI&points=50` with prompt: "Extract the top 10 items with at least 50 points. For each: title, link URL, one-sentence summary. Skip items clearly not about AI."
- **Reddit r/LocalLLaMA**: `WebFetch https://www.reddit.com/r/LocalLLaMA/top/.json?t=week` with prompt: "Extract the top 10 posts of the week. For each: title, permalink URL, one-sentence summary. Skip memes and low-signal discussions."
- **Reddit r/MachineLearning**: `WebFetch https://www.reddit.com/r/MachineLearning/top/.json?t=week` with prompt: "Extract the top 10 posts of the week. For each: title, permalink URL, one-sentence summary. Focus on research results and industry developments, skip pure academic discussion."
- **Simon Willison weekly notes**: `WebFetch https://simonwillison.net/atom/everything/` with prompt: "Extract the 5 most recent posts. For each: title, URL, date, one-sentence summary."
- **AI Daily Brief (beehiiv)**: `WebFetch https://aidailybrief.beehiiv.com/` with prompt: "Extract the 10 most recent posts or episodes. For each: title, absolute URL to the post, publish date, one-sentence summary. Prioritise items that cover societal, policy, personnel, or industry-dynamics stories (for example: attacks on AI-company executives, AI-regulation votes, major hires or departures, enterprise-adoption shifts, public-reaction events). Deprioritise items that are pure product announcements from Anthropic, OpenAI, or Google DeepMind, since those are already covered by tier-1 sources. If the archive is teaser-only, return the surface-level title and date; the downstream step can follow links as needed."
- **Thoughtworks Radar**: `WebFetch https://www.thoughtworks.com/radar` with prompt: "Extract any new or moved AI, LLM, or agent-related blips in the most recent edition. For each: blip name, quadrant (Techniques/Tools/Platforms/Languages & Frameworks), ring (Adopt/Trial/Assess/Hold), one-sentence description."
- **ArXiv cs.AI recent**: `WebFetch https://arxiv.org/list/cs.AI/recent` with prompt: "Extract the 10 most recent papers from this listing. For each: title, arxiv abstract URL, authors, one-sentence summary. Focus on applied and systems-oriented work, skip pure theory."

**Tier 3 (regulatory, continue on fail):**

- **Australia OAIC**: `WebFetch https://www.oaic.gov.au/newsroom` with prompt: "Extract the 5 most recent news items mentioning AI, automated decision-making, or data privacy. For each: title, URL, date, one-sentence summary."
- **EU AI Act updates**: `WebFetch https://artificialintelligenceact.eu/` with prompt: "Extract the most recent developments, implementation updates, or guidance documents. For each: title, URL, date, one-sentence summary."
- **UK AI Safety Institute**: `WebFetch https://www.aisi.gov.uk/work` with prompt: "Extract the 5 most recent publications or announcements. For each: title, URL, date, one-sentence summary."
- **NIST AI**: `WebFetch https://www.nist.gov/artificial-intelligence/news` with prompt: "Extract the 5 most recent AI-related news items or publications. For each: title, URL, date, one-sentence summary."
- **US FTC AI actions**: `WebFetch https://www.ftc.gov/news-events/news/press-releases` with prompt: "Extract the 5 most recent press releases that mention artificial intelligence, AI, machine learning, or automated decision-making. For each: title, URL, date, one-sentence summary."
- **OECD AI**: `WebFetch https://oecd.ai/en/wonk/news` with prompt: "Extract the 5 most recent news items. For each: title, URL, date, one-sentence summary."

For any source whose URL 404s or whose extraction fails, note the failure in a local `source_failures` list and continue. Do not retry more than once per source. Record the ISO timestamp of completion of this step as `<source-cutoff>`; this is the value that gets written into `prep-source-cutoff` when phase=prep saves at step 16.

### 3. Build the candidate list

Combine inbox items, tier-1, tier-2, and tier-3 extracted items into one candidate list. Deduplicate where the same story appears in multiple feeds (prefer the primary source, for example Anthropic's own announcement over an HN discussion of it).

Record per-tier counts and the `source_failures` list so the Tom-summary can report on source coverage.

**Phase variant `3-prime` (phase=finalise only):** the candidate list is `<prep-shortlist-snapshot>` plus any new tier-1 items from step 2-prime plus any new inbox items from step 1-prime. Carry the prep-time tier-2 and tier-3 candidates forward unchanged; finalise does not re-fetch them and does not re-filter them. Only the new (post-prep) candidates need filtering at step 4-prime.

### 4. Apply the Wardley preference + three-lens filter

Read `.claude/skills/wr-newsletter/assets/three-lens-filter.md` and `docs/ai-engineering-brief/ai-landscape.md`.

For every candidate:

1. **Wardley preference**: tag each candidate `MAP_ANCHORED` or `NO_MAP_ANCHOR` against the previous week's map. Map anchoring is a preference, not a precondition; a candidate without a clean map anchor can still qualify on three-lens strength alone (see the asset `three-lens-filter.md` for the full policy). The map update itself runs next at step 5, before per-item voice capture.
2. **Three-lens scoring**: for surviving candidates, score yes or no on technical, operational, human. Keep those scoring yes on at least two.
3. **Source tagging**: for each surviving candidate, inspect the URLs on the candidate. Tag `HAS_PRIMARY_SOURCE` if any URL is a tier-1 primary outlet (Anthropic, OpenAI, DeepMind, or any outlet in the primary-outlet allowlist in `three-lens-filter.md`). Tag `NO_PRIMARY_SOURCE` if the only URLs are secondary aggregators (AI Daily Brief, Stratechery, podcast notes, letsdatascience.com, aidailybrief.beehiiv.com). The corroboration sub-step 4b acts on the `NO_PRIMARY_SOURCE` set.

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
   - **3+ distinct primary outlets**: tag the candidate `CORROBORATED_PRIMARY`. Attach the 3 strongest outlet/URL pairs to the candidate's metadata (this becomes the Source line's attribution in step 11). Move the candidate into the main shortlist as if it were tier-1-sourced.
   - **0 to 2 distinct primary outlets**: tag the candidate `WEAK_ATTRIBUTION`. Do NOT drop. Carry on a separate weak-attribution list that step 10 surfaces to Tom for explicit keep/drop/ask-for-help resolution.

5. Record per-candidate corroboration outcome in internal metadata (count of distinct primary outlets, query used, top 3 outlets). The Tom-summary at step 17 reports on the corroboration pass.

**Placement rationale** (P016 investigation task resolution): corroboration runs AFTER three-lens scoring so weak-three-lens candidates are cheap-dropped before burning a Google News query, and BEFORE the map-mutation gate (step 5) so `CORROBORATED_PRIMARY` candidates can legitimately anchor to map movement in step 6. Tier-1-sourced candidates bypass this step entirely; the expected fan-out is 0-2 Google News queries per edition in a typical week.

**Precedent**: the Google News RSS mechanism is already established in the pipeline for OpenAI tier-1 source-fetch fallback (see `docs/ai-engineering-brief/ai-landscape.md` Source-coverage notes and P010). This sub-step reuses the same mechanism for a second use case; a follow-up ADR amendment codifying Google News RSS as a first-class pipeline primitive for both tier-1 fallback and aggregator corroboration is advisable (see `docs/decisions/016-sw-critic-subagents-and-iteration-loop.proposed.md`).

**Phase variant `4b-prime` (phase=finalise only):** corroborate only new (post-prep) candidates that landed in `NO_PRIMARY_SOURCE`. Prep-time corroboration outcomes are carried forward in `<prep-shortlist-snapshot>`.

### 5. Map-mutation gate (ADR 016 failure-mode rule)

Before touching the map, check the `source_failures` list. If any **tier-1 source** (Anthropic, OpenAI, DeepMind) failed this run, **do not mutate the map this week**.

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
    - `Also-worth-noting`: keep the item but do not mutate the map. Add as Also-worth-noting in step 11-prime. Continue to step 9.5-prime.
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
- Check that every `evolve` arrow in the `.owm` has a corresponding Evolution-section explanation (rubric check_14).
- Check that every component in Genesis or Custom-Built phase appears in Differentiation (rubric check_9).

### 9. Critic loop on the Wardley artifacts (ADR 016)

Run the critic agent against the updated map + analysis.

```
Agent subagent_type: wr-sw-critic
prompt: "Review the Wardley artifact.

artifact_path: /Users/tomhoward/Projects/windyroad/docs/ai-engineering-brief/ai-landscape.md
rubric_path: /Users/tomhoward/Projects/windyroad/.claude/skills/wr-newsletter/assets/wardley-critic-rubric.md
round_number: 1
prior_weaknesses: n/a"
```

Parse the returned `CRITIC_REVIEW` block:
- If `VERDICT: PASS`: proceed to step 9.5.
- If `VERDICT: WEAKNESSES_FOUND`: fix each listed weakness in `ai-landscape.md` (or `.owm` if the weakness is structural). Re-invoke the critic with `round_number: 2` and `prior_weaknesses: <round-1 weaknesses verbatim>`.
- Repeat for up to round 3. On `VERDICT: REJECTED` with `REJECTED_REASON: critic-loop-exhausted`, save the review block with the artifacts and note the unresolved weaknesses in the summary, but still proceed to step 9.5. The map is the best we have this week; a weak map still beats no map.

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

Capture per-item responses. Adjusts feed the drafter (step 11): Why-it-matters and Human-angle lines incorporate Tom's phrasing where he gave any, otherwise use the original take. The "From Tom" opener (step 11) is assembled from the strongest POV across Tom's adjusts that week.

If zero candidates get an Adjust with a strong POV, the opener defaults to a meta-observation about the week's theme (not a model-guess at Tom's voice). Note in the summary.

After the main shortlist per-item capture completes, run a second pass for any candidates tagged `WEAK_ATTRIBUTION` at step 4b (P016). For each weak-attribution candidate, call `AskUserQuestion` with:

- **question**: `"Weak-attribution item <N>: <one-sentence story summary>. Aggregator-only source: <aggregator URL>. Corroboration outcome: <N> distinct primary outlets found (<list of outlet names>); threshold for primary-sourced treatment is 3. Keep as Also-worth-noting, Drop, or Ask for help?"`
- **options**:
  - `Keep as Also-worth-noting`: include in the draft as an Also-worth-noting entry (not a full Item block). Attribution line names the aggregator plus any primary outlets that did surface.
  - `Drop`: remove from consideration. Record reason in internal metadata.
  - `Ask for help`: Tom wants to discuss further before deciding. Free-text capture via "Other". The drafter pauses on this item; the Tom-summary surfaces the unresolved question.
- **multiSelect**: false

Weak-attribution handling preserves the signal that the earlier filter would have silently dropped. A weak-attribution candidate that Tom keeps joins the main draft as an Also-worth-noting entry (short paragraph, not a full Item). Tom's Drop reasons feed future filter tuning.

**Phase variant `10-prime` (phase=finalise only):** run per-item capture only on:

1. New tier-1 items from step 2-prime that cleared step 4-prime, plus new inbox items from step 1-prime.
2. Late-story `Also-worth-noting` items from the step 5-prime branch (if `Also-worth-noting` was chosen).
3. New `WEAK_ATTRIBUTION` candidates from step 4b-prime (a separate pass, same as step 10's second pass).

Prep-time per-item responses (Agree, Adjust, Drop) are carried forward via `<prep-shortlist-snapshot>` and not re-asked. Tom's prep-time Adjusts and Drops still drive the corresponding Item blocks in the finalise draft.

### 11. Draft the brief

Before drafting, determine the edition number: count `<published-folder>/*.md` files (resolved at step 0) and add one for the current draft. Write the edition number into the draft frontmatter (`edition: N`) so the critic's check_25 can reason about first-edition vs ongoing framing. For edition 1, include the persona's `<welcome-line>` above the voice opener; for edition >=2, drop or freshly reframe the welcome line rather than repeating the first-edition text.

Read `docs/VOICE-AND-TONE.md` (base) and the `<voice-addendum>` from the persona config, plus `.claude/skills/wr-newsletter/assets/draft-template.md` and `docs/ai-engineering-brief/ai-landscape.md`.

Produce a draft with:
- Headline: a unique POV-carrying H1 (6-12 words), followed on the next non-blank line by the persona's `<headline-pattern>` subtitle (e.g. `*The Shift, AI engineering, week ending YYYY-MM-DD*` for leader, or `*Tokens Spent, AI engineering for developers, week ending YYYY-MM-DD*` for developer).
- One-sentence intro naming the theme and the main map movement of the week.
- For developer persona, label each item's evidence stance as **shipped**, **benchmarked**, **demo**, or **not yet** (J9 + J11 paired). For leader persona, the evidence label is optional; business-consequence framing carries primary weight.
- One `### Item N` block per shortlisted candidate (minimum 3, no maximum), ordered by `<three-lens-weighting>`. Each item has: What happened, Map movement, Why it matters to your team, The human angle, Source.
- Closing CTA: pick one `<cta-description>` and one `<cta-invitation>` from the persona config (rotate week to week to avoid verbatim repetition), followed by the closing line `windyroad.com.au`.

Voice rules (enforced by step 13 voice gate):
- Team voice ("we"), not "I" (ADR 010). The "From Tom" opener is the only place where "I" is permitted.
- Direct, specific, confident. Name the org, name the artifact, name the date.
- No em-dashes. Use commas, periods, colons, or parentheses.
- No hype words.
- Respect the reader's team (ADR 015). Describe industry baselines and situations, not the reader's team's competence. This applies to both personas; the developer-audience equivalent is "do not call a developer's tool choice incompetent; criticise via evidence."
- Apply the persona's `<voice-addendum>` for vocabulary preferences (leader-coded vs developer-coded language).

**Phase variant `11-prime` (phase=finalise only):** start from `<prep-draft-body>` rather than drafting from scratch. Apply changes only for:

1. New Item blocks for kept new tier-1 items from step 10-prime.
2. New Also-worth-noting blocks for `Also-worth-noting` items from step 5-prime, kept new `WEAK_ATTRIBUTION` items from step 10-prime, and any prep-time `Ask for help` items Tom resolved between phases.
3. Re-ranked Item ordering if step 9.5-prime re-ranked.
4. Updated headline / intro line if the late-story branch (step 5-prime) chose `Restructure` and the week's theme genuinely shifted.
5. Updated Map movement lines on existing items if the map was re-mutated at step 6-prime.

If no material changes apply, `11-prime` is a no-op and `<prep-draft-body>` is the finalise draft body unchanged.

### 12. Generate cover image

Brand assets must be discovered before any image generation: grep for existing brand-asset paths and styles per BRIEFING.md "What You Need to Know" rule, then design the cover against those assets.

Compose a cover image that supports the headline and the week's theme. The image must:

- Use the brand palette and typography established in the asset audit.
- Carry alt text of 100-160 characters describing the image content (image is published alongside the LinkedIn post; alt text is required, not optional).
- Be saved at `<draft-folder>/YYYY-MM-DD.cover.<ext>` so the finalise phase can locate it via the same date-anchored convention as the draft itself.

**Render-and-verify discipline (P011).** When the cover (or any other visual artifact in this pipeline) is authored as SVG, do not present the SVG without first rendering and visually inspecting the result yourself. SVG output depends on font availability, stroke paths, coordinate systems, and layering, so describing the SVG's intent is not a substitute for looking at the rendered PNG. The flow is:

1. Write the SVG (`Write` / `Edit`).
2. Render to PNG via the shared helper:

   ```bash
   node scripts/render-svg.mjs <input.svg> <output.png> [--size <px>]
   ```

   The helper wraps `sips -s format png -Z <size> in.svg --out out.png` so the command is consistent across contributors. Default `--size` is 1200; choose smaller (e.g. 200-400) for quick visual checks.
3. `Read` the output PNG. The harness renders the PNG inline in the tool result.
4. Visually compare the rendered image against the brief and the brand assets. If anything is off (overlapping text, broken strokes, lines overshooting, monogram clashes, incorrect colours), fix the SVG and re-render before continuing.
5. Only present the artifact to Tom once the rendered PNG matches intent.

This is the same pattern as `wr-wardley:generate` step 9-10 and `owm-to-svg.mjs`; step 12 inherits it explicitly because cover-image work is where the discipline gap originally surfaced.

If the image generation tooling fails or returns an unbranded result, do not block the pipeline: note the failure in the summary, fall back to a text-only edition, and continue.

**Phase variant `12-prime` (phase=finalise only): re-render gate.** Compare the finalise-time headline (from step 11-prime) against the prep-time headline (from `<prep-draft-body>`). If the headline is unchanged AND the week's theme is unchanged, carry `<prep-image-path>` forward without re-rendering. If either changed materially, re-render the cover image against the finalise-time headline. The re-render check is a string compare on the H1 line plus a semantic check on the intro sentence (a single-word edit that does not change meaning is "unchanged"; a re-framed theme is "changed"). When in doubt, re-render: image work in finalise is the explicit ADR 017 safety valve for late-breaking news.

### 13. Voice review gate (ADR 012)

```
Agent subagent_type: wr-voice-tone:agent
prompt: "Review the following AI Engineering Brief draft against docs/VOICE-AND-TONE.md. Pay particular attention to em-dashes, word list, hype words, team voice (ADR 010), and the 'Respectful of the reader's team' clause (ADR 015). Return PASS or FAIL plus specific findings.

<paste the full draft here>"
```

If FAIL: fix the flagged passages in the draft, re-run voice review. Do not proceed until PASS. Capture the final voice review block for the saved draft.

**Phase variant `13-prime` (phase=finalise only):** run the voice gate against the finalise-time draft body. The gate runs on the full draft (not a diff against `<prep-draft-body>`) so any voice regressions introduced by step 11-prime's edits are caught.

### 14. Content-risk review gate (ADR 012 + ADR 015)

Inline judgement. Score each axis on low, medium, or high:

- **factual**: how likely is any stated fact to be wrong? (named models, dates, capabilities, company actions, numbers).
- **reputational**: is there anything here that could embarrass Tom or Windy Road? (dismissive tone toward a company, unfalsifiable predictions, punching down).
- **claims**: are there predictions or "this means X" statements that need a source or qualifier?
- **attribution**: is every source cited, and are any quotes properly attributed?
- **reader-respect** (ADR 015): does the draft frame the reader's team as behind, slow, negligent, or inadequate? Score `high` if any passage passes judgement on the reader's team's competence. Score `low` if the draft describes industry baselines or external threats without attributing fault.

Compute verdict: any axis `high` yields `VERDICT: REJECTED`. Otherwise `VERDICT: PASS`.

Emit:

```
CONTENT_RISK: factual=<...> reputational=<...> claims=<...> attribution=<...> reader-respect=<...>
VERDICT: <PASS|REJECTED>
Notes:
- <flagged passage 1, or "no flags">
```

If `VERDICT: REJECTED`: save the draft with the block, surface the rejection prominently in the Tom-summary, and skip step 15. Tom decides whether to rewrite or override.

If `VERDICT: PASS`: proceed to step 15.

**Phase variant `14-prime` (phase=finalise only):** run on the finalise-time full draft body, same scoring rubric. A prep-time PASS does not exempt finalise; new items or restructured framing in 11-prime can change the risk surface.

### 15. Critic loop on the newsletter draft (ADR 016)

```
Agent subagent_type: wr-sw-critic
prompt: "Review the newsletter draft.

artifact_path: <path to the in-progress draft>
rubric_path: /Users/tomhoward/Projects/windyroad/.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md
round_number: 1
prior_weaknesses: n/a"
```

Parse the `CRITIC_REVIEW` block:
- `VERDICT: PASS`: proceed to step 16.
- `VERDICT: WEAKNESSES_FOUND`: fix each listed weakness in the draft. Re-invoke with `round_number: 2` and `prior_weaknesses: <round-1 verbatim>`.
- Up to round 3. On round-3 exhaustion, emit `VERDICT: REJECTED` with `REJECTED_REASON: critic-loop-exhausted`; save the draft with the block and surface the unresolved weaknesses in the Tom-summary.

Capture the final critic block for the saved draft.

**Phase variant `15-prime` (phase=finalise only):** runs against the finalise-time draft with a fresh per-artifact-pass budget (up to 3 rounds) under ADR 017 lines 39-41. The prep-time critic block is preserved in the saved draft alongside the finalise-time block (see step 16-prime); both are part of the audit trail. If finalise has no material changes (11-prime was a no-op AND 12-prime carried the image forward AND 13-prime/14-prime passed without edits), the prep-time critic block can be carried forward and 15-prime is a no-op. Default behaviour when in doubt: re-run.

### 15.5. Draft the LinkedIn post

Skip this step when `phase=prep`. The LinkedIn post is the publication-day artifact; drafting it during prep would burn tokens on a draft that finalise will likely re-do once late-breaking news lands.

For `phase=finalise` and `phase=full`, draft a LinkedIn post that:

- Opens with a hook line (one sentence) that names the week's theme and the main map movement.
- Carries the headline H1 from step 11/11-prime.
- Includes 2-3 bullet items (the strongest items from the brief), each one sentence.
- Closes with a call-to-read pointing to the published edition (link inserted at publish time).
- Is no longer than the LinkedIn 3000-character limit.

The LinkedIn post carries the cover image from step 12/12-prime as its hero image; alt text from step 12 is reused.

Save the LinkedIn post inline in the saved draft (see step 16) under a `## LinkedIn Post` heading so it travels with the brief. Tom edits and posts manually per ADR 013.

### 16. Save the draft

Compute today's date in ISO format (`YYYY-MM-DD`). Use the `Write` tool. If a file for today's date already exists, ask Tom whether to overwrite or append a suffix like `-2` to the filename.

Branch on phase:

#### phase=prep: save as `.prep.md`

Write `<draft-folder>/YYYY-MM-DD.prep.md` with the following frontmatter at the top of the file:

```
---
phase: prep
prep-date: <YYYY-MM-DD of the prep run>
prep-source-cutoff: <ISO timestamp recorded at end of step 2>
source-failures:
  - <URL of any tier-1/2/3 source that failed>
map-mutation-status: <"mutated" or "skipped: <reason>" per step 5>
edition: <N from step 11>
persona: <leader|developer>
---
```

Then the draft body, then the review-block separator, then this exact structure:

```
<draft body from step 11, after any step-15 fixes>

---

## Voice Review

<voice review block from step 13>

## Content Risk Review

<content-risk block from step 14>

## Critic Review: Newsletter

<critic block from step 15, or "N/A: content-risk returned REJECTED" if step 15 was skipped>

## Critic Review: Wardley Artifacts

<critic block from step 9>

## Map Delta

<one-sentence summary of what moved in ai-landscape.owm this run, or "MAP_UPDATE_SKIPPED: <reason>" if step 5 blocked the update>
```

The LinkedIn post is NOT included in the prep save (step 15.5 was skipped). Image path (from step 12) is recorded in frontmatter as `cover-image: <path>` for finalise to pick up.

#### phase=finalise: rename `.prep.md` to `.md` and write final body

The finalise-time output replaces the prep-time `.prep.md`. Two operations:

1. Write the final body to `<draft-folder>/YYYY-MM-DD.md` with this structure:

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
   ---

   <final draft body from step 11-prime>

   ---

   ## LinkedIn Post

   <LinkedIn post from step 15.5>

   ---

   ## Voice Review (finalise)

   <voice review block from step 13-prime>

   ## Voice Review (prep)

   <voice review block carried from .prep.md>

   ## Content Risk Review (finalise)

   <content-risk block from step 14-prime>

   ## Content Risk Review (prep)

   <content-risk block carried from .prep.md>

   ## Critic Review: Newsletter (finalise)

   <critic block from step 15-prime>

   ## Critic Review: Newsletter (prep)

   <critic block carried from .prep.md>

   ## Critic Review: Wardley Artifacts

   <critic block from step 9-prime if Restructure ran, else carried from .prep.md>

   ## Map Delta

   <prep-time map delta line, plus "+ <one-sentence finalise re-mutation summary>" if step 5-prime restructured, else prep delta unchanged>
   ```

2. Delete the `.prep.md` file. The audit trail lives in the finalise file's carried-forward review blocks plus git history of the `.prep.md`.

#### phase=full: save as `.md` (legacy single-shot)

Write `<draft-folder>/YYYY-MM-DD.md` with the same structure as the existing pre-ADR-017 behaviour. Frontmatter:

```
---
phase: full
source-cutoff: <ISO timestamp recorded at end of step 2>
source-failures:
  - <URL of any tier-1/2/3 source that failed>
map-mutation-status: <"mutated" or "skipped: <reason>" per step 5>
edition: <N from step 11>
persona: <leader|developer>
cover-image: <path>
---
```

Body and review sections follow the existing structure: draft body, separator, Voice Review, Content Risk Review, Critic Review: Newsletter, Critic Review: Wardley Artifacts, Map Delta, plus a `## LinkedIn Post` section after the body.

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
- Newsletter critic verdict and round count (per phase if finalise). If `REJECTED`, lead the summary with "VERDICT: REJECTED. Do not publish as-is. Rewrite and re-run." and quote the residual weaknesses.
- Wardley critic verdict and round count.
- Map delta (one sentence; for finalise, include any re-mutation delta).
- Cover image: path, plus whether finalise re-rendered or carried prep image forward.
- LinkedIn post: drafted (finalise/full) or skipped (prep).
- File path to the draft (under the persona's `<draft-folder>`). For prep, this is `<draft-folder>/YYYY-MM-DD.prep.md` and the reminder is "Run `/wr-newsletter phase=finalise` on Friday to publish." For finalise, this is `<draft-folder>/YYYY-MM-DD.md` with the reminder: "When you have published to LinkedIn, move the file to `<published-folder>` and run `/wr-retrospective:run-retro` to capture learnings for next week."

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
- **Upstream gate returned REJECTED but critic was invoked anyway**: the critic will emit `CRITIC_ERROR: upstream gate returned REJECTED; critic will not run`. Fix the skill logic; do not ignore the error.
- **`phase=finalise` invoked with no `.prep.md` available**: handled at step 0.5 via `AskUserQuestion`. Default options: rebind to `phase=full` or abort. Do not silently fall back; the difference between phase=full and phase=finalise is meaningful.
- **`.prep.md` frontmatter missing required fields**: surface the missing fields in the summary, default missing values where safe (`map-mutation-status` defaults to `unknown`, triggering a fresh map evaluation), and continue. Do not abort: a partial prep is better than re-running everything.
- **Image generation fails at step 12 or 12-prime**: continue without image. Note in summary. The LinkedIn post adapts to a text-only format.

## Out of scope for this pipeline

- A purpose-built `wr-content-risk-scorer` skill (follow-up to ADR 012).
- Scheduling, cron, GitHub Actions automation (layer 6 in PLAN.md).
- An archive page on windyroad.com.au (layer 7 in PLAN.md).
- Promoting `wr-sw-critic` to a marketplace plugin (ADR 016 reassessment criterion).
- Extracting the map-maintenance workflow to a standalone skill (ADR 014 reassessment criterion).

$ARGUMENTS
