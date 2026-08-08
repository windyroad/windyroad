---
status: "proposed"
date: 2026-08-09
human-oversight: confirmed
oversight-date: 2026-08-09
decision-makers: [Tom Howard, Claude]
consulted: [wr-risk-scorer:policy, wr-risk-scorer:pipeline, wr-architect:agent, wr-jtbd:agent]
informed: []
related: [007-risk-matrix-calculation, 008-action-specific-pipeline-risk-management, 027-newsletter-primacy-in-risk-rubric]
reassessment-date: 2026-11-09
---

# Risk label bands adopt the 3-5 Low shape, so a residual of 5 is called what it is

> **Ratified.** Tom directed the band change at a question gate on 2026-08-08, then read and ratified this record in session on 2026-08-09. It was the first ADR in this repo to carry `human-oversight: unconfirmed`, and the first to have it drained.
>
> `status` and `human-oversight` are independent axes. `scripts/post-release.d/stamp-and-promote-decisions.sh` promotes on `first-released` age alone and never reads `human-oversight`, so an ADR can read `accepted` while unratified. This one is ratified; the gap is general and is tracked as P138.

## Context and Problem Statement

`RISK-POLICY.md` and the agent that scores against it disagreed about what a residual of 5 is called.

The policy's Label Bands read, before this change, `3-4 Low / 5-9 Medium`. The scoring agent this repo actually runs reads `3-5 Low / 6-9 Medium`. That is not a claim from a ticket; it is on disk at `/Users/tomhoward/.claude/plugins/marketplaces/windyroad/packages/risk-scorer/agents/pipeline.md` line 369, which cites **upstream ADR-086** in the `agent-plugins` repo (`086-risk-label-bands-rebalanced-default-appetite-5.proposed.md`, 2026-06-25, `human-oversight: confirmed`). That is a different repository's ADR-086. This repo has no local ADR-086, so it is precedent and the source of the agent's table, never local authority.

The problem was first named in writing on 2026-08-05, two days before the appetite moved, in `.risk-reports/2026-08-05T07-49-02-commit.md`. That is the origin of this change, not an illustration of its after-cost. A newsletter change whose severe-impact risk had been driven to Rare by named gates scored inherent `5 x 4 = 20` and residual `5 x 1 = 5`, printed Medium, and the verdict was STOP against the appetite as it then stood. The report's own register hint says why that was structural rather than bad luck: a severe-but-rare residual could never clear the gate no matter how many controls were added, and the upstream bands place 5 at Low specifically to restore feasibility for that shape.

The appetite moved on 2026-08-07, which fixed the admissibility half. It did not fix the label. From that date a residual of 5 was admissible while still called Medium, and the policy had to carry a carve-out paragraph explaining why an accepted Medium was not a contradiction. A reader meeting `5/25 (Medium)` in a report, inside a policy whose stated stance is "stay below Medium", reasonably reads a bypass.

A framing that did **not** survive checking, recorded here because it was the reason originally put to Tom: that the Impact Levels table rates any newsletter body change 5, making newsletter commits structurally un-passable. It does not. Impact 5 requires the failure to reach readers, so an unpublished draft edit is impact 4 at most and usually 3. `RISK-POLICY.md`'s own 2026-08-07 amendment already records that correction. This decision does not rest on the false framing.

## Decision Drivers

- The policy and the agent scoring against it must agree on vocabulary; a divergence
in the label is a divergence a human reads and an agent does not.
- A change that clears the gate should read as clearing it, not as an exception.
- The bar must not move. Tom asked for the band, not the threshold.
- Minimal blast radius: change the one score whose label is wrong, nothing else.

## Considered Options

1. **Adopt the upstream band shape, keep the threshold, keep the composition
constraint (chosen).**
2. **Adopt the band shape and drop the composition constraint**, matching upstream
exactly. Rejected: upstream treats any 5 as Low however composed, which would newly admit `impact 1 x likelihood 5`. That is the one cell the constraint exists to close, and dropping it is a change to the bar rather than to the label.
3. **Leave the bands where they were and delete the carve-out paragraph instead**,
accepting a Medium at the boundary. Rejected: leaves the policy and the scoring agent disagreeing, which is the actual defect.
4. **Fork the bands between the two consumers**, one shape for pipeline scoring and
another for problem severity. Rejected: `RISK-POLICY.md` declares one matrix as the single source of truth for both, and forking creates a second instance of exactly the restatement problem P128 exists to record.

## Decision Outcome

Chosen option: **adopt the upstream band shape, keep the threshold, keep the composition constraint**.

Landed in `69787eb`.

