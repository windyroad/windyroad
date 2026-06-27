# Problem 104: I13 RFC-trace predicate and manage-problem I13 gate are not adopter-aware (fire no-rfc-trace in repos without an RFC tier)

**Status**: Open
**Reported**: 2026-06-27
**Priority**: 3 (Medium) - Impact: 3 x Likelihood: 1 (deferred - re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: M (deferred - re-rate at next /wr-itil:review-problems)

## Description

The I13 propose-fix RFC-trace predicate (`wr-itil-check-fix-rfc-trace`) and the `manage-problem` SKILL I13 gate are not adopter-aware. They emit `no-rfc-trace: P<NNN> ... auto-create a problem-traced RFC via /wr-itil:capture-rfc` and direct an RFC auto-create even in consumer repos that never adopted the RFC tier (no `docs/rfcs/` directory, zero RFC history in git). The predicate is a naive grep: it sees "no RFC traces this problem" and cannot distinguish "RFC tier exists but this problem lacks a trace" (the real Phase-2 case it is designed for) from "this repo has no RFC tier at all" (a Phase-1 adopter, where the directive is a false positive). Acting on the directive would bootstrap an entire governance tier (`docs/rfcs/`, RFC-001, the RFC README, lifecycle skills) for what may be a trivial doc fix, which is a direction-setting framework-adoption decision, not a mechanical fix-time auto-create.

Hit twice in this consumer repo (the windyroad website, which has `docs/problems/` + `docs/decisions/` + `docs/jtbd/` but no RFC/story tiers):

- **P070** (closed 2026-06-16): closure note records "I13 RFC-trace gate noted as non-actionable (RFC tier unadopted in this consumer repo; fix-design trace carried by ADR-032)."
- **P103** (verifying 2026-06-27): the predicate fired `no-rfc-trace: P103` while working the fix; the agent verified the premise (`docs/rfcs/` absent, zero RFC history), recognised the false positive, and fell back to the legacy direct-implementation path per the P070 precedent rather than bootstrapping the tier.
- **P101** (verifying 2026-06-27): the predicate fired `no-rfc-trace: P101` during the AFK work-problems iteration; the agent verified the premise (`docs/rfcs/` absent, zero RFC history in `origin/master`), recognised the false positive, and used the legacy direct-implementation path per the P070 / P103 precedent. This is the third occurrence.

Each occurrence forces the working agent to recognise the false positive out-of-band and apply the P070 precedent manually. The recognition cost has now been paid three times (P070, P103, P101); this is the consolidation signal for /wr-itil:review-problems to prioritise the upstream adopter-aware fix.

## Symptoms

(deferred to investigation)

## Workaround

Recognise the false positive (verify `docs/rfcs/` is absent and git carries zero RFC history) and fall back to the SKILL's documented Phase-1 legacy direct-implementation path, carrying the fix-design trace on the problem ticket plus any cited ADR (the P070 / P103 precedent). Do NOT auto-create an RFC.

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: (deferred to investigation)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Investigate root cause (predicate has no adopter-tier detection)
- [ ] Create reproduction test

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P070 (closed), P103 (verifying) - both hit the same I13 false positive

## Fix Strategy (hypothesis - verify placement per P045)

Make the I13 detection adopter-aware so it no-ops in Phase-1 adopter repos. Candidate: `wr-itil-check-fix-rfc-trace` returns empty (no directive) when `docs/rfcs/` is absent AND git carries zero RFC history; OR the `manage-problem` SKILL I13 gate gains an explicit Phase-1-adopter carve-out (mirroring the existing "Legacy direct-implementation path"). The predicate and SKILL both live in the upstream `@windyroad/itil` plugin (`packages/itil/scripts/check-fix-rfc-trace.sh` + `packages/itil/skills/manage-problem/SKILL.md`), so the fix home is upstream, not this repo. Per P045 discipline this placement is a hypothesis: verify the domain fit and that the maintainers accept the carve-out before treating "upstream-blocked" as load-bearing. Recommending placement to the external repo is at most a proposal.

## Related

Captured via /wr-itil:capture-problem (run from /wr-retrospective:run-retro Step 4b Stage 1 during the AFK iteration that worked P103; expand at next investigation).

- Step 2b hang-off-check (fresh-context subagent) verdict: **PROCEED_NEW**. Rationale: the root cause is a tooling defect in the predicate/gate; both candidates merely cite having hit and worked around the false positive, neither IS the fix for the predicate, so they are sibling surfaces of this common parent. P103's own Fix Strategy explicitly queues "make the I13 predicate adopter-aware" as out-of-its-scope follow-up; P072's `docs/rfcs` mention is an incidental keyword (deps-refresh domain), not a shared root cause. The "hit twice (P070, P103)" recurrence is the consolidation signal for /wr-itil:review-problems.
- Title-only duplicate grep matched P087 (compendium em-dashes / adopter policies) on the "adopter" keyword only - unrelated; no merge.
