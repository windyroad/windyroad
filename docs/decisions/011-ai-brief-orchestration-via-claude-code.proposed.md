---
status: "proposed"
date: 2026-04-17
decision-makers: [Tom Howard, Claude]
consulted: []
informed: []
reassessment-date: 2026-07-17
---

# Orchestrate the AI Engineering Brief as a Claude Code interactive command

## Context and Problem Statement

We need an automation architecture for a weekly AI Engineering Brief newsletter. The pipeline fetches AI news from RSS, Reddit, and Twitter (via Nitter), filters for engineering-leader relevance, drafts a brief, runs voice and risk reviews, and produces a markdown draft for human publishing. The architecture must stay cheap (zero billable spend at the margin), reuse our existing review specialists (wr-voice-tone, wr-risk-scorer), and be portable enough to extract later if we move to fully unattended operation.

## Decision Drivers

- **Cost: must be $0 at the margin.** Cannot introduce a new recurring billable spend. Must run on existing Claude Code quota.
- **Reuse existing review specialists** rather than reimplementing voice and risk review logic.
- **Linear pipeline** (fetch, filter, draft, review, save). No branching or long-running tool loops that would benefit from agent-native orchestration.
- **Portability**: if we later want fully unattended operation, the code should extract into a standalone script without a rewrite.
- **Debugability**: Tom needs to see each step's output and iterate on the prompt without running an end-to-end agent loop for every change.

## Considered Options

1. **Claude Code interactive slash command** (chosen). A `/wr-newsletter:generate` command that Tom invokes weekly during a regular Claude Code session. Uses the same interactive quota he already has.
2. **Standalone Node script plus direct Anthropic SDK**. A `scripts/generate-ai-brief.mjs` that imports `@anthropic-ai/sdk`, orchestrates the pipeline, saves a markdown draft. Portable, cheap per token, but introduces new billable spend per run and reimplements voice and risk review.
3. **Anthropic Agent SDK**. Define a newsletter-generating agent with tools for each step; the agent decides the path. Good for complex multi-turn problems with judgement calls. Overkill for a linear weekly pipeline and most expensive of the three per run.
4. **Claude Code scheduled agent (cron)**. A `/schedule`'d agent that runs weekly without user intervention. Depends on how scheduled agents bill against the Claude Code plan; may or may not be $0 at the margin.

## Decision Outcome

Chosen option: **"Claude Code interactive slash command"**, because it is the only option that satisfies the $0-at-the-margin cost constraint today, reuses the existing `wr-voice-tone:agent` and `wr-risk-scorer:pipeline` specialists natively, and keeps the pipeline debuggable while Tom is still tuning the filter prompts and editorial judgement. Option 2 (standalone script) is the natural extraction target once the approach is validated and we decide to move to unattended operation.

### Constraints this decision must satisfy

- Voice and risk reviews run via `wr-voice-tone:agent` and `wr-risk-scorer:pipeline` specialists (see ADR 012).
- LinkedIn content is never scraped automatically (see ADR 013). Tom may manually drop LinkedIn links into `src/newsletters/inbox/`.
- The slash command is packaged as a Claude Code skill following Anthropic's skill-creator standard: https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md.
- The skill is **project-local only** and lives in `.claude/skills/` within this repository. It is not published to the windyroad-claude-plugin marketplace (ADR 009) and is not distributed. This scope keeps editorial judgement about Tom's voice and business tightly coupled to this project.

## Consequences

### Good

- Zero billable spend delta. Runs on Tom's existing Claude Code quota.
- Reuses trusted review specialists (wr-voice-tone, wr-risk-scorer) instead of reimplementing them.
- Tom can iterate on prompts, sources, and filter logic each week during the interactive run.
- Interactive session produces a transcript and reasoning that informs the retrospective step.

### Neutral

- Requires Tom to initiate a Claude Code session weekly. If Tom misses a week, the brief slips. This is a feature (editorial judgement) rather than a bug for the walking skeleton. If it becomes friction, Option 2 is the extraction target.

### Bad

- Not fully unattended. Cannot run while Tom is on holiday without a preplanned batch.
- Tied to the Claude Code runtime. If Tom wants to move orchestration to GitHub Actions or another CI runner, he will need to extract to Option 2.
- Cost ceiling shifts if Anthropic changes how interactive Claude Code sessions count against quota.

## Confirmation

- A `/wr-newsletter:generate` slash command exists and runs end to end: fetch, filter, draft, review, save to `src/newsletters/drafts/YYYY-MM-DD.md`.
- Fetching, filtering, and drafting happen inside the Claude Code session without invoking external paid APIs beyond what existing Claude Code features already use.
- Voice review invokes `wr-voice-tone:agent`; risk review invokes `wr-risk-scorer:pipeline` (or equivalent content-risk scorer when built).
- Script modules are structured so extraction to a standalone Node script (Option 2) requires moving files rather than rewriting logic.

## Pros and Cons of the Options

### Claude Code interactive slash command (chosen)

- Good: $0 at the margin today
- Good: reuses wr-voice-tone and wr-risk-scorer specialists natively
- Good: debuggable and iterable week by week
- Bad: not unattended; depends on Tom initiating the session

### Standalone Node script plus direct Anthropic SDK

- Good: fully portable, can run in GitHub Actions
- Good: predictable token cost per run
- Bad: introduces new billable spend (violates the $0-at-margin constraint today)
- Bad: reimplementing voice and risk review from scratch, or calling out to Claude Code agents from Node, which is an additional integration

### Anthropic Agent SDK

- Good: native tool-use loops and error recovery
- Good: built-in prompt caching
- Bad: most expensive per run due to tool-use token overhead
- Bad: overkill for a linear pipeline. Debugability suffers when the agent decides the path.

### Claude Code scheduled agent (cron)

- Good: fully unattended operation
- Bad: billing model for scheduled agents is not $0 at the margin (unverified, but likely separate from interactive quota)
- Bad: still subject to the $0-at-margin constraint until verified

## Reassessment Criteria

- After 4 weekly issues, if the interactive cadence is sustainable and signal-to-noise is good, reassess whether to extract to Option 2 (standalone script) for unattended operation.
- If Anthropic's quota model for Claude Code changes materially.
- If the pipeline grows to include branching logic or retry loops that would benefit from Agent SDK.
- If a scheduled-agent billing model becomes favourable.
