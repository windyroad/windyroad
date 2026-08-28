# Problem 158: The newsletter eval harness reports misconfiguration as results, so a broken run looks like a real one

**Status**: Known Error
**Reported**: 2026-08-23
**Priority**: 8 (Medium), Impact: 2 x Likelihood: 4, derived at capture from the description per Step 4a. Impact 2 because the blast radius is dev tooling: nothing here reaches the site or a reader, but the harness is the instrument that decides whether a change to a publication-blocking gate is actually tested, so a false green there lets an untested gate change ship believing it was covered. Likelihood 4 because item (a) is present in the shipped config right now and permanent until edited, and items (b) and (c) are on the path every future fixture author walks. Re-checked 2026-08-29 after the description's capture-time evidence was withdrawn: the rating still holds on the corrected evidence, because the inert key is confirmed live in the shipped config and stays there until someone edits it.
**Origin**: internal
**Effort**: M. At capture this was sized S, on the reasoning that the fix was to drop or correct one inert key in one config, correct one operator comment in `falsify.sh`, and write the two remaining gotchas down where the next fixture author reads them, which put it close to P140 (two surfaces disagree on one derivation), also an S on the same newsletter tooling. That sizing is superseded. Re-rated S -> M on 2026-08-29: the investigation found that correcting the claim ADR-052 makes about this key needs a new decision record plus a reciprocal frontmatter edit, a supersession-test run and a compendium regeneration, because ADR-054 permits frontmatter changes to a ratified record and nothing else. Few files, moderate change.
**WSJF**: 8.0 = (8 x 2.0) / 2 (re-rated 2026-08-29: Effort S -> M on investigation findings; severity and status multiplier unchanged. Previously 16.0 = (8 x 2.0) / 1, re-rated 2026-08-28 review: Open -> Known Error auto-transition, status multiplier 1.0 -> 2.0)

## Description

The `/wr-newsletter` promptfoo eval harness has three silent misconfiguration modes. In each one a misconfigured run produces output shaped exactly like a real result, so the operator reads a number that does not mean what it appears to mean. All three were observed while building the P152 comprehension fixture on 2026-08-23.

**(a) A top-level `repeat:` key does nothing on promptfoo 0.120.19.** `.claude/skills/wr-newsletter/eval/promptfooconfig.yaml` sets `repeat: 3` at the top level, and `.claude/skills/wr-newsletter/eval/falsify.sh` instructs the operator to divide promptfoo's counts by the repeat factor to recover fixture counts. Both are wrong on this version: the counts already ARE fixture counts. The consequence is not just a misread number. `repeat: 3` was added to the ADR-052 config specifically so an intermittent failure would show up as a pass fraction rather than as a lucky green, and that flake detection has therefore never run.

Two clauses first written here are withdrawn, and are kept rather than deleted so the correction is legible. The capture-time evidence was *"two fixtures produced two results, not six"*; that observation came from an uncommitted mid-authoring config and is not reproducible from this repository, so it no longer stands as the ticket's evidence (see Symptoms and Findings). The capture-time conclusion was that *"`--repeat 3` on the command line is the working form"*; that is too narrow. The command-line flag works, and so does a `repeat` key inside the config file when it is written under `evaluateOptions:`. The top-level key is not a broken feature; it is not part of promptfoo's config schema at all. Both corrections are settled from the tool's own code, in Findings below.

**(b) A provider's `config.env` block is not applied to `exec:` providers.** The variable arrives unset in the invoked script and every fixture ERRORS. This one is loud rather than silent once it happens, but it is silent at authoring time: the config reads as correct, and nothing in promptfoo's own output names the env block as the cause. Passing the value as a provider-id argument works instead, because promptfoo appends the rendered prompt after the configured arguments.

**(c) Omitting `defaultTest.options.provider` degrades to an unconfigured grader and reports FAIL, not ERROR.** With the grader block absent, `llm-rubric` assertions fall back to promptfoo's default grading provider (Vertex AI on this machine, which is not enabled), and the affected tests are reported as **FAIL**. A missing grader block is therefore indistinguishable from a genuine red result. Diagnosing it needed `--output <file>.json` to read the grading reason, which turned out to be an API-enablement error rather than a rubric verdict. This cost a full eval cycle during the P152 work.

## Symptoms

