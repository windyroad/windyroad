## 1. Reviewer identity and scope

- Correction-review addendum by **AI-REPRO-01**, dated **2026-07-17 (Australia/Sydney)**.
- Earlier reviewed commit: **`6b607f6a83c5787de0b5c06abf7594cbb2769c68`**; earlier decision: **do not approve**.
- Current correction commit: **`d3e1a0c9df424ab3d86ab2712e22284326420c6d`**.
- Identity exposed: **OpenAI Codex AI subagent, GPT-5 family; exact serving-model version not exposed**.
- I am an AI subagent orchestrated by author Tom Howard. I am not a human or independent peer reviewer, ethics body, or arXiv endorser.
- This is a correction review, not a new independent review. I inspected the archived AI-REPRO-01 report and the combined author resolution log. I did not edit repository files or send any benchmark prompt to Codex or Claude Code.

## 2. Conflicts and outcome-blindness

- The author selected the correction commit, review scope, and orchestration.
- I share OpenAI/Codex provider and model-family provenance with one system under study.
- I inspected `research/llm-review-sequences/reviews/resolution.md`, which summarizes findings and dispositions from all three initial roles (`research/llm-review-sequences/reviews/resolution.md:7-43`). This correction review therefore lacks the initial round’s cross-reviewer isolation.
- I did not inspect the other reviewers’ raw reports, but the resolution log exposed their findings and author responses.
- No confirmatory LLM outcome was supplied, generated, or inspected. Only deterministic generators, no-prompt authentication checks, and fabricated runner responses were used. The declared pre-outcome state remains at `research/llm-review-sequences/study.json:3-7` and `research/llm-review-sequences/paper/paper.tex:262-267`.

## 3. Reproduction evidence

- A clean detached worktree was created at the current full commit and remained clean.
- `npm ci` completed successfully.
- The standard suite passed under Node `24.16.0`: **24 test files; 148 passed; 2 skipped**.
- The required exhaustive command passed: **2 test files; 3 tests passed**, including full candidate hash reproduction. The corrected commands now include `npm ci`, the exhaustive gate, and a unique `mktemp` root (`research/llm-review-sequences/independent-review.md:25-41`; `research/llm-review-sequences/README.md:31-51`).
- Clean regeneration produced the replacement full-corpus values:

  - 400 scenario pairs and 800 cases.
  - Cards SHA-256 `a9b519bed69c3213767106d9fe8a02cfb311c3e5ee730bf22f14516c85788a31`.
  - 12,800 prompts.
  - Prompts SHA-256 `59cbb3bca125b34aacfae7394982398d7b70da23cfabd9cd5f8b04506c2e066d`.
  - Maximum request size 3,606 bytes.

  These match `research/llm-review-sequences/study.json:300-317`.

- The active subset reproduced:

  - 40 templates, 40 pairs, 80 cases, 640 prompts, 640 sequences, and 1,280 calls.
  - Cards SHA-256 `d4ea0a7197e3e8e17bf027b9466d63de427c273aa19e539a672732b80b5eae3d`.
  - Prompts SHA-256 `e3359ebd8790be9aa81938533cfd6747f5b90043ae60810cf447a61d95c8dd6c`.
  - Schedule SHA-256 `e704e82c8c052cd05fdef8e2d19e8551e07617c537d81b52872d829d7e37ad1a`.
  - Calls SHA-256 `01139eafb7541a840919be30607438c5a3b279303dea092d0a1a8203e1b02223`.
  - Ground-truth SHA-256 `b5d1cb531d7d5137c1e8153aabafdf1475528700ff529706b58c1e9553057773`.
  - Maximum request size 2,941 bytes.

  Every value matched `research/llm-review-sequences/study.json:46-59,82-89,336-359`, `research/llm-review-sequences/preregistration-v2.md:76-87,175-185`, and `research/llm-review-sequences/paper/paper.tex:324-335`.

