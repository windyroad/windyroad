---
platform: reddit
subreddit: r/ClaudeAI
article: /blog/making-work-in-progress-visible-to-your-ai-agent
title: I built a Claude Code hook that nudges about accumulating WIP
---

When an AI agent is writing code, it has no visibility into accumulating work-in-progress. It works on the current prompt. Meanwhile, uncommitted changes grow, commits pile up without a push, changesets go unwritten, and a release PR sits open for days.

I built a UserPromptSubmit hook that surfaces all of this. Four checks monitor four queues where code accumulates between your editor and production:

1. Uncommitted changes over 200 lines (tracked + untracked)
2. Three or more unpushed commits
3. Pushed commits with no changeset file (so no release PR gets created)
4. A release PR that's been open longer than 24 hours

Checks 1-2 are local (git commands, near-instant, run every prompt). Checks 3-4 hit the GitHub API, so they run once after push.

The key design choice: these are nudges, not gates. The hook emits additionalContext (injected into the AI's context) and a systemMessage (printed in your terminal). No permissionDecision. The AI keeps working but both it and I can see the state of things.

Full write-up with the hook code and how to wire it up: https://windyroad.com.au/blog/making-work-in-progress-visible-to-your-ai-agent

Curious if anyone else is building hooks to keep their AI agent aware of pipeline state.
