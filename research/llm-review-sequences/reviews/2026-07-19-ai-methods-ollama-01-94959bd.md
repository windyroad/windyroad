## 1. Reviewer identity and scope

- Reviewer pseudonym: `AI-METHODS-01`.
- Review type: targeted, non-isolated pre-outcome amendment review.
- Review date: 2026-07-19, Australia/Sydney.
- Reviewed commit: `94959bdb9bcf64dd15ca946f6f395a385f5102af`.
- Product identity: OpenAI Codex AI subagent, GPT-5 family; exact serving variant was not exposed.
- I am an AI subagent orchestrated by author Tom Howard. I am not a human or independent peer reviewer, ethics body, or arXiv endorser.
- I reviewed the conditional Ollama stratum, confirmatory-estimand isolation, balance, independence, call counts, randomization, missingness, sensitivity claims, multiplicity, stopping, model drift, and permitted conclusions.
- I made no repository edits and ran no subscription runner, Ollama inference, or other benchmark/model prompt.

## 2. Conflicts and outcome-blindness

- This addendum is non-isolated. I inspected the prior methods reports and combined resolution log, so it is not fresh independent evidence.
- Reviewer, repository, prompt, author-orchestration, OpenAI-provider, and Codex-product conflicts remain.
- No confirmatory or exploratory LLM outcome was supplied or inspected. The manifest remains unfrozen, records both outcome flags as false, and denies authorization (`study.json:3-7,92-95`).
- No result or attempt ledger exists under the research package.
- Deterministic schedule generation and fabricated outcome checks described below are not study outcomes.

## 3. Reproduction evidence

- `HEAD` and the requested commit both resolved to `94959bdb9bcf64dd15ca946f6f395a385f5102af`; the working tree remained clean.
- The exact supported Node `20.19.0` runtime was unavailable locally. Under Node `v24.16.0` with the installed lockfile dependencies:
  - Full `npm test`: 26 files passed; 170 tests passed and 2 skipped.
  - Required exhaustive benchmark run: 2 files and all 3 tests passed.
- Clean deterministic regeneration reproduced the unchanged primary design:
  - 640 sequences and 1,280 boundaries.
  - 640 calls for each confirmatory system.
  - 320 atomic and 960 split boundaries.
  - Schedule SHA-256 `e704e82c8c052cd05fdef8e2d19e8551e07617c537d81b52872d829d7e37ad1a`.
  - Prompts SHA-256 `e3359ebd8790be9aa81938533cfd6747f5b90043ae60810cf447a61d95c8dd6c`.
  - Calls SHA-256 `01139eafb7541a840919be30607438c5a3b279303dea092d0a1a8203e1b02223`.
  - Ground-truth SHA-256 `b5d1cb531d7d5137c1e8153aabafdf1475528700ff529706b58c1e9553057773`.
- Applying the existing deterministic scheduler to the proposed one-system Ollama queue with seed `20260719` reproduced:
  - 320 sequences and 640 boundaries.
  - 160 atomic and 480 split boundaries.
  - Schedule SHA-256 `dd1739147d9f2008962102475f33837edad10a182e56a2ae3105f6b6eecffa1a`.
  - Calls SHA-256 `11a5ed6f66a1be5930529943c60d14a6445f9e2528e5ad76c196e539f3aaffa9`.
  - Ground-truth SHA-256 `92987ae131bfb7e04931e9d7f3850b577cd24022a86c972bbd2990a2a155e388`.
  - These are review diagnostics, not frozen arm artifacts.
- The amendment correctly leaves Ollama outside the confirmatory estimand (`preregistration-v2.md:134-149`; `study.json:92-130`).
- A fabricated check confirmed why the registered guard is necessary: adding one low-detection Ollama row per cell to otherwise perfectly discriminating Codex and Claude rows changed unfiltered H1 from `1` to `0.6666666666666666`. Current aggregation omits `model` from its cell key (`analyse.mjs:485-516`).
- Balance, sample-size, and sensitivity claims are internally coherent:
  - The arm adds no structural templates and therefore no independent template evidence (`preregistration-v2.md:108-112`).
  - Existing sensitivity values remain explicitly single-system diagnostics rather than pooled-analysis power (`preregistration-v2.md:110`).
  - Activation/nonactivation is determined before the first outcome and cannot depend on model behavior (`preregistration-v2.md:73-75`).