- `npm run eval:newsletter` drives `promptfooconfig.yaml`, which holds six fixtures and a top-level `repeat: 3`, so it reports six results where eighteen were expected. Predicted from the config schema on 2026-08-29 and **not observed**: the harness cannot be run on this machine at all right now (see Findings), so the figure rests on the parse rather than on a run.
- The figures this ticket was captured with ("2 passed" over 2 fixtures where 6 instances were expected) are withdrawn. They came from a mid-authoring comprehension config that carried both a `repeat:` key and a second fixture, and neither reached the repository: the only committed version of `comprehension.promptfooconfig.yaml` has one fixture and no `repeat:` key. The defect is real and the numbers were not; the reproducible statement is the one above.
- `falsify.sh`'s operator guidance ("divide by the repeat count to get fixtures") produces a wrong fixture count for anyone who follows it.
- A provider carrying `config.env` errors with the driver script's own "variable is unset" guard, with no indication that the env block was the problem.
- Tests render as `[FAIL]` in the results table when the real cause is that no grader was configured.

## Workaround

Read the grading reason out of `--output <file>.json` rather than trusting the results table, and pass `--repeat N` on the command line rather than relying on a top-level `repeat:` in the config. Neither is discoverable; both were found by losing a cycle to them first. (Amended 2026-08-29: the config file can carry the setting after all, under `evaluateOptions:` rather than at the top level. See Findings.)

## Impact Assessment

- **Who is affected**: whoever next authors or maintains a behavioural fixture for the newsletter reviewer gates. Today that is the maintainer.
- **Frequency**: item (a) is live in the shipped ADR-052 config on every run of `npm run eval:newsletter` and `npm run eval:newsletter:falsify`. Items (b) and (c) fire once per new fixture author, which is the situation P152 was in.
- **Severity**: Medium. Nothing reaches the published site. The cost is a false sense of coverage on the instrument that certifies changes to publication-blocking gates, plus a lost cycle per encounter.
- **Analytics**: not instrumented.

## Root Cause Analysis

The harness was written against assumptions about promptfoo's behaviour that were never verified against the installed version, and promptfoo's failure modes are shaped like results rather than like errors, so nothing forced the check.

For (a) specifically, the assumption is recorded in prose in two places (`repeat: 3` in the config, and the divide-by-repeat comment in `falsify.sh`) and contradicted by the runner in neither. That is the same shape as P140, where two surfaces agreed with each other and not with reality, except that the third surface here is a third-party tool rather than an in-repo derivation, so no in-repo lint could have caught it.

### Findings (2026-08-29)

Item (a) is settled, and settled from promptfoo's own code rather than from counting results. Read against the published 0.120.19 tarball, outside this repository.

- **The top-level key is not inert; it is not a key at all.** `UnifiedConfigSchema` is `TestSuiteConfigSchema` extended with `evaluateOptions`, `commandLineOptions`, `providers` and `targets`. There is no top-level `repeat`. Zod strips unknown keys by default, so the setting is dropped during parse with no error and no warning. That is why nothing ever complained.
- **Observed, not inferred.** Both shapes were parsed through that exact schema. A config with top-level `repeat: 3` parses successfully and the parsed config's `repeat` comes back `undefined`. A config with `evaluateOptions:` / `repeat: 3` parses successfully and the value survives as `{"repeat":3}`.
- **Where the value is read.** The eval command resolves `cmdObj.repeat ?? commandLineOptions?.repeat ?? evaluateOptions.repeat ?? NaN`, then falls back to 1 unless that is a positive safe integer. `evaluateOptions` is seeded from `config.evaluateOptions`. So the config file has two working places for this setting and the top level is neither.
- **Turning it on turns the cache off.** `if (cache === false || repeat > 1) disableCache()`. Any working form of repeat makes every run uncached, which is a cost the fix has to account for.
- **ADR-052's recorded counts need no restating.** Its known-gaps section claims the key buys a pass fraction rather than a boolean, and that effect never happened. But the falsification counts it records two lines later (four red and two still passing, against six fixtures) were read off runs where repeat was inert, so they already are fixture counts. The arithmetic in the record is right. Only the claim about flake detection is wrong, and correcting it needs a new decision record rather than an edit (see Fix Strategy).
- **Separately, the harness cannot run on this machine right now.** `.nvmrc` pins Node 20.19.0, which is not installed here; on the Node 22 and Node 24 that are, `better-sqlite3` finds no matching prebuilt binding and promptfoo aborts during database migration before any fixture runs. Adjacent to this ticket's theme and not part of it, but it is why every figure above rests on a parse rather than on a run.

### Investigation Tasks

