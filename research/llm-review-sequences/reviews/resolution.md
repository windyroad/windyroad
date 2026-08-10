# Author resolution of initial AI-assisted reviews

Status: frozen confirmatory-only reviewer-input candidate after outcome-blind corrections to the exact-commit reproducibility and safety rejection of `70963a2`. Ollama is not activated and any future Ollama experiment requires a separate preregistration. OSF registration and exact-commit methods, reproducibility, and safety approvals remain pending. Outcome calls remain unauthorized, and no benchmark prompt has been submitted to Codex, Claude, or Ollama.

The raw reports for commit `6b607f6a83c5787de0b5c06abf7594cbb2769c68` remain archived verbatim beside this file. All changes below invalidate the earlier candidate cards, prompts, call-ledger, and ground-truth hashes; the replacement hashes are recorded in `study.json` and must be reviewed as one new commit. This is a chronological log: earlier entries describe the protocol state they reviewed and are superseded where a later dated section records a correction.

## AI-SAFETY-01

- `B-01`: partially accepted. Plausible refactor cover stories were removed and replaced by neutral synthetic change titles. The manuscript and protocol now disclose the abstract decomposition patterns' dual-use value. The request to withhold all constructors is not adopted because the fixed corpus has no real target, external capability, credential, deployment path, or complete exploit and reproducibility requires the constructors. This disposition requires repeat safety review.
- `M-01`: accepted. Safety claims now rest on fixed-corpus inspection, oracle execution, relative-import restrictions, and output audit. The regex scanner is described only as defense in depth.
- `M-02`: accepted. Documentation now distinguishes generated case modules from the trusted generator and oracle harness, which use local files, a Node subprocess, and dynamic import.
- `M-03`: accepted. Active machine-readable fields use “AI-assisted internal review”; legacy review language is labelled as legacy rather than an active requirement.
- `m-01`: accepted. The required review commands now include the environment-gated exhaustive benchmark check.
- `m-02`: accepted. Clean-checkout instructions now specify Node 20, `npm ci`, and per-run temporary directories.

Changed files include `benchmark.mjs`, `prompts.mjs`, `ecological.mjs`, `README.md`, `preregistration-v2.md`, `paper/paper.tex`, `study.json`, and `independent-review.md`.

## AI-METHODS-01

- `METH-B01`: accepted for that historical candidate. `confirmatoryAnalysis` then used only the active local context, seed `20260718`, exploratory 95% workflow intervals, no equivalence decision, and no context interaction. The later prospective nested design and current H3/H4 registration supersede this description.
- `METH-B02`: accepted. Missingness bounds are estimand-specific: H1 assigns malicious and benign cells oppositely; H2 assigns atomic and split malicious cells oppositely. A simultaneous-missingness regression test covers the extrema.
- `METH-M01`: accepted for that historical candidate. H1 and H2 were separately registered directional claims while workflow and interaction intervals had no inferential decision. The current successor instead prespecifies H3 and H4 as secondary support decisions without claiming familywise error control.
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

- Activation sequencing: accepted. The revision now defines two outcome-blind branches. Its fixed order is written permission, permitted no-prompt preflight, fixture-only implementation, offline artifact generation, targeted review, final branch selection, OSF registration and freeze, then explicit outcome-call authorization.
- Amendment-specific governance: accepted. `independent-review.md` now requires permission, cloud/privacy and release review, fixed-fee and zero-balance evidence, exact identity and request contracts, separate ledgers, confirmatory contamination rejection, and decision-free Ollama reporting.
- Manuscript inconsistency: accepted. `paper/paper.tex` now describes the conditional stratum, counts, permission and spending gates, structured-output and thinking differences, cloud data handling, separate analysis, and limitations.
- Default thinking trace: accepted. The candidate request fixes `think: false`; any reasoning trace or tool call creates a fail-closed suspension, is not scored, and is never publicly released.

### Major and minor findings

