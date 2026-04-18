---
name: wr-newsletter:generate
description: Draft a weekly Windy Road newsletter. Defaults to The Shift (persona=leader, target Engineering Leaders). Pass persona=developer to draft Tokens Spent (target working Developers). Collects news from multiple sources, filters candidates through the Wardley precondition and three-lens criterion, updates the AI Engineering Landscape Wardley map, updates the map analysis, produces a brief that reports on what changed on the map, and runs voice + content-risk + SW-critic review gates with 3-round iteration. Saves the result to src/newsletters/drafts/<persona>/YYYY-MM-DD.md. Run weekly when Tom is ready to produce a new issue.
allowed-tools: Read, Bash, WebFetch, Glob, Grep, Write, Edit, Skill, Agent, AskUserQuestion
---

# Windy Road newsletter generator

Weekly pipeline for either The Shift (persona=leader) or Tokens Spent (persona=developer). Persona is resolved at step 0 from `$ARGUMENTS`; everything downstream reads the resolved persona's config bundle. The brief is structured as commentary on a living Wardley map of the AI engineering landscape (ADR 014), with the map updated before the brief is drafted. The map and the source-fetch tier are shared across personas; weighting, voice addendum, headline, CTA, and save path differ per persona. Three review gates run on the outputs: voice (ADR 012), content-risk (ADR 012 + ADR 015), and SW-critic (ADR 016).

## Reference

- Plan: `docs/ai-engineering-brief/PLAN.md`, `docs/ai-engineering-brief/developer-newsletter-concept.md`
- ADRs: `docs/decisions/011-ai-brief-orchestration-via-claude-code.proposed.md`, `012-ai-generated-content-review-gates.proposed.md`, `013-no-automated-linkedin-scraping.proposed.md`, `014-wardley-mapping-as-strategic-lens.proposed.md`, `015-reader-respect-and-gate-rejection-policy.proposed.md`, `016-sw-critic-subagents-and-iteration-loop.proposed.md`
- Voice: `docs/VOICE-AND-TONE.md` (base) plus persona addendum from `personas/<persona>.md`
- Personas: `docs/JOBS_TO_BE_DONE.md` (J1-J4 leader, J5 founder, J6-J11 developer)
- Persona configs: `.claude/skills/wr-newsletter/personas/leader.md`, `.claude/skills/wr-newsletter/personas/developer.md`
- Landscape map: `docs/ai-engineering-brief/ai-landscape.owm`, `docs/ai-engineering-brief/ai-landscape.md`
- Rubrics: `.claude/skills/wr-newsletter/assets/wardley-critic-rubric.md`, `.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md`
- Critic agent: `.claude/agents/wr-sw-critic.md`
- Filter: `.claude/skills/wr-newsletter/assets/three-lens-filter.md`
- Template: `.claude/skills/wr-newsletter/assets/draft-template.md`

## Pipeline

Execute in order. Each numbered step is a distinct phase.

### 0. Resolve persona

Parse `$ARGUMENTS` for a `persona=<value>` pair. If absent, default to `persona=leader` (preserves the original behaviour where the skill drafts The Shift).

Valid values: `leader`, `developer`. Reject any other value with: `ERROR: unknown persona '<value>'. Valid personas: leader, developer. See .claude/skills/wr-newsletter/personas/ for available configs.`

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

Record the resolved persona in the draft summary and in any commit messages produced from this run.

### 1. Check the inbox

```
Glob: src/newsletters/inbox/*.md
```

Read any matching files. Each file contains a link plus a one-sentence note (see `src/newsletters/inbox/README.md`). Carry these as candidates. They skip the source-fetch step but still pass through the Wardley precondition and the three-lens filter.

### 2. Fetch all sources

Fetch the following in parallel where possible. Each source has an extraction prompt attached.

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

For any source whose URL 404s or whose extraction fails, note the failure in a local `source_failures` list and continue. Do not retry more than once per source.

### 3. Build the candidate list

