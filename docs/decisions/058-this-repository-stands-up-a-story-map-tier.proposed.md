---
status: "proposed"
date: 2026-08-30
human-oversight: unconfirmed
decision-makers: [Tom Howard]
consulted: [wr-architect:agent, wr-jtbd:agent, wr-voice-tone:agent, accessibility-agents:accessibility-lead]
informed: []
reassessment-date: 2026-11-30
supersedes: 045-rfcs-in-this-project-carry-no-stories-until-a-story-tier-exists
related: [054-a-decision-is-changed-by-a-new-decision-never-by-editing-the-old-one, 036-marketplace-consumer-cannot-edit-cached-plugin-park-classification, 048-prefer-an-upstream-pull-request-over-an-issue]
---

# This repository stands up a story-map tier

## Context and Problem Statement

ADR-045 recorded that RFCs here carry `stories: []` because no story tier existed. Its warrant was the absence of a surface, not disagreement with the upstream rule, and it named its own exit: reassessment criterion 1 says a story tier existing in this repository supersedes it.

The absence has a measured cost. A fix proposal in this framework is a release row drawn on a story map, so the propose-fix predicate refuses to answer for a ticket when the repository holds no maps. Before the maps existed, that predicate returned exit 3 across the known-error backlog with the directive "this repository has no story maps yet". Those tickets could be investigated and never fixed, and the loop's own rule when no map exists is to record one item and move on, so nothing created the first map. That is a deadlock rather than a safety property.

Tom settled the direction in two steps. On 2026-08-23, recorded on P142, he chose to draw a minimal story map covering the newsletter-production journey, with a second map for the maintainer and CI supply-chain journey queued by P141, and directed that the first map not be widened to span both personas. On 2026-08-29 he directed that the maps be drafted for him to review and ratify rather than waiting for him to author them.

## Decision Drivers

- ADR-045's own reassessment criterion 1 fires the moment `docs/story-maps/` exists, and says superseded rather than amended.
- With no map in the repository, no known-error ticket could reach a fix proposal at all, because a fix proposal is a row and there was nothing to draw it on.
- Drawing the first map for a journey decides what that journey is, so the journey is a human decision even when the drafting is not.
- The six RFC documents already on disk record work whose driving problems are mostly closed. Migrating them has a cost that is separable from standing up the tier.

## Considered Options

The tier itself is settled by Tom's direction. The open question this decision must also answer is what replaces ADR-045's posture for the six RFC documents that carry `stories: []`. All six carry the empty list; only RFC-004, RFC-005 and RFC-006 cite ADR-045 as the reason, verified by grep across all six on 2026-08-30. The other three do not name ADR-045: RFC-002 and RFC-003 ground the empty list on the upstream one-story rule directly and argue the warrant in their own prose, and RFC-001 carries the empty list with no stated reason at all. So retiring ADR-045 does not by itself leave any of the six ungrounded, but it does leave RFC-001 exactly as unexplained as it already was.

1. **Keep the six as legacy records; never back-fill stories onto them.** New fixes are drawn as release rows on a map; the existing documents stay as they are.
2. **Back-fill stories onto each of the six as it is next worked.** Lazy migration, paid per RFC when it is touched.
3. **Back-fill all six now.** One migration, paid up front.

## Decision Outcome

Stand up `docs/story-maps/` with two draft maps, both born unconfirmed so Tom ratifies them:

- **STORY-MAP-001, producing the weekly edition.** The newsletter-production journey, persona publication-author, tracing JTBD-300. This is the first map Tom scoped on 2026-08-23.
- **STORY-MAP-002, working the backlog unattended.** The maintainer and CI supply-chain journey, persona internal-maintainer, tracing JTBD-400, JTBD-401 and JTBD-402. This is the second map P141 queues.

Two maps rather than one is what honours "do not widen the first map to span both personas": the constraint is against collapsing the two journeys into one backbone, not against drafting both.

### Open question for ratification: what happens to the six legacy RFCs

This record does not choose between the three options above. It is put to Tom to pin when he ratifies, because the choice forecloses a direction he has already given and that trade is his to make, not this record's to make quietly.

