---
status: proposed
human-oversight: confirmed
oversight-date: 2026-08-09
oversight-note: ratified by Tom in session 2026-08-09, read file by file
job-id: decide-from-the-phone-in-my-hand
persona: internal-maintainer
date-created: 2026-08-08
priority: must-have
type: functional-emotional
screens:
  - /wr-architect:review-decisions
  - /wr-jtbd:confirm-jobs-and-personas
  - The AFK iteration summary and its outstanding questions
  - Any in-session ratification ask
---

# JTBD-401: Decide from the phone in my hand

## Job Statement

When the loop needs a decision only I can make, I want the thing being decided put in front of me in the window I actually have, so I can answer it properly in the time I have rather than guessing or deferring.

## Context

Tom's interface is a phone: one narrow column, no file tree, no repository, no memory of the session that produced the ask. The assistant composes for a reader sitting at a desktop with the repo open. The two are not compatible, and the mismatch bites at the one place a human is genuinely on this project's critical path.

That placement is the whole reason this job is must-have. The project's stance, codified via P101, is that humans ratify architecture and product-direction decisions while automated gates and evals carry code quality at AI pace. Everything else is deliberately routed away from him. What is left is ratification, and ratification is exactly what arrives unactionable.

The surrounding constraint is ordinary life. In the 2026-08-08 session he described himself as *"a human male with a wife, 3 kids and a job, and a house to run"*. An ask that needs fifteen minutes and a laptop does not get fifteen minutes and a laptop; it gets three minutes on a phone, or it waits.

## Outcomes

1. **The artefact arrives, not a description of it.** *"If you want me to ratify something you have to give me the file"* (P133). Naming an ADR he cannot open is not an ask.
2. **The decision is also stated in the message, so the ask stands alone.** Not the file or the summary: both. The file is what gets reviewed; the message is what makes the review possible when the file cannot be opened right then.
3. **Accepting or rejecting fits in a one-line reply.** The reply channel is a phone keyboard. An ask that requires composing a paragraph to answer will be deferred, and deferral is what stalls the loop.
4. **The substance comes before the identifier.** A bare `P132` or `ADR-048` assumes a reader who can resolve it. Name the thing, then the number.
5. **Prose, not wide tables.** Multi-column status tables were the most-repeated instance of the failure and are the worst offender on a narrow column.
6. **Nothing is asked that the loop was authorised to decide.** This job is about making real decisions answerable; it is not a licence to widen what gets asked. The counterweight is P061, whose corrective runs the other way: stop asking and act where policy already authorised the action.

## Anti-outcomes

These would satisfy a naive reading of "reduce the friction of asking Tom" and fail the job:

- **Not asking at all.** The quiet failure mode in P133 is worse than the loud one: a ratification given without a real read hollows out the human-oversight marker, and the whole ratify-don't-review stance rests on those markers meaning something. A loop that stops asking has not served this job, it has removed the only place the human is on the critical path.
- **Batching asks into a digest to reduce interruptions.** Attention is scarce, but a decision that arrives buried in a summary of nine other things is a decision waved through.
- **Summarising the artefact instead of sending it.** A summary he cannot check against the artefact is a request to trust the summariser, which is precisely what ratification exists to avoid.
- **Treating this as output formatting.** The reader model binds asks first. Whether it should bind ordinary status output too is an open question on P133, not something this job settles.

## Evidence

- Problem 133: three instances in a single session on 2026-08-08. Repeated wide status tables; *"I'll draft it and bring it to you rather than landing it"* with nothing attached; and an ADR described for ratification rather than delivered. Triggered by a phone screenshot from Tom.
- Tom's words in that screenshot, quoted in the ticket: *"FFS! If you want me to ratify something you have to give me the file. This is my interface. This is the window you have to work with me with. You MUST take that into consideration... Think about what I know and what I don't or may have forgotten. Think about the small window you have to interact with me with... Be more empathetic!"*
- Problem 107 (open): free-text input is routed through `AskUserQuestion` rather than per-item copyable blocks. The nearest sibling, arbitrated PROCEED_NEW at capture on a distinct fix locus.
- Problem 061 (known error): the assistant gates policy-authorised actions on user permission. Its corrective is the mirror of this one and bounds outcome 6.
- `docs/briefing/what-will-surprise-you.md`: *"prefer reshaping the design over documenting a new contract when a new ADR would need a human who is not there."* The cost of an ask is already shaping design decisions inside iterations.

## Current Solutions

Attaching the artefact with `SendUserFile` and restating the decision in the message body, replacing tables with prose, and expanding every identifier on first mention. All three are the documented workaround on P133, and all three currently depend on the assistant remembering.


## Story Maps

| ID | Title | Status |
|----|-------|--------|
| STORY-MAP-002 | STORY-MAP-002: Working the backlog unattended | draft |
