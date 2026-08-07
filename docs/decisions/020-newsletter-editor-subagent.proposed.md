---
status: "proposed"
first-released: 2026-07-07
date: 2026-04-25
human-oversight: confirmed
oversight-date: 2026-05-30
decision-makers: [Tom Howard, Claude]
consulted: []
informed: []
related: [012-ai-generated-content-review-gates, 015-reader-respect-and-gate-rejection-policy, 016-sw-critic-subagents-and-iteration-loop, 017-ai-brief-prep-and-finalise-phases, 018-content-risk-subagent]
amended-by: [043-bounded-editorial-remediation-loop-for-editor-and-skeptic-gates, 044-cross-edition-shape-as-a-fresh-context-subagent-gate]
reassessment-date: 2026-10-05
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

**Output contract.** Pinned by this ADR's confirmation criterion 1 below (extended 2026-06-17 per P081 to carry the EDITORIAL_CRAFT block; see Amendment 2026-06-17). The agent emits exactly:

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

EDITORIAL_CRAFT
Strengths:
- <one-line craft strength naming the move that works, or "none noted">
Weaknesses:
- axis: <opener-earns-thesis|fold-compression|audience-pointer-specificity|sentence-rhythm|atwn-thesis-fit|close-collects-the-so-what|signpost-promises-match-contents|item-placement|edition-internal-consistency|other>
  Passage: "<quoted passage>"
  Issue: <what specifically reads as off, in editorial-craft terms>
  Suggested fix: <concrete direction for the drafter, not a rewrite>
- axis: ...

