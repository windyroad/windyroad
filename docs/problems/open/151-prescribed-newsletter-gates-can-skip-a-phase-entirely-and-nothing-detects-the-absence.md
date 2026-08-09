# Problem 151: Prescribed newsletter gates can skip a phase entirely and nothing detects the absence

**Status**: Open
**Reported**: 2026-08-10
**Priority**: 12 (Medium), Impact: 3 x Likelihood: 4, derived at capture from the description per Step 4a. Impact 3 because the failure ships unreviewed reader-facing claims rather than breaking a system; Likelihood 4 because it already occurred on the most recent prep run and no mechanism prevents a repeat.
**Origin**: internal
**Effort**: M, derived at capture: a phase-scoped expected-gate manifest plus a check (m) extension, one script and one SKILL surface

## Description

The `/wr-newsletter` prep phase silently skipped three gates its own SKILL.md prescribes, and nothing blocked the phase or forced them at finalise.

On the 2026-08-09 prep run for The Shift Issue 17, the newsletter critic (step 15), the Wardley critic (step 9) and cross-edition consistency (step 11.4) did not run. The prep reviews file recorded this honestly as a gap note, which is the only reason it was caught. A hand-written note in a companion file is not an enforcement mechanism: had the drafter not written it, or had the finalise operator not read it, the edition would have published with three prescribed gates never run.

The skip was not harmless. All three were run at finalise on publish morning and all three found real defects:

- **Cross-edition consistency** found two factual callback errors. The opener attributed to Issue 16 a claim Issue 16 never made (Issue 16 said the opposite, that evidence sat in logs and surfaced only on after-the-fact review), and the Hugging Face breach was credited to Issue 16 when it was Issue 15.
- **The newsletter critic** found the Item 3 heading asserting an environment escape the item's own body explicitly denies.
- **The Wardley critic** found seven findings on a map mutation already committed unreviewed, including a dependency edge added to `ai-landscape.owm` that the written analysis never mentioned or justified.

Cost landed exactly where ADR-017 was designed to prevent it. Finalise ran roughly twenty agent invocations and six body revisions instead of the tier-1 refresh plus publish it is scoped for.

**The specific hole.** ADR-047 establishes re-run-do-not-report for a *stale* verdict, but `scripts/check-newsletter-structure.sh` check (m) is comparison-based by construction: it walks only the `## ` verdict headings physically present in the reviews sibling and classifies each as matches-current, carried-by-design, never-scored or stale. There is no roster of expected gates per phase, so a gate that wrote no block produces no row to classify. Staleness is detected; absence is not.

**The Wardley critic is worse than the other two.** Line 498 of `scripts/check-newsletter-structure.sh` reads `if (h ~ /wardley/) is_verdict = 0;`, on the grounds that the Wardley critic scores `ai-landscape.md`, a third artefact the check has no target for. Verified on disk 2026-08-10. So for that gate, absence and staleness are both invisible, even when a verdict block is present.

## Symptoms

- A phase completes and reports success with prescribed gates never invoked.
- The only record of the omission is prose a human chose to write in the reviews sibling.
- The structural lint passes on a reviews file missing whole gate sections.
- Deferred gate cost lands on publish morning, which is the window ADR-017 exists to keep clear.

## Workaround

Read the prep reviews file's gap note before starting finalise, and re-run anything it names. This depends on the drafter writing the note and the operator reading it, which is the defect.

## Impact Assessment

- **Who is affected**: the newsletter author at finalise, and readers of any edition published without the skipped gates being caught.
- **Frequency**: observed once (2026-08-09 prep, Issue 17). No mechanism prevents recurrence.
- **Severity**: the skipped gates found two factual errors about the publication's own back catalogue plus a heading contradicting its body. Those were reader-facing.
- **Analytics**: not instrumented.

## Root Cause Analysis

Check (m) validates the freshness of verdicts that exist. Nothing validates the reviews sibling against the set of gates the phase was supposed to run. The reviews sibling is treated as a record, not as a ledger with a required shape.

### Investigation Tasks

- [ ] Investigate root cause
- [ ] Create reproduction test
- [ ] Define a phase-scoped expected-gate manifest (prep, finalise, full) as the roster check (m) compares against
- [ ] Extend check (m) to fail on a missing expected gate, not only a stale present one
- [ ] Decide how the Wardley critic is covered given it scores a third artefact (`ai-landscape.md`) the lint has no target for; line 498 currently excludes it outright
- [ ] Decide whether an explicit recorded skip (with reason) is a permitted ledger entry, so a deliberate omission is distinguishable from a silent one
- [ ] Consider whether the reviews sibling should require per-block `scored-digest:` lines rather than free-form prose. The Issue 17 finalise file used a human-readable digest custody table and check (m) skipped entirely as a result.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P099, P140

## Related

Captured via `/wr-itil:capture-problem`.

Hang-off check dispatched against P099, P120, P122 and P140; verdict PROCEED_NEW. Rationale from that arbitration, recorded here so the next reviewer sees what was considered:

- **P099** (post-finalise edits do not re-run the full gate set) is the closest by vocabulary and was explicitly tested as a parent. It is a freshness defect requiring a prior passing verdict plus a later body edit, and its mechanism is comparison-based by construction. This capture has no superseded verdict: three gates produced none at all, in a phase that took no post-gate edit. Absorbing absence-detection would also contaminate the live-run verification P099 is parked on.
- **P120** (gates surface findings instead of remediating) has the inverse precondition, since it requires the gate to have run and produced findings. This is upstream of that.
- **P122** (no gate owns within-edition structural mechanics) is coverage absence. These three gates exist, are prescribed, and work: all three found real defects when run. The gap is enforcement of execution.
- **P140** (lint and SKILL disagree on the prep-phase reviews sibling path) is a precondition on the same surface, not a parent. Fixing P140 makes check (m) run at prep; a correctly-named sibling with three gate blocks missing would still pass it cleanly.

Suggested for the next `/wr-itil:review-problems` cluster pass: a common parent over this ticket plus P099 and P140, on the theme that the reviews sibling is the gate ledger and nothing validates it against the phase's prescribed gate set. Freshness, completeness and addressability of one enforcement surface.

Companion concern, tracked separately: the Wardley critic's seven findings on the 2026-08-09 map mutation are an artefact-quality matter rather than an enforcement one. The unjustified `Delivery Pipeline->Build Artifact Stores` edge was fixed in the same session; the remaining six findings are unaddressed.
