# Targeted AI-SAFETY amendment review

## 1. Reviewer identity and scope

- Reviewer: `AI-SAFETY-01 — Ollama amendment`.
- Date: 2026-07-19, Australia/Sydney.
- Exact reviewed commit: `94959bdb9bcf64dd15ca946f6f395a385f5102af` (`docs: add conditional Ollama replication`).
- Scope: the three changed files, governance documents, prior safety reviews/resolution, relevant runner/analysis controls, and current official Ollama Terms, Privacy, Pricing, Cloud, API, model, structured-output, and thinking documentation.
- The commit is documentation/manifest-only: `README.md`, `preregistration-v2.md`, and `study.json`. It adds no Ollama runner, queue, ledger, or result.
- This review is non-isolated because prior safety reports and the cross-role resolution log were inspected. It is author-orchestrated AI review, not independent human peer review, ethics approval, legal advice, or arXiv endorsement.
- No file was edited. No benchmark prompt, model inference, account, subscription, or Ollama API call was made.

## 2. Conflicts and outcome-blindness

- Shared author, repository, prompt context, automation, OpenAI/Codex provider, and GPT-family conflicts apply.
- No model outcome was supplied or inspected. The user states none exist; the manifest records false at `study.json:7,25,95,451`, and the commit contains no result artifacts.
- The prior safety approval covered commit `4b48101`, not this amendment (`reviews/2026-07-17-ai-safety-01-verification-4b48101.md:3-6,44-48`).

## 3. Reproduction and source evidence

