# Problem Backlog

> Last reviewed: 2026-04-25 (P017 verification pending - third-wave rubric expansion released; 7 new checks (32-38) added to newsletter-critic-rubric.md and 2 mirror checks (17-18) added to wardley-critic-rubric.md; P002 SCSS fold-fit fix landed - hero `min-height` raised to `100svh` with balancing `padding-bottom`, short-viewport zoom guard added; awaiting browser verification before transition to Verification Pending; P010 OpenAI arm landed - tier-1 OpenAI swapped to Google News RSS in wr-newsletter SKILL.md step 2 with Reddit gap annotated against P014; P011 verification pending - render-and-verify discipline note added to wr-newsletter SKILL.md step 12 and shared `scripts/render-svg.mjs` helper created; P018 verification pending - prep+finalise phase split released in wr-newsletter SKILL.md per ADR 017; P016 verification pending - filter corroboration fix released in step 4b and step 10; P009 verification pending - content-risk gate subagent-ised per ADR 018 with new rubric and wr-content-risk-scorer agent; P013 verification pending - voice gate added to wr-newsletter SKILL.md step 15.5 (LinkedIn post), Tasks 2+4 deferred to P012 ship-gate hook; P015 verification pending - capture transcript artifact released in step 10 + step 11 capture-fidelity drafter rule per new ADR 019, Part 3 check_32 rubric check deferred until baseline of editions-with-transcript exists).
> Run `/wr-itil:review-problems` to refresh WSJF rankings.

## WSJF Rankings

Dev-work queue only. Verification Pending (`.verifying.md`, WSJF multiplier 0) and Parked (`.parked.md`, multiplier 0) tickets are excluded per ADR-022 and surfaced in their own sections below. Sorted WSJF descending.

| WSJF | ID | Title | Severity | Status | Effort |
|------|-----|-------|----------|--------|--------|
| 16.0 | P006 | OG share image does not track homepage copy pivots | 8 (Medium) | Known Error | S |
| 12.0 | P002 | Hero content extends beyond the fold | 12 (High) | Known Error | S |
| 9.0  | P010 | Source fetch blocks OpenAI and Reddit | 9 (Medium) | Known Error | M |
| 6.0  | P008 | Critic rubric misses external review findings | 12 (High) | Known Error | L |
| 6.0  | P012 | No ship-gate on push/publish/deploy | 12 (High) | Known Error | L |
| 6.0  | P014 | Playwright helper for tool-blocked sources | 12 (High) | Known Error | L |
| 3.0  | P001 | Next.js build hangs locally | 6 (Medium) | Open | M |

## Verification Queue

Fix released, awaiting user verification. Ranked by release age, oldest first per ADR-022.

| ID | Title | Released | Fix summary | Likely verified? |
|----|-------|----------|-------------|------------------|
| P016 | Filter drops significant stories without corroboration | 2026-04-25 | Added step 4b corroboration sub-step (Google News RSS) and step 10 weak-attribution escalation to wr-newsletter SKILL.md | no (0 days) |
| P018 | Newsletter publication time pressure on Friday | 2026-04-25 | Added phase=prep, phase=finalise, phase=full to wr-newsletter SKILL.md with .prep.md state handoff per ADR 017 | no (0 days) |
| P011 | Visual artifacts shipped without render-verify | 2026-04-25 (this commit) | Added render-and-verify discipline note to wr-newsletter SKILL.md step 12 and created shared `scripts/render-svg.mjs` helper that wraps `sips` for SVG-to-PNG conversion | no (0 days) |
| P009 | Content-risk inline self-scoring | 2026-04-25 (this commit) | Subagent-ised content-risk gate per ADR 018: new rubric at `.claude/skills/wr-newsletter/assets/content-risk-rubric.md`, new agent at `.claude/agents/wr-content-risk-scorer.md`, SKILL.md step 14 + 14-prime invoke the agent | no (0 days) |
| P013 | No voice/tone gate on external comms | 2026-04-25 (this commit) | Added voice gate to wr-newsletter SKILL.md step 15.5 (Draft the LinkedIn post) mirroring step 13's pattern; step 16 save-block layout updated to capture the LinkedIn-post voice block. Investigation Tasks 2 and 4 (PreToolUse hook for `gh`/`npm` and validation against past comms) deferred to P012 ship-gate. | no (0 days) |
| P015 | Drafter paraphrases interactive capture text | 2026-04-25 (this commit) | Parts 1 + 2 released to wr-newsletter SKILL.md per new ADR 019: step 10 writes `<draft-folder>/YYYY-MM-DD.capture.md` after per-item capture; step 10-prime appends during finalise with missing-file AskUserQuestion branch; step 11 adds Capture fidelity rule (preserve load-bearing noun-phrases verbatim from Adjust text); step 17 mentions transcript path and bundled-move reminder. Part 3 (`check_32` rubric check) deferred until baseline of editions-with-transcript exists; ADR 016 amendment paired with check_32 when taken up. | no (0 days) |
| P017 | Critic rubric misses contradictions and ambiguity | 2026-04-25 (this commit) | Third-wave rubric expansion: 7 new checks (32-38) added to `.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md` (31 to 38 checks); 2 mirror checks (17-18 internal consistency + referential clarity) added to `.claude/skills/wr-newsletter/assets/wardley-critic-rubric.md` (16 to 18 checks). Round-specific exit criteria updated in both files. | no (0 days) |

