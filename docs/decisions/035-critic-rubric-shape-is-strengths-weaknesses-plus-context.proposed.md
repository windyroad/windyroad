---
status: "proposed"
date: 2026-05-31
human-oversight: confirmed
oversight-date: 2026-05-31
decision-makers: [Tom Howard, Claude]
consulted: []
informed: []
amends: [016-sw-critic-subagents-and-iteration-loop, 025-pass-with-author-overrides-verdict-for-sw-critic]
composes-with: 033-domain-specific-critic-agents-supersede-parameterised-sw-critic
related: [012-ai-generated-content-review-gates, 015-reader-respect-and-gate-rejection-policy]
reassessment-date: 2026-08-31
---

# Critic rubric shape is strengths + weaknesses + optional relevant context (no structured numbered-check rubrics)

## Context and Problem Statement

ADR 016 chose a single parameterised `wr-sw-critic` subagent that took a rubric file as input and emitted a STRENGTHS + WEAKNESSES + VERDICT structured block. ADR 033 (proposed) supersedes the parameterised-agent dimension of ADR 016 with domain-specific critic agents (`wr-newsletter-critic`, `wr-wardley-critic`), but inherits the rubric-file input pattern and the structured-check rubric content shape ADR 016 established.

The 2026-05-31 work-problems iter-18 audit found that `.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md` has grown to 38 numbered checks (check_1 through check_38, expanded across the initial newsletter shipment plus P015 + P017 expansions). The structured rubric was never approved as the intended critic shape. User direction verbatim 2026-05-31:

> "I never approved a strength/weaknesses rubric. It's supposed to be a simple 'what are the strengths and weaknesses of the document, maybe with some additional relevant context'. That's it. Nothing more. Cog-a11y, voice and tone and risk are all run separately."

The structured 38-check rubric produced wrong-shaped outcomes in practice:

- `check_16` (LinkedIn sentence length, ~25-word threshold) and `check_34` (consultant-speak density) consistently flagged on leader-register content that was actually fine for the audience.
- Round 3 budget exhausted on fixable micro-issues; verdict went REJECTED on critic-loop-exhausted while the brief was publish-ready by editorial judgement.
- The `accepted_overrides` list (currently 4 entries at the SKILL.md:609 site) grew toward the ADR 025 ceiling of 6, indicating systemic rubric miscalibration rather than per-instance overrides.

The deeper problem: the structured rubric duplicates coverage areas that have their own sibling agents:

- Cog-a11y review runs as a separate gate (SKILL.md step 15.4 invokes the cognitive-accessibility subagent per P053).
- Voice review runs as `wr-voice-tone:agent`.
- Content-risk review runs per ADR 012 plus ADR 015 via `wr-risk-scorer:external-comms`.
- Reader-respect review runs per ADR 015.

The critic's role is analytical quality (does the argument hold; is specificity preserved; is the "so what?" answered; is the piece pablum), NOT a parallel implementation of voice / cog-a11y / risk checks. The 38-check rubric crossed into those coverage areas, producing duplicated work and conflicting verdicts.

## Decision Drivers

- **Coverage partitioning.** Each review gate owns its axis. The critic owns analytical quality only. Duplicating voice / cog-a11y / risk checks in the critic rubric blurs the boundary and produces conflicting verdicts.
- **Editorial judgement, not micro-check accumulation.** Tom's correction signal ("nothing more") frames the critic as an editorial reader who tells you "here's what works, here's what doesn't, here's some context worth noting", NOT a 38-question quality-checklist auditor.
- **Reduced override-mechanism need.** Structured rubric checks accumulate `accepted_overrides` as the rubric mis-fires on register; a simple S/W shape produces editorial judgement that doesn't need overrides because there's no check to override.
- **Drafter-critic contract simplicity.** The drafter responds to "Item 2's Why-it-matters is generic" more directly than to "check_4 PARTIAL on Item 2 paragraph 3". Critic feedback should be editorial-grade prose, not check-IDs.
- **Composition with ADR 033.** Domain-specific agents (`wr-newsletter-critic`) inherit this constraint: their "rubric" file is a brief editorial prompt naming the domain's evaluation axes, not a numbered structured list.

## Considered Options

1. **Simple S/W + optional context output; no structured rubric input** (chosen). The critic's input is the artifact plus a brief editorial prompt naming the domain's evaluation axes (e.g. "analytical quality of an AI engineering newsletter brief"). Output is STRENGTHS (with specific citations), WEAKNESSES (with specific citations and concrete fixes), optional RELEVANT CONTEXT. No numbered checks. No `accepted_overrides` mechanism. Verdict stays PASS / WEAKNESSES_FOUND / PASS_WITH_AUTHOR_OVERRIDES / REJECTED per ADR 025.

2. **Calibrate the 38-check rubric for leader register.** Rejected: addresses symptom (mis-firing checks) not cause (wrong rubric shape). Per user direction the structured rubric itself is the wrong shape.

