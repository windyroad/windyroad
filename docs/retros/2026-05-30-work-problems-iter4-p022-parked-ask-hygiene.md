# Ask Hygiene Trail: 2026-05-30 work-problems iter 4 (P022 parked)

Context: AFK `/wr-itil:work-problems` iter 4 subprocess. Worked P022 (architect-refresh-hash.sh only refreshes hash on docs/decisions/* writes, leaving cross-session drift on other gated paths) Open to Parked. Fix lives upstream in the `wr-architect` plugin hook; latest cached `0.12.2` verified still ships the `docs/decisions/*`-only matcher at `architect-refresh-hash.sh` lines 20 to 26. Upstream `windyroad/agent-plugins#79` is OPEN (last updated 2026-05-15 per `gh issue view 79`); no labels applied. Same upstream-blocked pattern as iter 3 P021. Commit 02d882f.

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

Zero AskUserQuestion calls fired this iter (AFK constraint per P135 and ADR-044). All decisions were framework-mediated: (a) Open to Parked transition driven by manage-problem SKILL.md Parked lifecycle entry (upstream-blocked reason, marketplace consumer cannot edit cached hook); (b) external-root-cause detection passed silently because the ticket already carries a `## Reported Upstream` appendage citing #79; (c) README WSJF table removal + Parked section insertion (between P021 same-date and P031 earlier-date) per P062; (d) Last-reviewed line replacement + prior-fragment rotation to `README-history.md` per P134; (e) risk-scorer pipeline assessment via wr-risk-scorer:pipeline subagent before commit per Step 11 commit gate (returned 2/25 Very Low, within appetite). Nothing classified as lazy.

## Notes

- No same-session verification candidates (this iter only produced a `.parked.md` transition, not a `.verifying.md`).
- Verification of upstream-blocked claim per P045 discipline: confirmed wr-architect plugin owns `architect-refresh-hash.sh`; confirmed windyroad/agent-plugins is the upstream home; confirmed downstream cannot durably edit cached hook. Same chain as iter 3 P021.
- No deferrals to next interactive session from this iter.
