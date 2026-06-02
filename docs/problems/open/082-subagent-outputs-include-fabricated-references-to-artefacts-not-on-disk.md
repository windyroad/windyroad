# Problem 082: Subagent outputs include fabricated references to artefacts not on disk

**Status**: Open
**Reported**: 2026-06-02
**Priority**: 3 (Medium). Impact: 3 x Likelihood: 1 (deferred. Re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: M (deferred. Re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

Subagent outputs (architect, jtbd, risk-scorer) include fabricated references to artefacts not on disk; load-bearing decisions risk inheriting the fabrications.

This iter's (AFK iter 4 of `/wr-itil:work-problems`, 2026-06-02, working P080) architect verdict block cited verbatim:

> "Per ADR-077, when this iter authors the new ADR, run `wr-architect-generate-decisions-compendium` and stage the refreshed `docs/decisions/README.md` alongside the new ADR file."

Verification on the same iter:

- `ls docs/decisions/ | grep ^077` returns nothing. No ADR-077 file exists.
- `find . -name "*decisions-compendium*"` returns nothing. No such tool exists.
- `grep -rln "ADR-077\|077-" docs/decisions/` returns nothing. No reference to ADR-077 anywhere in the decisions tree.

The architect-recommended ADR and the architect-recommended tool are both genuinely absent from the project. The reference was caught and not propagated only because the iter applied memory `feedback_verify_project_state_before_writing.md` (P032) discipline. Had the iter trusted the architect's verdict without verification, it would have attempted to invoke a nonexistent tool, would have flagged a nonexistent ADR as a load-bearing precondition, or would have created downstream tickets / commits referencing the fabricated artefacts.

Recurring class-of-behaviour. P032 and P045 captured downstream propagation of unverified ticket-prose and Fix-Strategy placement claims (Claude-as-orchestrator side):

- P032: assistant inheriting ticket prose claims about hook / skill / config state without verifying against on-disk file.
- P045: assistant inheriting a ticket's Fix Strategy upstream-placement framing into WSJF re-rates and upstream-blocked classifications without verifying domain fit or placement authority.

Both P032 and P045 sit in Verification Pending with shipped lever 1 fixes (memory notes + CLAUDE.md "Verify before asserting" extensions). Neither names the upstream surface where the fabricated references are emitted in the first place: the subagent's own output. This ticket addresses that third surface in the verify-before-X family: verify-before-emitting-references in subagent output.

Sibling-class but distinct surface:

- P032 / P045 surface: Claude (orchestrator) inheriting external prose (ticket bodies, Fix Strategy text). Fix locus: orchestrator-side verification discipline (memory + CLAUDE.md).
- P082 surface: subagent (architect, jtbd, risk-scorer) emitting fabricated references in verdict blocks. Fix locus: subagent-side grounding contract (agent-prompt discipline, post-process verification gate, or accept-downstream-verification policy).

Fix space (not pinned; capture only). Three viable directions documented; pick one (or hybrid) at next /wr-itil:review-problems or via /wr-itil:manage-problem investigation:

1. Brief the architect agent (and other governance subagents) more explicitly to verify against on-disk file existence before citing any ADR, skill, script, or file path in a verdict. Lowest-cost; most diffuse. Risk: prompt-level discipline alone has been historically insufficient (P032 + P045 both required hook / memory backup).
2. Post-process subagent output through a verification gate that grep / find / ls-checks every cited reference before the orchestrator consumes the verdict. Higher-cost; structural defence. Risk: adds latency to every governance subagent invocation; verification-gate false-negatives are themselves a surface to maintain.
3. Accept that downstream verification (P032 + P045 memory + CLAUDE.md "Verify before asserting") is the discipline. Recognise that subagent output is hypothesis until verified, treat as P032's existing rule applied uniformly. Lowest-cost; preserves the asymmetric trust model (assistant verifies; subagent need not). Risk: relies on every consumer remembering the discipline; new consumers (or distracted consumers) drop verification.

## Symptoms

(deferred to investigation)

## Workaround

(deferred to investigation. Current workaround: assistant applies memory P032 "Verify before asserting" discipline to subagent verdicts before propagating, same as ticket-prose claims.)

## Impact Assessment

- **Who is affected**: (deferred to investigation. Direct: any iter trusting governance-subagent verdicts; indirect: tickets / commits / ADR-cross-references that inherit fabricated artefact names.)
- **Frequency**: (deferred to investigation. Estimated: once-observed this iter; recurrence likely as governance-subagent count grows and subagents are asked to cite more references in verdicts.)
- **Severity**: (deferred to investigation. Estimated: HIGH when fired without downstream catch; capped at LOW when caught by P032 discipline.)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Decide between fix direction 1 (subagent-prompt discipline), 2 (post-process verification gate), or 3 (accept downstream verification as the rule)
- [ ] If direction 1: identify which subagent agent files (`.claude/agents/wr-*.md` and equivalents) need the verify-before-citing-references brief amendment
- [ ] If direction 2: scope the post-process gate's input shape (full verdict text? structured reference list?), check granularity (file existence only? content match?), and where it lives (orchestrator-side wrapper? hook? a new subagent?)
- [ ] If direction 3: amend CLAUDE.md "Verify before asserting" extension to explicitly name subagent verdict output as the third surface (alongside ticket-prose and Fix-Strategy)
- [ ] Investigate frequency: scan recent iter retros for other subagent-verdict fabrication instances

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P032 (verify-before-asserting on ticket-prose claims), P045 (verify-before-propagating on Fix Strategy upstream-placement claims)

## Related

- **P032** (`docs/problems/verifying/032-...md` if present). Sibling: same verify-before-X family on orchestrator-side ticket-prose surface.
- **P045** (`docs/problems/verifying/045-assistant-accepts-ticket-fix-strategy-upstream-placement-framing-without-questioning.md`). Sibling: same verify-before-X family on orchestrator-side Fix-Strategy placement surface.
- `feedback_verify_project_state_before_writing.md` (P032 memory). Existing discipline that caught this iter's fabrication.
- `feedback_verify_upstream_placement_before_propagating.md` (P045 memory). Existing discipline for the sibling Fix-Strategy surface.

(captured via /wr-itil:capture-problem after retro-surfaced recurring class-of-behaviour observation per P342 mechanical-stage carve-out; AFK iter 4 of work-problems 2026-06-02 working P080; hang-off-check verdict PROCEED_NEW per fresh-context subagent dispatch; expand at next investigation)
