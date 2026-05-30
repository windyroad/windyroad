---
status: "proposed"
date: 2026-04-17
human-oversight: confirmed
oversight-date: 2026-05-30
decision-makers: [Tom Howard, Claude]
consulted: []
informed: []
related: [009-adopt-plugin-marketplace-for-claude-tooling, 011-ai-brief-orchestration-via-claude-code, 012-ai-generated-content-review-gates]
reassessment-date: 2026-07-17
---

# Wardley mapping as the strategic lens for the AI Engineering Brief

## Context and Problem Statement

ADR 011 established the walking-skeleton pipeline for the AI Engineering Brief as fetch candidates, filter through a three-lens criterion (technical, operational, human), draft three items, and review. The first run of that pipeline on 2026-04-17 produced a brief that was structurally a news roundup with per-item commentary. Tom rejected the result on two grounds: commentary that disparaged the reader's team (addressed by ADR 015), and a missing strategic frame that would let the Engineering Leader reader connect individual news items to the shape of the AI engineering landscape they operate inside.

Without a strategic frame, the brief has the same failure mode as most AI newsletters: each item reads as "thing happened, here is a take," and readers cannot compound their understanding week on week. The reader's job-to-be-done (`docs/JOBS_TO_BE_DONE.md` J1 Awareness and J3 Evaluation) depends on being able to see movement in the domain, not just individual events.

We need a strategic substrate that persists across issues, that each week's news updates, and that every brief item points back to. Wardley mapping is the natural fit: it represents components, their evolution stage, and movement, which is exactly the dimension the Engineering Leader needs to track. Tom's consulting frame is already Wardley-aware, which makes the map a differentiated product for Windy Road and a direct link to the commercial offer.

## Decision Drivers

- **Compounding reader value.** A weekly news feed commoditises; a weekly strategic artifact that evolves compounds. The Engineering Leader who reads 8 issues should see the map change shape, not just more headlines.
- **Reader job fit (J1, J3).** JTBD maps cleanly: J1 (Awareness) needs situational clarity, which a landscape map provides; J3 (Evaluation) needs ammunition to forward upward, which a named strategic frame provides.
- **Differentiation in the commodity-newsletter market.** Most AI newsletters are aggregators. Anchoring the brief to a living Wardley map gives Windy Road a structural POV that competitors cannot copy without authoring their own map.
- **Consulting offer alignment.** Tom's Patch Fitness Assessment and Engineering Leader advisory frame consulting engagements as "see your landscape, decide your moves." A Wardley-first newsletter is the top-of-funnel proof of the same frame.
- **Artifact reuse.** ADR 009 adopted the plugin marketplace and specifically the `wr-wardley` skill, which already renders OWM source to SVG/PNG. Reusing that pipeline for an external-landscape map costs near zero.
- **Git-native strategic artifact.** Storing the map as OWM text under git means week-to-week diffs are first-class: git log on `ai-landscape.owm` shows the exact movements that shaped each brief.

## Considered Options

1. **Wardley landscape map as the living strategic substrate for the brief** (chosen). Maintain `docs/ai-engineering-brief/ai-landscape.owm` as the canonical artifact. Each weekly issue updates the map with observed movements, then produces the brief as commentary on what moved. Every item in the brief points back to a map movement.
2. **No strategic frame.** Keep the walking-skeleton three-lens filter and three-item format. Brief stays a news roundup with commentary.
3. **Alternative strategic frame (promise canvas, capability radar, value-stream map).** Pick a different strategic artifact format and build the brief around that instead.
4. **Strategic frame authored per-issue rather than persisted.** Apply a Wardley-style lens per item without maintaining a map file between issues. Each brief is self-contained, no compounding artifact.

## Decision Outcome

Chosen option: **"Wardley landscape map as the living strategic substrate for the brief"** because it (a) compounds reader value across issues, (b) fits the Engineering Leader's jobs-to-be-done, (c) differentiates the brief in a crowded newsletter category, (d) aligns with the existing consulting frame and `wr-wardley` tooling, and (e) produces a git-native diff of strategic movement that feeds retrospectives and future archive surfaces.

**What this decision commits to:**
- `docs/ai-engineering-brief/ai-landscape.owm` is the canonical source, rendered to `.svg` and `.png` by `wr-wardley`'s `owm-to-svg.mjs`.
- `docs/ai-engineering-brief/ai-landscape.md` is the companion analysis (Differentiation, Evolution, Risk, Decisions sections) following the `wr-wardley` analysis rubric.
- The `/wr-newsletter` skill (ADR 011) reads both files as context before drafting each brief.
- The skill updates both files after drafting, committing the week's movements.
- Every brief item points back to at least one observable map movement (new component, position shift, evolution arrow change, or dependency change).

**What this decision does not commit to:**
- Automated publishing of the map or brief (ADR 011 is interactive; this ADR preserves that).
- Making the landscape map public on windyroad.com.au (that is a layer-7 question in `PLAN.md`).
- A fixed map shape. Components, positions, and dependencies evolve with the domain; this ADR commits to the *practice*, not to a specific map state.

