# Ask Hygiene 2026-05-30 (AFK work-problems iter 8, P070)

This iteration ran inside the AFK `/wr-itil:work-problems` loop. The loop's standing constraints forbid `AskUserQuestion` mid-iter, so the agent could not have fired any asks regardless of classification.

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | (no AskUserQuestion calls this iter) | n/a | AFK loop constraint: "never AskUserQuestion mid-loop" |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

Notes:

- Substantive direction question that WOULD have been a cat-1 direction ask if not for the AFK constraint: "Reverse pinned `feedback_brief_item_count.md` direction from 'no cap, minimum three' to thesis-coherence cap?" The architect named it as a direction reversal; per ADR-074 (substance-confirm-before-build) this would have been a direction (cat-1) ask, NOT lazy, because the framework cannot resolve a direction reversal of a user-pinned preference. The ask was correctly deferred to next interactive session via the investigation-update append on P070, not silently auto-applied.
- ADR creation ask that WOULD have been a cat-1 direction ask: "Promote editorial-shape rule to ADR?" Architect recommended it; AFK constraint defers to next interactive session.
- JTBD ratification ask that WOULD have been a cat-1 direction ask: "Confirm leader + developer personas and JTBD-001/002/003/200 currently `.proposed.md`?" Per `feedback_new_jtbd_and_persona_need_human_confirmation.md`, JTBD ratification is direction-setting. Deferred.

All three deferrals were recorded in the P070 ticket's Investigation update section so the next interactive session has the full picture.

---

# Ask Hygiene 2026-05-30 (AFK work-problems iter 9, P001)

This iteration ran inside the AFK `/wr-itil:work-problems` loop. The loop's standing constraints forbid `AskUserQuestion` mid-iter, so the agent could not have fired any asks regardless of classification.

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | (no AskUserQuestion calls this iter) | n/a | AFK loop constraint: "never AskUserQuestion mid-loop" |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

Notes:

- Investigation-only iteration on P001 (Next.js build hangs locally). No direction questions arose; the iter's load-bearing observation (original 2026-04-14 repro non-applicable on current Next 16 runtime) is purely diagnostic, not direction-setting.
- No deferrals to next interactive session from this iter.

---

# Ask Hygiene 2026-05-30 (AFK work-problems iter 10, P061)

This iteration ran inside the AFK `/wr-itil:work-problems` loop. The loop's standing constraints forbid `AskUserQuestion` mid-iter, so the agent could not have fired any asks regardless of classification.

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | (no AskUserQuestion calls this iter) | n/a | AFK loop constraint: "never AskUserQuestion mid-loop" |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

Notes:

- P061 (assistant gates policy-authorised actions on user permission) Open to Known Error. Root cause was diagnostic (deferral-prose evades direct-pitch detector); fix shape was mechanical (extend existing memory note with the wrap-up surface). No direction-setting question arose.
- Memory-layer fix shipped at `~/.claude/projects/-Users-tomhoward-Projects-windyroad/memory/feedback_no_pitching_act_on_obvious_decisions.md` (not version-controlled; project-local user memory). Upstream-blocked follow-ups (PROSE_ASK_PATTERNS extension, check-ask-hygiene.sh measurement-layer extension) recorded on the ticket as deferred.
- No deferrals to next interactive session from this iter.

---

# Ask Hygiene 2026-05-30 (AFK work-problems iter 6, P033)

This iteration ran inside the AFK `/wr-itil:work-problems` loop. The loop's standing constraints forbid `AskUserQuestion` mid-iter, so the agent could not have fired any asks regardless of classification.

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | (no AskUserQuestion calls this iter) | n/a | AFK loop constraint: "never AskUserQuestion mid-loop" |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

Notes:

