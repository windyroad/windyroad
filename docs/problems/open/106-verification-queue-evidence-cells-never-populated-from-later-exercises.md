# Problem 106: Verification Queue evidence cells are never populated from subsequent-session exercises, so the auto-drain never fires and the queue accumulates

**Status**: Open
**Reported**: 2026-06-28
**Priority**: 3 (Medium) -- Impact: 3 x Likelihood: 1 (deferred -- re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: M (deferred -- re-rate at next /wr-itil:review-problems)

## Description

The Verification Queue evidence-first cells (the `Likely verified?` column in `docs/problems/README.md`, canonical P186 values `yes - observed:` / `no - not observed` / `no - observed regression`) are never populated with a `yes - observed:` value from subsequent-session live exercises. The run-retro Step 4a prior-session evidence drain (sub-step 9, P282) fires ONLY on rows whose cell already reads `yes - observed:`, but nothing writes that value when a later session or newsletter edition exercises a verifying fix. Result: verifying tickets sit indefinitely and the queue accumulated to 47 before requiring a manual evidence-triage drain on 2026-06-28 (closed 30 via four parallel Explore agents reading published-edition behaviour, on-disk state, and test suites). The automated drain never triggered because every cell read `no (not observed)`.

## Symptoms

- 2026-06-28: the Verification Queue held 47 tickets, every one with a `Likely verified?` cell reading `no (not observed)` (or `no (observed regression)` for P016 / P036), despite many fixes having shipped weeks earlier and been exercised by multiple published newsletter editions (2026-05-15 through 2026-06-22).
- The run-retro Step 4a prior-session drain (sub-step 9) scanned for `yes - observed:` rows and found none, so it closed nothing automatically across multiple prior retros.
- Draining required a manual evidence-triage pass: four parallel read-only Explore agents assessing each ticket's fix against on-disk state, installed plugin versions, published-edition behaviour, and green test suites, then a scripted batch close of the 30 with concrete evidence.

## Workaround

Run the manual evidence-triage drain when the queue grows: read each `verifying/` ticket's `## Fix Released` section, gather observable evidence (fix present on disk + exercised by a subsequent live edition / test suite / installed plugin version), and batch-close the evidenced ones via `git mv` + status flip + README rebuild in one commit (the 2026-06-28 drain is the worked example). Conservative bar: keep on inference, close only on observed proof the fix works.

## Impact Assessment

- **Who is affected**: anyone relying on the Verification Queue to reflect real state; the queue grows unbounded and the README context cost grows with it (the VQ table was the largest section of the 55 KB problems README before the 2026-06-28 drain shrank it to 40 KB).
- **Frequency**: continuous -- every verifying ticket whose fix is exercised in a later session fails to get its cell updated.
- **Severity**: Moderate. No user-facing impact; it is governance-hygiene debt that forces periodic manual drains and inflates the load-bearing README.
- **Analytics**: N/A.

## Root Cause Analysis

The P186 evidence-first cell and the P282 prior-session drain are a producer/consumer pair, but only the consumer was built. The drain (run-retro Step 4a sub-step 9) reads `yes - observed:` cells; nothing produces them. Step 4a sub-steps 1-8 scan the CURRENT session's tool-call activity for in-session evidence, but a fix exercised in a session that did not also run a retro (e.g. a weekly `/wr-newsletter` run) leaves no durable `yes - observed:` mark, and is then structurally invisible to every later session's in-context scan.

### Fix Strategy

Upstream (`@windyroad/itil` / `@windyroad/retrospective`); this project is a marketplace consumer and cannot durably edit the cached plugin machinery (P031 / P036 / ADR-036). Candidate shapes:

1. A mechanism that writes `yes - observed: <citation>` to the README cell when a subsequent session or edition exercises a verifying fix (the missing producer half of the P186/P282 pair).
2. A periodic evidence-triage pass inside `/wr-itil:review-problems` that does the on-disk / published-edition / test-suite assessment automatically (codifying the manual 2026-06-28 drain), so closure does not depend on a human noticing the pileup.

### Verification check (per P045 discipline)

- **Domain fit**: the verification-close machinery is `wr-itil` / `wr-retrospective` domain. Fit.
- **Placement authority**: this project is the consumer, not the maintainer. Recommendation only; the maintainers decide between shapes 1 and 2 (or a hybrid).

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Confirm on disk whether any producer mechanism for the `yes - observed:` cell exists in the current cached wr-itil / wr-retrospective (verify-before-asserting per P032/P103)
- [ ] Report upstream via /wr-itil:report-upstream once confirmed, same shape as P048

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P282 (the prior-session drain this would feed)

## Related

- Captured via /wr-itil:capture-problem during the 2026-06-28 second retro, immediately after the manual verification-queue drain (47 -> 17) that surfaced the gap.
- Composes with P282 (run-retro Step 4a prior-session evidence drain -- the consumer half) and the verify-before-asserting family (P032 / P045 / P082 / P103): the manual drain applies that discipline by hand.
- Fix is upstream (marketplace-consumer-cannot-edit-cached-plugin, P031 / P036 / ADR-036); same upstream-report shape as P048 (windyroad/agent-plugins#296).