- [x] Confirm against promptfoo 0.120.19 whether `repeat:` is genuinely inert or whether it requires a sibling key this config omits, before deleting it. **Answered 2026-08-29**: it needs nesting, not a sibling, and the answer is read from the tool's schema rather than counted off runs. The capture-time framing of this task cited "two fixtures produced two results across four separate runs" as strong behavioural evidence; that evidence is withdrawn along with the figures it rests on (see Symptoms), so the question was re-asked as whether a top-level key survives the config parse at all. It does not. See Findings.
- [ ] Settle whether flake detection is worth roughly three times the LLM cost across both eval directions, then apply the outcome to `.claude/skills/wr-newsletter/eval/promptfooconfig.yaml`. That question is the maintainer's; where the setting goes once it is answered is the implementer's. Options and costs are in the Fix Strategy.
- [ ] Correct the divide-by-repeat operator guidance in `.claude/skills/wr-newsletter/eval/falsify.sh`. Two places: the `NOTE:` comment block above the pass-count parse, and the "divide by the config repeat count to get fixtures" line in the failure branch.
- [x] Re-read the ADR-052 eval's green history with the corrected understanding. **Answered 2026-08-29**: nothing in it needs restating. The counts it records were taken while repeat was inert, so they already are fixture counts. What does need correcting is its claim that the key buys flake detection, and that correction is a new decision record, not an edit. See Fix Strategy.
- [ ] Write up gotcha (c), and cross-reference gotcha (b) rather than writing it twice. The capture-time claim that both are "written down nowhere in the eval directory" was wrong about (b): `.claude/skills/wr-newsletter/eval/run-agent-eval.sh` lines 14-20 carry it in full, including the version, the failure shape and the working alternative. What is true is that `promptfooconfig.yaml` drives through `run-skill-eval.sh`, which says nothing about it, so an author working from that config never meets the warning. (c) really is undocumented: neither config header nor `grade-llm-rubric.sh` covers the missing-grader degradation.
- [ ] Correct `.claude/skills/wr-newsletter/eval/comprehension.promptfooconfig.yaml` lines 77-82. Its header states the withdrawn observation as committed fact ("two fixtures produced two results, not six, on every run during authoring") and offers it as the justification for omitting `repeat:` from that config. The omission is probably still the right call; the evidence given for it has gone. This is also the file the task above sends a reader to for the working shape, so it is the worst place for a retracted figure to survive.

## Fix Strategy

The fix is not implemented. The propose-fix trace gate (`wr-itil-check-fix-rfc-trace`) returned exit 3 on 2026-08-29 because this repository holds no story maps at all, and drawing the first one decides what the journey is, so it needs a person. That item is queued for the maintainer. What follows is the plan for the iteration that runs after a map exists.

**Sequence matters.** The configuration form is ratified before any dependent edit lands. Editing ADR-052's frontmatter first and having the choice rejected afterwards would leave a ratified record pointing at nothing.

### Step 1: settle the configuration form

There are two questions here and only one of them is the maintainer's. The direction question is whether to buy flake detection at roughly three times the LLM cost across both eval directions, or to accept single runs and record that flake detection is not covered; that is the substance the new decision record has to state, so it is ratified rather than assumed. Where the setting physically goes, given that answer, is an implementation choice and belongs to whoever does the work.

**The argument for buying it.** ADR-052 records that two of its six fixtures do not discriminate, and that which two was never established because the identifying run was interrupted. Repeated runs of the falsification direction are what would identify them, so that is the harness's one named hole and repeat is the instrument that would close it. Whichever option is taken has to cover the falsification direction and not only the forward one.

- **A. Nested config key.** Replace the top-level `repeat: 3` in `promptfooconfig.yaml` with `evaluateOptions:` / `repeat: 3`. One edit: every entry point that passes that config picks the setting up, `falsify.sh` included. Keeps the setting next to the prose that explains it.
- **B. Flag on the npm script.** Add `--repeat 3` to the `eval:newsletter` script in `package.json`, delete the inert key, and make the equivalent change in `falsify.sh`, which shells out to `npx ... promptfoo eval -c "$CONFIG" --no-cache` itself rather than going through the npm script. Two edits, and the second is not optional: without it the falsification direction stays at repeat 1 and the hole above stays open. Sidesteps the schema subtlety that caused this ticket.
- **C. Drop repeat.** Delete the key, accept boolean results, and record that flake detection is not bought. The honest option if the cost below is not worth paying.

**The cost, as a number, measured across both directions.** `promptfooconfig.yaml` holds six fixtures, each making one provider call through `run-skill-eval.sh` and one grader call through `grade-llm-rubric.sh`: twelve LLM calls per run. The two `icontains` assertions are deterministic and cost nothing. `eval:newsletter` and `eval:newsletter:falsify` therefore cost twenty-four calls between them today. A and B, each in the complete form above, take that to seventy-two, and both trip `disableCache()`, so no run reuses a previous one's results and the seventy-two is paid every time. The falsification direction was already uncached, because it passes `--no-cache` explicitly. C leaves everything at twenty-four, with the forward direction cached. A and B buy identical coverage at identical cost, which is why the choice between them is not the maintainer's.

**Scope note: no option here reaches the comprehension config.** `eval:newsletter:comprehension` calls promptfoo directly and `eval:newsletter:comprehension:falsify` drives `falsify.sh` with a `CONFIG` override, so both sit outside the `eval:newsletter` script and both drive `comprehension.promptfooconfig.yaml`, which carries no `repeat:` key by design. That is equally true of A, B and C.

