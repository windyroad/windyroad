---
status: "proposed"
date: 2026-04-25
human-oversight: confirmed
oversight-date: 2026-05-30
decision-makers: [Tom Howard, Claude]
consulted: []
informed: []
related: [012-ai-generated-content-review-gates, 015-reader-respect-and-gate-rejection-policy, 016-sw-critic-subagents-and-iteration-loop, 017-ai-brief-prep-and-finalise-phases, 018-content-risk-subagent]
reassessment-date: 2026-07-25
---

# Newsletter editor subagent simulates an experienced LinkedIn editor as a fourth review class

## Context and Problem Statement

Problem 008 (`docs/problems/008-critic-rubric-misses-external-review-findings.known-error.md`) records a recurring failure mode: the rubric-based `wr-sw-critic` returns `VERDICT: PASS` while Tom's external editorial review surfaces substantive weaknesses the critic did not catch. The pattern has now repeated across at least two issues (the 2026-04-17 first edition of The Shift and the 2026-04-19 first edition of Tokens Spent), and is captured in the memory entry `feedback_rubric_pass_does_not_mean_newsletter_is_good.md` ("critic PASS is not trustworthy on its own; rubric has structural-vs-substance gap, pattern has recurred twice (P008, P015)"). Two prior options have already shipped:

- **Option 1** (rubric expansion): the newsletter critic rubric grew from 20 to 31 checks across two waves on 2026-04-17 and 2026-04-21, then to 38 checks on 2026-04-24 (P017). Rubric expansion is necessary but not sufficient: structural correctness can be tightly enforced while presentation and editorial-judgement weaknesses still slip through.
- **Option 3** (subagent-ising the content-risk gate): shipped as ADR 018 plus `wr-content-risk-scorer` on 2026-04-22. Closes the inline-self-scoring confirmation-bias gap on the content-risk axis.

Option 2, the editorial-sim subagent, remains. The structural gap that rubric expansion does not close is editorial judgement: would a subscriber open this, read it through, forward it to a peer? Those are calls an experienced LinkedIn newsletter editor makes by feel, looking at preamble density, through-line, item-count proportionality, opener authenticity, and reader-orientation. The current four gates (voice, content-risk, sw-critic, plus the architect/JTBD hooks) do not model that editor's judgement. ADR 016 line 8 explicitly scopes sw-critic to "analytical quality: whether the argument holds, whether specificity survives, whether the 'so what?' test is answered, whether the piece is pablum"; would-open / would-read / would-forward are reader-experience axes that sit outside that scope.

ADR 012 explicitly anticipated additional review gates beyond voice and content-risk if the existing ones failed to catch a class of weakness. ADR 020 documents the fourth gate.

## Decision Drivers

- **Confirmation bias (recurrence).** Inline self-evaluation of editorial quality by the drafter inherits the same confirmation-bias failure mode that drove ADR 016 (sw-critic) and ADR 018 (content-risk). The drafter has already reconciled the weak passages it produced; a fresh-context subagent breaks that bias. P008's two-issue recurrence pattern shows the rubric-only path does not close the gap.
- **Pattern reuse.** ADR 016 established the agent-plus-rubric subagent pattern; ADR 018 reused it for content-risk; ADR 020 reuses it again for editorial review. Reusing the validated pattern keeps the skill coherent and avoids inventing a parallel mechanism.
- **Boundary cleanliness.** sw-critic answers "does the argument hold?". content-risk answers "does the draft expose the brand or the reader?". editor answers "will a subscriber open, read, forward?". Each gate has a non-overlapping axis. ADR 016 line 45 ("the agent-plus-rubric pattern works for any AI-generated prose with a rubric") is preserved; the editor's rubric is reader-experience-axis, distinct from analytical-quality and risk-axis rubrics.
- **Cost.** ADR 016 line 77 accepted "two to six more subagent invocations per issue" as negligible at weekly cadence. ADR 018 added one more. ADR 020 adds one more again. Per-phase tally: 1 voice plus 1 content-risk plus up-to-3 sw-critic plus 1 editor equals up to 6 subagent invocations. Per issue across prep and finalise: up to 12. This still fits ADR 016 line 77's "negligible at weekly cadence" precedent. If the cumulative cost grows materially after a third additional gate is added, the budget should be re-asserted.
- **Behavioural contract preservation.** Like ADR 018, this ADR is additive to ADR 012's category decision (mandatory review gates exist). It refines the *how* of editorial-quality review, which until now had no explicit gate. Voice plus content-risk plus sw-critic plus save logic at SKILL.md step 16 are unchanged in shape; the new step 15.25 slots in between sw-critic and the LinkedIn-post drafting step.
- **Surface-coupling acknowledgement.** The agent name `wr-newsletter-editor` deliberately couples the agent to the newsletter surface. ADR 016 line 45 prefers scope-agnostic naming (`wr-sw-critic`, not `wr-newsletter-critic`), and that argument is correct *when the agent's reasoning is rubric-driven and the rubric is the surface boundary*. Editorial-judgement reasoning is harder to abstract: an experienced LinkedIn newsletter editor's heuristics are different from a blog editor's or a landing-page copywriter's. The agent file embeds LinkedIn-newsletter-specific reading-time, scannability, and forward-worthiness assumptions; if the next surface is materially different, the right move is a parallel `wr-blog-editor` agent, not a parameterised generalist. ADR 020 names this trade-off explicitly so a future redesign trigger (per ADR 016 line 126 reassessment 3) can evaluate it.

