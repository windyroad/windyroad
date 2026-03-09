---
platform: reddit
subreddit: r/ClaudeAI
flair: Coding
crosspost:
  - subreddit: r/ChatGPTCoding
  - subreddit: r/devops
article: /blog/enforcing-voice-and-tone-with-claude-code-hooks
title: I built four Claude Code hooks that enforce voice and tone on AI-written copy
---

When an AI agent writes copy, it drifts. Not dramatically, but steadily: a hedging phrase here, a "We're passionate about" there. Over time, the site sounds like it was written by committee.

I built a system that uses four Claude Code hooks to enforce voice consistency:

1. A UserPromptSubmit hook detects VOICE-AND-TONE.md and injects an instruction to delegate to a reviewer agent before editing any copy file
2. A PreToolUse hook blocks Edit/Write calls to copy-bearing files (.tsx, .md) unless a session marker exists
3. A PostToolUse hook creates the session marker after the reviewer completes
4. A Stop hook removes the marker after each response, so the next turn starts locked and requires a fresh review

The reviewer is a Claude Code agent with read-only tools (Read, Glob, Grep). It reads the voice guide, reads the proposed copy, and reports violations with the offending text, the rule it breaks, and a suggested fix. It cannot edit files.

The key design choice: this is a gate, not a nudge. A missed voice review means off-brand copy ships to production. The cost of one agent call before editing is lower than the cost of finding and fixing drift after the fact.

Full write-up with the hook code, agent definition, and a starter template for your own voice guide: https://windyroad.com.au/blog/enforcing-voice-and-tone-with-claude-code-hooks

Has anyone else built hooks to enforce non-functional constraints like voice, accessibility, or coding standards?
