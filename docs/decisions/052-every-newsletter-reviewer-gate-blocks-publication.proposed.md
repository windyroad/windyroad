---
status: "proposed"
date: 2026-08-10
human-oversight: unconfirmed
decision-makers: [Tom Howard]
consulted: []
informed: []
reassessment-date: 2026-11-10
amends: [012-ai-generated-content-review-gates, 015-reader-respect-and-gate-rejection-policy, 020-newsletter-editor-subagent, 025-pass-with-author-overrides-verdict-for-sw-critic, 035-critic-rubric-shape-is-strengths-weaknesses-plus-context, 042-newsletter-adversarial-skeptic-gate, 043-bounded-editorial-remediation-loop-for-editor-and-skeptic-gates, 044-cross-edition-shape-as-a-fresh-context-subagent-gate]
related: [047-stale-gate-verdicts-are-re-run-and-the-check-over-reports, 053-the-shift-adopts-an-h2-rooted-section-outline-from-issue-17]
---

# Every newsletter reviewer gate blocks publication

> Captured via /wr-architect:capture-adr (foreground-lightweight aside-invocation per ADR-032, derived-substance amendment 2026-07-06 / RFC-045). Section content was derived by the capturing agent from the in-session decision context; human-oversight: unconfirmed until ratified at the /wr-architect:review-decisions drain.

## Context and Problem Statement

Until 2026-08-10 the `/wr-newsletter` pipeline split its reviewers into two classes. Voice, content risk, URL verification and cross-edition consistency blocked publication. The newsletter critic, the editor, the adversarial skeptic, the cross-edition shape gate and cognitive accessibility did not. Their findings were surfaced, optionally remediated inside ADR-043's bounded one-round loop, and anything surviving was written into the edition's `.reviews.md` as an accepted residual advisory.

The Issue 17 finalise run exposed what that split costs. A sentence reached the publish-bound draft that the author read and could not parse. It had passed voice and content risk, because neither owns readability. The gate that does own readability, cognitive accessibility, had scored a version of the body from several hours and roughly ten edits earlier and was never re-run. Its staleness was recorded honestly in the reviews file, and the edition was still called ready, because the blocking set contained no readability gate at all.

When every reviewer was subsequently run against the current text, they returned findings they themselves classified as defects rather than preferences. Among them: an item heading asserting an escape its own body explicitly denied; a policy leg promised three times in the edition's organising frame and operationalised nowhere; an unbounded negative claim about a named vendor's whole disclosure corpus; a jurisdiction test written by reader location where the law follows the organisation; a forward-look section asserting a thread had not moved when the edition's own capture transcript recorded that it had; and a compliance date stated as a binding obligation when two prior editions had sourced it as unadopted relief.

The author's diagnosis of the pattern is the decision driver. The failure mode is the accumulation of per-edition decisions not to make something a blocking error. That weakening compounds across editions, and the large churn observed when the gates are re-applied is the interest payment on it. It is not an argument to abandon the gates. It is an argument to be rigorous with them.

## Decision Drivers

- Accepted residuals accumulate silently across editions. The residual section of the reviews file functioned as a debt ledger rather than an audit record, and nothing ever drained it.
- Readability had no blocking owner, so a sentence could satisfy every blocking gate and still be unreadable.
- An advisory gate's verdict going stale carries no consequence, so advisory gates drift out of sync with the published text as a matter of course rather than exception.
- The author, not the pipeline, was acting as the last line of defence on comprehensibility. That is the check the gates exist to take off him.
- Deferral is cheap per edition and expensive in aggregate, and the cost is paid all at once, on publish morning, by whoever next tries to enforce the standard.

## Considered Options

1. **Every reviewer must return a pass (chosen).** No edition publishes while any reviewer holds a non-pass verdict. Accepted residuals cease to be a publication path.
2. **Freshness-only blocking.** Every reviewer must have scored the exact published text, but findings remain triageable and can still be accepted as residuals. Closes the staleness hole that produced the triggering defect, at much lower cost.
3. **Defect-blocking.** Every reviewer must have scored the published text, and anything the reviewer classifies as a defect must be fixed, while findings it classifies as editorial judgement can be declined on the record.
4. **Status quo.** Keep the two-class split and rely on the author reading every line.

## Decision Outcome

Chosen option: **"Every reviewer must return a pass"**, because the driver is not the single staleness defect but the multi-edition accumulation of deferrals, and options 2 and 3 both preserve a deferral path.

Option 2 would have prevented the specific sentence that triggered this decision, and was offered on exactly that basis. It was rejected because it leaves the residual mechanism intact. Option 3 was rejected because the defect-versus-taste boundary is drawn by the reviewer, which makes the strength of the gate a function of how conservatively each agent self-classifies.

