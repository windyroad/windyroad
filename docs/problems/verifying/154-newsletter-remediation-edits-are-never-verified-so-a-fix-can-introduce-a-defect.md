# Problem 154: Newsletter remediation edits are never independently verified, so a fix can introduce a defect that survives until the next full battery

**Status**: Verification Pending
**Reported**: 2026-08-17
**Priority**: 12 (Medium), Impact: 3 x Likelihood: 4, derived at capture from the description per Step 4a. Impact 3 because the failure ships reader-facing prose defects and factual errors into publish-bound drafts rather than breaking a system, matching the calibration P151 and P152 set for reader-facing newsletter defects. Likelihood 4 on the same basis P152 used: it recurred repeatedly inside a single edition and no mechanism prevents recurrence. Five instances in one edition is at the top of that band rather than outside it.
**Origin**: internal
**Effort**: M, derived at capture: a contract change to the step 15.37 loop plus a cheap deterministic re-check at round close, and a decision about whether the expensive diff-scoped read is worth its invocation. Comparable to P152, also rated M.

## Description

The newsletter editorial remediation loop has no verification step of its own. A remediation edit that introduces a new defect is invisible until the next full gate battery happens to re-read that passage.

ADR-043 defines the bounded loop at `.claude/skills/wr-newsletter/SKILL.md` step 15.37: collect the findings, remediate each one minimally, re-invoke the contributing gates once. ADR-047 separately re-runs any gate whose verdict predates the current draft, via the `scored-digest` mechanism and check (m). Neither asks whether a remediation edit is itself correct. The loop re-invokes the gate that raised the finding, which will confirm its own finding is addressed and says nothing about damage the edit did elsewhere in the passage or elsewhere in the artefact. *(This sentence originally read that ADR-046 worsens it at the margin, because an unchanged-artefact skip can suppress the re-read that would have caught it. That is wrong and was corrected at fix time; see the ADR-046 finding under Root Cause Analysis. The skip fires only when no edit landed at all, so it cannot suppress the re-read of an edited passage.)*

Observed five times during the 2026-08-17 Issue 18 prep run. Four were caught only a full battery later; three were regressions on gates that had already returned a pass on the very passages the fix broke.

1. **Factual regression from propagating a gate suggestion unverified.** The cognitive-accessibility gate raised a referential defect on the phrase "the July event" and suggested, as its own preference, dating the referent at first mention: "a US directive from July". That month was the agent's inference from surrounding context, not a checked fact. It was applied verbatim. The directive was June, verified afterwards against `src/newsletters/published/leader/2026-06-22/2026-06-22.md` (Issue 10), which reads "Last week a US directive forced Anthropic to suspend foreign access". Content risk had returned PASS on that passage before the edit and returned REJECTED with `factual=high` after it. Cross-edition consistency had returned SUPPORTED before and CONTRADICTS after. One unverified fix flipped two passing gates to failing.

2. **A second factual regression of the same shape, later in the same run.** Acting on a voice-gate advisory to carry an antecedent for the word "counterweight", the drafter expanded a callback into "the Chrome result we ran in Issue 16 where AI fixed more browser bugs in a month than the prior two years combined". Issue 16 as published (`src/newsletters/published/leader/2026-08-03/2026-08-03.md`) says 1,072 security bugs across Chrome 149 and 150, more than the prior 23 milestones combined, with an explicit caveat that nobody outside Google has reproduced it. Two releases is not a month, so the compression roughly doubles the implied rate against an unchanged denominator, and the same sentence upgraded an unreproduced vendor-internal result to "evidence that the capability works", which is the reading Issue 16 told readers not to take. Content risk caught it on the final pass, again at `factual=high`.

3. **Duplication introduced while fixing sentence length.** The cognitive-accessibility gate flagged a 46-word stacked sentence in the OpenAI ads entry. Splitting it produced two statements of the same contract-term limitation four words apart. The editor gate caught it on the next pass and named the cause: "this reads as new damage from a sentence break-up rather than a pre-existing issue".

4. **Banned word reintroduced while fixing a comprehension defect.** Rewriting a bullet to put the question before the answer produced "how long a government-ordered model suspension actually costs". The voice gate had already failed the edition once on "actually" as defensive emphasis, and failed it again on the instance the fix created.

