---
status: "proposed"
date: 2026-08-23
human-oversight: confirmed
oversight-date: 2026-08-23
decision-makers: [Tom Howard]
consulted: [wr-architect:agent, wr-jtbd:agent]
informed: []
reassessment-date: 2026-11-23
related: [007-risk-matrix-calculation, 008-action-specific-pipeline-risk-management, 036-marketplace-consumer-cannot-edit-cached-plugin-park-classification, 048-prefer-an-upstream-pull-request-over-an-issue, 049-risk-label-bands-adopt-the-3-5-low-shape, 054-a-decision-is-changed-by-a-new-decision-never-by-editing-the-old-one]
---

# The risk register is a curated index of risk classes, not a dump of findings

> **Numbering note.** This is *local* ADR-056. Upstream `agent-plugins` also has an ADR-056, "Risk register back-channel write contract", and it governs the very mechanism this record is about. Both will be cited in sentences about the same subject, so every cross-series reference here is written as "upstream ADR-NNN (agent-plugins)". A bare `ADR-056` in this repository means this record.

## Context and Problem Statement

`docs/risks/` has never existed in this repository. Every `wr-risk-scorer:pipeline` run therefore opens with a nudge to bootstrap the register and closes with `CATALOG_HIT_RATE: matched=0 missed=N`. That is true of every report on disk. P145 (Risk register is empty, so every scorer run regenerates from scratch) records the cost: the scorer re-derives every risk class from first principles on each run, and the hit-rate metric has never carried information.

Investigating P145 turned up three things the ticket did not know, each verified on disk rather than inferred.

**The directory's absence disabled two feeds, not one.** The one-shot bootstrap from `.risk-reports/` is the obvious one. The second is the ongoing drain: `drain-register-queue.sh` returns its no-op block and exits 0 unless **both** `docs/risks/` and `docs/risks/README.md` exist. A bare `mkdir docs/risks` is inert; it is the pair that arms the feed. `.afk-run-state/risk-register-queue.jsonl` has accumulated 91 hint records since 2026-05-31 with nothing ever consuming them.

**The report corpus is a rolling window, so a one-shot backfill is the wrong shape.** `.risk-reports/` is gitignored and pruned by the scorer's own hook (`find .risk-reports -name '*.md' -mtime +7 -delete`). It currently holds 26 reports spanning seven days. P145 was captured on 2026-08-09 against 130 reports; those reports are gone, and their risk classes with them. The corpus ate itself. The queue is the only durable record, and it is gitignored and machine-local.

**The queued slugs will not survive contact with the consuming protocol.** The pipeline agent's Catalog Consumption Protocol makes slug-token-match its primary, deterministic filter: tokenise the slug on hyphens, and if any token appears in the diff, the commit message, or recent prompt context, the entry matches. The 91 queued records carry 72 unique slugs, and those slugs are sentence-shaped descriptions of individual findings rather than names of risk classes: `unverified-figures-committed-into-problem-tickets`, `vitest-suite-is-not-a-ci-gate-so-pins-only-fire-by-hand`. Thirteen contain the token `gate`, eleven contain `without`, and others contain `the`, `in`, `to`, `not`, `check` and `ticket`. Measured against a single ordinary commit on this repository, **71 of the 72 slugs match**. That is not a sampling fluke; it is what the matching rule predicts by construction.

That last finding inverts the value of the fix. Draining the queue as it stands would replace an honest `matched=0` with a near-total match in which almost every entry fires on almost every change, each logging a `Catalog baseline:` of `not estimated - no prior data`. The scorer would carry roughly seventy irrelevant entries through every future assessment, and the sub-30% hit-rate reassessment trigger the metric exists to feed would be destroyed rather than restored. An empty register costs re-derivation effort. A register that matches everything costs re-derivation effort **and** the signal that would tell anyone something is wrong. You would be disabling the measurement in the act of taking it.

The empty-catalog branch is explicitly non-blocking: the protocol says do not halt, do not block, and do not inflate the per-action residual. So the present cost is wasted effort and a dead metric, not incorrect scoring. There is no urgency that justifies arming a noisy feed to clear a warning.

## Decision Drivers

* The register must make the scorer's output better, not merely non-empty. Clearing a warning is not the goal.
* Whatever governs the register has to survive the seven-day pruning of the corpus it draws on.
* Arming the drain is a consequential act, so the entry-shape rule has to exist before the artefact does.
* A standing catalog with residuals is the one mechanism that could quietly undercut the per-action derivation ADR-008 requires, and the composition constraint in ADR-049 that only the scoring agent's judgement enforces.
* Curation work should not be routed to Tom when it is closer to code quality than to direction-setting.
* This repository cannot edit the cached plugin that owns the matching protocol (ADR-036), so any fix to the protocol itself is an upstream report (ADR-048).