## Closed

Closed tickets are listed for audit but excluded from the active backlog:

- P003 (Countdown slider left-aligned)
- P004 (Slider position misleading for probability)
- P005 (Slider has no visual stop indicators)
- P007 (wr-sw-critic agent not discoverable in session)

## Notes

- **P006**: fix released to master in commit 754a04a with permanent shared-constants follow-up; awaiting next production deploy + LinkedIn Post Inspector cache flush + user verification. Per ADR-022 a future review may transition this ticket from Known Error to Verification Pending once the production release ships.
- **P010 and P014**: cover the same root cause (OpenAI bot protection + Reddit tool-layer block). P010 tracks the original gap; the OpenAI Google News RSS workaround landed in SKILL.md step 2 on 2026-04-25, narrowing the residual gap to Reddit. Reddit fix is captured in P014 (Playwright helper). P010 stays Known Error and may close when P014 ships. WSJF dropped 12 to 9 reflecting the post-fix scope.
- **P008, P015, P017**: form the substance-gap series. P008 covers rubric expansion (first-wave 1-25 and second-wave 26-31 already shipped); P015 covers drafter-fidelity to capture transcript (Parts 1 + 2 released 2026-04-25 per ADR 019; verifying); P017 covers internal contradictions and referential ambiguity (third-wave rubric expansion 32-38 released 2026-04-25; verifying). All three driven by Tom's external editorial review surfacing categories the structural rubric cannot reach in isolation.
- **P012 and P013**: pair on the ship-gate hook surface. P012 is the broader risk-and-CI ship-gate; P013 is the voice-tone extension over external-facing text. The teaser-voice-gate part of P013 shipped 2026-04-25 to wr-newsletter SKILL.md step 15.5 (verifying); the hook part stays bundled with P012's CLI-level surface to avoid duplicate work.
- **P016 and P018**: form the Friday-pressure cluster. P016 (verification pending as of 2026-04-25) fixes filter logic that drops significant stories. P018 (verification pending as of 2026-04-25) splits the pipeline into prep + finalise phases per ADR 017 to reduce Friday concentration. Verification of P016 fires on the next `/wr-newsletter` run when an aggregator-only candidate is processed; verification of P018 fires on the first edition where prep runs mid-week and finalise ships Friday under one hour.
- **P011**: render-and-verify discipline note added to wr-newsletter SKILL.md step 12 and shared `scripts/render-svg.mjs` helper created (verifying as of 2026-04-25). Verification fires on the next visual-artifact iteration: logo rework, OG image update, or a fresh cover-image generation in step 12.
- **P002**: hero fold-fit SCSS fix landed 2026-04-25 (`min-height` 45vh -> 100svh, mobile breakpoint 35vh -> 100svh, added `padding-bottom: 4rem` to balance the existing top-padding so vertical centring is true, added `@media (max-height: 600px) { min-height: auto; }` short-viewport guard for WCAG 1.4.10 Reflow at 400% zoom per accessibility-lead review). Held in Known Error pending Tom's browser verification across desktop/mobile/zoom; transitions to Verification Pending once verified.
