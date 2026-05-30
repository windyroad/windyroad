# Problem 015: wr-newsletter drafter paraphrases per-item AskUserQuestion "Adjust" text into abstract commentary, losing Tom-voice fidelity

**Status**: Verification Pending
**Reported**: 2026-04-21
**Origin**: internal
**Transitioned to Known Error**: 2026-04-25 (review pass: root cause confirmed by 2026-04-19 edition; workaround = manual external review)
**Transitioned to Verification Pending**: 2026-04-25 (Parts 1 + 2 of Fix Strategy released to wr-newsletter SKILL.md per ADR 019; Part 3 deferred per ticket)
**Priority**: 16 (High). Impact: Significant (4) x Likelihood: Likely (4)
**Effort**: L (multi-file change: SKILL.md drafter prompt, pipeline plumbing for transcript artifact, optional rubric check). Re-rate on architect review of the fix plan.
**WSJF**: (16 x 2.0) / 4 = 8.0
**Re-rated 2026-04-25**: Likelihood Possible (3) to Likely (4). Frequency line in description says "every edition where Tom supplies Adjust text. Likely most editions"; aligns with Likely (4). Status auto-transitioned to Known Error.

## Description

The `/wr-newsletter` skill runs a per-item interactive capture via `AskUserQuestion` (SKILL step 4.5, per memory `feedback_per_item_interactive_voice.md`). For each candidate item, Tom is offered Agree / Adjust / Drop. When Tom picks Adjust and supplies notes, those notes are supposed to feed the drafter and become the voice of the rendered item.

On the 2026-04-19 Tokens Spent (Developer persona) edition, the interactive capture did run. But the drafter paraphrased Tom's adjust text into abstract commentary instead of preserving the load-bearing noun-phrases and first-person observations. The rendered items read as plausible-AI-with-opinions rather than captured-from-Tom.

The existing 25 critic checks passed (round 3 PASS) because they score structural attributes (attribution, section presence, claim-evidence match, LinkedIn formatting) and cannot detect "this paragraph was paraphrased from a specific input transcript". The expanded 31-check rubric (P008 second wave, 2026-04-21) closes the shallowness gap in aggregate via check_26 (quantification), check_27 (first-person evidence), check_30 (no deference), check_31 (no platitude human angles), but none of those checks operate on the capture transcript; they score the rendered body in isolation.

## Symptoms

- Interactive capture runs and Tom supplies Adjust notes; the rendered item contains abstract commentary that shares the topic but not the specifics of the captured input
- Distinctive Tom-voice phrasings (specific noun-phrases, observations, first-person claims about the Windy Road stack) flatten into generic commentary in the body
- Critic rubric passes because the body reads well in isolation; the fidelity loss is invisible without the transcript as reference
- Tom's external editorial review catches the gap after the fact (P008 symptom pattern repeats)

## Workaround

None automated. Current workaround is Tom's manual external review before publishing. This does not scale and is exactly the gap P008 was opened to close at the rubric level. This ticket covers the complementary gap at the drafter-and-plumbing level.

## Impact Assessment

