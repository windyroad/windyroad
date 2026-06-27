# Problem 043: /wr-newsletter three-lens scoring lets non-leader-actionable items through; persona relevance is post-filter, not in scoring

**Status**: Closed
**Reported**: 2026-05-01
**Origin**: internal
**Priority**: 16 (Significant). Impact: Significant (4) x Likelihood: Likely (4) (re-rated 2026-05-10 per ADR 027: three-lens leak past gate is newsletter content quality at gate, L4 Significant)
**Effort**: M
**WSJF**: (16 x 1.0) / 2 = 8.0 (folklore weight 2.0 dropped per ADR 027)

## Description

The current three-lens filter (`.claude/skills/wr-newsletter/assets/three-lens-filter.md`) scores yes/no on Technical / Operational / Human dimensions, then keeps candidates with yes on ≥2 lenses. The persona's leader-relevance only kicks in as a third-tier qualifier in step 5: "no-map-anchor but all-three-lens AND significant for the Engineering Leader persona."

The result: map-anchored items pass on 2 lenses without ever asking "what should a leader do about this?" The 2026-05-01 initial slate contained the OpenAI cluster, Anthropic regional, and Google-Pentagon, all 2-3 lens scores on map-anchor grounds, all without concrete leader action this week.

User challenged the slate: "are these the ones most relevant to IT leaders?", forcing a reassessment that dropped 3 items and added 2 new ones.

## Symptoms

- 2026-05-01 Edition 3 initial shortlist had 3 of 6 items with no concrete leader-action; user reassessment dropped them
- Reassessment cost: full step 10 capture re-run, drafter rework on 3 items
- Same root cause as P016 (filter drops significant stories) but inverted axis: filter passes insignificant stories

## Workaround

User performs post-filter "is this leader-actionable this week, this quarter, this year?" challenge during step 10 capture. Manual; recurring.

## Root Cause Analysis

### Root Cause

The three-lens definitions are loose enough to admit non-leader-action stories. "Operational" passes on "concrete implication for how engineering teams build, deploy, test, or secure software", true of most tier-1 vendor announcements regardless of whether a leader has anything to do.

### Fix Strategy

User has named the desired direction: **incorporate leader-relevance into the scoring system, not as a post-filter**. Three options under consideration:

**Option A** (4th explicit lens): keep T/O/H, add a 4th "Leader Action" lens (yes if there is a concrete action the leader should take this quarter, procurement question, capability investment, risk audit, measurement update, hiring/policy change). The action MUST be nameable as one sentence in candidate metadata. Threshold: yes on ≥3 of 4 AND yes on Leader Action.

**Option B** (rubric-based numeric scoring): each candidate scores 0-3 on Days-to-action / Action-specificity / Action-consequence / Persona-fit. Total ≥7 = full Item; 5-6 = Also-worth-noting; <5 = drop.

**Option C** (redefine each lens through leader-action): keep three lenses but tighten each to require named leader action. e.g. Technical lens: "yes if the capability change requires the leader to update a procurement, capability, or risk assumption *this quarter*."

**Recommended**: Option C + named-action metadata requirement. Closes the loophole at the lens level, minimal mechanism change. User picks the design before the next edition.

- **Kind**: improve
- **Shape**: skill (filter rubric amendment)
- **Target file**: `.claude/skills/wr-newsletter/assets/three-lens-filter.md`

## User direction (loop-end batched answer, 2026-05-11)

User picked: **Option C** (redefine each lens through leader-action). Matches the ticket's documented recommendation.

Follow-up work for next session:
- Rewrite `.claude/skills/wr-newsletter/assets/three-lens-filter.md` so each of Technical / Operational / Human lenses requires a named leader action this quarter (procurement question, capability investment, risk audit, measurement update, hiring or policy change). Lens definitions retain T/O/H structure but tighten the yes-criterion.
- Add a `named_action` field to candidate metadata. Lens evaluation MUST cite the action as one sentence; a candidate with no nameable action fails the lens.
- Update `/wr-newsletter` step 5 to drop the post-filter "no-map-anchor but all-three-lens AND significant for the Engineering Leader persona" qualifier; the lens-tightening absorbs it.
- Surfaced 2026-05-11 via /wr-itil:work-problems loop-end Step 2.5b after iter selection skipped this ticket on the user-answerable design queue.

## Resolution Implementation (2026-05-12, AFK loop iter 2 retry + orchestrator-main-turn completion)

