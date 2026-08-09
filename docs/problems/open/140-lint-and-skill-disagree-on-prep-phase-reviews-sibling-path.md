# Problem 140: Lint and SKILL disagree on the prep-phase reviews sibling path

**Status**: Open
**Reported**: 2026-08-09
**Priority**: 12 (High). Impact: 3 x Likelihood: 4, derived at capture from the description per Step 4a
**Origin**: internal
**Effort**: M, derived at capture per Step 4a

## Description

The newsletter structure lint and the `wr-newsletter` SKILL contract disagree on where the prep-phase reviews sibling lives, so one of them is always wrong during prep.

Evidence, read from disk on 2026-08-09:

`scripts/check-newsletter-structure.sh` line 447 derives the sibling path mechanically as `reviews="${brief%.md}.reviews.md"`. During prep the brief is `<date>.prep.md`, so the lint looks for `<date>.prep.reviews.md`.

`.claude/skills/wr-newsletter/SKILL.md` step 16 prescribes the prep reviews artefact at `<draft-folder>/<publication-date>.reviews.md`, and step 0.5 binds `<prep-reviews-path>` to that same name when `phase=finalise` reads prep review blocks forward.

The two names differ only during prep, because that is the only phase where the brief filename carries a `.prep` infix. At finalise the brief is `<date>.md` and both derivations agree on `<date>.reviews.md`, which is why the published editions look consistent and the divergence has stayed invisible until now.

Observed consequence during the Issue 17 prep run: naming the file to satisfy the SKILL contract makes the lint emit `SKIP [m] ...: no reviews sibling at <date>.prep.reviews.md; gate-freshness not checked`, so the ADR-047 scored-digest staleness check never runs at prep. Naming it to satisfy the lint instead would make the finalise carry-forward at step 0.5 miss the file by construction, losing the prep residual advisories at the phase boundary. That is exactly the invariant SKILL.md states as "a prep-accepted residual must not disappear at the phase boundary".

Issue 17 resolved this by following the SKILL contract and accepting the lint SKIP, because the carry-forward is functional and the lint check is detection-only and degrades loudly rather than silently. That is a judgement call made under time pressure, not a fix.

Worth noting the ADR-047 check is documented as tuned to OVER-REPORT ("where uncertain, report stale"), which makes a silent-by-construction SKIP across the entire prep phase the opposite of its stated design intent.

Fix strategy is not obvious and should not be guessed. Either the lint learns the `.prep` infix, or the SKILL adopts the lint's mechanical derivation and step 0.5 is taught the prep-phase name, or the reviews sibling stops carrying the phase in its filename at all. Each has a different blast radius across ADR-026, ADR-047 and RFC-005.

## Symptoms

- Running `scripts/check-newsletter-structure.sh` against a prep-phase brief prints `SKIP [m] ...: no reviews sibling at <date>.prep.reviews.md; gate-freshness not checked`, even when a correctly-named reviews sibling exists beside it.
- The ADR-047 scored-digest staleness check therefore never executes during prep, for any edition.

## Workaround

Follow the SKILL contract (`<publication-date>.reviews.md`) and accept the lint SKIP. The finalise carry-forward is functional; the lint check is detection-only and its degraded state is loud rather than silent. Applied on Issue 17 (2026-08-10).

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: every prep-phase run of `/wr-newsletter`, for both personas
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Investigate root cause
- [ ] Create reproduction test
- [ ] Decide which side moves: lint learns the `.prep` infix, SKILL adopts the mechanical derivation and step 0.5 learns the prep name, or the sibling stops carrying the phase in its filename
- [ ] Check the blast radius of the chosen option across ADR-026, ADR-047 and RFC-005
- [ ] Confirm whether the same infix divergence affects any other `${brief%.md}.*` derivation in the lint

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

Captured via `/wr-itil:capture-problem` during the Issue 17 prep run; expand at next investigation.

Surfaced by the `wr-risk-scorer:pipeline` commit-gate assessment of the Issue 17 prep artefacts, which scored the divergence at inherent 12/25 and named it the top commit-layer risk.

Title-only duplicate grep surfaced two closed tickets on adjacent surfaces, neither the same defect: P038 (newsletter reviews inline in brief causes confirmation bias, the ticket that created the sibling file in the first place) and P062 (newsletter persona config edition-count rule globs sibling files).
