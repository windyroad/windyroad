# Problem 064: Newsletter critic uses a 38-check structured rubric that was never approved; simplify back to strengths/weaknesses + context

**Status**: Known Error (root cause confirmed via ADR-035; implementation landed 2026-06-02; awaiting one full prep+finalise newsletter cycle to verify per ADR-035 Confirmation criterion 5)
**Reported**: 2026-05-15
**Origin**: internal
**Priority**: 16 (High). Impact: Significant (4) x Likelihood: Likely (4) (re-rated 2026-05-31; the structured rubric is actively producing wrong-shaped REJECTED verdicts on briefs the reader-facing critic should pass; affects every edition)
**Effort**: M
**WSJF**: 12 = (16 x 1) / 2 (re-rated 2026-05-31 from 6.0 = (12 x 1) / 2; user direction on critic shape elevates priority)
**Type**: technical

## Description

The newsletter critic (`wr-sw-critic` agent invoked via `/wr-newsletter` SKILL.md step 15) currently runs against `.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md`, a 38-check structured rubric (check_1 through check_38). The rubric was never approved as the intended critic shape. Per user direction 2026-05-31:

> "I never approved a strength/weaknesses rubric. It's supposed to be a simple 'what are the strengths and weaknesses of the document, maybe with some additional relevant context'. That's it. Nothing more. Cog-a11y, voice and tone and risk are all run separately."

The wr-sw-critic agent's own description matches that simpler shape ("Strengths/weaknesses critic for AI-generated artifacts. Reads the artifact and a rubric, returns a structured STRENGTHS + WEAKNESSES block"), but the parameterised rubric-path input pattern (ADR-016) lets the rubric grow into the 38-check structured shape that produces the wrong-shape REJECTED verdicts the original symptoms describe.

This ticket was originally framed (2026-05-15) as "round-3 budget exhausted on fixable micro-issues; rubric checks need leader-register calibration." That framing accepts the 38-check rubric as the correct shape and tries to calibrate within it. Per the user direction above, the rubric structure itself is the problem; calibration is a wrong-shape fix.

## Symptoms

- Critic returns WEAKNESSES_FOUND round 1 with 5+ PARTIAL flags against rubric checks.
- Round 2 fixes 3-4 of them but introduces 1-2 new sentence-length or voice-drift flags from the rewrite.
- Round 3 exhausts budget with 1-2 PARTIAL flags remaining, each with critic-suggested single-sentence fixes.
- Verdict is REJECTED on critic-loop-exhausted, requiring author override or finalise-round retry.

Iter 18 audit evidence (uncommitted, discarded per 2026-05-31 user direction) is informative about WHY the structured rubric is wrong-shaped: cross-edition check-flag review across 4 reviews.md (2026-05-01, 2026-05-08, 2026-05-15, 2026-05-25) found that check_16 (LinkedIn sentence length ~25-word threshold) and check_34 (consultant-speak density) are the consistent recurring offenders, both flagging on leader-register content that is actually fine for the audience. The structured rubric mis-fires systematically on the register the brief is written for. This is structural evidence the rubric needs simplification, not calibration.

## Workaround

Apply round-3 critic-suggested fixes post-round-3 manually; re-run in finalise to confirm. Document author overrides on rubric checks that consistently mis-fire (currently check_6, check_19, check_23, check_26 in accepted_overrides list at .claude/skills/wr-newsletter/SKILL.md:609 = 4 entries; ADR-025 ceiling is 6).

## Impact Assessment

- **Who is affected**: Tom; every edition of The Shift.
- **Frequency**: every prep run has trended toward round-3 exhaustion in the last 3-4 editions (Issue 03, Issue 04, Issue 05, Issue 06). Pattern is consistent.
- **Severity**: Significant. REJECTED verdict on the structured rubric obscures publish-readiness signal AND consumes drafter cycles on rewrites that ultimately get superseded by manual post-round-3 fixes. Per user direction 2026-05-31, the deeper severity is that the structured rubric is itself the wrong shape; calibration would be polishing the wrong artefact.
- **Analytics**: deferred to investigation.

## Root Cause Analysis

### Hypothesis (revised 2026-05-31)

The structured 38-check rubric (`.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md`) landed in commit 30ea2a9 (initial newsletter shipment) and grew via P015 (commit 26a089c, checks 26-31) and P017 (commit f394f64, 7 substance checks). The rubric structure was not approved as the intended critic shape; it accreted as feature work without explicit human-oversight confirmation.

Per user direction 2026-05-31, the intended critic shape is:

> "What are the strengths and weaknesses of the document, maybe with some additional relevant context. That's it. Nothing more."

The cog-a11y (P053-shipped SKILL step 15.4 invokes cognitive-accessibility subagent), voice-and-tone (wr-voice-tone:agent), and content-risk (ADR-012, ADR-015 wr-risk-scorer:external-comms) reviews ARE already separate sibling gates in the SKILL.md pipeline. The sw-critic should not be replicating their coverage areas via numbered rubric checks.