- Spending controls: accepted. This revision authorizes no purchase. The exact fixed plan and fee require action-time author approval, and extra-usage balance must be proven zero or disabled before every batch or resume. Usage-based, overage, fallback, and extra-balance spend remain capped at US$0.
- Cloud data handling and retention: accepted for that historical candidate. Its proposed sole-author encrypted-retention schedule is superseded by the current rule below: the study makes no independent provider logging, training, or retention claim, and keeps raw material private pending post-outcome review.
- Raw-output release: accepted for that historical candidate. Its written-permission condition is superseded by the provider-neutral terms rule below; the current public-data boundary permits only sanitized derived attempt-event data and aggregate analysis unless a narrower raw release later passes upstream-license, privacy, terms, and post-outcome safety review.
- Analysis isolation: accepted as a pre-activation gate. The revision requires an exact two-system allowlist plus a separate decision-free Ollama route and fabricated-response tests. No Ollama runtime or analysis path is implemented before written permission.
- Identity, drift, and request contract: accepted. The activation record freezes the exact tag, canonical `/api/tags` model record, public model-page hash, client/server versions, request and response envelopes, and exact returned identity, and repeats checks on every batch or resume.
- Live documentation dates: accepted. Official sources are marked accessed on 2026-07-19; dated snapshots and SHA-256 values are mandatory activation artifacts.
- Chronology wording: accepted. “Amendment” is replaced with “pre-registration revision” in governing current-state text.
- Package version mismatch: accepted. The root lockfile metadata now matches package version `2.13.5`; dependency versions are unchanged.
- Methods limitations: retained. The Ollama stratum adds no independent templates or confirmatory power, remains descriptively analyzed, and cannot support provider, base-model, equivalence, open-versus-closed-weight, or general LLM-review claims.

Changed files require targeted correction review before OSF freeze. No benchmark prompt, automated Ollama preflight, subscription purchase, or model outcome occurred during correction.

## Targeted Ollama correction reviews for `7937e1e`

All three author-orchestrated correction reviewers inspected the same exact commit, `7937e1eb8cd11b386aa0a1fe419c560eeb45bb20`, without receiving study outcomes and without making an Ollama, provider, subscription, or OSF call. Their substantive report bodies are archived verbatim as `2026-07-19-ai-*-ollama-01-correction-7937e1e.md`; platform transport metadata is not part of the research record.

- Methods: `approve with documented limitations`. The conditional design is adequate for prospective registration, but activation remains blocked until confirmatory-contamination rejection, a separate decision-free Ollama analysis path, fabricated-response tests, and review of the exact implementation exist.
- Reproducibility: `approve with documented limitations`. The ordered activation branches, manuscript alignment, financial guard, identity controls, analysis isolation, and request contract are adequate at the permission-pending stage.
- Safety: `approve with documented limitations`. The ordered fail-closed governance resolves the first-round blockers but does not authorize automated access, purchase, preflight, collection, OSF activity, or raw-output release.

### Resolution of correction-review minor findings

- Canonicalization: accepted. The complete matching `/api/tags` JSON record is canonicalized under RFC 8785 before SHA-256; the public model page uses a raw-byte SHA-256.
- Returned-model timing: accepted. Pre-batch checks cover the account, plan, entitlement, client/server versions, complete model record, API-key absence, and zero-balance state. Exact returned identity is checked on every response before scoring or durable acceptance.
- API-key guard: accepted. Absence of `OLLAMA_API_KEY` is machine-checked before every initial or resumed batch.
- Lockfile hash: accepted. `study.json` preserves the collection-time baseline hash `d18c4808497a007aba23a2ab12abc99e76a45e42b9c614f31b587e4aaf782553` and separately records the current `package-lock.json` SHA-256, `40c4e9f2f102a185c80ca03974aff80d2b4c418d3b6e08a4264cc3fbb486c4f6`, with its record date.
- Legacy-field ambiguity: accepted after finding-specific correction. The manifest separately enumerates authoritative current-design fields, authoritative current operational-control fields used by the runner and registration gate, and the exact legacy API-design fields retained for audit history. The README mirrors that schema.

These finding-specific changes require reproducibility and safety verification before the permission-pending preregistration package is treated as review-complete. The methods limitations remain mandatory. No Ollama activation or outcome collection is authorized.

## Finding-specific verification of `657ef18`

The three verification bodies are archived as `2026-07-19-ai-*-ollama-01-verification-657ef18.md`.

- Methods returned `approve with documented limitations` and found its legacy-field ambiguity resolved.
- Safety returned `approve with documented limitations`; it requested reconciliation of conservative stale status text and clarification that substantive report bodies, not platform transport metadata, are archived verbatim.
- Reproducibility returned `do not approve`. It found that the initial authoritative-field rule was overbroad because the confirmatory runner legitimately reads `ecological_layer` and `preregistration_v2_draft`, and that replacing the deterministic baseline's historical lock hash with the current hash erased collection-time provenance.

