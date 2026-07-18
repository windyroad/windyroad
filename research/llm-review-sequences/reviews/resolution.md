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

## Resolution of correction addenda for `d3e1a0c`

The first correction addenda also returned `do not approve`. Their additional findings were accepted as follows before a final correction review:

- Safety `B-01-R1`: accepted. All 24 discarded plausible `refactor:` strings were removed from public source and replaced with neutral synthetic labels.
- Safety `M-03-R1`: accepted. The remaining manifest wording was explicitly labelled as a superseded legacy API requirement.
- Safety `M-04` and reproducibility `Cm01`: accepted. Artifacts now distinguish isolated initial reviews from non-isolated correction addenda that inspect the cross-role resolution log.
- Safety `m-02-R1` and reproducibility `CM01`: accepted. `.nvmrc` and the README now pin Node `20.19.0`.
- Methods `METH-CB01`: accepted. The exploratory interaction output no longer contains a `detected` decision.
- Methods `METH-CB02`: accepted. The directional 20,000-replication H2 power value is `0.2577` everywhere and has an exact regression test.
- Methods `METH-CM01`: accepted. The executable analysis now emits review-system-specific complete-pair sensitivity.
- Methods `METH-Cm01`: accepted. Descriptive bootstrap intervals now default to seed `20260718`.
- Reproducibility `CB01`: accepted. Rate-limit suspensions no longer consume the three-infrastructure-failure ceiling or become missing outcomes.
- Reproducibility `CB02`: accepted. The runner persists the first returned identity for each review system and suspends on any later identity change; a fabricated two-call test covers drift within an alias.
- Reproducibility `CB03`: accepted. The default runner refuses unless the manifest is frozen, subscription calls are authorized, an OSF identifier exists, and all five generated artifact hashes match.
- Reproducibility `CM02`: accepted by removing the unused 100-consecutive-failure claim from the active protocol and manuscript.
- Reproducibility `Cm02`: accepted. The deterministic manuscript instructions now include the release copy and checksum commands.

These corrections remain pre-outcome and require another affected-role review before OSF registration.

## Resolution of final correction reviews for `3a77286`

The three final correction reviews again returned `do not approve`. Their remaining findings are accepted as follows:

- Safety `B-01-R2`: accepted. The imported pilot generator's six split titles and atomic title now use neutral synthetic input, transform, and policy labels.
- Safety `M-04-R2`: accepted. The governing protocol now limits isolation to the initial reviews and requires non-isolation disclosure for correction addenda.
- Reproducibility `AI-REPRO-01-FB01`: accepted. Returned-model drift now creates a durable `model_drift` suspension that never consumes the three-infrastructure-failure ceiling; a four-resume fabricated regression test proves that it produces neither a result nor missingness.
- Reproducibility minor positive-path/hash-branch tests: noted as useful additional coverage but not required for the preregistration gate because clean regeneration, the closed authorization test, and the five-hash check are independently exercised. No outcome call is authorized until the manifest is frozen and registered.
- Methods `METH-FB01`: accepted by relabelling `0.2577`, `0.0038`, and `0.1016` as single-review-system normal-approximation sensitivity diagnostics. The manifest, preregistration, README, manuscript, and test now state that this audit neither pools the two review systems nor runs the registered family-stratified percentile bootstrap and therefore does not estimate power or assurance for the registered analysis.

These corrections remain pre-outcome and require one final verification by the affected roles before OSF registration.

## Finding-specific verification of `4b48101`

All three affected roles verified the accepted corrections against commit `4b48101ea57f074c14b1c4ab72c42d861c788e8c` without receiving confirmatory outcomes:

- `AI-SAFETY-01`: `approve with documented limitations`. `B-01-R2` and `M-04-R2` are resolved; the existing fixed-corpus, dual-use, and non-isolated-correction disclosures remain required.
- `AI-METHODS-01`: `approve`. `METH-FB01` is resolved because the three reproducible simulation values are consistently presented as sensitivity diagnostics rather than operating characteristics of the registered analysis.
- `AI-REPRO-01`: `approve`. `AI-REPRO-01-FB01` is resolved; four fabricated resumes preserve model drift as a durable suspension with no missing result.

The verbatim verification records are archived beside this log. No AI-assisted internal-review blocker remains. OSF registration may proceed, but subscription collection remains unauthorized until the external identifier is recorded, the manifest is frozen, and all authorization/hash checks pass.

## Resolution of Ollama pre-registration reviews for `94959bd`

The statement above applies only to the previously approved two-system package at `4b48101`. Before OSF registration and before any outcome, the author added a conditional Ollama Cloud stratum at `94959bdb9bcf64dd15ca946f6f395a385f5102af`. The three non-isolated targeted reports are archived verbatim as `2026-07-19-ai-*-ollama-01-94959bd.md`. Methods returned `approve with documented limitations`; safety and reproducibility returned `do not approve`.

