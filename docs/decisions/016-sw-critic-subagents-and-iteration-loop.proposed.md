---
status: "proposed"
date: 2026-04-17
decision-makers: [Tom Howard, Claude]
consulted: []
informed: []
related: [009-adopt-plugin-marketplace-for-claude-tooling, 011-ai-brief-orchestration-via-claude-code, 012-ai-generated-content-review-gates, 014-wardley-mapping-as-strategic-lens, 015-reader-respect-and-gate-rejection-policy]
reassessment-date: 2026-07-17
---

# Strengths/weaknesses critic subagent and 3-round iteration loop for AI-generated artifacts

## Context and Problem Statement

ADR 012 established voice and content-risk gates for AI-generated content. ADR 015 added a reader-respect axis and a REJECTED verdict. Both gates are single-shot: the artifact either passes or does not, and the reviewer annotates. Neither gate evaluates *analytical quality*: whether the argument holds, whether specificity survives, whether the "so what?" test is answered, whether the piece is pablum dressed in correct voice.

The first-run brief on 2026-04-17 revealed this blind spot. The draft passed voice (PASS). The content-risk review scored reputational=medium but saved the draft. Tom's own read found three distinct quality failures: disparaging framing of the reader (fixed by ADR 015), unsourced pattern claims without citations, and a map-agnostic structure that did not differentiate the brief from any other AI newsletter (addressed by ADR 014). The voice and content-risk gates caught none of the three, because none of them is a voice or reputational-risk failure on its face.

We also need this quality gate to apply to the Wardley artifacts introduced by ADR 014 (`docs/ai-engineering-brief/ai-landscape.owm` and `.md`), not just to outbound newsletter copy. The landscape analysis has its own quality rubric (no inventory, name the phase, triggers measurable, max two decisions, internal risk with number + time window, observable triggers) inherited from the `wr-wardley` skill, and that rubric needs enforcement.

Tom explicitly rejected self-critique on confirmation-bias grounds. The model that produced the artifact cannot be trusted to evaluate it, because the same context that generated the weak passages has already reconciled them as acceptable. The critic must run in a fresh context with only the artifact and the rubric as input.

## Decision Drivers

