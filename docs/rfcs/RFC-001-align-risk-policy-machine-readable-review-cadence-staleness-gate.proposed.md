---
status: proposed
rfc-id: align-risk-policy-machine-readable-review-cadence-staleness-gate
reported: 2026-07-15
human-oversight: unconfirmed
decision-makers: [Tom Howard]
problems: [P105]
adrs: []
jtbd: []
stories: []
---

# RFC-001: Align RISK-POLICY.md machine-readable review cadence with the shipped upstream staleness gate

**Status**: proposed
**Reported**: 2026-07-15
**Problems**: P105
**ADRs**: (none)
**JTBD**: (none)

## Summary

Encode the operator-attested quarterly review cadence into RISK-POLICY.md in the machine-readable line shape the upstream `wr-risk-scorer` commit gate now parses, so the gate honours the policy's own stated cadence (90 days) instead of falling back to its 14-day default and hard-denying every commit. That fallback deny is the loop-fatal AFK failure P105 tracks.

## Driving problem trace

- P105 (risk-score-commit-gate RISK-POLICY staleness threshold too tight and no AFK refresh path): the gate denied every `git commit` once the policy aged past a hardcoded 14 days, stalling the AFK work-problems loop. The upstream half of the fix has shipped (windyroad/agent-plugins#322, closed 2026-07-06; installed wr-risk-scorer 0.16.5+): the gate now machine-reads the policy's stated cadence and falls back to 14 days only when the cadence line is absent. The remaining local half, adding the cadence line to the policy doc in the parseable shape, is this RFC's scope.

## Scope

The installed gate (`risk-score-commit-gate.sh`, wr-risk-scorer 0.16.5+) reads two things from RISK-POLICY.md: the last-reviewed date via `Last reviewed:\*{0,2}\s*(\d{4}-\d{2}-\d{2})` (our existing `**Last reviewed:** 2026-07-12` line already matches) and the review cadence via the case-sensitive line-anchored regex `(?m)^>?\s*Reviewed\s+([A-Za-z]+)` with a lowercase cadence-word map (`quarterly` = 90 days). Our policy's `**Review cadence:** Quarterly (every 3 months)...` paragraph does not match that regex, so the gate still falls back to 14 days and the deny will recur around 2026-07-26 despite the upstream fix being installed.

The fix is a doc-only change to RISK-POLICY.md: add one machine-readable line, `> Reviewed quarterly ...`, adjacent to the existing Last-reviewed field, keeping the human-readable Review-cadence paragraph; and update that paragraph's trailing note, which still asserts the gate hardcodes 14 days and the alignment is tracked upstream (now false against the shipped gate). Verification is mechanical: run the gate's own cadence-parse logic against the edited file and confirm the resolved threshold is 90 days with the quarterly cadence recognised. The edit goes through the sanctioned unlock path: the `wr-risk-scorer:policy` validation agent returns PASS, which writes the session `policy-reviewed` marker that the `risk-policy-enforce-edit.sh` hook requires. No policy substance changes: appetite, impact levels, likelihood levels, matrix, and the quarterly cadence decision (operator-attested 2026-07-12, commit ab3d192) are all unchanged.

## Tasks

- [ ] Validate the drafted RISK-POLICY.md edit via the `wr-risk-scorer:policy` agent (PASS writes the session `policy-reviewed` marker that unlocks the edit gate)
- [ ] Add the `> Reviewed quarterly` machine-readable cadence line to RISK-POLICY.md adjacent to the Last-reviewed field
- [ ] Update the Review-cadence paragraph's stale trailing note (gate no longer hardcodes 14 days; upstream shipped)
- [ ] Verify: run the gate's cadence-parse logic against the edited file; confirm threshold resolves to 90 days / quarterly
- [ ] Transition P105 to Verification Pending with a `## Fix Released` section in the same fix commit

## Commits

(rendered from `git log --grep "Refs: RFC-001"` by `/wr-itil:manage-rfc` + `wr-itil-reconcile-rfcs`, a git-log-derived view, not stored per-commit. At capture there are no commits yet.)

## Related

- P105: `docs/problems/known-error/105-risk-policy-staleness-gate-threshold-too-tight-and-no-afk-refresh-path.md` (driving Known Error)
- windyroad/agent-plugins#322: upstream report, closed 2026-07-06 (upstream half shipped; tracked upstream as their P408)
- Upstream agent-plugins ADR-091: the machine-read cadence-line contract the shipped gate implements (upstream numbering; not a local ADR)
- RISK-POLICY.md: the file this RFC changes (quarterly cadence attested by the operator 2026-07-12, commit ab3d192)
