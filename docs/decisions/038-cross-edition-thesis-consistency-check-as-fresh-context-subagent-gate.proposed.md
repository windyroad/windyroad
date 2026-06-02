---
status: "proposed"
date: 2026-06-02
human-oversight: confirmed
oversight-date: 2026-06-02
decision-makers: [Tom Howard, Claude]
consulted: [wr-architect:agent, wr-jtbd:agent]
informed: []
reassessment-date: 2026-09-02
composes-with: [033-domain-specific-critic-agents-supersede-parameterised-sw-critic, 035-critic-rubric-shape-is-strengths-weaknesses-plus-context, 037-compose-newsletter-theme-anchor-before-body, 024-url-verification-gate-in-wr-newsletter]
related: [016-sw-critic-subagents-and-iteration-loop, 011-ai-brief-orchestration-via-claude-code, 015-reader-respect-and-gate-rejection-policy, 025-pass-with-author-overrides-verdict-for-sw-critic, 032-newsletter-editorial-discipline-policy]
amended-by: [039-per-date-subdir-layout-for-published-newsletter-editions]
---

# Cross-edition thesis-consistency check as a fresh-context subagent gate before publish

## Context and Problem Statement

The `/wr-newsletter` pipeline has no automated check that the current edition's load-bearing theses are consistent with prior published editions. All existing gates (voice, content-risk, sw-critic / `wr-newsletter-critic`, editor, cog-a11y) review the edition in isolation. None reads `src/newsletters/published/<persona>/<prior-edition>.md`.

The 2026-06-01 finalise run for The Shift Issue 07 hit this directly. Issue 06 (2026-05-25) carried the H1 "AI's real prize is capacity, not a smaller team", arguing the contrarian thesis that AI's value is doing-more-with-the-same-team rather than headcount cuts. Issue 07's prep brief Item 1 human angle stated: "The internal AI-deployment narrative that has carried teams for 18 months ('AI lets us do more with the same people') no longer survives an outside reader." That sentence directly contradicts the Issue 06 thesis. The pipeline shipped it past 3 voice gate rounds, content-risk, 3 sw-critic rounds, editor, and cog-a11y gates without flagging the contradiction. Tom caught it during manual editorial review and the human angle was reframed around cost discipline (compatible with the Issue 06 capacity thesis).

P080 captured the gap. This ADR codifies the fix substance.

The architectural choice between Option A (fresh-context subagent at a new pipeline step) and Option B (extending existing gate prompts) is pinned by **ADR-035 Decision Drivers § Coverage partitioning**: "Each review gate owns its axis. The critic owns analytical quality only. Duplicating voice / cog-a11y / risk checks in the critic rubric blurs the boundary and produces conflicting verdicts." Option B re-introduces precisely that coverage blurring by loading a cross-edition-consistency axis onto agents whose primary directive is something else. Option A respects partitioning by adding a domain-specific agent that owns the cross-edition axis exclusively. The choice is therefore not a direction-set question; it is a constraint inherited from ADR-035.

## Decision Drivers

- **Coverage partitioning (ADR-035).** Cross-edition consistency is a new axis. The axis-owning gate must be a new, named agent, not a loadout onto an existing gate whose primary directive is voice, analytical quality, or risk.
- **Fresh-context confirmation-bias mitigation (ADR-016).** The cross-edition check inherits the same rationale that gave the project the SW-critic fresh-context pattern: an agent that has watched the drafter author the edition is prone to anchor on the drafter's reasoning. A fresh-context subagent reading the saved prior editions plus the current draft starts neutral.
- **Discoverability (ADR-033).** Domain-specific named agents (`wr-newsletter-critic`, `wr-wardley-critic`, `wr-newsletter-editor`) self-document their purpose. A `wr-newsletter-cross-edition-consistency` agent matches the established naming pattern and reads at a glance.
- **JTBD-003 protection.** The engineering-leader's "evaluation" job (JTBD-003) depends on the reader being able to cite a Shift thesis upward without that thesis being self-undermined a week later. The Issue 06 / 07 contradiction was a direct JTBD-003 failure surface; the gate exists to defend that job.
- **Tom-as-editor reduction in load.** P080's current workaround is Tom reading the prior edition before publishing the next. Automating that reading shifts the cost left of save and reduces the burden on the manual editorial pass.
- **Composition with ADR-037.** ADR-037 settles the H1 at sub-step 11a before the body draft at 11b. The cross-edition gate operates on the settled H1 plus body and therefore must fire after 11b. The natural slot is between 11b and the existing URL-verification gate at 11.5.