- P033 (report-upstream SKILL.md Step 5 example uses `--label` flag that fails when upstream repo has not pre-created the label) Open to Parked, upstream-blocked. Fix lives in the `wr-itil` plugin SKILL.md Step 5 at `~/.claude/plugins/cache/windyroad/wr-itil/<version>/skills/report-upstream/SKILL.md`. A marketplace consumer cannot edit the cached SKILL.md without losing the change on next plugin update.
- Verified 2026-05-30 on cached `0.38.0`: line 405 still ships `--label "${MATCHED_TEMPLATE_LABEL_IF_ANY}"` unmodified (no Option 1 drop-flag amendment, no Option 2 pre-flight guard variant).
- Upstream `windyroad/agent-plugins#87` OPEN as of 2026-05-30 (last updated 2026-05-15); tracked upstream as P207 (safe-low-fix-risk per `/wr-itil:review-problems` Step 4.5e). No fix committed upstream yet.
- Un-park trigger: a new `wr-itil` plugin release whose `report-upstream/SKILL.md` Step 5 either (a) drops the `--label` line entirely (Option 1, recommended), or (b) ships a `gh label list` pre-flight guard (Option 2). Verify on next cache version.
- Composes-with iters 3 (P021), 4 (P022), and 5 (P027): same upstream `windyroad/agent-plugins` plugin surface, same upstream-blocked shape, same un-park mechanics. Fourth iter in this AFK session to consolidate on the wr-itil / wr-architect plugin upstream as the actionable lever.
- Step 4a verification-close drain: README Verification Queue has 26 rows, all `no (not observed)` or `no (observed regression)`; no `yes - observed:` rows surface for the P282 prior-session evidence drain. No `.verifying.md` tickets were exercised by this iter's bookkeeping-only tool calls.
- Step 2c context-usage: cheap layer reports problems=553549B, memory=369517B, decisions=283436B, skills=110533B, jtbd=23200B, hooks=14402B, project-claude-md=7530B; briefing not-measured (source-absent: project does not maintain `docs/briefing/` tree). No prior snapshot for delta-from-prior comparison (no `docs/retros/*-context-analysis.md` written yet).
- Step 2b README inventory-currency advisory failed open (`packages/` directory absent in this consumer project) per ADR-013 Rule 6 fail-soft contract; recorded as expected behaviour, not a regression.
- No deferrals to next interactive session from this iter.

---

# Ask Hygiene 2026-05-30 (AFK work-problems iter 7, P042)

This iteration ran inside the AFK `/wr-itil:work-problems` loop. The loop's standing constraints forbid `AskUserQuestion` mid-iter, so the agent could not have fired any asks regardless of classification.

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | (no AskUserQuestion calls this iter) | n/a | AFK loop constraint: "never AskUserQuestion mid-loop" |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

Notes:

- P042 (jtbd-enforce-edit hook uses relative `docs/jtbd` path; fails when cwd is not project root) Open to Parked, upstream-blocked. Fix lives in the `wr-jtbd` plugin hook at `~/.claude/plugins/cache/windyroad/wr-jtbd/<version>/hooks/jtbd-enforce-edit.sh`. A marketplace consumer cannot edit the cached hook without losing the change on next plugin update.
- Verified 2026-05-30 on cached `0.10.0`: lines 110-112 still ship `if [ -d "docs/jtbd" ]; then JTBD_PATH="docs/jtbd"; fi` unmodified (no `${CLAUDE_PROJECT_DIR}` resolution, no `git rev-parse --show-toplevel` fallback). The ticket's "line 93" reference is stale (newer versions added pre-flight exit-0 guards above the resolution block), but the root-cause line is unchanged.
- Upstream issue not yet filed against `windyroad/agent-plugins`; deferred `/wr-itil:report-upstream` to next operator-at-keyboard session (heavy interactive skill, template-matching, body authoring, label routing benefit from operator review). Recorded on ticket as "Upstream report pending".
- Un-park trigger: a new `wr-jtbd` plugin release whose `hooks/jtbd-enforce-edit.sh` replaces the relative `docs/jtbd` check with either (a) `${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || .)}/docs/jtbd` (the Fix Strategy recommendation), or (b) an alternative absolute-path resolution mechanism. Verify on next cache version.
- Composes-with iters 3 (P021), 4 (P022), 5 (P027), 6 (P033): all share the same downstream-consumer-cannot-edit-cached-plugin pattern, but P042 extends the surface from `wr-architect` and `wr-itil` to `wr-jtbd`. Fifth iter in this AFK session to consolidate on the upstream `windyroad/agent-plugins` repo as the actionable lever.
- Step 4a verification-close drain: README Verification Queue's `Likely verified?` cells are `no (not observed)` for the rows visible; no `yes, observed:` rows surface for the P282 prior-session evidence drain on this bookkeeping-only iter.
- Step 2c context-usage: cheap layer reports problems=557840B (delta +4291B vs prior 2026-05-13 snapshot 553549B), memory=369517B (delta +161048B), decisions=283436B (delta +50298B), skills=110533B (delta +10864B), jtbd=23200B (delta +756B), hooks=14402B (delta +1492B), project-claude-md=7530B (delta 0); briefing not-measured (source-absent: project still uses legacy `docs/BRIEFING.md` single-file shape; P100 transition pending). Problems delta tracks the P042 file rename plus parked-section append. All buckets within Tier-3 envelope.
- Step 2b pipeline-instability scan flagged one friction-class observation worth a sibling-ticket consideration: P057 staging-trap recovery semantics. After `git mv` plus post-rename `Edit`, the staging-trap correctly blocked the commit and named the trapped file. The retry stage-and-commit landed only the trapped file; the README.md I had also staged earlier in the same `git add ... ...` batch did not survive into the commit. Net effect: my single logical "park P042" landed across two commits (5a7d8a4 for the ticket rename plus edit; 9b0c488 for the README refresh). Repeat-work signal: I have hit this in prior AFK iters this week (iter 5 P027 had the same shape; iter 6 P033 also had two commits for the same reason). Worth a Step 4b Stage 1 ticket against the P057 trap mechanism: should the trap-recovery message advise the operator to re-`git add` ALL prior-staged paths, or should the trap itself re-stage all prior-touched paths on its way out? Leaving as deferred Step 5 surfacing rather than ticketing inline because the trap lives in upstream wr-itil hooks (same marketplace-consumer-cannot-edit-cached pattern as the work that triggered the observation in the first place), would be a sixth upstream-blocked ticket on the same upstream surface.
- Step 2b README inventory-currency advisory failed open (`packages/` directory absent in this consumer project) per ADR-013 Rule 6 fail-soft contract; recorded as expected behaviour, not a regression.
- No deferrals to next interactive session from this iter (the P057 trap observation is recorded as a deferred consideration rather than a hard direction question).

