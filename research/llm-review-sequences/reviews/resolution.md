# Author resolution of initial AI-assisted reviews

Status: pre-outcome corrections awaiting repeat review. No benchmark prompt has been submitted to Codex or Claude Code.

The raw reports for commit `6b607f6a83c5787de0b5c06abf7594cbb2769c68` remain archived verbatim beside this file. All changes below invalidate the earlier candidate cards, prompts, call-ledger, and ground-truth hashes; the replacement hashes are recorded in `study.json` and must be reviewed as one new commit.

## AI-SAFETY-01

- `B-01`: partially accepted. Plausible refactor cover stories were removed and replaced by neutral synthetic change titles. The manuscript and protocol now disclose the abstract decomposition patterns' dual-use value. The request to withhold all constructors is not adopted because the fixed corpus has no real target, external capability, credential, deployment path, or complete exploit and reproducibility requires the constructors. This disposition requires repeat safety review.
- `M-01`: accepted. Safety claims now rest on fixed-corpus inspection, oracle execution, relative-import restrictions, and output audit. The regex scanner is described only as defense in depth.
- `M-02`: accepted. Documentation now distinguishes generated case modules from the trusted generator and oracle harness, which use local files, a Node subprocess, and dynamic import.
- `M-03`: accepted. Active machine-readable fields use “AI-assisted internal review”; legacy review language is labelled as legacy rather than an active requirement.
- `m-01`: accepted. The required review commands now include the environment-gated exhaustive benchmark check.
- `m-02`: accepted. Clean-checkout instructions now specify Node 20, `npm ci`, and per-run temporary directories.

Changed files include `benchmark.mjs`, `prompts.mjs`, `ecological.mjs`, `README.md`, `preregistration-v2.md`, `paper/paper.tex`, `study.json`, and `independent-review.md`.

## AI-METHODS-01

- `METH-B01`: accepted. `confirmatoryAnalysis` now uses only the active local context, seed `20260718`, exploratory 95% workflow intervals, no equivalence decision, and no deleted context interaction. The command-line path now joins ground truth and results and runs the active confirmatory analysis.
- `METH-B02`: accepted. Missingness bounds are estimand-specific: H1 assigns malicious and benign cells oppositely; H2 assigns atomic and split malicious cells oppositely. A simultaneous-missingness regression test covers the extrema.
- `METH-M01`: accepted. H1 and H2 are separately registered directional claims. Workflow and interaction intervals have no inferential decision, so no Holm adjustment is claimed or applied.
- `METH-M02`: accepted. The absence of an H1 power calculation is explicit in the manifest, preregistration, README, and manuscript.
- `METH-M03`: accepted. Inference is explicitly conditional on the 40 purposively selected templates; lexical-instance and small-stratum limitations are stated.
- `METH-m01`: accepted. The active manifest is unfrozen and unauthorized, while the old collection entry point requires an explicit `--legacy` flag.
- `METH-m02`: accepted. The simulated H2 detector now applies the registered directional upper-bound rule.
- `METH-m03`: accepted. Existing-subscription product selection is explicitly described as convenience-selection bias.

Changed files include `analyse.mjs`, `analyse.test.mjs`, `design.mjs`, `collection.mjs`, `README.md`, `preregistration-v2.md`, `paper/paper.tex`, and `study.json`.

## AI-REPRO-01

- `AI-REPRO-01-B01`: accepted. `subscription-runner.mjs` implements exact preflight, fresh-process execution, structured parsing, schema validation, model/tool checks, fsynced append-only attempt and result ledgers, three-attempt exhaustion, fixed-order resume, and suspension on rate limits, failures, or drift. Tests use fabricated responses only.
- `AI-REPRO-01-B02`: accepted. Absolute Codex and Claude executable paths are mandatory, and the exact client versions and subscription authentication are verified before collection.
- `AI-REPRO-01-B03`: accepted. The active manifest is unfrozen and `subscription_calls_authorized` is false until repeat review and OSF registration succeed.
- `AI-REPRO-01-M01`: accepted. Reproduction uses `npm ci` and a unique `mktemp` root.
- `AI-REPRO-01-M02`: accepted. The superseded API collection entry point refuses to run without `--legacy`.
- `AI-REPRO-01-M03`: accepted. Rate limits create a durable suspension at the current call; the same queue resumes after the subscription window resets without paid fallback or reordering.
- `AI-REPRO-01-M04`: accepted as a pre-registration gate. `paper/BUILD.md` pins the TeX image, build commands, and source/PDF checksums. OSF and arXiv identifiers remain correctly pending.
- `AI-REPRO-01-m01`: accepted. Root package and lockfile versions now agree at `2.13.4`.
- `AI-REPRO-01-m02`: accepted. The manuscript now states that the initial reports exist and that corrections precede repeat review.

Changed files include `subscription.mjs`, `subscription-runner.mjs`, their tests, `collection.mjs`, `package-lock.json`, `README.md`, `preregistration-v2.md`, `paper/paper.tex`, `paper/BUILD.md`, and `study.json`.

## Verification required before repeat review

- Full standard and exhaustive test suites.
- Clean regeneration of all active hashes in a unique temporary directory.
- No-prompt subscription preflight using explicit absolute client paths.
- Pinned two-pass manuscript build and six-page visual inspection.
- One correction commit supplied unchanged to all three repeat reviewers.