Both reproducibility findings are accepted. The manifest now distinguishes authoritative current-design fields from authoritative current operational-control fields, explicitly enumerates the legacy API-design fields, preserves the baseline-time lock hash, and records the current lock hash separately. Status and archival wording are reconciled. This successor requires one final finding-specific verification before review completion.

## Final narrow verification of `7a3d6c3`

Methods and safety returned `approve with documented limitations`. Reproducibility verified the lock provenance, legacy-field enumeration, and status/archive wording but returned `do not approve` because the runner's top-level `frozen` control was not named in either authoritative-field list.

That finding is accepted. `frozen`, `frozen_at`, and `freeze_scope` are now explicit authoritative current operational-control fields alongside `ecological_layer` and `preregistration_v2_draft`. No runtime code, design factor, queue, outcome, authorization, or spending gate changed. Final reproducibility verification of that exact correction is required.

## Reproducibility verification of `4ed8244`

Reproducibility returned `approve with documented limitations` for exact commit `4ed8244e8ae4933f3cb1df8f7db617f13118a0f8`. Every manifest field read by the confirmatory subscription runner is now present in the applicable authoritative list; baseline and current lock hashes remain separately attributable; and no runtime, design, queue, outcome, hash, or authorization value changed.

No AI-assisted internal preregistration-review blocker remained at that commit. The conditional Ollama design was then described as a permission-pending contingency; the later cross-provider parity assessment below supersedes the special-written-waiver gate without authorizing access or outcomes.

Ollama activation still requires:

- A dated first-party terms and documentation record supporting the intended authenticated automation surface, with any contrary provider response applied before proceeding.
- Action-time approval for any exact fixed subscription and fee.
- No-prompt entitlement and zero-balance evidence.
- Fixture-only implementation and separate frozen artifacts.
- Targeted review of that exact activation candidate.
- An outcome-blind activation decision and OSF registration before any outcome call.

The non-activation branch remains available and must be fixed before every system's outcome collection.

## Ollama permission request sent

At 2026-07-19T02:28:25+10:00, after action-time author approval, the sole author sent `hello@ollama.com` the permission request archived as `provider-permission-request.md` with SHA-256 `6f2abe6fb16f5bfe5f0749bf981b4f5f289727d0f2d197c1a75635b4b3cd2bdd`. It requests automated no-prompt preflight, up to 640 outcomes, a ten-second minimum inter-request interval, no more than two infrastructure retries per boundary, zero usage-based spend, aggregate publication, model attribution, and a ruling on any redacted raw-output release.

The outbound request is not itself permission. At the time it was sent, the protocol conservatively treated an affirmative response as a prerequisite. The later cross-provider terms-parity assessment below supersedes that special-written-waiver rule. No automated Ollama preflight, purchase, implementation, artifact generation, or outcome call occurred in the interim, and no confirmatory outcome has been collected.

## Ollama AI-support response received

At 2026-07-19T02:29:31+10:00, `support@ollama.com` replied in the existing thread. The message identified itself as composed by Ollama's AI support agent. It said the agent could not grant written permission for a specific research design or determine whether the benchmark was permitted, offered escalation to a human agent, and restated general plan, usage-limit, concurrency, privacy, and content-ownership information.

The response is neither permission nor a human denial. At 2026-07-19T08:00:35+10:00, after action-time author approval, the sole author sent the human-escalation reply archived as `provider-permission-escalation.md` with SHA-256 `1df2bc4755833d42408b26f6f6a99706acdbd5029489b383eec623edd41e96e1`. It asks whether ordinary documented signed-in subscription and local API use already constitute the permission required for automated access, or whether separate approval or additional limits are required. A human response is pending as a nonblocking clarification. The manifest retains `activation_decision: pending` and false automated-access and outcome-call authorization flags because the separate preflight, plan, balance, implementation, review, OSF, and authorization gates remain incomplete. Any contrary human response overrides the terms assessment and forces suspension or non-activation.

## Cross-provider terms-parity assessment