## Considered Options

1. **Fresh-context subagent at a new pipeline step between body draft and URL verification** (chosen).
2. **Append prior-edition context to existing gate prompts** (rejected on ADR-035 coverage-partitioning).
3. **Manual workaround only: Tom reads prior edition before publishing each next edition** (status quo, rejected).
4. **Inline drafter check: the drafter loads prior editions during step 11 composition and self-verifies before the gate suite runs** (rejected on ADR-016 fresh-context grounds).

## Pros and Cons of the Options

### Option 1: Fresh-context subagent at a new pipeline step (chosen)

- Good: Respects ADR-035 coverage partitioning; cross-edition consistency owns its own axis.
- Good: Respects ADR-016 fresh-context pattern; agent reads saved prior editions and current draft from clean context, free of drafter anchoring.
- Good: Self-documenting per ADR-033 naming convention.
- Good: CONTRADICTS verdict surfaces via `AskUserQuestion` with Rewrite, Override-with-reason, or Accept-as-deliberate-evolution; preserves Tom-as-editor autonomy.
- Good: Audit trail to `.reviews.md ## Cross-Edition Consistency` block per ADR-026 sibling-file pattern.
- Good: Reassessment trigger (downgrade to quarterly on 8 consecutive editions with zero CONTRADICTS and zero retro-flagged misses) bounds long-tail cost.
- Bad: One additional pipeline step adds latency to every publish. Bounded by the subagent's read budget (current draft plus N=small prior editions).
- Bad: New agent file plus SKILL.md call-site plus rubric-prose surface to maintain.
- Bad: Sub-decisions (N window, save-gate semantics, input shape) need Tom direction-set before SKILL.md split lands. SKILL.md implementation deferred (see Deferred sub-decisions).

### Option 2: Append prior-edition context to existing gate prompts (rejected)

- Good: No new agent; lighter implementation surface.
- Good: Reuses already-established gate fatigue budget.
- Bad: **Direct ADR-035 conflict.** Cross-edition consistency is a new axis loaded onto agents whose primary directive is something else. Coverage partitioning is the ADR-035 driver this option violates.
- Bad: P080's own prose flags the dilution risk: "prior-edition context dilutes the gates' main focus. May not catch the contradiction because the gate's primary directive is voice / structure / argument-quality, not cross-edition consistency."
- Bad: No discoverability win; the cross-edition concern is invisible at the agent surface.
- Bad: Verdict shape conflict. The existing gates return PASS / WEAKNESSES_FOUND / REJECTED / PASS_WITH_AUTHOR_OVERRIDES per ADR-025; cross-edition wants a different verdict shape (SUPPORTED / CONTRADICTS / NEUTRAL).

### Option 3: Manual workaround, Tom reads prior edition before publish (status quo)

- Good: Zero implementation cost.
- Good: Tom-as-editor judgement is the final authority; this preserves it without ceremony.
- Bad: Persists the per-edition manual reading tax indefinitely. Cost compounds as the series accumulates theses to maintain consistency with.
- Bad: One observed miss across 7 editions (the Issue 06 / 07 incident) at zero automation; rate likely climbs as edition count grows and individual prior editions blur in Tom's memory.
- Bad: No structural defence; any successor or one-off skip of the manual step ships the contradiction.

### Option 4: Inline drafter check (rejected)

- Good: Single-pass composition; no new pipeline step.
- Bad: Direct ADR-016 conflict. The drafter authored the edition; the same context that produced the contradiction self-evaluates it. Confirmation-bias risk is the exact failure mode ADR-016 / ADR-033 named.
- Bad: Step 11 already carries the capture-fidelity, source-article-quantitative-claim-fidelity, and 11-prime variants per SKILL.md:435 to 464; adding cross-edition discipline inline grows step 11's working-instruction surface against the H1-first-discipline simplification ADR-037 just landed.

## Decision Outcome