Combine inbox items, tier-1, tier-2, and tier-3 extracted items into one candidate list. Deduplicate where the same story appears in multiple feeds (prefer the primary source, for example Anthropic's own announcement over an HN discussion of it).

Record per-tier counts and the `source_failures` list so the Tom-summary can report on source coverage.

### 4. Apply the Wardley precondition + three-lens filter

Read `.claude/skills/wr-newsletter/assets/three-lens-filter.md` and `docs/ai-engineering-brief/ai-landscape.md`.

For every candidate:

1. **Wardley precondition**: can this candidate be anchored to an observable map movement? If no, drop the candidate. The "observable map movement" comparison uses the previous week's map as a baseline. The map update itself runs next at step 5, before per-item voice capture.
2. **Three-lens scoring**: for surviving candidates, score yes or no on technical, operational, human. Keep those scoring yes on at least two.

The filtered list is the interim shortlist passed to steps 5 through 9. There is no upper cap. Minimum three. If fewer than three candidates clear the filter, note the shortfall in the summary for Tom rather than padding. **Persona-weighted ranking runs after the map is updated** (see step 9.5), because the ranking needs this week's map positions, not last week's.

### 5. Map-mutation gate (ADR 016 failure-mode rule)

Before touching the map, check the `source_failures` list. If any **tier-1 source** (Anthropic, OpenAI, DeepMind) failed this run, **do not mutate the map this week**.

In the tier-1-fail case:
- Skip steps 6, 7, 8 (map update, render, analysis update).
- Produce the brief against the *unchanged* map from the previous run.
- Note the skip in the summary: "MAP_UPDATE_SKIPPED: tier-1 source(s) <names> failed, running against previous map."
- Each item's Map movement line refers to existing movement in the current analysis, not to any update this run.

If all tier-1 sources succeeded, proceed to step 6. Tier-2 or tier-3 failures do not block map mutation; record them in a note on the commit message when the map is updated.

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

### 9.5. Persona-weighted ranking

Among the candidates that cleared step 4, and using this week's updated map (steps 5-8) plus the Wardley critic's latest verdict (step 9), order by `<three-lens-weighting>` from the persona config. Items strong on the persona's primary lens rank above items strong only on secondary lenses. Ties broken by `<source-weighting>` (a primary-tier-source item beats a secondary-tier-source item on the same lens score). Map movement this week is explicit input to the ordering: candidates whose related map component moved this week rank above candidates with comparable lens scores whose components did not move.

Output: the final persona-weighted shortlist. This is the input to step 10's per-item voice capture.

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

### 13. Voice review gate (ADR 012)

```
Agent subagent_type: wr-voice-tone:agent
prompt: "Review the following AI Engineering Brief draft against docs/VOICE-AND-TONE.md. Pay particular attention to em-dashes, word list, hype words, team voice (ADR 010), and the 'Respectful of the reader's team' clause (ADR 015). Return PASS or FAIL plus specific findings.

<paste the full draft here>"
```

If FAIL: fix the flagged passages in the draft, re-run voice review. Do not proceed until PASS. Capture the final voice review block for the saved draft.

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

### 16. Save the draft

Compute today's date in ISO format (`YYYY-MM-DD`). Write `<draft-folder>/YYYY-MM-DD.md` (resolved at step 0, e.g. `src/newsletters/drafts/leader/YYYY-MM-DD.md` or `src/newsletters/drafts/developer/YYYY-MM-DD.md`) with this exact structure:

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

Use the `Write` tool. If a file for today's date already exists, ask Tom whether to overwrite or append a suffix like `-2` to the filename.

### 17. Summarise for Tom

Report back in chat:

- Persona resolved (`leader` / `developer`) and publication name (`The Shift` / `Tokens Spent`).
- Candidate count by source tier (tier-1, tier-2, tier-3, inbox).
- Source failures, if any.
- Map-mutation status (mutated / skipped with reason).
- Filtered count that cleared the Wardley precondition and three-lens bar.
- Final item count (minimum 3, no cap).
- Voice review verdict.
- Content-risk block with verdict.
- Newsletter critic verdict and round count. If `REJECTED`, lead the summary with "VERDICT: REJECTED. Do not publish as-is. Rewrite and re-run." and quote the residual weaknesses.
- Wardley critic verdict and round count.
- Map delta (one sentence).
- File path to the draft (under the persona's `<draft-folder>`).
- Reminder: "When you have published to LinkedIn, move the file to `<published-folder>` and run `/wr-retrospective:run-retro` to capture learnings for next week."

## Failure modes

- **Source fetch fails**: continue with available sources; record in `source_failures`. Do not retry more than once per source. Tier-1 failures block the map mutation (step 5).
- **Tier-1 source fails**: do not mutate the map this week. Run the brief against the previous map. Note the skip in the summary and in the draft's Map Delta section.
- **Render fails at step 7**: revert the `.owm` edit, treat as a map-update failure, note in summary, continue against previous map.
- **Fewer than three candidates clear the filter**: produce a two-item brief (or one-item if only one clears) rather than padding. Note the shortfall.
- **Voice review returns FAIL**: fix and re-run. Do not save a voice-failing draft.
- **Content-risk returns `VERDICT: REJECTED`**: save the draft with the block for Tom's inspection, surface the rejection in the summary, skip the newsletter critic step. Tom decides.
- **Wardley critic returns `VERDICT: REJECTED` (round-3 exhausted)**: save the critic block with the artifacts; proceed to draft the brief anyway. A weak map is still better than no map for this week's brief. Note the residual weaknesses in the summary so Tom can decide whether to rewrite the analysis.
- **Newsletter critic returns `VERDICT: REJECTED` (round-3 exhausted)**: save the draft with the block. Surface the rejection prominently. Tom decides whether to rewrite or override.
- **Upstream gate returned REJECTED but critic was invoked anyway**: the critic will emit `CRITIC_ERROR: upstream gate returned REJECTED; critic will not run`. Fix the skill logic; do not ignore the error.

## Out of scope for this pipeline

- A purpose-built `wr-content-risk-scorer` skill (follow-up to ADR 012).
- Scheduling, cron, GitHub Actions automation (layer 6 in PLAN.md).
- An archive page on windyroad.com.au (layer 7 in PLAN.md).
- Promoting `wr-sw-critic` to a marketplace plugin (ADR 016 reassessment criterion).
- Extracting the map-maintenance workflow to a standalone skill (ADR 014 reassessment criterion).

$ARGUMENTS
