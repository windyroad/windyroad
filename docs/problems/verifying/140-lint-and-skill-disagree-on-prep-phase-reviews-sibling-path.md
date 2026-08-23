# Problem 140: Lint and SKILL disagree on the prep-phase reviews sibling path

**Status**: Verification Pending
**Reported**: 2026-08-09
**Priority**: 12 (High). Impact: 3 x Likelihood: 4, derived at capture from the description per Step 4a
**Origin**: internal
**Effort**: S (was M at capture). Investigation showed both sides live in this repo and the fix is one derivation, its two callers, and a loud-skip branch.

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
- Check (n), the ADR-052 standing-verdict bookkeeping check, reads the same sibling path and is guarded by `if [ -f "$reviews" ]` with no else branch, so during prep it did not skip loudly: it produced no output at all. A prep-time `BLOCKING (survived round 2)` finding was invisible to the lint. Found during investigation on 2026-08-23; the capture named only check (m).

## Workaround

Follow the SKILL contract (`<publication-date>.reviews.md`) and accept the lint SKIP. The finalise carry-forward is functional; the lint check is detection-only and its degraded state is loud rather than silent. Applied on Issue 17 (2026-08-10). Superseded by the fix below.

## Impact Assessment

- **Who is affected**: the publication author, on every prep session. Both checks that read the reviews sibling were dead for the whole phase, so a stale gate verdict or a standing blocking finding reached publish morning undetected, which is the moment ADR-047 says the author is least able to act on one.
- **Frequency**: every prep-phase run of `/wr-newsletter`, for both personas
- **Severity**: Medium. No reader-facing defect ships directly from this, but two of the three deterministic guards on the reviews ledger were off for half the pipeline, and one of them was off silently.
- **Analytics**: N/A

## Root Cause Analysis

The lint derives its sibling artefact paths mechanically from the brief filename. Both derivations stripped only the `.md` extension, so during prep, when the brief is `<date>.prep.md`, they named `<date>.prep.reviews.md` and `<date>.prep.linkedin.md`.

Sibling artefacts are not named that way, and never have been. ADR-026 names the reviews sibling `<date>.reviews.md`; `/wr-newsletter` SKILL.md step 16's prep branch writes exactly that name beside a `.prep.md` brief, and step 0.5 binds `<prep-reviews-path>` to it so finalise reads prep review blocks forward; all 18 published editions on disk carry `<date>.reviews.md`, `<date>.linkedin.md` and `<date>.capture.md`. The `.prep` infix is a phase marker on the brief only. The lint's derivation assumed it was part of the edition identity, and that assumption is the defect.

At finalise the brief is `<date>.md`, the two derivations agree, and both checks work. That is why the divergence stayed invisible.

The reviews sibling had no explicit override argument, unlike the LinkedIn sibling, so there was no way to point the lint at the right file either.

### Investigation Tasks

- [x] Investigate root cause
- [x] Create reproduction test
- [x] Decide which side moves: lint learns the `.prep` infix, SKILL adopts the mechanical derivation and step 0.5 learns the prep name, or the sibling stops carrying the phase in its filename
- [x] Check the blast radius of the chosen option across ADR-026, ADR-047 and RFC-005
- [x] Confirm whether the same infix divergence affects any other `${brief%.md}.*` derivation in the lint

The lint moved, because the SKILL contract was already right. The other two options each require superseding ADR-026, which fixes the sibling name to the publication date; only "the lint learns the infix" is conformance rather than a new decision. ADR-047 dimension 4 already puts this question in the lint's court, calling it "a plumbing question, not a tuning one" and prescribing derive-from-the-artefact-path with an explicit override available.

Blast radius: ADR-026 unchanged (conformance). ADR-047 and ADR-052 both start being enforced at prep where they previously were not, which is what each says it wants: ADR-047 is explicitly prep-aware and tuned to over-report, and ADR-052's confirmation criterion 3 describes check (n) as a pre-save check with no phase qualifier. RFC-005 needs nothing; its derive-with-override limb is the shape this fix implements. The prep reviews template at SKILL.md step 16 puts a `scored-digest:` line under every heading check (m) treats as a verdict, so turning (m) on at prep is satisfiable by the template as written and will not hard-fail template-prescribed blocks as never-scored.

