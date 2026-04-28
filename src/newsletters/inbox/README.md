# Inbox

Tom's manual drop folder for LinkedIn posts and other noteworthy signal that the automated feeds won't pick up.

Per ADR 013 (`docs/decisions/013-no-automated-linkedin-scraping.proposed.md`), we do not scrape LinkedIn. The account-ban risk outweighs the signal value. This folder is how high-quality LinkedIn content enters the newsletter pipeline.

## How to use

During your normal LinkedIn browsing, if you see a post worth including in the week's brief:

1. Create a new file here named `YYYY-MM-DD-<slug>.md` (e.g. `2026-04-17-altman-on-safety.md`).
2. One link plus a one-sentence note per file:

   ```markdown
   https://www.linkedin.com/feed/update/urn:li:activity:...

   Why it matters: one sentence on why this is worth a line in the brief.
   ```

3. The `/wr-newsletter:generate` skill reads every file in this folder when it runs and includes them as candidates alongside the RSS and news-page sources.

## Expectations

- Zero drops in a week is fine. The automated feeds will still produce a brief.
- Anything you drop counts as "I think this is worth including." Drops skip the first filter and go directly into the three-lens scoring step.
- Delete or move files here only after the week's brief has been published.
