---
name: wr-newsletter:generate
description: Draft the weekly AI Engineering Brief newsletter. Fetches the Anthropic news page and the Hacker News AI-filtered feed, reads any LinkedIn drops from src/newsletters/inbox/, filters candidates through a three-lens criterion (technical, operational, human), drafts a three-item brief in the project voice, runs mandatory voice and content-risk review gates, and saves the result to src/newsletters/drafts/YYYY-MM-DD.md. Run this weekly when Tom is ready to produce a new issue.
allowed-tools: Read, Bash, WebFetch, Glob, Grep, Write, Edit, Skill, Agent, AskUserQuestion
---

# AI Engineering Brief generator

Walking skeleton pipeline for the weekly AI Engineering Brief. Produces a review-gated draft at `src/newsletters/drafts/YYYY-MM-DD.md`.

## Reference

- Plan: `docs/ai-engineering-brief/PLAN.md`
- ADRs: `docs/decisions/011-ai-brief-orchestration-via-claude-code.proposed.md`, `012-ai-generated-content-review-gates.proposed.md`, `013-no-automated-linkedin-scraping.proposed.md`
- Voice: `docs/VOICE-AND-TONE.md`
- Persona: `docs/JOBS_TO_BE_DONE.md` (Engineering Leader is the target reader)

## Steps (execute in order)

### 1. Check the inbox

```
Glob: src/newsletters/inbox/*.md
```

Read any matching files. Each file contains a link plus a one-sentence note (see `src/newsletters/inbox/README.md`). Carry these as candidates. They skip the source-fetch step but still pass through the three-lens filter.

### 2. Fetch the Anthropic news page

Anthropic does not publish a public RSS feed. Use WebFetch against the news page with an extraction prompt.

```
WebFetch: https://www.anthropic.com/news
Prompt: "Extract the 10 most recent news items on this page. For each item return: title, absolute URL, date if visible, and a one-sentence summary of what the item is about. Return as a numbered list."
```

Keep items dated within the last 14 days. If the page layout has changed and the extraction fails, note the failure in the summary for Tom and continue with the HN source only.

### 3. Fetch the Hacker News AI-filtered feed

```
WebFetch: https://hnrss.org/frontpage?q=AI
Prompt: "Extract the top 10 items from this RSS feed. For each item return: title, link URL, one-sentence summary. Skip items that are clearly not about AI, even though the feed search matched."
```

### 4. Apply the three-lens filter

Read `.claude/skills/wr-newsletter/assets/three-lens-filter.md`.

For every candidate (inbox plus Anthropic plus HN), score yes or no on each of the three lenses: technical, operational, human. Keep candidates scoring yes on at least two lenses. Among the kept candidates, prioritise those scoring yes on all three. Select three items for the brief. If fewer than three candidates clear the bar, note the shortfall in the summary rather than padding.

### 5. Draft the brief

Read `docs/VOICE-AND-TONE.md` and `.claude/skills/wr-newsletter/assets/draft-template.md`.

Produce a draft with:
- A headline: `# The AI Engineering Brief: <Week ending YYYY-MM-DD>`
- A one-sentence intro naming the theme of this week's items.
- Three `### Item N` sections each with: what happened (one sentence, factual, attribution), why it matters to your team (one sentence, operational consequence), the human angle (one sentence, change management or psychology or sociology), source URL.
- A soft CTA closer: "We help engineering teams navigate this. windyroad.com.au"

Voice rules:
- Team voice ("we"), not "I" (ADR 010).
- Direct, specific, confident. Name the org, name the artifact, name the date.
- No em-dashes. Use commas, periods, colons, or parentheses.
- No hype words ("revolutionary", "game-changing", "unprecedented").

### 6. Voice review gate (ADR 012)

Invoke the voice specialist as a subagent:

```
Agent subagent_type: wr-voice-tone:agent
prompt: "Review the following AI Engineering Brief draft against docs/VOICE-AND-TONE.md. Report any violations of voice, tone, banned patterns, or em-dash usage. Return PASS or FAIL plus any specific findings.

<paste the full draft here>"
```

Capture the returned review block verbatim. This becomes the `## Voice Review` section of the output file.

### 7. Content-risk review gate (ADR 012)

Inline judgement. For the draft you just produced, score each of the following on low, medium, or high:

- **factual**: how likely is any stated fact to be wrong? (Focus on named models, dates, capabilities, company actions, numbers.)
- **reputational**: is there anything here that could embarrass Tom or Windy Road if shared widely? (Dismissive tone toward a company, unfalsifiable predictions, punching down.)
- **claims**: are there predictions or "this means X" statements that need a source or qualifier?
- **attribution**: is every source cited, and are any quotes properly attributed?

Emit a `CONTENT_RISK:` block in the form:

```
CONTENT_RISK: factual=low reputational=low claims=low attribution=low
Notes:
- <flagged passage 1, or "no flags" if clean>
- <flagged passage 2>
```

Medium or high scores require explicit mention in the Tom-summary step so he knows to look.

### 8. Save the draft

Compute today's date in ISO format (`YYYY-MM-DD`). Write `src/newsletters/drafts/YYYY-MM-DD.md` with this exact structure:

```
<draft body from step 5>

---

## Voice Review

<voice review block from step 6>

## Content Risk Review

<content-risk block from step 7>
```

Use the `Write` tool. If a file for today's date already exists, ask Tom whether to overwrite or append a suffix like `-2` to the filename.

### 9. Summarise for Tom

Report back in chat:

- Candidate count before filter (inbox + Anthropic + HN).
- Filtered count that cleared the three-lens bar.
- Final item count (3, or fewer if the shortfall case applied).
- Voice review verdict (PASS or FAIL with short note).
- Content-risk block (mention anything medium or high).
- File path to the draft.
- Reminder: "When you have published to LinkedIn, move the file to `src/newsletters/published/` and run `/wr-retrospective:run-retro` to capture learnings for next week."

## Failure modes

- **Source fetch fails**: continue with available sources. Note failures in the summary. Do not retry more than once per source.
- **Fewer than three candidates clear the filter**: produce a two-item brief (or one-item if only one clears) rather than padding. Note the shortfall in the summary.
- **Voice review returns FAIL**: still save the draft. Tom decides whether to override or redraft. Do not attempt to auto-fix voice failures in this walking skeleton.
- **Content-risk review returns medium or high on any axis**: still save the draft. Tom decides.

## Out of scope for this skeleton

- Reddit, Twitter, Google DeepMind, GitHub blog, HBR, ArXiv, NIST CVE (layer 2 onwards in `docs/ai-engineering-brief/PLAN.md`).
- A purpose-built `wr-content-risk-scorer` skill (follow-up).
- Scheduling, cron, GitHub Actions automation (layer 6).
- An archive page on windyroad.com.au (layer 7).

$ARGUMENTS