5. **New ambiguity introduced while fixing an over-claim.** The skeptic flagged "no control at all" as overstated. The reduction produced "no control that runs without a person watching", whose relative clause can attach to either noun. Cognitive accessibility then classified that as a blocking comprehension defect and noted that both readings are true, which is what makes it hard to detect.

The common shape: remediation is performed by the agent that wrote the passage, immediately after being told what is wrong with it, and nothing independent reads the result before the round closes. The gates are not the weak point. Every one of these five was caught. They were caught a full battery late, which is what turned ADR-043's one-round budget into five rounds on this edition and is a direct contributor to the churn ADR-052 was ratified to reduce.

Instances 1 and 2 share a narrower sub-shape worth naming separately: a reviewer gate supplied a factual claim inside a suggested fix, and the drafter applied it without checking the source. That is gate-output grounding rather than gate coverage, and no current rule covers it.

## Symptoms

- A gate that passed a passage on one round fails the same passage on the next, because the fix for a different gate's finding broke it.
- A remediation round closes with the raising gate satisfied and a new defect elsewhere in the same sentence.
- A factual claim suggested by a reviewer gate reaches the draft without ever being checked against the cited source.
- Round counts exceed the ADR-043 budget, and the extra rounds are spent on defects the prior round created rather than on the original findings.

## Workaround

Before this fix shipped: re-run the free deterministic checks by hand after every remediation edit rather than only at save:

```
bash scripts/check-newsletter-structure.sh <draft>
grep -nE '\bactually\b|\bleverage\b|\bdeep dive\b|\breach out\b' <draft>
```

And treat any factual assertion inside a gate's suggested fix as a hypothesis, checking it against the cited artefact before applying. Both depend on the operator remembering, which is the defect. Note that the grep above is a hand-typed second copy of the guide's Avoid list and would drift from it; check (p) parses the guide instead. Both halves are now automatic: check (p) and the step 15.37 round close.

## Impact Assessment

- **Who is affected**: readers of any edition, and the author, who absorbs the extra rounds and the publish-deadline slip.
- **Frequency**: five instances in one edition, 2026-08-17 Issue 18 prep. The loop runs on every edition, so the exposure is per-edition rather than occasional.
- **Severity**: two of the five were `factual=high` content-risk findings, meaning wrong facts about named third parties in publish-bound prose. The other three were comprehension and voice defects. None reached publication, because the battery caught them, but only because the battery ran again.
- **Analytics**: not instrumented. Round counts per edition are recoverable from the `## Editorial Remediation Loop` block in each reviews sibling.

## Root Cause Analysis

The loop's verification is scoped to the finding, not to the edit. Re-invoking the raising gate answers "is the thing I complained about fixed", which is necessary and insufficient: it cannot see damage outside its own axis, and in the two factual cases the raising gate was the source of the error rather than its detector.

A second contributor is who performs the remediation. The drafter that wrote the passage rewrites it under time pressure immediately after being told it is wrong, which is the same independence problem the fresh-context gates exist to solve everywhere else in this pipeline, applied to the one step that has no fresh-context reader.

**Confirmed at fix time, 2026-08-23.** Verified against the files rather than taken from the prose above.

**The loop had no deterministic close.** `scripts/check-newsletter-structure.sh` ran at step 16 save and nowhere else. Every remediation round therefore closed with the raising gate satisfied and nothing at all having re-read the edited bytes, free or otherwise. The lint carried no voice word-list check, no markdown-hard-break check and no joined-paragraph check, which is why instance 4 and the two soft-break instances needed a human running greps by hand.

**The gate-supplied fact had no owner.** Step 15.37 item 2 said to remediate minimally at the named passage and said nothing about a factual assertion arriving inside the gate's own Suggested fix. Nothing in the pipeline distinguished "the gate told me this passage is wrong", which is the gate's job, from "the gate told me the fact is June", which is not.

