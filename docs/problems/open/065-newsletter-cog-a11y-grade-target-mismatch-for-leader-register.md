# Problem 065: Newsletter cog-a11y persistently scores Grade 11+ vs Grade 10 target on leader register

**Status**: Open
**Reported**: 2026-05-15
**Priority**: 3 (Medium). Impact: 2 x Likelihood: 5 (deferred, re-rate at next /wr-itil:review-problems)
**Effort**: M (deferred, re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

The cognitive-accessibility gate (P053 landing) is configured with `target_reading_level: Grade 10` for the leader persona. Witnessed 2026-05-15 finalise: the leader brief scored Flesch-Kincaid 11.58 against a Grade 10 target. The agent surfaced 8 medium findings (compound-noun density + unexpanded abbreviations), of which 4 were addressed in-session via splits and abbreviation expansions; the remaining 4 advisory findings (passive constructions, "tier-1 lab" without inline gloss, "kludge" / "harnesses" as in-group jargon) were left for future-edition retro. Final post-fix grade was not re-measured.

Pattern observation: this is the FIRST edition the cog-a11y gate ran on (P053 landed the gate this session). The grade-level outcome (~1.5 above target) suggests one of three things:

1. The Grade 10 target is too aggressive for the leader register, which is structurally written for CTOs / Heads of Engineering at mid-to-large orgs (a Grade 11-12 reading-level audience by US Flesch convention).
2. The grade-level scorer the cog-a11y agent uses is biased toward the technical compound-noun-density of AI-engineering vocabulary in a way that inflates grade against the actual readability for the target audience.
3. The brief's leader-register vocabulary genuinely does need a compound-noun-density compression pass to land at Grade 10.

The compound-noun-density compression flagged 8 specific simplifications. Applying all 8 might land the brief at Grade 10.5 (the agent's own estimate). Some of the simplifications conflict with the brief's required vocabulary ("tier-1 lab" is the canonical term in the AI-industry coverage; replacing every instance with "frontier AI lab" loses precision for the leader audience who reads the AI-trade press).

## Symptoms

- Cog-a11y gate returns NEEDS_REVISION_OPTIONAL with Grade 11+ score on every leader-brief run.
- Each edition surfaces 5-10 medium findings, of which 3-4 can be applied without semantic loss; the rest conflict with leader-register vocabulary precision.
- The pattern is consistent across editions but visible only on this first run because P053 just landed.

## Workaround

Apply the high-impact splits and abbreviation expansions (AISI on first use, KPI on first use, long-sentence splits, sub-bullet conversion of inline lists). Skip the in-group jargon flags that conflict with leader-register precision. Surface the residual findings in the reviews companion file for retro.

## Impact Assessment

- **Who is affected**: Tom; every edition of The Shift.
- **Frequency**: every edition. Compound-noun density is structural to the leader register; the grade-level overshoot will recur unless the target is raised or the rubric is calibrated.
- **Severity**: Medium. NEEDS_REVISION_OPTIONAL does not block publish per the spec (only NEEDS_REVISION blocks). The accessibility intent is real (LinkedIn scan readers, ESL leaders, cognitive-load on context-switch) but the gate's current threshold mis-targets the audience.
- **Analytics**: deferred to investigation.

## Root Cause Analysis

### Hypothesis

The Grade 10 target was set at P053 landing as the WCAG 2.2 SC 3.1.5 "Reading Level" advisory default. The advisory is aimed at general-public content where Grade 10 is a defensible accessibility target. The leader-brief audience is materially different:

- Engineering Leaders at mid-to-large orgs typically have advanced degrees and read AI-trade press routinely.
- The leader register's compound-noun-density inflates grade-level scores without meaningfully degrading readability for the actual audience.
- The Flesch-Kincaid scorer's syllable-density metric over-weights AI-engineering vocabulary which inherits long compound nouns from the substrate it describes.

Three possible fixes:

a. **Raise the leader-register target**: change `target_reading_level: Grade 10` to `Grade 11` or `Grade 12` for leader persona. Keep Grade 10 for developer persona (technical specs benefit from plainer prose).
b. **Add a leader-register exemption list**: domain vocabulary ("tier-1 lab", "frontier model", "agent runtime") gets a grade-level discount in the scorer.
c. **Keep the target, accept the recurring NEEDS_REVISION_OPTIONAL verdict**: surface advisory findings each retro for partial application; accept that Grade 10 is aspirational for this register.

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems.
- [ ] Survey 3-5 published Engineering Leader newsletters (Stratechery, Benedict Evans, AI Daily Brief leader segment) for their Flesch-Kincaid scores to benchmark.
- [ ] Decide on fix shape (raise target vs add exemption list vs accept).
- [ ] If option (a), update `/wr-newsletter` SKILL.md Step 15.4 cog-a11y invocation prompt for leader persona.
- [ ] Document the chosen rationale in the cog-a11y agent file or the persona config.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: P053 (cog-a11y gate landing). P053 is the upstream that surfaced this calibration question.
- **Composes with**: (none)

## Related

- P053 (formal gate sequence missing cog-a11y step). The gate that surfaced this.
- /wr-newsletter SKILL.md Step 15.4 (cog-a11y invocation)
- .claude/skills/wr-newsletter/personas/leader.md (where a target override would land)
- 2026-05-15.reviews.md (cog-a11y review block recording the 11.58 score and 8 findings)
- Captured via /wr-retrospective:run-retro on 2026-05-15 session.
