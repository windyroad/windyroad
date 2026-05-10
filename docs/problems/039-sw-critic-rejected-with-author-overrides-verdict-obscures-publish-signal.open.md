# Problem 039: sw-critic round-3 REJECTED-with-author-overrides verdict is technically correct but obscures publish-decision signal

**Status**: Open
**Reported**: 2026-05-01
**Priority**: 12 (Significant). Impact: Moderate (3) x Likelihood: Likely (4) (re-rated 2026-05-10 per ADR 027: sw-critic verdict obscuring publish signal is pre-publish pipeline disruption at L3 Moderate; previous Impact 2 understated)
**Effort**: S
**WSJF**: (12 x 1.0) / 1 = 12.0 (folklore weight 2.0 dropped per ADR 027)

## Description

The sw-critic agent's round-3 contract (per ADR 016) returns `VERDICT: REJECTED` with `REJECTED_REASON: critic-loop-exhausted` whenever any UNMET or PARTIAL persists at round 3, even when the only remaining items are documented author-overrides (e.g. inline-link source format, six-vs-five item count, CTA description per ADR-023 pause).

The verdict is technically correct (the rubric was not fully satisfied) but practically misleading (the brief is publish-ready; all blockers are intentional editorial choices).

## Symptoms

- 2026-04-30 prep critic round 3: REJECTED with check_6 + check_23 PARTIAL, both author overrides
- 2026-05-01 finalise critic round 3: REJECTED with check_6, check_19, check_23, check_26 PARTIAL, all author overrides
- User confused on first occurrence; required Tom-summary to lead with "VERDICT: REJECTED. Do not publish as-is. Rewrite and re-run." which is wrong when the only issues are overrides

## Workaround

The Tom-summary at step 17 manually distinguishes "author override" from "real failure" in the verdict surfacing. Friction every edition.

## Root Cause Analysis

### Root Cause

ADR 016 round-3 exhaustion logic treats all PARTIAL and UNMET equally. The rubric does not distinguish "rubric is wrong for this artefact / author has overridden" from "artefact has an unfixed flaw."

### Fix Strategy

- **Kind**: improve
- **Shape**: ADR + agent
- **Target file**: `.claude/agents/wr-sw-critic.md` (verdict block) and the calling skill's prior-weaknesses contract
- **Edit summary**: Add a `PASS_WITH_AUTHOR_OVERRIDES` verdict distinct from `PASS` and `REJECTED`. Caller passes a list of accepted-override check IDs in `prior_weaknesses`. Round-3 logic: if remaining UNMETs/PARTIALs are all in the override list, emit `PASS_WITH_AUTHOR_OVERRIDES` with the override list explicitly named in the verdict block. The save-step Tom-summary then surfaces "publish-ready (with N documented overrides)" instead of "REJECTED."
- **Companion ADR**: amend ADR 016 to add the verdict variant.

## Related

- ADR 016 (sw-critic 3-round loop)
- This retrospective: 2026-05-01 edition retro