**ADR-046 needs no carve-out, and the ticket's premise was wrong.** The skip is keyed on byte-identity with the version findings were collected against. An edit changes the bytes, so the skip cannot fire on a round that remediated anything; it fires only when the round produced no edit at all, which is precisely when there is nothing to re-read. It is also the more sensitive of the two digest tests in the pipeline, taking the whole file where check (m) strips frontmatter. The late catches on 2026-08-17 came from ADR-043 condition (a)'s loop-exit battery, not from a skip. This closes the investigation task that asked the question.

**The expensive option was not needed and was not costed further.** A diff-scoped agent read of the remediated passages remains the general answer to the general problem, and it remains an agent invocation per round against a decision that budgets one. The deterministic half plus the fact rule covers every instance on this ticket at zero invocations, so the general option stays unpriced rather than being adopted on a hunch. If instances keep arriving that neither half catches, that is the trigger to price it against P113's round economics.

### Investigation Tasks

- [x] Investigate root cause
- [x] Create reproduction test
- [x] Build the regression fixture from the five instances above before designing the fix
- [x] Land the cheap deterministic half first and measure it
- [x] Decide the gate-suggested-factual-change rule separately from the general case
- [x] Cost the expensive option honestly before adopting it: not adopted, and the reason is recorded above
- [x] Check whether ADR-046's unchanged-artefact skip needs a carve-out: it does not, by construction

## Fix Strategy

**The warrant is JTBD-300's first outcome, not the round count.** A defect a gate can name against a stated standard, whose fix is mechanical, is fixed before Tom reads the draft; finding it in his inbox is a routing failure. The round-count material in the Description, Symptoms and Impact sections above is the symptom this ticket measured and the evidence that the defect is real. It is not the justification: the job file's Notes record P122's forward rule blocking any gate axis whose only warrant is reducing Tom's review rounds, and the persona is explicit that a saved minute is not automatically a job outcome. The disclosure obligation in change 2 below hangs off the same job's third outcome.

Four changes, one commit, no new decision record. The deterministic checks land in the lint that already exists rather than in a new script, because a second deterministic surface is the two-surfaces-disagree defect P140 and P151 both closed on this same file this week.

**1. `scripts/check-newsletter-structure.sh` gains checks (p), (q) and (r), all brief-body only.**

- **(p) avoided word.** Parses the `Word list > Avoid` table of `docs/VOICE-AND-TONE.md` at run time. The list is not restated in the script; the guide is the surface Tom edits, and a copy here would drift. Whole-word, case-insensitive, skipping fenced code blocks, quoted spans and markdown link targets. Our own parenthetical glosses are not exempt: the guide tells writers to gloss an in-group term in parentheses, so exempting every parenthetical would exempt the one construction it asks for. The genre matters: the guide's list was written for landing-page copy, and in a news brief "leverage" (a market story) and "solutions" (a vendor URL, or the mathematical sense) are words the brief quotes rather than chooses. If a word on the list should be allowed in our own voice, that is a genre-scoped carve-out added to the guide, on the model of its existing auto-share and newsletter-cadence carve-outs. Not an exception in the script, and not a loosened Avoid row: that row governs site copy too, so relaxing it to unblock a brief would trade a reader-facing rule for an author-side convenience without the trade being visible.
- **(q) markdown hard break.** Two or more trailing spaces on a body line. Not any trailing whitespace: a single trailing space renders as nothing, and a check has to name the same thing its message explains. Unlike (r), no instance of this one is on record; the 2026-08-17 round closes ran it by hand and it never fired. Its warrant is the reader-visible render plus zero cost, and it is recorded that way so a later reader can re-price it honestly.
- **(r) joined paragraph.** Two prose lines with no blank line between them, which render as one paragraph, so a sentence the drafter split is silently rejoined for the reader.

Guide absent is a loud `SKIP [p]`. Guide present but its Avoid table unparseable is a `FAIL`, because drift is silent in the direction that stops checking.

