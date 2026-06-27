---
status: "proposed"
date: 2026-04-25
human-oversight: confirmed
oversight-date: 2026-05-30
decision-makers: [Tom Howard, Claude]
consulted: []
informed: []
related: [011-ai-brief-orchestration-via-claude-code, 012-ai-generated-content-review-gates, 015-reader-respect-and-gate-rejection-policy, 016-sw-critic-subagents-and-iteration-loop, 017-ai-brief-prep-and-finalise-phases, 018-content-risk-subagent]
reassessment-date: 2026-07-25
amended-by: [039-per-date-subdir-layout-for-published-newsletter-editions, 040-per-date-subdir-layout-for-newsletter-drafts]
---

# Capture-transcript artifact for AI-brief drafter fidelity

## Amendment Note (2026-06-02, ADR-039)

ADR-039 (per-date sub-directory layout for published newsletter editions) refreshes the path encoding of the published-folder move workflow described in this ADR. The substance of the move workflow is unchanged (Tom moves the capture transcript alongside the brief and other siblings when he publishes); the target location now resolves to `<published-folder>/<persona>/<publication-date>/<publication-date>.capture.md` (per-date sub-directory) rather than `<published-folder>/<persona>/<publication-date>.capture.md` (flat). Affected prose in this ADR: line 37 (chosen-option text), line 84 (Lifecycle), lines 116, 118, 131, 141, 167 (Consequences, Confirmation, Pros/Cons, Reassessment). The historical line-numbered prose below is left as written for audit-trail continuity; consumers should read this note as the load-bearing path-encoding statement.

## Amendment Note (2026-06-27, ADR-040)

ADR-040 (per-date sub-directory layout for newsletter drafts) extends the ADR-039 published-side per-date sub-directory layout to the drafts folder. The substance of this ADR (the capture transcript is a sibling artefact co-located with the brief by shared date prefix) is unchanged; the draft-side capture path now resolves to `<draft-folder>/<publication-date>/<publication-date>.capture.md` (per-date sub-directory) rather than `<draft-folder>/<publication-date>.capture.md` (flat). The drafts-side path encodings in the prose below have been refreshed to the sub-directory shape in lockstep per ADR-040's Confirmation criterion (no surviving flat `drafts/<persona>/<YYYY-MM-DD>.<ext>` references). The published-side encoding remains governed by the ADR-039 amendment note above.

## Context and Problem Statement

The `/wr-newsletter` skill runs a per-item interactive capture via `AskUserQuestion` (SKILL step 10). For each shortlisted candidate, Tom is offered Agree, Adjust, or Drop. When Tom picks Adjust and supplies free-text notes, those notes are supposed to feed the drafter (step 11) and become the rendered item's voice.

Problem 015 (`docs/problems/015-drafter-paraphrases-interactive-capture-text.known-error.md`) recorded the failure mode that closed this loop badly: the drafter paraphrased Tom's Adjust text into abstract commentary instead of preserving load-bearing noun-phrases, first-person observations, and named artifacts. The 31-check critic rubric passed because the body reads well in isolation; the fidelity loss is invisible without the capture text as a reference.

P015's Fix Strategy is three-part: (1) drafter discipline change in step 11 to preserve verbatim spans, (2) write the capture conversation to an artifact adjacent to the draft so later gates and human review can verify against it, (3) optional `check_32: Capture fidelity` rubric check, deferred until parts 1 and 2 land and a baseline of editions-with-transcript exists.

Parts 1 and 2 land together. Part 1 is a discipline rule that fits inside SKILL.md step 11's existing voice-rules block. Part 2 introduces a new artifact class under `<draft-folder>` and changes file-lifecycle assumptions that ADR 017 set for prep and finalise. The new file class needs its own decision record so the lifecycle, consumer list, and inline-vs-subagent-drafter rationale are documented in one place rather than spread across SKILL.md prose.

This ADR is that record.

## Decision Drivers

