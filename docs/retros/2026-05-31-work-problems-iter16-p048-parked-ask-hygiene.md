# Ask Hygiene Trail: 2026-05-31 work-problems iter 16 (P048 parked)

Context: AFK `/wr-itil:work-problems` iter 16 subprocess. Worked P048 (`/wr-itil:manage-problem` Step 5 P094 README refresh contract bypassed on bulk-creation paths) Open to Parked. Fix sites live upstream in `wr-itil` plugin across two surfaces: `skills/manage-problem/SKILL.md` Step 5 P094 block plus Step 4b multi-concern split contract (Option A end-of-flow batch refresh), AND `hooks/lib/create-gate.sh` per-session marker semantics (Option B per-ticket marker). Verified cached `wr-itil@0.38.0` still ships the gap: `hooks/lib/create-gate.sh` lines 21 to 26 carry explicit "Per-session scope is intentional per architect direction A" comment rejecting Option B by design; `skills/manage-problem/SKILL.md` Step 5 P094 block lines 513 to 529 implements Option A only for SKILL-mediated Step 4b multi-concern split path. Bulk-Write paths OUTSIDE the SKILL flow still bypass P094. No upstream issue filed yet. Routine third `wr-itil` plugin surface this AFK loop (after P031 parked + P049 parked iter 9). Commit `0facd49`.

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

Zero AskUserQuestion calls fired this iter (AFK constraint per the loop's standing rules). All decisions were framework-mediated: (a) Open to Parked transition driven by manage-problem Parked lifecycle entry; (b) Upstream-blocked classification driven by P045 placement-authority check + Verification check section already recorded on the ticket body ("Placement authority: this project is the wr-itil plugin's consumer, not maintainer", pre-park ticket lines 62 to 64); (c) README WSJF table row removal + Parked section insertion (appended after P047 / before P049 per ID sort) per the documented refresh contract; (d) Last-reviewed line replacement; iter-15 P046 fragment rotated to README-history.md under existing 2026-05-31 heading per P134; (e) risk-scorer pipeline assessment returned 2/25 Very Low with `RISK_BYPASS: reducing` marker emitted, commit landed without ceremony. Nothing classified as lazy.

## Notes

- No same-session verification candidates.
- Verification of upstream-blocked claim per P045: confirmed `wr-itil` plugin owns both Option A surface (`skills/manage-problem/SKILL.md` Step 5 P094 block) AND Option B surface (`hooks/lib/create-gate.sh` per-session marker); confirmed `windyroad/agent-plugins` is upstream; confirmed downstream cannot durably edit cached plugin without losing the change on next plugin update; confirmed Option B explicitly rejected upstream by architect direction (cached comment line 21 to 26 names it); confirmed Option A only partially implemented (SKILL-mediated multi-concern split path only); confirmed no local-codifiable surface (both surfaces live wholly inside the upstream plugin).
- One pipeline-instability signal observed this iter: em-dash hook blocked initial Edit of the `## Parked` section content (the prose contained em-dashes in inline-list separators); rewrote without em-dashes on second attempt. Same shape as iters 12 (P060) + 13 (P073) which are themselves parked tickets for the upstream root cause; deduplicates against those existing tickets rather than generating a new one.
- README inventory currency check returned `packages dir not found: packages` (adopter-tree not-applicable case, same as prior iters).
- Cheap-layer context measurement (Step 2c) ran. Bucket totals: hooks=14402, skills=110533, decisions=283436, problems=614774, jtbd=23200, project-claude-md=7530, memory=369517; briefing not-measured (source-absent). THRESHOLD=10240. Prior snapshot `docs/retros/2026-05-13-context-analysis.md` is 18 days old (>14d) AND deltas exceed +20% in three buckets (decisions, problems, memory); deep analysis recommended via `/wr-retrospective:analyze-context`. Problems bucket grew by 8355 bytes since iter 15 (P048 ticket body Parked-section append plus README + README-history rotations).
- No deferrals to next interactive session.
