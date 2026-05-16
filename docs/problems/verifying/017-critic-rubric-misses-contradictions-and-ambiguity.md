# Problem 017: Newsletter critic rubric does not check for internal contradictions or referential ambiguity

**Status**: Verification Pending
**Reported**: 2026-04-24
**Transitioned to Known Error**: 2026-04-25 (review pass: root cause confirmed by 2026-04-24 edition; workaround = Tom's external review)
**Transitioned to Verification Pending**: 2026-04-25 (fix landed: 7 new checks added to newsletter-critic-rubric.md, 2 mirror checks added to wardley-critic-rubric.md)
**Priority**: 16 (High). Impact: Significant (4) x Likelihood: Likely (4)
**Effort**: L (M to L on 2026-04-24 scope expansion: original two checks (check_32, check_33) grew to seven after Tom's external editorial critique surfaced five additional rubric gaps on the same edition; consolidation keeps the rubric-gap concern in one ticket per the manage-problem rule on consolidating 3-or-more improvements to one output)
**WSJF**: (16 x 2.0) / 4 = 8.0
**Re-rated 2026-04-25**: Status auto-transitioned to Known Error; WSJF 4.0 to 8.0 reflects Known Error multiplier.

## Description

The newsletter critic rubric (`.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md`, 31 checks as of 2026-04-21) scores structural attributes (claim-evidence match, attribution, sentence length, plain-English readability, thesis diversity) but does not explicitly check for two adjacent failure categories:

1. **Internal contradiction.** A claim made in one sentence that is contradicted by evidence presented in an adjacent sentence within the same paragraph or item.
2. **Referential ambiguity.** A noun or pronoun whose referent is unclear given the preceding context, where the reader cannot tell which of two or more plausible antecedents the writer means.

Both surfaced in the 2026-04-24 The Shift edition critic-pass review, undetected by the existing 31 checks, and only caught by Tom's external editorial review:

- **Contradiction**: bridge paragraph claimed "vendors are moving in weeks, regulators are moving in quarters" then immediately presented evidence that the OAIC moved twice in seven days (transparency guidance the prior week, enforcement determination plus coordination agreement this week). The pace claim was directly contradicted by the next sentence's facts. Critic round 3 PASSed.

- **Ambiguity**: From Tom opener closing trio said "It is whether your team has a manual path if access disappears." The preceding sentences referenced both SaaS-vendor (Atlassian) and AI-vendor (Anthropic, GitHub) access. Without "AI vendor access" or "model access" qualifier, "access" could plausibly mean either. Critic round 3 PASSed.

These are exactly the kind of issues the critic rubric was expanded twice (P008 first wave 1-25, second wave 26-31) to start catching at the substance level. Both are detectable by a critic that compares adjacent sentences against each other for logical consistency and referential clarity, not just each sentence in isolation.

## Symptoms

- Critic round 3 returns PASS on a draft that contains a claim contradicted by adjacent evidence
- Critic round 3 returns PASS on a draft that contains a noun whose referent is genuinely ambiguous given preceding context
- Tom's external review catches both issues after the critic loop has terminated and the draft has been declared ready to ship
- The pattern recurs across editions because the existing checks scope each sentence in isolation and do not perform sentence-to-sentence consistency checks

## Workaround

None automated. Current workaround is Tom's external review before publishing. This is the same workaround pattern as P008 (rubric misses external-review findings) and P015 (drafter paraphrases capture text); the manual review remains the only safety net for the categories the structural rubric cannot reach.

## Impact Assessment

- **Who is affected**: The Shift subscribers (Engineering Leader persona, JTBD-001, JTBD-003) and Tokens Spent subscribers (Developer persona, JTBD-200 through JTBD-205). Both newsletters share the same critic rubric.
- **Frequency**: Likely once per edition. Internal contradictions emerge naturally when a drafter makes a confident framing claim and then supports it with evidence that does not quite fit; referential ambiguity emerges naturally in From Tom-style opener trios, list constructions, and paragraphs that thread multiple subjects.
- **Severity**: Significant. Contradictions and ambiguities are exactly the credibility-eroding errors a leader-audience newsletter cannot ship. A single edition that confidently asserts X then immediately disproves X reads as either careless or untrustworthy.
- **Analytics**: Qualitative (Tom's external review catches; subscriber feedback once readership grows).

## Root Cause Analysis

### Root Cause (confirmed by 2026-04-24 The Shift edition)

The 31 existing checks all score sentences or sections in isolation, or check structural attributes (link present, label bolded, source cited). None of them perform sentence-to-sentence comparison within an item, paragraph-to-paragraph comparison within a section, or referent-resolution against preceding context.

The closest existing checks are:
- check_18 (claim matches evidence): scopes to headline-versus-bullets and item-versus-source. Does not catch a paragraph-internal claim contradicted by a same-paragraph fact.
- check_20 (plain-English readability): catches stacked jargon. Does not catch unclear referents.
- check_22 (author voice authenticity): scores presence of perspective. Does not catch referential ambiguity in the perspective's wording.

The gap is structurally similar to the gap P008 was opened to close at the substance level. The rubric's evolution has been to add checks that catch new failure categories as Tom's external review surfaces them. This is the next category.

### Fix Strategy

Two new checks (the original scope), plus five additional checks surfaced by Tom's external editorial critique on the 2026-04-24 edition (post-publication review by an external LLM, captured in session transcript), plus a possible mirror in the Wardley critic rubric. Per the manage-problem skill's "consolidate >= 3 improvements to one output" rule, all seven checks live in this ticket rather than spawning separate tickets per finding.

**Original scope:**

1. **check_32: Internal consistency.** For each item and the bridge paragraph, the critic compares each declarative claim against any adjacent supporting or qualifying sentence. UNMET when an asserted pace, direction, magnitude, or pattern is contradicted by the evidence presented within the same paragraph. Example UNMET: "regulators are moving in quarters" followed by evidence of two regulator actions in two days.

2. **check_33: Referential clarity.** For each pronoun and each repeated noun in body sections (Why-it-matters, Human-angle, From Tom opener), the critic checks whether the referent is unambiguous given the preceding 2-3 sentences. UNMET when a noun like "access" or "the platform" or "this" could plausibly refer to more than one antecedent in the recent context. Example UNMET: "manual path if access disappears" after a paragraph that references both SaaS access (Atlassian opt-out) and AI vendor access (Anthropic ban).

**Expanded scope (added 2026-04-24 post-publication, from external editorial critique):**

3. **check_34: Density and consultant-speak detection.** Per item body, count subculture-jargon noun-phrases per sentence ("decision-rights frame," "rolling vendor-evaluation cadence," "enforcement-capacity building"). UNMET when an item has more than one such phrase per two sentences, OR when sentence stacking produces three-clause-with-semicolon constructions in a body section. The existing check_16 catches sentence length and check_20 catches plain-English; check_34 catches the stacked-jargon-density pattern that escapes both.

4. **check_35: Voice consistency across sections.** The "From Tom" opener voice is direct and personal; item bodies often slip into a more corporate/passive register. UNMET when the items' voice is detectably different from the opener's voice (active vs passive, first-person vs third-person, specific vs abstract). The check operates by comparing voice signatures across sections, not by absolute scoring.

5. **check_36: Item-headline distinctiveness.** Item mini-headlines following the same `Item N: <descriptive phrase>` template can read as scaffolded rather than authored. UNMET when more than one item-headline is in the form "Vendor does X" without a sharper editorial framing. Example MET: "Atlassian flips the default. Your SaaS contract just aged a year." Example UNMET: "Atlassian flips the default on customer data."

6. **check_37: Headline thesis-first vs news-peg-first.** The H1 should lead with the thesis the edition is making, not just the news peg. UNMET when the H1 is purely descriptive of news ("GPT-5.5 ships, and the data-and-choice capture continues" buries the thesis behind the news). MET when the H1 leads with the thesis or carries it as the dominant clause ("GPT-5.5 shipped. The real story is who owns your data.").

7. **check_38: Author commitment honor-ability.** When the From Tom opener (or any body section) makes an explicit author commitment ("I'll track this monthly", "We'll publish quarterly results"), the check flags it for human review. UNMET when a commitment is present but no clear honor-mechanism is visible in the project (no recurring task, no scheduled retrospective, no commitment-tracking artifact). The fix is usually to remove the commitment, not to add the mechanism, but the check surfaces the choice rather than letting it ship silently.

**Optional mirror in Wardley critic rubric:**

8. **Optional mirror.** The same internal-consistency (check_32) and referential-clarity (check_33) checks are worth applying to `ai-landscape.md` because the analysis prose can drift into the same trap (e.g. claiming a component "did not move this week" while a later paragraph describes a position shift). Defer until check_32 and check_33 land in the newsletter rubric and a baseline pattern is established.

### Investigation Tasks

- [ ] Decide whether check_32 and check_33 belong as two separate checks or one combined check (separate is cleaner for UNMET reporting; combined is more efficient if the critic does both passes in one prompt). Same decision applies to check_34 / check_35 / check_36 / check_37 / check_38.
- [ ] Draft the check_32 detection prompt: "For each declarative pace, direction, magnitude, or pattern claim in the body, check whether the next 1-3 sentences present evidence that supports, qualifies, or contradicts it. UNMET if contradiction is present."
- [ ] Draft the check_33 detection prompt: "For each pronoun and each abstract noun in body sections, identify the candidate antecedents in the preceding 2-3 sentences. UNMET if more than one plausible antecedent exists and the referent cannot be uniquely resolved."
- [ ] Draft the check_34 detection prompt for stacked-jargon density. Threshold to settle: jargon-phrases-per-sentence ratio that triggers UNMET.
- [ ] Draft the check_35 detection prompt for voice consistency across sections. Likely needs a section-level voice-signature extraction step before the cross-section comparison.
- [ ] Draft the check_36 detection prompt for item-headline distinctiveness. Easiest implementation: count the number of item headlines that fit the bare "Vendor does X" template; UNMET on >1.
- [ ] Draft the check_37 detection prompt for headline thesis-first. Heuristic: does the H1 contain the edition's thesis (cross-reference against the From Tom opener's framing) or only the news peg?
- [ ] Draft the check_38 detection prompt for author-commitment honor-ability. Pattern-match for commitment language ("I'll", "we'll", "we will", "I'll track", "monthly", "quarterly", numbered cadence promises) in body sections; flag for review without auto-rejecting.
- [ ] Update newsletter-critic-rubric.md: add all seven checks (or as many as land in the first pass), update the round-specific exit criteria from 31 to the new total, document disambiguation against check_4, check_16, check_18, check_20, check_22 inline (so the next architect review does not flag double-counting).
- [ ] Run the expanded rubric against the 2026-04-24 The Shift edition as a back-test; confirm all seven post-publication findings would have been caught by the new checks.
- [ ] Optional: mirror check_32 and check_33 in wardley-critic-rubric.md, scoped to the analysis prose (Differentiation, Evolution, Risk, Decisions sections).

## Related

- Problem 008 (critic rubric misses external-review findings; known-error). Same pattern as this ticket: external review surfaces a category the structural rubric cannot reach. P017 is the next-wave expansion P008 anticipated.
- Problem 015 (drafter paraphrases interactive capture text). Adjacent: P015 is the drafter losing fidelity AFTER capture, P017 is the critic missing internal consistency AFTER drafting. Together with P008 they form the substance-gap series.
- Problem 016 (filter drops significant stories without corroboration). Adjacent: P016 is the filter losing significant stories BEFORE the critic ever sees them; P017 is the critic missing substance issues IN what it does see. Both are pipeline-quality gaps.
- `.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md` (host for check_32 and check_33; current count 31)
- `.claude/skills/wr-newsletter/assets/wardley-critic-rubric.md` (potential mirror for check_32; current count 16)
- `src/newsletters/drafts/leader/2026-04-24.md` (the edition where both the contradiction and the ambiguity were caught by Tom's external review after critic round 3 PASSed; the bridge paragraph and From Tom closing trio are the symptom records)
- ADR 016 (SW-critic subagents and iteration loop; new checks must fit the 3-round exit criteria)
- Memory: `feedback_rubric_pass_does_not_mean_newsletter_is_good.md` (the recurring pattern this ticket exemplifies for the third time after P008 and P015)

## Fix Released

**Released**: 2026-04-25 (riding with this transition commit)
**Release marker**: this commit's SHA (transition commit, ADR-014)

**Fix summary**: Added seven new checks (check_32 through check_38) to `.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md`, taking the rubric from 31 to 38 checks. Mirrored check_32 (internal consistency) and check_33 (referential clarity) into `.claude/skills/wr-newsletter/assets/wardley-critic-rubric.md` as check_17 and check_18, taking that rubric from 16 to 18 checks. Round-specific exit criteria updated in both files.

The seven new newsletter checks:
- check_32: Internal consistency. Claim vs adjacent evidence within paragraph.
- check_33: Referential clarity. Pronoun and abstract-noun referent ambiguity.
- check_34: Density and consultant-speak detection. Jargon-phrase density per sentence.
- check_35: Voice consistency across sections. From Tom opener vs item bodies.
- check_36: Item-headline distinctiveness. Anti-scaffolded "Vendor does X" template.
- check_37: Headline thesis-first vs news-peg-first. H1 must lead with thesis.
- check_38: Author commitment honor-ability. Flag commitments without honor mechanism.

**Awaiting user verification**: next `/wr-newsletter` run where the critic loop runs against a new draft. Verification trigger is satisfied when the critic surfaces UNMET findings on the draft against any of checks 32 through 38, OR when the critic returns PASS on a draft that does not contain the failure modes those checks target. Back-testing against the 2026-04-24 The Shift edition is an investigation-task remainder that may be addressed in a follow-up but is not blocking for verification.
