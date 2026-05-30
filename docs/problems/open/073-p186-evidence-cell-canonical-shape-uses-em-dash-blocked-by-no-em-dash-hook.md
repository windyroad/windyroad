# Problem 073: P186 evidence-first cell canonical shape uses U+2014 separator that no-em-dash hook blocks during README render

**Status**: Open
**Reported**: 2026-05-30
**Priority**: 3 (Medium). Impact: Minor (2) x Likelihood: Likely (4)
**Origin**: internal
**Effort**: S
**WSJF**: 8 = (8 x 1) / 1
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
