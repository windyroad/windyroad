# Ask Hygiene Trail: 2026-05-31 work-problems iter 17 (P052 parked)

Context: AFK `/wr-itil:work-problems` iter 17 subprocess. Worked P052 (Ticket-family completeness check missing before declaring friction "done") Open to Parked. Fix sites live upstream across three SKILL.md files in two plugins: `wr-itil` plugin (`skills/transition-problem/SKILL.md` Pre-flight checks Option b close-flow extension; `skills/review-problems/SKILL.md` Step 9d close-eligibility Option b extension) AND `wr-retrospective` plugin (`skills/run-retro/SKILL.md` Step 4a Option a retro-time advisory script). Verified cached `wr-itil@0.38.0` plus `wr-retrospective@0.21.4` still ship the gap: `transition-problem/SKILL.md` Pre-flight checks lines 75 to 94 are destination-specific without friction-class scan; `review-problems/SKILL.md` Step 9d graph walk line 58 explicitly states "Ignore `**Composes with**` (does not propagate)"; `run-retro/SKILL.md` Step 4a has no friction-class advisory surface. No upstream issue filed yet. Fourth `wr-itil` plugin surface this AFK loop (after P031 parked, P049 parked, P048 parked); also touches `wr-retrospective` (after P029 parked iter 14). Commit `dc257e7`.

## Ask Hygiene

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| (none) | n/a | n/a | n/a |

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

Zero AskUserQuestion calls fired this iter (AFK constraint per the loop's standing rules). All decisions were framework-mediated: (a) Open to Parked transition driven by manage-problem Parked lifecycle entry; (b) Upstream-blocked classification driven by P045 placement-authority check (verified against three cached SKILL.md files across two plugins); (c) README WSJF table row removal plus Parked section insertion (appended after P049 / before P060 per ID sort) per the documented refresh contract; (d) Last-reviewed line replacement; iter-16 P048 fragment rotated to README-history.md under existing 2026-05-31 heading per P134; (e) risk-scorer pipeline assessment returned 2/25 Very Low with `RISK_BYPASS: reducing` marker emitted, commit landed without ceremony. Nothing classified as lazy.

## Notes

- No same-session verification candidates.
- Verification of upstream-blocked claim per P045: confirmed `wr-itil` plugin owns two of three candidate fix surfaces (`skills/transition-problem/SKILL.md` Pre-flight Option b, `skills/review-problems/SKILL.md` Step 9d Option b); confirmed `wr-retrospective` plugin owns the third (`skills/run-retro/SKILL.md` Step 4a Option a advisory script); confirmed `windyroad/agent-plugins` is upstream for both plugins; confirmed downstream cannot durably edit cached plugin without losing the change on next plugin update; confirmed no local-codifiable surface (this project has no `packages/wr-itil/` or `packages/wr-retrospective/`).
- One pipeline-stability signal observed this iter: initial README-history.md rotation inserted iter-16 P048 fragment ABOVE iter-15 P046 fragment, violating the forward-chronological "newest at bottom" convention; caught on Read-back and corrected with a swap edit. Latent ordering-hazard in append-only rotation; deduplicates against process discipline rather than generating a new ticket.
- README inventory currency check returned `packages dir not found: packages` (adopter-tree not-applicable case, same as prior iters).
- Cheap-layer context measurement (Step 2c): not run this iter (orchestrator did not request); prior iter 16 snapshot stands. Problems bucket grew by approximately 6 KB since iter 16 (P052 ticket body Parked-section append plus README + README-history rotations).
- No deferrals to next interactive session.