- `HEAD` matched the exact commit and the worktree was clean.
- `git diff --check` passed; `study.json` parsed successfully.
- All focused deterministic study tests passed: 9 files, 37 tests passed, 2 environment-gated tests skipped. They used fabricated/local data only.
- The existing runner remains fail-closed for Ollama: it supports only Codex and Claude and rejects unknown systems (`subscription.mjs:30-57`); collection also requires a frozen, OSF-registered, explicitly authorized manifest (`subscription-runner.mjs:181-203`).
- Official evidence reviewed on 2026-07-19:

  - [Terms of Service](https://ollama.com/terms), updated May 2026, prohibit automated service access without permission.
  - [Cloud and authentication documentation](https://docs.ollama.com/cloud) confirms that localhost requests for `:cloud` models are offloaded to Ollama Cloud; [authentication documentation](https://docs.ollama.com/api/authentication) distinguishes this signed-in route from direct API-key access.
  - [Privacy Policy](https://ollama.com/privacy), updated March 2026, represents cloud prompt/response processing as transient and not used for training, while usage/device metadata may still be retained.
  - [Pricing](https://ollama.com/pricing) documents plan limits, GPU-time-based usage, reset windows, and optional extra-usage balances.
  - The current [Qwen 3.5 catalog](https://ollama.com/library/qwen3.5/tags) lists `qwen3.5:cloud`; account entitlement remains unverified, as the amendment correctly states.
  - [Structured Outputs](https://docs.ollama.com/capabilities/structured-outputs) confirms that Ollama Cloud currently lacks enforced structured outputs.
  - [Thinking](https://docs.ollama.com/capabilities/thinking) says thinking is enabled by default for supported models and returned separately.

## 4. Blocking findings

### B-01 — Activation sequencing is circular and ambiguous

`study.json:107-113` requires separate queue/hashes and an implemented runner/guard before activation, but `preregistration-v2.md:199` says no queue or hashes exist until the activation gates pass, while `README.md:27` withholds Ollama runtime code until those same gates pass.

The permission/non-activation branch is also ambiguous: permission evidence is required before confirmatory or exploratory calls (`preregistration-v2.md:75`; `study.json:108-109`), yet an unmet gate permits the unchanged confirmatory queue (`study.json:130`).

Define two deterministic branches before any outcome:

1. Record Ollama non-activation, make no Ollama call, and proceed only through the separately frozen/registered two-system path; or
2. Obtain written permission before any automated Ollama access, perform no-prompt preflight, implement and test offline artifacts, archive targeted reviews, register/freeze on OSF, explicitly authorize, then make the first Ollama outcome call.

### B-02 — No amendment-specific review protocol exists

The amendment requires targeted safety, methods, and reproducibility reviews (`preregistration-v2.md:3,199`; `study.json:448-455`), but `independent-review.md:57-96,133-142` still defines only the original two-system rubric and freeze rule. It does not require Ollama permission evidence, cloud/privacy review, entitlement and billing checks, reasoning-trace handling, ledger isolation, or descriptive-only analysis verification.

The machine-readable activation list at `study.json:107-113` also omits the targeted amendment-review gate. This review cannot cure the governing protocol's omission.

### B-03 — Default thinking output is neither disabled nor governed

The amendment disables streaming and tools but does not set `think: false` (`preregistration-v2.md:73-77`; `study.json:103-105`). Ollama documents thinking as enabled by default for supported models, and Qwen 3.5 is catalogued as thinking-capable.

This can change usage, latency, response parsing, and dual-use exposure by producing a separate reasoning trace. Before freeze, specify `think: false` if the frozen route supports it; otherwise the arm must remain inactive or preregister trace handling. Reasoning traces must not enter the scored response or public raw-output release.

## 5. Major findings

### M-01 — Subscription and spending controls are under-specified

The commit broadens “existing subscriptions/zero additional spend” into subscription access that may be newly purchased (`README.md:3,19`; `preregistration-v2.md:102`) without a fixed-fee ceiling or action-time approval gate, while the manifest still records zero additional spend (`study.json:79,406-408`).

Ollama's pricing says Pro/Max included usage is consumed before any existing extra-usage balance. Merely prohibiting extra balance and omitting `OLLAMA_API_KEY` does not prove that the signed-in local-cloud route cannot consume such a balance. No subscription purchase or paid usage is authorized by this amendment.

### M-02 — Cloud data handling is linked but not disclosed

The protocol should state that localhost is only a broker for cloud inference: prompts and responses leave the device. Current Ollama policy represents content as transient, unlogged/not trained, while request counts, IP/general location, device/diagnostic metadata, and model-download metadata may be processed or retained; infrastructure may involve third-party inference providers and multiple regions.

Archive dated policy snapshots and define the study's own raw-response retention, access, and deletion policy. The synthetic/no-personal-data boundary should remain mandatory.

### M-03 — Raw-output publication needs a safety gate, not only a terms gate

`preregistration-v2.md:173` releases raw output where terms permit. Ollama's Terms say the user retains ownership, but that is not affirmative permission for this automated benchmark, upstream-model licensing, or publication of potentially detailed dual-use analysis.

Written permission should expressly cover aggregate publication and any raw-output release. Public outputs require a post-outcome dual-use review, consistent redaction/omission rules, omission of reasoning traces and sensitive metadata, and documented hashes for retained private originals.

### M-04 — Descriptive-only separation remains a future implementation requirement

The prose correctly forbids pooling, provider-superiority, equivalence, or hypothesis-support claims for Ollama (`preregistration-v2.md:134,149`). Current analysis code has no separate Ollama descriptive route and can pool supplied models and emit H1/H2 support decisions. The activation gate must require fabricated-response tests proving the separate descriptive path, not only an exact-model-set guard.

## 6. Minor findings and positive evidence

- The candidate claim is appropriately provisional. The public catalog currently supports the `qwen3.5:cloud` tag, but the amendment correctly leaves account entitlement and durable availability unverified and avoids base-model/open-weight claims.
- The local signed-in cloud route and lack of provider-enforced structured outputs are accurately described.
- Live Ollama references lack access dates and archived digests. Terms, privacy, pricing, model tag, client release, and capability pages should be frozen in the activation record.
- “Prospective pre-registration revision” would be chronologically clearer than “amendment” before an OSF registration exists.
- The ORCID addition is unrelated to the Ollama safety amendment and was not identity-verified in this review.
- No new operational evasion content or external benchmark capability was introduced.

## 7. Required corrections and activation limitations

Before preregistration freeze:

1. Resolve the circular state sequence and define explicit activation/non-activation branches.
2. Update `independent-review.md` and the machine-readable gates for this amendment.
3. Specify `think: false` or a fail-closed trace-handling policy.
4. Add cloud data-processing and researcher-retention disclosures.
5. Restore existing-entitlement-only scope or add a fixed-fee ceiling and explicit action-time authorization.
6. Add a post-outcome dual-use/raw-output release gate.
7. Align the required manuscript/review packet with the conditional stratum.

If the arm remains a candidate, future activation additionally requires:

1. Written Ollama permission before any automated catalog, entitlement, or inference access. Permission must cover route, 640-call volume/cadence, retries, plan, synthetic security prompts, output retention/publication, and model attribution.
2. A no-prompt preflight confirming account entitlement, exact tag/digest, client/server versions, route, plan, and zero/disabled extra-usage balance.
3. A separate queue, ledgers, authorization, hashes, runner, `think` behavior, billing guard, drift guard, and descriptive-only analysis, all tested with fabricated responses.
4. Targeted amendment reviews and clean deterministic reproduction.
5. OSF registration/freeze plus explicit collection authorization.
6. Fail-closed suspension on entitlement exhaustion, 429, drift, terms change, or billing ambiguity; no fallback, account cycling, paid overflow, or aggressive retrying.

No Ollama model outcome call is permitted before all activation gates pass. If Ollama is not activated, that decision must be recorded before any Codex or Claude outcome so activation cannot depend on observed results.

## 8. Decision

`do not approve`

Commit `94959bdb9bcf64dd15ca946f6f395a385f5102af` is not approved for preregistration freeze or Ollama activation. The conditional replication is potentially supportable, and the repository is currently fail-closed, but the circular gate sequence, missing amendment-specific governance, and ungoverned default reasoning trace must be corrected and re-reviewed first.

## 9. Stable signature

`AI-SAFETY-01 Ollama amendment | OpenAI Codex AI subagent, exact serving-model identifier not exposed | non-isolated, outcome-blind | 2026-07-19 | 94959bdb9bcf64dd15ca946f6f395a385f5102af | do not approve`
