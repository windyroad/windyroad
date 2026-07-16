# Independent review protocol

Status: required before preregistration v2 is frozen. No confirmatory model outcome may be available to either reviewer.

## Purpose

This protocol separates two pre-collection checks:

1. Benchmark and safety review: whether the synthetic changes are harmless, structurally distinct, causally sequenced, and fairly matched.
2. Methods review: whether the hierarchical power analysis, estimands, randomization, and planned inference support the confirmatory claims.

The roles may be filled by two reviewers or by a panel, but no reviewer may have authored the component they approve. Reviewers must disclose conflicts and any prior access to study outcomes.

## Reproducibility packet

Review the repository at the proposed freeze commit. Run:

```sh
npm test
node research/llm-review-sequences/design.mjs
node research/llm-review-sequences/benchmark.mjs /tmp/llm-review-benchmark-review
node research/llm-review-sequences/collection.mjs \
  /tmp/llm-review-benchmark-review /tmp/llm-review-collection-review
node research/llm-review-sequences/ecological.mjs \
  /tmp/llm-review-benchmark-review \
  /tmp/llm-review-ecological-review \
  /tmp/llm-review-ecological-collection-review
EXHAUSTIVE_BENCHMARK=1 npx vitest run research/llm-review-sequences/benchmark.test.mjs
EXHAUSTIVE_POWER=1 npx vitest run research/llm-review-sequences/design.test.mjs
```

Compare the generated counts and SHA-256 values with [`study.json`](./study.json). Stop the review if they differ. The generated controlled benchmark directory must contain 400 scenario pairs, 800 cases, 200 template identifiers, 12,800 blinded requests, and no retained `.counterfactuals` directory. Its collection directory must contain 115,200 blinded call rows and 115,200 separately keyed ground-truth rows. The ecological directories must contain 80 scenario pairs, 160 cases, 40 template identifiers, 2,560 native-artifact requests, 7,680 blinded call rows, and 7,680 separately keyed ground-truth rows. Confirm that no call row in either layer contains intent, scenario, sequence, family, template, or expected-severity fields.

The reviewers receive the study manifest, generator sources, generated cards and prompts, power-analysis source and output, fixed prompt, [`preregistration-v2.md`](./preregistration-v2.md), analysis plan, and this protocol. They do not receive confirmatory responses, outcome summaries, or model-specific performance observations.

### Protocol preflight

The author exercised the complete reproduction protocol at commit `a860532` on 2026-07-17. This is evidence that the packet runs; it is not an independent approval. The full suite passed 137 tests with the two exhaustive checks intentionally skipped, the exhaustive benchmark then passed both tests, and the exhaustive power audit passed all eight tests. Regeneration produced the frozen 400 pairs, 12,800 prompts, 115,200 call rows, and all manifest hashes. Across every call row, the only fields were `call_id`, `case_id`, `model`, `prompt_id`, `schedule_index`, and `trial`.

After adding the ecological layer, the author reran the expanded protocol at commit `42eb883` on 2026-07-17. The full suite passed 139 tests with two exhaustive checks skipped; the exhaustive benchmark passed both tests and the exhaustive design audit passed all nine. The run reproduced both layers' manifest hashes, including 2,560 ecological prompts and 7,680 ecological call rows. This remains a preflight, not either required independent approval.

## Benchmark and safety review

The benchmark reviewer must inspect:

- All eight family constructors in [`benchmark.mjs`](./benchmark.mjs).
- All five data representations and all five control-flow shapes.
- The malicious and benign instance-1 rendering for every template identifier.
- The machine proof that the second instance differs only in invented identifiers.
- The safety scanner and its forbidden-capability coverage.
- The final-tree, changed-line, timestamp, blindness, and counterfactual-oracle checks.
- The ecological subset selection and its one-per-family coverage of every data representation and control-flow shape.
- Native pull-request and untrusted-main artifact renderings, including history boundaries, realistic neutrality, and absence of ground-truth leakage.

For each of the 200 template identifiers, record `pass`, `revise`, or `exclude` for:

- The malicious final state violates only the stated abstract policy.
- The benign final state remains safe and is purpose- and salience-matched.
- Each of the three submissions is necessary for the malicious final state.
- The split submissions are individually plausible and do not disclose ground truth.
- The structure is materially different from the other templates in its family.
- The code contains no external capability, reusable exploit, real target, credential, personal data, persistence, destructive action, or deployment path.