EDITOR_VERDICT: <PASS|NEEDS_EDITORIAL_REVISION>
END_EDITOR_REVIEW
```

The verdict is mechanical: any `WOULD_OPEN`, `WOULD_READ_THROUGH`, or `WOULD_FORWARD` returning `no` yields `NEEDS_EDITORIAL_REVISION`. Any `tentative` flagged with at least one EDITORIAL_FINDINGS entry yields `NEEDS_EDITORIAL_REVISION`. Any EDITORIAL_CRAFT weakness entry yields `NEEDS_EDITORIAL_REVISION` (craft strengths never trigger the verdict). Three reader-experience `yes` with no triggering findings and no craft weaknesses is `PASS`. The skill consumes `EDITOR_VERDICT:` to decide whether to surface the editor block prominently in the Tom-summary; like content-risk, the editor does not auto-rewrite. Tom decides whether to revise or override.

**Boundary preservation.** The agent file's "Relationship to other gates" section explicitly draws the line:

- voice = author-voice authenticity, em-dashes, hype words.
- content-risk = factual, reputational, claims, attribution, reader-respect.
- sw-critic = does the argument hold? specificity survives? "so what?" answered? piece is not pablum?
- editor = would the subscriber open this in their LinkedIn feed, read it through given their time budget, forward it to a peer with a paste-able takeaway?

Item-count proportionality is editor territory only because it is a presentation/reader-load axis, not an argument-quality axis. The boundary is sharp enough that a future rubric author cannot smuggle would-read judgements into the newsletter-critic-rubric or vice versa. If retrospective shows the editor and sw-critic are flagging the same axes, the boundary has collapsed and one of the two should absorb the other (see Reassessment Criteria).

**Additive, not superseding.** ADR 012 still holds: voice and content-risk gates are mandatory. ADR 015 still holds: REJECTED is save-but-do-not-publish. ADR 016 still holds: sw-critic loops up to 3 rounds. ADR 018 still holds: content-risk runs as a fresh-context subagent. ADR 020 adds a fourth review class without changing the prior three.

## Amendment 2026-06-17 (P081): editorial-craft pass added to the editor's scope

Problem 081 (`docs/problems/open/081-newsletter-pipeline-missing-external-editorial-reviewer-subagent.md`) recorded that the five pipeline gates, the original three-axis editor among them, collectively produced fewer passage-cited, audience-aware findings than the external editorial reviewer Tom invoked repeatedly during the 2026-06-01 finalise of The Shift Issue 07. The external reviewer caught a cumbersome opener sentence, weak item human-angles, off-thesis ATWN bullets, and missing audience-pointers; none of those came from the internal gates.

Tom resolved the placement question on 2026-06-17 with a third option (recorded on the ticket): neither add a separate `wr-external-editor` agent (Option A) nor supersede this ADR (Option B), but **EXTEND** the existing `wr-newsletter-editor` so it ALSO surfaces passage-cited editorial-craft weaknesses, in addition to its three reader-experience axes. One canonical editor surface, one name.

**What this amendment changes:**

- The editor now does a second pass over the SAME brief body (the agent file's Step 4.5): an editorial-craft pass reported as an `EDITORIAL_CRAFT` block with `Strengths:` (one line each) and `Weaknesses:` (each carrying a quoted Passage, named Issue, and Suggested fix). The craft-axis vocabulary is `opener-earns-thesis`, `fold-compression`, `audience-pointer-specificity`, `sentence-rhythm`, `atwn-thesis-fit`, `close-collects-the-so-what`, `signpost-promises-match-contents`, `item-placement`, `edition-internal-consistency`, and `other` (rare). This mirrors the strengths-and-weaknesses shape ADR 016 / ADR 035 established for the critic gates, oriented to editorial craft rather than analytical argument.
- The pinned output contract (confirmation criterion 1 and the Decision Outcome code block above) is revised in place to carry the `EDITORIAL_CRAFT` block. Criterion 1 previously stated "format changes require superseding ADR 020"; this amendment revises that criterion itself in place under recorded Tom-direction, because the chosen option (the editor is the reader-experience review class) is preserved and broadened, which is an amendment, not a supersession.
- The mechanical verdict folds in the craft pass additively: any EDITORIAL_CRAFT weakness yields `NEEDS_EDITORIAL_REVISION` (craft strengths never trigger it). The three reader-experience triggers are unchanged; a true `PASS` now requires three reader-experience `yes` answers with no triggering findings AND no craft weaknesses. ADR 015 save-but-do-not-publish semantics are preserved: the verdict surfaces for Tom, it does not hard-block publication.

**What this amendment does NOT change:**

- **Not a supersession.** ADR 020 stays `proposed` with `human-oversight: confirmed`. The chosen option, the agent name, the project-local placement, the single-shot no-rewrite contract, the fresh-context-per-invocation rule, and the three reader-experience axes are all preserved.
- **Scope stays brief-body only.** The craft pass reviews the brief body, the same scope as the reader-experience pass. The LinkedIn teaser (drafted at SKILL step 15.5, after the editor runs at step 15.25) remains out of scope; the LinkedIn-teaser scope gap (Bad consequence 4) and its reassessment criterion are unchanged. Extending into teaser review would require re-sequencing the pipeline, which is a separate decision.
- **No new invocation.** The craft pass runs inside the existing single editor invocation per phase, so the ADR 016 line 77 cost precedent and the reassessment-criterion-6 budget are held. [**Corrected 2026-08-07 by ADR-044 (Cross-edition shape as a fresh-context subagent gate)**: this sentence originally read "the reassessment-criterion-6 15-invocations-per-issue ceiling", and is the first appearance of the word "ceiling" against criterion 6 anywhere in the corpus. It postdates this ADR's 2026-05-30 ratification, and the characterisation is wrong: criterion 6 is a trigger offering two responses, not a limit. The error propagated from here into ADR-042 and then ADR-043. The argument this bullet makes is unaffected, since adding no invocation holds any budget.] This is why the prior architect supersede-lean (grounded in the budget and the ADR-033 two-editor-names self-documentation concern) dissolved under the extend option.

**Absorption clause satisfied.** Decision Outcome's boundary clause (the paragraph ending "one of the two should absorb the other") named exactly this trigger: the editor absorbs the external-reviewer role rather than a new agent absorbing the editor. The craft axes respect the coverage partition: argument soundness stays with sw-critic, voice with the voice gate, factual and reputational risk with content-risk, sentence-length counts with cognitive-accessibility (the craft `sentence-rhythm` axis is editorial cadence, not a word count, matching ADR 035's retirement of the count-based check_16).

**Reviews:** architect PASS (2026-06-17, on the direction and again on the concrete implementation); JTBD PASS / aligned (2026-06-17).

**Skip-on-upstream-REJECTED resolved 2026-06-17 (P081).** The deferred follow-up (whether the *extended* editor should run on a critic-REJECTED draft) is settled by Tom-direction: skip-on-REJECTED is **retained** for the extended editor. The editor is not invoked at step 15.25 when the step-15 newsletter-critic returns `VERDICT: REJECTED`. The earlier P081 proposal that the editor should still run on a REJECTED draft (on the grounds that craft findings help diagnose a structurally weak draft) was **rejected**: a REJECTED draft is already going back for argument-quality rework, so spending the editor invocation (now including the editorial-craft pass) on it wastes the invocation on a draft that is being rewritten anyway. The reworked draft re-runs through the full gate sequence, step 15.25 included, on its next pass. This confirms rather than changes the ADR. Confirmation criterion 3 (skip-on-REJECTED, defence-in-depth) and the Decision Outcome Invocation-site paragraph already mandated the skip for the reader-experience editor, and this resolution extends that same skip semantics to the editorial-craft pass. No supersession, no output-contract change; the architect (2026-06-17) confirmed the in-place amendment is the correct codification home for closing this follow-up.

## Amendment 2026-08-05 (P120): the single-shot restriction is lifted; a bounded remediation loop is added by ADR-043

Problem 120 (`docs/problems/known-error/120-editor-and-skeptic-gates-surface-findings-to-tom-instead-of-remediating-them.md`) records that this gate detects editorial defects correctly and then hands them to Tom rather than remediating them, so its output becomes the review burden the gate was built to remove. ADR-043 (Bounded editorial remediation loop for editor and skeptic gates) adds a one-round remediation loop at SKILL.md step 15.37. This amendment records what that lifts here.

**Clause 1, and the reason this is an amendment rather than a supersession: Considered Option 4 (line 41).** That option rejected an iterating editor, predicting that "the drafter's round-2 attempt is likely to over-correct or substitute one editorial weakness for another, not to address the original", and closed with an explicit pre-registration: *"If retrospective evidence shows iteration would help, a follow-up ADR can lift the loop."* ADR-043 is that follow-up, using the hatch this ADR designed.

The evidence that discharges the pre-registration is The Shift Issue 16 (published 2026-08-03). The editor named three defects (fold-compression on the opener, `atwn-thesis-fit` on two Also-worth-noting entries, `audience-pointer-specificity` on a third); the pipeline discarded all three; Tom's external reviewer then raised all three independently. Six external review rounds went on hand-remediating exactly the classes this gate had already named in writing.

The same session settles the predicted failure mode empirically. **The over-correction did occur.** The remediation rounds introduced an unsourced generational inference on a source-verbatim sentence, a directional pointer that said "below" for a section sitting above, an emphatic "do" that the voice gate identified as the same reflex as an "actually" it had already removed four times, and two `claims=high` superlatives. **And the surrounding gate battery caught every one of them**, with the draft converging to voice PASS plus content-risk PASS. So Option 4's fear was correct in its mechanism and wrong in its conclusion: iteration does over-correct, and in that session the battery contained it. One edition is not a guarantee, but it is the first end-to-end observation of the mechanism, and it is the finding the pre-registration asked for.

**Clause 2: Considered Option 1's "Single-shot, no iteration loop"** (line 38). The editor now runs up to twice per body pass: once at 15.25, and once more inside the 15.37 loop if the first invocation returned `NEEDS_EDITORIAL_REVISION`. Everything else in Option 1 stands unchanged: the agent, its name, its project-local placement, its fresh-context-per-invocation rule, its pinned input contract, its output block, and the three reader-experience axes.

**Clause 3: the `**Additive, not superseding**` paragraph** (line 107). Its claim that ADR-020 "adds a fourth review class without changing the prior three" still holds. What changes is that this gate's own verdict now drives a remediation attempt before it reaches Tom. ADR-015's save-but-do-not-publish semantics are preserved at the loop's terminal state: an unremediated finding after one round lands in front of Tom exactly as it does today, recorded as an accepted residual advisory.

**Clause 4: confirmation criterion 2's "no rewrites"** (line 158). The *agent* still does not rewrite; that invariant is unchanged and remains in the agent file's `## Hard rules`. What is lifted is the implication that nothing else rewrites either: the skill remediates against the agent's findings and re-invokes it. Churn detection is orchestrator-side, so the agent's input contract (`artifact_path` plus `persona` plus `edition_number`) is untouched, and inner-loop rounds run against the body only so the agent never reads its own prior verdict off the artifact (ADR-026).

