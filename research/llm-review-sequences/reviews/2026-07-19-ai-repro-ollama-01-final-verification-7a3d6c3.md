# AI-REPRO final narrow verification

Exact commit: `7a3d6c39552cb128914eeb6edb7c61426e0942ad`

Parent: `657ef18eb36661b4ab4a71b3f422760d07358440`

- Lock provenance is resolved: baseline-time `d18c480…` and current `40c4e9…` hashes are preserved separately and independently match.
- The 15 legacy API fields are exactly and exhaustively enumerated.
- Status and archive wording are consistent, including the distinction between substantive report bodies and platform metadata.
- One blocker remains: `subscription-runner.mjs` reads `study.frozen`, but `frozen` is absent from both authoritative-field lists. Therefore not every operational control used by the runner is explicitly declared current ([study.json](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/study.json:153), [subscription-runner.mjs](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/subscription-runner.mjs:184)).

## Final verdict

DO NOT APPROVE
