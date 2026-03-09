An AI agent has no visibility into accumulating work-in-progress. It works on the current prompt. Meanwhile, uncommitted changes grow, commits pile up without a push, and a release PR sits open for days.

I built a Claude Code hook that surfaces all of this. Four checks monitor four queues where code accumulates on its way to production:

1. Uncommitted changes over 200 lines
2. Three or more unpushed commits
3. Pushed commits with no changeset (no release preview)
4. A release PR open longer than 24 hours

Local checks run every prompt. Remote checks run on push. No blocking. The AI keeps working but both it and I can see the state of things.

The key design choice: these are nudges, not gates. WIP accumulation is state you want to be aware of, not an action you want to block.

Full write-up with the hook code and how to adapt it for your own project: https://windyroad.com.au/blog/making-work-in-progress-visible-to-your-ai-agent
