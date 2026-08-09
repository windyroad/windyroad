# Problem 145: Risk register is empty, so every scorer run regenerates from scratch

**Status**: Open
**Reported**: 2026-08-09
**Priority**: 10 (High). Impact: 2 x Likelihood: 5, derived at capture from the description per Step 4a
**Origin**: internal
**Effort**: S, derived at capture per Step 4a

## Description

Every `wr-risk-scorer:pipeline` invocation opens with `Risk register is empty; run /install-updates or /wr-risk-scorer:bootstrap-catalog to bootstrap from .risk-reports/ corpus.` and closes with `CATALOG_HIT_RATE: matched=0 missed=N`. The scorer has no catalog to match against, so it re-derives every risk from first principles on every run, and the hit-rate metric it emits has been reporting a total miss for as long as reports have been kept.

Verified on disk 2026-08-09, not sampled: `.risk-reports/` holds 130 reports spanning 2026-08-02 to 2026-08-09, and all 130 contain the empty-register line. `docs/risks/` does not exist, so there is no `R*-*.active.md` corpus for the scorer to read. `/wr-risk-scorer:bootstrap-catalog` is a real skill present in the installed plugin (`wr-risk-scorer` 0.17.0, the version this repo runs) and appears never to have been run here.

The cost is per-invocation and compounds with P144 (push:watch forces a full risk rescore after every commit): each rescore that ticket triggers is also a full from-scratch derivation. Five scorer invocations in the 2026-08-09 session alone, each re-reading `RISK-POLICY.md`, the workflows, `.changeset/`, `netlify.toml` and the diff, and each independently rediscovering the same standing findings. Two of those runs independently rediscovered the uninstrumented GitHub Actions surface now recorded as P141, and two independently rediscovered the same research-working-tree exclusion.

Worth stating plainly: this is not a defect in the scorer. It is a setup step that was never performed, and the scorer says so on every single run. The reason it warrants a ticket rather than a quick fix is that bootstrapping creates a standing artefact (`docs/risks/`) whose upkeep, review cadence and interaction with `RISK-POLICY.md` are decisions worth taking deliberately rather than as a side effect of clearing a warning.

## Symptoms

- Every scorer report begins `Risk register is empty; run /install-updates or /wr-risk-scorer:bootstrap-catalog ...` (130 of 130 reports on disk).
- Every scorer report ends `CATALOG_HIT_RATE: matched=0 missed=N`; no invocation has ever matched a catalogued risk.
- Independent invocations in the same session rediscover the same standing findings and score them independently.

## Workaround

None applied. The scorer's output is correct without a catalog; it is the re-derivation cost and the dead hit-rate metric that are being paid.

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: every `wr-risk-scorer` invocation
- **Severity**: (deferred to investigation)
- **Analytics**: `CATALOG_HIT_RATE` is emitted on every report and has never been non-zero, so the metric itself is currently uninformative.

## Root Cause Analysis

### Investigation Tasks

- [ ] Investigate root cause
- [ ] Create reproduction test
- [ ] Decide whether to run `/wr-risk-scorer:bootstrap-catalog` against the 130-report corpus, and read what it would create before running it
- [ ] Decide who owns `docs/risks/` upkeep and on what cadence, since a stale catalog is worse than none
- [ ] Check how a bootstrapped catalog interacts with `RISK-POLICY.md` and whether catalogued residuals could shortcut a genuine reassessment
- [ ] Confirm whether `CATALOG_HIT_RATE` becomes a useful signal once populated, or whether it should be read differently

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P144 (push:watch forces a full risk rescore after every commit), which multiplies the number of from-scratch derivations paid per session.

## Related

Captured via `/wr-itil:capture-problem` during the 2026-08-09 session retrospective.