The direction is on P142: *"Once it exists, RFC-002, RFC-004 and RFC-005 can cite it and advance past proposed."* Standing up the maps does not deliver that. `check-rfc-has-stories.sh` gates the `proposed -> accepted` transition on a `STORY-NNN` appearing in the RFC's own `stories:` frontmatter, read from the file and nowhere else. A release row on a map does not satisfy it, and neither does citing a map. Verified against the script on disk on 2026-08-30.

So the options are not equal on that direction:

- **Option 1, keep the six as legacy records and never back-fill.** Cheapest, and defensible on the merits: four of the six have closed driving problems, so back-filling would author stories for work already finished. But it leaves RFC-002, RFC-004 and RFC-005 at `proposed` permanently. Ratifying it means accepting that P142's direction is withdrawn, not deferred.
- **Option 2, back-fill as each is next worked.** Preserves the direction at the cost of paying per RFC, and only for RFCs that are actually touched again. The three named on P142 advance when someone works them, which may be never.
- **Option 3, back-fill all six now.** Delivers the direction in full and soonest, and costs the most up front. It also requires `docs/stories/` to exist, which it does not.

All three depend on a story tier that has not been stood up, so none of them is executable today. What is being pinned is which one becomes executable when it is.

### What replaces ADR-045 for RFCs generally

ADR-045 carried the warrant for `stories: []` across the whole RFC tier, not just for the six documents on disk, and retiring it would otherwise leave RFC-007 onward with no stated reason to carry an empty list. So, carried forward and in force from this record: **while `docs/stories/` does not exist, an RFC in this repository carries `stories: []`, and that is the absence of a surface rather than a deviation from the upstream rule.** This clause retires the moment the story tier is stood up, at which point the upstream framework's one-story-minimum rule (upstream ADR-089, which is not a record in this repository's corpus) applies here unmodified and the option pinned above governs the six legacy documents.

### What this decision does not do

It does not propose a fix for the 28 remaining known errors. What changed is the kind of refusal. Measured on disk 2026-08-30, running the predicate across all 29 known-error tickets returns exit 3 for none of them, down from the whole backlog before the maps existed. That is the deadlock breaking: the refusal that needed a person to draw the first map is gone.

What replaced it is a directive the loop can act on alone. Twenty-eight of the 29 now exit 0 carrying "no release row proposes a fix for this problem", naming the row to draw and the identity to give it. Exit 0 here does not mean traced; it means the caller can resolve this itself without asking anyone. The 29th, P099, exits 0 with empty stdout, and it does so through legacy RFC-005, whose `problems:` frontmatter names it. It is not traced through the row drawn for it on STORY-MAP-001.

That last point is worth stating plainly, because it is the consequence that bites soonest. **No release row on either map traces any problem yet.** The renderer derives `rowProblems` only from cards carrying a `storyId`, resolving each one's `problems:` frontmatter from the story file; a card with a bare `ref` contributes nothing. Both maps carry exactly one card (STORY-MAP-001 activity `fix`, ref P099; STORY-MAP-002 activity `release`, ref P126), and neither carries a `storyId`, because `docs/stories/` does not exist to hold one. Querying the maps for P099 and P126 returns zero hits, verified 2026-08-30.

The practical consequence is forward-looking rather than current, and it is worth stating precisely. Neither P099 nor P126 receives that directive today: P099 exits empty on its legacy RFC trace, and P126 is not in the measured set at all, being in verifying rather than known-error. But once RFC-005 or RFC-006 stops answering for them, the predicate will tell whoever asks to draw a new row and take a new RFC identity, when a row for that problem is already drawn on the journey's map. Doing so would split the fix across two vehicles, which is the failure the gate exists to prevent. So the standing instruction is: before drawing a row, check whether the journey's map already carries one for the problem, and attach the story to that row instead.

## Consequences

Good:

- The propose-fix predicate has a surface to answer from, so a ticket's fix proposal becomes ordinary work rather than a blocked precondition.
- Both journeys are stated once, on an artefact Tom can read and correct, instead of being re-derived per ticket.
- ADR-045 retires by its own stated criterion rather than by drift.

Bad:

