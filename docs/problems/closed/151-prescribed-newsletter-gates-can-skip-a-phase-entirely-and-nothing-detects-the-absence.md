# Problem 151: Prescribed newsletter gates can skip a phase entirely and nothing detects the absence

**Status**: Closed
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

**The Wardley critic is worse than the other two.** `scripts/check-newsletter-structure.sh` reads `if (h ~ /wardley/) is_verdict = 0;`, on the grounds that the Wardley critic scores `ai-landscape.md`, a third artefact the check has no target for. So for that gate, absence and staleness are both invisible, even when a verdict block is present. (The ticket originally cited this as line 498, verified 2026-08-10; P140's fix moved it to line 534 the same day. Cited by content here rather than by line, since the line drifts.)

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

- [x] Investigate root cause
- [x] Create reproduction test
- [x] Define the roster of blocks each phase prescribes, DERIVED from the SKILL's own step-16 save templates rather than restated
- [x] Add check (o) to fail on a missing prescribed block, alongside (m) which fails on a stale present one
- [x] Decide how the Wardley critic is covered given it scores a third artefact (`ai-landscape.md`) the lint has no digest target for
- [x] Decide whether an explicit recorded skip (with reason) is a permitted ledger entry, so a deliberate omission is distinguishable from a silent one
- [ ] Consider whether the reviews sibling should require per-block `scored-digest:` lines rather than free-form prose. The Issue 17 finalise file used a human-readable digest custody table and check (m) skipped entirely as a result. Still open: check (o) asserts a block exists, not that it carries a digest.

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


## Resolution

Committed 2026-08-23.

**Check (o) in `scripts/check-newsletter-structure.sh`.** For the run's phase it derives the roster of blocks the `/wr-newsletter` SKILL prescribes, then fails the save on any that has no `## ` block in the reviews sibling. Check (m) could never see this: it classifies only the headings physically present, so a gate that never ran produced nothing to classify. Freshness and absence are now separate checks over the same ledger.

**The roster is derived, never restated.** It is read at run time from the SKILL's own step-16 save templates. A second copy in the script would be exactly the two-surfaces-disagree defect P140 closed on this file a day earlier, and it would drift in the direction that stops checking. The trade is that the coupling now fails open on *partial* drift: a heading quietly dropped from a template shrinks the roster and the check stops asking for that gate. `scripts/check-newsletter-structure.test.mjs` pins both the raw template heading count (prep 12, finalise 24, full 15) and the collapsed gate roster (prep 12, finalise 15, full 15), plus a named canary per phase, so a shrink or a rename goes red instead of quiet.

**Grain is the gate, not the heading.** A finalise template splits one gate across `(finalise)` and `(prep)` blocks; those are two passes of one gate and collapse. That collapse gives something up, named here so nobody reads the check as covering more than it does: a carried prep block satisfies a finalise slot on its own, and nine of the fifteen finalise slots have a prep twin, so a finalise pass that re-runs nothing still reads clean. Bounded rather than open. ADR-046 sanctions skipping the re-invocation when the artefact did not change, which is when the carry is legitimate, and the artefact-changed case is P099's rather than this check's. `(LinkedIn post)` does not collapse, because it names a different artefact, and letting the post's voice block satisfy the brief's would be this same hole one heading over. Matching also tolerates naming drift that still names the gate, so `Adversarial Skeptic Review` counts as the skeptic gate and `Cross-Edition Consistency Review` as the cross-edition one; both forms are on disk in the 2026-08-17 sibling, and a gate that ran under a drifted name is not a skipped gate.

**A recorded skip is a permitted ledger entry; a free-hand reason is not.** A block reading `N/A: <reason>` satisfies the check, which is the answer to the investigation task above. But the reason must be one the SKILL prescribes as a skip condition, per ADR-047 limit 2 (a sanctioned skip is one whose *documented* skip condition holds). Without that binding, one typed line would discharge any gate and this defect would simply move up a level. Step 17 now also names every recorded skip in the summary to Tom with its reason, so a skip reaches him as a judgement call rather than sitting in a companion file nobody reads.

**The Wardley critic.** Check (m) excludes it because it scores `ai-landscape.md`, a third artefact this lint has no digest target for; that exclusion stays. Check (o) is a presence check, so `## Critic Review: Wardley Artifacts` sits in the roster and its absence is now caught independently of the digest question. ADR-052 rider 2 records the (m) exclusion as an implementation choice rather than a ratified one, so nothing here overrides a decision. Its other half, that a reviewer which does not score the edition does not gate it, is about whether a Wardley *verdict* holds publication; check (o) is indifferent to the verdict, and a REJECTED Wardley block satisfies it just as a PASS does.

**Two SKILL defects of the same class, found while deriving the roster and fixed in the same change.** The `phase=finalise` reviews template carried no `## Cross-Edition Consistency` block at all, and the `phase=full` prose enumeration omitted it too, while the phase table prescribes step 11.4 in both. A prescribed gate with nowhere to record its verdict is the same defect this ticket names. Finalise gains one unqualified block, matching step 11.4-prime's carry-forward wording rather than splitting into a `(prep)` / `(finalise)` pair that would have put the lint and step 11.4 in disagreement. `phase=full` gains a literal template in place of its prose enumeration, which also removes the special case the roster derivation would otherwise have needed for that phase.

**Verified against the published corpus.** `src/newsletters/published/leader/2026-08-17/` fires nine `[o]` violations, covering the five its own ledger prose admits have no verdict plus Map Delta, URL Verification and two LinkedIn-post blocks; the two drifted headings correctly do not fire. `2026-08-10/`, the Issue 17 edition this ticket was captured from, fires fifteen: its reviews sibling is a hand-written narrative carrying none of the prescribed headings.

Those two are the witnesses the ticket names, but they are not the whole picture, and an earlier draft of this section said "the two published editions on disk" because only those two were run. Eighteen leader editions are published, sixteen carry a reviews sibling, and **all sixteen fire `[o]`**, between three and fifteen violations each. The archive predates the check, so that is expected rather than alarming. No published body was edited; they have reached readers. Nothing breaks either: no GitHub Actions workflow runs this lint or `npm test`, `scripts/push-watch.sh` gates on deps and CI status rather than the suite, and inside the suite the corpus regression case filters on `[k]` alone while the live-corpus `(l)` case asserts only `status != 2`. Each of those was read rather than assumed.

**No new decision record.** ADR-052's Confirmation section contemplates deterministic pre-save checks in this script alongside check (m), which is the shape of check (o), and its Related section names this ticket by number. It names it as "the adjacent defect", though, so the honest reading is that ADR-052 anticipated this check rather than already deciding it; the ground for adding no record is that plus the P140 precedent on the same file, not a claim that the rule was already ratified. Precedent for the shape is P140 on the same file: conformance to existing decisions, no record that would only restate them. **No changeset**: `package.json` is `"private": true` and this is a repo-local dev lint plus a SKILL and its tests, matching every prior commit to this script.

89/89 vitest green on this file; 561 passed and 2 skipped across the full suite.

**One residual left standing, and the reason matters.** Check (o)'s only defence against a roster that shrinks silently is the cardinality pin in the test file, and nothing runs that pin automatically: no CI workflow runs `npm test`, `scripts/push-watch.sh` gates on deps freshness and CI status instead, and there are no git hooks. The risk scorer first put this at 8/25, above the appetite of 5, then re-scored it to 4 and corrected the reasoning an earlier draft of this paragraph gave. That draft said the residual was tolerable because the exposure is repo-wide rather than this change's; recording a risk and queueing it is not a control, and deferral earns no reduction. The number moved because the first score charged this commit with the impact of the defect it fixes. A roster that shrinks costs the coverage of one dev lint; the run still completes, the gate is still prescribed by the phase table and by its own step, and nothing reaches readers. Reaching reader harm needs the gate to also not run and seven other gates plus the operator to also miss it, which is likelihood, not impact.

The CI-gating work is therefore not owed by this commit, and two things argue against doing it here anyway: all 561 tests in the repo share the exposure, so it is a repo-wide pipeline decision; and adding a job to the release-blocking `main-pipeline.yml` under gate pressure, on a newsletter lint's ticket, is a riskier change than the one it would be gating. It is a real standing risk. Queued for the maintainer.

### Reviews

Architect returned ISSUES FOUND twice. First pass, four findings, all adopted: bind the `N/A` reasons to the SKILL's documented skip conditions rather than accepting free-form ones; fix the `phase=full` prose omission rather than papering over it in the derivation; reconcile the finalise Cross-Edition Consistency block with step 11.4-prime's unqualified wording; and pin the roster cardinality against silent partial drift. It also corrected two claims in the ticket's own prose, both fixed above. The JTBD reviewer independently reached the first two of those, and added the step-17 surfacing requirement so a skip reaches Tom under JTBD-300 outcome 2. Second pass on the diff found two more. The sanctioned skip reasons were being scraped out of the SKILL's prose, so punctuation decided what counted and one stray line could have sanctioned everything; they are now declared once in an anchored block the script reads, with every declared reason pinned by test. And the `(prep)` / `(finalise)` collapse was presented as a lossless matching nicety when it is a real coverage limit, now disclosed in the ticket, the SKILL and the script comment. Voice and tone returned two rewrites on the SKIP strings and six more over the new prose, all adopted. Style guide: PASS, nothing in scope.

The risk scorer returned STOP at 10/25, and it was right: the corpus figure above was false on disk and had already propagated into the README's verification watch-line before anyone re-read the corpus. That is P032 and P103 recurring at the ticket-evidence surface, in a Resolution section arguing for its own carefulness. Both places are corrected, and the test count was stale by one for the same reason. It also caught the ADR-052 overstatement.

## Verified

Closed 2026-08-25 on evidence from The Shift Issue 19, the first edition produced after check (o) landed.

The Resolution section named the test: whether check (o) holds a save on a ledger missing a prescribed block. The measurement it recorded was that all sixteen published editions carrying a reviews sibling fire between three and fifteen `[o]` violations, the archive predating the check.

Run against Issue 19's published edition on 2026-08-25, the lint reports zero `[o]` violations and exits 0. That sibling carries twenty-three `## ` blocks. So the check discriminates in both directions on live artefacts: fifteen on the narrative sibling that carries none of the prescribed headings, nine on the 2026-08-17 edition whose own prose admits five gates have no verdict, and none on an edition whose ledger is complete. A check that only ever fires is not evidence it is measuring the right thing; the clean run is what closes that.

One residual is carried forward rather than closed, because this edition did not exercise it. The Resolution discloses that the `(prep)` / `(finalise)` collapse lets a carried prep block satisfy a finalise slot on its own, and that nine of the fifteen finalise slots have a prep twin. Issue 19 ran a prep phase (its capture transcript records `phase-written: prep`), so the collapse was in play and a finalise pass re-running nothing would still have read clean here. Nothing about this run tests that hole. It stays disclosed in the Resolution, in the SKILL and in the script comment, and the artefact-changed case belongs to P099.

The other standing residual, that nothing runs the cardinality pin automatically because no CI workflow runs the suite, is unchanged and remains queued for the maintainer. It is a repo-wide exposure shared by all tests, not owed by this ticket.
