# Problem 045: Assistant accepts a ticket's Fix Strategy framing about where upstream work should land, without questioning whether the work belongs upstream at all

**Status**: Open
**Reported**: 2026-05-02
**Priority**: 12 (Significant). Impact: Significant (4) x Likelihood: Possible (3)
**Effort**: M
**WSJF**: 6.0 = (12 x 1.0) / 2

## Description

When a problem ticket's `Fix Strategy` section says "fix is in upstream X plugin" or "this is a cross-package job in repo Y", the assistant accepts that framing as authoritative spec rather than as a hypothesis to verify. Downstream actions get bound to the framing without any check that:

1. The upstream named in the ticket is actually the right home for new work (placement may have been chosen by momentum: "the ticket lives in plugin X's tree, therefore the fix lives there too").
2. The work belongs upstream at all (a brand-new skill that operates on this project's code may belong in this project, not in any external plugin).
3. The assistant is in a position to dictate placement to the upstream maintainers (it is not; placement decisions belong to the maintainers of that repo).

The result is wrong WSJF re-rates ("transitive XL via upstream skill build"), wrong upstream-blocked classifications, and wrong skip decisions in the AFK loop, all flowing from a framing claim that was never tested.

## Symptoms

Live example, 2026-05-02 AFK iter 2 working P026 (dry-aged-deps pre-push gate):

- P026's `Fix Strategy` named the new skill as `wr-itil:update-stale-deps` and described the work as "cross-package, multi-day, plus a new ADR superseding ADR 021". Ticket prose stated the home as the wr-itil plugin in windyroad/agent-plugins.
- Iter 2 worker re-rated Effort `S` to `XL` and WSJF `32.0` to `4.0` based on "transitive XL via upstream wr-itil skill build", citing the cross-package framing.
- Iter 2 `ITERATION_SUMMARY` notes claimed "P026 fix is upstream-blocked on wr-itil skill build" and surfaced a deviation-approval question about parking.
- Orchestrator's main turn parroted the same framing back ("genuine fix is upstream wr-itil plugin SKILL.md", "this project is a marketplace consumer of the plugin").
- Tom corrected the assumption mid-loop: "I don't think you can tell the agent-plugins repo where this skill should live. It's a new skill, so I would argue that it doesn't belong on agent-plugins at all."

The skill in question operates on windyroad's `package.json`, `package-lock.json`, and test suite; the per-package update logic, breaking-change handling, and "agent diagnoses test/code fixes from a dep bump" all run against this project's code. The skill is windyroad-specific by virtue of what it operates on; placing it in agent-plugins requires evidence the abstraction is generic, which has not been produced.

This is not a one-off slip. The same pattern applies to any ticket whose `Fix Strategy` reads "fix is in upstream X". Without a verification step, every such ticket gets the same uncritical pass-through.

## Workaround

Tom corrects in-session, as on 2026-05-02. The cost: every ticket with upstream-placement prose risks burning iteration time on wrong re-rates, wrong upstream-blocked classifications, and wrong skip decisions until the user notices and corrects.

## Impact Assessment

- **Who is affected**: Tom (gets wrong framing in tickets and orchestrator decisions) and any downstream consumers of the wrong WSJF / upstream-blocked classifications.
- **Frequency**: Every problem ticket whose `Fix Strategy` carries upstream-placement prose, plus every AFK iteration that processes one. P026 was the live example; P010, P014, P027, P028, P033 in the current backlog all have at least some upstream-attribution surface area.
- **Severity**: Significant. Misclassifies tickets in WSJF rankings and upstream-blocked status, wasting iteration budget and producing wrong outputs the user must hand-check.
- **Analytics**: N/A.

## Root Cause Analysis

### Pattern

The assistant treats `Fix Strategy` text as authoritative spec. When prose says "fix is upstream X", that becomes a load-bearing fact for downstream actions. No verification step asks "is X actually the right home for this work?" before the framing propagates.

The verification missing is two-part:
1. **Domain fit**: does the proposed home's domain match the work's domain? A deps-update skill's domain is dependency management, not ITIL workflows.
2. **Placement authority**: is this project in a position to place new work in the proposed home? For non-WR repos, no. For WR repos, only by submitting a PR the maintainers can reject. Either way, the proposal is a hypothesis, not a fact.

Composes with P032 (verify-before-asserting): different surface, same family. P032 is "verify file/config/hook state before asserting it"; P045 is "verify upstream-placement claims before propagating them into ratings and decisions".

### Fix Strategy

Three levers, in increasing cost order. Lever 1 alone may be sufficient.

**Lever 1: discipline note**

Add a discipline note to user memory and to `CLAUDE.md` (sibling to the verify-before-asserting note added for P032). Wording roughly:

> When a ticket's `Fix Strategy` proposes a home for new work in an external repo or upstream plugin, treat the proposal as a hypothesis. Before propagating it into WSJF re-rates, upstream-blocked classifications, or skip decisions, verify two things: (a) does the proposed home's domain match the work's domain? (b) is this project in a position to place work there? If either is unclear, surface the placement question to the user as a deviation-approval entry rather than acting on the framing.

Cross-references the live example (P026 2026-05-02 iter 2) and the sibling P032.

**Lever 2: check at manage-problem ticket-review time**

When `/wr-itil:manage-problem review` runs and re-reads each ticket, add a check: if the ticket carries upstream-placement prose, include a "verify placement" task in the review output for the user to confirm. Cost: SKILL.md amendment to the manage-problem review path.

**Lever 3: check at work-problems iter prompt time**

In the orchestrator's iter dispatch prompt (work-problems Step 5 iteration prompt body), add an explicit instruction: "If the selected ticket's `Fix Strategy` proposes upstream placement, do not auto-accept the placement; verify domain fit and placement authority before any re-rate or upstream-blocked classification". Cost: SKILL.md amendment to work-problems Step 5.

### Investigation Tasks

- [ ] Lever 1: Author the discipline note (memory file plus `CLAUDE.md` "Verify before asserting" extension) covering the placement-verification rule. Cross-reference P026 (the live example) and P032 (sibling discipline).
- [ ] Decide whether Lever 1 alone is sufficient or whether levers 2 and 3 should also ship. Default: ship lever 1, observe whether the pattern recurs in the next AFK loop, ship 2 and 3 only if it does.
- [ ] If lever 2 ships: amend `/wr-itil:manage-problem` review path to include the placement-verification check. This is upstream wr-itil work; defer until lever 1 proves insufficient.
- [ ] If lever 3 ships: amend `/wr-itil:work-problems` SKILL.md Step 5 iter prompt body. This is upstream wr-itil work; defer until lever 1 proves insufficient.
- [ ] User verification on the next AFK iteration that processes a ticket with upstream-placement prose: did the worker question the placement, or did it parrot the framing?

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P032

## Related

- P026 (live example: assistant accepted the "fix is upstream wr-itil:update-stale-deps skill build" framing on this ticket without questioning whether the skill belongs upstream at all). Updated 2026-05-02 to reflect the corrected windyroad-local placement.
- P032 (sibling discipline ticket: assistant writes ticket bodies without verifying current code/config first). Closed 2026-05-02 on session evidence.
- `~/.claude/projects/-Users-tomhoward-Projects-windyroad/memory/feedback_verify_project_state_before_writing.md` (the lever 1 home for P032; lever 1 of P045 sits next to it).
- `CLAUDE.md` "Verify before asserting" section (added for P032 lever 3; this ticket extends it).
- `~/.claude/plugins/cache/windyroad/wr-itil/0.23.1/skills/manage-problem/SKILL.md` (lever 2 amendment site).
- `~/.claude/plugins/cache/windyroad/wr-itil/0.23.1/skills/work-problems/SKILL.md` (lever 3 amendment site).
