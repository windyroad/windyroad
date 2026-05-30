# Ask Hygiene Trail: 2026-05-31 work-problems iter 15 (P046 parked)

Context: AFK `/wr-itil:work-problems` iter 15 subprocess. Worked P046 (Risk scorer treats changesets as queued when underlying commits are already on origin) Open to Parked. Fix lives upstream in `wr-risk-scorer` plugin (`agents/pipeline.md` release-layer scoring rubric or `skills/assess-release/SKILL.md` step 4 prompt-build); cached `0.11.2` verified still ships the bug. Upstream `windyroad/agent-plugins#121` OPEN. Routine third `wr-risk-scorer` plugin surface (after P028 verifying upstream-shipped v0.9.0; P047 parked iter 8). Commit `ce3f26d`.

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

Zero AskUserQuestion calls fired this iter (AFK constraint per the loop's standing rules). All decisions were framework-mediated: (a) Open to Parked transition driven by manage-problem Parked lifecycle entry; (b) Upstream-blocked classification driven by P045 placement-authority check + ticket-body recorded direction ("Upstream placement confirmed 2026-05-13", pre-park ticket line 98); (c) README WSJF table row removal + Parked section insertion (appended after P042 / before P047 per ID sort) per the documented refresh contract; (d) Last-reviewed line replacement; iter-14 P029 fragment rotated to README-history.md under new 2026-05-31 heading per P134; (e) risk-scorer pipeline assessment returned 2/25 Very Low, commit passed gate without bypass marker. Nothing classified as lazy.

## Notes

- No same-session verification candidates.
- Verification of upstream-blocked claim per P045: confirmed `wr-risk-scorer` plugin owns the release-layer scoring rubric (`agents/pipeline.md`) AND the assess-release prompt-build (`skills/assess-release/SKILL.md` step 4); confirmed `windyroad/agent-plugins` is upstream; confirmed downstream cannot durably edit cached plugin without losing the change on next plugin update; confirmed no local-codifiable surface (Option 2 caller-side defensive wrapper is itself upstream prose in `wr-itil` orchestrator SKILL.md files); confirmed upstream issue `#121` is still OPEN (`gh issue view 121` returned state=OPEN, last updated 2026-05-15).
- One pipeline-instability signal observed (em-dash hook blocked initial Edit of the `## Parked` section content because the prose contained U+2014 separators in a few inline-list locations; rewrote without em-dashes on second attempt). Same shape as iters 12 (P060) + 13 (P073) which are themselves parked tickets for the upstream root cause; deduplicates against those existing tickets rather than generating a new one.
- README inventory currency check returned `packages dir not found: packages` (adopter-tree not-applicable case, same as prior iters).
- Cheap-layer context measurement (Step 2c) ran. Bucket totals: hooks=14402, skills=110533, decisions=283436, problems=606419, jtbd=23200, project-claude-md=7530, memory=369517; briefing not-measured (source-absent). THRESHOLD=10240. Prior snapshot `docs/retros/2026-05-13-context-analysis.md` is 18 days old (>14d) AND deltas exceed +20% in three buckets (decisions +21.6%, problems +40.5%, memory +77.3%); deep analysis recommended via `/wr-retrospective:analyze-context`.
- No deferrals to next interactive session.
