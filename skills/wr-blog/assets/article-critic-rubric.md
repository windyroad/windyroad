# Blog article critic rubric

Brief editorial prompt for `wr-blog-article-critic`. Applies to a draft article at `src/articles/<slug>/index.md`. Per ADR 035 this is an editorial prompt naming the analytical-quality axes, NOT a numbered-check scoring table. The critic runs *after* the voice gate (`wr-voice-tone:agent`) and the content-risk gate (`wr-content-risk-scorer:agent`); it covers analytical quality and structural fit only, not voice, reputational risk, or cognitive accessibility (those are sibling gates).

## Genre

Default genre: root-cause / prevention guide. Uses a public incident as the entry point, then teaches the structural lesson and shows a replicable mechanism. Exemplars: Patrick McKenzie "the actual lesson here is..." pieces, Bryan Cantrill on anti-patterns, Charity Majors on observability-vs-monitoring. If the article names another genre, read `assets/genres/<genre>.md` for its structural shape; it supersedes the root-cause-guide-specific notes below where it applies.

## Audience

Engineering leaders (CTOs, Heads of Engineering, VPs), software developers, and technical founders. Sophisticated technical readers who want to learn something concrete.

## What to read for

Read the draft and return STRENGTHS, WEAKNESSES, and optional RELEVANT CONTEXT, each with specific passage citations. Weigh the article against these analytical-quality axes:

- **Diagnosis is a causal chain, not a checklist.** The article walks a chain that makes the failure feel inevitable, and the named principle travels beyond the specific incident. Weak when the diagnosis reads as parallel independent failures, or the principle does not generalise.
- **Easy answers are pre-empted.** A "What won't fix this" (or equivalent) section walks the obvious wrong fixes a sceptical reader reaches for and names the structural reason each fails, rather than flatly dismissing them. Weak when an obvious wrong answer is missing or a rejection is a bare dismissal.
- **Mechanism is credible and honestly scoped.** Code samples are real or accurately paraphrased from the on-disk implementation. The article is honest about what is shipped versus claimed and flags hand-waves over structural extensions. Weak when it describes an unbuilt mechanism without naming the gap, or a sample drifts from the implementation in a misleading way.
- **Take-home a reader can run today.** A "test you can run today" (or equivalent) gives the reader a concrete action that does not require adopting the article's recommended product, and that surfaces the gap in their own systems. Weak when the take-home is conditional on installing a plugin, or is generic ("audit your access controls") rather than concrete.
- **Structure matches project convention.** Concrete opener (no "in this post I will" framing), early pull quote via `<span data-pull>`, noun/action section titles (not theses), an adoption-style close with named gaps and a forward pointer, visible rough edges and tradeoffs, at most one contextual inline CTA. Compare with existing articles in `src/articles/`. Weak when a structural element is skipped or deviated from without a named reason, or the CTA wobbles, repeats, or escalates fear.
- **Insight density.** Every paragraph sharpens the diagnosis, eliminates a wrong answer, names a recognised pattern, or hands the reader a tool. Weak when a paragraph could be removed without loss, or restates earlier content.
- **Sweeping claims are evidenced.** Any unanchored quantification, industry-wide generalisation, or "every team is doing X" claim either cites a source or carries a tightening qualifier. Weak when such a claim stands unsupported.
- **Strong source material is used where it lands hardest.** A named confession, vendor statement, research finding, or specific datum is quoted or cited at the point where it carries the most weight. Weak when a strong source is referenced but not used at its strongest moment.

Voice, em-dash, avoided-word, ambiguous-link, reading-level, and reputational-risk checks are NOT in this rubric: the voice gate, content-risk gate, and cognitive-accessibility gate own those. Do not duplicate them.

## Output

The critic returns the standard STRENGTHS + WEAKNESSES (+ optional RELEVANT CONTEXT) block defined by `.claude/agents/wr-blog-article-critic.md`, with a computed VERDICT (PASS / WEAKNESSES_FOUND / PASS_WITH_AUTHOR_OVERRIDES / REJECTED per ADR 025). Each weakness quotes a passage and gives a concrete fix direction. Up to 3 rounds (ADR 033 / ADR 035); round 3 emits REJECTED on any remaining non-override weakness.
