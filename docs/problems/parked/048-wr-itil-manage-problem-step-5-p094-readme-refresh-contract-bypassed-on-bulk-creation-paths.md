# Problem 048: /wr-itil:manage-problem Step 5 P094 README refresh contract bypassed on bulk-creation paths

**Status**: Parked
**Reported**: 2026-05-02
**Origin**: internal
**Priority**: 12 (High). Impact: Significant (4) x Likelihood: Possible (3)
**Effort**: M
**WSJF**: 0 (parked; multiplier 0 per ADR-022)

## Description

The `/wr-itil:manage-problem` Step 5 P094 README refresh contract requires that every new ticket creation regenerates `docs/problems/README.md` to insert the new ticket's row into the WSJF Rankings, staging the refreshed README in the same commit as the new ticket file. The contract is enforced via the per-session create-gate marker (P119 + P124): the manage-problem-enforce-create.sh PreToolUse:Write hook denies any direct Write to `docs/problems/*.md` unless the marker is present.

But the marker is **per-session, not per-ticket**. Once the first ticket creation sets the marker (via `mark_step2_complete`), the marker covers all subsequent Writes for the rest of the session. including bulk-Write paths that bypass the per-ticket P094 refresh. A session that creates 11 tickets in one commit only fires P094 logic for the first ticket (if at all); the subsequent 10 land without the README refresh per-ticket.

The result is silent README drift between the on-disk inventory and the rendered table. Drift accumulates across sessions until the next `/wr-itil:reconcile-readme` invocation catches it.

## Symptoms

Live evidence, 2026-05-02 session:

- Commit 62f58aa (2026-04-27, "docs(retro): file ADRs and problem tickets from newsletter cycle") created 11 problem tickets in a single commit (P034 through P044) without staging `docs/problems/README.md` in the same commit. The README was not refreshed during creation; the bulk-Write path satisfied the per-session create-gate marker without invoking P094 per ticket.
- 5 days passed before iter 2's Step 0 reconcile preflight (P118) caught the drift on 2026-05-02. The reconciler reported 12 drift entries: 11 newsletter tickets missing from WSJF Rankings + 1 false-positive STALE on P031 from a separate reconcile-readme.sh bug (now P049).
- The reconcile commit (8352016) repaired the drift, but only because Step 0 caught it; without the preflight, the README would have continued to lie about the open backlog.

## Workaround

Run `/wr-itil:review-problems` periodically to refresh the README from on-disk state. Or rely on the manage-problem Step 0 P118 preflight to catch drift before the next operation. Both are reactive; the preventive contract on the create path is the gap.

## Impact Assessment

- **Who is affected**: Any caller that runs bulk-creation flows in a single session. Includes retrospective sessions, post-mortem ticket capture, and AFK orchestrator iterations that create multiple sibling tickets.
- **Frequency**: Every session with 2+ ticket creations. The 2026-04-27 retro is the live example; pattern recurs whenever a session captures multiple distinct concerns.
- **Severity**: Significant. README drift makes the WSJF queue lie about the actual backlog. Downstream consumers (work-problems orchestrator, manage-problem review fast-path, manual queue browsing) act on stale data.
- **Analytics**: N/A.

## Root Cause Analysis

### Pattern

The per-session marker semantics conflict with the per-ticket P094 refresh contract. The marker says "this session has run Step 2 grep" (audit trail for the duplicate-check); the P094 refresh contract says "every new ticket gets a README refresh". The marker satisfies the gate but does not enforce per-ticket P094 invocation.

The bulk-Write path is not covered by the SKILL flow, so P094 never fires. The gate accepts the Writes because the marker covers the session.

### Fix Strategy

Two options.

**Option A: end-of-flow P094 batch refresh.**

Amend the manage-problem SKILL.md Step 5 P094 block to specify that for any creation flow that produces N ticket files, the P094 refresh fires ONCE at the end of the flow, not per-ticket. The single render captures the full new set in one pass (the SKILL already specifies this for the multi-concern split path; extend to all bulk paths). The end-of-flow trigger needs a deterministic detector. either the agent self-reports "I'm about to write N tickets" before the first Write, or the gate marker tracks a counter and the SKILL knows to fire P094 when the agent signals end-of-flow.

**Option B: single-shot marker per ticket.**

Change the create-gate marker from per-session to per-ticket. Each `Write` to a `.open.md` file consumes the marker; subsequent Writes require a fresh `mark_step2_complete` call. This forces every ticket creation through the full Step 2 + Step 5 flow, including P094.

Option A is cheaper (SKILL prose change) but relies on agent compliance. Option B is enforceable but heavier (changes marker semantics; needs hook + helper update).

### Verification check (per P045 discipline)

1. **Domain fit**: P094 refresh contract is `wr-itil:manage-problem`'s domain. Yes, fit.
2. **Placement authority**: this project is the wr-itil plugin's consumer, not maintainer. Recommendation only; the maintainers decide.

### Investigation Tasks

- [ ] Verify the P094 contract on disk (read manage-problem SKILL.md Step 5 P094 block). verify-before-asserting per P032.
- [ ] Verify the per-session marker semantics (read create-gate.sh). confirm the marker is not consumed per ticket.
- [ ] Decide between Option A and Option B (or hybrid). likely architect call upstream.
- [ ] Once upstream fix ships: verify a bulk-creation session in this project no longer accumulates README drift.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P045

