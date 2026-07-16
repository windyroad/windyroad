# 1. Reviewer identity and scope

- Correction reviewer: `AI-SAFETY-01`.
- Date: 2026-07-17, Australia/Sydney.
- Earlier reviewed commit and decision: `6b607f6a83c5787de0b5c06abf7594cbb2769c68` — `do not approve`.
- Current reviewed commit: `d3e1a0c9df424ab3d86ab2712e22284326420c6d`.
- This is a correction review, not a new independent review.
- Identity: OpenAI Codex desktop AI subagent, GPT-5 family; exact serving-model identifier was not exposed.
- I was orchestrated by author Tom Howard. I am not a human, independent peer reviewer, ethics body, or arXiv endorser.
- I rechecked the complete AI-SAFETY-01 scope at `research/llm-review-sequences/independent-review.md:57-70`, every prior safety finding, and the replacement artifacts.
- No files were edited. No Codex or Claude Code process was invoked on a benchmark prompt.

# 2. Conflicts and outcome-blindness

- I retain the earlier shared-author, shared-prompt, shared-repository, automation, and OpenAI/Codex provider/model-family conflicts. The evaluated Codex configuration is recorded at `research/llm-review-sequences/study.json:27-35`.
- I inspected my archived report and the author’s resolution log. The log summarizes findings from every review role at `research/llm-review-sequences/reviews/resolution.md:7-43`; consequently, this correction review has lost the initial review’s isolation from the other roles.
- I did not inspect confirmatory LLM responses. The manifest remains unfrozen and records no confirmatory outcomes at `research/llm-review-sequences/study.json:3-7`, `research/llm-review-sequences/study.json:21-25`, and `research/llm-review-sequences/study.json:336-340`.
- The resolution log likewise states that no benchmark prompt has been submitted at `research/llm-review-sequences/reviews/resolution.md:1-5`.

# 3. Reproduction evidence

- I used a detached local clone at `/tmp/windyroad-safety-review-d3e1a0c9`, verified `HEAD` as `d3e1a0c9df424ab3d86ab2712e22284326420c6d`, and verified an empty tracked status.
- Under Node `v22.17.1` and npm `10.9.2`, a fresh `npm ci` succeeded. `npm test` passed 148 tests with two skips. The required exhaustive command passed all three benchmark/ecological tests.
- Clean regeneration in a unique temporary directory produced:

  - Full benchmark: 400 scenario pairs, 800 cases, 12,800 prompts, maximum request 3,606 bytes; cards SHA-256 `a9b519bed69c3213767106d9fe8a02cfb311c3e5ee730bf22f14516c85788a31`; prompts SHA-256 `59cbb3bca125b34aacfae7394982398d7b70da23cfabd9cd5f8b04506c2e066d`.
  - Active benchmark: 40 templates/pairs, 80 cases, 640 prompts, maximum request 2,941 bytes; cards SHA-256 `d4ea0a7197e3e8e17bf027b9466d63de427c273aa19e539a672732b80b5eae3d`; prompts SHA-256 `e3359ebd8790be9aa81938533cfd6747f5b90043ae60810cf447a61d95c8dd6c`.
  - Collection: 640 sequences and 1,280 calls; schedule SHA-256 `e704e82c8c052cd05fdef8e2d19e8551e07617c537d81b52872d829d7e37ad1a`; calls SHA-256 `01139eafb7541a840919be30607438c5a3b279303dea092d0a1a8203e1b02223`; ground-truth SHA-256 `b5d1cb531d7d5137c1e8153aabafdf1475528700ff529706b58c1e9553057773`.

  These match `research/llm-review-sequences/study.json:82-89`, `research/llm-review-sequences/study.json:313-317`, and `research/llm-review-sequences/study.json:336-359`.

- The same deterministic regeneration hashes reproduced under Node `v20.13.1`.
- I re-audited all eight constructors at `research/llm-review-sequences/benchmark.mjs:304-659`, both intents in all 40 selected family/index cells, all 80 cases, and all 640 native requests.
- All 80 cases passed oracle polarity, atomic/split final-tree equality, changed-line equality, paired changed-line matching, and safety assertions enforced at `research/llm-review-sequences/benchmark.mjs:128-159`.
- All 120 selected malicious step-removal counterfactuals were safe. Counterfactual construction remains at `research/llm-review-sequences/benchmark.mjs:194-224`.
- No request contained a forbidden ground-truth key or exact `malicious`/`benign` intent value. The call ledger retained only `call_id`, `schedule_index`, `prompt_id`, `case_id`, `model`, and `trial`, consistent with the separation at `research/llm-review-sequences/collection.mjs:42-93`.
- All rendered titles are now neutral, using `change: update synthetic ...` at `research/llm-review-sequences/benchmark.mjs:226-234` and `research/llm-review-sequences/benchmark.mjs:790-794`. The pull-request description is neutral at `research/llm-review-sequences/ecological.mjs:101-114`.
- A conservative output scan found no network, filesystem, process, credential, persistence, destructive, deployment, or dynamic-execution indicator in the 2,400 generated case modules.

# 4. Blocking findings

