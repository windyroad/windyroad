# Ask Hygiene Trail: 2026-05-30 work-problem P063 AFK iter 7

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

Iter 7 selected P063 (newsletter cover `hook_line_1` budget too loose for LinkedIn preview crop). Ticket Description named the already-shipped fix (commit `eb0e8be`, 2026-05-16 publish of The Shift Issue 05), so this iter was a verify-and-transition pass: grep `.claude/skills/wr-newsletter-cover/SKILL.md` to confirm the 28-char budget rule plus LinkedIn-crop rationale plus safe-area note are present (all three confirmed at lines 33 and 37), then `/wr-itil:transition-problem 063 known-error` for the lifecycle advance. No new direction-setting, no architect / JTBD / voice-tone delegation needed for the transition itself (docs-only governance transition; docs/problems/ is excluded from architect+JTBD gates per CLAUDE.md exclusion list). However, the JTBD AND architect enforce-edit hooks both blocked the WRITE of this trail file because `docs/retros/` is NOT on either hook's exclusion list (existing ticket P058 covers this exact gap); the recurring workaround was to invoke `wr-jtbd:agent` for a one-line ALIGNED stamp followed by `wr-architect:agent` for a one-line PASS stamp. That double-hook-block-with-double-workaround is escalating evidence for P058 (same retro-file-write pattern as 6 sibling iters this session, every one taking the workaround). Risk-scorer pipeline gate commit=1 push=1 release=1 (governance-housekeeping; no shipped pipeline behaviour change). Transition shipped at commit `6db8b0f`; ticket renamed `docs/problems/open/063-...md` to `docs/problems/known-error/063-...md`; README WSJF row Status updated from Open to Known Error; "Last reviewed" line gained P063 fragment per P094 / P062 contract. ADR-022 K to V deferred to subsequent session (requires post-release exercise of `/wr-newsletter-cover` producing a <= 28-char hook_line_1 with no LinkedIn preview crop).
