# AI-assisted internal review protocol

Status: required before preregistration v2 is frozen. The historical filename is retained for stable links; these reviews are not independent human peer review.

No reviewer may receive confirmatory LLM outcomes. For the initial review, all three reviewers inspect the same Git commit and packet without seeing another review. Correction addenda may inspect prior reports and the cross-role resolution log; each such addendum must disclose that it is non-isolated and not fresh independent evidence.

## Review packet

The frozen packet contains:

- [`study.json`](./study.json)
- [`preregistration-v2.md`](./preregistration-v2.md)
- [`README.md`](./README.md)
- [`paper/paper.tex`](./paper/paper.tex)
- [`benchmark.mjs`](./benchmark.mjs)
- [`ecological.mjs`](./ecological.mjs)
- [`collection.mjs`](./collection.mjs)
- [`design.mjs`](./design.mjs)
- [`subscription.mjs`](./subscription.mjs)
- [`subscription-runner.mjs`](./subscription-runner.mjs)
- [`review-schema.json`](./review-schema.json)
- [`analyse.mjs`](./analyse.mjs)
- All directly associated tests

Run from a clean checkout:

```sh
npm ci
npm test
EXHAUSTIVE_BENCHMARK=1 npx vitest run \
  research/llm-review-sequences/benchmark.test.mjs \
  research/llm-review-sequences/ecological.test.mjs
root="$(mktemp -d /tmp/llm-review-subscription.XXXXXX)"
node research/llm-review-sequences/benchmark.mjs "$root/full"
node research/llm-review-sequences/ecological.mjs \
  "$root/full" \
  "$root/active" \
  "$root/collection"
```

Stop if the generated counts or SHA-256 values differ from [`study.json`](./study.json). Do not invoke Codex, Claude Code, or Ollama on a benchmark prompt.

## Shared declarations

Each reviewer must state:

- Stable reviewer pseudonym and role.
- Date and reviewed Git commit.
- That it is an AI subagent orchestrated by the author.
- That it is not a human, independent peer reviewer, ethics body, or arXiv endorser.
- Model or product identity if exposed.
- Conflicts created by shared provider, model family, prompt, repository, or author orchestration.
- That no confirmatory outcome was supplied or inspected.

## Review roles

### AI-SAFETY-01

Inspect benchmark and responsible-release safety:

- All eight scenario-family constructors and the selected indexes 1, 7, 13, 19, and 25.
- Malicious and benign rendering for all 40 selected templates.
- Atomic-split final-tree and changed-line equality.
- Necessity of each malicious split step.
- Absence of ground-truth leakage from prompts and native artifacts.
- Safety-scanner coverage and the no-network, no-file-system, no-credential, no-persistence, no-destructive, and no-deployment claims.
- Whether public artifacts offer reusable operational evasion guidance.
- Whether AI-assisted internal review is described without implying human independence.

Any real external capability or reusable exploit path is a stop condition.

### AI-METHODS-01

Inspect methods and statistical claims:

- Structural template as the generalisation unit.
- Balanced selection across eight families, five representations, and five flow shapes.
- One identifier instance and one trial per cell.
- H1 and H2 estimands and directional interval rules.
- Exploratory status of workflow and interaction estimates.
- Low-power calculations and prohibition on equivalence claims.
- Family-stratified bootstrap, missingness bounds, and multiplicity handling.
- Randomised schedule, call balance, and absence of outcome-dependent stopping.
- Whether the zero-additional-spend constraint creates any unreported selection bias.

### AI-REPRO-01

Inspect reproducibility and subscription-only execution:

- Clean-checkout command correctness and manifest-hash agreement.
- CLI versions, requested models, authentication checks, and provenance capture.
- Absence of API keys and paid fallback routes.
- Fresh sessions, disabled tools, schema validation, attempt logging, rate-limit pauses, and drift suspension.
- Separation of the blinded call queue and ground-truth ledger.
- OSF and arXiv artifact readiness without attempting submission.
- Consistency among the manifest, preregistration, README, manuscript, and generated counts.

