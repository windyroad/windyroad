---
name: wr-blog:create-social-posts
description: Generate platform-specific social posts for a published windyroad blog article. Covers LinkedIn, Twitter, Bluesky, Hacker News, Lobsters, Reddit, and dev.to. Applies the windyroad voice gate, content-risk gate, SW-critic loop, and cognitive-accessibility gate per platform.
---

# wr-blog:create-social-posts

Generate platform-specific social posts for an article that has already been drafted and committed to `src/articles/<slug>/index.md`. Each post lands in `src/social/<slug>/<platform>.md` and is reviewed by fresh-context subagents before save.

## Inputs

- `article_path`: required. The path to the published article, e.g. `src/articles/an-ai-agent-deleted-production-the-model-wasnt-the-problem/index.md`.
- `cover_image_path`: optional. The cover image to reference from social posts (defaults to `cover.png` in the social folder, or the first SVG render under `public/img/social/` matching the article slug).
- `platforms`: optional. Defaults to all seven (linkedin, twitter, bluesky, hackernews, lobsters, reddit, devto). Can be overridden to skip platforms.

## Outputs

For an article at `src/articles/<slug>/index.md`, this skill writes:

- `src/social/<slug>/linkedin.md`
- `src/social/<slug>/twitter.md`
- `src/social/<slug>/bluesky.md`
- `src/social/<slug>/hackernews.md`
- `src/social/<slug>/lobsters.md`
- `src/social/<slug>/reddit-<subreddit>.md` (one per target subreddit)
- `src/social/<slug>/devto.md`
- `src/social/<slug>/cover.png` (if not already present, copied from the article's primary social SVG render)

## Step sequence

### 0. Load context

Read these files into context before drafting any post:

1. The article itself at `article_path`.
2. `docs/VOICE-AND-TONE.md` (voice rules, banned patterns, per-platform conventions if documented).
3. `src/social/<slug>/` if it already exists, to avoid clobbering work in progress.
4. The folder `src/social/enforcing-voice-and-tone-with-claude-code-hooks/` as a reference set of seven platform posts done correctly.
5. `assets/social-platform-conventions.md` (this skill's reference, see below).
6. `assets/social-critic-rubric.md` (this skill's review rubric).

If the article has not yet been published (i.e. the build does not include it), warn the user and stop. Social posts that link to an unpublished article will 404.

### 1. Confirm canonical URL

The canonical URL is `https://windyroad.com.au/blog/<slug>`. Verify the slug by running:

```bash
node -e "const s = require('slugify'); console.log(s('<title>', { lower: true, strict: true }));"
```

against the article's H1, and confirm it matches the directory name under `src/articles/`. If the slug includes an apostrophe or trailing punctuation, check that `src/lib/markdown.ts` `slugFromTitle()` produced the expected output. Net stale URLs are the most common avoidable error in this skill.

### 2. Cover image

If `src/social/<slug>/cover.png` is missing:

1. Identify the article's primary social diagram. Convention: the first SVG referenced in the article body, or `public/img/social/<slug-prefix>.svg` if a per-article render exists.
2. Render to PNG via `node scripts/render-svg.mjs <input.svg> src/social/<slug>/cover.png`.
3. Read the PNG via the Read tool and confirm visually that text fits, arrows land on targets, and the palette matches existing diagrams. The diagram-inspection-checklist in the sibling `wr-blog:render-diagrams` skill applies.

### 3. Per-platform draft

Draft each platform post using the conventions in `assets/social-platform-conventions.md`. Summary of the conventions (full text in the asset):

- **LinkedIn**: long-form. 3 to 4 paragraphs. Lead with a concrete fact, walk the structural argument, end with a CTA pointing at the article. Image: cover.png. Frontmatter: `platform`, `article`, `image`, `image_alt`. Tone: practitioner sharing.
- **Twitter / X**: terse. One-tweet hook (under 280 chars) plus a reply tweet that is the article URL. Image: cover.png. Frontmatter: `platform`, `article`, `image`, `image_alt`. Tone: punchy.
- **Bluesky**: similar shape to Twitter but slightly looser (300 char limit). One post plus URL on its own line. Frontmatter: `platform`, `article`, `image`, `image_alt`. Tone: practitioner.
- **Hacker News**: link post only. Frontmatter: `platform`, `article`, `url`, `title`, `type: link`. Title is the article title verbatim, with sentence case. No body.
- **Lobsters**: link post with tags. Frontmatter: `platform`, `article`, `url`, `title`, `tags`, `type: link`. Tags are picked from the lobsters tag list (commonly `ai`, `security`, `devops`, `practices`).
- **Reddit**: per-subreddit text post. Frontmatter: `platform: reddit`, `subreddit`, `flair`, `crosspost` (optional), `article`, `title`. Body is 3 to 5 paragraphs ending with a question that invites discussion. Lead with the strongest concrete claim. Title style varies per subreddit (check the subreddit's recent posts for tone).
- **dev.to**: cross-post the full article body. Frontmatter: `platform: devto`, `article`, `canonical_url`, `title`, `tags` (max 4), `cover_image`, `cover_image_alt`, `published: false`. Body is the article verbatim, with `<span data-pull>` blocks expanded into blockquotes (dev.to does not render the data-pull markup).

### 4. Apply voice rules to every post

Before save, every post must pass these mechanical checks:

1. No em-dashes (U+2014). Use commas, periods, colons, semicolons, or parentheses.
2. No avoided words. Run the project's voice-tone check or grep for the banned-pattern list in `docs/VOICE-AND-TONE.md`.
3. No ambiguous link text. Replace any "click here", "read more", "learn more", or bare "(here)" with descriptive anchor text.
4. No visible "(opens in new tab)" text on any anchor. If the platform supports HTML, use sr-only span; otherwise rely on the platform's default.
5. Reading level: opener and closing sentences at Grade 9 to 10. Mechanism sections may be denser.

If any check fails, rewrite that sentence and re-run the check.

### 5. Voice gate (subagent)

For every drafted post, invoke a fresh-context `wr-voice-tone:agent` subagent with the post path. Apply findings. If findings include items the gate considers blocking, the post does not save until those are addressed.

### 6. Content-risk gate (subagent)

For LinkedIn and Reddit (the two long-form posts that name vendors and incidents), invoke a fresh-context `wr-content-risk-scorer:agent` subagent. Twitter, Bluesky, dev.to, Hacker News, and Lobsters reuse the article's already-cleared content-risk verdict because they either link out or duplicate the article body verbatim.

### 7. Per-platform critic (subagent, optional but recommended)

For each long-form post (LinkedIn, Reddit), invoke `wr-sw-critic` against `assets/social-critic-rubric.md`. Up to 2 rounds. Apply findings. dev.to reuses the article's already-cleared SW-critic verdict because the body is the article verbatim. Short-form posts (Twitter, Bluesky, Hacker News, Lobsters) skip the critic loop because the surface area is too small to score meaningfully.

### 8. Cognitive accessibility gate (subagent)

Invoke a fresh-context `cognitive-accessibility` subagent against each post that has its own body text:

- **LinkedIn**: full pass (opener and CTA at Grade 9 to 10, jargon load, plain English).
- **Reddit**: full pass (same checks, plus the closing question).
- **Twitter / Bluesky**: opener-only pass. Confirm the hook reads at Grade 9 to 10. The body is too short for jargon-load scoring.
- **dev.to**: skipped. Reuses the article's already-cleared cog-a11y verdict because the body is the article verbatim.
- **Hacker News / Lobsters**: skipped. Link posts have no body to score.

Apply findings. If a post's opener fails the Grade 9 to 10 check, rewrite and re-run.

### 9. Save

Write each post to `src/social/<slug>/<platform>.md`. Confirm by listing the directory.

### 10. Commit

Create a changeset in `.changeset/` describing the social-post addition. The risk-scorer hooks fire on commit. No bypass. Commit message follows Conventional Commits: `docs(social): add platform posts for <article-slug>`.

### 11. Push (optional)

If the user asks for preview, push via `npm run push:watch`. Do not run bare `git push`.

## Subagent contracts

Each subagent invocation follows the Generator-Reviewer pattern in `PRINCIPLES.md`: the orchestrator never inline-authors a PASS block. Findings are the subagent's output verbatim. Apply findings, then re-invoke if a second pass is warranted.

## Files this skill writes

- `src/social/<slug>/<platform>.md` (one per platform).
- `src/social/<slug>/cover.png` (if missing).
- `.changeset/<random-name>.md` (a docs changeset).

## Files this skill never writes

- `src/articles/<slug>/index.md` (use `wr-blog:review-article` for revisions to the article body).
- `public/img/social/*.svg` (use `wr-blog:render-diagrams` for diagram changes).
- `docs/VOICE-AND-TONE.md` (use `wr-voice-tone:update-guide`).

## Failure modes and recovery

- **Slug mismatch**: caught at step 1. Stop, ask the user, do not silently produce posts that link to a 404.
- **Cover image overflow**: caught at step 2. Re-run `wr-blog:render-diagrams` with the offending SVG and iterate.
- **Voice gate failure**: caught at step 5. Rewrite the offending sentence, re-run the gate.
- **Hook block on em-dash**: pre-commit hook may still fire if a stray em-dash slipped through. Search the file for U+2014 and replace.

## Reference: social platform conventions

Detail in `assets/social-platform-conventions.md`. That asset is loaded on every invocation.

## Reference: social critic rubric

Detail in `assets/social-critic-rubric.md`. That asset is loaded for long-form posts at step 7.
