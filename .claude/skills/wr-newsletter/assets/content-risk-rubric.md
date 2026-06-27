# Content-risk rubric

The five-axis rubric for scoring AI-generated newsletter drafts under the content-risk gate (ADR 012 + ADR 015). Used by `wr-content-risk-scorer:agent` (ADR 018) to evaluate drafts in fresh context.

Each axis scores `low`, `medium`, or `high`. Verdict is mechanical: any axis scored `high` yields `VERDICT: REJECTED`. All axes `low` or `medium` yields `VERDICT: PASS`.

The output block format is fixed by ADR 015 confirmation criterion 3 and must not change without superseding ADR 015. The agent emits exactly:

```
CONTENT_RISK: factual=<low|medium|high> reputational=<low|medium|high> claims=<low|medium|high> attribution=<low|medium|high> reader-respect=<low|medium|high>
VERDICT: <PASS|REJECTED>
Notes:
- <flagged passage 1, or "no flags">
```

## Axes

### check_1: factual

How likely is any stated fact to be wrong? Named models, dates, capabilities, company actions, numbers, version strings, benchmark results, plus historical anecdotes, "X once happened" claims, and load-bearing analogies stated as established fact.

- **low**: every named fact is verifiable against a tier-1 primary source cited in the draft (Anthropic, OpenAI, DeepMind direct announcements; primary outlets per `three-lens-filter.md`). Specific dates, model names, version numbers, benchmark figures all match the cited source. Any historical anecdote or analogy is either sourced or explicitly framed as illustrative ("a story, probably made up", "likely apocryphal").
- **medium**: most facts are sourced; one or two unsourced background claims that are plausibly correct but not verified in this draft. Fact appears in a tier-2 or tier-3 source rather than tier-1 primary.
- **high**: a stated fact is contradicted by the cited source, or a specific claim (model name, date, number) appears with no source at all. Naming a benchmark result without citing the benchmark. A historical anecdote or load-bearing analogy stated as fact ("a school once worried paper would erode handwriting") with no primary source and no illustrative framing scores high. Source it or flag it as illustrative.

This axis is the gate that catches no-URL claims. The URL-verification gate (ADR-024) only checks claims that carry a link; a rhetorical "X once happened" or a vivid analogy stated as fact carries no URL, so it is invisible to URL-verify and must be caught here (P102).

Persona constraint: developer persona (Tokens Spent) is allergic to demo-vs-shipped conflation per JTBD-205. Calling something "shipped" when only a demo or benchmark exists is a `high` factual flag, not just a `medium`. The evidence label (shipped / benchmarked / demo / not yet) must match the underlying source's evidence stance.

### check_2: reputational

Could this passage embarrass Tom or Windy Road? Dismissive tone toward a company, unfalsifiable predictions framed as fact, punching down, false certainty on contested claims.

- **low**: every characterisation of a company, product, or industry trend is calibrated and traceable. Predictions are framed as predictions ("we expect", "this points to"), not as established fact. Honest "not yet" calls present where the evidence is thin.
- **medium**: a passage uses a slight rhetorical lean that a partisan reader might object to but a neutral reader would accept. One unhedged future-tense claim that should be hedged.
- **high**: dismissive tone toward a named company or named individual; unfalsifiable prediction stated as fact; false certainty on a contested industry direction; passage that would damage credibility with either an Engineering Leader or a working Developer if read by a peer.

Persona constraint: both personas judge credibility on calibrated skepticism. The rubric rewards honest "not yet" calls (per JTBD-205) and penalises false certainty more than visible uncertainty. Posturing scores `high`; visible doubt scores `low`.

### check_3: claims

Are there predictions, assertions, or "this means X" statements that need a source or qualifier?

- **low**: every assertion either cites a source, names an observable signal a reader can verify, or is explicitly framed as inference ("we read this as", "the implication for your team is"). No bare "teams are migrating" or "everyone is doing X" without a named example.
- **medium**: one or two claims would benefit from a source but are defensible as informed analysis. Inference-framing implied by surrounding context but not made explicit.
- **high**: assertion-as-fact with no source and no observable signal ("teams are abandoning X for Y" with no example). Generalisation about industry behaviour without a named instance. Pattern claim ("everyone is", "no one is", "all the major labs") with no enumeration.

Persona constraint: developer persona (JTBD-205) defaults to skeptical stance; the claims axis operationalises that skepticism. Bare assertions land hard with this audience.

### check_4: attribution

Is every source cited? Are quoted passages properly attributed? Do paraphrased claims point at the underlying outlet?

- **low**: every Item block has a Source line. Every quoted passage names the speaker and the publication. Every paraphrase of a specific claim points at the URL where the original claim lives. Aggregator citations name both the aggregator AND any primary outlets the corroboration query found (per SKILL.md step 4b corroboration outcomes).
- **medium**: Source line present but cites an aggregator-only URL where the corroboration query found primary outlets that should also be named. Paraphrase that close to the original is missing a quote-mark + attribution.
- **high**: an Item block is missing its Source line entirely. A quoted passage is not attributed. A specific factual claim is paraphrased without any URL. A passage repeats wording from a source without acknowledging the source.

Persona constraint: developer persona (JTBD-203 peer validation) requires "reference to concrete experiences from working engineers, not vendor case studies." Attribution to a vendor source for a vendor claim is acceptable; attribution to a vendor source for a peer-experience claim is `high` because it misrepresents the evidence base.

### check_5: reader-respect

Does the draft frame the reader's team as behind, slow, negligent, or inadequate? (ADR 015 fifth axis.)

- **low**: the draft describes industry baselines, external threats, and the broader landscape without attributing fault to the reader's team. Where teams or stacks are characterised, characterisations are based on observable evidence (named outcomes, public adoption signals), not on judgement. The reader is treated as a peer making hard tradeoffs.
- **medium**: a single passage uses framing that could read as "your team should already be doing this." Surrounding context softens it but the passage itself would benefit from rephrasing.
- **high**: any passage passes judgement on the reader's team's competence, frames the reader as behind, lectures about what they should already know, or implies their stack is inferior. ADR 015's binding axis: a single `high` reader-respect score yields REJECTED regardless of other axes.

Persona constraint: both Engineering Leaders and Developers are senior practitioners. Reader-respect means treating the reader as a peer making hard tradeoffs, not as someone needing education or shaming. Posturing or lecturing scores `high`. The memory note `feedback_reader_respect.md` records this as a hard constraint from Tom: "outbound copy must not frame reader's team as behind; voice+risk gates must reject, not just flag."

## Verdict computation

```
if any axis is "high":
    VERDICT: REJECTED
else:
    VERDICT: PASS
```

The verdict is mechanical. The agent does not weight axes, does not consider draft quality holistically, does not grant exceptions. Tom decides whether to override a REJECTED verdict on inspection.

## Notes section

Under `Notes:`, the agent lists each axis that scored `medium` or `high` with one line per flagged passage. Format:

```
Notes:
- <axis>=<medium|high>: <one-line description of the issue>. Passage: "<quoted passage from the draft>"
- <axis>=<medium|high>: ...
```

If every axis scored `low`, emit:

```
Notes:
- no flags
```

The Notes section is the actionable output. Tom (or a downstream remediation step) uses it to identify what to fix on a REJECTED verdict, or to decide whether `medium` flags are worth a touch-up before publish on a PASS verdict.
