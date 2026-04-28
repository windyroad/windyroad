# Blog article critic rubric

Applies to a draft article at `src/articles/<slug>/index.md`. The critic scores the draft against these checks and returns the structured block defined by `.claude/agents/wr-sw-critic.md`. The critic runs *after* the voice gate (`wr-voice-tone:agent`) and the content-risk gate (`wr-content-risk-scorer:agent`); this rubric covers analytical quality and structural fit, not voice or reputational risk.

## Genre

Default genre: root-cause / prevention guide. Uses a public incident as the entry point, then teaches the structural lesson and shows a replicable mechanism. Exemplars: Patrick McKenzie "the actual lesson here is..." pieces, Bryan Cantrill on anti-patterns, Charity Majors on observability-vs-monitoring. Other genres are loaded from `assets/genres/<genre>.md` and supersede the root-cause-guide-specific clauses below where they apply.

## Audience

Engineering leaders (CTOs, Heads of Engineering, VPs), software developers, and technical founders. Sophisticated technical readers who want to learn something concrete.

## Voice and tone reference

`docs/VOICE-AND-TONE.md`. The critic does not score voice and tone (the voice gate covered that); but if a banned pattern, em-dash, or avoided word slipped through, the critic flags it under check_5.

## Checks

### check_1: Diagnosis is a causal chain, not a checklist

The article walks a causal chain that makes the failure feel inevitable, rather than listing failures. The reader, by the time the principle is named, already feels the structural force. UNMET if the diagnosis section reads as a parallel-bullet list of independent failures with no chain. UNMET if the named principle does not travel beyond the specific incident (a portable principle is the test).

### check_2: Pre-emption of easy answers

A "What won't fix this" or equivalent section walks the obvious wrong fixes a sceptical reader will reach for, and explains why each fails. Each rejection teaches the shape of the problem rather than just dismissing the answer. UNMET if any obvious wrong answer is missing (better model, better system prompt, scoped tokens, denylist, gate on every destructive API, human in the loop, monitoring; for non-AI articles substitute the equivalent rejected primitives). UNMET if any rejection reads as flat dismissal without naming the structural reason.

### check_3: Mechanism credibility

The article is honest about what is shipped vs what is claimed. Code samples are real or accurately paraphrased from real code. Hand-waves over structural extensions are flagged. UNMET if the article describes a mechanism the project has not built, without naming the gap. UNMET if a code sample drifts from the on-disk implementation in a way that misleads the reader about what the gate actually does.

### check_4: Take-home a reader can run today

A "test you can run today" or equivalent section gives the reader an action that does not require adopting the article's recommended product. The action surfaces the gap in the reader's own systems. UNMET if the take-home is conditional on installing a plugin or signing up for a service. UNMET if the take-home is generic ("audit your access controls") rather than concrete ("for each credential, answer two questions").

### check_5: Voice and tone hygiene

No em-dashes (the project pre-commit hook blocks them). No avoided words from the voice guide list (actually, passionate, leverage, solution(s), best-in-class, cutting-edge, game-changer, synergy, deep dive, reach out). No banned patterns ("actually" as emphasis, self-positioning "I'm X not Y", competitor bashing, dismissing the reader's tools, disparaging the reader's team, feature claims in fit checks, ambiguous link text "here"/"click here"/"read more"). UNMET if any of the above slipped through the upstream voice gate.

### check_6: Structure matches project convention

Concrete opener (no "in this post I will" framing). Pull quote near the top via `<span data-pull>`. Noun/action section titles ("The hook", "The gate", "The score", not theses like "Risk culture is what sits between intent and action"). Ends on adoption-style content with named gaps and a forward pointer. Shows rough edges and tradeoffs (does not present the system as polished). At most one inline CTA, contextual rather than bolted on. Compare with the existing articles in `src/articles/` for the convention. UNMET if the article skips a structural element or deviates without a named reason.

### check_7: Insight density per paragraph

Every paragraph either sharpens the diagnosis, eliminates a wrong answer, names a recognised pattern, or hands the reader a tool. UNMET if any paragraph could be removed without weakening the argument. UNMET if a paragraph restates content that earlier paragraphs already established.

### check_8: Inline CTA placement

The voice guide allows one contextual sentence about consulting. It should land cleanly without wobble (no "but you can also DIY this in a few hundred lines of shell" hedging that undercuts itself). It should sit where the reader is most likely to be thinking "could I have someone help me with this", not bolted onto the end. UNMET if the CTA repeats, hedges, or escalates fear.

### check_9: Sweeping claims under-evidenced

Any unanchored quantification ("the industry has spent thirty years"), industry-wide claim ("every team is migrating toward X"), or generalisation that does not cite a source or qualify itself. UNMET if such a claim appears without either a citation or a tightening qualifier.

### check_10: Unused source material

The article references a strong source (a quote, a specific fact, a research paper) but does not use it where it would land hardest. UNMET if a confession, a vendor statement, a research finding, or a specific datum is named but not quoted or cited at the point where it would carry weight.

## Output

Standard `STRENGTHS + WEAKNESSES + VERDICT` block per `.claude/agents/wr-sw-critic.md`. For each check, mark `MET`, `PARTIAL`, or `UNMET` with passage references and suggested fixes. Verdict is `PASS` when all checks are MET, `WEAKNESSES_FOUND` otherwise, `REJECTED` when round 3 still has UNMET checks (per ADR 016 cap).
