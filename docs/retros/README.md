# Retro Reports

Per-date context-analysis reports produced by the wr-retrospective deep layer (`/wr-retrospective:analyze-context`). Each report carries an HTML-comment snapshot trailer that the next run of `/wr-retrospective:run-retro` Step 2c reads for delta comparison.

This directory also holds the per-retro ask-hygiene trail files (`<date>-ask-hygiene.md`) written by `/wr-retrospective:run-retro` Step 2d.

**ID namespace warning.** `ADR-NNN` and `P<NNN>` references inside these reports are **upstream `@windyroad` plugin** governance IDs inherited from the skill contracts that generate them, not this repository's `docs/decisions/` or `docs/problems/` IDs. Several numbers collide with different local artefacts. Resolve them against the plugin cache under `~/.claude/plugins/cache/windyroad/`.
