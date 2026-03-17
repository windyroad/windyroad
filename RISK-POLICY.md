# Risk Policy

Risk assessment for uncommitted changes, aligned with ISO 31000.

## Risk Appetite

Residual risk score must be **<= 2** to commit. Changes scoring above 2 must be reduced (stash, revert, split) before committing.

## Impact Levels

| Level | Label | Description |
|-------|-------|-------------|
| 1 | Negligible | Typo, comment, formatting. No behavioural change. |
| 2 | Minor | Dev tooling, internal scripts, non-production config. No user-facing effect. |
| 3 | Moderate | Production config, CI/CD, build pipeline. Could delay or break deployments. |
| 4 | Significant | User-facing functionality, UI components, API contracts. Affects end users. |
| 5 | Severe | Authentication, secrets, data handling, security controls. Could cause data loss or breach. |

## Likelihood Levels

| Level | Label | Description |
|-------|-------|-------------|
| 1 | Rare | Change is trivial or mechanically verifiable. Almost no way to introduce a defect. |
| 2 | Unlikely | Change is small and well-understood. Defect would require a subtle mistake. |
| 3 | Possible | Change spans multiple concerns or touches unfamiliar code. Reasonable chance of error. |
| 4 | Likely | Large change, cross-cutting concerns, or no automated checks covering this area. |
| 5 | Almost certain | Unreviewed change to critical path with no safety net. |

## Risk Matrix

Residual risk = max(Impact, Likelihood) after controls are applied.

Use the higher of the two dimensions as the score, not their product. This keeps the 1-5 scale meaningful for the commit gate.

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
| Risk score commit gate | `risk-score-commit-gate.sh` | Impact | Blocks commits when residual risk > 2. Prevents risky accumulations from being committed. |
| WIP nudge | `wip-nudge.sh` | Likelihood | Warns about stale uncommitted files and unpushed commits. |

## How to Assess

1. Identify the **inherent impact** of the changes using the Impact Levels table.
2. Identify the **inherent likelihood** of a defect using the Likelihood Levels table.
3. Review the **Control Register**. For each applicable control, reduce the relevant dimension by 1 level (minimum 1).
4. Compute **residual risk** = max(residual impact, residual likelihood).
5. If residual risk > 2, the change is too risky to commit as-is.
