# Risk Policy

Risk assessment for uncommitted changes, aligned with ISO 31000.

## Risk Appetite

Residual risk score must be **< 5 (Low)** to commit. Scores >= 5 (Medium and above) must be reduced (stash, revert, split) before committing.

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

## Control Register

Controls reduce likelihood and/or impact. When assessing residual risk, account for which controls have been applied or will apply before the change reaches production.

| Control | Hook/Gate | Reduces | Description |
|---------|-----------|---------|-------------|
| Architect review | `architect-detect.sh` + `architect-enforce-edit.sh` | Likelihood | Reviews all file edits against architectural decisions. Catches misalignment before code is written. |
| Accessibility review | `a11y-team-eval.sh` + `a11y-enforce-edit.sh` | Likelihood, Impact | Reviews UI code for WCAG AA compliance. Prevents accessibility regressions. |
| Voice and tone review | `voice-tone-eval.sh` + `voice-tone-enforce-edit.sh` | Likelihood | Reviews user-facing copy against voice guide. Prevents brand/tone violations. |
| Secret leak gate | `secret-leak-gate.sh` | Impact | Blocks Edit/Write containing patterns matching secrets (.env values, API keys, tokens). |
| Em-dash gate | `no-em-dash.sh` | Likelihood | Blocks em-dash characters in source files. Prevents encoding issues. |
| Git push gate | `git-push-gate.sh` | Likelihood | Enforces `npm run push:watch` for pushes. Ensures CI runs before code reaches remote. |
| Risk score commit gate | `risk-score-commit-gate.sh` | Impact | Blocks commits when residual risk >= 5 (Medium). Prevents risky accumulations from being committed. |
| WIP nudge | `wip-nudge.sh` | Likelihood | Warns about stale uncommitted files and unpushed commits. |

## How to Assess

1. Identify the **inherent impact** of the changes using the Impact Levels table.
2. Identify the **inherent likelihood** of a defect using the Likelihood Levels table.
3. Review the **Control Register**. For each applicable control, reduce the relevant dimension by 1 level (minimum 1).
4. Compute **residual risk** = residual impact x residual likelihood.
5. Look up the label from the Label Bands table.
6. If residual risk >= 5 (Medium or above), the change is too risky to commit as-is.
