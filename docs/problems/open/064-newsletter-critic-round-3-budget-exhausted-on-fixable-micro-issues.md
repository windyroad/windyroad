# Problem 064: Newsletter critic round-3 budget exhausted on fixable micro-issues; rubric checks need leader-register calibration

**Status**: Open
**Reported**: 2026-05-15
**Priority**: 3 (Medium). Impact: 3 x Likelihood: 4 (deferred, re-rate at next /wr-itil:review-problems)
**Effort**: M (deferred, re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

The newsletter critic (`wr-sw-critic` on the newsletter-critic-rubric) round-3 budget exhausted in this session's prep phase on two PARTIAL micro-issues (check_16 LinkedIn sentence length on Item 1 Human-angle 32-word sentence; check_35 voice consistency drift on Item 2 Human-angle third-person abstract phrasing). The critic's own suggested fixes were both single-sentence rewrites that took 30 seconds to apply post-round-3. The 3-round budget per ADR-016 fired before the fix iteration could converge, returning `VERDICT: REJECTED` with `REJECTED_REASON: critic-loop-exhausted`.

The same draft re-ran in finalise (per ADR-017 fresh per-artifact-pass budget) with the post-round-3 fixes applied; round-3 finalise returned `PASS_WITH_AUTHOR_OVERRIDES` per ADR-025.

Pattern observation: the rubric checks check_16 (LinkedIn sentence length, ~25-word threshold) and check_35 (voice consistency across sections) flagged in BOTH prep AND finalise rounds. Each flag was addressable but the structural pattern (catching long sentences, cross-section voice drift in a long-form leader brief) recurs every edition. The rubric thresholds may be miscalibrated for the leader register, which carries more abstract noun-phrases and longer sentences than the developer register the rubric was originally tuned for.

## Symptoms

- Critic returns WEAKNESSES_FOUND round 1 with 5+ PARTIAL flags.
- Round 2 fixes 3-4 of them but introduces 1-2 new sentence-length or voice-drift flags from the rewrite.
- Round 3 exhausts budget with 1-2 PARTIAL flags remaining, each with critic-suggested single-sentence fixes.
- Verdict is REJECTED on critic-loop-exhausted, requiring author override or finalise-round retry.

## Workaround

Apply the round-3 critic-suggested fixes post-round-3 manually. Re-run in finalise to confirm. Document author overrides on rubric checks that consistently mis-fire on the leader register (currently check_6, check_19, check_26 are documented overrides per the SKILL spec).

## Impact Assessment

- **Who is affected**: Tom; every edition of The Shift.
- **Frequency**: every prep run has trended toward round-3 exhaustion in the last 3 editions (Issue 03, Issue 04, Issue 05). Pattern is consistent.
- **Severity**: Medium. REJECTED verdict obscures publish-readiness signal (P039 already captures a related concern about PASS_WITH_AUTHOR_OVERRIDES verdict clarity). Each iteration burns tokens on rounds 2-3 that ultimately get superseded by manual post-round-3 fixes.
- **Analytics**: deferred to investigation.

## Root Cause Analysis

### Hypothesis

The newsletter-critic-rubric checks check_16 (LinkedIn sentence length) and check_35 (voice consistency) were calibrated against draft samples that are shorter and structurally tighter than the leader-register brief shape. The leader brief carries:

1. Longer Item bodies (~600-800 words/item) because the Engineering Leader audience needs the operational consequence unpacked.
2. More abstract noun-phrases ("vendor-services-partner pattern", "compounding-capability story", "capability-acceleration framing") because the substrate is business-decision framing.
3. Cross-section voice drift between the From-Tom opener (first-person, concrete) and Items (third-person, analytical) is structural to the form, not a defect.

Three possible fixes:

a. **Calibrate the rubric**: raise check_16's word threshold from ~25 to ~30 for leader register, OR add a leader-register-specific exception list of common noun-phrases ("services-arm", "capability curve") that don't trip jargon detection.
b. **Add overrides**: add check_16 and check_35 to the accepted_overrides list in `/wr-newsletter` SKILL.md Step 15 alongside check_6/check_19/check_26.
c. **Change the rubric structure**: split the rubric into a leader-register subset and a developer-register subset, with different thresholds.

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems.
- [ ] Compare the 5 most recent editions' critic round-3 PARTIAL flags to see if check_16 and check_35 are the consistent offenders.
- [ ] Decide on fix shape (rubric calibration vs override addition vs rubric split).
- [ ] If option (b), update `/wr-newsletter` SKILL.md Step 15 accepted_overrides list.
- [ ] If option (a) or (c), edit `.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md` and document the calibration rationale.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P039 (PASS_WITH_AUTHOR_OVERRIDES verdict obscures publish signal). Related concern: the REJECTED verdict on critic-loop-exhausted on fixable micro-issues is the same class of clarity-of-signal issue.

## Related

- .claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md (rubric file)
- /wr-newsletter SKILL.md Step 15 (critic invocation + accepted_overrides)
- ADR-016 (sw-critic 3-round loop)
- ADR-025 (PASS_WITH_AUTHOR_OVERRIDES verdict)
- P039 (related signal-clarity concern)
- Captured via /wr-retrospective:run-retro on 2026-05-15 session.
