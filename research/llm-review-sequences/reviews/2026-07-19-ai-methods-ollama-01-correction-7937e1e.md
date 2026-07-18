# AI-METHODS-01 correction review

## Exact commit

`7937e1eb8cd11b386aa0a1fe419c560eeb45bb20`

Parent: `94959bdb9bcf64dd15ca946f6f395a385f5102af`

Review date: 2026-07-19, Australia/Sydney.

The requested commit was `HEAD`, and the working tree was clean when inspected.

## Scope

This was a targeted, non-isolated, pre-outcome methodological review of the conditional Ollama Cloud replication only. I assessed:

- Outcome-blind activation and nonactivation.
- Decision-free exploratory reporting.
- Isolation from the two-system confirmatory estimand.
- Sample and boundary accounting.
- Exact-model identity and drift handling.
- Disposition of the first-round methods findings.

I did not edit files, access OSF, contact Ollama, inspect account entitlement, run an inference prompt, or make any subscription/provider call. This is not human peer review, ethics approval, reproducibility signoff, or authorization to collect outcomes.

## Checks performed

I inspected:

- `AGENTS.md`, `PRINCIPLES.md`, and `RISK_REGISTER.md`.
- `study.json`, `preregistration-v2.md`, `README.md`, and `independent-review.md`.
- `paper/paper.tex`.
- `analyse.mjs` and `analyse.test.mjs`.
- The first-round methods review at `reviews/2026-07-19-ai-methods-ollama-01-94959bd.md`.
- `reviews/resolution.md`.
- The full relevant diff from `94959bd` to `7937e1e`.

Deterministic checks established that:

- `study.json` parses successfully.
- The commit changes no analysis implementation or analysis test.
- The manifest remains unfrozen and records no confirmatory or Ollama outcome and no authorized Ollama access or outcome call (`study.json:3-7,93-99`).
- The declared arithmetic is coherent:
  - Confirmatory: 40 templates, 80 cases, 640 sequences, 1,280 boundaries; 320 atomic and 960 split.
  - Conditional Ollama: 320 sequences, 640 boundaries; 160 atomic and 480 split.
  - Activated package total: 1,920 boundaries, with only the original 1,280 confirmatory (`preregistration-v2.md:91-105`; `study.json:47-60,120-129`).
- The targeted Vitest command was attempted under available Node v24.16.0 because the pinned Node 20.19.0 runtime was unavailable. It did not start because that runtime expected the x64 Rollup optional package while the installed dependency tree contained the ARM64 package. I therefore make no fresh test-pass claim for this commit. This does not affect the document-level methods conclusion, but fixture tests remain mandatory before activation.

## Outcome-blind activation and nonactivation

The correction resolves the earlier sequencing ambiguity.

The order is now explicit:

1. Written provider permission before any automated access.
2. A permitted no-prompt entitlement, plan, version, model-record, and zero-balance preflight.
3. Fixture-only implementation and offline generation of separate artifacts.
4. Targeted review of the exact activation candidate.
5. A final activation or nonactivation decision before every study outcome.
6. One applicable OSF registration and freeze, followed by explicit authorization of only the frozen queues.

At final registration, an incomplete arm must be recorded as not activated. That decision precedes Codex, Claude, and Ollama outcomes (`preregistration-v2.md:75-77`; `study.json:110-119`). This prevents optional-arm availability or preparation problems from becoming outcome-dependent design choices.

## Confirmatory isolation and decision-free reporting

The registered design is methodologically adequate:

- Confirmatory inference is defined over exactly `codex-cli/gpt-5.5` and `claude-code/sonnet`.
- Missing, extra, mixed, or Ollama rows must be rejected rather than filtered silently.
- Ollama must use a separate one-system reporting path.
- That path may expose estimates, 95% intervals, missingness bounds, and complete-template sensitivity, but no `supported`, `robust`, significance, equivalence, superiority, or pooled decision fields (`preregistration-v2.md:138-155`; `study.json:130-134`).

The implementation is intentionally not ready. The current analyzer still:

- Emits `supported` for H1 and H2 (`analyse.mjs:384-393`).
- Emits `robust` support decisions (`analyse.mjs:433-438`).
- Aggregates cells without model in the key (`analyse.mjs:485-516`).
- Accepts supplied models without an exact two-system allowlist (`analyse.mjs:599-615`).

Consequently, Ollama activation remains blocked until fixture-based tests demonstrate both confirmatory contamination rejection and decision-free Ollama reporting. This is an effective activation gate, not a blocker to registering the conditional design or choosing the finalized nonactivation branch.

