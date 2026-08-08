---
status: proposed
human-oversight: unconfirmed
oversight-note: written 2026-08-08 on Tom's in-session direction; not yet read by him. Pending /wr-jtbd:confirm-jobs-and-personas.
job-id: trust-what-the-loop-did-while-i-was-away
persona: internal-maintainer
date-created: 2026-08-08
priority: must-have
type: functional
screens:
  - /wr-itil:work-problems AFK orchestrator loop
  - /wr-itil:review-problems
  - /wr-retrospective:run-retro
  - The iteration summary read after the fact
---

# JTBD-400: Trust what the loop did while I was away

## Job Statement

When I come back to a loop that ran without me, I want its verdicts and its measurements to be either right or visibly absent, so I can act on what it reports instead of re-deriving it to find out whether it can be believed.

## Context

The backlog is worked through an AFK orchestrator that dispatches subprocess iterations. Nobody reads the console while it runs. Everything the loop learned reaches Tom later, compressed, as a summary and a set of ticket edits. That makes the loop's own instruments load-bearing in a way they would not be if someone were watching: a detector that reports nothing and a detector that cannot run look identical from the summary, and a confident wrong verdict is indistinguishable from a confident right one.

Both failure shapes were observed on 2026-08-08, within hours of each other.

## Outcomes

1. **A surface that cannot run says so, rather than producing nothing.** P130's Tier-3 briefing budget pass names a repo-relative script path that does not exist in a consumer repo, so it emits a shell error and the retro proceeds with no measured input for a rotation decision it is required to make. Silence and clean are not the same reading.
2. **An advisory surface honours its stated contract.** P130's README-currency detector is documented as always exiting 0 with a clean-or-drift verdict, and delivers a failure string instead. Where the honest answer is "nothing to check here", that is what it should say.
3. **A verdict is grounded in the relationship it claims, not in a string that resembles one.** P132's evaluator resolves a bare `ADR-NNN` against local decisions when the ticket meant the upstream one, and counts a "composes with, distinct concerns" sibling as a closed driver. Both produce a confident CLOSE, with citations, on a ticket whose defect is live.
4. **When the loop overrides its own tooling, that shows up rather than being absorbed.** The Witness B override on P118 was correct and invisible; a verdict quietly discarded is a defect nobody is paying for.
5. **The cost of checking is proportionate to the value returned.** One `/wr-itil:review-problems` pass surfaced 24 close candidates and none survived verification. A surface whose output must be fully re-derived has negative value, because it also carries the authority to be believed.

## Anti-outcomes

These would satisfy a naive reading of "make the loop's output trustworthy" and fail the job:

- **Suppressing the surface instead of fixing it.** A detector deleted because it was wrong leaves the decision it fed with no input at all, which is outcome 1's failure by another route.
- **Routing every verdict back to Tom for confirmation.** That converts an automated surface into an ask, and asks are the scarce resource (see [JTBD-401](JTBD-401-decide-from-the-phone-in-my-hand.proposed.md)). The point is a verdict he does not have to check, not a verdict he is asked to check.
- **Making the loop quieter.** Fewer lines in the summary is not the measure. Fewer lines that misrepresent what happened is.

## Evidence

- Problem 130: two `/wr-retrospective:run-retro` detectors assume a `packages/` monorepo and produce nothing in a consumer repo; a third site, the `/wr-retrospective:analyze-context` Step 0 guard, is fail-open and wrong in every consumer repo, which trains its reader to skip it. Recorded in `docs/retros/2026-08-08-context-analysis.md` under Policy Breaches.
- Problem 132: two of the relevance evaluator's five evidence shapes match on syntax without checking semantics. Two independent witnesses on one day through two different shapes, both failing toward a confident CLOSE on a live ticket.
- `docs/briefing/what-will-surprise-you.md`: *"A gate can be wired, ratified and still never have run... A gate that ran and reported nothing is weaker evidence than it looks."*
- `docs/briefing/what-you-need-to-know-archive.md`: the AFK loop re-selects tickets blocked on an out-of-iter resolution, and each iteration pays the read-and-skip cost to rediscover the block.

## Current Solutions

Reading the cited evidence back against the ticket body before acting on any CLOSE verdict, and substituting a hand-run `wc -c` loop over `docs/briefing/*.md` for the budget pass that will not run. Both are documented workarounds on the tickets, and both require the operator to already suspect the surface.
