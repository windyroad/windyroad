# Newsletter draft critic rubric

Applies to the weekly AI Engineering Brief draft at `src/newsletters/drafts/YYYY-MM-DD.md`. The critic scores the draft against these checks and returns the structured block defined by `.claude/agents/wr-sw-critic.md`. The critic runs *after* the voice gate (wr-voice-tone:agent) and the inline content-risk gate (ADR 012 + ADR 015); this rubric covers analytical quality, not voice or reputational risk.

## Scope

The critic reviews one draft file. It may cross-reference `docs/ai-engineering-brief/ai-landscape.owm` and `docs/ai-engineering-brief/ai-landscape.md` because every brief item is required to point back to a specific map movement (ADR 014).

## Checks

### check_1: Minimum three items

The draft contains at least three items. There is no upper limit, but below three the brief is not shipping in the agreed format. UNMET if fewer than three items appear.

### check_2: Every item reflects a meaningful industry shift

Every item represents a real change in the AI engineering landscape that can be tied back to a specific cause (named vendor action, regulator ruling, benchmark release, incident, personnel move, legal ruling, organisational pattern, etc.). Map-anchored shifts are preferred (see three-lens-filter.md) but not required. The Wardley map is internal substrate per ADR 014 and must NOT be named in the copy: no "map", "Wardley", "landscape", "position", "evolution axis", "commodity", "genesis" in the reader-facing body. UNMET if an item either lacks a concrete shift or contains explicit map vocabulary in the body copy.

### check_3: Every item has a factual "what happened"

Every item states what happened in one sentence, with named org, named artifact, and date if relevant. No vague "the industry is shifting." UNMET if any item lacks a concrete event.

### check_4: Every item has an operational "why it matters to your team"

Every item names a concrete operational consequence for the reader's engineering practice. The sentence answers: if this is true, what does your team's build, deploy, test, or secure pipeline have to consider? Generic "teams need to stay agile" is UNMET. Specific "vendor evaluations that do not include a model-evaluation step now miss a class of failure" is MET. Per ADR 015 reader-respect, framings that judge the reader's team ("your team is probably behind") are voice violations and will have been caught upstream, but if one slipped through, flag it here.

### check_5: Every item has a human angle

Every item names a change-management, psychology, sociology, or organisational consequence. This is the non-negotiable differentiator of this brief. If the item reads as pure news plus operational take, UNMET. Describing a real shift in how teams relate to their tools, roles, or confidence counts; pablum about "culture matters" does not.

### check_6: Every item cites a source (inline-linked)

Every item includes a source URL, inline-linked on the primary claim text (LinkedIn format preference: inline `[Agents SDK v2](https://...)` beats a raw `Source:` block). Primary claims should point to primary sources, not aggregators. A separate `Source:` block is tolerated but not preferred. UNMET if any primary claim has no source linkage (neither inline nor in a source block), or if a quoted headline like a court case or essay has no link anchoring it.

### check_7: Quotes are attributed

Any direct quote in any item is attributed to a named person, org, or document. Paraphrases without quotation marks are fine without attribution when the source link is present. UNMET if a quoted phrase appears with no attribution.

### check_8: No link-dump

No item is structured as "here is a link, here is a headline, read it yourself." Each item has the what / map-movement / why / human-angle structure. The source URL is the anchor, not the content. UNMET if any item would work as a tweet with a URL preview.

### check_9: No padding

Every item represents a significant change for the Engineering Leader persona. If an item survives only to hit a count or to round out a theme, it should not be in the brief. UNMET if an item reads as filler.

### check_10: No unsourced pattern claims

Claims of the form "teams are migrating toward X", "everyone is doing Y", "most orgs are Z" require either a cited source (report, survey, vendor data) or an observable qualifier ("based on this week's open-weight-model announcements"). Unfalsifiable broad claims are UNMET.

### check_11: Intro names the theme

The brief opens with a one-sentence intro that names the theme of this week's items. The theme is specific enough that someone scanning the feed can decide whether to read on. "Three stories about AI" is UNMET. "Three stories about how the agent-runtime layer is fragmenting while coding assistants converge" is MET.

### check_12: CTA is not a pitch