**2. `.claude/skills/wr-newsletter/SKILL.md` step 15.37 closes each round on those checks.** The lint runs at collect to take a baseline, and again at round close; anything failing at close that was not failing at collect was introduced by this round's edits and is fixed inside the round. The close runs BEFORE item 3's paired agent re-invocation, so the editor and skeptic always score post-fix bytes. Lint after them instead and the fix lands after their `scored-digest`, which makes both verdicts stale under ADR-047, fires check (m) at save, and pulls the edit back through section 15.6, buying the agent invocations this step exists not to spend. Each close-lint fix is recorded as a passage before-and-after pair in the reviews sibling and the step-17 summary, per JTBD-300's third outcome: a pipeline that rewrites Tom's prose shows him the sentence, not a summary.

**3. The same step gains the gate-supplied-fact rule.** A factual assertion arriving inside a reviewer gate's Suggested fix is a hypothesis. Verify it against the artefact it concerns before the words go in the body, and record `Verified against: <path or URL>` beside the finding. Where the check falsifies the gate's fact there are two exits and no third: remediate using the verified fact, or stop and surface the finding with the falsification stated. Check (n)'s stated-reason test excludes the `Verified against:` label in the same commit, so a provenance line cannot masquerade as the author reason ADR-052 requires.

**4. `docs/VOICE-AND-TONE.md` gets three Avoid rows whose reason cell now stands on its own.** Check (p) lifts that cell verbatim into its failure message, which turns a column written for a human reading down a table into a machine surface. Three cells did not survive the move, because they only meant anything next to the row above them:

| Word | Was | Now |
|------|-----|-----|
| cutting-edge | Same | Unverifiable superlative |
| game-changer | Same | Unverifiable superlative |
| synergy | No | Empty corporate jargon |

Column 1 is byte-identical, so no word became newly banned or newly allowed and no rule governing site copy moved. Two of the three are pure anaphora resolution: `Same` under `best-in-class | Unverifiable superlative` resolves to exactly that string. `synergy` is the one authored rather than resolved, and it is assembled from vocabulary already in the same table. It is a one-line overrule at verification if Tom wants different words. The document's `**Last reviewed:** 2026-06-17 (Tom-curated: ...)` stamp is deliberately left alone: the curated thing is the banned list, and the banned list did not change.

**Costs no agent invocation, so ADR-043's bound is untouched.** ADR-046's Decision Outcome puts deterministic contributors outside the skip ("always re-run; only agent invocations are skipped") and its confirmation criterion 2 makes omitting one a defect, so a deterministic re-check at the round is the sanctioned shape rather than a tolerated one. No deviation approval was needed and none is queued.

### Measurement, including one that was wrong first

Across all 18 published brief bodies the three new checks fire **once** in total: `src/newsletters/published/leader/2026-05-01/2026-05-01.md:33`, a genuine "actually". (q) and (r) fire zero times.

The joined-paragraph check was nearly dropped on a bad measurement. A first pass had it firing 43 times across the archive, which read as a convention the corpus does not share; the predicate was treating an indented list item as prose, because it tested for a list marker at column 1. Corrected, the archive is clean and the check ships. The JTBD reviewer pushed back on dropping it, on the grounds that the soft-break defect is the one the 2026-08-17 ledger records recurring twice while trailing whitespace never fired at all. That push was right and it is the reason this check exists.

Whole-word matching is load-bearing and under-matching is accepted: "leveraging", "game-changing" and "reaching out" all pass (p). The complement is the LLM voice gate at step 13, which reads context. This is the deterministic second reader on a rule that already blocks.

## Fix Released

Shipped 2026-08-23. Awaiting a live `/wr-newsletter` run to verify: the evidence is the next edition's `## Editorial Remediation Loop` block showing the round-close lint reporting, with before-and-after pairs for anything it caught, and any `Verified against:` lines the fact rule produced.

Tests: 17 behavioural cases in `scripts/check-newsletter-structure.test.mjs`, 10 of them verified red against the pre-fix script; the other 7 are negative cases asserting the new checks stay quiet. One is a corpus regression over every published brief body, pinning all three checks at once: (q) and (r) clean, (p) exactly one hit and that hit at the 2026-05-01 edition. It covers all three rather than only (r) because the one lesson of this ticket is a measurement that rotted. 106/106 on this file, up from 89; 578 passed and 2 skipped across the suite.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P113, P151, P152, P099

## Re-pricing trigger fired, 2026-08-25