On 2026-07-19, before any benchmark outcome, an independent AI-assisted read-only assessment compared the three providers' current official terms and first-party automation documentation. The precommit report is archived as `2026-07-19-ai-terms-parity-precommit-worktree.md`. This is an operational terms assessment, not legal advice or an exact-commit attestation.

- Ollama Terms section 4 prohibits automated access “without permission” but does not define permission. Ollama's pricing expressly advertises coding automation plus CLI and API access, and its Cloud/API documentation gives authenticated cloud-model examples through the local `/api/chat` surface.
- Anthropic's Consumer Terms likewise prohibit automated or non-human access unless Anthropic otherwise explicitly permits it, while the official Claude Code CLI documentation expressly identifies print mode and JSON output for scripting and automation and subscription documentation includes Claude Code in Pro and Max.
- OpenAI's Consumer Terms prohibit automatic or programmatic output extraction, while the official Codex non-interactive documentation expressly directs users to run `codex exec` in scripts and CI and pipe its output to other tools.

The study therefore applies one provider-neutral rule: published first-party terms and documentation expressly supporting automation through the intended authenticated product surface supply the operational terms basis for that documented use, absent a direct contrary provider restriction. This is not provider approval or legal advice. The rule does not permit scraping, harvesting, undocumented access, credential sharing, rate-limit circumvention, paid overflow, or use outside provider policies. Under that rule, no exceptional Ollama research waiver appears necessary for the planned authenticated, sequential, non-disruptive benchmark. The pending human response is advisory; any denial or narrower limit controls prospectively.

Aggregate reporting may use factual plain-text service and observed-model attribution without logos, endorsement, or branding claims. Any public raw-output subset still requires upstream-license review, post-outcome dual-use review, and no contrary provider restriction. This correction removes an inconsistent provider-specific gate but does not authorize a preflight, purchase, implementation, OSF action, or model outcome.

## OSF package audit and freeze sequencing

A post-request OSF package audit found a circular authorization rule: the prior protocol required the OSF identifier to exist before the same manifest could be frozen, although the registration content must be fixed before submission. The finding is accepted. The corrected protocol separates an immutable pre-submission content-freeze record from a post-registration execution-authorization record.

The content record names the study, exact content commit, selected branch, deterministic release-safe payload-bundle hash, queues, systems, artifact hashes, and runtime-critical file hashes and permanently leaves `outcome_calls_authorized` false. The post-registration record must name the OSF identifier, registration and authorization timestamps, raw-byte content-record hash, content commit, branch, registered bundle hash, and exact authorized queues. The runner computes the record and actual bundle digests, enforces study identity, freeze-time equality, timestamp order and cross-record equality, then recomputes runtime and generated-artifact hashes before collection. It rejects before output creation or client preflight. Fabricated tests cover frozen-but-unauthorized state, a valid bound authorization, record, bundle, runtime and artifact drift, review-system and study drift, missing registration metadata, and timestamp-order drift.

The current records remain unfrozen and unauthorized. This correction changes a pre-outcome execution gate and therefore requires an immutable successor candidate followed by exact-commit reproducibility, methods, and safety review before the detached phase-1 attestation. No provider, model, subscription, or OSF call occurred while implementing it.

## Exact-commit review of the two-phase candidate `70963a2`

Three author-orchestrated, outcome-blind subagents reviewed exact commit `70963a2249c7164e3afa52a7aa4dc00c1a2cc25a`. Their substantive reports are archived as `2026-07-19-ai-*-two-phase-01-70963a2.md`. No reviewer edited a file or made an OSF, provider, model, subscription, or account call.

- Methods returned `approve with documented limitations`.
- Reproducibility returned `do not approve` with three blockers, three major/minor defects, and sound-control observations.
- Safety returned `do not approve` with two blockers, one major defect, and one minor limitation.

The earlier statement that no internal preregistration-review blocker remained no longer applies to this successor. The current candidate is unfrozen, unauthorized, and not ready for OSF submission.

### Accepted blocking findings