## Related

- P045 (assistant accepts ticket Fix Strategy upstream-placement framing without questioning): discipline applied to classify the fix surface.
- P031 (manage-problem Step 0 reconcile-readme.sh hits exit 127 on marketplace consumers): same plugin, different surface (script-path resolution vs P094 contract).
- `~/.claude/plugins/cache/windyroad/wr-itil/0.23.1/skills/manage-problem/SKILL.md` Step 5 P094 block (the fix site for Option A).
- `~/.claude/plugins/cache/windyroad/wr-itil/0.23.1/hooks/lib/create-gate.sh` (the marker semantics for Option B).
- Live example: commit 62f58aa (2026-04-27) created 11 tickets without README refresh; iter 2 preflight (commit 8352016, 2026-05-02) caught and repaired the 5-day drift.

## Parked

- **Reason**: upstream-blocked. The genuine fix lives in the `wr-itil` plugin at `~/.claude/plugins/cache/windyroad/wr-itil/<version>/` across two surfaces: (a) `skills/manage-problem/SKILL.md` Step 5 P094 block plus Step 4b multi-concern split contract (Option A end-of-flow batch refresh), and (b) `hooks/lib/create-gate.sh` per-session marker semantics (Option B per-ticket marker). The local repo has no `packages/wr-itil/` directory; this project is a downstream marketplace consumer of `@windyroad/wr-itil`. A consumer cannot edit cached SKILL.md prose or hook scripts without losing the change on next plugin update, so the only durable fix is upstream. Both Option A and Option B name surfaces wholly inside the upstream plugin. No local-codifiable surface exists.
- **Verified persistence**: latest cached plugin version `0.38.0` still ships the gap. `hooks/lib/create-gate.sh` lines 21 to 26 carry an explicit comment ("Per-session scope is intentional per architect direction A: a single `/wr-itil:manage-problem` invocation may write multiple tickets [Step 4b multi-concern split writes 2 to N consecutive `.open.md` files]; per-grep scope would block split-create after the first Write"). The architect has rejected Option B by design. `skills/manage-problem/SKILL.md` Step 5 P094 block (lines 513 to 529) implements Option A only for the SKILL-mediated `Step 4b` multi-concern split path ("the refresh fires **once** after all split tickets are written, not per-split, a single render captures the full new set in one pass"). Bulk-Write paths OUTSIDE the SKILL flow (retro sessions, post-mortem ticket capture, AFK orchestrator iterations creating multiple sibling tickets) still bypass P094 because the per-session marker covers all subsequent Writes without per-ticket P094 enforcement. Step 0 reconcile preflight (P118, lines 232 to 275) catches drift on the NEXT manage-problem call. Detect-on-next-invocation, not prevent-on-create. The preventive contract gap the ticket names remains. Verified 2026-05-31 by reading the cached files.
- **Upstream issue status**: not yet filed. Same shape as P042 / P049 / P060 / P073 (parked with upstream issue deferred to next interactive session). File via `/wr-itil:report-upstream` next time Tom is at the keyboard; classify as problem-report per ADR-033 primary classifier.
- **Un-park trigger**: a new `wr-itil` plugin release lands in `~/.claude/plugins/cache/windyroad/wr-itil/` whose `skills/manage-problem/SKILL.md` Step 5 P094 block extends end-of-flow refresh coverage to bulk-Write paths outside the SKILL flow (e.g. by registering a SKILL-level "end-of-flow trigger" the agent calls when wrapping a multi-ticket session), OR whose `hooks/lib/create-gate.sh` consumes the marker per ticket while preserving the Step 4b split-create path (e.g. via a counter-based marker that tracks a SKILL-known split-batch size). Verify by re-reading the cached files in the new version. Close P048 once a session producing 2 or more ticket creations outside the SKILL flow no longer accumulates README drift between creation and next manage-problem invocation.
- **Local impact while parked**: existing Workaround (run `/wr-itil:review-problems` periodically to refresh the README from on-disk state; rely on manage-problem Step 0 P118 preflight to catch drift on the next invocation) remains the operating contract. The risk is detect-not-prevent: drift accumulates silently between bulk-Write sessions and the next manage-problem call, then the Step 0 preflight catches it. Live evidence in the ticket body: commit 62f58aa (2026-04-27) created 11 tickets without README refresh; iter 2 preflight (commit 8352016, 2026-05-02) caught and repaired the 5-day drift. The 5-day drift window is the steady-state exposure; the Step 0 preflight ensures eventual consistency.
- **Composes with**: P031 (`manage-problem` Step 0 reconcile-readme.sh exit 127 on marketplace consumers, parked 2026-05-02, upstream `windyroad/agent-plugins#85`) and P049 (`reconcile-readme.sh` section-order assumption false-positive STALE, parked 2026-05-30) as third `wr-itil` plugin surface this AFK loop has touched; same marketplace-consumer-cannot-edit-cached-plugin shape as iters 3 to 15 parks. P031 plus P049 cover the reactive reconcile-readme detect-and-repair surface; P048 covers the preventive P094 create-path contract: the two surfaces compose into the full create-and-detect drift discipline.
- **Date parked**: 2026-05-31
