# Social platform conventions

Per-platform shape, frontmatter, length, tone, and image rules for windyroad social posts. Loaded by `wr-blog:create-social-posts` at step 0.

## LinkedIn

**Shape**: long-form, 3 to 4 paragraphs, 700 to 1200 characters of body. Lead with a concrete fact or named incident. Walk the structural argument in paragraph 2. Land the principle in paragraph 3. End with a CTA pointing at the article URL.

**Frontmatter**:

```yaml
---
platform: linkedin
article: /blog/<slug>
image: cover.png
image_alt: <descriptive alt text, see alt-text rules below>
---
```

**Tone**: practitioner sharing. First-person plural ("we") consistent with the article. No hashtags. No emoji.

**CTA**: a single line linking to the canonical URL on its own paragraph at the end.

**Length sanity check**: under 1300 characters. LinkedIn truncates at around 200 visible characters before the "see more" link, so the first paragraph must hook on its own.

## Twitter / X

**Shape**: one-tweet hook, then a reply tweet that is the article URL on its own line, prefixed with `Reply:`.

**Frontmatter**:

```yaml
---
platform: twitter
article: /blog/<slug>
image: cover.png
image_alt: <descriptive alt text>
---
```

**Length**: hook is at most 280 characters. Tight, punchy, structural. Skip preambles.

**Image**: cover.png attached to the hook.

## Bluesky

**Shape**: one post, 300 character limit, then the article URL on its own line.

**Frontmatter**:

```yaml
---
platform: bluesky
article: /blog/<slug>
image: cover.png
image_alt: <descriptive alt text>
---
```

**Tone**: practitioner. Slightly looser than Twitter; one extra sentence is fine within the 300 limit.

## Hacker News

**Shape**: link post. No body.

**Frontmatter**:

```yaml
---
platform: hackernews
article: /blog/<slug>
url: https://windyroad.com.au/blog/<slug>
title: "<article title>"
type: link
---
```

**Title**: the article title verbatim, sentence case, no editorialising. Hacker News removes "show off" titles.

**Image**: none. HN does not render social images.

## Lobsters

**Shape**: link post with tags.

**Frontmatter**:

```yaml
---
platform: lobsters
article: /blog/<slug>
url: https://windyroad.com.au/blog/<slug>
title: <article title or a short reframing>
tags: [ai, security, devops]
type: link
---
```

**Tags**: pick from the [lobsters tag list](https://lobste.rs/tags). Common windyroad fits: `ai`, `security`, `devops`, `practices`, `programming`. Maximum 3 tags.

**Title**: may be reframed slightly to fit lobsters tone (technical, structural, no clickbait).

## Reddit

**Shape**: per-subreddit text post. Each subreddit is one file. Crosspost-list goes in the frontmatter; do not duplicate the body.

**Frontmatter**:

```yaml
---
platform: reddit
subreddit: r/<subreddit>
flair: <flair name if the subreddit requires one>
crosspost:
  - subreddit: r/<other>
  - subreddit: r/<another>
article: /blog/<slug>
title: <subreddit-appropriate title>
---
```

**Body**: 3 to 5 paragraphs. Concrete opener, structural argument, link to the article, end with a question that invites discussion. The question is not optional; reddit ranks engagement and a question opens the thread.

**Title**: subreddit-specific. r/ClaudeAI, r/ChatGPTCoding, r/cursor lean toward "Why does X happen and what fixes it" framings. r/devops leans toward "We saw X. The fix is structural." Read the subreddit's recent posts before titling.

**Subreddits to consider for AI / dev articles**: r/ClaudeAI (Coding flair), r/ChatGPTCoding, r/devops, r/cursor, r/programming (very strict, mods often remove blog links), r/sre, r/ExperiencedDevs.

## dev.to

**Shape**: cross-post of the full article body.

**Frontmatter**:

```yaml
---
platform: devto
article: /blog/<slug>
canonical_url: https://windyroad.com.au/blog/<slug>
title: "<article title>"
tags: [claudecode, ai, devops, security]
cover_image: https://windyroad.com.au/img/social/<diagram>.png
cover_image_alt: <descriptive alt text>
published: false
---
```

**Tags**: maximum 4. Pick from dev.to's existing tag set.

**`published: false`**: always start unpublished. The user toggles to true after preview.

**Body adaptations**: `<span data-pull>...` markup does not render on dev.to. Convert pull quotes to standard blockquotes (`> `). Keep code blocks as-is. Keep image references as absolute URLs to `https://windyroad.com.au/img/...`.

## Image alt-text rules

Alt text on the cover image is the same on every platform. It must:

1. Describe the visual content, not the image's purpose.
2. Avoid "image of" or "diagram showing" preambles.
3. Read as a coherent sentence or two.
4. Be specific about the structural elements (left column, three boxes, badge colour, etc.) so a screen-reader user can reconstruct the visual argument.

Example (from the production-deletion article): "Two-column comparison. Left column titled Sign with three boxes labelled Agent has production credentials, A single API call destroys production, and System prompt says don't, ending in a red badge labelled production deleted. Right column titled Control with three boxes labelled Production credentials in CI/CD secrets only, Production changes flow through the pipeline, and Pipeline gate scores commit push and release, ending in a green badge labelled denied at the boundary."

## Voice rules that apply to every platform

These are enforced by the voice gate, but the orchestrator should self-check before invoking the gate:

1. No em-dashes (U+2014). Project pre-commit hook will block on commit if any slip through.
2. No avoided words from `docs/VOICE-AND-TONE.md`.
3. No ambiguous link text ("click here", "read more", "learn more", bare "here").
4. No visible "(opens in new tab)" text.
5. Voice is "we" (team), not "I" (per ADR 010).
6. Opener and CTA at Grade 9 to 10 reading level.

## Cross-post discipline

If a post is reused across multiple subreddits, the body is identical and the frontmatter `crosspost` list names every additional subreddit. Per-subreddit titles vary; the body does not.
