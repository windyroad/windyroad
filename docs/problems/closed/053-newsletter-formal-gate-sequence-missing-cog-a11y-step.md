# Problem 053: /wr-newsletter formal gate sequence missing a cog-a11y step

**Status**: Closed
**Reported**: 2026-05-10
**Origin**: internal
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
- [x] Decide gate placement. **Decided 2026-05-13**: step 15.4, between editor (15.25) and LinkedIn-draft (15.5), per the default proposal confirmed 2026-05-13. Avoids re-running content-risk after cog-a11y remediation.
- [x] Decide round-cap discipline. **Decided 2026-05-13**: 1-round pass with optional remediation per the default proposal. Verdict shape: PASS / NEEDS_REVISION / NEEDS_REVISION_OPTIONAL. Critical findings or grade level >12 produce NEEDS_REVISION; grade 10-12 or medium findings produce NEEDS_REVISION_OPTIONAL.
- [x] Decide finalise vs prep gate. **Decided 2026-05-13**: phase variant 15.4-prime mirrors the existing 15.25-prime pattern (re-run on finalise only if 11-prime introduced material changes; otherwise carry forward the prep-time block).
- [ ] Reproduction test: after the new step ships, a re-run on the 2026-05-08 brief draft should reproduce the 20 findings without inline workaround. (Awaiting verification on next /wr-newsletter prep+finalise cycle.)

## Fix Released

Released 2026-05-13 on local master (not yet pushed) in the same commit as P014's transition. Three SKILL.md edits land the cog-a11y gate:

1. Step 15.4 inserted between editor (15.25) and LinkedIn-draft (15.5), invoking the `cognitive-accessibility` subagent on the in-progress brief body. Returns reading-grade-level + findings by severity (critical / medium / advisory) + WCAG 2.2 SC findings + verdict (PASS / NEEDS_REVISION / NEEDS_REVISION_OPTIONAL). Critical findings or grade >12 surface NEEDS_REVISION (block-aware: surface in Tom-summary, no auto-rewrite). Optional findings surface in Tom-summary but do not block.
2. Phase variant 15.4-prime mirrors 15.25-prime: re-run on finalise only if 11-prime introduced material changes; otherwise carry forward the prep-time block from `<prep-reviews-path>`.
3. Step 16 save templates updated for both phase=prep and phase=finalise to capture `## Cognitive Accessibility Review` heading. Header summary line at top of SKILL.md updated from "Four review gates" to "Five review gates".

Skip-on-upstream-REJECTED honoured (per the editor gate precedent): if step 15 sw-critic returned `VERDICT: REJECTED`, step 15.4 is skipped and recorded as N/A in the saved review block. `PASS_WITH_AUTHOR_OVERRIDES` does NOT skip.

Awaiting user verification on next `/wr-newsletter` prep+finalise cycle. Expected verification signal: the 2026-05-08 brief draft, re-run against the new step 15.4, reproduces the original 20 findings (8 critical, 8 medium, 4 advisory) without an inline workaround. The 1-round pass surface allows Tom to remediate or override per the editor-gate precedent.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P008 (critic rubric misses external review findings; cog-a11y catches a class of finding the rubric does not). P017 (rubric expansion; could absorb cog-a11y as additional checks in the structural rubric, alternative shape). P052 (ticket-family completeness; this ticket is in the same friction class as P008 / P017 if "newsletter gate-sequence completeness" becomes a friction class).

## Related

Captured via `/wr-itil:capture-problem`-equivalent direct-write on 2026-05-10 from the 2026-05-08 retro Step 4b Stage 1. Live evidence: cog-a11y inline addition during finalise, 20 findings, Grade 12+ to Grade 10 remediation.

**Default proposal confirmed 2026-05-13** (user direction via AskUserQuestion batch-2 answer 2): apply the ticket's default shape (insert after editor at step 15.5 or step 16, 1-round pass with optional remediation, run on prep + re-run on finalise only if body changed) on the next AFK iter or interactive session that picks this ticket. The default is now AFK-progressable without further user input.

## Closed

- **Closed**: 2026-06-28 (verification-queue drain; evidence-based per ADR-022)
- **Evidence**: cog-a11y gate (SKILL step 15.4) present; exercised in editions since 2026-06-01
- **Recovery**: reopen via /wr-itil:transition-problem 053 known-error if a regression surfaces
