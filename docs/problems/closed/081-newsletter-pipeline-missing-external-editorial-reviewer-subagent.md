# Problem 081: Newsletter pipeline missing an external-editorial-reviewer subagent; internal gates underperform vs human-editor-style review

**Status**: Closed (fix released 2026-06-17, see Fix Released + Implementation below; sole remaining task: validate on next /wr-newsletter run)
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

Suggested fix (original capture 2026-06-01; SUPERSEDED by the Direction Resolved 2026-06-17 below, which extends the existing ADR-020 editor rather than adding a new `wr-external-editor` agent):

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

### Direction Resolved (2026-06-17, work-problems loop end)

Tom answered the Q1 placement question (add-alongside Option A vs supersede Option B) with a **third option: EXTEND the existing ADR-020 `wr-newsletter-editor` subagent** so it ALSO finds passage-cited editorial-craft weaknesses, IN ADDITION to its current would-open / would-read-through / would-forward reader-experience axes. NOT a new alongside agent; NOT a supersede.

Resolution detail:

- **Extend, do not add, do not supersede.** The editorial-craft axes (opener earning the thesis vs restating it, fold compression, audience-pointer specificity, sentence rhythm, ATWN thesis-fit) become additional findings the SAME editor surfaces alongside its three reader-experience axes. One canonical editor surface, one name.
- **Fix is repo-local.** The editor agent lives in this repo at `.claude/agents/wr-newsletter-editor.md` (verified 2026-06-17; only copy). The extension work happens here.
- **Codification home: amend ADR-020 (scope extension), NOT supersede, NOT a new ADR.** The chosen option of ADR-020 (the editor is the reader-experience review class) is preserved and broadened, which is an amendment, not a supersession. The amendment MUST also revise ADR-020 confirmation criterion 1's pinned `EDITOR_REVIEW` output contract, because the editor's output block changes shape to carry passage-cited weaknesses (criterion 1 currently states format changes require superseding ADR-020; the amendment updates the pinned contract in place). Author the amendment via `/wr-architect` when the extension is implemented.
- **Architect (2026-06-17): PASS.** The extend choice satisfies ADR-020's own absorption clause (line 94), dissolves the ADR-033 two-editor-names self-documentation concern that drove the prior supersede lean, and adds ZERO new invocations so it holds the ADR-020 15-invocations/issue cost ceiling. JTBD (2026-06-17): PASS; the craft axes compose with the leader (JTBD-001/002/003) and developer (JTBD-200..205) newsletter jobs.
- **Q2 / Q3 moot.** Q2 (re-assert the 15-invocation ceiling under Option A) does not arise: extending adds no invocations. Q3 (retire ADR-020 as `.superseded.md`) does not arise: ADR-020 is amended, not superseded.

### Implementation (2026-06-17, work-problems iter)

Core direction implemented and committed (repo-local; this is the windyroad consumer repo, no packages/, no changeset). Architect re-reviewed the concrete implementation shape: PASS. JTBD re-reviewed: PASS / aligned.

- **`.claude/agents/wr-newsletter-editor.md` extended.** Added Step 4.5 (editorial-craft pass) over the same brief-body scope, an `EDITORIAL_CRAFT` output block (`Strengths:` plus passage-cited `Weaknesses:` carrying axis + Passage + Issue + Suggested fix), the craft-axis vocabulary (opener-earns-thesis, fold-compression, audience-pointer-specificity, sentence-rhythm, atwn-thesis-fit, other), an extended mechanical verdict (any craft weakness yields NEEDS_EDITORIAL_REVISION; the three reader-experience axes unchanged), updated Hard rules and a Relationship-to-other-gates coverage-partition note (sentence-rhythm is editorial cadence not a word count, so it does not re-import the cog-a11y gate or the ADR-035-retired check_16; argument soundness stays with sw-critic; banned words stay with voice). Scope held brief-body-only; LinkedIn teaser stays out of scope per ADR-020.
- **ADR-020 amended in place** (`docs/decisions/020-newsletter-editor-subagent.proposed.md`): added an "Amendment 2026-06-17 (P081)" section, revised confirmation criterion 1's pinned output contract and the Decision Outcome code block to carry the `EDITORIAL_CRAFT` block and the extended verdict. NOT a supersede, NOT a new ADR; ADR stays `proposed` with `human-oversight: confirmed`. The decisions compendium (`docs/decisions/README.md`) was regenerated to reflect the amended entry.
- **`.claude/skills/wr-newsletter/SKILL.md` step 15.25 wired**: the parse block now expects the `EDITORIAL_CRAFT` block; the verdict prose and the step-17 Tom-summary line note that a craft weakness also yields NEEDS_EDITORIAL_REVISION.

### Skip-on-upstream-REJECTED resolved (2026-06-17, follow-up work-problems iter)

Tom resolved the deferred skip-on-upstream-REJECTED question with **skip-on-REJECTED** for the extended editor, NOT the recorded "editor still runs" proposal. When the step-15 newsletter-critic returns `VERDICT: REJECTED`, step 15.25 is skipped and the editor is not invoked; the draft is already going back for argument-quality rework, so spending the editor invocation (now including its editorial-craft pass) on it wastes the invocation on a draft that is being rewritten anyway. The reworked draft re-runs through the full gate sequence (step 15.25 included) on its next pass, so no publish-bound draft escapes editor review. The editor runs as normal on the two terminal publish-ready verdicts (`PASS` / `PASS_WITH_AUTHOR_OVERRIDES`).

Implemented (repo-local; architect PASS, JTBD PASS, voice-tone PASS 2026-06-17):

