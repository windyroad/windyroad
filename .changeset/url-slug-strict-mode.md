---
'windy-road': patch
---

Blog post slug generator now uses `slugify({ strict: true })` so titles with apostrophes or periods produce URL-safe slugs without normalisation tricks. Two affected URLs: `your-ai-agent-doesn't-know-when-to-stop-committing` becomes `your-ai-agent-doesnt-know-when-to-stop-committing` (a 301 redirect in `netlify.toml` keeps the apostrophe form resolving for external links already in the wild); `an-ai-agent-deleted-production.-the-model-wasn't-the-problem.` becomes `an-ai-agent-deleted-production-the-model-wasnt-the-problem` (only existed on the release-pr-32 preview, no redirect needed). Slug logic extracted to a `slugFromTitle()` helper with a vitest spec covering apostrophes, periods, and trailing punctuation.