The author selected the strictest reading with the costs stated in advance.

**What counts as a pass.** The reviewers do not share a verdict vocabulary, so the rule is not "the verdict string reads PASS". A reviewer passes when it holds no finding, against the published text, that it classified as a defect.

That is Option 3's test, and Option 3 was rejected above because only the shape gate emits a class marker. What makes it workable here is a distinction Option 3 did not draw and `SKILL.md` already states: findings from the editor and the skeptic are defects by construction, since both score against stated standards. A reviewer may classify itself out of a finding only where a ratified decision defines the emission, which today means ADR-044 and the shape agent alone. Absent that, an unclassified finding is a defect. Otherwise the next gate to add a `CLASS:` line self-exempts as an implementation detail.

Three riders follow, and they are the rule rather than exceptions to it.

1. **Anything the loop is forbidden to act on is cleared by the author, not by an edit.** ADR-043 clause 2 draws the defect-versus-deviation line and clause 3 sets the precedence; the cross-edition shape gate emits `CLASS: defect | deviation` and, separately, `AUTHORITY: remediating | advisory`. Those two axes are not the same axis: a finding can be `CLASS: defect` and still `AUTHORITY: advisory` where no ratified job outcome grounds it, so "only deviations" and `REMEDIATING_COUNT: 0` are different states and the rule must key on the second. The general form: **any finding that the reviewer, or a ratified decision, forbids the remediation loop from acting on is cleared by the author with a stated reason under ADR-043 clause 4, whatever its class.** On disk that covers five things, and all five would otherwise hold an edition with no path to clear it: a shape-gate deviation; a shape-gate defect carrying advisory authority; the ADR-032 provenance line, which is remediation-invariant permanently; a skeptic finding that cannot be remediated without new sourcing; and any finding whose only remediation crosses an ADR-032 item or section boundary. ADR-044 confirmation criterion 8 forbids an advisory finding from ever becoming an applied edit, so author-clearing is the only path that exists.
2. **A reviewer that does not score the edition does not gate it.** The Wardley critic scores `ai-landscape.md` at step 9, a third artefact that is never published; the newsletter critic scores the edition at step 15. This rider is grounded on that artefact split and on this rule's own words, "against the published text". It is not grounded on ADR-047, which names no exemption for the Wardley critic; the deterministic freshness check in `scripts/check-newsletter-structure.sh` does exclude it, but that exclusion is an implementation choice and not a ratified one.
3. **`PASS_WITH_AUTHOR_OVERRIDES` is not a pass.** It is the deferral path this decision closes. On round-3 exhaustion the critic returns REJECTED, or the remaining weakness is surfaced as a deviation for the author to clear on the record.

Without this section the rule is not merely strict, it is unsatisfiable. An advisory shape finding cannot be cleared by editing, because ADR-044 forbids it, so under a verdict-string reading it could never be cleared at all. That is this decision's own reassessment criterion 4 firing on the day it was written, against itself.

**ADR-047's bound is unchanged.** A gate re-run under this rule is still once per save. A re-run that returns a non-pass holds the edition; it does not trigger a further round of re-runs.

**In force as of 2026-08-10.** The decision was recorded and implemented in the same session, in that order, and the gap between the two is worth keeping in the record because it was real for several hours. When first written this ADR described a rule the pipeline did not run: `SKILL.md` still said surviving findings are "recorded as an accepted residual advisory", the step 16 templates and step 17 summary still prescribed `RESIDUAL (round 2, accepted)` entries, and the deterministic check named below did not exist. Issue 17 shipped under the rule applied by hand, which is why its reviews sibling records findings the author cleared with stated reasons rather than residuals.

What closed the gap: the accepted-residual exit at step 15.37 now sorts survivors into forbidden-to-remediate (cleared by the author with a stated reason) and everything else (which holds the edition); the cognitive-accessibility gate's verdict basis moved from a reading-grade formula to a defect-or-preference classification with grade level as supporting evidence; both LinkedIn surfaces route through the same sort; the step 17 summary now leads with a computed publication status rather than a list of verdicts for the author to reconcile; the newsletter critic's `PASS_WITH_AUTHOR_OVERRIDES` is demoted from "publish-ready signal" to "weaknesses remain, unresolved"; and check (n) landed in the lint with ten tests, four of them positive-detection cases each verified to fail with the check removed.

## Consequences

### Good

- Readability, editorial quality, adversarial claim-calibration and cross-edition shape all gain the standing they previously lacked, and cannot be deferred by an operator under time pressure.
- Residual debt cannot accumulate, so no future edition inherits an unbounded backlog of deferred findings.
- Gate staleness becomes self-correcting. A gate holding a non-pass verdict on superseded text has to be re-run to clear it, so it necessarily reads the current body.
- Applied to Issue 17 immediately, the rule surfaced genuine factual defects the prior regime would have shipped, including two misattributions of the publication's own back catalogue and a compliance date stated the opposite way round from the position two prior editions had sourced.

