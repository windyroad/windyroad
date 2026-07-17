## 1. Reviewer identity and scope

- Reviewer pseudonym: AI-METHODS-01.
- Review type: final correction addendum, not a new independent review.
- Date: 2026-07-17, Australia/Sydney.
- Reviewed commit: `3a77286816da3d2725fffcf8759bf5097bdf6805`.
- Product identity: Codex desktop, GPT-5-based model family; exact serving variant was not exposed.
- I reviewed all earlier methods findings, registered estimands, decision rules, bootstrap seeds, missingness analyses, CLI outputs, and power claims.
- I made no repository edits, did not invoke the subscription runner, and submitted no benchmark or model-evaluation prompt.

## 2. Conflicts and outcome-blindness

- I inspected the initial methods report, my correction addendum for `d3e1a0c`, and the combined author resolution log.
- This review is explicitly non-isolated: the resolution log exposes findings and dispositions from all three roles (`reviews/resolution.md:53-71`). It must not be represented as fresh independent evidence.
- Provider, model-family, repository, prompt, and author-orchestration conflicts remain.
- No confirmatory LLM outcome was supplied or inspected. The manifest remains unfrozen, unauthorized, and outcome-free (`study.json:3-7,21-25,336-360`).
- Only deterministic artifacts and fabricated plumbing outcomes were used.

## 3. Reproduction evidence

- `git rev-parse 3a77286^{commit}` resolved to `3a77286816da3d2725fffcf8759bf5097bdf6805`. Testing used an exact temporary export, and the repository remained clean.
- Node `20.19.0` and npm `11.13.0` completed `npm ci`. The full test suite passed: 24 files, 151 tests passed, 2 skipped.
- The exhaustive benchmark run passed both files and all three tests.
- Clean generation reproduced 400 full pairs, 800 cases, 12,800 prompts, 40 active templates, 640 sequences, and 1,280 boundaries. All full and active hashes matched the manifest (`study.json:82-89,336-360`).
- The exact 20,000-replication power command reproduced `0.2577`, `0.0038`, and `0.1016`; the regression test now locks the directional H2 value (`design.test.mjs:39-44`).
- Fabricated all-allow results produced 640 sequence outcomes and 40 analyzed templates. Both confirmatory and descriptive bootstrap seeds were `20260718` (`analyse.mjs:175-178,338-340`).
- Independently constructed cells reproduced H1 `0.5`, H2 `0`, workflow `0`, and interaction `2`, matching the registered contrast formulas (`analyse.mjs:520-561`; `preregistration-v2.md:127-132`).
- Workflow and interaction outputs contained only estimates and 95% intervals—no inferential decisions (`analyse.mjs:394-401`).
- Estimand-specific missingness checks reproduced H1 favourable/unfavourable extrema `1/0` and H2 extrema `-1/1` (`analyse.mjs:405-483`).
- Complete-pair sensitivity returned 40 complete templates for each review system, and the CLI now emits it (`analyse.mjs:442-467,599-615`).
- An additional 2,000-simulation diagnostic applying a family-stratified percentile bootstrap to the stated data-generating process estimated H2 support near `0.31` with one outcome per cell, rather than `0.2577`. Averaging two conditionally independent, identically parameterized review systems produced approximately `0.48`. These are illustrative rather than replacement power values, but demonstrate that the registered analysis and number currently labelled as power are materially different calculations.

## 4. Blocking findings

- **METH-FB01 — The reported power is not the operating characteristic of the registered H2 analysis.** H2 support is registered as the upper endpoint of a family-stratified structural-template bootstrap interval falling below zero, after outcomes are averaged across both review systems (`preregistration-v2.md:27-30,123-130`; `paper/paper.tex:231-242`). The power simulator instead generates one Bernoulli outcome for each condition when `trialsPerCell` is one and applies a normal-theory paired-mean rule using `1.96 × SE`; it neither averages two review systems nor executes the stratified percentile bootstrap (`design.mjs:288-325,505-533`; `design.test.mjs:39-44`). Thus `0.2577` is reproducible from the implementation but is not power for the registered pooled-bootstrap decision rule. Recompute power through the registered analysis with explicit assumptions about review-system heterogeneity/dependence, or relabel the number everywhere as a single-outcome normal-approximation sensitivity audit rather than design power (`study.json:61-68`; `preregistration-v2.md:97-101`; `README.md:102`; `paper/paper.tex:253-258`).

## 5. Major findings

- No additional major finding remains beyond METH-FB01.
- Original **METH-B01**, **METH-B02**, **METH-M01**, **METH-M02**, and **METH-M03** are resolved.
- Correction findings **METH-CB01**, **METH-CM01**, and **METH-Cm01** are resolved.
- **METH-CB02** is resolved as numerical consistency: `0.2577` is now reproduced and recorded everywhere. METH-FB01 concerns the deeper mismatch between that reproducible calculation and the registered analysis.

## 6. Minor findings

- No remaining minor methods finding was identified.
- The active design is local-only, convenience-selected, conditional on 40 templates, explicit about absent H1 power, and explicit that separate H1/H2 claims provide no familywise error control (`preregistration-v2.md:49-57,97-101,136,162-173`).

## 7. Required manuscript limitations

The existing limitations on convenience selection, conditional template inference, coarse five-template strata, one lexical instance, one trial per review system, low power, product-level effects, and lack of familywise error control should remain.

Before freeze, the manuscript and registration must additionally do one of the following:

- Report operating characteristics computed using the registered two-system, family-stratified bootstrap analysis, with review-system dependence assumptions stated; or
- Explicitly describe `0.2577`, `0.0038`, and `0.1016` as normal-approximation sensitivity diagnostics that do not estimate operating characteristics of the registered pooled-bootstrap analysis.

## 8. Decision

`do not approve`

All previously identified executable-analysis defects are corrected, tests and artifacts reproduce, and the primary estimands now execute correctly. Approval remains blocked only because the value presented as H2 design power is generated by a materially different analysis and observation structure from the registered H2 decision rule.

## 9. Stable signature

`AI-METHODS-01 | final correction addendum | 2026-07-17 | 3a77286816da3d2725fffcf8759bf5097bdf6805 | Codex desktop / GPT-5 family | do not approve`
