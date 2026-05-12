# Ask Hygiene Trail (2026-05-12)

## Session context

`/wr-itil:work-problems` AFK orchestrator session, transitioning into orchestrator-main-turn manual completion after 3/3 AFK subprocess dispatches hit stream-idle-timeout API errors. Followed by `/wr-itil:transition-problems` batch transition and `/wr-retrospective:run-retro`.

## AskUserQuestion calls

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | (n/a) | (n/a) | (n/a) |

**Lazy count: 0**
**Direction count: 0**
**Deviation-approval count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

## Notes

Zero AskUserQuestion invocations this session. All decisions either acts-on-obvious-default per ADR-044 framework-resolution boundary, or user-direction explicitly given via parent prompts ("keep going", "try again", "finish the iteration", explicit slash-command invocations).

The user-directed iter completions (iter 1 P024 transition; iter 2 P043 named_action) were authentic-correction-followups (ADR-044 category 6) but did not require AskUserQuestion since the direction text resolved the question (P135 R5 recovery path equivalent: orchestrator-main-turn completion after subprocess-failure is a documented recovery shape, not a framework-unresolved decision).

The batch `/wr-itil:transition-problems` invocation argument shape was self-corrected (I gave malformed args, re-invoked with correct shape after reading the SKILL.md Step 1 contract). No user round-trip needed.

R6 numeric gate (lazy count >=2 across 3 consecutive retros) check via cross-session trend: this retro's lazy count is 0, so the gate does not fire for this retro. Adopter trend script `packages/retrospective/scripts/check-ask-hygiene.sh` reads `docs/retros/<date>-ask-hygiene.md` files for cross-session aggregation.
