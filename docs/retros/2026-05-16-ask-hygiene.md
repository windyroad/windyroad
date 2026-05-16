# Ask Hygiene Trail (2026-05-16, AFK iter 2 of work-problems loop)

Context: P086 retro-on-exit fired inside `claude -p` subprocess for the
`/wr-itil:work-problems` AFK loop iter 2 (worked P028).
`AskUserQuestion` is forbidden by the orchestrator contract (P135 /
ADR-044 framework-resolution boundary; user is transient per P130).

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | n/a | n/a | n/a |

**Lazy count: 0**
**Direction count: 0**
**Deviation-approval count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

No `AskUserQuestion` invocations in this iter subprocess. Orchestrator
contract forbids them under AFK; all decisions resolved silently via the
framework (manage-problem SKILL.md preflight checks, transition-problem
SKILL.md Step 6 staging trap, P045 verify-before-propagating discipline,
P032 verify-before-asserting discipline, P050 smallest-change discipline).
