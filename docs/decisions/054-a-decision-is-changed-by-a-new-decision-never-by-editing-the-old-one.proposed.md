---
status: "proposed"
date: 2026-08-16
human-oversight: unconfirmed
decision-makers: [Tom Howard]
consulted: [wr-architect:agent]
informed: []
reassessment-date: 2026-11-16
related: [052-every-newsletter-reviewer-gate-blocks-publication]
---

# A decision is changed by a new decision, never by editing the old one

## Context and Problem Statement

When a decision is overtaken, this project has been appending an `## Amendment` section to the record that was overtaken. Six decisions carry one today: ADR-019, ADR-020, ADR-026, ADR-032, ADR-042 and ADR-043.

The practice fails on discoverability. A reader opens a decision to learn what was decided, reads the Decision Outcome, and acts. The amendment sits below, after the consequences, past the confirmation criteria, and is read only by someone who reads to the end. ADR-020's reassessment criterion 6 is the worked failure, and it runs the other way from the obvious guess: the wrong claim did not survive an amendment, it entered through one. ADR-020's own record says so, that the ceiling error entered through the 2026-06-17 amendment body, propagated into ADR-042 and then ADR-043, and was corrected only on 2026-08-07. An amendment section is read too little to be caught and trusted enough to be copied, which is worse than either alone.

On 2026-08-16 the practice was applied again at scale. ADR-052 (every newsletter reviewer gate blocks publication) had overtaken a clause in each of eight older decisions, and the repair drafted was an amendment section on all eight. Tom rejected the approach and stated the rule: *"We should never amend an ADR, we should create new ADRs that supersede the old ones."*

The rule needs a home an author will find. It was first written into a confirmation criterion of a newsletter-scoped record, where someone writing about deploy artefacts or risk bands would never look, which reproduces the discoverability failure it exists to fix.

## Decision Drivers

- A reader must meet the change before the superseded text, not after it. That is the whole objection to amendment sections.
- Ratified text must not be edited. Ratification attaches to specific words; an edit afterwards voids it.
- The record of what was decided, and when, and by whom, is the thing decision records exist to hold. Editing prose in place destroys it.
- A corpus-wide rule has to sit in a corpus-wide record, or the people it binds will not find it.

## Considered Options

1. **A new decision changes an old one; the old one is never edited except in frontmatter (chosen).** Relationship keys carry the redirect. The superseded prose stays as it was written.
2. **Keep amendment sections, but require them at the top of the record.** Cheaper, and it does put the change before the stale text. Rejected: it still edits a ratified record, and a decision that has been amended three times becomes a stack of corrections with no single readable statement.
3. **Status quo.** Rejected: it is the practice that produced the worked failure.

## Decision Outcome

Chosen option: **"A new decision changes an old one; the old one is never edited except in frontmatter"**, stated by Tom on 2026-08-16.

**What may change in an overtaken record: frontmatter only.** The relationship keys, and where the whole record is retired, its `status`. Nothing in the body.

**Which relationship to use.** The corpus already carries both pairs and they are not interchangeable.

- `supersedes:` / `superseded-by:` retires a decision whole. The old record gains `status: "superseded"` and is renamed to `.superseded.md`. Use it when the new decision replaces the old one's job.
- `amends:` / `amended-by:` overtakes part of a decision while the rest still governs. The old record keeps its status and its filename. Use it when the old decision still does a job the new one does not take over.

A third pair was drafted for clause-level retirement and rejected: `amends:` already carries it, and a third vocabulary would fragment the graph for a distinction that belongs in prose.

**Tom chose the reuse, and he chose it on corrected facts.** The vocabulary question was put to him with three options after the first framing of it turned out to be false: it had claimed the corpus held no clause-level mechanism, when `amends` had been carrying exactly that. He picked reuse over a third pair.

**The evidence for it, measured, after three wrong statements of the same figure.** The claim first offered was that `amends` is in live use across fourteen records. A review called that an edge count rather than a record count, and the correction accepted it and substituted a different figure. Counted directly: fourteen distinct records ARE named as an `amends` target, across ten records carrying the key and twenty-two edges. The original claim was true and the correction of it was wrong.

What was genuinely weak is a different number. Before this decision, only seven records carried the reciprocal `amended-by`, against fourteen that should have. Eleven forward claims had no reciprocal, landing on ten distinct records. Thirteen frontmatter lines across thirteen files repaired the graph, counting the two unrelated defects the repair surfaced.

Recorded at this length because the same figure was stated wrongly three times, once by asserting it, once by wrongly correcting it, and once by substituting a reasoned number for a measured one. The forward half of the pair was genuinely in live use; the reciprocal half was half-populated. Reuse is the right call because a second vocabulary would fragment a graph that needed repairing rather than replacing, and that argument never depended on the count.

