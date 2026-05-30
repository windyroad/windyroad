---
status: "proposed"
date: 2026-04-25
human-oversight: confirmed
oversight-date: 2026-05-30
decision-makers: [Tom Howard, Claude]
consulted: []
informed: []
related: [012-ai-generated-content-review-gates, 015-reader-respect-and-gate-rejection-policy, 016-sw-critic-subagents-and-iteration-loop, 017-ai-brief-prep-and-finalise-phases]
reassessment-date: 2026-07-25
---

# Content-risk gate runs as a fresh-context subagent, not inline self-scoring

## Context and Problem Statement

ADR 012 established mandatory voice and content-risk review gates on AI-generated content. The voice gate runs as a subagent (`wr-voice-tone:agent`); the content-risk gate has remained inline self-scoring by the drafter. ADR 016 then established the strengths/weaknesses critic as a fresh-context subagent on confirmation-bias grounds: the model that produced the draft cannot evaluate it cleanly, because the same context that generated weak passages has already reconciled them as acceptable.

The same argument that motivated ADR 016 applies to the content-risk gate. The drafter scoring its own factual, reputational, claims, attribution, and reader-respect risks throughout the 2026-04-17 session produced verdicts that were adequate but not independent. Reader-respect in particular was caught by the voice gate or by Tom's external review, not by the content-risk inline score, on passages where reader-respect should have flagged `high`. Problem 009 (`docs/problems/009-content-risk-inline-self-scoring.known-error.md`) recorded this gap and proposed extending ADR 016's pattern to a second gate.

ADR 012 explicitly named `wr-content-risk-scorer` as a follow-up: "a content-risk adaptation may be needed; this decision records that such a scorer will be built if the existing one does not fit." This ADR is the documented landing place for that follow-up.

## Decision Drivers

- **Confirmation bias.** The drafting model's context has already reconciled the weak passages it produced. Inline self-scoring inherits the same failure mode ADR 016 was written to avoid.
- **Pattern reuse.** ADR 016 established the agent-plus-rubric subagent pattern (`.claude/agents/wr-sw-critic.md` + `.claude/skills/wr-newsletter/assets/<rubric>.md`). Reusing the pattern keeps the skill coherent and avoids inventing a parallel mechanism.
- **Behavioural contract preservation.** The downstream save logic (SKILL.md step 16) depends on the existing `CONTENT_RISK: ... VERDICT: ...` block format pinned by ADR 015 confirmation criterion 3. The shift from inline to subagent must be transparent to downstream consumers.
- **Rubric extraction.** The five-axis scoring criteria currently live as inline prose in SKILL.md step 14. Extracting them to a standalone rubric is a precondition for fresh-context subagent evaluation, and it makes the criteria human-editable and version-controlled in their own file.
- **Cost.** One additional subagent invocation per phase (prep + finalise) per issue. ADR 016 line 77 already accepted "two to six more subagent invocations per issue" as negligible at weekly cadence; this ADR adds at most two more (one per phase) under the same precedent.

## Considered Options

1. **Extract content-risk scoring to `wr-content-risk-scorer` project-local agent following ADR 016's pattern** (chosen). New rubric file at `.claude/skills/wr-newsletter/assets/content-risk-rubric.md`. New agent file at `.claude/agents/wr-content-risk-scorer.md`. SKILL.md steps 14 and 14-prime invoke the agent with the in-progress draft path and rubric path. The agent returns the same `CONTENT_RISK:` block format the inline step previously emitted.
2. **Generalise `wr-sw-critic` to also score content-risk via a content-risk rubric.** Rejected: `wr-sw-critic`'s contract is analytical-quality critique with strengths + weaknesses, not single-block axis scoring. Forcing one agent to emit two output formats violates ADR 016's "single agent + many rubrics" assumption that the *output shape* is shared, not the *axes shape*.
3. **Keep content-risk inline.** Rejected by the same confirmation-bias argument that drove ADR 016. Inline scoring still produces a usable block, but does not catch its own bias; external human review (Tom) becomes the de-facto reviewer, defeating the point of the gate.
4. **Amend ADR 012 in place rather than draft a new ADR.** Rejected: ADR 012 is a *category* decision (mandatory voice + risk review gates exist). The execution mechanism (inline vs subagent) is a narrower decision that can change without rewriting the category. ADR 016 set the precedent of treating "drafter vs critic separation" as structurally significant and additive, not superseding; this ADR follows the same shape.

## Decision Outcome

Chosen option: **"Extract content-risk scoring to `wr-content-risk-scorer` project-local agent following ADR 016's pattern."**

**Agent placement.** `.claude/agents/wr-content-risk-scorer.md`. Project-local per ADR 011's project-local-tooling boundary and ADR 016's same-shaped placement.

**Rubric placement.** `.claude/skills/wr-newsletter/assets/content-risk-rubric.md`. Co-located with the skill that owns the artifact type, mirroring ADR 016's wardley-critic-rubric.md and newsletter-critic-rubric.md placements.

**Invocation site.** SKILL.md step 14 (full and prep phases) and step 14-prime (finalise phase). Both call the agent with the in-progress draft path as `artifact_path` and the rubric path as `rubric_path`.

**Output contract.** Pinned by ADR 015 confirmation criterion 3:

```
CONTENT_RISK: factual=<...> reputational=<...> claims=<...> attribution=<...> reader-respect=<...>
VERDICT: <PASS|REJECTED>
Notes:
- <flagged passage 1, or "no flags">
```

The agent's output must be byte-identical to what the inline step previously emitted. Downstream save logic (step 16 prep, finalise, full branches) does not change. The skill consumes `VERDICT:` to decide whether to skip step 15 (the SW-critic loop runs only on PASS).

**Behavioural contract preservation.** The execution context shifts from inline to a fresh-context subagent. The output shape, the verdict semantics (any axis `high` yields REJECTED), the per-phase invocation pattern (once in prep, once in finalise), and the relationship to step 15 (SW-critic skipped on REJECTED) are all unchanged. ADR 017 lines 133-134 ("ADR 012 voice and content-risk gates run twice in the new flow ... the gates themselves are unchanged") remains true at the behavioural level even after this ADR; the implementation-level change is the inline-to-subagent shift documented here.

**Additive, not superseding.** ADR 012 still holds: voice and content-risk gates are mandatory on every AI-generated draft. ADR 015 still holds: reader-respect is the fifth axis, REJECTED is save-but-do-not-publish. ADR 016 still holds: SW-critic runs after content-risk on PASS. This ADR refines the *how* of ADR 012's content-risk gate. Same shape as ADR 016 line 41 ("The critic gate is additive, not superseding").

## Consequences

### Good

- The content-risk gate gets the same confirmation-bias mitigation as the SW-critic gate. Drafter no longer scores its own work for reputational, claims, attribution, factual, or reader-respect risk.
- The five-axis rubric becomes a standalone artifact (`content-risk-rubric.md`) that can evolve independently of SKILL.md prose, with version control, and with explicit links to JTBD persona constraints (the JTBD review surfaced rubric wording guidance that lives in the rubric, not buried in skill prose).
- One more invocation site uses the ADR 016 pattern. The pattern is now used by two distinct gates, validating its reusability claim.
- The 2026-04-17 reader-respect catch-by-voice-gate failure mode has a structural fix, not a workaround.

### Neutral

- Adds one subagent invocation per phase per issue. Two subagents per issue at weekly cadence; under ADR 016 line 77's precedent ("at weekly cadence this is negligible"), the cost is accepted.
- The rubric file and agent file need maintenance, like ADR 016's two rubric files. Cost is low but not zero.
- A re-score pass on a prior week's draft (Problem 009 task 5) is deferred to the next live `/wr-newsletter` run; validation happens in production rather than against a stored fixture. If the agent's output drifts from the inline score by more than one axis on the first live run, the rubric needs tightening.

### Bad