## Considered Options

* **Bootstrap now, curate later.** Run the extractor and the drain, land roughly 72 auto-scaffolded entries marked pending review, and clean them up afterwards.
* **Bootstrap a subset.** Seed only the thirteen slugs with repeat occurrences, on the grounds that recurrence is evidence of a standing class.
* **Define the admission rule first, then populate against it.** Record what a register entry has to be, keep the register unarmed until entries can satisfy it, and preserve the queue in the meantime.
* **Do nothing and close P145 as not worth fixing.**

"Bootstrap now, curate later" fails on the measurement: it destroys the only instrument for telling whether the catalog works. "Bootstrap a subset" does not fix it either, because ten uncurated sentence-slugs mis-match as confidently as seventy-two; recurrence is evidence that a class is real, not evidence that its slug is admissible. "Do nothing" discards a genuine finding and leaves the next automated iteration free to complete the flood unreviewed.

## Decision Outcome

Chosen option: **define the admission rule first, then populate against it**.

The register is a curated index of risk **classes**. It is not an archive of findings. Six rules follow, and they are the substance of this decision.

1. **Slug shape is an admission criterion.** A register entry's slug names a class of risk in terms specific to that class. A slug that tokenises into words appearing in ordinary diffs (`gate`, `check`, `ticket`, `the`, `without`, `not`) is not admissible, because the consuming protocol matches on substring tokens and such a slug behaves as a wildcard. Sentence-shaped slugs describing one finding are rejected on the same ground.

2. **The register is fed continuously, not bootstrapped once.** The upstream framing calls the bootstrap a one-shot historical backfill. That framing does not hold here, because the corpus it walks is pruned after seven days. The drain is the load-bearing feed; the bootstrap is at most a catch-up over whatever survives the window.

3. **Arming the register is a deliberate act with two preconditions.** Creating `docs/risks/` together with `docs/risks/README.md` switches the drain from no-op to active, so it is not done as a side effect of clearing a warning. It happens only once both the admission rule in rule 1 can be met **and a curator is named**. An armed register with no named owner is an unowned standing duty that will fail quietly. Until then the queue is preserved and not drained, because the drain truncates it (`: > "$QUEUE_FILE"`) and the file is gitignored, unbacked, and the only surviving record of hints whose source reports were pruned weeks ago.

4. **A catalogued residual is context, never a substitute for scoring this action.** The per-action residual is derived for the change in hand, per ADR-008. A catalog baseline may be logged alongside it for comparison and may not replace it, and it is not an input to either side of the back-pressure projection that compares a projected downstream state against the current one. This protects ADR-049 as much as ADR-008: ADR-049's constraint that a residual of exactly 5 is admissible only at likelihood 1 with a named control has no hook enforcement and survives only on the scoring agent's judgement. A pre-computed `Catalog baseline:` line is a mechanism for supplying that judgement ready-made, which is exactly what must not happen.

5. **Auto-scaffolded entries are non-authoritative, and the hit rate is not a quality signal until they are curated.** Every entry either tool writes carries the ungrounded-scoring sentinel in all Impact, Likelihood, Score and Band fields. Nothing in the consuming protocol reads the pending-review marker, so that marker constrains humans reading the register, not the agent reading it. Nobody should read a rising `CATALOG_HIT_RATE` as an improvement while uncurated entries are present.

6. **Curation is not Tom's queue.** Assigning impact, likelihood, controls and treatment to an entry that already cites its evidence is closer to code-quality work than to direction-setting, and this project's standing position is that automated gates carry code quality while humans ratify decisions. Tom ratifies this record and the policy section named below. He does not work a backlog of scoring stubs.

### Consequences

* Good, because the honest `matched=0` is preserved instead of being traded for a number that looks better and means less.
* Good, because the queue's three months of accumulated evidence stops being one accidental drain away from truncation, and stays available as raw material for a properly shaped register.
* Good, because the rule that makes a future register useful is written down before the artefact exists, rather than discovered after roughly seventy entries have to be unpicked.
* Bad, because the re-derivation cost P145 records keeps being paid. **This record makes no scorer run cheaper.** What it buys is that the next automated iteration cannot complete the flood unreviewed, and that whoever populates the register next has a rule to populate it against.
* Bad, because P145 stays at Known Error rather than closing, and turning 72 finding-slugs into a smaller set of class-slugs is real work that is not yet scoped.
* Neutral, because nothing about the scorer's current behaviour changes. This record constrains what happens next; it alters no gate today.

### Confirmation

