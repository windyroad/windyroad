# Drafts

AI-generated newsletter drafts produced by the `/wr-newsletter:generate` skill (see `.claude/skills/wr-newsletter/SKILL.md`) and awaiting Tom's editorial review.

## Format

Filename: `YYYY-MM-DD.md` (ISO date the skill ran).

File structure:

```markdown
# The AI Engineering Brief: <date>

<intro line>

### Item 1: ...
- What happened: ...
- Why it matters to your team: ...
- The human angle: ...

### Item 2: ...
### Item 3: ...

<soft CTA>

---

## Voice Review

<output from wr-voice-tone:agent>

## Content Risk Review

CONTENT_RISK: factual=low|medium|high reputational=... claims=... attribution=...

<any flagged passages>
```

## Workflow

1. Skill produces a draft here.
2. Tom reads, edits, publishes to LinkedIn.
3. Tom moves the file to `src/newsletters/published/`.
4. Tom runs `/wr-retrospective:run-retro` to capture learnings.
