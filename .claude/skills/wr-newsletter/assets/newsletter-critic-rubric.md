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

The critic owns analytical quality: does the argument hold; is specificity preserved; is the "so what?" answered; is the piece pablum dressed in correct voice; do items reflect genuine industry shifts with concrete evidence; does the brief carry a thesis the items support. The critic also owns heading craft (see "Headline craft" below): the sibling voice and cognitive-accessibility gates audit body copy, not headings, so heading-level clarity and jargon density are deliberately the critic's to flag (P075).

## Headline craft

Headlines (the H1 and every `### Item N:` heading) are the most load-bearing editorial surface and the place Issue 07 failed (P075). The sibling voice and cognitive-accessibility gates operate at body-copy granularity and structurally do not audit headings, so heading craft is the critic's to own as editorial quality. Read every heading separately and surface a weakness when any of these hold:

- **Headline clarity.** Run the `docs/VOICE-AND-TONE.md` "competent CTO from a non-AI-native company" standalone-readability test on the H1 and on each Item heading separately. Flag any heading the test reader cannot parse without first reading the body. (Issue 07: the H1 leaned on "substrate provider" with no gloss.)
- **Headline jargon density.** Flag any single heading whose specialist-noun density defeats the standalone-readability test: two or more in-group specialist terms carried without a gloss. (Issue 07 headings: bare "Starlette" with no category gloss, "services-arm", a stacked "tier-1" plus "eval-governance" plus "eval harness", "sandboxing patterns".)
- **Sameness across headings.** Flag an editorial-framing pattern repeated on more than half the items in one edition, for example the colon-flourish "X: Y" shape. (Issue 07 ran the colon-flourish on 5 of 7 items.)

These are editorial-craft judgements, not a port of the voice agent's word-list mechanics. Return them as weaknesses with the offending heading quoted, the same as any other weakness; do not introduce numbered checks or a scoring table (ADR 035).

## Operational actionability of the so-what

The "so what?" axis is not satisfied by an abstract implication. For a leader reader the so-what must resolve to something the reader can DO or DECIDE this quarter: a concrete action, a decision to make, a thing to check, watch, pilot, or prioritise. An item whose "why it matters" restates the news in consequence-shaped words ("this raises the stakes", "teams will need to adapt", "the landscape is shifting") without giving the reader an operational move is a weakness on this axis. External review has repeatedly added the missing operational move after the internal gates passed (2026-05-15: an operational measured-read sentence added to Item 3; 2026-06-29: an unauditable provenance action replaced with an operationalisable contractual ask, plus a checklist-prioritisation line naming the one to do this quarter).

Flag as a weakness when: an item's so-what / why-it-matters is abstract with no operational move; OR the item names an action the reader cannot actually take or audit (an aspiration, not a step). The fix direction is to name the concrete move (the contractual clause to add, the metric to watch, the pilot to run, the one thing to do this quarter), not to add more consequence-framing. This is analytical quality, not reader-experience mechanics: the editor gate asks whether the reader would forward the item; this axis asks whether the item gives the reader something real to act on.

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
