# Problem 156: Briefing absence claims are never re-verified, so a stale one loads into every session

**Status**: Open
**Reported**: 2026-08-23
**Priority**: 8 (Medium). Impact: 2 x Likelihood: 4, derived at capture per Step 4a
**Origin**: internal
**Effort**: M, derived at capture per Step 4a
**JTBD**: JTBD-400
**Persona**: internal-maintainer

## Description

A briefing entry that asserts a tool, command or path does not exist is never re-verified after it is written. The signal-vs-noise pass in `/wr-retrospective:run-retro` Step 1.5 scores an entry on whether it was USED this session, never on whether it is still TRUE. So an absence claim keeps earning signal, keeps its place in the Critical Points roll-up, and keeps being injected into every session by the SessionStart hook, long after it stopped being true.

Found on 2026-08-23 during the P140 iteration. `docs/briefing/what-you-need-to-know.md` and the Critical Points roll-up in `docs/briefing/README.md` both stated that the Tier-3 budget pass "names `packages/retrospective/scripts/check-briefing-budgets.sh`, which does not exist in a repo that installs the plugin from the cache". The P140 retro ran the detector by its ADR-049 shim name and it worked, emitting `OVER what-you-need-to-know.md bytes=5358 threshold=5120`.

The interesting part is why the entry was wrong, and it is not carelessness. Verified on disk on 2026-08-23: `~/.claude/plugins/cache/windyroad/wr-retrospective/0.27.0/bin/` ships no `wr-retrospective-check-briefing-budgets`, and `0.27.4/bin/` does. The entry was written on 2026-08-08 against 0.27.0 and was **true when written**. A plugin upgrade falsified it, silently, with nothing local to notice. `wr-retrospective-check-ask-hygiene` and `wr-retrospective-check-tickets-deferred-cause` arrived in the same window.

That is what separates this from the rest of the verify-before-asserting family. P032 and P103 (ticket prose), P045 (upstream placement) and P082 (subagent verdicts) are all about a claim that was wrong at the moment it was made, and the remedy is to check before asserting. Here the claim was right at the moment it was made, and there is no trigger event to hang a re-check on: the truth changed inside an upstream dependency between sessions. The remedy has to be periodic re-verification, not a stricter authoring rule.

Two properties make the blast radius wider than the others:

- The briefing is loaded automatically at session start, so a false claim reaches every session rather than the one session that happens to read the artefact.
- An absence claim is the specific shape that causes an agent to route around a working tool, so acting on it produces a worse outcome than acting on most other kinds of stale prose. Two intervening retros (2026-08-09, and the 2026-08-23 P141 iteration) re-scored the entry as signal without ever re-running the command.

## Symptoms

- `docs/briefing/what-you-need-to-know.md` carried a false absence claim about `wr-retrospective-check-briefing-budgets` from 2026-08-08 to 2026-08-23. Corrected in the P140 iteration's retro commit.
- The same claim sat in the `docs/briefing/README.md` Critical Points roll-up, so the SessionStart hook injected it verbatim into every session in that window.
- Run-retro Step 1.5 raised the entry's signal score across two retros in that window, because it was cited each time. The pass has no truth axis at all.

## Workaround

Call every plugin-provided helper by its ADR-049 `wr-*` shim name and confirm with `command -v` before concluding it is absent, regardless of what the briefing says. Applied by hand in the P140 iteration.

## Impact Assessment

- **Who is affected**: the internal maintainer, and every agent session in this repo, because the Critical Points roll-up is injected at session start.
- **Frequency**: continuous while a stale entry is present. One instance ran for 15 days across at least three sessions.
- **Severity**: Medium. No shipped artefact is corrupted, but an absence claim is the shape most likely to make an agent route around a working tool, and the injection surface is every session.
- **Analytics**: N/A

## Root Cause Analysis

### Investigation Tasks

- [ ] Investigate root cause
- [ ] Create reproduction test
- [ ] Decide whether the re-verification belongs in run-retro Step 1.5 scoring, in a standalone detector run at session start, or in the SessionStart hook that injects the roll-up
- [ ] Work out how to detect an absence claim in prose without false-positiving on every mention of a command name, and note that the naive shape does not cover this instance: the entry's literal proposition named the repo-relative path `packages/retrospective/scripts/check-briefing-budgets.sh`, which genuinely does not exist here and never did, while what an agent took from it was that the capability was unavailable. A `test -e` on the named path would have answered "absent, correctly" and flagged nothing. So the entry was partly wrong by conflating a path with a capability from the day it was written, and only partly falsified by the upgrade. Any detector has to reach the capability, which means resolving the shim name, not the path the prose happens to quote. Surfaced by the `wr-risk-scorer:pipeline` commit-gate review of this capture.
- [ ] Confirm whether the fix is upstream-only, since Step 1.5 lives in the `wr-retrospective` plugin and this repo is a consumer

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P136, P139

## Related

Captured via `/wr-itil:capture-problem` during the P140 iteration; expand at next investigation.

The candidate fix shape, not yet decided: run-retro Step 1.5 re-runs `command -v` (or `test -e`) for any named command or path an entry asserts is absent, before re-scoring that entry, and corrects or demotes on a mismatch. That code lives in the `wr-retrospective` plugin, so the fix is likely upstream-blocked per ADR-024 and this ticket's local half is the correction already applied to the two briefing files.

Hang-off check (`wr-itil:hang-off-check`, fresh context) returned **PROCEED_NEW** against P130, P136 and P139:

- **P130** (two run-retro detectors assume a packages monorepo) is a different root cause and a different fix locus: monorepo-layout assumptions in detector invocation paths, fixed by path substitution and shipping shims. This ticket is about a scoring rule that never re-tests truth. The subagent separately established, and this was verified on disk, that **three of P130's own claims are now stale** for the same upgrade reason: `wr-retrospective-check-briefing-budgets`, `wr-retrospective-check-ask-hygiene` and `wr-retrospective-check-tickets-deferred-cause` all ship in 0.27.4 and did not in 0.27.0, which P130 line 37 enumerated. **That correction belongs on P130 and should not be folded into this ticket.** It is itself an instance of the pattern this ticket describes, on the ticket surface rather than the briefing surface.
- **P136** (Tier-3 rotation strips entries the Critical Points still point at) shares the surface but is a referential failure produced by Step 3 rotation: the bullet's link stops resolving. This is a truth-value failure produced by Step 1.5 re-scoring: the entry resolves fine and says something false.
- **P139** (ratification flips frontmatter but nothing sweeps the prose) is the closest sibling and was declined on the grounds that its fact class has a machine-readable source of truth in frontmatter and a discrete trigger event (the ratification commit) to hang a sweep on. This has neither: the fact class is the existence of a command or path, and the truth changed in an upstream release with no local event.

The subagent named P136, P139 and this ticket as a three-member cluster under an unwritten parent, "the briefing roll-up can carry a claim that no longer holds", which P139's own `## Related` already flags as a cluster candidate. Consider that parent at the next `/wr-itil:review-problems` pass.

The mechanical pre-filter returned 8 candidates, above the ADR-032 cap of 5, and was narrowed to the 3 above before dispatch. The five dropped share only an incidental `docs/briefing` or `ADR-049` mention: P134, P135, P138, P142, P150. Re-evaluate that list rather than taking the narrowing on trust.

Title-only duplicate grep surfaced tickets on adjacent surfaces, none the same defect: P136 and P150 (briefing budget and rotation mechanics), P151 (a gate that can skip a phase and nothing detects the absence), P109 (an external reviewer holding a stale copy).