`RISK-POLICY.md` now carries the adopted band shape, its appetite heading names the band the threshold sits at, and the composition constraint on a residual of exactly 5 is retained, with one sentence added recording that it survives the band move. The numeric threshold is unchanged. The policy is the single source of truth for all three values, so this record does not reprint them here: read them there. It does carry the band shape in two other places, deliberately and for stated reasons; both are enumerated in the inventory consequence below rather than counted twice.

**No pass/fail outcome changes anywhere.** The commit gate compares the product
against the threshold and never reads the band table. Worked before and after: a severe-impact newsletter risk driven to Rare scores 5 and was admitted before and is admitted now, but reads `Low` instead of `Medium`. A moderate-impact newsletter risk only partly covered scores `3 x 2 = 6`, was `Medium` and STOP before, and is `Medium` and STOP now. Everything from 6 to 25 is untouched.

### Consequences

**Good**

- Policy and scoring agent now say the same thing. The divergence recorded in
`.risk-reports/2026-08-07T02-23-06-commit.md`, where the agent deferred to disk under P082, is closed toward the agent.
- ADR-007 line 53's parenthetical, "Very Low and Low may commit; Medium and above
blocked", is **substantially restored**. Low's ceiling is 5, the appetite is 5, Medium starts at 6, so the blocking half is now unconditionally true and the permitting half is true for every Low except the one cell the composition constraint bites on, `1 x 5`, which is labelled Low and may not commit. Its numeric clause `score < 5` remains stale. So P128's divergence narrows from semantic-plus-numeric to numeric-plus-one-cell, and ADR-007 needs no body rewrite beyond the dated pointer it already carries at line 15.

**Accepted, and load-bearing**

- **The composition constraint is now the sole discriminator at the collapsed cell.**
ADR-007 line 18 rejected a `max()` model precisely because it cannot separate severe-and-rare from negligible-and-certain: *"Both score 5, but they represent very different risk profiles."* The product model reproduces that collapse at the same cell. Before 2026-08-07 both cells were excluded by `< 5` and the constraint was redundant. After it, the constraint alone excluded `1 x 5`. After this change, both cells are labelled Low inside a Low appetite, so the label carries no signal at all and the constraint is the only thing left doing the work. It gets harder to remove from here, not easier.
- **That constraint has no hook enforcement.** The commit gate compares the product
and cannot see how a 5 was composed. It is enforced by the scoring agent's judgement and by this record. Accepted limitation, not an oversight.
- **Problem severities relabel at 5.** `RISK-POLICY.md` declares one matrix for both
pipeline scoring and problem severity. Blast radius checked on disk: no live ticket in `docs/problems/README.md` scores 5, and the only affected file is the closed `docs/problems/closed/067-...md` line 6, `"Priority: 5 (Medium). Impact: Negligible (1) x Likelihood: Almost certain (5)"`, which now reads Low. WSJF ranks on the numeric severity, and the Tier-0 selector gates on 17, so no ticket's rank or tier moves. This overrides the ground on which P128 recorded the bands had been held, so P128 is corrected in the same iteration rather than left contradicted. Note in passing that P067 is the `1 x 5` cell: admissible as a ticket severity, which is a description, and not as a pipeline residual, which is a permission.
- **ADR-027 carries two falsified scoping statements.** Its Decision Outcome asserts
"Likelihood rubric, risk matrix, label bands, and risk appetite (< 5) are unchanged": two of those four are now stale, the label bands and the appetite, while the likelihood rubric and the product matrix genuinely are unchanged. Its Neutral consequences repeat "The risk appetite (< 5) is unchanged." Unlike ADR-007 and ADR-008, ADR-027 carries no dated pointer. It gets one in the same iteration. Quoted anchors are used above rather than line numbers, because inserting the pointer shifts them, which is this record's own thesis applied to itself.
- **This record adds to P128's inventory as well as correcting it.** P128's headline
count of ten restatements across three files was already understated, since it missed ADR-027 entirely. This record adds two, and they are different in kind. The title names the **new** shape, because a decision has to be identifiable by what it decided. The Context names **both**, because the divergence between them is the problem being recorded; its pre-change figure is tensed as past for that reason, and it is the only place in this record a grep for the old band string lands. The rejected third option is worded to hold the old bands without restating their numerals, so it does not become a third. That count is of the band **table** string, which is what an agent greps and misreads as current. It is not a count of every sentence from which the boundary can be derived: the restored-parenthetical consequence says Low's ceiling is 5 and Medium starts at 6, and the worked example turns on `3 x 2 = 6` being above appetite. Both would rot if the bands moved again, which the Reassessment Criteria names as a live trigger. They are excluded because each is reasoning about a specific claim rather than a copy of the table, and neither can be lifted out and read as the rule. If the bands do move again, those two are among the passages to re-read, along with the composition-constraint bullet's "both cells are labelled Low inside a Low appetite" and the problem-severity bullet's "which now reads Low". This sentence is the pointer to all four.

