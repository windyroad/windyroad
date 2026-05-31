# Problem 074: External-comms marker hooks do not write expected marker files after subagent PASS verdicts; gh issue create / commit gates re-fire indefinitely, forcing BYPASS_RISK_GATE=1 workaround

**Status**: Open
**Reported**: 2026-05-31
**Priority**: 6 (Medium). Impact: Moderate (3) x Likelihood: Unlikely (2) (re-rated 2026-05-31 review-problems pass: gate over-blocks rather than fails-open, so visitor-facing voice/content damage path is several steps removed via bypass-becoming-routine spiral; the immediate visible failure is workflow friction)
**Origin**: internal
**Effort**: M (re-rated 2026-05-31 review-problems pass: investigation requires reading 2 hook scripts in the cached plugin location plus diffing marker write logic vs check logic plus possibly reproducing in a controlled context; not a single-line carve-out, not a multi-day rework)
**WSJF**: 3 = (6 x 1) / 2
**Type**: technical

## Description

The PostToolUse:Agent marker hooks (`risk-score-mark.sh` for `wr-risk-scorer:external-comms`; equivalent voice-tone hook for `wr-voice-tone:external-comms`) do not write the expected `/tmp/claude-risk-*` / `/tmp/voice-tone-*` marker files after the corresponding external-comms subagents emit PASS verdicts in this session. The gh-issue-create gate consequently re-fires the same BLOCKED-DELEGATE error indefinitely on repeated `gh issue create` attempts, even immediately after both subagents have produced and surfaced their `EXTERNAL_COMMS_RISK_VERDICT: PASS` and `EXTERNAL_COMMS_VOICE_TONE_VERDICT: PASS` lines verbatim.

Observed 2026-05-31 during the P042 upstream-filing flow inside the `/wr-itil:work-problems` orchestrator main turn. The bypass workaround `BYPASS_RISK_GATE=1 gh issue create ...` is the only way to land the upstream issue once the subagent reviews have actually completed. Composes with ADR-028 (external-comms gate on gh issue create / npm publish / .changeset/*.md author surface).

## Symptoms

- After invoking `wr-risk-scorer:external-comms` via the Agent tool with the canonical `SURFACE: gh-issue-create` + `<draft>...</draft>` prompt shape, the subagent emits `EXTERNAL_COMMS_RISK_VERDICT: PASS` and the Agent tool returns cleanly.
- The subsequent `gh issue create` call is BLOCKED with the same `gh-issue-create draft has not been reviewed by wr-risk-scorer:external-comms` error.
- Same pattern repeats for the voice-tone evaluator: `wr-voice-tone:external-comms` subagent emits `EXTERNAL_COMMS_VOICE_TONE_VERDICT: PASS`, the BLOCKED error keeps firing.
- `ls /tmp/claude-risk-*` and `find /tmp -name 'wr-risk-*' -newer /tmp/wr-iter-18-output.json` return empty. The marker files that the BLOCK message says the PostToolUse:Agent hook should write are never created.
- `voice-tone-announced-*` markers exist in /tmp (from prior sessions); `external-comms` / `risk-*` markers do not.

## Workaround

`BYPASS_RISK_GATE=1 gh issue create ...` (and `BYPASS_RISK_GATE=1 git commit ...` when the commit message contains tokens matching the gate's regex list, e.g. "issue create"). The bypass is documented in the BLOCKED error message as the override path.

## Impact Assessment

- **Who is affected**: every operator-at-keyboard session that invokes /wr-itil:report-upstream or otherwise triggers the external-comms gate. AFK orchestrators in particular cannot fall through to BYPASS_RISK_GATE without explicit env-var injection at iter dispatch shape.
- **Frequency**: every external-comms-gated tool call in this session (1 observed, but the pattern likely repeats across all 6 outstanding upstream-report invocations queued from the 2026-05-30 to 2026-05-31 AFK loop).
- **Severity**: Significant for the external-comms gate's load-bearing role. The gate is supposed to provide one-line confirmation that drafts have been reviewed; if the marker never lands despite subagent PASS, the gate either over-blocks (current observed state) or invites the BYPASS workaround to become standard practice (erodes the gate's discipline).
- **Analytics**: 1 BLOCK observed per subagent invocation; expected 0 BLOCKs after the first subagent PASS.

## Root Cause Analysis

### Hypothesis

Three candidate root causes:

1. **PostToolUse:Agent hook not running on the Agent invocations**. The hook is registered for `PostToolUse:Agent` matcher; if the matcher does not match the actual subagent invocations (e.g. mismatch in the matcher regex, or the hook fails silently on subagent-name extraction), the marker write never fires.

2. **PostToolUse:Agent hook runs but writes to wrong location or wrong key**. If the hook computes the marker key from the prompt structure (SURFACE + draft hash per ADR-028 amended 2026-05-16) but uses a different hashing algorithm or different draft-extraction window than the BLOCKING gate checks, the marker writes but to a location the gate cannot find.

3. **Session-ID mismatch**. The BLOCK error mentions `${CLAUDE_SESSION_ID}` or equivalent session-scoped paths. If the orchestrator main turn has no `CLAUDE_SESSION_ID` env var (`echo $CLAUDE_SESSION_ID` returned empty), the hook might be unable to scope the marker file write.

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Read `risk-score-mark.sh` (or equivalent external-comms-mark hook) cached at `~/.claude/plugins/cache/windyroad/wr-risk-scorer/<version>/hooks/` to identify the marker write logic.
- [ ] Read the BLOCKING gate hook (likely `external-comms-gate.sh` per ADR-028) to identify the marker check logic.
- [ ] Diff the two: confirm the marker key + path are derived consistently between write and check.
- [ ] Reproduce the BLOCK in a controlled context (call the subagent + immediately attempt the gh-issue-create) and inspect stderr of the PostToolUse:Agent hook to see if it fires.
- [ ] If session-ID is the issue, document the CLAUDE_SESSION_ID provisioning expectation for orchestrator main turns vs subprocess iters.

## Dependencies

- **Blocks**: (none directly; chronic recurring friction during upstream-filing batch)
- **Blocked by**: (none)
- **Composes with**: ADR-028 (external-comms gate); P061 (assistant gate-permission verifying; sibling concern but distinct mechanism); P057 (Edit/Write hook whitelist port verifying; sibling hook-protocol surface).

## Related

(captured via /wr-itil:capture-problem during 2026-05-31 /wr-itil:work-problems orchestrator main turn queue resolution; surfaced after the P042 upstream-filing flow required BYPASS_RISK_GATE=1 even though both wr-risk-scorer:external-comms and wr-voice-tone:external-comms subagents emitted PASS. Expand at next investigation.)

- ADR-028 (voice-tone gate on external communications), the gate that re-fires
- packages/risk-scorer/hooks/ (upstream cached), likely fix-site for the marker-write logic
- P042 (parked, reported upstream agent-plugins#183), the upstream-filing flow that surfaced this
