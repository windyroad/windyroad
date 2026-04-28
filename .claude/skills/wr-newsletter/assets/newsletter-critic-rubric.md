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

### check_26: Quantification of capability claims

Every item that claims a capability shift (model improved, throughput increased, accuracy dropped, cost changed, adopter count grew) cites a concrete number or explicitly labels itself a qualitative observation in the evidence stance. "Opus 4.7 with stronger coding, agent, vision, and multi-step performance" is UNMET because "stronger" has no quantification; the fix is either to quote the benchmark delta or to widen the evidence stance to "qualitative, no published numbers" so the reader knows no number backs the claim. Trend items that describe inherently non-quantitative shifts (public-reaction patterns, organisational behaviour) are MET when the non-quantitative framing is named. This check scores the evidence side only and does not duplicate check_4 (which scores operational consequence).

### check_27: First-person evidence verifiability

Applies only when the body names a specific tool, codebase, or experiment from the author's own practice (for example "our JTBD plugin", "the Windy Road wr-architect agent", "we ran this on our own codebase"). The item must link the artifact, quote a specific observation from the practice, or remove the first-person claim. Generic anonymised perspective ("a CTO we spoke with") is scored under check_22, not here. check_27 triggers only when a named first-person artifact is offered as evidence. UNMET when a named first-person artifact appears without a link or a specific quoted observation.

### check_28: Thesis diversity across items

Count items that express the same underlying thesis. PARTIAL when two items share a thesis (for example two items both carrying "do not over-commit to this week's shiny tool"); one of them should be re-angled or compressed. UNMET when three or more items share a thesis. The fix is to cut the redundant items, reframe one around its distinct second-order consequence, or move them into "Also worth noting". A shared theme across items is fine and wanted (see check_24); this check triggers on shared thesis (the same load-bearing claim), not on shared theme.

### check_29: At least one actionable recipe per edition

Edition-scoped. At least one item in the edition contains a 3+ step concrete recipe (commands, steps, a framework to apply, a decision procedure) the reader could apply this week. "Run Ollama, pull a Qwen weight, point your existing eval prompts at it, compare outputs" is a recipe. "Treat each as a separate adoption decision" is not. check_29 is stricter than check_13 (which requires a Monday-decision per item) and is edition-scoped rather than item-scoped; do not double-penalise. An item that carries the recipe satisfies check_29 for the edition, and check_13 continues to evaluate Monday-decisions per item independently. UNMET if no item in the edition contains a 3+ step recipe.

### check_30: No deference items

An item that reduces to "another outlet's analysis is the mature read, go read theirs" without adding Windy Road synthesis is UNMET. Pointing to external analysis is fine; the item must still carry a named shift (check_3), an operational why-it-matters (check_4), a human angle (check_5), and at least one specific angle the reader could not get from the cited source alone. A deference item is the failure mode where the item becomes a wrapper around another publication's piece. UNMET when the Windy Road synthesis is absent, or generic enough that removing it would not change the item's meaning.

### check_31: No platitude human angles (refinement of check_5)

The human angle must either (a) name a specific behaviour change (who acts differently, and how), (b) describe a named sociological, psychological, or organisational dynamic beyond a generic "people feel X", or (c) be cut. MET examples: "Cloud inference feels like a vendor promise; local inference feels like a hammer you own" (specific relational feelings named). UNMET examples: "Most of the time the answer is neither" (tautology), "Addressing perceived inequality is the work" (abstract moralising without a dynamic named), "Every wave of process tooling gets sold on the promise that this time the up-front model is right" (generalisation without a named dynamic).

Scoring note: this check is a refinement of check_5. If check_31 is UNMET on an item, check_5 is also UNMET on that item; do not double-count in round-exit arithmetic. The reverse does not hold: a human angle can be specific (check_31 MET) and still fail check_5 for other reasons (absent, off-topic).

### check_32: Internal consistency

For each item body and each preamble paragraph, the critic compares each declarative claim (pace, direction, magnitude, pattern) against any adjacent supporting or qualifying sentence in the same paragraph. UNMET when the asserted claim is contradicted by the evidence presented within the same paragraph.

- UNMET: "Vendors are moving in weeks, regulators are moving in quarters" followed in the same paragraph by evidence of two regulator actions in seven days. The pace claim is directly contradicted by the next sentence's facts.
- MET: "Vendors are moving in weeks, regulators are moving on much shorter cycles than they were a year ago" followed by evidence of two regulator actions in seven days. The framing matches the evidence.

Disambiguation: check_18 (claim matches evidence) scopes to headline-versus-bullets and item-versus-source. check_32 scopes to within-paragraph claim-vs-adjacent-evidence. The two checks complement each other; do not double-count UNMET when the same contradiction triggers both.

### check_33: Referential clarity

For each pronoun and each repeated abstract noun in body sections (Why-it-matters, Human-angle, From Tom opener, bridge paragraphs), the critic checks whether the referent is unambiguous given the preceding 2-3 sentences. UNMET when a noun like "access", "the platform", "this", or "it" could plausibly refer to more than one antecedent in the recent context and the wording does not disambiguate.

