# Problem Backlog

> Last reviewed: 2026-04-26 (P019-P029 opened; pre-loop AFK setup pass captured 11 pipeline-instability and operational-gap signals from the prior 11-iteration AFK retrospective: P019 ambient-dirty-state proactivity, P020 dependency-update cadence, P021 architect-mark-reviewed strict-verdict parser, P022 architect-refresh-hash narrow scope, P023 architect-gate drift-recovery missing, P024 .claude/** Edit/Write permission denials in AFK, P025 no-em-dash.sh missing Bash-path coverage, P026 dry-aged-deps no AFK-bypass, P027 work-problems Step 5 doesn't handle is_error:true, P028 risk-scorer 30-min TTL expires mid-turn, P029 BRIEFING.md retro edits orphaned across iterations).
> Run `/wr-itil:review-problems` to refresh WSJF rankings.

## WSJF Rankings

Dev-work queue only. Verification Pending (`.verifying.md`, WSJF multiplier 0) and Parked (`.parked.md`, multiplier 0) tickets are excluded per ADR-022 and surfaced in their own sections below. Sorted WSJF descending.

| WSJF | ID | Title | Severity | Status | Effort |
|------|-----|-------|----------|--------|--------|
| 16.0 | P006 | OG share image does not track homepage copy pivots | 8 (Medium) | Known Error | S |
| 16.0 | P021 | architect-mark-reviewed strict-verdict-string parsing under-counts affirmative ISSUES FOUND verdicts as FAIL | 16 (High) | Open | S |
| 16.0 | P026 | dry-aged-deps pre-push gate has no AFK-bypass path; halts work-problems loop | 16 (High) | Open | S |
| 12.0 | P002 | Hero content extends beyond the fold | 12 (High) | Known Error | S |
| 12.0 | P019 | Claude does not proactively act on ambient dirty state during retrospective and wrap-up | 12 (Significant) | Open | S |
| 12.0 | P020 | No dependency update cadence; AFK loop halts on stale-dep gate | 12 (Significant) | Open | S |
| 12.0 | P022 | architect-refresh-hash.sh only refreshes hash on docs/decisions/* writes | 12 (Significant) | Open | S |
| 12.0 | P024 | .claude/** Edit/Write permission gate not satisfied by */Edit allow list in AFK subprocesses | 12 (Significant) | Open | S |
| 12.0 | P027 | work-problems Step 5 exit-code rule does not handle is_error:true transient API failures | 12 (Significant) | Open | S |
| 12.0 | P028 | risk-scorer 30-min TTL expired during long-running orchestrator turns | 12 (Significant) | Open | S |
| 9.0  | P010 | Source fetch blocks OpenAI and Reddit | 9 (Medium) | Known Error | M |
| 6.0  | P012 | No ship-gate on push/publish/deploy | 12 (High) | Known Error | L |
| 6.0  | P014 | Playwright helper for tool-blocked sources | 12 (High) | Known Error | L |
| 6.0  | P029 | work-problems iteration boundary leaves run-retro BRIEFING.md edits uncommitted | 12 (Significant) | Open | M |
| 4.5  | P023 | architect-gate drift detection rm's marker without offering recovery path | 9 (Moderate) | Open | M |
| 4.5  | P025 | no-em-dash.sh has zero coverage of Bash-path file writes | 9 (Moderate) | Open | M |
| 3.0  | P001 | Next.js build hangs locally | 6 (Medium) | Open | M |

## Verification Queue

Fix released, awaiting user verification. Ranked by release age, oldest first per ADR-022.

| ID | Title | Released | Fix summary | Likely verified? |
|----|-------|----------|-------------|------------------|
| P016 | Filter drops significant stories without corroboration | 2026-04-25 | Added step 4b corroboration sub-step (Google News RSS) and step 10 weak-attribution escalation to wr-newsletter SKILL.md | no (1 day) |
| P018 | Newsletter publication time pressure on Friday | 2026-04-25 | Added phase=prep, phase=finalise, phase=full to wr-newsletter SKILL.md with .prep.md state handoff per ADR 017 | no (1 day) |
| P011 | Visual artifacts shipped without render-verify | 2026-04-25 | Added render-and-verify discipline note to wr-newsletter SKILL.md step 12 and created shared `scripts/render-svg.mjs` helper that wraps `sips` for SVG-to-PNG conversion | no (1 day) |
| P009 | Content-risk inline self-scoring | 2026-04-25 | Subagent-ised content-risk gate per ADR 018: new rubric at `.claude/skills/wr-newsletter/assets/content-risk-rubric.md`, new agent at `.claude/agents/wr-content-risk-scorer.md`, SKILL.md step 14 + 14-prime invoke the agent | no (1 day) |
| P013 | No voice/tone gate on external comms | 2026-04-25 | Added voice gate to wr-newsletter SKILL.md step 15.5 (Draft the LinkedIn post) mirroring step 13's pattern; step 16 save-block layout updated to capture the LinkedIn-post voice block. Investigation Tasks 2 and 4 (PreToolUse hook for `gh`/`npm` and validation against past comms) deferred to P012 ship-gate. | no (1 day) |
| P015 | Drafter paraphrases interactive capture text | 2026-04-25 | Parts 1 + 2 released to wr-newsletter SKILL.md per new ADR 019: step 10 writes `<draft-folder>/YYYY-MM-DD.capture.md` after per-item capture; step 10-prime appends during finalise with missing-file AskUserQuestion branch; step 11 adds Capture fidelity rule (preserve load-bearing noun-phrases verbatim from Adjust text); step 17 mentions transcript path and bundled-move reminder. Part 3 (`check_32` rubric check) deferred until baseline of editions-with-transcript exists; ADR 016 amendment paired with check_32 when taken up. | no (1 day) |
| P017 | Critic rubric misses contradictions and ambiguity | 2026-04-25 | Third-wave rubric expansion: 7 new checks (32-38) added to `.claude/skills/wr-newsletter/assets/newsletter-critic-rubric.md` (31 to 38 checks); 2 mirror checks (17-18 internal consistency + referential clarity) added to `.claude/skills/wr-newsletter/assets/wardley-critic-rubric.md` (16 to 18 checks). Round-specific exit criteria updated in both files. | no (1 day) |
| P008 | Critic rubric misses external review findings | 2026-04-25 | Editorial-sim subagent released per new ADR 020: new agent at `.claude/agents/wr-newsletter-editor.md` reads persona JTBD context and emits `EDITOR_REVIEW` block with would-open / would-read-through / would-forward axes; SKILL.md step 15.25 + 15.25-prime invoke the agent between sw-critic and LinkedIn-post drafting; runs only when sw-critic returns PASS. Verification triggers on next `/wr-newsletter` run. | no (1 day) |

## Closed

Closed tickets are listed for audit but excluded from the active backlog:

- P003 (Countdown slider left-aligned)
- P004 (Slider position misleading for probability)
- P005 (Slider has no visual stop indicators)
- P007 (wr-sw-critic agent not discoverable in session)

## Notes

- **P019-P029**: opened 2026-04-26 in a pre-loop setup pass capturing 11 signals from the prior AFK 11-iteration retrospective. Three architect-gate-family tickets (P021 strict-verdict parser, P022 narrow refresh scope, P023 missing drift-recovery path) compose with each other; closing P021 unblocks P022's effective trigger surface and P023's recovery shape. Two dependency-cadence tickets (P020 no cadence, P026 no AFK-bypass) compose; closing P020 reduces P026 trigger frequency. P024 (.claude/** permission denials) blocks P025 (no-em-dash.sh Bash-path coverage gap) because the python3 workaround needed for P024 is what bypasses the em-dash hook. P028 (risk-scorer TTL) and P029 (BRIEFING hand-off commits) compose; closing P029 reduces P028 trigger frequency.
- **P006**: fix released to master in commit 754a04a with permanent shared-constants follow-up; awaiting next production deploy + LinkedIn Post Inspector cache flush + user verification. Per ADR-022 a future review may transition this ticket from Known Error to Verification Pending once the production release ships.
- **P010 and P014**: cover the same root cause (OpenAI bot protection + Reddit tool-layer block). P010 tracks the original gap; the OpenAI Google News RSS workaround landed in SKILL.md step 2 on 2026-04-25, narrowing the residual gap to Reddit. Reddit fix is captured in P014 (Playwright helper). P010 stays Known Error and may close when P014 ships. WSJF dropped 12 to 9 reflecting the post-fix scope.
- **P008, P015, P017**: form the substance-gap series. P008 ships option 2 editorial-sim subagent (`wr-newsletter-editor`) per new ADR 020 on 2026-04-25 (verifying); options 1 (rubric expansion 21-31) and 3 (content-risk subagent per ADR 018) already shipped in earlier work. P015 covers drafter-fidelity to capture transcript (Parts 1 + 2 released 2026-04-25 per ADR 019; verifying); P017 covers internal contradictions and referential ambiguity (third-wave rubric expansion 32-38 released 2026-04-25; verifying). All three driven by Tom's external editorial review surfacing categories the structural rubric cannot reach in isolation.
- **P012 and P013**: pair on the ship-gate hook surface. P012 is the broader risk-and-CI ship-gate; P013 is the voice-tone extension over external-facing text. The teaser-voice-gate part of P013 shipped 2026-04-25 to wr-newsletter SKILL.md step 15.5 (verifying); the hook part stays bundled with P012's CLI-level surface to avoid duplicate work.
- **P016 and P018**: form the Friday-pressure cluster. P016 (verification pending as of 2026-04-25) fixes filter logic that drops significant stories. P018 (verification pending as of 2026-04-25) splits the pipeline into prep + finalise phases per ADR 017 to reduce Friday concentration. Verification of P016 fires on the next `/wr-newsletter` run when an aggregator-only candidate is processed; verification of P018 fires on the first edition where prep runs mid-week and finalise ships Friday under one hour.
- **P011**: render-and-verify discipline note added to wr-newsletter SKILL.md step 12 and shared `scripts/render-svg.mjs` helper created (verifying as of 2026-04-25). Verification fires on the next visual-artifact iteration: logo rework, OG image update, or a fresh cover-image generation in step 12.
- **P002**: hero fold-fit SCSS fix landed 2026-04-25 (`min-height` 45vh to 100svh, mobile breakpoint 35vh to 100svh, added `padding-bottom: 4rem` to balance the existing top-padding so vertical centring is true, added `@media (max-height: 600px) { min-height: auto; }` short-viewport guard for WCAG 1.4.10 Reflow at 400% zoom per accessibility-lead review). Held in Known Error pending Tom's browser verification across desktop/mobile/zoom; transitions to Verification Pending once verified.
