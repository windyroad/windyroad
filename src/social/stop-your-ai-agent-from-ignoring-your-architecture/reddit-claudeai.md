---
platform: reddit
subreddit: r/ClaudeAI
flair: Coding
crosspost:
  - subreddit: r/ChatGPTCoding
  - subreddit: r/devops
article: /blog/stop-your-ai-agent-from-ignoring-your-architecture
title: I built five Claude Code hooks that block edits until an architect agent reviews them
---

AI agents make architectural decisions constantly. Add a dependency, change a build script, restructure a config. Each choice is reasonable on its own, but none get documented. Six months later nobody knows why rehype-highlight was chosen over Shiki.

I built a hook-based gate that forces an architecture review before any edit proceeds:

1. A UserPromptSubmit hook injects an instruction telling the AI to delegate to an architect agent before editing
2. A PreToolUse hook blocks Edit/Write/ExitPlanMode unless a session marker exists with valid TTL and no decision drift
3. The architect agent reviews the change against Architecture Decision Records in docs/decisions/ and writes a verdict file (PASS or FAIL)
4. A PostToolUse hook reads the verdict and only creates the marker on PASS
5. A Stop hook removes the marker after each turn so the next prompt starts locked

The key design choices:

- Fail-closed: if jq parsing fails, the edit is blocked (not silently allowed)
- Verdict gating: if the architect finds issues, the gate stays locked. The AI must fix the issues or stop. In an earlier version without this, the AI would acknowledge the issues and proceed anyway
- Drift detection: if any decision file changes after the review, the marker is invalidated and a re-review is required
- Sliding TTL: the 10-minute marker refreshes on each edit, so long sessions aren't interrupted

A real example of verdict gating catching a problem: the AI was removing an unused API. The architect flagged that a smoke test depended on it. Without verdict gating, the AI left both untouched and moved on. With verdict gating, it had to fix the smoke test or stop.

Full write-up with diagrams, code, and a bootstrap workflow for documenting existing decisions: https://windyroad.com.au/blog/stop-your-ai-agent-from-ignoring-your-architecture

Anyone else using hooks to enforce architectural constraints on AI agents?
