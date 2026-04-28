---
'windy-road': patch
---

Scaffold the `wr-blog` skill family that codifies the windyroad blog-creation workflow learned in the "An AI agent deleted production" article session. Source files live at `skills/wr-blog/` in the repo root and are surfaced to Claude Code via a `.claude/skills/wr-blog` symlink so iteration edits do not trigger per-edit `.claude/` permission prompts.

Four skills planned:

- `wr-blog:create-article` (orchestrator, populated via skill-creator).
- `wr-blog:render-diagrams` (sips-based PNG render-and-inspect, populated via skill-creator).
- `wr-blog:review-article` (review-only gate chain, populated via skill-creator).
- `wr-blog:create-social-posts` (per-platform social-post orchestrator, populated this commit).

This commit ships:

- The `create-social-posts` SKILL.md plus its two assets (`social-platform-conventions.md` covering LinkedIn / Twitter / Bluesky / Hacker News / Lobsters / Reddit / dev.to, and `social-critic-rubric.md` for long-form posts).
- The shared `assets/article-critic-rubric.md` (10-check rubric promoted from `/tmp` and reformatted to match `wr-newsletter`'s rubric structure).
- The `assets/genres/root-cause-guide.md` genre asset capturing the door-not-room opener, diagnose-then-prescribe shape, pre-empt-easy-answers section, and McKenzie / Cantrill / Charity-Majors-style wrap-up convention.
- Empty placeholders for the three skill-creator-driven skills.
- `.claude/settings.json` enables `skill-creator@claude-plugins-official` so the skill-creator workflow is available in this project.

The `create-article`, `render-diagrams`, and `review-article` SKILL.md files are populated in a follow-up via the skill-creator's eval-driven workflow (deferred until Claude Code is restarted with the new marketplace registered).
