# Ask Hygiene: 2026-08-09 session retro

Interactive session covering The Shift Issue 17 prep, the `changesets/action` Node 24 bump, the RFC-006 ratification, and five problem captures.

## Calls

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | n/a | n/a | No `AskUserQuestion` was invoked in this session. |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

## Decisions that could have become asks, and why they did not

Recorded because a zero count is only meaningful alongside what was resolved without asking. Each of these was a live decision point in the session.

- **Whether to add `.github/dependabot.yml` while fixing the Node 24 deprecation.** The risk scorer named it as remediation R3 and the architect independently found the Actions surface uninstrumented. Not asked, and not done. Adding it creates a standing mechanism that opens PRs against the user's repo on an ongoing basis, which is beyond the scope the user authorised (*"so move to 24"*). Recorded as an investigation task on P141 for the user to decide. `Framework: scope discipline, deliver the requested scope and stop short of changes beyond what the ask implies.`

- **What to do when the RFC-006 lifecycle transition hard-blocked.** The user had ratified; `/wr-itil:manage-rfc RFC-006 accepted` could not run because the story gate enforces upstream ADR-089 against this repo's ratified ADR-045 deviation. Not asked. The ratification was recorded on the `human-oversight` axis per the ADR-049 precedent that oversight and lifecycle status are separable, and the unresolved fix direction was written into P142 with four candidate shapes rather than guessed or put to the user mid-session. `Framework: ADR-049 (status and oversight are separable axes); the open direction belongs in the ticket, not in a mid-session prompt.`

- **Whether to bypass the story gate to complete the transition.** Not asked and not done. Bypassing a gate to reach a desired end state is the anti-pattern the gates exist to prevent, and the block turned out to be total rather than specific to this RFC, which is itself the finding. `Framework: gates are hygiene, the fix is upstream of the gate, not around it.`

- **Whether to re-run the failed CI job.** Not asked. Verified the failure was a transient TCP connect timeout (both URLs answered 200 in under a second; one failure in twelve runs), then re-ran. Leaving master red on a known-transient failure has no upside. `Framework: ADR-013 Rule 5, policy-authorised silent proceed on a reversible, non-destructive action.`

- **Every ticket capture, briefing rotation and signal classification.** All silent per ADR-044's framework-resolution boundary and the Step 1.5 / Step 3 / Step 4b Stage 1 contracts.

## Note on the trail-file name

Named `2026-08-09-session-ask-hygiene.md` rather than `2026-08-09-ask-hygiene.md` because a file at the latter path already exists from an earlier AFK iteration on the same date, as do four `<date>-p<NNN>-ask-hygiene.md` siblings. The cross-session trend script globs `*-ask-hygiene.md`, so this file is picked up alongside them.