**Watch**

- ADR-007 line 78 and its rendered compendium entry still read "Commit gate blocks
at score >= 5", which is false against the enforcement surface, and it is the one stale string that could produce a wrong compliance verdict from a correct implementation. Left to P128 rather than fixed here, because P128 owns the restatement inventory and this record should not become the eleventh restatement. The same applies to ADR-007's own Labels table, three lines above the parenthetical this record describes as restored, which still carries the old band shape. P128's inventory is threshold-scoped and does not list it, so the band change adds a new instance of exactly the class P128 records. It is logged into P128 in the same iteration rather than corrected here. The generic 2026-08-07 pointer at ADR-007 line 15 covers it in the meantime.

## Confirmation

- `RISK-POLICY.md` Label Bands read the adopted shape, the appetite line is
unchanged in value, and the composition constraint is present. Verified by `wr-risk-scorer:policy`, `RISK_VERDICT: PASS`, which also confirmed no passage still asserts the old bands or the old `< 5` boundary.
- The gate's own parse was traced against the amended file by
`wr-risk-scorer:pipeline` before the commit landed: the `## Risk Appetite` section scope resolves, `Threshold:\s*(\d+)` captures 5 from `**Threshold: 5 (Low)**`, and every fallback branch also yields 5. Commit scored 4 (Low), within appetite.
- `docs/decisions/README.md` carries an ADR-049 entry in the In-force section, and a
reciprocal `Related: ADR-049` on the ADR-027 entry, both written by the `architect-compendium-update-entry.sh` PostToolUse hook when this file landed. That was planned as a hand edit and did not need to be: the hook fires on ADR writes and is the live replacement for the full-file generator, which P128 line 53 and P087 record as deprecated here and which now self-declares deprecated upstream. Two things the hook does not do, and this commit does by hand. It writes em-dashes, which this repo's `no-em-dash` hook rejects, so the entries are scrubbed to hyphens in the same commit. And it does not update the section's two derived counts, so those are corrected by hand. Both are the standing P087 workaround, not new divergence.
- [ ] A pipeline assessment lands a residual of exactly 5 and prints it as Low with
its likelihood-1 control named, exercising the constraint rather than only asserting it.
- [x] Tom read and ratified this record in session on 2026-08-09.

## Reassessment Criteria

Revisit if:

- A residual of 5 starts appearing regularly with the likelihood-1 control asserted
rather than named. That is the constraint failing quietly, and the band change is what removed the label that used to make such a score conspicuous.
- Upstream moves its bands again, re-opening the divergence this closes.
- The single-matrix-for-two-consumers assumption becomes painful, that is, a problem
severity of 5 starts meaning something different from a pipeline residual of 5 in practice. Option 4 becomes live at that point.

## Related

- **Upstream ADR-086** (`agent-plugins`, not local): the band shape adopted here and
the source of the scoring agent's table. Precedent, not authority.
- **ADR-007** (risk matrix calculation): its product model stands. Its subordinate
Labels table and numeric threshold clauses are partly overridden by this record and by `RISK-POLICY.md`. Deliberately not renamed `.superseded.md`: the formula is live, and that convention would route it into the compendium's Historical section.
- **ADR-008**: restates the threshold only, never the bands. Untouched, and already
pointered.
- **ADR-027**: third carrier of the stale figures, in its Decision Outcome and again
in its Neutral consequences, and the only one asserting the bands are unchanged. Pointered in this iteration, after its `## Context and Problem Statement` heading, matching where ADR-007 and ADR-008 carry theirs.
- **P128** (`docs/problems/known-error/128-risk-threshold-restated-in-ten-places-with-no-single-source-of-truth.md`):
the restatement inventory. This record closes three of its five investigation tasks, the band-fork rationale, the `max()` lineage, and the enforcement gap as an accepted limitation. It also corrects the ticket's semantic-divergence claim and adds ADR-027 to its inventory.
- **P082**: why every cross-repo ADR citation here is written as "upstream ADR-086".
- **JTBD**: no reader job is anchored, and none is needed. This is governance
vocabulary with no visitor or reader surface, and nothing in the Job-to-Screen Mapping touches risk-band labels. P121 records that "this corpus does not require every check to trace to a JTBD". The nearest persona is `internal-maintainer`, ratified 2026-08-09. Its jobs cover trusting the loop's output, deciding from a phone, and landing a fix where the defect lives; none of them is about what a risk score is called, so citing it here would be an anchor of convenience rather than a real trace. Confirmed by `wr-jtbd:agent`.