- A second tier to keep current. Maps carry a drift-invalidated oversight marker, so editing a map's substance re-opens its ratification and costs another ask.
- The story tier itself (`docs/stories/`) still does not exist, so the traceability the predicate ultimately wants is not yet in place.
- Vendoring `docs/story-maps/story-map.css` brings upstream styling decisions into this repository, and the renderer rewrites that file whenever it differs from the upstream template.
- `scripts/render-story-map.sh` is the only safe way to render a map here, and nothing enforces that. Every other path reintroduces the em-dashes the wrapper exists to strip, including `wr-itil-story-map-edit`, which re-renders after every operation and rewrites the vendored stylesheet. The wrapper is a convention a person has to know, not a gate. Recorded as P180.
- Nearly every accessibility string in a rendered map is a literal in the upstream renderer with no authored override, so a defect found here cannot be fixed here. A full review on 2026-08-30 found no critical and no major defect and nothing that blocks ratification, but three of the levers that keep it that way are authoring conventions nothing enforces: a status word first in each release name, short activity notes, and a plain-language description after the identifier on each card. Recorded as P182.
- **Standing up `docs/stories/` will break rendering of both maps until each card gains a `storyId`.** The renderer's `assertEveryCardHasAStory` check returns early only while the stories directory is absent; the moment it exists, a card naming no story is a hard error. Both maps carry exactly one card with a bare `ref`, so both stop rendering on the day the story tier lands. That day is this record's own reassessment criterion 1 and the named next step of P142's direction, so it is scheduled rather than hypothetical. Whoever stands up the tier authors the two stories in the same change.
- Age-based promotion would have rewritten this record to `accepted` about 14 days after its first release without anyone reading it, because the promoter never checked `human-oversight`. This is the first `unconfirmed` record in the DECISION corpus, so it is the first one that gap could reach. The RFC tier has carried unconfirmed records since 2026-07-15 (RFC-001 through RFC-005), but nothing promotes those on age. Guarded in the same commit; recorded as P179.

## Confirmation

1. `docs/story-maps/draft/` holds STORY-MAP-001 and STORY-MAP-002, and `wr-itil-detect-unratified-stories-maps` lists both.
2. Neither map carries a `confirmed` human-oversight marker written by an agent.
3. Running the propose-fix predicate across the 29 known-error tickets returns exit 3 for none of them.
4. ADR-045 is renamed to `.superseded.md`, carries `status: "superseded"` and `superseded-by:`, and `scripts/decisions-supersession.test.mjs` passes.
5. Each RFC document that cites ADR-045 as the warrant for its empty `stories:` list, which on 2026-08-30 is RFC-004, RFC-005 and RFC-006 and not all six, has that citation repointed to this record the next time that RFC is edited for any reason. Not a migration pass: it is paid per document, when the document is already open. The other three need no repoint: two of them cite the upstream rule rather than ADR-045, and the third cites nothing. The carried-forward clause above covers all three.

   Separately and in the same per-document pass: RFC-002 and RFC-003 each assert in prose that "there is no `docs/stories/` and no `docs/story-maps/` directory". The second half of that becomes false the moment this record commits. Their conclusion survives, because the empty `stories:` list turns on `docs/stories/` and that is still absent, but the stated reason is half wrong from day one. Correct it when each is next open.

## Reassessment Criteria

Revisit when any of these fire:

1. A story tier (`docs/stories/`) is stood up, at which point the legacy-RFC option pinned here is exercised for real, the carried-forward `stories: []` warrant above retires, and both maps need a story attached to their single card before either will render again.
2. Tom ratifies neither map, or amends a journey, which changes what the maps assert.
3. A third journey needs a map, at which point the one-map-per-journey shape is worth re-examining.
4. The reassessment date passes with the maps still unratified, at which point the question is whether drafting-for-ratification worked at all.

## Related

- **ADR-045**, superseded by this record. Its reassessment criterion 1 is what fires here.
- **ADR-054**: a decision is changed by a new decision, never by editing the old one. ADR-045 is edited in frontmatter only.
- **P142**: the ticket carrying Tom's 2026-08-23 scope decision and the architect constraint that this record land with the tier.
- **P141**: queues the maintainer and CI supply-chain map.
- **P099** and **P126**: the driving problems of the two release rows drawn.
- **P179**: the promotion guard this record's own `unconfirmed` status exposed.
- **P180** and **P182**: the two upstream story-map renderer defects standing this tier up surfaced.
