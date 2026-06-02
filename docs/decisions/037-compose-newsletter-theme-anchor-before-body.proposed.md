---
status: "proposed"
date: 2026-06-02
human-oversight: confirmed
oversight-date: 2026-06-02
decision-makers: [Tom Howard, Claude]
consulted: [wr-architect:agent, wr-jtbd:agent]
informed: []
reassessment-date: 2026-09-02
amends: [032-newsletter-editorial-discipline-policy]
composes-with: [017-ai-brief-prep-and-finalise-phases, 011-ai-brief-orchestration-via-claude-code]
related: [019-capture-transcript-artifact, 024-url-verification-gate-in-wr-newsletter, 035-critic-rubric-shape-is-strengths-weaknesses-plus-context]
---

# Compose newsletter theme anchor before body, with approval gate

## Context and Problem Statement

The `/wr-newsletter` SKILL.md step 11 (Draft the brief) composes the full edition body (opener, bridge, ~3 Item blocks per ADR-032, Also-worth-noting, CTA) and derives the H1 in the same monolithic drafter pass. The H1 is a by-product of the body work rather than the load-bearing theme that authored it.

When the H1 needs rework after gate review or Tom's editorial pass, the downstream items often need rework too because the body was authored to thread the original H1's frame. Opener tone, bridge phrasing, item ordering, and item Why-it-matters lines all carry the original theme.

ADR-032 codified the *what* (thesis-first intro as element 1 of the shape); this ADR codifies the *when* (authored before body, with approval gate between). Without a when, ADR-032's thesis-first intro continues to be independently authored at step 11 alongside the body, which is the exact problem this ADR fixes.

The 2026-06-01 prep run for The Shift Issue 07 exhibited this directly:

- Initial H1 produced colon-flourish plus jargon-stack failures. Tom rejected with "all the headings are horrible".
- First rewrite of headings (matching plain-declarative style). Tom approved headings with "much better".
- Body review revealed body-level jargon stacks ("services-arm", "tier-1 + eval-governance + eval-harness", "sandboxing patterns", "substrate-concentration trajectory") had been authored under the original substrate-collision theme. 8 body edits applied.
- H1 swap to opinionated verdict pair ("The AI pilot phase is over. The discipline phase has started.").
- Opener rewrite from scratch because the original opener argued for the substrate-collision frame, not the pilot-to-discipline arc the new H1 names.
- Bridge paragraph dropped because the new opener subsumed it.
- Cover image re-rendered three times (initial, post-headings rewrite, post-H1-swap).

Aggregate cost was approximately 30 minutes of iteration, plus N gate re-runs (voice rounds 1 to 3, sw-critic rounds 1 to 3, architect plus JTBD twice per file). The body work done before the H1 was settled was largely wasted because the new H1 reframed the theme.

P076 captured the gap; this ADR codifies a single canonical composition order that the drafter targets directly.

## Decision Drivers

- **Theme anchor first.** The H1, cover hook lines, and one-paragraph theme statement carry the editorial frame; the body threads that frame. Composing the anchor first means the body work amortises against a settled frame rather than a tentative one.
- **Approval before commitment.** An explicit Tom-approval gate between the anchor and the body work means the expensive body draft never runs against a frame the editor would reject. Cost on rejection drops from full-edition rework to anchor-only rework.
- **Single source of truth.** The composition-order rule lives in one ADR. SKILL.md Step 11's prose, persona configs, and any future critic rubric checks reference this ADR rather than redefine it.
- **Composability with ADR-032 (shape) and ADR-017 (phase variants).** The thesis statement authored in the theme-anchor sub-step IS the "thesis-first intro" ADR-032 names; the finalise-phase variant must compose with ADR-017's restructure-branch surface (lines 49 to 52, 87).
- **Tom-as-final-editor preservation.** The rule does not eliminate Tom's editorial judgement; it reduces the surface area where that judgement has to recover from drift authored before the anchor settled.

## Considered Options

1. **Compose theme anchor before body, with Tom-approval gate between** (chosen).
2. **Status quo: monolithic step 11.** H1 is a by-product of the body draft.
3. **Compose anchor plus body in one pass, gate after.**
4. **Compose body first, derive H1 last.**

## Pros and Cons of the Options

### Option 1: Compose theme anchor before body, with approval gate (chosen)

- Good: H1 rejection cost drops from full-edition rework to anchor-only rework. Body work amortises against a settled frame.
- Good: Thesis statement authored in 11a feeds ADR-032's thesis-first intro requirement directly; no duplication.
- Good: Tom sees the load-bearing editorial decisions (H1, cover hook, theme) at the moment they are most cheaply changed.
- Good: Critic, voice, content-risk gates downstream run unchanged on combined 11a plus 11b output.
- Bad: Adds one `AskUserQuestion` gate per edition; approval-gate fatigue surface.
- Bad: SKILL.md prose complexity rises (two sub-steps where there was one).
- Bad: Cover-render placement and finalise-variant sub-decisions need additional Tom direction before SKILL.md split lands.

