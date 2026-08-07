---
status: "proposed"
first-released: 2026-07-16
date: 2026-07-14
human-oversight: confirmed
oversight-date: 2026-07-14
decision-makers: [Tom Howard, Claude]
consulted: [wr-architect agent]
informed: []
related: [012-ai-generated-content-review-gates, 015-reader-respect-and-gate-rejection-policy, 020-newsletter-editor-subagent, 025-pass-with-author-overrides-verdict-for-sw-critic, 033-domain-specific-critic-agents-supersede-parameterised-sw-critic, 035-critic-rubric-shape-is-strengths-weaknesses-plus-context, 038-cross-edition-thesis-consistency-check-as-fresh-context-subagent-gate]
reassessment-date: 2026-10-14
amended-by: [043-bounded-editorial-remediation-loop-for-editor-and-skeptic-gates]
---

# Add an adversarial skeptic gate to the newsletter pipeline

## Context and Problem Statement

The `wr-newsletter` pipeline runs five review gates before an edition ships:
voice, content-risk, newsletter-critic, editor, and cognitive-accessibility.
All five check conformance to a rubric or a documented axis set. They are
floor gates: they verify the draft has the required parts, formed correctly.

Every edition still comes back from Tom's external editorial review with real
substantive fixes AFTER all five gates return PASS. Issue 13 (2026-07-13) is
the concrete case: all five gates PASSed across the prep multi-round loop and
the finalise re-gate, then the external review caught four things none of the
gates did:

1. The headline thesis did not hold. "Half were theatre" overstated the
   evidence: only one of the items was strictly manufactured.
2. A promise/payoff gap on the LinkedIn post: it named four stories in the
   preview but resolved only two in the body.
3. Overstated causation: "an exam without laptops cut scores in half" implied
   removing laptops caused the drop, which is the exact misread the edition
   itself warns against.
4. Flat human-angle beats that restate the practical point rather than land a
   people or emotional beat.

This is the third tracked recurrence of the same class (P008 on 2026-04-17,
P017 on 2026-04-24, P116 for Issue 13). P008 and P017 both tried the
rubric-expansion path: P008 grew the critic rubric to 31 checks and built the
receptive editorial-sim (the newsletter-editor, which scores would-open /
would-read-through / would-forward); P017 added contradiction and ambiguity
checks. Both were closed 2026-05-30 as fixed. Both were insufficient, and the
gap recurred, because a receptive-editor simulation and more rubric checks are
a different job from an adversarial reader trying to break the piece. The
missing capability is a gate that attacks the edition holistically rather than
scoring its parts.

A corpus analysis of the external-review findings across all 11 editions with
a reviews file (2026-05-01 to 2026-07-13; 7 carried external-review findings,
34 findings total) grounds what the gate should attack. The Issue-13 axes
(thesis-truth, promise-payoff, causation-honesty, human-angle) each appear
exactly once, all in Issue 13, so a gate scoped to them alone would be
over-fit to one edition. The dominant SUBSTANTIVE recurrence is
claim-evidence over-claim: 9 findings across 6 editions, every external review
but one. The recurring question is "is the claim earned, does the evidence
match the assertion, is the certainty calibrated to the source, is the
direction right." The scariest instance is 2026-05-08, where all five gates
PASSed a brief that inverted the threat model (it implied the team's own
models attacking when the source finding was the inverse: bad actors using
frontier models). Thesis-truth and causation-honesty are the sharp special
cases of claim-evidence, not separate high-frequency axes. The highest-VOLUME
bucket, structural/format hygiene (14 findings), is already largely covered by
the deterministic `scripts/check-newsletter-structure.sh` lint (P089, wired
and running: Issue 13 recorded "Structural lint PASS"), so it is out of scope
for this gate. Through-line/off-thesis pruning, cross-edition dropped-threads,
and operational actionability of the so-what recur at lower frequency and
belong to prompt-tightening of the existing editor, cross-edition-consistency,
and critic gates respectively (tracked as follow-ups on P116), not to this
gate.

## Decision Drivers

- The recurring class is thesis-truth, structural promise/payoff completeness,
  causation honesty, and human-angle aliveness. No existing gate owns any of
  these.
- The prior fixes (rubric expansion, receptive editorial-sim) are the two
  paths that already failed to close it; repeating them is not an option.
- The confirmation-bias failure the pipeline already recognises (ADR-016,
  ADR-020): the drafter and same-family critics share the frame that produced
  the draft, so they cannot self-supply the adversarial read.
- The pipeline already carries a subagent-invocation cost budget (ADR-020
  reassessment criterion 6, the ~15-per-issue ceiling); a new gate must be
  justified against it, not added silently.