### Neutral

- ADR-043's bounded remediation loop still governs how findings are acted on within a pass. What changes is that surviving findings no longer constitute a publication path.
- The reviews sibling keeps its residual section, but it now records author-declined judgement calls rather than deferred defects.

### Bad

- Editions take materially longer to publish. Issue 17 was held past its Monday slot.
- The editor and the skeptic can hold an edition on judgement calls, since neither returns a mechanical pass while any craft weakness stands. In effect an agent can determine the running order and length of the publication unless the author declines on the record.
- Reviewers can require mutually incompatible changes, and arbitration falls to the author. Two such conflicts arose within the first hour: cognitive accessibility required heading-structure changes that the deterministic structure lint forbids, and the draft template contradicts the lint's own test fixture on section-label punctuation.
- Remediation itself introduces defects. On Issue 17, successive rounds recorded two of three blockers as fix-induced, and one known long sentence grew while adjacent findings were being cleared. A must-all-pass rule risks oscillation rather than convergence when remediation quality is low.

## Confirmation

- No edition publishes while any reviewer that scored it holds a finding that reviewer classified as a defect. This is deliberately not a list of forbidden verdict strings: the enumeration was already incomplete against a single edition, where cognitive accessibility emitted `REVISE` at prep and `NEEDS_REVISION` at finalise, and any fixed list will rot as agents change their vocabulary.
- The reviews sibling records, per gate, the digest scored and whether each surviving finding is a defect or a deviation. A deviation carries the author's stated reason for clearing it.
- A deterministic pre-save check in `scripts/check-newsletter-structure.sh`, alongside check (m), asserts that every non-pass verdict block in the reviews sibling carries either a remediation or an author-stated clearing reason. **Shipped 2026-08-10 as check (n).** It asserts the bookkeeping rather than trying to recompute a verdict: a `BLOCKING` tag must not still be standing at save, a `CLEARED` or `DECLINED` tag must carry a reason, and the retired `RESIDUAL (round 2, accepted)` tag is rejected outright. Ten tests. The four positive-detection cases (a standing BLOCKING tag, a CLEARED tag with nothing after it, a CLEARED tag followed only by the finding's own metadata fields, and the retired RESIDUAL tag) were each verified to fail with the check removed. One further test binds the script's literal tag strings to the ones SKILL.md prescribes, closing the template-drift gap check (m) was fixed for. This rule is not left to prose. P099 shipped a prose rule at this exact surface and its own Effort line records that the rule did not hold; ADR-047's answer was a deterministic check that blocks the save, and this decision takes the same answer.
- `SKILL.md` describes this rule rather than the one it replaces: the preamble, step 15.37's exit condition, step 15.4, step 16's save blocks and step 17's summary. **Done 2026-08-10**, together with the two LinkedIn surfaces at 15.55 and 15.57 and the phase carry-forward at 15.37-prime, which the original criterion missed.

  It took four passes, and how it kept failing is worth more than the fact that it did. Each pass swept for the previous pass's phrase and declared clean, and the next reviewer found more. The miss pattern was asymmetric pairs: two sites stating the same rule, one rewritten and its twin left. `834` fixed while `858` stood; `947` fixed while `897` stood; `1359` fixed while `1340` stood. The last pass also found the rule alive in synonym form after the phrase was gone, as "non-blocking save-but-revise", "not a hard publication block" and "residual status intact", plus a botched replacement that left the word "accepted" in the editor agent, which is the exact word four of the eval's rubrics grade hardest against. Search for the RULE, not the phrase, and check whether a corrected site has a twin. A prep-time blocking finding is now still blocking at finalise rather than decaying across the phase boundary, which is the per-edition accumulation this decision exists to stop.
- The residual-advisory section of a published edition's reviews file contains only findings the author explicitly declined, each with a stated reason, and no finding a reviewer classified as a defect.
- Observable within three editions: the count of findings per finalise run falls, because the backlog is not being carried forward.

## Pros and Cons of the Options

### Every reviewer must return a pass

- Good, because it removes the deferral path entirely, which is the mechanism the driver identifies.
- Good, because it forces every gate to have read the published text, closing the staleness hole as a side effect.
- Bad, because it grants craft gates a veto over publication timing.
- Bad, because it has no built-in convergence guarantee when remediation introduces new findings.

### Freshness-only blocking

- Good, because it directly prevents the triggering defect at a fraction of the cost.
- Good, because it keeps editorial authority with the author rather than the reviewer.
- Bad, because residuals still accumulate, so the multi-edition decay continues unaddressed.

### Defect-blocking

- Good, because it blocks on wrongness and not on taste, which is where the real harm is.
- Bad, because the defect-versus-taste line is drawn by the reviewer, so gate strength varies with agent self-classification.
- Bad, because it requires every reviewer to emit a class marker, which today only the shape gate does.

### Status quo

- Good, because it is the cheapest per edition.
- Bad, because it is the option whose accumulated cost produced this decision.

## Known gaps in the implementation

Recorded rather than left for a later reader to rediscover. Neither is a reason to hold the decision; both bound what it currently buys.

- **The two-class sort is prose an LLM applies. It now has a behavioural harness, which narrows the gap without closing it.** A drafter that puts a remediable defect into the forbidden-to-remediate class gets it cleared by the author on a plausible reason, and the edition ships the defect with a clean audit trail. Check (n) cannot see this: it verifies that a reason exists, never that the class was right. Two things bound the risk. Four of the five limbs are marker lookups rather than judgement, since a shape-gate deviation and a shape-gate advisory-authority defect are both read off the `CLASS:` and `AUTHORITY:` lines the shape agent emits by contract, the provenance line is identifiable by inspection, and a skeptic finding needing new sourcing is declared as stop-and-surface by the skeptic; only "crosses an item or section boundary" is open judgement. And a promptfoo eval at `.claude/skills/wr-newsletter/eval/` now exercises the sort against the real skill, with six fixtures covering the over-classify direction (a remediable editor defect must block, not be cleared), four of the five forbidden limbs including the boundary-crossing one this ADR identifies as the only open judgement among them, and the demoted critic verdict. The provenance-line limb is the uncovered one.

  What the harness does not do: it samples, it does not prove. Six fixtures are not the space of findings, the grading is itself an LLM, and two runs of the same unchanged config disagreed by one test during authoring, so a single green run is weak evidence. `repeat: 3` is set so a run reports a pass fraction rather than a boolean. Treat a red as a real signal and a green as an absence of one.

  **Two of the six fixtures do not currently discriminate, and this is recorded rather than fixed.** The falsification is wired as `npm run eval:newsletter:falsify`, which swaps in the SKILL.md from immediately before this decision was implemented and fails unless every fixture goes red against it. On its first run, 2026-08-10, it reported four red and two still passing. Those two pass whether or not the skill implements the sort, so they guard nothing. Which two was not established: the identifying run was interrupted. The harness therefore ships with a known and named hole, and the script that found it is the thing that will keep finding it.

  The authoring lesson is recorded in the config header because it nearly shipped hollow. The first version of the fixtures asked the model to "sort this finding into its ADR-052 class", which handed it the structure under test; falsified against the pre-implementation skill, four of the five then present still passed. The fixtures were rewritten to be neutral, and four of the six rubrics tightened to require that publication be conditional on the author's stated reason, which is the property that actually distinguishes this decision from the regime it replaced. That took the falsification result from four passing to two. Finishing the job means driving it to zero.
- **Check (n) enforces literal tag strings.** A reviews sibling writing `CLEARED:` rather than `CLEARED (forbidden to remediate)` escapes it. A test binds the script's matchers to the tag strings `SKILL.md` prescribes, which closes template drift but not free-hand drift.

## Reassessment Criteria

- Two consecutive editions fail to converge, meaning a remediation round introduces as many reviewer-classified defects as it clears.
- An edition misses its publication slot by more than one day on craft findings alone, with no factual or claim defect outstanding.
- The count of reviewer findings per finalise run has not fallen after three editions, which would indicate the debt model is wrong and something else drives the volume.
- A reviewer conflict arises that the author cannot arbitrate without changing a ratified structural invariant, making the rule unsatisfiable rather than merely expensive.

## Related

- **ADR-043** (bounded editorial remediation loop for the editor and skeptic gates) still governs remediation mechanics within a pass, but its accepted-residual exit is no longer a publication path.
- **ADR-047** (a gate whose verdict predates the current draft is re-run) established the principle for staleness; this decision generalises it from staleness to verdict.
- **ADR-015** (reader-respect and gate-rejection policy) established the save-but-revise semantics this decision supersedes for the advisory gates.
- **ADR-020, ADR-042, ADR-044** define the editor, skeptic and cross-edition shape gates, all previously advisory and all now blocking.
- **P053** established the cognitive-accessibility gate's one-round-with-optional-remediation contract, which this decision supersedes.
- **P151** captures the adjacent defect that a prescribed gate can skip a phase entirely with nothing detecting the absence, because ADR-047's check only compares verdict blocks that exist.
