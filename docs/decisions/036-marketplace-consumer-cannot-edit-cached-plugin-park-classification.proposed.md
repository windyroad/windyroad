---
status: "proposed"
date: 2026-05-31
first-released:
human-oversight: pending
decision-makers: [Tom Howard, Claude]
consulted: []
informed: []
related: [009-adopt-plugin-marketplace-for-claude-tooling]
reassessment-date: 2026-08-31
---

# Marketplace-consumer-cannot-edit-cached-plugin is a documented park classification

## Context and Problem Statement

This project is a downstream marketplace consumer of the upstream `windyroad/agent-plugins` repository. Plugins (`wr-itil`, `wr-architect`, `wr-jtbd`, `wr-risk-scorer`, `wr-retrospective`, `wr-newsletter`, etc.) live under `~/.claude/plugins/cache/windyroad/<plugin>/<version>/` after install; the project consumes them but does not author them. There is no `packages/<plugin>/` source tree in this repo for any of those plugins.

When a problem ticket's fix site lives inside one of those cached plugins (a hook script, a SKILL.md prose passage, an agent file, a script body), the marketplace consumer has no durable edit path. Editing the cached file works mechanically (the next plugin invocation reads the local edit), but the edit is lost on the next plugin update (cache refresh overwrites the local change). Local-workaround alternatives (whitelist extensions, wrapper scripts, downstream hook overrides) typically orphan once the upstream substitutes the surface the workaround keys off, and propagate workaround debt across every adopter that ships the same hook style.

The empirical evidence: in a single AFK `/wr-itil:work-problems` loop on 2026-05-30 to 2026-05-31, the orchestrator parked 11 tickets (P021, P022, P027, P033, P042, P046, P047, P048, P049, P052, P060, P073, P029) under this exact pattern. Each park independently followed the verify-upstream-placement memory (`feedback_verify_upstream_placement_before_propagating.md`, P045 lever 1): read the cached plugin file; confirm the bug persists on the latest cached version; check or file the upstream issue; classify as upstream-blocked. The pattern is now stable enough across plugins and across sessions to warrant explicit codification.

Without codification, every iter independently re-derives the classification ("is this fix site upstream? can I edit it durably?"); each derivation costs review cycles and architect-design analysis. P069 (work-problems orchestrator WSJF ranking does not factor placement-authority) captures one downstream consequence: the WSJF ranking does not down-rank upstream-blocked tickets ahead of selection, so the orchestrator burns iter slots re-discovering the classification before parking.

## Decision Drivers

- **Pattern stability.** 13+ instances across 7 distinct upstream plugins (`wr-itil`, `wr-architect`, `wr-jtbd`, `wr-risk-scorer`, `wr-retrospective`, `wr-newsletter-critic`, `wr-newsletter`) in a single AFK loop. The threshold for codification ("recurring pattern with deterministic action order, reusable beyond one project") is exceeded.
- **Reader / contributor onboarding.** A future contributor (or future-Tom) needs to know "this project parks tickets whose fix-site is in an upstream cached plugin" without re-deriving the rationale per ticket. Documented classification compresses the cognitive load.
- **Downstream WSJF impact.** P069 captures the orchestrator-ranking gap. Codifying the classification creates a stable input for the WSJF ranking fix (the orchestrator can read this ADR and apply the placement-authority discount).
- **Audit-trail consistency.** Parked tickets across the AFK loop carry rationale prose with substantial overlap (verified-on-cached-version, upstream-issue-status, marketplace-consumer-rationale). Codifying the classification lets ticket bodies cite "park reason: marketplace-consumer-cannot-edit-cached-plugin per ADR-036" instead of re-stating the multi-paragraph rationale.
- **Boundary clarity with architect-design parks.** The architect-design park (P068) is a distinct category: fix site IS in this project, but the work requires architectural judgement before implementation can land. The marketplace-consumer park is structurally different: fix site is OUTSIDE this project's authority. Codifying the distinction prevents conflation.

## Considered Options

1. **Broad codification (chosen): "fix site is in an upstream plugin cache that this project does not author"**. Captures every case where the fix lives outside `packages/<plugin>/` in this repo. Includes cases where a local workaround exists but orphans on next upstream release (e.g. P073 P186 evidence-cell em-dash whitelist). The classification is purely structural: where does the fix site live?

2. **Narrower codification: "upstream plugin AND no in-project workaround viable"**. Adds a workaround-viability test. Rejected: the workaround viability is a judgement call that re-introduces per-ticket derivation. Where the workaround exists (e.g. P049 README section-order reordering) the ticket would not be parked under this ADR's classification, but the orphaning-on-next-release cost is still real. The narrow codification leaves the orphaning-cost cases uncovered.

