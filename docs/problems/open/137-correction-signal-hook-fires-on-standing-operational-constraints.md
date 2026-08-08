# Problem 137: The correction-signal hook fires on standing operational constraints, not just on genuine user corrections

**Status**: Open
**Reported**: 2026-08-09
**Priority**: 8 (Medium) -- Impact: Minor (2) x Likelihood: Likely (4). Impact 2 because no artefact is wrong and nothing ships wrong; the cost is a wasted mandatory-instruction slot plus a desensitisation risk. Likelihood 4 because the match comes from the standing constraint block that appears in every AFK work-problems iteration prompt, so it fires on essentially every iteration.
**Origin**: internal
**Effort**: S -- a detector-precision refinement to one regex plus a context test; the fix site is a single upstream file.
**WSJF**: 8.0 = (8 x 1.0) / 1

## Description

The `UserPromptSubmit` correction-signal hook matches `\bDO NOT\b` and injects a MANDATORY
instruction directing the agent to offer a problem ticket for "the underlying behavioural
pattern" before addressing the operational request.

Observed on 2026-08-09 during the P109 AFK iteration. The match came from the orchestrator's
own standing constraint block:

- "Do NOT push, do NOT run push:watch or release:watch."
- "Do NOT use ScheduleWakeup. NEVER call AskUserQuestion."
- "Do NOT touch /Users/tomhoward/Projects/agent-plugins."

These are routine operational constraints on the iteration, not Tom correcting a class of
assistant behaviour. There is no behavioural pattern to capture, so the injected instruction
is unactionable. Because that constraint block appears in every AFK work-problems iteration
prompt, the hook fires on essentially every iteration.

The second-order cost is the one that matters. The hook's value depends on the agent treating
its firing as meaningful signal. A detector that fires unactionably on most invocations trains
the opposite: the agent learns to note the false positive and move on, which is exactly the
response a genuine correction would then also receive.

## Symptoms

- The correction-capture instruction appears in AFK iteration prompts whose only `DO NOT`
  strings are operational constraints in a bulleted list.
- The agent's honest response is "false positive, no ticket", recorded rather than acted on.
- No corresponding correction exists anywhere in the prompt.

## Workaround

Recognise the shape and say so explicitly rather than capturing a ticket for a non-existent
behavioural pattern. Record the false positive in the iteration's ask-hygiene trail so the
detector's precision has a data point (done for this occurrence at
`docs/retros/2026-08-09-p109-ask-hygiene.md`).

## Impact Assessment

- **Who is affected**: any AFK orchestration loop whose iteration prompt carries a constraints
  block; in practice every `/wr-itil:work-problems` iteration.
- **Frequency**: essentially every AFK iteration.
- **Severity**: Minor. No artefact is corrupted. The harm is a wasted instruction slot and the
  slow desensitisation of the agent to a signal that is supposed to be rare and meaningful.
- **Analytics**: countable from the ask-hygiene trail files under `docs/retros/` once more
  occurrences accumulate; a single data point exists today.

## Root Cause Analysis

The detector matches a bare lexical pattern with no test for whether the string is a user
correcting the assistant. `DO NOT` in an instruction to the agent and `DO NOT` in a correction
of the agent are lexically identical and semantically opposite.

### Investigation Tasks

- [ ] Read `packages/itil/hooks/lib/detectors.sh` (`CORRECTION_SIGNAL_PATTERNS`) in the
      upstream repo and confirm the pattern set plus any context conditions already present.
      This ticket's description is a hypothesis about that file, taken from the hook's own
      emitted message, and has not been verified against the source.
- [ ] Decide the discriminator. Two candidates: require a second-order signal (a first-person
      subject, past-tense reference to something the agent did), or exempt a match that sits
      inside a bulleted or numbered constraint list.
- [ ] Check whether the same false-positive shape affects the other patterns in the set, or
      only the imperative ones.
- [ ] Create a reproduction test: an iteration prompt carrying a standing constraint block
      must not fire; a genuine correction must still fire.

## Fix Strategy

**Kind**: improve. **Shape**: hook.

**Target file**: `packages/itil/hooks/lib/detectors.sh` (`CORRECTION_SIGNAL_PATTERNS`) in the
upstream `windyroad/agent-plugins` repo, per the path the hook's own message cites. Not a file
in this repo, so this is an upstream fix site under ADR-024 -- report upstream rather than
patching locally. Since the fix shape is clear (a discriminator on an existing regex), ADR-048
makes a pull request the preferred vehicle over an issue.

**Observed flaw**: a bare lexical match on imperative `DO NOT` cannot distinguish an
instruction to the agent from a correction of the agent.

**Edit summary**: add a discriminator so the pattern fires only on correction-shaped context,
and pin it with a test carrying both a standing-constraint prompt and a genuine correction.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P050 (assistant scope-creeps on corrections) and the retired-`--type=`
  capture surface -- same family of correction-handling machinery. Distinct from both: this is
  detector precision at the input edge, not what the agent does once a correction is real.

## Related

Captured during the P109 AFK iteration retrospective (2026-08-09) via
`/wr-itil:capture-problem`; the occurrence is recorded in
`docs/retros/2026-08-09-p109-ask-hygiene.md`.

Provisional JTBD anchoring, stated as provisional because the artefacts are not ratified: this
serves the `internal-maintainer` persona and JTBD-400 (Trust What the Loop Did While I Was
Away), both `human-oversight: unconfirmed`. Anchoring is in prose here rather than in header
lines, per the local convention for internal-tooling tickets. Ratification runs through
`/wr-jtbd:confirm-jobs-and-personas`.

Duplicate check found no matching ticket. The nearest titles by keyword are P050 (scope-creep
on corrections) and P090 (newsletter CTA persistently includes a services pitch despite
correction); both concern behaviour after a real correction, not detector precision, so neither
absorbs this scope.
