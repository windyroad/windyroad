# Problem 179: Age-based decision promotion never reads human-oversight, so an unratified ADR self-accepts

**Status**: Verification Pending
**Reported**: 2026-08-30
**Priority**: 9 (Medium), Impact: 3 x Likelihood: 3, derived at capture. Impact is 3 because the loss is confined to governance records and nothing reaches a reader, but the record it corrupts is the one the architect gate reads as current rule: a decision nobody approved would present itself as validated, and every downstream compliance review would then enforce it. Likelihood is 3 because the trigger is ordinary release cadence rather than an unusual sequence, but it only bites on a record carrying `human-oversight: unconfirmed`, and until 2026-08-30 no such record had ever been committed here.
**Origin**: internal
**Effort**: S, derived at capture. One guard clause in a local script plus behavioural coverage. Entirely repo-local.
**WSJF**: 9.0 = (9 x 1.0) / 1

## Description

`scripts/post-release.d/stamp-and-promote-decisions.sh` pass 2 promotes a decision from `status: proposed` to `status: accepted` on age alone. It reads `first-released`, compares it against `DECISION_PROMOTION_DAYS` (default 14), and on exceeding the threshold rewrites the status field, adds `accepted-date`, and `git mv`s the file to `.accepted.md`. It never reads `human-oversight`.

Every proposed ADR on disk before 2026-08-30 carried `human-oversight: confirmed`, verified by reading the frontmatter of all 42 `.proposed.md` records. That is why the gap never fired: the guard was supplied by the corpus rather than by the code. ADR-058 is the first `unconfirmed` record in the decision corpus, so it is the first record for which age-based promotion and ratification disagree. Scope that claim to ADRs: RFC-001 through RFC-005 have carried `human-oversight: unconfirmed` since 2026-07-15, but this promoter only walks `docs/decisions/`, so those were never exposed to it.

Left unguarded, ADR-058 would have been rewritten to `accepted` roughly 14 days after its first release, with no person having read it. The architect agent reads accepted decisions as current rules, so an unratified decision would have become enforceable, and the ratification ADR-054 protects would have been bypassed rather than obtained.

## Symptoms

- A record carrying `human-oversight: unconfirmed` changes status without any human action.
- The promotion is silent: the script's only output is a one-line `Promoted ...` on the post-release log.
- Nothing downstream re-checks ratification, because `accepted` is itself the signal that ratification happened.

## Workaround

None was in place. The corpus-wide `confirmed` marker was an accident of history, not a control.

## Impact Assessment

- **Who is affected**: the Internal Maintainer persona, and every gate-mediated change reviewed against the decision corpus.
- **Frequency**: not observed in production. Caught by architect review of the ADR-058 draft before that record's first release, so the exposure window never opened.
- **Severity**: no wrong output reaches a reader. The cost is a governance record asserting an approval that never happened.
- **Analytics**: none.

## Root Cause Analysis

### Root Cause

The promotion rule encoded one of the two conditions for accepting a decision. Age was treated as a proxy for "nobody objected", which is only equivalent to ratification when somebody was asked. The script predates the `human-oversight` marker and was never revisited when that marker was introduced.

### Investigation Tasks

- [x] Read the script and confirm pass 2 reads no oversight field. Confirmed 2026-08-30: pass 2 reads `first-released` only.
- [x] Confirm ADR-058 is the first `unconfirmed` proposed record. Confirmed 2026-08-30: 42 of 43 proposed records carry `confirmed`; only 058 carries `unconfirmed`.
- [ ] Check whether the same age-as-proxy shape exists in any sibling post-release hook.

## Fix Strategy

Guard promotion on `human-oversight: confirmed`, failing closed when the field is absent, so age becomes necessary but never sufficient. Stamping (pass 1) stays unguarded, because recording when a record first shipped is a fact about the release and not a claim about ratification.

Landed 2026-08-30 in the same commit as this ticket, with behavioural coverage in `scripts/stamp-and-promote-decisions.test.mjs`: five cases covering confirmed-and-aged (promotes), unconfirmed-and-aged (does not), no-marker-and-aged (does not), confirmed-but-young (does not), and stamping an unconfirmed record (still stamps).

## Verification

Verifies when ADR-058 passes 14 days from its first release while still carrying `human-oversight: unconfirmed`, and a post-release run leaves it at `status: proposed`. Until then the test suite is the only evidence, and it exercises the guard rather than the release path.
