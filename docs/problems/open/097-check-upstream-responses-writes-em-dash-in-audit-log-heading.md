# Problem 097: upstream wr-itil check-upstream-responses.sh writes a U+2014 em-dash into the audit-log heading, tripping adopter no-em-dash hooks every Step-0d pass

**Status**: Open
**Reported**: 2026-06-17
**Priority**: 4 (Low). Impact: Minor (2) x Likelihood: Unlikely (2) (re-rated 2026-07-15 review: fires only on check-upstream-responses passes; manual strip is cheap)
**Origin**: internal
**Effort**: S (file upstream report; local manual strip meanwhile)
**WSJF**: 4.0 = (4 x 1.0) / 1

## Description

During this session's Step 0d outbound-responses pre-flight, the wr-itil 0.50.1 `check-upstream-responses` skill wrote an audit-log heading of the form `## <ts> <EMDASH> Outbound response check pass` containing a U+2014 em-dash, which trips this repo's P025 no-em-dash PreToolUse/PostToolUse hooks on every pass. The pre-flight had to strip it manually and the script reintroduces it on the next run.

Candidate fix (UPSTREAM, in `@windyroad/wr-itil` `check-upstream-responses`): emit an ASCII separator (`" - "` or `:`) in the audit-log heading instead of a U+2014 em-dash, so adopter repos with no-em-dash policies do not trip.

This is upstream-bound: the fix lives in `@windyroad/wr-itil` `check-upstream-responses`, not authorable in this consumer repo. Flag as a candidate for `/wr-itil:report-upstream`.

## Symptoms

(deferred to investigation)

## Workaround

(deferred to investigation)

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: (deferred to investigation)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Investigate root cause
- [ ] Create reproduction test

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

- **Reported upstream**: https://github.com/windyroad/agent-plugins/issues/319 (2026-07-03)

- Captured via /wr-itil:capture-problem (lightweight aside).
- no-em-dash sibling family (hang-off-check verdict PROCEED_NEW, 2026-06-17): shares the "upstream emitters should respect adopter no-em-dash policies" family root with P087, but P087 is a different plugin (wr-architect), script (generate-decisions-compendium), and surface (docs/decisions/README.md). Neither candidate is a master that absorbs this scope. Cluster P087 with this ticket at the next /wr-itil:review-problems pass.
  - P087 (`docs/problems/open/087-wr-architect-generate-decisions-compendium-emits-em-dashes-violating-adopter-no-em-dash-policies.md`): same phenomenon class, distinct upstream tool and fix locus.
  - P030 (`docs/problems/open/030-work-problems-skill-md-marker-wording-uses-em-dash.md`): em-dash there is a contractual whitelisted marker, not an incidental separator.
  - P057 (`docs/problems/verifying/057-no-em-dash-edit-tool-hook-lacks-contractual-marker-whitelist.md`): local hook-side asymmetry, not an upstream emitter defect.
- Upstream-bound: candidate for /wr-itil:report-upstream against `@windyroad/wr-itil`.
- Recurrence 2026-07-15: the wr-itil 0.59.0 pass reintroduced the U+2014 em-dash in the audit-log heading; normalized to the colon form before the ADR-014 commit. Upstream issue 319 still OPEN with no maintainer response as of the 2026-07-15 outbound-responses poll. A /wr-itil:capture-problem aside on the same observation halted as a duplicate of this ticket.
- Recurrence 2026-08-08: still reproduces on the wr-itil 0.59.2 skill (bin shim resolved the 0.59.0 script body); heading normalized to the colon form before the ADR-014 commit. Upstream issue 319 still OPEN with no maintainer response as of the 2026-08-08 outbound-responses poll.

**Anchoring: JTBD-402 (Land the fix where the defect lives), Internal Maintainer persona.** The header lines carried at capture, `**JTBD**: JTBD-007` and `**Persona**: plugin-developer`, have been removed. Both were upstream `agent-plugins` values; neither resolves here. There is no local JTBD-007 and `plugin-developer` is not one of this repo's five personas, so unlike its siblings this pair was dangling rather than misresolving. `docs/jtbd/internal-maintainer/` models the person who pays for it. JTBD-402 is the right job rather than JTBD-400 because `/wr-itil:check-upstream-responses` is one of that job's named screens and the defect is on the outbound path itself: it is the job's third outcome, that the path works rather than charging a manual strip on every pass. Two months of recurrences on a still-open upstream issue, filed 2026-07-03 and reproduced twice since, is also the job's first outcome under strain: a wait that is meant to be a staging state and has not moved. The persona and job are `human-oversight: unconfirmed` pending `/wr-jtbd:confirm-jobs-and-personas`, so this anchoring is provisional. Recorded in prose rather than `**JTBD**` / `**Persona**` header lines, per local convention.

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/319
- **Reported**: 2026-07-03
- **Template used**: structured default (problem-shaped)
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes
