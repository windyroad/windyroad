# Problem 145: Risk register is empty, so every scorer run regenerates from scratch

**Status**: Known Error
**Reported**: 2026-08-09
**Priority**: 10 (High). Impact: 2 x Likelihood: 5, derived at capture from the description per Step 4a
**Origin**: internal
**Effort**: M (re-rated 2026-08-23 from S). Reason for the bucket change: at capture the fix was believed to be "run the bootstrap", which is S. Investigation showed the bootstrap is the wrong fix (see finding 3), and the actual remaining work is to derive a small set of admissible class-shaped slugs from 72 finding-shaped ones and name a curator. WSJF recalculates to (10 x 2.0) / 2 = 10.0, unchanged in rank because the Known Error multiplier offsets the effort increase.

## Description

Every `wr-risk-scorer:pipeline` invocation opens with `Risk register is empty; run /install-updates or /wr-risk-scorer:bootstrap-catalog to bootstrap from .risk-reports/ corpus.` and closes with `CATALOG_HIT_RATE: matched=0 missed=N`. The scorer has no catalog to match against, so it re-derives every risk from first principles on every run, and the hit-rate metric it emits has been reporting a total miss for as long as reports have been kept.

Worth stating plainly: this is not a defect in the scorer. It is a setup step that was never performed, and the scorer says so on every single run. The reason it warrants a ticket rather than a quick fix is that bootstrapping creates a standing artefact (`docs/risks/`) whose upkeep, review cadence and interaction with `RISK-POLICY.md` are decisions worth taking deliberately rather than as a side effect of clearing a warning.

That framing turned out to be exactly right, for a reason nobody anticipated at capture. See Root Cause Analysis.

## Symptoms

- Every scorer report begins `Risk register is empty; run /install-updates or /wr-risk-scorer:bootstrap-catalog ...`.
- Every scorer report ends `CATALOG_HIT_RATE: matched=0 missed=N`; no invocation has ever matched a catalogued risk.
- Independent invocations in the same session rediscover the same standing findings and score them independently.

## Workaround

**Leave the register unarmed, deliberately.** This is the workaround, not an absence of one.

The consuming protocol's empty-catalog branch is explicitly non-blocking: it emits the nudge and then says do not halt, do not block, and do not inflate the per-action residual. So with `docs/risks/` absent, the scorer still produces a correct per-action score and an honest `matched=0`. The cost being paid is wasted re-derivation effort and a metric that carries no information. Nothing is scored wrongly.

Populating the register mechanically would end the nudge and produce a worse state on both counts (see Root Cause Analysis, finding 3). So the deliberate non-population is what holds the line until an admissible set of entries exists.

## Impact Assessment

- **Who is affected**: the internal maintainer persona, via the AFK loop. The scorer runs on the commit, push and release gate path.
- **Frequency**: every `wr-risk-scorer` invocation.
- **Severity**: bounded. Wasted effort and a dead metric, not incorrect scoring, because the empty-catalog branch is non-blocking by design.
- **Analytics**: `CATALOG_HIT_RATE` is emitted on every report and has never been non-zero, so the metric itself is currently uninformative. Finding 3 below shows that populating it mechanically would make it uninformative in the opposite direction, which is worse because it would look healthy.

## Root Cause Analysis

**Root cause**: `docs/risks/` was never created. That single absence disabled both feeds into the register, and the second one silently.

Investigation on 2026-08-23 confirmed the ticket's core claim and corrected three of its premises. All figures below were read from disk during that investigation, not carried over from capture.

### Correction to the ticket's own figures

The Description said the corpus was "130 reports spanning 2026-08-02 to 2026-08-09". That was true when written and is not true now: `.risk-reports/` currently holds **26 reports spanning 2026-08-16 to 2026-08-23**. The directory is gitignored and pruned by the scorer's own hook (`find .risk-reports -name '*.md' -mtime +7 -delete`). The corpus ate itself. This is not a sloppy capture; it is a self-pruning seven-day window behaving as designed, and the ~117 reports that existed at capture are gone along with the risk classes they carried.

### Finding 1: the absence disabled the ongoing drain, not just the one-shot bootstrap

`drain-register-queue.sh` returns its no-op block and exits 0 unless **both** `docs/risks/` and `docs/risks/README.md` exist. A bare `mkdir docs/risks` is inert; the pair is what arms the feed.