## Exact-model identity

The correction materially improves identity control:

- The candidate is now the explicit tag `qwen3.5:397b-cloud`, not the broader `qwen3.5:cloud` alias.
- Only exact returned identity `qwen3.5:397b-cloud` is acceptable.
- Activation preparation must freeze the exact `/api/tags` model record and canonical hash, a dated public-model-page hash, client and server versions, and request and response envelopes.
- Identity, plan, entitlement, versions, model record, returned model, and zero-balance state are rechecked before every initial or resumed batch.
- Ambiguity or drift causes a durable, non-consuming suspension (`study.json:100-116`; `preregistration-v2.md:71-83`).

Availability and entitlement remain explicitly unverified, which is correct at this stage. Earlier diagnostic hashes associated with the generic candidate are not activation artifacts; separate artifacts must be generated and frozen for the exact tag.

These controls establish observable product identity but cannot prove that a provider has not changed hidden routing, weights, or serving behavior behind a stable tag. The protocol correctly retains that limitation.

## Prior findings and dispositions

### `METH-OLL-M01` — Decision-free reporting and confirmatory isolation

Disposition: resolved for preregistration design; unresolved and blocking for activation.

The correction now makes an exact two-system allowlist, contamination-rejection tests, and a decision-free Ollama path mandatory before activation. The current analyzer remains unsuitable, but no Ollama runtime, artifact, or outcome call is authorized before replacement implementation and repeat review.

### `METH-OLL-m01` — Manuscript omitted the conditional arm

Disposition: resolved.

The manuscript now identifies the conditional system, its 640 exploratory boundaries, exact tag, request differences, spending and permission gates, cloud processing, separate analysis, and limitations (`paper/paper.tex:44-47,164-170,183-212,271-280`).

### `METH-OLL-m02` — Calendar separation limitation

Disposition: resolved with a continuing limitation.

The revised manuscript retains platform/reset-window drift and cross-product confounding. Separate queues protect within-product contrasts but cannot make descriptive product comparisons causal when products may be run during different platform periods (`paper/paper.tex:315-334`).

## New findings

### New blockers

None for preregistering the conditional design.

The absent guarded implementation remains a blocker to Ollama activation, artifact freeze, and collection.

### New major findings

None.

### New minor finding — Legacy manifest fields could be misread

After `legacy_api_design_status`, `study.json` retains superseded three-model, three-trial API-design fields (`study.json:153-169` and following). They are labelled legacy, but generic tooling could misinterpret them as active.

Any OSF export, runner, or analysis configuration should explicitly take `active_subscription_design` and `exploratory_ollama_cloud_replication` as authoritative and ignore the legacy fields. This does not undermine the current statistical design.

## Required documented limitations

The eventual manuscript and results must retain that:

- Ollama reuses the same 40 templates and contributes no independent template evidence.
- It does not increase confirmatory power or alter H1/H2 decisions.
- Product selection is a convenience sample determined by the sole author’s subscriptions.
- There is one trial per cell, so within-product stochastic consistency is unknown.
- Schema enforcement, system instructions, agent scaffolding, routing, and serving stacks differ between products.
- The absence of provider-enforced structured output may change abstention and schema-failure rates.
- Cross-product and calendar-period comparisons are descriptive and confounded.
- A stable tag or catalog record cannot reveal every hidden backend change.
- No equivalence, provider-superiority, open-versus-closed-weight, base-model, or general LLM-review conclusion may be drawn from the arm.
- Activation status, permission, subscription tier, versions, identity hashes, dates, suspensions, nonactivation, and partial-collection reasons must be reported.

## Final verdict

**APPROVE WITH DOCUMENTED LIMITATIONS**

The conditional Ollama replication is statistically and methodologically adequate for prospective registration. It preserves an outcome-blind branch decision, coherent sample accounting, a fixed non-confirmatory estimand, appropriately narrow claims, and prospective exact-identity controls.

This verdict approves the corrected design only. It does not approve Ollama activation or outcome collection. Activation still requires written permission, verified entitlement and identity, separate frozen artifacts, the exact two-system rejection guard, a decision-free Ollama analysis path, fabricated-response tests, and another targeted pre-outcome review.

`AI-METHODS-01 | targeted non-isolated Ollama correction review | 2026-07-19 | 7937e1eb8cd11b386aa0a1fe419c560eeb45bb20 | Codex / GPT-5 family | APPROVE WITH DOCUMENTED LIMITATIONS`