- Coverage-partitioning discipline (ADR-035): a new evaluation stance gets its
  own gate rather than being folded into an existing one that would blur the
  boundary.

## Considered Options

1. **Add a separate adversarial skeptic subagent gate** (chosen). A new
   fresh-context `wr-newsletter-skeptic` whose stance is to refute and break
   the edition, distinct from every existing gate.
2. **Absorb the skeptic role into the existing editor.** Extend the
   newsletter-editor with adversarial axes rather than adding a gate.
3. **Tighten the existing critic and editor rubrics again.** Add more checks
   for the recurring failure classes.

## Decision Outcome

Chosen option: **Option 1, a separate adversarial skeptic subagent gate**,
because the recurring gap is a missing evaluation *stance* (adversarial
refutation), not a missing check or a receptive-reader shortfall, and the two
alternatives are precisely the paths that already failed (Option 3 is what
P008/P017 did) or that would blur a boundary ADR-035 forbids (Option 2 folds a
"break it" stance into a gate whose documented job is to "simulate a receptive
reader").

### The agent

A new fresh-context subagent `wr-newsletter-skeptic` (tools: Read, Glob, Grep;
model: inherit), following the same confirmation-bias-breaking pattern as the
critic (ADR-016 lineage) and editor (ADR-020). Its stance is adversarial: it
tries to refute the edition, not score it. Its axes are expressed as an
editorial prompt (not a numbered scored table, per ADR-035), centred on the
dominant recurring class the corpus analysis surfaced:

- **claim-evidence calibration (primary)**: for every claim, is it earned by
  the evidence cited, does the evidence actually match the assertion, is the
  certainty calibrated to the source (a single early finding is not a settled
  verdict), and is the direction right (does the brief assert the inverse of
  what the source found, the 2026-05-08 failure)? This is the axis 6 of the
  last 7 external reviews exercised.
- **thesis-truth (facet)**: the whole-edition special case of claim-evidence.
  Does the evidence across ALL items support the headline claim, including any
  proportion, magnitude, or count claim ("half", "most", "doubled")?
- **causation-honesty (facet)**: the causal special case. Flag any claim
  asserting X caused Y where the evidence shows only correlation or
  association.
- **promise-payoff**: every story the opener, preview, or fold names must be
  resolved in the body. Hunt unresolved promises.
- **live-human-angle**: does each human-angle beat land a people or emotional
  beat, or merely restate the practical point?

The primary axis and its two facets carry the recurring substantive load; the
last two are lower-frequency (once each in the corpus, both in Issue 13) but
cheap to fold into the same adversarial read. Structural/format hygiene is NOT
an axis: it is owned by the deterministic P089 lint. Through-line, cross-edition
continuity, and so-what actionability are NOT axes: they are prompt-tightening
follow-ups on the editor, cross-edition-consistency, and critic gates (P116).

Output is a fixed `SKEPTIC_REVIEW` block in the ADR-035 strengths +
weaknesses + optional-context shape, each weakness a quoted passage plus the
named issue plus a suggested direction (not a rewrite), with a mechanical
`SKEPTIC_VERDICT` of `PASS` or `WEAKNESSES_FOUND`. The verdict is non-blocking
save-but-revise (ADR-015 semantics): the skill saves the draft with the block,
Tom decides whether to revise or override, and any revision re-enters the full
gate set via the existing SKILL.md section 15.6 dirty-body re-gate discipline.
No new multi-round loop machinery is added, and the ADR-025
`PASS_WITH_AUTHOR_OVERRIDES` override-list is not reintroduced (ADR-035 retired
the numbered-check override mechanism; the skeptic has no numbered checks and
is non-blocking, so it does not need it).

### Position in the sequence and invocation count

The skeptic runs at a new step 15.35, after the editor gate (15.25) and before
cognitive-accessibility (15.4), so it attacks a structurally-clean brief body.
It runs only when the newsletter-critic returned PASS (defence-in-depth
skip-on-REJECTED, the same rule the editor uses): a draft going back for
argument rework should not spend the skeptic invocation. It is also invoked on
the LinkedIn post after that post is drafted (step 15.5); the agent is
target-agnostic and attacks whatever artifact text it is given. This second
invocation deliberately closes the LinkedIn-teaser scope gap ADR-020 left open
(its Bad-consequence 4 and reassessment criterion): the editor is brief-body
only, so nothing adversarial has ever read the teaser, and two of the Issue-13
misses (promise/payoff, causation) were on the LinkedIn post.

Invocation-budget tally (ADR-020 reassessment criterion 6, the ~15-per-issue
ceiling, and its explicit "revisit whether existing gates need tightening
rather than a new gate" warning). Per issue the skeptic adds at most two
invocations in a phase (brief body once, LinkedIn post once), matching the
per-gate cost of the existing single-pass gates and well inside the ceiling.
This ADR engages the "tighten first" warning head-on rather than silently:
tightening is Option 3, and it is precisely what P008 and P017 already did, so
the warning's preferred path has been tried twice and did not hold. Adversarial
is not receptive; the new capability cannot be reached by adding checks to a
gate whose stance is wrong for it.

### Boundary partitions (declared so a future retro can detect collapse)

- **vs `wr-newsletter-cross-edition-consistency` (ADR-038).** ADR-038 owns
  CROSS-edition thesis consistency: does this edition contradict prior
  published theses? The skeptic owns WITHIN-edition thesis-truth: does THIS
  edition's own evidence across all its items support THIS headline? Both are
  fresh-context subagents and both touch "thesis"; the seam is
  within-edition-evidential-support versus cross-edition-consistency.
- **vs `wr-newsletter-critic` (ADR-033, ADR-035).** The critic owns per-item
  argument soundness: does each item's claim follow from its evidence, is the
  "so what" answered, is it pablum? The skeptic owns cross-item thesis-truth
  and structural promise/payoff completeness: properties of the edition as a
  whole, not of any single item.
- **vs content-risk (ADR-012, ADR-015).** The skeptic's causation-honesty axis
  overlaps content-risk's claims and factual axes. This overlap is INTENTIONAL
  defence-in-depth, following the ADR-015 precedent of dual-gate coverage on
  reader-respect, not an oversight: an adversarial second look at causation is
  a different reading posture from a risk-scoring first look, and the Issue-13
  causation miss cleared content-risk.
- **vs editor (ADR-020, post-P081).** The editor simulates a receptive reader
  (would-open / read / forward) plus a line-editor craft pass. The skeptic is
  an adversarial reader trying to refute. The same passage may draw comment
  from both; that is acceptable defence-in-depth, declared here so a retro can
  detect boundary collapse per ADR-020 reassessment criterion 2.

- **vs editor's assembly axes (ADR-020, post-P122, added 2026-08-07).** The
  2026-08-07 P122 amendment to ADR-020 gives the editor four whole-edition
  assembly axes, two of which sit close enough to this gate's `promise-payoff`
  to need a declared seam: `signpost-promises-match-contents` and
  `close-collects-the-so-what`.

  **`promise-payoff` is evidential.** It asks whether the substance a promise
  named is actually delivered somewhere in the body. An unresolved promise is a
  claim the piece failed to earn, and under this decision's reduce-only
  differential the default remediation is to drop the promise.

  **The editor's two are navigational and organisational.**
  `signpost-promises-match-contents` asks whether a heading, item label or
  in-body signpost describes what *physically follows it*, so a mismatch
  misroutes the reader even when the substance is present and sound elsewhere.
  `close-collects-the-so-what` asks whether the close gathers what the body
  actually delivered.

  The discriminators are **object** and **locality**: this gate's promise
  sources are the opener, preview and fold (as pinned above); the editor's are
  headings, item labels, in-body signposts, and the headline whose payoff the
  close is meant to collect (the close is the collector, not the source). This gate asks
  whether the substance appears anywhere; the editor asks whether it appears
  where the label says it will.

  **The worked case is P122's finding 2**, a close that does not collect what
  the headline promised, and it is settled on the artefact rather than on
  taste. P122's reproduction record shows the body **did** deliver all three
  candidates and the close simply never gathered them; the published fix was a
  collection edit ("Three of the week's moves have the shape:" followed by
  naming all three), not a claim edit. Run the evidential test on that: the
  promised substance is present, so nothing is unearned, so `promise-payoff` is
  clean and the defect is the editor's. The "reads as either" framing belongs to
  RFC-004, not to P122: RFC-004 introduced the contest on 2026-08-07, after
  P122's reproduction pass, and P122 itself never contests the assignment,
  mapping finding 2 to `close-collects-the-so-what` flatly in its axis table.
  This amendment resolves RFC-004's contest against P122's own record. That the remediations
  differ corroborates the assignment without being the ground for it, and the
  difference is narrower than it first looks: this gate drops or evidences,
  while the editor's axis reorganises the close or, where the headline
  over-promises, narrows the headline. Both are deflationary; only the object
  differs.

  A passage genuinely exhibiting both failures may be reported by both. That is
  the same defence-in-depth the bullet above declares, and it does not trip
  either collapse trigger: this decision's reassessment criterion fires on the
  two gates flagging the same passages **with the same framing**, and evidential
  versus navigational is precisely a framing difference. ADR-020 reassessment
  criterion 2 (cross-gate) is the sibling trigger; ADR-020's new criterion 7
  limb 2 is intra-agent only and does not cover this pair.

## Amendment 2026-08-05 (P120): the skeptic joins a bounded remediation loop; two clauses lifted by ADR-043

Problem 120 (`docs/problems/known-error/120-editor-and-skeptic-gates-surface-findings-to-tom-instead-of-remediating-them.md`) records that this gate, like the editor it borrowed its posture from, detects defects correctly and then hands them to Tom rather than remediating them. On The Shift Issue 16 the skeptic returned `WEAKNESSES_FOUND` on both the brief and the LinkedIn post; neither was remediated before Tom saw the draft. ADR-043 (Bounded editorial remediation loop for editor and skeptic gates) adds a one-round remediation loop at SKILL.md step 15.37, and applies the same one-round rule inline at step 15.55 for the LinkedIn post. Two clauses of this ADR's Decision Outcome are lifted.

**Clause 1: "No new multi-round loop machinery is added."** There is now loop machinery, and the skeptic is inside it. It is bounded at one remediation round, which is the tightest bound that fixes the routing defect, and the ADR-025 `PASS_WITH_AUTHOR_OVERRIDES` override-list is still NOT reintroduced. ADR-043 considered an author-override stop arm and rejected it explicitly, on this ADR's own reasoning plus a second ground: "the drafter" is the agent that wrote the passage, so letting it self-certify an unremediated finding as an acceptable editorial choice is the confirmation-bias failure this whole gate stack exists to break. The only exit for an unremediated finding is a recorded residual advisory in the `.reviews.md` sibling, surfaced in the Tom-summary. The non-blocking save-but-revise posture (ADR-015) is preserved at the loop's terminal state: after one round, a surviving finding lands in front of Tom exactly as it does today.

**Clause 2: "any revision re-enters the full gate set via the existing SKILL.md section 15.6 dirty-body re-gate discipline."** Section 15.6 still governs, but its firing point relative to the loop is now pinned. The loop's remediation edits do not each trigger a full re-gate; the full pass runs once, against the final post-remediation body, at loop exit. Any edit that the loop-exit pass itself forces re-marks the body dirty and re-enters 15.6 exactly as before. The remediation counter is per body pass and does not reset, so a loop-exit-forced edit gets one more editor and skeptic look and any remaining findings go straight to residual advisory. This is what keeps P099 closed: without the non-reset rule the loop would either ping-pong or silently skip these two gates on the re-edited body, and the silent skip is the regression.

**A remediation contract specific to this gate.** The skeptic's findings are truth calibration, not presentation shape, so ADR-043 makes their remediation asymmetric: it may only REDUCE a claim to what the cited source supports, narrowing scope, downgrading certainty, or correcting direction. It may never add evidence, never introduce a source that was not already cited and verified, and never strengthen a claim to meet the assertion. A finding that cannot be remediated without new sourcing is stop-and-surface, recorded as a residual advisory without consuming the round. Two section 15.6 rows have claim-scoped triggers that this remediation fires by construction and that a "body changed" test would miss: cross-edition consistency (11.4, ADR-038), because thesis-truth remediation changes thesis-bearing lines, and URL verification (11.5, ADR-024), because reducing a claim to what its source supports changes URL-anchored claims by definition.

**Confirmation criterion 2 closed in the same commit.** That criterion required the SKILL.md phase table to include the skeptic block. On disk it did not: the phase-table rows ended their gate enumeration at 15.25 and named none of 11.4, 15.35, 15.4 or 15.55, and the "critic gates run independently in prep and finalise" line carried the same gap. ADR-043's SKILL.md sweep adds all of them, including the new 15.37.

**Not a supersession.** The agent, its name, its fresh-context rule, its target-agnostic scope across brief body and LinkedIn post, its pinned `SKEPTIC_REVIEW` output block, its mechanical verdict vocabulary, its axis set, its skip-on-critic-REJECTED rule, and its declared boundary partitions are all preserved.

**Reviews:** architect PASS (2026-08-05); JTBD PASS (2026-08-05, confirming the reduce-only remediation rule as a faithful encoding of JTBD-205 that protects JTBD-203).


## Amendment 2026-08-07 (P122): seam declared against the editor's assembly axes

> **Ratified by Tom on 2026-08-07**, as written. This amendment's substance is human-confirmed; the frontmatter `oversight-date` records the original confirmation of the decision it amends.

The only change is the `vs editor's assembly axes` bullet in the Boundary partitions list above, declaring the evidential-versus-navigational seam against the editor's `signpost-promises-match-contents` and `close-collects-the-so-what`. `amended-by` is deliberately not changed: this amendment is landed by no ADR, the field is uniformly slug-typed, and ADR-020's own 2026-08-07 (P122) amendment set the precedent by adding nothing.

Recorded so ADR-020's 2026-08-07 amendment, which names the ratification of this amendment as a joint precondition to implementation, points at something locatable.

## Consequences

### Good

- Closes the recurring gap the two prior fix paths (rubric expansion,
  receptive editorial-sim) did not: an adversarial pass owns thesis-truth,
  promise/payoff completeness, causation honesty, and human-angle aliveness.
- Extends adversarial coverage to the LinkedIn post, closing the ADR-020
  teaser scope gap where two of the Issue-13 misses lived.
- Reuses the established fresh-context / save-but-revise / ADR-035 shapes; no
  new verdict vocabulary, no new loop machinery, low integration surface.

### Neutral

- Adds a sixth gate and up to two invocations per issue. Inside the ADR-020
  budget, but it does move the pipeline closer to the ceiling; the reassessment
  criteria track it.
- Intentional causation overlap with content-risk trades some redundancy for
  defence-in-depth.

### Bad

- Gate fatigue risk: a sixth gate is one more surface that can return
  WEAKNESSES_FOUND and prompt a revision round. Mitigated by non-blocking
  semantics (Tom decides) and by the skip-on-critic-REJECTED rule.
- If the skeptic and editor findings routinely overlap, the boundary has
  collapsed and one gate is redundant. This is a named reassessment trigger,
  not a silent risk.

## Confirmation

- A new agent file `.claude/agents/wr-newsletter-skeptic.md` exists, declares
  tools Read/Glob/Grep and model inherit, and emits a `SKEPTIC_REVIEW` block
  with a mechanical `SKEPTIC_VERDICT: PASS | WEAKNESSES_FOUND` in the ADR-035
  strengths + weaknesses shape (no numbered scored table).
- `.claude/skills/wr-newsletter/SKILL.md` invokes the skeptic at a new step
  15.35 (after editor 15.25, before cog-a11y 15.4), with a skip-on-critic-
  REJECTED rule, a phase variant for finalise, and a second invocation on the
  LinkedIn post at step 15.5; the phase table, step 16 save-blocks, and step 17
  Tom-summary are updated to include the skeptic block.
- The saved `<publication-date>.reviews.md` carries a skeptic review section.
- `docs/decisions/README.md` compendium lists this ADR.

## Pros and Cons of the Options

### Option 1: Separate adversarial skeptic subagent gate

- Good: owns the missing adversarial stance cleanly; ADR-035 coverage-
  partitioned; reuses established patterns; extends to the LinkedIn post.
- Good: distinct verdict surface makes boundary collapse detectable at retro.
- Bad: a sixth gate and up to two more invocations per issue; moves toward the
  ADR-020 budget ceiling.

### Option 2: Absorb the skeptic into the editor

- Good: no new gate, no new invocation surface.
- Bad: folds an adversarial "break it" stance into a gate whose documented job
  is to simulate a receptive reader, blurring the exact boundary ADR-035
  forbids; ADR-038 already set the precedent that a new adversarial/consistency
  axis gets its own ADR and agent.

### Option 3: Tighten the existing critic and editor rubrics again

- Good: cheapest; no new agent.
- Bad: this is exactly what P008 and P017 did, and it did not hold; more checks
  do not supply an adversarial stance. Repeats a failed path.

## Reassessment Criteria

- Retro-validate the skeptic against Issue 13: would it have caught the four
  external-review findings (thesis "half were theatre", the LinkedIn
  promise/payoff gap, the exam-laptop causation overstatement, the flat human
  angle)? If not, the attack prompt needs tightening before the gate is trusted.
- Boundary collapse: if the skeptic and the editor (or the skeptic and
  content-risk) routinely flag the same passages with the same framing across
  editions, revisit whether one gate is redundant (ADR-020 reassessment
  criterion 2 pattern).
- Invocation budget: if total per-issue subagent invocations approach the
  ADR-020 ceiling, revisit whether gates should be consolidated rather than
  added.
- If external editorial review stops finding substance issues that the skeptic
  missed for several consecutive editions, the gate has closed the gap and the
  external review can move from mandatory to spot-check.