The closing CTA is soft and matches the repertoire in `draft-template.md`. "We help engineering teams navigate this. windyroad.com.au" is MET. "Book your consultation now!" or "Don't let your team fall behind" is UNMET (and would also fail the voice gate and content-risk reader-respect axis).

### check_13: So-what test on every item

For every item, the reader should be able to answer "what decision could I make on Monday based on this?" The operational and human-angle lines together must surface a decision, a question to bring to a team meeting, or a pattern to watch. If the item is interesting but actionless, UNMET.

### check_14: Forwardability

The brief can be forwarded to the reader's VPE, board, or leadership without self-incrimination. No item implies "your team is behind" or "you should have seen this coming." This overlaps ADR 015 reader-respect and should already be caught upstream; the critic double-checks here because forwardability is specifically J3 (Evaluation, social dimension) and is the main amplification channel for top-of-funnel content.

### check_15: Map-diff is visible

The brief references what *changed* on the map this week, even if briefly. At minimum, the intro or a closing line names the delta ("This week's movement: agent-runtime standardisation accelerates, while model evaluation frameworks gain a second credible open-source option."). UNMET if a reader with no access to `ai-landscape.md` cannot tell what moved this week versus last week.

### check_20: Plain-English readability

Every sentence in the reader-facing body must be understandable in one pass by an engineering leader who does not share the AI-engineering subculture's shorthand. Stacked jargon (three or more subculture terms in a single sentence) is UNMET. Examples:

- UNMET: "Irreversible runtime picks compound every downstream dependency." (stacks "irreversible", "runtime picks", "compound", "downstream dependency" in one line)
- MET: "A runtime you can't easily change constrains every tool decision downstream."
- UNMET: "Vendor-specific integration surfaces that cannot survive a model swap are waste."
- MET: "If your integration is wired to a specific vendor's model, a model change forces a rewrite; that is waste you can design out."

Rule of thumb: one new concept per sentence, named concretely. Named technical terms with broad meaning (agent runtime, open-weight model, benchmark) are fine on first use; stacking them into noun clusters is the failure mode. When the critic flags a sentence, the usual fix is splitting into two sentences or replacing the noun cluster with a concrete image.

### check_17: Author voice opener present

The brief opens with a 2-3 sentence "From Tom" (or equivalent) voice opener that gives the reader a personal perspective before any news. The opener should be one of: an observation from a client engagement (anonymised), a prediction the author is willing to be wrong about, or a piece of conventional wisdom being pushed back on. UNMET if the brief opens with the theme/thesis alone; UNMET if the voice opener is pure news summary with no perspective; UNMET if absent. The drafter may mark the opener "[DRAFT VOICE: Tom to replace]" to signal it is a scaffold; the mark itself is MET for this check, because the structural slot exists. The publish gate (not the critic) enforces replacement.

### check_18: Claim matches evidence on every item

Every item's headline claim is supported by its bullets. If the headline says "parity crossed a visible line", every supporting event must be parity evidence (a legitimate capability-equivalence signal), not a frontier release or a single anecdote. If the headline says "enforcement in three jurisdictions", every supporting bullet must be binding enforcement, not a mix of enforcement, a single ruling, and guidance. UNMET if any supporting bullet contradicts or under-supports the headline's strongest claim; the drafter can either soften the headline to match the evidence or swap in stronger evidence.

### check_19: CTA has description and invitation

The closing CTA includes (a) a specific one-sentence description of what Windy Road does (naming the offer, not "we help engineering teams") and (b) an explicit invitation (reply with X, forward to Y, tell us about Z). UNMET if either is missing. UNMET if the description is generic ("we help engineering teams navigate this"); UNMET if the invitation is absent.

### check_16: LinkedIn readability

The brief reads cleanly in LinkedIn's narrow column. Specifically:
- Each sentence in `Map movement`, `Why it matters`, and `The human angle` is one sentence under roughly 25 words. A sentence that runs three clauses joined with "and ... and ..." is UNMET; split at the natural clause boundary.
- `What happened` with two or more distinct events uses sub-bullets (one event per line), not a comma-separated run-on sentence. UNMET if a multi-event "What happened" is a single long sentence.
- Source URLs are listed one per line, not comma-separated. UNMET if multiple URLs share a line.
- Section labels are bolded (`**What happened:**`, etc.) so the reader sees structure before detail. UNMET if the structural labels are plain text buried inside run-on bullets.
- Per-item overall length stays proportional: an item with 3 sub-bullet events plus a Map movement, Why-it-matters, Human-angle and 3 sources is acceptable (around 10 lines); an item running 15+ lines is UNMET even if every line is good, because it will not survive the platform.