## Considered Options

1. **Build a fresh-context `wr-newsletter-editor` project-local subagent that simulates an experienced LinkedIn newsletter editor** (chosen). New rubric-free agent with prose process at `.claude/agents/wr-newsletter-editor.md`. Inputs: artifact_path plus persona plus edition_number. Reads the draft and the persona's JTBD files (`docs/jtbd/<persona>/persona.md` plus must-have job files) and emits an `EDITOR_REVIEW:` block with would-open / would-read / would-forward calls plus passage-level fix suggestions. Single-shot, no iteration loop. Runs after sw-critic PASS, before LinkedIn-post drafting.
2. **Extend the `wr-sw-critic` rubric with editorial-judgement checks (32-onwards).** Rejected: the rubric-based critic's job is analytical-quality scoring, not reader-experience simulation. Rolling the would-open / would-read / would-forward calls into the same rubric collapses two distinct axes into one and re-introduces the structural-vs-substance gap P008 identified. The rubric expansion path has already been tried (checks 21-31 in 2026-04-17 and 2026-04-21 waves; 32-38 added 2026-04-24 per P017) and the gap recurred. Doing more of the same is not the fix.
3. **Inline self-evaluation of editorial quality by the drafter.** Rejected on confirmation-bias grounds, same argument that drove ADR 016 and ADR 018. The drafter has already reconciled the editorial weaknesses it produced; inline scoring will not catch them.
4. **Iterating editor (multi-round loop, like sw-critic).** Rejected: editorial-judgement weaknesses are presentation-shape problems (preamble too long, items disproportionate, opener inauthentic). They are harder to fix mechanically than analytical weaknesses, which means the drafter's round-2 attempt is likely to over-correct or substitute one editorial weakness for another, not to address the original. Single-shot matches ADR 018's content-risk gate semantics: surface to Tom, do not auto-rewrite. If retrospective evidence shows iteration would help, a follow-up ADR can lift the loop.
5. **Tom-as-editor only (no automated gate; rely on the manual external review that triggered P008).** Rejected: the manual external review is the workaround that P008 was opened to replace. A weekly newsletter cadence cannot depend on Tom being available to do a structured editorial pass every Friday; the gate exists to catch what Tom would have caught.

## Decision Outcome

Chosen option: **"Build a fresh-context `wr-newsletter-editor` project-local subagent that simulates an experienced LinkedIn newsletter editor."**

**Agent placement.** `.claude/agents/wr-newsletter-editor.md`. Project-local per ADR 011's project-local-tooling boundary and ADR 016's same-shaped placement. The `wr-newsletter-` prefix deliberately couples the agent to the newsletter surface; see Decision Drivers final point.

**No standalone rubric file.** Unlike ADR 016 (which has `newsletter-critic-rubric.md` and `wardley-critic-rubric.md`) and ADR 018 (which has `content-risk-rubric.md`), the editor agent's reasoning is not check-list-shaped. It is a structured-prose process: read the persona's JTBD context, read the draft, simulate the reader, score three reader-experience axes. The agent file embeds the process inline. If the process grows beyond three pages or proves too unstable to keep inline, a future revision can extract an `editor-review-rubric.md` asset; the cost of doing it now (before the agent has run a single live invocation) is premature abstraction.

