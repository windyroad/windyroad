# AI-REPRO finding-specific verification

- Exact commit: `657ef18eb36661b4ab4a71b3f422760d07358440`
- Parent: `7937e1eb8cd11b386aa0a1fe419c560eeb45bb20`
- Read-only checks: exact clean `HEAD`, `git diff --check`, JSON parsing, SHA-256 calculation, and targeted static inspection. No provider, model, Ollama, subscription, or OSF call occurred.

| Finding | Disposition |
|---|---|
| RFC 8785/raw-byte hashing | Resolved. The complete matching `/api/tags` record now uses RFC 8785 before SHA-256, while the public model page uses raw-byte SHA-256 ([study.json](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/study.json:112)). |
| Returned-model timing | Resolved. Metadata and billing checks occur before each initial/resumed batch; returned identity is checked per response before scoring or durable acceptance ([study.json](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/study.json:116)). |
| Repeated API-key guard | Resolved. `OLLAMA_API_KEY` absence is machine-checked before every batch/resume ([study.json](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/study.json:108)). |
| Current lockfile hash | Byte match confirmed: `40c4e9f2f102a185c80ca03974aff80d2b4c418d3b6e08a4264cc3fbb486c4f6` ([study.json](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/study.json:434)). However, the prior finding is not fully resolved: this field belongs to a baseline collected with historical hash `d18c480…`; no rerun or historical relabelling occurred. Replacing the value records the current lockfile, not the collection-time lockfile. |
| Status/resolution | The top-level state remains accurately fail-closed and finding-verification/permission/OSF pending ([study.json](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/study.json:3), [resolution.md](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/reviews/resolution.md:120)). |
| Archived report | Verified verbatim against this reviewer’s prior task response, including its three minor findings and scoped permission-pending verdict ([archived report](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/reviews/2026-07-19-ai-repro-ollama-01-correction-7937e1e.md:1)). |

## New blocker

The new authoritative-field rule is contradicted by the executable runner. The manifest declares only `active_subscription_design` and `exploratory_ollama_cloud_replication` authoritative and prohibits runners from interpreting the following legacy fields as active ([study.json](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/study.json:153)). Nevertheless, `assertAuthorizedArtifacts` still obtains collection authorization from `ecological_layer.subscription_calls_authorized` and the OSF identifier from `preregistration_v2_draft.external_identifier` ([subscription-runner.mjs](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/subscription-runner.mjs:181)).

Consequently, the resolution log’s claim that legacy-field ambiguity is resolved is not yet true. Move the authorization and registration state into an authoritative current object and update its consumer before review completion. Preserve the baseline’s collection-time lock hash or rerun and timestamp the baseline.

## Final verdict

DO NOT APPROVE
