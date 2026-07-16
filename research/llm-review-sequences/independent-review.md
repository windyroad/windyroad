# AI-assisted internal review protocol

Status: required before preregistration v2 is frozen. The historical filename is retained for stable links; these reviews are not independent human peer review.

No reviewer may receive confirmatory LLM outcomes. All three reviewers inspect the same Git commit and packet without seeing another review.

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
- [`review-schema.json`](./review-schema.json)
- [`analyse.mjs`](./analyse.mjs)
- All directly associated tests

Run from a clean checkout:

```sh
npm test
rm -rf /tmp/llm-review-benchmark /tmp/llm-review-subscription /tmp/llm-review-collection
node research/llm-review-sequences/benchmark.mjs /tmp/llm-review-benchmark
node research/llm-review-sequences/ecological.mjs \
  /tmp/llm-review-benchmark \
  /tmp/llm-review-subscription \
  /tmp/llm-review-collection
```

Stop if the generated counts or SHA-256 values differ from [`study.json`](./study.json). Do not invoke Codex or Claude Code on a benchmark prompt.

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
- Subscription-only authentication and the US$0 spending guard are verified without sending a benchmark prompt.
- The OSF registration timestamp and identifier are recorded.

Human peer review remains desirable but is not represented as completed. arXiv endorsement, if required, is a separate account-level process and is not supplied by these subagents.
