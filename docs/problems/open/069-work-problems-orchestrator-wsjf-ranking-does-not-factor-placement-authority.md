# Problem 069: work-problems orchestrator WSJF ranking does not factor placement-authority

**Status**: Open
**Reported**: 2026-05-16
**Origin**: internal
**Priority**: 3 (Low). Impact: Moderate (3) x Likelihood: Rare (1)
**Effort**: M
**WSJF**: 1.5 = (3 x 1) / 2
**Type**: technical

## Description

Upstream-blocked tickets cycle back to the top of the WSJF queue and waste per-iter re-verification cost.

**Live evidence (2026-05-16 AFK session)**: 6 iters dispatched across WSJF over=6.0 tickets (P021, P028, P033, P042, P022, P027). 5 of 6 classified as upstream-blocked on iter read (avg .58 / iter, ~6min/iter wall). Only P028 made forward progress (Open to Known Error to Verifying). Session cost: $4.21 for 1 transitioned ticket plus 5 verify-still-upstream-blocked iters. About 83% iter waste rate at the current WSJF priority frontier.

The windyroad-site backlog is dominated by upstream-plugin tickets (wr-itil, wr-architect, wr-jtbd, wr-risk-scorer hooks plus SKILL files). Each iter has to read the ticket body to discover the upstream-blocked classification, then skip per Step 4 plus P063 marker fallback. The orchestrator's Step 1 / Step 3 WSJF ranking has no signal for placement-authority; already-known-upstream-blocked tickets keep cycling back to the top of the WSJF queue, and each iter pays the full verify-and-skip cost.

## Symptoms

(deferred to investigation)

## Workaround

(deferred to investigation. current orchestrator-level workaround applied this session: in-session exclusion list of just-iter-classified upstream-blocked tickets, applied at Step 1 selection. Costs nothing per-iter but resets across sessions.)

## Impact Assessment

- **Who is affected**: (deferred to investigation. first-order: anyone running /wr-itil:work-problems on a project whose backlog is upstream-heavy)
- **Frequency**: (deferred to investigation. this session: 5/6 iters)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Investigate root cause
- [ ] Create reproduction test
- [ ] Evaluate three candidate fix shapes:
  - (a) **Orchestrator-level pre-filter at Step 3**: scan ticket bodies for `## Reported Upstream` markers and deprioritise matches (move to bottom of WSJF queue OR exclude entirely until upstream issue closes). Smallest amendment surface. Loses safety-net "re-verify each iter" property.
  - (b) **New file-suffix state `.upstream-blocked.md`** (analogous to `.parked.md`): WSJF multiplier=0, excluded from dev-work ranking, surfaced in dedicated "Upstream Blocked" README section with linked upstream issues. Bigger SKILL plus ADR change; preserves audit trail; loses re-verify-each-iter safety property too.
  - (c) **Composite**: keep re-verify-each-iter but bound per-session (e.g. once per ticket per 7 days). Smaller per-iter cost, preserves staleness detection.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P054 (work-problems Step 1 ranking does not exclude just-worked Known Error tickets awaiting orchestrator-owned push and transition. same anti-circular-work spirit, different surface); P045 (assistant accepts ticket Fix Strategy upstream-placement framing without questioning. the discipline that catches mis-classified placement; this ticket extends the discipline to orchestrator-level ranking).

## Related

(captured via /wr-itil:capture-problem; expand at next investigation)

- P054. sibling anti-circular-work ticket on the just-worked-Known-Error surface
- P045. placement-claim verify-before-propagating discipline (precedent for placement-authority as a first-class concern)
- 2026-05-16 AFK session evidence: iter logs at `.afk-run-state/iter[1-6]-*.json`; retro trails at `docs/retros/2026-05-16-work-problem-p{021,028,033,042,022,027}-ask-hygiene.md`
