# Problem 019: Claude does not proactively act on ambient dirty state during retrospective and wrap-up

**Status**: Known Error
**Reported**: 2026-04-26
**Priority**: 12 (Significant). Impact: Moderate (3) x Likelihood: Likely (4)
**Effort**: S
**WSJF**: 24.0 (Known Error: 12 x 2.0 / 1)

## Description

When wrapping a session, Claude defers actions like committing or reverting ambient dirty state (e.g. `.claude/settings.json` pre-existing reorders) to the user via AskUserQuestion even when the action is obvious from the file's nature. The user explicitly flagged this as anti-pattern in the AFK retro response: "either commit it or revert it. You shouldn't even be asking me FFS."

The pattern violates the act-on-obvious-decisions rule: when ambient state is clearly user-authored or clearly stray, the assistant should ACT, not prose-ask or AskUserQuestion-ask.

## Symptoms

- AskUserQuestion fired for `.claude/settings.json` reorder during the post-retro setup turn
- User flagged as inappropriate proactivity gap in AFK retrospective response
- Pattern is a class-of-behaviour, not a one-off slip; likely to recur in future wrap-ups

## Workaround

When ambient dirty state is found during wrap-up, ACT:
- Commit if user-authored intent is clear (e.g. settings reorder matches user's prior preferences)
- Revert if clearly stray (e.g. accidental flag, broken syntax)
- Reserve AskUserQuestion for genuinely ambiguous cases (multiple valid paths, none clearly better)

## Impact Assessment

- **Who is affected**: User during AFK retros and session wrap-ups
- **Frequency**: Every wrap-up that finds ambient dirty state
- **Severity**: Moderate. Friction signal, requires manual policing of AI output (P078 family)
- **Analytics**: User correction signals in retro responses; FFS detector hits

## Root Cause Analysis

### Root cause

Memory layer gap. The act-on-obvious-decisions UserPromptSubmit hook references `~/.claude/projects/-Users-tomhoward-Projects-windyroad/memory/feedback_act_on_obvious_decisions.md` and `feedback_capture_on_correction.md` but neither file existed in the memory tree on 2026-04-26 (verified via `ls`). Without a durable rule encoded in the memory layer, the assistant defaults to AskUserQuestion when it finds dirty state at wrap-up, even when the file's nature plus the user's prior preferences make the answer obvious. The pattern is a class-of-behaviour, not a one-off slip: same family as P078 (assistant should offer ticket capture proactively on correction signals). Both surface the same underlying gap: ADR-013 Rule 1's "obvious default => act" clause has not been promoted to memory for the wrap-up surface.

### Reproduction

The originating trace is the post-retro setup turn (2026-04-26 AFK 11-iteration session) that fired AskUserQuestion on a `.claude/settings.json` field reorder and stalled the loop on a decision Tom had already implicitly authorised by ordering the AFK run. Tom's exact response in the retrospective: "either commit it or revert it. You shouldn't even be asking me FFS." A transcript fixture is not added to the test suite because the assistant's behaviour is governed by memory + UserPromptSubmit hooks rather than executable code; the corrective is a memory note rather than a unit test. The UserPromptSubmit correction-signal detector (`packages/itil/hooks/lib/detectors.sh` CORRECTION_SIGNAL_PATTERNS) already catches the FFS pattern and would fire on the originating exchange.

### Fix path

Write a feedback memory note at `~/.claude/projects/-Users-tomhoward-Projects-windyroad/memory/feedback_act_on_ambient_dirty_state_at_wrap_up.md` encoding the corrective rule with **Why** + **How to apply** + Trigger surface + Decision tree + Anti-patterns sections. Add the index entry in MEMORY.md. Memory is loaded on every session so the rule applies to all subsequent wrap-up turns (retrospective, AFK iteration boundary, end-of-turn dirty-state scan).

### Investigation Tasks

- [x] Investigate root cause: confirmed missing memory/feedback note encoding wrap-up-specific proactivity rule
- [x] Review existing feedback memories on act-on-obvious-decisions and FFS-detector tickets (P078); both reference memory files that do not exist on disk, confirming the memory layer gap
- [x] Create reproduction test reference: AFK retrospective transcript (2026-04-26) cited above; no executable test added since the corrective is memory rather than code
- [ ] Create INVEST story for follow-on wrap-up checklist hook (a future enforcement layer that scans `git status` at wrap-up and routes to the act/revert decision tree); deferred as a separate ticket if memory-layer enforcement proves insufficient over the next AFK cycle

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P078 (assistant does not offer problem ticket on user correction; same act-on-obvious-decisions family)

## Related

- ~/.claude/projects/-Users-tomhoward-Projects-windyroad/memory/feedback_act_on_obvious_decisions.md
- docs/decisions/013-structured-user-interaction-for-governance-decisions.*.md
- docs/problems/078-assistant-does-not-offer-problem-ticket-on-user-correction.*.md