### Option 2: Status quo monolithic step 11

- Good: No SKILL.md churn; Tom's editorial pass continues to recover edge cases.
- Good: No approval-gate fatigue surface introduced.
- Bad: Persists approximately 30 min per-edition recovery tax when H1 needs rework (2026-06-01 evidence).
- Bad: Ships drift risk every time the H1 does not survive the editorial pass.
- Bad: ADR-032's thesis-first intro is silently authored alongside body without dedicated discipline.

### Option 3: Compose anchor plus body in one pass, gate after

- Good: Cheaper to author (no split).
- Bad: Body work is still wasted when the H1 is rejected; the gate placement is the load-bearing decision, not the split.
- Bad: Approval gate fires AFTER all body work has run; same rework cost as status quo on rejection.

### Option 4: Compose body first, derive H1 last

- Good: The body's most resonant sentence may produce a sharper H1 than first-pass anchor authorship.
- Bad: Body cannot reference the headline's frame in Why-it-matters lines (the headline does not exist yet).
- Bad: 2026-06-01 evidence directly shows the body threads the H1's frame; inverting the order does not fix the editorial-discipline gap, it inverts which surface bears the cost.
- Bad: Cover hook lines cannot be settled before body draft; cover render must defer to step 12 unchanged (no help from this option).

## Decision Outcome

Chosen option: **Compose theme anchor before body, with Tom-approval gate between**, because the 2026-06-01 evidence directly shows the cost of the inverse (approximately 30 minutes of body rework per H1 rejection), the gate placement is the load-bearing intervention (not the split itself), and the chosen shape composes cleanly with ADR-032 (shape) and ADR-017 (phase variants).

### The order codified

The composition order is:

1. **Theme anchor (sub-step 11a in `/wr-newsletter` SKILL.md).** Compose:
   - H1 with `Issue NN:` prefix (6 to 12 words, POV-carrying, plain-declarative per VOICE-AND-TONE LinkedIn carve-outs).
   - Cover hook line 1 (white, around 30 chars max) and line 2 (accent orange, around 45 chars max).
   - One-paragraph theme statement that names the deep items by their shared constraint and previews the variation each item shows (per ADR-032 thesis-first intro shape).
2. **Tom-approval gate (between 11a and 11b).** `AskUserQuestion`:
   - `Accept`: proceed to 11b with the approved anchor.
   - `Refine`: Tom edits the H1, hook lines, or theme statement via the "Other" free-text escape hatch; 11a re-runs the approval gate.
   - `Reject`: back to step 9.5 (re-ranking) or step 10 (per-item capture) with a note on what failed.
3. **Body draft (sub-step 11b).** Drafts opener, bridge (if needed), items, Also-worth-noting, CTA using the approved H1 as the load-bearing theme anchor. Opener leads with the theme statement (expanded). Item ordering may be adjusted to thread the theme. Item Why-it-matters lines reference the theme where natural.

### Enforcement surfaces

- `.claude/skills/wr-newsletter/SKILL.md` Step 11: splits into 11a plus 11b per the order above. Existing voice rules, capture-fidelity rules, source-article quantitative-claim-fidelity rules, and phase-11-prime variant behaviour are preserved in 11b unchanged; the Tom-approval gate is the only new structural element.
- `.claude/skills/wr-newsletter/SKILL.md` Step 12 (cover image): cover render fires at the point where the hook lines are settled (see Deferred sub-decisions).
- `.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md`: may gain a check (future) for theme-anchor / body-frame coherence; not required by this ADR.

### Deferred sub-decisions

Two sub-decisions are deferred pending Tom direction. The substance Tom pinned via P076 is the order plus approval-gate placement; the sub-decisions below are direction-setting questions the ticket prose did not pin. Per the substance-confirm-before-build guard, the SKILL.md split implementing this ADR is **deferred** until both sub-decisions are confirmed.

1. **Cover-render placement.** Three viable options:
   - **(A)** Render once in 11a, no re-render check in step 12.
   - **(B)** Render in 11a, with explicit re-render check in step 12 when 11a's hook lines change in 11b.
   - **(C)** Defer cover to step 12 (status quo); 11a outputs hook-line text only.

   Advisory lean: **(B)**. Tom seeing the cover at the approval gate is a strong signal-density argument; the re-render path covers the rare hook-line refinement in 11b. Queued to `/wr-architect:review-decisions` direction-set.

2. **Phase=finalise variant `11a-prime`.** ADR-017 lines 49 to 52 plus 87 establish a restructure-branch for late-breaking-story handling in finalise (via `AskUserQuestion` when a major restructure of draft plus map re-mutation is needed). Two viable behaviours for the 11a-prime composition:
   - **(A)** Fires ONLY on the restructure-branch of ADR-017's late-breaking-story handling (matching SKILL.md lines 461 to 462's existing Restructure rule). Otherwise the prep-time approved theme anchor carries over unchanged.
   - **(B)** Always runs as a "confirm the theme anchor is still right" gate with default Accept. Lower fatigue surface; surfaces the rare Restructure case.

   Advisory lean: **(A)**. Lower approval-gate fatigue; the existing `11-prime` Restructure rule is the established trigger for re-approving headline-level edits. Queued to `/wr-architect:review-decisions` direction-set.

