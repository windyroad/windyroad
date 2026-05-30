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
