# Problem 097: upstream wr-itil check-upstream-responses.sh writes a U+2014 em-dash into the audit-log heading, tripping adopter no-em-dash hooks every Step-0d pass

**Status**: Open
**Reported**: 2026-06-17
**Priority**: 3 (Medium). Impact: 3 x Likelihood: 1 (deferred: re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: M (deferred: re-rate at next /wr-itil:review-problems)
**JTBD**: JTBD-007
**Persona**: plugin-developer

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

- Captured via /wr-itil:capture-problem (lightweight aside).
- no-em-dash sibling family (hang-off-check verdict PROCEED_NEW, 2026-06-17): shares the "upstream emitters should respect adopter no-em-dash policies" family root with P087, but P087 is a different plugin (wr-architect), script (generate-decisions-compendium), and surface (docs/decisions/README.md). Neither candidate is a master that absorbs this scope. Cluster P087 with this ticket at the next /wr-itil:review-problems pass.
  - P087 (`docs/problems/open/087-wr-architect-generate-decisions-compendium-emits-em-dashes-violating-adopter-no-em-dash-policies.md`): same phenomenon class, distinct upstream tool and fix locus.
  - P030 (`docs/problems/open/030-work-problems-skill-md-marker-wording-uses-em-dash.md`): em-dash there is a contractual whitelisted marker, not an incidental separator.
  - P057 (`docs/problems/verifying/057-no-em-dash-edit-tool-hook-lacks-contractual-marker-whitelist.md`): local hook-side asymmetry, not an upstream emitter defect.
- Upstream-bound: candidate for /wr-itil:report-upstream against `@windyroad/wr-itil`.
