# Problem 128: The risk threshold is restated in ten places with no single source of truth

**Status**: Known Error
**Reported**: 2026-08-07
**Priority**: 8 (Medium), Impact: 2 x Likelihood: 4. Impact is 2 because stale governance prose misdirects agent reasoning and burns iteration budget, but it cannot produce a wrong gate verdict: the enforcing hook reads `RISK-POLICY.md` and never the ADRs. Likelihood is 4 because two of the ten restatements are rendered into the compendium section the architect agent is documented to read first, so an agent doing routine compliance review meets the stale value by default.
**Origin**: internal
**Effort**: S. A superseding ADR, or amendment sections on two existing ones, plus a compendium refresh. No code.
**WSJF**: 16.0 = (8 x 2.0) / 1 (re-rated 2026-08-08: Open to Known Error auto-transition, status multiplier 1.0 to 2.0 per P125)

## Description

The commit and push risk threshold is asserted in ten places across three files, none of which is the enforcement surface. On 2026-08-07 the appetite moved from `< 5` to `5 or below` (`fea3cec`) and only `RISK-POLICY.md` was updated, because the ADRs are point-in-time records and editing their prose would destroy what was decided when.

The restatements, verified on disk at the line numbers after that commit:

| File | Lines | Text |
|---|---|---|
| `docs/decisions/007-risk-matrix-calculation.proposed.md` | 35, 53, 70, 78, 79 | "the commit threshold (`< 5`)", "score < 5 (Very Low and Low may commit; Medium and above blocked)", "Commit gate blocks at score >= 5", "Prompt hook nudge triggers at score >= 5" |
| `docs/decisions/008-action-specific-pipeline-risk-management.proposed.md` | 43, 45 (twice) | "Uniform risk threshold (< 5)", "Do not commit ... risk >= 5", "Do not push ... risk >= 5" |
| `docs/decisions/README.md` | 49, 50 | the same two figures, rendered into the compendium |

`fea3cec` added dated pointers above both ADR bodies and annotated both compendium entries, which is why this is a Medium rather than a blocker: a reader now meets the correction before the stale strings. The strings themselves remain.

~~**ADR-007 line 53 diverges semantically, not just numerically**: "Very Low and Low may commit; Medium and above blocked". Medium's floor is now permitted. A reader reconciling policy against ADR hits this before hitting any numeric restatement.~~

**Corrected 2026-08-09.** That is no longer true, and it was the line making this ticket feel urgent. The label bands moved to `3-5 Low / 6-9 Medium` (ADR-049), so Medium's floor is 6 and is not permitted. Line 53's parenthetical is substantially restored: the blocking half holds unconditionally, and the permitting half holds for every Low except the `1 x 5` cell, which the policy's composition constraint excludes. The divergence narrows to numeric-plus-one-cell, so ADR-007 needs no body rewrite beyond the dated pointer it already carries at line 15.

**Two additions to the inventory, both found on 2026-08-09 and neither in the table above.**

1. **ADR-027** (`docs/decisions/027-newsletter-primacy-in-risk-rubric.proposed.md`) is a third file carrying the stale figures, so "ten places across three files" was understated at capture. Its Decision Outcome asserts "Likelihood rubric, risk matrix, label bands, and risk appetite (< 5) are unchanged" (two of those four now stale) and its Neutral consequences repeat "The risk appetite (< 5) is unchanged." It carried no dated pointer, unlike ADR-007 and ADR-008. One was added in the same iteration as ADR-049.
2. **ADR-007's own Labels table**, three lines above line 53, still reads `3-4 Low / 5-9 Medium`. The band move added this instance; this ticket's inventory is threshold-scoped and would not have caught it. The generic 2026-08-07 pointer at ADR-007 line 15 covers it for now.

## Root cause

Two facts are conflated in one number. `RISK-POLICY.md` is the source of truth for the **operative** threshold, because the commit hook parses it. ADR-007 and ADR-008 are the source of truth for **why the threshold was what it was at that date**. Those are different facts that do not need collapsing, but nothing pointed between them until 2026-08-07, so every restatement read as current.

## Symptoms

An agent doing compliance review reads `< 5` from the compendium's in-force section and treats it as the rule, potentially flagging the amended policy as non-compliant or attempting to revert it.

## Workaround

`RISK-POLICY.md` is the enforcement surface. Where it and an ADR disagree on the threshold, the policy wins. The dated pointers added in `fea3cec` say so at both surfaces.

## Impact Assessment

- **Who is affected**: the architect agent on routine compliance review, and any agent or reader reasoning about the threshold from the decision record.
- **Frequency**: every compliance review that consults ADR-007 or the compendium's in-force section.
- **Severity**: no gate verdict can be wrong from this, since the hook never reads the ADRs. The cost is misdirected reasoning and rework.
- **Analytics**: none.

## Root Cause Analysis

### Investigation Tasks

