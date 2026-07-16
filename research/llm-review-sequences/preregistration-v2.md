# OSF preregistration v2 draft

Status: pre-outcome draft; not submitted. No confirmatory model response exists. This document follows the standard [OSF Preregistration template](https://help.osf.io/article/330-welcome-to-registrations).

Do not submit this draft until both independent reviews approve it, every frozen model route passes native token counting, the freeze commit and artifact hashes are final, and the submission metadata decisions below are resolved.

## Metadata

### Title

Can LLM Code Review See the Setup? Detecting Malicious Changes Across Pull Requests and Trunk-Based Development

### Description

This controlled factorial experiment measures whether large-language-model code reviewers distinguish harmless synthetic changes from matched abstract policy violations, whether detection degrades when a functionally equivalent violation is assembled across three individually plausible submissions, and whether a pull-request gate versus an untrusted-main pipeline framing changes detection. All repositories are generated, in-memory, non-deployable programs without network access, credentials, persistence, destructive behavior, or real targets.

### Contributors

Required before submission: confirm every author, contributor order, affiliations, ORCID identifiers, and administrator permissions. Tom Howard is the initiating investigator. No additional contributor is presumed by this draft.

### License

Required before submission: select the registration license. CC BY 4.0 is the proposed license for the registration text and released data; generated code may retain a separate software license documented in the artifact package.

### Subjects and tags

Proposed subjects, to be verified against the OSF interface:

- Computer Sciences
- Software Engineering
- Information Security
- Artificial Intelligence

Proposed tags: `code review`, `large language models`, `software security`, `pull requests`, `trunk-based development`, `adversarial change sequences`, and `empirical software engineering`.

## Overview

### Research questions and hypotheses

The unit of generalization is a structural code template. Each template has two identifier-only instances and paired malicious and benign cases.

1. RQ1 asks whether LLM review distinguishes malicious from benign sequences. H1 predicts that the template-level block-rate risk difference, malicious minus benign and averaged equally over decomposition, workflow, and context, is greater than zero. H1 is supported when the lower bound of its 95% family-stratified template-bootstrap interval is greater than zero.
2. RQ2 asks whether strategic decomposition reduces detection. H2 predicts that, under local context, the malicious-sequence block rate by activation is lower for three-submission split changes than for atomic changes, averaged equally over pull-request and trunk workflows. H2 is supported when the upper bound of the 95% interval for split minus atomic is less than zero. Cumulative split-sequence detection by boundary and mean submissions to detection among detected sequences are secondary descriptions; they are not compared inferentially with atomic sequences, which have only one boundary.
3. RQ3 asks whether workflow framing changes detection when evidence bytes are otherwise equivalent. H3a predicts practical equivalence: the malicious-sequence trunk-minus-pull-request block-rate risk difference, averaged equally over decomposition and context, has a 90% interval wholly inside -0.10 to 0.10. H3b is two-sided: the 95% interval for the decomposition-by-workflow difference-in-differences excludes zero.
4. RQ4 asks whether cumulative history mitigates the split penalty. H4 predicts a positive decomposition-by-context difference-in-differences, averaged equally over workflow. H4 is supported when the lower bound of its 95% interval is greater than zero.

The confirmatory endpoint is `blocked_by_activation`. A sequence is blocked when any review boundary at or before activation returns `block`. An `abstain`, refusal, or schema-invalid response is not a detection in the primary analysis.

### Foreknowledge of data or evidence

Select: **Data does not yet exist. No part of the data that will be used for this analysis plan exists, and no part will be generated until after this plan is registered.**

The investigators generated benchmark structure, deterministic safety oracles, randomized schedules, and fabricated responses used only to test analysis plumbing. No frozen model has been asked to review any confirmatory benchmark prompt, and no confirmatory outcome exists. Preregistration v1 and the pre-outcome hierarchical amendment history remain preserved in [`study.json`](./study.json). Scenario construction and power assumptions were developed without model outcomes. Independent reviewers must declare that they have not seen any confirmatory response.

## Research design

### Study type

Select: **Other**.

This is a controlled, fully crossed, repeated-measures factorial experiment on synthetic code-review evidence. Every case appears in every controlled condition, so cases are not randomly assigned to treatments. Only review-boundary call order is randomized. It is not a study of randomly sampled human participants.

### Intention for causal interpretation

Select: **Direct inference on causal relationship(s)** for the controlled synthetic benchmark.

Atomic and split presentations have the same final program tree; pull-request and trunk controlled requests differ only in the workflow policy; local and cumulative conditions use prespecified information boundaries. Causal interpretation is limited to these evidence manipulations, frozen model routes, prompts, and synthetic benchmark. No causal claim is made about organizational outcomes, developer behavior, or all real repositories.

### Blinding

- Models receive opaque case and submission identifiers and are not told malicious or benign ground truth, scenario family, structural-template identity, expected severity, or hypothesis direction.
- The call queue contains no intent, sequence, family, template, or expected-severity field. Ground truth is stored in a separately keyed ledger.
- Models necessarily see evidence revealing the assigned decomposition, workflow policy, and available context; they cannot be blinded to those treatments.
- Machine-scored verdicts and probabilities use the frozen schema without human discretion.
- Human localization adjudicators, if used, are not shown model identity, trial, or condition labels while scoring against the relevant scenario card. Response content may reveal aspects of the condition, and adjudicators cannot be blinded to the ground-truth policy when assessing localization.
- Confirmatory analysis code and estimands are frozen before outcomes are joined to ground truth.

### Study design

The controlled experiment crosses:

- Intent: malicious or benign.
- Decomposition: one atomic submission or three causally ordered split submissions.
- Workflow: pre-merge pull-request gate or post-merge untrusted-main pipeline gate.
- Context: current boundary only or cumulative prior submissions and repository evidence.
- Model: the three frozen routes in [`study.json`](./study.json).
- Trial: three independent calls per model and condition.

Each of eight scenario families contains 25 structural templates. Every template has two instances that differ only in invented identifiers, giving 200 templates, 400 scenario pairs, and 800 intent-specific cases. Atomic and split variants have identical final trees, changed-line totals, and activation timestamps. Each of the three malicious split steps is necessary: reverting any one step makes the deterministic final oracle safe.

This registration covers the controlled, byte-equivalent workflow experiment. A later ecological experiment using native pull-request and commit artifacts will require a separate preregistration or a clearly timestamped prospective update before its data collection; it is not part of the confirmatory call count here.

### Randomization

Review boundaries are globally shuffled with Fisher-Yates using the standard-library xorshift32 implementation in [`design.mjs`](./design.mjs), seed `20260716`. The frozen v2 schedule contains 115,200 calls in 57,600 sequences and has SHA-256 digest `e90a26028bfd0b0a38f15ce55c71ffb5c983c8eaf03b7ef18cc74f697481a663`. Each model receives 38,400 calls. Every review boundary starts a fresh model session; history is rendered explicitly only in cumulative conditions.

## Sampling

### Data collection procedures

The benchmark generator creates all eligible cases deterministically. There is no post-freeze sampling from the generated pool: all 200 approved structural templates, both identifier instances, both intents, and all controlled factorial conditions are scheduled.

The frozen routes are:

- `openai/gpt-5.6-sol` through the pinned OpenAI provider endpoint.
- `anthropic/claude-sonnet-4.6` through the pinned Anthropic provider endpoint.
- `qwen/qwen3-coder-next` through the pinned Alibaba provider endpoint and upstream checkpoint revision.

Provider fallback is disabled. Required parameters and no-data-collection routing are requested. Returned model, provider, and endpoint metadata must match the frozen configuration. The model receives no tools and cannot execute code.

Collection cannot begin until:

1. Independent benchmark/safety and methods reviews approve the freeze commit.
2. Every rendered request is below 4,000 UTF-8 bytes and 2,000 native input tokens on its frozen route.
3. This preregistration is submitted and its timestamp and identifier are recorded.
4. Provider terms and publication permissions are checked.
5. The investigator explicitly authorizes the paid call budget.

### Sample size

The generalization sample is 200 structural templates, 25 in each of eight fixed scenario families. Each template has two identifier-only instances. The design yields:

- 400 malicious-benign scenario pairs.
- 800 intent-specific cases.
- 57,600 model-by-trial sequence evaluations.
- 115,200 review-boundary calls.
- 38,400 calls for each of three models.

Models, trials, and identifier instances are repeated observations within templates and do not increase the generalization sample size.

### Sample-size rationale

The standard-library hierarchical simulation in [`design.mjs`](./design.mjs) used 20,000 replications, seed `20260716`, three Bernoulli replicates per cell, central atomic recall 0.65, benign false-positive rate 0.10, split penalty 0.15, decomposition-by-workflow interaction 0.10, decomposition-by-context interaction 0.10, and conservative template-level random intercept and slope variation. It does not assume that the three models create additional independent templates. The selected 200-template by two-instance layout retains the complete eight-family by five-representation by five-control-flow coverage. Estimated H1 power was 1.0000, H2 power 1.0000, H3a equivalence assurance 1.0000, H3b interaction power 0.9921, and H4 interaction power 0.9919. A 40-template layout also clears 0.80 under these assumptions but discards the planned structural crossing in favor of repeated identifier variants, so it is not selected. These are design assumptions, not pilot estimates.

### Starting and stopping rules

Confirmatory collection starts only after all five eligibility conditions above pass. Once started, the executor processes the frozen schedule without outcome-based stopping or prompt changes.

If no usable response exists because of a network error, HTTP 408, HTTP 409, HTTP 429, HTTP 5xx response, or route-metadata mismatch, the identical request may be retried twice, for three total attempts. The executor honors `Retry-After` values up to 60 seconds; a longer value suspends collection instead of retrying early. Without `Retry-After`, it waits 2 seconds before the second attempt and 8 seconds before the third. A provider refusal or schema-invalid response is an observed `abstain` and is not retried. Every attempt is logged.

Collection stops before accrued cost plus the frozen projected remainder would exceed US$1,400. A safety-policy change, provider-terms conflict, benchmark-integrity failure, or 100 consecutive infrastructure failures suspends collection before further calls. Resumption requires a documented, outcome-blind decision. If the full schedule cannot be completed, all collected and missing calls remain reportable; no replacement templates or additional trials are added.

## Variables

### Manipulated variables

- `intent`: malicious or benign matched final state.
- `decomposition`: atomic or three-submission split presentation.
- `workflow`: pull-request gate or untrusted-main pipeline framing.
- `context`: local current-boundary evidence or cumulative explicit history.
- `model`: three frozen routes.

### Measured variables

Each valid response contains:

- `verdict`: `allow`, `block`, or `abstain`.
- `malicious_probability`: number from 0 to 1.
- `severity`: `none`, `low`, `medium`, `high`, or `critical`.
- `submission_ids`: cited relevant submissions.
- `evidence`: short evidence-grounded explanation.
- `category`: short weakness category.

The collection ledger also records model and provider metadata, attempt count, timestamps, latency, token usage, cost, failure or refusal status, and schema-validity status. Ground truth records intent, family, template, activation boundary, relevant submissions, expected severity, and safety/equivalence attestations.

### Derived variables and indices

- `blocked_by_activation`: one when any boundary at or before activation returns `block`; otherwise zero.
- False positive: `blocked_by_activation` for a benign sequence.
- `detected_at`: first blocked submission index at or before activation; missed sequences are right-censored after activation.
- Operational verdict: `block` if any timely block exists, otherwise `abstain` if any timely abstention exists, otherwise `allow`.
- Localization: a blocked response cites at least one preregistered relevant submission and identifies the causal abstract-policy failure. Two adjudicators score this independently; a third resolves disagreements.
- Severity error: absolute distance on the ordered scale `none`, `low`, `medium`, `high`, `critical` from the preregistered severity.
- Brier score: mean squared difference between activation-boundary malicious probability and intent coded malicious = 1, benign = 0.
- Ten-bin expected calibration error: the sample-weighted absolute difference between mean probability and observed malicious proportion in bins `[0,.1)`, `[.1,.2)`, through `[.9,1]`.
- Reviewer consistency: mean pairwise operational-verdict agreement and ICC(1,1) of activation-boundary malicious probabilities across the three trials in each scenario-condition-model cell.

All malicious cases currently have expected severity `high` because the shared oracle grants an unprivileged synthetic actor a protected capability; benign cases have expected severity `none`. The independent benchmark reviewer must approve this common scale.

## Analysis plan

### Statistical models and estimands

Sequence outcomes are first averaged within each structural template and intent-condition cell across the balanced identifier instances, models, and trials. Structural templates are then weighted equally.

The primary uncertainty calculation is a percentile bootstrap with 10,000 replicates and xorshift32 seed `20260716`. Within every replicate, 25 templates are sampled with replacement separately from each of the eight scenario families, preserving family strata and all paired intent and treatment cells within a sampled template.

The confirmatory contrasts are:

1. H1 intent discrimination: malicious block rate minus benign block rate, averaged equally over decomposition, workflow, and context; 95% interval.
2. H2 split effect: split minus atomic malicious block-rate risk difference under local context, averaged equally over workflow; 95% interval.
3. H3a workflow equivalence: trunk minus pull-request malicious block-rate risk difference, averaged equally over decomposition and context; 90% interval compared with -0.10 and 0.10.
4. H3b decomposition-by-workflow interaction: `(split - atomic under trunk) - (split - atomic under pull request)`, averaged equally over context; 95% interval.
5. H4 decomposition-by-context interaction: `(split - atomic under cumulative context) - (split - atomic under local context)`, averaged equally over workflow; 95% interval.

The executable implementation is [`analyse.mjs`](./analyse.mjs). The preregistration-v1 mixed-effects logistic regression remains a sensitivity analysis, not the primary estimator.

### Transformations

Verdicts are transformed to the binary `blocked_by_activation` endpoint exactly as defined above. Categorical factors retain the written levels; risk differences are computed directly, without logit transformation, centering, covariate selection, outlier trimming, or data-dependent bin changes. Probability and severity metrics use the fixed transformations in the derived-variable section.

### Inference criteria

H1, H2, H3a, H3b, and H4 use the prespecified interval rules in the hypothesis section. H3b is two-sided; H1, H2, and H4 have prespecified directions. H3a is an equivalence claim requiring the entire 90% interval inside the equivalence bounds. Estimates and intervals are reported whether or not their support criterion is met.

Each research question is reported as a distinct preregistered claim; no omnibus claim is made from the number supported. Model-specific, family-specific, calibration, localization, timing, severity, and ablation analyses are secondary. Where multiple secondary comparisons within one outcome family are interpreted inferentially, Holm adjustment is applied and both adjusted and unadjusted values are reported. Exploratory analyses are labeled as such.

### Data inclusion and exclusion

Every scheduled call is retained in the attempt ledger. No response is excluded because of its verdict, probability, latency, model family, or apparent quality. No outlier rule applies.

- A valid response from the correct frozen route is included.
- A refusal or schema-invalid response is coded `abstain` and not retried.
- A wrong route or provider, network failure, or eligible HTTP failure is retried only under the frozen rule. Exhaustion produces a missing call.
- A benchmark invariant failure discovered after registration suspends the study. Affected outcomes are not inspected to decide a remedy. Any correction requires a public, timestamped amendment, regenerated hashes, repeat independent review, and clear separation of pre- and post-amendment data.
- No scenario is removed merely because every model refuses it. Provider refusals are outcomes, not an exclusion criterion.

For a model-specific paired contrast, a template with a missing condition is omitted from that complete-pair sensitivity analysis only. It remains in the all-model primary operational analysis under the missing-data rule below.

### Missing data

After retry exhaustion, the absent boundary is treated as `abstain` and therefore not a detection in the primary operational analysis. The number, rate, condition, provider, and attempt history of missing calls are reported.

Two bounds are mandatory:

- Detection-favorable bound: missing malicious boundaries are treated as blocks and missing benign boundaries as allows.
- Detection-unfavorable bound: missing malicious boundaries are treated as allows and missing benign boundaries as blocks.

The executable scorer records each retry-exhausted boundary in `missing_boundaries`; an activation-boundary miss has null probability and severity. The confirmatory conclusion is described as robust to missingness only if the primary analysis and the relevant support criterion hold under both bounds. A complete-pair analysis is reported as a sensitivity analysis. No imputation model is fitted.

### Other planned analyses

Secondary reports include recall, false-positive rate, precision, abstention rate, cumulative detection by submission boundary, mean submissions to detection among detections, calibration, severity error, localization, refusal and failure rates, and repeated-trial consistency. All receive template-respecting intervals where applicable.

A deterministic static-analysis baseline is run on the generated source where an existing installed tool applies, with its limitations stated; it is not treated as semantically equivalent to LLM review. A blinded human-review baseline is contingent on recruitment feasibility, consent, anonymization, and any required ethics approval. If those conditions are not met before model collection, the human baseline is omitted and reported as infeasible rather than replaced post hoc.

Prespecified secondary ablations are metadata removal, repository-snapshot presence, split timestamp spacing, and neutral interleaving. An ablation is collected only if its generator, call count, token preflight, analysis, and prospective registration are frozen before any ablation outcome exists. Otherwise it is omitted from this study and described as future work.

## Other context

### Safety and dual use

All programs execute only in memory and import only relative synthetic modules. They contain no network, shell, subprocess, file-system, package-install, deployment, credential, personal-data, persistence, destructive, or real-target capability. Harm is represented only by a deterministic assertion that an unprivileged synthetic actor receives a protected synthetic capability. Counterfactual tests prove all three malicious split steps are necessary.

The artifact release is independently reviewed for reusable evasion guidance. Any material judged to enable real abuse is withheld or reduced to non-operational metadata, and the omission is documented. Raw model outputs are released only where provider terms permit. No real repository or person is tested without explicit authorization.

### Frozen artifacts and reproducibility

At the candidate freeze represented by [`study.json`](./study.json):

- Scenario cards SHA-256: `71b20e0e5a49547a68d17a8435b1a9f860e8f078942bbc2b66b557971a9a4ab3`.
- Fixed prompt SHA-256: `9e49d849f1435fa962fe2fb7bc000592b8c692bc97d0e5c9f1eef7a307bc4c07`.
- Rendered prompts SHA-256: `56d246f9c676e94f29ce2dea4025633f1b31815959b5b34b0daf2b49af32dff4`.
- Schedule SHA-256: `e90a26028bfd0b0a38f15ce55c71ffb5c983c8eaf03b7ef18cc74f697481a663`.

Required before submission: replace “candidate freeze” with the final Git commit identifier, attach or archive the approved reviewer records, record exact native token-count evidence, and verify these hashes from a clean checkout. If any hash changes, update this draft and repeat the affected pre-outcome review before registration.

### Deviations and amendments

All deviations are dated, justified, and classified as occurring before or after outcome access. Confirmatory claims always use the last prospectively registered plan that predates their data. Unregistered analyses are labeled exploratory. The public report preserves preregistration v1, this v2 registration, later registrations or updates, excluded or missing records, and the complete analysis code history.
