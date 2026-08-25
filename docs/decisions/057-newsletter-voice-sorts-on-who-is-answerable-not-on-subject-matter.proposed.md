---
status: "proposed"
date: 2026-08-24
human-oversight: confirmed
oversight-date: 2026-08-25
decision-makers: [Tom Howard]
consulted: [wr-jtbd:agent, wr-risk-scorer:pipeline, wr-voice-tone:agent]
informed: []
reassessment-date: 2026-11-24
amends: [010-team-voice-positioning, 032-newsletter-editorial-discipline-policy]
related: [012-ai-generated-content-review-gates, 052-every-newsletter-reviewer-gate-blocks-publication, 053-the-shift-adopts-an-h2-rooted-section-outline-from-issue-17, 054-a-decision-is-changed-by-a-new-decision-never-by-editing-the-old-one]
---

# Newsletter voice sorts on who is answerable, not on subject matter

## Context and Problem Statement

On 2026-08-24 an external reviewer read Issue 19 and reported that the voice drifted between "I" and "we". Checking every instance showed it did not: the author-voice section ran on "I", the reporting ran on "we", and the only first person elsewhere was a sourced quote plus three judgement calls. The voice gate confirmed it independently, and put it as "you cannot fix a document by imposing the rule it is already following."

Tom then directed that the rule be written down so it would not be re-argued every edition. Writing it down is what surfaced the problem this record settles.

**ADR-010 sorts on subject matter and returns no answer here.** Its consequences run "personal observations" against "service-related content". An item that reports what OpenAI published and then draws a consequence for the reader is neither, and that is the largest category of text the publication produces.

**Seven statements of the rule exist across five files and they do not agree.** Verified on disk 2026-08-24. `SKILL.md` line 479 says the From Tom opener "is the only place where 'I' is permitted in the brief". `SKILL.md` line 440 and `assets/draft-template.md` line 7 say "team voice, not 'I'" with no carve-out at all. `personas/leader.md` line 31 was widened the same day to permit "I" in item analysis. `personas/developer.md` line 31 keeps the narrow form. `docs/VOICE-AND-TONE.md` carries two: the preamble and the new section. The gate's own oracle contradicts itself across files a single pipeline step reads.

**Practice had already moved and the rules had not.** Issue 18 published "here is where I come down" in an item body. Issue 19 published three judgement calls outside the opener and the provenance line, one of them in Also worth noting. Two consecutive editions passed a rule that was describing a practice that had already changed, which means the rule was providing no control.

## Decision Drivers

- The voice gate blocks publication (ADR-052), so its oracle has to be decidable and has to be singular.
- JTBD-005 outcome 3 asks for the "so what" for delivery, tooling and risk decisions. A reader acting on a "so what" needs to know whether it is reportage or a judgement call, because the two carry different warrant. Person-marking is a decidable signal of which is which.
- JTBD-006 outcomes 1 and 3: sections must be tellable apart, and the opener is what identifies the edition in a feed. A stable person register per section does part of that work.
- JTBD-300 outcome 4, that the same question is not asked twice, and outcome 5, that the external reviewer finds new things rather than the same things. Issue 19 is the worked case: the reviewer raised a class that was not a defect and there was no record to answer from.
- A rule that contradicts two consecutive published editions is worse than no rule, because it teaches the gate to block what the publication actually does.

**What is deliberately not claimed as a driver.** The obvious argument is that this publication is about who is answerable for what a machine produced, so the person a sentence uses matters. That argument is real but it is the publication's own position, recorded at ADR-032 element 5, and it is not a documented reader outcome. Neither JTBD-005 nor JTBD-006 carries an answerability outcome. Adding one now would manufacture grounding for a rule that is already on disk, which is the failure P121 declined on 2026-08-07, and the objection there was about causal order rather than about which file the text lands in. This record is written on the grounding that exists.

## Considered Options

1. Leave it as guide prose citing ADR-010 as authority. Rejected: it shipped that way and did not hold, and ADR-010 is not authority for an axis it does not decide.
2. Amend ADR-010 in place. Rejected: barred by ADR-054, a decision is changed by a new decision and never by editing the old one.
3. A new decision amending ADR-010 on one clause, with every surface citing it rather than restating the rule. Chosen.

## Decision Outcome

**Option 3.**

Option 1 was what shipped first and it did not hold. Four successive risk-scoring passes each found a real defect introduced by the previous fix, and the score did not move across the last three. The diagnosis was that decision content was being argued inside a document whose job is to record decisions, so no authority in the loop could declare the rule settled.

Option 2 is barred by ADR-054: a decision is changed by a new decision, never by editing the old one.