Chosen option: **Fresh-context subagent at a new pipeline step between body draft and URL verification**, because ADR-035's coverage-partitioning driver eliminates Option 2 from the viable set, ADR-016's fresh-context driver eliminates Option 4, and the Issue 06 / 07 incident is concrete evidence that the status-quo manual workaround (Option 3) does not scale. The chosen shape composes cleanly with ADR-016 (fresh-context), ADR-033 (domain-specific naming), ADR-035 (coverage partitioning), and ADR-037 (H1-first composition order).

### The gate codified

A fresh-context subagent `wr-newsletter-cross-edition-consistency` runs at a new pipeline step in `/wr-newsletter` SKILL.md, between the body draft (currently step 11; will become step 11b after ADR-037 implementation) and the URL verification gate at step 11.5.

The subagent:

1. Reads the current edition's draft from `<draft-folder>/<publication-date>.md` (or `.prep.md` during `phase=prep`).
2. Reads the prior N editions by globbing `<published-folder>/*/<YYYY-MM-DD>.md` (per ADR-039 per-date sub-directory layout: the wildcard sub-directory is the publication-date directory; the basename matches the canonical brief shape `YYYY-MM-DD.md`). Sort by edition number descending and take top N.
3. Compares the current draft's load-bearing theses (H1, opener, Item Why-it-matters lines, From-Tom opener) against each prior edition's equivalent surfaces.
4. Returns one of: SUPPORTED (current draft is compatible with or builds on prior theses), CONTRADICTS (a specific passage in the current draft contradicts a specific passage in one or more prior editions; both passages quoted in the verdict), or NEUTRAL (no overlap; current draft addresses topics the prior editions did not engage).

Save-gate semantics:

- SUPPORTED or NEUTRAL: gate passes; pipeline proceeds to step 11.5 (URL verification).
- CONTRADICTS: gate blocks save and surfaces to Tom via `AskUserQuestion` with three options:
  - **Rewrite**: drafter re-runs on the conflicting passages with the prior-edition quoted context attached; gate re-runs after rewrite.
  - **Override with reason**: Tom records a one-line reason; gate passes with `PASS_WITH_AUTHOR_OVERRIDES`-equivalent verdict (per ADR-025); reason is logged to `.reviews.md ## Cross-Edition Consistency`.
  - **Accept as deliberate evolution**: Tom records a one-line reason (e.g. "thesis update reflects new evidence; intentional"); gate passes; reason is logged. The current draft and the contradicted prior edition both get a follow-up note in the `## Cross-Edition Consistency` block making the evolution explicit for future editions' readers.

Audit trail: each edition's `.reviews.md` (per ADR-026 sibling-file pattern) gains a `## Cross-Edition Consistency` block recording the verdict, the prior-edition window (e.g. `editions 04..07`), the quoted passages on CONTRADICTS, and (if applicable) the override or evolution reason.

### Enforcement surfaces

- `.claude/agents/wr-newsletter-cross-edition-consistency.md` (new): agent definition with documented contract, inputs (current draft path, prior-edition paths, persona scope), outputs (SUPPORTED / CONTRADICTS / NEUTRAL plus quoted passages), tool allowlist (Read only; no Write, no Edit).
- `.claude/skills/wr-newsletter/SKILL.md` step 11b.X (or step 11.4 if ADR-037 implementation leaves room): adds the gate invocation, the AskUserQuestion surface on CONTRADICTS, and the `.reviews.md` block append on every verdict.
- `.claude/skills/wr-newsletter/SKILL.md` § Review surfaces (after step 11.5 URL Verification block): adds `## Cross-Edition Consistency` to the `.reviews.md` heading inventory.

### Sub-decisions (Tom-pinned 2026-06-03 via `/wr-architect:review-decisions`)

All three sub-decisions are now pinned by Tom direction-set. The substance-confirm-before-build guard is satisfied; the SKILL.md split + agent authoring are unblocked.

1. **Prior-edition window N.** Three viable options were considered:
   - **(A)** N=1 (only the immediately prior edition).
   - **(B)** N=4 (rolling four-week window). (Architect lean per ticket framing.)
   - **(C) PINNED.** N=8 (rolling two-month window).

   Tom-pinned to **(C)** on 2026-06-03 (rejecting the architect lean of B). Rationale: broadest catch worth the higher subagent token cost; cross-edition contradictions can span multiple weeks and the broader window protects against multi-edition thesis drift the narrower window would miss.

