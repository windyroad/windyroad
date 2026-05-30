# Ask Hygiene Trail: 2026-05-30 work-problem P062 AFK iter 6

Per ADR-044 / P135 Phase 5. AFK subprocess invocation per ADR-032 subprocess-boundary variant. Consumed by `packages/retrospective/scripts/check-ask-hygiene.sh` for cross-session trend.

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|

(No `AskUserQuestion` calls issued this iter. AFK `/wr-itil:work-problems` subprocess per ADR-044 forbids mid-loop AskUserQuestion per P135 / ADR-013 Rule 6 AFK fallback.)

**Lazy count: 0**
**Direction count: 0**
**Deviation-approval count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

Iter 6 selected P062 (newsletter persona-config edition-count rule globs sibling files and undercounts editions). Ticket Description already prescribed the corrected rule (max of frontmatter `edition:` across published + drafts), so no new direction-setting was required. Architect surfaced a bonus finding (SKILL.md step 11 carried the same bug, not just the two persona configs), which extended the fix scope without requiring user input. That broader-scope ratification was a deviation-internal-decision, not a deviation-approval surface. Architect PASS, JTBD PASS, voice-tone N/A (skill prose), risk-scorer commit=2 push=2 release=2 (source fix) plus commit=1 push=1 release=1 (transition) both reducing-bypass. Fix shipped at commit `de6c165`; transition shipped at commit `a54bc56`; ticket transitioned Open to Known Error (not Verifying, because K to V requires shipped release per ADR-022 and AFK forbids release); README WSJF row Status updated plus line-3 fragment prepended in the transition commit per P094/P062.
