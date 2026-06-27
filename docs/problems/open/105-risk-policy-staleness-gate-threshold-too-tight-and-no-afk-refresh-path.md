# Problem 105: risk-score-commit-gate RISK-POLICY staleness threshold is too tight (14 days) and has no AFK-satisfiable refresh path

**Status**: Open
**Reported**: 2026-06-27
**Priority**: 6 (Medium). Impact: Moderate (3) x Likelihood: Unlikely (2) (deferred, re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: S (deferred, re-rate at next /wr-itil:review-problems)
**WSJF**: deferred, re-rate at next /wr-itil:review-problems

## Description

The `wr-risk-scorer` commit gate (`risk-score-commit-gate.sh`) hard-denies EVERY `git commit` in the repo when `RISK-POLICY.md` was last reviewed more than **14 days** ago. The threshold is hardcoded (`(date.today() - reviewed).days > 14`, no env/config override) and the only sanctioned refresh path is the interactive `/wr-risk-scorer:update-policy` skill, which mandates `AskUserQuestion` and so cannot run AFK. Direct edits to `RISK-POLICY.md` are separately hook-blocked (`risk-policy-enforce-edit.sh`).

The combination is loop-fatal for the AFK orchestrator: once the policy ages past 14 days, every `/wr-itil:work-problems` iter subprocess hits the staleness deny at its commit step, stashes its (often complete + gate-passed) work, and reports blocked. The orchestrator cannot satisfy the gate non-interactively, so the whole loop stalls until a human re-attests the policy.

Tom's direction (2026-06-27): change the review cadence to **quarterly (every 3 months / ~90 days)** rather than fortnightly. The policy DOC has been re-attested + the quarterly cadence recorded (commit `ab3d192`), but the enforcing GATE still hardcodes 14 days, so the doc and the gate now disagree.

## Symptoms

- `git commit` denied with "Commit blocked: RISK-POLICY.md is stale (last reviewed over 2 weeks ago). Run /risk-policy to update it before committing." even for risk-neutral doc commits.
- AFK work-problems iter subprocesses stash completed work and report `outcome: blocked-at-commit-gate` (observed 2026-06-27 iter 3 / P101: 11 staleness encounters, ~$16 iter cost spent only to stash; orchestrator salvaged via one-time BYPASS_RISK_GATE=1).
- `RISK-POLICY.md` "Review cadence" note (quarterly) contradicts the gate's hardcoded 14-day threshold.

## Workaround

- Re-attest the policy via `/wr-risk-scorer:update-policy` (interactive; bumps Last-reviewed date) whenever the gate fires.
- One-time `BYPASS_RISK_GATE=1` to salvage a blocked iter's already-gate-passed work (not sustainable per-iter).

## Impact Assessment

- **Who is affected**: anyone running the AFK work-problems loop (or any commit) when the policy ages past 14 days. Recurs every ~14 days absent intervention.
- **Frequency**: every commit once the policy is stale; loop-fatal for AFK.
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Hypothesis

The staleness threshold is hardcoded at 14 days in `packages/risk-scorer/hooks/risk-score-commit-gate.sh` (upstream `@windyroad/risk-scorer`). It should be (a) raised to a quarterly cadence (~90 days) per the operator's review-cadence decision, and/or (b) made configurable (env var or a field read from `RISK-POLICY.md`'s own "Review cadence" line, so the gate honours the policy's declared cadence rather than a separate hardcoded constant), and/or (c) paired with an AFK-satisfiable re-attestation path (a non-interactive `--reattest` mode of update-policy that bumps the date when the policy content is unchanged, gated by the risk-scorer:policy PASS rather than AskUserQuestion).

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Report upstream to `@windyroad/risk-scorer` via /wr-itil:report-upstream
- [ ] Decide between threshold-raise vs configurable vs AFK-reattest (or combination)

## Fix Strategy

- **Kind**: improve
- **Shape**: hook + skill (upstream `@windyroad/risk-scorer`)
- **Target**: `packages/risk-scorer/hooks/risk-score-commit-gate.sh` (threshold), `packages/risk-scorer/skills/update-policy/SKILL.md` (AFK-satisfiable re-attest path).
- **Placement (per P045)**: this is an UPSTREAM `@windyroad/risk-scorer` change; the windyroad consumer cannot durably edit the cached plugin (P031 / P036 / ADR-036). This ticket tracks the proposal; report upstream via `/wr-itil:report-upstream` when ready. Recommending placement to the upstream repo is a proposal its maintainer ratifies.
- **Evidence**: 2026-06-27 work-problems session, iter 3 / P101 stash-and-block; operator direction to move to quarterly cadence.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P028 (risk-scorer TTL band policy, same staleness-cadence family), P061 (permission-gating of policy-authorised actions), P074 (external-comms marker bug, the other gate that bit the same iter-3 commit).

## Related

Captured via /wr-itil:capture-problem during /wr-itil:work-problems orchestrator-salvage handling of iter 3 (P101) commit-gate block, 2026-06-27. Surfaces iter 3's OQ-2 (RISK-POLICY staleness gate has no AFK-satisfiable refresh path) plus Tom's quarterly-cadence direction. Upstream `@windyroad/risk-scorer` change per P045 placement discipline.
