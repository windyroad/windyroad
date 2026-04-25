# Problem 019: Claude does not proactively act on ambient dirty state during retrospective and wrap-up

**Status**: Open
**Reported**: 2026-04-26
**Priority**: 12 (Significant). Impact: Moderate (3) x Likelihood: Likely (4)

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

### Investigation Tasks

- [ ] Investigate root cause: likely missing memory/feedback note encoding wrap-up-specific proactivity rule
- [ ] Review existing feedback memories on act-on-obvious-decisions and FFS-detector tickets (P078)
- [ ] Create reproduction test (e.g. retrospective transcript fixture with ambient dirty state)
- [ ] Create INVEST story for permanent fix (memory note plus possibly a wrap-up checklist hook)

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P078 (assistant does not offer problem ticket on user correction; same act-on-obvious-decisions family)

## Related

- ~/.claude/projects/-Users-tomhoward-Projects-windyroad/memory/feedback_act_on_obvious_decisions.md
- docs/decisions/013-structured-user-interaction-for-governance-decisions.*.md
- docs/problems/078-assistant-does-not-offer-problem-ticket-on-user-correction.*.md
