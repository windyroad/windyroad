## 1. Reviewer identity and scope

- Reviewer pseudonym: AI-METHODS-01.
- Review type: correction addendum, not a new independent review.
- Date: 2026-07-17, Australia/Sydney.
- Earlier reviewed commit: `6b607f6a83c5787de0b5c06abf7594cbb2769c68`.
- Earlier decision: `do not approve`.
- Current reviewed commit: `d3e1a0c9df424ab3d86ab2712e22284326420c6d`.
- Product identity: Codex desktop, GPT-5-based model family; exact serving variant was not exposed.
- I am an AI subagent orchestrated by author Tom Howard. I am not a human or independent peer reviewer, ethics body, or arXiv endorser.
- I made no repository edits and invoked neither Codex nor Claude Code on a benchmark prompt.

## 2. Conflicts and outcome-blindness

- I inspected my archived report at `reviews/2026-07-17-ai-methods-01.md` and the author resolution log at `reviews/resolution.md`.
- The resolution log summarizes findings from all three roles (`resolution.md:7-43`). Consequently, this correction review has lost the isolation claimed for the initial reviews and must not be represented as a new independent assessment.
- Provider, product, model-family, repository, prompt, and author-orchestration conflicts remain. The reviewer shares OpenAI/Codex and GPT-5-family provenance with one study system (`study.json:26-35`).
- No confirmatory LLM outcome was supplied or inspected. The corrected manifest remains unfrozen, unauthorized, and outcome-free (`study.json:3-7,21-25,336-360`).
- Only deterministic artifacts and fabricated plumbing responses were used.

## 3. Reproduction evidence

- A clean detached worktree resolved exactly to `d3e1a0c9df424ab3d86ab2712e22284326420c6d` and remained clean.
- The host provided Node `v24.16.0`; `.nvmrc:1` specifies Node 20. `npm ci` completed successfully.
- `npm test` passed: 24 test files, 148 tests passed, 2 skipped.
- The required exhaustive run passed: 2 test files and all 3 tests, including the full candidate hashes.
- Clean generation in a unique `mktemp` directory reproduced:

  - Full benchmark: 400 pairs, 800 cases, 12,800 prompts.
  - Full cards SHA-256: `a9b519bed69c3213767106d9fe8a02cfb311c3e5ee730bf22f14516c85788a31`.
  - Full prompts SHA-256: `59cbb3bca125b34aacfae7394982398d7b70da23cfabd9cd5f8b04506c2e066d`.
  - Active benchmark: 40 templates/pairs, 80 cases, 640 sequences, 1,280 boundaries.
  - Active cards SHA-256: `d4ea0a7197e3e8e17bf027b9466d63de427c273aa19e539a672732b80b5eae3d`.
  - Active prompts SHA-256: `e3359ebd8790be9aa81938533cfd6747f5b90043ae60810cf447a61d95c8dd6c`.
  - Schedule SHA-256: `e704e82c8c052cd05fdef8e2d19e8551e07617c537d81b52872d829d7e37ad1a`.
  - Call-ledger SHA-256: `01139eafb7541a840919be30607438c5a3b279303dea092d0a1a8203e1b02223`.
  - Ground-truth SHA-256: `b5d1cb531d7d5137c1e8153aabafdf1475528700ff529706b58c1e9553057773`.

  These match `study.json:82-89,289-319,336-360`.

- Balance was reverified: eight families, 40 selected templates, and indexes `1,7,13,19,25` in every family. The call ledger remains balanced at 640 boundaries per review system.
- The active local-only analysis now runs with seed `20260718`, produces 95% workflow and interaction intervals, and has no context interaction (`analyse.mjs:338-403,521-556`).
- Estimand-specific missingness bounds reproduced the required extrema: H1 favourable/unfavourable `1/0` and H2 favourable/unfavourable `-1/1` for the fabricated local-only case (`analyse.mjs:406-440,470-484`; regression coverage at `analyse.test.mjs:182-212`).
- The CLI successfully joined the replacement ground-truth ledger to 1,280 fabricated all-allow results and analyzed all 40 templates with seed `20260718` (`analyse.mjs:600-622`).
- Structural-template inference is now explicitly conditional on the 40 purposively selected templates, with lexical-instance and small-stratum limitations (`preregistration-v2.md:164-173`; `paper/paper.tex:290-300`).
- H1 power absence and convenience selection are explicitly disclosed (`study.json:61-68`; `preregistration-v2.md:97-101`; `paper/paper.tex:249-260`).
- The H2 detector is now directional (`design.mjs:318-325`). Re-running the stated 20,000-simulation audit, however, produced split-effect power `0.2577`, not the documented `0.2584`.

