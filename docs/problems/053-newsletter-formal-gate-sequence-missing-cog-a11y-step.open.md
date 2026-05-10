# Problem 053: /wr-newsletter formal gate sequence missing a cog-a11y step

**Status**: Open
**Reported**: 2026-05-10
**Priority**: 12 (Significant). Impact: Moderate (3) x Likelihood: Likely (4) (re-rated 2026-05-10 per ADR 027: missing cog-a11y step risks Grade 12+ prose reaching readers without inline workaround; pre-publish pipeline disruption L3 Moderate, Likely without the formal step)
**Effort**: M
**WSJF**: (12 x 1.0) / 2 = 6.0

## Description

The `/wr-newsletter` SKILL.md formal gate sequence runs voice (ADR 012), content-risk (ADR 018), SW-critic (ADR 016), and editor (ADR 020) as numbered steps with rounds and 3-cap iteration. Cognitive accessibility (cog-a11y, WCAG 2.2 Reading Level / Plain Language / Unusual Words) is not in that sequence as a numbered step, even though the project's CLAUDE.md and accessibility-first development discipline name `cognitive-accessibility` as a specialist agent for any user-facing prose.

On the 2026-05-08 finalise session, cog-a11y was added inline (out of pipeline) and produced 20 findings (8 critical, 8 medium, 4 advisory). After remediation the brief's reading level dropped from Grade 12+ to Grade 10. The findings were not surfaced by any of the formal gates that ran (voice + content-risk + sw-critic + editor all returned PASS or PASS-with-tighten before cog-a11y ran).

This is an improvement-shape gap: the existing pipeline has the four-gate scaffold, the cog-a11y agent already exists, the discipline is documented at the project level. The missing piece is the numbered SKILL.md step that wires cog-a11y into the prep / finalise phase.

## Symptoms

- 2026-05-08 finalise: cog-a11y produced 20 findings on a brief that had already passed the formal four-gate sequence. Without the inline addition, the brief would have shipped at Grade 12+ reading level.
- Reading level for a leader-audience brief (J1-J4 engineering leader) is a substantive content-risk dimension that the existing content-risk gate does not measure.
- The reflexive "add cog-a11y inline" workaround is fragile: it relies on the assistant remembering to run it, and the timing relative to the four formal gates is undocumented.

## Workaround

Inline invocation of `cognitive-accessibility` agent after editor gate. Manual; not codified.

## Impact Assessment

- **Who is affected**: every `/wr-newsletter` edition. Both leader (The Shift) and developer (Tokens Spent) personas would benefit.
- **Frequency**: weekly.
- **Severity**: Significant. Reading-level drift is a quality issue with direct impact on the LinkedIn newsletter's audience-fit (engineering leaders are time-pressed; Grade 12+ prose loses readers).
- **Analytics**: 2026-05-08 finalise transcript captures the 20 findings + remediation diff; reading-level delta (Grade 12+ to Grade 10) is the recoverable measurement.

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems.
- [ ] Decide gate placement. Default proposal: insert after editor (ADR 020) and before final write at SKILL.md step 15.5 or step 16. The cog-a11y check operates on near-final prose, so placing it after the four substantive gates makes sense; placing it before content-risk would force re-runs of content-risk after remediation.
- [ ] Decide round-cap discipline. The four existing gates have a 3-round cap per ADR 016. Cog-a11y findings tend to be deterministic (Grade level, unusual words, abbreviations); a 1-round pass with optional remediation may be sufficient.
- [ ] Decide finalise vs prep gate. Default: run on prep (so cog-a11y findings drive the prep-state remediation) and re-run on finalise only if the body has changed since prep (per the existing finalise step contract).
- [ ] Reproduction test: after the new step ships, a re-run on the 2026-05-08 brief draft should reproduce the 20 findings without inline workaround.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P008 (critic rubric misses external review findings; cog-a11y catches a class of finding the rubric does not). P017 (rubric expansion; could absorb cog-a11y as additional checks in the structural rubric, alternative shape). P052 (ticket-family completeness; this ticket is in the same friction class as P008 / P017 if "newsletter gate-sequence completeness" becomes a friction class).

## Related

Captured via `/wr-itil:capture-problem`-equivalent direct-write on 2026-05-10 from the 2026-05-08 retro Step 4b Stage 1. Live evidence: cog-a11y inline addition during finalise, 20 findings, Grade 12+ to Grade 10 remediation.
