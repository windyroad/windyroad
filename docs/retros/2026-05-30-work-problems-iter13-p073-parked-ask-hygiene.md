# Ask Hygiene Trail: 2026-05-30 work-problems iter 13 (P073 parked)

Context: AFK `/wr-itil:work-problems` iter 13 subprocess. Worked P073 (P186 evidence-first cell canonical shape uses U+2014 separator that no-em-dash hook blocks during README render) Open to Parked. Fix lives upstream in the `wr-itil` plugin SKILL.md files; latest cached `0.34.0` verified still ships the U+2014 separators in the canonical cell shapes across six render sites (`skills/review-problems/SKILL.md` lines 78 to 82 define `yes [U+2014] observed: <evidence>` / `no [U+2014] not observed` / `no [U+2014] observed regression`; plus `manage-problem/`, `reconcile-readme/`, `transition-problem/`, `transition-problems/`, `list-problems/` all keyed by `<!-- LIKELY-VERIFIED-CELL-SHAPE: evidence-based per P186 -->` drift-tripwire marker). No upstream issue filed yet; standing "Upstream report pending" marker added on the ticket per the AFK fallback. Same marketplace-consumer-cannot-edit-cached-plugin pattern as iters 3 to 12 (P021, P022, P027, P033, P042, P047, P049, P060). Commit 2b0b5ad.

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

Zero AskUserQuestion calls fired this iter (AFK constraint per the loop's standing rules). All decisions were framework-mediated: (a) Open to Parked transition driven by manage-problem Parked lifecycle entry; (b) external-root-cause detection silent: ticket did NOT carry the "Upstream report pending" marker, so the AFK fallback (option 2 per ADR-013 Rule 6) appended the marker line verbatim without firing AskUserQuestion; (c) README WSJF table row removal + Parked section insertion (appended after P068 per ID sort) per the documented refresh contract; (d) Last-reviewed line replacement; iter-12 P060 fragment rotated to README-history.md under 2026-05-30 heading per P134; (e) risk-scorer pipeline assessment returned 2/25 Very Low, commit passed gate without bypass marker (neutral, not reducing). Nothing classified as lazy.

## Notes

- No same-session verification candidates.
- Verification of upstream-blocked claim per P045: confirmed wr-itil owns the P186 cell-shape contract across six SKILL.md render sites; confirmed `<!-- LIKELY-VERIFIED-CELL-SHAPE: evidence-based per P186 -->` drift-tripwire marker is the upstream cross-skill enforcement vector; confirmed windyroad/agent-plugins is upstream; confirmed downstream cannot durably edit cached SKILL.md; confirmed local whitelist option orphans on next upstream substitution; confirmed local renderer normalisation is what the current workaround already does (just not encoded as intentional).
- README inventory currency check returned `packages dir not found: packages` (adopter-tree not-applicable case, same as prior iters).
- No deferrals to next interactive session.