## Consequences

### Good

- Reader job fit improves: the brief serves J1 and J3 as a compounding strategic artifact, not a disposable news digest.
- Competitive position improves: the brief has a structural POV competitors cannot copy without authoring their own map.
- Retrospectives gain signal: map diffs per issue reveal which weeks produced real movement vs. surface noise.
- Consulting offer alignment is explicit: the brief demonstrates the same strategic frame Tom uses in paid engagements, without disclosing client-specific maps.
- Tool reuse is high: `wr-wardley`'s OWM renderer runs as-is; rubric and analysis structure are portable.
- The per-issue "map movement" line in the draft template gives the filter a hard structural requirement, which reduces the chance of filler items passing the three-lens filter without strategic grounding.

### Neutral

- Map maintenance costs a few tokens per issue. Negligible at weekly cadence. Reassessed if we ever move to daily (see ADR 011 reassessment).
- The companion markdown analysis (`ai-landscape.md`) is itself an AI-generated prose artifact and inherits the voice + content-risk review obligations from ADR 012 and ADR 015.
- Positions on the map are judgement calls. Disagreement between the skill's proposed update and Tom's sense of the domain is resolved by Tom editing `ai-landscape.owm` by hand, then re-rendering.

### Bad

- The pipeline complexity grows: a failed map update can corrupt the substrate used by next week's brief. Partial-fetch policy (ADR 016, or SKILL.md failure modes) must explicitly cover the map-mutation step.
- The three-lens filter (`assets/three-lens-filter.md`) must be extended: candidates must also produce a map movement, otherwise the filter passes items the drafter cannot anchor. The change is small but structural.
- There is confusion risk with the existing `docs/wardley-map.*` codebase map. The two maps have different anchors and different purposes; `ai-landscape.md` already includes a purpose-statement paragraph to prevent conflation, but the risk remains for casual readers.
- The brief's quality is now coupled to the map's quality. A weak map produces weak briefs. This is addressed by ADR 016 (SW-critic gate over the map + analysis), but it is a new coupling the walking skeleton did not have.

## Confirmation

1. `docs/ai-engineering-brief/ai-landscape.owm` exists and is rendered to `.svg` and `.png` by `wr-wardley`'s `owm-to-svg.mjs`.
2. `docs/ai-engineering-brief/ai-landscape.md` exists with the four required sections (Differentiation, Evolution, Risk, Decisions) and passes the `wr-wardley` analysis quality rules (no inventory, triggers measurable, internal risk with number + time window, observable triggers, etc.).
3. `.claude/skills/wr-newsletter/SKILL.md` includes explicit steps: read the map before filtering, update the map after filtering, re-render, update the analysis, run the critic loop (ADR 016).
4. `.claude/skills/wr-newsletter/assets/three-lens-filter.md` adds a map-movement precondition or fourth lens so candidates that cannot anchor to a map movement are filtered out.
5. `.claude/skills/wr-newsletter/assets/draft-template.md` includes a mandatory "Map movement" line per item.
6. `docs/ai-engineering-brief/PLAN.md` is updated to reflect the Wardley substrate as a first-class pipeline step.
7. After the first 4 issues, a retrospective reviews whether the map diffs are producing reader-visible value or whether the substrate is overhead without return.

## Pros and Cons of the Options

### Wardley landscape map as the living strategic substrate (chosen)

- Good: compounding reader value; J1/J3 fit; differentiation; consulting alignment; tool reuse; git-native diff
- Bad: pipeline complexity grows; map-brief coupling; confusion risk with codebase map

### No strategic frame (walking-skeleton only)

- Good: simplest to maintain; no new substrate to protect
- Bad: commoditises against every other AI newsletter; no compounding reader value; no differentiated POV

### Alternative strategic frame (promise canvas, capability radar, value-stream map)

- Good: avoids Wardley-specific tool dependency
- Bad: Tom is Wardley-fluent, no sunk cost in the alternatives; the `wr-wardley` tooling is already built; other frames lack the evolution dimension that AI tooling most visibly exhibits

### Per-issue strategic frame without persisted map

- Good: no substrate to maintain; each brief self-contained
- Bad: no compounding across issues; no git-native diff; no differentiation from a skilled per-issue writer

## Reassessment Criteria

- If after 4 issues the map diffs are not generating reader-visible value (no forwards, no engagement lift, no commercial signal), revisit whether the substrate is worth the cost or whether the frame needs to change (e.g. from Wardley to a simpler evolution tracker).
- If the map shape stabilises to the point that monthly updates serve the same purpose as weekly, move the map-update step to a monthly cadence while keeping the brief weekly.
- If the `wr-wardley` tool evolves in a way that changes its output contract (OWM syntax, SVG format), reassess whether the AI Engineering Brief should pin to a specific `wr-wardley` version or adopt the change.
- If a new content surface (blog post, consulting deliverable, archive page) reuses the landscape map, consider extracting the map maintenance workflow from the newsletter skill into its own skill, with the newsletter as one consumer.
