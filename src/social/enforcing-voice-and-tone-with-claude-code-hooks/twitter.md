---
platform: twitter
article: /blog/enforcing-voice-and-tone-with-claude-code-hooks
image: cover.png
image_alt: Flow diagram showing the four-hook gate pattern: a UserPromptSubmit hook detects VOICE-AND-TONE.md and injects context, a PreToolUse hook blocks edits without a session marker, a PostToolUse hook creates the marker after review, and a Stop hook removes it so the next turn starts locked.
---

A voice guide is documentation. Nothing enforces it. This system uses four Claude Code hooks to block edits until a reviewer agent checks the copy. The gate resets each turn.

Reply:
https://windyroad.com.au/blog/enforcing-voice-and-tone-with-claude-code-hooks