## 4. Blocking findings

No finding blocks registering the conditional amendment.

Ollama activation itself remains blocked, as intended, until every activation gate is satisfied. This approval does not authorize an Ollama prompt or approve the currently absent runner and analysis protections.

## 5. Major findings

### METH-OLL-M01 — Decision-free exploratory reporting remains a mandatory preactivation implementation requirement

The amendment promises no Ollama hypothesis-support decision (`study.json:125-129`; `preregistration-v2.md:149`). The current reusable analysis functions nevertheless emit:

- H1 and H2 `supported` fields (`analyse.mjs:384-393`).
- Missingness `robust` support decisions (`analyse.mjs:433-438`).

The current CLI also accepts every supplied model and contains no exact-model-set guard (`analyse.mjs:599-615`). The manifest already makes an exact-model guard an activation condition (`study.json:107-113`), so this is not a blocker to registering the conditional plan. Before activation, however, implementation and tests must prove both:

1. Ollama rows cannot affect any confirmatory output.
2. Ollama output exposes estimates, intervals, and sensitivity bounds without `supported`, `robust`, equivalence, significance, or synonymous decisions.

That implementation and its generated hashes require another targeted pre-outcome review.

## 6. Minor findings

### METH-OLL-m01 — The pre-outcome manuscript still describes only the two-system design

The manuscript remains accurate for the unchanged confirmatory analysis, but it does not disclose the registered conditional arm and still states two systems, 1,280 total reviews, and no expenditure beyond existing subscriptions (`paper/paper.tex:44-50,157-164,296-303`).

Before the manuscript is represented as describing the registered design, add a concise conditional-arm disclosure. If Ollama activates, update its system table, package-wide counts, billing language, analysis separation, and limitations. If it does not activate, record that prospective nonactivation transparently.

### METH-OLL-m02 — Calendar separation must remain a stated limitation

Separate randomized queues protect within-system contrasts, but do not eliminate calendar-time confounding between products. The manuscript already recognizes reset-window and platform-drift risk (`paper/paper.tex:288-294`). Retain and apply that limitation to any descriptive Ollama-versus-confirmatory comparison.

## 7. Required manuscript limitations

Retain or add the following:

- Ollama reuses the same 40 templates and is not additional independent template evidence.
- It cannot increase confirmatory power or alter H1/H2 support.
- Product selection is a convenience consequence of subscriptions available to the author.
- The direct Ollama surface differs from Codex and Claude in schema enforcement and agent scaffolding; schema-failure differences may affect observed detection.
- Cross-product differences are descriptive and confounded by product surface, system prompts, serving stack, routing, and potentially calendar period.
- A cloud alias and catalog digest may not expose backend revisions.
- One trial cannot estimate within-product stochastic consistency.
- No open-versus-closed-weight, provider-superiority, base-model, equivalence, or general LLM-review claim may be drawn from the optional arm.
- Report every activation gate, the activation decision, plan tier, permission record, versions, digest, dates, and any nonactivation or partial-collection reason.

## 8. Decision

`approve with documented limitations`

The conditional exploratory design is statistically defensible. It preserves the approved two-system confirmatory estimand and hashes, uses an outcome-independent activation rule, reproduces the stated balance, avoids pseudoreplication, preserves missingness handling, and makes appropriately narrow claims.

This decision approves inclusion of the conditional arm in the OSF plan. It does not approve Ollama activation or collection; those require the guarded, decision-free implementation, frozen artifacts, and another targeted review.

## 9. Stable signature

`AI-METHODS-01 | targeted non-isolated Ollama amendment review | 2026-07-19 | 94959bdb9bcf64dd15ca946f6f395a385f5102af | Codex / GPT-5 family | approve with documented limitations`
