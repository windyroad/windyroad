---
status: "accepted"
date: 2026-05-30
human-oversight: confirmed
oversight-date: 2026-05-30
decision-makers: [Tom Howard, Claude]
consulted: []
informed: []
supersedes: 016-sw-critic-subagents-and-iteration-loop
reassessment-date: 2026-08-30
---

# Domain-specific critic agents supersede the parameterised wr-sw-critic pattern

## Context and Problem Statement

ADR 016 chose a single parameterised `wr-sw-critic` subagent with rubric files passed as arguments, on the rationale that one agent plus many rubrics minimises agent-count and supports future-artifact reuse without per-artifact agent authoring. ADR 018 (`wr-content-risk-scorer`) followed the same pattern.

The 2026-05-30 `/wr-architect:review-decisions` drain surfaced the weakness: **parameterised skills have poor discoverability and UX**. A reader of the agent surface cannot tell at a glance what `wr-sw-critic` actually critiques because the answer depends on which rubric is passed at call-site. Each new artifact type (newsletter, wardley map, blog, social) still requires new rubric authoring plus plumbing in the calling skill; the agent count stays small but cognitive load per artifact stays high.

P071 captured the supersede direction. The trade-off ADR 016 made (DRY across critic logic) is now reversed in favour of self-documentation and reader-discoverability.

## Decision Drivers

- **Discoverability.** Agent names should self-document their purpose. `wr-newsletter-critic` is unambiguous; `wr-sw-critic` invoked with a rubric argument is opaque without reading the call-site.
- **Reader cognitive load.** Per-artifact-class cognitive cost should shrink as artifact count grows, not stay flat. Self-documenting agents amortise the discoverability cost across every read.
- **Logic reuse via shared primitives, not parameterisation.** The 3-round iteration loop, the STRENGTHS-plus-WEAKNESSES output block, and the PASS/REJECTED/PASS_WITH_AUTHOR_OVERRIDES verdict shape are genuinely shared across critic classes. They can be factored into a shared library (lib/critic-loop or similar) that each domain-specific critic imports, rather than into a parameterised agent definition.
- **Minimal disruption to existing rubrics.** `newsletter-critic-rubric.md` and `wardley-critic-rubric.md` already exist as separate files; the supersede is mostly about agent definitions, not rubric content.
- **Composition with ADR 025.** PASS_WITH_AUTHOR_OVERRIDES is the verdict shape; each domain-specific critic emits the same verdict surface.

## Considered Options

1. **Domain-specific critic agents** (chosen). Replace `wr-sw-critic` with `wr-newsletter-critic` and `wr-wardley-critic`, each owning its own rubric inline (or as an asset adjacent to the agent definition). Future artifact classes (blog, social) get their own agent at the same pattern. Shared logic factors into a library the agents import.
2. **Status quo (keep parameterised).** Accept the discoverability + UX cost; rely on documentation to compensate. Rejected per the P071 driver: documentation has not compensated; the pattern remains opaque.
3. **Parameterised plus rubric-naming convention.** Keep the parameterised agent but enforce that rubric files self-document the agent's scope via filename convention. Rejected: half-measure; the agent surface itself remains opaque even if rubric files are well-named.
4. **Hybrid: parameterised for the analytical-quality critic class; domain-specific for editorial-judgement classes.** Rejected: introduces a typology that does not exist in the codebase yet; pre-emptive abstraction.

## Decision Outcome

Chosen option: **Domain-specific critic agents**, because it directly addresses the discoverability + UX failure mode P071 captured, preserves shared logic via a library extraction (lower-risk than parameterisation), and matches the established naming convention for domain-specific agents (`wr-newsletter-editor`, `wr-content-risk-scorer`).

### Scope and migration

Phase 1 (this ADR):
- Author `wr-newsletter-critic` at `.claude/agents/wr-newsletter-critic.md`, owning `newsletter-critic-rubric.md` (already at `.claude/skills/wr-newsletter/assets/`).
- Author `wr-wardley-critic` at `.claude/agents/wr-wardley-critic.md`, owning `wardley-critic-rubric.md`.
- Keep `wr-sw-critic.md` as-is during the transition.

Phase 2 (next):
- Update `/wr-newsletter` SKILL.md call-sites: switch from `wr-sw-critic` plus rubric-arg to direct invocation of `wr-newsletter-critic` or `wr-wardley-critic`.
- Verify the 3-round iteration loop, the STRENGTHS-plus-WEAKNESSES block, and the PASS_WITH_AUTHOR_OVERRIDES verdict shape are preserved.