3. **Split the rubric into per-register subsets.** Rejected: doubles the wrong-shape surface. Same coverage-blurring issue (the per-register rubrics would still implement voice / cog-a11y / risk checks).

4. **Keep ADR 016 / 033 as-is; drop only the `accepted_overrides` mechanism.** Rejected: leaves the structured rubric in place; the mis-fire pattern continues.

5. **Replace the critic with reliance on the sibling gates only** (no analytical-quality gate). Rejected: ADR 016's original problem statement still holds. Voice / risk / cog-a11y / reader-respect gates do not catch unsourced claims, pablum, "so what?" gaps, or map-agnostic structure. Analytical-quality coverage is still wanted.

## Decision Outcome

Chosen option: **Simple S/W + optional context output; no structured rubric input.**

### Critic rubric file shape

`.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md` simplifies to a brief editorial prompt of the following shape:

> Read the artifact. Return:
>
> - **STRENGTHS**: what the piece does well, with specific citations (exact line / paragraph quoted). Drafter does not act on this directly; it is editorial signal for retro.
> - **WEAKNESSES**: what the piece does not do well, with specific citations and concrete actionable fixes. Drafter responds in next round.
> - **RELEVANT CONTEXT** (optional): structural notes, recurring patterns observed across editions, considerations the drafter should weigh for future work.
>
> Nothing else. Numbered checks, scoring rubrics, MET / UNMET / PARTIAL tables, and accepted-override lists are not part of this contract. The critic is an editorial reader who delivers judgement and citations, not a quality-checklist auditor.

Equivalent shape applies to `wardley-critic-rubric.md`, scoped to the Wardley landscape artifact (citations point at map nodes / movement entries; analytical axes are positional clarity, evolution-stage discipline, internal-only-vocabulary discipline).

### Agent prompt shape (composes with ADR 033)

Each domain-specific critic agent (`wr-newsletter-critic`, `wr-wardley-critic` per ADR 033) reads its rubric file (now a brief editorial prompt) and the artifact. Output contract is unchanged from ADR 016: STRENGTHS + WEAKNESSES block plus a VERDICT (PASS / WEAKNESSES_FOUND / PASS_WITH_AUTHOR_OVERRIDES / REJECTED per ADR 025). The 3-round iteration loop preserves per ADR 016.

The `accepted_overrides` mechanism in `.claude/skills/wr-newsletter/SKILL.md:609` retires. With no structured checks, there are no check IDs to override. ADR 025's PASS_WITH_AUTHOR_OVERRIDES verdict stays available for cases where the drafter accepts a critic-flagged weakness as an editorial choice (the verdict semantics are preserved; only the override-list mechanism retires).

### Round-3 REJECTED semantics

Unchanged per ADR 016. If after 3 rounds the critic still surfaces unresolved weaknesses, verdict is REJECTED with `REJECTED_REASON: critic-loop-exhausted`. The simpler rubric is expected to reduce round-3 exhaustion frequency because the critic is no longer mis-firing on register-calibration issues, but the safety valve stays.

### Scope and migration

This ADR amends ADR 016 (rubric input shape) and composes with ADR 033 (domain-specific agent split). Implementation order:

1. This ADR lands as `.proposed.md` with `human-oversight: pending`.
2. After user oversight confirmation, edit `.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md` to the brief-prompt shape above; similarly for `wardley-critic-rubric.md`.
3. Edit `.claude/skills/wr-newsletter/SKILL.md` step 15 to drop `accepted_overrides` list and update the critic-invocation prose.
4. P064 and P071 land their implementations against this amended shape.
5. ADR 016 and ADR 033 stay as-is. This ADR records the additional constraint; it does not re-supersede.

## Consequences

### Good