### check_21: Preamble density

Count the paragraphs between the H1/subtitle and the first `### Item N` section, excluding the voice opener itself. If the brief has a voice opener AND a separate thesis paragraph AND a separate delta paragraph before Item 1, that is three preamble paragraphs and UNMET. Two preamble paragraphs (voice opener + one bridge) is MET. One preamble paragraph (voice opener alone) is MET. The LinkedIn reader scans for the first payoff; multiple preamble paragraphs accumulate distance between headline and payoff.

### check_22: Author-voice authenticity

Does the opener carry a specific perspective the reader can anchor to? MET examples:

- Anonymised client observation: "A CTO we spoke with this week is running three agent frameworks in parallel because none are stable enough to bet on".
- Verifiable prediction with a time horizon: "We think in five years we'll look back at the pay-per-token era as a weird interlude".
- Conventional wisdom being pushed back on: "Standards adoption sounds safe, but the innovation is still outside the standards".

UNMET examples:

- Generic enthusiasm: "There's a lot happening in AI this week".
- Aggregator framing: "Here are the top stories in AI engineering".
- Unanchored observation: "AI is changing fast".

Note: this check is about perspective presence, not voice adherence. Voice compliance (em-dashes, hype words, word list, reader-respect) is the `wr-voice-tone:agent`'s concern per ADR 015 and is scored separately. check_22 asks: would a reader know whose POV this is within the first three sentences?

### check_23: Item-count proportionality

Prefer 3-5 full items plus any number of "Also worth noting" notes. Six full items is PARTIAL unless the drafter has explicitly noted why six was necessary (e.g. "six landmark events shipped this week; compression would lose signal"). Seven or more full items is UNMET; the overflow should compress into notes. This check is a soft preference aligned with the memory `feedback_brief_item_count.md` rule "include every significant story, minimum three": the UNMET trigger at seven is not a ceiling on significance, it is a presentation discipline saying the reader can carry 3-5 full items and a handful of short notes in one sitting.

### check_24: Through-line

Does at least one of the opener's claims thread into two or more items' framing or phrasing? MET when the opener and at least two items reinforce each other (for example, opener names "the pay-per-token era as a weird interlude" and Items 2 and 4 both reference that framing). PARTIAL when the opener and items read disconnected without an honest acknowledgement of disconnection. The acceptable MET exception: if the opener explicitly frames the week as "three disconnected shifts" and the items match that framing, the through-line requirement is satisfied by the honest framing, not violated.

### check_25: Reader-orientation (first edition vs ongoing)

The draft frontmatter should include an `edition: N` field so the critic can reason about this check. For the first edition (N=1), a welcome line above the voice opener is required (example: "About The Shift: each issue covers what moved in AI engineering this week..."). UNMET for edition 1 if the welcome line is absent or if the voice opener leads with a bold prediction before orienting new subscribers. For subsequent editions (N>=2), a welcome line is optional but should not repeat the first-edition text verbatim; fresh framing or omission both MET. If the `edition:` frontmatter is missing, default to treating the draft as ongoing and score check_25 as PARTIAL with a note that edition numbering should be added.

## Round-specific exit criteria

- **Round 1:** score all 25 checks. Report all UNMET and PARTIAL.
- **Round 2:** score all 25 checks and confirm each round-1 weakness was addressed. A persistent round-1 weakness is `PARTIAL: still unmet from round 1`.
- **Round 3:** as round 2. Any remaining UNMET or PARTIAL triggers `VERDICT: REJECTED` with `REJECTED_REASON: critic-loop-exhausted`.

## Strengths to look for

Not scored, but highlight when present:

- An item whose human angle genuinely re-frames the news rather than restating it.
- A theme in the intro that ties the map-movement pattern together across items.
- An item that names a specific decision the reader could take on Monday.
- An item that points to a regulatory or human-factors signal the tech-press coverage missed.
- Item ordering that walks the reader from concrete (item 1) to abstract or strategic (item 3 and later).
