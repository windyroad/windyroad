# AI-assisted provider terms-parity assessment

- Date: 2026-07-19
- Scope: current official Ollama, Anthropic, and OpenAI terms plus first-party automation documentation
- Review state: pre-outcome worktree assessment; not an exact-commit attestation
- Disposition: documented-use basis adequate with a fail-closed provider-response override
- Blockers: none specific to obtaining an exceptional Ollama research waiver
- Legal status: operational terms assessment only; not legal advice or provider approval

## Question

Does the planned authenticated, sequential Ollama Cloud benchmark require a special research waiver when the study relies on first-party documented automation for Codex and Claude without provider-specific waivers?

## Evidence

Official sources were accessed on 2026-07-19.

- [Ollama Terms](https://ollama.com/terms) section 4 prohibits automated access without permission but does not define permission. Section 7 says users retain ownership of their content while withholding branding rights.
- [Ollama pricing](https://ollama.com/pricing) expressly advertises coding automation, CLI and API access, coding automation and deep research on Pro, and sustained agent tasks on Max. Usage is based primarily on GPU time, with session and weekly limits; a separately added extra-usage balance is drawn only after included usage.
- [Ollama Cloud documentation](https://docs.ollama.com/cloud), the [API introduction](https://docs.ollama.com/api/introduction), and [API authentication](https://docs.ollama.com/api/authentication) document programmatic cloud-model access, including signed-in calls through the local `/api/chat` surface.
- [Anthropic Consumer Terms](https://www.anthropic.com/legal/consumer-terms) prohibit automated or non-human access unless Anthropic otherwise explicitly permits it. The official [Claude Code CLI reference](https://docs.anthropic.com/en/docs/claude-code/cli-usage) expressly identifies print mode and JSON output for scripting and automation, and the [subscription guide](https://support.anthropic.com/en/articles/11145838-using-claude-code-with-your-pro-or-max-plan) includes Claude Code in Pro and Max.
- [OpenAI Terms of Use](https://openai.com/policies/terms-of-use/) prohibit automatic or programmatic extraction of output. The official [Codex non-interactive documentation](https://learn.chatgpt.com/docs/non-interactive-mode) expressly directs users to run `codex exec` in scripts and CI and pipe its output to other tools.

## Assessment

Apply one provider-neutral rule: first-party documentation expressly supporting automation through the intended authenticated product surface supplies the relevant permission for that documented use, absent a contrary provider restriction. The general restrictions are read as preventing scraping, harvesting, undocumented access, credential sharing, rate-limit circumvention, and other access outside the intended surface, not as disabling the providers' own documented automation features.

Under that rule, no exceptional Ollama research waiver appears necessary for the planned use. The study remains bounded to one no-prompt metadata preflight and, only after every later gate, up to 640 sequential synthetic defensive code-review requests with no concurrency, at least ten seconds between requests, included subscription usage only, no credentials or real targets, and no tools, persistence, destructive payloads, or deployment path.

The conclusion is an inference because Ollama's Terms do not expressly cross-reference its API documentation as the permission referenced by section 4. The pending human clarification is therefore useful but nonblocking. Any denial, narrower limit, or other contrary Ollama response overrides this assessment prospectively and causes suspension or non-activation.

Aggregate academic reporting is not prohibited and should use factual plain-text service and observed-model attribution without logos, endorsement, or branding claims. Any public raw-output subset still requires upstream-license review, post-outcome dual-use review, and no contrary provider restriction.

## Safety boundary

This assessment authorizes no preflight, purchase, implementation, OSF action, benchmark prompt, or model outcome. Plan entitlement, model identity, fixed-fee approval, zero or disabled extra-usage balance, fixture-only implementation, targeted exact-commit review, branch selection, OSF registration, and detached execution authorization remain separate gates.
