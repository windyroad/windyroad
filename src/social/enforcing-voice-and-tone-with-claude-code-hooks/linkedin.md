---
platform: linkedin
article: /blog/enforcing-voice-and-tone-with-claude-code-hooks
image: cover.png
image_alt: Flow diagram showing the three-hook gate pattern: a UserPromptSubmit hook detects VOICE-AND-TONE.md and injects context, a PreToolUse hook checks for a session marker and blocks edits to copy files if the marker is missing, and a PostToolUse hook creates the session marker after voice-and-tone-lead completes.
---

An AI agent writes fluent prose. It also writes whatever you ask for. Tell it to add a hero section and it will produce "We're passionate about leveraging cutting-edge solutions." Neither sounds like you.

A voice guide in a markdown file is documentation. The AI reads it if you tell it to, ignores it if you don't, and drifts from it when generating long passages. A guide only describes the rules. Nothing enforces them.

This system uses three Claude Code hooks to enforce voice consistency. One injects the instruction on every prompt. One blocks edits to copy files until a reviewer agent has checked the proposed changes. One unlocks the block after the review completes.

The reviewer is read-only. It reads the guide, reads the proposed copy, and reports violations with specific fixes. The AI incorporates the fixes before writing. The review happens before the edit, not after.

Full write-up with the hook code and agent definition: https://windyroad.com.au/blog/enforcing-voice-and-tone-with-claude-code-hooks
