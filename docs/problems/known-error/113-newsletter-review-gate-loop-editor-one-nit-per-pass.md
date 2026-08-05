# Problem 113: wr-newsletter review-gate loop runs many rounds; editor surfaces one rhythm nit per pass and section 15.6 re-runs all gates per edit

**Status**: Known Error
**Reported**: 2026-07-13
**Priority**: 8 (Medium), Impact: 2 x Likelihood: 4, derived at capture from the description
**Origin**: internal
**Effort**: M, derived at capture
**WSJF**: 8.0 = (8 x 2.0) / 2

## Description

The /wr-newsletter review-gate loop (steps 13 to 15.5, re-run per the section 15.6 dirty-body discipline) ran about 15 rounds for Issue 13 across prep, finalise, and three external-review passes. Two compounding causes:

1. The `wr-newsletter-editor` agent surfaces only ONE sentence-rhythm nit per pass rather than batching all of them, so each fix-and-re-gate exposes the next-longest sentence, producing a treadmill. Observed about 8 consecutive `EDITOR_VERDICT: NEEDS_EDITORIAL_REVISION` verdicts across the session, each naming a different single long sentence (the GLM sentence, the "two things" signpost, the China-timing sentence, the Bank of England sentence, the Apple "actual parts" sentence, and so on).
2. Section 15.6 mandates a full-gate re-run on every body edit, so each one-line fix re-runs all five gates (voice, content-risk, critic, editor, cog-a11y). Combined with cause 1, a single readability nit costs a full five-gate cycle.

`EDITOR_VERDICT: NEEDS_EDITORIAL_REVISION` is non-blocking per the pipeline (it surfaces to Tom; it does not block the save), but the skill gives no guidance on when to accept residual non-blocking rhythm advisories and stop, so the drafter chases them round after round.

Candidate fix strategies (see Fix Strategy below): (a) have `wr-newsletter-editor` return ALL sentence-rhythm and EDITORIAL_CRAFT findings in one pass rather than one-per-verdict; and/or (b) add skill guidance (a stop rule) so that after N editor rounds yielding only diminishing non-blocking rhythm advisories, the drafter may accept and proceed to save, recording the residual advisories in the reviews file.

Evidence: Issue 13 prep plus finalise session 2026-07-13; the wr-newsletter-editor agent runs across both gate loops.

## Symptoms

(deferred to investigation)

## Workaround

Accept the editor's NEEDS_EDITORIAL_REVISION as non-blocking after the critic and other gates are green, and record residual rhythm advisories in the `.reviews.md` rather than re-editing (as done at the end of the Issue 13 loop).

## Impact Assessment

- **Who is affected**: the newsletter drafter (main agent) each week; token and time cost per edition with substantive edits.
- **Frequency**: most editions that take any post-first-pass edits (weekly cadence).
- **Severity**: token and wall-clock cost; no wrong output produced (the loop converges).
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Confirm whether wr-newsletter-editor can be prompted or re-specced to batch all EDITORIAL_CRAFT and sentence-rhythm findings per pass.
- [ ] Draft a section 15.6 stop-rule for non-blocking editor and cog-a11y advisories once critic, voice, and content-risk are terminal-green.
- [ ] Create a reproduction or regression note.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P114 (LinkedIn sign-off skill/guide drift, sibling wr-newsletter pipeline improvement)

## Related

Captured via /wr-itil:capture-problem during the Issue 13 finalise retro (2026-07-13). Expand at next investigation.

**2026-08-05: both Fix Strategy items landed via ADR-043, co-designed with P120.** P120 (Editor and skeptic gates surface findings to Tom instead of remediating them) is the opposite bound on this same knob: it wanted a START rule because gate findings were never acted on, while this ticket wants a STOP rule because the editor treadmills. The two were designed as one loop contract, per P120's second Investigation Task, because tightening either alone would fight the other. ADR-043 (Bounded editorial remediation loop for editor and skeptic gates) carries both bounds:

- **Fix item (a), editor batching, is shipped.** `.claude/agents/wr-newsletter-editor.md` `## Hard rules` now carries "Return ALL findings on every axis in a single pass; never surface one nit at a time", naming this ticket's ~8-consecutive-single-nit evidence as the rationale. It is load-bearing for ADR-043's one-round cap: anything the editor holds back is not remediated at all, it becomes a residual advisory that lands on Tom.
- **Fix item (b), the stop rule, is shipped as the loop's cap plus its residual-advisory exit.** SKILL.md step 15.37 caps remediation at ONE round. Findings still standing after that round are recorded as accepted residual advisories in the `.reviews.md` sibling and surfaced in the Tom-summary, which is exactly the "accept residual non-blocking advisories and proceed to save" guidance this ticket asked for, now written down rather than left to the drafter's judgement.
- **Cause 2, the section 15.6 per-edit full-gate cost, is bounded.** ADR-043 condition (a) fires the full gate set ONCE at loop exit rather than per remediation round; inner rounds re-invoke only the editor and the skeptic. Conditions (b) and (c) keep P099 closed: a loop-exit-forced edit re-marks the body dirty as normal, and the remediation counter does not reset, so that edit gets one more editor and skeptic look and anything remaining becomes a residual advisory rather than another round.

This ticket is NOT transitioned on the back of that work. The fix is authored but unexercised: no edition has run through the loop yet, and this ticket's own symptom (a treadmill measured in rounds per edition) can only be verified against a live `/wr-newsletter` run. Re-rate and transition after the next edition, using the `## Editorial Remediation Loop` block in that edition's `.reviews.md` as the evidence: rounds spent should be at most 1 per body pass, and the editor's findings should arrive batched rather than one per verdict.

## Fix Strategy

- **Kind**: improve
- **Shape**: agent plus skill
- **Target file**: `.claude/agents/wr-newsletter-editor.md` (batch all sentence-rhythm and EDITORIAL_CRAFT findings per pass) and `.claude/skills/wr-newsletter/SKILL.md` section 15.6 (add a stop-rule for diminishing non-blocking advisories).
- **Observed flaw**: editor returns one rhythm nit per pass; skill has no stop-rule for non-blocking advisory churn.
- **Edit summary**: (a) editor agent prompt returns the full set of rhythm findings; (b) section 15.6 gains an explicit clause to accept non-blocking editor and cog-a11y advisories once critic, voice, and content-risk are terminal-green after N rounds.
- **Evidence**: about 8 consecutive single-nit editor verdicts in the Issue 13 session 2026-07-13.