## 4. Blocking findings

- **METH-CB01 — Exploratory interaction inference still contains a prohibited decision.** The preregistration says workflow and interaction intervals are exploratory descriptions with no inferential decision (`preregistration-v2.md:32-34,131-136`), and the manuscript repeats that position (`paper/paper.tex:238-250`). Nevertheless, `confirmatoryAnalysis` returns `detected` based on whether the interaction interval excludes zero (`analyse.mjs:398-402`), and the test explicitly preserves that decision (`analyse.test.mjs:293-301`). Remove the decision field and test only the estimate and 95% interval.

- **METH-CB02 — The corrected directional power calculation does not reproduce the reported value.** `design.mjs:323` now applies the registered directional rule, resolving the earlier implementation finding. Under the documented 40 pairs, one trial, 20,000 simulations, and seed `20260718`, it produces `0.2577`. The manifest, preregistration, README, and manuscript still report `0.2584` (`study.json:61-68`; `preregistration-v2.md:99`; `README.md:102`; `paper/paper.tex:252-257`). Recompute and update the value everywhere, and add an exact active-power regression test; current tests only check determinism and valid ranges (`design.test.mjs:16-37`).

## 5. Major findings

- **METH-CM01 — The CLI omits the prespecified complete-pair sensitivity analysis.** The preregistration requires a review-system-specific complete-pair analysis (`preregistration-v2.md:134`), and the README says it is reported (`README.md:100`). The function and unit test exist (`analyse.mjs:443-468`; `analyse.test.mjs:214-253`), but the CLI emits only descriptive metrics and `confirmatoryMissingnessBounds` (`analyse.mjs:600-615`). Include `completePairSensitivity(outcomes)` in the executable analysis output so the registered sensitivity cannot be silently omitted.

- Original **METH-B02**, **METH-M02**, and **METH-M03** are otherwise resolved: missingness is estimand-specific, absence of H1 power is explicit, and inference is conditional on the purposively selected templates.

- Original **METH-M01** is resolved in prose through the explicit declaration that H1 and H2 are separate directional claims and not one multiplicity family (`preregistration-v2.md:136`). This does not provide familywise error control across the two claims and should not be described as doing so.

## 6. Minor findings

- **METH-Cm01 — Secondary descriptive bootstrap still defaults to the legacy seed.** `confirmatoryAnalysis` correctly defaults to `20260718` (`analyse.mjs:338-341`), but `descriptiveAnalysis` retains `20260716` (`analyse.mjs:175-178`) despite the plan’s general bootstrap seed of `20260718` (`preregistration-v2.md:123-125`). Align it before secondary intervals are reported.

- Original **METH-m01** is resolved: the active manifest is unfrozen and unauthorized (`study.json:3-6,359`), and the superseded collection entry point requires explicit `--legacy` use (`collection.mjs:390-402`).

- Original **METH-m03** is resolved through explicit convenience-selection language (`preregistration-v2.md:99,171`; `paper/paper.tex:252-257,290-295`).

## 7. Required manuscript limitations

The corrected limitations appropriately disclose:

- Convenience selection caused by subscriptions already held by the author.
- Conditional inference over 40 purposively selected diagonal templates.
- Coarse five-template-per-family bootstrap strata.
- One lexical instance per template.
- One trial per cell and inability to estimate stochastic consistency.
- Low workflow and interaction power, absence of H1 power analysis, and prohibition on equivalence claims.
- Product-level rather than isolated base-model effects.

These limitations should remain. Before freeze:

- Replace the obsolete H2 power value with the reproduced directional value or another independently reproducible corrected value.
- State explicitly that separate H1 and H2 claims do not imply familywise error control.
- Ensure no manuscript result language later converts the exploratory workflow or interaction intervals into “detected,” “significant,” “supported,” or equivalent decisions.

## 8. Decision

`do not approve`

Most initial methods findings were corrected, and all replacement artifact hashes reproduce. The earlier decision remains in force because the executable analysis still makes a prohibited interaction decision and the corrected directional power calculation contradicts every recorded value. The registered complete-pair sensitivity also remains absent from the CLI analysis path.

## 9. Stable signature

`AI-METHODS-01 | correction addendum | 2026-07-17 | prior 6b607f6a83c5787de0b5c06abf7594cbb2769c68: do not approve | current d3e1a0c9df424ab3d86ab2712e22284326420c6d: do not approve | Codex desktop / GPT-5 family`