* `docs/risks/` remains absent, and the queue file retains its records, until a change satisfies rule 3.
* Any future change that arms the register cites this record and demonstrates that its entry slugs pass rule 1, by reporting the match rate of the proposed slugs against the last 20 commits on `master`, measured by the method recorded in P145. **Pass mark: no single proposed slug matches more than 25% of that sample.** A slug above the mark is rejected or renamed, not admitted with a caveat. The sample is fixed at 20 so the number is comparable between runs; the measured count is expected to reproduce while the identity of any individual outlier moves with the sample.
* That same change names the curator, per rule 3.
* `RISK-POLICY.md` gains a `## Risk Catalog` section before any entry in the register is treated as authoritative.
* This record appears in `docs/decisions/README.md`.

### Reassessment Criteria

Reassess when any of the following holds:

* The admission rule in rule 1 has been in force through a populated register and `CATALOG_HIT_RATE` is still uninformative, whether pinned near zero or near total. That would mean the slug shape was not the binding constraint.
* Upstream changes the slug-token-match filter so that a token hit is no longer sufficient for a match, which would retire rule 1's rationale.
* The queue stops being the durable record, for instance because reports are retained beyond seven days or the queue is committed.

## More Information

**The policy surface this depends on does not exist yet.** The pipeline agent anchors its whole catalog protocol with "Per `RISK-POLICY.md` `## Risk Catalog` section". `RISK-POLICY.md` has no such section and contains no occurrence of "catalog" or "docs/risks". The section is deferred to Tom because policy substance is his to set, **not** because it is mechanically blocked. The mechanism is recorded here so nobody later reports it as impossible: the edit gate on `RISK-POLICY.md` unblocks when a `wr-risk-scorer:policy` subagent returns `RISK_VERDICT: PASS`, which writes the `policy-reviewed` marker, and that path needs no interactive step. RFC-001 is already queued against the same file, so the two edits should land in one pass.

**Two upstream defects were found and are not fixed here.** ADR-036 places them upstream; ADR-048 prefers a pull request to an issue. Both are recorded as placement proposals the upstream maintainers may reject, not as settled fact:

* `drain-register-queue.sh` appends register rows with eight columns to a table `extract-risks-from-reports.sh` generates with five. Present at 0.18.6 and still present at 0.18.15, so a version bump does not resolve it.
* The same script derives its cross-clone numbering baseline from `git ls-tree origin/main docs/risks/`. This repository's branch is `master`, so the lookup silently returns nothing and the baseline falls back to the local maximum. Safe in a single clone, wrong in principle.

A third item is a matter for upstream judgement rather than a defect: the slug-token-match filter treats any single token hit as a match, which is what makes sentence-shaped slugs behave as wildcards.

**A local collision that will bite whoever arms the register.** Both tools write the ungrounded-scoring sentinel and several status fields with a literal em-dash, and this repository runs `no-em-dash.sh` and `no-em-dash-bash.sh` over the working tree with a whitelist covering three upstream marker lines only. Populating `docs/risks/` will collide with those hooks. P060 and P073 are the same collision already parked as upstream-blocked, and P060 explicitly rejected extending the local whitelist as band-aid debt. Four options exist (path exemption for `docs/risks/`, line whitelist, post-process the characters out, or park upstream-blocked). The choice is direction, not mechanics, and is left to Tom.

**On the choice of a new record.** ADR-054 records Tom's direction that a decision is changed by a new decision and never by editing the old one. ADR-054 is itself `human-oversight: unconfirmed`, so it is named here as recording the same direction rather than as settled authority; the direction is Tom's own, stated on 2026-08-16. No existing record governs `docs/risks/`, so this is a new decision on an uncovered subject rather than an amendment to anything.

**Ratification has a clock on it.** `scripts/post-release.d/stamp-and-promote-decisions.sh` selects on `*.proposed.md` and never inspects `human-oversight`, so this record will flip to `accepted` fourteen days after it first ships whether or not Tom has read it. That is a corpus-wide property rather than a defect in this decision, but it bites here, because the justification for deferring the policy section is precisely that the substance is his to set.

## Related

* P145 (Risk register is empty, so every scorer run regenerates from scratch), the driver.
* ADR-008 (Action-specific pipeline risk management) and ADR-049 (Risk label bands adopt the 3-5 Low shape), which rule 4 protects.
* ADR-007 (Risk matrix calculation), which defines the scoring any curated entry would carry.
* P060 and P073, the parked em-dash collisions of the same shape.
* P159 (A self-produced measurement is trusted without checking), which is why the 71-of-72 measurement is recorded with its method on P145.
* RFC-001, queued against `RISK-POLICY.md`.
