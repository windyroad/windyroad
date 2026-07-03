# Problem 054: work-problems Step 1 ranking does not exclude just-worked Known Error tickets awaiting orchestrator-owned push and transition

**Status**: Open
**Reported**: 2026-05-12
**Origin**: internal
**Priority**: 3 (Low). Impact: Moderate (3) x Likelihood: Rare (1)
**Effort**: M
**WSJF**: 1.5 = (3 x 1) / 2
**Type**: technical

## Description

The /wr-itil:work-problems SKILL.md Step 1 ranking does not exclude just-worked Known Error tickets that are awaiting orchestrator-owned push plus manual transition to Verification Pending. SKILL.md Step 3 tie-break ("Known Error over Open; smaller Effort; older Reported") picks these tickets again on the next loop iteration, forcing the orchestrator into ad-hoc skip decisions outside the SKILL.md framework.

Recurred 3 times in the 2026-05-11 AFK loop after the following iters each transitioned their target ticket Open to Known Error: iter 3 (P039 sw-critic verdict variant, commit fcd87e4), iter 4 (P034 URL-verify gate, commit 4dd2485), iter 5 (P037 cover-image friction, commit 586c21e), iter 6 (P044 cover-image skill, commit 95cd9c6). All four KEs stayed at the top of WSJF rankings while their fixes sat in the local unpushed queue at push residual 3 of 25 (below the Step 6.5 drain threshold of 4 of 25). The orchestrator manually skipped each on subsequent iter selection without a clean SKILL.md rule.

Codifiable as a SKILL.md improvement: extend Step 4 classification table to add a "Known Error with fix-implemented-this-loop-pending-push" category with skip_reason_category user-answerable (verification). Alternatively, encode the "fix implemented locally awaiting push" state in the README's WSJF Rankings table so the iter selection step naturally skips them. Per ADR-022, transition Known Error to Verification Pending fires when the fix is released (on origin/master); pending push leaves the ticket in a transient state the SKILL.md does not currently model.

Reference docs/retros/2026-05-12-orchestrator-ask-hygiene.md for the session evidence and the orchestrator's ad-hoc skip reasoning.

## Symptoms

(deferred to investigation)

## Workaround

Orchestrator main turn manually identifies the just-worked KE at the top of WSJF and skips to the next entry. Recorded in the iter prompt body for the dispatch turn. Recurs every loop where an iter transitions Open to KE with the fix committed but not pushed.

## Impact Assessment

- **Who is affected**: AFK orchestrator main turn during /wr-itil:work-problems loops with mixed Open and Known Error workflow
- **Frequency**: Every iter that transitions Open to Known Error within the loop while push residual stays below appetite (4 of 25)
- **Severity**: Minor. The orchestrator's ad-hoc skip works; the cost is added main-turn context for the manual reasoning and the risk of the rule being applied inconsistently
- **Analytics**: Iter dispatch prompts and orchestrator main-turn ticket-selection passes in docs/retros/

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Investigate root cause
- [ ] Create reproduction test
- [ ] Decide between Option A (SKILL.md Step 4 classification table extension) and Option B (README WSJF table reflecting just-worked KE state) for the codification approach

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P135 (ADR-044 framework-resolution boundary), ADR-022 (Verification Pending lifecycle)

## Related

- **Reported upstream**: https://github.com/windyroad/agent-plugins/issues/312 (2026-07-03)

(captured via /wr-itil:capture-problem; expand at next investigation)

- docs/retros/2026-05-12-orchestrator-ask-hygiene.md (session evidence)
- /wr-itil:work-problems SKILL.md Step 4 classification table
- ADR-022 (Problem Verification Pending lifecycle)
- ADR-044 (Decision-Delegation Contract, framework-resolution boundary)

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/312
- **Reported**: 2026-07-03
- **Template used**: structured default (problem-shaped)
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes
