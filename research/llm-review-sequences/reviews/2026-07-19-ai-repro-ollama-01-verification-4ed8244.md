# AI-REPRO finding verification

Exact commit: `4ed8244e8ae4933f3cb1df8f7db617f13118a0f8`

Parent: `7a3d6c39552cb128914eeb6edb7c61426e0942ad`

- `frozen`, `frozen_at`, `freeze_scope`, `ecological_layer`, and `preregistration_v2_draft` are explicitly current operational controls; `active_subscription_design` is explicitly current design ([study.json](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/study.json:153)).
- Every manifest field read by [subscription-runner.mjs](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/subscription-runner.mjs:181) appears in the applicable authoritative list; none are omitted.
- Baseline-time `d18c480…` and current `40c4e9…` lock hashes remain separate and match their respective files.
- Only manifest status/schema and review records changed. Runtime, design, hashes, queues, and authorization values are unchanged; all collection flags remain false and the OSF identifier remains null.
- No new blocker found.

## Final verdict

APPROVE WITH DOCUMENTED LIMITATIONS