---

# Ask Hygiene 2026-05-30 (AFK work-problems iter 8, P047)

This iteration ran inside the AFK `/wr-itil:work-problems` loop. The loop's standing constraints forbid `AskUserQuestion` mid-iter, so the agent could not have fired any asks regardless of classification.

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | (no AskUserQuestion calls this iter) | n/a | AFK loop constraint: "never AskUserQuestion mid-loop" |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

Notes:

- P047 (wr-risk-scorer:assess-release SKILL.md step 5 contract violation: Skill-tool prose vs Agent-tool parameter) Open to Parked, upstream-blocked. Fix lives in the `wr-risk-scorer` plugin SKILL at `~/.claude/plugins/cache/windyroad/wr-risk-scorer/<version>/skills/assess-release/SKILL.md` step 5. A marketplace consumer cannot edit the cached SKILL.md without losing the change on next plugin update.
- Verified 2026-05-30 on cached `0.11.2`: line 67 still ships `Invoke the pipeline subagent via the \`Skill\` tool:` with `subagent_type: wr-risk-scorer:pipeline` (an Agent-tool parameter) on line 70. Following the prose verbatim still fails with "Unknown skill: wr-risk-scorer:pipeline".
- Sibling drift check (per Fix Strategy "Also worth checking" follow-up): `skills/assess-external-comms/SKILL.md` line 75 (`Invoke the subagent via the \`Skill\` tool:`) and `skills/assess-wip/SKILL.md` line 45 (`Invoke the wip subagent via the \`Skill\` tool:`) carry the same boilerplate mismatch. `skills/assess-inbound-report/SKILL.md` is clean; appears to have been authored post-fix. Upstream fix should cover all three legacy siblings simultaneously.
- Upstream `windyroad/agent-plugins#110` OPEN as of 2026-05-30 (last updated 2026-05-15T05:37:01Z per `gh issue view 110`, no labels). Filed 2026-05-02 via problem-report.yml template; cross-reference already present in the ticket's "Reported Upstream" section. No fix committed upstream yet.
- Un-park trigger: a new `wr-risk-scorer` plugin release whose `assess-release/SKILL.md` step 5 either (a) changes `via the \`Skill\` tool:` to `via the \`Agent\` tool:` (Option 1, recommended; matches the listed `subagent_type:` parameter), or (b) keeps the `Skill` tool wrapper and changes the parameters to `skill:` / `args:` plus ships a sibling SKILL alias (Option 2, incorrect on its face). Verify on next cache version. Sibling SKILLs `assess-external-comms` and `assess-wip` should receive matching prose fix in the same release.
- Composes-with iters 3 (P021), 4 (P022), 5 (P027), 6 (P033), 7 (P042): all six share the same downstream-consumer-cannot-edit-cached-plugin pattern. P047 extends the surface from `wr-architect` + `wr-itil` + `wr-jtbd` to `wr-risk-scorer`. Sixth iter in this AFK session to consolidate on the upstream `windyroad/agent-plugins` repo as the actionable lever.
- Architect review (this iter): PASS on substance (no ADR conflicts, no decision violations, no unratified dependency), NEEDS DIRECTION on three queued direction questions for next interactive session. (a) Codify the marketplace-consumer-cannot-edit-cached-plugin park pattern as an ADR. Option A: no ADR (case-law via iter parks). Option B: local ADR (P045-inverted placement). Option C: upstream ADR in `@windyroad/wr-itil` (architect lean). (b) Open separate tickets for `assess-external-comms` + `assess-wip` sibling drift. Architect lean: No (single upstream PR fixes all three; three-folding one issue violates P132 spirit). (c) Open a new ticket against the P057 staging-trap recurrence observed across iters 5/6/7 (and proactively mitigated this iter via combined pre-stage). Architect lean: defer to retro Notes block only, matching iter-7 P042 deferral shape.
- JTBD review (this iter): PASS, no edits blocked. Operator-loop hygiene; no documented reader-persona JTBD applies. Reviewer flagged a category-1 direction question for next interactive session: should "AFK loop parks tickets it cannot durably fix" formalise as a new operator-persona + JTBD pair (per `feedback_new_jtbd_and_persona_need_human_confirmation.md`, codification home would be upstream `agent-plugins`), or stay an implicit operator-as-orchestrator activity outside the JTBD corpus?
- Step 4a verification-close drain: README Verification Queue's `Likely verified?` cells remain `no (not observed)` or `no (observed regression)` across the row range; no `yes - observed:` rows surface for the P282 prior-session evidence drain on this bookkeeping-only iter.
- Step 2b pipeline-instability scan: this iter staged the ticket rename + ticket edit + README refresh + this retro append together BEFORE the principal commit, proactively mitigating the P057 staging-trap recurrence that split iters 5, 6, 7 into two commits each. Single-commit landing verified post-commit.
- Step 2b README inventory-currency advisory failed open (`packages/` directory absent in this consumer project) per ADR-013 Rule 6 fail-soft contract; recorded as expected behaviour, not a regression.
- Four deferrals to next interactive session, all surfaced via `outstanding_questions` in the ITERATION_SUMMARY block per ADR-044 cat-1 direction-question classification.