**Persona grounding.** The agent reads `docs/jtbd/<persona>/persona.md` plus the must-have job files for that persona before scoring (developer: JTBD-200, JTBD-201, JTBD-203, JTBD-204; leader: JTBD-001, JTBD-002, JTBD-003). The JTBD review (2026-04-25) confirmed these jobs articulate the reader-experience constraints (read-time budget, hype-allergy, share-worthy ammunition, awareness shift, ammunition for board) the editor must simulate. The agent prompt enumerates the persona-to-job mapping so the agent does not have to guess.

**Invocation site.** SKILL.md step 15.25 (full and prep phases) and step 15.25-prime (finalise phase). Both call the agent with the in-progress draft path as `artifact_path`, the resolved persona as `persona`, and the resolved edition number as `edition_number`. The editor runs *only when* sw-critic returns `VERDICT: PASS`. If sw-critic returns `VERDICT: REJECTED` (round-3 exhausted), step 15.25 is skipped (mirror of step 14 to step 15 skip semantics); reviewing reader-experience on an analytically-weak draft is not useful.

**Scope: brief body only, not the LinkedIn post.** The editor agent reviews the brief body produced by step 11 / 11-prime, not the LinkedIn teaser drafted at step 15.5. Rationale: would-open / would-read / would-forward on the brief body is the primary subscriber-experience question; the LinkedIn teaser is a one-screen funnel into the brief and is already covered by the voice gate at step 15.5 plus the sw-critic check on the brief that the teaser is sourced from. If retrospective evidence shows would-read failures specific to the LinkedIn teaser (separate from voice failures), a follow-up ADR can either extend ADR 020 to a second invocation site or carve out a `wr-linkedin-teaser-editor` agent. ADR 020 names this scope decision explicitly so the absence of teaser coverage is a known trade-off, not an oversight.

**Output contract.** Pinned by this ADR's confirmation criterion 1 below. The agent emits exactly:

```
EDITOR_REVIEW
artifact: <artifact_path>
persona: <leader|developer>
edition: <N>

WOULD_OPEN: <yes|no|tentative>
Reason: <one sentence grounded in persona/JTBD>

WOULD_READ_THROUGH: <yes|no|tentative>
Reason: <one sentence grounded in persona/JTBD>

WOULD_FORWARD: <yes|no|tentative>
Reason: <one sentence grounded in persona/JTBD>

EDITORIAL_FINDINGS
- axis: <preamble-density|through-line|item-count-proportionality|opener-authenticity|reader-orientation|other>
  Passage: "<quoted passage, or 'N/A' if structural>"
  Issue: <what specifically reads as off>
  Suggested fix: <concrete direction for the drafter, not a rewrite>
- axis: ...

EDITOR_VERDICT: <PASS|NEEDS_EDITORIAL_REVISION>
END_EDITOR_REVIEW
```

The verdict is mechanical: any `WOULD_OPEN`, `WOULD_READ_THROUGH`, or `WOULD_FORWARD` returning `no` yields `NEEDS_EDITORIAL_REVISION`. Any `tentative` flagged with at least one EDITORIAL_FINDINGS entry yields `NEEDS_EDITORIAL_REVISION`. Three `yes` with no findings is `PASS`. The skill consumes `EDITOR_VERDICT:` to decide whether to surface the editor block prominently in the Tom-summary; like content-risk, the editor does not auto-rewrite. Tom decides whether to revise or override.

**Boundary preservation.** The agent file's "Relationship to other gates" section explicitly draws the line:

- voice = author-voice authenticity, em-dashes, hype words.
- content-risk = factual, reputational, claims, attribution, reader-respect.
- sw-critic = does the argument hold? specificity survives? "so what?" answered? piece is not pablum?
- editor = would the subscriber open this in their LinkedIn feed, read it through given their time budget, forward it to a peer with a paste-able takeaway?

Item-count proportionality is editor territory only because it is a presentation/reader-load axis, not an argument-quality axis. The boundary is sharp enough that a future rubric author cannot smuggle would-read judgements into the newsletter-critic-rubric or vice versa. If retrospective shows the editor and sw-critic are flagging the same axes, the boundary has collapsed and one of the two should absorb the other (see Reassessment Criteria).

**Additive, not superseding.** ADR 012 still holds: voice and content-risk gates are mandatory. ADR 015 still holds: REJECTED is save-but-do-not-publish. ADR 016 still holds: sw-critic loops up to 3 rounds. ADR 018 still holds: content-risk runs as a fresh-context subagent. ADR 020 adds a fourth review class without changing the prior three.