- Critic feedback is editorial-grade prose the drafter can act on directly, not check-IDs that require rubric look-up.
- Coverage boundaries with voice / cog-a11y / risk / reader-respect gates are clean: critic owns analytical quality only.
- Override-mechanism complexity (ADR 025's `accepted_overrides` list, ceiling reassessment, etc.) shrinks; PASS_WITH_AUTHOR_OVERRIDES verdict semantics stay but list mechanism retires.
- Rubric-file maintenance cost drops: a brief editorial prompt is shorter and changes less often than a 38-check structured rubric.
- Round-3 exhaustion frequency should drop as the critic stops mis-firing on register-calibration issues.

### Neutral

- Critic outputs become judgement-shaped rather than scored. Less mechanical to parse in retrospectives but more directly actionable for the drafter.
- Some rubric-check coverage retires (e.g. check_25 edition-frontmatter mechanical check). Replacement coverage: a sibling pre-publish validator or a dedicated check in the drafter's own assertion logic, not the critic.

### Bad

- Loss of per-check granularity may hide patterns the structured rubric surfaced (e.g. "check_16 fired twice in a row > register-calibration signal"). Mitigation: retro Step 2b pipeline-instability scan + cross-edition critic-output review can recover pattern detection without the structured rubric.
- Subjective shape risks drift toward critic-flavour-of-the-week. Mitigation: the brief editorial prompt is version-controlled; substantive changes go through this ADR's reassessment cycle.
- Tom's prior approval of ADR 016 (structured-rubric pattern, by inheritance via initial wr-sw-critic shipment) is being amended after structural artifacts (40+ accreted rubric checks across multiple expansions) had landed. Migration cost is non-zero.

## Confirmation

This ADR's substance is confirmed once:

1. `human-oversight: confirmed` flips on the frontmatter after user review.
2. `.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md` is simplified to the brief-prompt shape (P064 implementation).
3. `.claude/skills/wr-newsletter/assets/wardley-critic-rubric.md` is similarly simplified.
4. `.claude/skills/wr-newsletter/SKILL.md` step 15 drops the `accepted_overrides` list and updates critic-invocation prose.
5. One full prep + finalise newsletter cycle exercises the simplified critic shape end-to-end and produces a publish-decision verdict matching editorial judgement.
6. P064 and P071 fix strategies are updated to reference this ADR.

Confirmation tracking (updated 2026-06-02):

1. DONE: `human-oversight: confirmed` on the frontmatter since 2026-05-31.
2. DONE: `newsletter-critic-rubric.md` simplified per ADR 035 in 2026-06-01 (work-problems iter 1 of P064).
3. DONE: `wardley-critic-rubric.md` simplified per ADR 035 in 2026-06-01 (same iter as criterion 2).
4. DONE: `.claude/skills/wr-newsletter/SKILL.md` step 15 dropped `accepted_overrides` list in 2026-06-02 (work-problems iter 2 of P071). The migration to `wr-newsletter-critic` invocation per ADR 033 retired the `accepted_overrides:` list-arg from the step-15 prompt; the new agent contract does not accept the list. Critic-invocation prose at steps 9 and 15 updated to call domain-specific agents.
5. PENDING: one full prep + finalise newsletter cycle. Same cycle that closes ADR 033 criterion (d).
6. PARTIAL: P071 fix strategy updated 2026-06-02 (Investigation Tasks ticked through Phase 2). P064 fix strategy update is in scope for a separate iter (still tracked under P064).

Status will flip to `.accepted` after criteria 5 + 6 close.

## Reassessment Criteria

- After 4 editions running the simplified critic, review: did round-3 exhaustion frequency drop? Are the critic's STRENGTHS / WEAKNESSES outputs more directly actionable for the drafter? Did Tom's editorial judgement align with the verdicts more frequently than under the structured rubric?
- If retro Step 2b detects recurring critic-output patterns (e.g. "the simplified critic missed an analytical-quality issue 3 editions in a row"), reassess whether the brief editorial prompt needs sharpening, without reintroducing structured checks.
- If a future content surface (blog, social) is added and the brief-prompt shape doesn't transfer cleanly, the simplification may be over-fit to newsletter; reassess per-surface.
- If the `accepted_overrides` mechanism is missed in practice (drafter consistently wants to override specific critic findings), reconsider whether some override surface is needed, but design it as editorial-judgement override of named weaknesses, NOT as numbered-check exception list.

## Related

- Amends ADR 016 (rubric input shape). ADR 016 stays superseded by ADR 033 (agent split); this ADR adds a constraint on the rubric content shape that ADR 016 originally chose.
- Amends ADR 025 (PASS_WITH_AUTHOR_OVERRIDES verdict for sw-critic). VERDICT semantics preserved (the PASS_WITH_AUTHOR_OVERRIDES verdict value stays available for editorial-judgement overrides of named weaknesses), BUT ADR 025's Confirmation criteria 2 and 3 ("the `/wr-newsletter` skill at steps 9 and 15 passes `accepted_overrides` for the four documented overrides"; "Edition 4's saved review block emits `PASS_WITH_AUTHOR_OVERRIDES` with the override list") can no longer be satisfied as written once the `accepted_overrides` list mechanism retires per this ADR's Decision Outcome. Future ADR-025 readers find this constraint via the amends-graph.
- Composes with ADR 033 (domain-specific critic agents). ADR 033's Phase 2 SKILL.md migration carries this constraint forward (each domain critic's rubric is a brief editorial prompt, not a structured numbered list).
- Related to ADR 012 + ADR 015 (sibling gates: voice, content-risk, reader-respect). Coverage-partitioning the critic establishes clean boundaries with these gates.
- Closes the structured-rubric-shape dimension of P064 (newsletter critic rubric is wrong shape). Composes with P071 (parameterised pattern supersession via ADR 033).
- User direction captured verbatim 2026-05-31 during `/wr-itil:work-problems` orchestrator main turn after iter-18 audit surfaced the recurring pattern (check_16 + check_34 mis-firing on leader register across consecutive editions).
