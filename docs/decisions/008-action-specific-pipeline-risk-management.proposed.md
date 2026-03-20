---
status: "proposed"
first-released:
date: 2026-03-21
decision-makers: [Tom Howard, Claude]
consulted: []
informed: []
---

# Action-specific pipeline risk management

## Context and Problem Statement

The risk scorer currently answers one question: "what's the risk of this diff?" But risk compounds across the pipeline. A low-risk commit is fine alone, but 10 low-risk commits that haven't been pushed become a medium-risk push. And a push landing on an already-large release PR might make the release high-risk.

Meanwhile, WIP accumulation nudges (`wip-nudge.sh`) and risk scoring (`risk-score.sh`) gather overlapping data (uncommitted files, unpushed commits) in separate hooks, producing inconsistent signals. The agent needs a unified view of the pipeline to make autonomous flow decisions.

## Decision Drivers

- Risk compounds across pipeline stages; scoring only commits misses accumulated risk
- WIP nudge and risk scoring duplicate data gathering
- The agent should autonomously flow work through commit/push/changeset/release by keeping risk low at each stage
- Prompt-time hooks must remain network-free (no `gh` API calls)
- The local/remote split principle from ADR 003 is sound and should be preserved

## Considered Options

1. **Action-specific scoring with downstream back-pressure** - Score each pipeline action independently, with each action considering its effect on the next queue downstream
2. **Higher thresholds for push/release** - Use a more permissive threshold for later stages since CI controls exist
3. **Independent scoring only, no back-pressure** - Score each action in isolation without considering downstream effects
4. **Keep WIP nudge separate from risk scoring** - Maintain two hooks with different responsibilities

## Decision Outcome

Chosen option: **Action-specific scoring with downstream back-pressure**, because it treats the pipeline as a connected system where risk flows downstream, and it consolidates duplicate data gathering into a single pipeline state script.

### Key Design Principles

**Uniform risk threshold (< 5)**: The risk appetite applies to all pipeline actions -- commit, push, and release. CI controls and preview deploys are mitigating controls that reduce residual risk, not reasons to accept higher risk.

**Downstream back-pressure**: Each action must consider the effect on the next queue downstream. WIP accumulation acts as back-pressure through the pipeline. Do not commit if the accumulated unpushed changes would have risk >= 5. Do not push if the accumulated unreleased changes would have risk >= 5.

**Risk-reducing bypass**: When a downstream queue has high risk, actions that reduce that risk are always permitted. The agent determines this by scoring the projected downstream state with the change included. If projected downstream risk < current downstream risk, the action is risk-reducing and bypasses back-pressure.

**Network-free prompt-time hooks**: No `gh` or API calls in UserPromptSubmit hooks. Pipeline state gathered at prompt time uses only local git operations. Release PR metadata is gathered on-demand only when release is attempted.

**Pipeline state as standalone script**: `pipeline-state.sh` outputs structured text to stdout. Hooks call it as a subprocess with flags. Avoids shell sourcing portability issues.

**WIP nudge absorbed into risk system**: Pipeline state collection (stale files, unpushed counts) moves into `pipeline-state.sh` and the risk scoring hook. One fewer hook, no duplicate data gathering.

### Action Types

| Action | Scoring Factors | Downstream Consideration |
|--------|----------------|-------------------------|
| Commit | Diff content, accumulated unpushed changes | Projected push risk |
| Push | Accumulated unpushed change scope, CI effectiveness | Projected release risk |
| Release | Accumulated change scope, preview deploy status, smoke tests, PR age | N/A (terminal) |

### Score Files

- Commit: `/tmp/risk-commit-${SESSION_ID}`
- Push: `/tmp/risk-push-${SESSION_ID}`
- Release: `/tmp/risk-release-${SESSION_ID}` (on-demand only)

## Consequences

- **Good**: Risk is assessed at each pipeline stage, not just commit time
- **Good**: Back-pressure prevents unchecked WIP accumulation across stages
- **Good**: Risk-reducing actions bypass back-pressure, enabling recovery
- **Good**: Single pipeline state script eliminates duplicate data gathering
- **Good**: Network-free prompt-time hooks preserved (ADR 003 principle)
- **Good**: Agent can autonomously suggest pipeline flow actions
- **Neutral**: More complex agent prompt, but the agent receives richer context
- **Bad**: Two risk reports per prompt instead of one (more output to read)

## Supersedes

ADR 003 (Split WIP checks into local and remote). The local/remote split principle is explicitly preserved -- no network calls in prompt-time hooks. The implementation vehicle changes from `wip-nudge.sh` to `risk-score.sh` with `pipeline-state.sh`.

## Confirmation

- `pipeline-state.sh --all` completes in under 200ms (local git only)
- Two risk reports appear per prompt (Commit + Push) with downstream projections
- Commit gate reads `/tmp/risk-commit-${SESSION_ID}`
- Push gate reads `/tmp/risk-push-${SESSION_ID}`
- Agent suggests pushing when commit+push risk are low
- Agent warns when committing would make push risk too high
- Risk-reducing commits bypass back-pressure
- `wip-nudge.sh` removed, stale file warnings appear in risk scoring context

## Reassessment Criteria

- If the two-report output becomes noisy and the agent struggles to produce concise responses
- If back-pressure is too conservative and blocks legitimate work patterns
- If release scoring latency (gh API calls) becomes problematic in the push gate
