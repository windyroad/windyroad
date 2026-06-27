# Drafts

AI-generated newsletter drafts produced by the `/wr-newsletter:generate` skill (see `.claude/skills/wr-newsletter/SKILL.md`) and awaiting Tom's editorial review.

## Per-persona structure

Drafts are split by persona since Stage 3 of the LSM plan (April 2026):

- `leader/`: The Shift, targeting Engineering Leaders (J1-J4).
- `developer/`: Tokens Spent, targeting Developers (J6-J11).

The flat `2026-04-17.md` at the root of this folder is The Shift edition 1, predating the per-persona split. A one-time migration into `leader/` is a follow-up.

## Format

Filename: `<persona>/YYYY-MM-DD/YYYY-MM-DD.md` (ISO date the skill ran). Per ADR-040, each edition lives in a per-date sub-directory holding the brief plus its companion siblings, mirroring the ADR-039 published-side layout.

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

1. Skill produces a draft under `src/newsletters/drafts/<persona>/YYYY-MM-DD/YYYY-MM-DD.md`.
2. Tom reads, edits, publishes to LinkedIn (the persona's dedicated newsletter).
3. Tom moves the edition's whole per-date sub-directory to `src/newsletters/published/<persona>/YYYY-MM-DD/` (per ADR-040, a single whole-directory move).
4. Tom runs `/wr-retrospective:run-retro` to capture learnings.