---

# Ask Hygiene 2026-05-30 (AFK work-problems iter 9, P049)

This iteration ran inside the AFK `/wr-itil:work-problems` loop. The loop's standing constraints forbid `AskUserQuestion` mid-iter, so the agent could not have fired any asks regardless of classification.

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | (no AskUserQuestion calls this iter) | n/a | AFK loop constraint: "never AskUserQuestion mid-loop" |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

Notes:

- P049 (reconcile-readme.sh section-order assumption produces false-positive STALE for tickets in section-after-Closed) Open to Parked, upstream-blocked. Fix site `packages/itil/scripts/reconcile-readme.sh` does NOT exist in this project's working tree; script lives in the `wr-itil` plugin at `~/.claude/plugins/cache/windyroad/wr-itil/<version>/scripts/reconcile-readme.sh`. This project is a downstream marketplace consumer of `@windyroad/wr-itil`. A consumer cannot edit the cached script without losing the change on next plugin update.
- Verified 2026-05-30 on cached `0.38.0`: lines 130-132 still ship the fallback-chain anti-pattern across THREE section-end computations. `WSJF_END=${VQ_START:-${INBOUND_START:-${CLOSED_START:-${PARKED_START:-$END_LINE}}}}` (line 130), `VQ_END=${INBOUND_START:-${CLOSED_START:-${PARKED_START:-$END_LINE}}}` (line 131), `CLOSED_END=${PARKED_START:-$END_LINE}` (line 132). All three use "first non-empty" rather than "min subsequent section start". `CLOSED_END` on line 132 is particularly fragile if PARKED precedes CLOSED (negative-span sed slice).
- Bug is currently latent under this project's README layout (WSJF, VQ, Inbound, Closed, Parked, Notes): `INBOUND_START=71` is picked as `VQ_END` and happens to be the correct next-section-start. The Closed-before-Parked workaround from iter 2 (2026-05-02 commit 8352016) remains the operating contract; any future README reorder that places `## Parked` before `## Closed` re-triggers the false-positive STALE.
- No upstream issue exists for P049 specifically. `gh issue list -R windyroad/agent-plugins --search "reconcile-readme"` on 2026-05-30 returned `#126`, `#85`, `#76`, `#180`; none cover the lines 130-132 section-order assumption. Ticket carries the standing "Upstream report pending" note. Per the AFK discipline observed in iters 3-8, the `/wr-itil:report-upstream` invocation is deferred to a batched filing pass at session boundary rather than fired in-loop.
- Un-park trigger: a new `wr-itil` plugin release whose `reconcile-readme.sh` replaces the lines 130-132 fallback chains with either (a) a min-of-subsequent-section-starts loop (the concrete bash sketched in this ticket's Fix Strategy), or (b) explicit section-position validation. Verify by re-reading the cached script in the new version, then re-running `/wr-itil:work-problems` Step 0 reconcile against both README section orderings (Closed-before-Parked and Parked-before-Closed) and confirming clean exit 0 in both.
- Composes-with iters 3 (P021), 4 (P022), 5 (P027), 6 (P033), 7 (P042), 8 (P047) plus P031 (parked 2026-05-02, same script, different surface): all seven share the same marketplace-consumer-cannot-edit-cached-plugin pattern. P049 extends the wr-itil surface from SKILL.md prose (P027, P031) to script logic (`reconcile-readme.sh`).
- Architect review (this iter): PASS on substance (no ADR conflicts, no decision violations, no unratified dependency, no runtime-path triggers). NEEDS DIRECTION on three queued questions for next interactive session. (a) Codify the now-7-ticket marketplace-consumer-cannot-edit-cached-plugin park pattern as an ADR. Three substance options: (A) "fix site is in an upstream plugin cache that this project does not author" - broad, captures all seven; (B) "fix site is in an upstream plugin AND no in-project workaround is viable" - narrower; (C) "fix site is in an upstream plugin AND the issue is filed upstream" - strictest. Architect advisory lean: (A). (b) Upstream-report batching discipline. P042 and now P049 share "Upstream report pending" status with no filed issue. (A) per-park `/wr-itil:report-upstream` invocation immediately; (B) single batched upstream filing pass at session boundary. Architect advisory lean: (B). (c) Companion CLOSED_END fix scope is already covered mechanically by the un-park trigger's structural-fix requirement; architect classifies as a grain question, not a substantive one - no AskUserQuestion needed.
- JTBD review (this iter): PASS, no edits blocked. Pure operator backlog hygiene; no documented commercial-reader job is touched. The change does not modify any homepage, `/ai-quality`, `/founders`, `/vibe-code-audit`, `/blog`, or newsletter surface. No `// @jtbd` annotations apply (markdown ticket files are not in the annotation surface). Reviewer flagged the park-only-vs-add-a-local-Closed-before-Parked-guard question as out of scope for JTBD: neither alternative changes any documented commercial-persona surface; the call belongs to the operator-workflow/WSJF lane and the iter 3-8 precedent (six consecutive identical parks) is the strongest signal for staying consistent.
- Step 4a verification-close drain: README Verification Queue's `Likely verified?` cells remain `no (not observed)` or `no (observed regression)` across the row range; no `yes - observed:` rows surface for the P282 prior-session evidence drain on this bookkeeping-only iter.
- Step 2b pipeline-instability scan: this iter co-staged all touched paths (ticket rename + ticket edit + README refresh) BEFORE the principal commit and landed the park in a single commit (`ec81581`). The P057 staging-trap mitigation pattern from iter 8 holds for iter 9; combined-stage discipline now verified across two consecutive iters.
- Step 2b README inventory-currency advisory failed open (`packages/` directory absent in this consumer project) per ADR-013 Rule 6 fail-soft contract; recorded as expected behaviour, not a regression.
- Three deferrals to next interactive session via `outstanding_questions` in the ITERATION_SUMMARY block per ADR-044 cat-1 direction-question classification (ADR codification of 7-ticket pattern; upstream-report batching; whether to expand the recurring marketplace-consumer-park pattern's WSJF re-rank logic to recognise the now-7-ticket cohort).

---

# Ask Hygiene 2026-05-30 (AFK work-problems iter 10, P068)

This iteration ran inside the AFK `/wr-itil:work-problems` loop. The loop's standing constraints forbid `AskUserQuestion` mid-iter, so the agent could not have fired any asks regardless of classification.

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | (no AskUserQuestion calls this iter) | n/a | AFK loop constraint: "never AskUserQuestion mid-loop" |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

Notes:

- P068 (Newsletter URL discovery via Google News RSS strips canonical to outlet root; misses real article URL) Open to Parked, architect-design (NOT upstream-blocked). The category distinction matters: iters 3-9 parked seven tickets whose fix sites were marketplace plugin cache scripts (`packages/itil/` or similar paths that this consumer project cannot edit durably). P068's fix site is in-project: `.claude/skills/wr-newsletter/SKILL.md` (line-confirmed editable from this project), `scripts/resolve-gnews-urls.mjs` (existing 53-line one-off ready to generalise), and `scripts/playwright-fetch.mjs` (existing 35-line helper). Block is internal-interactive (needs ADR-031 authored + 7 unratified JTBDs/personas ratified), not external-unmovable. Recording the distinction guards against a future un-park pass routing through `/wr-itil:report-upstream` (wrong skill for this category) instead of `/wr-architect:create-adr` + `/wr-jtbd:confirm-jobs-and-personas`.
- Iter 4 (2026-05-30 earlier this session) recorded the full architect+JTBD findings on the ticket body. Iter 10 verified by re-reading the ticket file: ADR-031 still does not exist in `docs/decisions/`; the seven JTBD/persona artefacts are all still `.proposed.md` lacking `human-oversight: confirmed`. Iter 10 added a brief re-affirmation section to the ticket above `## Dependencies` rather than duplicating the iter 4 findings.
- ADR-074 substance-confirm-before-build guard applied: ADR-031 is referenced in the ticket's Fix Strategy and the prerequisite ADR has never been authored (predicate would exit 2 = not found). The guard's AFK contract is "queue substance to outstanding_questions; do not guess; skip build." Substance queued: the chosen option ADR-031 will need to record at creation time (Playwright resolution as a pipeline primitive, with relationships to ADR-024 + ADR-029, the URL_UNRESOLVED marker semantics, performance budget impact, and shared-primitives extraction vs separate-script justification).
- Architect review (this iter): PASS on substance for the park-only decision (no ADR conflicts on this hygiene-only ticket rename + README refresh + body annotation; no decision violations; no runtime-path triggers). The architect-design block on P068 itself remains unresolved (it predates this iter and only the interactive cycle can resolve it).
- JTBD review (this iter): PASS, no edits blocked on the park-only commit. Pure operator backlog hygiene; no documented commercial-reader job is touched. The change does not modify any homepage, `/ai-quality`, `/founders`, `/vibe-code-audit`, `/blog`, or newsletter surface. No `// @jtbd` annotations apply (markdown ticket + README files are not in the annotation surface). The JTBD-ratification block on P068 itself remains unresolved (predates this iter; only `/wr-jtbd:confirm-jobs-and-personas` can resolve it).
- Step 4a verification-close drain: README Verification Queue's `Likely verified?` cells remain `no (not observed)` or `no (observed regression)` across the row range; no `yes - observed:` rows surface for the P282 prior-session evidence drain on this bookkeeping-only iter.
- Step 2b pipeline-instability scan: this iter pre-staged the renamed-ticket path + README refresh together before invoking the principal commit. P057 staging-trap fired once anyway (the renamed file's post-rename body edits were not captured by the `git add` of the old path; second-stage `git add` of the new path was needed to land the body edits). Mitigation worked as designed (block + clear remediation message). Combined-stage discipline pattern from iters 8 + 9 now extended to iter 10 with the additional caveat that post-rename body edits require an explicit `git add` of the new path even when the rename was via `git mv`.
- Step 2b README inventory-currency advisory failed open (`packages/` directory absent in this consumer project) per ADR-013 Rule 6 fail-soft contract; recorded as expected behaviour, not a regression.
- Two deferrals queued via `outstanding_questions` in the ITERATION_SUMMARY block per ADR-044 cat-1 direction-question classification (ADR-031 substance for authoring; seven JTBD/persona ratifications).
