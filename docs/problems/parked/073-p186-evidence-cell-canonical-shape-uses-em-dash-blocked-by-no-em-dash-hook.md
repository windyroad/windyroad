# Problem 073: P186 evidence-first cell canonical shape uses U+2014 separator that no-em-dash hook blocks during README render

**Status**: Parked
**Reported**: 2026-05-30
**Priority**: 3 (Medium). Impact: Minor (2) x Likelihood: Likely (4)
**Origin**: internal
**Effort**: S
**WSJF**: 0 (parked, excluded from ranking)
**Type**: technical

## Description

P186 evidence-first cell canonical shape (the three literal forms `yes [U+2014] observed: X`, `no [U+2014] not observed`, `no [U+2014] observed regression`) uses U+2014 (em-dash) as the cell-prefix separator. The local `no-em-dash.sh` + `no-em-dash-bash.sh` hooks (P025, P057 ports) block writes containing U+2014; their whitelists cover the P063 upstream-pending marker and the capture-problem deferred-placeholder Priority/Effort lines but do NOT cover the three P186 cell prefixes.

Hit this session 2026-05-30 during the `/wr-itil:review-problems` run when writing the refreshed `docs/problems/README.md` Verification Queue table. The hook blocked twice (initial Write + a subsequent edit attempt). Workaround applied: bulk python sed substitution to convert U+2014 separators to parens / colons before re-Write (`yes [U+2014] observed: X` becomes `yes (observed: X)`, `no [U+2014] not observed` becomes `no (not observed)`, `no [U+2014] observed regression [U+2014] X` becomes `no (observed regression): X`). The substitution preserves semantic meaning but diverges from the P186 canonical wire format.

## Symptoms

- `Write` of `docs/problems/README.md` denied by PostToolUse:Bash no-em-dash hook with `BLOCKED: Em-dashes (U+2014) detected in files modified by Bash. Files: docs/problems/README.md.` (35 em-dashes flagged on first write attempt; all from P186 cells across 35 Verification Queue rows).
- Substitution to parens / colons unblocks the write but produces evidence-first cells that diverge from the P186 canonical shape rendered upstream.
- Sibling class to P030 (upstream work-problems marker), P057 (no-em-dash Edit/Write hook whitelist), P063 (cover hook_line_1 separator). Recurring em-dash collision at canonical-marker surfaces.

## Workaround

Bulk python substitution at README write time. Acceptable while in place; loses P186 canonical wire format.

## Impact Assessment

- **Who is affected**: maintainer running `/wr-itil:review-problems` on this project. Friction concentrated at the README rewrite step (Step 5).
- **Frequency**: every `/wr-itil:review-problems` run with non-empty Verification Queue (i.e. every review pass).
- **Severity**: dev-tooling friction, no visitor / reader impact. RISK-POLICY Impact Minor (2).
- **Analytics**: hit twice this session.

## Root Cause Analysis

The upstream `/wr-itil:review-problems` SKILL.md authored the P186 evidence-first cell canonical wire format using U+2014 separators (`yes [U+2014] observed: X` / `no [U+2014] not observed` / `no [U+2014] observed regression`) at the same time that local no-em-dash hooks were policing project-wide em-dash bans. The whitelist mechanism (P025 ship + P057 port) was designed for narrow contractual markers, not for high-cardinality renderer output where the canonical shape itself contains em-dashes.

### Investigation Tasks

- [ ] Decide fix shape (one or combination):
  - (a) Extend `no-em-dash.sh` + `no-em-dash-bash.sh` whitelists to cover the three P186 cell prefixes verbatim.
  - (b) Upstream P186 spec amendment to use parens consistently (`yes (observed: X)` / `no (not observed)` / `no (observed regression)`); eliminates the collision class for downstream em-dash-policing projects.
  - (c) Local renderer normalises em-dashes at write time (substitution becomes intentional, not workaround).
- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Create reproduction test (smoke test that exercises a Verification Queue row write with all three cell shapes against both no-em-dash hooks)

## Dependencies

- **Blocks**: (none)
- **Blocked by**: P057 (verifying), same no-em-dash hook surface, whitelist extension shape is the precedent
- **Composes with**: P025 (closed, original Bash-path coverage), P030 (open, work-problems marker), P057 (verifying, Edit/Write whitelist port), P060 (open, capture-adr template em-dash), P063 (known-error, cover hook_line_1)

## Related

- ADR-022 (Verification Pending status; P186 cells render in the Verification Queue section)
- ADR-026 (evidence-first grounding; the P186 canonical cell shape encodes evidence per ADR-026)
- P186 (upstream `/wr-itil:review-problems` SKILL.md, evidence-first cell canonical wire format)
- captured via `/wr-itil:capture-problem` during 2026-05-30 review-problems retro; expand at next investigation

- **Upstream report pending** — external dependency identified; invoke /wr-itil:report-upstream when ready

## Parked

