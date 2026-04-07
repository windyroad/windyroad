---
status: "proposed"
first-released:
date: 2026-03-21
decision-makers: [Tom Howard, Claude]
consulted: []
informed: []
---

# Use impact x likelihood product for risk scoring

## Context and Problem Statement

The risk matrix uses `max(impact, likelihood)` to compute residual risk on a 1-5 scale. This collapses two independent dimensions into one: a Severe impact (5) with Rare likelihood (1) scores identically to an Almost Certain likelihood (5) with Negligible impact (1). Both score 5, but they represent very different risk profiles. The max() approach cannot distinguish between high-impact/low-probability and low-impact/high-probability scenarios.

## Decision Drivers

- Both impact and likelihood must contribute proportionally to the final score
- The scoring model should align with standard risk management practice (ISO 31000)
- The commit gate threshold must map cleanly to the new scale
- Existing tooling (risk-scorer agent, commit gate hook, prompt hook) must be updated consistently

## Considered Options

1. **Impact x likelihood product** - Raw product on a 1-25 scale with label bands
2. **Weighted average** - `(w1 * impact + w2 * likelihood)` with configurable weights
3. **Lookup table** - Manually assigned risk levels for each cell in the 5x5 matrix

## Decision Outcome

Chosen option: **Impact x likelihood product**, because it is the simplest formula that gives both dimensions proportional influence. The 1-25 scale maps naturally to five label bands, and the commit threshold (`< 5`) cleanly separates Low from Medium risk.

### Scoring Model

**Formula**: risk score = impact x likelihood

**Scale**: 1-25

**Labels**:

| Range | Label |
|-------|-------|
| 1-2 | Very Low |
| 3-4 | Low |
| 5-9 | Medium |
| 10-16 | High |
| 17-25 | Very High |

**Commit threshold**: score < 5 (Very Low and Low may commit; Medium and above blocked)

### Product Reference Table

| Impact \ Likelihood | 1 Rare | 2 Unlikely | 3 Possible | 4 Likely | 5 Almost certain |
|---|---|---|---|---|---|
| 1 Negligible | 1 | 2 | 3 | 4 | 5 |
| 2 Minor | 2 | 4 | 6 | 8 | 10 |
| 3 Moderate | 3 | 6 | 9 | 12 | 15 |
| 4 Significant | 4 | 8 | 12 | 16 | 20 |
| 5 Severe | 5 | 10 | 15 | 20 | 25 |

## Consequences

- **Good**: Both dimensions contribute proportionally to the score
- **Good**: Aligns with standard ISO 31000 risk matrix practice
- **Good**: Label bands provide human-readable interpretation
- **Good**: Commit threshold (< 5) cleanly separates acceptable from unacceptable risk
- **Neutral**: Scale changes from 1-5 to 1-25 (all tooling updated together)
- **Bad**: Existing muscle memory around "score out of 5" needs adjustment

## Confirmation

- RISK-POLICY.md reflects the product formula, label bands, and threshold
- risk-scorer agent outputs `N/25 (Label)` format
- Commit gate blocks at score >= 5
- Prompt hook nudge triggers at score >= 5

## Reassessment Criteria

- If the label bands produce unintuitive results for common change patterns
- If a weighted model proves necessary to emphasise impact over likelihood

## Delivery Mechanism

As of ADR 009, the risk-scorer agent and related hooks are delivered via the `risk-scorer` plugin from the windyroad-claude-plugin marketplace rather than local files in `.claude/agents/` and `.claude/hooks/`. The scoring formula and behavior documented above is unchanged.