**Persona grounding corrected (Decision Outcome, line 52).** The enumeration read "developer: JTBD-200, JTBD-201, JTBD-203, JTBD-204; leader: JTBD-001, JTBD-002, JTBD-003". JTBD-001 through JTBD-004 were retired by ADR-041 on 2026-07-10; the live leader job is JTBD-005 (Stay Ahead of the Shift), ratified 2026-07-12. The corrected enumeration is **the persona file plus the following job files**: developer: JTBD-200, JTBD-201, JTBD-203, JTBD-204, JTBD-205; leader: JTBD-005. Phrasing it that way rather than as "the must-have job files" avoids asserting a tier classification the JTBD index contradicts. JTBD-203 and JTBD-204 are Important-tier extras that criterion 2's "plus" wording tolerates, JTBD-205 is the must-have that was missing entirely, and JTBD-202 (Timing the Category) is Important-tier and deliberately out of the editor's read set. Confirmation criterion 2 itself needs no change; the correction satisfies it, and a future compliance pass should read the criterion against this enumeration.

The correction covers the whole scoring path, not just the read-list: the pre-read constraints sentence, `WOULD_OPEN`, `WOULD_READ_THROUGH` (whose 15-minute threshold tightens to JTBD-005's "a few minutes"), the `opener-authenticity` leader gloss, the `WOULD_FORWARD` axis rationale (which drops its JTBD-002 citation and confines JTBD-203 to the developer half), and the `WOULD_FORWARD` leader criterion (whose "ammunition to justify the engagement" framing is dropped rather than left unsourced, since JTBD-005 carries no positive forward-or-share outcome). Grounding the agent's file list on live jobs while its scoring vocabulary still cited retired ones was already producing hybrids in production: the 2026-07-13 published reviews file records the editor scoring against "JTBD-005 awareness-shift and JTBD-003 board-ammunition". Under the ADR-043 loop these findings stop being advisory noise Tom filters and become applied edits, which is why the sweep ships in the same commit.

**This amendment is also this ADR's overdue reassessment.** The `reassessment-date: 2026-07-25` in frontmatter had passed. Reassessment criterion 6 (the ~15-invocations-per-issue budget) fired: the true cumulative tally was already ~20 per issue before ADR-043, and is ~25 after. ADR-043's `## Invocation budget re-assertion` section carries the tally. [**Corrected 2026-08-07 by ADR-044**: there is no ceiling, criterion 6 is a trigger; and the question is no longer open, Tom re-asserted the budget on 2026-08-07. The tally is now near 31 per issue worst case.] Reassessment criterion 4 (Tom repeatedly overriding `NEEDS_EDITORIAL_REVISION` without rewriting) did **not** fire, despite surface similarity: the Issue 16 findings were correct and were acted on, just by the wrong actor at the wrong time. P120 is a routing defect, not the mis-calibration criterion 4 remedies. The reassessment date is rolled forward to 2026-10-05 to match ADR-043's.

**Not a supersession.** The chosen option, the agent name, the project-local placement, the fresh-context rule, the pinned output contract, the mechanical verdict, and the three reader-experience axes are all preserved.

**Reviews:** architect PASS (2026-08-05, across three passes on this plan); JTBD PASS (2026-08-05, across three passes; the persona-grounding correction is a JTBD finding).

## Amendment 2026-08-07 (P122): four assembly axes added to the editorial-craft vocabulary

> **Ratified by Tom on 2026-08-07**, as written, from the rendered ADR plus a substance summary. This amendment's substance is human-confirmed; the ADR's frontmatter `oversight-date` records the original 2026-05-30 confirmation of the decision it amends.

Problem 122 (`docs/problems/known-error/122-no-gate-owns-within-edition-structural-mechanics-so-assembly-defects-reach-the-reader.md`) recorded that the gate battery is partitioned by content axis, and that no partition owns how an edition's parts relate to each other or to its own headline. The critic scores rubric quality, this editor scores reader experience and line-level craft, the skeptic attacks claim-evidence calibration, ADR-044's shape gate compares the edition against its predecessors, and the P089 structure lint checks format hygiene. Assembly is the seam between them.

The Shift Issue 16 surfaced eight findings of that shape, all raised by Tom or his external reviewer after the gate battery had terminated: the item run fought its own thesis, the close did not discharge the title, a promoted argument sat in the demoted section, and content was told twice at near-full length. **Finding 8 is out of class**: a LinkedIn-post bullet that lists where it should argue is the skeptic's `promise-payoff` axis on `artifact_kind: linkedin-post`, already in charter at step 15.55 and already running, so it is a calibration miss rather than a coverage gap. The remaining seven collapse into four axes once each is traced to an owner, which is why the vocabulary grows by four and not by seven. (P122's own summary line and RFC-004 both say "two of the eight turn out not to be assembly at all". P122's axis table is the authored artefact and maps findings 1 through 7 onto the four axes, excluding only finding 8, so the count here follows the table. The divergence is noted rather than silently reconciled.) None of the eight reached a reader: the edition was hand-remediated before publication. The cost this amendment addresses is hand-remediation effort, not reader-facing damage.

The fix is a third read inside this agent's existing invocation, so the sweep adds no subagent invocation. The vehicle is RFC-004 (Within-edition assembly sweep as a third editor read).

**What this amendment changes:**

- **Four names join the craft-axis vocabulary**, which becomes `opener-earns-thesis`, `fold-compression`, `audience-pointer-specificity`, `sentence-rhythm`, `atwn-thesis-fit`, **`close-collects-the-so-what`**, **`signpost-promises-match-contents`**, **`item-placement`**, **`edition-internal-consistency`**, and `other` (rare). The agent gains a Step 4.6 whole-edition assembly pass, run after the Step 4.5 craft pass over the same brief body, reporting into the existing `EDITORIAL_CRAFT` block. The output contract grows by four axis names and nothing else: no new block, no new field.
- **The verdict mechanic folds them in additively**, exactly as the 2026-06-17 amendment folded in the craft pass. Any assembly weakness yields `NEEDS_EDITORIAL_REVISION`; assembly strengths never trigger it. The three reader-experience triggers are unchanged, and ADR 015 save-but-do-not-publish semantics are preserved: the verdict surfaces for Tom, it does not hard-block publication.
- **`close-collects-the-so-what` is named for the body's authority, not the headline's.** The rejected alternative was `close-discharges-headline`, and the difference is load-bearing rather than stylistic. Making the headline the authority makes the cheapest remediation "strengthen the close until it matches the promise", which is claim inflation arriving as an applied edit to reader-facing prose under a loop with no author-override arm. ADR-043's reduce-only differential is scoped to the skeptic's findings and so does not literally govern an editor remediation, but the corpus holds a settled reduce-only principle for claim strength, and an inflating default would escape that principle's letter while running against its point. As named, the body is the authority: the close collects what the edition actually delivered, and where the headline over-promises the remediation narrows the headline. Three of the four new axes are deflationary in the same direction; `item-placement` is the exception, being a reordering rather than a rewrite.
- **The `EDITORIAL_CRAFT` block's declared identity widens.** The agent file describes the block as "additive line-editor craft over the brief body", and its Step 4.5 boundary paragraph is written entirely in passage-level terms. `item-placement` (item-run ordering, tier mis-assignment) is whole-edition structure, not line-editor craft. Folding it into the existing block rather than creating a second one is deliberate, on output-contract minimality: a second block would add a parse target, a save-block section and a Tom-summary line for no gain, where four names in an existing block add none. (Reassessment criterion 2 is *not* the ground for this. That criterion is a cross-gate test comparing editor axes against sw-critic findings, and it is indifferent to which block an editor axis lives in.) But the block now carries two passes' output and its self-description must say so. This is recorded as a decision, not left as drift.

**Each axis is anchored to a reader job, and the anchors are the warrant.**

P122 holds a standing rule that any gate axis whose only justification is "this reduces Tom's review rounds" is ungrounded and must be blocked **until an author persona is added and ratified**. That condition is now met: JTBD-300 (Spend editorial judgement where it counts) was ratified on 2026-08-07, and its own notes record it as the job P122's forward rule was waiting on. The rule is therefore lifted, not standing, and what replaces it is stricter than it sounds: an axis becomes groundable through JTBD-300's outcomes rather than through review-count alone. Reduced hand-remediation is this amendment's **motivation**; it is not its warrant. The warrant is per-axis, on the live persona anchors ADR-041 left standing:

| Axis | Anchor |
|---|---|
| `item-placement` | JTBD-005 outcomes 3 and 4 |
| `close-collects-the-so-what` | JTBD-005 job statement plus outcome 3 |
| `signpost-promises-match-contents` | JTBD-005 outcome 1, plus the persona's "little time to keep up personally" constraint |
| `edition-internal-consistency` | JTBD-005 outcome 1 and JTBD-200 outcome 1 for the duplication limb; job statement plus outcome 3 for the valence limb |

**Stated honestly**: each of these is an instrumental inference, not a quotation. No outcome in the corpus uses assembly vocabulary, so none of them says "the item order should serve the thesis". The inference is that an edition whose parts fight each other costs the reader the outcome the anchor does name. That is a real warrant and it is weaker than a direct citation, which is why it is written down rather than implied. Three of the four anchors are leader-derived, because the motivating evidence was `persona=leader`; JTBD-200 grounds only the developer arm of the duplication clause. The axes run on both personas, so the leader warrant is read across rather than separately established, and JTBD-200's outcomes on consistent-lens filtering and per-item why-it-matters are where a developer-arm anchor would be drawn from if one is ever needed.

**JTBD-300's place, stated precisely.** It is absent from the warrant table because whether an axis should exist is a reader question, not an author one. It is **not** absent from the remediation contract: its outcome 1 grounds automatic fixing of a defect a gate can name against a stated standard, and calls finding such a defect in Tom's inbox a routing failure. So a warranted axis's findings are remediable under JTBD-300, bounded by its anti-outcome 3 (editing his prose on a weak warrant to save him a decision, where outcome 2 outranks outcome 1 whenever grounding is uncertain) and by its outcome 3's before-and-after requirement. The distinction is: JTBD-005 and JTBD-200 license the axis; JTBD-300 licenses fixing what the axis finds, and constrains how.

**The seam against the deterministic lint.** `edition-internal-consistency` is narrower than its name suggests. P122's finding 7 splits: "the same source cited in two places" is mechanically computable and goes to the P089 structure lint (RFC-004 item 5), while only the judgement of whether content is **told twice at near-full length**, plus whether a fact carries opposite valence in two places, stays with this axis. ADR-042 assigns structural and format hygiene to the deterministic lint and holds those findings out of the LLM gates' axis sets; recording the split only in the ticket would let a reader of this ADR take the axis to cover duplicate citations and re-open that partition.

> **Correction 2026-08-08, from building it (P122 / RFC-004 item 5). The split above is wider than what shipped, and the difference is substantive.**
>
> The lint was built to this specification (two sections citing the same source URL) and run against every published edition. It fired on three, and all three are legitimate: `2026-04-17` cites a Thoughtworks Radar landing page three times for three different findings in that one report; `2026-06-22` cites a Nature article in the From Tom opener and again in the item detailing it; `2026-07-13` repeats one source across two items for two distinct claims.
>
> Same-URL is computable, but it is not the defect. The defect is the same source used to make the **same point** twice, which needs judgement. Check (k) as shipped keys on the **identical citation** (same anchor text AND same URL), the strictest mechanical proxy with zero false positives across the corpus, pinned by a corpus-wide regression test.
>
> **The consequence is that `edition-internal-consistency` carries more than this amendment anticipated**: the same source making the same point under different anchor text is the axis's, not the lint's. `.claude/agents/wr-newsletter-editor.md` states the corrected split and the running agent reads that. Recorded here at the point of divergence rather than leaving this paragraph describing a rule that was not built. **The widened axis scope has not been separately ratified** and is surfaced for Tom's next pass over this ADR.

**The intra-agent seam, declared rather than assumed.**

`item-placement` sits closest to two axes this agent already carries in its `EDITORIAL_FINDINGS` vocabulary, and P122's own home-decision argument turns on their proximity: item-order-serves-thesis *is* through-line read across the item run. Name uniqueness is not a seam, so the seam is declared:

- **`through-line`** asks whether the cumulative read lands the shift the edition claims. It is about the argument's arc.
- **`item-count-proportionality`** asks whether the edition asks too much of the reader for what it returns. It is about load.
- **`item-placement`** asks whether the running order and the tier assignment serve the stated thesis. It is about position.

An edition can have a sound arc in the wrong order, and a correct order that still does not land. Where a finding genuinely reads as two of these, the agent's existing "do not repeat it here, pick the lens where it fits best" rule governs, and repeated same-passage co-citation is the collapse signal the reassessment trigger below watches for. The seam against the skeptic's promise-payoff axis is the ADR-042 amendment's business, not this one's.

**The accepted trade, stated rather than slipped in.**

This takes the editor's pinned craft vocabulary from 5 axes to 9, alongside its unchanged 3 reader-experience questions and its unchanged 5-name `EDITORIAL_FINDINGS` vocabulary. ADR 035 exists because check accumulation was the failed path: a 38-check numbered rubric was retired in favour of strengths-and-weaknesses prose. That precedent is real and this amendment moves toward more names, not fewer.

ADR 035's holding does not reach this agent on its face: it binds the critic rubric files and the ADR-033 domain critic agents, and the editor is neither. That alone would settle it, but the stronger argument does not need the carve-out. ADR 035 chose this instrument by name. Its fifth decision driver, and the chosen option it adopted, both describe the replacement as a brief editorial prompt **naming the domain's evaluation axes** rather than a numbered structured list. A named-axis vocabulary inside a prose process is not a near-miss of ADR 035's holding; it is what ADR 035 selected. What ADR 035 pins is the **output** shape (strengths and weaknesses prose, passage citations, no MET/UNMET, no scores, no override list), and none of that changes here. What grows is the **input** prompt.

The caution that does reach this amendment is ADR 035's second driver, editorial judgement rather than micro-check accumulation, grounded on Tom's "nothing more". That driver is not numbering-specific and it points squarely here. And ADR 035's actual evidence of failure was **mis-fire**, not count: two checks kept flagging leader-register content that was fine for the audience. Under ADR-043's loop that failure mode is sharper than it was in May 2026, because a mis-firing axis now becomes an applied edit to reader-facing prose instead of an override-list entry.

So the trade carries its own reassessment trigger, keyed on mis-fire and collapse rather than on size alone. It is appended to the Reassessment Criteria as criterion 7, after criterion 6's ADR-044 block quote so that correction is not orphaned, and reads:

> - **Vocabulary growth, partition collapse, or axis mis-fire.** Any one of three limbs fires this criterion.
>   1. **Size.** The named craft axes, excluding `other`, grow past 12. They stand at 9 after the 2026-08-07 (P122) amendment, so this fires at 13. Deliberately scoped to the craft block, because that is the vocabulary the 2026-08-07 amendment grew and the one whose growth this criterion exists to watch. `EDITORIAL_FINDINGS` growth is **not** governed by a size count anywhere, which is a known gap rather than a delegation; limb 2 below does watch those axes for collapse, and if that vocabulary ever grows this criterion should be widened rather than a parallel one added. Consequence: the vocabulary has outgrown the prose-prompt instrument ADR 035 selected, and the right question is whether a second agent should take a partition, not whether to keep adding names.
>   2. **Collapse.** In each of four consecutive editions, some passage is cited under two axes drawn from this agent's pinned vocabulary, craft or `EDITORIAL_FINDINGS`. Read from the editor block in each edition's `<date>.reviews.md`, never from the residual-advisory list, which excludes every remediated finding and would systematically undercount. Record the axis **pair**: the remedy is a merge and it is undecidable without knowing which two. For a **cross-block** pair (one craft axis and one `EDITORIAL_FINDINGS` axis) a single co-citation is already a breach of the agent's rule against repeating a passage flagged in the reader-experience pass, so one instance reads as a prompt bug and four consecutive editions as a partition signal. For a **craft-to-craft** pair no such rule exists today, so a single co-citation is legitimate and only the four-edition pattern signals anything.
>   3. **Mis-fire.** A single axis produces a remediation that Tom then undoes, across three consecutive editions. Observed from the diff between the finalise-time draft body and the published edition, which is the method P122's own reproduction fixture used. This limb is an **adaptation of ADR 035's own method**, not a novel observable. ADR 035 read mis-fire two ways: directly, as two checks flagging leader-register content that was fine for the audience **across consecutive editions**; and indirectly, as `accepted_overrides` growing toward ADR-025's ceiling of 6. Only the second is unavailable here, because that list was the **critic's** and never this gate's, ADR 035 retired it on 2026-06-02, and ADR-043 separately declined to add an author-override arm to the remediation loop (its rejected Considered Option 5). The first, recurrence across consecutive editions, carries straight over. What changes is only the trace it leaves: this gate applies edits rather than accumulating overrides, so the recurrence is read from the diff instead of from a list. A residual advisory Tom publishes over is **not** a revert: that is the criterion-4 false positive recorded in the 2026-08-07 amendment, and it requires no applied edit. This limb requires an applied edit that Tom undid.
>

**A false positive this amendment creates, recorded so it is not mistaken for its own trigger.**

Reassessment criterion 4 fires when Tom repeatedly publishes despite `NEEDS_EDITORIAL_REVISION`, and reads that as mis-calibrated persona grounding or a mis-calibrated verdict mechanic. An assembly axis can be genuinely unremediable within a cycle: `item-placement` on an edition whose item set is fixed has no fix short of dropping an item. When that happens the editor cannot return PASS, Tom publishes anyway, and criterion 4 fires on a gate that is working correctly. Its named remedies (recalibrate the prompt, or relax the verdict rule) would both be the wrong fix.

This note is repeated **inline at criterion 4 as a block quote**, not left here with only a pointer from there. Amendment-only placement is precisely what failed for the criterion 6 "ceiling" error: it entered through the 2026-06-17 amendment body, propagated into ADR-042 and then ADR-043, and was only corrected on 2026-08-07 by ADR-044, whose correction now sits inline at criterion 6 for that reason.

**A dependency P122 left open is discharged.** P122 recorded the relationship between an assembly sweep and structure-lint check (h) as an open question to settle when this was built. Check (h) has since landed: `scripts/check-newsletter-structure.sh:240-264` implements the provenance-line-before-first-item rule, with an explicit fail branch when no `### Item ` heading exists. The question is discharged by the check existing, not by omission. Deterministic provenance placement is the lint's; the assembly axes never assert it.

**Bad consequence 2 (Output contract brittleness) is reconciled.** It still read "Format changes require superseding ADR 020", which the 2026-06-17 amendment contradicted at confirmation criterion 1 ("amending or superseding") without updating it. This is the second change to the pinned output contract (after 2026-06-17) and the third amendment overall, so the stale half is corrected in place to read "amending or superseding ADR 020", matching criterion 1, rather than left to be read first by a fourth. (Note the ordinal: the Bad list runs Surface-coupling, Output contract brittleness, Gate fatigue, LinkedIn-teaser scope gap, so the output-contract bullet is the second, and "Bad consequence 4" elsewhere in this ADR means the teaser gap.)

**Lockstep, and the window this amendment opens.**

Confirmation criterion 1 pins the craft vocabulary. The vocabulary is enumerated at ten normative on-disk surfaces:

The three surfaces in this ADR are named by section rather than by line, because this amendment's own insertion moves every line below it and because criterion 6's inline correction already records a drifted line pointer as a lesson. Line numbers for the runtime surfaces are as at 2026-08-07.

| Surface | Where | What it carries |
|---|---|---|
| this ADR | Decision Outcome | the pinned `EDITORIAL_CRAFT` code block |
| this ADR | Amendment 2026-06-17 (P081) | the prose enumeration of the craft vocabulary |
| this ADR | Confirmation criterion 1 | the criterion's own verbatim pin |
| `.claude/agents/wr-newsletter-editor.md` | 3 | frontmatter `description` |
| `.claude/agents/wr-newsletter-editor.md` | 111 to 116 | Step 4.5 per-axis definition list, including `other` |
| `.claude/agents/wr-newsletter-editor.md` | 161 | output block |
| `.claude/agents/wr-newsletter-editor.md` | 190 | hard rule barring further axes, which also re-enumerates the five craft names in a parenthetical |
| `.claude/skills/wr-newsletter/SKILL.md` | 774 | step 15.25 narrative |
| `.claude/skills/wr-newsletter/SKILL.md` | 817 | parse block |
| `.claude/skills/wr-newsletter/SKILL.md` | 1381 | step 17 Tom-summary axis list |

The per-axis definition list is the most easily missed: it does not read as an enumeration, and four new axes cannot function without definitions.

Five further surfaces are **not** vocabulary enumerations but must move in the same implementation, per the identity-widening bullet above. They are listed separately so the table stays scoped to the enumeration:

- `.claude/agents/wr-newsletter-editor.md:210`, the block's "additive line-editor craft" self-description.
- `.claude/agents/wr-newsletter-editor.md:118`, the Step 4.5 boundary paragraph, written entirely in passage-level terms.
- `.claude/agents/wr-newsletter-editor.md:8-11`, the agent's own numbered self-description. The count sits in the preamble at `:8` and the items at `:10-11`, so both move together; editing only the items leaves a two-item preamble above a three-pass process, which is the drift this bullet exists to prevent.
- `.claude/agents/wr-newsletter-editor.md:13`, "The craft pass is additive", which carries the same singular framing plus the verdict-input claim, and sits just outside the `:8-11` range.
- `.claude/agents/wr-newsletter-editor.md:194`, "Craft pass is brief-body only", which speaks of "the EDITORIAL_CRAFT pass" in the singular. Its scope claim stays true, since Step 4.6 reads the same brief body; what goes stale is treating the block as one pass's product.

`.claude/skills/wr-newsletter/SKILL.md:774` carries the same "two passes over the brief body" count. It is already on the enumeration table above as the step 15.25 narrative, so an implementer reaches it either way, but it needs the count corrected as well as the axis names.

**One surface deliberately does not move.** Line 140 of this ADR names specific axes inside the Issue 16 evidence narrative. It records which findings the pipeline produced and discarded on a particular date. Editing it would falsify the evidence rather than update a contract.

**The three ADR surfaces move with this amendment; the seven runtime surfaces move at implementation.** Confirmation criterion 1's first clause requires the agent file to document the pinned block verbatim, and for the duration of that window it will not. That non-satisfaction is **knowingly accepted and bounded**, not overlooked: it opens when this amendment is ratified and closes when RFC-004 items 4 and 6 land. The window exists because upstream ADR-060's I13 requires an uncovered option-choice to be ratified before implementation, and the four axis names are that choice; building first would invert the rule. A future compliance pass should read criterion 1 against this enumeration, in the same way the 2026-08-05 amendment directs for its persona-grounding correction. The window's closing condition is **the ratification of this amendment and the ADR-042 amendment, plus the implementation** (RFC-004 items 4 and 6), not RFC-004's own oversight status: for a decision, "lands" means ratified, and an RFC is not the decision. The ADR-042 amendment is a joint precondition because `signpost-promises-match-contents` must not reach the agent file before its seam against the skeptic's promise-payoff axis is declared. The lockstep clause proper, which binds the agent file to the SKILL.md step 15.25 parse block, is unaffected: those two move together in one change.

**Cost.** A third read inside one invocation adds no subagent invocation, which is the budget ADR-044's correction re-asserted. But ADR-044 also pinned the constraint that actually binds as ADR-017's under-one-hour finalise session, and that is wall-clock, not invocation count. A third whole-body read adds latency inside an existing invocation. No telemetry exists to quantify it; if finalise sessions start running long, this amendment is a contributor and should be read alongside ADR-017 rather than only alongside the invocation budget.

**Compendium.** The routine view deliberately omits Consequences narrative and Reassessment Criteria, so the Bad consequence 2 correction and the criterion-4 note change nothing there. What the ADR-020 entry needs is the amendment named in its `Decides:` line alongside the P081 and P120 amendments already there, in the same style as the criterion-6 correction it already carries. The entry's `Confirmation:` line names `EDITORIAL_CRAFT` as a block without enumerating axes, so the vocabulary growth falsifies nothing there. The header's `Total ADRs` count is separately stale (44 against 45 files) and is corrected in passing.

That edit is made **by hand, not by regeneration**, and the divergence is deliberate. `wr-architect-generate-decisions-compendium` is deprecated here: it overwrites entries the per-edit hook has already authored, and re-emits em-dashes this repo's no-em-dash hook rejects. That is P087, whose 2026-08-07 recurrences are recorded on the ticket itself rather than only here: five firings in one day, two of them within ADR-045's own create-then-ratify lifecycle, establishing that a hand-repair does not survive the next edit to the same ADR. `docs/decisions/README.md` carries a generated "do NOT hand-edit" banner at its head, so this paragraph is the record that the hand-edit is intended and should not be reverted against it. ADR-044's confirmation criterion 12 is the on-disk precedent for accepting a hand-edited entry.

**What this amendment does NOT change:**

- The chosen option. The editor remains the reader-experience review class, one canonical surface, one name. Broadened again, not superseded.
- The three reader-experience axes, their `yes|no|tentative` shape, or their verdict triggers.
- The `EDITORIAL_FINDINGS` vocabulary, including `through-line` and `item-count-proportionality`, whose seam against `item-placement` is declared above.
- The agent contract: fresh context, no rewrites, `artifact_path` plus `persona` plus `edition_number`, persona files read per ADR-041's live jobs.
- The skip-on-upstream-REJECTED rule.
- The brief-body scope. Step 4.6 reads the same body Steps 4 and 4.5 read. The LinkedIn teaser remains out of scope per Bad consequence 4, and the companion post is ADR-044's surface at step 15.57.
- The single-invocation-plus-one-remediation-look budget the 2026-08-05 (P120) amendment set.


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
- **Output contract brittleness.** The `EDITOR_REVIEW:` block format is pinned by this ADR (confirmation criterion 1). Format changes require amending or superseding ADR 020 (corrected 2026-08-07: this bullet read 'require superseding' while confirmation criterion 1 read 'amending or superseding'; criterion 1 governs). Downstream consumers (SKILL.md step 16 save logic, future retrospective parsing) depend on byte-stable output. ADR 015 and ADR 018 carry the same brittleness; the trade-off is accepted as the cost of mechanical parsing.
- **Gate fatigue.** Four review gates per phase is a lot of orchestration. If the editor consistently passes when sw-critic passes, the gate is not adding signal and should be retired (reassessment criterion 1). If sw-critic and editor consistently flag the same axis, the boundary has collapsed (reassessment criterion 2). The risk is that adding gates becomes a default response to recurrence-of-quality-issues; the alternative the team should revisit if a fifth gate is ever proposed is whether the existing gates need tightening rather than a new gate.
- **LinkedIn-teaser scope gap.** The editor reviews the brief body, not the LinkedIn teaser. P013 added a voice gate on the teaser at SKILL step 15.5 because the teaser is its own surface; the editor inherits the same surface-coupling argument and is silent on the teaser by ADR 020 design. If retrospective shows would-read failures on teasers that the brief-body gate does not predict, ADR 020 needs revisiting.

## Confirmation

1. **Output format pinned (extended 2026-06-17 per P081; see Amendment 2026-06-17).** `.claude/agents/wr-newsletter-editor.md` documents the `EDITOR_REVIEW:` block format above verbatim. The block must include `WOULD_OPEN`, `WOULD_READ_THROUGH`, `WOULD_FORWARD` (each `yes|no|tentative`), an `EDITORIAL_FINDINGS` list, an `EDITORIAL_CRAFT` block (`Strengths:` list plus a `Weaknesses:` list whose entries carry the craft-axis vocabulary `opener-earns-thesis|fold-compression|audience-pointer-specificity|sentence-rhythm|atwn-thesis-fit|close-collects-the-so-what|signpost-promises-match-contents|item-placement|edition-internal-consistency|other` with Passage / Issue / Suggested fix), and `EDITOR_VERDICT: <PASS|NEEDS_EDITORIAL_REVISION>`. Format changes require amending or superseding ADR 020 (this criterion was itself amended in place under recorded Tom-direction; see Amendment 2026-06-17). Downstream consumers (SKILL.md step 16 save logic) depend on byte-stable output, so the agent file and SKILL.md step 15.25 parse block must move in lockstep.
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

  > **This criterion has a known false positive as of 2026-08-07 (P122 amendment).** An assembly axis can be genuinely unremediable within a cycle: `item-placement` on an edition whose item set is fixed has no fix short of dropping an item. The editor then cannot return PASS, Tom publishes anyway, and this criterion fires on a gate that is working correctly. Both remedies named above would be the wrong fix. Before acting on this criterion, check whether the repeated overrides trace to an unremediable axis rather than to mis-calibration.
- **If the editor consistently catches axes that retrospective shows the LinkedIn teaser also exhibits** (and the brief-body gate did not predict), the LinkedIn-teaser scope gap (Bad consequence 4) needs revisiting; a follow-up ADR may extend ADR 020 to a second invocation site or carve out a teaser-specific agent.
- **If cumulative subagent cost** (voice plus content-risk plus sw-critic loop plus editor plus any future gates) crosses 15 invocations per issue at weekly cadence, the ADR 016 line 77 cost precedent is no longer obviously fitting. The team should explicitly re-assert the budget or trim a gate.

  > **This criterion is a TRIGGER, not a ceiling (corrected 2026-08-07 by ADR-044, Cross-edition shape as a fresh-context subagent gate).** It contains no prohibitive verb and sets no limit. It names two valid responses to crossing 15, and adding a gate while re-asserting the budget is the first of them. The precedent it defers to sets no number either: ADR-016's cost consequence reads "two to six more subagent invocations per issue. At weekly cadence this is negligible; reassess if cadence shifts", so its own trigger is a cadence change rather than a count. (Cite ADR-016 by content: the "line 77" pointer above has drifted.) ADR-016 is additionally superseded and marked `rejected-pending-supersede`, so it is a historical entry, not a live constraint.
  >
  > **The trigger was exercised as written on 2026-08-07.** The pipeline stood near 25 invocations per issue, Tom considered the cost, and the budget was RE-ASSERTED rather than a gate trimmed. ADR-044 adds up to 6 more worst case, landing near 31. The constraint that actually binds is ADR-017's under-one-hour finalise-session criterion, read day-agnostic since ADR-030 moved publication to Monday. Do not re-open this as an unanswered question.


- **Vocabulary growth, partition collapse, or axis mis-fire** (added 2026-08-07, P122). Any one of three limbs fires this criterion.
  1. **Size.** The named craft axes, excluding `other`, grow past 12. They stand at 9 after the 2026-08-07 (P122) amendment, so this fires at 13. Deliberately scoped to the craft block, because that is the vocabulary that amendment grew and the one this criterion exists to watch. `EDITORIAL_FINDINGS` growth is NOT governed by a size count anywhere, which is a known gap rather than a delegation; limb 2 does watch those axes for collapse, and if that vocabulary ever grows this criterion should be widened rather than a parallel one added. Consequence: the vocabulary has outgrown the prose-prompt instrument ADR 035 selected, and the question becomes whether a second agent should take a partition, not whether to keep adding names.
  2. **Collapse.** In each of four consecutive editions, some passage is cited under two axes drawn from this agent's pinned vocabulary, craft or `EDITORIAL_FINDINGS`. Read from the editor block in each edition's `<date>.reviews.md`, never from the residual-advisory list, which excludes every remediated finding and would systematically undercount. Record the axis PAIR: the remedy is a merge and it is undecidable without knowing which two. For a cross-block pair a single co-citation already breaches the agent's rule against repeating a passage flagged in the reader-experience pass, so one instance reads as a prompt bug; for a craft-to-craft pair no such rule exists, so only the four-edition pattern signals anything.
  3. **Mis-fire.** A single axis produces a remediation that Tom then undoes, across three consecutive editions. Observed from the diff between the finalise-time draft body and the published edition, which is the method P122's own reproduction fixture used. This is an adaptation of ADR 035's own cross-edition recurrence method, not a novel observable: only its `accepted_overrides` half is unavailable here (that list was the critic's under ADR-025's ceiling, ADR 035 retired it on 2026-06-02, and ADR-043 declined an author-override arm at its rejected Considered Option 5). A residual advisory Tom publishes over is NOT a revert: that is the criterion-4 false positive above, and it involves no applied edit. This limb requires an applied edit that Tom undid.