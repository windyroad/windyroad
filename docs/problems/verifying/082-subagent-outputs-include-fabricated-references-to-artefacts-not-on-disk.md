# Problem 082: Subagent outputs include fabricated references to artefacts not on disk

**Status**: Verification Pending
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

### Resolution (AFK work-problems iter, 2026-06-27)

**Direction 3 chosen** (accept downstream verification as the rule). Lowest-cost; preserves the asymmetric trust model (consumer verifies, subagent need not self-verify); mirrors the established P032/P045/P103 windyroad-local lever pattern verbatim. Directions 1 (brief subagent agent files) and 2 (post-process verification gate) are upstream/structural hardening, documented in the Fix space above as future options should prompt-discipline prove insufficient; out of scope for this local lever.

**Shipped (two-lever local discipline, mirroring P103):**

1. Session memory note `~/.claude/projects/-Users-tomhoward-Projects-windyroad/memory/feedback_verify_subagent_references_before_propagating.md` (plus `MEMORY.md` index pointer), cross-linked to the P032 and P045 memory notes.
2. New paragraph in the `# Verify before asserting` section of `CLAUDE.md` naming governance-subagent verdict references as the third surface in the verify-before-X family, with the 2026-06-02 `ADR-077` / `wr-architect-generate-decisions-compendium` fabrication as cited evidence.

Both governance gates passed pre-edit: architect PASS (no ADR conflict; no new ADR warranted, since the verify-before-X decision was settled when P032's paragraph landed and this applies it uniformly to a new surface); jtbd PASS (internal agent-governance prose, out of customer-facing JTBD scope, correctly a windyroad-local CLAUDE.md lever).

**I13 RFC-trace note (P104 / P070 / P103):** the I13 propose-fix RFC-trace gate would fire `no-rfc-trace` here; per P104 (known false positive for discipline-note fixes) this iter took the legacy direct-implementation path and did NOT auto-create an RFC, consistent with how P032/P045/P103 shipped.

### Investigation Tasks

- [x] Re-rate Priority and Effort at next /wr-itil:review-problems (effort confirmed S in practice: two doc edits; frontmatter left at M-origin, immaterial now the ticket is in Verification Pending and excluded from WSJF)
- [x] Decide between fix direction 1, 2, or 3. Direction 3 chosen (see Resolution)
- [ ] If direction 1: identify which subagent agent files need the verify-before-citing-references brief amendment (not pursued; upstream future option)
- [ ] If direction 2: scope the post-process verification gate (not pursued; upstream future option)
- [x] If direction 3: amend CLAUDE.md "Verify before asserting" extension to name subagent verdict output as the third surface. Done
- [ ] Investigate frequency: scan recent iter retros for other subagent-verdict fabrication instances (one observed to date; recurrence-watch is now the verification criterion below)

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

## Fix Released

Shipped 2026-06-27 (AFK `/wr-itil:work-problems` iter) as a windyroad-local discipline lever (direction 3), not a packaged release: the fix surface is `CLAUDE.md` plus a session memory file, neither under `packages/`, so no changeset / version bump applies (the discipline is active immediately on commit).

- `CLAUDE.md`: fourth paragraph in `# Verify before asserting` naming governance-subagent verdict references as the third verify-before-X surface.
- `~/.claude/projects/-Users-tomhoward-Projects-windyroad/memory/feedback_verify_subagent_references_before_propagating.md` (plus `MEMORY.md` index pointer).

**Verification criterion (recurrence-watch):** awaiting confirmation that future iters consuming governance-subagent verdicts ground cited references before propagating them, and that no fabricated-reference-propagation recurs. Same verification shape as the sibling P032 / P045 / P103 discipline-note fixes. Close on user confirmation or a clean recurrence-watch window.