3. **Strictest codification: "upstream plugin AND issue filed upstream"**. Adds an upstream-issue precondition. Rejected: this is a workflow ordering, not a structural classification. Per the parallel decision on upstream-report batching (per-park immediate per user direction 2026-05-31), the issue-filing happens AT the park transition. Forcing issue-filed-first re-introduces sequencing fragility.

4. **No codification, case-law via iter parks**. Rejected. The 13-instance precedent is already case-law; the cost of NOT codifying is every future iter re-deriving the classification. Case-law without codification works for low-frequency patterns; not for high-frequency ones.

5. **Codify as a SKILL.md amendment to `/wr-itil:work-problems` Step 4 classification table** instead of an ADR. Rejected because (a) the SKILL.md lives upstream (`wr-itil` plugin), so the amendment would itself be a marketplace-consumer-cannot-edit-cached-plugin park (recursive); (b) ADR is the right home for a project-level classification policy that informs multiple skills (work-problems, transition-problem, review-problems).

## Decision Outcome

Chosen option: **Broad codification ("fix site is in an upstream plugin cache that this project does not author").**

### Classification predicate

A ticket is classified as `marketplace-consumer-cannot-edit-cached-plugin` (park reason: `upstream-blocked`) when:

1. The ticket's investigation identifies a specific fix site (file path, line range, contract / hook / SKILL section); AND
2. That fix site lives inside `~/.claude/plugins/cache/<vendor>/<plugin>/<version>/` (or equivalent plugin-cache root); AND
3. This project does NOT carry a `packages/<plugin>/` source tree for that plugin.

The classification is structural (file-path-based), not judgement-based. Once these three conditions hold, the ticket parks regardless of whether a local workaround exists (workaround-on-upstream is documented separately on the ticket as a `Workaround` section; the park reason itself stays `upstream-blocked`).

### Park-transition workflow

When the classification predicate holds, the iter (or manual reviewer) performs the following actions in order:

1. Verify the bug persists on the latest cached version (`ls ~/.claude/plugins/cache/<vendor>/<plugin>/ | sort -V | tail -1` to find latest; read the fix-site file; confirm bug is present).
2. Check upstream issue status: search the upstream repo for an existing issue covering the same fix site / behaviour. If an issue exists and is OPEN, cite it; if CLOSED-WITHOUT-FIX, cite the closure rationale.
3. If no upstream issue exists, file one per the per-park-immediate batching policy (user direction 2026-05-31): invoke `/wr-itil:report-upstream <ticket-id>` and append the upstream issue URL to the ticket's `## Reported Upstream` section before park transition.
4. Transition the ticket from Open (or Known Error or Verification Pending per existing state) to Parked. Append a `## Park Reason` section citing ADR-036 and naming the verified cached version + upstream issue URL.
5. Update `docs/problems/README.md` WSJF Rankings (remove parked row) and Parked section (add new row in ID-sort position).
6. Commit per ADR-014 single-commit-per-iteration grain.

### Un-park trigger

A Parked ticket re-opens when:

1. A new upstream plugin release ships that contains the fix at the named fix site; OR
2. The upstream issue closes with a linked PR that lands the fix; OR
3. This project absorbs the upstream plugin source into a local `packages/<plugin>/` tree (changes the third predicate condition).

On un-park, the ticket's status transitions back to Open (or Verifying if the upstream release already shipped and we only need to verify the fix downstream). The orchestrator's next `/wr-itil:work-problems` Step 1 scan picks it up.

### Boundary with architect-design parks

Architect-design parks (e.g. P068) are a distinct classification:

- Fix site IS in this project (e.g. `.claude/skills/wr-newsletter/SKILL.md`).
- Work is blocked on architectural judgement (e.g. new ADR needed, unratified JTBDs, design-decision pending).
- Park reason: `architect-design`.

The marketplace-consumer classification is structural (where is the fix?); the architect-design classification is judgemental (what direction do we take?). A ticket cannot be both: if the fix site is upstream, architect-design questions about the fix shape are themselves upstream work.

### Composition with P069

P069 (work-problems orchestrator WSJF ranking does not factor placement-authority) becomes implementation work for this ADR. Once ADR-036 lands, P069's fix has a concrete shape: the WSJF ranking formula reads the ticket's classification (marketplace-consumer or architect-design or neither) and applies a placement-authority discount. The orchestrator can pre-classify by reading prior parks and de-prioritise additional Open tickets sharing the same upstream-plugin fix surface.

