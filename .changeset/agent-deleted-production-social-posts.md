---
'windy-road': patch
---

Add seven platform-specific social posts for "An AI agent deleted production. The model wasn't the problem." in `src/social/an-ai-agent-deleted-production-the-model-wasnt-the-problem/`: LinkedIn (long-form), Twitter (hook plus URL reply), Bluesky (single post), Hacker News (link), Lobsters (link with `ai`, `security`, `devops` tags), Reddit (r/ClaudeAI Coding flair, crossposted to r/ChatGPTCoding, r/devops, r/cursor), and dev.to (full body cross-post with `published: false`). Each long-form post passed the voice gate, content-risk gate, SW-critic loop, and cognitive-accessibility gate.

Also adds the four diagram PNG renders (`sign-vs-control.png`, `risk-gate-flow.png`, `risk-score-anatomy.png`, `layered-defence.png`) that the dev.to cover image and the social cover.png reference, generated via `scripts/render-svg.mjs` from the SVG sources already shipped with the article.
