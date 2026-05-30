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