### Shared blocking findings

- Activation sequencing: accepted. The revision now defines two outcome-blind branches and an ordered sequence: written permission before automated access; permitted no-prompt preflight; fixture-only implementation and offline artifact generation; targeted review; final activation or non-activation; one applicable OSF registration and freeze; then explicit outcome-call authorization.
- Amendment-specific governance: accepted. `independent-review.md` now requires permission, cloud/privacy and release review, fixed-fee and zero-balance evidence, exact identity and request contracts, separate ledgers, confirmatory contamination rejection, and decision-free Ollama reporting.
- Manuscript inconsistency: accepted. `paper/paper.tex` now describes the conditional stratum, counts, permission and spending gates, structured-output and thinking differences, cloud data handling, separate analysis, and limitations.
- Default thinking trace: accepted. The candidate request fixes `think: false`; any reasoning trace or tool call creates a fail-closed suspension, is not scored, and is never publicly released.

### Major and minor findings

- Spending controls: accepted. This revision authorizes no purchase. The exact fixed plan and fee require action-time author approval, and extra-usage balance must be proven zero or disabled before every batch or resume. Usage-based, overage, fallback, and extra-balance spend remain capped at US$0.
- Cloud data handling and retention: accepted. The protocol discloses that localhost brokers cloud inference, records the current metadata boundary, and defines sole-author encrypted retention through publication plus 12 months, followed by private-content deletion unless a reviewed public subset is permitted.
- Raw-output release: accepted. Written provider permission, upstream-license review, and post-outcome dual-use review are all required; reasoning traces and sensitive metadata are excluded.
- Analysis isolation: accepted as a pre-activation gate. The revision requires an exact two-system allowlist plus a separate decision-free Ollama route and fabricated-response tests. No Ollama runtime or analysis path is implemented before written permission.
- Identity, drift, and request contract: accepted. The activation record freezes the exact tag, canonical `/api/tags` model record, public model-page hash, client/server versions, request and response envelopes, and exact returned identity, and repeats checks on every batch or resume.
- Live documentation dates: accepted. Official sources are marked accessed on 2026-07-19; dated snapshots and SHA-256 values are mandatory activation artifacts.
- Chronology wording: accepted. “Amendment” is replaced with “pre-registration revision” in governing current-state text.
- Package version mismatch: accepted. The root lockfile metadata now matches package version `2.13.5`; dependency versions are unchanged.
- Methods limitations: retained. The Ollama stratum adds no independent templates or confirmatory power, remains descriptively analyzed, and cannot support provider, base-model, equivalence, open-versus-closed-weight, or general LLM-review claims.

Changed files require targeted correction review before OSF freeze. No benchmark prompt, automated Ollama preflight, subscription purchase, or model outcome occurred during correction.

## Targeted Ollama correction reviews for `7937e1e`

All three author-orchestrated correction reviewers inspected the same exact commit, `7937e1eb8cd11b386aa0a1fe419c560eeb45bb20`, without receiving study outcomes and without making an Ollama, provider, subscription, or OSF call. Their verbatim reports are archived as `2026-07-19-ai-*-ollama-01-correction-7937e1e.md`.

- Methods: `approve with documented limitations`. The conditional design is adequate for prospective registration, but activation remains blocked until confirmatory-contamination rejection, a separate decision-free Ollama analysis path, fabricated-response tests, and review of the exact implementation exist.
- Reproducibility: `approve with documented limitations`. The ordered activation branches, manuscript alignment, financial guard, identity controls, analysis isolation, and request contract are adequate at the permission-pending stage.
- Safety: `approve with documented limitations`. The ordered fail-closed governance resolves the first-round blockers but does not authorize automated access, purchase, preflight, collection, OSF activity, or raw-output release.

### Resolution of correction-review minor findings

- Canonicalization: accepted. The complete matching `/api/tags` JSON record is canonicalized under RFC 8785 before SHA-256; the public model page uses a raw-byte SHA-256.
- Returned-model timing: accepted. Pre-batch checks cover the account, plan, entitlement, client/server versions, complete model record, API-key absence, and zero-balance state. Exact returned identity is checked on every response before scoring or durable acceptance.
- API-key guard: accepted. Absence of `OLLAMA_API_KEY` is machine-checked before every initial or resumed batch.
- Lockfile hash: accepted. `study.json` now records the current `package-lock.json` SHA-256, `40c4e9f2f102a185c80ca03974aff80d2b4c418d3b6e08a4264cc3fbb486c4f6`.
- Legacy-field ambiguity: accepted. The manifest and README identify only `active_subscription_design` and `exploratory_ollama_cloud_replication` as authoritative current-design fields; legacy API fields remain audit history only.

These finding-specific changes require reproducibility and safety verification before the permission-pending preregistration package is treated as review-complete. The methods limitations remain mandatory. No Ollama activation or outcome collection is authorized.
