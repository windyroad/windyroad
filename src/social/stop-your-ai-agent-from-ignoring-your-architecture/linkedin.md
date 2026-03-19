---
platform: linkedin
article: /blog/stop-your-ai-agent-from-ignoring-your-architecture
image: cover.png
image_alt: Process flow diagram showing how the architect gate works: prompt starts the turn, AI attempts an edit, a gate check validates the marker, and if no marker exists the edit is denied until an architect agent reviews and passes.
---

An AI agent makes architectural decisions constantly. Add a dependency, change a build script, restructure a config file. Each choice is reasonable in isolation. None of them get written down. Six months later, someone asks why the project uses rehype-highlight instead of Shiki. The answer is in a conversation that no longer exists.

I built a hook-based gate that blocks the AI from editing any project file until an architect agent reviews the change against existing Architecture Decision Records. The gate is fail-closed: if parsing fails, the edit is blocked. If the architect finds issues, the gate stays locked until they're resolved.

The system uses five Claude Code hooks: detection (injects the instruction), gate (blocks edits without a valid marker), unlock (creates the marker on PASS), reset (removes the marker after each turn), and a plan gate (blocks ExitPlanMode without review). The marker has a TTL, a sliding window, and drift detection that invalidates it if any decision file changes.

The architect checks compliance, confirmation criteria, new decision detection, decision quality, and staleness. If it reports ISSUES FOUND, the AI has two options: fix the issues or stop. No middle ground.

Full write-up with hook code, diagrams, and adoption guidance: https://windyroad.com.au/blog/stop-your-ai-agent-from-ignoring-your-architecture
