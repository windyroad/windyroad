---
status: "proposed"
first-released:
date: 2026-08-07
human-oversight: unconfirmed
decision-makers: [Tom Howard, Claude]
consulted: [wr-architect:agent]
informed: []
reassessment-date: 2026-11-07
composes-with: []
related: []
---

# RFCs in this project carry no stories until a story tier exists

## Context and Problem Statement

Upstream ADR-089 (Every RFC has at least one story) requires an RFC's `stories:` list to be non-empty once a fix is scoped. Its only carve-out is for a `draft` RFC before the fix exists; a `proposed` RFC recording a settled fix is squarely inside the rule.

This project has no story tier. There is no `docs/stories/` and no `docs/story-maps/` directory, so there is no surface a story could land on. Every RFC written here has therefore shipped `stories: []` in knowing violation of a ratified upstream decision.

Three RFCs now carry a version of the same argument in their bodies (RFC-002:49, RFC-003:45, RFC-004). Each re-derives the warrant from scratch. That is a project-level standing posture being re-argued per artefact, and it drifts: the three wordings already differ, and RFC-004's first draft asserted an upstream fix was in flight when the upstream position is in fact contested.

The alternative homes were considered and rejected. `docs/rfcs/README.md:5` describes itself as the body-shape contract the skills bind against and forbids inventing a parallel scheme there; a bare convention clause in it would also silently settle by convention the very call RFC-002 and RFC-003 both recorded as "queued for Tom rather than taken unilaterally", and would override a confirmed upstream decision without ratification. Upstream precedent records framework deviations as ratified ADR content rather than README convention (upstream ADR-095 and its `oversight-note` carry an ADR-032 deviation in the decision body).

## Decision Outcome

**RFCs in this project carry `stories: []` until a story tier exists here.** The deviation from upstream ADR-089 is recorded once, in this decision, and RFCs cite it in one line rather than re-arguing it.

An RFC's `## Stories` section states only: the list is empty, the reason is this decision, and standing up the tier remains queued for Tom. It does not re-derive the warrant.

**The warrant is absence of a surface, not disagreement with the rule.** ADR-089's requirement is sound. Nothing here argues that RFCs are better off without stories. The deviation exists because satisfying the rule in this repository would mean standing up two directory trees, a capture skill path and a lifecycle, as a side effect of whatever fix happened to be in flight. That is a decision with its own cost and it is Tom's, not a byproduct.

**What is deliberately not claimed.** Earlier RFC prose said the upstream mechanism was "being fixed right now". That overstates it. The relevant upstream tickets are P456 (Open; direction ratified 2026-07-15 on option (a) selector-skip), P409 (back-fill of legacy empty-stories RFCs), P412 and P449 (both Open, covering RFC and story tiers being invisible to adopters). None is an adopter carve-out permitting a consumer repo to run with no story tier at all, and P449's own note records that P412 and P449 "pull opposite ways and need a joint design read". The upstream shape this deviation would eventually resolve into is contested, not imminent.

**Scope.** This decision governs the `stories:` frontmatter array and the `## Stories` body section of RFCs in this repository. It does not touch the I1 problem-trace invariant, the I13 propose-fix gate, ADR-071's every-fix-goes-through-an-RFC rule, or upstream ADR-073's RFC-first timing requirement. All of those continue to bind here unchanged.

## Consequences

**Good.** The deviation is recorded on a surface Tom ratifies, which is the correct handling for a break from a confirmed decision. RFC bodies get shorter and stop drifting apart. A reader meets one authoritative statement instead of three approximations. The open question (whether to stand up the tier) stays visibly open rather than being closed by convention.

**Bad.** This project now carries a local decision whose only content is a deviation from an upstream one, which is a maintenance edge: if upstream ADR-089 changes or an adopter carve-out lands, this decision must be revisited rather than silently lapsing. The reassessment date and the trigger below exist to bound that.

**Neutral.** RFCs remain structurally non-conformant to upstream ADR-089 while this stands. That was already true; this decision makes it legible rather than changing it.

## Confirmation

1. Every RFC in `docs/rfcs/` with `stories: []` carries a `## Stories` section citing this decision by number, and does not re-derive the warrant. RFC-002, RFC-003 and RFC-004 are back-filled to this shape when next edited; they are not rewritten for it alone.
2. This decision is the only place in the repository where the empty-stories warrant is argued. A second argued instance anywhere else is a defect.
3. The `## Scope` paragraph above is load-bearing: a reader must not be able to use this decision to justify skipping the RFC itself, the problem trace, or RFC-first timing.

## Reassessment Criteria

Revisit when any of these fire:

1. A story tier is stood up in this repository (`docs/stories/` or `docs/story-maps/` exists). This decision is then superseded, not amended.
2. Upstream ships an adopter carve-out for repositories with no story tier, or P412 and P449 resolve their joint design read in a way that decides the adopter question.
3. Upstream ADR-089 is amended or superseded.
4. The reassessment date passes with none of the above having fired, at which point the question is whether the tier is genuinely still not wanted or has simply gone unexamined.

## Related

- **Upstream ADR-089** (Every RFC has at least one story): the decision this deviates from. Confirmed 2026-07-02. Its `draft`-RFC carve-out does not reach a `proposed` RFC recording a settled fix.
- **Upstream ADR-060** (Problem, RFC and Story framework) and **upstream ADR-073** (RFC-first): both hold that an RFC is stories on a story map rather than a prose scope blob. This decision does not dispute that; it records that the surface does not exist here yet.
- **RFC-002, RFC-003, RFC-004**: the three RFCs whose bodies currently carry the argument this decision replaces.
- **P122**: the ticket whose RFC surfaced the repetition as a problem worth solving once.
- Tom chose this home over a `docs/rfcs/README.md` convention clause and over standing up the tier, on 2026-08-07.
