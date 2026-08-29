# Problem 175: AFK orchestrator's external-root-cause instruction still encodes the pre-ADR-048 park posture

**Status**: Open
**Reported**: 2026-08-29
**Priority**: 8 (Medium), Impact: 2 x Likelihood: 4, derived at capture from the description. Impact is 2 because nothing reader-facing is at stake and both observed cases were caught before a wrong disposition was written; it is not 1 because the failure direction is toward a decision the project has already ruled against, taken confidently and recorded in a ticket. Likelihood is 4 because the instruction fires on every upstream-rooted selection and two iterations hit it on a single day.
**Origin**: internal
**Effort**: S, derived at capture. One classifier row plus the standing per-iteration constraint prose. Same size class as P132, rated S for localised predicate changes in a single file. The edit site is the orchestrator instruction rather than a script, which does not change the size.
**WSJF**: 8.0 = (8 x 1.0) / 1 (first computed at the 2026-08-29 review; the capture skeleton wrote Priority and Effort but no WSJF line)

## Description

The AFK `/wr-itil:work-problems` orchestrator's standing per-iteration constraint for external-root-cause tickets reads: invoke `/wr-itil:report-upstream`, then classify the ticket upstream-blocked and skip further work on it. That is the pre-ADR-048 posture.

ADR-048, ratified here 2026-08-08, amends ADR-036. It makes an upstream pull request raised from the working clone at `~/Projects/agent-plugins` the default outbound artefact, treats a park as a staging state rather than a terminal one, and adds "the pull request merges" to the un-park trigger set. Its three carve-outs are narrow: the upstream does not accept contributions, the design call is genuinely someone else's, or the ticket is security-classified. Filing better issues and waiting is the alternative JTBD-402 names and rejects, and ADR-036 records that it is what produced a parked backlog at 94 percent upstream-blocked.

So every upstream-rooted iteration opens on a premise the project has already superseded, and the iteration has to spend review budget discovering that.

Two iterations hit it on 2026-08-29. The P130 iteration parked and reported upstream per the documented AFK fallback. The P132 iteration opened on the premise that no fix was possible, proposed a comment-and-park disposition, and needed both the architect and the JTBD reviewer to correct it independently before any disposition was written; both named ADR-048 and both named the clone on disk. Independent convergence is the strong signal, not two opinions.

The cost is two subagent dispatches per upstream-rooted iteration to rediscover a ratified decision, plus a standing bias toward the behaviour the decision exists to stop.

## Symptoms

- The per-iteration constraint text sent to each iteration names report-upstream and upstream-blocked classification as the whole disposition for an external root cause, with no mention of the pull-request path.
- Iterations propose park-and-comment for upstream-rooted tickets and are corrected by the governance reviewers rather than by the instruction.
- The correction costs an architect dispatch and a JTBD dispatch per occurrence.

## Workaround

Read ADR-048 before proposing a disposition on any ticket whose root cause is upstream, and treat "there is no local copy to edit" as a claim about this repository's tree rather than about whether a fix is possible. The briefing carries the same caution as of this session.

## Impact Assessment

- **Who is affected**: whoever runs the AFK problem loop, and every upstream-rooted ticket it selects.
- **Frequency**: every upstream-rooted selection. Two observed on 2026-08-29.
- **Severity**: Minor in observed harm, since the reviewers caught both. The direction is toward a decision the project ruled against.
- **Analytics**: not applicable (dev tooling; no visitor or reader surface).

## Root Cause Analysis

The instruction was written before ADR-048 existed and has not been revisited since. Nothing links the orchestrator's disposition vocabulary to the decisions that govern it, so a ratified amendment to ADR-036 does not reach the surface that acts on it.

The deeper shape is that the instruction encodes a conclusion (report upstream, then park) rather than the test the decision actually specifies (is the upstream contributable, is the design call ours, is this security-classified). An instruction that carried the test would have survived the amendment.

### Investigation Tasks

- [ ] Decide where the fix lands: the upstream `work-problems` SKILL classifier row, the local orchestrator prompt, or both. The SKILL is upstream in agent-plugins; the standing constraint text may be local.
- [ ] Rewrite the external-root-cause disposition to route to ADR-048's pull-request path, and require any park to name which of the three carve-outs it invokes.
- [ ] Check whether the same superseded posture appears in `/wr-itil:report-upstream` or the Parked lifecycle entry, which would widen the fix.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P069, P096

## Related

**Anchoring: JTBD-402 (Land the fix where the defect lives) and JTBD-400 (Trust what the loop did while I was away), Internal Maintainer persona.** JTBD-402 is the direct one: its second outcome makes a pull request the default and its anti-outcome list names filing better issues and waiting. The persona and both jobs carry `human-oversight: confirmed` as of 2026-08-09. Recorded in prose rather than header lines, per local convention.

Captured via `/wr-itil:capture-problem` during the retro of a `/wr-itil:work-problems` iteration on P132, where the correction happened.

P069 (ranking does not factor placement authority) and P096 (the orchestrator re-selects direction-blocked tickets) compose with this one and are distinct concerns. Those two are about which ticket the loop picks; this one is about what the loop is told to do once it has picked an upstream-rooted one. Fixing either of those does not fix this, and fixing this does not fix either of those.

P045 (the assistant accepts a ticket's upstream-placement framing without questioning it) is the nearest relative and is also distinct: it is about believing a ticket's claim, whereas this is about the instruction itself carrying a superseded claim.

**Hang-off pre-filter (capture Step 2b).** The mechanical pre-filter returned 8 candidates on the shared signals ADR-048, ADR-036 and `/wr-itil:report-upstream`, over the candidate cap of 5, so the `wr-itil:hang-off-check` subagent dispatch was skipped per the skill's latency short-circuit. The candidate list is recorded here for review-time re-evaluation: P074, P077, P096, P097, P131, P135, P137, P172.

**Title-only duplicate grep** on the keywords upstream, park and orchestrator matched P028, P045, P069, P097, P169, P171 and P033. None is a duplicate; P045 and P069 are related as described above.