Phase 3 (cleanup):
- Once SKILL.md call-sites are migrated and verified through one full prep + finalise cycle, retire `wr-sw-critic.md` (rename to `.deprecated.md` or remove).

ADR 018 (`wr-content-risk-scorer`) is OUT OF SCOPE for this supersede. Content-risk axes are more stable than critic rubrics; the parameterised pattern's discoverability cost is lower there because the agent surface only has one calling skill today (`/wr-newsletter`). Revisit ADR 018 separately if a second caller emerges.

## Consequences

### Good

- Agent surface self-documents: future readers can see at a glance what each critic critiques.
- New artifact classes get new named agents rather than new rubric-plus-plumbing pairs.
- Shared logic still factored via library; DRY preserved where it actually compounds.

### Bad

- Two-phase migration (this ADR plus follow-up SKILL.md call-site updates) creates a window where both patterns coexist; readers may be confused during transition.
- Library extraction adds an intermediate abstraction layer that did not exist before; risk of premature factoring if only two critic classes ever exist.
- ADR 016 supersede ripples into any prior session transcripts or memory files that reference `wr-sw-critic` by name.

## Confirmation

The supersede is confirmed once: (a) this ADR lands, (b) `wr-newsletter-critic.md` and `wr-wardley-critic.md` exist with their rubrics, (c) `/wr-newsletter` SKILL.md call-sites are migrated, (d) one full prep + finalise cycle exercises the new agents end-to-end with the expected verdict shapes, and (e) ADR 016 status flips to "superseded".

Confirmation tracking (updated 2026-06-02):

- (a) DONE: this ADR landed `.proposed` with `human-oversight: confirmed` on 2026-05-30.
- (b) DONE: `.claude/agents/wr-newsletter-critic.md` and `.claude/agents/wr-wardley-critic.md` landed 2026-06-02 (work-problems iter 2 of P071). Rubrics at `.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md` and `wardley-critic-rubric.md` were simplified per ADR 035 in 2026-06-01 (iter 1 of P064).
- (c) DONE: `.claude/skills/wr-newsletter/SKILL.md` step 9 and step 15 invocations migrated 2026-06-02 from `wr-sw-critic` to `wr-wardley-critic` and `wr-newsletter-critic` respectively. Step 15.25 and 15.4 "Skip-on-upstream-REJECTED" prose updated; step 17 Tom-summary prose updated; Reference block updated to list both new agents.
- (d) DONE (2026-06-14): The Shift Issue 08 (published 2026-06-08) ran a full prep + finalise cycle that exercised both new agents end-to-end with the expected verdict shapes. Audit trail at `src/newsletters/published/leader/2026-06-08/2026-06-08.reviews.md`. `wr-newsletter-critic`: prep 3 rounds to PASS; finalise 2 rounds to PASS; CRITIC_REVIEW blocks against `newsletter-critic-rubric.md`, S/W editorial-prose shape with citations, no numbered checks. `wr-wardley-critic`: 3 rounds to PASS_WITH_AUTHOR_OVERRIDES against `wardley-critic-rubric.md` (`OVERRIDDEN: [check_evolution_section_redundancy]`). Edition published with Editor Review PASS, so the verdict matched editorial judgement.
- (e) RATIFIED by this iter's SKILL.md migration. ADR-016 was renamed to `.superseded.md` with `human-oversight: rejected-pending-supersede` + `supersede-ticket: P071` markers as preconditions when P071 was captured; this iter's Phase 2 SKILL.md migration is what substantively closes criterion (e). The ADR-016 file already carries the `.superseded.md` filename, and there are no live `wr-sw-critic` call sites in the newsletter pipeline as of this commit.

Status flipped to `.accepted` on 2026-06-14 after criterion (d) closed via The Shift Issue 08 (2026-06-08) prep + finalise cycle. All five confirmation criteria (a) through (e) are now closed.

## Reassessment

Reassess after eight editions: if the library extraction has not absorbed any genuinely-shared logic (i.e., each agent reimplements its own loop), the abstraction is premature and should retire to per-agent ownership.

## Related

- Supersedes ADR 016 (sw-critic subagents and iteration loop). Closes P071.
- ADR 016 will flip to status: superseded and rename to `.superseded.md` once this ADR's Phase 2 (SKILL.md migration) ships.
- ADR 018 (content-risk subagent) stays at status: proposed; its parameterisation is OUT OF SCOPE for this supersede per the scope-rung clause above.
- Composes with ADR 020 (newsletter-editor subagent: same naming convention), ADR 025 (PASS_WITH_AUTHOR_OVERRIDES verdict: preserved).
