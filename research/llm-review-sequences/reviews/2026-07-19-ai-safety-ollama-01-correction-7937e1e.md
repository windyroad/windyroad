# AI Safety Correction Review — Ollama Conditional Replication

## Review identification

- **Exact commit reviewed:** `7937e1eb8cd11b386aa0a1fe419c560eeb45bb20`
- **Parent commit:** `94959bdb9bcf64dd15ca946f6f395a385f5102af`
- **Commit subject:** `docs: resolve Ollama preregistration review findings`
- **Review date:** 2026-07-19
- **Reviewer:** `AI-SAFETY-01 — Ollama correction`
- **Review type:** Non-isolated correction review. I consulted the first-round review and its resolution record, but no study outcomes exist and none were accessed.

## Scope

This review considers only whether the proposed Ollama Cloud replication is now safely and ethically governed. It does not approve:

- automated access to Ollama;
- purchasing or activating a subscription;
- any external preflight or model request;
- collection of outcome data;
- OSF activity;
- public release of raw outputs; or
- the scientific merits of the two-system confirmatory study except where separation from the Ollama arm is safety-relevant.

No external model, provider, Ollama, or OSF calls were made.

## Checks performed

I inspected the exact commit, its parent diff, and the relevant files under `research/llm-review-sequences`, including:

- [README.md](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/README.md)
- [preregistration-v2.md](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/preregistration-v2.md)
- [independent-review.md](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/independent-review.md)
- [study.json](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/study.json)
- [resolution.md](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/reviews/resolution.md)
- [first-round AI-safety review](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/reviews/2026-07-19-ai-safety-ollama-01-94959bd.md)
- [paper.tex](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/paper/paper.tex)
- [BUILD.md](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/paper/BUILD.md)

Deterministic checks established that:

- the worktree was clean;
- `study.json` parses successfully and still says `frozen: false`, `automated_access_authorized: false`, and `outcome_calls_authorized: false`;
- `git diff --check` passed;
- no Ollama runner or other runtime implementation was introduced by this correction commit;
- no Ollama result, attempt, or outcome artifact exists;
- the existing runner remains limited to the two-system confirmatory design and rejects unknown systems;
- nine focused study test files passed: 37 tests passed and two were skipped;
- the exhaustive benchmark/ecological checks passed: three tests across two files;
- the paper source and generated PDF match the hashes recorded in `paper/BUILD.md`;
- the rendered PDF remains a six-page PDF 1.7 artifact.

The tests ran under Node.js 22.17.1 because the pinned Node.js 20.19.0 runtime was unavailable. That is a verification limitation, not evidence of an Ollama safety defect.

I did not re-contact Ollama or independently refresh its current documentation. Provider-policy claims therefore remain inherited from the dated first-round evidence and are correctly required to be captured again as dated, hashed snapshots before activation.

## Prior findings and dispositions

| Prior finding | Disposition | Correction assessment |
|---|---|---|
| **B-01 — Activation order was ambiguous and potentially circular.** | **Resolved.** | The corrected plan now specifies a fail-closed sequence: written automated-access permission; no-prompt account/preflight checks; fixture-only implementation and offline artifacts; targeted methods, reproducibility, and safety review; a final activation or nonactivation decision; OSF registration and freeze; then separately authorized outcome calls. Batch starts and resumptions must recheck the relevant gates. The nonactivation branch is fixed before any system’s outcome collection. |
| **B-02 — There was no amendment-specific independent-review protocol.** | **Resolved.** | `independent-review.md` now contains an Ollama-specific methods, reproducibility, and AI-safety rubric. Freeze requires no unresolved blockers, zero-dollar usage, action-time approval for the exact plan and fee, zero or disabled additional balance, a final branch decision before outcomes, and OSF registration. `study.json` records the same ordered targeted-review stage. |
| **B-03 — Default reasoning output was not disabled or governed.** | **Resolved conditionally and fail-closed.** | The future request is fixed to `stream:false`, `think:false`, no tools, no structured-output format, and `options.num_predict:256`. Only `message.content` may be scored. Invalid JSON produces abstention. Any reasoning trace or tool call suspends the arm; the affected response is neither scored nor publicly released. Actual support for `think:false` remains an activation-time check. |
| **M-01 — Subscription and spending controls were underspecified.** | **Resolved as governance; activation evidence remains pending.** | No purchase is authorized. The exact plan and fixed fee require separate action-time approval. Per-call billing, overage, fallback billing, paid overflow, and use of an `OLLAMA_API_KEY` are prohibited. Additional balance must be zero or disabled at the initial preflight and every batch start or resume. If that state cannot be established reliably, the arm must remain inactive. |
| **M-02 — Cloud processing and retention were insufficiently disclosed.** | **Resolved.** | The materials now state that the localhost interface is a cloud broker and prompts leave the device. They distinguish provider handling from researcher retention and acknowledge possible provider/infrastructure metadata processing across regions. Researcher-held raw responses are encrypted and access-controlled through publication plus 12 months, after which private content is deleted while hashes and derived tables may be retained. |
| **M-03 — Raw-output publication lacked adequate safety governance.** | **Resolved.** | Written permission must cover aggregate and raw-output handling. Any raw release also requires upstream-license review and a post-outcome AI-assisted dual-use review. Reasoning traces and sensitive metadata are never released; omissions are disclosed and represented through hashes or derived data. |
| **M-04 — The descriptive-only Ollama analysis was not technically isolated.** | **Resolved as an explicit future activation gate.** | The plan now requires an exact two-system confirmatory allowlist that rejects missing, extra, mixed, or Ollama-labelled records. The separate Ollama path must emit no support, robustness, significance, equivalence, superiority, or pooled inferential decision. Fixture tests and another review of the exact implementation are required before activation. No such implementation exists yet, which is acceptable while the arm remains unauthorized. |
| **Candidate/model identity was provisional.** | **Resolved for preregistration; operational identity remains to be verified.** | The candidate is now explicitly `qwen3.5:397b-cloud`, not an unstated alias. Availability, entitlement, and the returned model identity must still be verified without prompt submission. Drift or ambiguity requires suspension. |
| **The local endpoint could obscure that processing was remote.** | **Resolved.** | The corrected documentation consistently identifies the signed local route as a broker to Ollama Cloud and incorporates that fact into disclosure, permission, and retention requirements. |
| **Provider documentation was not frozen with dates and digests.** | **Resolved conditionally.** | Stage two now requires dated snapshots and SHA-256 digests of the controlling provider materials. Those snapshots do not yet exist because written permission and preflight have not occurred. Their absence is therefore a pending activation gate, not permission to proceed. |
| **Revision chronology could imply retrospective preregistration.** | **Resolved.** | The text now describes this as a pre-registration revision and preserves the requirement to freeze before any outcome call. |
| **Potential dual-use or operational capability concern.** | **No adverse change.** | The study continues to use synthetic, abstract, non-deployable review material. It contains no real repository, person, credential, service, or target and adds no operational-evasion implementation. The benchmark code was unchanged and its exhaustive deterministic checks passed. |