- **Fidelity reference must outlive the conversation.** The Adjust text exists only in the live `AskUserQuestion` turn. Without persisting it to a file, the drafter has the text in context for one turn and then loses it; the critic, voice, and content-risk gates never have access; Tom's external review has nothing to compare the rendered item against.
- **Phase boundaries do not own this artifact.** ADR 017 introduced a state-handoff principle for `.prep.md` ("introducing a separate state-management system would itself become friction"; line 124 caps `.prep.md` frontmatter at 8 fields). The capture transcript is a different concern: it is fidelity reference, not phase state. Storing it inside `.prep.md` frontmatter would cross ADR 017's threshold; storing it as a separate sibling file keeps both contracts clean.
- **The drafter stays inline.** P015 is a discipline failure, not a confirmation-bias failure. Promoting the drafter to a fresh-context subagent (the ADR 016 / ADR 018 pattern) would lose access to the AskUserQuestion conversation history that supplies the Adjust text. The discipline rule lands as SKILL prose because the SKILL prose is what the inline drafter reads. This is a deliberate departure from the gate-promotion pattern, justified by the different failure mode.
- **Consumer list grows over time.** The drafter is the immediate consumer (Part 1). The deferred `check_32` rubric check will be the second (Part 3 of P015). Voice and content-risk gates may become consumers if a future ticket establishes that fidelity belongs in their scope. Naming the file convention, lifecycle, and contract once means each new consumer reuses the same artifact rather than re-deriving it.
- **No ADR 017 supersession.** ADR 017's prep / finalise lifecycle is unchanged. The capture transcript is additive: a new sibling artifact with its own lifecycle, not a modification of `.prep.md` or the final `.md`.

## Considered Options

1. **Sibling markdown file at `<draft-folder>/YYYY-MM-DD/YYYY-MM-DD.capture.md`, append-and-survive across phases** (chosen). Prep writes the file after step 10 completes. Finalise (step 10-prime) appends new-item entries and carries prep entries forward. The file moves to `<published-folder>` together with the published `.md` when Tom moves the published edition. The file is never deleted by the pipeline.
2. **Embed capture transcript inline in `.prep.md` and `.md` frontmatter or body.** Rejected: (a) crosses ADR 017's 8-field cap on `.prep.md` frontmatter for any week with three or more Adjusts; (b) bloats the published `.md` with internal substrate that has no reader value; (c) pulls capture content into the same file that voice / content-risk / critic blocks live in, conflating drafter-input with drafter-output review.
3. **Sidecar JSON file at `<draft-folder>/YYYY-MM-DD/YYYY-MM-DD.capture.json`.** Rejected: markdown is the project default for human-readable substrate (`feedback_map_is_internal_only.md` precedent); JSON would force a parser for what is fundamentally a small structured-prose record; the rubric and gate consumers already operate on markdown.
4. **Separate state directory at `src/newsletters/captures/<persona>/`.** Rejected: introduces a third top-level directory under `src/newsletters/` for one artifact class. Co-locating the capture next to the draft it belongs to (same folder, same date prefix, different suffix) is the same pattern `<draft-folder>/YYYY-MM-DD/YYYY-MM-DD.cover.<ext>` already establishes for the cover image.
5. **Drafter-as-subagent with capture text passed via prompt parameter.** Rejected: the subagent loses the AskUserQuestion conversation history that the inline drafter has direct access to. P015's failure mode is discipline, not bias; the subagent promotion would solve the wrong problem and introduce a new one (every Adjust would have to be serialised into a prompt parameter, which is the same as writing a file plus an extra hop).

## Decision Outcome

Chosen option: **"Sibling markdown file at `<draft-folder>/YYYY-MM-DD/YYYY-MM-DD.capture.md`, append-and-survive across phases."**

**File location.** `<draft-folder>/YYYY-MM-DD/YYYY-MM-DD.capture.md` for both personas. Resolved at SKILL step 0 alongside `<draft-folder>` itself: `src/newsletters/drafts/leader/YYYY-MM-DD/YYYY-MM-DD.capture.md` or `src/newsletters/drafts/developer/YYYY-MM-DD/YYYY-MM-DD.capture.md`. Same date prefix as the corresponding `.prep.md` or `.md` so glob-by-date pulls the bundle together.

**File format.** Markdown with YAML frontmatter:

```
---
persona: <leader|developer>
edition: <N from step 11>
date: <YYYY-MM-DD>
human-oversight: confirmed
oversight-date: 2026-05-30
phase-written: <prep|finalise|full>
phase-last-appended: <prep|finalise|full>
---

# Capture transcript: <publication-name>, week ending YYYY-MM-DD

## Item N: <one-sentence story summary>

- **Outcome**: <Agree | Adjust | Drop | Keep as Also-worth-noting | Ask for help>
- **Original take presented**: <the "Our take" sentence shown in the AskUserQuestion prompt>
- **Source**: <URL>
- **Adjust text** (if outcome is Adjust):

  > <Tom's free-text verbatim, indented as quoted block>

- **Drop reason** (if outcome is Drop): <Tom's reason>
- **Ask for help question** (if outcome is Ask for help): <Tom's question>

## Item N+1: ...
```

**Lifecycle across phases.**