- **`.claude/skills/wr-newsletter/SKILL.md` step 15.25** skip-on-upstream-REJECTED guard tightened to make the verdict cases explicit (skip iff terminal step-15 verdict is REJECTED; run on PASS / PASS_WITH_AUTHOR_OVERRIDES; WEAKNESSES_FOUND never reaches the gate) and to carry Tom's rationale (editor cost wasted on an already-REJECTED draft) plus the resolution note that the "editor still runs" proposal was rejected.
- **ADR-020 amendment** (`docs/decisions/020-newsletter-editor-subagent.proposed.md`): the "investigation task still open" sentence in the Amendment 2026-06-17 Reviews block was corrected to a "Skip-on-upstream-REJECTED resolved 2026-06-17 (P081)" paragraph recording skip-on-REJECTED retained, the run-on-REJECTED proposal rejected, and that this confirms (does not change) confirmation criterion 3. Compendium regenerated.

Remaining work on this ticket:

- **Validate on next `/wr-newsletter` run**: count how many of Tom's manual editorial-craft findings the extended editor surfaces vs the prior three-axis editor (also satisfies ADR-020 confirmation criterion 12 first-live-run validation). This is the SOLE remaining task; it needs Tom plus a live `/wr-newsletter` run.

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [x] Decide on placement: add alongside step 15.25 or supersede current editor. (Captured 2026-06-02 work-problems iter 7: architect review surfaced Option A vs Option B with lean toward B; direction-class question routed to outstanding_questions per ADR-074. RESOLVED 2026-06-17: Tom chose a third option, EXTEND the existing ADR-020 editor; see Direction Resolved above.)
- [x] Extend `.claude/agents/wr-newsletter-editor.md` so its output adds passage-cited editorial-craft weaknesses (opener-earns-thesis, fold compression, audience-pointer specificity, sentence rhythm, ATWN thesis-fit) alongside the existing would-open / would-read-through / would-forward axes. Mirror the ADR-035 S/W + passage citation + suggested fix shape. (Done 2026-06-17, see Implementation above.)
- [x] Amend ADR-020 via `/wr-architect` (scope extension): document the editorial-craft axes and revise confirmation criterion 1's pinned `EDITOR_REVIEW` output contract to carry the passage-cited weaknesses. No supersede, no new ADR. (Done 2026-06-17: in-place amendment, architect PASS; compendium regenerated.)
- [x] Decide the skip-on-upstream-REJECTED behaviour for the extended editor. (RESOLVED 2026-06-17: Tom chose **skip-on-REJECTED** for the extended editor, NOT the recorded "editor still runs" proposal. The editor is not invoked at step 15.25 when the step-15 newsletter-critic returns REJECTED, because the draft is already going back for rework and running the editor incl. its editorial-craft pass wastes the invocation. Wired in SKILL.md step 15.25 and recorded in the ADR-020 amendment; see Implementation 2026-06-17 below.)
- [x] Update SKILL.md step 15.25 invocation / prompt to reflect the extended editor output. (Done 2026-06-17.)
- [ ] Test on next edition: count how many of Tom's manual editorial findings the extended editor surfaces vs the prior three-axis editor.

## Fix Released

Released 2026-06-17 (repo-local skill/agent change; release == committed per ADR-022, no changeset). Commits on origin/master:

- `5879f4b` feat(newsletter): extend wr-newsletter-editor with editorial-craft pass (P081). `.claude/agents/wr-newsletter-editor.md` gains Step 4.5 editorial-craft pass, the `EDITORIAL_CRAFT` output block, the craft-axis vocabulary, and the extended NEEDS_EDITORIAL_REVISION verdict; ADR-020 amended in place (human-oversight: confirmed); SKILL.md step 15.25 parse block wired.
- `69f6afe` fix(newsletter): skip extended editor on critic-REJECTED at step 15.25 (P081). Skip-on-REJECTED guard tightened per Tom's 2026-06-17 resolution (editor not invoked when step-15 critic returns REJECTED; runs on PASS / PASS_WITH_AUTHOR_OVERRIDES).

Awaiting user verification. Verification trigger: the SOLE remaining task is a live `/wr-newsletter` run where Tom counts how many of his manual editorial-craft findings the extended editor surfaces vs the prior three-axis editor (ADR-020 confirmation criterion 12). This needs Tom plus a live finalise pass; it cannot be exercised AFK.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P064 (newsletter SW-critic 38-check rubric simplification; the external-editor pattern may be the right replacement for the rubric-heavy approach). P075 (newsletter drafter headings fail clarity test, gates do not catch; an external-editor pass would catch heading-clarity in the same shape it catches sentence-level cumbersomeness). P077 (voice-tone gate misses Tom-specific idioms; same blind-spot class).

## Related

- **ADR-020** (`docs/decisions/020-newsletter-editor-subagent.proposed.md`). The current editor subagent this ticket may supersede.
- **ADR-016** (`docs/decisions/016-sw-critic-subagents-and-iteration-loop.proposed.md`). The fresh-context subagent + critic-loop pattern this ticket reuses.
- **P064**, **P075**, **P077**. Sibling editorial-gate-blind-spot tickets.

(captured manually following the /wr-itil:capture-problem template after Tom-direction; bundled with P079 + P080 in one batch commit per ADR-014 related-cluster carve-out)

## Closed

- **Closed**: 2026-06-28 (verification-queue drain; evidence-based per ADR-022)
- **Evidence**: editor agent extended with EDITORIAL_CRAFT pass; 2026-06-22 editor review includes the craft block
- **Recovery**: reopen via /wr-itil:transition-problem 081 known-error if a regression surfaces
