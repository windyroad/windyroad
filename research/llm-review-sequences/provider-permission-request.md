# Ollama Cloud research permission request

Status: sent; written response pending. This outbound request is not provider permission and authorizes no automated access, purchase, preflight, or outcome call.

- Sent: 2026-07-19T02:28:25+10:00
- From: Tom Howard, `tom@windyroad.com.au`
- To: Ollama team, `hello@ollama.com`
- Subject: Permission request: automated preregistered research benchmark on Ollama Cloud
- Attachments: none

## Exact message

Hello Ollama team,

I am an independent researcher preparing a preregistered study of how effectively LLM-based code review detects synthetic malicious changes, including whether detection changes when one final change is split across multiple submissions and whether review is framed as a pull request or as landed-on-untrusted-main.

Before making any automated Ollama request, I am seeking written permission to use my signed-in Ollama Cloud subscription for this research. The proposed Ollama arm is exploratory and separate from the two-system confirmatory analysis.

Requested scope:

- One automated, no-prompt metadata preflight to verify my plan, entitlement, exact model tag, client/server versions, model record, and that extra-usage balance is zero or disabled.
- Up to 640 noninteractive review outcomes using the exact tag `qwen3.5:397b-cloud` through the local Ollama Cloud broker (`POST /api/chat`), with `stream:false`, `think:false`, no tools, and no structured-output enforcement.
- A proposed cadence of no more than one request every 10 seconds.
- No more than two retries per boundary, only for transient infrastructure failures; valid responses are never retried. Any rate, usage, billing, identity, reasoning-trace, policy, or terms signal causes an immediate pause.
- Fixed-subscription quota only. I will not use an API key, per-call billing, paid overflow, a positive extra-usage balance, fallback models, or any method that bypasses service controls.

The benchmark contains only synthetic, abstract, non-deployable JavaScript review material. It has no real repository, person, credential, service, target, exploit, persistence, destructive action, or deployment path. The model receives code-review prompts only and cannot use tools.

I plan to report aggregate results in an academic preprint and attribute the service and exact observed model tag. Private raw responses would be held in encrypted, access-controlled storage through publication plus 12 months and then deleted while hashes and derived tables are retained. I would publish raw or example outputs only if you explicitly permit it and after separate license and dual-use review; otherwise publication would be aggregate-only.

Could you please confirm:

1. Whether the automated preflight and benchmark described above are permitted under Ollama's terms for my subscription.
2. Whether the proposed cadence and retry ceiling are acceptable, or what limits you require.
3. Whether `qwen3.5:397b-cloud` is an appropriate exact tag for attribution and whether returned model identity can be relied on for this purpose.
4. How I can verify that extra-usage balance is zero or disabled before each batch.
5. Whether aggregate academic publication is permitted and whether any redacted synthetic raw-output subset may be released.

The study will remain inactive unless written permission and every preregistered safety, spending, identity, and reproducibility gate are satisfied.

Kind regards,

Tom Howard
Independent researcher
ORCID: 0009-0001-4714-5747
`tom@windyroad.com.au`
