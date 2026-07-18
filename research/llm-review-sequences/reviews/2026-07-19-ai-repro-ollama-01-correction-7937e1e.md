# AI-REPRO Ollama correction review

## Reviewer identity and scope

- Reviewer: `AI-REPRO-OLLAMA-01-C1`, OpenAI Codex AI subagent; exact serving model undisclosed.
- Review date: 2026-07-19, Australia/Sydney.
- Exact commit: `7937e1eb8cd11b386aa0a1fe419c560eeb45bb20`.
- Parent: `94959bdb9bcf64dd15ca946f6f395a385f5102af`.
- Subject: `docs: resolve Ollama preregistration review findings`.
- This is an author-orchestrated, non-isolated correction review. I inspected the first-round reports and resolution log. It is not independent human review, ethics approval, provider permission, or arXiv endorsement.
- Scope was limited to whether the conditional Ollama replication reproducibly resolves the findings against `94959bd`.
- No outcome was supplied or inspected. No Ollama, model, subscription, provider, benchmark-collection, or OSF call was made. No file was edited.

The reviewed commit changes 12 files: governing documents, manuscript source/PDF/build record, archived first-round reports, resolution log, and root lockfile metadata. It changes no benchmark generator, collection runner, analysis implementation, or associated test file.

## Checks performed

- Confirmed clean `HEAD` at the exact commit; local `master` is two commits ahead of its local `origin/master`.
- `git diff --check 7937e1e^ 7937e1e`: passed.
- Parsed `study.json`, `package.json`, and `package-lock.json`: passed.
- Confirmed all relevant `.mjs` and test files are unchanged from the parent.
- Compared the parent and correction manifests:

  - Confirmatory systems remain exactly Codex and Claude.
  - Confirmatory count remains 1,280.
  - All five existing cards, prompts, schedule, calls, and ground-truth hashes remain unchanged.
  - No Ollama queue, ledger, runtime path, result, or outcome artifact exists.

- Fixture-only tests under Node 22.22.0/Vitest 3.2.4: 2 files and 13 tests passed. This was not the documented Node 20.19.0 environment.
- Verified the manuscript source and PDF checksums exactly match [BUILD.md](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/paper/BUILD.md:28). `pdfinfo` reports six pages. The PDF was not rebuilt or visually rendered in this review.
- Confirmed root package and lock metadata now agree at `2.13.5`.

## Prior-finding dispositions

### B-01 — Circular activation sequence

**Resolved.**

The manifest now defines explicit ordered stages: permission before automated access, permitted no-prompt preflight, fixture-only implementation and offline artifact generation, targeted review, outcome-blind branch selection and OSF freeze, then outcome authorization ([study.json](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/study.json:110)). Separate activation and non-activation branches remove the previous circularity ([study.json](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/study.json:118)).

The same ordering is consistent in [preregistration-v2.md](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/preregistration-v2.md:75), [README.md](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/README.md:29), and the amended review rubric.

### B-02 — Review-packet and manuscript inconsistency

**Resolved.**

The manuscript now distinguishes the 1,280-boundary confirmatory design from the conditional 640-boundary Ollama stratum ([paper.tex](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/paper/paper.tex:44)). It covers permission, billing, request controls, cloud processing, separate descriptive analysis, activation status, and retained limitations.

[independent-review.md](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/independent-review.md:98) now contains an Ollama-specific safety, methods, and reproducibility rubric. The resolution log explicitly scopes the older OSF-readiness statement to `4b48101` and records that the new revision still requires correction review ([resolution.md](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/reviews/resolution.md:95)).

### M-01 — Incomplete financial guard

**Resolved for the permission-pending stage.**

The revision authorizes no purchase. Any exact plan and fixed fee require separate action-time approval. Extra-usage balance must be zero or disabled before every initial or resumed batch; API-key, per-call, overage, fallback, and paid-overflow routes remain prohibited ([study.json](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/study.json:108), [preregistration-v2.md](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/preregistration-v2.md:83)).

If a repeatable zero-balance proof is unavailable, the preparation remains incomplete and the arm must take the non-activation branch.

### M-02 — Authentication and drift controls

**Resolved as a mandatory future activation gate, with limitations below.**

The candidate now uses the explicit `qwen3.5:397b-cloud` tag. The activation record must freeze account/plan, entitlement, client and server versions, exact `/api/tags` model record and hash, public-page snapshot, request/response envelopes, and exact returned identity. Identity, entitlement, version, model-record, and zero-balance checks repeat for every batch or resume, with ambiguity producing a durable non-consuming suspension ([study.json](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/study.json:101), [study.json](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/study.json:112)).

### M-03 — Analysis contamination

**Resolved as a permission-gated implementation requirement.**

The preregistration now requires:

- Exact two-system confirmatory rejection of missing, extra, mixed, or Ollama rows.
- A separate Ollama-only reporting path.
- No `supported`, `robust`, significance, equivalence, superiority, or pooling fields.
- Fabricated-response contamination and decision-free-reporting tests before activation.

See [preregistration-v2.md](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/preregistration-v2.md:140) and [independent-review.md](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/independent-review.md:109).

No implementation exists yet, correctly matching the requirement that fixture-only implementation begins only after written permission.

### M-04 — Incomplete request/response contract

**Resolved for the prospective stage.**

The contract now fixes:

- Exact model tag and localhost cloud-broker route.
- `stream: false`.
- `think: false`.
- Tools and `format` absent.
- `options.num_predict: 256`.
- Exact returned-model equality.
- Parsing the complete `message.content` without repair or fence stripping.
- Invalid JSON as an abstention.
- Reasoning traces or tool calls as fail-closed suspensions.

See [preregistration-v2.md](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/preregistration-v2.md:73) and [study.json](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/study.json:106).

## New findings

### Blocking findings

None.

### Major findings

None for this permission-pending correction revision.

### Minor findings

1. **Canonicalization remains deferred.** “Canonical SHA-256” does not yet name an algorithm such as RFC 8785 or exact raw-byte serialization. The activation implementation and record must specify selection and serialization before the permitted preflight evidence can be considered reproducible.

2. **Returned-model timing should be clarified.** The documents group returned-model identity with checks performed “before” each batch, but returned identity exists only after a response. Pre-batch checks should cover account, plan, entitlement, version, tag record, and balance; exact returned identity must be checked on every response before scoring or durable acceptance.

3. **The deterministic-baseline lock hash is historical.** [study.json](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/study.json:430) records the lockfile used for the earlier baseline, while the current lockfile has a different hash after root version-metadata updates. Dependency entries are unchanged, but the field should be labelled historical or the baseline rerun before final clean-checkout freeze.

## Required documented limitations

- The cloud tag and catalog digest cannot prove an immutable backend, checkpoint, quantization, routing path, or open-weight identity.
- Ollama remains a product-level exploratory replication, not additional independent template evidence or confirmatory power.
- Provider surfaces, hidden prompts, schema enforcement, calendar periods, and routing confound cross-product comparisons.
- Invalid JSON is an operational abstention and may make abstention rates incomparable with provider-enforced structured-output systems.
- No provider permission, entitlement, zero-balance evidence, activation artifact, implementation, OSF record, or outcome currently exists.
- The future exact activation candidate must receive another targeted review after fixture-only implementation and artifact generation.

## Final verdict

**APPROVE WITH DOCUMENTED LIMITATIONS**

This approves commit `7937e1e` as a reproducible, permission-pending pre-registration correction. It does not approve Ollama activation, implementation, purchase, OSF registration, or outcome collection.
