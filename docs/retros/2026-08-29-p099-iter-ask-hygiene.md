# Ask Hygiene  2026-08-29 (P099 AFK iter)

Retro surface: `/wr-itil:work-problems` iteration subprocess (P086), non-interactive.
`AskUserQuestion` is forbidden by the orchestrator's iter contract, so the expected
count is zero and a non-zero count would itself be the finding.

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | n/a | n/a | No `AskUserQuestion` calls were made this iteration. |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

## Decisions resolved without asking, and why each was framework-mediated

- **Ticket lifecycle.** P099 stayed at Known Error. The 2026-08-28 flip-back set its own
  un-park condition and half of it is still outstanding, so the framework (upstream ADR-022, the itil plugin's problem-lifecycle decision and NOT local ADR-022, which is the superseded stale-deps-refresh record, plus
  the ticket's own recorded condition) resolves the status. Flipping to Verifying against
  a day-old maintainer call would have been the deviation needing an ask; leaving it
  alone needed none.
- **Substance-confirm-before-build (upstream ADR-074, the `@windyroad` plugin ID; local decisions stop at 057).** RFC-005 carries
  `human-oversight: unconfirmed`, which is the trigger shape. The predicate
  `wr-architect-is-decision-unconfirmed` returned confirmed for all five ADRs the fix
  builds on, so no genuine unconfirmed decision was about to be built on and the
  cat-1 ask correctly did not fire. Recorded on the ticket so the next reader does not
  re-derive it.
- **Design choice between three fix shapes.** Resolved by the architect and JTBD gates on
  the merits, not by preference. A `taste` ask would have been sub-contracting a decision
  the reviewers had already settled.
