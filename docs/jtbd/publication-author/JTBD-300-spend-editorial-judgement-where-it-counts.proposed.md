---
status: proposed
human-oversight: confirmed
oversight-date: 2026-08-07
job-id: spend-editorial-judgement-where-it-counts
persona: publication-author
date-created: 2026-08-07
priority: must-have
type: functional
screens:
  - The Shift newsletter (LinkedIn)
  - Tokens Spent newsletter (LinkedIn)
  - /wr-newsletter pipeline (prep and finalise)
---

# JTBD-300: Spend editorial judgement where it counts

## Job Statement

When I review an edition the pipeline has drafted, I want the machine-checkable defects already fixed and the genuine editorial calls put plainly in front of me, so I can spend my judgement on what only I can decide rather than on re-finding what a gate already knew.

## Context

The pipeline runs a battery of gates. Before 2026-08-05 several of them detected defects correctly and then routed the findings to Tom rather than acting on them, so a gate's output arrived as his review feedback. On The Shift Issue 16 the editor gate named three defects in writing and all three were independently re-derived by an external reviewer afterwards. That is the shape of the waste this job names: not that review happens, but that review re-does work already done.

## Outcomes

1. **A defect a gate can name and fix is fixed before I read the draft.** If a gate identified it against a stated standard and the fix is mechanical, finding it in my inbox is a routing failure.
2. **A judgement call reaches me as a judgement call.** Deviations from precedent, trade-offs, and anything ungrounded are surfaced for a decision, not silently applied. Being asked is the correct outcome here, not a cost to be optimised away.
3. **If the pipeline rewrites my words, it shows me the sentence before and after.** Not a summary of what it fixed. A one-line note like "addressed the fold-compression finding" tells me nothing I can act on, because I still do not know which sentence changed, and I will read the draft assuming every sentence in it is mine. A before-and-after pair lets me say "put mine back". Without it, reading the draft is not a check at all.
4. **The same question is not asked twice.** A call I have already made carries forward across phases and rounds rather than re-firing.
5. **The external reviewer finds new things, not the same things.** When the reviewer raises a class an internal gate already named, the round trip was avoidable and the pipeline, not the reviewer, is where the fix belongs.

## Anti-outcomes

These would satisfy a naive reading of "less feedback from Tom" and fail the job:

- **Removing me from the loop.** The goal is fewer corrections, not fewer decisions. A pipeline that publishes without me satisfies nothing here.
- **Suppressing findings to shorten the summary.** Fewer lines in front of me is not the measure. Fewer lines that should never have reached me is.
- **Editing my prose on a weak warrant to save me a decision.** Outcome 2 outranks outcome 1 whenever grounding is uncertain: surface it and let me choose.

## Evidence

- Problem 120: the editor and skeptic gates named findings and handed them to Tom; ADR-043 closed the routing defect with a bounded remediation loop.
- Problem 121 and Problem 122: whole-edition shape and assembly defects reached publication-ready state and were caught by human reading.
- Six external review rounds on Issue 16, spent hand-remediating classes internal gates had already named.
- Tom's own framing at the 2026-08-04 retrospective, which is what this job records: *"what would we need to change to require less feedback from me and the external reviewer... the objective is not to eliminate my voice, the objective is to recognise each piece of feedback as a nudge you should be doing yourself, or better yet, a nudge that isn't needed because you landed more accurately in the first place."*

## Notes

This is the job P122's forward rule was waiting on. That rule blocks any gate axis whose only justification is "this reduces Tom's review rounds" until an author persona is ratified. With this job ratified, such an axis becomes groundable, but the grounding runs through the outcomes above rather than through review-count alone: outcome 1 grounds automatic remediation of gate-nameable defects, and outcome 3 grounds the requirement that applied edits be shown as before-and-after pairs. Neither grounds an edit on a weak warrant, which is what anti-outcome 3 exists to prevent.


## Story Maps

| ID | Title | Status |
|----|-------|--------|
| STORY-MAP-001 | STORY-MAP-001: Producing the weekly edition | draft |
