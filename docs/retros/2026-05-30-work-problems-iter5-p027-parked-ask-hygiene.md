# Ask Hygiene Trail: 2026-05-30 work-problems iter 5 (P027 parked)

Context: AFK `/wr-itil:work-problems` iter 5 subprocess. Worked P027 (work-problems Step 5 exit-code rule does not handle is_error:true transient API failures, 529 Overloaded) Open to Parked. Fix lives upstream in the `wr-itil` plugin SKILL.md Step 5; latest cached `0.38.0` verified still ships the halt-on-no-staged-work branch at `skills/work-problems/SKILL.md` lines 485 to 490. The P261 amendment salvages only `is_error: true` WITH staged files; the ELSE branch at line 488 halts on `is_error: true` with nothing staged, which is exactly the 529 Overloaded shape (`total_cost_usd: 0, num_turns: 1`). Upstream `windyroad/agent-plugins#81` is OPEN (last updated 2026-05-15 per `gh issue view 81`); tracked upstream as P214 (safe-low-fix-risk per maintainer comment). Same upstream-blocked pattern as iter 3 P021 and iter 4 P022. Commit 4d94f5a.

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

Zero AskUserQuestion calls fired this iter (AFK constraint per the loop's standing rules). All decisions were framework-mediated: (a) Open to Parked transition driven by manage-problem Parked lifecycle entry; (b) external-root-cause detection passed silently because the ticket already carries a `## Reported Upstream` appendage citing #81; (c) README WSJF table row removal + Parked section insertion per the documented refresh contract; (d) Last-reviewed line replacement; (e) risk-scorer pipeline assessment returned 2/25 Very Low, reducing bypass written. Nothing classified as lazy.

## Notes

- No same-session verification candidates.
- Verification of upstream-blocked claim per P045: confirmed wr-itil owns `work-problems/SKILL.md`; confirmed windyroad/agent-plugins is upstream; confirmed downstream cannot durably edit cached SKILL.md; confirmed dispatch wrapper is per-iter transient `/tmp/wr-iter-N-dispatch.sh`; confirmed P261 salvage carve-out does NOT cover the 529 Overloaded shape.
- README inventory currency check returned `packages dir not found: packages` (adopter-tree not-applicable case).
- No deferrals to next interactive session.