- `B-01-R1 — The prior operational-evasion blocker is not fully resolved in the public source.` The generated cards and native artifacts now use neutral titles, but `benchmark.mjs` still contains all 24 original plausible `refactor:` cover-story strings. Examples include “centralize capability extras,” “reuse capability expansion,” and “apply expansion consistently” at `research/llm-review-sequences/benchmark.mjs:324-352`; corresponding narratives remain for normalization at `research/llm-review-sequences/benchmark.mjs:374-396`, fail-open fallback at `research/llm-review-sequences/benchmark.mjs:423-445`, integrity bypass at `research/llm-review-sequences/benchmark.mjs:458-474`, scope widening at `research/llm-review-sequences/benchmark.mjs:503-531`, feature defaults at `research/llm-review-sequences/benchmark.mjs:557-578`, provenance at `research/llm-review-sequences/benchmark.mjs:598-620`, and dependency substitution at `research/llm-review-sequences/benchmark.mjs:643-659`. They are merely discarded through the `_message` parameter at `research/llm-review-sequences/benchmark.mjs:790-794`.
- Because `benchmark.mjs` is itself a proposed public artifact, neutralizing only the rendered value does not remove the cover-story guidance from release. This contradicts the resolution log’s statement that the narratives “were removed” at `research/llm-review-sequences/reviews/resolution.md:7-10` and the manuscript’s corresponding claim at `research/llm-review-sequences/paper/paper.tex:314-316`.
- The documented low-capability basis is otherwise credible: the fixed corpus has no target, credential, deployment path, external capability, or complete exploit, as disclosed at `research/llm-review-sequences/preregistration-v2.md:156-160`. Retaining the abstract constructors can therefore be justified with documented limitations, but retaining the obsolete plausible cover-story arguments is unnecessary for reproducibility and leaves the prior blocker unresolved.

# 5. Major findings

- `M-01 and M-02 — Resolved.` The safety claim now rests on fixed-corpus inspection, oracle execution, relative-import restrictions, and output audit; the regex scanner is correctly described as defense in depth rather than a general proof. The trusted generator/harness capability is explicitly distinguished at `research/llm-review-sequences/README.md:25-29`, `research/llm-review-sequences/preregistration-v2.md:156-160`, and `research/llm-review-sequences/paper/paper.tex:134-138`.
- `M-03-R1 — One unqualified independence claim remains.` Active safety fields now use “AI-assisted internal review” at `research/llm-review-sequences/study.json:460-471`, but the manifest still says “independent benchmark and simulation review” at `research/llm-review-sequences/study.json:289-319`. Because that object contains current replacement hashes and is labelled a candidate rather than explicitly historical, it can still imply independent validation. Mark that wording as legacy or replace it with “AI-assisted internal review.”
- `M-04 — Correction-review non-isolation is not yet documented in the study artifacts.` The preregistration still describes the review process simply as three isolated subagents at `research/llm-review-sequences/preregistration-v2.md:146-150`. That is accurate for the initial round but not for these correction reviews, whose reviewers may inspect the cross-role resolution log. The final record should distinguish the isolated initial reviews from non-isolated correction addenda.

# 6. Minor findings

- `m-01 — Resolved.` The required protocol now explicitly runs the exhaustive benchmark tests at `research/llm-review-sequences/independent-review.md:25-41`.
- `m-02-R1 — The Node requirement remains underspecified.` The README states only “Node 20” at `research/llm-review-sequences/README.md:40-51`, and `.nvmrc:1` contains `20`. The available Node `20.13.1` reproduced the generator hashes but could not start Vitest after `npm ci`; multiple locked dependencies require at least Node `20.19.0`, including entries at `package-lock.json:72-99` and `package-lock.json:691-811`. Record an exact minimum such as Node `>=20.19.0 <21`, or pin a tested Node 20 release.

# 7. Required manuscript limitations

- Retain the fixed-corpus, defense-in-depth scanner limitation and the distinction between generated cases and trusted generator/oracle tooling at `research/llm-review-sequences/paper/paper.tex:134-138`.
- Retain the disclosure that the abstract composition patterns have dual-use value and that the packet has no real target, external capability, credential, deployment path, or complete exploit at `research/llm-review-sequences/paper/paper.tex:302-316`.
- Remove the unused plausible cover-story strings from the public constructor source; neutral rendered titles alone are insufficient while those strings remain readable.
- State that initial reviews were isolated, while correction addenda inspected the archived report and cross-role resolution log and therefore are not isolated or independent validation.
- Continue to state that all reviews are author-orchestrated AI-assisted internal review, not human peer review, ethics approval, or arXiv endorsement.

# 8. Decision

`do not approve`

The replacement corpus, hashes, invariants, blinding, capability boundary, scanner language, and trusted-tooling distinction reproduce and are materially improved. The low-capability rationale can support retaining the abstract constructors with explicit dual-use limitations. Approval remains blocked because the public generator still contains the exact plausible cover-story narratives that the correction claims to have removed.

# 9. Stable signature

`AI-SAFETY-01 correction addendum | OpenAI Codex desktop AI subagent, GPT-5 family, exact serving model not exposed | 2026-07-17 | prior 6b607f6a83c5787de0b5c06abf7594cbb2769c68: do not approve | current d3e1a0c9df424ab3d86ab2712e22284326420c6d: do not approve`
