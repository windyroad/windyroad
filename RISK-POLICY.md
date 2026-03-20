# Risk Policy

Risk assessment for pipeline actions (commit, push, release), aligned with ISO 31000.

## Risk Appetite

Residual risk score must be **< 5 (Low)** for any pipeline action (commit, push, release). Scores >= 5 (Medium and above) must be reduced before proceeding.

## Impact Levels

| Level | Label | Description |
|-------|-------|-------------|
| 1 | Negligible | No visitor impact. Site behaviour, content, and availability unchanged. |
| 2 | Minor | No visitor impact. Dev tooling or build affected but the published site is unaffected. |
| 3 | Moderate | Deployment disruption. Netlify builds broken or delayed; site updates cannot be published. |
| 4 | Significant | Visitor-facing disruption. Blog content, service pages, booking CTA, or Vibe Code Audit page degraded or inaccessible. |
| 5 | Severe | Reputation or trust damage. Broken accessibility, misleading content, exposed secrets, or site fully offline. |

## Likelihood Levels

| Level | Label | Description |
|-------|-------|-------------|
| 1 | Rare | Almost no chance of reaching visitors. Hooks, build, and static export would catch the issue first. |
| 2 | Unlikely | Low chance of visitor impact. Existing controls (architect, a11y, voice-and-tone hooks) mitigate effectively. |
| 3 | Possible | Reasonable chance of reaching the published site. Controls only partially cover the affected area. |
| 4 | Likely | High chance of visitor impact. No hooks or automated checks cover this area of the site. |
| 5 | Almost certain | Impact will reach visitors. No safety net between the change and the live site. |

## Risk Matrix

Residual risk = impact x likelihood (after controls are applied).

Both dimensions contribute proportionally to the score on a 1-25 scale.

### Product Reference Table

| Impact \ Likelihood | 1 Rare | 2 Unlikely | 3 Possible | 4 Likely | 5 Almost certain |
|---|---|---|---|---|---|
| 1 Negligible | 1 | 2 | 3 | 4 | 5 |
| 2 Minor | 2 | 4 | 6 | 8 | 10 |
| 3 Moderate | 3 | 6 | 9 | 12 | 15 |
| 4 Significant | 4 | 8 | 12 | 16 | 20 |
| 5 Severe | 5 | 10 | 15 | 20 | 25 |

### Label Bands

| Range | Label |
|-------|-------|
| 1-2 | Very Low |
| 3-4 | Low |
| 5-9 | Medium |
| 10-16 | High |
| 17-25 | Very High |

## Action-Specific Risk

The risk appetite (< 5) applies uniformly to all pipeline actions: commit, push, and release. We are delivering change into production; the threshold does not change based on which stage the change is at. CI controls and preview deploys are mitigating controls that reduce residual risk, not reasons to accept higher risk.

The risk scorer assesses the accumulated change at each stage, not just counts of commits or files. It must understand what the changes are to judge their impact and likelihood.

## Back-Pressure

Each action must consider its effect on the next queue downstream. WIP accumulation acts as back-pressure through the pipeline:

- Do not commit if the accumulated unpushed changes (including this commit) would have risk >= 5
- Do not push if the accumulated unreleased changes (including this push) would have risk >= 5
- Exception: actions that reduce downstream risk bypass back-pressure (e.g. adding tests when release risk is high)
