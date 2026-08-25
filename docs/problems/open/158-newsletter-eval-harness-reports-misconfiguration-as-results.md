# Problem 158: The newsletter eval harness reports misconfiguration as results, so a broken run looks like a real one

**Status**: Open
**Reported**: 2026-08-23
**Priority**: 8 (Medium), Impact: 2 x Likelihood: 4, derived at capture from the description per Step 4a. Impact 2 because the blast radius is dev tooling: nothing here reaches the site or a reader, but the harness is the instrument that decides whether a change to a publication-blocking gate is actually tested, so a false green there lets an untested gate change ship believing it was covered. Likelihood 4 because item (a) is present in the shipped config right now and permanent until edited, and items (b) and (c) are on the path every future fixture author walks.
**Origin**: internal
**Effort**: S, derived at capture: drop or correct one inert key in one config, correct one operator comment in `falsify.sh`, and write the two remaining gotchas down where the next fixture author reads them. Sizing is close to P140 (two surfaces disagree on one derivation), also an S on the same newsletter tooling.
**WSJF**: 8.0 = (8 x 1.0) / 1

## Description

The `/wr-newsletter` promptfoo eval harness has three silent misconfiguration modes. In each one a misconfigured run produces output shaped exactly like a real result, so the operator reads a number that does not mean what it appears to mean. All three were observed while building the P152 comprehension fixture on 2026-08-23.

**(a) Config-level `repeat:` is inert on promptfoo 0.120.19.** Two fixtures produced two results, not six. `.claude/skills/wr-newsletter/eval/promptfooconfig.yaml` sets `repeat: 3`, and `.claude/skills/wr-newsletter/eval/falsify.sh` instructs the operator to divide promptfoo's counts by the repeat factor to recover fixture counts. Both are wrong on this version: the counts already ARE fixture counts. The consequence is not just a misread number. `repeat: 3` was added to the ADR-052 config specifically so an intermittent failure would show up as a pass fraction rather than as a lucky green, and that flake detection has therefore never run. `--repeat 3` on the command line is the working form.

**(b) A provider's `config.env` block is not applied to `exec:` providers.** The variable arrives unset in the invoked script and every fixture ERRORS. This one is loud rather than silent once it happens, but it is silent at authoring time: the config reads as correct, and nothing in promptfoo's own output names the env block as the cause. Passing the value as a provider-id argument works instead, because promptfoo appends the rendered prompt after the configured arguments.

**(c) Omitting `defaultTest.options.provider` degrades to an unconfigured grader and reports FAIL, not ERROR.** With the grader block absent, `llm-rubric` assertions fall back to promptfoo's default grading provider (Vertex AI on this machine, which is not enabled), and the affected tests are reported as **FAIL**. A missing grader block is therefore indistinguishable from a genuine red result. Diagnosing it needed `--output <file>.json` to read the grading reason, which turned out to be an API-enablement error rather than a rubric verdict. This cost a full eval cycle during the P152 work.

## Symptoms

- `npm run eval:newsletter` reports "2 passed" for a config declaring `repeat: 3` over 2 fixtures; 6 instances were expected.
- `falsify.sh`'s operator guidance ("divide by the repeat count to get fixtures") produces a wrong fixture count for anyone who follows it.
- A provider carrying `config.env` errors with the driver script's own "variable is unset" guard, with no indication that the env block was the problem.
- Tests render as `[FAIL]` in the results table when the real cause is that no grader was configured.

## Workaround

Read the grading reason out of `--output <file>.json` rather than trusting the results table, and pass `--repeat N` on the command line rather than setting `repeat:` in the config. Neither is discoverable; both were found by losing a cycle to them first.

## Impact Assessment

- **Who is affected**: whoever next authors or maintains a behavioural fixture for the newsletter reviewer gates. Today that is the maintainer.
- **Frequency**: item (a) is live in the shipped ADR-052 config on every run of `npm run eval:newsletter` and `npm run eval:newsletter:falsify`. Items (b) and (c) fire once per new fixture author, which is the situation P152 was in.
- **Severity**: Medium. Nothing reaches the published site. The cost is a false sense of coverage on the instrument that certifies changes to publication-blocking gates, plus a lost cycle per encounter.
- **Analytics**: not instrumented.

## Root Cause Analysis

The harness was written against assumptions about promptfoo's behaviour that were never verified against the installed version, and promptfoo's failure modes are shaped like results rather than like errors, so nothing forced the check.

For (a) specifically, the assumption is recorded in prose in two places (`repeat: 3` in the config, and the divide-by-repeat comment in `falsify.sh`) and contradicted by the runner in neither. That is the same shape as P140, where two surfaces agreed with each other and not with reality, except that the third surface here is a third-party tool rather than an in-repo derivation, so no in-repo lint could have caught it.

### Investigation Tasks

- [ ] Confirm against promptfoo 0.120.19 whether `repeat:` is genuinely inert or whether it requires a sibling key this config omits, before deleting it. The observation is that two fixtures produced two results across four separate runs; that is strong, but it is behavioural rather than read from the tool's source.
- [ ] Decide `--repeat` on the command line versus a config key that works, and apply the outcome to `.claude/skills/wr-newsletter/eval/promptfooconfig.yaml`.
- [ ] Correct the divide-by-repeat operator guidance in `.claude/skills/wr-newsletter/eval/falsify.sh`.
- [ ] Re-read the ADR-052 eval's green history with the corrected understanding: its recorded runs were fixture counts, so any claim resting on instance counts needs restating.
- [ ] Find a home for the (b) and (c) gotchas. They are currently written down nowhere in the eval directory. `.claude/skills/wr-newsletter/eval/comprehension.promptfooconfig.yaml` *embodies* both (the provider passes its argument on the provider-id line rather than through `config.env`, and the grader is declared explicitly under `defaultTest.options.provider`) but its header explains neither, so a reader who copies that config gets the working shape without learning why it is the working shape. The description above is the only prose record.

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
