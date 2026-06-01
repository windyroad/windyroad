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

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Specify the wr-external-editor subagent prompt and output format (mirror ADR 016 / 020 shape)
- [ ] Decide on placement: add alongside step 15.25 or supersede current editor
- [ ] Update skip-on-upstream-REJECTED rule for external-editor specifically (proposal: runs regardless of SW-critic verdict)
- [ ] Test on next edition: count how many of Tom's manual editorial findings the new subagent surfaces vs the existing gates
- [ ] Reassessment trigger: 4 consecutive editions of consistent over-performance vs current editor, supersede

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P064 (newsletter SW-critic 38-check rubric simplification; the external-editor pattern may be the right replacement for the rubric-heavy approach). P075 (newsletter drafter headings fail clarity test, gates do not catch; an external-editor pass would catch heading-clarity in the same shape it catches sentence-level cumbersomeness). P077 (voice-tone gate misses Tom-specific idioms; same blind-spot class).

## Related

- **ADR-020** (`docs/decisions/020-newsletter-editor-subagent.proposed.md`). The current editor subagent this ticket may supersede.
- **ADR-016** (`docs/decisions/016-sw-critic-subagents-and-iteration-loop.proposed.md`). The fresh-context subagent + critic-loop pattern this ticket reuses.
- **P064**, **P075**, **P077**. Sibling editorial-gate-blind-spot tickets.

(captured manually following the /wr-itil:capture-problem template after Tom-direction; bundled with P079 + P080 in one batch commit per ADR-014 related-cluster carve-out)