## Conditional Ollama revision rubric

Every targeted review of the conditional Ollama stratum must also verify the ordered state sequence: written provider permission before any automated access; permitted no-prompt preflight; fixture-only implementation and offline artifact generation; targeted review; final activation or non-activation before any outcome; OSF registration and freeze; then explicit outcome-call authorization.

### AI-SAFETY-01 additions

- Written permission covers automated preflight, request volume and cadence, synthetic security-review content, aggregate publication, raw-output handling, and model attribution.
- The localhost route is disclosed as cloud processing, with dated Terms, Privacy, Pricing, model, and capability evidence.
- `think: false` is frozen and any reasoning trace fails closed; reasoning traces and sensitive metadata are excluded from public release.
- Researcher retention, access, deletion, upstream-license review, and post-outcome dual-use release gates are explicit.

### AI-METHODS-01 additions

- Ollama reuses the same 40 templates and adds no independent template evidence or confirmatory power.
- The exact two-system confirmatory estimand rejects missing, extra, mixed, or Ollama rows.
- The Ollama-only path reports estimates, intervals, and bounds without support, robustness, significance, equivalence, superiority, or pooled decisions.
- Activation or non-activation is fixed before every study outcome and cannot depend on results.

### AI-REPRO-01 additions

- The permission record, action-time fixed-fee authorization, plan, entitlement, machine-verified absence of `OLLAMA_API_KEY`, and zero or disabled extra-usage balance are machine-readable and checked before every batch or resume.
- Client and server versions, exact tag, the complete matching `/api/tags` JSON record and its RFC 8785 JSON Canonicalization Scheme SHA-256, public-model-page raw-byte SHA-256, request envelope, and response envelope are frozen and drift checked. Exact returned model identity is checked on every response before scoring or durable acceptance.
- The Ollama queue, blinded ledger, ground truth, authorization, attempts, results, and hashes are separate from the two-system confirmatory package.
- Fixture-only tests prove no inference occurs during preparation, reject reasoning traces and tool calls, and prove confirmatory contamination rejection plus decision-free Ollama reporting.
- The manuscript, manifest, preregistration, README, generated counts, hashes, and activation record agree.

## Fixed report format

Each raw report must contain these headings:

1. Reviewer identity and scope
2. Conflicts and outcome-blindness
3. Reproduction evidence
4. Blocking findings
5. Major findings
6. Minor findings
7. Required manuscript limitations
8. Decision
9. Stable signature

Findings cite exact file and line evidence. Decisions are one of:

- `approve`
- `approve with documented limitations`
- `do not approve`

The reviewer does not edit files. A report with no reproduction evidence cannot approve.

## Author resolution log

The author archives every raw report verbatim, then records for each finding:

- Finding identifier.
- Disposition: accepted, partially accepted, or rejected.
- Evidence-based rationale.
- Changed files and verification commands.
- Whether the change invalidates any artifact hash.
- Whether the affected review must be repeated.

The author may not convert a subagent approval into a claim of independent validation. Disagreement among reviewers remains visible.

## Freeze rule

Preregistration v2 may be frozen only when:

- All three AI-assisted internal reviews are archived.
- No reviewer has an unresolved blocking finding.
- Supported corrections are applied before any outcome collection.
- The final generated hashes reproduce from a clean checkout.
- Subscription-only authentication and the US$0 usage-based spending guard are verified without sending a benchmark prompt. Any new fixed subscription has separate action-time authorization, and any Ollama extra-usage balance is proven zero or disabled.
- The Ollama activation or non-activation branch is final before any study outcome. If activated, every conditional-rubric requirement is satisfied; if not activated, no Ollama runtime or artifact is authorized.
- The OSF registration timestamp and identifier are recorded.

Human peer review remains desirable but is not represented as completed. arXiv endorsement, if required, is a separate account-level process and is not supplied by these subagents.
