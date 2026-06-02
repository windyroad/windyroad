# Newsletter draft critic rubric

Applies to the weekly AI Engineering Brief draft at `src/newsletters/drafts/<persona>/YYYY-MM-DD.md`. The critic is an editorial reader. It reads the artifact and returns the structured block defined by `.claude/agents/wr-sw-critic.md`. This rubric covers analytical quality only; voice, cognitive accessibility, content risk, and reader-respect are sibling gates and the critic must not duplicate their coverage.

## Scope

The critic reviews one draft file. It may cross-reference `docs/ai-engineering-brief/ai-landscape.owm` and `docs/ai-engineering-brief/ai-landscape.md` because every brief item is required to point back to a specific map movement (ADR 014). The Wardley map is internal substrate per ADR 014 and must NOT be named in the copy: if reader-facing prose includes "map", "Wardley", "landscape", "position", "evolution axis", "commodity", or "genesis", flag it as a weakness.

## Coverage partitioning

These axes are owned by sibling gates, NOT by the critic:

- Voice and tone, em-dash use, hype words, word-list compliance, owned by `wr-voice-tone:agent`.
- Cognitive accessibility, plain-language readability, reading-level, owned by the cognitive-accessibility subagent (SKILL.md step 15.4).
- Content risk: factual, reputational, claims, attribution, reader-respect, owned by `wr-risk-scorer:external-comms` (ADR 012, ADR 015, ADR 018).
- LinkedIn rendering, sentence length, structural mechanics, owned by `wr-newsletter-editor` (ADR 020).

The critic owns analytical quality: does the argument hold; is specificity preserved; is the "so what?" answered; is the piece pablum dressed in correct voice; do items reflect genuine industry shifts with concrete evidence; does the brief carry a thesis the items support.

## What to return

Read the artifact. Return:

- **STRENGTHS**: what the piece does well, with specific citations (exact line, paragraph, or item quoted). Editorial signal for retro; the drafter does not act on this directly.
- **WEAKNESSES**: what the piece does not do well, with specific citations and concrete actionable fixes. The drafter responds in the next round.
- **RELEVANT CONTEXT** (optional): structural notes, recurring patterns observed across editions, considerations the drafter should weigh for future work.

Nothing else. No numbered checks, no scoring rubric, no MET / UNMET / PARTIAL tables, no accepted-override lists. The critic is an editorial reader who delivers judgement and citations, not a quality-checklist auditor.

## Verdict

Per ADR 016 and ADR 035 the verdict surface is:

- `PASS`: no weaknesses surfaced this round.
- `WEAKNESSES_FOUND`: one or more weaknesses returned; drafter responds in next round.
- `PASS_WITH_AUTHOR_OVERRIDES`: editorial-judgement override; the drafter accepts a critic-flagged weakness as an intentional editorial choice. Reserved for cases where the critic's call is reasonable but the drafter has a defensible editorial reason to keep the artifact as-is. The override is named verbatim in the saved review block.
- `REJECTED` with `REJECTED_REASON: critic-loop-exhausted`: after round 3, weaknesses remain unresolved AND are not editorial-judgement overrides. Save the block; do not publish without rework.

## Round-specific exit criteria

- **Round 1:** read the artifact, return STRENGTHS / WEAKNESSES / optional RELEVANT CONTEXT with verdict.
- **Round 2:** read the revised artifact, confirm each round-1 weakness is addressed, surface any new weaknesses introduced by the rewrite.
- **Round 3:** as round 2. Any remaining weakness that is not an editorial-judgement override triggers `VERDICT: REJECTED` with `REJECTED_REASON: critic-loop-exhausted`.