- [x] Decide the treatment: a superseding ADR recording the 2026-08-07 reversal, or amendment sections on ADR-007 and ADR-008. The repo's `.superseded.md` convention is scoped to the compendium's Historical section, and both ADRs are in the In-force section, so supersession may be the wrong instrument. Note both carry `status: "proposed"` with an empty `first-released:`, so under ADR-005's stamp-and-promote lifecycle they have not been released; if the immutability convention binds at `accepted` rather than `proposed`, in-place amendment may be available and collapses most of this work.
- [x] Record why ADR-007's own driver is only partly satisfied. Its Context rejects `max()` precisely because it cannot distinguish severe-and-rare from negligible-and-certain: "Both score 5, but they represent very different risk profiles." The product model has the identical collapse at exactly that cell, which is why the amended policy admits a residual of 5 only at likelihood 1. That constraint is the compensating control for the one cell where the chosen formula reproduces the flaw it was chosen to fix, and it belongs in the lineage rather than only in the policy.
- [x] Correct the band-fork rationale. The bands were held at `5-9 Medium` on two stated grounds. The first is sound: `RISK-POLICY.md` declares the matrix the single source of truth for problem severity classification as well as risk scoring, so rebalancing would silently reclassify problem severities. The second was inverted: upstream ADR-086 moved the plugin's bands to `3-5 Low / 6-9 Medium` on 2026-06-25, so this repo's `5-9 Medium` is the fork rather than the alignment. The outcome stands on the first ground; the stated reason needs correcting before it is cited again.
- [x] Record the enforcement gap as an accepted limitation. A residual of 5 is admissible only at likelihood 1 with a named control, but the hook compares the product and cannot see how a 5 was composed. The policy says so; the decision record should carry it as a named consequence.
- [ ] Decide whether the compendium can be regenerated. `wr-architect-generate-decisions-compendium` is on PATH but is deprecated in this repo: it clobbers hook-authored entries and re-emits em-dashes the no-em-dash hook rejects (P087, which fired three times on 2026-08-07). The two entries were hand-annotated for that reason. If regeneration is ever restored, the hand annotations are lost. **Narrowed 2026-08-09, not closed.** The full-file generator now self-declares deprecated upstream, and its replacement, the `architect-compendium-update-entry.sh` PostToolUse hook, was exercised for the first time in this repo when ADR-049 landed. It works: it wrote the ADR-049 entry and the reciprocal `Related` on ADR-027 without touching any other entry, so the clobbering half of this task is answered. Two gaps remain and both needed hand correction in that commit. It emits em-dashes, so P087 still fires on every entry it writes. And it does not update the section's derived counts, so `Total ADRs` and the in-force count drift by one per ADR unless someone notices.

**Four tasks above closed 2026-08-09 by ADR-049** (`docs/decisions/049-risk-label-bands-adopt-the-3-5-low-shape.proposed.md`). Note ADR-049's own Related section says it closes three, not four: it counts only the tasks its body answers. Task 1, the choice of instrument, was settled by the standing preference for a new record over amendment sections rather than by anything the ADR argues, so both counts are right about different things.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P087

## Related

- **P087** (`docs/problems/known-error/087-wr-architect-generate-decisions-compendium-emits-em-dashes-violating-adopter-no-em-dash-policies.md`): why the compendium was hand-annotated rather than regenerated.
- **ADR-007** and **ADR-008**: the records carrying the stale figures, both now pointing forward to `RISK-POLICY.md`.
- **ADR-027** (`docs/decisions/027-newsletter-primacy-in-risk-rubric.proposed.md`): the third carrier, missed at capture, pointered 2026-08-09. It also carries stale `RISK-POLICY.md` line-number citations ("lines 36-44", "Business Context (line 15)", "line 15 / line 43 / line 44"), which went stale under ADR-041 rather than under the band change. Same class, logged here, deliberately not covered by that pointer.
- **ADR-049** (`docs/decisions/049-risk-label-bands-adopt-the-3-5-low-shape.proposed.md`): closes four of the five investigation tasks above. `human-oversight: unconfirmed`, so treat its findings as recorded rather than ratified until `/wr-architect:review-decisions` drains it.
- **New collision, same class as this ticket.** P087 line 13 cites a bare "ADR-049" meaning the upstream `agent-plugins` shim-convention decision. Now that a local ADR-049 exists, that citation silently resolves to the wrong record: the phantom-reference read P082 exists to prevent. The fix belongs in P087, not here.
- **Upstream ADR-086** (marketplace repo, not local): rebalanced the plugin bands to `3-5 Low` and moved its default appetite to 5 on 2026-06-25. Relevant to the band-fork task above. Not a local decision and not citable as one.
- Evidence: `fea3cec` moved the boundary and added the pointers. Inventory verified by two independent scorer passes, which corrected an initial count of five to the actual ten.
- Captured 2026-08-07 alongside the policy amendment, deliberately sequenced after it: the policy is the enforcement surface and was the urgent half.
