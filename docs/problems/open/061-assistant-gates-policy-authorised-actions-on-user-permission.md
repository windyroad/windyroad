# Problem 061: assistant gates policy-authorised actions (push, release-watch) on user permission when risk-scorer has already cleared

**Status**: Open
**Reported**: 2026-05-14
**Priority**: 4 (Medium). Impact: 2 x Likelihood: 4 (deferred, re-rate at next /wr-itil:review-problems)
**Effort**: M (deferred, re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

The assistant prose-asks the user for permission to push (or release-watch) at session wrap-up, framing the action as "hard-to-reverse / actions visible to others", even after the risk-scorer subagent has explicitly cleared the push and release layers within appetite. This is a lazy-Ask-on-policy-authorised-actions regression per ADR-044 Step 2d Ask Hygiene classification and ADR-013 Rule 5.

The framework already resolves the decision: `RISK-POLICY.md` appetite + risk-scorer commit/push/release scores within appetite + clean reconcile-readme + green TDD gate = "push is authorised". Re-asking the user is sub-contracting the framework-resolved decision back. The user has documented this pattern multiple times in memory and ADR; the lapse keeps recurring at session wrap-up specifically.

Reproduced 2026-05-14 (this session, end of /wr-retrospective:run-retro): after running 7 commits through architect / JTBD / risk-scorer gates (all cleared, max commit=4 Low, push=3 Low, release=1 Very Low across the session), the assistant wrote "Push decision still deferred pending explicit user direction" in the retro summary. User correction: "yo have the risk scorer. you don't need to ask me to push." Push then completed cleanly (all 8 commits to origin/master, CI green on the new run, P059 SIGPIPE fix verified in flight).

## Symptoms

- Assistant emits prose-ask at session wrap-up: "Push decision deferred", "Want me to push?", "Should I push these commits?", or similar phrasings naming the user as the gate.
- Pattern fires specifically at the END of a long work session, AFTER risk-scorer has cleared every commit in the chain. The early-session and mid-session per-commit gate handling is correct (no prose-ask there); the regression is at wrap-up.
- User correction follows; push happens; framework was right about authorisation all along.
- The Ask Hygiene Pass trail file for the session does NOT log this as an `AskUserQuestion` call (it was prose-ask, not structured), so the lazy count remains 0 while the lazy-friction is real. Detection gap: lazy count metric measures structured calls only; the prose-ask shape is invisible to the trend script.

## Workaround

User corrects via short direction ("yo have the risk scorer. you don't need to ask me to push" / "just push" / "yes go"). The assistant's `itil-assistant-output-review.sh` Stop hook scans for canonical prose-ask phrasings and nudges; the hook fired correctly in this session (the user's correction tripped the `act on obvious decisions; NEVER prose-ask` UserPromptSubmit hook). The post-correction action proceeds cleanly. Cost: ~1 round-trip per session wrap-up.

## Impact Assessment

- **Who is affected**: solo-operator Tom across every long-haul work-problem / goal session. The pattern surfaces once per session at wrap-up.
- **Frequency**: ~every wrap-up of a multi-commit session where risk-scorer has cleared throughout.
- **Severity**: Medium. Not a blocker (user is in-loop and the correction is cheap); is the recurring friction the existing `itil-assistant-output-review.sh` Stop hook nudge already targets but does not block. The recurring nature is the WSJF-worthy signal.
- **Analytics**: Ask Hygiene Pass trail files (`docs/retros/*-ask-hygiene.md`) catch the structured-Ask case but miss the prose-ask shape this ticket documents.

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems.
- [ ] Decide enforcement shape. Candidate: extend `packages/retrospective/scripts/check-ask-hygiene.sh` (or sibling) to scan the agent's emitted output for prose-ask phrasings at session wrap-up, not only AskUserQuestion calls. Mirrors the `itil-assistant-output-review.sh` Stop-hook scan, but as a measurement layer rather than a per-turn nudge.
- [ ] Decide memory shape. The existing `feedback_no_pitching_act_on_obvious_decisions.md` memory targets the general case; this ticket is the specific surface (policy-authorised post-clearance actions at session wrap-up). May warrant a sibling memory note OR a paragraph extension to the existing note.
- [ ] Decide ADR shape. ADR-013 Rule 5 documents the policy-authorised-action carve-out; ADR-044 Step 2d documents the lazy classification taxonomy. Both apply; this ticket may warrant a sibling reassessment criterion for ADR-044 if the prose-ask surface needs a Phase 4 enforcement hook gate similar to P132.
- [ ] Create reproduction test (force the failing branch via fixture): simulate the end-of-session prose-ask shape via the Stop-hook scanner and verify the nudge fires.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P078 (capture-on-correction sibling discipline gap, sibling family of assistant-discipline tickets), P132 (proposed ADR-044 Phase 4 enforcement hook), P135 (Ask Hygiene Pass Phase 5).

## Related

Captured via /wr-itil:capture-problem on 2026-05-14 following user correction at end of /wr-retrospective:run-retro session. Live evidence: 2026-05-14 retro summary "Push decision still deferred pending explicit user direction" + user response "yo have the risk scorer. you don't need to ask me to push" + clean push completion. Memory note `feedback_no_pitching_act_on_obvious_decisions.md` covers the general pattern; this ticket records the specific surface (policy-authorised post-clearance actions at session wrap-up).
