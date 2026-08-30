# Problem 185: Dependency-freshness exclude entries have no expiry and nothing re-checks them

**Status**: Open
**Reported**: 2026-08-30
**Priority**: 8 (Medium), Impact: 2 x Likelihood: 4, derived at capture. Impact is 2 because nothing reaches a site visitor and no build breaks: the failure is a silenced signal in dev tooling. Likelihood is 4 because no hook or automated check covers this area, applying the likelihood-4 clause by analogy rather than verbatim (the clause as written is scoped to the site and the newsletter pipeline, and this is maintainer tooling), and because the failure has already fired: the `typescript` entry is 99 days past the verification date written in its own reason string with nothing having surfaced it.
**Origin**: internal
**Effort**: S, derived at capture. The fix is one read-only detector following the advisory-script triplet already established by `check-briefing-budgets.sh`, plus a line in the retro's Step 2b advisory block. No new concept and no cross-package work.
**WSJF**: 8.0 = (8 x 1.0) / 1

## Description

`.dry-aged-deps.json` carries an `exclude` map that silences the dependency-freshness gate for a named package. The reason string is free prose, and it is the only place the unblock condition is recorded. Nothing ever compares that condition against current state, so a hold outlives its reason silently.

The exclusion is applied early and totally. `applyExclusions` in `print-outdated.js` runs at line 479, before `buildRows` and before `applyFilters`, and rebuilds the `npm outdated` payload with the excluded names dropped. An excluded package therefore never reaches the age filter, never reaches the security filter, and never appears in the outdated table at all. A hold that is no longer justified looks exactly like one that is: both are invisible.

Three entries on disk as of 2026-08-30, and each shows a different failure of the same shape:

- `typescript` carries "Verified 2026-05-23" inside its own reason string. That is 99 days ago. Nothing surfaced the staleness, and nothing would have.
- `@eslint/js` carries no date at all, so there is not even a stale marker to notice. Its condition, "when eslint v10 peer deps are resolved", is checkable in principle and has never been checked.
- `jsdom` was added on 2026-08-30 in commit `98393474`, holding it at 29.x until the Node toolchain moves off the 20.19.0 that `.nvmrc` declares. Its condition is a one-line comparison of jsdom's declared `engines` against `.nvmrc`, which makes it the easiest case to automate and the clearest demonstration that automating it is possible.

The risk scorer rated the exposure 4/25 (Low) at the commit that added the jsdom entry, and credited no control. It made the point that matters for the fix: a `Verified <date>` suffix is documentation, not a gate. It does not exercise the failure, so it earns no likelihood reduction. Adding a date to the jsdom entry would make the record tidier and would not make the problem smaller. Whatever is built has to actually re-check.

## Symptoms

- An `exclude` entry stays in force indefinitely and no surface reports that its stated condition may now be satisfied. Stated precisely, because the broader form is false: the tool DOES report that holds exist. Table mode prints `N package(s) excluded from analysis (see .dry-aged-deps.json)`, and the JSON and XML handlers emit an `excluded` section carrying each name and its reason, all three covered by tests at `printOutdated.exclude.test.js` lines 114 to 170. What is absent is any evaluation of the reason: the excluded package never appears as an outdated ROW, and nothing anywhere reads the condition and decides whether it still holds.
- A reason string can carry a self-declared verification date that is arbitrarily stale without anything reading it. Observed: `typescript` at 99 days.

## Workaround

Read `.dry-aged-deps.json` by hand and evaluate each reason string against current state. Manual, unprompted, and dependent on somebody remembering the file exists. It has not happened for `typescript` in 99 days, which is the evidence that this workaround does not hold.

## Impact Assessment

- **Who is affected**: the Internal Maintainer persona, on any dependency-hygiene pass.
- **Frequency**: continuous once an entry is added. Three entries currently in force; one demonstrably stale.
- **Severity**: no visitor or reader surface, and no broken build. The cost is that the gate reports clean while holding back packages for reasons nobody has revisited, so the dependency-hygiene signal quietly narrows over time. Every exclusion added makes the gate greener without making the tree healthier.
- **Analytics**: not applicable.

## Root Cause Analysis

### Investigation Tasks

- [ ] Decide which of the two candidate shapes fits. Shape A is a condition-checking detector that reads each entry's stated unblock condition and flags the ones now satisfied; it works only for machine-checkable conditions, but the `jsdom` entry (compare declared `engines` against `.nvmrc`) shows that class is real. Shape B is a dated-review requirement plus an advisory that flags any entry older than a threshold, which covers every entry but only tells you to go and look.
- [ ] Confirm the fix site is local. `.dry-aged-deps.json` is a repo file and the detector would be a repo script, so this is not upstream work, unlike the age-computation defect in P183.
- [ ] Establish whether a `Verified <date>` convention should be required at write time, given the scorer's finding that the date alone earns no control credit. It may still be worth it as an input to Shape B.
- [ ] Check whether the `@eslint/js` and `typescript` conditions are in fact now satisfied. Both have gone unexamined long enough that the answer is unknown.
- [ ] Create a reproduction test.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P183, P168, P026

## Related

Captured via `/wr-itil:capture-problem` during the 2026-08-30 deps-remediation retro; expand at next investigation.

The title-only duplicate grep matched three tickets on the tokens `exclude`, `freshness` and `expiry`. All three are distinct concerns: P058 is about hooks excluding `docs/retros` from governance gates, P183 is about the freshness gate exiting 0 locally and 1 on CI for the same tree, and P168 is about the gate reading the installed tree while the fix flow writes only the manifests. None covers the lifetime of an exclude entry.

P183 is the closest neighbour and the relationship is worth stating: P183 is why the local gate cannot compute an age at all, this ticket is why an entry that suppresses the gate is never revisited. Both make the freshness signal weaker than it appears, from opposite ends. P183's fix site is upstream in `dry-aged-deps`; this one's is local.

The `jsdom` entry that prompted this capture was added in commit `98393474`, which reverted a jsdom major the gate had never asked for. The entry's own reason string cites `307e8bff` instead; that is the earlier commit which INSTALLED jsdom 30.0.1, not the one that added the exclusion, so the two references are to different events rather than in conflict. That commit's body records the reasoning and names the missing review trigger as queued rather than invented, which is this ticket.