- Circular freeze criteria: accepted. The review protocol now separates phase-1 pre-submission freeze criteria from phase-2 post-registration execution criteria. Phase 1 does not require an OSF identifier or authorized execution record.
- Verification/execution time-of-check-to-time-of-use gap: accepted. The runner correction must parse and execute the exact prompt and call buffers whose raw bytes passed authorization; no post-preflight reread is permitted.
- Branch and queue semantics: accepted. The confirmatory runner must accept exactly one confirmatory-only queue and reject every extra queue and the Ollama-inclusive branch. Ollama activation requires a separate fixture-tested and reviewed runner.
- Unenforced release boundary: accepted. A standard-library deterministic JSON payload builder and verifier now use a fixed allowlist, canonical member order and encoding, byte sizes, media types, and SHA-256 values. Both detached records, executable cases, credentials, account state, attempts, results, raw output, and reasoning traces are forbidden members.

### Accepted major and minor findings

- OSF authenticity evidence: accepted. Phase 2 must bind untouched raw OSF-origin registration JSON and its raw-byte SHA-256, a structurally derived summary, the exact downloaded two-file inventory, verifier identity and time, plus Tom Howard's explicit action-time confirmation. This is author-attested HTTPS integrity evidence, not an OSF cryptographic signature.
- Reproducible construction: accepted. The payload is rebuilt from an exact Git content commit without time-dependent or filesystem metadata and records a separate canonical member-manifest digest.
- Stale checklist: accepted. The README now orders genuine author choices and branch selection before freeze, separates the OSF submission and download-verification phases, and ends with explicit execution authorization.
- Stale manifest authority: accepted. `exploratory_ollama_cloud_replication.outcome_calls_authorized` is explicitly `false`; it records that the exploratory arm is inactive but cannot authorize collection. The detached phase-2 record is the only outcome-call authority.
- Permissive timestamps and OSF URL binding: accepted. The runner correction must require a canonical OSF identifier and exact URL plus strict UTC timestamps ordered freeze, registration, download verification, author confirmation, and authorization.
- Inexact raw-artifact claim: accepted. Phase 1 separately records raw-byte hashes for all five execution files and the runner recomputes the schedule from the frozen design instead of trusting copied collection metadata.
- Returned-model ambiguity and queue metadata gaps identified by the runner-focused audit: accepted. Required identity metadata, review systems, call models, queue counts, queue ID, prompt/call linkage, collection summary, and recomputed schedule all fail closed before durable acceptance.
- Standalone preflight wording: accepted. The documentation distinguishes permitted no-prompt version/authentication-status preparation, which may contact authentication services but invokes no inference, from prohibited outcome collection.

These corrections alter the exact runtime gate, state-record schemas, payload format, and governing documentation. After fixture tests and deterministic verification pass, all three review roles must inspect the same new exact commit. No detached phase-1 attestation, OSF submission, provider outcome, or subscription benchmark call is authorized before that review closes every blocker.

## Outcome-blind analysis-integrity audit

The worktree-level methods audit is archived as `2026-07-19-ai-methods-analysis-precommit-worktree.md`. It found five major and two moderate defects before outcomes.

All seven findings are accepted:

- Complete-pair point estimates and percentile sensitivity intervals must retain the equal-fixed-family estimand used by the registered Welch interval.
- H4 requires its own product-specific complete-pair result over both contexts and trials.
- The registered route must pin the exact 40 base scenarios, exact 16 nested scenarios, their frozen family and template identities, 1,408 sequence-system rows, and 2,816 boundary rows.
- The precision record must identify Welch/Satterthwaite as the support-decision method and percentile bootstrap as sensitivity only.
- The malicious H4 nested sample contains 512 sequence-system trials, not 256.
- The analysis must require the exact run-binding schema and recompute its canonical fingerprint.
- The binding must include the raw ground-truth-ledger SHA-256, which the CLI verifies before joining any outcome.

The corrections remain pre-outcome, unfrozen, and unauthorized. Passing tests do not close the review gate. Methods, reproducibility, and safety reviewers must approve the same clean, frozen-input successor commit before the detached phase-1 attestation.

## No-prompt subscription preparation

At 2026-07-18T20:19:45.050Z, the permitted preparation check passed with the exact pinned clients: Codex CLI 0.137.0 and Claude Code 2.1.211. `OPENAI_API_KEY`, `CODEX_API_KEY`, and `ANTHROPIC_API_KEY` were absent. The check inspected version and saved-subscription authentication readiness only; it sent no benchmark prompt and invoked no model inference. It did not authorize outcome collection, Ollama access, OSF submission, or any purchase.

## Phase-one verifier adversarial audit

An outcome-blind audit of the standalone phase-one verifier found three blockers, one major defect, and one moderate verification gap. All are accepted:

