# Ask Hygiene, 2026-08-29 (P165 AFK iteration)

Session: AFK `/wr-itil:work-problems` iteration on P165 (the stale-verdict check stands down on the very absence it exists to catch).

No `AskUserQuestion` calls were made. The iteration ran under the AFK contract, which forbids mid-loop asks and routes anything user-answerable to `ITERATION_SUMMARY.outstanding_questions` for batched presentation at loop end.

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | (none) | (none) | No `AskUserQuestion` invoked this session. |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

## Decisions that could have become asks, and did not

Recorded so the zero is auditable rather than merely asserted.

- **Whether to fix the sanctioned-skip defect at all, or capture it as a sibling ticket.** The architect had already been consulted on the change and returned five findings on its shape, none of which questioned that the defect belonged in this ticket. It is the same check, the same ambiguity class, and the same session. Scoped in rather than asked. Would have classified as `lazy` had it been asked, since the framework resolves it: P165's own Fix Strategy names the fail-not-skip principle and this is the second half of it.
- **Whether granting `Bash` or deleting the printf instruction is the right upstream fix for the two disarmed gates.** Left as an investigation task on the new ticket rather than queued. The jtbd agent already ships the answer as precedent, and a fork the loop has not reasoned to a recommendation is not worth the maintainer's attention (the standing lesson from the P134 iteration).
- **Where the upstream fix lands.** Not asked. ADR-048 already decided that an upstream pull request from the working clone is the default; re-asking would be the lazy class. The authorisation to work that clone is separately queued as an outstanding question, which is a different question from where the fix goes.
- **Whether the ticket should transition Open to Verification Pending directly.** The architect answered it from the upstream lifecycle contract, which states that an open ticket cannot reach Verification Pending without passing through Known Error. Framework-resolved, so no ask.
- **Briefing entry scoring and rotation.** Silent per the framework-resolution boundary; the scores and their citations are in the retro summary for audit.
