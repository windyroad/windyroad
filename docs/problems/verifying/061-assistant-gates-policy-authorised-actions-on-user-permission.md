# Problem 061: assistant gates policy-authorised actions (push, release-watch) on user permission when risk-scorer has already cleared

**Status**: Verification Pending
**Reported**: 2026-05-14
**Released**: 2026-05-30 (commit `9f42130`)
**Origin**: internal
**Priority**: 8 (Medium). Impact: Minor (2) x Likelihood: Likely (4)
**Effort**: M
**WSJF**: 0 (excluded from dev-work ranking per ADR-022; user-side verification remaining)
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

## Root Cause and Fix Strategy

**Root cause**: The upstream `itil-assistant-output-review.sh` Stop hook scans for direct-pitch phrasings via PROSE_ASK_PATTERNS ("Want me to...", "Should I...", "Awaiting your direction"). The wrap-up regression manifests as **deferral-prose** instead ("Push decision deferred pending direction", "Awaiting clearance to push"), a grammatically-inverted form that accomplishes the same forced-round-trip outcome but evades the direct-pitch regex. The existing memory note `feedback_no_pitching_act_on_obvious_decisions.md` covers the general anti-pitch discipline but did not explicitly name the deferral-prose shape nor the post-risk-scorer-clearance wrap-up trigger condition.

**Fix shipped (2026-05-30, AFK iter 10)**: Extended `feedback_no_pitching_act_on_obvious_decisions.md` (project-local user memory at `~/.claude/projects/-Users-tomhoward-Projects-windyroad/memory/`) with a new "Wrap-up surface for policy-authorised post-clearance actions" section enumerating four canonical deferral-prose phrasings, the post-risk-scorer-clearance trigger condition, the equivalence rule (treat deferral-prose as a pitch), and the 2026-05-14 source incident as anti-pattern witness. Model-layer reinforcement; the upstream hook + Ask Hygiene metric extensions remain as separate upstream-blocked follow-ups.

**Deferred follow-ups (upstream-blocked)**:
- Extend `@windyroad/itil` `lib/detectors.sh` PROSE_ASK_PATTERNS to include deferral-prose shapes (`Push decision .* deferred`, `pending.* user direction`, `Holding off.* pending your`). Upstream surface, not editable from this project.
- Extend `@windyroad/retrospective` `check-ask-hygiene.sh` to scan emitted output for both direct-pitch AND deferral-prose shapes alongside structured AskUserQuestion counts. Upstream surface.

Both follow-ups are tracked as upstream proposals; they raise robustness but do not gate this ticket's transition to Known Error. The model-layer memory extension is the in-project lever.

## Fix Released

Released 2026-05-30 in commit `9f42130` ("docs(problems): P061 Open to Known Error, memory-layer deferral-prose fix"). The release marker for this ticket is the commit itself, NOT a tagged npm release. The fix surface is project-local user memory at `~/.claude/projects/-Users-tomhoward-Projects-windyroad/memory/feedback_no_pitching_act_on_obvious_decisions.md`, which is not git-tracked and has no release pipeline. The same pattern applies as P062 (project-local `.claude/skills/wr-newsletter/` change, commit as release marker) and P063 (project-local `.claude/skills/wr-newsletter-cover/` change). User-memory edits are live on disk the moment they ship; KE to Verification Pending fires on commit-as-release-marker rather than waiting for an npm tag that will never come.

Fix mechanism: `feedback_no_pitching_act_on_obvious_decisions.md` carries a new "Wrap-up surface for policy-authorised post-clearance actions (P061)" section enumerating four canonical deferral-prose phrasings ("Push decision still deferred pending explicit user direction", "Awaiting clearance to push", "Holding off on push pending your call", "Push remains deferred pending direction"), the post-risk-scorer-clearance trigger condition (every commit in chain within RISK-POLICY appetite, CI presumed green), the equivalence rule (treat deferral-prose as a pitch; same forced round-trip outcome as a direct pitch, just grammatically inverted to evade the upstream `itil-assistant-output-review.sh` direct-pitch regex), and the 2026-05-14 source incident as anti-pattern witness.

Awaiting user verification per ADR-022. Verification trigger as documented in the next section.

## Verification

Verification trigger fires on the next AFK iter or interactive session wrap-up where: (a) risk-scorer has cleared every commit in the chain within RISK-POLICY.md appetite, AND (b) the assistant performs the push (or release-watch) directly without emitting any of the four canonical deferral-prose phrasings or naming the user as the gate. With Status now Verification Pending (transitioned 2026-05-30, commit-as-release-marker per ADR-022 user-memory carve-out), the queue position surfaces in the Verification Queue table for user closure on next observed clean-wrap-up exercise.