Because the pair never existed, `.afk-run-state/risk-register-queue.jsonl` has accumulated **91 hint records spanning 2026-05-31 to 2026-08-23, carrying 72 unique slugs**, with nothing ever consuming them. The AFK orchestrator has a drain step that has been no-opping silently every iteration. That queue is gitignored and machine-local, and it is now the only durable record of hints whose source reports were pruned weeks ago.

### Finding 2: a one-shot backfill is the wrong shape for this corpus

The upstream skill describes the bootstrap as a one-shot historical backfill. That framing does not survive the seven-day prune. Whatever is bootstrapped today captures one week; the drain is the load-bearing feed, and the bootstrap is at most a catch-up over the survivors.

### Finding 3: the queued slugs behave as wildcards, so draining would destroy the metric

This is the finding that changed the fix, and it was found independently by the JTBD reviewer before being measured.

The pipeline agent's Catalog Consumption Protocol makes slug-token-match its primary, deterministic filter: tokenise the slug on hyphens, and if **any** token appears in the diff content, commit message, or recent prompt context, the entry is slug-matched. The queued slugs are sentence-shaped descriptions of single findings, not names of risk classes. Examples: `unverified-figures-committed-into-problem-tickets`, `vitest-suite-is-not-a-ci-gate-so-pins-only-fire-by-hand`.

**Measurement: 71 of the 72 unique queued slugs (98%) match a single ordinary commit.**

Method, recorded per P159 (a self-produced measurement is trusted without checking) so the figure can be re-run rather than believed: read every line of `.afk-run-state/risk-register-queue.jsonl`, collect the distinct `risk_slug` values (72), split each on hyphens, lowercase the concatenation of `git show --stat -p HEAD` and `git log -1 --format=%B HEAD`, and count a slug as matched if any of its tokens occurs as a substring of that text.

**The magnitude is the claim; the sample is not pinned.** `HEAD` is a moving target, so a later re-runner will get a different commit. When `wr-risk-scorer:pipeline` independently re-ran this method against a different sample (this change's own ADR body, ticket body and prompt) it also returned 71 of 72, but the single non-matching slug was `trailing-median-length-ceiling-ratchets-past-drift` rather than the `push-watch-commits-untested-lockfile-regeneration` that fell out against `HEAD`. Expect the count to reproduce and the identity of the outlier to move. What is stable is the reason: the outlier is whichever slug happens to have no token that is a common English word or a ubiquitous repo term.

Token frequencies across the 72 slugs, which reproduce exactly on re-count and are the durable form of the finding: `gate` in 13, `without` in 11, `unverified` in 8, `not` in 7, `in` and `check` in 6 each, `only`, `with`, `ticket`, `prose`, `on` and `and` in 5 each.

This is not a sampling artefact. It is what the matching rule predicts by construction: any slug containing `the`, `in`, `to`, `not` or `gate` matches essentially every commit.

So draining the queue as it stands would replace an honest `matched=0` with a near-total match in which almost every entry fires on almost every change, each logging a `Catalog baseline:` of `not estimated - no prior data`. Every future assessment would carry ~70 irrelevant entries, and the sub-30% hit-rate reassessment trigger that the metric exists to feed would be destroyed rather than restored. The measurement would be disabled in the act of taking it.

### Why the fix is not "run the bootstrap"

Because arming the register is the consequential act. Once `docs/risks/` and its README exist, the next automated iteration that reaches the drain step completes the flood without review, and the drain truncates the queue (`: > "$QUEUE_FILE"`) on a gitignored, unbacked file. A partial or clean-up-later bootstrap is therefore not a smaller version of the fix; it is the same irreversible step taken with less deliberation.

### Investigation Tasks

- [x] Investigate root cause
- [x] Create reproduction test (the 71-of-72 measurement above, with its method recorded so it can be re-run)
- [x] Decide whether to run `/wr-risk-scorer:bootstrap-catalog` against the corpus, and read what it would create before running it. **Decision: no, not until the admission rule in ADR-056 is met.** Both tools were read in full before the decision, and a `--dry-run` was taken.
- [x] Decide who owns `docs/risks/` upkeep and on what cadence, since a stale catalog is worse than none. **Recorded in ADR-056 rules 2, 3 and 6**: the drain is the continuous feed, arming requires a named curator, and curation is not routed to Tom.
- [x] Check how a bootstrapped catalog interacts with `RISK-POLICY.md` and whether catalogued residuals could shortcut a genuine reassessment. **Yes, they could, and the exposure is worse than expected.** `RISK-POLICY.md` has no `## Risk Catalog` section at all, though the pipeline agent anchors its whole protocol on one. And a pre-computed `Catalog baseline:` line is precisely a way to supply ready-made the scoring-agent judgement that is the *only* enforcement of ADR-049's constraint that a residual of 5 is admissible only at likelihood 1 with a named control. ADR-056 rule 4 closes this.
- [x] Confirm whether `CATALOG_HIT_RATE` becomes a useful signal once populated, or whether it should be read differently. **It does not become useful on a mechanical populate; it becomes useless in the other direction.** ADR-056 rule 5 records that a rising hit rate is not a quality signal while uncurated entries are present.
- [ ] Scope the real fix: derive a small set of admissible class-shaped slugs from the 72 finding-shaped ones, and name the curator.

## Resolution

Not resolved. This iteration recorded the decision that governs the fix; it did not perform the fix.

**Stated plainly so the ADR is not misread as a fix: no scorer run gets cheaper as a result of this iteration.** The per-invocation re-derivation cost this ticket exists to record is still being paid in full. What the iteration bought is that the next automated iteration cannot complete the flood unreviewed, that the queue's three months of evidence is preserved rather than truncated, and that whoever populates the register next has a rule to populate it against.

ADR-056 (The risk register is a curated index of risk classes, not a dump of findings) carries the six rules. It ships `human-oversight: unconfirmed`.

**Ratification dependency.** `scripts/post-release.d/stamp-and-promote-decisions.sh` selects on `*.proposed.md` and never inspects `human-oversight`, so ADR-056 will flip to `accepted` fourteen days after it first ships whether or not Tom has ratified it. The deferral of the `RISK-POLICY.md` section rests on the substance being his to set, so that clock is worth watching.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none mechanically). Two open questions gate the *next* step rather than this ticket: the `RISK-POLICY.md` `## Risk Catalog` section, and the em-dash remedy below.
- **Composes with**: P144 (push:watch forces a full risk rescore after every commit), which multiplies the number of from-scratch derivations paid per session.