- **Confirmation bias.** The drafting model is compromised for critique of its own output. Rubric-driven self-check catches vocabulary violations (like ADR 015 reader-respect scans) but cannot catch analytical weaknesses that the drafter already considered and kept.
- **Coverage of analytical quality.** ADR 012 and 015 cover voice and risk. Neither covers "is this actually saying anything?"
- **Iterative improvement.** Many quality weaknesses are fixable. A single-shot PASS/FAIL leaves fixable problems in the shipped artifact. An iteration loop lets the drafter respond to weaknesses while the critic remains the authority on whether they are resolved.
- **Bounded runtime.** Open-ended loops burn tokens and session time. A hard cap prevents runaway; three rounds is typical in practice (the first round catches structural issues, the second catches substitution issues introduced by the first round's fixes, the third converges).
- **Reusability.** The same critic pattern should work for Wardley artifacts, newsletter drafts, and future content surfaces (blog, social, landing pages). One agent with a rubric argument scales; two agents with duplicated logic do not.
- **Verdict consistency.** ADR 015 established `VERDICT: REJECTED` as the save-but-do-not-publish signal. The critic gate should use the same vocabulary so Tom has one signal to scan and retrospectives can compare gate outcomes across artifacts.
- **Project-local scope.** The critic agent and its rubrics are tightly coupled to this project's editorial judgement. ADR 009 kept project-specific tooling out of the marketplace; ADR 011 kept the newsletter skill project-local. Consistency says the critic stays project-local.

## Considered Options

1. **Single parameterised `wr-sw-critic` subagent, project-local, with rubric files as arguments, running a 3-round iteration loop** (chosen). One agent at `.claude/agents/wr-sw-critic.md`. Rubrics live under `.claude/skills/wr-newsletter/assets/`. The skill invokes the critic with the artifact path and the rubric path. Returns STRENGTHS + WEAKNESSES structured block. Skill fixes weaknesses, re-invokes, up to 3 rounds.
2. **Two domain-specific critic subagents** (`wr-wardley-critic`, `wr-newsletter-critic`). Each owns its own rubric inline. Rejected: duplicates the critic logic, makes the third-artifact case (blog, social) require a new agent each time, and couples rubric evolution to agent-file churn.
3. **Inline self-critique step in the skill.** Rejected by Tom on confirmation-bias grounds. Keeping as a considered option solely to document why.
4. **External third-party reviewer service.** Rejected: violates ADR 011's zero-cost-at-margin constraint and ADR 013's no-external-content-sharing implication.
5. **Single-shot critic (no iteration).** Critic flags weaknesses, drafter does not get a chance to fix them, Tom sees the annotated draft. Rejected: leaves fixable problems in the shipped artifact, which is the exact failure mode this ADR is written to prevent.

## Decision Outcome

Chosen option: **"Single parameterised `wr-sw-critic` subagent, project-local, with rubric files as arguments, running a 3-round iteration loop."**

**Agent placement.** `.claude/agents/wr-sw-critic.md`. Naming explicitly scope-agnostic (not `wr-newsletter-critic`) because the pattern applies to any AI-generated prose that has a rubric.

**Rubric placement.** `.claude/skills/wr-newsletter/assets/wardley-critic-rubric.md` and `.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md`. Rubrics co-locate with the skill that owns the artifact type. Future rubrics (blog, social) live adjacent to the skill that drafts them.

**Iteration loop.**
- Round 1: skill passes artifact + rubric to critic. Critic returns STRENGTHS + WEAKNESSES block. If zero weaknesses, emit `VERDICT: PASS` and exit.
- Round 2: skill fixes the weaknesses (textually: it edits the artifact to address each weakness). Passes the revised artifact to critic. Same return contract.
- Round 3: as round 2.
- Round 3 exhaustion: if weaknesses remain after round 3, emit `VERDICT: REJECTED` with `REJECTED_REASON: critic-loop-exhausted` and surface the residual weaknesses verbatim to Tom. This reuses ADR 015's REJECTED semantics (save but do not publish) so Tom sees what the critic could not resolve.

**Relationship to ADR 012 + 015.** The critic gate is additive, not superseding. For the newsletter draft, the gate order is: voice review -> content-risk review -> critic loop. If voice fails or content-risk returns REJECTED, the critic does not run (no point critiquing a draft the earlier gates already rejected). For Wardley artifacts, voice and content-risk still apply per the ADR 015 reader-respect rule; the critic runs after them.

**Verdict discriminators.** The newsletter draft file records:
- `CONTENT_RISK: ... VERDICT: PASS|REJECTED` (from ADR 012/015 gate)
- `CRITIC: rounds=<1..3> VERDICT: PASS|REJECTED REJECTED_REASON: critic-loop-exhausted|n/a` (from this gate)

**Partial-fetch coupling.** Because ADR 014 makes the map downstream of the news fetch, a partial fetch contaminates the map. For the walking skeleton, the SKILL.md failure mode is: if any tier-1 source (Anthropic, OpenAI, DeepMind) fetch fails, do not mutate the map this week. The brief ships against last week's map and notes the skip. This prevents source-coverage bias from accumulating silently. The soft rule (mutate with `MAP_UPDATE_COVERAGE: partial` note) is reserved for when the source list stabilises; reassess after 4 issues.

## Consequences

### Good

- Analytical quality failures (unsourced claims, pablum, map-agnostic structure, missed "so what?") have a gate for the first time.
- Wardley artifacts inherit the same gate pattern as outbound copy, so the substrate stays as disciplined as the product.
- Iteration recovers fixable weaknesses without burning Tom's editorial time.
- The 3-round cap bounds runtime. Retrospectives separate "critic converged" from "critic exhausted" via the REJECTED_REASON discriminator.
- Confirmation bias is structurally mitigated: the critic context is fresh, rubric-driven, and has no access to the drafter's reasoning.
- One agent + many rubrics scales to future content surfaces (blog, social, landing pages) without agent-file proliferation.
- Reuses ADR 015's REJECTED vocabulary so Tom has one shared verdict grammar across gates.

### Neutral

- Adds two to six more subagent invocations per issue (one to three rounds for Wardley artifacts, one to three for the newsletter draft). At weekly cadence this is negligible; reassess if cadence shifts.
- The rubric files need maintenance. They are markdown, human-editable, version-controlled; cost is low but not zero.
- Naming the agent `wr-sw-critic` (not `wr-newsletter-critic`) creates a small discoverability burden: a contributor looking for newsletter tooling in `.claude/agents/` will not find it under an N prefix.

### Bad

- Iteration loops can mask a structural problem: if the critic keeps catching the same class of weakness and the drafter keeps patching it locally, the underlying structural issue hides. The retrospective should watch for repeated weakness-classes across issues and route them to a rubric update or a skill fix rather than absorbing them in the loop.
- Rubric drift: if the critic's rubric evolves without updating the drafter's template and filter, gate divergence is possible (drafter passes filter, critic rejects every time). Rubric changes must land with corresponding template/filter updates or both gate sides must be reviewed as one change set.
- A round-3 REJECTED verdict may be tempting to override rather than rewrite. Retrospective must capture override reasons so the pattern is visible.

## Confirmation

1. `.claude/agents/wr-sw-critic.md` exists with the critic behaviour documented and a clear contract: takes (artifact path, rubric path), returns STRENGTHS + WEAKNESSES structured block with a computed `VERDICT: PASS|REJECTED`.
2. `.claude/skills/wr-newsletter/assets/wardley-critic-rubric.md` and `.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md` exist, each with concrete checks the critic scores against.
3. `.claude/skills/wr-newsletter/SKILL.md` documents the iteration loop: invoke critic, if weaknesses, fix, re-invoke, max 3 rounds, emit verdict with optional `REJECTED_REASON: critic-loop-exhausted`.
4. Critic runs *after* voice and content-risk gates on the newsletter draft; critic runs on the Wardley artifacts after they are updated and before the newsletter draft is produced.
5. Saved draft file includes both the ADR 012/015 gate block and the critic block so Tom has a complete review trail.
6. SKILL.md §Failure modes documents the tier-1-source-fail-means-no-map-mutation rule.
7. After 4 issues, retrospective reviews: how many rounds did the critic typically take? Did round-3 REJECTED occur, and what for? Are there repeated weakness-classes that indicate a rubric or skill change?

## Pros and Cons of the Options

### Single parameterised `wr-sw-critic` with rubric arg + 3-round loop (chosen)

- Good: one agent, many rubrics; reusable for future content surfaces; iteration recovers fixable weaknesses; round-3 REJECTED preserves Tom's inspection loop; agent-file count stays bounded
- Bad: rubric-file maintenance cost; naming discoverability is lower than domain-specific agents

### Two domain-specific critic agents

- Good: agent file is self-explanatory on its domain
- Bad: critic logic duplicated across two agents; third-artifact case requires a third agent; rubric evolution coupled to agent-file churn

### Inline self-critique

- Bad: confirmation bias; model that produced draft cannot evaluate it

### External third-party reviewer service

- Bad: violates zero-cost-at-margin (ADR 011); external content sharing concerns

### Single-shot critic, no iteration

- Good: simplest; no loop to debug
- Bad: leaves fixable weaknesses in the shipped artifact, which is the failure mode this ADR addresses

## Reassessment Criteria

- After 4 issues, review round-count distribution. If every issue consistently converges in round 1, the iteration is over-engineered; consider reverting to single-shot. If every issue hits round 3 exhausted, the rubric is too strict or the drafter cannot respond to the critic's formulation; revise the rubric or the drafter's prompt.
- If the critic agent evolves into something generally useful beyond this project (other WR content surfaces, other projects), consider promoting to a plugin in the WR marketplace (reassessing ADR 009's project-specific boundary).
- If a new content surface is added and a new rubric file is the only change needed, the `wr-sw-critic` design is validated. If the agent also needs changes to handle the new surface, the parameterisation was leaky and the agent needs a redesign.
- If retrospective reveals the critic catching issues the voice and content-risk gates should have caught, reassess whether the three gates are correctly partitioned or whether the gate boundaries need to shift.
- If Tom repeatedly overrides round-3 REJECTED verdicts, the bar is set wrong; recalibrate the rubric or drop the REJECTED threshold.