- UNMET: "It is whether your team has a manual path if access disappears." (in a paragraph that referenced both SaaS-vendor access and AI-vendor access; "access" could plausibly mean either)
- MET: "It is whether your team has a manual path if AI-vendor access disappears." (the qualifier resolves the referent)

Disambiguation: check_20 (plain-English readability) catches stacked-jargon noun clusters. check_33 catches unresolved referents even when each noun is itself plain. check_22 (author voice authenticity) scores presence of perspective; check_33 scores clarity of wording within that perspective.

### check_34: Density and consultant-speak detection

For each item body and the From Tom opener, count subculture-jargon noun-phrases per sentence ("decision-rights frame", "rolling vendor-evaluation cadence", "enforcement-capacity building", "operating-model implication"). UNMET when an item has more than one such phrase per two sentences, OR when sentence stacking produces three-clause-with-semicolon constructions in a body section.

- UNMET: "The decision-rights frame here, against a rolling vendor-evaluation cadence, is what enforcement-capacity building looks like in practice." (three jargon noun-phrases in one sentence)
- MET: "The question is who decides, and how often you re-evaluate the vendor." (the same idea, plain)

Disambiguation: check_16 (LinkedIn readability) catches sentence length and run-on constructions. check_20 (plain-English) catches stacked-jargon noun clusters within a single sentence. check_34 catches the cumulative consultant-speak density pattern across sentences within a paragraph that escapes both.

### check_35: Voice consistency across sections

The "From Tom" opener voice is direct, first-person, and concrete; item bodies often slip into a more corporate, passive, or third-person register. UNMET when the item bodies' voice signature is detectably different from the opener's voice signature on two or more axes (active vs passive, first-person vs third-person, specific vs abstract, concrete imagery vs abstract noun phrasing).

- UNMET: opener says "I told a CTO this week..." and item bodies say "Organisations should consider their vendor-evaluation cadence."
- MET: opener says "I told a CTO this week..." and item bodies say "If you are running three coding agents in parallel, pick one and let the others go."

The check operates by comparing voice signatures across sections, not by absolute scoring. Voice compliance against `docs/VOICE-AND-TONE.md` is the `wr-voice-tone:agent`'s concern; check_35 catches drift between sections of the same draft after the voice gate has run.

### check_36: Item-headline distinctiveness

Item mini-headlines following the same `Item N: <Vendor does X>` template can read as scaffolded rather than authored. UNMET when more than one item-headline is in the bare "Vendor does X" form without a sharper editorial framing.

- UNMET: "Atlassian flips the default on customer data."
- MET: "Atlassian flips the default. Your SaaS contract just aged a year."
- UNMET: "OpenAI ships GPT-5.5 with extended context."
- MET: "GPT-5.5 shipped. The real story is who owns the data you ran through it."

The fix is to add a second clause that names the editorial framing or the consequence, not to remove the news-peg from the headline.

### check_37: Headline thesis-first vs news-peg-first

The H1 should lead with the thesis the edition is making, or carry the thesis as the dominant clause. UNMET when the H1 is purely descriptive of news with the thesis buried behind it; MET when the H1 leads with the thesis or sets it up so the news peg supports the thesis rather than overshadowing it.

- UNMET: "GPT-5.5 ships, and the data-and-choice capture continues" (the thesis "data-and-choice capture" is buried behind the news peg)
- MET: "GPT-5.5 shipped. The real story is who owns your data." (the thesis leads, the news peg supports)
- UNMET: "Three big regulator moves this week" (pure news description, no thesis)
- MET: "Regulators are moving faster than vendors expected. Three moves this week." (thesis leads, news supports)

The check cross-references the H1 against the From Tom opener's framing to identify what the edition's thesis is. UNMET if the thesis is present in the opener but absent from the H1.

### check_38: Author commitment honor-ability

When the From Tom opener (or any body section) makes an explicit author commitment ("I'll track this monthly", "We'll publish quarterly results", "We will revisit this in three months"), the check flags it for human review. UNMET when a commitment is present but no clear honor-mechanism is visible in the project (no recurring task, no scheduled retrospective, no commitment-tracking artifact). MET when the commitment is removed, when the commitment is softened to an aspiration ("I would like to track this..."), or when a project-level honor mechanism is named.

Pattern-match for commitment language: "I will", "we will", "I'll track", "monthly", "quarterly", numbered cadence promises, "every three months", "next quarter".

The check surfaces the choice rather than letting it ship silently. The usual fix is to remove the commitment, not to add the mechanism, but the choice belongs to the author.

## Round-specific exit criteria

- **Round 1:** score all 38 checks. Report all UNMET and PARTIAL.
- **Round 2:** score all 38 checks and confirm each round-1 weakness was addressed. A persistent round-1 weakness is `PARTIAL: still unmet from round 1`.
- **Round 3:** as round 2. Any remaining UNMET or PARTIAL triggers `VERDICT: REJECTED` with `REJECTED_REASON: critic-loop-exhausted`.

## Strengths to look for

Not scored, but highlight when present:

- An item whose human angle genuinely re-frames the news rather than restating it.
- A theme in the intro that ties the map-movement pattern together across items.
- An item that names a specific decision the reader could take on Monday.
- An item that points to a regulatory or human-factors signal the tech-press coverage missed.
- Item ordering that walks the reader from concrete (item 1) to abstract or strategic (item 3 and later).