- **Reason**: upstream-blocked. The P186 evidence-first cell canonical wire format (`yes [U+2014] observed: <evidence>` / `no [U+2014] not observed` / `no [U+2014] observed regression`) is authored in the upstream `wr-itil` plugin SKILL.md files at `~/.claude/plugins/cache/windyroad/wr-itil/<version>/skills/review-problems/SKILL.md` (lines 78 to 82, plus four other render sites in the same plugin: `skills/manage-problem/SKILL.md`, `skills/reconcile-readme/SKILL.md`, `skills/transition-problem/SKILL.md`, `skills/transition-problems/SKILL.md`, `skills/list-problems/SKILL.md`). This project is a downstream marketplace consumer of `@windyroad/wr-itil`. A consumer cannot edit the cached SKILL.md without losing the change on next plugin update, so the only durable fix is upstream (option b in Investigation Tasks: amend the P186 spec to use parens / colons / hyphens consistently). The local whitelist option (option a: extend `.claude/hooks/no-em-dash.sh` and `.claude/hooks/no-em-dash-bash.sh` WHITELIST_LINE entries with the three P186 cell prefixes) is a band-aid that would orphan once upstream substitutes the U+2014 separators, and propagates whitelist debt across every adopter that ships the no-em-dash hook style. Option c (local renderer normalises em-dashes at write time) is what the current workaround already does, but encoding it as intentional rather than workaround still leaves every adopter project carrying the same normalisation logic.
- **Verified persistence**: 2026-05-30 read of cached `wr-itil@0.34.0` confirms the U+2014 separators ship live across the plugin's render surfaces. `skills/review-problems/SKILL.md` lines 78 to 82 define the three canonical cell shapes with U+2014, line 111 surfaces the `yes [U+2014] observed: ...` row-first ordering rule, lines 112 to 113 carry the close-on-confirm cell update template, line 231 is the Verification Queue presentation block contract, line 235 is the row template, line 303 is the P186 evidence-first cell-shape definition. `skills/manage-problem/SKILL.md` line 672 carries the same three-cell-shape contract for the Step 7 README refresh block. All five other render sites (manage-problem Step 5 P094, transition-problem, transition-problems, reconcile-readme, list-problems) reference the same cell shape by drift-tripwire marker (`<!-- LIKELY-VERIFIED-CELL-SHAPE: evidence-based per P186 -->`). The 14-day age-based heuristic that P186 superseded is preserved separately via the Released column. Drift here re-opens P186 by upstream contract.
- **Upstream issue status**: no issue filed yet. `gh issue list -R windyroad/agent-plugins --search "P186 evidence-first cell em-dash"` and similar queries on 2026-05-30 returned empty. Ticket body's standing "Upstream report pending" note remains the current truth. AFK iter-13 discipline matches iters 3 to 12: park-only, defer the `/wr-itil:report-upstream` invocation to a batched filing pass at a session boundary rather than firing it in-loop.
- **Un-park trigger**: a new `wr-itil` plugin release lands in `~/.claude/plugins/cache/windyroad/wr-itil/` whose `skills/review-problems/SKILL.md`, `skills/manage-problem/SKILL.md`, `skills/reconcile-readme/SKILL.md`, `skills/transition-problem/SKILL.md`, `skills/transition-problems/SKILL.md`, and `skills/list-problems/SKILL.md` substitute the U+2014 separators in the three canonical P186 cells with commas, colons, parentheses, or ASCII hyphens. Verify by re-reading the cached files in the new version, then running `/wr-itil:review-problems` in this project; the README Verification Queue write should succeed without the no-em-dash hook deny and without bulk-python substitution. Close P073 once a `review-problems` invocation lands a refreshed README.md on the first Write under the upgraded spec.
- **Local impact while parked**: the existing Workaround (bulk python substitution at README write time, converting `yes [U+2014] observed: X` to `yes (observed: X)`, `no [U+2014] not observed` to `no (not observed)`, `no [U+2014] observed regression [U+2014] X` to `no (observed regression): X`) remains the operating contract. Cost per `/wr-itil:review-problems` run is around one substitution pass through the README cell strings, not a release-path or pipeline blocker. The substitution diverges from the P186 canonical wire format but preserves semantic meaning; reader-facing column intent (yes / no / regression with evidence citation) is intact.
- **Composes with**: P021 (parked 2026-05-30, upstream `windyroad/agent-plugins` `wr-architect` plugin hook); P022 (parked 2026-05-30, upstream `wr-architect` plugin hook, sibling parent plugin); P025 (closed 2026-05-30, local no-em-dash hook origin, sibling family); P027 (parked 2026-05-30, upstream `wr-itil` plugin SKILL.md); P030 (open, work-problems SKILL.md long-dash whitelist removal, sibling family); P033 (parked 2026-05-30, upstream `wr-itil` plugin SKILL.md); P042 (parked 2026-05-30, upstream `wr-jtbd` plugin hook); P047 (parked 2026-05-30, upstream `wr-risk-scorer` plugin SKILL.md); P049 (parked 2026-05-30, upstream `wr-itil` plugin script); P057 (verifying, local no-em-dash hook Edit/Write surface whitelist port, sibling family); P060 (parked 2026-05-30, upstream `wr-architect` plugin SKILL.md template); P063 (closed 2026-05-30, newsletter cover `hook_line_1` budget). All nine 2026-05-30-parked share the marketplace-consumer-cannot-edit-cached-plugin pattern.
- **Date parked**: 2026-05-30