## Related

Captured via `/wr-itil:capture-problem` during the 2026-08-09 session retrospective. Worked 2026-08-23.

- **ADR-056** (The risk register is a curated index of risk classes, not a dump of findings), authored by this iteration, is the governing record.
- **ADR-008** (Action-specific pipeline risk management) and **ADR-049** (Risk label bands adopt the 3-5 Low shape) are what ADR-056 rule 4 protects.
- **P060** and **P073** are the same em-dash collision already parked as upstream-blocked. Both register tools write the ungrounded-scoring sentinel with a literal em-dash, and this repo's `no-em-dash.sh` / `no-em-dash-bash.sh` whitelist only three upstream marker lines, so populating `docs/risks/` will collide with them. Four remedies exist (path exemption for `docs/risks/`, line whitelist, post-process, or park upstream-blocked); the choice is direction and is queued for Tom.
- **P159** (A self-produced measurement is trusted without checking) is why the 71-of-72 figure above carries its method.
- **P130** is the precedent for a detector that fails quietly in this consumer repo, which is the shape of the silently no-opping drain in finding 1.
- **RFC-001** is already queued against `RISK-POLICY.md`, so the `## Risk Catalog` section should land in the same policy pass.

### Upstream placement proposals

Recorded per ADR-036 (this repo cannot edit the cached plugin) and ADR-048 (prefer a pull request to an issue). These are proposals the upstream maintainers may reject, not settled fact. Neither is filed yet.

- `drain-register-queue.sh` appends register rows with eight columns to a table `extract-risks-from-reports.sh` generates with five. Verified present at both 0.18.6 and 0.18.15, so a version bump does not resolve it.
- The same script derives its cross-clone numbering baseline from `git ls-tree origin/main docs/risks/`. This repository's branch is `master`, so the lookup silently returns nothing and the baseline falls back to the local maximum. Safe in a single clone, wrong in principle.
- A third item is upstream judgement rather than a defect: the slug-token-match filter counts any single token hit as a match, which is what lets sentence-shaped slugs behave as wildcards.