- The no-prompt runner preflight succeeded using explicit absolute paths. It verified Codex CLI `0.137.0` with ChatGPT authentication and Claude Code `2.1.211` with `claude.ai` Max authentication. `OPENAI_API_KEY`, `CODEX_API_KEY`, and `ANTHROPIC_API_KEY` were absent. Exact path, version, and authentication checks are implemented at `research/llm-review-sequences/subscription-runner.mjs:19-45`.
- The runner now creates a fresh synchronous process per boundary, parses structured output, validates the schema, records usage/model/tool metadata, and fsyncs append-only attempt and result records (`research/llm-review-sequences/subscription-runner.mjs:78-181`). Its four committed fabricated-response tests passed (`research/llm-review-sequences/subscription-runner.test.mjs:12-100`).
- The legacy collection entry point now exits unless passed explicit `--legacy` (`research/llm-review-sequences/collection.mjs:390-407`). A direct check returned exit 1 as intended.
- The active manifest is now unambiguously unfrozen and unauthorized (`research/llm-review-sequences/study.json:3-6,336-359`).
- Package versions now agree at `2.13.4` (`package.json:1-4`; `package-lock.json:1-10`).
- The pinned two-pass TeX build reproduced the committed six-page PDF byte-for-byte:

  - Source SHA-256 `fa92b6e820c4d4c6e62ecfdb2f258ea36712b1d172cdf5ef3d4e3b7722c70da5`.
  - PDF SHA-256 `a5c99e1843ccfe675b444bb0288478d525555215406f4faf6dbea518db37d8d0`.

  These match `research/llm-review-sequences/paper/BUILD.md:3-22`. Visual inspection of all six rendered pages found no clipping, overlap, broken tables, or unreadable text.
- OSF and arXiv identifiers remain pending as intended (`research/llm-review-sequences/study.json:398-410`; `research/llm-review-sequences/README.md:131-139`). No submission was attempted.

## 4. Blocking findings

- **AI-REPRO-01-CB01 — Rate-limit suspensions become missing outcomes after three resumes.** Each rate-limited run writes a `started` record and increments the same counter used for retry exhaustion (`research/llm-review-sequences/subscription-runner.mjs:99-123,153-159`). On the fourth invocation, the runner writes `status: "missing", reason: "three_attempts_exhausted"` without making a call (`research/llm-review-sequences/subscription-runner.mjs:110-115`). A fabricated four-run check reproduced this behavior. It directly contradicts the rule that subscription limits are scheduling constraints, not missing outcomes (`research/llm-review-sequences/preregistration-v2.md:89-95`). Prior finding **AI-REPRO-01-M03 remains unresolved**. Rate-limit suspensions must not consume the infrastructure-attempt ceiling.

- **AI-REPRO-01-CB02 — Returned-model changes within an accepted alias are not detected.** The runner checks only whether each returned string contains `gpt-5.5` or `sonnet` (`research/llm-review-sequences/subscription-runner.mjs:143-166`). It stores no per-system baseline identity for comparison across calls. A fabricated schedule returning `claude-sonnet-4-6` and then `claude-sonnet-5-0` completed both calls as valid. This contradicts the manifest and manuscript requirement to suspend on a returned-model identity change (`research/llm-review-sequences/study.json:77-78`; `research/llm-review-sequences/paper/paper.tex:191-196`). Prior finding **AI-REPRO-01-B01 remains partially unresolved**.

- **AI-REPRO-01-CB03 — The runner does not enforce authorization or frozen-artifact integrity.** The manifest correctly says collection is unauthorized (`research/llm-review-sequences/study.json:3-6,357-359`), and the README says to run only after OSF registration (`research/llm-review-sequences/README.md:70-80`). However, `collectSubscriptionSchedule` accepts arbitrary benchmark and collection directories, performs only client preflight, and begins calls without reading the manifest, requiring `subscription_calls_authorized`, or comparing prompt/call hashes (`research/llm-review-sequences/subscription-runner.mjs:78-125`). Its CLI entry point exposes that path directly (`research/llm-review-sequences/subscription-runner.mjs:196-218`). Fabricated execution succeeded while the manifest was unauthorized. The runner must deterministically refuse collection until active authorization is true and the frozen artifacts match the registered hashes.

- Prior **AI-REPRO-01-B02 is resolved**: exact absolute executable paths, client versions, and subscription authentication are verified before calls (`research/llm-review-sequences/subscription-runner.mjs:22-45`).
- The manifest-state portion of prior **AI-REPRO-01-B03 is resolved**, but CB03 above shows that the state is not enforced by the executable runner.

## 5. Major findings

- **AI-REPRO-01-CM01 — The documented Node version is insufficiently pinned.** The README claims support for “Node 20” (`research/llm-review-sequences/README.md:51`) and `.nvmrc:1` contains only `20`. Under available Node `20.13.1`, `npm test` failed during Vite configuration loading. The lockfile requires Node `^20.19.0` for Vite and the React plugin (`package-lock.json:4220-4235,28633-28652`). Pin Node `20.19.x` or document the exact minimum. Thus prior **AI-REPRO-01-M01 is only partially resolved**: dependency installation and temporary-directory isolation are fixed, but the supported runtime is not reproducibly specified.

- **AI-REPRO-01-CM02 — The claimed 100-consecutive-infrastructure-failure rule is not implemented.** The preregistration and manuscript retain this suspension condition (`research/llm-review-sequences/preregistration-v2.md:91-95`; `research/llm-review-sequences/paper/paper.tex:211-217`), but the runner has no cross-call infrastructure-failure counter. It suspends immediately on each client error and later converts the current call to missing after three starts (`research/llm-review-sequences/subscription-runner.mjs:99-115,153-159`). Either implement the registered counter consistently with resumable state or remove the claim prospectively.

- Prior **AI-REPRO-01-M02 is resolved** by the explicit legacy gate at `research/llm-review-sequences/collection.mjs:390-407`.
- Prior **AI-REPRO-01-M04 is resolved as a pre-registration gate**: the deterministic manuscript build and checksums reproduce, while OSF/arXiv identifiers remain correctly pending.
- The manuscript’s earlier premature internal-review wording is corrected at `research/llm-review-sequences/paper/paper.tex:308-322`.

## 6. Minor findings

- Prior **AI-REPRO-01-m01 is resolved**: package and lockfile versions agree.
- Prior **AI-REPRO-01-m02 is resolved** in the manuscript: it accurately identifies the initial commit, decisions, archived reports, and repeat-review status (`research/llm-review-sequences/paper/paper.tex:308-322`).
- **AI-REPRO-01-Cm01 — The preregistration does not distinguish the correction review from the isolated initial reviews.** It still says three isolated subagents review the same frozen packet (`research/llm-review-sequences/preregistration-v2.md:146-150`). The current packet is unfrozen, and correction reviewers may inspect the combined resolution log. Record the initial isolated round and non-isolated correction round separately.
- **AI-REPRO-01-Cm02 — The manuscript build instructions omit the final copy step.** The documented commands produce `paper.pdf` in the mounted source directory, while the recorded checksum refers to `output/pdf/paper.pdf` (`research/llm-review-sequences/paper/BUILD.md:3-22`). Add the deterministic copy/check command used to place the verified PDF in its release location.

## 7. Required manuscript limitations

The existing convenience-selection, model-routing, product-surface, and AI-review limitations at `research/llm-review-sequences/paper/paper.tex:252-260,284-313` should remain. The final manuscript must additionally state:

- Correction reviews were not isolated from the other roles’ findings because reviewers could inspect the combined resolution log.
- “Zero additional spend” depends on existing paid account entitlements and does not mean the experiment is cost-free for an independent reproducer.
- Collection across subscription reset windows spans calendar time and can introduce platform-drift or time-order effects despite randomized scheduling.
- Requested aliases and client versions do not uniquely identify the served model; drift claims are limited by whatever returned-model metadata each product exposes.
- Rate-limit suspensions are scheduling events rather than outcome missingness. This limitation must match corrected runner behavior before collection.

## 8. Decision

**do not approve**

The replacement artifacts and hashes reproduce; absolute client preflight, durable ledgers, legacy gating, manifest state, manuscript build, package metadata, and current manuscript wording are materially improved. Approval remains blocked because the runner converts repeated rate limits into missing outcomes, fails to detect returned-model changes, and does not enforce the unfrozen/unauthorized artifact gate.

## 9. Stable signature

`AI-REPRO-01 correction addendum | OpenAI Codex AI subagent (GPT-5 family; exact serving model undisclosed) | 2026-07-17 Australia/Sydney | prior 6b607f6a83c5787de0b5c06abf7594cbb2769c68: do not approve | current d3e1a0c9df424ab3d86ab2712e22284326420c6d: do not approve`
