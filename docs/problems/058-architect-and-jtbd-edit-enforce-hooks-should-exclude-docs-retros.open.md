# Problem 058: architect-enforce-edit + jtbd-enforce-edit hooks should add docs/retros/ to the exclusion list

**Status**: Open
**Reported**: 2026-05-13
**Priority**: 3 (Medium). Impact: 3 x Likelihood: 1 (deferred, re-rate at next /wr-itil:review-problems)
**Effort**: S (deferred, re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

The architect + JTBD edit-enforce hooks (`packages/architect/hooks/architect-enforce-edit.sh` + `packages/jtbd/hooks/jtbd-enforce-edit.sh` in the upstream agent-plugins repo) fire gate delegations on routine writes to `docs/retros/*.md` ask-hygiene trail files. The sibling exclusion paths already cover `docs/problems/`, `docs/briefing/`, `docs/jtbd/`, `docs/PRODUCT_DISCOVERY.md`, `docs/VOICE-AND-TONE.md`, `docs/STYLE-GUIDE.md`, `RISK-POLICY.md`, `.risk-reports/`, `.changeset/`, memory files, and plan files. Retro trails fit the same routine-output pattern as the rest of the docs/-tolerance exclusions; per-iter gate cost is paid for no governance benefit because retro trails are mechanical persistence artifacts.

Surfaced during 2026-05-12 AFK `/wr-itil:work-problems` iter 3 (single-character em-dash substitution in `docs/retros/2026-05-12-afk-iter-3-p050-ask-hygiene.md` triggered two gate round-trips, approximately 45 seconds wall-clock). Recurred in iter 4 + iter 6 with identical patterns.

User direction recorded 2026-05-13 (AskUserQuestion batch-1 answer 2 of 4): "Add docs/retros/ to exclusion list".

Cross-skill: the hooks live in the upstream agent-plugins repo at `~/.claude/plugins/marketplaces/windyroad/packages/{architect,jtbd}/hooks/`. Placement is upstream; this ticket likely needs to be reported as an upstream issue rather than fixed in this project. Run `/wr-itil:report-upstream` against this ticket to file the upstream report.

## Symptoms

- Every iter that writes a `docs/retros/<date>-*.md` trail pays the architect-enforce-edit + jtbd-enforce-edit gate delegation cost (subagent invocations, marker hash refresh).
- Routine ask-hygiene trail writes (which carry no architectural or persona-level decisions) trigger the same gate flow as edits to source code, hook scripts, ADR proposals.
- Approximately 45 seconds of wall-clock per retro write across iter 3 + iter 4 + iter 6 of the 2026-05-12 AFK loop.

## Workaround

None inline. Per-iter gate cost is the workaround until the exclusion lands upstream.

## Impact Assessment

- **Who is affected**: every iter subprocess that calls `/wr-retrospective:run-retro` (which is every AFK work-problems iter per the P086 retro-on-exit contract).
- **Frequency**: at least once per iter (the retro trail write), plus any BRIEFING.md retro updates.
- **Severity**: workflow friction; not runtime; recurring per-iter time cost in subprocess wall-clock.
- **Analytics**: 3 observed gate round-trips for retro writes in one AFK loop (iter 3, iter 4, iter 6).

## Root Cause Analysis

### Root Cause

The architect-enforce-edit + jtbd-enforce-edit hooks maintain an exclusion list for routine docs/-class artifacts. The exclusion list was last extended in 2026-05-02 (for docs/PRODUCT_DISCOVERY.md, docs/VOICE-AND-TONE.md, docs/STYLE-GUIDE.md). Retro trail files (`docs/retros/<date>-*.md`) match the same exclusion criteria (mechanical persistence artifacts, no architectural decision content) but were not added.

### Fix Strategy

1. Verify the canonical exclusion-list location in the upstream agent-plugins repo (likely an env var or hardcoded array inside the hook scripts).
2. Add `docs/retros/` to the exclusion list alongside the existing entries.
3. Add a bats test covering: (a) writes to `docs/retros/*.md` bypass the gate; (b) writes to non-excluded paths still trigger the gate.
4. Report upstream via `/wr-itil:report-upstream`; await landed change before re-running an AFK loop without the friction.

### Investigation Tasks

- [ ] Locate the exclusion-list source in `packages/architect/hooks/architect-enforce-edit.sh` + `packages/jtbd/hooks/jtbd-enforce-edit.sh` in the upstream agent-plugins repo.
- [ ] Verify the change shape (single-line addition to an array, or extension of a regex pattern).
- [ ] Invoke `/wr-itil:report-upstream` against this ticket once verified.
- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems.

## Dependencies

- **Blocks**: (none directly; chronic friction)
- **Blocked by**: upstream agent-plugins issue landing the exclusion-list extension.
- **Composes with**: P057 (em-dash hook port to Edit-tool surface, sibling hook-protocol surface).

## Related

- 2026-05-12 AFK iter 3 retro: `docs/retros/2026-05-12-afk-iter-3-p050-ask-hygiene.md` (iter 3 silent-framework observation surface; first surface).
- 2026-05-12 AFK iter 4 retro: silent-framework observation 1 (45-second gate round-trip on em-dash substitution).
- 2026-05-12 AFK iter 6 retro: same pattern.

(captured via inline-Write during 2026-05-12 AFK work-problems loop wrap-up; user-directed via AskUserQuestion batch-1 "Add docs/retros/ to exclusion list"; placement-pending verification before propagating to upstream report; expand at next investigation)

(Upstream report pending: external dependency identified, invoke /wr-itil:report-upstream when ready.)
