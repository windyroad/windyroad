# Ask Hygiene, 2026-08-29 (P134 AFK iteration)

Session: AFK `/wr-itil:work-problems` iteration on P134 (agents infer staged state from the session-start git status snapshot, which is lossy on its first line).

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

- **Whether to draw the first story map.** `wr-itil-check-fix-rfc-trace` exited 3 on the no-story-maps branch. That branch is genuinely direction-setting, since drawing the first map decides what the journey is, so it is queued to `outstanding_questions` rather than asked mid-loop. Would have classified as `direction`.
- **Whether the scorer should refuse to score a staging precondition it was not handed data for.** Investigation task 4 on the ticket. Deliberately NOT queued: it is an unworked two-way fork with no recommendation behind it, and the JTBD reviewer's round-2 finding was that putting a bare fork to the maintainer spends attention on the loop's own unfinished analysis. Left as backlog on the ticket, with a note that whoever next works it should reason it to a recommendation first.
- **Whether an upstream fix goes to the working clone.** Not asked. ADR-048 already decided it; re-asking would be the lazy class.
- **Briefing rotation and entry removal.** Silent per the framework-resolution boundary. Two entries rotated to the archive; the choice is recorded in the retro summary for audit.