### What is decided

**One. Newsletter voice sorts on who is answerable.** "We" for anything the team or the publication did or holds. "I" for Tom's judgement, his individual track record and his editorial responsibility. The test: could another person on the team have done it or said it, and would it still be true? Then it is "we".

**Two. Where this and ADR-010's subject-matter clause disagree, this governs the newsletter brief and its LinkedIn companion post, and nothing else.** ADR-010 continues to govern the site, blog articles and standalone social posts, and its blog practitioner "I" is untouched.

**Three. The gate blocks on location, not on the test.** "I" in the factual "What happened" bullets or in the move list is a hard fail: those report and instruct rather than judge, and the boundary is a bold literal marker a script can find.

Everywhere else in the brief, a violation of the test in item one is a finding the remediation loop is forbidden to act on, cleared by the author with a stated reason under ADR-043 clause 4 and recorded in the reviews sibling with a tag and a reason, so that check (n) in `scripts/check-newsletter-structure.sh` verifies it. That is a sixth limb on ADR-052 rider 1's list of five, not a revival of the accepted-residual path ADR-052 abolished, and the difference matters: the finding does not disappear, it is cleared on the record by the person answerable for it.

**This record is the ratified decision that defines the emission** which ADR-052 requires before any reviewer may classify itself out of a finding. Absent such a record, ADR-052's default holds and every unclassified finding is a defect. The voice gate emits no class marker today, so item three has no effect on gate behaviour until the two invocation prompts named in the enforcement surfaces below are changed to produce one. Until then the gate blocks on everything, which is the fail-safe direction and is why this record can land before the prompt change.

**Four. Scope of this record is the leader persona, The Shift, deliberately.** Tokens Spent keeps the narrower rule at `personas/developer.md` until somebody has a reason to change it. There is no corpus of developer-persona editions to check a wider rule against, and no developer-persona job records a first-person constraint. This follows the precedent JTBD-006 sets for its own scope note.

Item three is the composition that was missing and it is why the earlier attempts kept failing. Item one is a test of *kind* and item three is a rule of *place*, and they come apart on real sentences: "I checked every source" inside an item body is publication work, so the test says "we", while the location rule permits it. Under a pure blacklist the test is decorative outside the two forbidden zones. Under a pure kind test the gate is a judgement predicate and blocks on taste. Splitting the authority resolves it: the test decides which person is correct, the location decides where the gate may block.

The blacklist reading of item three is chosen over a whitelist because it is the reading under which Issue 19, published 2026-08-24, is already compliant. The Article 50 passage in that edition carries "I" outside any whitelist that could reasonably have been written, and a rule that makes an already-published edition retrospectively non-compliant is a worse rule.

### Consequences

- Good: one oracle, one axis, one mechanically checkable exclusion.
- Good: the seven disagreeing statements collapse to one rule with citations.
- Bad: two rules now sort on different axes in the same guide, and a drafter has to know which surface they are on. The reciprocal pointers named below are the mitigation, and the cost is the price of leaving ADR-010's carve-out intact.
- Bad: the move-list exclusion names a section `assets/draft-template.md` does not define, so half of item three is not checkable until the template gains it. Recorded rather than fixed here.
- Neutral: ADR-032 element 5's provenance-line carve-out now has two independent justifications, its own and this test. It survives independently, because its reason is specific to that paragraph: "we still read every line" sitting after "a different AI reviews it" leaves "we" ambiguous about whether it includes the machines. This record does not subsume it.

### Enforcement surfaces

Every one of these must cite this record rather than restate the rule. Listed because leaving any of them stale reproduces the contradiction this record exists to close.

1. `docs/VOICE-AND-TONE.md`, the "Who is speaking" section, four edits. Strike "plus outbound copy that speaks for the team" from the scope paragraph, which claims wider coverage than item two grants. Add a leader-persona scope note, because the section as written carries no persona qualification and the voice gate prompt is persona-parameterised, so without it the rule reaches Tokens Spent and contradicts item four. Correct the basis sentence, which currently reads "The basis is ADR-010, which decides team-plural voice"; ADR-010 does not decide the answerability axis, and that mis-attribution is the defect this record exists to remove. Remove the sentence telling the reader to keep checking per edition until ratification.
2. `docs/VOICE-AND-TONE.md` LinkedIn guidelines: the existing reciprocal pointer stays and gains the ADR reference.
3. `.claude/skills/wr-newsletter/SKILL.md` line 479: currently "the only place where 'I' is permitted in the brief", which is the superseded whitelist.
4. `.claude/skills/wr-newsletter/SKILL.md` line 440: currently no carve-out.
5. `.claude/skills/wr-newsletter/assets/draft-template.md` line 7: currently no carve-out.
6. `.claude/skills/wr-newsletter/personas/leader.md` line 31: restate as the two exclusions rather than as enumerated permitted locations, and correct the mis-citation. The line currently ends "(ADR 032 element 5, first person on both the brief and the LinkedIn companion)", carried over from the narrow rule. ADR-032 element 5 authorises first person for the provenance paragraph alone, on a reason specific to that paragraph, so as written it appears to license item analysis, which no ratified decision does until this one lands.
7. `.claude/skills/wr-newsletter/personas/developer.md` line 31: unchanged, with a note that item four scopes this record away from it.
8. `.claude/skills/wr-newsletter/SKILL.md` line 717, the step 13 voice gate invocation for the brief: currently instructs the reviewer to check "team voice (ADR 010)".
9. `.claude/skills/wr-newsletter/SKILL.md` line 1055, the same instruction for the companion post.