The ticket defers the expensive diff-scoped agent read and states its own trigger: "if instances keep arriving that neither half catches, that is the trigger to price it against P113's round economics." Issue 19 supplied those instances, so the trigger has fired and the deferral should now be re-costed rather than left standing.

The instances, all from that edition's record. The opener was rewritten four times and each of the first three rewrites introduced a new error the skeptic then caught. Rounds 18 and 19 produced what the record calls "a remediation that is itself a regression": a sentence cut back to remove an over-claim, where the cut removed the head noun that made the referent resolve, so the claim got safer and the sentence got harder. Six of the edition's nine recorded occurrences of the sibling-site defect were introduced by a fix rather than found by one.

The record then reaches this ticket's own conclusion independently: the gate that caught the regression was the one measuring comprehension, not the one that had asked for the reduction, "which is the argument for running both after an edit rather than only the gate that raised the finding."

Not closed, and the reason is stricter than the instances above. The stated verification is the reviews sibling showing a round-close lint report with before-and-after pairs. That block exists in the Issue 19 sibling but records stop-and-surface routing instead; no lint report, no pairs, no `Verified against:` lines. The disclosure half of this fix is warranted on JTBD-300's outcome that a pipeline rewriting Tom's prose shows him the sentence rather than a summary, so a fix whose disclosure obligation never fired is not verified because its detection half worked.

## Related

Captured via `/wr-itil:capture-problem`.

Hang-off check dispatched against P113, P151 and P152; verdict PROCEED_NEW. Rationale from that arbitration, recorded so the next reviewer sees what was tested:

- **P113** (newsletter review-gate loop, editor one nit per pass) was tested hardest as the parent and does not hold, on three grounds. Its two named causes are the editor's finding-emission grain and section 15.6's per-edit full-gate re-run, both about how findings are emitted and priced, neither about whether a remediation edit is itself correct. Both its Fix Strategy items are recorded as shipped. And it is parked awaiting a live `/wr-newsletter` run whose `## Editorial Remediation Loop` block is its verification evidence, so absorbing a new defect class would confound exactly that verification. The relationship is composes-with in both directions: the round-count data from this run is legitimate P113 verification evidence, and any per-round verification step interacts with P113's cost argument.
- **P151** (prescribed gates can skip a phase entirely) requires a gate that never produced a verdict. Here every relevant gate ran, wrote a verdict, and passed before the edit broke it. Enforcement of execution versus correctness of the edit.
- **P152** (no gate owns parse-on-first-pass comprehension) is an uncovered-axis defect. Here every one of the five was caught, just a full battery too late. Instance 5 is a comprehension defect and instance 4 involves a banned word, so the surfaces overlap, but the fix loci diverge: P152 changes a gate's verdict basis, this changes when and by whom a remediated passage is re-read. Instance 1 is a shape P152 does not cover at all, since the gate supplied the wrong fact rather than missing one.

**P099 was not in the pre-filtered candidate set and has not been arbitrated.** The hang-off subagent flagged it unprompted: both P151 and P152 name P099 (post-finalise edits do not re-run the full gate set) as the nearest freshness-defect ticket, and P151 describes its precondition as "a prior passing verdict plus a later body edit", which is structurally this ticket's precondition too. Test P099 as a parent or sibling at the next `/wr-itil:review-problems` cluster pass, alongside P151's standing suggestion for a common parent over P151, P099 and P140 on the reviews-sibling-as-ledger theme.

**Relationship to P082, which is closed.** P082 established verify-before-propagating for `ADR-NNN`, `RFC-NNN`, `JTBD-NNN`, skill names, script names and file paths cited in governance-subagent verdicts, on the asymmetric-trust model that the consumer verifies rather than the subagent. Instances 1 and 2 are the same failure applied to a different payload: a factual assertion inside a reviewer-gate's suggested fix rather than an artefact reference in a verdict. That is a scope extension of a closed ticket rather than a recurrence of it, and it suggests the verify-before-propagating rule should name reviewer-gate content suggestions alongside governance-verdict artefact references. This is the fourth surface in the verify-before-X family, after ticket prose (P032, P103), Fix-Strategy placement (P045) and subagent artefact references (P082).