Only two `${brief%...}` derivations exist in the script (the LinkedIn sibling and the reviews sibling); both are fixed. The LinkedIn half closes no live defect, because no `.linkedin.md` is written during prep at all, but leaving two divergent derivations in place is how this recurs. One consequence to note: in a re-prep of a directory that already went through finalise, a `.linkedin.md` does sit beside the prep brief, so checks (f) and (l) become reachable there too. That is the correct comparison to make, against the post that exists, and it is unexercised by the tests.

## Fix Strategy

One stripped base, `sibling_base="${brief%.md}"` then `sibling_base="${sibling_base%.prep}"`, feeding both sibling derivations, plus an optional third positional argument that overrides the reviews path the way the second already overrides the LinkedIn path (ADR-047 dimension 4). The override is what resolves a brief whose name carries a `-2` collision suffix its sibling does not, so that limb is closed rather than left open. Check (n) gains the loud-skip else branch check (m) already had, so no check in the file degrades silently.

The phase contract changes, and is stated where an operator reads it: check (n) now fails a prep save when a `BLOCKING (survived round 2)` finding is still standing, holding the prep session until it is fixed or retagged `DECLINED` with the author's stated reason. SKILL.md step 16 says so at the invocation site, and the finalise reviews template's carry-forward clause is reconciled to read as a backstop for pre-fix editions and hand-edited siblings rather than a sanctioned path.

No new decision record: this is conformance to ADR-026 as sanctioned by ADR-047, and a record would only restate what those two already decide. No changeset: `package.json` is `"private": true` and this is a repo-local dev lint, matching every prior commit to this script.

**Release vehicle**: the fix commit itself. No `.changeset/` entry, per the no-changeset reasoning above.

Four behavioural vitest cases, each verified to fail against the pre-fix script: (m) reaches the sibling of a prep brief instead of skipping; (n) fires on a standing BLOCKING finding at prep; (n) skips loudly when the sibling is genuinely absent; the third argument overrides the derivation.

## Fix Released

Committed 2026-08-23. `scripts/check-newsletter-structure.sh` derives both siblings from a `.prep`-stripped base and accepts an explicit reviews path; check (n) skips loudly instead of silently; `/wr-newsletter` SKILL.md step 16 states the phase-invariant sibling naming and the new prep-time reach of checks (m) and (n).

Exercised in-session: the full vitest suite passes (546 tests, 32 files), the four new cases each fail against the pre-fix script and pass against the fixed one, and the lint runs clean against the live published edition `src/newsletters/published/leader/2026-08-03/2026-08-03.md`.

Awaiting user verification on the next real `/wr-newsletter phase=prep` run, which is where the previously-dead checks first execute against a live prep artefact.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

Captured via `/wr-itil:capture-problem` during the Issue 17 prep run; expand at next investigation.

Surfaced by the `wr-risk-scorer:pipeline` commit-gate assessment of the Issue 17 prep artefacts, which scored the divergence at inherent 12/25 and named it the top commit-layer risk.

Title-only duplicate grep surfaced two closed tickets on adjacent surfaces, neither the same defect: P038 (newsletter reviews inline in brief causes confirmation bias, the ticket that created the sibling file in the first place) and P062 (newsletter persona config edition-count rule globs sibling files).

P151 (prescribed newsletter gates can skip a phase entirely and nothing detects the absence) already recorded this ticket as a precondition on the same surface and assumed this direction: "Fixing P140 makes check (m) run at prep; a correctly-named sibling with three gate blocks missing would still pass it cleanly." That remains true after this fix, and P151 is the ticket for it.

Reviewed by `wr-architect:agent` (two rounds; the first returned ISSUES FOUND on the stale usage header, the missing reviews override, the unstated phase-contract change and check (n)'s silent no-op, all four folded in) and `wr-jtbd:agent` (PASS, anchoring on JTBD-300, spend editorial judgement where it counts: moving enforcement into the unconstrained mid-week session serves the fixed-publish-day constraint).