- Any recognized CLI flag must reject the wrong arity before the positional collection route; a malformed `--verify-phase-one` command cannot fall through to collection.
- Each Markdown review report must carry machine-readable reviewer metadata that matches its detached role, exact commit, approving disposition, empty blocker list, and raw report hash. Hashing contradictory prose without checking its authoritative metadata is insufficient.
- The confirmatory-only branch must bind a machine-readable `not-activated` Ollama decision and require every confirmatory and exploratory outcome/authorization flag to remain false. A pending branch cannot pass phase one.
- The three reports must be distinct physical files, not merely distinct path strings; canonical-path, device, and inode aliases fail closed.
- The active artifact schema must be exact, and `maximum_request_bytes` must be recomputed from the frozen prompt requests rather than copied from the manifest.

The corrections and regression tests remain in progress. Phase one may not be frozen, attested, or submitted until all five controls pass and the same successor commit receives methods, reproducibility, and safety approval.

## Current precommit successor review

An additional outcome-blind precommit review of the evolving successor retains a `do not approve` reproducibility disposition. It is not an exact-commit phase-one report and cannot be used as approval, freeze evidence, registration evidence, or execution authority. No provider, model, OSF, subscription-purchase, or benchmark-outcome call was made for this review.

The current findings and dispositions are:

- Execution-authorization shape: accepted. The checked-in template and the runner's accepted authorization fields had diverged. Their schemas and the exact prompt/call binding must agree and be fixture-tested before review repeats.
- Durable rows and analysis completeness: accepted. Attempt/result schemas and suspension-reason enums had diverged, and confirmatory analysis could proceed with a partial frozen schedule. The successor must use one common failure contract and require exactly one terminal result for every frozen authorized call: schema-valid review; `schema_invalid` abstention after the structured validator fails; or `three_attempts_exhausted` missing result after exactly three `client_failure` suspensions. Tool deviation remains a boolean on a schema-valid result, and the finite suspension reasons remain distinct. No separate refusal classifier may be invented.
- Provider-route isolation and concurrency: accepted. Ambient environment state could redirect a provider route; there is no yet-proven single-writer exclusion; and a residual check-to-spawn race remains. These require runtime correction and adversarial verification.
- Model identity: accepted. Codex CLI 0.137.0 does not expose returned-model metadata in its JSON event contract. The successor must record requested `gpt-5.5`, the exact pinned binary path/version/hash, and `requested_pinned_client_no_reroute_observable`, while rejecting model-rerouted error events. Claude requires exactly one frozen-model `modelUsage` entry. Activated Ollama requires exact `response.model`.
- Pinned clients and recovery claims: accepted. Operational instructions must use `/Users/tomhoward/.codex/research-runtimes/codex-0.137.0/node_modules/@openai/codex-darwin-arm64/vendor/aarch64-apple-darwin/bin/codex` and `/Users/tomhoward/.local/share/claude/versions/2.1.211`, not `command -v`. “Crash-safe” is limited to a cleanly observed interruption and does not cover torn JSONL tails, abrupt power loss, concurrent writers, or the check-to-spawn race.
- Conditional Ollama dispatch semantics: accepted. The exploratory arm has a hard ceiling of 640 physical inference dispatches and zero retries. `format` is deliberately omitted so the response uses the common local validator; exact `response.model` is required before durable acceptance.
- Release boundary: accepted. Only sanitized derived attempt-event data and aggregate analysis are prospective public data. Raw ledgers, provider output, absolute paths, account/authentication state, and environment metadata remain private pending post-outcome safety, upstream-license, privacy, and terms review.
- Registration packet provenance: accepted. `provider-ai-support-response.md` is now the thirteenth fixed packet member with SHA-256 `fb45d2174c96c5e638905a4cb42ef08b500820d831d563cb4b388e5f43c55d5a`. It is a privacy-preserving visible-content transcription, neither permission nor denial.
- Manuscript build state: accepted and updated. The earlier source/PDF mismatch was resolved after the corrective pre-results source stabilized: Tectonic 0.16.9 produced byte-identical online and cache-only builds, and all eight pages were inspected. The build record binds the current source and PDF hashes. This worktree artifact is not exact-commit approval and must be rebuilt after registered outcomes and final revision.
- Test evidence: unresolved. A targeted runner test reported 166 passing tests but ended with an unhandled Vitest worker RPC timeout. That run is not clean verification evidence and must be repeated without an unhandled error.

