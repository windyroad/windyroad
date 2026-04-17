# Problem 008: SW-critic rubric consistently misses weaknesses that an external editorial review catches

**Status**: Known Error
**Reported**: 2026-04-17
**Transitioned to Known Error**: 2026-04-17 (root cause documented in-session; workaround is external review by Tom)
**Priority**: 12 (High). Impact: Significant (4) x Likelihood: Likely (3)

## Description

Across the 2026-04-17 session, Tom ran two external editorial reviews on the draft of The Shift's first edition. Both reviews caught substantive weaknesses that the `wr-sw-critic` subagent and the 20-check rubric at `.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md` had marked MET or PASS. The pattern repeated across multiple rounds: structural correctness was tight, presentation and persuasion were loose.

This is the specific thing Tom asked the retrospective to solve: "the external review was picking up valid weaknesses that the subagent did not. How do we improve the review and make this whole process smoother for next week?"

## Symptoms

External reviewer (Tom) caught the following classes of weakness, none of which were surfaced by the critic:

1. **Redundant preamble.** Three separate paragraphs before Item 1 (prediction + thesis + delta line) made the reader walk too far before the first payoff. Critic rubric has no "preamble density" check.
2. **Author-voice authenticity.** The drafter's attempt at a Tom-voice opener read as a model-guess, not a person's perspective. Critic check_17 asks whether a voice opener is present; it does not ask whether the voice sounds authored. Solved in-session by adding per-item `AskUserQuestion` capture (SKILL step 4.5) so the voice is Tom's actual reactions, not a guess.
3. **Too many items, wrong weighting.** Six full items was too dense for LinkedIn; two of them deserved compression to "Also worth noting". The critic rubric caps minimum at three but has no preferred-range check.
4. **Claim-evidence looseness.** Item 2's headline "parity crossed a visible line" was backed by one anecdote (Willison's pelican test). Item 3's "enforcement in three jurisdictions" mixed EU binding, US ruling, and AU guidance. Critic did flag these once added to the rubric (check_18), but only after Tom's external review surfaced the pattern.
5. **LinkedIn-format failures.** Sources as raw URL blocks do not render as hyperlinks on LinkedIn; long sentences collapse in the narrow column; sub-bullets work better than run-on paragraphs for multi-event items. Critic check_16 covered some of this only after addition.
6. **Reader-respect patterns that do not match ADR 015 examples.** Phrases like "procurement said so" and "the tool they will resent" passed check_2 and check_14 until the voice gate caught them. The reader-respect check is pattern-matched on specific formulations; the infinite variations of judgement-of-reader-team need a more general scan.
7. **Section cohesion and through-line.** The reviewer praised the through-line when it worked (Item 2 thread into Item 4) and critiqued it when it didn't. The critic rubric has no through-line check.
8. **Opener serving the wrong reader.** First-edition readers need context ("who this is for, what you'll get") before the bold prediction. Critic's check_17 does not distinguish first-edition orientation from ongoing-edition assumptions.

## Impact Assessment

- **Who is affected**: the newsletter's readers (weaker editions ship); Tom (has to do the external review every week or tolerate weaker output)
- **Frequency**: every weekly run of the pipeline, until closed
- **Severity**: High. The review gates are the main quality mechanism, and the gap between what they catch and what a reader notices is the gap between "solid synthesis" and "subscriber churn".

## Root Cause Analysis

### Root Cause

The critic rubric was designed to enforce measurable structural properties (claim-evidence match, section closes, phase naming, URL presence, sentence length). Those are necessary but not sufficient. Presentation quality, voice authenticity, preamble density, through-line, and reader-orientation are all judgement calls an experienced newsletter editor makes by feel. The current rubric does not model that editor's judgement.

The content-risk gate (ADR 012/015) has the same gap at a smaller scale: it is still inline self-scoring by the drafter, which is exactly the confirmation-bias failure ADR 016 was written to prevent for the analytical critic.

### Fix Strategy

Three options, not mutually exclusive:

1. **Expand the rubric with the weakness-classes the external review surfaced.** New checks:
   - check_21: Preamble density. Count paragraphs between H1 and the first item; flag if three or more non-voice-opener paragraphs accumulate.
   - check_22: Author-voice authenticity. Ask: does the opener reference specific client experiences, verifiable opinions, or named conventions-being-challenged? If absent, UNMET.
   - check_23: Item count proportionality. Prefer 3-5 full items; anything beyond goes to "Also worth noting".
   - check_24: Through-line check. Does the opener's thesis thread into at least two items? If disconnected, PARTIAL.
   - check_25: Reader-orientation. For a first edition, include a "who this is for, what you'll get" line; for subsequent editions, skip.
2. **Build an editorial-sim subagent.** A new specialist (e.g. `wr-newsletter-editor`) that reads the draft and plays the role of an experienced LinkedIn newsletter editor scoring for subscriber experience (would a reader open, read, forward?). Runs after the existing critic, voice, and content-risk gates.
3. **Subagent-ise the content-risk gate.** Remove the inline self-scoring pattern; delegate to a fresh-context specialist the way voice and critic are delegated.

Recommended immediate work: option 1 (rubric expansion) as the cheap win, plus option 2 (editorial-sim subagent) as the new capability that generalises for future content surfaces.

### Investigation Tasks

- [x] Expand `newsletter-critic-rubric.md` with checks 21-25 (2026-04-17). Architect LGTM with refinements applied: softened check_23 to match `feedback_brief_item_count.md` no-cap memory (PARTIAL at 6, UNMET at 7+); added honest-framing escape for check_24; added `edition: N` frontmatter requirement for check_25; noted check_22 non-overlap with ADR 015 voice scope.
- [x] Update `draft-template.md` with `edition: N` frontmatter and first-edition welcome-line scaffold (same change set; rubric-drift prevention per ADR 016 Consequences §Bad).
- [x] Update `SKILL.md` step 10 with edition-counting instruction and welcome-line rule (same change set).
- [ ] Draft `wr-newsletter-editor` editorial-sim subagent (option 2). New agent + new ADR (likely ADR 017) because it introduces a fourth gate class with editor-experience semantics distinct from rubric-based critic. Blocked on session restart for option 1's changes to take effect, then a focused session to design the agent.
- [ ] Run the expanded rubric against the first edition retroactively to see whether the new checks would have caught the external-review findings. This is a validation task to run once option 1 is live in a fresh session (the `wr-sw-critic` agent will be discoverable post-restart per P007).
- [ ] Subagent-ise the content-risk gate per P009. Separate problem ticket, separate ADR (likely ADR 018 if option 2 becomes ADR 017). Not in scope for P008 option 1.

## Related

- `.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md`
- `.claude/agents/wr-sw-critic.md`
- `.claude/skills/wr-newsletter/SKILL.md` (steps 11-13 where the gates run)
- ADR 012 (content-risk gate), ADR 015 (reader-respect), ADR 016 (SW-critic pattern)
- Memory: `feedback_each_review_is_separate_subagent.md`, `feedback_critic_before_voice.md`, `feedback_brief_needs_author_voice_and_cta_loop.md`, `feedback_plain_english_check.md`, `feedback_brief_formatting.md`