## Consequences

### Good

- Park decisions become mechanical given the structural predicate. Less iter cost per park (no per-ticket rationale derivation).
- Ticket bodies compress: cite ADR-036 instead of re-stating the rationale.
- P069 implementation path concretised: WSJF formula reads classification field.
- Boundary with architect-design parks documented; conflation prevented.
- Future contributors (or future-Tom) onboard the classification policy by reading one ADR.

### Neutral

- The Park-transition workflow's per-park upstream-report invocation adds ~$5-8 cost per park (per-park-immediate batching policy per user direction). Trade-off against per-park-deferred-batch-at-session-end (lower cost; weaker audit trail). The per-park-immediate choice is the user's direction; this ADR records the policy without re-litigating.
- Tickets that genuinely should not be parked under this classification (e.g. genuinely no fix path exists, or the upstream is unmaintained) still need ad-hoc treatment; the ADR doesn't cover every park reason.

### Bad

- Mechanical classification can hide structural problems: if every WSJF=12 ticket is upstream-blocked, the project is implicitly accepting that all the dev-work-queue value is in upstream contributions, not local work. The retro Step 2b pipeline-instability scan should watch for this pattern (e.g. "all parks in one loop are same-upstream-plugin > upstream-tracking priority signal").
- The classification could be over-applied: a fix that has a viable in-project workaround AND a downstream-stable replacement (e.g. fork the plugin source into `packages/<plugin>/`) could be wrongly parked under the strict structural predicate. Mitigation: ticket reviewer SHOULD note when a fork-the-plugin-source option exists; the park-vs-fork decision is then explicit.

## Confirmation

This ADR's substance is confirmed once:

1. `human-oversight: confirmed` flips on the frontmatter after user review.
2. The classification predicate is consumed by at least one downstream surface (P069 WSJF re-ranking, OR work-problems Step 4 amendment, OR review-problems pre-classification, OR a ticket-template auto-park field).
3. At least 3 future parks cite ADR-036 in their `## Park Reason` section, demonstrating the codification is in use.
4. The boundary with architect-design parks holds in practice (no parked ticket carries both classifications).

## Reassessment Criteria

- After 4 AFK loops, count parks by classification: marketplace-consumer-cannot-edit-cached-plugin vs architect-design vs other. If the marketplace-consumer share exceeds 70%, the project's strategic position (mostly consuming upstream work) is itself signal; reassess whether to (a) start authoring some plugins downstream (`packages/<plugin>/` trees), (b) negotiate upstream-contribution priorities, or (c) accept the consumer-only posture explicitly.
- If reviewers struggle to apply the structural predicate (recurring debates about "is this REALLY upstream?"), the predicate may be under-specified; sharpen it.
- If the per-park-immediate upstream-report invocation cost (~$5-8 per park) compounds to user-visible session expense, reconsider the batching policy (this ADR records the policy but does not lock it in perpetuity).

## Related

- ADR-009 (adopt plugin marketplace for Claude tooling). ADR-009 chose the marketplace consumer posture; this ADR is a downstream consequence: classifying tickets whose fix site lives in the marketplace-cached plugins as a park reason. ADR-009 is `human-oversight: confirmed` (ratified dependency).
- Problem lifecycle semantics (Open / Known Error / Verifying / Parked / Closed; WSJF multiplier 0 for Parked and Verifying) are documented in upstream `wr-itil` plugin SKILL.md files (`/Users/tomhoward/.claude/plugins/cache/windyroad/wr-itil/<version>/skills/manage-problem/SKILL.md` and sibling skills), not in any local ADR. This ADR's references to "Parked status" inherit the upstream lifecycle definitions verbatim. The upstream-lifecycle dependency is itself a marketplace-consumer-cannot-edit-cached-plugin instance (this ADR's own classification applies recursively): if the upstream lifecycle definition changes, this project consumes the change at the next plugin update.
- P069 (work-problems orchestrator WSJF ranking does not factor placement-authority). Implementation work for this ADR's downstream consumption.
- P045 (verify upstream-placement before propagating). The verify-first discipline this ADR codifies the second-half of: P045 says "verify before claiming upstream"; ADR-036 says "if verified upstream, park per the structural predicate".
- Park instances cited in this ADR: P021, P022, P027, P033, P042, P046, P047, P048, P049, P052, P060, P073, P029. All from the 2026-05-30 to 2026-05-31 AFK `/wr-itil:work-problems` loop.
- User direction captured 2026-05-31 during the queue resolution of the same AFK loop: option (A) broad codification chosen; per-park-immediate upstream-report batching chosen.