### Fix Strategy (revised 2026-05-31)

Simplify `.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md` to a single brief instruction:

> Read the artifact. Return STRENGTHS (what the piece does well, with specific citations) and WEAKNESSES (what the piece does not do well, with specific citations and concrete fixes). Optionally include RELEVANT CONTEXT (e.g. recurring patterns observed across editions, structural notes the drafter should consider for future work). Nothing else.

Drop the 38 numbered checks. Drop the accepted_overrides allowlist mechanism (it exists to override structured rubric checks; with no structured checks, no overrides needed). Update `.claude/skills/wr-newsletter/SKILL.md` step 15 invocation prose to match the simplified rubric shape.

This composes with P071 (supersede ADR-016 parameterised sw-critic pattern with domain-specific critic). P071's scope is the parameterised pattern itself; this ticket is the specific newsletter-critic instance. Implementation order: amend ADR-016 first (records the simplification decision), then simplify the newsletter rubric, then re-evaluate whether the parameterised pattern needs full supersession per P071 or can stay with the simpler shape.

### Investigation Tasks

- [x] Compare the 5 most recent editions' critic round-3 PARTIAL flags to see which checks are the consistent offenders. (Done 2026-05-31 iter 18 audit; check_16 + check_34 confirmed recurring across 2026-05-15 and 2026-05-25 editions.)
- [x] Confirm critic shape with user. (Done 2026-05-31: simplify to S/W + optional context.)
- [x] Draft ADR-016 amendment scoping sw-critic agent to S/W + context output; reject structured-rubric input pattern. (Landed as ADR-035, status proposed with human-oversight confirmed 2026-05-31; amends ADR-016 + ADR-025, composes with ADR-033.)
- [x] Simplify .claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md to the brief instruction shape above. (Done 2026-06-02; 38-check structured rubric replaced with brief editorial prompt asking for STRENGTHS + WEAKNESSES + optional RELEVANT CONTEXT, with explicit coverage-partitioning notes for sibling gates.)
- [x] Simplify .claude/skills/wr-newsletter/assets/wardley-critic-rubric.md similarly. (Done 2026-06-02; 18-check structured rubric replaced with brief editorial prompt scoped to wardley analytical quality.)
- [x] Update .claude/skills/wr-newsletter/SKILL.md step 15 invocation prose to drop accepted_overrides mechanism. (Done 2026-06-02; accepted_overrides parameter removed from steps 9 and 15 invocations; rationale prose around check_6/19/23/26 removed; PASS_WITH_AUTHOR_OVERRIDES verdict semantics preserved per ADR-035 as editorial-judgement override of named weaknesses.)
- [x] Update SKILL.md and draft-template.md references to specific check_N IDs (check_9, check_14, check_25, check_32) to describe the editorial-quality concern without naming the now-removed structured-check ID. (Done 2026-06-02.)
- [ ] Run the simplified critic against one full prep + finalise newsletter cycle as the ADR-035 Confirmation criterion 5 smoke test; confirm STRENGTHS + WEAKNESSES + CONTEXT shape outputs and that round-3 exhaustion frequency drops relative to the structured-rubric baseline. Defer to next finalise cycle per architect review 2026-06-02 (non-deterministic critic output adds commit-risk to the otherwise-mechanical implementation iter).
- [ ] Coordinate with P071 (parameterised sw-critic supersession via ADR-033) for cross-ticket implementation order. P071's ADR-033 Phase 2 SKILL.md call-site migration will inherit the simplified rubric shape established here; no blocking dependency.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: ADR-016 amendment (this ticket's first investigation task) per ADR-074 substance-confirm-before-build guard.
- **Composes with**: P071 (supersede ADR-016 parameterised sw-critic pattern with domain-specific critic). The parameterised pattern is the surface; this ticket is the newsletter-critic instance. P039 (PASS_WITH_AUTHOR_OVERRIDES verdict obscures publish signal) is related and may be auto-resolved if the accepted_overrides mechanism is dropped per Fix Strategy.

## Related

- .claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md (38-check rubric file to be simplified)
- .claude/agents/wr-sw-critic.md (parameterised sw-critic agent; the agent description already matches the simpler shape)
- /wr-newsletter SKILL.md step 15 (critic invocation, accepted_overrides list)
- ADR-016 (sw-critic 3-round loop; to be amended)
- ADR-025 (PASS_WITH_AUTHOR_OVERRIDES verdict; may be retired with accepted_overrides mechanism)
- P071 (supersede ADR-016 parameterised sw-critic pattern; composes)
- P039 (PASS_WITH_AUTHOR_OVERRIDES verdict obscures publish signal; may be auto-resolved by simplification)
- P015, P017 (rubric expansion history)
- Captured via /wr-retrospective:run-retro on 2026-05-15 session; reframed via /wr-itil:work-problems orchestrator main turn 2026-05-31 per user direction.