- `phase=full`: write the file once after step 10 completes.
- `phase=prep`: write the file after step 10 completes. Frontmatter `phase-written: prep`, `phase-last-appended: prep`.
- `phase=finalise` (step 10-prime): read the existing `<draft-folder>/YYYY-MM-DD/YYYY-MM-DD.capture.md`. Append new-item sections for any items captured in step 10-prime (new tier-1 items, late-story Also-worth-noting items, new WEAK_ATTRIBUTION items). Update frontmatter `phase-last-appended: finalise`. Do not rewrite or delete prep-time entries.
- The file is never deleted by the pipeline. When Tom moves the published `<draft-folder>/YYYY-MM-DD/YYYY-MM-DD.md` to `<published-folder>/<persona>/YYYY-MM-DD.md`, he moves `YYYY-MM-DD.capture.md` to `<published-folder>/<persona>/YYYY-MM-DD.capture.md` alongside it. SKILL step 17 (Tom-summary) calls this out.

**Missing-file handling (phase=finalise).** If step 10-prime cannot find an existing `<draft-folder>/YYYY-MM-DD/YYYY-MM-DD.capture.md` matching the prep date, surface to Tom via `AskUserQuestion`:

- **question**: `"phase=finalise expected a capture transcript at <expected-path>. Continue without capture transcript (drafter discipline rule has no input), Recreate transcript from prep-time shortlist (best-effort, Adjust text will be empty), or Abort?"`
- **options**: `Continue without capture transcript`, `Recreate transcript from prep-time shortlist`, `Abort`.
- **multiSelect**: false

Default branch when Tom is unavailable: `Continue without capture transcript`. The drafter loses the verbatim-preservation reference for prep-time items but does not block publication.

**Drafter remains inline.** SKILL step 11 / 11-prime continues as a main-assistant pass, not a subagent. The capture-fidelity discipline rule lands in SKILL prose alongside the existing voice rules. The inline drafter has direct access to both the AskUserQuestion conversation history (live) and the capture transcript file (persisted). Both inputs feed the same fidelity discipline.

**Consumer list (current and forecast).**

- **Now**: SKILL step 11 / 11-prime drafter (reads AskUserQuestion turn directly; the file is the persisted backup and the reference for human review).
- **Deferred (P015 Part 3)**: `check_32: Capture fidelity` in `newsletter-critic-rubric.md`. When this lands, it requires an ADR 016 amendment because the wr-sw-critic agent contract currently names exactly two inputs (`artifact_path`, `rubric_path`); a third input slot (`reference_artifact_path` or rubric-internal convention) needs to be agreed.
- **Possible**: voice gate (step 13) and content-risk gate (step 14) could read the capture transcript if a future ticket establishes that fidelity belongs in their scope. Today they do not read adjacent files (`wr-sw-critic.md` line 31 forbids it without explicit rubric instruction). Adding either as a consumer is its own decision.

**Behaviour during voice / content-risk / critic gates today.** Unchanged. The gates read the draft body only. The capture transcript exists as a sidecar file but is not yet wired into any gate input contract.

## Consequences

### Good

- The drafter has a persisted reference for verbatim-preservation, surviving across the AskUserQuestion turn and across the prep / finalise boundary.
- Tom's external editorial review can compare rendered items against the capture transcript directly, replacing the manual recall that surfaced the P015 failure mode in the first place.
- New consumer wiring (P015 Part 3 check_32; possible voice / content-risk extensions) has a defined contract to read against. The contract is named once and reused, mirroring ADR 016 / ADR 018's "single agent, many rubrics" pattern at the file-input layer.
- ADR 017's prep / finalise lifecycle is unchanged. The capture transcript is additive: a new sibling, not a modification.
- Inline drafter pass is preserved. The justification (discipline vs bias) is documented, so the next contributor reading ADR 016 / ADR 018 understands why the drafter is not also a fresh-context subagent.

### Neutral

- One additional file per edition under `<draft-folder>` and `<published-folder>`. The file is small (one section per item, typically three to seven items) and human-readable, so the maintenance overhead is low.
- The missing-file branch in step 10-prime adds one `AskUserQuestion` interaction in the rare case where the capture transcript is absent at finalise time. Default branch (`Continue without capture transcript`) keeps the pipeline running.
- The published-folder move workflow now bundles two files instead of one. Documented in step 17 Tom-summary.

### Bad