Shipped on local master (release pending; verifying transition fires on next push:watch per ADR-007):

- `.claude/skills/wr-newsletter/assets/three-lens-filter.md` rewritten per Option C. Each Technical / Operational / Human lens now requires a `named_action` for the `<target-reader>` this quarter (recorded as a one-sentence metadata field on every yes-scored lens). A lens with no nameable persona-conditional action scores no, regardless of topical fit. Added a persona-conditional action vocabulary table that lists acceptable action types per persona: leader (procurement question, capability investment, risk audit, measurement update, hiring decision, role redesign, training investment, comms / change-management action, policy update) and developer (spot-test, adopt, pilot, watch, skip, time-box experimentation, abstain, re-evaluate evidence stance, upward-influence per JTBD-203 raise-to-lead / champion-to-team / surface objection, change personal workflow / tool selection). Third-tier prioritisation rewritten: "no-map-anchor but all-three-lens AND `named_action` recorded for `<target-reader>` on all three lenses" replaces the prior leader-persona-specific check; the P016 no-map-anchor safety net is preserved. Target-audience reminder now binds `<target-reader>` at step 0 from persona config (leader or developer).

- `.claude/skills/wr-newsletter/SKILL.md` step 4 bullet 2 amended with a single sentence directing the in-flow three-lens scorer to record `named_action` per yes-scored lens, drawn from the asset's persona-conditional action vocabulary. The amendment is minimum-delta: the full policy lives in the asset; SKILL.md gains the in-flow enforcement pointer.

Three changes, two files, single iter (subprocess plus orchestrator-main-turn completion).

The candidate-metadata format is informal (in-memory bag of tags carried between pipeline steps); no centralised schema file required a separate edit. The `named_action` field arrives at step 4 scoring and propagates naturally through step 9.5 ranking and step 11 brief composition because the asset documents the contract.

Architect PASS (no new ADR; minimum-delta amendment; ADR-017 prep-vs-finalise variant clauses cascade unchanged; ADR-027 L4 Significant gate strengthened by the lens-level enforcement). JTBD PASS across JTBD-001 through JTBD-004 (leader awareness, engagement, evaluation, ongoing ownership) and JTBD-200 through JTBD-205 (developer signal triage, tool-triage time-budget, category timing, peer validation, experiment / delivery boundary, shipped-vs-demo evidence stance). The developer-vocabulary inclusion closes a prior leader-only blindspot.

The AFK subprocess dispatched twice for this work today hit stream-idle-timeout API errors mid-iter (iter 2 first attempt: ~96 min wall-clock with OS-suspend gap, 0-byte JSON; iter 2 retry: 32 min wall-clock, 44 turns, $6.82, is_error: true, partial edit to three-lens-filter.md only). Iter 2 retry preserved JSON envelope at `.afk-run-state/resolved/iter-2-retry-2026-05-12.json`. The orchestrator main turn completed the SKILL.md edit, the ticket transition, the README refresh, and this commit per ADR-013 Rule 1 (interactive recovery on user-direction "keep going").

Transitioned Open to Known Error (verifies on next push:watch plus the following weekly newsletter edition that produces a brief whose candidate metadata records a `named_action` per yes-scored lens and whose third-tier prioritisation uses the lens-level gate instead of the prior leader-persona post-filter).

## Related

- P016 (filter drops significant stories), companion ticket on the inverse axis
- This retrospective: 2026-05-01 edition retro
- ADR-017 (newsletter prep + finalise phases): prep-vs-finalise variant clauses cascade the named_action requirement unchanged
- ADR-027 (newsletter primacy in risk Impact rubric): the L4 Significant "three-lens leak past gate" surface is strengthened by lens-level enforcement

## Fix Released

Released 2026-05-12 to `origin/master` in commit `219377b`: each T / O / H lens now requires a named_action for the target-reader this quarter from a persona-conditional action vocabulary (leader plus developer); third-tier prioritisation rewritten to use lens-level gating instead of leader-persona post-filter.

Awaiting user verification. Verification trigger: next weekly newsletter edition that produces a brief whose candidate metadata records a named_action per yes-scored lens and whose third-tier prioritisation uses the lens-level gate.

## Closed

- **Closed**: 2026-06-28 (verification-queue drain; evidence-based per ADR-022)
- **Evidence**: named_action requirement present in three-lens-filter.md; exercised in editions since 2026-05-15
- **Recovery**: reopen via /wr-itil:transition-problem 043 known-error if a regression surfaces
