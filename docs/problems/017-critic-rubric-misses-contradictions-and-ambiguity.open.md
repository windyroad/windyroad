# Problem 017: Newsletter critic rubric does not check for internal contradictions or referential ambiguity

**Status**: Open
**Reported**: 2026-04-24
**Priority**: 16 (High). Impact: Significant (4) x Likelihood: Likely (4)
**Effort**: M (newsletter critic rubric: add check_32 internal-consistency and check_33 referential-clarity; potentially mirror in wardley-critic-rubric)
**WSJF**: (16 x 1.0) / 2 = 8.0

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

Two new checks plus a possible mirror in the Wardley critic rubric:

1. **check_32: Internal consistency.** For each item and the bridge paragraph, the critic compares each declarative claim against any adjacent supporting or qualifying sentence. UNMET when an asserted pace, direction, magnitude, or pattern is contradicted by the evidence presented within the same paragraph. Example UNMET: "regulators are moving in quarters" followed by evidence of two regulator actions in two days.

2. **check_33: Referential clarity.** For each pronoun and each repeated noun in body sections (Why-it-matters, Human-angle, From Tom opener), the critic checks whether the referent is unambiguous given the preceding 2-3 sentences. UNMET when a noun like "access" or "the platform" or "this" could plausibly refer to more than one antecedent in the recent context. Example UNMET: "manual path if access disappears" after a paragraph that references both SaaS access (Atlassian opt-out) and AI vendor access (Anthropic ban).

3. **Optional mirror in Wardley critic rubric.** The same internal-consistency check is worth applying to `ai-landscape.md` because the analysis prose can drift into the same trap (e.g. claiming a component "did not move this week" while a later paragraph describes a position shift). Defer until check_32 lands and a baseline pattern is established.

### Investigation Tasks

- [ ] Decide whether check_32 and check_33 belong as two separate checks or one combined check (separate is cleaner for UNMET reporting; combined is more efficient if the critic does both passes in one prompt)
- [ ] Draft the check_32 detection prompt: "For each declarative pace, direction, magnitude, or pattern claim in the body, check whether the next 1-3 sentences present evidence that supports, qualifies, or contradicts it. UNMET if contradiction is present."
- [ ] Draft the check_33 detection prompt: "For each pronoun and each abstract noun in body sections, identify the candidate antecedents in the preceding 2-3 sentences. UNMET if more than one plausible antecedent exists and the referent cannot be uniquely resolved."
- [ ] Update newsletter-critic-rubric.md: add the two checks, update the round-specific exit criteria from 31 to 33, document the disambiguation against check_18 and check_20 inline (so the next architect review does not flag double-counting)
- [ ] Run the expanded rubric against the 2026-04-24 The Shift edition as a back-test; confirm both the contradiction and the ambiguity from this session would have been caught by check_32 and check_33 respectively
- [ ] Optional: mirror check_32 in wardley-critic-rubric.md, scoped to the analysis prose (Differentiation, Evolution, Risk, Decisions sections)

## Related

- Problem 008 (critic rubric misses external-review findings; known-error). Same pattern as this ticket: external review surfaces a category the structural rubric cannot reach. P017 is the next-wave expansion P008 anticipated.
- Problem 015 (drafter paraphrases interactive capture text). Adjacent: P015 is the drafter losing fidelity AFTER capture, P017 is the critic missing internal consistency AFTER drafting. Together with P008 they form the substance-gap series.
- Problem 016 (filter drops significant stories without corroboration). Adjacent: P016 is the filter losing significant stories BEFORE the critic ever sees them; P017 is the critic missing substance issues IN what it does see. Both are pipeline-quality gaps.
- `.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md` (host for check_32 and check_33; current count 31)
- `.claude/skills/wr-newsletter/assets/wardley-critic-rubric.md` (potential mirror for check_32; current count 16)
- `src/newsletters/drafts/leader/2026-04-24.md` (the edition where both the contradiction and the ambiguity were caught by Tom's external review after critic round 3 PASSed; the bridge paragraph and From Tom closing trio are the symptom records)
- ADR 016 (SW-critic subagents and iteration loop; new checks must fit the 3-round exit criteria)
- Memory: `feedback_rubric_pass_does_not_mean_newsletter_is_good.md` (the recurring pattern this ticket exemplifies for the third time after P008 and P015)