- The capture transcript is internal substrate, like the Wardley map. It must not leak into reader-facing surfaces. A future ticket that adds the file to a public archive would need to gate it behind the same rule that keeps the map internal (`feedback_map_is_internal_only.md`).
- A consumer that reads the capture file but mishandles the Adjust text could re-introduce the P015 failure mode in a new place (e.g. a future `check_32` that paraphrases Adjust text into its own UNMET-finding prose). The contract must specify verbatim quoting at every consumer boundary, not just at the drafter.
- The append-only lifecycle relies on the file-write step being idempotent within a phase. If finalise re-runs after a partial failure and re-appends the same new-item sections, duplicates appear. The append step must check for existing item-section anchors before writing. This is straightforward but is a class of bug the prep / finalise rename does not have.

## Confirmation

1. `<draft-folder>/YYYY-MM-DD/YYYY-MM-DD.capture.md` exists and matches the documented format on the next live `/wr-newsletter` run that captures at least one Adjust outcome.
2. `.claude/skills/wr-newsletter/SKILL.md` step 10 (full / prep) writes the file. Step 10-prime (finalise) appends new entries and carries prep entries forward.
3. SKILL.md step 11 / 11-prime contains the capture-fidelity discipline rule alongside the existing voice rules, and explicitly cites this ADR.
4. SKILL.md step 17 (Tom-summary) names the capture transcript path alongside the draft path, and the published-folder move reminder bundles both files.
5. SKILL.md step 10-prime handles the missing-capture-file case via `AskUserQuestion` per the chosen-option text.
6. P015 transitions to Verifying after the SKILL.md edits land and this ADR ships. Verification trigger: next `/wr-newsletter` run where Tom supplies Adjust text. Closure trigger: the rendered items preserve Tom's load-bearing noun-phrases verbatim, validated by Tom's external review and by the capture transcript existing as a comparison reference.
7. When P015 Part 3 (`check_32: Capture fidelity`) is taken up in a future iteration, an ADR 016 amendment ships alongside it adding the third input slot to the wr-sw-critic agent contract. Recorded as Investigation Task in P015 (item 4 resolved as "defer", item 5 added as "ADR 016 amendment required when check_32 lands").

## Pros and Cons of the Options

### Sibling markdown file `YYYY-MM-DD.capture.md`, append-and-survive (chosen)

- Good: matches `<draft-folder>/YYYY-MM-DD/YYYY-MM-DD.cover.<ext>` co-location precedent; markdown is project default; lifecycle is decoupled from ADR 017's `.prep.md` rename; consumer list can grow without re-deriving the contract
- Bad: one extra file in `<draft-folder>` and `<published-folder>`; append-step needs idempotency check; published-folder move bundles two files

### Embed in `.prep.md` and `.md` frontmatter or body

- Good: zero new files
- Bad: crosses ADR 017's 8-field frontmatter cap; bloats the published `.md` with internal substrate; conflates drafter-input with drafter-output review blocks

### Sidecar JSON file

- Good: machine-parseable
- Bad: project default is markdown for human-readable substrate; rubric and gate consumers already operate on markdown; no current need for JSON's structure beyond what markdown sections provide

### Separate state directory `src/newsletters/captures/<persona>/`

- Good: keeps `<draft-folder>` clean
- Bad: introduces a third top-level directory for one artifact class; breaks the same-date co-location pattern that `<draft-folder>/YYYY-MM-DD/YYYY-MM-DD.cover.<ext>` already establishes

### Drafter-as-subagent with capture passed by prompt parameter

- Good: matches ADR 016 / ADR 018's gate-promotion pattern at face value
- Bad: solves the wrong problem (P015 is discipline, not bias); loses AskUserQuestion conversation history; serialising Adjust text into a prompt parameter is the same as writing a file plus an extra hop

## Reassessment Criteria

- After 4 editions with capture transcripts, review whether the drafter's verbatim-preservation discipline holds. If P015's failure mode recurs despite the rule and the file existing, the discipline change alone is insufficient and `check_32` (P015 Part 3) needs to land sooner than baseline-of-N would suggest.
- If the capture transcript starts being read by a second consumer (voice gate, content-risk gate, or check_32), the input contract becomes load-bearing for multiple agents. At that point this ADR may need to harden the format spec (named anchors, stable section IDs) so changes do not silently break consumers.
- If the published-folder workflow becomes friction (Tom forgets to move the capture file alongside the .md), automate the move via a post-publish script and revisit whether the capture transcript should live in a separate state directory after all.
- If a third newsletter persona is added, this ADR's `<draft-folder>` resolution still works without amendment. If a non-newsletter content surface (blog, social, landing page) needs an analogous capture transcript, generalise the file-naming convention rather than copy-pasting it.
