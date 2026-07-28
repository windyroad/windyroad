# Safety and Responsible-Release Review

- **Exact commit:** `70963a2249c7164e3afa52a7aa4dc00c1a2cc25a`
- **Parent:** `caa3bf9`
- **Scope:** OSF payload safety, provenance binding, and execution authorization.
- **External activity:** None. No OSF, provider, model, subscription, or account call was made.

## Findings

### SAFETY-OSF-B01: Blocker: release-safe bundle contents are not enforced

The preregistration promises to exclude executable benchmark cases and both detached state records from the OSF payload at [preregistration-v2.md](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/preregistration-v2.md:209). However:

- [registration-content-freeze.json](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/registration-content-freeze.json:13) records only an opaque filename and whole-file hash, with no member inventory or allowlist.
- The runner merely reads and hashes those bytes at [subscription-runner.mjs](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/subscription-runner.mjs:209); it never inspects archive entries.
- The passing fixture writes arbitrary text called `registration-payload.tar.gz` at [subscription-runner.test.mjs](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/subscription-runner.test.mjs:410). No test rejects benchmark cases, detached authorization, results, reasoning traces, secrets, or raw outputs inside the bundle.
- No deterministic payload builder, content manifest, or actual bundle exists.

Consequently, an unsafe bundle could be hashed, recorded, and accepted. The requested exclusions and sensitive-content boundary cannot presently be verified.

Before freeze, use a deterministic allowlisted builder and bind an archive-member manifest containing paths, byte hashes, sizes, and media types. Validate it before upload and after download, rejecting unexpected entries, links, traversal, executable cases, both detached records, credentials/account state, attempts/results, reasoning traces, and raw outputs.

### SAFETY-AUTH-B02: Blocker: the Ollama-enabled branch is not bound to written permission

The manifest correctly records written permission as absent at [study.json](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/study.json:93). However, the runner accepts `confirmatory-plus-ollama-exploratory` based only on the branch string at [subscription-runner.mjs](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/subscription-runner.mjs:306).

It does not require:

- `written_permission_received: true`;
- a frozen permission-response hash and approved scope;
- completed Ollama activation review;
- an exact Ollama queue; or
- Ollama-specific authorization fields.

Indeed, only the confirmatory queue is mandatory at lines 312-330. Thus a nominal Ollama-enabled branch can pass without evidence that its prerequisite branch decision was valid. No Ollama runtime exists yet, so this commit cannot currently make an Ollama call, but the authorization protocol does not enforce the claimed future safety condition.

### SAFETY-OSF-M01: Major: OSF registration is locally asserted, not evidenced

The runner validates only the shape of an OSF ID, URL, and timestamps at [subscription-runner.mjs](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/subscription-runner.mjs:260). Its passing test uses the fabricated value `osf-test-id` at [subscription-runner.test.mjs](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/subscription-runner.test.mjs:335).

Therefore, matching locally authored JSON can satisfy the runner without evidence that the OSF registration or download verification occurred. Bind a downloaded OSF registration export or file inventory and its hash into the authorization record, with explicit action-time author confirmation.

### SAFETY-AUTH-m01: Minor limitation: standalone preflight is outside the gate

The collection path authorizes before creating output or running client preflight, which is correct. However, the standalone `--preflight` path directly launches Codex and Claude version/authentication commands at [subscription-runner.mjs](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/subscription-runner.mjs:401).

This sends no benchmark prompt and invokes no review model. If “provider call” includes potentially provider-facing authentication-status checks, the protocol should either gate that path or explicitly distinguish permitted no-prompt subscription checks from prohibited inference calls.

## Verified protections

- Current state is fail-closed: `study.frozen` is false; the content-freeze template is unfrozen and cannot authorize calls; the execution record is unauthorized with no queues.
- The default-gate test confirms rejection occurs before output creation, preflight, or review execution at [subscription-runner.test.mjs](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/subscription-runner.test.mjs:115).
- Runtime and generator provenance can be bound without uploading case bytes through the content commit, runtime-file hashes, and five generated-artifact hashes. The runner recomputes the runtime and artifact bytes at [subscription-runner.mjs](/Users/tomhoward/Projects/windyroad/research/llm-review-sequences/subscription-runner.mjs:211).
- No result, attempt, JSONL, registration archive, raw output, or credential-like secret was found in the current study tree or commit diff. The detached templates contain public author identity only, not account credentials or tokens.
- `git diff --check` passed, and all 11 focused runner tests passed under Node.js 22.17.1. The documented Node.js 20.19.0 runtime was unavailable.

## Verdict

do not approve

The two-phase concept is directionally sound and currently fail-closed, but the release packet’s safety boundary is only prose, and the permission-dependent Ollama branch is not mechanically bound to written permission. Both blockers must be resolved before an OSF freeze or execution authorization.