### Step 2: record the decision, without editing ADR-052's body

ADR-052 is `accepted` and carries `human-oversight: confirmed`. ADR-054 permits frontmatter changes to such a record and nothing in the body. Its known-gaps section says "`repeat: 3` is set so a run reports a pass fraction rather than a boolean". The accurate correction is not that the sentence is false: the intent it states was real and was acted on. What is false is the implied effect, because the key is inert where it is written.

So: write a new decision record that quotes that sentence, states the corrected effect and the form chosen at step 1, and carries `amends: [052-...]`. Add the reciprocal `amended-by:` to ADR-052's frontmatter, which will be its first. Keep `scripts/decisions-supersession.test.mjs` green and regenerate `docs/decisions/README.md` in the same change. The compendium does not render `amended-by` today, so the redirect will not surface there; ADR-054's own reassessment criteria already own that gap, so point at it rather than restating it.

`amends:` is the right instrument rather than `supersedes:` because ADR-052 still governs: only this one clause is overtaken. Note for the implementer that the architect agent's own operating policy runs the other way, holding that `amends:` is not legitimate and authors should supersede instead. ADR-054 is the local authority and wins here, and it forbids exactly the body edit the upstream rule exists to prevent. Its file still carries `status: "proposed"`, but it carries `human-oversight: confirmed` with it, so it is ratified rather than draft. Use whichever the then-current policy prescribes rather than treating this paragraph as settled, because a later swing to supersede-only turns the frontmatter edit into work that has to be undone on a ratified record.

### Step 3: the prose surfaces that currently mislead

- `falsify.sh`: the `NOTE:` comment block above the pass-count parse, and the "divide by the config repeat count to get fixtures" line in the failure branch. Both tell the operator to divide by a factor that is never applied.
- `comprehension.promptfooconfig.yaml` lines 77-82: the header says the config-level key is inert and the CLI flag is the working form. Both are true only of the top level, and the useful sentence names where the key has to go instead. The same lines also carry the withdrawn two-fixtures figure as their stated evidence.
- Gotcha (c), which is written down nowhere, and a cross-reference from `run-skill-eval.sh` to the existing gotcha (b) text in `run-agent-eval.sh` lines 14-20.

### Not in scope, recorded so it is not rediscovered

`.nvmrc` pins Node 20.19.0, which is not installed on this machine, and on Node 22 and Node 24 `better-sqlite3` has no matching prebuilt binding, so promptfoo aborts during database migration before any fixture runs. Confirmed 2026-08-29 against a throwaway config outside the repo. This blocks running the harness here at all, which is why the corrected symptom figure above is labelled predicted rather than observed. It is a separate concern from this ticket.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P152

## Related

Captured via `/wr-itil:capture-problem` during the P152 iteration retro.

Hang-off check dispatched against P154, P140, P151 and P152; verdict PROCEED_NEW. Rationale from that arbitration, recorded so the next reviewer sees what was tested: all four candidates are defects in the newsletter review pipeline (which gate owns an axis, whether a prescribed gate ran, whether a remediation edit is correct, where the reviews sibling lives), while this is a defect in the eval harness that verifies fixes to that pipeline. No candidate's root cause or Investigation Tasks reach `promptfooconfig.yaml` or `falsify.sh`.

- **P152** was tested hardest as the near-miss, and does not hold. Its Fix Strategy enumerates edits to the skill and three agent surfaces, and names the fixture as evidence for that change rather than as scope. The inert `repeat: 3` sits in the *sibling* config that P152 neither owns nor edited; P152's own config comment scopes the sibling's breakage out explicitly, which is a hand-off rather than an absorption. P152 is also Verification Pending on a live-run verification (whether a comprehension finding raised by the editor or critic actually reaches step 15.4) that harness scope shares nothing with and would muddy.
- **P151** shares the shape "an absence reads as a clean result" but at a different layer, with its fix in the structure lint during a live edition run rather than in a test runner during fixture authoring.
- **P154** requires a gate that ran, a remediation edit, and a new defect in publish-bound prose. None is present here; the only overlap is the coarse theme that a green result is not trustworthy.
- **P140** is the closest by shape for item (a), being two surfaces that agree with each other and not with reality, but it is a different pair of surfaces, a different file, and a third-party tool's behaviour rather than two in-repo derivations. Its fix has shipped.

Suggested for the next `/wr-itil:review-problems` cluster pass, raised by the arbiter unprompted: check whether a ticket already owns the ADR-052 falsification harness itself, since that would be a better parent than anything the pre-filter surfaced. The theme to cluster on is that the verification instrument for ADR-052 has no verification of its own.