## Consequences

### Good

- Edition 08 forward (post-implementation): drafter targets the codified composition order directly; no per-edition re-derivation.
- H1-rejection cost drops from full-edition rework to anchor-only rework.
- The thesis statement authored in 11a feeds ADR-032's thesis-first intro requirement directly; the two ADRs compose without duplication.
- Tom sees the load-bearing editorial decisions (H1, cover hook, theme) at the moment they are most cheaply changed, not after the body has been authored against them.

### Bad

- Adds one `AskUserQuestion` gate per edition to the live `/wr-newsletter` pipeline. Approval-gate fatigue is a recognised cost; the Refine option's free-text escape hatch is the mitigation.
- The split adds SKILL.md prose complexity (two sub-steps where there was one). Future SKILL.md authors must compose 11a and 11b consistently.
- The cover-render placement and finalise-variant sub-decisions are deferred; the SKILL.md split cannot land until both are confirmed.

## Confirmation

The fix is confirmed once:

a. This ADR lands.
b. The two deferred sub-decisions are confirmed via `/wr-architect:review-decisions`.
c. The SKILL.md split for 11a plus 11b is implemented with the Tom-approval gate.
d. The next **three** editions publish with the new order, and the **H1-rejection-triggers-body-rework rate** drops below 1-in-3 editions. The metric is observable: an edition counts as a positive measurement if Tom rejects or refines the H1 at the 11a gate AND the resulting H1 forces edits to opener, bridge, or item Why-it-matters lines in 11b. Three of the next three (or four, if one early edition is operationally noisy) should land at zero or one positive measurement.

## Reassessment Criteria

Reassess after four editions on the following triggers:

- **Gate-fatigue trigger**: if the Tom-approval gate fires `Refine` more than once per two editions, the 11a drafter prompt may need adjustment to land the H1 closer to Tom's first-pass approval on the initial draft. Re-open the ADR; the gate UX is the surface to amend, not the composition order.
- **Upstream-gap trigger**: if `Reject` fires at all, the gap is at step 9.5 (re-ranking) or step 10 (per-item capture), not at step 11; root-cause investigation should walk back to the upstream surface. No ADR change needed; open a problem ticket targeting the upstream surface.
- **Cover-staleness trigger**: if the cover-render-placement sub-decision lands as (A) and step 12 reports stale-cover regressions, re-open the sub-decision and consider (B).
- **Finalise-variant trigger**: if the finalise-variant sub-decision lands as (A) and a non-Restructure finalise edition produces a stale theme anchor that should have been re-approved, re-open the sub-decision and consider (B).
- **Confirmation-criterion miss trigger**: if the H1-rejection-rework rate at confirmation-criterion d does not drop below 1-in-3 across three consecutive editions, the composition order is not the root cause; investigate drafter prompt quality, three-lens-filter calibration, or per-item capture fidelity.

## Related

- P076 (`docs/problems/open/076-newsletter-pipeline-drafts-body-before-heading.md`). This ADR codifies the fix substance captured by the ticket.
- ADR-011 (`docs/decisions/011-ai-brief-orchestration-via-claude-code.proposed.md`). Composes: the orchestration host (Claude Code interactive command) is unchanged; ADR-037 sequences inside step 11.
- ADR-017 (`docs/decisions/017-ai-brief-prep-and-finalise-phases.proposed.md`). Composes: the 11a/11b split must specify `11a-prime` / `11b-prime` behaviour (see Deferred sub-decision 2).
- ADR-019 (`docs/decisions/019-capture-transcript-artifact.proposed.md`). Composes: 11b reads the capture transcript at the existing read site; the split preserves the read.
- ADR-024 (`docs/decisions/024-url-verification-gate-in-wr-newsletter.proposed.md`). Composes: step 11.5 URL verification gate fires after 11b (full body draft), unchanged.
- ADR-032 (`docs/decisions/032-newsletter-editorial-discipline-policy.proposed.md`). Amends: ADR-032 defined the shape (thesis-first intro plus three deep items); this ADR defines the composition order in which the shape's components are authored (thesis-first intro as element 1 is authored first, by name, in sub-step 11a).
- ADR-035 (`docs/decisions/035-critic-rubric-shape-is-strengths-weaknesses-plus-context.proposed.md`). Composes: critic gates fire after step 11 on the combined 11a plus 11b output, unchanged.
- Composes with P064 (newsletter critic complexity), P070 (draft-template gap), P075 (headline clarity gates) as the newsletter-pipeline editorial-discipline cluster.
