# Ask Hygiene Trail: review-problems retro 2026-05-30

Per ADR-044 Phase 5 / P135. One AskUserQuestion call fired this session (the /wr-itil:review-problems Step 4 verification batch).

## Ask Hygiene

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| 1 | Verify | lazy | Framework: /wr-itil:review-problems SKILL.md Step 4 + P186 evidence-first cell shape. P010's row already carried `yes (observed: 2026-05-25 published edition surfaces canonical openai.com/index URL and r/MachineLearning permalink)` evidence in its `Likely verified?` cell BEFORE the question fired. Per P186 the cell IS the close authorisation; surfacing P010 inside the AskUserQuestion sub-contracted the framework-resolved close back to the user. Tom's verbatim correction: "If you've observed these as fixed, why you asking??!" |

**Lazy count: 1**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

## Trend tail-in

Prior consecutive retros (per `packages/retrospective/scripts/check-ask-hygiene.sh` consumption window):

- 2026-05-30-work-problem-p010-ask-hygiene.md (earlier this session, AFK iter)
- 2026-05-30-work-problem-p052-ask-hygiene.md (earlier this session)
- 2026-05-30-work-problem-p057-ask-hygiene.md
- 2026-05-30-work-problem-p062-ask-hygiene.md
- 2026-05-30-work-problem-p063-ask-hygiene.md
- 2026-05-30-work-problem-p066-ask-hygiene.md
- 2026-05-30-work-problem-p068-ask-hygiene.md
- 2026-05-30-ask-hygiene.md

Cross-session trend evaluation: defer to `check-ask-hygiene.sh` script output (R6 numeric gate: lazy count greater than or equal to 2 across 3 consecutive retros).

## Mitigation shipped this session

Memory note `feedback_observed_means_close_not_ask.md` written to the windyroad memory tree directing the assistant to close `yes (observed: <evidence>)` cells directly without re-asking. Mirrors the [[feedback_no_pitching_act_on_obvious_decisions]] discipline at a different surface. Verification trigger fires on next /wr-itil:review-problems Step 4 where a cell already carries observed evidence.

## Stage 2 fix strategy

- **Kind**: improve
- **Shape**: memory note (project-local feedback)
- **Target file**: `~/.claude/projects/-Users-tomhoward-Projects-windyroad/memory/feedback_observed_means_close_not_ask.md`
- **Edit summary**: shipped this session
- **Evidence**: this call's verbatim correction text + the in-session P186 cell read that triggered the close-on-evidence pattern.
