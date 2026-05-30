# Problem 071: ADR-016 parameterised sw-critic pattern has poor discoverability + UX; supersede with domain-specific critic agents

**Status**: Open
**Reported**: 2026-05-30
**Priority**: 3 (Medium). Impact: 2 x Likelihood: 4 (deferred. re-rate at next /wr-itil:review-problems)
**Effort**: M (deferred. re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

ADR-016 (sw-critic subagents and iteration loop) chose a single parameterised `wr-sw-critic` subagent with rubric files passed as arguments. The user-noted weakness in this pattern surfaced during the 2026-05-30 `/wr-architect:review-decisions` drain: **parameterised skills have poor discoverability and UX**.

User direction (2026-05-30, ADR-016 rejection in architect oversight drain): supersede with a non-parameterised pattern (likely domain-specific critic agents, e.g. `wr-newsletter-critic`, `wr-wardley-critic`, ADR-016 Option 2 which was originally rejected). The "single agent + many rubrics" pattern that ADR-016 chose for rubric reusability is now traded off against discoverability/UX cost: a parameterised agent is opaque to readers (you can't tell what it does without inspecting the invocation); domain-named agents self-document.

## Symptoms

- Reader of agent surface cannot tell at a glance what `wr-sw-critic` actually critiques (depends on rubric arg passed at call site).
- New artifact types (newsletter, wardley map, blog post, social post) each require new rubric authoring + plumbing in the calling skill; agent count stays small but cognitive load per artifact stays high.
- ADR-018 (`wr-content-risk-scorer`) followed ADR-016's pattern and is also parameterised; the supersede may cascade to ADR-018 too (re-evaluate after this ADR's rework).

## Workaround

(deferred to investigation; the parameterised pattern works mechanically; the friction is reader UX + discoverability)

## Impact Assessment

- **Who is affected**: every developer reading the agent definitions; future-Tom maintaining the critic pattern; downstream adopters of agent-plugins if any.
- **Frequency**: per-agent-definition-read frequency (estimated weekly via session-start agent enumeration).
- **Severity**: Medium. Mechanically the pattern works; discoverability cost compounds as artifact types grow.

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems.
- [ ] Evaluate the supersede shape: ADR-016 Option 2 (two domain-specific critics: wr-wardley-critic, wr-newsletter-critic) was originally rejected on "duplicates the critic logic" grounds; re-evaluate that trade-off in light of the discoverability+UX cost.
- [ ] Determine whether ADR-018's content-risk-scorer (which followed ADR-016's pattern) should also be superseded or kept as parameterised (different cost-benefit because content-risk axes are more stable than critic rubrics).
- [ ] Author the superseding ADR via /wr-architect:create-adr (will be ADR-031 or later, depending on which other ADRs land first).

## Dependencies

- **Blocks**: ADR-016 final-status. Until this ticket lands a superseding ADR, ADR-016 carries `human-oversight: rejected-pending-supersede` marker.
- **Blocked by**: (none, ready to investigate when prioritised)
- **Composes with**: ADR-018 (followed the same parameterised pattern; potential cascade supersede). P064 (Newsletter critic round-3 budget exhausted, touches sw-critic surface; may compose if both reworks land together).

## Related

- Captured via `/wr-itil:capture-problem` on 2026-05-30 during `/wr-architect:review-decisions` drain after user rejected ADR-016.
- ADR-016 frontmatter carries `human-oversight: rejected-pending-supersede` + `supersede-ticket: P071`.
- Rationale verbatim from user: "Parameterised skills have poor discoverability and UX".