- **Who is affected**: Tokens Spent subscribers (Developer persona, JTBD-200 through JTBD-205), The Shift subscribers (Engineering Leader persona, JTBD-001 through JTBD-003). Both newsletters run through the same drafter + capture + critic pipeline.
- **Frequency**: Every edition where Tom supplies Adjust text. Likely most editions once the interactive capture becomes routine.
- **Severity**: High. The Developer persona jobs explicitly depend on perspective that reads as authored (JTBD-203 Peer Validation, JTBD-205 Trust Shipped vs Demo). Generic commentary erodes the credibility that newsletters are supposed to earn.
- **Analytics**: Qualitative (Tom's own review). No quantitative signal until subscriber feedback or churn data surfaces.

## Root Cause Analysis

### Root Cause (confirmed by the 2026-04-19 edition and Tom's AskUserQuestion answer on 2026-04-21)

Two coupled failures produce the same symptom. Both need to be addressed; fixing one without the other leaves the failure mode intact.

1. **Drafter discipline.** The drafter (whether a subagent or the main assistant pass) receives the Adjust text as input but summarises it into its own words when composing the item body. The SKILL.md step 4.5 does not instruct the drafter to preserve load-bearing noun-phrases verbatim; it is silent on fidelity.
2. **No transcript available to the critic.** The capture transcript (Agree/Adjust/Drop decisions plus Adjust text) is not written to an artifact adjacent to the draft. The critic loop runs on the draft alone and has no reference to compare against, so even a critic check scoped to fidelity would have no input.

### Fix Strategy

Three-part fix, all three needed for a durable result:

1. **Drafter discipline change (SKILL.md step 4.5).** Update the drafter's working instructions: when composing an item from an Adjust capture, preserve the specific noun-phrases, first-person observations, and named artifacts from the capture input verbatim wherever the LinkedIn column can carry them. Paraphrase only connective tissue and headline framing. Mark the verbatim spans if helpful (e.g. inline comment during draft generation, removed before publish) so the critic can see what came from capture and what came from synthesis.
2. **Pipeline plumbing: write capture transcript as an artifact.** When the skill runs the per-item capture, write the Agree/Adjust/Drop decisions and the Adjust text to an artifact adjacent to the draft (for example `src/newsletters/drafts/<persona>/YYYY-MM-DD.capture.md`). The critic, voice, and content-risk gates all gain access to this artifact for verification.
3. **Optional new critic check (defer until 1 and 2 land).** `check_32: Capture fidelity`. Scoped to editions where a capture transcript exists. The critic compares each item body against its Adjust text and flags any load-bearing noun-phrase (named tool, specific quantitative claim, first-person observation) that is present in the capture but absent (or flattened to abstraction) in the body. UNMET if the flatten rate exceeds some threshold to be defined once the plumbing is in place and a baseline can be measured.

### Investigation Tasks

- [x] Confirm with Tom whether the drafter receiving the Adjust text is a subagent invocation or an inline pass; this determines where the verbatim-preservation instruction lands. **Resolved 2026-04-25: inline main-assistant pass.** SKILL.md step 11 ("Draft the brief") has no Agent invocation; voice / content-risk / SW-critic gates that follow are subagents but the drafter itself is inline. Verbatim-preservation instruction lands as SKILL prose (the inline drafter reads SKILL.md as its working instructions). ADR 019 documents the rationale for keeping the drafter inline rather than promoting it to a fresh-context subagent (P015 is a discipline failure, not a confirmation-bias failure; subagent promotion would lose access to the AskUserQuestion conversation history).
- [x] Design the capture transcript file format (markdown with per-item sections; include persona, date, each item's Agree/Adjust/Drop outcome and Adjust text). **Resolved 2026-04-25: format specified in ADR 019.** Sibling markdown file at `<draft-folder>/YYYY-MM-DD.capture.md` with frontmatter (persona, edition, date, phase-written, phase-last-appended) and per-item sections (Outcome, Original take presented, Source, Adjust text verbatim, Drop reason, Ask for help question).
- [x] Update SKILL.md step 4.5 with the verbatim-preservation instruction and the transcript-write step. **Resolved 2026-04-25: actual step numbers are 10 (per-item capture, where transcript write lands) and 11 (drafter, where capture-fidelity rule lands), not 4.5.** SKILL.md step 10 now writes `<draft-folder>/YYYY-MM-DD.capture.md`; step 10-prime appends new-item entries during finalise and handles the missing-file case via AskUserQuestion. SKILL.md step 11 now includes a "Capture fidelity (P015 + ADR 019)" rule alongside the existing voice rules. Step 17 Tom-summary names the capture transcript path and bundles the published-folder move reminder.
- [defer] Decide whether `check_32: Capture fidelity` is worth the scope cost now or should wait for a baseline of N editions with the transcript artifact in place. **Deferred 2026-04-25 per ticket Fix Strategy.** Parts 1 + 2 land first; check_32 lands after a baseline of editions-with-transcript exists and the discipline rule's effectiveness can be measured. Per ADR 019 confirmation criterion 7, when check_32 is taken up, an ADR 016 amendment ships alongside it adding a third input slot to the wr-sw-critic agent contract (currently `artifact_path` + `rubric_path`; check_32 needs a `reference_artifact_path` for the capture transcript).
- [ ] Run the expanded rubric + transcript pipeline against a test edition and confirm Tom-voice lands. **Verification trigger.** Fires on the next `/wr-newsletter` run where Tom supplies Adjust text. Closure trigger: rendered items preserve Tom's load-bearing noun-phrases verbatim, validated by Tom's external review and by comparing the rendered Item against `<draft-folder>/YYYY-MM-DD.capture.md`.

## Fix Released

Released 2026-04-25 in commit covering:

- `docs/decisions/019-capture-transcript-artifact.proposed.md` (new ADR documenting the file class, lifecycle, and inline-drafter rationale)
- `.claude/skills/wr-newsletter/SKILL.md` step 10 (capture transcript artifact write), step 10-prime (append + missing-file branch), step 11 (Capture fidelity rule), step 17 (Tom-summary mentions transcript path and bundled-move reminder)

Parts 1 + 2 of Fix Strategy landed:

- **Part 1 (drafter discipline)**: SKILL.md step 11 now instructs the drafter to preserve load-bearing noun-phrases, first-person observations, named artifacts, model versions, dates, and quantitative claims from each item's Adjust capture verbatim. Paraphrase only connective tissue. Optional `{{verbatim}}…{{/verbatim}}` markers during generation, stripped before save.
- **Part 2 (transcript artifact)**: SKILL.md step 10 writes `<draft-folder>/YYYY-MM-DD.capture.md` after the per-item capture completes. Step 10-prime appends new-item sections during finalise (ADR 019 lifecycle: append-and-survive, never deleted). Missing-file branch handled via AskUserQuestion (Continue without / Recreate / Abort).

Part 3 (`check_32: Capture fidelity` in `newsletter-critic-rubric.md`) explicitly deferred. When taken up in a future iteration, an ADR 016 amendment ships alongside it (per ADR 019 confirmation criterion 7) adding a third input slot to the wr-sw-critic agent contract.

Verification trigger: next `/wr-newsletter` run where Tom supplies Adjust text. Tom's external review compares the rendered Item against `<draft-folder>/YYYY-MM-DD.capture.md` to confirm verbatim preservation.

## Related

- Problem 008 (critic rubric misses external-review findings). This problem is the pipeline-plumbing follow-up the architect flagged when advising on the second-wave rubric expansion (2026-04-21). The 31 new checks close the shallowness gap at the body-level scoring layer; this problem closes the adjacent gap that even substance-aware body scoring cannot reach without a reference transcript.
- `.claude/skills/wr-newsletter/SKILL.md` step 4.5 (per-item interactive capture; the drafter-discipline edit lands here)
- `.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md` (31 checks as of 2026-04-21; host for potential check_32 once plumbing lands)
- `src/newsletters/drafts/developer/2026-04-19.md` (the passing-but-shallow edition that triggered this ticket)
- Memory: `feedback_per_item_interactive_voice.md` (the decision to use AskUserQuestion-based per-item capture); `feedback_each_review_is_separate_subagent.md` (gates run as separate subagents, relevant to whether the critic can reasonably take a second input artifact)
- ADR 016 (SW-critic subagents and iteration loop; any new critic check must fit the 3-round exit criteria)
