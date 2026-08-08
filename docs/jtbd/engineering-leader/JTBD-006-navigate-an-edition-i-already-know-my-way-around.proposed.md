---
status: proposed
human-oversight: unconfirmed
job-id: navigate-an-edition-i-already-know-my-way-around
persona: engineering-leader
date-created: 2026-08-09
priority: important
type: functional
screens:
  - The Shift newsletter (LinkedIn)
---

# JTBD-006: Navigate an edition I already know my way around

> **Not ratified.** Tom directed that this job be recorded, at a question gate on
> 2026-08-08. He has not read it. `human-oversight: unconfirmed` until drained via
> `/wr-jtbd:confirm-jobs-and-personas`. Read the Notes before citing it: this job
> reverses a decision recorded on 2026-08-07, and the reversal is not discharged by
> writing it down.

## Job Statement

When a new edition of The Shift arrives in a week where I have minutes rather than
an hour, I want it laid out the way the last one was, so I can go straight to the
part I came for, tell how much of it I still have to read, and know it is the thing
I subscribed to without having to work that out first.

## Context

The Shift has settled into a recognisable shape: an opener signed from Tom, numbered
items that each answer what happened, why it matters to your team, and the human
angle, a forward-look section, and a demoted "Also worth noting" section before the
close. A returning reader who has seen two editions has learned that layout whether
or not they ever thought about it.

This job is about what that learning buys them. It is not a claim that sameness is
pleasant. It is a claim that a reader who already knows where things are spends
their few minutes reading rather than orienting, and that a reader who does not has
to re-derive the layout every week from a piece they are skimming.

## Outcomes

1. **I can reach the part I came for without reading the parts I did not.** The
   reader who opened this edition for the regulatory item should be able to land on
   it by recognising the section, not by reading forward until they find it. This is
   falsifiable: if the sections an edition offers cannot be told apart from their
   headings, or if the same kind of content appears under a different heading than
   it did last week, the reader has to read to navigate and the job is failing.
2. **I can tell how much is left, and whether the rest is optional.** The demoted
   section exists so a reader can stop at the end of the promoted items and know
   they have had the substance. That only works if the boundary is in the same place
   each week. A reader who cannot tell whether they are two-thirds through the
   essential part or two-thirds through the whole thing cannot budget the read.
3. **I recognise the edition as the one I subscribed to, from the first screen.**
   In a feed, the opener and the title format are what identify it. A reader who has
   to check the sender to work out what they are looking at has already spent the
   attention the piece needed.
4. **A week that breaks the pattern tells me it is doing so.** The shape is a
   default, not a promise. When an edition legitimately drops a recurring section,
   because nothing happened worth putting there, the reader should be able to tell
   that it was left out rather than lost. An unexplained absence reads as an
   omission; a stated one reads as an editorial call.

## Anti-outcomes

These would satisfy a naive reading of "keep the shape consistent" and fail the job:

- **Cutting something load-bearing to stay inside a length ceiling.** This is the
  live case, not a hypothetical. On Issue 16 the clause that answered the edition's
  own checkable question, on the GCC policy, was cut to buy ceiling space, and it
  came back two review rounds later as a reviewer finding. The reader who came for
  that answer did not get it, and the edition was the right length. That is this job
  failing through its own enforcement mechanism, not this job satisfied. The tension
  is real and it is not resolved here: predictability and completeness compete for
  the same character budget, ceilings stay, and this job does not adjudicate any
  individual cut. What it does say is that "we came in under the limit" is never on
  its own evidence that the job was served. What got cut is the question.
- **Refilling an empty recurring section so the shape holds.** A section with
  nothing in it is a week where nothing happened worth putting there. Filling it is
  filler, and filler runs directly against JTBD-005 outcome 1, a read short enough
  to finish in a few minutes. Outcome 4 above wants the absence stated, not covered.
- **Reading this job as a licence to promote any shape rule to an enforced one.**
  This job supplies grounding. It does not change any existing check's remediation
  authority. Problem 121 placed several shape probes in an advisory class because
  they had no reader anchor, and it separately recorded that the licence for that
  class "comes from having no remediation authority, not from the rationale being
  strong enough". Those are two axes. Moving one does not move the other. Promoting
  an advisory probe to a remediating one is a separate decision for Tom under
  ADR-043's classification rule, and the DRIFT probe additionally carries a known
  reliability limitation, recorded at P121 line 129, that grounding does not touch.
- **Treating a longer or shorter edition as a defect in itself.** A short week is a
  good week. There is no length floor and this job does not create one.

## Persona Constraints

Inherited from the engineering-leader persona and JTBD-005, and load-bearing here:
little time to keep up personally, reading on LinkedIn in a feed rather than in a
dedicated inbox, and making the call each week about whether this edition is worth
the next four minutes.

## Evidence

- Issue 16's GCC clause, cut for ceiling space and re-raised by an external reviewer
  two rounds later. Recorded at `docs/problems/known-error/121-...md` line 21. This
  is the anti-outcome's worked case, and the same evidence P121 used to keep the
  length ceiling as a remediating check.
- `src/newsletters/published/leader/2026-08-03/2026-08-03.md`: the settled shape
  this job describes, in the form a returning reader has actually learned.
- Tom's answer at the 2026-08-08 question gate, which is the direction this file
  records: *"It's a reader benefit, consistency helps readers find their way
  around."*

## Notes

**This reverses a decision, and the reversal is the part to read.** On 2026-08-07,
recorded at `docs/problems/known-error/121-...md` lines 169 to 182, adding a
stable-weekly-shape outcome to the corpus was **explicitly declined**, on the ground
that it "would manufacture grounding for a decision already made, and the corpus
would then appear to support the probes because the support was written into it".
That objection is about causal order, not about which file the text lands in, so
filing this as a separate job rather than as new outcomes on JTBD-005 does not
answer it by itself. Saying so plainly is the minimum this file owes a future reader
who meets that decline and this job side by side.

**What changed, and what did not.** P121 line 90 recorded a second, separate
question and said it was the right one to put to Tom on the merits: is a stable
weekly shape a reader benefit or an editorial cage? That question was put, and he
answered it. This file records the answer to that question. It does not record, and
must not be read as recording, a finding that the probes P121 declined to ground are
now grounded. The outcomes above are written from what a reader does with a layout
they have learned, and no outcome here was reverse-engineered from a check that
wanted grounding. The honest residual risk is that the question was asked in the
same session as the checks that needed the answer, and no amount of careful drafting
removes that. Ratification is what discharges it. Until then this job is direction
recorded, not direction confirmed.

**Scope: engineering-leader only, deliberately.** Tokens Spent has no published
corpus to check a shape claim against, and the developer persona records no
constraint about structural predictability. A developer-side sibling would be
grounding written ahead of evidence, which is the failure this note exists to guard.
Revisit when Tokens Spent has editions to compare.

Related: [JTBD-005](JTBD-005-stay-ahead-of-the-shift.proposed.md), whose outcome 1
(a read short enough to finish in a few minutes) is what several outcomes here
serve, and whose outcome 4 (confidence nothing actionable was missed) is what
outcome 4 here protects when a section is dropped.
