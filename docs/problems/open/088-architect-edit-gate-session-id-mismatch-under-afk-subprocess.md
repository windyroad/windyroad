# Problem 088: architect edit-gate session-ID mismatch under AFK subprocess forces manual marker reconciliation

**Status**: Open
**Reported**: 2026-06-14
**Priority**: 6 (Medium). Impact: Minor (2) x Likelihood: Possible (3) (re-rated 2026-06-15)
**Origin**: internal
**Effort**: M
**WSJF**: 3.0 = (6 x 1.0) / 2

## Description

architect edit-gate session-ID mismatch under AFK subprocess: PostToolUse:Agent writes the architect-reviewed marker under the architect subagent's observed session_id, but the main-iter Edit PreToolUse hook reads a different runtime session_id and denies the ADR edit with "No architect review marker found for this session", forcing manual candidate-SID marker reconciliation to proceed. This is the P260/ADR-050 last-writer-wins runtime-sid race, on the architect gate (packages/architect/hooks/architect-enforce-edit.sh + lib/architect-gate.sh), which has NOT adopted the ADR-050 Option C candidate-SID marker-write mitigation that the itil create-gate uses. Observed 2026-06-14 in a /wr-itil:work-problems AFK iter working P071: the architect review genuinely ran (COMPLIANT verdict) and its PostToolUse:Agent hook wrote /tmp/architect-reviewed-01e6a59b... but the main-iter Edit hook read session e27610eb and denied; had to touch /tmp/architect-reviewed-<sid> across candidate runtime-sid markers (mirroring ADR-050 Option C) to land two ADR status flips. Fix path: port the ADR-050 Option C candidate-SID marker-write (or a subprocess-return marker slide via lib/gate-helpers.sh::slide_marker_on_subprocess_return) into the architect gate's PostToolUse:Agent marker hook so AFK-subprocess ADR edits do not require manual marker reconciliation.

## Symptoms

- The Edit is denied with "No architect review marker found for this session" after the architect genuinely ran and returned a verdict.
- **The hook's own documented recovery instruction resolves to the wrong session (observed 2026-08-08, main-turn AFK iteration on P118, no subprocess involved).** The denial message now carries a P400 note ending: "assert the marker manually: `touch /tmp/architect-reviewed-$SID && rm -f /tmp/architect-reviewed-$SID.hash` (SID = newest `architect-plan-reviewed-*` / `architect-announced-*` basename)". Following that literally picked `32c3dce3-c247-4e65-945e-44aff031b550`, the newest announced marker on the machine, which belonged to a different session; the gate re-denied unchanged. The session's actual ID was `1df8e13d-c15c-4377-8cfc-4def452aeea3`, and asserting the marker under that cleared the gate on the next attempt. The sibling jtbd gate had written its own markers under the correct ID (`/tmp/jtbd-reviewed-1df8e13d-...` plus a `.hash`), so the correct ID was recoverable only by inspecting another plugin's markers.
- Two things this sharpens about the ticket's existing framing. The mismatch is not confined to the AFK-subprocess case in the Description: this occurrence was a main-turn session with no subprocess. And "newest marker on the machine" is not a safe proxy for "this session" on a machine that runs concurrent sessions, so the recovery instruction inherits the same last-writer-wins defect the ADR-050 Option C candidate-SID write exists to fix.

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

**Third witness, 2026-08-09 (P124 iteration).** The recovery instruction picked another session's UUID again, on the same string and by the same mechanism the 2026-08-08 witness above records. Two things worth carrying forward. First, the P124 investigation found that the wrong-SID instruction and the P400 SendMessage note live in the *same* deny string, `wr-architect/0.20.0/hooks/lib/architect-gate.sh:64`, so a single upstream change can fix both and the two tickets should be filed together or in one pull request. Second, P124's own recurrence evidence from 2026-08-05 and 2026-08-08 was filed against verdict-formatting, and cannot have been: the installed 0.20.0 writes the marker on an unparseable verdict. Those blocks were this ticket. P124 now records the re-attribution and the corrected reading, that a block after a genuine PASS on 0.20.0 means the marker went somewhere nobody reads.

**Anchoring: JTBD-400 (Trust what the loop did while I was away), Internal Maintainer persona.** The header lines carried at capture, `**JTBD**: JTBD-006` and `**Persona**: plugin-developer`, have been removed. Neither belonged here. They are upstream `agent-plugins` values, and `plugin-developer` is not one of this repo's five personas at all. Local JTBD-006 does now exist, written in this repo on 2026-08-09, on direction given the day before, as an Engineering Leader reader job about navigating an edition, which makes the citation actively misleading rather than merely dangling: it resolves, to something unrelated. The person this ticket is actually about is modelled in `docs/jtbd/internal-maintainer/`. It is JTBD-400's first outcome, that a surface which cannot run says so rather than producing nothing, read one level in: the gate does say something, and what it says sends the operator to the wrong session. The fix site is upstream and already filed, so [JTBD-402](../../jtbd/internal-maintainer/JTBD-402-land-the-fix-where-the-defect-lives.proposed.md) governs how it lands. The persona and job are `human-oversight: unconfirmed` pending `/wr-jtbd:confirm-jobs-and-personas`, so this anchoring is provisional. Recorded in prose rather than `**JTBD**` / `**Persona**` header lines, per local convention.

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/317
- **Reported**: 2026-07-03
- **Template used**: structured default (problem-shaped)
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes
