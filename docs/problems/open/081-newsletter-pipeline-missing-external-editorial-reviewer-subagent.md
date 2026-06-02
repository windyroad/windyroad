# Problem 081: Newsletter pipeline missing an external-editorial-reviewer subagent; internal gates underperform vs human-editor-style review

**Status**: Open
**Reported**: 2026-06-01
**Priority**: 3 (Medium). Impact: 3 x Likelihood: 4 (deferred. Re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: M (deferred. Re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

The /wr-newsletter pipeline has five review gates: voice (wr-voice-tone:agent), content-risk (wr-content-risk-scorer), SW-critic (wr-sw-critic against 38-check newsletter rubric), editor (wr-newsletter-editor reader-experience axes), cognitive-accessibility (cognitive-accessibility). The 2026-06-01 finalise run for The Shift Issue 07 surfaced that these gates collectively produced fewer high-quality, passage-cited, audience-aware findings than the external editorial reviewer Tom invoked repeatedly during the same finalise session.

Observed across the 2026-06-01 finalise:

- Internal gates passed (or returned overridable PARTIALs on rubric structure checks); the brief was technically eligible to publish after them.
- The external reviewer caught: opener cumbersome sentence ("That is three 'of course this gets governed' moments at once"), Item 5 + 6 + 7 human angles weak vs the brief's other items, Item 4 weakest operational execution despite strong topic, ATWN bullets off-thesis, LinkedIn post fold-compression duplicating the title, LinkedIn bullets needing audience-pointers ("if you own AI procurement"), LinkedIn compliance-bullet identity-marker clunky as a task rather than role.
- None of those findings came from the internal gates. All were caught by the external editor pattern (strengths + named weaknesses with passage citations + suggested fixes in the same persona-as-experienced-LinkedIn-editor voice).

The current `wr-newsletter-editor` subagent (ADR 020, step 15.25) checks three reader-experience axes (would-open, would-read-through, would-forward) and returns EDITOR_VERDICT. It is NOT a passage-cited weakness-finder; it answers a different question. The skip-on-upstream-REJECTED rule (which fired for Issue 07 because SW-critic returned REJECTED) ALSO skipped the editor gate, so this run did not even get the existing editor's reader-experience read.

Suggested fix:

- Add a `wr-external-editor` subagent that plays the role of an experienced LinkedIn / industry-newsletter editor (not a reader-experience predictor). Output format: STRENGTHS + WEAKNESSES with each weakness carrying a quoted passage, the issue named, and a suggested fix. Similar shape to ADR-016 sw-critic but oriented to editorial craft (sentence rhythm, fold compression, audience-pointer specificity, opener earning the thesis vs restating it, ATWN thesis-fit).
- Place at step 15.25 alongside or replacing the current editor. If replacing: the reader-experience axes (would-open, would-read-through, would-forward) become weakness candidates in the external-editor's output rather than a separate verdict.
- Skip-on-upstream-REJECTED rule: if SW-critic returns REJECTED, the external-editor still runs (editorial-craft findings are useful even when the argument is structurally weak; they help diagnose what to fix).
- Trade-off: adds one more agent invocation per artifact pass. The 2026-06-01 finalise burned multiple agent invocations on SW-critic + voice rounds chasing findings the external-editor would have caught in one pass.

Reassessment trigger: if the external-editor consistently catches what the other gates miss across 4 consecutive editions, supersede the current `wr-newsletter-editor` subagent and update ADR 020.

## Symptoms

(deferred to investigation)

## Workaround

(deferred to investigation. Current workaround: Tom invokes the external editorial reviewer pattern manually outside the pipeline, multiple times per edition, and applies fixes in iteration.)

## Impact Assessment

- **Who is affected**: (deferred to investigation. Direct: Tom doing the editorial review work the pipeline should be doing; indirect: any edition where Tom is time-pressed and ships without the extra editorial pass.)
- **Frequency**: (deferred to investigation. Estimated: every edition that gets a careful Tom review surfaces editorial-craft issues the gates do not.)
- **Severity**: (deferred to investigation. Estimated: medium-to-high quality drag; the gates produce false confidence in publish-readiness.)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Architecture Review (2026-06-02 work-problems iter 7)

Architect (`/wr-architect:agent`) reviewed the placement question on 2026-06-02 during AFK orchestrator iter 7. Verdict: **NEEDS DIRECTION** (direction-class per ADR-044; cannot pin mechanically; routed to outstanding_questions per ADR-074 substance-confirm-before-build guard).

Architect advisory lean: **Option B (supersede)** with `/wr-architect:create-adr` producing `NEW_ADR_SUPERSEDES_020`. Rationale (citing existing ADR clauses):

1. **ADR-020 has zero live evidence.** Criterion 12 ("first live-run validation") is still pending after ~5 weeks. The "carry both forward and defer supersession to 4-edition evidence" path P081's original Description proposes is asymmetric: it demands 4 editions of evidence for `wr-external-editor` while requiring zero for `wr-newsletter-editor` to stay in. Per `feedback_tier1_rule_and_predating_artifacts.md`, legacy artifacts predating new gates must pass the gates before re-use; by that principle, the unexercised ADR-020 should be re-justified, not auto-preserved.
2. **ADR-035 amends the critic-rubric corpus to S/W+context.** The S/W+passage-citation shape P081 proposes for `wr-external-editor` matches ADR-035 exactly; the EDITOR_REVIEW fixed-block + three-axis verdict in ADR-020 does NOT. ADR-020's own boundary clause (line 94) names this absorption trigger: "If retrospective shows the editor and sw-critic are flagging the same axes... one of the two should absorb the other." The 2026-06-01 finalise evidence in P081 Description shows the external editor surfaced passage-cited weaknesses the structured editor missed; that is the absorption trigger firing.
3. **ADR-020 reassessment-criterion-6 (15-invocations/issue budget) fires under Option A.** Per-phase tally under add-alongside is ~9-11; per-issue ~18-22. That crosses the line ADR-020 itself drew. Option A requires the new ADR to re-assert the budget; Option B holds the line at the existing precedent.
4. **The "4 consecutive editions before supersede" gate in this ticket's Description is evidence-discipline applied asymmetrically.** It treats supersession as the higher-evidence bar. Given ADR-020 is unexercised, the symmetric framing is: ratify ONE editor for the next 4 editions and pick based on evidence. Option B does exactly that with less infrastructure carried forward.
5. **ADR-033 domain-specific naming reads either way (residual ambiguity).** `wr-newsletter-editor` and `wr-external-editor` CAN coexist as two domain agents, but ADR-033's driver is "self-documenting reader-discoverability"; two editor agents named `editor` and `external-editor` are weakly self-documenting compared to one canonical editor. This is the residual ambiguity that makes the choice substantive, not mechanical, and routes to Tom-direction.

JTBD (`/wr-jtbd:agent`) reviewed the proposed editorial-craft scope on 2026-06-02: PASS / JTBD_ALIGNED. The craft axes (opener earning the thesis, fold compression, audience-pointer specificity, sentence rhythm, ATWN thesis-fit) compose cleanly with `JTBD-001` / `JTBD-002` / `JTBD-003` (leader) and `JTBD-200` / `JTBD-201` / `JTBD-203` / `JTBD-204` (developer). No missing JTBD pushes the placement decision; both Options A and B serve the same reader jobs identically. Add-alongside vs supersede is a pipeline-architecture call, not a JTBD-driven call.

Direction-class questions routed to outstanding_questions in iter 7 ITERATION_SUMMARY (per ADR-044 + ADR-074):

- **Q1 (substance, primary)**: Add-alongside (Option A) or supersede (Option B)? Architect lean: B.
- **Q2 (only if A)**: Re-assert the ADR-020 15-invocations/issue cost ceiling, or trim a gate to stay under?
- **Q3 (only if B)**: Confirm ADR-020 retires as `.superseded.md` with `human-oversight: rejected-pending-supersede` + `supersede-ticket: P081` markers (per ADR-066 pattern used for ADR-016).

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [x] Decide on placement: add alongside step 15.25 or supersede current editor. (Captured 2026-06-02 work-problems iter 7: architect review surfaced Option A vs Option B with lean toward B; direction-class question routed to outstanding_questions per ADR-074; substantive supersede vs add-alongside call awaits Tom-direction before agent authoring proceeds.)
- [ ] Specify the wr-external-editor subagent prompt and output format (mirror ADR 035 S/W + passage citation + suggested fix shape). Blocked on placement direction (above).
- [ ] Draft ADR per architect direction. If Option A: lightweight `/wr-architect:capture-adr` composing-with ADR-020. If Option B: full canonical `/wr-architect:create-adr` superseding ADR-020. Blocked on placement direction.
- [ ] Update skip-on-upstream-REJECTED rule for external-editor specifically (proposal: runs regardless of SW-critic verdict). Blocked on agent authoring (above).
- [ ] Update SKILL.md step 15.25 invocation per agent placement (add-alongside as 15.27 OR replace 15.25). Blocked on agent authoring.
- [ ] Test on next edition: count how many of Tom's manual editorial findings the new subagent surfaces vs the existing gates.
- [ ] Reassessment trigger: 4 consecutive editions of consistent over-performance vs current editor. (Moot if Option B chosen; current editor retires immediately.)

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P064 (newsletter SW-critic 38-check rubric simplification; the external-editor pattern may be the right replacement for the rubric-heavy approach). P075 (newsletter drafter headings fail clarity test, gates do not catch; an external-editor pass would catch heading-clarity in the same shape it catches sentence-level cumbersomeness). P077 (voice-tone gate misses Tom-specific idioms; same blind-spot class).

## Related

- **ADR-020** (`docs/decisions/020-newsletter-editor-subagent.proposed.md`). The current editor subagent this ticket may supersede.
- **ADR-016** (`docs/decisions/016-sw-critic-subagents-and-iteration-loop.proposed.md`). The fresh-context subagent + critic-loop pattern this ticket reuses.
- **P064**, **P075**, **P077**. Sibling editorial-gate-blind-spot tickets.

(captured manually following the /wr-itil:capture-problem template after Tom-direction; bundled with P079 + P080 in one batch commit per ADR-014 related-cluster carve-out)