## Consequences

### Good

- The editorial-quality gap P008 surfaced (and that recurred at P015 per the memory `feedback_rubric_pass_does_not_mean_newsletter_is_good.md`) gets a structural fix, not a rubric-expansion-only fix. Rubric expansion will continue to enforce structural correctness; the editor catches what structural correctness misses.
- A third validation of the ADR 016 pattern: subagent plus persona-grounded process plus fixed output block plus skill-orchestrated invocation. The pattern is now used by three distinct gates (sw-critic, content-risk, editor), strengthening the reusability claim.
- The persona JTBD files become first-class inputs to the review pipeline. Before ADR 020, the JTBD docs informed the rubrics indirectly; now the editor reads them on every run, which means JTBD changes propagate to the gate without rubric-file edits.
- Tom's external editorial review becomes a fall-back, not the workaround the gate replaces. P008's stated workaround ("external review by Tom") is closed by the gate.

### Neutral

- Adds one subagent invocation per phase per issue: up to two more per week (prep plus finalise). Under ADR 016 line 77's precedent the cost is accepted; the per-phase invocation tally rises from 5 to 6 (1 voice plus 1 content-risk plus up-to-3 sw-critic plus 1 editor) and the per-issue tally rises from 10 to 12 across both phases.
- The agent file needs maintenance, like ADR 016's rubric files and ADR 018's rubric file. Cost is low but not zero.
- A re-score pass on a prior week's draft is deferred to the next live `/wr-newsletter` run; validation happens in production rather than against a stored fixture. ADR 018 made the same trade-off; the same risk applies (if the editor's verdict drifts from Tom's expectation by more than one axis on the first live run, the agent prompt needs tightening).

### Bad

- **Surface-coupling.** The agent name `wr-newsletter-editor` ties the agent to the newsletter surface. If a second content surface (blog post, social copy, landing page) needs editorial review, the right move is a parallel agent (`wr-blog-editor`), not a parameterised generalist. This is a deliberate trade-off (see Decision Drivers final point); it costs duplication if multiple surfaces emerge but preserves reasoning quality on each surface. Reassessment criterion 3 below picks this up if it becomes wrong.
- **Output contract brittleness.** The `EDITOR_REVIEW:` block format is pinned by this ADR (confirmation criterion 1). Format changes require superseding ADR 020. Downstream consumers (SKILL.md step 16 save logic, future retrospective parsing) depend on byte-stable output. ADR 015 and ADR 018 carry the same brittleness; the trade-off is accepted as the cost of mechanical parsing.
- **Gate fatigue.** Four review gates per phase is a lot of orchestration. If the editor consistently passes when sw-critic passes, the gate is not adding signal and should be retired (reassessment criterion 1). If sw-critic and editor consistently flag the same axis, the boundary has collapsed (reassessment criterion 2). The risk is that adding gates becomes a default response to recurrence-of-quality-issues; the alternative the team should revisit if a fifth gate is ever proposed is whether the existing gates need tightening rather than a new gate.
- **LinkedIn-teaser scope gap.** The editor reviews the brief body, not the LinkedIn teaser. P013 added a voice gate on the teaser at SKILL step 15.5 because the teaser is its own surface; the editor inherits the same surface-coupling argument and is silent on the teaser by ADR 020 design. If retrospective shows would-read failures on teasers that the brief-body gate does not predict, ADR 020 needs revisiting.

## Confirmation