**The amending record names what no longer governs.** Not "this amends ADR-020", which tells a reader nothing about which sentence is dead. Name the clause: the section, and enough of the text to find it. That is what makes a relationship claim checkable instead of gestural.

**Both directions are required.** A claim in one file and silence in the other is how the graph rots. Before this decision, eleven `amends:` claims across the corpus had no reciprocal pointer, including all eight of ADR-052's, and ADR-040 amended ADR-019 without declaring it. ADR-003 was worse: retired, renamed `.superseded.md`, and carrying no pointer to its successor at all, so a reader who opened it was told the decision was dead and given nowhere to go. Its own body named ADR-008; the frontmatter never did. All of these are now reciprocal, and a test asserts the properties rather than trusting them, including that a retired decision names its successor, which reciprocity alone cannot catch because a record declaring nothing is invisible to it.

**The six existing amendment sections stay.** Retrofitting them means editing prose in live records, one of which is accepted, which is the act this decision forbids. They are inherited, they are named above, and they are not a precedent. Note the residue honestly: three of the six (ADR-020, ADR-042, ADR-043) also carry an `amended-by` pointer and so redirect a reader; three (ADR-019, ADR-026, ADR-032) carry only the amendment section and redirect nobody. Those three are the surviving instance of the hazard.

**One further gap, recorded rather than left in a session.** During the review that produced this decision, the architect asserted that ADR-018 carries the same overtaken clause as ADR-020, namely an `Additive, not superseding` paragraph preserving ADR-015's save-but-do-not-publish semantics. ADR-018 is not in ADR-052's `amends` list and gains no pointer here. Two reasons, and the second is the honest one. ADR-052 is ratified, so adding to its `amends` list would be the act this decision forbids. And on reading ADR-018 in full the asserted clause could not be pinned to a specific line, so propagating the claim into a relationship would be asserting project state from a subagent verdict rather than from the file, which this project has recorded as a recurring failure. The claim is therefore neither acted on nor discarded: it is written down here so the next reader can settle it against the file instead of rediscovering it. If the clause is real, ADR-018 needs a redirect and the right vehicle is a new decision, not an edit to ADR-052.

**Two things this decision sets as a standard that its own first application does not meet.** The clause-naming requirement above is not met by ADR-052, which names the rule rather than each overtaken record's specific clause, so eight of the eleven pointers created alongside this decision redirect a reader to a rule rather than to a sentence. And nothing checks clause citations at all, only relationship reciprocity. Both are stated in the Bad consequences below rather than left for a reader to notice.

## Consequences

### Good

- The change is visible in frontmatter, above the body, before a reader reaches the stale text.
- Ratified records stay as ratified, so a ratification means what it said.
- The relationship graph becomes checkable. `scripts/decisions-supersession.test.mjs` asserts every claimed slug resolves and every claim is reciprocal, and it goes red on a broken pointer.
- No new vocabulary. The two existing pairs carry the whole model.

### Neutral

- An overtaken record keeps prose that is wrong when read in isolation. That is the trade: the frontmatter redirects rather than the text being corrected, because correcting it is the act this decision forbids.

### Bad

- A reader now needs two records to know what one decision currently requires, and three if it has been overtaken twice.
- Nothing checks that a clause named in an amending record still exists in the file it names. The relationship is verified; the clause citation is not.
- A record overtaken many times accumulates `amended-by` entries with no summary of what survives. The reassessment criteria below name the threshold at which that becomes the problem rather than the cure.

## Confirmation

- `scripts/decisions-supersession.test.mjs` passes: every slug in an `amends:` or `supersedes:` list resolves to a decision on disk, and every claim carries its reciprocal pointer.
- No decision gains an `## Amendment` section after 2026-08-16. The test carries the six known files as an allowlist and goes red on a seventh, including one appended to an old record.
- A decision that overtakes part of another names the clause specifically enough to locate it, rather than naming only the record.

## Reassessment Criteria

- A record accumulates three or more `amended-by` entries, at which point it has been hollowed out and should be replaced whole rather than pointed around.
- A reader acts on overtaken prose despite the frontmatter redirect, which would mean frontmatter is too weak a signal and the answer is a replacement record per overtaken decision.
- The compendium at `docs/decisions/README.md` still fails to render `amended-by`, which is the surface the architect agent loads for routine compliance review. It renders `**Supersedes:**` today and not the amendment relationship, so a review that reads only the compendium sees no redirect. The generator lives upstream in the architect plugin and is not editable here, so this is tracked as an upstream change rather than a local fix.
