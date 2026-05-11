# Problem 039: sw-critic round-3 REJECTED-with-author-overrides verdict is technically correct but obscures publish-decision signal

**Status**: Known Error
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
- **Shape**: ADR + agent + caller
- **Target files**: `.claude/agents/wr-sw-critic.md` (verdict block) and `.claude/skills/wr-newsletter/SKILL.md` (caller plumbing at steps 9, 15, 15.25, 17, Failure modes)
- **Edit summary**: Add a `PASS_WITH_AUTHOR_OVERRIDES` verdict distinct from `PASS` and `REJECTED`. Caller passes a list of accepted-override check IDs in a new `accepted_overrides` input. Round-3 logic: if remaining UNMETs/PARTIALs are all in the override list, emit `PASS_WITH_AUTHOR_OVERRIDES` with the override list explicitly named in the verdict block via a new `OVERRIDDEN:` line. The save-step Tom-summary then surfaces "publish-ready (with N documented overrides)" instead of "REJECTED."
- **Companion ADR**: ADR 025 (PASS_WITH_AUTHOR_OVERRIDES verdict for sw-critic round-3 exhaustion) is the design home. Per architect review (2026-05-11), ADR 016 is NOT amended in place; ADR 025 is a separate ADR file that documents the new contract surface (`accepted_overrides` input from caller to critic).

## Resolution Implementation

Shipped 2026-05-11 in a single commit on local master (release pending; verifying transition fires on next push:watch per ADR-007):

- `.claude/agents/wr-sw-critic.md`: new `accepted_overrides` input documented; Step 6 verdict-computation rewritten with priority-ordered round-3 logic; Step 7 review block extended with `OVERRIDDEN:` line; frontmatter description and gate-relationship section updated to mention the variant; new "Overrides are the caller's call, not yours" hard rule.
- `.claude/skills/wr-newsletter/SKILL.md`: step 9 (Wardley critic) passes `accepted_overrides: []`; step 15 (newsletter critic) passes the documented four overrides (`[check_6, check_19, check_23, check_26]`) with per-check editorial-rationale notes; step 15.25 explicitly notes `PASS_WITH_AUTHOR_OVERRIDES` does NOT trigger the skip-on-upstream-REJECTED path; step 17 Tom-summary surfaces variant-specific phrasing; Failure modes section adds the new variant.
- ADR 025 status remains `proposed` (transitions to accepted via ADR-005 first-released on next release).

## User direction (loop-end batched answer, 2026-05-11)

User picked: **Add runtime auto-degrade threshold** to ADR-025.

Follow-up work for next session:
- Amend ADR-025 with a runtime auto-degrade rule: override-list size above N triggers `REJECTED` instead of `PASS_WITH_AUTHOR_OVERRIDES`. Threshold value N is TBD by the user; the architect's iter-3 review suggested a small ceiling but did not pin a value, so the next session captures the value before implementing.
- Implement the threshold check in `.claude/agents/wr-sw-critic.md` round-3 priority-ordered logic (insert between current `all-in-overrides` branch and `PASS_WITH_AUTHOR_OVERRIDES` emit).
- Surfaced 2026-05-11 via /wr-itil:work-problems loop-end Step 2.5b after iter 3 architect-design queue entry.

## Related

- ADR 016 (sw-critic 3-round loop)
- ADR 025 (PASS_WITH_AUTHOR_OVERRIDES verdict, design home)
- This retrospective: 2026-05-01 edition retro
