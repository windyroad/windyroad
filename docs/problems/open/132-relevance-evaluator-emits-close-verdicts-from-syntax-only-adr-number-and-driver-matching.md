# Problem 132: Relevance evaluator emits CLOSE verdicts from syntax-only ADR-number and driver matching

**Status**: Open
**Reported**: 2026-08-08
**Priority**: 8 (Medium), Impact: 2 x Likelihood: 4, derived at capture from the description. Impact is 2 because nothing reader-facing is at stake: the evaluator is dev tooling whose verdict feeds an orchestrator or operator decision, and both observed failures were caught before anything closed. It is not 1 because the failure direction is toward loss rather than friction: the verdict is a confident CLOSE on a live ticket, phrased with cited evidence, on a surface where an operator batch-reviewing 24 candidates is invited to trust it. Likelihood is 4 because nothing automated checks the verdict, it fired on two independent surfaces on the same day through two different shapes, and one review pass surfaced 24 candidates of which none survived verification.
**Origin**: internal
**Effort**: S, derived at capture. Two localised predicate changes in one script (qualify shape 2's ADR match; gate shape 5 on the declared relationship) plus cases alongside the existing `packages/itil/scripts/test/evaluate-relevance.bats` fixtures. Same size class as P129 and P131, both rated S for guard-clause changes in a single script.
**WSJF**: 8.0 = (8 x 1.0) / 1
**JTBD**: anchoring left explicitly unconfirmed. `docs/jtbd/` models four personas, all readers or the newsletter author; the affected party is whoever runs the problem-backlog loop in this repo, and no maintainer persona is modelled. Same convention as the P130 and P131 notes.
**Persona**: anchoring left explicitly unconfirmed, for the same reason.

## Description

The wr-itil relevance evaluator (`packages/itil/scripts/evaluate-relevance.sh`, consumed by `/wr-itil:review-problems` Step 4.6 and `/wr-itil:work-problems` Step 3.6) emits confident CLOSE verdicts on tickets that must stay open, because two of its five evidence shapes match on syntax without checking semantics.

**Shape 2 (`ADR-shipped-confirmed`)** greps the ticket body for the bare regex `\bADR-[0-9]{3}\b` and resolves the number against `docs/decisions/<NNN>-*.md` with no repo or namespace qualification. Tickets in this repo routinely cite UPSTREAM agent-plugins ADR numbers, which collide with unrelated local ADRs of the same number, so a citation of an upstream decision is reported as evidence that a local decision shipped.

**Shape 5 (`driver-child-ticket-closed`)** parses the `## Related` section for `P<NNN>` refs and counts any closed one as a closed "driver". It never checks whether the ticket declared that ref as a driver rather than as a "composes with ... distinct concerns" sibling, so mere co-mention in `## Related` is treated as a dependency.

Two independent witnesses on 2026-08-08, through two different shapes, both failing in the expensive direction (a confident CLOSE on a ticket that must stay open).

**Witness A**, `/wr-itil:review-problems` Step 4.6: 24 candidates surfaced, 0 survived verification, nothing closed. Reproduced by running the script directly: P055 cites upstream ADR-013/014/032 and the evaluator cited local `docs/decisions/013-no-automated-linkedin-scraping.proposed.md` and `014-wardley-mapping-as-strategic-lens.proposed.md` as the shipped evidence; P054 cites the upstream Decision-Delegation Contract ADR-044 and the evaluator cited local `044-cross-edition-shape-as-a-fresh-context-subagent-gate.proposed.md`.

**Witness B**, `/wr-itil:work-problems` Step 3.6, this session: P118 returned `CLOSE-CANDIDATE-WITH-CAVEAT` citing P040/P041/P078 as closed drivers, but P118 lists those three under "Composes with ... same publish/draft-lifecycle area, distinct concerns", and P118 is a live, reproduced bug. The orchestrator overrode the verdict as a false positive.

Fix direction: qualify shape 2's ADR match by repo or namespace (or drop bare-number matching entirely), and gate shape 5 on the relationship the ticket actually declares rather than on mere presence in `## Related`.

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

Shape 2 treats an ADR number as globally unique when it is only unique within a repo. This repo and the upstream agent-plugins repo both number ADRs from 001, and local tickets cite both, so the namespace is genuinely ambiguous in the ticket text.

Shape 5 treats presence in `## Related` as a driver relationship. `## Related` is a mixed section by design, carrying drivers, siblings, supersessions, and capture provenance, so presence there carries no directional information.

The `A1` guard already in the script (suppress shape 5 when the child names an unbuilt SKILL/agent) is a narrow patch on the same underlying gap: it catches one way a non-driver relationship shows up, not the general case.

### Investigation Tasks

- [ ] Decide shape 2's qualification: require a repo/namespace marker adjacent to the ADR reference, restrict matching to ADRs the ticket cites in a local-path form, or drop bare-number matching.
- [ ] Decide shape 5's gate: parse the declared relationship (`Blocked by` or driver phrasing) rather than bare presence in `## Related`, and treat `Composes with` as explicitly non-qualifying.
- [ ] Add bats cases alongside `packages/itil/scripts/test/evaluate-relevance.bats` covering both witnesses (upstream-ADR-number collision; `Composes with` sibling closed).

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

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

Dedup search on the upstream returned three same-script issues. Two are clearly distinct (#391 on a missing evidence shape for platform-version RCA, #392 on briefing carry-over). The third, #306, reports the same shape 2 symptom on a different root cause: an ADR that is genuinely local and confirmed being read as evidence the citing ticket's own work shipped, where the defect here is that the ADR resolved is not the one the ticket referred to at all. Shape 5 is absent from #306. Filed as a new issue cross-referencing #306 and #220 rather than as a comment, following the precedent #306 itself set when it cross-referenced #220 and #284. If the maintainer prefers them merged, #414 is the one to fold.

Both shapes were verified still present in the upstream HEAD copy of the script (530 lines, shape 2 at line 300, shape 5 at lines 418 to 445) before filing, not just in the locally cached 0.59.2 build.