2. **CONTRADICTS save-gate semantics.** Three viable options were considered:
   - **(A) PINNED.** Block save until Tom resolves via `AskUserQuestion` (Rewrite / Override / Accept-as-evolution). (Architect lean.)
   - **(B)** Warn and allow save; CONTRADICTS is logged but does not block.
   - **(C)** Block only on PUBLISH (phase=finalise save), not on prep-phase save.

   Tom-pinned to **(A)** on 2026-06-03 (matching the architect lean). Rationale: matches ADR-015's REJECTED save-but-do-not-publish vocabulary; preserves Tom-as-editor autonomy via Override; provides structural defense against shipping contradictions to readers.

3. **Subagent input shape.** Three viable options were considered:
   - **(A) PINNED.** Full prior-edition bodies for all N editions.
   - **(B)** Extracted theses only (H1 + opener + Item 1 thesis) for all N editions.
   - **(C)** Hybrid: full body for the *current* edition; extracted thesis-snippets (H1 + opener + Item 1) for prior N editions. (Architect lean.)

   Tom-pinned to **(A)** on 2026-06-03 (rejecting the architect lean of C). Rationale: most thorough catch surface; contradictions can hide outside H1/opener (e.g. an Item 3 contradicting a prior Item 4), and extracted-thesis-only shapes would miss them. Combined with the N=8 window above, this drives a higher subagent token budget; accepted as a load-bearing cost for the JTBD-003 protection driver.

## Consequences

### Good

- Edition 08 forward (post-implementation): cross-edition contradictions caught structurally before publish, not by Tom's manual editorial pass. JTBD-003 protection scales with edition count.
- Composes cleanly with ADR-035 (coverage partitioning), ADR-016 (fresh context), ADR-033 (domain-specific naming), ADR-037 (H1-first composition).
- Audit trail at `.reviews.md ## Cross-Edition Consistency` makes the gate's per-edition behaviour readable in retro and reassessment.
- Override + Accept-as-evolution surfaces preserve Tom-as-editor autonomy and the editorial-position-update path.

### Bad

- One additional pipeline step adds latency to every publish. Bounded by N and input-shape sub-decisions.
- New agent file plus SKILL.md call-site plus rubric-prose surface to maintain.
- The three deferred sub-decisions defer SKILL.md implementation; the architectural choice is settled but the implementable shape requires Tom direction-set.
- AskUserQuestion surface adds one potential approval-gate fatigue moment per edition (only fires on CONTRADICTS). False-positive ceiling is part of reassessment.

## Confirmation

The fix is confirmed once:

a. This ADR lands.
b. The three deferred sub-decisions are confirmed via `/wr-architect:review-decisions`.
c. `.claude/agents/wr-newsletter-cross-edition-consistency.md` exists with documented contract (inputs, outputs, tool allowlist, verdict shape).
d. `.claude/skills/wr-newsletter/SKILL.md` gains the gate invocation at the chosen step number, with the `AskUserQuestion` surface on CONTRADICTS and the `.reviews.md ## Cross-Edition Consistency` block append.
e. One full prep + finalise cycle exercises the gate end-to-end with at least one synthetic contradiction injection confirming the gate fires.
f. The gate's scope (persona coverage: Shift only, Tokens Spent only, or both) is stated explicitly in the SKILL.md call-site. Default per architect verdict plus JTBD review: applies to BOTH personas (engineering-leader Shift AND developer Tokens Spent) once both are publishing; the JTBD review flagged scope-clarity as a confirmation criterion.
g. **JTBD-003 regression-signal criterion**: Editions 08 forward exercise the gate; no CONTRADICTS-class miss is caught in Tom's manual editorial review for 4 consecutive editions.
h. **JTBD-001 / 002 non-regression criterion**: Cross-edition gate does not block any edition that the existing gates passed for reasons other than cross-edition contradiction.

## Reassessment Criteria

Reassess after eight editions on the following triggers:

