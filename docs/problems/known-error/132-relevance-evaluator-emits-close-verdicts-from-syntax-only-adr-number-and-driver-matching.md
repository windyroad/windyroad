# Problem 132: Relevance evaluator emits CLOSE verdicts from syntax-only ADR-number and driver matching

**Status**: Known Error
**Reported**: 2026-08-08
**Priority**: 8 (Medium), Impact: 2 x Likelihood: 4, derived at capture from the description. Impact is 2 because nothing reader-facing is at stake: the evaluator is dev tooling whose verdict feeds an orchestrator or operator decision, and both observed failures were caught before anything closed. It is not 1 because the failure direction is toward loss rather than friction: the verdict is a confident CLOSE on a live ticket, phrased with cited evidence, on a surface where an operator batch-reviewing 24 candidates is invited to trust it. Likelihood is 4 because nothing automated checks the verdict, it fired on two independent surfaces on the same day through two different shapes, and one review pass surfaced 24 candidates of which none survived verification.
**Origin**: internal
**Effort**: S, derived at capture. Two localised predicate changes in one script (qualify shape 2's ADR match; gate shape 5 on the declared relationship) plus cases alongside the existing `packages/itil/scripts/test/evaluate-relevance.bats` fixtures. Same size class as P129 and P131, both rated S for guard-clause changes in a single script. Witness C (2026-08-09) adds a third predicate change, a remedy-vs-mention test on shape 2. Still S, still one script, but it is at the top of the band now rather than the middle.
**WSJF**: 16.0 = (8 x 2.0) / 1 (re-rated 2026-08-28 review: Open -> Known Error auto-transition, status multiplier 1.0 -> 2.0)

## Description

The wr-itil relevance evaluator (`packages/itil/scripts/evaluate-relevance.sh`, consumed by `/wr-itil:review-problems` Step 4.6 and `/wr-itil:work-problems` Step 3.6) emits confident CLOSE verdicts on tickets that must stay open, because two of its five evidence shapes match on syntax without checking semantics.

**Shape 2 (`ADR-shipped-confirmed`)** greps the ticket body for the bare regex `\bADR-[0-9]{3}\b` and resolves the number against `docs/decisions/<NNN>-*.md` with no repo or namespace qualification. Tickets in this repo routinely cite UPSTREAM agent-plugins ADR numbers, which collide with unrelated local ADRs of the same number, so a citation of an upstream decision is reported as evidence that a local decision shipped.

**Shape 5 (`driver-child-ticket-closed`)** parses the `## Related` section for `P<NNN>` refs and counts any closed one as a closed "driver". It never checks whether the ticket declared that ref as a driver rather than as a "composes with ... distinct concerns" sibling, so mere co-mention in `## Related` is treated as a dependency.

Three independent witnesses, all failing in the expensive direction (a confident CLOSE on a ticket that must stay open). Two on 2026-08-08 through two different shapes, and a third on 2026-08-09 where both shapes fired on one ticket at once and shape 2 failed in a second, distinct way.

**Witness A**, `/wr-itil:review-problems` Step 4.6: 24 candidates surfaced, 0 survived verification, nothing closed. Reproduced by running the script directly: P055 cites upstream ADR-013/014/032 and the evaluator cited local `docs/decisions/013-no-automated-linkedin-scraping.proposed.md` and `014-wardley-mapping-as-strategic-lens.proposed.md` as the shipped evidence; P054 cites the upstream Decision-Delegation Contract ADR-044 and the evaluator cited local `044-cross-edition-shape-as-a-fresh-context-subagent-gate.proposed.md`.

**Witness B**, `/wr-itil:work-problems` Step 3.6, this session: P118 returned `CLOSE-CANDIDATE-WITH-CAVEAT` citing P040/P041/P078 as closed drivers, but P118 lists those three under "Composes with ... same publish/draft-lifecycle area, distinct concerns", and P118 is a live, reproduced bug. The orchestrator overrode the verdict as a false positive.

**Witness C**, `/wr-itil:work-problems` Step 3.6, 2026-08-09, on P115. Both shapes fired on one
ticket at once. Reproduced directly by running
`wr-itil-evaluate-relevance docs/problems/known-error/115-site-changes-without-changeset-silently-never-release-to-production.md`,
which exits 0 and emits a single `CLOSE-CANDIDATE-WITH-CAVEAT` line. Decomposed into its fields
(the script prints them on one line, separated by long dashes this repo's edit gate will not accept
verbatim):

```
verdict: CLOSE-CANDIDATE-WITH-CAVEAT
ticket:  115-site-changes-without-changeset-silently-never-release-to-production.md
shapes:  ADR-shipped-confirmed,driver-child-ticket-closed
caveat:  multi-phase-mixed-progress: 0 task(s) done, 2 outstanding, confirm umbrella scope before close
cites:   ADRs human-oversight-confirmed: ADR-041 (docs/decisions/041-retire-consulting-funnel-repurpose-as-the-shift-hub.proposed.md);
         drivers closed: P012 (docs/problems/closed/012-no-ship-gate-on-push-publish-deploy.md)
```

The shape 5 half repeats Witness B exactly: P115 lists P012 under `**Composes with**`, and its
`## Related` spells out the distinction in words, "P012 gates on red CI; this ticket is the distinct
missing-changeset-authoring nudge". The evaluator reads the number and not the sentence disowning it.

**The shape 2 half is a different failure mode from Witness A, and that is what makes Witness C
worth recording.** ADR-041 is genuinely local, correctly resolved, and genuinely
`human-oversight: confirmed`. There is no cross-repo number collision anywhere in this one. The
verdict is still wrong, because P115 does not cite ADR-041 as its fix. It cites it as its
**exhibit**: ADR-041's consulting-funnel retirement is the change that sat unreleased on master for
a week, which is the concrete failure the ticket was filed to describe. Shape 2 cannot tell "the ADR
that fixed this" from "the ADR whose release this ticket is about".

The dates make the inversion exact. ADR-041 was oversight-confirmed 2026-07-14 and P115 was reported
2026-07-14. Both entries date from the one session where Tom saw the old funnel still live and asked
"did you release???", so the ADR was confirmed and the ticket was filed because of the same failure.
The evidence shape 2 cites as proof of closure is the defect's own footprint.

This widens the root cause below. Namespace qualification alone would not have caught Witness C:
shape 2 also has to establish that a confirmed ADR is the citing ticket's *remedy* rather than
merely a number present in its body. It is also direct evidence for the upstream `#306` mode (a
genuinely local, genuinely confirmed ADR read as proof the citing ticket's work shipped), which
strengthens the case recorded below for folding `#414` into `#306`.

Fix direction: qualify shape 2's ADR match by repo or namespace, AND require the matched ADR to be
the ticket's declared fix rather than any ADR named anywhere in its body (Witness C fails the second
test even with the first in place); gate shape 5 on the relationship the ticket actually declares
rather than on mere presence in `## Related`.

## Recurrence 2026-08-26, at scale, with a mode the ticket does not yet describe

A `/wr-itil:review-problems` pre-flight ran the Step 4.6 evaluator across the whole backlog and flagged **44 of 65 tickets, 68 percent, as no-longer-relevant**, including tickets captured that same day. Nothing was closed; the pass read its own verdict set, judged it unsound, and declined.

Two of this ticket's recorded shapes reproduced word for word. P055 cites upstream ADR-013, ADR-014 and ADR-032 and was reported superseded by the local decisions carrying those numbers, which are about LinkedIn scraping and Wardley mapping. The co-mention shape fired too, on tickets whose `## Related` section explicitly files the co-mentioned ticket under composes-with-distinct-concerns.

The tell is that **the evaluator flagged this ticket as a close candidate**, via the syntax-only ADR match this ticket was written about.

**A third mode, not previously recorded here: cited evidence that is not in the ticket at all.** Run against P128 the same day, the verdict emitted `CLOSE-CANDIDATE ... shapes: ADR-shipped-confirmed` and listed fifteen ADRs as human-oversight-confirmed evidence. Checked against P128's actual text on 2026-08-26, the ticket references ADR-007 twenty-six times, ADR-049 twenty-one, ADR-027 fourteen, ADR-054 thirteen and ADR-008 eleven, plus single mentions of ADR-041, ADR-042 and ADR-043 and two of ADR-052. It does not mention ADR-018, ADR-019, ADR-020, ADR-026 or ADR-032 anywhere.

Five of the fifteen cited ADRs appear nowhere in the ticket they are offered as evidence about. That is not a number collision between namespaces, which is what this ticket currently describes: a collision still requires the number to be present in the ticket. Where those five came from is unknown and worth finding, because the two modes need different fixes. A namespace check repairs the collision mode and does nothing for this one.

The heavily-cited ADRs are the second half of the problem. ADR-007, ADR-049, ADR-027, ADR-054 and ADR-008 are genuinely local and genuinely relevant to P128, and they are genuinely ratified. Their being confirmed is the ticket's context, not evidence its fix shipped: P128 is about a threshold restated in ten places, and those decisions being ratified is precisely why it still needs doing. So even the correctly-resolved citations are being read as close evidence when they are nothing of the kind.

**What this changes for the priority.** The Impact 2 rating rests on "both observed failures were caught before anything closed", which still holds: three passes, three declines. But the Likelihood-4 reasoning that nothing automated checks the verdict is now joined by a scale figure. At 68 percent flag rate an operator batch-reviewing is not spot-checking a few candidates, they are being asked to overturn a two-thirds majority, and the one surface that consumes this verdict without a human is `/wr-itil:work-problems` Step 3.6, which routes a clean CLOSE-CANDIDATE into an AFK sweep that closes silently. Re-rating is a review-time decision, not one to make inside this note, but the evidence for it is recorded here.

**One thing that did work, worth keeping.** Every one of the three passes declined to act. Two were subagents that reached the judgement independently, and the ticket's own presence in the flagged set is what made the unsoundness obvious rather than arguable.

## Symptoms

- `evaluate-relevance.sh` returns exit 0 with `CLOSE-CANDIDATE` or `CLOSE-CANDIDATE-WITH-CAVEAT` on tickets whose defect is live and reproducible.
- The cited evidence names a local ADR file the ticket was never talking about, or names sibling tickets the ticket explicitly called distinct.
- On `/wr-itil:review-problems` Step 4.6 the false positives arrive in bulk (24 in one pass), so the per-verdict verification cost is paid many times over for zero closures.

## Workaround

Read the cited evidence back against the ticket body before acting on any CLOSE verdict: check that each cited ADR is the one the ticket meant (local vs upstream), and that each cited `P<NNN>` was declared as a driver rather than as a "composes with" sibling.

## Impact Assessment

- **Who is affected**: whoever runs the problem-backlog loop, whether interactively via `/wr-itil:review-problems` or AFK via `/wr-itil:work-problems`.
- **Frequency**: both consuming surfaces, every pass. One review pass produced 24 false positives.
- **Severity**: Minor in observed harm (wasted verification cycles), but the failure direction is toward loss: a trusted CLOSE on a live ticket.
- **Analytics**: not applicable (dev tooling; no visitor or reader surface).

## Root Cause Analysis

Both shapes are string-presence tests standing in for semantic relationships.

Shape 2 fails in two independent ways, and each needs its own fix.

First, it treats an ADR number as globally unique when it is only unique within a repo. This repo and the upstream agent-plugins repo both number ADRs from 001, and local tickets cite both, so the namespace is genuinely ambiguous in the ticket text. That is Witness A.

Second, and only visible once the first is set aside, it treats *any* ADR named in the ticket body as the ticket's remedy. A ticket names ADRs for many reasons: the decision that caused the defect, the decision the defect was found while working on, a precedent argued against. Witness C is the sharpest case, where the cited ADR is the ticket's exhibit rather than its fix, and the ADR's confirmation date and the ticket's report date are the same day because one session produced both. Correct resolution and correct namespace are not sufficient: the shape needs the ADR to be the declared fix.

Shape 5 treats presence in `## Related` as a driver relationship. `## Related` is a mixed section by design, carrying drivers, siblings, supersessions, and capture provenance, so presence there carries no directional information.

The `A1` guard already in the script (suppress shape 5 when the child names an unbuilt SKILL/agent) is a narrow patch on the same underlying gap: it catches one way a non-driver relationship shows up, not the general case.

### Investigation Tasks

- [ ] Decide shape 2's qualification: require a repo/namespace marker adjacent to the ADR reference, restrict matching to ADRs the ticket cites in a local-path form, or drop bare-number matching.
- [ ] Decide shape 2's second gate (Witness C): require the matched ADR to be the ticket's declared remedy, not any ADR named in the body. Candidate signals are a `## Fix Strategy` / `## Fix Released` mention rather than a `## Related` one, or an explicit fix-ADR field. Namespace qualification does not cover this case.
- [ ] Decide shape 5's gate: parse the declared relationship (`Blocked by` or driver phrasing) rather than bare presence in `## Related`, and treat `Composes with` as explicitly non-qualifying.
- [ ] Add bats cases alongside `packages/itil/scripts/test/evaluate-relevance.bats` covering both witnesses (upstream-ADR-number collision; `Composes with` sibling closed).

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

**Anchoring: JTBD-400 (Trust what the loop did while I was away), Internal Maintainer persona.** The header-line anchoring left unconfirmed at capture is now settled: `docs/jtbd/internal-maintainer/` models the person who runs the problem-backlog loop, written 2026-08-08 on Tom's direction. This ticket is the sharpest evidence for that job's third outcome, that a verdict is grounded in the relationship it claims rather than in a string that resembles one, and for its fifth, that a surface whose output must be fully re-derived has negative value because it also carries the authority to be believed. Witness B is outcome 4, an override the loop absorbed silently. The fix site is upstream, so [JTBD-402](../../jtbd/internal-maintainer/JTBD-402-land-the-fix-where-the-defect-lives.proposed.md) governs how it lands. The persona and job are `human-oversight: unconfirmed` pending `/wr-jtbd:confirm-jobs-and-personas`, so this anchoring is provisional. Recorded in prose rather than `**JTBD**` / `**Persona**` header lines, per local convention; the header lines carried at capture have been removed.

Captured via `/wr-itil:capture-problem` during a `/wr-itil:work-problems` iteration on P118, after the orchestrator overrode the Step 3.6 verdict as a false positive.

**External root cause.** The script lives upstream in the agent-plugins marketplace and is consumed here from the read-only plugin cache (`~/.claude/plugins/marketplaces/windyroad/packages/itil/scripts/evaluate-relevance.sh`, remote `github.com/windyroad/agent-plugins`). There is no local copy to edit, so this is an upstream-report candidate per ADR-024, not a local fix.

**Hang-off pre-filter (capture Step 2b).** The mechanical pre-filter returned 20 candidates from `open/` and `verifying/`, over the candidate cap of 5, so the `wr-itil:hang-off-check` subagent dispatch was skipped per the skill's latency short-circuit and the candidate list is recorded here for review-time re-evaluation. The shared signals were the generic surface mentions `/wr-itil:review-problems` and `/wr-itil:work-problems`, not the evaluator itself: no candidate mentions `evaluate-relevance.sh`. Candidates: P054, P055, P056, P069, P074, P077, P088, P096, P097, P107, P127, P129, P131 (open); P050, P094, P099, P108, P120, P122, P126 (verifying). P054 and P055 are the two Witness A tickets, related as evidence rather than as parents.

**Title-only duplicate grep** matched only P043 (`newsletter-three-lens-scoring-leader-relevance-is-post-filter-not-in-scoring`, closed) on the keyword "relevance", an unrelated domain and not a duplicate.

- **Reported upstream**: https://github.com/windyroad/agent-plugins/issues/414 (2026-08-08)

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/414
- **Reported**: 2026-08-08
- **Template used**: structured default (problem-shaped); the upstream ships `problem-report.yml` but the body was filed in the equivalent free-form shape, matching the precedent of prior reports in that repo
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes (the issue body's `## Cross-reference` section names this ticket by path and ID)
- **Witness C added upstream**: 2026-08-09, https://github.com/windyroad/agent-plugins/issues/414#issuecomment-5227689280. External-comms PASS + voice-tone PASS. The comment also argues the fold-into-`#306` case, since Witness C is `#306`'s exact mode rather than this issue's originally reported one.

Dedup search on the upstream returned three same-script issues. Two are clearly distinct (#391 on a missing evidence shape for platform-version RCA, #392 on briefing carry-over). The third, #306, reports the same shape 2 symptom on a different root cause: an ADR that is genuinely local and confirmed being read as evidence the citing ticket's own work shipped, where the defect here is that the ADR resolved is not the one the ticket referred to at all. Shape 5 is absent from #306. Filed as a new issue cross-referencing #306 and #220 rather than as a comment, following the precedent #306 itself set when it cross-referenced #220 and #284. If the maintainer prefers them merged, #414 is the one to fold.

Both shapes were verified still present in the upstream HEAD copy of the script (530 lines, shape 2 at line 300, shape 5 at lines 418 to 445) before filing, not just in the locally cached 0.59.2 build.
