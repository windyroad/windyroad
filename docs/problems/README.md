# Problem Backlog

> Last reviewed: 2026-04-25 (P016 verification pending - filter corroboration fix released in wr-newsletter SKILL.md step 4b and step 10).
> Run `/wr-itil:review-problems` to refresh WSJF rankings.

## WSJF Rankings

Dev-work queue only. Verification Pending (`.verifying.md`, WSJF multiplier 0) and Parked (`.parked.md`, multiplier 0) tickets are excluded per ADR-022 and surfaced in their own sections below. Sorted WSJF descending.

| WSJF | ID | Title | Severity | Status | Effort |
|------|-----|-------|----------|--------|--------|
| 16.0 | P006 | OG share image does not track homepage copy pivots | 8 (Medium) | Known Error | S |
| 16.0 | P018 | Newsletter publication time pressure on Friday | 16 (High) | Known Error | M |
| 12.0 | P002 | Hero content extends beyond the fold | 12 (High) | Open | S |
| 12.0 | P010 | Source fetch blocks OpenAI and Reddit | 12 (High) | Known Error | M |
| 12.0 | P011 | Visual artifacts shipped without render-verify | 6 (Medium) | Known Error | S |
| 9.0  | P009 | Content-risk inline self-scoring | 9 (Medium) | Known Error | M |
| 9.0  | P013 | No voice/tone gate on external comms | 9 (Medium) | Known Error | M |
| 8.0  | P015 | Drafter paraphrases interactive capture text | 16 (High) | Known Error | L |
| 8.0  | P017 | Critic rubric misses contradictions and ambiguity | 16 (High) | Known Error | L |
| 6.0  | P008 | Critic rubric misses external review findings | 12 (High) | Known Error | L |
| 6.0  | P012 | No ship-gate on push/publish/deploy | 12 (High) | Known Error | L |
| 6.0  | P014 | Playwright helper for tool-blocked sources | 12 (High) | Known Error | L |
| 3.0  | P001 | Next.js build hangs locally | 6 (Medium) | Open | M |

## Verification Queue

Fix released, awaiting user verification. Ranked by release age, oldest first per ADR-022.

| ID | Title | Released | Fix summary | Likely verified? |
|----|-------|----------|-------------|------------------|
| P016 | Filter drops significant stories without corroboration | 2026-04-25 (this commit) | Added step 4b corroboration sub-step (Google News RSS) and step 10 weak-attribution escalation to wr-newsletter SKILL.md | no (0 days) |

## Closed

Closed tickets are listed for audit but excluded from the active backlog:

- P003 (Countdown slider left-aligned)
- P004 (Slider position misleading for probability)
- P005 (Slider has no visual stop indicators)
- P007 (wr-sw-critic agent not discoverable in session)

## Notes

- **P006**: fix released to master in commit 754a04a with permanent shared-constants follow-up; awaiting next production deploy + LinkedIn Post Inspector cache flush + user verification. Per ADR-022 a future review may transition this ticket from Known Error to Verification Pending once the production release ships.
- **P010 and P014**: cover the same root cause (OpenAI bot protection + Reddit tool-layer block). P010 tracks the original gap with workarounds applied; P014 captures the Playwright implementation work. P010 may close when P014 ships.
- **P008, P015, P017**: form the substance-gap series. P008 covers rubric expansion (already shipped to 31 checks); P015 covers drafter-fidelity to capture transcript; P017 covers internal contradictions and referential ambiguity. All three driven by Tom's external editorial review surfacing categories the structural rubric cannot reach in isolation.
- **P012 and P013**: pair on the ship-gate hook surface. P012 is the broader risk-and-CI ship-gate; P013 is the voice-tone extension over external-facing text.
- **P016 and P018**: form the Friday-pressure cluster. P016 (verification pending as of 2026-04-25) fixes filter logic that drops significant stories; P018 splits the pipeline into prep + finalise phases to reduce Friday concentration. Verification of P016 fires on the next `/wr-newsletter` run when an aggregator-only candidate is processed.