## New blocking findings

None.

The absence of written Ollama permission is not treated as resolved evidence; it is an intentionally closed gate. Because the manifest still forbids automated access and outcome calls, this does not presently expose a participant, provider, or external system.

## New major findings

None.

## New minor finding

### MINOR-01 — Recorded package-lock hash is stale

`study.json` records:

```text
d18c4808497a007aba23a2ab12abc99e76a45e42b9c614f31b587e4aaf782553
```

The actual SHA-256 for `package-lock.json` at the reviewed commit is:

```text
40c4e9f2f102a185c80ca03974aff80d2b4c418d3b6e08a4264cc3fbb486c4f6
```

The lockfile change appears limited to project version metadata from 2.13.4 to 2.13.5; dependency resolution did not change. This is a reproducibility-record defect rather than an Ollama safety blocker. It should be corrected, or the deterministic baseline regenerated with disclosure, before freeze.

## Documented limitations and activation conditions

The following limitations remain material:

1. No written permission for automated Ollama access has been obtained. Approval of this correction cannot be construed as approval to access or activate Ollama.

2. The Ollama runner, queue, attempt ledger, no-prompt preflight, balance guard, response validator, and descriptive-analysis path do not yet exist. Their exact implementation and frozen hashes require fixture-only testing and another targeted review.

3. The records reviewed do not establish that Ollama exposes a reliable machine-readable zero-balance check. Provider assurance or another reviewable proof may be needed. If zero or disabled additional balance cannot be demonstrated at every required checkpoint, the arm must remain inactive.

4. Entitlement to the exact model, support for `think:false`, and the exact returned identity are unverified. Unsupported parameters, model substitution, reasoning leakage, or identity drift must suspend the arm.

5. Provider routing and hosted model aliases may change. The study must not infer base-model identity, open-weight equivalence, or provider/model superiority from the cloud label.

6. Provider terms and privacy materials were not refreshed during this correction review. Dated, hashed controlling documents remain required after permission and before activation.

7. The proposed AI-assisted post-outcome dual-use review must not upload raw output to an additional unapproved service. It should run locally, on appropriately redacted material, or under separately reviewed processing authority.

8. The replication remains a one-trial convenience comparison with calendar/platform confounding and no independent evidence that the review template itself is optimal. It must stay descriptive and visibly separate from confirmatory claims.

9. An AI-assisted review is not a substitute for human ethics, legal, provider-contract, or scientific peer review.

10. The stale package-lock hash must be reconciled before the preregistration is frozen.

## Final verdict

**APPROVE WITH DOCUMENTED LIMITATIONS**

The correction resolves the first-round AI-safety blockers at the governance level. The design is now ordered, explicit, and fail-closed: unavailable permission, billing assurance, reasoning suppression, model identity, implementation evidence, or review evidence leads to nonactivation rather than degraded collection.

This verdict approves the corrected conditional preregistration plan only. It does not approve Ollama automated access, subscription purchase, preflight, activation, outcome calls, OSF activity, or raw-output release. Those actions remain gated by written permission, action-time authorization, deterministic implementation evidence, another targeted review of the exact candidate, and final freeze.
