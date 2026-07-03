# Problem 088: architect edit-gate session-ID mismatch under AFK subprocess forces manual marker reconciliation

**Status**: Open
**Reported**: 2026-06-14
**Priority**: 6 (Medium). Impact: Minor (2) x Likelihood: Possible (3) (re-rated 2026-06-15)
**Origin**: internal
**Effort**: M
**WSJF**: 3 = (6 x 1) / 2
**JTBD**: JTBD-006
**Persona**: plugin-developer

## Description

architect edit-gate session-ID mismatch under AFK subprocess: PostToolUse:Agent writes the architect-reviewed marker under the architect subagent's observed session_id, but the main-iter Edit PreToolUse hook reads a different runtime session_id and denies the ADR edit with "No architect review marker found for this session", forcing manual candidate-SID marker reconciliation to proceed. This is the P260/ADR-050 last-writer-wins runtime-sid race, on the architect gate (packages/architect/hooks/architect-enforce-edit.sh + lib/architect-gate.sh), which has NOT adopted the ADR-050 Option C candidate-SID marker-write mitigation that the itil create-gate uses. Observed 2026-06-14 in a /wr-itil:work-problems AFK iter working P071: the architect review genuinely ran (COMPLIANT verdict) and its PostToolUse:Agent hook wrote /tmp/architect-reviewed-01e6a59b... but the main-iter Edit hook read session e27610eb and denied; had to touch /tmp/architect-reviewed-<sid> across candidate runtime-sid markers (mirroring ADR-050 Option C) to land two ADR status flips. Fix path: port the ADR-050 Option C candidate-SID marker-write (or a subprocess-return marker slide via lib/gate-helpers.sh::slide_marker_on_subprocess_return) into the architect gate's PostToolUse:Agent marker hook so AFK-subprocess ADR edits do not require manual marker reconciliation.

## Symptoms

(deferred to investigation)

## Workaround

Manually write `/tmp/architect-reviewed-<sid>` for each recent candidate runtime-sid (enumerate via `/tmp/itil-runtime-sid-tomhoward-*.current`), without a `.hash` sibling so the gate's no-hash allow path is taken and the single reviewed multi-file change does not trip inter-edit drift. The architect review must genuinely have run first; the marker only records a true review fact under the SID the Edit hook actually reads.

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: (deferred to investigation)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Investigate root cause
- [ ] Create reproduction test

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P260 / ADR-050 (the itil create-gate sibling of this same last-writer-wins runtime-sid race; the candidate-SID marker-write mitigation lives there and should be ported here). P023 (architect-gate drift-detection removes marker without recovery path; a different failure mode on the same gate).

## Related

- **Reported upstream**: https://github.com/windyroad/agent-plugins/issues/317 (2026-07-03)

- Captured via `/wr-itil:capture-problem` on 2026-06-14 during a `/wr-itil:work-problems` AFK iter working P071 (ADR-033 + ADR-035 status flips).
- Title-only duplicate-check matches surfaced (none exact, retain for review-time merge consideration): P023 (architect-gate drift-detection rms marker without recovery), P021/P022 (architect mark/refresh hash surfaces), P085 (external-comms-gate marker hash invalidated by commit-body changes).
- The fix should mirror `packages/itil/hooks/lib/create-gate.sh` plus the ADR-050 Option C candidate-set marker write (`get_candidate_session_ids | mark_step2_complete_candidates`) at the architect gate's marker-writing PostToolUse:Agent surface.

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/317
- **Reported**: 2026-07-03
- **Template used**: structured default (problem-shaped)
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes
