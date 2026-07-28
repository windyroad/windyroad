# AI-METHODS-01 two-phase freeze review

Exact commit: `70963a2249c7164e3afa52a7aa4dc00c1a2cc25a`
Parent: `caa3bf9b3f1d770a9aa0067a2f1eb678de517e14`

No files were edited and no provider, model, subscription, or OSF call was made.

## Verification evidence

- Prospective status is preserved: `study.json:3-7`, `registration-content-freeze.json:4-24`, and `execution-authorization.json:4-22` remain unfrozen, outcome-free, and unauthorized.
- The primary endpoint, review systems, design, confirmatory hashes, and complete conditional Ollama object are byte-equivalent to the parent commit.
- The five confirmatory hashes agree across the manifest, preregistration, manuscript, and phase-1 template:
  - Cards: `d4ea0a…e3d`
  - Prompts: `e3359e…dd6c`
  - Schedule: `e704e8…ad1a`
  - Calls: `01139e…223`
  - Ground truth: `b5d1cb…7773`
- The design remains 40 templates, 80 cases, 640 confirmatory sequences and 1,280 boundaries across exactly Codex and Claude. Ollama remains non-confirmatory, permission-pending, separately queued if activated, and unable to alter confirmatory inference (`preregistration-v2.md:93-104,140-155`).
- The branch decision occurs in phase 1 before OSF submission and outcomes; phase 2 must repeat the exact branch and queues (`preregistration-v2.md:205-219`).
- OSF metadata alone cannot authorize execution. The runner additionally requires an authorized phase-2 record, exact raw phase-1 hash, matching branch and queues, runtime-file hashes, and actual artifact hashes before creating output or starting preflight (`subscription-runner.mjs:94-110,197-233,235-346`).
- Full deterministic tests under available Node v24.16.0 passed: 26 files, 175 tests passed and 2 skipped. The focused freeze/analysis suite passed all 22 tests.

## Findings

### `METH-FRZ-m01`: Minor: activated-branch queue shape remains future implementation work

The confirmatory runner allowlists the two branch names and requires exact phase-1/phase-2 queue equality, but does not itself require `confirmatory-only` to contain exactly one queue or validate the future Ollama queue against the exploratory manifest (`subscription-runner.mjs:306-330`). A fabricated internally consistent `confirmatory-only` record containing an extra Ollama queue was accepted.

This does not contaminate the current confirmatory queue: its calls and all five hashes remain independently enforced, the shipped records are unauthorized, and no Ollama runner exists. Before an activated Ollama freeze, the required exact-candidate implementation and review should add branch-specific queue-shape validation and regression tests.

### `METH-FRZ-L01`: Documented limitation: OSF authenticity remains procedural

The runner proves internal hash consistency but does not query OSF. Authenticity therefore depends on the prescribed post-registration download and rehash step (`preregistration-v2.md:217-219`; `independent-review.md:171-174`). This review did not independently verify OSF state.

## Verdict

`approve with documented limitations`

The two-phase correction removes the circular freeze rule while preserving the prospective design, exact confirmatory estimand, hashes, conditional-arm isolation, and outcome-blind branch selection. Registration by itself remains insufficient to authorize outcomes, and phase-2 fields cannot change the frozen queues without detection.