1. **Output format pinned.** `.claude/agents/wr-newsletter-editor.md` documents the `EDITOR_REVIEW:` block format above verbatim. The block must include `WOULD_OPEN`, `WOULD_READ_THROUGH`, `WOULD_FORWARD` (each `yes|no|tentative`), an `EDITORIAL_FINDINGS` list, and `EDITOR_VERDICT: <PASS|NEEDS_EDITORIAL_REVISION>`. Format changes require superseding ADR 020. Downstream consumers (SKILL.md step 16 save logic) depend on byte-stable output.
2. **Agent contract documented.** `.claude/agents/wr-newsletter-editor.md` exists and documents: takes `artifact_path` plus `persona` plus `edition_number`, reads `docs/jtbd/<persona>/persona.md` plus the must-have job files for that persona, runs in fresh context, no rewrites, mechanical verdict (any `no` or any `tentative` with findings yields `NEEDS_EDITORIAL_REVISION`).
3. **Skip-on-upstream-REJECTED rule documented.** The agent file states that if the artifact already contains a sw-critic `VERDICT: REJECTED` block, the editor returns `EDITOR_ERROR: upstream gate returned REJECTED; editor will not run` and stops. The skill should not invoke the editor in that case; this is a defence-in-depth check.
4. **SKILL.md step 9 (intro paragraph) updated.** The line "Three review gates run on the outputs: voice (ADR 012), content-risk (ADR 012 + ADR 015), and SW-critic (ADR 016)" becomes "Four review gates run on the outputs: voice (ADR 012), content-risk (ADR 012 + ADR 015 + ADR 018), SW-critic (ADR 016), and editor (ADR 020)."
5. **SKILL.md reference list (line 14) updated.** The ADR list adds `020-newsletter-editor-subagent.proposed.md`.
6. **SKILL.md step 15.25 added.** New step `15.25. Editor review gate (ADR 020)` between step 15 (sw-critic loop) and step 15.5 (LinkedIn post). Invokes `wr-newsletter-editor` with the in-progress draft, persona, and edition. Documents the skip-on-sw-critic-REJECTED rule. Documents that on `EDITOR_VERDICT: NEEDS_EDITORIAL_REVISION` the draft is saved with the block, the verdict surfaces in the Tom-summary, and the LinkedIn post still drafts (step 15.5) so Tom has both surfaces in the saved file.
7. **SKILL.md step 15.25-prime added.** Phase variant for `phase=finalise`: same agent, finalise-time draft body. Documents that prep-time PASS does not exempt finalise.
8. **SKILL.md step 16 prep save-block updated.** Adds `## Editor Review` section after `## Critic Review: Newsletter`.
9. **SKILL.md step 16 finalise save-block updated.** Adds `## Editor Review (finalise)` and `## Editor Review (prep)` sections mirroring the per-phase pattern of voice / content-risk / critic blocks.
10. **SKILL.md step 16 full save-block updated.** Adds a single `## Editor Review` section in the body listing.
11. **SKILL.md step 17 (Tom summary) updated.** Adds `Editor verdict (per phase if finalise). If NEEDS_EDITORIAL_REVISION, lead with the failing axes and suggested fixes.`
12. **First live-run validation.** On the next `/wr-newsletter` run, the editor's verdict is captured in the saved draft. If the verdict diverges from Tom's reading of the draft by more than one of the three axes, the agent prompt is tightened; this triggers Problem 008 verification.

## Reassessment Criteria

- **After 4 issues**, if every edition scores `WOULD_OPEN: yes`, `WOULD_READ_THROUGH: yes`, `WOULD_FORWARD: yes` with no editorial findings, the gate is too lenient or has been internalised by the drafter; tighten the persona-grounding prompt or retire the gate. The whole point of the gate is to catch what rubric expansion does not; a uniformly-passing gate is not catching anything.
- **If sw-critic and editor consistently flag the same axes** (for example, sw-critic UNMET on a "so what?" check while editor `WOULD_READ_THROUGH: no` for the same passage), the boundary between analytical and editorial review has collapsed. One of the two should absorb the other. Re-read this ADR alongside ADR 016 when the next retrospective surfaces such a case.
- **If a third content surface (blog, social, landing page) needs editorial review**, the surface-coupling decision documented in this ADR triggers a reassessment per ADR 016 line 126 reassessment 3. Default action: parallel `wr-blog-editor` agent; only generalise if the persona-grounding logic abstracts cleanly across surfaces.
- **If Tom repeatedly overrides `EDITOR_VERDICT: NEEDS_EDITORIAL_REVISION`** without rewriting (publishes the draft as-is despite the verdict), the persona grounding or the verdict mechanic is mis-calibrated. Recalibrate the prompt or relax the "any `no` or any `tentative` with findings yields `NEEDS_EDITORIAL_REVISION`" rule.
- **If the editor consistently catches axes that retrospective shows the LinkedIn teaser also exhibits** (and the brief-body gate did not predict), the LinkedIn-teaser scope gap (Bad consequence 4) needs revisiting; a follow-up ADR may extend ADR 020 to a second invocation site or carve out a teaser-specific agent.
- **If cumulative subagent cost** (voice plus content-risk plus sw-critic loop plus editor plus any future gates) crosses 15 invocations per issue at weekly cadence, the ADR 016 line 77 cost precedent is no longer obviously fitting. The team should explicitly re-assert the budget or trim a gate.
