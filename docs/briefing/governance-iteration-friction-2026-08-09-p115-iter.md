# Governance-iteration friction (2026-08-09 P115 AFK iter)

One AFK iteration: posted the queued P109 upstream comment, added a third witness to P132, and
investigated P115 to root cause without being able to apply the fix.

## The unratified maintainer persona is a hard stop on executable internal-tooling work, not a caveat

This is the finding worth carrying. `docs/jtbd/internal-maintainer/` and JTBD-400/401/402 are
`human-oversight: unconfirmed`. Every internal-tooling ticket in this repo anchors to them, because
there is nothing else to anchor to. The JTBD edit gate withholds its marker on ISSUES FOUND, and
"reasons from an unratified persona" is an ISSUES FOUND the agent cannot clear: ratifying is Tom's,
and an AFK iteration cannot ask.

So the whole class is unreachable AFK until `/wr-jtbd:confirm-jobs-and-personas` runs once. It is
not a per-ticket obstacle to route around; it is one ratification standing in front of a category of
work. Budget an interactive session for it rather than discovering it three reviewer rounds deep, as
this iteration did.

Note the reviewer was right to hold, and said so precisely: prose against a provisional anchor is
fine, a blocking gate is not. Ticket bodies, ADR text and investigation write-ups all landed
normally in the same iteration. It is specifically executable enforcement that is gated.

## Three JTBD rounds beat two architect rounds, and the third round is where it withdrew a finding

The architect took two rounds (a rejected enforcement point, then six concrete findings). The JTBD
reviewer took three, and round three is the one that mattered: it withdrew its own objection to the
halting form once the halt's remedy became mechanical, and then argued the case for the halt better
than the proposal had. It also supplied the evidence that dissolved its own objection, three commit
SHAs showing hand-authored changesets landing as their own commits.

The practical lesson is to argue back with the reviewer's own evidence rather than either caving or
overriding. Both moves were available; neither would have produced the third round's result.

## A gate that is installed, ratified and structurally unable to fire

P115's root cause turned out to be one of these. The upstream `itil-changeset-discipline.sh` hook is
installed here and running. Its detection helper classifies staged paths with `packages/*)` and a
final `*) # Non-packages/ path: always allow`. This repo has no `packages/` tree, so every site path
falls to always-allow and the hook cannot deny. Note the verified claim is the structural one; that it has in fact never fired here is an absence claim no read of disk settles.

Generalise it before assuming a discipline is missing: in a consumer repo, check whether the gate
you are about to build already exists upstream and is merely scoped past this layout. It changes the
fix from "write a gate" to "the gate is blind here", which is a different and usually smaller job.
Two of run-retro's own detectors have the same shape in this repo.

## The relevance evaluator's second failure mode

Running `wr-itil-evaluate-relevance` against P115 returned CLOSE-CANDIDATE-WITH-CAVEAT on a live
ticket. The shape-5 half is the known "Composes with" failure. The shape-2 half is new: ADR-041 is
local, correctly resolved and genuinely confirmed, and the verdict is still wrong, because P115
cites it as the change that sat unreleased rather than as its fix. Namespace qualification would not
have caught it.

The tell is worth memorising: the ADR's oversight date and the ticket's report date were the same
day, because one session produced both. When those two dates match, the ADR is very likely the
ticket's exhibit rather than its remedy. Recorded as P132's third witness and on agent-plugins#414.

## Costs paid twice this iteration

- The external-comms marker key hashes the FULL commit message. A draft reviewed without the
  `Co-Authored-By` trailer produces a different key from the commit that carries it, so the commit
  re-blocks after a genuine PASS. Two wasted reviewer dispatches. Already ticketed as P085.
- The first reviewer dispatch for the P109 post was correct and thorough and produced no marker,
  because the prompt lacked the literal `SURFACE:` line and `<draft>` wrapper. Good review, zero
  credit. Compose the structured form first, every time.
- The README-refresh gate fired on a P132 ticket edit that changed no README column. Already
  ticketed as P086. The honest discharge is a real "Last reviewed" narrative refresh rather than a
  no-op touch, and it turned out to be worth writing anyway.