- **Quarterly downgrade trigger**: if zero CONTRADICTS verdicts fire across 8 consecutive editions AND zero false-negatives are caught by Tom in retro, downgrade to once-per-quarter check rather than per-edition.
- **False-negative trigger**: if Tom catches a cross-edition contradiction in editorial review that the gate marked SUPPORTED or NEUTRAL, the subagent prompt or N window is mis-calibrated; revise before the next edition. Re-rate sub-decision (1) N window in particular.
- **False-positive ceiling trigger**: if the Accept-as-deliberate-evolution branch fires more than once per 4 editions, the gate is too aggressive on legitimate thesis updates; relax the contradiction threshold or rebrief the agent on "evolution vs contradiction" distinction. Target ceiling: <=25% override rate across 8 editions.
- **ADR-037 composition trigger**: once ADR-037's 11a/11b split lands, reassess whether cross-edition consistency should fire at 11a (cheap, only the H1 plus theme statement) instead of or in addition to post-11b. The Issue 06 / 07 contradiction surface was H1-thesis-level plus Item-1-thesis-level; an 11a-anchor check would have caught Issue 06 vs Issue 07's H1 incompatibility before the body draft ran.
- **Pattern-drift trigger**: if retro detects the gate consistently catches the same class of contradiction (e.g. "every reframe of cost-vs-capacity"), promote that pattern into a documented editorial-position registry that the drafter references at step 10 / 11a, shifting cost left of the gate.
- **Persona-scope trigger**: if confirmation-criterion (f) lands at "Shift only" and a Tokens Spent edition ships a cross-edition contradiction that the gate would have caught, re-open scope and extend to developer persona.

## Related

- **P080** (`docs/problems/open/080-newsletter-pipeline-has-no-cross-edition-thesis-contradiction-check.md`). This ADR codifies the fix substance captured by the ticket.
- **ADR-016** (`docs/decisions/016-sw-critic-subagents-and-iteration-loop.superseded.md`). Composes: the fresh-context subagent pattern this ADR extends, originally established for the SW-critic and inherited via ADR-033 to the domain-specific critic agents.
- **ADR-033** (`docs/decisions/033-domain-specific-critic-agents-supersede-parameterised-sw-critic.proposed.md`). Composes: the domain-specific naming convention. `wr-newsletter-cross-edition-consistency` follows the established pattern (`wr-newsletter-critic`, `wr-wardley-critic`, `wr-newsletter-editor`).
- **ADR-035** (`docs/decisions/035-critic-rubric-shape-is-strengths-weaknesses-plus-context.proposed.md`). Composes: the coverage-partitioning driver pinned Option A. This ADR's gate respects partitioning by owning its own axis exclusively.
- **ADR-037** (`docs/decisions/037-compose-newsletter-theme-anchor-before-body.proposed.md`). Composes: the H1-first composition order this ADR's gate runs after; reassessment criterion above considers shifting the check left to 11a once ADR-037 lands.
- **ADR-024** (`docs/decisions/024-url-verification-gate-in-wr-newsletter.proposed.md`). Composes: the new gate sits immediately upstream of the URL verification gate; both are pipeline-step-11.x save-gate surfaces.
- **ADR-026** (`docs/decisions/026-reviews-and-meta-content-to-sibling-files.proposed.md` if present). Composes: the `## Cross-Edition Consistency` block lives in `.reviews.md` per the sibling-file pattern.
- **ADR-025** (`docs/decisions/025-pass-with-author-overrides-verdict-for-sw-critic.proposed.md`). Composes: the Override-with-reason save-gate option matches the PASS_WITH_AUTHOR_OVERRIDES vocabulary already established for gate overrides.
- **ADR-015** (`docs/decisions/015-reader-respect-and-gate-rejection-policy.proposed.md`). Composes: the save-but-do-not-publish vocabulary the chosen save-gate semantics inherits.
- **JTBD-001 / 002 / 003** (`docs/jtbd/engineering-leader/`). The gate's JTBD-anchored confirmation criteria target JTBD-003 (evaluation: ammunition to justify the engagement) protection as the primary signal.
- Composes with P064 (newsletter critic complexity), P076 (H1-first composition), P078 (assistant-correction-pattern), as the newsletter-pipeline editorial-discipline cluster.