The methods corrections in progress specify H1 and H2 as primary, H3 and H4 as secondary, full equal averaging for H3, the exact malicious-only H4 interaction equally averaged over pull-request and trunk, equal-family complete-pair weighting for H1 through H4, exploratory status for the cumulative-context main effect, and the zero-variance rule: point estimate and standard error 0 remain, while the registered Welch interval, degrees of freedom, and support decision are unavailable and the percentile interval is sensitivity only.

The safety resolution must also preserve the distinction between historical requests for a provider-specific written assurance and the current provider-neutral operational rule. The current rule relies on published first-party terms and documented automation for the intended authenticated surface; it is not legal advice or provider approval. The archived AI-support response supplied general information but no assurance or denial. Any direct contrary or narrower provider reply overrides the operational assessment prospectively. Earlier assurance-seeking remains historical context and must not be rewritten as retroactive permission.

All corrections remain resolution-in-progress. They invalidate prior hashes and reviews where affected. Phase one remains unfrozen and may not be attested or submitted until the worktree is committed as one successor candidate, tests complete cleanly, and all three roles approve that same exact commit with no unresolved blocker.

## Hardened successor verification

The successor now closes the unresolved runner findings without collecting an outcome. The Codex route uses a study-minimal permission profile with noninteractive approval disabled; preflight binds live subscription-account fingerprints and requires extra or overage usage to be disabled. Durable ledgers reject links and byte drift before append. Every provider envelope is privately archived before parsing, while public-facing records retain only an envelope digest, allowlisted token counts, and finite error classifications. Resume rejects missing, altered, and orphaned envelopes. Each collection invocation is capped at 16 physical dispatches so entitlement and authorization are rechecked between bounded batches. The standalone preflight now performs the same isolated environment and deny-probe checks as collection.

On 2026-07-28, the outcome-free active benchmark regenerated the registered 40 structural templates, 80 cases, 896 prompts, 1,408 sequence-system trials, 2,816 boundaries, 3,992-byte maximum request, and all five registered SHA-256 values. The complete offline suite passed 424 tests with two intentional skips; lint and the 53-page static production build passed. The eight-page manuscript PDF was rebuilt reproducibly with byte-identical online and cache-only Tectonic outputs, embedded fonts, and visual inspection of every page.

A final precommit reproducibility review found that frozen authorization-time evidence could not detect a later billing-setting change. The blocker is accepted and corrected. Before every real collection or resume invocation, the runner now requires a separate current-user-owned 0600 confirmation no more than 15 minutes old, binding both authorized account-identity fingerprints and recording `extra_usage_status: disabled` for Codex and Claude. It rejects missing, stale, future-dated, aliased, permission-drifted, identity-drifted, or enabled evidence before creating output or running client preflight. The 16-dispatch ceiling forces this author check to repeat between bounded batches. The private confirmation is deliberately outside the frozen run binding so it can be refreshed without changing the registered queue.

This evidence is worktree-level verification, not an exact-commit phase-one approval. The study remains unfrozen and unauthorized. No provider inference, subscription purchase, OSF mutation, or outcome call occurred. The next candidate must be committed, receive exact-commit methods, reproducibility, and safety review, and then resolve the author-controlled affiliation, license, visibility, and Ollama-activation choices before phase-one freeze.

## Frozen author choices and confirmatory-only candidate

On 2026-07-28, before any benchmark outcome or OSF registration, Tom Howard fixed the remaining choices: affiliation `Independent researcher`; CC BY 4.0 for original registration prose and released study data; MIT for original study code; and public-immediate OSF visibility. A study-local `LICENSE.md` records the scope and excludes third-party material and provider correspondence from relicensing.

Ollama is recorded as `not-activated` and excluded from this registration. No Ollama purchase, preflight, implementation, queue, dispatch, observation, or analysis is authorized. Any future Ollama experiment requires a separate preregistration and cannot alter this study's two-system sample or estimands.

The manifest now freezes reviewer-input bytes only. The detached phase-1 record remains unfrozen and outcome-unauthorized until methods, reproducibility, and safety approve the same exact commit and the payload and review bindings verify. OSF registration and phase-2 execution authorization remain pending.