Surfaces 8 and 9 are the load-bearing ones and were missing from the first draft of this record. They are what the voice reviewer is actually told to check, and both name ADR-010 as the standard for precisely the two artefacts item two claims. While they stand unchanged, confirmation criteria 2 and 3 cannot pass, because the gate has been pointed at the subject-matter rule and has never been told the location rule exists.

The hard fail in item three needs a deterministic owner rather than prose, because ADR-052's own confirmation records that a prose rule at this exact surface did not hold. Checks in `scripts/check-newsletter-structure.sh` currently run to (r), so the new check is **(s)**, and it must accept both the H2-rooted outline and the legacy H3 form, since ADR-053 leaves the archive in the older shape.

### Confirmation

1. All seven surfaces above cite this record and none restates the rule.
2. An edition publishes with first person in an item body and the voice gate does not flag it.
3. A draft with first person in a "What happened" bullet is blocked by the gate.
4. An external reviewer's next voice finding is a new one, not this one.

### Reassessment Criteria

Reassess if Tokens Spent gains an author-voice section, if the drafting template gains a move-list definition that makes the second exclusion checkable, or if a gate verdict turns on the whitelist-versus-blacklist question again despite item three.

## More Information

**Why this is a decision and not documentation.** The sorting axis is new; ADR-010 does not decide it. The precedence over ADR-010's social-media clause is new, and precedence between two written rules is a decision by definition. The persona permission surface widens, which changes what a blocking gate allows.

**The tell.** The provenance paragraph originally written into the guide read like an ADR context section, because that is what the content was. The guide carries the rule; this record carries the decision.

**What is already live.** The rule shipped in commit `69f898e` on 2026-08-24 marked unratified in its own text, on the reasoning that a narrower oracle blocking correct copy is the fail-safe direction. The persona config widened in the same commit. This record does not introduce the rule; it settles the open question, names the surfaces that still contradict it, and removes the unratified marker.

## Related

- ADR-010 (Team voice positioning) is **amended**, not superseded, and the reciprocal `amended-by:` is added to its frontmatter, which ADR-054 permits without voiding its ratification. The clause amended is its Consequences bullet, "Social media posts shift to 'we' for service-related content, 'I' remains acceptable for personal observations". The LinkedIn companion post is a social post, so that bullet reaches it today, and item two narrows it for that artefact alone. Its blog and standalone-social practitioner carve-out is untouched and is load-bearing for item two.
- ADR-032 (Newsletter editorial discipline policy) is **amended** on one clause, with the reciprocal `amended-by:` added to its frontmatter. The clause overtaken is the Voice carve-out paragraph of its 2026-08-03 amendment, which asserts that ADR-010 "does not reach newsletters at all" and that "the binding rule for newsletter surfaces is therefore the skill files". Item two takes the opposite reading, because its Confirmation enumerates service copy, metadata, credentials, testimonials, blog, FAQ and external-threat copy with no newsletter row. Item two takes the opposite reading, that the social-post bullet does reach the companion post, which is what makes the `amends:` correct. Both readings cannot stand; this record picks the reaching one.
- ADR-053 (H2-rooted section outline) is why check (s) has to accept two structural forms.
- ADR-012 (AI-generated content review gates) establishes the voice gate whose oracle this record changes.
- ADR-054 (A decision is changed by a new decision) is why this is a new record.
- ADR-052 (Every newsletter reviewer gate blocks publication) is why the oracle must be decidable.
- ADR-032 (Newsletter editorial discipline policy) element 5 survives independently, per the Consequences note.
- P121 records the prior decline of manufacturing JTBD grounding for a decision already made, which is why the Decision Drivers section states what it does not claim.