- Stale references: SKILL.md line 655 listed `wr-content-risk-scorer` as out-of-scope; this ADR makes it in-scope. The line must be removed or rephrased as part of landing this ADR. `wr-sw-critic.md` line 102 references the inline content-risk gate; the wording must shift to reference the subagent. Both are mechanical fixes but if missed they will mislead future readers.
- Output contract divergence risk: if the rubric grows new axes or renames existing ones, the agent's output will drift from ADR 015 confirmation criterion 3's pinned format. The agent file must include a hard rule that the output block is fixed by ADR 015 and changes require superseding ADR 015. This is a deliberate brittleness: the gate's downstream consumers (step 16 save logic, retrospective parsing) depend on the format.
- Round-1 fragility: unlike SW-critic, the content-risk gate is single-shot (no iteration loop). A REJECTED verdict from the subagent surfaces to Tom but does not auto-rewrite. This matches ADR 015's existing semantics; it is not a regression, but the lack of an iteration loop here means a borderline `medium`-everywhere score will not get a chance to drop to `low` via an iteration round. If retrospective shows this is a recurring pain, a follow-up ADR can extend the iteration pattern to content-risk.

## Confirmation

1. `.claude/agents/wr-content-risk-scorer.md` exists and documents the agent contract: takes `artifact_path` + `rubric_path`, returns the ADR 015 criterion 3 block format verbatim, runs in fresh context, no rewrites, mechanical verdict (any axis `high` -> REJECTED).
2. `.claude/skills/wr-newsletter/assets/content-risk-rubric.md` exists with the five axes (factual, reputational, claims, attribution, reader-respect) defined as numbered checks the agent scores against. Each axis includes its persona constraints from the JTBD review (reader-respect treats reader as peer; reputational protects straight-shooter standing; factual / claims / attribution map to JTBD-205 shipped-vs-demo).
3. `.claude/skills/wr-newsletter/SKILL.md` step 14 invokes the agent instead of inline scoring. Step 14-prime invokes the agent against the finalise-time draft. The skill prose explicitly cites ADR 018.
4. SKILL.md line 655 ("A purpose-built `wr-content-risk-scorer` skill (follow-up to ADR 012)") removed or rephrased to reflect the follow-up landing.
5. `.claude/agents/wr-sw-critic.md` line 102 updated from "Content-risk gate (inline in the skill per ADR 012/015)" to reference the subagent and ADR 018.
6. The agent's output on a real draft matches the inline-score format byte-for-byte, validated on the first live `/wr-newsletter` run after this ADR lands. Verification trigger transitions Problem 009 from Verifying to Closed.

## Pros and Cons of the Options

### Extract to `wr-content-risk-scorer` agent (chosen)

- Good: confirmation-bias mitigation matches ADR 016 precedent; rubric becomes standalone editable artifact; reuses validated pattern; structural fix for 2026-04-17 reader-respect failure mode
- Bad: two stale references must be cleaned up; output contract brittleness; no iteration loop on REJECTED

### Generalise `wr-sw-critic` for content-risk

- Good: one agent file instead of two
- Bad: forces conflicting output shapes (strengths/weaknesses vs single-block axis scoring); breaks ADR 016's clean output contract

### Keep content-risk inline

- Good: zero new files
- Bad: confirmation bias persists; defeats ADR 016's argument applied to a second gate; reader-respect failure mode goes unfixed

### Amend ADR 012 in place

- Good: one decision file instead of two
- Bad: conflates category decision with execution mechanism; loses the additive-not-superseding pattern that ADR 016 set

## Reassessment Criteria

- After 4 issues, review the agent's verdict distribution. If every issue scores PASS with five `low` axes, the rubric is too lenient or the drafter has internalised the rubric and the gate is not catching anything; tighten the rubric.
- If the agent's REJECTED verdicts consistently disagree with Tom's editorial judgement (Tom would have published anyway, or Tom would have rejected drafts the agent passed), the rubric is mis-calibrated and needs the JTBD persona constraints re-visited.
- If the SW-critic gate stops catching analytical issues that the content-risk gate now catches (or vice versa), the gate boundary may need to shift; ADR 016 already calls this out as a reassessment trigger and this ADR should be re-read at the same time.
- If a third content surface (blog, social, landing page) needs content-risk review, the same agent should work with a surface-specific rubric. If a per-surface agent ends up necessary, the parameterisation was leaky and the agent needs a redesign (mirrors ADR 016 line 126).
- If Tom repeatedly overrides REJECTED verdicts without rewriting, the threshold is wrong; recalibrate the rubric or relax the "any axis high -> REJECTED" rule.
