# Ollama Finding-Specific Safety Verification

## Exact commit and scope

- **Commit:** `657ef18eb36661b4ab4a71b3f422760d07358440`
- **Parent:** `7937e1eb8cd11b386aa0a1fe419c560eeb45bb20`
- **Scope:** Only the requested post-review corrections.
- **External activity:** None. No provider/model calls, automated Ollama access, or OSF access.

The commit remains fail-closed: `frozen` is false, and the Ollama arm records both automated access and outcome calls as unauthorized in [study.json](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/study.json:94).

## Prior minor-finding dispositions

| Finding | Disposition | Evidence |
|---|---|---|
| Stale package-lock hash | **Resolved.** | The current file and the exact commit blob both hash to `40c4e9f2f102a185c80ca03974aff80d2b4c418d3b6e08a4264cc3fbb486c4f6`, matching [study.json](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/study.json:434). |
| Ambiguous model-record canonicalization | **Resolved at the protocol level.** | The complete matching `/api/tags` JSON record now uses RFC 8785 JSON Canonicalization Scheme before SHA-256, while the public model page explicitly uses raw-byte SHA-256. This distinction appears consistently in [preregistration-v2.md](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/preregistration-v2.md:75), [independent-review.md](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/independent-review.md:118), and `study.json`. Implementation and fixtures remain a future activation gate. |
| Returned-model check incorrectly described as pre-batch | **Resolved.** | Pre-batch checks now cover account, plan, entitlement, versions, model record, API-key absence, and balance. Exact returned identity is checked on every response before scoring or durable acceptance in [study.json](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/study.json:116). |
| `OLLAMA_API_KEY` absence not explicitly rechecked | **Resolved at the protocol level.** | Machine-verified absence is now required before every initial or resumed batch in [preregistration-v2.md](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/preregistration-v2.md:77) and [study.json](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/study.json:108). No runner exists yet, so implementation verification remains mandatory before activation. |
| Legacy fields could be treated as active | **Resolved.** | [study.json](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/study.json:153) and the README identify only `active_subscription_design` and `exploratory_ollama_cloud_replication` as authoritative current-design fields. |

The appended dispositions in [resolution.md](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/reviews/resolution.md:128) accurately describe these substantive corrections and continue to state that no Ollama activation or outcome collection is authorized.

## New blocker

None.

## New minor documentation limitations

1. **Status records are internally stale.** The top-level status correctly says the three correction reviews were approved with limitations and this finding-specific verification was pending at the reviewed commit. However, `preregistration_v2_draft.status` still says `targeted-correction-review-pending`, its blocker list still asks for those already archived reports, and the resolution header still says repeat review is awaited. See [study.json](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/study.json:465) and [resolution.md](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/reviews/resolution.md:3). These conservative inconsistencies cannot authorize access, but should be reconciled before freeze.

2. **“Verbatim” is not strictly byte-for-byte accurate for the safety report.** The archived [safety report](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/reviews/2026-07-19-ai-safety-ollama-01-correction-7937e1e.md:1) matches the substantive review body through its final paragraph. The delivered response also contained a trailing platform memory-citation block, which the archive omits. That omission does not alter any finding or verdict, but [resolution.md](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/reviews/resolution.md:122) should say “substantive report bodies are archived verbatim” if strict archival identity is intended without exposing local platform metadata.

## Final verdict

**APPROVE WITH DOCUMENTED LIMITATIONS**

The requested safety-relevant corrections are substantively resolved, and no new activation blocker was introduced. This approves only the permission-pending preregistration documentation. It does not authorize Ollama access, purchase, preflight, implementation, outcome collection, OSF activity, or raw-output release.
