# Wardley artifact critic rubric

Applies to updates of `docs/ai-engineering-brief/ai-landscape.owm` and `docs/ai-engineering-brief/ai-landscape.md`. The critic is an editorial reader. It reads both files together and returns the structured block defined by `.claude/agents/wr-sw-critic.md`. The `.owm` source and the `.md` analysis must remain consistent with each other.

## Scope

The critic reviews both files together: the `.owm` source and the `.md` analysis. References from the analysis to positions in the map must be consistent with the map. References from the map to components in the analysis must be consistent with the analysis. Per ADR 014, the Wardley map is internal substrate for the brief, not a reader-facing artifact, but the analysis is the input that drives drafter framing for the week.

## Coverage partitioning

These axes are owned by sibling gates, NOT by the critic:

- Voice and tone (Wardley analysis prose), owned by `wr-voice-tone:agent` if invoked against the analysis.
- Cognitive accessibility of the analysis prose, owned by the cognitive-accessibility subagent.

The critic owns analytical quality for the Wardley artifact: are positions defensible; does the analysis state what positions *mean* for investment, risk, or action (rather than inventorying components); are risks named with observable triggers; are decisions stated as trade-offs; are evolution arrows justified in prose; does the week-on-week delta come through; is the analysis usable as context for drafting the weekly brief.

## What to return

Read both files. Return:

- **STRENGTHS**: what the analysis does well, with specific citations (exact section, paragraph, component, or arrow named).
- **WEAKNESSES**: what the analysis does not do well, with specific citations and concrete actionable fixes (e.g. "Differentiation section omits the Engineering Team Capability component despite its Custom-Built position on the map; either remove it from the map or discuss it in Differentiation").
- **RELEVANT CONTEXT** (optional): structural notes, recurring patterns observed across map updates, considerations the drafter should weigh for future work.

Nothing else. No numbered checks, no scoring rubric, no MET / UNMET / PARTIAL tables. The critic is an editorial reader who delivers judgement and citations, not a quality-checklist auditor.

## Verdict

Per ADR 016 and ADR 035 the verdict surface is:

- `PASS`: no weaknesses surfaced this round.
- `WEAKNESSES_FOUND`: one or more weaknesses returned; drafter responds in next round.
- `PASS_WITH_AUTHOR_OVERRIDES`: editorial-judgement override; reserved for cases where the critic's call is reasonable but the drafter has a defensible editorial reason to keep the artifact as-is. In practice the Wardley critic rarely needs this verdict because the analysis-vs-map consistency calls are factual, not editorial.
- `REJECTED` with `REJECTED_REASON: critic-loop-exhausted`: after round 3, weaknesses remain unresolved AND are not editorial-judgement overrides. Save the block; proceed to the next pipeline step with a weak-map note in the summary (the map is the best we have this week; a weak map still beats no map).

## Round-specific exit criteria

- **Round 1:** read the artifact, return STRENGTHS / WEAKNESSES / optional RELEVANT CONTEXT with verdict.
- **Round 2:** read the revised artifact, confirm each round-1 weakness is addressed, surface any new weaknesses introduced by the rewrite.
- **Round 3:** as round 2. Any remaining weakness that is not an editorial-judgement override triggers `VERDICT: REJECTED` with `REJECTED_REASON: critic-loop-exhausted`.