For each of the 40 ecological template identifiers, additionally record whether the pull-request and trunk artifacts are plausible, preserve the intended information boundary, and reveal no condition-specific ground truth beyond the prospectively defined workflow treatment.

Any safety failure is a stop condition. Revisions are permitted only before preregistration v2 and require regenerated hashes plus a complete repeat review of the affected family.

## Methods review

The methods reviewer must independently rerun [`design.mjs`](./design.mjs) and inspect [`analyse.mjs`](./analyse.mjs). Record `pass`, `revise`, or `reject` for:

- Treating structural templates, rather than calls or identifier instances, as the generalization unit.
- The template random intercept and template-specific split, workflow-interaction, and context-interaction slopes used by the power simulation.
- The 20,000-replication simulation, frozen seed, 200-template structural-coverage floor, and selected two-instance layout.
- Equal weighting of structural templates after balanced within-template aggregation.
- The family-stratified 10,000-replicate template bootstrap and frozen seed.
- The paired malicious-minus-benign discrimination estimand and 95% interval.
- The primary local-context split-minus-atomic risk difference and 95% interval.
- The marginal trunk-minus-pull-request risk difference, 90% interval, and equivalence margin.
- The decomposition-by-workflow and decomposition-by-context difference-in-differences and 95% intervals.
- Treating the preregistration-v1 mixed-effects model as a sensitivity analysis rather than the primary estimator.
- Handling of repeated trials, benign false positives, invalid responses, missing calls, and multiplicity.
- The randomized schedule hash, balanced call counts, and spending stop.
- The claim that the v2 amendment predates all confirmatory outcomes.

The reviewer should rerun reasonable sensitivity cases for the template intercept, split-slope, workflow-interaction-slope, and context-interaction-slope assumptions. A sensitivity failure does not automatically reject the study, but it must be recorded and reflected in the confirmatory claim or sample-size decision before the second freeze.

## Token and routing review

Verify every controlled and ecological request is below 4,000 UTF-8 bytes and 2,000 model-native input tokens. Proxy or upstream counts may support debugging but cannot replace native counts for the frozen gateway route. Confirm that provider fallback is disabled, the intended provider endpoint is selected, and returned model and provider metadata will be rejected on mismatch.

## Required review record

Each reviewer supplies a dated, signed record containing:

- Name or stable pseudonym and relevant expertise.
- Role, conflicts, and outcome-blindness declaration.
- Repository commit and generated artifact hashes.
- Completed item-level or method-level decisions.
- Requested revisions and their resolution.
- Final decision: `approve`, `approve with documented limitations`, or `do not approve`.

The records and any amendments become part of the reproducibility package. Preregistration v2 may be frozen only after both review tracks approve, exact token preflight passes, all hashes are regenerated, and the external registration timestamp is recorded.

## Review record template

Copy this section into one record per reviewer. Do not combine the two required roles into a self-review by an author of the approved component.

### Reviewer identity and scope

- Name or stable pseudonym:
- Date:
- Relevant expertise:
- Role: benchmark and safety, or methods
- Conflicts:
- Freeze commit:
- Confirmatory-outcome access: none, or explain

### Reproduction evidence

- `npm test` result:
- Exhaustive benchmark result:
- Scenario-card SHA-256:
- Rendered-prompt SHA-256:
- Schedule SHA-256:
- Call-ledger SHA-256:
- Ground-truth-ledger SHA-256:
- Ecological cards SHA-256:
- Ecological rendered-prompts SHA-256:
- Ecological schedule SHA-256:
- Ecological call-ledger SHA-256:
- Ecological ground-truth-ledger SHA-256:
- Native token-count evidence reviewed:

### Decisions

Record `pass`, `revise`, `exclude`, or `not applicable` against every item in the relevant review section above. Attach the completed 200-template record for benchmark review or the method-level decisions and power sensitivities for methods review.

### Revisions and final decision

- Requested revisions:
- Resolution verified:
- Limitations that must appear in the paper:
- Final decision: approve, approve with documented limitations, or do not approve
- Signature or stable verification method:
